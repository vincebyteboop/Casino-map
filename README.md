# Vince Halloran's AI

A Next.js chat app for **Vince Halloran's AI** — an AI persona specializing in sports "locks" (high-confidence betting picks). Backed by the Anthropic API (Claude).

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the env file and add your Anthropic API key:

   ```bash
   cp .env.example .env.local
   ```

   Then edit `.env.local` and set `ANTHROPIC_API_KEY` to a real key from the [Anthropic Console](https://console.anthropic.com/).

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and chat with Vince Halloran's AI.

## How it works

- `app/page.tsx` — chat UI, streams responses from `/api/chat`.
- `app/api/chat/route.ts` — server route that calls the Anthropic API with a system prompt defining the "Vince Halloran's AI" persona: a confident sports handicapper who gives picks with a confidence level and reasoning, while including responsible-gambling guardrails (no guaranteed picks, redirects users showing signs of problem gambling to help resources, refuses to assist with underage or illegal betting).

## Notes

- The model has no live sports data feed — it reasons from handicapping principles and whatever context you give it in the chat, and is instructed not to invent specific stats, injuries, or odds as if verified.
- This app is for entertainment purposes and does not constitute betting advice.
