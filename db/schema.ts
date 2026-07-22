import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  integer,
  boolean,
  index,
  uniqueIndex,
  bigserial,
} from "drizzle-orm/pg-core";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").primaryKey(),
    ref: uuid("ref"),
    source: text("source").$type<"wa" | "ig_bio" | "ig_story" | "direct">(),
    platform: text("platform").$type<"ios" | "android" | "other">(),
    inApp: text("in_app").$type<"instagram" | "whatsapp" | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("sessions_ref_idx").on(t.ref)],
);

export const results = pgTable(
  "results",
  {
    sessionId: uuid("session_id")
      .primaryKey()
      .references(() => sessions.id),
    archetype: text("archetype").notNull(),
    quizVersion: integer("quiz_version").notNull().default(1),
    tied: boolean("tied").notNull().default(false),
    answers: jsonb("answers").$type<number[]>().notNull(),
    scores: jsonb("scores").$type<Record<string, number>>().notNull(),
    durationMs: integer("duration_ms"),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("results_archetype_idx").on(t.archetype)],
);

export const events = pgTable(
  "events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id),
    seq: integer("seq").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload"),
    at: timestamp("at", { withTimezone: true }).notNull(),
  },
  (t) => [uniqueIndex("events_session_seq_idx").on(t.sessionId, t.seq)],
);

export const waitlist = pgTable(
  "waitlist",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").references(() => sessions.id),
    email: text("email").notNull(),
    handle: text("handle"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [uniqueIndex("waitlist_email_idx").on(t.email)],
);
