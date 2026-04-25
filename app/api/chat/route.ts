import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `You are AWS Pulse Assistant — an expert AWS mentor who explains AWS updates in simple, structured Hinglish (mix of Hindi and English).

When a user asks to explain an AWS update (especially when update context is provided), ALWAYS respond in this exact structured format:

## 🔍 Simple Explanation
[2-3 lines mein kya hua — bilkul simple language mein]

## ⚠️ Why It Matters
[Bullet points mein — production pe kya impact padega]
- Point 1
- Point 2

## ✅ What You Should Do
[Step-by-step action items]
1. Step 1
2. Step 2
3. Step 3

## 💡 Real-World Example
[Ek real scenario — jaise "Agar tumhara ECS task version 1.3 pe hai toh..."]

## 📊 Quick Reference Table (if applicable)
| Item | Status |
|------|--------|
| Old Version | Deprecated ❌ |
| New Version | Recommended ✅ |

---
Rules:
- Always use Hinglish (Hindi + English mix) — friendly mentor tone
- Use **bold** for important terms
- Use emojis for section headers
- Keep it practical and actionable
- If NOT an update explanation, answer normally but still in Hinglish
- Never use raw JSON or technical error messages in responses`;

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
];

export async function POST(req: NextRequest) {
  try {
    const { message, history, updateContext } = await req.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "⚠️ API key not configured." }, { status: 500 });
    }

    // If update context is provided, prepend it to the message
    const fullMessage = updateContext
      ? `User is viewing this AWS update and wants an explanation:\n\nTitle: ${updateContext.title}\nCategory: ${updateContext.category}\nPriority: ${updateContext.priority}\nSummary: ${updateContext.summary}\n\nUser's question: ${message}`
      : message;

    const chatHistory = (history || []).map((msg: { role: string; text: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    }));

    let lastError: Error | null = null;

    for (const modelName of MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: SYSTEM_PROMPT,
        });

        const chat = model.startChat({ history: chatHistory });
        const result = await chat.sendMessage(fullMessage);
        const text = result.response.text();

        return NextResponse.json({ reply: text, model: modelName });
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!lastError.message.includes("429") && !lastError.message.includes("quota")) break;
        console.warn(`Model ${modelName} quota exceeded, trying next...`);
      }
    }

    if (lastError?.message.includes("429") || lastError?.message.includes("quota")) {
      return NextResponse.json(
        { error: "⚠️ API quota exceeded. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: "⚠️ Something went wrong. Please try again." }, { status: 500 });
  } catch (err: unknown) {
    console.error("Chat route error:", err);
    return NextResponse.json({ error: "⚠️ Something went wrong. Please try again." }, { status: 500 });
  }
}
