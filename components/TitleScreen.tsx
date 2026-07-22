"use client";

import { useState } from "react";
import Image from "next/image";

export function TitleScreen({ onBegin }: { onBegin: () => void }) {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-12 px-6 text-center">
      <div className="relative aspect-square w-full max-w-xs">
        {logoFailed ? (
          <MesaWordmarkPlaceholder />
        ) : (
          // Swapped for the real hand-lettered mark once
          // /public/branding/mesa-logo.jpg lands.
          <Image
            src="/branding/mesa-logo.jpg"
            alt="Mesa"
            fill
            sizes="(max-width: 480px) 80vw, 320px"
            className="object-contain"
            priority
            onError={() => setLogoFailed(true)}
          />
        )}
      </div>

      <h1 className="text-balance font-serif text-3xl font-medium italic text-mesa-cream">
        ¿Qué tipo de foodie eres?
      </h1>

      <button
        type="button"
        onClick={onBegin}
        className="rounded-full border border-mesa-gold/60 px-10 py-3 font-sans text-sm font-semibold uppercase tracking-[0.2em] text-mesa-cream transition-colors duration-150 ease-out hover:bg-mesa-gold/10 active:scale-95"
      >
        Toca para empezar
      </button>
    </div>
  );
}

function MesaWordmarkPlaceholder() {
  return (
    <svg
      viewBox="0 0 400 400"
      className="h-full w-full"
      role="img"
      aria-label="MESA"
    >
      <g transform="rotate(-3 200 200)">
        <rect
          x="60"
          y="90"
          width="280"
          height="220"
          rx="6"
          fill="none"
          stroke="#D2BEAA"
          strokeWidth="10"
        />
        <text
          x="200"
          y="222"
          textAnchor="middle"
          fontFamily="var(--font-cormorant)"
          fontSize="92"
          fontWeight="600"
          fill="#D2BEAA"
          letterSpacing="4"
        >
          MESA
        </text>
      </g>
    </svg>
  );
}
