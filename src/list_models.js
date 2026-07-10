import fs from "fs";
import "./config/env.js";
import { GoogleGenAI } from "@google/genai";

async function run() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in env");
    return;
  }
  
  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.list();
    let content = "";
    for (const m of response.pageInternal || []) {
      content += `${m.name}\n`;
    }
    fs.writeFileSync("C:/Users/shell/.gemini/antigravity-ide/brain/260efc8b-c4db-47c1-8c71-5eccebca1e82/scratch/models.txt", content);
    console.log("SUCCESS");
  } catch (err) {
    console.error("Error listing models:", err.message);
  }
}
run();
