import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { GIBRALTAR_GUIDE, HELP_LINKS } from "@/lib/gibraltar-knowledge";

export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT = 10;
const WINDOW_MS = 60_000;
const DEFAULT_MODEL = "gemini-flash-latest";
const FALLBACK_MODELS = ["gemini-3.8-flash", "gemini-flash-lite-latest"];

// In-memory, per-instance rate limiter. Holds only an IP and timestamps, cleared after a minute.
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= RATE_LIMIT) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return false;
}

const nullableString: Schema = { type: Type.STRING, nullable: true };

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    is_letter: { type: Type.BOOLEAN },
    letter_type: nullableString,
    sender: nullableString,
    actions: { type: Type.ARRAY, items: { type: Type.STRING }, nullable: true },
    deadline: {
      type: Type.STRING,
      nullable: true,
      description: "Date in YYYY-MM-DD format, or null if no deadline is written in the letter.",
    },
    amount_due: nullableString,
    summary: nullableString,
    contact: nullableString,
    unclear_parts: nullableString,
    background: {
      type: Type.STRING,
      nullable: true,
      description: "2-4 short sentences from the GIBRALTAR GUIDE only: what this kind of letter usually means in Gibraltar and what options the person has. Null if the guide has nothing relevant.",
    },
    help_links: {
      type: Type.ARRAY,
      nullable: true,
      description: "Up to 3 ids of the most relevant official help links.",
      items: { type: Type.STRING, format: "enum", enum: HELP_LINKS.map((l) => l.id) },
    },
  },
  required: [
    "is_letter",
    "letter_type",
    "sender",
    "actions",
    "deadline",
    "amount_due",
    "summary",
    "contact",
    "unclear_parts",
    "background",
    "help_links",
  ],
  propertyOrdering: [
    "is_letter",
    "letter_type",
    "sender",
    "actions",
    "deadline",
    "amount_due",
    "summary",
    "contact",
    "unclear_parts",
    "background",
    "help_links",
  ],
};

function systemInstruction(language: string) {
  return `You are reading an official letter received by someone in Gibraltar. Extract only what is written in the letter. Never invent dates, amounts, phone numbers, emails or office names. If something is not in the letter, use null. Write all values in ${language} using simple words a 12 year old would understand, but keep JSON keys in English. If the input is not a letter, set is_letter to false and every other field to null.

Every field except "background" and "help_links" must come only from the letter itself.
For "background" only, you may use the GIBRALTAR GUIDE below to explain in 2-4 short sentences what this kind of letter usually means in Gibraltar and what options the person has (for example how to object or where to get free help). If the letter suggests the person lives in Spain or is a cross-border worker, include relevant cross-border points from the guide. Use only facts from the guide, never outside knowledge; if nothing in the guide is relevant, use null.
For "help_links", choose up to 3 ids from this list that match the subject of the letter (only pick cross-border or Spanish links when the letter itself is about tax, social security, employment or residence), or null:
${HELP_LINKS.map((l) => `- ${l.id}: ${l.name} (${l.topics})`).join("\n")}

GIBRALTAR GUIDE:
${GIBRALTAR_GUIDE}`;
}

function fail(type: string, status: number, message: string) {
  // Only the error type and status are logged. Never the request body or model output.
  console.error(`decode_error type=${type} status=${status}`);
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

type Body = {
  imageBase64?: unknown;
  mimeType?: unknown;
  text?: unknown;
  language?: unknown;
};

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "application/pdf"]);

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) return fail("rate_limited", 429, "Too many requests. Please wait a minute.");

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) return fail("too_large", 413, "That file is too large.");

  let raw: string;
  try {
    raw = await request.text();
  } catch {
    return fail("bad_body", 400, "Invalid request.");
  }
  if (raw.length > MAX_BYTES) return fail("too_large", 413, "That file is too large.");

  let body: Body;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail("bad_json", 400, "Invalid request.");
  }

  const language = body.language === "Spanish" ? "Spanish" : body.language === "English" ? "English" : null;
  if (!language) return fail("bad_language", 400, "Invalid language.");

  const image = typeof body.imageBase64 === "string" && body.imageBase64.length > 0 ? body.imageBase64 : null;
  const text = typeof body.text === "string" && body.text.trim().length > 0 ? body.text.trim() : null;
  if (!image && !text) return fail("empty_input", 400, "Add a photo or paste the letter text.");

  const mimeType = typeof body.mimeType === "string" && ALLOWED_MIME.has(body.mimeType) ? body.mimeType : "image/jpeg";

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fail("missing_key", 500, "The service is not configured.");

  const ai = new GoogleGenAI({ apiKey });
  const parts = image
    ? [{ inlineData: { mimeType, data: image } }, { text: "Read this letter and fill in the fields. If it has several pages, use all of them." }]
    : [{ text: `Here is the text of the letter:\n\n${text}` }];

  // Try the configured model first, then fall back when Gemini is overloaded or the output is unusable.
  const models = [...new Set([process.env.GEMINI_MODEL || DEFAULT_MODEL, ...FALLBACK_MODELS])];
  let lastType = "unknown";
  let lastStatus: number | undefined;

  for (const model of models) {
    try {
      const result = await ai.models.generateContent({
        model,
        contents: [{ role: "user", parts }],
        config: {
          systemInstruction: systemInstruction(language),
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.2,
        },
      });
      const output = result.text;
      if (!output) {
        lastType = "empty_output";
        continue;
      }
      const parsed = JSON.parse(output);
      // Only links from the curated list ever reach the user; the model just picks ids.
      const ids: unknown[] = Array.isArray(parsed.help_links) ? parsed.help_links : [];
      const links = HELP_LINKS.filter((l) => ids.includes(l.id)).slice(0, 3);
      parsed.help_links = links.length
        ? links.map((l) => ({ name: language === "Spanish" ? l.nameEs : l.name, url: l.url }))
        : null;
      return Response.json(parsed, { headers: { "Cache-Control": "no-store" } });
    } catch (err) {
      lastType = err instanceof SyntaxError ? "bad_model_json" : err instanceof Error ? err.name : "unknown";
      lastStatus = (err as { status?: number })?.status;
      // Bad requests and auth errors would fail on every model; anything else (overload, retired model, bad output) gets another try.
      const retryable = lastStatus !== 400 && lastStatus !== 401 && lastStatus !== 403;
      if (!retryable) break;
    }
  }
  return fail(lastType, lastStatus === 429 || lastStatus === 503 ? 503 : 502, "Couldn't read that letter.");
}
