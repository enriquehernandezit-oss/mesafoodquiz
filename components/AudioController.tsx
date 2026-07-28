"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { MUSIC_SRC } from "@/lib/audio-config";

export interface AudioControllerHandle {
  unlock: () => void;
}

export const AudioController = forwardRef<AudioControllerHandle, { muted: boolean }>(
  function AudioController({ muted }, ref) {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
      if (videoRef.current) videoRef.current.muted = muted;
    }, [muted]);

    useImperativeHandle(ref, () => ({
      unlock() {
        // Only start playback here — never touch .muted. The caller's
        // setMuted(false) hasn't committed to this component's props yet at
        // the moment of a synchronous click handler, so reading `muted` here
        // would still see the stale value. The effect above applies the real
        // mute state once the new prop lands, a moment later, which is safe
        // on an already-playing element (no fresh gesture required for that).
        videoRef.current?.play().catch(() => {});
      },
    }));

    return (
      // A <video> (not <audio>) is the documented way to keep playback
      // audible when the phone's silent switch is on — iOS treats video
      // playback as exempt from the ringer switch.
      <video
        ref={videoRef}
        src={MUSIC_SRC}
        playsInline
        loop
        preload="auto"
        className="hidden"
        onError={() => {}}
      />
    );
  },
);
