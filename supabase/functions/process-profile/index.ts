import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProfileData {
  profile: {
    name: string;
    title: string;
    bio: string;
    location: string;
  };
  experience: Array<{
    company: string;
    position: string;
    duration: string;
    description: string;
    skills_used: string[];
  }>;
  skills: string[];
  interests: string[];
  featured_work: Array<{
    title: string;
    description: string;
    type: string;
    link?: string;
  }>;
  social_links: {
    linkedin?: string;
    instagram?: string;
    website?: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { userId, platforms, seedProfile } = await req.json();
    console.log('Processing profile for user:', userId, 'platforms:', platforms);

    // Create processing job
    const { data: job, error: jobError } = await supabaseClient
      .from('profile_processing_jobs')
      .insert({
        user_id: userId,
        platforms,
        status: 'processing',
        progress: 10
      })
      .select()
      .single();

    if (jobError) {
      throw new Error('Failed to create processing job');
    }

    // Get social media data
    const { data: socialData, error: socialError } = await supabaseClient
      .from('social_media_data')
      .select('*')
      .eq('user_id', userId);

    if (socialError) {
      console.error('Error fetching social data:', socialError);
    }

    // Also fetch any existing profile seed data
    const { data: profileRow } = await supabaseClient
      .from('profiles')
      .select('display_name, bio, linkedin_url, social_links')
      .eq('user_id', userId)
      .maybeSingle();

    const seed = {
      displayName: profileRow?.display_name,
      bio: profileRow?.bio,
      linkedin: profileRow?.linkedin_url,
      social_links: profileRow?.social_links,
      ...(seedProfile || {})
    };

    // Update progress
    await supabaseClient
      .from('profile_processing_jobs')
      .update({ progress: 30 })
      .eq('id', job.id);

    // Process data with AI
    const profileData = await generateProfileWithAI((socialData || []), seed);

    // Update progress
    await supabaseClient
      .from('profile_processing_jobs')
      .update({ progress: 70 })
      .eq('id', job.id);

    // Split name into first and last name
    const nameParts = profileData.profile.name.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        display_name: profileData.profile.name,
        bio: profileData.profile.bio,
        location: profileData.profile.location,
        company: profileData.experience[0]?.company,
        job_title: profileData.profile.title,
        skills: profileData.skills,
        interests: profileData.interests,
        experience: profileData.experience,
        featured_work: profileData.featured_work,
        social_links: profileData.social_links,
        ai_processed: true,
        profile_completeness: calculateCompleteness(profileData),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (updateError) {
      throw new Error('Failed to update profile');
    }

    // Complete processing job
    await supabaseClient
      .from('profile_processing_jobs')
      .update({ 
        status: 'completed',
        progress: 100
      })
      .eq('id', job.id);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Profile processed successfully',
      profileData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Profile processing error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProfileWithAI(socialData: any[], seed: any): Promise<ProfileData> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = buildPrompt(socialData, seed);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: 'You are an expert profile analyst for a professional networking platform. Create comprehensive, engaging profiles that highlight networking potential.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('OpenAI API error:', data);
    throw new Error('Failed to generate profile with AI');
  }

  try {
    const content: string = data?.choices?.[0]?.message?.content ?? '';
    try {
      return JSON.parse(content);
    } catch (_e) {
      const cleaned = content
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();
      return JSON.parse(cleaned);
    }
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return createFallbackProfile();
  }
}

function buildPrompt(socialData: any[], seed: any): string {
  return `
Analyze the following user-provided data and social media context to create a networking profile:

USER PROVIDED PROFILE DATA (may be partial):
${JSON.stringify(seed || {}, null, 2)}

SOCIAL MEDIA DATA (may be empty):
${JSON.stringify(socialData || [], null, 2)}

Generate a JSON response with this exact structure:
{
  "profile": {
    "name": "Use the EXACT full name from the provided data, do not make up names",
    "title": "Professional title/role based on data only",
    "bio": "Use provided bio as-is, or leave empty if not provided",
    "location": "Use exact location from data, or leave empty if not provided"
  },
  "experience": [
    {
      "company": "Company name from data only",
      "position": "Job title from data only", 
      "duration": "Duration from data only",
      "description": "Description from data only",
      "skills_used": ["skills from data only"]
    }
  ],
  "skills": [],
  "interests": [],
  "featured_work": [],
  "social_links": {
    "linkedin": "LinkedIn URL if provided in data",
    "instagram": "Instagram URL if provided in data", 
    "website": "Website URL if provided in data"
  }
}

CRITICAL RULES:
- NEVER generate fake skills, interests, or featured work
- NEVER fabricate endorsements or testimonials
- Use ONLY the exact data provided by the user
- Leave arrays empty if no real data is provided
- Use exact names, do not modify or infer names
`;

function createFallbackProfile(): ProfileData {
  return {
    profile: {
      name: '',
      title: '',
      bio: '',
      location: ''
    },
    experience: [],
    skills: [],
    interests: [],
    featured_work: [],
    social_links: {}
  };
}

function calculateCompleteness(profileData: ProfileData): number {
  let score = 0;
  const fields = [
    profileData.profile.bio,
    profileData.profile.location,
    profileData.skills.length > 0,
    profileData.interests.length > 0,
    profileData.experience.length > 0,
    Object.keys(profileData.social_links).length > 0
  ];
  
  fields.forEach(field => {
    if (field) score += 16.67; // 100/6 fields
  });
  
  return Math.round(score);
}