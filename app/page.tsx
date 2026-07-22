import { Suspense } from "react";
import { QuizApp } from "@/components/QuizApp";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <QuizApp />
    </Suspense>
  );
}
