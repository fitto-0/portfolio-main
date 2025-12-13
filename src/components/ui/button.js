"use server";

import { unstable_noStore as noStore } from "next/cache"; // FIX HERE

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const OPENROUTER_REFERER = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

const myInfos = `
My name is Fatima Zahra El Kasmi.
I am a full stack developer specializing in modern web technologies.
Skills: JavaScript, React, Next.js, PHP, MySQL, HTML, CSS.
Experience: Building e-commerce websites, dashboards, management systems and landing pages.
Languages: Arabic, French, English.
`;

const DEFAULT_MODELS = [
  "openai/gpt-3.5-turbo",
  "meta-llama/llama-3.1-8b-instruct:free",
  "google/gemma-2-9b-it:free",
];

const withTimeout = async (promise, ms) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  try {
    const result = await promise(controller.signal);
    return result;
  } finally {
    clearTimeout(timeoutId);
  }
};

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
            {
              role: "system",
              content: `If someone asks about me, answer using these infos: ${myInfos}`,
            },
            { role: "system", content: "Answer like a human." },
            { role: "system", content: "Always answer with a short answer." },
            { role: "user", content: message },
          ],
        }),
      }),
    20000
  );

  const data = await response.json().catch(() => null);
  return { response, data };
};

const isTransientOpenRouterError = (status, msg) => {
  if (!status) return false;
  if (status >= 500) return true;
  const m = (msg || "").toLowerCase();
  return (
    m.includes("timeout") ||
    m.includes("timed out") ||
    m.includes("tls handshake") ||
    m.includes("overloaded") ||
    m.includes("temporarily")
  );
};

export const AiResponse = async (message) => {
  noStore(); // Now works on Next.js 14

  if (!OPENROUTER_API_KEY) {
    return { result: "Missing OPENROUTER_API_KEY.", state: false };
  }

  try {
    const models = DEFAULT_MODELS;
    let lastErrorMessage = null;

    for (const model of models) {
      // Retry each model once if we hit a transient/provider error
      for (let attempt = 0; attempt < 2; attempt++) {
        let response;
        let data;

        try {
          ({ response, data } = await callOpenRouter({ model, message }));
        } catch (e) {
          // fetch aborts / network errors
          lastErrorMessage = e?.name === "AbortError" ? "Request timed out." : e?.message;
          if (attempt === 0) continue;
          break;
        }

        if (!response.ok) {
          const msg =
            data?.error?.message ||
            data?.message ||
            `OpenRouter error (${response.status}).`;
          lastErrorMessage = msg;

          // If the key is invalid, no fallback will help
          if (response.status === 401 || response.status === 403) {
            return { result: msg, state: false };
          }

          if (isTransientOpenRouterError(response.status, msg) && attempt === 0) {
            continue;
          }

          break;
        }

        const text = data?.choices?.[0]?.message?.content;
        if (!text) {
          lastErrorMessage = "No response returned. Try again.";
          break;
        }

        return { result: text, state: true };
      }
    }

    return {
      result: lastErrorMessage || "AI service error. Try again later.",
      state: false,
    };
  } catch (error) {
    console.error("AI Error:", error);
    return {
      result: error?.message || "AI service error. Try again later.",
      state: false,
    };
  }
};
