import type { Metadata } from "next";
import Link from "next/link";
import { LogoMark } from "../_components/logo-mark";

export const metadata: Metadata = {
  title: "Privacy · Gib Letter Decoder",
  description: "How Gib Letter Decoder handles your letters. Cómo tratamos tus cartas.",
};

const CONTACT_EMAIL = "[EMAIL PLACEHOLDER]";

type Complaint = { name: string; detail: string };
type Block = { heading: string; body: React.ReactNode; highlight?: boolean; complaints?: Complaint[] };

const english: Block[] = [
  {
    heading: "Who we are",
    body: (
      <>
        Gib Letter Decoder, run by Yousef, Gibraltar. Contact: {CONTACT_EMAIL}
      </>
    ),
  },
  {
    heading: "What we process",
    body: "The photo or text of the letter you choose to upload, only to create your summary.",
  },
  {
    heading: "Lawful basis",
    body: "Your request to decode the letter and your consent.",
  },
  {
    heading: "Who processes it",
    body: "Google (Gemini API). This is a demo version that uses the free tier of the Gemini API. On the free tier, Google may use what you upload to improve its products, and human reviewers may read it. Data may be processed outside Gibraltar. Please use sample letters only, not real letters with personal details.",
  },
  {
    heading: "Storage",
    highlight: true,
    body: "We store nothing. There is no database, no account and no cookies. Google may keep and use the data under its own Gemini API terms.",
  },
  {
    heading: "Your rights",
    body: "You have the right to access, erasure, objection and to complain. You can complain to the Gibraltar Regulatory Authority (Information Commissioner), or to your local authority, such as the AEPD in Spain.",
    complaints: [
      { name: "Gibraltar Regulatory Authority", detail: "Information Commissioner" },
      { name: "AEPD", detail: "Spain" },
    ],
  },
  {
    heading: "Not advice",
    body: "Gib Letter Decoder is a guide only. It is not legal or financial advice. Always confirm with the office that sent the letter.",
  },
];

const spanish: Block[] = [
  {
    heading: "Quiénes somos",
    body: (
      <>
        Gib Letter Decoder, gestionado por Yousef, Gibraltar. Contacto: {CONTACT_EMAIL}
      </>
    ),
  },
  {
    heading: "Qué datos tratamos",
    body: "La foto o el texto de la carta que tú decides subir, solo para crear tu resumen.",
  },
  {
    heading: "Base legal",
    body: "Tu petición de explicar la carta y tu consentimiento.",
  },
  {
    heading: "Quién los trata",
    body: "Google (API de Gemini). Esta es una versión de demostración que usa el nivel gratuito de la API de Gemini. En el nivel gratuito, Google puede usar lo que subes para mejorar sus productos, y personas revisoras pueden leerlo. Los datos pueden tratarse fuera de Gibraltar. Usa solo cartas de ejemplo, no cartas reales con datos personales.",
  },
  {
    heading: "Almacenamiento",
    highlight: true,
    body: "No guardamos nada. No hay base de datos, ni cuentas, ni cookies. Google puede conservar y usar los datos según sus propias condiciones de la API de Gemini.",
  },
  {
    heading: "Tus derechos",
    body: "Tienes derecho de acceso, supresión, oposición y a presentar una reclamación. Puedes reclamar ante la Gibraltar Regulatory Authority (Information Commissioner) o ante la autoridad de tu país, como la AEPD en España.",
    complaints: [
      { name: "Gibraltar Regulatory Authority", detail: "Information Commissioner" },
      { name: "AEPD", detail: "España" },
    ],
  },
  {
    heading: "No es asesoramiento",
    body: "Gib Letter Decoder es solo una guía. No es asesoramiento legal ni financiero. Confirma siempre con la oficina que envió la carta.",
  },
];

function Column({ title, blocks, lang }: { title: string; blocks: Block[]; lang: string }) {
  const highlight = blocks.find((b) => b.highlight);
  const rest = blocks.filter((b) => !b.highlight);
  return (
    <section lang={lang}>
      <h2 className="mb-4 text-[24px] font-bold leading-tight">{title}</h2>
      {highlight && (
        <div className="flex items-start gap-4 rounded-card bg-foreground p-5 text-white">
          <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <div>
            <h3 className="label text-white/75">{highlight.heading}</h3>
            <p className="mt-1 text-base">{highlight.body}</p>
          </div>
        </div>
      )}
      <dl className="mt-2 divide-y divide-line">
        {rest.map((b) => (
          <div key={b.heading} className="py-5">
            <dt className="label text-accent">{b.heading}</dt>
            <dd className="mt-2 text-base">
              {b.body}
              {b.complaints && (
                <span className="mt-4 grid gap-2 sm:grid-cols-2">
                  {b.complaints.map((c) => (
                    <span key={c.name} className="block rounded-card bg-sand p-4">
                      <span className="block font-display text-[17px] font-bold leading-snug tracking-[-0.02em]">{c.name}</span>
                      <span className="block text-base text-muted">{c.detail}</span>
                    </span>
                  ))}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-xl flex-1 px-4 pb-12 pt-6 sm:pt-10">
      <div className="mb-8 flex items-center gap-3">
        <LogoMark />
        <Link href="/" className="inline-flex min-h-12 items-center text-base font-semibold underline underline-offset-4">
          ← Back to Gib Letter Decoder
        </Link>
      </div>
      <h1 className="mb-3 text-[30px] font-bold leading-[1.1]">Privacy</h1>
      <p className="mb-8 text-lg text-muted">Plain-English privacy notice, with Spanish below.</p>
      <div className="space-y-10">
        <Column title="English" blocks={english} lang="en" />
        <div className="border-t border-line pt-10">
          <Column title="Español" blocks={spanish} lang="es" />
        </div>
      </div>
    </main>
  );
}
