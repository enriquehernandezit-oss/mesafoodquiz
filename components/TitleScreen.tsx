"use client";

import Image from "next/image";
import { NoiseOverlay } from "./NoiseOverlay";

export function TitleScreen({
  onBegin,
  photo,
}: {
  onBegin: () => void;
  photo: string | null;
}) {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-mesa-maroon">
      {photo && (
        <div
          className="absolute inset-x-0 bottom-0 h-[56%] animate-[mPan_18s_ease-in-out_infinite_alternate]"
          style={{
            backgroundImage: `url('${photo}')`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            opacity: 0.34,
          }}
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(#210104 30%, rgba(33,1,4,.72) 58%, rgba(33,1,4,.94))",
        }}
      />
      <NoiseOverlay opacity={0.11} />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-[34px] px-10 text-center">
        <div className="flex animate-[mLogo_1.1s_cubic-bezier(.2,.7,.2,1)_both] flex-col items-center gap-[18px]">
          <Image
            src="/branding/mesa-wordmark-cream.png"
            alt="mesa"
            width={224}
            height={59}
            priority
            className="h-auto w-[224px]"
          />
          <div className="flex items-center gap-2.5 font-mono text-[9px] font-semibold tracking-[.42em] text-mesa-cream/50">
            <span className="h-px w-[22px] bg-mesa-gold" />
            SANTO DOMINGO
            <span className="h-px w-[22px] bg-mesa-gold" />
          </div>
        </div>

        <h1 className="m-0 animate-[mFadeUp_.8s_.35s_cubic-bezier(.2,.7,.2,1)_both] text-balance font-serif text-[40px] font-medium italic leading-[1.12] text-mesa-cream">
          ¿Qué tipo de
          <br />
          foodie eres?
        </h1>
        <p className="m-0 animate-[mFadeUp_.8s_.5s_cubic-bezier(.2,.7,.2,1)_both] font-sans text-xs uppercase tracking-[.16em] text-mesa-cream/46">
          Seis preguntas · un resultado
        </p>
      </div>

      <div className="relative flex animate-[mFadeUp_.8s_.68s_cubic-bezier(.2,.7,.2,1)_both] flex-col items-center gap-5 px-8 pb-[54px]">
        <button
          type="button"
          onClick={onBegin}
          className="w-full rounded-full border border-[rgba(192,144,80,.75)] bg-transparent px-0 py-[19px] font-sans text-[11.5px] font-bold uppercase tracking-[.24em] text-mesa-cream transition-colors duration-[180ms] ease-out hover:border-mesa-gold hover:bg-mesa-gold/14 active:scale-[0.98]"
        >
          Toca para empezar
        </button>
        <span className="font-mono text-[10px] tracking-[.28em] text-mesa-cream/34">
          @MESA.SOCIAL
        </span>
      </div>
    </div>
  );
}
