// Falls back to same-origin at request time when unset, so local dev and
// preview deploys work without configuring this — set NEXT_PUBLIC_SITE_URL
// on Railway for correct absolute OG image URLs.
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}
