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
      <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6 pb-16 pt-8">
        <button
          type="button"
          onClick={handleShareStories}
          data-pulse={escaped === "stories" ? "true" : undefined}
          className="rounded-full bg-mesa-gold px-6 py-4 text-center font-sans text-sm font-bold uppercase tracking-[0.15em] text-mesa-maroon transition-transform duration-150 ease-out active:scale-[0.98] data-[pulse=true]:animate-pulse"
        >
          Compartir en Stories
        </button>
        <button
          type="button"
          onClick={handleShareGroup}
          data-pulse={escaped === "group" ? "true" : undefined}
          className="rounded-full border border-mesa-cream/40 px-6 py-4 text-center font-sans text-sm font-bold uppercase tracking-[0.15em] text-mesa-cream transition-transform duration-150 ease-out active:scale-[0.98] data-[pulse=true]:animate-pulse"
        >
          Enviar al grupo
        </button>

        {shareFallback === "no-share-api" && <ShareFallback slug={slug} cardBlob={cardBlob} />}

        <WaitlistPrompt
          state={waitlist}
          email={email}
          onEmailChange={setEmail}
          onSubmit={handleWaitlistSubmit}
        />
      </div>
    );
  }

  const ctaHref = ref ? `/?ref=${ref}&s=${inboundSource ?? "wa"}` : "/";

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4 px-6 pb-16 pt-8">
      <Link
        href={ctaHref}
        className="rounded-full bg-mesa-gold px-6 py-4 text-center font-sans text-sm font-bold uppercase tracking-[0.15em] text-mesa-maroon transition-transform duration-150 ease-out active:scale-[0.98]"
      >
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-mesa-cream/20 bg-mesa-maroon-deep/50 p-4 text-center">
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
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-mesa-cream/20 bg-mesa-maroon-deep/50 p-4 text-center">
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
      <p className="pt-2 text-center font-sans text-xs text-mesa-cream/60">
        Listo, te avisamos primero 👀
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 pt-4">
      <p className="text-center font-sans text-xs text-mesa-cream/60">
        Algo se está cocinando en Santo Domingo — deja tu correo y entérate primero.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="tu@correo.com"
          className="min-w-0 flex-1 rounded-full border border-mesa-cream/25 bg-transparent px-4 py-2 font-sans text-sm text-mesa-cream placeholder:text-mesa-cream/40 focus:border-mesa-gold/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === "submitting"}
          className="rounded-full border border-mesa-cream/25 px-4 py-2 font-sans text-sm font-semibold text-mesa-cream transition-colors duration-150 ease-out disabled:opacity-50"
        >
          {state === "submitting" ? "..." : "Avisarme"}
        </button>
      </div>
      {state === "error" && (
        <p className="text-center font-sans text-xs text-mesa-rust">
          Algo falló, intenta de nuevo.
        </p>
      )}
    </form>
  );
}
