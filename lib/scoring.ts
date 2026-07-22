import { ARCHETYPES, ArchetypeSlug, QUIZ, TIE_BREAK_PRIORITY } from "./quiz-config";

export interface ScoringResult {
  winner: ArchetypeSlug;
  scores: Record<ArchetypeSlug, number>;
  tied: boolean;
}

// optionIndexes[i] is the option index (0-4) picked for QUIZ[i].
export function computeResult(optionIndexes: number[]): ScoringResult {
  const scores = Object.fromEntries(
    ARCHETYPES.map((a) => [a.slug, 0]),
  ) as Record<ArchetypeSlug, number>;

  const pickedInOrder: ArchetypeSlug[] = [];

  optionIndexes.forEach((optionIndex, questionIndex) => {
    const option = QUIZ[questionIndex]?.options[optionIndex];
    if (!option) return;
    scores[option.archetype] += 1;
    pickedInOrder.push(option.archetype);
  });

  const maxScore = Math.max(...Object.values(scores));
  const tiedArchetypes = (Object.keys(scores) as ArchetypeSlug[]).filter(
    (slug) => scores[slug] === maxScore,
  );

  let winner: ArchetypeSlug;
  if (tiedArchetypes.length === 1) {
    winner = tiedArchetypes[0];
  } else {
    // Recency: whichever tied archetype was picked closest to the reveal
    // wins. Two different archetypes can never both be "last picked" at the
    // same question, so this always resolves on its own. TIE_BREAK_PRIORITY
    // is a documented backstop only, for a future scoring scheme where it
    // couldn't.
    winner =
      [...pickedInOrder].reverse().find((slug) => tiedArchetypes.includes(slug)) ??
      TIE_BREAK_PRIORITY.find((slug) => tiedArchetypes.includes(slug)) ??
      tiedArchetypes[0];
  }

  return { winner, scores, tied: tiedArchetypes.length > 1 };
}
