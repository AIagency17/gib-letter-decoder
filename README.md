# Gib Letter Decoder

**Understand any official letter in seconds. English or Español.**

Live app: **https://gib-letter-decoder.vercel.app**

<img src="docs/gib-letter-decoder-qr.png" width="160" alt="QR code to the live app">

People in Gibraltar, including cross-border workers living in Spain, get official letters about tax, social insurance, utilities, housing and employment. Gib Letter Decoder lets them photograph or upload a letter (or paste its text) and get a plain-language explanation in English or Spanish.

📹 [Demo video (80s)](docs/gib-letter-decoder-demo.mp4) · 📄 [Sample letters to try](docs/sample-letters/)

## What you get

- **What is this?** Letter type and sender
- **What you need to do:** actions as a checklist
- **Deadline:** date plus a countdown badge (red ≤ 7 days, amber ≤ 14, green otherwise)
- **Amount due**, **summary**, **who to contact**, and anything that **couldn't be read clearly**
- **Good to know in Gibraltar:** background from a curated guide built only from official sources (gibraltar.gov.gi, GEA, AquaGib, GHA, Citizens Advice, GRA, Spain's BOE), clearly labelled as not from the letter
- **Where to get help:** up to 3 official links, picked by the AI from a checked list, so it can't invent URLs
- One tap to switch the result between English and Spanish

## Privacy by design

- Nothing is stored: no database, no file writes, no cookies, no analytics, no third-party scripts
- Consent checkbox before anything is sent to Google's Gemini AI
- Server logs record only an error type and status code, never letters or results
- API key stays server-side; requests over 5MB are rejected; rate limited to 10 requests/min per IP
- Photos are resized and compressed in the browser before upload
- Privacy notice in English and Spanish at `/privacy`

> This is a demo running on the Gemini API free tier. Please use sample letters only, not real letters with personal details.

## Tech

Next.js (App Router, TypeScript), Tailwind CSS, `@google/genai` with structured JSON output. If the main model is overloaded the API falls back to other Gemini Flash models. Deployed on Vercel.

## Run locally

```bash
npm install
cp .env.example .env.local   # then add your Gemini API key
npm run dev
```

Environment variables:

| Name | Purpose |
|---|---|
| `GEMINI_API_KEY` | Gemini API key (server-side only) |
| `GEMINI_MODEL` | Optional, defaults to `gemini-flash-latest` |

## Disclaimer

Guide only, not legal or financial advice. Always confirm with the office that sent the letter.
