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
        description: `${deck.slide_count} slides · Created with SpeakToSlides`,
        siteName: "SpeakToSlides",
        type: "website",
        url: `https://speaktoslides.com/d/${deck.id}`,
      },
      twitter: {
        card: "summary_large_image",
        title: deck.title,
        description: `${deck.slide_count} slides · Created with SpeakToSlides`,
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
  let userId: string | null = null;
  try {
    const authState = await auth();
    userId = authState.userId;
  } catch (authError) {
    console.warn("Clerk auth unavailable on deck page:", authError);
  }
  const isOwner = !!(userId && deck.user_id && userId === deck.user_id);

  return (
    <DeckViewer
      deckId={deck.id}
      slideCount={deck.slide_count}
      isOwner={isOwner}
    />
  );
}
