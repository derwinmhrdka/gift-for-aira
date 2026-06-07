import { createWish } from "@/lib/airtable";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const message =
    typeof body.message === "string" ? body.message.trim().slice(0, 500) : "";

  if (!name) {
    return NextResponse.json({ error: "Nama wajib diisi." }, { status: 400 });
  }
  if (!message) {
    return NextResponse.json({ error: "Ucapan wajib diisi." }, { status: 400 });
  }

  try {
    const record = await createWish({ name, message });
    revalidatePath("/");
    return NextResponse.json({
      ok: true,
      wish: { id: record?.id ?? null, name, message },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan ucapan.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
