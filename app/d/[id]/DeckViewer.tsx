"use client";

import { useRef, useState, useCallback, useEffect } from "react";

interface Props {
  deckId: string;
  slideCount: number;
  isOwner?: boolean;
}

interface UploadState {
  slideIndex: number;
  status: "idle" | "uploading" | "done" | "error";
  imageUrl?: string;
  error?: string;
}

export default function DeckViewer({ deckId, slideCount, isOwner = false }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState(0);
  const [uploadState, setUploadState] = useState<UploadState>({ slideIndex: 0, status: "idle" });
  const [isDragging, setIsDragging] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Listen for slide changes from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.source !== iframeRef.current?.contentWindow) return;
      if (e.data?.type === "slideChange") {
        setCurrentSlide(e.data.index);
        setSelectedSlide(e.data.index);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  const uploadImage = useCallback(async (file: File, slideIndex: number) => {
    if (!file) return;
    setUploadState({ slideIndex, status: "uploading" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("deckId", deckId);
    formData.append("slideIndex", String(slideIndex));

    try {
      const res = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setUploadState({ slideIndex, status: "error", error: data.error || "Upload failed" });
        return;
      }

      setUploadState({ slideIndex, status: "done", imageUrl: data.imageUrl });

      // Refresh the iframe with updated HTML by reloading from server
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = iframeRef.current.src;
        }
      }, 300);
    } catch {
      setUploadState({ slideIndex, status: "error", error: "Upload failed. Try again." });
    }
  }, [deckId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, selectedSlide);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      uploadImage(file, selectedSlide);
    }
  }, [selectedSlide, uploadImage]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const slideNumbers = Array.from({ length: slideCount }, (_, i) => i);

  return (
    <div style={{ width: "100vw", height: "100vh", display: "flex", flexDirection: "column", background: "#0f172a", overflow: "hidden", position: "relative" }}>
      {/* Deck iframe — fills viewport */}
      <div style={{ flex: 1, position: "relative" }}>
        <iframe
          ref={iframeRef}
          src={`/d/${deckId}/frame`}
          style={{ width: "100%", height: "100%", border: "none", display: "block" }}
          title="Presentation"
          sandbox="allow-scripts allow-pointer-lock allow-presentation allow-popups"
          allowFullScreen
        />
      </div>

      {/* Floating upload button — owner only */}
      {isOwner && (
        <button
          onClick={() => setShowUploadPanel((v) => !v)}
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            zIndex: 200,
            background: showUploadPanel ? "#6366f1" : "rgba(15,23,42,0.85)",
            border: "1px solid #334155",
            color: "#f1f5f9",
            borderRadius: 12,
            padding: "10px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            transition: "all 0.2s",
          }}
          title="Add images to slides"
        >
          🖼️ {showUploadPanel ? "Close" : "Add Image"}
        </button>
      )}

      {/* Upload panel — owner only */}
      {isOwner && showUploadPanel && (
        <div
          style={{
            position: "fixed",
            bottom: 130,
            right: 20,
            zIndex: 200,
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 16,
            padding: 20,
            width: 300,
            boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
          }}
        >
          <h3 style={{ color: "#f1f5f9", fontSize: 15, fontWeight: 700, margin: "0 0 4px" }}>
            Add image to slide
          </h3>
          <p style={{ color: "#94a3b8", fontSize: 12, margin: "0 0 16px" }}>
            The image will appear on the selected slide immediately.
          </p>

          {/* Slide picker */}
          <label style={{ color: "#94a3b8", fontSize: 12, display: "block", marginBottom: 6 }}>
            Slide
          </label>
          <select
            value={selectedSlide}
            onChange={(e) => setSelectedSlide(Number(e.target.value))}
            style={{
              width: "100%",
              background: "#0f172a",
              border: "1px solid #334155",
              color: "#f1f5f9",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
              marginBottom: 14,
              cursor: "pointer",
            }}
          >
            {slideNumbers.map((i) => (
              <option key={i} value={i}>
                Slide {i + 1}{i === currentSlide ? " (current)" : ""}
              </option>
            ))}
          </select>

          {/* Drop zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "#6366f1" : "#334155"}`,
              borderRadius: 12,
              padding: "24px 16px",
              textAlign: "center",
              cursor: "pointer",
              background: isDragging ? "rgba(99,102,241,0.08)" : "#0f172a",
              transition: "all 0.2s",
              marginBottom: 12,
            }}
          >
            {uploadState.status === "uploading" ? (
              <div style={{ color: "#6366f1" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>⏳</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Uploading...</p>
              </div>
            ) : uploadState.status === "done" ? (
              <div style={{ color: "#22c55e" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>✅</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}>Image added to slide {uploadState.slideIndex + 1}!</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>Click to replace</p>
              </div>
            ) : uploadState.status === "error" ? (
              <div style={{ color: "#f87171" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>❌</div>
                <p style={{ margin: 0, fontSize: 13 }}>{uploadState.error}</p>
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "#94a3b8" }}>Click to retry</p>
              </div>
            ) : (
              <div style={{ color: "#94a3b8" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#f1f5f9" }}>
                  Drop image here
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 11 }}>
                  or click to browse · JPEG, PNG, WebP · max 5 MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />

          <p style={{ color: "#64748b", fontSize: 11, margin: 0, textAlign: "center" }}>
            💡 Via Telegram bot: send a photo with caption "slide {"{number}"}
          </p>
        </div>
      )}
    </div>
  );
}
