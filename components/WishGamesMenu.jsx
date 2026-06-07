"use client";

import GameModal from "@/components/GameModal";
import DoorprizeGame from "@/components/games/DoorprizeGame";
import GuessCardGame from "@/components/games/GuessCardGame";
import {
  canPlayGame,
  getParticipationState,
  hasCompletedAllGames,
  isAdminMode,
  markParticipatedIn,
} from "@/lib/gameParticipation";
import { useCallback, useEffect, useState } from "react";

const GAMES = [
  {
    id: "card",
    title: "Mini Games",
    emoji: "🃏",
    desc: "Tebak kartu dan dapatkan hadiahnya",
    glow: "shadow-sky-200/60",
  },
  {
    id: "doorprize",
    title: "Doorprize Games",
    emoji: "🎁",
    desc: "Tebak seputar si kecil, dan nantikan hadiahnya!",
    glow: "shadow-rose-200/60",
  },
];

function GameChoiceCard({ game, available, onSelect }) {
  const { id, title, emoji, desc, glow } = game;

  return (
    <button
      type="button"
      disabled={!available}
      onClick={() => onSelect(id)}
      className={`group relative flex min-h-[9.5rem] flex-col items-center justify-center rounded-2xl border px-2 py-4 text-center transition focus:outline-none focus:ring-2 focus:ring-sky-300 disabled:cursor-default sm:min-h-[10.5rem] sm:px-3 sm:py-5 ${
        available
          ? `border-sky-200/80 bg-white/95 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg ${glow} active:translate-y-0`
          : "border-slate-200/80 bg-slate-50/90 opacity-75"
      }`}
    >
      {!available ? (
        <span className="absolute right-2 top-2 rounded-full bg-slate-200/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-600">
          Selesai ✓
        </span>
      ) : null}

      <span
        className={`text-4xl transition-transform sm:text-5xl ${
          available ? "group-hover:scale-110" : "grayscale-[0.35]"
        }`}
        aria-hidden="true"
      >
        {emoji}
      </span>

      <span
        className={`font-display mt-2 text-sm font-extrabold sm:text-base ${
          available ? "text-aira-navy" : "text-slate-500"
        }`}
      >
        {title}
      </span>

      <span className="mt-2 line-clamp-3 px-1 text-[10px] leading-snug text-slate-500 sm:text-[11px]">
        {desc}
      </span>
    </button>
  );
}

export default function WishGamesMenu({ onSendAgain, wishId, wishName }) {
  const [activeGame, setActiveGame] = useState(null);
  const [participation, setParticipation] = useState({
    card: true,
    doorprize: true,
  });
  const [checked, setChecked] = useState(false);

  const refreshParticipation = useCallback(() => {
    setParticipation(getParticipationState());
  }, []);

  useEffect(() => {
    refreshParticipation();
    setChecked(true);
  }, [refreshParticipation]);

  const active = GAMES.find((g) => g.id === activeGame);
  const allDone = checked && hasCompletedAllGames();

  function openGame(id) {
    if (!canPlayGame(id)) {
      refreshParticipation();
      return;
    }
    setActiveGame(id);
  }

  function handleDoorprizeComplete() {
    refreshParticipation();
    setActiveGame(null);
  }

  function handleCardFinished() {
    markParticipatedIn("card");
    refreshParticipation();
  }

  function closeModal() {
    setActiveGame(null);
  }

  return (
    <>
      <div className="mt-3 text-center">
        <p className="text-sm font-medium text-emerald-700">
          Terkirim. Terima kasih! 💖
        </p>

        {allDone ? (
          <p className="mt-3 rounded-2xl border border-sky-200/80 bg-sky-50/80 px-4 py-3 text-sm text-slate-600">
            Kamu sudah berpartisipasi semua game. Tunggu hasil dan hadiahnya ya!
            🎁
          </p>
        ) : checked ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Pilih game yang ingin kamu mainkan
            </p>

            {GAMES.some(({ id }) => !participation[id]) ? (
              <p className="mt-1 text-xs text-slate-500">
                {!participation.doorprize && participation.card
                  ? "Doorprize sudah selesai — mini game masih bisa dimainkan."
                  : participation.doorprize && !participation.card
                    ? "Mini game sudah selesai — doorprize masih bisa dimainkan."
                    : null}
              </p>
            ) : null}

            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-3">
              {GAMES.map((game) => (
                <GameChoiceCard
                  key={game.id}
                  game={game}
                  available={participation[game.id]}
                  onSelect={openGame}
                />
              ))}
            </div>
          </>
        ) : null}

        <button
          type="button"
          onClick={onSendAgain}
          className="mt-3 text-xs font-semibold text-sky-600 hover:underline"
        >
          Kirim ucapan lagi
        </button>
      </div>

      <GameModal
        open={!!activeGame}
        title={
          activeGame === "card"
            ? "Baby Match Challenge"
            : (active?.title ?? "")
        }
        onClose={closeModal}
        wide={activeGame === "doorprize"}
        compact={activeGame === "card"}
      >
        {activeGame === "card" ? (
          <GuessCardGame
            onFinished={handleCardFinished}
            allowReplay={isAdminMode()}
            wishName={wishName}
          />
        ) : null}
        {activeGame === "doorprize" ? (
          <DoorprizeGame wishId={wishId} onComplete={handleDoorprizeComplete} />
        ) : null}
      </GameModal>
    </>
  );
}
