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

    const { code, userId } = await req.json();
    
    if (!code || !userId) {
      throw new Error('Missing authorization code or user ID');
    }

    console.log('Processing Instagram OAuth for user:', userId);

    // Exchange code for access token
    const tokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: Deno.env.get('INSTAGRAM_CLIENT_ID') ?? '',
        client_secret: Deno.env.get('INSTAGRAM_CLIENT_SECRET') ?? '',
        grant_type: 'authorization_code',
        redirect_uri: `${Deno.env.get('SUPABASE_URL')}/functions/v1/instagram-oauth`,
        code: code
      })
    });

    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      console.error('Instagram token exchange failed:', tokenData);
      throw new Error('Failed to exchange authorization code');
    }

    const accessToken = tokenData.access_token;

    // Fetch Instagram profile data
    const profileData = await fetchInstagramProfile(accessToken);

    // Store raw data in social_media_data table
    const { error: insertError } = await supabaseClient
      .from('social_media_data')
      .upsert({
        user_id: userId,
        platform: 'instagram',
        raw_data: profileData,
        access_token: accessToken,
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing Instagram data:', insertError);
      throw new Error('Failed to store Instagram data');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Instagram data collected successfully',
      data: profileData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Instagram OAuth error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function fetchInstagramProfile(accessToken: string) {
  try {
    // Get basic profile info
    const profileResponse = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`);
    
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch Instagram profile');
    }

    const profile = await profileResponse.json();

    // Get recent media
    const mediaResponse = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,timestamp&limit=20&access_token=${accessToken}`);
    
    let media = [];
    if (mediaResponse.ok) {
      const mediaData = await mediaResponse.json();
      media = mediaData.data || [];
    }

    return {
      profile,
      media,
      fetchedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error fetching Instagram data:', error);
    throw error;
  }
}