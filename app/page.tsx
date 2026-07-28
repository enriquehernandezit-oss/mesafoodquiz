import { Suspense } from "react";
import { QuizApp } from "@/components/QuizApp";
import { QUIZ } from "@/lib/quiz-config";
import { resolveMoodPhotoPath, resolveMoodPhotos } from "@/lib/photos";

export default function Home() {
  const titlePhoto = resolveMoodPhotoPath("mood-candelabra");
  const questionPhotos = resolveMoodPhotos(QUIZ.map((q) => q.photo));

  return (
    <Suspense fallback={null}>
      <QuizApp titlePhoto={titlePhoto} questionPhotos={questionPhotos} />
    </Suspense>
  );
}
