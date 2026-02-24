import type { Metadata } from "next";
import Link from "next/link";
import { COMPARE_PAGES } from "@/lib/compare-pages";

export const metadata: Metadata = {
  title: "Gamma Alternative — SpeakToSlides | Voice-First AI Presentation Builder",
  description:
    "Looking for a Gamma alternative? SpeakToSlides turns voice notes into presentations in 60 seconds. No typing required. First deck free.",
  keywords: [
    "gamma alternative",
    "gamma ai alternative",
    "gamma app alternative",
    "alternative to gamma",
    "gamma presentation alternative",
    "ai presentation maker",
    "voice presentation builder",
    "speaktoslides",
  ],
  openGraph: {
    title: "The Gamma Alternative That Listens",
    description:
      "Gamma makes you type. SpeakToSlides makes you talk. Voice note → presentation in 60 seconds.",
    url: "https://speaktoslides.com/compare/gamma",
    siteName: "SpeakToSlides",
    type: "website",
    images: [
      {
        url: "https://speaktoslides.com/api/og?title=Gamma+Alternative&subtitle=Voice-First+AI+Presentations",
        width: 1200,
        height: 630,
        alt: "SpeakToSlides — Gamma Alternative",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gamma Alternative — Voice-First AI Presentations",
    description:
      "Gamma makes you type. SpeakToSlides makes you talk. Voice note → presentation in 60 seconds.",
    images: [
      "https://speaktoslides.com/api/og?title=Gamma+Alternative&subtitle=Voice-First+AI+Presentations",
    ],
  },
  alternates: {
    canonical: "https://speaktoslides.com/compare/gamma",
  },
};

const currentPath = "/compare/gamma";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="border-b border-gray-800 pb-6">
      <h3 className="text-lg font-semibold text-white mb-2">{question}</h3>
      <p className="text-gray-400 leading-relaxed">{answer}</p>
    </div>
  );
}

export default function GammaAlternativePage() {
  const faqs = [
    {
      question: "Is SpeakToSlides a good Gamma alternative?",
      answer:
        "Depends on what you need. If you want voice-driven, fast deck creation with portable HTML output, yes. If you need design-rich nested cards or team collaboration, Gamma is better.",
    },
    {
      question:
        "Can SpeakToSlides replace Gamma for professional presentations?",
      answer:
        "For pitch decks, product demos, and one-off client presentations — yes. For complex, design-intensive decks with lots of embedded media — Gamma has the edge.",
    },
    {
      question:
        "What's the main difference between Gamma and SpeakToSlides?",
      answer:
        "Gamma is text-first. SpeakToSlides is voice-first. Gamma is a design tool. SpeakToSlides is a communication tool.",
    },
    {
      question:
        "Does SpeakToSlides work on Telegram like Gamma works on the web?",
      answer:
        "Yes — send a Telegram voice note to our bot and get a presentation link back. That's the core workflow.",
    },
    {
      question: "Is SpeakToSlides free?",
      answer:
        "First deck is free, no signup required. Unlimited decks on subscription.",
    },
    {
      question: "Can I use SpeakToSlides if I already have Gamma?",
      answer:
        "Absolutely. Many users use Gamma for polished final decks and SpeakToSlides for quick drafts, idea exploration, and client check-ins.",
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
          Gamma Alternative
        </p>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
          The Gamma Alternative<br />
          That Listens<br />
          <span className="text-gray-500">Instead of Waiting</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Gamma wants you to type. SpeakToSlides wants you to talk. Send a voice
          note, get a presentation. No blank-page moment. No prompt engineering.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
          >
            Try free — no signup required →
          </Link>
          <a
            href="#comparison"
            className="border border-gray-700 text-gray-300 px-8 py-3.5 rounded-xl text-base font-medium hover:border-gray-500 hover:text-white transition"
          >
            See the comparison
          </a>
        </div>
        <p className="text-gray-600 text-sm mt-6">
          First deck free. Decks generated in under 60 seconds.
        </p>
      </section>

      {/* TL;DR Comparison */}
      <section id="comparison" className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Gamma vs SpeakToSlides — At a Glance
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-gray-400 font-medium text-sm" />
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Gamma
                </th>
                <th className="py-4 px-4 font-semibold text-white text-sm">
                  SpeakToSlides
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Input method</td>
                <td className="py-3 px-4">Text prompt</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Voice note OR text
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Deck style</td>
                <td className="py-3 px-4">Design-rich, nested cards</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Clean HTML slides
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Hosting</td>
                <td className="py-3 px-4">Gamma-hosted</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Your own link
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Free tier</td>
                <td className="py-3 px-4">400 AI credits</td>
                <td className="py-3 px-4 text-white font-semibold">
                  First deck free
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Pricing</td>
                <td className="py-3 px-4">$10–20/mo</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Free / subscription
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Voice input</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Chat editing</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Telegram bot</td>
                <td className="py-3 px-4">❌</td>
                <td className="py-3 px-4 text-green-400">✅</td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-400">Best for</td>
                <td className="py-3 px-4">
                  Visual-first power users
                </td>
                <td className="py-3 px-4 text-white font-semibold">
                  Voice thinkers, fast presenters
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Why People Look for Gamma Alternatives */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Why People Look for Gamma Alternatives
        </h2>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          Gamma is a solid product. But it doesn&apos;t work for everyone.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-2xl mb-3">💸</div>
            <h3 className="text-lg font-semibold mb-2">Pricing Shock</h3>
            <p className="text-gray-400">
              Gamma&apos;s Plus plan is $10/mo, Pro is $20/mo. For occasional
              presentations, that&apos;s hard to justify. The free 400 AI
              credits run out fast.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-2xl mb-3">⌨️</div>
            <h3 className="text-lg font-semibold mb-2">Typing Fatigue</h3>
            <p className="text-gray-400">
              Gamma&apos;s input is entirely text-based. For people who think
              out loud — founders, sales reps, podcasters — typing is
              friction.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-2xl mb-3">🔒</div>
            <h3 className="text-lg font-semibold mb-2">
              Output Inflexibility
            </h3>
            <p className="text-gray-400">
              Gamma presentations live on Gamma&apos;s domain. Some users want
              portable HTML they own — shareable anywhere, embeddable,
              self-hosted.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <div className="text-2xl mb-3">🧩</div>
            <h3 className="text-lg font-semibold mb-2">Overcomplexity</h3>
            <p className="text-gray-400">
              &quot;It&apos;s powerful but I only use 20% of it.&quot; Gamma has
              nested cards, blocks, and design tools — overkill when you
              just want slides from an idea.
            </p>
          </div>
        </div>
      </section>

      {/* The Fundamental Difference: Text vs Voice */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            The Fundamental Difference: Text vs Voice
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            Gamma starts with a blank text box. You stare at it. You try to
            distill your idea into a prompt. You edit, rewrite, prompt-engineer.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            SpeakToSlides starts with your voice. Hit record. Explain your
            presentation like you&apos;d explain it to a colleague. The AI
            structures it into slides.
          </p>
          <p className="text-gray-400 text-lg leading-relaxed mb-4">
            This isn&apos;t just a UI difference — it unlocks a fundamentally
            different creative process. Founders record pitch decks from voice
            memos on their commute. Product managers turn meeting notes into
            presentations without rewriting a word. Sales reps create client
            proposals from a quick voice debrief.
          </p>
          <p className="text-white text-lg leading-relaxed font-semibold">
            &quot;I know what I want to say. I just can&apos;t write it down
            fast enough.&quot;
          </p>
        </div>
      </section>

      {/* What We Don't Replace */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          What SpeakToSlides Doesn&apos;t Replace
        </h2>
        <p className="text-gray-400 text-center text-lg mb-10 max-w-2xl mx-auto">
          We believe in honesty. Gamma does some things we don&apos;t.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-6 text-center">
            <div className="text-2xl mb-3">🎨</div>
            <h3 className="font-semibold mb-2">Pixel-Perfect Design</h3>
            <p className="text-gray-500 text-sm">
              Gamma&apos;s design engine is more powerful. If visual fidelity is
              your top priority, Gamma wins.
            </p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-6 text-center">
            <div className="text-2xl mb-3">🗂️</div>
            <h3 className="font-semibold mb-2">Nested Card Structures</h3>
            <p className="text-gray-500 text-sm">
              Gamma&apos;s nested blocks and card layouts are unique to their
              platform. We generate clean, linear slides.
            </p>
          </div>
          <div className="bg-gray-900/30 border border-gray-800/60 rounded-xl p-6 text-center">
            <div className="text-2xl mb-3">👥</div>
            <h3 className="font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-500 text-sm">
              Gamma has multi-user editing and workspaces. We&apos;re a
              single-player tool — built for speed, not committees.
            </p>
          </div>
        </div>
        <p className="text-gray-500 text-center text-sm mt-8">
          We&apos;re not trying to be Gamma. We&apos;re the tool for people who
          think faster than they type.
        </p>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          How It Works
        </h2>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-xl mx-auto">
          Three steps. Under 60 seconds. No account needed for your first deck.
        </p>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl mx-auto">
              🎤
            </div>
            <h3 className="text-lg font-semibold mb-2">1. Speak or Type</h3>
            <p className="text-gray-400">
              Send a voice note via Telegram, use the web microphone, or just
              type. Describe your presentation naturally.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl mx-auto">
              ⚡
            </div>
            <h3 className="text-lg font-semibold mb-2">
              2. AI Builds Your Deck
            </h3>
            <p className="text-gray-400">
              AI structures your content into 5-10 slides with professional HTML
              rendering. Zero design skills required.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
            <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center mb-4 text-2xl mx-auto">
              🔗
            </div>
            <h3 className="text-lg font-semibold mb-2">3. Share Instantly</h3>
            <p className="text-gray-400">
              Every deck gets a permanent URL. Share it, embed it, or present
              from your browser. No downloads.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">
          Who Switches from Gamma to SpeakToSlides?
        </h2>
        <p className="text-gray-400 text-center text-lg mb-12 max-w-2xl mx-auto">
          People who know what they want to say — and just want to say it.
        </p>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">🚀 Startup Founders</h3>
            <p className="text-gray-400 text-sm">
              Record an investor update from a voice memo on your commute. Deck
              ready before you reach the office.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">📊 Product Managers</h3>
            <p className="text-gray-400 text-sm">
              Turn meeting notes into a stakeholder presentation without
              rewriting a single word. Just speak your summary.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">💼 Sales Reps</h3>
            <p className="text-gray-400 text-sm">
              Create a client proposal from a quick voice debrief after a call.
              Share the link before the prospect forgets.
            </p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
            <h3 className="font-semibold mb-2">🎙️ Podcasters & Creators</h3>
            <p className="text-gray-400 text-sm">
              Turn episode outlines into visual slide decks for social sharing.
              Voice note in, shareable deck out.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Comparison */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Pricing Comparison
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Plan
                </th>
                <th className="py-4 px-4 text-gray-400 font-medium text-sm">
                  Gamma
                </th>
                <th className="py-4 px-4 font-semibold text-white text-sm">
                  SpeakToSlides
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Free</td>
                <td className="py-3 px-4">400 AI credits</td>
                <td className="py-3 px-4 text-white font-semibold">
                  First deck free
                </td>
              </tr>
              <tr className="border-b border-gray-800">
                <td className="py-3 px-4 text-gray-400">Paid starts at</td>
                <td className="py-3 px-4">$10/mo (Plus)</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Subscription (coming soon)
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 text-gray-400">Pro</td>
                <td className="py-3 px-4">$20/mo</td>
                <td className="py-3 px-4 text-white font-semibold">
                  Unlimited decks
                </td>
              </tr>
            </tbody>
          </table>
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
          Stop typing your presentations.<br />
          Start talking to them.
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
          Your next deck is one voice note away. No account. No credit card. Just talk.
        </p>
        <Link
          href="/"
          className="inline-block bg-white text-black px-8 py-3.5 rounded-xl text-base font-semibold hover:bg-gray-100 transition"
        >
          Try SpeakToSlides free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
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
          {/* Cross-links */}
          <div className="border-t border-gray-800/60 pt-4">
            <p className="text-gray-600 text-xs mb-2">More comparisons:</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              {COMPARE_PAGES.filter((p) => p.href !== currentPath).map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="hover:text-white transition"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Schema Markup: FAQPage */}
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
      {/* Schema Markup: BreadcrumbList */}
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
                name: "Compare",
                item: "https://speaktoslides.com/compare",
              },
              {
                "@type": "ListItem",
                position: 3,
                name: "Gamma Alternative",
                item: "https://speaktoslides.com/compare/gamma",
              },
            ],
          }),
        }}
      />
      {/* Schema Markup: SoftwareApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "SpeakToSlides",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: "https://speaktoslides.com",
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
