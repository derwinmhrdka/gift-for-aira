import { isZonkSegmentId, updatePresentWinner } from "@/lib/airtable";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const presentId =
    typeof body.presentId === "string" ? body.presentId.trim() : "";
  const winnerContact =
    typeof body.winnerContact === "string" ? body.winnerContact : "";
  const winnerName =
    typeof body.winnerName === "string" ? body.winnerName : "";

  if (!presentId || isZonkSegmentId(presentId)) {
    return NextResponse.json({ error: "ID hadiah tidak valid." }, { status: 400 });
  }

  try {
    await updatePresentWinner(presentId, { winnerContact, winnerName });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan kontak.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
