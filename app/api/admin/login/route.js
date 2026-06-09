import {
  ADMIN_COOKIE_NAME,
  createAdminCookieValue,
  getAdminCookieOptions,
  isAdminKeyConfigured,
  verifyAdminKey,
} from "@/lib/adminAuth";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (!isAdminKeyConfigured()) {
    return NextResponse.json(
      { error: "Admin access belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const key = typeof body.key === "string" ? body.key : "";
  if (!verifyAdminKey(key)) {
    return NextResponse.json({ error: "Kode admin tidak valid." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, active: true });
  response.cookies.set(
    ADMIN_COOKIE_NAME,
    createAdminCookieValue(),
    getAdminCookieOptions(),
  );
  return response;
}
