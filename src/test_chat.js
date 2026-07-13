import "./config/env.js";
import { GoogleGenAI } from "@google/genai";

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const chat = ai.chats.create({ model: "gemini-3.1-flash-lite" });
    const response = await chat.sendMessage({ message: "Say hello in 5 words." });
    console.log("SUCCESS:", response.text);
  } catch (err) {
    console.error("FAILED:", err.message);
  }
}
run();
