export function ProgressDots({ total, current }: { total: number; current: number }) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Pregunta ${current + 1} de ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ease-out ${
            i === current
              ? "w-6 bg-mesa-gold"
              : i < current
                ? "w-1.5 bg-mesa-gold/60"
                : "w-1.5 bg-mesa-cream/25"
          }`}
        />
      ))}
    </div>
  );
}
