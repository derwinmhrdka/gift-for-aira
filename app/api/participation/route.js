import {
  checkParticipationTiered,
  getParticipationSignalsForIdentity,
  recordParticipation,
} from "@/lib/airtable";
import {
  PARTICIPATION_GAMES,
  ParticipationError,
  getParticipationIdentity,
  isAdminModeServer,
  parseVisitorId,
  participationBlockMessage,
} from "@/lib/participationServer";
import { NextResponse } from "next/server";

function canPlayTiered(fpGames, ipGames, game, hasFingerprint) {
  if (fpGames.has(game)) return false;
  if (hasFingerprint && ipGames.has(game)) return false;
  return true;
}

async function buildAvailability(visitorHash, ipHash) {
  const { fpGames, ipGames } = await getParticipationSignalsForIdentity(
    visitorHash,
    ipHash,
  );
  const hasFingerprint = Boolean(visitorHash);

  return {
    card: canPlayTiered(fpGames, ipGames, PARTICIPATION_GAMES.card, hasFingerprint),
    doorprize: canPlayTiered(
      fpGames,
      ipGames,
      PARTICIPATION_GAMES.doorprize,
      hasFingerprint,
    ),
    roulette: canPlayTiered(
      fpGames,
      ipGames,
      PARTICIPATION_GAMES.roulette,
      hasFingerprint,
    ),
    nameGuess: canPlayTiered(
      fpGames,
      ipGames,
      PARTICIPATION_GAMES.nameGuess,
      hasFingerprint,
    ),
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
    const { visitorHash, ipHash } = getParticipationIdentity(request, visitorId);
    return NextResponse.json(await buildAvailability(visitorHash, ipHash));
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
    const { visitorHash, ipHash } = getParticipationIdentity(
      request,
      body?.visitorId,
    );
    const block = await checkParticipationTiered(visitorHash, ipHash, game);
    if (block.blocked) {
      return NextResponse.json(
        { error: participationBlockMessage(block.reason) },
        { status: 403 },
      );
    }

    await recordParticipation({
      visitorHash,
      ipHash,
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
