"use client";

interface SolutionDisplayProps {
  answer: string;
  steps: string[];
  learnIt: string;
}

export default function SolutionDisplay({
  answer,
  steps,
  learnIt,
}: SolutionDisplayProps) {
  if (!answer && steps.length === 0 && !learnIt) return null;

  return (
    <div className="mt-6 space-y-3">
      {answer && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg">
          <div className="rounded-[15px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-white/70">
              Answer
            </p>
            <p className="mt-1.5 text-2xl font-extrabold tracking-tight text-white">
              {answer}
            </p>
          </div>
        </div>
      )}

      {steps.length > 0 && (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-500 text-xs font-bold text-white">
              #
            </div>
            <p className="text-sm font-bold text-indigo-700">Step-by-Step</p>
          </div>
          <ol className="space-y-2.5">
            {steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm leading-relaxed text-gray-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                  {i + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {learnIt && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500 text-xs font-bold text-white">
              💡
            </div>
            <p className="text-sm font-bold text-amber-700">Learn It</p>
          </div>
          <p className="text-sm leading-relaxed text-gray-700">{learnIt}</p>
        </div>
      )}
    </div>
  );
}
