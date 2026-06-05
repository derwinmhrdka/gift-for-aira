"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DEFAULT_MUSIC_PATH = "/music.mpeg";

function MusicIcon({ active }) {
  return (
    <svg
      viewBox="0 0 36 24"
      fill="none"
      className={`h-9 w-12 ${active ? "aira-music-icon-active" : "opacity-80"}`}
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
      {active ? (
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
      ) : (
        <>
          <path
            d="M19 8v8"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.35"
          />
          <path
            d="M22.5 6v11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.25"
          />
          <path
            d="M2 2l20 20"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
}

export default function BackgroundMusicButton() {
  const audioRef = useRef(null);
  const [musicActive, setMusicActive] = useState(false);
  const [ready, setReady] = useState(false);

  const syncPlaybackState = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setMusicActive(!audio.paused && !audio.muted);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    audio.volume = 0.5;
    audio.muted = false;
    setReady(true);

    const tryPlay = async () => {
      try {
        await audio.play();
      } catch {
        // Browser may block until the first tap/click.
      } finally {
        syncPlaybackState();
      }
    };

    tryPlay();

    const unlockOnGesture = () => {
      if (!audio.paused && !audio.muted) return;
      tryPlay();
    };

    const onPlaybackChange = () => syncPlaybackState();

    audio.addEventListener("play", onPlaybackChange);
    audio.addEventListener("pause", onPlaybackChange);
    audio.addEventListener("volumechange", onPlaybackChange);
    document.addEventListener("click", unlockOnGesture);
    document.addEventListener("touchstart", unlockOnGesture, { passive: true });

    return () => {
      audio.removeEventListener("play", onPlaybackChange);
      audio.removeEventListener("pause", onPlaybackChange);
      audio.removeEventListener("volumechange", onPlaybackChange);
      document.removeEventListener("click", unlockOnGesture);
      document.removeEventListener("touchstart", unlockOnGesture);
    };
  }, [syncPlaybackState]);

  const toggleMute = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (musicActive) {
      audio.muted = true;
      syncPlaybackState();
      return;
    }

    audio.muted = false;
    try {
      await audio.play();
    } catch {
      // User can tap again if the browser delayed media activation.
    } finally {
      syncPlaybackState();
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
        aria-label={musicActive ? "Mute musik" : "Nyalakan musik"}
        title={musicActive ? "Mute musik" : "Nyalakan musik"}
      >
        <MusicIcon active={musicActive} />
      </button>
    </>
  );
}
