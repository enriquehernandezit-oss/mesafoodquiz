// Regenerates public/cards/{slug}.png (the 1080x1920 story-share assets) from
// the live quiz-config.ts copy and whatever's at public/photos/{slug}.jpg.
// Run again any time either changes: `bun run scripts/generate-cards.ts`.
//
// Renders via the system Chrome in headless screenshot mode rather than a
// Puppeteer/Playwright dependency — this is a one-off asset-build tool, not
// part of the shipped app.
import { mkdtemp, rm, copyFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { ARCHETYPES } from "../lib/quiz-config";
import { resolveArchetypePhotoPath } from "../lib/photos";

const CHROME_PATH = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const NOISE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

function cardHtml(opts: { idx: number; name: string; quote: string; photoFile: string | null }) {
  const { idx, name, quote, photoFile } = opts;
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=Space+Mono:wght@400&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: 1080px; height: 1920px; background: #150000; overflow: hidden; }
  .card { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #150000; }
  .photo { position: absolute; inset: 0; background-size: cover; background-position: center; ${
    photoFile ? `background-image: url('${photoFile}');` : ""
  } }
  .gradient { position: absolute; inset: 0; background: linear-gradient(rgba(21,0,0,.34) 0%, rgba(33,1,4,.5) 40%, rgba(21,0,0,.96) 100%); }
  .noise { position: absolute; inset: 0; opacity: .17; mix-blend-mode: overlay; background-image: url("${NOISE}"); }
  .content { position: absolute; inset: 200px 66px 300px; display: flex; flex-direction: column; justify-content: space-between; }
  .top-row { display: flex; align-items: flex-start; justify-content: space-between; }
  .wordmark { width: 216px; height: auto; display: block; }
  .pill { border: 2px solid rgba(235,228,214,.55); border-radius: 999px; padding: 18px 34px; font: 400 22px 'Space Mono', monospace; letter-spacing: .24em; color: #EBE4D6; transform: rotate(-8deg); }
  .eres { margin: 0 0 30px; font: 400 26px 'Space Mono', monospace; letter-spacing: .34em; color: rgba(235,228,214,.7); }
  .name { margin: 0; font: 500 168px/.9 'Cormorant Garamond', serif; color: #EBE4D6; letter-spacing: -.025em; }
  .quote { margin: 48px 0 0; padding-left: 34px; border-left: 5px solid #C09050; font: italic 400 44px/1.42 'Cormorant Garamond', serif; color: rgba(235,228,214,.94); }
  .meta { margin: 64px 0 0; padding-top: 34px; border-top: 1px solid rgba(235,228,214,.22); display: flex; align-items: center; justify-content: space-between; font: 400 24px 'Space Mono', monospace; letter-spacing: .26em; color: rgba(235,228,214,.6); }
</style>
</head>
<body>
  <div class="card">
    <div class="photo"></div>
    <div class="gradient"></div>
    <div class="noise"></div>
    <div class="content">
      <div class="top-row">
        <img class="wordmark" src="mesa-wordmark-cream.png" alt="mesa" />
        <div class="pill">TIPO 0${idx} / 05</div>
      </div>
      <div>
        <p class="eres">ERES</p>
        <h1 class="name">${name}</h1>
        <p class="quote">&ldquo;${quote}&rdquo;</p>
        <div class="meta">
          <span>@MESA.SOCIAL</span>
          <span>¿QUÉ TIPO DE FOODIE ERES?</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;
}

async function main() {
  const projectRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
  const workDir = await mkdtemp(join(tmpdir(), "mesa-cards-"));
  await copyFile(
    join(projectRoot, "public/branding/mesa-wordmark-cream.png"),
    join(workDir, "mesa-wordmark-cream.png"),
  );

  for (const [i, archetype] of ARCHETYPES.entries()) {
    const photoPath = resolveArchetypePhotoPath(archetype.slug);
    const photoFile = photoPath ? join(projectRoot, "public", photoPath.slice(1)) : null;

    const html = cardHtml({
      idx: i + 1,
      name: archetype.name,
      quote: archetype.quote,
      photoFile,
    });
    const htmlPath = join(workDir, `${archetype.slug}.html`);
    await writeFile(htmlPath, html);

    const outPath = join(projectRoot, "public/cards", `${archetype.slug}.png`);
    execFileSync(CHROME_PATH, [
      "--headless",
      "--disable-gpu",
      `--screenshot=${outPath}`,
      "--window-size=1080,1920",
      "--hide-scrollbars",
      "--force-device-scale-factor=1",
      `file://${htmlPath}`,
    ]);
    console.log(`${photoPath ? "✓" : "○"} ${archetype.slug}${photoPath ? "" : " (no photo yet)"}`);
  }

  await rm(workDir, { recursive: true, force: true });
}

main();
