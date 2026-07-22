import fs from "node:fs";
import path from "node:path";

function publicFileExists(relativePath: string): boolean {
  return fs.existsSync(path.join(process.cwd(), "public", relativePath));
}

// Server-only (fs access) — call from generateMetadata / Server Components.
export function resolveCardImagePath(slug: string): string | null {
  const rel = `cards/${slug}.png`;
  return publicFileExists(rel) ? `/${rel}` : null;
}

export function resolveOgImagePath(slug: string): string | null {
  const ogRel = `og/${slug}.png`;
  if (publicFileExists(ogRel)) return `/${ogRel}`;
  const cardRel = `cards/${slug}.png`;
  if (publicFileExists(cardRel)) return `/${cardRel}`;
  const defaultRel = `og/default.png`;
  if (publicFileExists(defaultRel)) return `/${defaultRel}`;
  return null;
}
