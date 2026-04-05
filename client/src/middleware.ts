import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/constants";

const VERIFY_ENDPOINT = "/api/general/verify/login";
const BACKEND_URL = process.env.BACKEND_URL;

const LAST_VERIFY_COOKIE = "scm_last_verify";
const VERIFY_INTERVAL = 5 * 60 * 1000; // 5 minutes

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const rawToken = req.cookies.get(TOKEN_COOKIE)?.value;
  const token = rawToken && rawToken.trim() !== "" ? rawToken : null;

  const lastVerify = req.cookies.get(LAST_VERIFY_COOKIE)?.value;
  const now = Date.now();

  const isAuthPage = pathname.startsWith("/auth/login");

  // DEBUG (remove later)
  console.log("MIDDLEWARE:", pathname, "TOKEN:", token);

  // ---- CASE 1: No token (STRICT) ----
  if (!token) {
    const res = isAuthPage
      ? NextResponse.next()
      : NextResponse.redirect(new URL("/auth/login", req.url));

    // cleanup garbage cookies
    res.cookies.delete(TOKEN_COOKIE);
    res.cookies.delete(LAST_VERIFY_COOKIE);

    return res;
  }

  // ---- CASE 2: Decide verification ----
  let shouldVerify = true;

  if (lastVerify) {
    const lastTime = Number(lastVerify);
    if (!isNaN(lastTime) && now - lastTime < VERIFY_INTERVAL) {
      shouldVerify = false;
    }
  }

  // ---- CASE 3: Validate token (STRICT DEFAULT FALSE) ----
  let isValid = false;

  if (shouldVerify) {
    try {
      if (!BACKEND_URL) throw new Error("BACKEND_URL missing");

      const res = await fetch(`${BACKEND_URL}${VERIFY_ENDPOINT}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Verification failed");

      const data = await res.json();
      isValid = data?.verified === true;
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      isValid = false;
    }
  } else {
    // trust recent verification only if token exists
    isValid = true;
  }

  // ---- CASE 4: Invalid token ----
  if (!isValid) {
    const res = NextResponse.redirect(new URL("/auth/login", req.url));

    res.cookies.delete(TOKEN_COOKIE);
    res.cookies.delete(LAST_VERIFY_COOKIE);

    return res;
  }

  // ---- CASE 5: Valid token ----
  const response = NextResponse.next();

  if (shouldVerify) {
    response.cookies.set(LAST_VERIFY_COOKIE, now.toString(), {
      httpOnly: true,
      path: "/",
    });
  }

  // ---- CASE 6: Prevent logged-in user from login page ----
  if (isAuthPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};