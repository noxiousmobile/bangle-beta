"use client";
import { useState, useEffect, useId } from "react";
import { X } from "lucide-react";
import { AddSection } from "@/components/add-section";
import type { Note } from "@/lib/data";

interface CircularAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNoteSaved: (note: Note) => void;
  notes: Note[];
}

function AnimatedSparkles() {
  const id = useId();
  return (
    <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
      {/* Sparkle SVG with animated gradient */}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="relative w-10 h-10 overflow-visible"
        style={{
          animation: "sparkle-pulse 2.5s ease-in-out infinite",
          overflow: "visible",
        }}
      >
        <defs>
          <linearGradient id={`${id}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#f59e42" }}>
              <animate
                attributeName="stop-color"
                values="#f59e42;#e879a8;#a78bfa;#38bdf8;#f59e42"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="50%" style={{ stopColor: "#a78bfa" }}>
              <animate
                attributeName="stop-color"
                values="#a78bfa;#38bdf8;#f59e42;#e879a8;#a78bfa"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" style={{ stopColor: "#38bdf8" }}>
              <animate
                attributeName="stop-color"
                values="#38bdf8;#f59e42;#e879a8;#a78bfa;#38bdf8"
                dur="3s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
        </defs>
        {/* Main 4-point sparkle */}
        <path
          d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z"
          fill={`url(#${id}-grad)`}
          style={{ animation: "sparkle-pulse 2.5s ease-in-out infinite" }}
        />
        {/* Small top-right sparkle */}
        <path
          d="M19 2L19.5 4L21.5 4.5L19.5 5L19 7L18.5 5L16.5 4.5L18.5 4L19 2Z"
          fill={`url(#${id}-grad)`}
          style={{
            animation: "sparkle-pulse 2.5s ease-in-out 0.8s infinite",
            opacity: 0.85,
          }}
        />
        {/* Small bottom-right sparkle */}
        <path
          d="M20 15L20.4 16.5L22 17L20.4 17.5L20 19L19.6 17.5L18 17L19.6 16.5L20 15Z"
          fill={`url(#${id}-grad)`}
          style={{
            animation: "sparkle-pulse 2.5s ease-in-out 1.6s infinite",
            opacity: 0.7,
          }}
        />
      </svg>
    </div>
  );
}

export function CircularAddModal({
  isOpen,
  onClose,
  onNoteSaved,
  notes,
}: CircularAddModalProps) {
  const [hasStartedEditing, setHasStartedEditing] = useState(false);
  const [initialContent, setInitialContent] = useState<{
    content: string;
    type: "url" | "text" | "image";
  } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setHasStartedEditing(false);
      setInitialContent(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || hasStartedEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore special keys
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (
        e.key === "Enter" ||
        e.key === "Tab" ||
        e.key === "Shift" ||
        e.key === "Control" ||
        e.key === "Alt" ||
        e.key === "Meta" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowRight"
      ) {
        return;
      }

      // User started typing - morph to editor
      setHasStartedEditing(true);
      // Pass the typed character as initial text
      if (e.key.length === 1) {
        setInitialContent({ content: e.key, type: "text" });
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const pastedText = e.clipboardData?.getData("text") || "";
      if (pastedText) {
        setHasStartedEditing(true);
        // Detect if it's a URL
        const isUrl =
          /^https?:\/\//i.test(pastedText) || /^www\./i.test(pastedText);
        setInitialContent({
          content: pastedText,
          type: isUrl ? "url" : "text",
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("paste", handlePaste);
    };
  }, [isOpen, hasStartedEditing, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-background/25 backdrop-blur-[2px] z-50"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        {!hasStartedEditing ? (
          <div
            className="relative w-[450px] h-[450px] rounded-full bg-card shadow-2xl pointer-events-auto flex flex-col items-center justify-center p-12 border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatedSparkles />
            <p className="text-base text-muted-foreground text-center">
              Start typing or paste anything...
            </p>
          </div>
        ) : (
          <div
            className="relative w-full max-w-5xl max-h-[90vh] rounded-xl bg-card shadow-2xl pointer-events-auto flex flex-col overflow-hidden border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-border flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-foreground">Add New</h3>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <AddSection
                expanded={false}
                toggleExpanded={() => {}}
                isAnimating={false}
                handleSwipe={() => {}}
                onNoteSaved={(note) => {
                  onNoteSaved(note);
                  onClose();
                }}
                notes={notes}
                className="h-full"
                initialContent={initialContent}
                onDismiss={onClose}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}
