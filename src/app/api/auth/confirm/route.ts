import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") ?? "/";

  // For Firebase, email verification is handled automatically
  // Just redirect to the next page
  return redirect(next);
};
