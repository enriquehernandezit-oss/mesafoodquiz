import Image from "next/image";
import type { ArchetypePersona } from "@/lib/quiz-config";
import { resolveCardImagePath } from "@/lib/og";

export function ResultCard({ archetype }: { archetype: ArchetypePersona }) {
  const cardPath = resolveCardImagePath(archetype.slug);

  return (
    <div className="mx-auto w-full max-w-sm px-6 pt-10">
      <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl border border-mesa-cream/15 bg-mesa-maroon-deep">
        {cardPath ? (
          <Image
            src={cardPath}
            alt={`Resultado: ${archetype.name}`}
            fill
            sizes="(max-width: 480px) 100vw, 384px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-6 px-8 text-center">
            <span className="font-sans text-xs uppercase tracking-[0.25em] text-mesa-cream/60">
              ¿Qué tipo de foodie eres?
            </span>
            <h1 className="text-balance font-serif text-4xl font-semibold text-mesa-gold">
              {archetype.name}
            </h1>
            <p className="text-balance font-serif text-lg italic text-mesa-cream/90">
              &ldquo;{archetype.quote}&rdquo;
            </p>
            <span className="font-sans text-sm font-semibold tracking-wide text-mesa-cream/70">
              @mesa.social
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
