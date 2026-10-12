# Headliner

**An agent that tells event organizers who to book and who to sponsor, and shows the evidence.**

> Working title. Built for the [Qloo Agentic Hackathon](https://qloo.devpost.com/). Status: in development.

## The problem

Festivals, conferences and brand activations spend most of their budget on two decisions: who headlines, and which brands sponsor. Both are usually made on gut feel, past ticket sales, or whoever's agent called first. A mismatch is expensive. A sponsor whose brand clashes with the crowd earns no goodwill, and a headliner who doesn't fit the audience leaves tickets unsold.

## What Headliner does

You describe your event and its audience through known interests: artists, brands, places, shows. Then you give Headliner a pool of candidate artists, speakers and sponsor brands. An agent does the legwork:

1. Resolves each entity to a real taste-graph ID with the Qloo API.
2. Pulls cross-domain affinity signals between your audience and every candidate.
3. Cross-references and ranks the candidates by cultural fit.
4. Returns a decision report: a ranked shortlist, **why** each candidate fits (or doesn't), and the signals behind it.

The output is a decision-support report, not a chat window. Every ranking links back to the underlying Qloo data, so an organizer can defend the choice to a client or a board.

## How it uses Qloo

Headliner is built on the Qloo Insights API (`/v2/insights`, with `/search` and `/v2/tags` for entity and tag lookup). Audience interests go in as `signal.interests.*`. Candidate artists, brands and places are scored against them across Qloo's entity types. Qloo supplies all of the taste data.

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS and shadcn/ui
- Claude as the agent's reasoning layer, with tool calls into Qloo
- Hosted on Vercel

## Running locally

```bash
git clone https://github.com/jeretc/qloo-agentic-hackathon.git
cd qloo-agentic-hackathon
cp .env.example .env.local   # then add your own keys
npm install
npm run dev
```

Required environment variables (see `.env.example`):

| Variable | Purpose |
| --- | --- |
| `QLOO_API_KEY` | Qloo hackathon API key |
| `QLOO_API_BASE_URL` | `https://hackathon.api.qloo.com` |
| `ANTHROPIC_API_KEY` | Claude API key for the agent |

No secrets are committed to this repository.

## Live demo

Link will be added at submission.

## License

[MIT](LICENSE)
