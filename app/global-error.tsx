"use client";

import { useEffect, useState, useCallback, useRef } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [displayText, setDisplayText] = useState("Try Again");
  const intervalRef = useRef<NodeJS.Timeout>(null);

  const clearScrambleInterval = useCallback(() => {
    if (!intervalRef.current) return;
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  // Simple text scramble effect
  const scrambleText = useCallback(() => {
    const targetText = "Try Again";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const steps = 15;
    const intervalMs = 40;
    const startedAt = performance.now();

    clearScrambleInterval();

    intervalRef.current = setInterval(() => {
      const step = Math.min(
        steps + 1,
        Math.floor((performance.now() - startedAt) / intervalMs),
      );
      let scrambled = "";
      const progress = step / steps;

      for (let i = 0; i < targetText.length; i++) {
        if (targetText[i] === " ") {
          scrambled += " ";
        } else if (progress * targetText.length > i) {
          scrambled += targetText[i];
        } else {
          scrambled += chars[Math.floor(Math.random() * chars.length)];
        }
      }

      setDisplayText(scrambled);

      if (step > steps) {
        clearScrambleInterval();
        setDisplayText(targetText);
      }
    }, intervalMs);
  }, [clearScrambleInterval]);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
    scrambleText();
  }, [scrambleText]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    clearScrambleInterval();
    setDisplayText("Try Again");
  }, [clearScrambleInterval]);

  useEffect(() => {
    return () => {
      clearScrambleInterval();
    };
  }, [clearScrambleInterval]);

  return (
    <html lang="en">
      <head>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(32px, 32px); }
          }
          .animate-fade-in {
            animation: fadeIn 0.8s ease-out forwards;
          }
          .animate-fade-in-delay-1 {
            animation: fadeIn 0.8s ease-out 0.2s forwards;
            opacity: 0;
          }
          .animate-fade-in-delay-2 {
            animation: fadeIn 0.8s ease-out 0.4s forwards;
            opacity: 0;
          }
          .animate-pulse-slow {
            animation: pulse 2s ease-in-out infinite;
          }
          .grid-pattern {
            background-image:
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
            background-size: 32px 32px;
            animation: gridMove 8s linear infinite;
          }
        `}</style>
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          fontFamily:
            "Syne, ui-sans-serif, system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid Pattern Background */}
        <div
          className="grid-pattern"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
          }}
        />

        {/* Radial Gradient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "radial-gradient(ellipse at center, transparent 0%, #0a0a0a 70%)",
          }}
        />

        <div
          style={{
            textAlign: "center",
            maxWidth: "42rem",
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Error Title */}
          <div className="animate-fade-in">
            <h1
              style={{
                fontSize: "clamp(6rem, 20vw, 12rem)",
                fontWeight: 100,
                color: "white",
                lineHeight: 0.85,
                letterSpacing: "-0.02em",
                margin: 0,
                userSelect: "none",
              }}
            >
              <span>Oo</span>
              <span
                className="animate-pulse-slow"
                style={{ color: "#f97316", display: "inline-block" }}
              >
                p
              </span>
              <span>s</span>
            </h1>
          </div>

          {/* Message */}
          <p
            className="animate-fade-in-delay-1"
            style={{
              color: "rgba(156, 163, 175, 1)",
              fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
              marginTop: "2rem",
              marginBottom: "3rem",
              fontWeight: 300,
              letterSpacing: "0.025em",
            }}
          >
            Something went wrong. We&apos;re working on it.
          </p>

          {/* Error Digest (if available) */}
          {error.digest && (
            <p
              className="animate-fade-in-delay-1"
              style={{
                color: "rgba(107, 114, 128, 0.6)",
                fontSize: "0.75rem",
                marginBottom: "2rem",
                fontFamily: "monospace",
                letterSpacing: "0.05em",
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          {/* Retry Button */}
          <div className="animate-fade-in-delay-2">
            <button
              onClick={() => reset()}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              style={{
                background: "transparent",
                border: "none",
                borderBottom: `1px solid ${isHovered ? "#f97316" : "rgba(107, 114, 128, 0.5)"}`,
                color: "white",
                fontWeight: 300,
                fontSize: "0.875rem",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                paddingBottom: "0.25rem",
                cursor: "pointer",
                transition: "border-color 0.3s ease",
                fontFamily: "inherit",
              }}
            >
              {displayText}
            </button>
          </div>

          {/* Decorative line */}
          <div
            className="animate-fade-in-delay-2"
            style={{
              marginTop: "4rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                height: "1px",
                width: "4rem",
                backgroundColor: "rgba(107, 114, 128, 0.3)",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                color: "rgba(107, 114, 128, 0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.3em",
              }}
            >
              Error
            </span>
            <div
              style={{
                height: "1px",
                width: "4rem",
                backgroundColor: "rgba(107, 114, 128, 0.3)",
              }}
            />
          </div>
        </div>
      </body>
    </html>
  );
}
