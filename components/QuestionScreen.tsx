import type { QuizOption } from "@/lib/quiz-config";

interface QuestionScreenProps {
  prompt: string;
  options: QuizOption[];
  onAnswer: (index: number) => void;
}

export function QuestionScreen({ prompt, options, onAnswer }: QuestionScreenProps) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-8 px-6 py-10">
      <h2 className="text-balance text-center font-serif text-2xl font-medium leading-snug text-mesa-cream sm:text-3xl">
        {prompt}
      </h2>
      <div className="flex flex-col gap-3">
        {options.map((option, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onAnswer(i)}
            className="rounded-2xl border border-mesa-cream/20 bg-mesa-maroon-deep/40 px-5 py-4 text-left font-sans text-[15px] leading-snug text-mesa-cream transition-colors duration-150 ease-out hover:border-mesa-gold/50 hover:bg-mesa-maroon-deep/70 active:scale-[0.98]"
          >
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}
