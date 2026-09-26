// ============================================================================
// Valenza AI Concierge Service
// Multi-Tier Groq AI Inference: openai/gpt-oss-120b -> openai/gpt-oss-20b -> qwen/qwen3.8-27b
// ============================================================================

const GROQ_API_KEY =
  process.env.NEXT_PUBLIC_GROQ_API_KEY ||
  process.env.GROQ_API_KEY ||
  '';

const GROQ_MODELS = [
  process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b',
];

const SYSTEM_PROMPT = `You are Valenza AI Concierge, the official digital luxury advisor and personal stylist for Valenza Haute Maison (an ultra-premium luxury marketplace for Swiss timepieces, fine jewelry, haute couture fashion, artisan home living, and private reserve fragrances).

Key Guidelines:
1. Tone & Voice: Sophisticated, courteous, warm, and highly knowledgeable. Use clear, medium-level natural English that is easy and enjoyable to read for every customer. Avoid overly convoluted jargon, but maintain a polished luxury persona.
2. Store Knowledge:
   - Timepieces & Haute Horlogerie: skeleton tourbillons, perpetual calendars, Swiss mechanical art (/category/electronics).
   - High Jewelry & Gemstones: certified solitaires, royal blue sapphires, emeralds, 18k Fairmined gold (/category/beauty).
   - Haute Couture & Sartorial Fashion: cashmere capes, Italian silk tailoring, runway edits (/category/fashion).
   - Maison Art & Living: Murano crystal, sculptural lighting, Grasse fragrance diffusers (/category/home-garden).
   - Motoring & Collectibles (/category/sports).
3. Assistance Capabilities:
   - Styling & Gift Recommendations: Curate personalized suggestions for anniversaries, galas, executive gifts, and bespoke commissions.
   - Order Tracking & Delivery: White-glove insured delivery, status tracking at [/orders](/orders).
   - Returns & Authenticity: 30-day discreet returns at [/returns](/returns), all items include GIA/Swiss dossiers.
   - Privileges & Offers: Special exhibition pricing at [/deals](/deals), digital coupons at [/coupons](/coupons). Active promo codes include \`MAISON20\` and \`ATELIER20\` for 20% off.
   - Customer Concierge: 24/7 private client support at [/customer-service](/customer-service).
4. Formatting:
   - Keep answers structured, insightful, and easy to skim (2 to 4 paragraphs, tables, or bullet points).
   - Use clean Markdown with bolding, bullet points, and clickable markdown links (e.g. [Explore Timepieces](/category/electronics) or [View Privileges](/deals)).
`;

export interface ChatMessageItem {
  role: 'user' | 'assistant';
  content: string;
}

export async function askAiConcierge(
  messages: ChatMessageItem[],
): Promise<{ success: boolean; message: string; modelUsed?: string }> {
  // 1. Try local Next.js API route first
  try {
    const res = await fetch('/api/ai/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.message) {
        return data;
      }
    }
  } catch {
    // Continue to direct Groq API fallback
  }

  // 2. Direct Groq API multi-tier inference
  const groqMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  ];

  for (const model of GROQ_MODELS) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: groqMessages,
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim()) {
          return { success: true, message: content, modelUsed: model };
        }
      }
    } catch (err) {
      console.warn(`[Groq direct call ${model} error]:`, err);
    }
  }

  return {
    success: true,
    message:
      "Welcome to Valenza Maison. I am pleased to assist you with our curated collections, bespoke styling recommendations, or order inquiries. How may I assist your acquisition today? Feel free to explore our [Curated Privileges](/deals) or [Haute Horlogerie](/category/electronics).",
  };
}
