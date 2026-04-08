import { NextRequest, NextResponse } from "next/server";
import { evaluate } from "mathjs";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getClientIp } from "@/lib/getClientIp";
import { isValidExpression, sanitizeExpression } from "@/lib/sanitize";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit("calculate", ip, 60, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let body: { expression?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid mathematical expression" },
      { status: 400 }
    );
  }

  const raw = body.expression;
  if (!raw || typeof raw !== "string" || raw.length > 500) {
    return NextResponse.json(
      { error: "Invalid mathematical expression" },
      { status: 400 }
    );
  }

  if (!isValidExpression(raw)) {
    return NextResponse.json(
      { error: "Invalid mathematical expression" },
      { status: 400 }
    );
  }

  try {
    const sanitized = sanitizeExpression(raw);
    const result = evaluate(sanitized);

    if (result === Infinity || result === -Infinity || Number.isNaN(result)) {
      return NextResponse.json(
        { error: "Invalid mathematical expression" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      result: typeof result === "number" ? result : String(result),
      formattedExpression: raw,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid mathematical expression" },
      { status: 400 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
