import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PING! CORE SYSTEM PROMPT IMPLEMENTATION
// This function powers the Ping! conversation engine with context-aware questions

type Mode = 'generate_openers' | 'followup_nudge' | 'event_digest_copy' | 'guest_view_copy';
type EventType = 'startup_mixer' | 'career_fair' | 'conference' | 'class' | 'social';
type Stage = 'icebreaker' | 'warm' | 'deep';
type QuestionLevel = 'L1_discovery' | 'L2_bridge' | 'L3_catalyst';
type QuestionStyle = 'soft_curiosity' | 'shared_interest' | 'opportunity_probe' | 'playful_personal';

type PingContext = {
  event_name?: string;
  event_type?: EventType;
  noise_level?: number; // 0=quiet, 3=loud
  time_budget_min?: number;
  stage?: Stage;
  city?: string;
};

type Profile = {
  name?: string;
  role?: string;
  company?: string;
  school?: string;
  interests?: string[];
  goals_next_90_days?: string[];
  recent_win?: string;
  help_offer?: string[];
};

type Preferences = {
  allow_playful?: boolean;
  include_favorites?: boolean;
  temporal_focus?: 'present' | 'near_future';
  vulnerability_level?: 'low' | 'med' | 'high';
};

type NotesContext = {
  my_note_about_them?: string;
  overlaps_detected?: string[];
};

type PingQuestion = {
  level: QuestionLevel;
  style: QuestionStyle;
  text: string;
  why_it_works: string;
  follow_up: string;
  flags: {
    loud_safe: boolean;
    time_safe: boolean;
    boundary_ok: boolean;
  };
};

type PingQuestionSet = {
  summary: {
    detected_commonalities: string[];
    detected_complements: string[];
    context_notes: string;
  };
  questions: PingQuestion[];
  top_picks: number[];
};

const RED_ZONE = ['politics', 'religion', 'health', 'trauma', 'salary', 'appearance'];
const MAX_WORDS_ICEBREAKER_LOUD = 14;

function detectCommonalities(you: Profile, other?: Profile): string[] {
  if (!other) return [];
  const overlaps: string[] = [];
  
  // Interest overlaps
  const yourInterests = new Set((you.interests || []).map(i => i.toLowerCase()));
  const theirInterests = new Set((other.interests || []).map(i => i.toLowerCase()));
  yourInterests.forEach(interest => {
    if (theirInterests.has(interest)) overlaps.push(interest);
  });
  
  // School/company overlaps
  if (you.school && other.school && you.school.toLowerCase() === other.school.toLowerCase()) {
    overlaps.push(you.school);
  }
  if (you.company && other.company && you.company.toLowerCase() === other.company.toLowerCase()) {
    overlaps.push(you.company);
  }
  
  return overlaps;
}

function detectComplements(you: Profile, other?: Profile): string[] {
  if (!other) return [];
  const complements: string[] = [];
  
  // Help offers that match their goals
  const yourOffers = (you.help_offer || []).map(h => h.toLowerCase());
  const theirGoals = (other.goals_next_90_days || []).map(g => g.toLowerCase());
  
  yourOffers.forEach(offer => {
    theirGoals.forEach(goal => {
      if (goal.includes(offer) || offer.includes(goal)) {
        complements.push(`${offer} → ${goal}`);
      }
    });
  });
  
  return complements;
}

async function generatePingQuestions(input: {
  mode: Mode;
  context: PingContext;
  you: Profile;
  other?: Profile;
  prefs?: Preferences;
  notes_context?: NotesContext;
}): Promise<PingQuestionSet> {
  const { context, you, other, prefs = {}, notes_context = {} } = input;
  
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const commonalities = detectCommonalities(you, other);
  const complements = detectComplements(you, other);
  const loud = (context.noise_level || 0) >= 2;
  const timeConstrained = (context.time_budget_min || 15) <= 2;
  
  // Core Ping! system prompt
  const systemPrompt = `ROLE: You are the Ping! Core Agent powering the conversation engine.

IDENTITY & PHILOSOPHY:
- Curiosity > agenda. Human-first, non-cringey, inclusive.
- Ladder depth: start safe → escalate only with positive signals
- Ask WHAT/HOW early; reserve WHY for later or when comfort is explicit
- Always attach ONE short follow-up line tied to {{their_last_point}}
- Avoid red-zone topics: ${RED_ZONE.join(', ')}
- Optimize for noisy rooms and limited time
- Must work even if other person is not a Ping! user

OUTPUT: Valid JSON only matching PingQuestionSet schema.

RULES:
- Produce 3-5 questions total; exactly ONE playful max if allowed
- Always include one opportunity_probe that offers help non-instrumentally
- Never stack multiple questions in one line
- Keep Q1 ≤${loud ? MAX_WORDS_ICEBREAKER_LOUD : 20} words if loud/time-constrained
- Stage=icebreaker: focus L1_discovery + opportunity_probe
- Use natural language for 18-28 y/o students/young pros in Boston
- Reference {{their_last_point}} in ALL follow_ups`;

  const userPrompt = `Generate conversation openers for this context:

CONTEXT: ${JSON.stringify(context)}
YOU: ${JSON.stringify(you)}
OTHER: ${JSON.stringify(other || {})}
PREFERENCES: ${JSON.stringify(prefs)}
NOTES: ${JSON.stringify(notes_context)}

DETECTED:
- Commonalities: ${commonalities.join(', ') || 'none'}
- Complements: ${complements.join(', ') || 'none'}

Return JSON matching this exact schema:
{
  "summary": {
    "detected_commonalities": ["string"],
    "detected_complements": ["string"], 
    "context_notes": "string"
  },
  "questions": [
    {
      "level": "L1_discovery" | "L2_bridge" | "L3_catalyst",
      "style": "soft_curiosity" | "shared_interest" | "opportunity_probe" | "playful_personal",
      "text": "string",
      "why_it_works": "string",
      "follow_up": "string with {{their_last_point}}",
      "flags": { "loud_safe": true, "time_safe": true, "boundary_ok": true }
    }
  ],
  "top_picks": [0,1,2]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      max_completion_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', response.status, errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('OpenAI response data:', JSON.stringify(data, null, 2));
  
  const content = data.choices?.[0]?.message?.content;
  
  if (!content) {
    console.error('No content in response:', data);
    throw new Error('No content returned from OpenAI');
  }

  try {
    const result = JSON.parse(content);
    
    // Validate and ensure structure
    if (!result.questions || !Array.isArray(result.questions)) {
      throw new Error('Invalid response structure');
    }

    // Apply final constraints
    result.questions = result.questions.map((q: any) => ({
      ...q,
      text: loud && q.text.split(' ').length > MAX_WORDS_ICEBREAKER_LOUD 
        ? q.text.split(' ').slice(0, MAX_WORDS_ICEBREAKER_LOUD).join(' ') + '?'
        : q.text,
      flags: {
        loud_safe: loud ? q.text.split(' ').length <= MAX_WORDS_ICEBREAKER_LOUD : true,
        time_safe: timeConstrained ? q.level === 'L1_discovery' : true,
        boundary_ok: !RED_ZONE.some(topic => q.text.toLowerCase().includes(topic))
      }
    }));

    return result;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', error, content);
    throw new Error('Failed to parse AI response');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData = await req.json();
    
    // Support both new Ping! format and legacy format
    let input;
    
    if (requestData.mode) {
      // New Ping! format
      input = requestData;
    } else {
      // Legacy format - convert to new format
      const {
        contactName,
        contactProfile,
        conversationContext,
        sharedInterests,
        eventType = "conference",
        noiseLevel = 1,
        timeBudget = 15,
        stage = "icebreaker",
        city = "Boston"
      } = requestData;

      input = {
        mode: 'generate_openers' as Mode,
        context: {
          event_type: eventType as EventType,
          noise_level: noiseLevel,
          time_budget_min: timeBudget,
          stage: stage as Stage,
          city
        },
        you: {
          name: "User",
          interests: Array.isArray(sharedInterests) ? sharedInterests : []
        },
        other: contactName ? {
          name: contactName,
          role: contactProfile
        } : undefined,
        prefs: {
          allow_playful: true,
          include_favorites: true,
          temporal_focus: 'present' as const,
          vulnerability_level: 'low' as const
        }
      };
    }

    const result = await generatePingQuestions(input);

    // Convert to legacy format for backward compatibility
    const questions = result.questions.map((q, index) => ({
      text: q.text,
      category: q.style === 'opportunity_probe' ? 'opportunity' : 
                q.style === 'playful_personal' ? 'fun' :
                q.style === 'shared_interest' ? 'interests' : 'project',
      depth: q.level === 'L1_discovery' ? 1 : q.level === 'L2_bridge' ? 2 : 3,
      follow_up: q.follow_up,
      rationale: q.why_it_works,
      research_tags: [q.style, q.level]
    }));

    return new Response(
      JSON.stringify({ 
        questions,
        ping_result: result // Include full new format for future use
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating questions:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        questions: [] // Return empty array instead of fallbacks to maintain quality
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});