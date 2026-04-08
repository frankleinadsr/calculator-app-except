import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { checkRateLimit } from "@/lib/rateLimiter";
import { getClientIp } from "@/lib/getClientIp";
import { SolveImageResponse } from "@/types/Problem";

const ALLOWED_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(req);
  const { allowed } = checkRateLimit("solve-image", ip, 10, 60_000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      {
        error:
          "Image is required. Accepted formats: PNG, JPG, JPEG, WebP. Max size: 5MB.",
      },
      { status: 400 }
    );
  }

  const file = formData.get("image");
  if (!file || !(file instanceof File)) {
    return NextResponse.json(
      {
        error:
          "Image is required. Accepted formats: PNG, JPG, JPEG, WebP. Max size: 5MB.",
      },
      { status: 400 }
    );
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json(
      {
        error:
          "Image is required. Accepted formats: PNG, JPG, JPEG, WebP. Max size: 5MB.",
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      {
        error:
          "Image is required. Accepted formats: PNG, JPG, JPEG, WebP. Max size: 5MB.",
      },
      { status: 400 }
    );
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Failed to process image. Please try again." },
      { status: 500 }
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are MathBuddy, a friendly math tutor. Look at the image, identify the math problem, solve it, and return a JSON object with:
- "detectedProblem": the math problem you read from the image as text
- "answer": the final numerical or text answer
- "steps": an array of strings, each a numbered step showing how to solve the problem with math written out
- "learnIt": a brief explanation of the math concept(s) and a general method the user can apply to similar problems, written at a middle-school reading level
- "mathConcepts": an array of math concept names involved

If you cannot find a math problem in the image, return:
{"detectedProblem": "", "answer": "", "steps": [], "learnIt": "Could not find a math problem in this image. Please try a clearer photo.", "mathConcepts": []}

Use simple, friendly, encouraging language. Return ONLY valid JSON, no markdown fences.`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: dataUrl, detail: "high" },
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    const parsed = JSON.parse(text) as SolveImageResponse;

    const result: SolveImageResponse = {
      answer: String(parsed.answer ?? ""),
      steps: Array.isArray(parsed.steps) ? parsed.steps.map(String) : [],
      learnIt: String(parsed.learnIt ?? ""),
      mathConcepts: Array.isArray(parsed.mathConcepts)
        ? parsed.mathConcepts.map(String)
        : [],
      detectedProblem: String(parsed.detectedProblem ?? ""),
    };

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to process image. Please try again." },
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
