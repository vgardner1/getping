import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getFrontendUrl(req: Request): string {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  
  if (origin) return origin;
  if (referer) {
    try {
      const url = new URL(referer);
      return `${url.protocol}//${url.host}`;
    } catch {
      return 'https://ahksxziueqkacyaqtgeu.supabase.co';
    }
  }
  return 'https://ahksxziueqkacyaqtgeu.supabase.co';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const frontendUrl = getFrontendUrl(req);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const GOOGLE_CLIENT_ID = '883735243677-us7bal39n8jy263tulmjp3tdf225moa3.apps.googleusercontent.com';
    const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');

    if (!GOOGLE_CLIENT_SECRET) {
      throw new Error('GOOGLE_CLIENT_SECRET is not configured');
    }

    // Initiate OAuth flow
    if (url.pathname.endsWith('/google-contacts-import')) {
      console.log('Initiating Google Contacts OAuth flow');
      
      const redirectUri = `${supabaseUrl}/functions/v1/google-contacts-import/callback`;
      const scope = 'openid email profile https://www.googleapis.com/auth/contacts.readonly';
      
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${encodeURIComponent(scope)}&` +
        `access_type=offline&` +
        `prompt=consent`;

      return new Response(
        JSON.stringify({ url: authUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle OAuth callback
    if (url.pathname.includes('/callback')) {
      console.log('Handling Google Contacts OAuth callback');
      
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        return Response.redirect(`${frontendUrl}/contacts?error=oauth_cancelled`);
      }

      if (!code) {
        return Response.redirect(`${frontendUrl}/contacts?error=no_code`);
      }

      // Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const redirectUri = `${supabaseUrl}/functions/v1/google-contacts-import/callback`;
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('Token exchange failed:', errorText);
        return Response.redirect(`${frontendUrl}/contacts?error=token_exchange_failed`);
      }

      const tokens = await tokenResponse.json();
      console.log('Received tokens');

      // Get user info to identify the user
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });

      if (!userInfoResponse.ok) {
        console.error('Failed to get user info');
        return Response.redirect(`${frontendUrl}/contacts?error=user_info_failed`);
      }

      const userInfo = await userInfoResponse.json();
      console.log('Google user:', userInfo.email);

      // Find the user in Supabase by email
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Failed to list users:', userError);
        return Response.redirect(`${frontendUrl}/contacts?error=user_lookup_failed`);
      }

      const user = userData.users.find(u => u.email === userInfo.email);
      
      if (!user) {
        console.error('User not found:', userInfo.email);
        return Response.redirect(`${frontendUrl}/contacts?error=user_not_found`);
      }

      console.log('Found user:', user.id);

      // Fetch contacts from Google People API
      console.log('Fetching contacts from Google...');
      const contactsResponse = await fetch(
        'https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers&pageSize=1000',
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );

      if (!contactsResponse.ok) {
        const errorText = await contactsResponse.text();
        console.error('Failed to fetch contacts:', errorText);
        return Response.redirect(`${frontendUrl}/contacts?error=contacts_fetch_failed`);
      }

      const contactsData = await contactsResponse.json();
      const connections = contactsData.connections || [];
      console.log(`Fetched ${connections.length} contacts from Google`);

      // Parse and insert contacts
      let importedCount = 0;
      const contactsToInsert = [];

      for (const connection of connections) {
        const name = connection.names?.[0]?.displayName;
        const email = connection.emailAddresses?.[0]?.value;
        const phone = connection.phoneNumbers?.[0]?.value;

        // Only import if we have at least a name
        if (name) {
          contactsToInsert.push({
            user_id: user.id,
            name,
            email: email || null,
            phone: phone || null,
            source: 'google_import',
          });
        }
      }

      // Insert in batches to avoid timeouts
      const batchSize = 100;
      for (let i = 0; i < contactsToInsert.length; i += batchSize) {
        const batch = contactsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('contacts')
          .upsert(batch, { 
            onConflict: 'user_id,email',
            ignoreDuplicates: false 
          });

        if (insertError) {
          console.error('Error inserting contacts batch:', insertError);
        } else {
          importedCount += batch.length;
        }
      }

      console.log(`Successfully imported ${importedCount} contacts`);

      return Response.redirect(`${frontendUrl}/contacts?imported=${importedCount}`);
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in google-contacts-import:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
