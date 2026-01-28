import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PATHS = "/dashboard,/profile,/settings".split(",");

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;

  // Get the Firebase auth token from cookies
  const authToken = request.cookies.get('firebase-auth-token')?.value;

  // For server-side Firebase auth verification, we'll check if the token exists
  // In a production app, you'd verify the JWT token here
  const isAuthenticated = !!authToken;

  // if user is not logged in and the current pathname is protected, redirect to login page
  if (!isAuthenticated && PROTECTED_PATHS.some((url) => pathname.startsWith(url))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // if user is logged in and the current pathname is auth, redirect to home page
  if (isAuthenticated && pathname === "/auth") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}
