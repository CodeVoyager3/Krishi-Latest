import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const { imageUrl, language = 'en' } = await req.json();
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Map language codes to full language names for better AI understanding
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

    console.log('Analyzing crop image:', imageUrl, 'Language:', languageName);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural pathologist specializing in crop disease detection. 
Analyze the provided crop image and identify any diseases or health issues. 

CRITICAL LANGUAGE REQUIREMENTS - READ CAREFULLY:
You MUST respond COMPLETELY in ${languageName}. This is MANDATORY.

TRANSLATION RULES:
1. Disease names: MUST be translated to ${languageName}. For example:
   - "Apple Rot" → translate to ${languageName} (e.g., "सेब सड़न" in Hindi)
   - "Bitter Rot" → translate to ${languageName}
   - "Black Rot" → translate to ${languageName}
   
2. Symptoms and descriptions: EVERY word must be in ${languageName}
   - "circular lesions" → translate completely
   - "dark spots" → translate completely
   - "fungal disease" → translate completely

3. Recommendations: SHORT and CONCISE (3-4 key points maximum). EVERY word must be in ${languageName}
   - Keep it brief - farmers need quick, actionable advice
   - Maximum 100-150 words total
   - Focus on the most important treatments/preventions
   - No English technical terms
   - Translate phrases like "remove infected fruit" to ${languageName}
   - Translate "apply fungicide" to ${languageName}

4. ONLY exceptions: Scientific Latin names (e.g., "Colletotrichum") can stay in Latin

BAD EXAMPLE (DO NOT DO THIS):
{
  "disease_name": "Apple Rot (Bitter Rot or Black Rot)",
  "recommendations": "The apple shows signs of rot. Remove infected fruit."
}

GOOD EXAMPLE (DO THIS - SHORT AND CONCISE):
{
  "disease_name": "सेब सड़न",
  "recommendations": "**उपचार:**\n* संक्रमित फलों को तुरंत हटाएं\n* कवकनाशी का छिड़काव करें\n* पेड़ों के आसपास सफाई रखें"
}

Respond in JSON format - EVERYTHING in ${languageName}: 
{
  "disease_name": "disease name completely in ${languageName}",
  "confidence": number between 0 and 1,
  "severity": "low", "medium", or "high",
  "recommendations": "SHORT, CONCISE recommendations in ${languageName}. Maximum 3-4 key points. Be brief and actionable. Use markdown with **bold** for emphasis. NO ENGLISH WORDS."
}

VERIFY BEFORE RESPONDING: Check that disease_name and recommendations contain ZERO English words (except scientific names).`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this crop image for diseases and provide SHORT, CONCISE recommendations (3-4 key points only).

LANGUAGE REQUIREMENT - MANDATORY:
- Respond ENTIRELY in ${languageName}
- Keep recommendations BRIEF (100-150 words max)
- Translate disease names to ${languageName} (e.g., "Apple Rot" → translate completely)
- Translate ALL symptoms and recommendations to ${languageName}
- NO English words (except scientific Latin names in parentheses)

EXAMPLE: If ${languageName} is Hindi:
- Disease: "सेब सड़न" (not "Apple Rot")
- Recommendations: "**उपचार:**\n* संक्रमित फल हटाएं\n* कवकनाशी छिड़कें" (SHORT and in ${languageName})

IMPORTANT: Keep it SHORT and 100% in ${languageName}.`
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 401) {
        throw new Error('Invalid API key. Check OPENAI_API_KEY.');
      }
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI Response:', content);

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    let result = JSON.parse(jsonMatch[0]);

    // Post-process: Translate any remaining English text in recommendations
    if (language !== 'en' && result.recommendations) {
      // Check if there's English text in recommendations
      const englishPattern = /[A-Za-z]{3,}/;
      if (englishPattern.test(result.recommendations)) {
        console.log('Found English text, translating recommendations...');
        
        try {
          const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              temperature: 0.1,
              messages: [
                {
                  role: 'system',
                  content: `You are a translation assistant. Translate the given text to ${languageName}. Keep the markdown formatting intact. Translate EVERY word including technical terms and disease names. Output ONLY the translated text, nothing else.`
                },
                {
                  role: 'user',
                  content: `Translate this text completely to ${languageName}. Keep all markdown formatting. Translate everything:\n\n${result.recommendations}`
                }
              ],
            }),
          });

          if (translateResponse.ok) {
            const translateData = await translateResponse.json();
            const translatedText = translateData.choices?.[0]?.message?.content?.trim();
            if (translatedText) {
              result.recommendations = translatedText;
              console.log('Translated recommendations:', translatedText);
            }
          }
        } catch (translateError) {
          console.error('Translation error:', translateError);
          // Continue with original recommendations if translation fails
        }
      }

      // Also translate disease_name if it contains English
      if (result.disease_name && englishPattern.test(result.disease_name)) {
        try {
          const translateResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              temperature: 0.1,
              messages: [
                {
                  role: 'system',
                  content: `Translate the disease name to ${languageName}. Output ONLY the translated name, nothing else.`
                },
                {
                  role: 'user',
                  content: `Translate this disease name to ${languageName}: ${result.disease_name}`
                }
              ],
            }),
          });

          if (translateResponse.ok) {
            const translateData = await translateResponse.json();
            const translatedName = translateData.choices?.[0]?.message?.content?.trim();
            if (translatedName) {
              result.disease_name = translatedName;
              console.log('Translated disease name:', translatedName);
            }
          }
        } catch (translateError) {
          console.error('Translation error for disease name:', translateError);
        }
      }
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in detect-disease function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
