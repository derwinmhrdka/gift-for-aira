"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_MUSIC_PATH = "/music.mpeg";

function MusicIcon({ muted }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      className={`h-9 w-12 ${muted ? "" : "aira-music-icon-active"}`}
      aria-hidden
    >
      <ellipse
        cx="9.5"
        cy="17.5"
        rx="3.2"
        ry="2.6"
        fill="currentColor"
        transform="rotate(-20 9.5 17.5)"
      />
      <path
        d="M12.5 5v12.5"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
      />
      <path
        d="M12.5 5c4.2 1.2 5.2 4.8 2.8 9.2"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {!muted ? (
        <g className="aira-music-waves">
          <path
            d="M20 9c2 1.5 2 4.5 0 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M23.5 6.5c3 2.2 3 6.8 0 9"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M27 4c3.5 2.8 3.5 9.2 0 12"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </g>
      ) : null}
      {muted ? (
        <path
          d="M2 2l20 20"
          stroke="#ef4444"
          strokeWidth="2"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  );
}

export default function BackgroundMusicButton() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    audio.muted = false;
    setReady(true);

    const tryAutoPlay = async () => {
      try {
        await audio.play();
      } catch {
        audio.muted = true;
        setMuted(true);
        try {
          await audio.play();
        } catch {
          // iOS/Android may still require user interaction.
        }
      }
    };

    tryAutoPlay();
  }, []);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !muted;
    audio.muted = nextMuted;
    setMuted(nextMuted);
    if (!nextMuted) {
      try {
        await audio.play();
      } catch {
        // User can tap again if the browser delayed media activation.
      }
    }
  };

  return (
    <>
      <audio ref={audioRef} src={DEFAULT_MUSIC_PATH} loop preload="auto" playsInline />
      <button
        type="button"
        onClick={toggleMute}
        disabled={!ready}
        className="group fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-[230] inline-flex items-center justify-center bg-transparent p-0 text-aira-navy drop-shadow-[0_1px_3px_rgba(255,255,255,0.9)] transition hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-aira-snow disabled:opacity-50"
        aria-label={muted ? "Nyalakan musik" : "Mute musik"}
        title={muted ? "Nyalakan musik" : "Mute musik"}
      >
        <MusicIcon muted={muted} />
      </button>
    </>
  );
}
