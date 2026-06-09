import {
  getParticipatedGameSet,
  hasParticipatedInGame,
  recordParticipation,
} from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  isAdminModeServer,
  parseVisitorId,
  requireVisitorHash,
} from "@/lib/participationServer";
import { NextResponse } from "next/server";

function buildAvailability(participated) {
  return {
    card: !participated.has(PARTICIPATION_GAMES.card),
    doorprize: !participated.has(PARTICIPATION_GAMES.doorprize),
    roulette: !participated.has(PARTICIPATION_GAMES.roulette),
    nameGuess: !participated.has(PARTICIPATION_GAMES.nameGuess),
  };
}

export async function GET(request) {
  if (isAdminModeServer(request)) {
    return NextResponse.json({
      card: true,
      doorprize: true,
      roulette: true,
      nameGuess: true,
    });
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
    const participated = await getParticipatedGameSet(visitorHash);
    return NextResponse.json(buildAvailability(participated));
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Gagal memuat status game.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (isAdminModeServer(request)) {
    return NextResponse.json({ ok: true });
  }

  const game = String(body?.game ?? "").trim();
  if (game !== PARTICIPATION_GAMES.card) {
    return NextResponse.json({ error: "Game tidak valid." }, { status: 400 });
  }

  try {
    const visitorHash = requireVisitorHash(body?.visitorId, request);
    if (await hasParticipatedInGame(visitorHash, game)) {
      return NextResponse.json(
        { error: "Kamu sudah pernah main mini game ini." },
        { status: 403 },
      );
    }

    await recordParticipation({
      visitorHash,
      game,
      wishId: typeof body?.wishId === "string" ? body.wishId : "",
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof ParticipationError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    const msg = e instanceof Error ? e.message : "Gagal menyimpan partisipasi.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
