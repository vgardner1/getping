import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { code, state, userId } = await req.json();
    
    if (!code || !userId) {
      throw new Error('Missing authorization code or user ID');
    }

    console.log('Processing LinkedIn OAuth for user:', userId);

    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/linkedin-oauth`,
        client_id: Deno.env.get('LINKEDIN_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('LINKEDIN_CLIENT_SECRET') ?? ''
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('LinkedIn token exchange failed:', tokenData);
      throw new Error('Failed to exchange authorization code');
    }

    const accessToken = tokenData.access_token;

    // Fetch LinkedIn profile data
    const profileData = await fetchLinkedInProfile(accessToken);

    // Store raw data in social_media_data table
    const { error: insertError } = await supabaseClient
      .from('social_media_data')
      .upsert({
        user_id: userId,
        platform: 'linkedin',
        raw_data: profileData,
        access_token: accessToken,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing LinkedIn data:', insertError);
      throw new Error('Failed to store LinkedIn data');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'LinkedIn data collected successfully',
      data: profileData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('LinkedIn OAuth error:', error);
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

async function fetchLinkedInProfile(accessToken: string) {
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  };

  try {
    // Get basic profile
    const profileResponse = await fetch('https://api.linkedin.com/v2/people/~?projection=(id,firstName,lastName,headline,summary,location,industry)', {
      headers
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile');
    }

    const profile = await profileResponse.json();

    // Get positions (experience)
    const positionsResponse = await fetch('https://api.linkedin.com/v2/people/~/positions?projection=(elements*(id,title,summary,startDate,endDate,company~(name,industry)))', {
      headers
    });

    let positions = [];
    if (positionsResponse.ok) {
      const positionsData = await positionsResponse.json();
      positions = positionsData.elements || [];
    }

    // Get skills
    const skillsResponse = await fetch('https://api.linkedin.com/v2/people/~/skills?projection=(elements*(name))', {
      headers
    });

    let skills = [];
    if (skillsResponse.ok) {
      const skillsData = await skillsResponse.json();
      skills = skillsData.elements || [];
    }

    return {
      profile,
      positions,
      skills,
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching LinkedIn data:', error);
    throw error;
  }
}