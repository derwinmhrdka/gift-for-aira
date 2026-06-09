import {
  checkParticipationTiered,
  recordParticipation,
  spinPresent,
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
  try {
    const body = await request.json().catch(() => ({}));
    const segmentIds = Array.isArray(body?.segmentIds)
      ? body.segmentIds.map(String)
      : undefined;

    const { visitorHash, ipHash } = getParticipationIdentity(
      request,
      body?.visitorId,
    );
    const game = PARTICIPATION_GAMES.roulette;

    if (visitorHash) {
      const block = await checkParticipationTiered(visitorHash, ipHash, game);
      if (block.blocked) {
        return NextResponse.json(
          { error: participationBlockMessage(block.reason) },
          { status: 403 },
        );
      }
    }

    const result = await spinPresent({ segmentIds });

    if (visitorHash && !isAdminModeServer(request) && !result.canSpinAgain) {
      await recordParticipation({ visitorHash, ipHash, game });
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
