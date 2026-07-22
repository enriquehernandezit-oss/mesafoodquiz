export type ArchetypeSlug =
  | "story-spammer"
  | "comfort-zone"
  | "food-plug"
  | "sweet-tooth-ceo"
  | "budget-gourmet";

export interface ArchetypePersona {
  slug: ArchetypeSlug;
  name: string;
  quote: string;
  description: string;
}

export interface QuizOption {
  text: string;
  archetype: ArchetypeSlug;
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: QuizOption[];
}

// Bump this whenever QUIZ questions/options change meaningfully, so old and
// new results stay distinguishable in the results table.
export const QUIZ_VERSION = 1;

// DRAFT COPY — placeholder wording built to exercise the full flow today.
// Final question/option wording is still pending; swap it in here once locked.
export const ARCHETYPES: ArchetypePersona[] = [
  {
    slug: "story-spammer",
    name: "Story Spammer",
    quote:
      "Perate perate, dejame tira la foto para el story, pásame la lamparita q t ahi.",
    description:
      "La cámara come primero. Vas a un restaurante y la foto nunca falta. Lo documentas TODO: la entrada, el trago, la comida, el postre y hasta el baño. Gracias a ti, medio Instagram sabe dónde comer.",
  },
  {
    slug: "comfort-zone",
    name: "The Comfort Zone",
    quote: "Ah yo sé vieja, vamo pa'...",
    description:
      "Nunca te hartas de lo mismo — te comes el mismo appetizer, el mismo main y el mismo trago, en el mismo restaurante. Para ti explorar o probar cosas nuevas no existe, te encanta estar en lo seguro, prefieres no arriesgarte.",
  },
  {
    slug: "food-plug",
    name: "Certified Food Plug",
    quote:
      "Vieja tú has ido pa' tal sitio, lo abrieron ayer y el espresso martini estaba increíble.",
    description:
      "Eres una aventurera en la vida, siempre quieres the best next thing, te aburre lo común y la consistencia es tu peor enemigo — u always wanna change things up no matter what.",
  },
  {
    slug: "sweet-tooth-ceo",
    name: "Sweet Tooth CEO",
    quote:
      "La amiga: \"Señore, vamo a pedir la cuenta ya, estoy llenísima.\" Tú: \"Pero tú ta' loca vieja, yo vi un lava cake en su IG que se veía top, hoy e' sábado, la dieta se rompe.\"",
    description:
      "Ya estás llena pero no hay nada que te detenga. \"There's always room for dessert\" es tu catchphrase.",
  },
  {
    slug: "budget-gourmet",
    name: "Budget Gourmet",
    quote:
      "El coro: \"¿Dónde vamos a cenar hoy?\" Tú: \"Tengo un rest francés que acaba de abrir, es super lowkey y good prices.\"",
    description:
      "Cuando compras algo te aseguras que estés comprando calidad a precio correspondiente. Tu propósito en la vida es comer high end al mejor precio posible.",
  },
];

// Deterministic fallback only — the recency rule in lib/scoring.ts resolves
// every real tie on its own (two archetypes can't both be "last answered" at
// the same question). This stays as a documented backstop for future config
// changes that might award more than one point per question.
export const TIE_BREAK_PRIORITY: ArchetypeSlug[] = [
  "story-spammer",
  "comfort-zone",
  "food-plug",
  "sweet-tooth-ceo",
  "budget-gourmet",
];

export const QUIZ: QuizQuestion[] = [
  {
    id: "q1",
    prompt: "Llega la comida a la mesa. ¿Qué haces?",
    options: [
      { text: "Le tiro foto a to' antes de probar un bocado", archetype: "story-spammer" },
      { text: "Pruebo y ya sé si esto se convierte en mi orden de siempre", archetype: "comfort-zone" },
      { text: "Ya sabía que iba a pedir esto, lo vi en un reel hace semanas", archetype: "food-plug" },
      { text: "Reviso rapidito qué hay de postre antes de seguir comiendo", archetype: "sweet-tooth-ceo" },
      { text: "Pienso si esto vale lo que acabo de pagar", archetype: "budget-gourmet" },
    ],
  },
  {
    id: "q2",
    prompt: "El grupo no se pone de acuerdo en dónde comer. ¿Qué dices tú?",
    options: [
      { text: "\"Vamo pa'l de siempre, ahí no fallamos\"", archetype: "comfort-zone" },
      { text: "\"Hay un sitio nuevo que abrieron esta semana, hay que ir\"", archetype: "food-plug" },
      { text: "\"A mí me da igual, pero que valga la pena el precio\"", archetype: "budget-gourmet" },
      { text: "\"Yo voy pa'donde sea, con tal que tenga buena luz pa'l story\"", archetype: "story-spammer" },
      { text: "\"Que tengan buen menú de postre y ya con eso me convencen\"", archetype: "sweet-tooth-ceo" },
    ],
  },
  {
    id: "q3",
    prompt: "Terminaste de comer y estás llenísim@. Llega el menú de postres.",
    options: [
      { text: "Ya lo habías decidido desde que te sentaste", archetype: "sweet-tooth-ceo" },
      { text: "Pides el de siempre", archetype: "comfort-zone" },
      { text: "Calculas si vale la pena el precio", archetype: "budget-gourmet" },
      { text: "Le tiras foto antes de que alguien le meta el tenedor", archetype: "story-spammer" },
      { text: "Prefieres algo que no habías visto antes", archetype: "food-plug" },
    ],
  },
  {
    id: "q4",
    prompt: "Vas por primera vez a un restaurante nuevo. ¿Cómo decidiste venir?",
    options: [
      { text: "Lo vi en el Instagram de alguien que sigo religiosamente pa' esto", archetype: "food-plug" },
      { text: "Alguien me dijo que aquí el postre es una locura", archetype: "sweet-tooth-ceo" },
      { text: "Comparé precios en tres sitios antes de escoger este", archetype: "budget-gourmet" },
      { text: "La verdad prefiero mi lugar de siempre, pero me arrastraron", archetype: "comfort-zone" },
      { text: "Necesitaba contenido nuevo pa'l story", archetype: "story-spammer" },
    ],
  },
  {
    id: "q5",
    prompt: "Llega la cuenta. ¿Cuál es tu primer instinto?",
    options: [
      { text: "Reviso cada línea pa' asegurarme que valió la pena", archetype: "budget-gourmet" },
      { text: "Ya sé cuánto es, pido esto siempre", archetype: "comfort-zone" },
      { text: "Ya tiré suficientes fotos, esto va pal story ahora mismo", archetype: "story-spammer" },
      { text: "Me arrepiento un poco del postre extra, pero no me arrepiento", archetype: "sweet-tooth-ceo" },
      { text: "Ya estoy pensando en el próximo sitio que quiero probar", archetype: "food-plug" },
    ],
  },
  {
    id: "q6",
    prompt: "Alguien te pregunta \"¿qué tú comiste ayer?\"",
    options: [
      { text: "Le mando las quince fotos que tiré sin que pregunte más", archetype: "story-spammer" },
      { text: "\"Lo mismo de siempre\"", archetype: "comfort-zone" },
      { text: "Le cuento del sitio nuevo que nadie más conoce todavía", archetype: "food-plug" },
      { text: "Le cuento del postre, obvio", archetype: "sweet-tooth-ceo" },
      { text: "Le digo cuánto pagué y por qué fue un notón", archetype: "budget-gourmet" },
    ],
  },
];

export function getArchetype(slug: string): ArchetypePersona | undefined {
  return ARCHETYPES.find((a) => a.slug === slug);
}
