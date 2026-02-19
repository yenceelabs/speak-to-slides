import { notFound } from "next/navigation";
import { getDeckById } from "@/lib/supabase";
import { Metadata } from "next";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const deck = await getDeckById(params.id);
    if (!deck) {
      return { title: "Deck Not Found — SpeakToSlides" };
    }
    return {
      title: `${deck.title} — SpeakToSlides`,
      description: `${deck.slide_count} slides · ${deck.prompt.slice(0, 120)}`,
      openGraph: {
        title: deck.title,
        description: `A presentation created with SpeakToSlides · ${deck.slide_count} slides`,
        siteName: "SpeakToSlides",
        type: "website",
      },
      twitter: {
        card: "summary",
        title: deck.title,
        description: `A presentation created with SpeakToSlides · ${deck.slide_count} slides`,
      },
    };
  } catch {
    return { title: "SpeakToSlides" };
  }
}

export default async function DeckPage({ params }: Props) {
  const deck = await getDeckById(params.id);

  if (!deck) {
    notFound();
  }

  return (
    <div
      style={{ width: "100vw", height: "100vh", overflow: "hidden" }}
      dangerouslySetInnerHTML={{ __html: deck.html_content }}
    />
  );
}
