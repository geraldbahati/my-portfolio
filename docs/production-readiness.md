# Production Readiness

## Release gates

A change is ready for production only when:

1. CI passes TypeScript, ESLint, Vitest, React Doctor, the production build,
   and desktop/mobile browser smoke tests.
2. The preview deployment passes Lighthouse budgets:
   - Performance: 90 or higher
   - Accessibility, best practices, and SEO: 95 or higher
   - LCP: 2.5 seconds or less
   - CLS: 0.1 or less
   - TBT: 300 milliseconds or less
3. The contact form succeeds with a real delivery to `RECIPIENT_EMAIL`.
4. Project pages, social images, sitemap, consent controls, and media playback
   have been smoke-tested on the preview.
5. The production environment variables below have been reviewed.

## Environment ownership

### Vercel

- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `REVALIDATE_SECRET`

Use different Sentry environments for preview and production. `SENTRY_AUTH_TOKEN`
is build-only and must never use a `NEXT_PUBLIC_` prefix.

### Convex

- `CLERK_JWT_ISSUER_DOMAIN`
- `ENABLE_ADMIN` (`false` in production)
- `SENDER_EMAIL`
- `RECIPIENT_EMAIL`
- `SITE_REVALIDATE_URL`
- `REVALIDATE_SECRET` (must match Vercel)
- `POSTHOG_PROJECT_KEY`
- `POSTHOG_HOST`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

## Sentry configuration

Sentry is configured for its recommended Next.js baseline:

- Errors and tracing run in browser, Node.js, and Edge runtimes.
- Tracing samples 100% in development and 10% in production.
- Browser events use the same-origin `/monitoring` tunnel.
- Session Replay and user feedback integrations are absent.
- Default PII collection is disabled.
- Query parameters commonly used for secrets are removed.
- Client source maps upload only when all Sentry build credentials exist, and
  are deleted from the deployment after upload.
- Production builds use webpack because the current Next.js Turbopack build
  deadlocks in this project. This affects build tooling only, not runtime
  performance.

Create alerts for:

- A new production issue
- More than five occurrences of one issue in ten minutes
- A contact or revalidation route error

### Verification

For a local production-build check, run `npm run build` followed by
`npm run verify:sentry`. The verifier fails unless Sentry accepts the generated
event with a successful transport response.

For a browser check on a preview deployment:

1. Set `ENABLE_SENTRY_TEST_PAGE=true`.
2. Visit `/sentry-example-page`.
3. Select **Trigger test error** and confirm both test issues appear in
   `artlife-5r/portfolio`.
4. Set `ENABLE_SENTRY_TEST_PAGE=false` and redeploy. The route returns 404 when
   disabled and is always marked `noindex`.

## Deployment and rollback

1. Deploy the branch to a Vercel preview.
2. Complete the release gates above.
3. Merge the reviewed commit to `main`.
4. Confirm the production deployment and Sentry release are healthy.
5. If an incident occurs, promote the previous healthy Vercel deployment.
6. If Convex schema or data changed, restore from the latest Convex backup or
   apply a forward repair. Never roll application code back across an
   incompatible schema without a data plan.

## Operational checks

- Enable Convex backups and periodically test a restore.
- Rotate Clerk, Cloudflare, Resend, Sentry, PostHog, and revalidation secrets.
- Review Sentry issues and failed contact submissions weekly.
- Review Vercel Web Vitals after each production release.
- Keep the browser compatibility database and dependencies current through
  Dependabot pull requests.
