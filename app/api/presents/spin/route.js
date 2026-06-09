import {
  hasParticipatedInGame,
  recordParticipation,
  spinPresent,
} from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  isAdminModeServer,
  requireVisitorHash,
} from "@/lib/participationServer";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const segmentIds = Array.isArray(body?.segmentIds)
      ? body.segmentIds.map(String)
      : undefined;

    const visitorHash = requireVisitorHash(body?.visitorId, request);
    const game = PARTICIPATION_GAMES.roulette;

    if (
      visitorHash &&
      (await hasParticipatedInGame(visitorHash, game))
    ) {
      return NextResponse.json(
        { error: "Kamu sudah pernah memutar roulette." },
        { status: 403 },
      );
    }

    const result = await spinPresent({ segmentIds });

    if (visitorHash && !isAdminModeServer(request) && !result.canSpinAgain) {
      await recordParticipation({ visitorHash, game });
    }

    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Gagal memutar roulette.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
