"use server";

import { unstable_noStore as noStore } from "next/cache";

/* =========================
   OpenRouter Configuration
========================= */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

const OPENROUTER_REFERER = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

/* =========================
   SYSTEM PROMPT (IMPORTANT)
========================= */

const SYSTEM_PROMPT = `
You are an AI assistant representing Fatima Zahra El Kasmi.

Identity:
- Name: Fatima Zahra El Kasmi
- Profession: Full Stack Developer

Technical Skills:
- Frontend: HTML, CSS, JavaScript, React, Next.js
- Backend: PHP, SpringBoot, Node.js
- Database: MySQL, PostgreSQL
- Other: REST APIs, authentication systems, dashboards, admin panels, UI/UX implementation

Project Experience:
- E-commerce websites (products, cart, checkout logic, admin dashboards)
- Management systems (users, products, stock, orders)
- Dashboards and admin panels
- Portfolio websites and landing pages
- Full CRUD web applications

Languages:
- Arabic (native)
- French (fluent)
- English (fluent)

Behavior Rules:
- Always answer as Fatima Zahra El Kasmi.
- Use first person ("I", "my") when asked about yourself.
- Be professional, confident, and human-like.
- Answer questions precisely and specifically.
- Do NOT invent skills, tools, or experience.
- Do NOT mention being an AI or language model.
- If a question is unrelated, answer briefly and politely.

Answer Style:
- Short and clear answers.
- use emojis when needed.
- No markdown unless necessary.
- No unnecessary explanations.
`;

/* =========================
   Models Fallback Order
========================= */

const MODELS = [
  "openai/gpt-3.5-turbo",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
];

/* =========================
   Utility: Timeout Wrapper
========================= */

const withTimeout = async (promiseFn, ms) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);

  try {
    return await promiseFn(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

/* =========================
   OpenRouter API Call
========================= */

const callOpenRouter = async ({ model, message }) => {
  const response = await withTimeout(
    (signal) =>
      fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": OPENROUTER_REFERER,
          "X-Title": "chatbot_portfolio",
          "User-Agent": "chatbot_portfolio",
        },
        cache: "no-store",
        signal,
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
        }),
      }),
    20000
  );

  const data = await response.json().catch(() => null);
  return { response, data };
};

/* =========================
   Error Detection
========================= */

const isTransientError = (status, message) => {
  if (!status) return false;
  if (status >= 500) return true;

  const msg = (message || "").toLowerCase();
  return (
    msg.includes("timeout") ||
    msg.includes("timed out") ||
    msg.includes("overloaded") ||
    msg.includes("temporarily") ||
    msg.includes("tls")
  );
};

/* =========================
   Server Action
========================= */

export const AiResponse = async (message) => {
  noStore();

  if (!OPENROUTER_API_KEY) {
    return { result: "Missing OPENROUTER_API_KEY.", state: false };
  }

  let lastError = null;

  for (const model of MODELS) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { response, data } = await callOpenRouter({ model, message });

        if (!response.ok) {
          const errorMsg =
            data?.error?.message ||
            data?.message ||
            `OpenRouter error (${response.status})`;

          lastError = errorMsg;

          if (response.status === 401 || response.status === 403) {
            return { result: errorMsg, state: false };
          }

          if (isTransientError(response.status, errorMsg) && attempt === 0) {
            continue;
          }

          break;
        }

        const text = data?.choices?.[0]?.message?.content;

        if (!text) {
          lastError = "No response returned.";
          break;
        }

        return { result: text.trim(), state: true };
      } catch (err) {
        lastError =
          err?.name === "AbortError"
            ? "Request timed out."
            : err?.message || "Network error.";

        if (attempt === 0) continue;
      }
    }
  }

  return {
    result: lastError || "AI service unavailable. Please try again later.",
    state: false,
  };
};
