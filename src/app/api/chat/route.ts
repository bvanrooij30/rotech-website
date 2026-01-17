import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { SYSTEM_PROMPT } from "@/lib/ai/system-prompt";

// Edge runtime voor snellere responses
export const runtime = "edge";

// Rate limiting: simpele in-memory store (voor productie: gebruik Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 20; // Max 20 berichten per 15 minuten
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minuten

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    // Check for API key
    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Chat is momenteel niet beschikbaar" }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for") || 
               req.headers.get("x-real-ip") || 
               "unknown";

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: "Te veel berichten. Probeer het over een paar minuten opnieuw." }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages } = await req.json();

    // Valideer messages
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Ongeldige request" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Beperk de conversatie lengte
    const recentMessages = messages.slice(-10);

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: SYSTEM_PROMPT,
      messages: recentMessages,
      maxTokens: 500,
      temperature: 0.7,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Er ging iets mis. Probeer het opnieuw." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
