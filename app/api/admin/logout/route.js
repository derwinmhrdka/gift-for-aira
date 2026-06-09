import { ADMIN_COOKIE_NAME } from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, active: false });
  response.cookies.set(ADMIN_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
