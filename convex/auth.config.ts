export default {
  providers: [
    {
      // Replace with your Clerk JWT Issuer Domain from your "convex" JWT template
      // Configure CLERK_JWT_ISSUER_DOMAIN on the Convex Dashboard
      // In development: https://verb-noun-00.clerk.accounts.dev
      // In production: https://clerk.<your-domain>.com
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
