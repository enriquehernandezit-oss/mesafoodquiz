export type Platform = "ios" | "android" | "other";
export type InAppBrowser = "instagram" | "whatsapp" | null;

export function detectPlatform(ua: string): Platform {
  if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "other";
}

export function detectInAppBrowser(ua: string): InAppBrowser {
  if (/Instagram/i.test(ua)) return "instagram";
  if (/\bWhatsApp\b/i.test(ua)) return "whatsapp";
  return null;
}
