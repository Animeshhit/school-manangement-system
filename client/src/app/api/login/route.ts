import { NextRequest, NextResponse } from "next/server";
import { generateRespose } from "@/lib/utils";
import { TOKEN_COOKIE } from "@/lib/constants";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const params = req.nextUrl.searchParams;
    const role = params.get("role");

    if (!role || role.length === 0) {
      return NextResponse.json(
        generateRespose(false, "Role is required", null),
        { status: 400 },
      );
    }

    let adminLoginUrl = `${BACKEND_URL}/api/admin/login`;
    let superAdminLoginUrl = `${BACKEND_URL}/api/superadmin/login`;
    let teacherLoginUrl = `${BACKEND_URL}/api/teacher/login`;

    let url =
      role === "admin"
        ? adminLoginUrl
        : role === "superadmin"
          ? superAdminLoginUrl
          : role === "teacher"
            ? teacherLoginUrl
            : null;

    if (!url) {
      return NextResponse.json(generateRespose(false, "Invalid role", null), {
        status: 400,
      });
    }

    const body = await req.json();

    const { email, password } = body;

    if (!email || email.length === 0 || !password || password.length === 0) {
      return NextResponse.json(
        generateRespose(false, "Email and password are required", null),
        { status: 400 },
      );
    }

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: email,
        password: password,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        generateRespose(false, errorData.message, null),
        { status: res.status },
      );
    }

    const data = await res.json();


    if (!data?.token) {
      return NextResponse.json(
        generateRespose(false, "Invalid credentials", null),
        { status: 401 },
      );
    }

    const response = NextResponse.json(generateRespose(true, null, data), {
      status: res.status,
    });

    response.cookies.set(TOKEN_COOKIE, data.token, {
      httpOnly: true, // 🔐 server-only access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      generateRespose(false, "Something went wrong", null),
      { status: 500 },
    );
  }
}
