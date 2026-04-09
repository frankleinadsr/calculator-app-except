"use client";

import { useState, useCallback } from "react";
import Calculator from "@/components/Calculator";
import TextSolver from "@/components/TextSolver";
import ImageSolver from "@/components/ImageSolver";
import History from "@/components/History";

type Tab = "calculator" | "text" | "image";

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: "calculator", label: "Calculator", icon: "🔢" },
  { key: "text", label: "Word Problem", icon: "📝" },
  { key: "image", label: "Photo Math", icon: "📸" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [historyKey, setHistoryKey] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  const refreshHistory = useCallback(() => {
    setHistoryKey((k) => k + 1);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="glass-card border-b border-white/60 px-4 py-4 shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="animated-gradient flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-lg shadow-md">
              <span className="font-bold text-white">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900">
                MathBuddy
              </h1>
              <p className="text-[11px] font-medium tracking-wide text-gray-400">
                Your friendly math helper
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`relative rounded-xl p-2.5 transition-all ${
              showHistory
                ? "bg-indigo-100 text-indigo-600 shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
            }`}
            aria-label="Toggle history"
          >
            <svg
              className="h-5 w-5"
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
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        {showHistory ? (
          <div>
            <button
              onClick={() => setShowHistory(false)}
              className="mb-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-medium text-indigo-500 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back to solver
            </button>
            <History refreshKey={historyKey} onClear={refreshHistory} />
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 flex gap-1.5 rounded-2xl bg-gray-100/80 p-1.5 shadow-inner">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold transition-all ${
                    activeTab === tab.key
                      ? "bg-white text-gray-800 shadow-md ring-1 ring-black/5"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "calculator" && (
              <Calculator onHistoryChange={refreshHistory} />
            )}
            {activeTab === "text" && (
              <TextSolver onHistoryChange={refreshHistory} />
            )}
            {activeTab === "image" && (
              <ImageSolver onHistoryChange={refreshHistory} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/60 px-4 py-3 text-center text-xs font-medium text-gray-400">
        MathBuddy — Learn math, one problem at a time
      </footer>
    </div>
  );
}
