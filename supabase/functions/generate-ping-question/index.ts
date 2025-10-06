import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { senderUserId, targetUserId } = await req.json();

    if (!targetUserId) {
      throw new Error('Target user ID is required');
    }

    // Initialize Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Fetch target profile (always required)
    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('display_name, bio, skills, interests, company, job_title, location, work_experience')
      .eq('user_id', targetUserId)
      .single();

    if (!targetProfile) {
      throw new Error('Could not fetch target profile');
    }

    // Fetch sender profile if authenticated
    let senderProfile = null;
    if (senderUserId) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('display_name, bio, skills, interests, company, job_title, location, work_experience')
        .eq('user_id', senderUserId)
        .single();
      senderProfile = data;
    }

    // Craft the AI prompt based on whether sender is authenticated
    let systemPrompt: string;
    let userPrompt: string;

    if (senderProfile) {
      // Both profiles available - personalized between two people
      systemPrompt = `You are a brilliant networking facilitator. Generate ONE concise, creative question that sparks genuine connection.

Rules:
- Maximum TWO lines - be concise and punchy
- Generate ONLY the question itself, no preamble
- Be impactful, human, creative, and intriguing
- Focus on shared interests, complementary skills, or collaboration opportunities
- Avoid generic openers - make it personal and specific
- Keep it conversational and authentic, never corporate or stiff
- If they share skills/industry, explore unique approaches or perspectives
- If complementary skills, explore unexpected synergies`;

      userPrompt = `Generate a tailored conversation starter between:

Person A (${senderProfile.display_name}):
- Bio: ${senderProfile.bio || 'Not provided'}
- Skills: ${senderProfile.skills?.join(', ') || 'Not provided'}
- Interests: ${senderProfile.interests?.join(', ') || 'Not provided'}
- Role: ${senderProfile.job_title || 'Not provided'} at ${senderProfile.company || 'Not provided'}
- Location: ${senderProfile.location || 'Not provided'}

Person B (${targetProfile.display_name}):
- Bio: ${targetProfile.bio || 'Not provided'}
- Skills: ${targetProfile.skills?.join(', ') || 'Not provided'}
- Interests: ${targetProfile.interests?.join(', ') || 'Not provided'}
- Role: ${targetProfile.job_title || 'Not provided'} at ${targetProfile.company || 'Not provided'}
- Location: ${targetProfile.location || 'Not provided'}

Generate ONE unique question from Person A to Person B that explores their shared interests, complementary expertise, or potential collaboration opportunities.`;
    } else {
      // Only target profile - generate an engaging question anyone could ask
      systemPrompt = `You are a brilliant networking facilitator. Generate ONE concise conversation starter for connecting with this professional.

Rules:
- Maximum TWO lines - be concise and punchy
- Generate ONLY the question itself, no preamble
- Be impactful, human, creative, and intriguing
- Be specific to their background, skills, and unique perspective
- Avoid generic openers - make them feel valued and interesting
- Keep it conversational and authentic, never corporate or stiff
- Focus on their expertise or what makes them unique`;

      userPrompt = `Generate an engaging conversation starter for reaching out to:

${targetProfile.display_name}:
- Bio: ${targetProfile.bio || 'Not provided'}
- Skills: ${targetProfile.skills?.join(', ') || 'Not provided'}
- Interests: ${targetProfile.interests?.join(', ') || 'Not provided'}
- Role: ${targetProfile.job_title || 'Not provided'} at ${targetProfile.company || 'Not provided'}
- Location: ${targetProfile.location || 'Not provided'}
- Experience: ${JSON.stringify(targetProfile.work_experience || [])}

Generate ONE unique, thoughtful question that would make for a great conversation starter.`;
    }

    // Call OpenAI API
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    console.log('Generating question with OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9,
        max_tokens: 200
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const question = data.choices[0].message.content.trim();

    console.log('Generated question:', question);

    return new Response(
      JSON.stringify({ question }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error generating question:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});