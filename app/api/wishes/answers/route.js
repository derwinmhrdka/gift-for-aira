import {
  checkParticipationTiered,
  getWishRecordById,
  recordParticipation,
  updateWishAnswers,
  wishHasDoorprizeAnswers,
} from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  getParticipationIdentity,
  isAdminModeServer,
  participationBlockMessage,
} from "@/lib/participationServer";
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
    const { visitorHash, ipHash } = getParticipationIdentity(
      request,
      body?.visitorId,
    );
    const game = PARTICIPATION_GAMES.doorprize;

    if (visitorHash) {
      const block = await checkParticipationTiered(visitorHash, ipHash, game);
      if (block.blocked) {
        return NextResponse.json(
          { error: participationBlockMessage(block.reason) },
          { status: 403 },
        );
      }
    }

    const wishRecord = await getWishRecordById(wishId);
    if (wishHasDoorprizeAnswers(wishRecord?.fields)) {
      return NextResponse.json(
        { error: "Ucapan ini sudah pernah mengirim jawaban doorprize." },
        { status: 403 },
      );
    }

    await updateWishAnswers({
      wishId,
      answer1,
      answer2,
      answer3,
      answer4,
      answer5,
    });

    if (visitorHash && !isAdminModeServer(request)) {
      await recordParticipation({ visitorHash, ipHash, game, wishId });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Gagal menyimpan jawaban.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
