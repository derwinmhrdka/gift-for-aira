import { spinPresent } from "@/lib/airtable";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const segmentIds = Array.isArray(body?.segmentIds)
      ? body.segmentIds.map(String)
      : undefined;
    const result = await spinPresent({ segmentIds });
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal memutar roulette.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
