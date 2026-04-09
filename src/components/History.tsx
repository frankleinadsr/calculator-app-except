"use client";

import { useState } from "react";
import { ProblemEntry } from "@/types/Problem";
import { getHistory, clearHistory } from "@/lib/history";
import SolutionDisplay from "./SolutionDisplay";

interface HistoryProps {
  refreshKey: number;
  onClear: () => void;
}

export default function History({ refreshKey, onClear }: HistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const history = getHistory();

  // refreshKey forces re-render when history changes
  void refreshKey;

  function handleClear() {
    clearHistory();
    setExpandedId(null);
    onClear();
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function typeLabel(type: ProblemEntry["type"]): string {
    switch (type) {
      case "calculator":
        return "Calc";
      case "text":
        return "Text";
      case "image":
        return "Image";
    }
  }

  function typeBadgeColor(type: ProblemEntry["type"]): string {
    switch (type) {
      case "calculator":
        return "bg-blue-100 text-blue-700";
      case "text":
        return "bg-purple-100 text-purple-700";
      case "image":
        return "bg-amber-100 text-amber-700";
    }
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          className="mb-3 h-10 w-10 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm font-medium text-gray-400">
          No problems solved yet
        </p>
        <p className="mt-1 text-xs text-gray-300">
          Your solved problems will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {history.length} problem{history.length !== 1 ? "s" : ""}
        </p>
        <button
          onClick={handleClear}
          className="rounded-xl px-3 py-1.5 text-xs font-semibold text-red-500 ring-1 ring-red-100 transition-colors hover:bg-red-50"
        >
          Clear History
        </button>
      </div>

      <div className="space-y-2">
        {history.map((entry) => {
          const isExpanded = expandedId === entry.id;
          return (
            <div
              key={entry.id}
              className="rounded-2xl border border-gray-100 bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md"
            >
              <button
                onClick={() =>
                  setExpandedId(isExpanded ? null : entry.id)
                }
                className="flex w-full items-center gap-3 p-3 text-left"
              >
                <span
                  className={`inline-flex shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold ${typeBadgeColor(entry.type)}`}
                >
                  {typeLabel(entry.type)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-gray-700">
                    {entry.input}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatTime(entry.createdAt)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-gray-800">
                  = {entry.answer}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isExpanded && (entry.steps.length > 0 || entry.learnIt) && (
                <div className="border-t border-gray-50 px-3 pb-3">
                  <SolutionDisplay
                    answer={entry.answer}
                    steps={entry.steps}
                    learnIt={entry.learnIt}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
