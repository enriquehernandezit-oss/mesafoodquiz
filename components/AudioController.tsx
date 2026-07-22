"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { MUSIC_SRC } from "@/lib/audio-config";

export interface AudioControllerHandle {
  unlock: () => void;
}

const MUTE_KEY = "mesa-quiz-muted";

export const AudioController = forwardRef<AudioControllerHandle>(
  function AudioController(_props, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [muted, setMuted] = useState(() => {
      try {
        return localStorage.getItem(MUTE_KEY) === "1";
      } catch {
        return false;
      }
    });

    useEffect(() => {
      if (videoRef.current) videoRef.current.muted = muted;
      try {
        localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      } catch {
        // nothing to persist to
      }
    }, [muted]);

    useImperativeHandle(ref, () => ({
      unlock() {
        const el = videoRef.current;
        if (!el) return;
        el.muted = muted;
        // Best-effort: with no track picked yet this 404s and rejects
        // silently — the button and toggle still work once one lands at
        // MUSIC_SRC.
        el.play().catch(() => {});
      },
    }));

    return (
      <>
        {/* A <video> (not <audio>) is the documented way to keep playback
            audible when the phone's silent switch is on — iOS treats video
            playback as exempt from the ringer switch. */}
        <video
          ref={videoRef}
          src={MUSIC_SRC}
          playsInline
          loop
          preload="auto"
          className="hidden"
          onError={() => {}}
        />
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Activar música" : "Silenciar música"}
          aria-pressed={muted}
          className="fixed right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-mesa-cream/30 bg-mesa-maroon-deep/70 text-mesa-cream backdrop-blur-sm transition-colors duration-150 ease-out hover:border-mesa-cream/60"
        >
          {muted ? <MutedIcon /> : <UnmutedIcon />}
        </button>
      </>
    );
  },
);

function UnmutedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path
        d="M4 9v6h4l5 4V5L8 9H4Z"
        fill="currentColor"
      />
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M18.5 6a8 8 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

function MutedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
      <path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor" />
      <path
        d="M16 9.5l4 5m0-5l-4 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
