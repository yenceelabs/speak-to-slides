"use client";

import { useState, useRef } from "react";

export default function HomePage() {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    title: string;
    slideCount: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate deck");
      }

      setResult({ url: data.url, title: data.title, slideCount: data.slideCount });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    if (
      typeof window === "undefined" ||
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      setError("Voice input is not supported in this browser. Try Chrome.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    const SpeechRecognition = w.webkitSpeechRecognition || w.SpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join("");
      setPrompt(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice recognition failed. Please try again.");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const examples = [
    "Why AI is transforming healthcare in 2024",
    "Startup pitch deck for a food delivery app",
    "The future of remote work and its challenges",
    "10 reasons to invest in renewable energy",
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-8 pb-32">
        {/* Logo / Brand */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-xl">
            🎤
          </div>
          <span className="text-xl font-bold text-slate-100">SpeakToSlides</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-extrabold text-center leading-tight mb-4">
          <span className="text-slate-100">Speak.</span>{" "}
          <span className="text-indigo-400">Slide.</span>{" "}
          <span className="text-slate-100">Share.</span>
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 text-center max-w-xl mb-12">
          Describe your presentation in text or voice. AI builds a beautiful
          deck instantly. Shareable link, no apps needed.
        </p>

        {/* Chat Input */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex gap-2 bg-slate-900 border border-slate-700 rounded-2xl p-2 focus-within:border-indigo-500 transition-colors">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Describe your presentation... e.g. 'Build a deck on why AI is transforming healthcare'"
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none text-base leading-relaxed px-3 py-2 min-h-[60px] max-h-40"
                rows={2}
                disabled={isLoading}
              />
              <div className="flex flex-col gap-2 justify-end">
                {/* Mic button */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-2.5 rounded-xl transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  🎤
                </button>
                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isLoading ? "⏳" : "→"}
                </button>
              </div>
            </div>
          </form>

          {/* Voice status */}
          {isListening && (
            <p className="text-center text-red-400 text-sm mt-2 animate-pulse">
              🔴 Listening... Speak your presentation topic
            </p>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-2xl px-6 py-4">
                <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-slate-300">Building your deck...</span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-4 bg-red-950 border border-red-800 rounded-xl text-red-300 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Success */}
          {result && (
            <div className="mt-6 p-5 bg-slate-900 border border-indigo-700 rounded-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-indigo-400 font-semibold text-sm mb-1">
                    ✅ Your deck is ready!
                  </p>
                  <p className="text-slate-100 font-bold text-lg mb-1">
                    {result.title}
                  </p>
                  <p className="text-slate-400 text-sm">
                    {result.slideCount} slides
                  </p>
                </div>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Open Deck →
                </a>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-800">
                <p className="text-slate-500 text-xs break-all">{result.url}</p>
              </div>
            </div>
          )}

          {/* Example prompts */}
          {!result && !isLoading && (
            <div className="mt-8">
              <p className="text-slate-500 text-sm text-center mb-3">
                Try one of these:
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {examples.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => setPrompt(ex)}
                    className="text-sm bg-slate-900 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 px-3 py-1.5 rounded-full transition-colors"
                  >
                    {ex}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 py-16 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything you need to present
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: "⚡",
              title: "Instant generation",
              desc: "From prompt to shareable deck in under 15 seconds. No waiting, no exports.",
            },
            {
              icon: "🗣️",
              title: "Conversational builder",
              desc: "AI asks you 1–2 questions, proposes a structure, then builds. Not a blind generator.",
            },
            {
              icon: "🎨",
              title: "3 beautiful themes",
              desc: "Modern (dark navy), Minimal (light), and Bold (amber). All with fullscreen + keyboard nav.",
            },
            {
              icon: "✏️",
              title: "Surgical editing",
              desc: "Change a slide with a message — only that slide updates. Same permanent link.",
            },
            {
              icon: "🖼️",
              title: "Add your own images",
              desc: "Drag & drop images onto any slide from the web, or send a photo via the Telegram bot.",
            },
            {
              icon: "📱",
              title: "Telegram-native",
              desc: "Build full decks from your phone via @SpeakToSlides_bot. Voice notes welcome.",
            },
            {
              icon: "🔗",
              title: "Permanent shareable link",
              desc: "One link works on any screen — laptop, TV, phone. No app install needed.",
            },
            {
              icon: "🌐",
              title: "No sign-up needed",
              desc: "First deck is free with no account. Sign in to create unlimited decks.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >
              <div className="text-2xl mb-3">{icon}</div>
              <h3 className="font-semibold text-slate-100 mb-1">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>
          Built by{" "}
          <a
            href="https://yenceelabs.com"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Yencee Labs
          </a>{" "}
          · SpeakToSlides
        </p>
      </footer>
    </main>
  );
}
