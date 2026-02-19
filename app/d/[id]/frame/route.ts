import { NextRequest, NextResponse } from "next/server";
import { getDeckById } from "@/lib/supabase";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const deck = await getDeckById(params.id);

  if (!deck) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(deck.html_content, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
