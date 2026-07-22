import { detectInAppBrowser, detectPlatform, type Platform } from "./user-agent";

export type ShareIntent = "stories" | "group";

function buildEscapeUrl(platform: Platform, intent: ShareIntent): string | null {
  const target = `${location.pathname}${location.search}`;
  const separator = target.includes("?") ? "&" : "?";
  const withMarker = `${target}${separator}escaped=${intent}`;
  if (platform === "ios") {
    return `x-safari-https://${location.host}${withMarker}`;
  }
  if (platform === "android") {
    return `intent://${location.host}${withMarker}#Intent;scheme=https;end`;
  }
  return null;
}

// Instagram's and WhatsApp's in-app browsers can't reliably do file-based
// Web Share, so escape to the real browser before attempting it. Returns
// true if it escaped (caller should stop, a fresh tab is loading).
export function escapeInAppBrowserIfNeeded(intent: ShareIntent): boolean {
  const inApp = detectInAppBrowser(navigator.userAgent);
  if (!inApp) return false;
  const platform = detectPlatform(navigator.userAgent);
  const url = buildEscapeUrl(platform, intent);
  if (!url) return false;
  if (platform === "ios") {
    window.open(url);
  } else {
    location.href = url;
  }
  return true;
}

export async function prefetchCardBlob(slug: string): Promise<Blob | null> {
  try {
    const res = await fetch(`/cards/${slug}.png`);
    if (!res.ok) return null;
    return await res.blob();
  } catch {
    return null;
  }
}

export type ShareOutcome =
  | { ok: true }
  | { ok: false; reason: "escaped" | "unsupported" | "cancelled" | "error" };

export async function shareStoryCard(
  slug: string,
  cardBlob: Blob | null,
): Promise<ShareOutcome> {
  if (escapeInAppBrowserIfNeeded("stories")) return { ok: false, reason: "escaped" };
  if (!cardBlob) return { ok: false, reason: "unsupported" };

  const file = new File([cardBlob], `${slug}.png`, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) {
    return { ok: false, reason: "unsupported" };
  }
  try {
    // `files` must be the ONLY key passed here — iOS Safari will silently
    // share the text/link instead of the image if `title`/`text`/`url` ride
    // along in the same call.
    await navigator.share({ files: [file] });
    return { ok: true };
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      return { ok: false, reason: "cancelled" };
    }
    return { ok: false, reason: "error" };
  }
}

export async function shareGroupLink(url: string): Promise<ShareOutcome> {
  if (escapeInAppBrowserIfNeeded("group")) return { ok: false, reason: "escaped" };
  if (navigator.share) {
    try {
      await navigator.share({ url });
      return { ok: true };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return { ok: false, reason: "cancelled" };
      }
      return { ok: false, reason: "error" };
    }
  }
  try {
    await navigator.clipboard.writeText(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: "unsupported" };
  }
}
