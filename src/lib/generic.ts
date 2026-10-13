// Server-only: what a generic LLM says from fame alone (no Qloo data), for the fame-vs-fit contrast.
const MODEL = "gemini-2.5-flash";
const cache = new Map<string, Record<string, { score: number; line: string }>>();

export const genericConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export async function genericScores(audience: string[], headliners: string[], sponsors: string[]) {
  const key = JSON.stringify([audience, headliners, sponsors]).toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;

  const prompt = `You advise an event organizer using general knowledge only (fame, reputation, reach).
Audience favourites: ${audience.join(", ")}.
Rate ONLY the headliner and sponsor candidates listed below (not the audience favourites), each 0-100 for how good a booking/sponsor choice it is for this event, with ONE short sentence (max 14 words) justifying it.
Headliners: ${headliners.join(", ") || "none"}.
Sponsors: ${sponsors.join(", ") || "none"}.`;
  const schema = {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: { name: { type: "STRING" }, score: { type: "INTEGER" }, line: { type: "STRING" } },
      required: ["name", "score", "line"],
    },
  };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": process.env.GEMINI_API_KEY ?? "", "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0,
        thinkingConfig: { thinkingBudget: 0 },
      },
    }),
  });
  if (!r.ok) throw new Error(`Gemini ${r.status}`);
  const j = (await r.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = j.candidates?.[0]?.content?.parts?.[0]?.text;
  const rows = JSON.parse(text ?? "[]") as { name: string; score: number; line: string }[];
  const out: Record<string, { score: number; line: string }> = {};
  for (const x of rows) out[x.name.toLowerCase()] = { score: Math.max(0, Math.min(100, x.score)), line: x.line };
  cache.set(key, out);
  return out;
}
