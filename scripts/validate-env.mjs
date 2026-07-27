import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const issues = [];

function read(name) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function requireValue(name) {
  const value = read(name);
  if (!value) {
    issues.push(`${name} is required`);
  }
  return value;
}

function validateUrl(name, protocols = ["https:"]) {
  const value = read(name);
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (!protocols.includes(url.protocol)) {
      issues.push(`${name} must use ${protocols.join(" or ")}`);
    }
    return url;
  } catch {
    issues.push(`${name} must be a valid URL`);
    return undefined;
  }
}

const convexUrl = requireValue("NEXT_PUBLIC_CONVEX_URL");
if (convexUrl) {
  const parsedConvexUrl = validateUrl("NEXT_PUBLIC_CONVEX_URL");
  if (parsedConvexUrl && !parsedConvexUrl.hostname.endsWith(".convex.cloud")) {
    issues.push("NEXT_PUBLIC_CONVEX_URL must point to a .convex.cloud host");
  }
}

validateUrl("NEXT_PUBLIC_CONVEX_SITE_URL");
validateUrl("NEXT_PUBLIC_SENTRY_DSN");
validateUrl("SENTRY_DSN");

const postHogHost = read("NEXT_PUBLIC_POSTHOG_HOST");
if (postHogHost && !postHogHost.startsWith("/")) {
  validateUrl("NEXT_PUBLIC_POSTHOG_HOST", ["https:"]);
}

const revalidateSecret = read("REVALIDATE_SECRET");
if (
  (process.env.VERCEL_ENV === "production" ||
    process.env.VALIDATE_PRODUCTION_ENV === "true") &&
  (!revalidateSecret || revalidateSecret.length < 32)
) {
  issues.push(
    "REVALIDATE_SECRET must contain at least 32 characters in production",
  );
}

const sentryBuildVariables = [
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
];
const configuredSentryBuildVariables = sentryBuildVariables.filter(read);
if (
  configuredSentryBuildVariables.length > 0 &&
  configuredSentryBuildVariables.length !== sentryBuildVariables.length
) {
  issues.push(
    "SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT must be configured together",
  );
}

if (issues.length > 0) {
  console.error("Environment validation failed:");
  for (const issue of issues) {
    console.error(`- ${issue}`);
  }
  process.exit(1);
}

console.log("Environment validation passed.");
