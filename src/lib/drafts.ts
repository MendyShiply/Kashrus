import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { site } from "./site";

export function draftingEnabled() {
  return !!process.env.ANTHROPIC_API_KEY;
}

const MODEL = "claude-opus-5-5";

const SYSTEM = `You write for ${site.name} (${site.hebrewName}), a private community that learns practical kashrus from ${site.founder.name}. Readers are frum Jews who care about kashrus; use the familiar yeshivish English terms the Rav uses (mashgiach, hechsher, bishul Yisroel, bedikas tolaim, etc.).

You turn recordings of the Rav's shiurim into written pieces. Every piece is reviewed and approved by the Rav before anyone sees it, so:
- Stay faithful to what the Rav actually said. Do not add halachic rulings, sources, stringencies or leniencies that are not in the transcript.
- Where the transcript is unclear, garbled, or a halachic point seems incomplete, keep the wording cautious and list it in reviewNotes so the Rav can check it.
- Never name or criticize a specific hechsher, store or restaurant, even if the transcript does.
- Write in clear, warm, plain English. Short paragraphs. Use simple section headings on their own line where helpful. No markdown symbols such as # or **.
- Refer to the Rav in the third person ("the Rav explained...").`;

const SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "A clear, specific title" },
    body: { type: "string", description: "The full text, paragraphs separated by blank lines" },
    reviewNotes: {
      type: "array",
      items: { type: "string" },
      description: "Specific points for the Rav to double check before approving. Empty if none.",
    },
  },
  required: ["title", "body", "reviewNotes"],
  additionalProperties: false,
} as const;

type Draft = { title: string; body: string; reviewNotes: string[] };

async function draft(instructions: string, material: string): Promise<Draft> {
  const client = new Anthropic();
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 32000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: "high", format: { type: "json_schema", schema: SCHEMA } },
    system: SYSTEM,
    messages: [{ role: "user", content: `${material}\n\n${instructions}` }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") throw new Error("The drafting assistant declined this transcript.");
  if (message.stop_reason === "max_tokens") throw new Error("The draft was too long and got cut off.");
  const text = message.content.find((b) => b.type === "text");
  if (!text || text.type !== "text") throw new Error("No draft came back.");
  return JSON.parse(text.text) as Draft;
}

const KIND_INSTRUCTIONS: Record<string, string> = {
  WRITEUP:
    "Write a shiur write up: a faithful written version of this shiur that someone who missed it could read in about five minutes. Keep the Rav's practical guidance and examples, in the order he gave them.",
  ARTICLE:
    "Write a standalone article built around the most practical, useful point in this shiur. It should make sense to someone who never heard the shiur. About 600 to 900 words.",
};

/** Drafts a write up or article from a video's transcript and sends it to the Rav for approval. */
export async function draftFromVideo(videoId: string, kind: "WRITEUP" | "ARTICLE" = "WRITEUP") {
  const v = await db.video.findUnique({ where: { id: videoId }, include: { category: true } });
  if (!v?.transcript) throw new Error("This video has no transcript yet.");
  const material = [
    `<shiur_title>${v.title}</shiur_title>`,
    v.category ? `<topic>${v.category.title}</topic>` : "",
    v.summary ? `<zoom_summary>\n${v.summary}\n</zoom_summary>` : "",
    `<transcript>\n${v.transcript}\n</transcript>`,
  ].filter(Boolean).join("\n");
  const d = await draft(KIND_INSTRUCTIONS[kind], material);
  return db.article.create({
    data: {
      title: d.title,
      body: d.body,
      kind,
      videoId: v.id,
      status: "PENDING",
      published: false,
      aiGenerated: true,
      reviewNotes: d.reviewNotes.length ? d.reviewNotes.map((n) => `• ${n}`).join("\n") : null,
    },
  });
}

/** Drafts a newsletter from the shiurim and approved articles of the last `days` days. */
export async function draftNewsletter(days = 30) {
  const since = new Date(Date.now() - days * 86400000);
  const [videos, articles] = await Promise.all([
    db.video.findMany({ where: { published: true, createdAt: { gte: since } }, include: { category: true }, orderBy: { createdAt: "asc" } }),
    db.article.findMany({ where: { status: "APPROVED", kind: { not: "NEWSLETTER" }, createdAt: { gte: since } }, orderBy: { createdAt: "asc" } }),
  ]);
  if (videos.length === 0 && articles.length === 0) throw new Error(`Nothing new was posted in the last ${days} days.`);
  const material = [
    ...videos.map((v) => `<shiur title="${v.title}" topic="${v.category?.title || ""}">\n${v.summary || v.description || ""}\n</shiur>`),
    ...articles.map((a) => `<approved_article title="${a.title}">\n${a.body.slice(0, 4000)}\n</approved_article>`),
  ].join("\n\n");
  const d = await draft(
    `Write this month's community newsletter. Open with a short warm note, then one short section per shiur or article above with its key practical takeaway, then a brief closing encouraging members to keep learning and to join the next live shiur. Only use what is in the material above.`,
    material,
  );
  return db.article.create({
    data: {
      title: d.title,
      body: d.body,
      kind: "NEWSLETTER",
      status: "PENDING",
      published: false,
      aiGenerated: true,
      reviewNotes: d.reviewNotes.length ? d.reviewNotes.map((n) => `• ${n}`).join("\n") : null,
    },
  });
}

/** Called after a transcript arrives: makes one write up per video, once. Errors are logged, never thrown. */
export async function autoDraftForVideo(videoId: string) {
  if (!draftingEnabled()) return;
  try {
    const exists = await db.article.findFirst({ where: { videoId, aiGenerated: true } });
    if (!exists) await draftFromVideo(videoId, "WRITEUP");
  } catch (e) {
    console.error("Auto draft failed for video", videoId, e);
  }
}
