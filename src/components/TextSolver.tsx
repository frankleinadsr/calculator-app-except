"use client";

import { useState, useRef } from "react";
import { stripHtmlTags } from "@/lib/sanitize";
import { addToHistory } from "@/lib/history";
import { ProblemEntry, SolveTextResponse } from "@/types/Problem";
import SolutionDisplay from "./SolutionDisplay";

interface TextSolverProps {
  onHistoryChange: () => void;
}

export default function TextSolver({ onHistoryChange }: TextSolverProps) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solution, setSolution] = useState<SolveTextResponse | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit() {
    const sanitized = stripHtmlTags(input).trim();

    if (!sanitized) {
      setError("Please enter a math problem to solve.");
      return;
    }
    if (sanitized.length > 2000) {
      setError("Maximum 2000 characters allowed.");
      return;
    }

    setLoading(true);
    setError("");
    setSolution(null);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/solve-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: sanitized }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const sol = data as SolveTextResponse;
      setSolution(sol);

      const entry: ProblemEntry = {
        id: crypto.randomUUID(),
        type: "text",
        input: sanitized,
        answer: sol.answer,
        steps: sol.steps,
        learnIt: sol.learnIt,
        createdAt: new Date().toISOString(),
      };
      addToHistory(entry);
      onHistoryChange();
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <textarea
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError("");
        }}
        placeholder="Type a math problem in plain English&#10;&#10;Examples:&#10;• What is 15% of 200?&#10;• If I split a $87.50 bill among 5 people, how much does each pay?&#10;• What's 18% tip on a $47.50 bill?"
        className="w-full resize-none rounded-2xl border border-gray-200 bg-white p-4 text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
        rows={5}
        maxLength={2000}
      />
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">
          {input.length}/2000 characters
        </span>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-3 w-full rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Solving...
          </span>
        ) : (
          "Solve It!"
        )}
      </button>

      {solution && (
        <SolutionDisplay
          answer={solution.answer}
          steps={solution.steps}
          learnIt={solution.learnIt}
        />
      )}
    </div>
  );
}
