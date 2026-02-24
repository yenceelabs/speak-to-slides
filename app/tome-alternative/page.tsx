import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Tome Alternative 2026 — AI Presentations by Voice | SpeakToSlides",
  description:
    "Looking for a Tome alternative? SpeakToSlides builds AI presentations from voice notes or text. First deck free. No design skills needed. Shareable links instantly.",
  keywords: [
    "tome alternative",
    "tome ai alternative",
    "alternatives to tome",
    "free tome alternative",
    "ai presentation maker",
    "ai presentation tool",
    "speaktoslides",
  ],
  openGraph: {
    title: "Best Tome Alternative — AI Presentations by Voice | SpeakToSlides",
    description:
      "Tome is gone. SpeakToSlides picks up where it left off — AI-powered presentations from voice or text. First deck free.",
    url: "https://speaktoslides.com/tome-alternative",
    siteName: "SpeakToSlides",
    type: "website",
    images: [
      {
        url: "https://speaktoslides.com/api/og?title=Best+Tome+Alternative&subtitle=AI+Presentations+by+Voice+%E2%80%94+First+Deck+Free",
        width: 1200,
        height: 630,
        alt: "SpeakToSlides vs Tome — Best Alternative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Tome Alternative — AI Presentations by Voice",
    description:
      "Tome is gone. SpeakToSlides builds AI presentations from voice or text. First deck free.",
    images: ["https://speaktoslides.com/api/og?title=Best+Tome+Alternative&subtitle=AI+Presentations+by+Voice+%E2%80%94+First+Deck+Free"],
  },
  alternates: {
    canonical: "https://speaktoslides.com/tome-alternative",
  },
};

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-800 pb-6">
      <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
      <p className="text-gray-400 leading-relaxed">{answer}</p>
    </div>
  );
}

export default function TomeAlternativePage() {
  const faqs = [
    {
      question: "Is SpeakToSlides actually free?",
      answer:
        "Yes — your first deck is completely free, no account required. Just type or speak your topic and get a shareable deck link in seconds. For unlimited decks, Pro subscriptions are available.",
    },
    {
      question: "Can I import my old Tome presentations?",
      answer:
        "Tome didn't offer a standard export format, so direct import isn't possible. However, you can paste your notes or outline as a prompt and SpeakToSlides will recreate your presentation with fresh visuals in under a minute.",
    },
    {
      question: "How is this different from Gamma or Beautiful.ai?",
      answer:
        "SpeakToSlides is voice-first — send a voice note via Telegram or use the web mic, and AI builds your deck. No typing required. You can also edit individual slides by chatting ('change slide 3'). Gamma and Beautiful.ai are great tools but they're text-only and template-based.",
    },
    {
      question: "Does the voice input actually work well?",
      answer:
        "Yes — we use OpenAI's Whisper for transcription, which handles accents, background noise, and natural speech patterns. Speak naturally about your topic and the AI will structure it into slides.",
    },
    {
      question: "Can I use SpeakToSlides without the Telegram bot?",
      answer:
        "Absolutely. The web interface at speaktoslides.com works the same way — type or use the mic button. The Telegram bot is an extra convenience for people who live in chat apps.",
    },
    {
      question: "How do I edit a slide after it's generated?",
      answer:
        "Tell the AI what to change in natural language: 'Make slide 2 more concise', 'Add a timeline to slide 4', or 'Change the color scheme to blue'. The AI surgically edits only the slides you mention — no full regeneration.",
    },
    {
      question: "What format are the presentations in?",
      answer:
        "Every deck is rendered as clean HTML with CSS — not PowerPoint or Google Slides. Each deck gets a permanent shareable URL (speaktoslides.com/d/[id]). You can embed it, share the link, or present directly from your browser.",
    },
    {
      question: "Is there a mobile app?",
      answer:
        "Not yet — but the Telegram bot works on any phone. Send a voice note or text message to @SpeakToSlidesBot and get your deck link back instantly. The web app is also mobile-responsive.",
    },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-black/90 backdrop-blur-md border-b border-gray-800/50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-semibold text-white text-sm">
            SpeakToSlides
          </Link>
          <Link
            href="/"
            className="bg-white text-black px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-100 transition"
          >
            Create Free Deck →
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="text-gray-500 text-sm uppercase tracking-widest mb-4">
          Tome Alternative
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          Tome is gone.<br />
          Your presentations<br />
          <span className="text-gray-500">don&apos;t have to be.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          SpeakToSlides picks up where Tome left off — AI-powered presentations
          from a voice note or text prompt. First deck free. Shareable link in
          seconds.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
          >
            Build a free deck now →
          </Link>
          <a
            href="#comparison"
            className="border border-gray-700 text-gray-300 px-8 py-3.5 rounded-xl text-base font-medium hover:border-gray-500 hover:text-white transition"
          >
            See the comparison
          </a>
        </div>
        <p className="text-gray-600 text-sm mt-6">
          No account required for your first deck. Decks generated in seconds.
        </p>
      </section>

      {/* Section 1: Empathy */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            If you&apos;re here, you already know
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            Tome&apos;s gone. The presentations you built, the workflow you loved — the
            URL doesn&apos;t work anymore. The AI that structured your stories into
            slides? Offline.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed">
            We get it. We built SpeakToSlides for exactly this moment. Not a
            clone — an evolution. Same magic of AI-powered presentations, but
            with a twist: you don&apos;t even need to type.
          </p>
        </div>
      </section>

      {/* Section 2: Voice-First */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Tome made you type. We let you talk.
        </h2>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Record a voice note or type a prompt. AI builds a beautiful
          presentation. Get a shareable link. That&apos;s the whole workflow.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🎤
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Speak or Type</h3>
            <p className="text-gray-400">
              Use the web mic, send a Telegram voice note, or just type.
              Describe your topic naturally — no templates to fill.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl">
              ⚡
            </div>
            <h3 className="text-lg font-semibold mb-2">2. AI Builds Your Deck</h3>
            <p className="text-gray-400">
              Claude AI structures your content into 5-10 slides with real HTML
              rendering. Professional visuals, zero design skills.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl">
              🔗
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Share Instantly</h3>
            <p className="text-gray-400">
              Every deck gets a permanent URL. Share it, embed it, or present
              directly from your browser. No downloads needed.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Features */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          What You Get
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-lg font-semibold mb-2">AI Deck Generation</h3>
            <p className="text-gray-400">
              Voice or text input. 5-10 slides with real HTML rendering. No
              templates — every deck is unique to your content.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">Shareable Links</h3>
            <p className="text-gray-400">
              Every deck gets a permanent URL at speaktoslides.com/d/[id].
              Share with anyone — they don&apos;t need an account to view.
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Conversational Editing</h3>
            <p className="text-gray-400">
              &quot;Change slide 3&quot; or &quot;Add a timeline&quot; — edit individual slides by
              chatting. No regeneration of the whole deck.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section id="comparison" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          SpeakToSlides vs. Tome vs. The Alternatives
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
          Honest comparison. We think SpeakToSlides is different, but Gamma and
          Beautiful.ai are solid alternatives too.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-gray-400 font-medium text-sm"></th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Tome (RIP)
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Gamma
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Beautiful.ai
                </th>
                <th className="py-4 px-4 font-semibold text-white text-sm">
                  SpeakToSlides
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Input</td>
                <td className="py-3 px-4">Text</td>
                <td className="py-3 px-4">Text</td>
                <td className="py-3 px-4">Text</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Voice or text
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">AI Quality</td>
                <td className="py-3 px-4">Great (was)</td>
                <td className="py-3 px-4">Good</td>
                <td className="py-3 px-4">Good</td>
                <td className="py-3 px-4 text-white font-semibold">Great</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Free Tier</td>
                <td className="py-3 px-4">Limited</td>
                <td className="py-3 px-4">400 credits</td>
                <td className="py-3 px-4">Trial only</td>
                <td className="py-3 px-4 text-white font-semibold">
                  First deck free
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Voice Input</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Chat Editing</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Telegram Bot</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-400">Status</td>
                <td className="py-3 px-4 text-red-400">☠️ Dead</td>
                <td className="py-3 px-4 text-green-400">Live</td>
                <td className="py-3 px-4 text-green-400">Live</td>
                <td className="py-3 px-4 text-green-400 font-semibold">
                  ✅ Live
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Migration Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Your Tome Workflow → SpeakToSlides
        </h2>
        <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
          Migrating from Tome takes 60 seconds.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-3">1</div>
            <h3 className="font-semibold mb-2">Gather Your Notes</h3>
            <p className="text-gray-400 text-sm">
              Export what you can from Tome — or just use your original notes
              and outlines.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-3">2</div>
            <h3 className="font-semibold mb-2">Speak or Paste</h3>
            <p className="text-gray-400 text-sm">
              Send a voice note describing your topic, or paste your notes as a
              prompt. The AI handles structure.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-gray-600 mb-3">3</div>
            <h3 className="font-semibold mb-2">Share Your Deck</h3>
            <p className="text-gray-400 text-sm">
              Get a shareable link in under 60 seconds. Present from your
              browser or share the URL.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ready to build your next deck?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
          You used to talk to Tome. Tome can&apos;t talk back anymore. We can.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
        >
          Create your first deck free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026{" "}
            <a
              href="https://yenceelabs.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Yencee Labs
            </a>
          </p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/" className="hover:text-white transition">
              Home
            </Link>
            <a
              href="https://t.me/SpeakToSlidesBot"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition"
            >
              Telegram Bot
            </a>
          </div>
        </div>
      </footer>

      {/* Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Home",
                item: "https://speaktoslides.com",
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Tome Alternative",
                item: "https://speaktoslides.com/tome-alternative",
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SpeakToSlides",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
              description: "First deck free. Pro plans available.",
            },
          }),
        }}
      />
    </main>
  );
}
