import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  // For Firebase, OAuth callbacks are handled client-side
  // Just redirect back to the app
  return NextResponse.redirect(`${origin}${next}`);
};
