import { spawn } from "node:child_process";

const port = process.env.SENTRY_VERIFY_PORT ?? "4327";
const origin = `http://localhost:${port}`;
const readyPattern = /Ready in|started server/i;

const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    "localhost",
    "--port",
    port,
  ],
  {
    cwd: process.cwd(),
    env: {
      ...process.env,
      ENABLE_SENTRY_TEST_PAGE: "true",
      SENTRY_VERIFY_MODE: "true",
    },
    stdio: ["ignore", "pipe", "pipe"],
  },
);

let output = "";

function collect(chunk) {
  const text = chunk.toString();
  output += text;
  process.stdout.write(text);
}

server.stdout.on("data", collect);
server.stderr.on("data", collect);

async function waitForServer() {
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    if (readyPattern.test(output)) {
      return;
    }

    if (server.exitCode !== null) {
      throw new Error(`Next.js exited with code ${server.exitCode}.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Timed out waiting for the Next.js production server.");
}

async function waitForDelivery(eventId) {
  const prefix = "SENTRY_VERIFICATION_DELIVERY ";
  const deadline = Date.now() + 20_000;

  while (Date.now() < deadline) {
    const delivery = output
      .split("\n")
      .filter((line) => line.startsWith(prefix))
      .map((line) => JSON.parse(line.slice(prefix.length)))
      .find((entry) => entry.eventId === eventId);

    if (delivery) {
      return delivery;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Sentry did not confirm delivery for event ${eventId}.`);
}

try {
  await waitForServer();

  const response = await fetch(`${origin}/api/sentry-example`, {
    method: "POST",
  });
  const result = await response.json();

  if (response.status !== 500 || result.queued !== true || !result.eventId) {
    throw new Error(
      `Sentry verification failed: ${JSON.stringify({
        status: response.status,
        result,
      })}`,
    );
  }

  const delivery = await waitForDelivery(result.eventId);

  if (
    typeof delivery.statusCode !== "number" ||
    delivery.statusCode < 200 ||
    delivery.statusCode >= 300
  ) {
    throw new Error(
      `Sentry rejected event ${result.eventId} with status ${delivery.statusCode}.`,
    );
  }

  console.log(
    JSON.stringify(
      {
        eventId: result.eventId,
        message: result.message,
        sentryAccepted: true,
        sentryStatusCode: delivery.statusCode,
      },
      null,
      2,
    ),
  );
} finally {
  server.kill("SIGTERM");
}
