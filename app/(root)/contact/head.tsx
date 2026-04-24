function getConvexOrigin() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return null;
  }

  try {
    return new URL(convexUrl).origin;
  } catch {
    return null;
  }
}

export default function Head() {
  const convexOrigin = getConvexOrigin();
  if (!convexOrigin) {
    return null;
  }

  const convexHostname = new URL(convexOrigin).hostname;

  return (
    <>
      <link rel="preconnect" href={convexOrigin} crossOrigin="" />
      <link rel="dns-prefetch" href={`//${convexHostname}`} />
    </>
  );
}
