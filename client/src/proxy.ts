import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

const VERIFY_ENDPOINT = "/api/general/verify/login";
const BACKEND_URL = process.env.BACKEND_URL;

const LAST_VERIFY_COOKIE = "scm_last_verify"; // stores timestamp
const VERIFY_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(TOKEN_COOKIE)?.value;
  const lastVerify = req.cookies.get(LAST_VERIFY_COOKIE)?.value;

  const now = Date.now();

  const isAuthPage = pathname.startsWith("/auth/login");

  // ---- CASE 1: No token ----
  if (!token) {
    if (isAuthPage) {
      return NextResponse.next();
    }
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // ---- CASE 2: Token exists ----
  let shouldVerify = true;

  if (lastVerify) {
    const lastTime = parseInt(lastVerify, 10);
    if (!isNaN(lastTime) && now - lastTime < VERIFY_INTERVAL) {
      shouldVerify = false;
    }
  }

  let isValid = true;

  if (shouldVerify) {
    try {
      const res = await fetch(`${BACKEND_URL}${VERIFY_ENDPOINT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      isValid = data?.verified === true;
    } catch (err) {
      isValid = false;
    }
  }

  // ---- CASE 3: Invalid token ----
  if (!isValid) {
    const response = NextResponse.redirect(new URL("/auth/login", req.url));
    response.cookies.delete(TOKEN_COOKIE);
    response.cookies.delete(LAST_VERIFY_COOKIE);
    return response;
  }

  // ---- CASE 4: Valid token ----
  const response = NextResponse.next();

  // update last verify timestamp only when API was called
  if (shouldVerify) {
    response.cookies.set(LAST_VERIFY_COOKIE, now.toString(), {
      httpOnly: true,
      path: "/",
    });
  }

  // ---- CASE 5: User on /auth/login but already logged in ----
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}
export const config = {
  matcher: [
    /*
      Apply middleware to all routes except:
      - API routes
      - static files
    */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
