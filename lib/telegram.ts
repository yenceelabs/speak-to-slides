const TELEGRAM_API = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}`;

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

export async function sendMessage(chatId: number, text: string): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    }),
  });
}

export async function sendChatAction(
  chatId: number,
  action: "typing" | "upload_document"
): Promise<void> {
  await fetch(`${TELEGRAM_API}/sendChatAction`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, action }),
  });
}

export async function getFile(fileId: string): Promise<string> {
  const res = await fetch(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
  const data = await res.json();
  if (!data.ok) throw new Error("Failed to get file info");
  return `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${data.result.file_path}`;
}

export async function transcribeVoice(fileId: string): Promise<string> {
  const fileUrl = await getFile(fileId);

  // Download the file
  const audioRes = await fetch(fileUrl);
  const audioBuffer = await audioRes.arrayBuffer();
  const audioBlob = new Blob([audioBuffer], { type: "audio/ogg" });

  // Send to OpenAI Whisper
  const formData = new FormData();
  formData.append("file", audioBlob, "voice.ogg");
  formData.append("model", "whisper-1");

  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Whisper transcription failed: ${err}`);
  }

  const data = await res.json();
  return data.text || "";
}
