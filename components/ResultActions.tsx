"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ArchetypeSlug } from "@/lib/quiz-config";
import { prefetchCardBlob, shareGroupLink, shareStoryCard } from "@/lib/share";
import { detectInAppBrowser, detectPlatform, type Platform } from "@/lib/user-agent";
import {
  clearPendingResult,
  parseSessionRef,
  readPendingResult,
  sendTrackFetch,
} from "@/lib/tracking";

type WaitlistState = "idle" | "submitting" | "done" | "error";

const primaryButtonClass =
  "rounded px-0 py-[19px] text-center font-sans text-xs font-extrabold uppercase tracking-[.16em] text-mesa-maroon transition-transform duration-[180ms] ease-out hover:-translate-y-0.5 active:scale-[0.98]";

const outlineButtonClass =
  "flex-1 rounded border border-mesa-cream/30 bg-transparent px-0 py-[15px] text-center font-sans text-[11px] font-bold uppercase tracking-[.14em] transition-colors duration-150 ease-out";

export function ResultActions({ slug }: { slug: ArchetypeSlug }) {
  const searchParams = useSearchParams();
  const own = parseSessionRef(searchParams.get("own"));
  const ref = parseSessionRef(searchParams.get("ref"));
  const escaped = searchParams.get("escaped");
  const inboundSource = searchParams.get("s");

  const [cardBlob, setCardBlob] = useState<Blob | null>(null);
  const [shareFallback, setShareFallback] = useState<null | "no-share-api">(null);
  const [waitlist, setWaitlist] = useState<WaitlistState>("idle");
  const [email, setEmail] = useState("");
  const trackedCompleteRef = useRef(false);
  const shareEventSeqRef = useRef(1000);

  useEffect(() => {
    let cancelled = false;
    prefetchCardBlob(slug).then((blob) => {
      if (!cancelled) setCardBlob(blob);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Fire the one /api/track "complete" POST for MY OWN just-finished result —
  // the pending payload was stashed by QuizApp right before navigating here.
  useEffect(() => {
    if (!own || trackedCompleteRef.current) return;
    const pending = readPendingResult(own);
    if (!pending) return;
    trackedCompleteRef.current = true;
    sendTrackFetch({ phase: "complete", ...pending });
    clearPendingResult();
  }, [own]);

  // Drop the `escaped` marker from the URL after the highlight has had a
  // chance to render once, so a refresh or re-share doesn't repeat it.
  useEffect(() => {
    if (!escaped) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("escaped");
    window.history.replaceState({}, "", url.toString());
  }, [escaped]);

  function trackShareEvent(type: string, payload?: unknown) {
    if (!own) return;
    sendTrackFetch({
      phase: "events",
      sessionId: own,
      ref: null,
      source: null,
      platform: detectPlatform(navigator.userAgent),
      inApp: detectInAppBrowser(navigator.userAgent),
      events: [
        { seq: shareEventSeqRef.current++, type, payload, at: new Date().toISOString() },
      ],
    });
  }

  async function handleShareStories() {
    trackShareEvent("share_tapped", { button: "stories" });
    const outcome = await shareStoryCard(slug, cardBlob);
    if (outcome.ok) {
      trackShareEvent("share_completed", { button: "stories" });
      return;
    }
    if (outcome.reason === "unsupported") setShareFallback("no-share-api");
  }

  async function handleShareGroup() {
    if (!own) return;
    trackShareEvent("share_tapped", { button: "group" });
    const url = `${window.location.origin}/r/${slug}?ref=${own}&s=wa`;
    const outcome = await shareGroupLink(url);
    if (outcome.ok) trackShareEvent("share_completed", { button: "group" });
  }

  async function handleWaitlistSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setWaitlist("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: own, email: email.trim() }),
      });
      setWaitlist(res.ok ? "done" : "error");
    } catch {
      setWaitlist("error");
    }
  }

  if (own) {
    return (
      <div className="bg-mesa-maroon-deep px-6 pb-10">
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleShareStories}
            data-pulse={escaped === "stories" ? "true" : undefined}
            className={`${primaryButtonClass} bg-mesa-cream data-[pulse=true]:animate-pulse`}
          >
            Compartir en Stories
          </button>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={handleShareGroup}
              data-pulse={escaped === "group" ? "true" : undefined}
              className={`${outlineButtonClass} text-mesa-cream hover:border-mesa-cream data-[pulse=true]:animate-pulse`}
            >
              Al grupo
            </button>
            <Link
              href="/"
              className={`${outlineButtonClass} text-mesa-cream/70 hover:border-mesa-cream hover:text-mesa-cream`}
            >
              Repetir
            </Link>
          </div>
        </div>

        {shareFallback === "no-share-api" && <ShareFallback slug={slug} cardBlob={cardBlob} />}

        <div className="mt-7 border-t border-mesa-cream/14 pt-[22px]">
          <WaitlistPrompt
            state={waitlist}
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleWaitlistSubmit}
          />
        </div>
      </div>
    );
  }

  const ctaHref = ref ? `/?ref=${ref}&s=${inboundSource ?? "wa"}` : "/";

  return (
    <div className="bg-mesa-maroon-deep px-6 pb-10">
      <Link href={ctaHref} className={`${primaryButtonClass} mt-6 block bg-mesa-cream`}>
        ¿Y tú? Haz el quiz
      </Link>
    </div>
  );
}

function ShareFallback({ slug, cardBlob }: { slug: ArchetypeSlug; cardBlob: Blob | null }) {
  const [platform] = useState<Platform>(() =>
    typeof navigator === "undefined" ? "other" : detectPlatform(navigator.userAgent),
  );
  const downloadUrl = useMemo(
    () => (cardBlob ? URL.createObjectURL(cardBlob) : `/cards/${slug}.png`),
    [cardBlob, slug],
  );

  useEffect(() => {
    return () => {
      if (cardBlob) URL.revokeObjectURL(downloadUrl);
    };
  }, [cardBlob, downloadUrl]);

  if (platform === "ios") {
    return (
      <div className="mt-4 flex flex-col items-center gap-3 rounded border border-mesa-cream/20 bg-mesa-maroon/50 p-4 text-center">
        <p className="font-sans text-xs text-mesa-cream/70">
          Mantén presionada la imagen de arriba y elige &ldquo;Guardar en Fotos&rdquo;, luego
          ábrela en Instagram.
        </p>
        <a
          href="instagram://story-camera"
          className="font-sans text-xs font-semibold uppercase tracking-wide text-mesa-gold"
        >
          Abrir Instagram
        </a>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center gap-3 rounded border border-mesa-cream/20 bg-mesa-maroon/50 p-4 text-center">
      <a
        href={downloadUrl}
        download={`${slug}.png`}
        className="font-sans text-xs font-semibold uppercase tracking-wide text-mesa-gold"
      >
        Descargar imagen
      </a>
      <p className="font-sans text-xs text-mesa-cream/70">
        Guárdala y compártela en tu Story desde Instagram.
      </p>
    </div>
  );
}

function WaitlistPrompt({
  state,
  email,
  onEmailChange,
  onSubmit,
}: {
  state: WaitlistState;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (state === "done") {
    return (
      <p className="m-0 font-sans text-[12.5px] leading-[1.6] text-mesa-cream/55">
        Listo, te avisamos primero 👀
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit}>
      <p className="m-0 mb-3 text-pretty font-sans text-[12.5px] leading-[1.6] text-mesa-cream/55">
        Algo se está cocinando en Santo Domingo — deja tu correo y entérate primero.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="tu@correo.com"
          className="min-w-0 flex-1 border-0 border-b border-mesa-cream/30 bg-transparent px-0.5 py-[11px] font-sans text-[13px] text-mesa-cream outline-none focus:border-mesa-gold"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded bg-mesa-gold px-[18px] py-[11px] font-sans text-[11.5px] font-bold uppercase tracking-[.1em] text-mesa-maroon transition-colors duration-150 ease-out hover:bg-mesa-gold-hover disabled:opacity-50"
        >
          {state === "submitting" ? "..." : "Avisarme"}
        </button>
      </div>
      {state === "error" && (
        <p className="mt-2 font-sans text-xs text-mesa-gold">Algo falló, intenta de nuevo.</p>
      )}
    </form>
  );
}
