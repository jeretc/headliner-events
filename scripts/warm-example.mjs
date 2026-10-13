// Warms the shared cache for the built-in example so the first visitor does not wait.
// Usage: node scripts/warm-example.mjs https://your-deployment-url
const base = process.argv[2];
if (!base) throw new Error("Pass the deployment URL as the first argument");

const seeds = ["Tame Impala", "Fred again..", "Glass Animals", "Aesop", "Patagonia", "Spotify"];
const headliners = ["Khruangbin", "Bonobo", "Billie Eilish", "Post Malone", "Four Tet", "Metallica"];
const sponsors = ["Lululemon", "Red Bull", "Harley-Davidson", "Allbirds", "Walmart"];

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const post = (path, body) =>
  fetch(new URL(path, base), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

const lineup = await post("/api/lineup", {
  eventName: "Skyline Festival",
  seeds: seeds.map((name) => ({ id: slug(name), name })),
  entries: [
    ...headliners.map((name) => ({ id: slug(name), name, kind: "headliner" })),
    ...sponsors.map((name) => ({ id: slug(name), name, kind: "sponsor" })),
  ],
});
const data = await lineup.json();
console.log("lineup", lineup.status, data.source, data.candidates?.length, "candidates");
const names = (kind) => (data.candidates ?? []).filter((c) => c.kind === kind).map((c) => c.name);
const generic = await post("/api/generic", { audience: seeds, headliners: names("headliner"), sponsors: names("sponsor") });
console.log("generic", generic.status);
