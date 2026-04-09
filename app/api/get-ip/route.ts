import { NextRequest, NextResponse } from "next/server";

const IP_HEADER_NAMES = [
  "x-forwarded-for",
  "x-real-ip",
  "cf-connecting-ip",
  "fly-client-ip",
  "x-vercel-forwarded-for",
];

function getFirstForwardedIp(value: string | null) {
  return value
    ?.split(",")
    .map((part) => part.trim())
    .find(Boolean);
}

export function GET(request: NextRequest) {
  const ip = IP_HEADER_NAMES.map((headerName) =>
    getFirstForwardedIp(request.headers.get(headerName)),
  ).find((value): value is string => Boolean(value));

  return NextResponse.json(
    { ip: ip ?? null },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
