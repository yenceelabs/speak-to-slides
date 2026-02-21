const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

interface TelegramApiResponse {
  ok: boolean;
  description?: string;
}

export interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

export interface TelegramMessage {
  message_id: number;
  chat: { id: number; type: string };
  from?: { id: number; username?: string; first_name?: string };
  text?: string;
  voice?: { file_id: string; duration: number };
  photo?: Array<{ file_id: string; width: number; height: number }>;
  caption?: string;
}

export function escapeTelegramHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function telegramRequest(
  endpoint: string,
  payload: Record<string, unknown>
): Promise<TelegramApiResponse> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const res = await fetch(`${TELEGRAM_API}/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Telegram API ${endpoint} failed with ${res.status}: ${body}`);
  }

  const data = (await res.json()) as TelegramApiResponse;
  if (!data.ok) {
    throw new Error(
      `Telegram API ${endpoint} returned ok=false: ${data.description || "Unknown error"}`
    );
  }

  return data;
}

export async function sendMessage(
  chatId: number,
  text: string,
  options?: { parseMode?: "HTML" | "none" }
): Promise<void> {
  const payload: Record<string, unknown> = {
    chat_id: chatId,
    text,
    disable_web_page_preview: false,
  };

  if ((options?.parseMode || "HTML") === "HTML") {
    payload.parse_mode = "HTML";
  }

  await telegramRequest("sendMessage", payload);
}

export async function sendPlainTextMessage(chatId: number, text: string): Promise<void> {
  await sendMessage(chatId, text, { parseMode: "none" });
}

export async function sendHtmlMessage(chatId: number, html: string): Promise<void> {
  await sendMessage(chatId, html, { parseMode: "HTML" });
}

export async function sendChatAction(
  chatId: number,
  action: "typing" | "upload_document"
): Promise<void> {
  await telegramRequest("sendChatAction", { chat_id: chatId, action });
}

export async function getFile(fileId: string): Promise<string> {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  }

  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Failed to get file info: ${res.status} ${body}`);
  }

  const data = (await res.json()) as TelegramApiResponse & {
    result?: { file_path?: string };
  };
  if (!data.ok || !data.result?.file_path) {
    throw new Error("Failed to get file info");
  }

  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

export async function transcribeVoice(fileId: string): Promise<string> {
  const openAiKey = process.env.OPENAI_API_KEY;
  if (!openAiKey) {
    throw new Error("OPENAI_API_KEY not configured — voice transcription unavailable");
  }

  const fileUrl = await getFile(fileId);

  // Download the file
  const audioRes = await fetch(fileUrl);
  if (!audioRes.ok) {
    throw new Error(`Failed to download Telegram audio file: ${audioRes.status}`);
  }

  const audioBuffer = await audioRes.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: "audio/ogg" });

  // Send to OpenAI Whisper
  const formData = new FormData();
  formData.append("file", audioBlob, "voice.ogg");
  formData.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper transcription failed: ${err}`);
  }

  const data = (await res.json()) as { text?: string };
  return data.text || "";
}
