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
      <div className="mb-4 rounded-2xl bg-gray-900 p-4 text-right shadow-inner">
        <p className="min-h-[1.5rem] text-sm text-gray-400 break-all">
          {expression || "\u00A0"}
        </p>
        {result && (
          <p className="mt-1 text-3xl font-bold text-white">{result}</p>
        )}
        {error && (
          <p className="mt-1 text-sm font-medium text-red-400">{error}</p>
        )}
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-2">
        {BUTTONS.flat().map((label) => {
          const isOperator = ["÷", "×", "−", "+", "%"].includes(label);
          const isEquals = label === "=";
          const isClear = label === "C";

          let className =
            "flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-all active:scale-95 ";

          if (isEquals) {
            className +=
              "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-md hover:shadow-lg";
          } else if (isClear) {
            className += "bg-red-100 text-red-600 hover:bg-red-200";
          } else if (isOperator) {
            className += "bg-blue-100 text-blue-600 hover:bg-blue-200";
          } else {
            className += "bg-gray-100 text-gray-800 hover:bg-gray-200";
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

      <p className="mt-3 text-center text-xs text-gray-400">
        Tip: You can also type with your keyboard!
      </p>
    </div>
  );
}
