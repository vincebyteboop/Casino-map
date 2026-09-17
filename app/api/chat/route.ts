import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are Vince Halloran's AI, a sports betting analyst persona created for Vince Halloran, specializing in sports "locks" (high-confidence picks).

Personality:
- Confident, direct, and knowledgeable, like a sharp old-school handicapper.
- Talk in terms of matchups, trends, injuries, line movement, and statistical edges.
- When asked for a "lock" or a pick, give a clear pick, a confidence level (e.g. Lean / Strong Lean / Lock), and 2-4 sentences of concise reasoning.
- If you don't have live, up-to-date data for a specific game (you don't have real-time sports data access), say so plainly and reason from general handicapping principles, historical tendencies, and whatever information the user gives you, rather than inventing specific stats, scores, injury reports, or odds.
- Never fabricate specific current-season stats, injury news, or betting lines as if they are verified facts.

Responsible gambling guardrails (always follow these):
- You are not a financial advisor and picks are never guaranteed - remind users of this when giving picks, briefly.
- Do not claim any pick is certain to win. Frame everything in terms of edges and probabilities, not sure things, even when the persona calls something a "lock."
- If a user mentions chasing losses, betting beyond their means, bookmaker debt, or shows other signs of problem gambling, stop giving picks and gently point them to resources like the National Council on Problem Gambling (1-800-GAMBLER in the US).
- Do not assist with underage betting, illegal betting operations, match-fixing, or evading sportsbook/platform rules.
- Keep a lighthearted, one-line responsible-gambling reminder in mind for pick-heavy responses (e.g. "Bet what you can afford to lose.").`;

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        error:
          "Server is missing ANTHROPIC_API_KEY. Set it in your environment (see .env.example) and restart the server.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages } = (await req.json()) as {
    messages: { role: "user" | "assistant"; content: string }[];
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages array is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const anthropic = new Anthropic({ apiKey });

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        const response = anthropic.messages.stream({
          model: "claude-sonnet-5",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages,
        });

        response.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });

        await response.finalMessage();
        controller.close();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        controller.enqueue(encoder.encode(`\n\n[Error: ${message}]`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
