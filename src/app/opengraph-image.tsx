import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "MathBuddy — Your Friendly Math Helper";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: 700 }}>MathBuddy</div>
        <div style={{ fontSize: 32, marginTop: 16, opacity: 0.9 }}>
          Your Friendly Math Helper
        </div>
        <div
          style={{
            fontSize: 24,
            marginTop: 32,
            opacity: 0.75,
            textAlign: "center",
            maxWidth: 800,
          }}
        >
          Solve arithmetic, word problems, and image-based math with
          step-by-step explanations
        </div>
      </div>
    ),
    { ...size }
  );
}
