import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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
      const state = crypto.randomUUID();
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

      // Check if user exists
      const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(googleUser.email);

      let userId: string;

      if (existingUser.user) {
        userId = existingUser.user.id;
        console.log('Existing user found:', userId);
        // Ensure auth metadata has full_name for display in dashboard
        const hasFullName = existingUser.user.user_metadata?.full_name;
        if (!hasFullName && googleUser.name) {
          await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: {
              full_name: googleUser.name,
              first_name: googleUser.given_name ?? '',
              last_name: googleUser.family_name ?? '',
            },
          });
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

      // Update profile with Google data
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          user_id: userId,
          display_name: googleUser.name || googleUser.email.split('@')[0],
          avatar_url: googleUser.picture,
          social_links: {
            google: googleUser.email,
          },
        }, {
          onConflict: 'user_id',
        });

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Generate session token for the user
      const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'magiclink',
        email: googleUser.email,
      });

      if (sessionError || !session) {
        console.error('Session generation error:', sessionError);
        throw new Error('Failed to generate session');
      }

      // Redirect to frontend with session
      const redirectUrl = new URL('/', Deno.env.get('SUPABASE_URL')!.replace('https://ahksxziueqkacyaqtgeu.supabase.co', window.location.origin));
      redirectUrl.searchParams.set('google_auth', 'success');
      redirectUrl.searchParams.set('access_token', session.properties.action_link.split('#')[1].split('&')[0].split('=')[1]);

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
