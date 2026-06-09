import { hasParticipatedInGame, recordParticipation } from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  isAdminModeServer,
  requireVisitorHash,
} from "@/lib/participationServer";
import { NextResponse } from "next/server";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (isAdminModeServer(request)) {
    return NextResponse.json({ ok: true, attemptsLeft: 0 });
  }

  try {
    const visitorHash = requireVisitorHash(body?.visitorId, request);
    const game = PARTICIPATION_GAMES.nameGuess;

    if (await hasParticipatedInGame(visitorHash, game)) {
      return NextResponse.json(
        { error: "Kesempatan tebak nama sudah habis." },
        { status: 403 },
      );
    }

    await recordParticipation({ visitorHash, game });

    return NextResponse.json({ ok: true, attemptsLeft: 0 });
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg =
      e instanceof Error ? e.message : "Gagal mencatat percobaan tebak nama.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
