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
    <div className="mt-6 space-y-4">
      {answer && (
        <div className="rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 p-4 text-white shadow-md">
          <p className="text-sm font-medium uppercase tracking-wide opacity-80">
            Answer
          </p>
          <p className="mt-1 text-2xl font-bold">{answer}</p>
        </div>
      )}

      {steps.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-blue-700">
            Step-by-Step
          </p>
          <ol className="list-inside list-decimal space-y-1.5 text-sm text-gray-700">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {learnIt && (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-amber-700">
            Learn It
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{learnIt}</p>
        </div>
      )}
    </div>
  );
}
