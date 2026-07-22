"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QUIZ, QUIZ_VERSION } from "@/lib/quiz-config";
import { computeResult } from "@/lib/scoring";
import { detectInAppBrowser, detectPlatform } from "@/lib/user-agent";
import {
  createEventBuffer,
  parseSessionRef,
  parseSourceChannel,
  sendTrackBeacon,
  stashPendingResult,
} from "@/lib/tracking";
import { AudioController, type AudioControllerHandle } from "./AudioController";
import { TitleScreen } from "./TitleScreen";
import { QuestionScreen } from "./QuestionScreen";
import { ProgressDots } from "./ProgressDots";

export function QuizApp() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [phase, setPhase] = useState<"title" | "question">("title");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [optionIndexes, setOptionIndexes] = useState<number[]>([]);

  const audioRef = useRef<AudioControllerHandle | null>(null);
  const eventBufferRef = useRef(createEventBuffer());
  const beginTimeRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const [sessionId] = useState(() => crypto.randomUUID());
  const identityRef = useRef({
    ref: parseSessionRef(searchParams.get("ref")),
    source: parseSourceChannel(searchParams.get("s")),
    platform: detectPlatform(typeof navigator === "undefined" ? "" : navigator.userAgent),
    inApp: detectInAppBrowser(typeof navigator === "undefined" ? "" : navigator.userAgent),
  });

  // Landing beacon: fired once on load, before "tap to begin" — this is the
  // only way to see title-screen bounce, since scoring stays fully in-memory
  // and network-free for the rest of the quiz.
  useEffect(() => {
    sendTrackBeacon({
      phase: "landing",
      sessionId,
      ...identityRef.current,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendBailBeacon = useCallback(() => {
    if (completedRef.current) return;
    const events = eventBufferRef.current.all();
    if (events.length === 0) return;
    sendTrackBeacon({
      phase: "events",
      sessionId,
      ...identityRef.current,
      events,
    });
  }, [sessionId]);

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "hidden") sendBailBeacon();
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", sendBailBeacon);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", sendBailBeacon);
    };
  }, [sendBailBeacon]);

  function handleBegin() {
    beginTimeRef.current = Date.now();
    audioRef.current?.unlock();
    eventBufferRef.current.push("quiz_started");
    setPhase("question");
  }

  function handleAnswer(optionIndex: number) {
    eventBufferRef.current.push("question_answered", { questionIndex, optionIndex });
    const next = [...optionIndexes, optionIndex];
    setOptionIndexes(next);

    if (questionIndex + 1 < QUIZ.length) {
      setQuestionIndex((i) => i + 1);
      return;
    }

    const { winner, scores, tied } = computeResult(next);
    const durationMs = Date.now() - (beginTimeRef.current ?? Date.now());
    eventBufferRef.current.push("quiz_completed", { archetype: winner });
    completedRef.current = true;

    stashPendingResult({
      sessionId,
      ...identityRef.current,
      archetype: winner,
      quizVersion: QUIZ_VERSION,
      tied,
      answers: next,
      scores,
      durationMs,
      events: eventBufferRef.current.all(),
    });

    router.push(`/r/${winner}?own=${sessionId}`);
  }

  const currentQuestion = QUIZ[questionIndex];

  return (
    <div className="flex min-h-dvh flex-col">
      <AudioController ref={audioRef} />

      {phase === "title" && <TitleScreen onBegin={handleBegin} />}

      {phase === "question" && currentQuestion && (
        <div className="flex flex-1 flex-col">
          <div className="px-6 pt-8">
            <ProgressDots total={QUIZ.length} current={questionIndex} />
          </div>
          <QuestionScreen
            prompt={currentQuestion.prompt}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
          />
        </div>
      )}
    </div>
  );
}
