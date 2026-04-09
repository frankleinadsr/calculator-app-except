"use client";

import { useState, useRef } from "react";
import { addToHistory } from "@/lib/history";
import { ProblemEntry, SolveImageResponse } from "@/types/Problem";
import SolutionDisplay from "./SolutionDisplay";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_SIZE = 5 * 1024 * 1024;

interface ImageSolverProps {
  onHistoryChange: () => void;
}

export default function ImageSolver({ onHistoryChange }: ImageSolverProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [solution, setSolution] = useState<SolveImageResponse | null>(null);
  const [fileName, setFileName] = useState("");
  const [preview, setPreview] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const selectedFile = useRef<File | null>(null);

  function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.has(file.type)) {
      return "Invalid file type. Please upload PNG, JPG, JPEG, or WebP.";
    }
    if (file.size > MAX_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  }

  function handleFileSelect(file: File) {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      selectedFile.current = null;
      setFileName("");
      setPreview("");
      return;
    }
    selectedFile.current = file;
    setFileName(file.name);
    setError("");
    setSolution(null);

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  async function handleSubmit() {
    if (!selectedFile.current) {
      setError("Please select an image first.");
      return;
    }

    setLoading(true);
    setError("");
    setSolution(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile.current);

      const res = await fetch("/api/solve-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }

      const sol = data as SolveImageResponse;
      setSolution(sol);

      const entry: ProblemEntry = {
        id: crypto.randomUUID(),
        type: "image",
        input: "[Image Upload]",
        answer: sol.answer,
        steps: sol.steps,
        learnIt: sol.learnIt,
        createdAt: new Date().toISOString(),
      };
      addToHistory(entry);
      onHistoryChange();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white p-8 shadow-sm transition-all hover:border-indigo-400 hover:bg-indigo-50/50 hover:shadow-md"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="max-h-48 rounded-lg object-contain"
          />
        ) : (
          <>
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-sm font-medium text-gray-600">
              Drop an image here or click to browse
            </p>
            <p className="mt-1 text-xs text-gray-400">
              PNG, JPG, JPEG, or WebP — max 5MB
            </p>
          </>
        )}
      </div>

      {fileName && (
        <p className="mt-2 text-center text-xs text-gray-500">{fileName}</p>
      )}
      {error && (
        <p className="mt-2 text-center text-xs text-red-500">{error}</p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading || !selectedFile.current}
        className="mt-3 w-full rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:from-indigo-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
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
            Analyzing...
          </span>
        ) : (
          "Solve It!"
        )}
      </button>

      {solution && solution.detectedProblem && (
        <div className="mt-4 rounded-2xl border border-gray-100 bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Detected Problem</p>
          <p className="mt-1 text-sm text-gray-700">
            {solution.detectedProblem}
          </p>
        </div>
      )}

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
