import * as Sentry from "@sentry/nextjs";
import { NextResponse } from "next/server";

export async function POST() {
  if (process.env.ENABLE_SENTRY_TEST_PAGE !== "true") {
    return new NextResponse(null, { status: 404 });
  }

  const error = new Error(
    `Sentry verification error from the portfolio server route ${new Date().toISOString()}`,
  );
  const eventId = Sentry.captureException(error);

  return NextResponse.json(
    {
      eventId,
      message: error.message,
      queued: true,
    },
    { status: 500 },
  );
}
