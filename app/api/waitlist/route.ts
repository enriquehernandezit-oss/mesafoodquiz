import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { waitlist } from "@/db/schema";
import { UUID_RE } from "@/lib/tracking";

const bodySchema = z.object({
  sessionId: z.string().regex(UUID_RE).nullable().optional(),
  email: z.email(),
  handle: z.string().min(1).max(64).nullable().optional(),
});

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
  const { sessionId, email, handle } = parsed.data;

  try {
    const db = getDb();
    try {
      await db
        .insert(waitlist)
        .values({ sessionId: sessionId ?? null, email, handle: handle ?? null })
        .onConflictDoNothing();
    } catch (err) {
      // Waitlist can theoretically be submitted before the landing beacon's
      // session row lands — don't drop the email over that race, just lose
      // the linkage.
      const code = (err as { code?: string })?.code;
      if (code === "23503" && sessionId) {
        await db
          .insert(waitlist)
          .values({ sessionId: null, email, handle: handle ?? null })
          .onConflictDoNothing();
      } else {
        throw err;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("waitlist_failed", err);
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
