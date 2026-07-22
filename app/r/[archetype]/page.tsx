import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARCHETYPES, getArchetype } from "@/lib/quiz-config";
import { resolveOgImagePath } from "@/lib/og";
import { ResultCard } from "@/components/ResultCard";
import { ResultActions } from "@/components/ResultActions";

export function generateStaticParams() {
  return ARCHETYPES.map((a) => ({ archetype: a.slug }));
}

// Only the five known archetypes are valid — anything else 404s instead of
// generating a page on demand.
export const dynamicParams = false;

type Params = Promise<{ archetype: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { archetype } = await params;
  const persona = getArchetype(archetype);
  if (!persona) return {};

  const title = `Soy ${persona.name} — ¿Qué tipo de foodie eres?`;
  const ogImage = resolveOgImagePath(persona.slug);

  return {
    title,
    description: persona.quote,
    openGraph: {
      title,
      description: persona.quote,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: persona.quote,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ResultPage({ params }: { params: Params }) {
  const { archetype } = await params;
  const persona = getArchetype(archetype);
  if (!persona) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <ResultCard archetype={persona} />
      <Suspense fallback={null}>
        <ResultActions slug={persona.slug} />
      </Suspense>
    </div>
  );
}
