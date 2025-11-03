import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, language = 'en', voiceMode = false } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('VITE_GEMINI_API_KEY') || Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Map language codes to full language names
    const languageMap: Record<string, string> = {
      'en': 'English',
      'hi': 'Hindi',
      'mr': 'Marathi',
      'es': 'Spanish',
      'fr': 'French',
      'zh': 'Chinese (Simplified)',
      'ar': 'Arabic',
      'pt': 'Portuguese',
      'bn': 'Bengali',
      'ta': 'Tamil',
    };

    const languageName = languageMap[language] || languageMap['en'];

    // Build system instruction
    const systemInstruction = voiceMode
      ? `You are a helpful agricultural expert. Respond ONLY in ${languageName}. Keep responses EXTREMELY SHORT (2-3 sentences, 30-50 words). Be direct and actionable. NO markdown formatting.`
      : `You are a helpful agricultural expert. Respond ONLY in ${languageName}. Keep answers SHORT (100-150 words). Provide clear, practical advice about crops and farming.`;

    // Convert messages format for Gemini
    const geminiContents = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: geminiContents,
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          maxOutputTokens: voiceMode ? 150 : 500,
          temperature: 0.3,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Chat error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
