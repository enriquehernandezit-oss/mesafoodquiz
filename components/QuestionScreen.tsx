"use client";

import { useState } from "react";
import { NoiseOverlay } from "./NoiseOverlay";
import type { QuizOption } from "@/lib/quiz-config";

const ANSWER_FEEDBACK_MS = 440;

interface QuestionScreenProps {
  photo: string | null;
  questionNumber: number; // 1-based
  totalQuestions: number;
  prompt: string;
  options: QuizOption[];
  onAnswer: (index: number) => void;
  muted: boolean;
  onToggleMute: () => void;
}

export function QuestionScreen({
  photo,
  questionNumber,
  totalQuestions,
  prompt,
  options,
  onAnswer,
  muted,
  onToggleMute,
}: QuestionScreenProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const num = String(questionNumber).padStart(2, "0");

  function pick(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setTimeout(() => onAnswer(index), ANSWER_FEEDBACK_MS);
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {photo ? (
        <div
          className="absolute inset-0 animate-[mZoom_10s_cubic-bezier(.2,.7,.2,1)_both]"
          style={{
            backgroundImage: `url('${photo}')`,
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-mesa-maroon-deep" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(rgba(21,0,0,.32) 0%, rgba(21,0,0,.6) 40%, rgba(21,0,0,.95) 100%)",
        }}
      />
      <NoiseOverlay opacity={0.16} />

      <div className="absolute inset-0 flex flex-col px-6 pb-[34px] pt-8">
        <div className="flex items-center gap-2.5">
          {Array.from({ length: totalQuestions }).map((_, i) => {
            const bg =
              i < questionNumber - 1
                ? "#C09050"
                : i === questionNumber - 1
                  ? "#EBE4D6"
                  : "rgba(235,228,214,.25)";
            return (
              <span
                key={i}
                className="h-[3px] flex-1 rounded-full transition-[background] duration-[400ms] ease-out"
                style={{ background: bg }}
              />
            );
          })}
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Activar sonido" : "Silenciar sonido"}
            aria-pressed={!muted}
            className="flex h-[14px] items-end gap-[2.5px] border-none bg-transparent pl-1.5"
          >
            {[6, 12, 9].map((h, i) => (
              <span
                key={i}
                className="w-[2px] rounded-[1px]"
                style={{
                  height: h,
                  background: muted ? "rgba(235,228,214,.34)" : "#C09050",
                  animation: muted
                    ? "none"
                    : `mEq .9s ${i === 0 ? "0s" : `${i * 0.15}s`} ease-in-out infinite alternate`,
                }}
              />
            ))}
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center py-[26px]">
          <span className="animate-[mIn_.5s_both] font-serif text-[46px] leading-none text-mesa-gold/90">
            {num}
          </span>
          <h2 className="m-0 mt-1.5 animate-[mRise_.55s_cubic-bezier(.2,.7,.2,1)_both] text-pretty font-serif text-[38px] font-medium leading-[1.06] tracking-[-.015em] text-mesa-cream">
            {prompt}
          </h2>
        </div>

        <div className="flex flex-col gap-2">
          {options.map((option, i) => {
            const isSelected = selected === i;
            const opacity = selected === null ? 1 : isSelected ? 1 : 0.22;
            return (
              <button
                key={i}
                type="button"
                onClick={() => pick(i)}
                disabled={selected !== null}
                className="relative animate-[mSlideL_.5s_cubic-bezier(.2,.7,.2,1)_both] overflow-hidden rounded border border-mesa-cream/28 bg-[rgba(21,0,0,.42)] px-4 py-3.5 text-left font-sans text-[13.5px] font-medium leading-[1.35] text-mesa-cream transition-[opacity,border-color,background] duration-200 ease-out hover:border-mesa-cream hover:bg-[rgba(21,0,0,.66)]"
                style={{
                  opacity,
                  animationDelay: `${(0.05 + i * 0.055).toFixed(3)}s`,
                }}
              >
                <span
                  className="absolute inset-0 bg-mesa-cream"
                  style={{
                    transform: "translateX(-101%)",
                    animation: isSelected ? "mSweep .38s cubic-bezier(.3,.8,.2,1) both" : "none",
                  }}
                />
                <span className="relative" style={{ mixBlendMode: "difference" }}>
                  {option.text}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
