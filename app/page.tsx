"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { MAX_PDF_BYTES, prepareImage, readPdf } from "@/lib/image";
import { LogoMark } from "./_components/logo-mark";

type Language = "English" | "Spanish";
type Tab = "photo" | "text";
type Upload =
  | { kind: "image"; base64: string; previewUrl: string }
  | { kind: "pdf"; base64: string; name: string };

type Decoded = {
  is_letter: boolean;
  letter_type: string | null;
  sender: string | null;
  actions: string[] | null;
  deadline: string | null;
  amount_due: string | null;
  summary: string | null;
  contact: string | null;
  unclear_parts: string | null;
  background?: string | null;
  help_links?: { name: string; url: string }[] | null;
};

type Payload = { imageBase64?: string; mimeType?: string; text?: string };

const LABELS = {
  English: {
    aiLabel: "AI-generated summary. It can make mistakes. Check the original letter.",
    what: "What is this?",
    from: "From",
    todo: "What you need to do",
    deadline: "Deadline",
    amount: "Amount due",
    summary: "Summary",
    contact: "Who to contact",
    unclear: "Couldn't read clearly",
    background: "Good to know in Gibraltar",
    backgroundNote: "General information about Gibraltar, not from your letter.",
    help: "Where to get help",
    switchTo: "Ver en Español",
    daysLeft: (n: number) => (n === 0 ? "Due today" : n === 1 ? "1 day left" : `${n} days left`),
    passed: "Deadline passed",
    notLetter: "This doesn't look like a letter. Try another photo.",
  },
  Spanish: {
    aiLabel: "Resumen generado por IA. Puede tener errores. Revisa la carta original.",
    what: "¿Qué es esto?",
    from: "De",
    todo: "Lo que tienes que hacer",
    deadline: "Fecha límite",
    amount: "Importe a pagar",
    summary: "Resumen",
    contact: "A quién contactar",
    unclear: "No se pudo leer bien",
    background: "Bueno saber en Gibraltar",
    backgroundNote: "Información general sobre Gibraltar, no viene de tu carta.",
    help: "Dónde pedir ayuda",
    switchTo: "View in English",
    daysLeft: (n: number) => (n === 0 ? "Vence hoy" : n === 1 ? "Queda 1 día" : `Quedan ${n} días`),
    passed: "Fecha límite pasada",
    notLetter: "Esto no parece una carta. Prueba con otra foto.",
  },
} as const;

function daysUntil(iso: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const target = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function formatDate(iso: string, language: Language): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(language === "Spanish" ? "es-ES" : "en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("photo");
  const [language, setLanguage] = useState<Language>("English");
  const [consent, setConsent] = useState(false);
  const [text, setText] = useState("");
  const [image, setImage] = useState<Upload | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ data: Decoded; language: Language } | null>(null);
  const lastPayload = useRef<Payload | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const hasInput = tab === "photo" ? !!image : text.trim().length > 0;
  const canDecode = consent && hasInput && !loading && !preparing;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPreparing(true);
    try {
      if (file.type === "application/pdf") {
        if (file.size > MAX_PDF_BYTES) throw new Error("That PDF is too big (max 3MB). Try a photo of the page instead.");
        setImage({ kind: "pdf", base64: await readPdf(file), name: file.name });
      } else {
        setImage({ kind: "image", ...(await prepareImage(file)) });
      }
    } catch (e) {
      setImage(null);
      setError(
        e instanceof Error && e.message.startsWith("That PDF")
          ? e.message
          : "Couldn't open that file. Try a photo (JPG or PNG) or a PDF.",
      );
    } finally {
      setPreparing(false);
    }
  }

  async function run(payload: Payload, lang: Language) {
    lastPayload.current = payload;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, language: lang }),
      });
      if (!res.ok) {
        if (res.status === 429) throw new Error("Too many requests. Please wait a minute and try again.");
        throw new Error("decode_failed");
      }
      const data = (await res.json()) as Decoded;
      setResult({ data, language: lang });
      setLanguage(lang);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      const msg = e instanceof Error && e.message !== "decode_failed" && !e.message.includes("fetch") ? e.message : null;
      setError(msg ?? "Couldn't read that letter, try a clearer photo");
    } finally {
      setLoading(false);
    }
  }

  function decode() {
    if (!canDecode) return;
    const payload: Payload =
      tab === "photo" && image
        ? { imageBase64: image.base64, mimeType: image.kind === "pdf" ? "application/pdf" : "image/jpeg" } : { text: text.trim() };
    setResult(null);
    run(payload, language);
  }

  function retry() {
    if (lastPayload.current) run(lastPayload.current, language);
    else decode();
  }

  function switchLanguage() {
    if (!result || !lastPayload.current) return;
    run(lastPayload.current, result.language === "English" ? "Spanish" : "English");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-12 pt-6 sm:pt-10">
        <header className="mb-8">
          <div className="flex items-center gap-2">
            <LogoMark />
            <span className="font-display text-[18px] font-bold leading-none tracking-[-0.02em]">Gib Letter Decoder</span>
          </div>
          <h1 className="mt-8 text-[30px] font-bold leading-[1.1]">What does this letter say?</h1>
          <p className="mt-3 text-lg text-muted">Understand any official letter in seconds. English or Español.</p>
          <p className="mt-6 rounded-card border border-amber-line bg-amber-soft px-4 py-3 text-base text-amber-ink">
            <strong>Demo version.</strong> Please use sample letters only. Don&apos;t upload real letters with personal
            details.{" "}
            <Link href="/privacy" className="font-bold underline underline-offset-4">
              Why?
            </Link>
          </p>
        </header>

        <section>
          <div role="tablist" aria-label="Input type" className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-sand p-1">
            {(
              [
                ["photo", "Photo or file"],
                ["text", "Paste text"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`min-h-11 rounded-full text-base font-semibold transition-colors ${
                  tab === key
                    ? "bg-white text-foreground shadow-[0_1px_3px_rgba(20,22,26,0.12),0_1px_1px_rgba(20,22,26,0.04)]"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "photo" ? (
            <div>
              {/* Two inputs: phones open the camera straight away when capture is set, so library/files needs its own. */}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                id="letter-camera"
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              <input
                type="file"
                accept="image/*,application/pdf"
                className="sr-only"
                id="letter-file"
                onChange={(e) => {
                  onFile(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {image ? (
                <div className="space-y-3">
                  {image.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.previewUrl}
                      alt="Preview of your letter"
                      className="max-h-80 w-full rounded-card border border-line-strong bg-white object-contain"
                    />
                  ) : (
                    <div className="flex items-center gap-3 rounded-card bg-sand p-4">
                      <span className="flex h-12 w-10 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">
                        PDF
                      </span>
                      <span className="min-w-0 break-words text-base font-bold">{image.name}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <label
                      htmlFor="letter-file"
                      className="flex min-h-12 flex-1 cursor-pointer items-center justify-center rounded-full border-2 border-line-strong text-base font-semibold hover:border-foreground"
                    >
                      Choose another
                    </label>
                    <button
                      onClick={() => setImage(null)}
                      className="min-h-12 rounded-full border-2 border-line-strong px-6 text-base font-semibold text-muted hover:border-foreground hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : preparing ? (
                <div className="flex min-h-48 items-center justify-center rounded-card border-2 border-dashed border-line-dashed bg-sand-light text-lg font-bold">
                  Preparing…
                </div>
              ) : (
                <div className="grid gap-3">
                  <label
                    htmlFor="letter-camera"
                    className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed border-line-dashed bg-sand-light px-4 py-8 text-center transition-colors hover:border-accent"
                  >
                    <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(20,22,26,0.10)]">
                      <svg aria-hidden width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3.5" />
                      </svg>
                    </span>
                    <span className="text-lg font-bold">Take a photo</span>
                    <span className="mt-1 text-base text-muted">Lay the letter flat in good light</span>
                  </label>
                  <label
                    htmlFor="letter-file"
                    className="flex min-h-14 cursor-pointer items-center justify-center gap-3 rounded-card border-2 border-line-strong bg-white px-4 py-3 text-base font-semibold transition-colors hover:border-foreground"
                  >
                    <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                      <path d="M12 16V4M7 9l5-5 5 5" />
                      <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
                    </svg>
                    <span className="leading-snug">
                      Choose from library or files <span className="block font-normal text-muted">(photo or PDF)</span>
                    </span>
                  </label>
                </div>
              )}
              <Tip>
                Tip: you can cover your name, address and reference numbers before taking the photo. The app doesn&apos;t
                need them.
              </Tip>
            </div>
          ) : (
            <div>
              <label htmlFor="letter-text" className="sr-only">
                Letter text
              </label>
              <textarea
                id="letter-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste the text of your letter here…"
                rows={9}
                className="block w-full resize-y rounded-card border-2 border-line-strong bg-white p-4 text-base outline-none placeholder:text-muted focus:border-accent"
              />
              <Tip>Tip: you can remove your name, address and reference numbers first. The app doesn&apos;t need them.</Tip>
            </div>
          )}

          <fieldset className="mt-8">
            <legend className="label mb-3 text-muted">Explain it in</legend>
            <div className="grid grid-cols-2 gap-1 rounded-full bg-sand p-1">
              {(
                [
                  ["English", "English"],
                  ["Spanish", "Español"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={language === value}
                  onClick={() => setLanguage(value)}
                  className={`min-h-11 rounded-full text-base font-semibold transition-colors ${
                    language === value ? "bg-foreground text-white" : "text-muted hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-card bg-sand p-4">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-5 w-5 shrink-0 accent-[#DA000C]"
            />
            <span className="text-base">
              I understand my letter is sent to Google&apos;s Gemini AI to create this summary and is not stored by Gib
              Letter Decoder.
            </span>
          </label>

          <button
            onClick={decode}
            disabled={!canDecode}
            className={`mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full px-6 text-[17px] font-semibold transition-colors ${
              loading
                ? "cursor-wait bg-accent text-white"
                : "bg-accent text-white enabled:hover:bg-accent-dark disabled:cursor-not-allowed disabled:bg-disabled disabled:text-disabled-ink"
            }`}
          >
            {loading ? (
              <>
                <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" />
                Reading your letter…
              </>
            ) : (
              "Decode letter"
            )}
          </button>
          {!consent && hasInput && (
            <p className="mt-3 text-center text-base text-muted">Tick the box above to continue.</p>
          )}
        </section>

        {error && !loading && (
          <div role="alert" className="mt-6 rounded-card border border-accent/25 bg-accent-soft p-5">
            <p className="text-lg font-bold leading-snug text-accent-dark">{error}</p>
            <button
              onClick={retry}
              className="mt-4 min-h-12 rounded-full bg-accent px-8 text-base font-semibold text-white hover:bg-accent-dark"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={resultRef} className="scroll-mt-4">
          {result && <ResultCard key={JSON.stringify(result.data)} data={result.data} language={result.language} loading={loading} onSwitch={switchLanguage} />}
        </div>
      </main>

      <footer className="border-t border-line px-4 py-8 text-center text-base text-muted">
        Guide only, not legal or financial advice. Nothing you upload is stored.{" "}
        <Link href="/privacy" className="font-bold text-foreground underline underline-offset-4">
          Privacy
        </Link>
      </footer>
    </div>
  );
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 flex items-start gap-2 text-base text-muted">
      <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-[3px] shrink-0">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v5M12 7.5v.01" />
      </svg>
      <span>{children}</span>
    </p>
  );
}

function ResultCard({
  data,
  language,
  loading,
  onSwitch,
}: {
  data: Decoded;
  language: Language;
  loading: boolean;
  onSwitch: () => void;
}) {
  const t = LABELS[language];
  const [done, setDone] = useState<Record<number, boolean>>({});

  if (!data.is_letter) {
    return (
      <div className="mt-8 rounded-card bg-sand p-6 text-center">
        <p className="text-lg font-bold">{t.notLetter}</p>
      </div>
    );
  }

  const days = data.deadline ? daysUntil(data.deadline) : null;
  const badge =
    days === null
      ? null
      : days < 0
        ? { text: t.passed, cls: "bg-[#5b0005] text-white" }
        : days <= 7
          ? { text: t.daysLeft(days), cls: "bg-accent text-white" }
          : days <= 14
            ? { text: t.daysLeft(days), cls: "bg-amber text-foreground" }
            : { text: t.daysLeft(days), cls: "bg-green text-white" };

  const actions = data.actions?.filter((a) => a && a.trim()) ?? [];

  return (
    <article lang={language === "Spanish" ? "es" : "en"} className="mt-10 border-t border-line pt-8">
      <p className="inline-flex items-start gap-2 rounded-[24px] bg-sand px-4 py-2 text-base text-muted">
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="mt-[3px] shrink-0 text-accent">
          <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5z" />
          <path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z" />
        </svg>
        <span>{t.aiLabel}</span>
      </p>

      <div className={`mt-2 divide-y divide-line transition-opacity ${loading ? "opacity-50" : ""}`}>
        {(data.letter_type || data.sender) && (
          <Section title={t.what}>
            {data.letter_type && (
              <p className="font-display text-[22px] font-bold leading-snug tracking-[-0.02em] first-letter:uppercase">
                {data.letter_type}
              </p>
            )}
            {data.sender && (
              <p className="mt-2 text-base text-muted">
                {t.from}: <span className="font-semibold text-foreground">{data.sender}</span>
              </p>
            )}
          </Section>
        )}

        {actions.length > 0 && (
          <Section title={t.todo}>
            <ul className="space-y-1">
              {actions.map((action, i) => (
                <li key={i}>
                  <label className="-mx-2 flex cursor-pointer items-start gap-3 rounded-[12px] p-2 hover:bg-sand">
                    <input
                      type="checkbox"
                      checked={!!done[i]}
                      onChange={(e) => setDone((d) => ({ ...d, [i]: e.target.checked }))}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#DA000C]"
                    />
                    <span className={`block text-base first-letter:uppercase ${done[i] ? "text-muted line-through" : ""}`}>{action}</span>
                  </label>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {(data.deadline || data.amount_due) && (
          <div className="py-6">
            <div className="rounded-card bg-sand p-5">
              {data.deadline && (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="label text-accent">{t.deadline}</h2>
                    {badge && (
                      <span className={`inline-block rounded-full px-3 py-1 text-[15px] font-bold leading-tight ${badge.cls}`}>
                        {badge.text}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 font-display text-[32px] font-bold leading-[1.1] tracking-[-0.02em] first-letter:uppercase">
                    {formatDate(data.deadline, language)}
                  </p>
                </>
              )}
              {data.amount_due && (
                <div
                  className={`flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 ${
                    data.deadline ? "mt-5 border-t border-line-strong pt-4" : ""
                  }`}
                >
                  <h2 className="label text-accent">{t.amount}</h2>
                  <p className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em]">{data.amount_due}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {data.summary && (
          <Section title={t.summary}>
            <p className="text-base first-letter:uppercase">{data.summary}</p>
          </Section>
        )}

        {data.contact && (
          <Section title={t.contact}>
            <p className="whitespace-pre-line break-words rounded-card border border-line-strong bg-white p-4 text-base">
              {data.contact}
            </p>
          </Section>
        )}

        {data.unclear_parts && (
          <Section title={t.unclear}>
            <p className="rounded-card border border-amber-line bg-amber-soft p-4 text-base text-amber-ink">{data.unclear_parts}</p>
          </Section>
        )}
        {data.background && (
          <Section title={t.background}>
            <p className="text-base">{data.background}</p>
            <p className="mt-2 text-base text-muted">{t.backgroundNote}</p>
          </Section>
        )}

        {data.help_links && data.help_links.length > 0 && (
          <Section title={t.help}>
            <ul className="space-y-2">
              {data.help_links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-14 items-center justify-between gap-3 rounded-card border border-line-strong bg-white px-4 py-3 text-base font-semibold transition-colors hover:border-accent"
                  >
                    <span>{link.name}</span>
                    <span aria-hidden className="shrink-0 text-lg text-accent">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>
        )}
      </div>

      <div className="border-t border-line pt-6">
        <button
          onClick={onSwitch}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-2 border-foreground text-[17px] font-semibold transition-colors hover:bg-sand disabled:opacity-50"
        >
          {loading ? "…" : t.switchTo}
        </button>
      </div>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6">
      <h2 className="label mb-3 text-accent">{title}</h2>
      {children}
    </section>
  );
}
