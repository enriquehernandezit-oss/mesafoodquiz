import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { sessions, results, events as eventsTable } from "@/db/schema";
import { ARCHETYPES, type ArchetypeSlug } from "@/lib/quiz-config";
import { UUID_RE } from "@/lib/tracking";

const archetypeSlugs = ARCHETYPES.map((a) => a.slug) as [
  ArchetypeSlug,
  ...ArchetypeSlug[],
];

const identitySchema = z.object({
  sessionId: z.string().regex(UUID_RE),
  ref: z.string().regex(UUID_RE).nullable(),
  source: z.enum(["wa", "ig_bio", "ig_story", "direct"]).nullable(),
  platform: z.enum(["ios", "android", "other"]),
  inApp: z.enum(["instagram", "whatsapp"]).nullable(),
});

const eventSchema = z.object({
  seq: z.number().int().nonnegative(),
  type: z.string().min(1),
  payload: z.unknown().optional(),
  at: z.string(),
});

const bodySchema = z.discriminatedUnion("phase", [
  identitySchema.extend({ phase: z.literal("landing") }),
  // Append-only: covers both a mid-quiz bail (pagehide/hidden) and
  // post-completion interactions on the result screen (share taps), since
  // both just mean "ensure the session exists, append these events."
  identitySchema.extend({
    phase: z.literal("events"),
    events: z.array(eventSchema),
  }),
  identitySchema.extend({
    phase: z.literal("complete"),
    archetype: z.enum(archetypeSlugs),
    quizVersion: z.number().int().positive(),
    tied: z.boolean(),
    answers: z.array(z.number().int().nonnegative()),
    scores: z.record(z.string(), z.number()),
    durationMs: z.number().int().nonnegative(),
    events: z.array(eventSchema),
  }),
]);

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_body" }, { status: 400 });
  }
  const data = parsed.data;

  try {
    const db = getDb();

    // Every phase upserts the session row first — delivery order between the
    // landing beacon, a bail beacon, and the completion POST isn't
    // guaranteed, and events/results both carry a foreign key to it.
    await db
      .insert(sessions)
      .values({
        id: data.sessionId,
        ref: data.ref,
        source: data.source,
        platform: data.platform,
        inApp: data.inApp,
      })
      .onConflictDoNothing();

    if (data.phase === "events" || data.phase === "complete") {
      if (data.events.length > 0) {
        await db
          .insert(eventsTable)
          .values(
            data.events.map((e) => ({
              sessionId: data.sessionId,
              seq: e.seq,
              type: e.type,
              payload: e.payload ?? null,
              at: new Date(e.at),
            })),
          )
          .onConflictDoNothing();
      }
    }

    if (data.phase === "complete") {
      await db
        .insert(results)
        .values({
          sessionId: data.sessionId,
          archetype: data.archetype,
          quizVersion: data.quizVersion,
          tied: data.tied,
          answers: data.answers,
          scores: data.scores,
          durationMs: data.durationMs,
        })
        .onConflictDoNothing();
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("track_failed", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
