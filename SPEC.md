# MathBuddy — Product Spec

## Overview
MathBuddy is a playful, minimal calculator web app that goes beyond basic arithmetic. Users can type math expressions, paste word problems, or upload images of problems — and get step-by-step solutions with clear explanations of the math involved. It's designed to help students and everyday people not just get answers, but understand *how* to solve problems themselves.

## Target User
Students (middle school through college), parents helping with homework, and everyday adults who encounter math in daily life (splitting bills, calculating tips, understanding loan interest, unit conversions). The core problem: they need an answer AND they need to understand the method so they can do it next time.

## Core Features

1. **Standard Calculator**
   - A fully functional calculator with buttons for digits 0-9, operators (+, −, ×, ÷), decimal point, parentheses, percent, clear, and equals
   - Supports order of operations (PEMDAS)
   - Displays the expression being built and the result
   - Keyboard input supported (typing numbers and operators directly)

2. **Text Problem Solver**
   - A text input area where users can type or paste a word problem or everyday math scenario in plain English
   - Examples: "If I have 3 pizzas with 8 slices each and 7 people, how many slices does each person get?", "What's 18% tip on a $47.50 bill?"
   - Sends the text to an AI model (OpenAI GPT-4o via API route) to parse, solve, and explain
   - Returns: the final numerical answer, the step-by-step solution, and a "How to solve this yourself" section

3. **Image Problem Solver**
   - Users can upload an image (photo of a textbook problem, handwritten math, whiteboard, etc.)
   - Accepted formats: PNG, JPG, JPEG, WebP — max 5MB
   - Image is sent to OpenAI GPT-4o vision endpoint via API route
   - Returns the same structured response: answer, steps, and learning explanation

4. **Step-by-Step Explanations**
   - Every AI-solved problem returns three sections:
     - **Answer**: The final result, clearly highlighted
     - **Step-by-Step**: Numbered steps showing how the problem was solved, with the math written out
     - **Learn It**: A brief explanation of the mathematical concept(s) involved and a general method the user can apply to similar problems
   - Explanations use simple, friendly language appropriate for a middle-school reading level

5. **Problem History**
   - Last 50 problems are stored locally (localStorage) so users can revisit solutions
   - Each history entry shows: input (text or "Image upload"), timestamp, and the answer
   - Clicking a history entry shows the full solution again
   - Clear history button available

## Data Model

This app uses **no Supabase database tables for v1**. All data is stored client-side in localStorage. Authentication is not required.

### localStorage Schema

**problemHistory** (JSON array in localStorage)
```
{
  id: string (UUID),
  type: "calculator" | "text" | "image",
  input: string (the expression, text prompt, or "[Image Upload]"),
  answer: string,
  steps: string[] (array of step strings),
  learnIt: string,
  createdAt: string (ISO 8601 timestamp)
}
```

Since there are no Supabase tables, no RLS policies or indexes are needed for v1.

## Supabase RLS Policies

No Supabase tables exist in v1. If tables are added in a future version, RLS must be enabled on every table before deployment. For v1, Supabase is not used for data storage — only the anon key exists in the environment for potential future use.

## API Routes

### 1. POST /api/solve-text
- **Auth required**: No
- **Rate limit**: 20 requests per minute per IP
- **Request body**:
  ```json
  {
    "problem": "string (1-2000 characters, required)"
  }
  ```
- **Response 200**:
  ```json
  {
    "answer": "string",
    "steps": ["string"],
    "learnIt": "string",
    "mathConcepts": ["string"]
  }
  ```
- **Error 400**: `{ "error": "Problem text is required and must be 1-2000 characters" }`
- **Error 429**: `{ "error": "Too many requests. Please wait a moment." }`
- **Error 500**: `{ "error": "Failed to solve problem. Please try again." }`

### 2. POST /api/solve-image
- **Auth required**: No
- **Rate limit**: 10 requests per minute per IP
- **Request body**: `multipart/form-data` with field `image` (PNG/JPG/JPEG/WebP, max 5MB)
- **Response 200**:
  ```json
  {
    "answer": "string",
    "steps": ["string"],
    "learnIt": "string",
    "mathConcepts": ["string"],
    "detectedProblem": "string (the text the AI read from the image)"
  }
  ```
- **Error 400**: `{ "error": "Image is required. Accepted formats: PNG, JPG, JPEG, WebP. Max size: 5MB." }`
- **Error 429**: `{ "error": "Too many requests. Please wait a moment." }`
- **Error 500**: `{ "error": "Failed to process image. Please try again." }`

### 3. POST /api/calculate
- **Auth required**: No
- **Rate limit**: 60 requests per minute per IP
- **Request body**:
  ```json
  {
    "expression": "string (1-500 characters, required)"
  }
  ```
- **Response 200**:
  ```json
  {
    "result": "number | string",
    "formattedExpression": "string"
  }
  ```
- **Error 400**: `{ "error": "Invalid mathematical expression" }`
- **Error 429**: `{ "error": "Too many requests. Please wait a moment." }`

Note: The calculator should evaluate expressions client-side using a safe math parser (e.g., mathjs). The API route exists as a fallback for complex expressions only.

## Scale Requirements

1. **OpenAI API calls (solve-text, solve-image)**: These are the bottleneck. Cache identical text problems for 1 hour using an in-memory LRU cache (max 500 entries) on the server. Image problems are not cached (too variable).

2. **Rate limiting**: Implement per-IP rate limiting using an in-memory store (Map with TTL cleanup). This is sufficient for v1 single-instance deployment.

3. **Image uploads**: Process in-memory, do not persist to disk or cloud storage. Convert to base64 for the OpenAI API call. Enforce 5MB limit at the middleware level before processing.

4. **No real-time features**: No WebSocket or subscription connections needed.

5. **Client-side calculation**: The standard calculator must evaluate expressions entirely client-side using mathjs — never call the API for basic arithmetic.

## Acceptance Criteria

1. **Calculator renders and works**: Landing page shows a calculator UI with digit buttons (0-9), operator buttons (+, −, ×, ÷), equals, clear, decimal, parentheses, and percent. Clicking "7", "+", "3", "=" displays "10".

2. **Calculator respects PEMDAS**: Entering "2 + 3 × 4" and pressing equals displays "14" (not "20").

3. **Calculator handles decimals**: Entering "10.5 + 4.3" and pressing equals displays "14.8".

4. **Calculator handles errors**: Entering "5 ÷ 0" displays an error message (not "Infinity" or a crash). Entering ")3+(" displays an error message.

5. **Text problem tab exists**: There is a clearly labeled tab or button to switch to text problem input mode. The text input area is visible after switching.

6. **Text problem returns solution**: Typing "What is 15% of 200?" and submitting returns an answer of "30", at least 2 steps, and a non-empty "Learn It" section.

7. **Text problem shows loading state**: After submitting a text problem, a loading indicator is visible until the response arrives.

8. **Text problem shows error on empty submit**: Submitting an empty text input shows a validation error without making an API call.

9. **Image upload tab exists**: There is a clearly labeled tab or button to switch to image upload mode. A file upload area (drag-and-drop or click-to-browse) is visible.

10. **Image upload accepts valid formats**: Uploading a PNG image of a math problem returns a structured solution with answer, steps, and learn-it sections.

11. **Image upload rejects invalid files**: Uploading a .txt file or a 10MB image shows a clear error message without making an API call.

12. **Step-by-step display**: Every AI-solved problem displays three distinct sections: Answer (visually highlighted), Step-by-Step (numbered list), and Learn It (explanatory paragraph).

13. **Problem history saves**: After solving 3 problems (any combination of calculator, text, image), the history panel shows 3 entries with timestamps and answers.

14. **History entry expands**: Clicking a history entry for a text/image problem displays the full solution (answer, steps, learn-it) again.

15. **History clears**: Clicking "Clear History" removes all entries. Refreshing the page confirms they are gone.

16. **Keyboard input works**: With the calculator active, pressing keyboard keys "5", "+", "5", "Enter" produces "10".

17. **Mobile responsive**: At 375px viewport width, all three modes (calculator, text, image) are fully usable — no horizontal scroll, no overlapping elements, all buttons tappable.

18. **Desktop layout**: At 1280px viewport width, the layout uses space well — the calculator is not stretched absurdly wide, and text areas are comfortably sized.

19. **No console errors**: Opening browser dev tools on any page shows zero console errors during normal usage of all features.

20. **Rate limit feedback**: Sending 25 rapid text problem requests shows a "Too many requests" error message in the UI (not a silent failure or crash).

21. **API key not exposed**: Viewing the page source, JavaScript bundles, and network requests in the browser reveals no OpenAI API key.

22. **Build passes**: `npm run build` completes with zero errors and zero warnings.

## Security Requirements

### Auth Boundaries
- No authentication required for v1 (public app)
- All API routes are public but rate-limited
- OpenAI API key must ONLY exist server-side (in environment variables, used only in API routes)

### Input Validation
- **Text problem input**: Strip HTML tags, limit to 2000 characters, reject empty strings
- **Calculator expression**: Validate against a whitelist of allowed characters (digits, operators, parentheses, decimal points, spaces) — reject everything else
- **Image upload**: Validate MIME type (image/png, image/jpeg, image/webp), validate file size ≤ 5MB, reject all other file types

### Rate Limiting
- `/api/solve-text`: 20 requests/minute/IP
- `/api/solve-image`: 10 requests/minute/IP
- `/api/calculate`: 60 requests/minute/IP

### Secrets Management
- `OPENAI_API_KEY` must never appear in client-side code, browser bundles, or network responses
- Only `NEXT_PUBLIC_` prefixed variables may exist in client code — and `OPENAI_API_KEY` must NOT use this prefix
- No Supabase service role key should exist in this project

### RLS Verification
- No Supabase tables in v1 — not applicable
- If any tables are ever added, RLS must be enabled before deployment

## Edge Cases & Chaos Scenarios

1. **Empty state**: On first visit, problem history is empty. The history panel shows a friendly "No problems solved yet" message — not a blank area or error.

2. **Malicious text input**: Submitting `<script>alert('xss')</script>` as a problem text must not execute JavaScript. The input is sanitized before display and before sending to the API.

3. **Extremely long input**: Pasting 10,000 characters into the text input is rejected with a clear "Maximum 2000 characters" error before any API call is made.

4. **Corrupt/non-math image**: Uploading a photo of a cat returns a graceful message like "Could not find a math problem in this image. Please try a clearer photo."

5. **OpenAI API timeout/failure**: If the OpenAI API is unreachable or returns an error, the UI shows "Something went wrong. Please try again." — not a stack trace or infinite spinner.

6. **Double form submission**: Rapidly clicking "Solve" twice does not send two API requests. The button is disabled and shows a loading state after the first click.

7. **Direct URL access**: Navigating to `/api/solve-text` via GET in the browser returns a 405 Method Not Allowed — not a 500 error or sensitive data.

8. **Slow network**: On a throttled connection (Slow 3G), the loading state remains visible for the entire duration. No timeout occurs before 30 seconds.

9. **localStorage full**: If localStorage is full, the app still functions. Problem solving works — only history saving fails silently (or shows a subtle notice).

10. **Calculator overflow**: Entering `99999999999999999 * 99999999999999999` returns a result (even if in scientific notation) — not a crash or "undefined".

11. **Browser back/forward**: Using browser navigation does not break the app or show stale state.

12. **Concurrent requests**: Opening the app in two tabs and submitting problems simultaneously in both does not cause errors in either tab.

## Out of Scope (v1)

- User accounts and authentication
- Server-side problem history / syncing across devices
- Sharing solutions with others
- Graphing or plotting capabilities
- Step-by-step animation of solutions
- Multi-language support
- LaTeX rendering of math (use plain text and Unicode math symbols)
- Voice input
- PDF upload
- Handwriting recognition beyond what GPT-4o vision provides
- Offline mode / PWA
- Payment or premium tiers

