import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get the frontend URL from the request origin or default to Lovable preview
const getFrontendUrl = (req: Request): string => {
  const origin = req.headers.get('origin') || req.headers.get('referer');
  if (origin) {
    try {
      const url = new URL(origin);
      return url.origin;
    } catch {
      // Fall through to default
    }
  }
  // Default to the current Lovable preview URL structure
  return 'https://afadb95c-7a7c-44b0-8b4b-cdb079a9b5b3.lovableproject.com';
};

const GOOGLE_CLIENT_ID = "883735243677-us7bal39n8jv263tulmip3tdf225moa3.apps.googleusercontent.com";
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const REDIRECT_URI = `${Deno.env.get("SUPABASE_URL")}/functions/v1/google-oauth/callback`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname;

  try {
    // Step 1: Initiate OAuth flow
    if (path.endsWith('/google-oauth') || path.endsWith('/google-oauth/')) {
      // Try to get desired frontend redirect target from request body
      let desiredRedirect = '';
      try {
        const body = await req.json();
        desiredRedirect = body?.redirect_to || '';
      } catch {}

      const origin = desiredRedirect || getFrontendUrl(req);
      const statePayload = { rt: origin };
      const state = btoa(JSON.stringify(statePayload));

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      
      authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.set('response_type', 'code');
      authUrl.searchParams.set('scope', 'openid email profile');
      authUrl.searchParams.set('state', state);
      authUrl.searchParams.set('access_type', 'offline');
      authUrl.searchParams.set('prompt', 'consent');

      return new Response(JSON.stringify({ authUrl: authUrl.toString() }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 2: Handle OAuth callback
    if (path.includes('/callback')) {
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');

      if (!code) {
        throw new Error('No authorization code received');
      }

      console.log('Exchanging code for tokens...');

      // Exchange code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET!,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const error = await tokenResponse.text();
        console.error('Token exchange error:', error);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokens = await tokenResponse.json();
      console.log('Received tokens');

      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to fetch user info');
      }

      const googleUser = await userInfoResponse.json();
      console.log('Google user:', googleUser.email);

      // Create or update user in Supabase
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { auth: { persistSession: false } }
      );

      // Check if user exists - use listUsers instead of getUserByEmail
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = usersList?.users?.find(u => u.email === googleUser.email);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        console.log('Existing user found:', userId);
        // Ensure auth metadata has full_name for display in dashboard
        const hasFullName = existingUser.user_metadata?.full_name;
        if (!hasFullName && googleUser.name) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              full_name: googleUser.name,
              name: googleUser.name,
              first_name: googleUser.given_name ?? '',
              last_name: googleUser.family_name ?? '',
            },
          });
        }
        
        // Update existing profile with Google data if missing
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('avatar_url, display_name')
          .eq('user_id', userId)
          .single();
          
        if (profile && (!profile.avatar_url || !profile.display_name)) {
          await supabaseAdmin
            .from('profiles')
            .update({
              display_name: profile.display_name || googleUser.name || googleUser.email.split('@')[0],
              avatar_url: profile.avatar_url || googleUser.picture,
            })
            .eq('user_id', userId);
        }
      } else {
        // Create new user - split name into first/last for the trigger
        const nameParts = (googleUser.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: googleUser.email,
          email_confirm: true,
          user_metadata: {
            first_name: firstName,
            last_name: lastName,
            full_name: googleUser.name,
            name: googleUser.name,
            avatar_url: googleUser.picture,
            provider: 'google',
          },
        });

        if (createError || !newUser.user) {
          console.error('Error creating user:', createError);
          throw new Error('Failed to create user');
        }

        userId = newUser.user.id;
        console.log('New user created:', userId);
      }

      // Update/create profile with Google data, preserving existing fields
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      const profileData: any = {
        user_id: userId,
        display_name: existingProfile?.display_name || googleUser.name || googleUser.email.split('@')[0],
        avatar_url: existingProfile?.avatar_url || googleUser.picture,
      };

      // Only add first_name and last_name if they don't already exist
      if (!existingProfile?.first_name && googleUser.given_name) {
        profileData.first_name = googleUser.given_name;
      }
      if (!existingProfile?.last_name && googleUser.family_name) {
        profileData.last_name = googleUser.family_name;
      }

      // Merge social_links
      const existingLinks = existingProfile?.social_links || {};
      profileData.social_links = {
        ...existingLinks,
        google: googleUser.email,
      };

      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'user_id',
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Determine the frontend URL from state or request origin
      let frontendUrl = getFrontendUrl(req);
      try {
        if (state) {
          const decoded = JSON.parse(atob(state));
          if (decoded?.rt) frontendUrl = decoded.rt;
        }
      } catch {}

      // Create Supabase session directly via admin API
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.createSession({
        user_id: userId,
        session_not_after: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

      if (sessionError || !sessionData) {
        console.error('Session creation error:', sessionError);
        throw new Error('Failed to create session');
      }

      // Redirect directly to profile with session tokens
      const redirectUrl = new URL('/auth/callback', frontendUrl);
      redirectUrl.hash = `access_token=${sessionData.access_token}&refresh_token=${sessionData.refresh_token}&type=recovery`;

      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          Location: redirectUrl.toString(),
        },
      });
    }

    throw new Error('Invalid endpoint');

  } catch (error) {
    console.error('Google OAuth error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
