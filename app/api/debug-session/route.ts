import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { sessionClaims, userId } = await auth();

  return NextResponse.json({
    userId,
    sessionClaims,
    public_metadata: sessionClaims?.public_metadata,
    metadata: sessionClaims?.metadata,
    // Show all keys in sessionClaims
    sessionClaimsKeys: sessionClaims ? Object.keys(sessionClaims) : [],
  });
}
