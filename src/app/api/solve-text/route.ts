import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getClientIp } from "@/lib/getClientIp";
import { stripHtmlTags } from "@/lib/sanitize";
import { LRUCache } from "@/lib/lruCache";
import { SolveTextResponse } from "@/types/Problem";

const cache = new LRUCache<SolveTextResponse>(500, 60 * 60 * 1000);

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit("solve-text", ip, 20, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: { problem?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Problem text is required and must be 1-2000 characters" },
      { status: 400 }
    );
  }

  const raw = body.problem;
  if (!raw || typeof raw !== "string") {
    return NextResponse.json(
      { error: "Problem text is required and must be 1-2000 characters" },
      { status: 400 }
    );
  }

  const problem = stripHtmlTags(raw).trim();
  if (problem.length === 0 || problem.length > 2000) {
    return NextResponse.json(
      { error: "Problem text is required and must be 1-2000 characters" },
      { status: 400 }
    );
  }

  const cached = cache.get(problem.toLowerCase());
  if (cached) {
    return NextResponse.json(cached);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Failed to solve problem. Please try again." },
      { status: 500 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are MathBuddy, a friendly math tutor. Solve the given math problem and return a JSON object with:
- "answer": the final numerical or text answer
- "steps": an array of strings, each a numbered step showing how to solve the problem with math written out
- "learnIt": a brief explanation of the math concept(s) and a general method the user can apply to similar problems, written at a middle-school reading level
- "mathConcepts": an array of math concept names involved (e.g., ["percentages", "multiplication"])

Use simple, friendly, encouraging language. Return ONLY valid JSON, no markdown fences.`,
        },
        { role: "user", content: problem },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(text) as SolveTextResponse;

    const result: SolveTextResponse = {
      answer: String(parsed.answer ?? ""),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      learnIt: String(parsed.learnIt ?? ""),
      mathConcepts: Array.isArray(parsed.mathConcepts)
        ? parsed.mathConcepts.map(String)
        : [],
    };

    cache.set(problem.toLowerCase(), result);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to solve problem. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
