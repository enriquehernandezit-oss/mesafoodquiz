import type { ArchetypeSlug } from "./quiz-config";
import type { InAppBrowser, Platform } from "./user-agent";

export type SourceChannel = "wa" | "ig_bio" | "ig_story" | "direct";

// Shape-only (no RFC4122 version/variant check) — matches what Postgres's
// own uuid column actually accepts, so the API's zod schema stays no
// stricter than the database it writes to.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SOURCE_CHANNELS: SourceChannel[] = ["wa", "ig_bio", "ig_story", "direct"];

export function parseSessionRef(value: string | null): string | null {
  return value && UUID_RE.test(value) ? value : null;
}

// Defaults to "direct" for anything missing/unrecognized — an untagged link
// is itself a meaningful bucket, distinct from never having been classified.
export function parseSourceChannel(value: string | null): SourceChannel {
  return SOURCE_CHANNELS.includes(value as SourceChannel)
    ? (value as SourceChannel)
    : "direct";
}

export interface TrackEvent {
  seq: number;
  type: string;
  payload?: unknown;
  at: string;
}

export function createEventBuffer() {
  let seq = 0;
  const events: TrackEvent[] = [];
  return {
    push(type: string, payload?: unknown) {
      events.push({ seq: seq++, type, payload, at: new Date().toISOString() });
    },
    all(): TrackEvent[] {
      return events;
    },
  };
}

export interface Identity {
  sessionId: string;
  ref: string | null;
  source: SourceChannel | null;
  platform: Platform;
  inApp: InAppBrowser;
}

export interface PendingResult extends Identity {
  archetype: ArchetypeSlug;
  quizVersion: number;
  tied: boolean;
  answers: number[];
  scores: Record<string, number>;
  durationMs: number;
  events: TrackEvent[];
}

const PENDING_KEY = "mesa-quiz-pending-result";

export function stashPendingResult(payload: PendingResult) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(payload));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — the result still
    // renders from the URL; only the /api/track "complete" write is lost.
  }
}

export function readPendingResult(sessionId: string): PendingResult | null {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingResult;
    return parsed.sessionId === sessionId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPendingResult() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    // nothing to clear
  }
}

export function sendTrackBeacon(payload: unknown) {
  try {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon("/api/track", blob);
  } catch {
    // best-effort only
  }
}

export function sendTrackFetch(payload: unknown) {
  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // best-effort only
  }
}
