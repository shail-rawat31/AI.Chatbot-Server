import { GoogleGenAI } from "@google/genai";

// Created lazily (on first use) rather than at import time, so we don't
// read process.env.GEMINI_API_KEY before dotenv.config() has run.
let ai;
function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return ai;
}

/**
 * Sends the user's message to Gemini, along with prior conversation
 * history, and returns the model's reply as plain text.
 *
 * history format expected from the client:
 * [
 *   { role: "user", parts: [{ text: "hi" }] },
 *   { role: "model", parts: [{ text: "hello!" }] },
 *   ...
 * ]
 */
export async function getChatResponse(history = [], userMessage, attachment = null) {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = now.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const chat = getClient().chats.create({
    model: "gemini-3.5-flash",
    history,
    config: {
      systemInstruction: `You are a helpful, premium AI assistant. The current system date is ${dateStr} and the current local time is ${timeStr} (Timezone: ${timeZone}). Use this current date and time context to accurately answer any temporal queries from the user.`
    }
  });

  let messageParam = userMessage;

  if (attachment && attachment.data && attachment.mimeType) {
    const isTextFile =
      attachment.mimeType.startsWith("text/") ||
      attachment.mimeType === "application/json" ||
      attachment.mimeType === "application/javascript" ||
      attachment.mimeType === "application/x-javascript" ||
      attachment.mimeType.startsWith("application/xml");

    if (isTextFile) {
      try {
        const decodedText = Buffer.from(attachment.data, "base64").toString("utf-8");
        messageParam = `[Attached File: ${attachment.name}]\n---START OF FILE---\n${decodedText}\n---END OF FILE---\n\n${userMessage}`;
      } catch (err) {
        console.error("Failed to decode text attachment, falling back to raw prompt:", err);
      }
    } else {
      messageParam = [
        { text: userMessage },
        {
          inlineData: {
            mimeType: attachment.mimeType,
            data: attachment.data,
          },
        },
      ];
    }
  }

  const response = await chat.sendMessage({ message: messageParam });
  return response.text;
}
