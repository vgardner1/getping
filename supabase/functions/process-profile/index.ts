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

    const { userId, platforms } = await req.json();
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

    // Update progress
    await supabaseClient
      .from('profile_processing_jobs')
      .update({ progress: 30 })
      .eq('id', job.id);

    // Process data with AI
    const profileData = await generateProfileWithAI(socialData || []);

    // Update progress
    await supabaseClient
      .from('profile_processing_jobs')
      .update({ progress: 70 })
      .eq('id', job.id);

    // Update user profile
    const { error: updateError } = await supabaseClient
      .from('profiles')
      .update({
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
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateProfileWithAI(socialData: any[]): Promise<ProfileData> {
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  const prompt = buildPrompt(socialData);

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
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return createFallbackProfile();
  }
}

function buildPrompt(socialData: any[]): string {
  return `
Analyze the following social media data and create a comprehensive networking profile:

SOCIAL MEDIA DATA:
${JSON.stringify(socialData, null, 2)}

Generate a JSON response with this exact structure:
{
  "profile": {
    "name": "Full name from data",
    "title": "Professional title/role",
    "bio": "Engaging 2-3 sentence bio highlighting networking value",
    "location": "City, State/Country"
  },
  "experience": [
    {
      "company": "Company name",
      "position": "Job title",
      "duration": "Start - End dates",
      "description": "Brief description of role and achievements",
      "skills_used": ["skill1", "skill2"]
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "interests": ["interest1", "interest2", "interest3"],
  "featured_work": [
    {
      "title": "Project/Achievement title",
      "description": "Brief description",
      "type": "project|achievement|publication",
      "link": "URL if available"
    }
  ],
  "social_links": {
    "linkedin": "LinkedIn URL",
    "instagram": "Instagram URL",
    "website": "Website URL"
  }
}

Focus on:
1. Professional achievements and experience
2. Personal interests and creativity
3. Networking potential and conversation opportunities
4. Unique value proposition for connections
5. Authentic personality that encourages meaningful conversations
`;
}

function createFallbackProfile(): ProfileData {
  return {
    profile: {
      name: 'Ping User',
      title: 'Professional',
      bio: 'Excited to connect and network with like-minded professionals!',
      location: 'Boston, MA'
    },
    experience: [],
    skills: ['Communication', 'Networking'],
    interests: ['Professional Development', 'Technology'],
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