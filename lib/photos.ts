import fs from "node:fs";
import path from "node:path";

const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

function findPublicFile(dir: string, name: string): string | null {
  for (const ext of EXTENSIONS) {
    const rel = `${dir}/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return `/${rel}`;
  }
  return null;
}

// Server-only (fs access) — call from Server Components / generateMetadata.
// Returns null until licensed Mesa photography lands at the given path; every
// screen that uses these renders its gradient-only fallback in that case.
export function resolveMoodPhotoPath(name: string): string | null {
  return findPublicFile("mood", name);
}

export function resolveArchetypePhotoPath(slug: string): string | null {
  return findPublicFile("photos", slug);
}

export function resolveMoodPhotos(names: string[]): (string | null)[] {
  return names.map(resolveMoodPhotoPath);
}
