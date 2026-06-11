import { addReaction, getReactionsSince } from "@/lib/reactions";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const sinceParam = request.nextUrl.searchParams.get("since");
  const sinceMs = sinceParam ? Number(sinceParam) : 0;

  try {
    const data = await getReactionsSince(
      Number.isFinite(sinceMs) && sinceMs > 0 ? sinceMs : 0,
    );
    return NextResponse.json(data);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal memuat reaksi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const type = typeof body.type === "string" ? body.type.trim() : "";

  try {
    const data = await addReaction(type);
    return NextResponse.json({ ok: true, ...data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan reaksi.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
