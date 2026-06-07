import { updateWishAnswers } from "@/lib/airtable";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const wishId = typeof body.wishId === "string" ? body.wishId.trim() : "";
  if (!wishId) {
    return NextResponse.json({ error: "Wish ID wajib ada." }, { status: 400 });
  }

  const answers = body.answers ?? {};
  const answer1 = typeof answers.answer1 === "string" ? answers.answer1 : "";
  const answer2 = typeof answers.answer2 === "string" ? answers.answer2 : "";
  const answer3 = typeof answers.answer3 === "string" ? answers.answer3 : "";
  const answer4 = typeof answers.answer4 === "string" ? answers.answer4 : "";
  const answer5 = typeof answers.answer5 === "string" ? answers.answer5 : "";

  try {
    await updateWishAnswers({
      wishId,
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal menyimpan jawaban.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
