import { getWheelPresentsPayload } from "@/lib/airtable";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { presents, hasAvailablePrizes } = await getWheelPresentsPayload();
    return NextResponse.json({ presents, hasAvailablePrizes });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal memuat hadiah.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
