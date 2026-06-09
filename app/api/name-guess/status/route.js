import { hasParticipatedInGame } from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  isAdminModeServer,
  parseVisitorId,
  requireVisitorHash,
} from "@/lib/participationServer";
import { NextResponse } from "next/server";

export async function GET(request) {
  if (isAdminModeServer(request)) {
    return NextResponse.json({ canAttempt: true, attemptsLeft: 1 });
  }

  const visitorId = parseVisitorId(
    new URL(request.url).searchParams.get("visitorId"),
  );
  if (!visitorId) {
    return NextResponse.json(
      { error: "Identitas perangkat wajib ada." },
      { status: 400 },
    );
  }

  try {
    const visitorHash = requireVisitorHash(visitorId, request);
    const used = await hasParticipatedInGame(
      visitorHash,
      PARTICIPATION_GAMES.nameGuess,
    );

    return NextResponse.json({
      canAttempt: !used,
      attemptsLeft: used ? 0 : 1,
    });
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Gagal memuat status tebak nama.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
