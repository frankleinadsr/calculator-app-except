import { ProblemEntry } from "@/types/Problem";

const STORAGE_KEY = "problemHistory";
const MAX_ENTRIES = 50;

export function getHistory(): ProblemEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ProblemEntry[];
  } catch {
    return [];
  }
}

export function addToHistory(entry: ProblemEntry): void {
  if (typeof window === "undefined") return;
  try {
    const history = getHistory();
    const updated = [entry, ...history].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // localStorage full — fail silently per spec
  }
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // fail silently
  }
}
