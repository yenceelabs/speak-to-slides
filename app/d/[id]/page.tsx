import { notFound } from "next/navigation";
import { getDeckById } from "@/lib/supabase";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import DeckViewer from "./DeckViewer";

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

  // Check if current user is the deck owner
  const { userId } = await auth();
  const isOwner = !!(userId && deck.user_id && userId === deck.user_id);

  return (
    <DeckViewer
      deckId={deck.id}
      htmlContent={deck.html_content}
      slideCount={deck.slide_count}
      isOwner={isOwner}
    />
  );
}
