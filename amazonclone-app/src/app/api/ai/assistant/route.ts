import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY =
  process.env.GROQ_API_KEY ||
  process.env.NEXT_PUBLIC_GROQ_API_KEY ||
  '';

const GROQ_MODEL =
  process.env.NEXT_PUBLIC_GROQ_MODEL || 'openai/gpt-oss-120b';

const FALLBACK_MODELS = ['openai/gpt-oss-20b', 'qwen/qwen3.8-27b'];

const SYSTEM_PROMPT = `You are Valenza AI Concierge, the official digital luxury advisor and personal stylist for Valenza Haute Maison (an ultra-premium luxury marketplace for Swiss timepieces, fine jewelry, haute couture fashion, artisan home living, and private reserve fragrances).

Key Guidelines:
1. Tone & Voice: Sophisticated, courteous, warm, and highly knowledgeable. Use clear, medium-level natural English that is easy and enjoyable to read. Avoid overly convoluted jargon, but maintain a polished luxury persona.
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
   - Keep answers clear, structured, and insightful (2 to 4 paragraphs, tables, or bullet points).
   - Use clean Markdown with bolding, bullet points, and clickable markdown links (e.g. [Explore Timepieces](/category/electronics) or [View Privileges](/deals)).
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { success: false, error: 'Invalid messages array' },
        { status: 400 },
      );
    }

    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    ];

    const modelsToTry = [GROQ_MODEL, ...FALLBACK_MODELS];
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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

        if (response.ok) {
          const data = await response.json();
          const answer =
            data.choices?.[0]?.message?.content ||
            'How may I assist you with your luxury inquiries today?';
          return NextResponse.json({ success: true, message: answer, modelUsed: model });
        } else {
          const errText = await response.text();
          console.warn(`[Groq AI Model ${model} failed]:`, errText);
          lastError = errText;
        }
      } catch (callErr) {
        console.warn(`[Groq AI Model ${model} exception]:`, callErr);
        lastError = callErr;
      }
    }

    console.error('[Groq AI All Models Failed]:', lastError);
    return NextResponse.json(
      {
        success: true,
        message:
          "Welcome to Valenza Maison. I am pleased to assist you with our curated collections, bespoke styling recommendations, or order inquiries. How may I assist your acquisition today? Feel free to explore our [Curated Privileges](/deals) or [Haute Horlogerie](/category/electronics).",
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error('[API /api/ai/assistant] error:', error);
    return NextResponse.json(
      {
        success: true,
        message:
          "Welcome to Valenza Haute Maison. I am here to guide your luxury selections, from Swiss timepieces to fine jewelry and bespoke tailoring. Feel free to browse our [Latest Collections](/category/fashion) or ask any questions regarding your orders.",
      },
      { status: 200 },
    );
  }
}
