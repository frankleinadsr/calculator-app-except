"use client";

import { useState, useEffect, useCallback } from "react";
import { evaluate } from "mathjs";
import { isValidExpression, sanitizeExpression } from "@/lib/sanitize";
import { addToHistory } from "@/lib/history";
import { ProblemEntry } from "@/types/Problem";

interface CalculatorProps {
  onHistoryChange: () => void;
}

const BUTTONS = [
  ["(", ")", "%", "C"],
  ["7", "8", "9", "÷"],
  ["4", "5", "6", "×"],
  ["1", "2", "3", "−"],
  ["0", ".", "=", "+"],
];

export default function Calculator({ onHistoryChange }: CalculatorProps) {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const handleClear = useCallback(() => {
    setExpression("");
    setResult("");
    setError("");
  }, []);

  const handleEvaluate = useCallback(() => {
    if (!expression.trim()) return;

    if (!isValidExpression(expression)) {
      setError("Invalid expression. Please check your input.");
      setResult("");
      return;
    }

    try {
      const sanitized = sanitizeExpression(expression);
      const evalResult = evaluate(sanitized);

      if (
        evalResult === Infinity ||
        evalResult === -Infinity ||
        Number.isNaN(evalResult)
      ) {
        setError("Cannot divide by zero");
        setResult("");
        return;
      }

      const resultStr = String(evalResult);
      setResult(resultStr);
      setError("");

      const entry: ProblemEntry = {
        id: crypto.randomUUID(),
        type: "calculator",
        input: expression,
        answer: resultStr,
        steps: [],
        learnIt: "",
        createdAt: new Date().toISOString(),
      };
      addToHistory(entry);
      onHistoryChange();
    } catch {
      setError("Invalid expression. Please check your input.");
      setResult("");
    }
  }, [expression, onHistoryChange]);

  const handleButton = useCallback(
    (label: string) => {
      if (label === "C") {
        handleClear();
      } else if (label === "=") {
        handleEvaluate();
      } else {
        setExpression((prev) => prev + label);
        setError("");
      }
    },
    [handleClear, handleEvaluate]
  );

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const key = e.key;
      if (/^[0-9+\-*/.%()]$/.test(key)) {
        setExpression((prev) => prev + key);
        setError("");
      } else if (key === "Enter") {
        e.preventDefault();
        handleEvaluate();
      } else if (key === "Backspace") {
        setExpression((prev) => prev.slice(0, -1));
        setError("");
      } else if (key === "Escape") {
        handleClear();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleEvaluate, handleClear]);

  return (
    <div className="mx-auto w-full max-w-sm">
      {/* Display */}
      <div className="mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-5 shadow-lg">
        <p className="min-h-[1.5rem] text-right text-sm font-medium tracking-wide text-gray-400 break-all">
          {expression || "\u00A0"}
        </p>
        {result && (
          <p className="mt-2 text-right text-4xl font-extrabold tracking-tight text-white">
            {result}
          </p>
        )}
        {error && (
          <p className="mt-2 text-right text-sm font-medium text-red-400">
            {error}
          </p>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2.5">
        {BUTTONS.flat().map((label) => {
          const isOperator = ["÷", "×", "−", "+", "%"].includes(label);
          const isEquals = label === "=";
          const isClear = label === "C";

          let className =
            "calc-btn flex h-[56px] items-center justify-center rounded-2xl text-lg font-semibold shadow-sm ";

          if (isEquals) {
            className +=
              "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-purple-700";
          } else if (isClear) {
            className +=
              "bg-red-50 text-red-500 ring-1 ring-red-100 hover:bg-red-100";
          } else if (isOperator) {
            className +=
              "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 hover:bg-indigo-100";
          } else {
            className +=
              "bg-white text-gray-800 ring-1 ring-gray-200 hover:bg-gray-50";
          }

          return (
            <button
              key={label}
              onClick={() => handleButton(label)}
              className={className}
            >
              {label}
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs font-medium text-gray-400">
        Tip: Use your keyboard to type expressions
      </p>
    </div>
  );
}
