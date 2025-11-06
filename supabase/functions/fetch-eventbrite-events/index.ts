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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Admin client (service role) to bypass RLS for server-side caching
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { location, interests, page = 1 } = await req.json();

    const ticketmasterApiKey = Deno.env.get('TICKETMASTER_API_KEY');
    if (!ticketmasterApiKey) {
      throw new Error('Ticketmaster API key not configured');
    }

    // Extract city from location (e.g., "Boston" from "Boston, MA")
    const city = location ? location.split(',')[0].trim() : 'Boston';
    const stateCode = location && location.includes(',')
      ? location.split(',')[1].trim().slice(0, 2).toUpperCase()
      : undefined;

    // Format date for Ticketmaster: YYYY-MM-DDTHH:mm:ssZ (no milliseconds)
    const startDateTime = new Date().toISOString().split('.')[0] + 'Z';

    // Build Ticketmaster API query
    const searchParams = new URLSearchParams({
      'apikey': ticketmasterApiKey,
      'city': city,
      'size': '20',
      'page': (page - 1).toString(), // Ticketmaster uses 0-indexed pages
      'sort': 'date,asc',
      'startDateTime': startDateTime,
      'countryCode': 'US',
    });

    if (stateCode) {
      searchParams.append('stateCode', stateCode);
    }

    // Add classification filters based on interests
    if (interests && interests.length > 0) {
      // Map user interests to Ticketmaster classifications
      const classificationMap: Record<string, string> = {
        'technology': 'Miscellaneous',
        'business': 'Miscellaneous',
        'music': 'Music',
        'food': 'Miscellaneous',
        'art': 'Arts & Theatre',
        'sports': 'Sports',
        'film': 'Film',
      };
      
      const classifications = interests
        .map((interest: string) => classificationMap[interest.toLowerCase()])
        .filter(Boolean);
      
      if (classifications.length > 0) {
        searchParams.append('classificationName', classifications.join(','));
      }
    }

    console.log('Fetching events from Ticketmaster:', searchParams.toString());

    // Fetch events from Ticketmaster
    const ticketmasterResponse = await fetch(
      `https://app.ticketmaster.com/discovery/v2/events.json?${searchParams.toString()}`
    );

    if (!ticketmasterResponse.ok) {
      const errorText = await ticketmasterResponse.text();
      console.error('Ticketmaster API error:', errorText);
      
      if (ticketmasterResponse.status === 404) {
        throw new Error('Location not found. Please try a different city.');
      } else if (ticketmasterResponse.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      
      throw new Error(`Ticketmaster API error: ${ticketmasterResponse.status}`);
    }

    const ticketmasterData = await ticketmasterResponse.json();
    const events = ticketmasterData._embedded?.events || [];
    console.log('Received events:', events.length);

    // Cache events in our database
    for (const event of events) {
      // Extract venue info from Ticketmaster structure
      const venue = event._embedded?.venues?.[0];
      const classification = event.classifications?.[0];
      
      // Gather genre/subgenre tags
      const tags: string[] = [];
      if (classification?.genre?.name) tags.push(classification.genre.name);
      if (classification?.subGenre?.name) tags.push(classification.subGenre.name);
      
      const eventData = {
        eventbrite_id: event.id,
        name: event.name || '',
        description: event.info || event.description || '',
        start_date: event.dates?.start?.dateTime || event.dates?.start?.localDate || new Date().toISOString(),
        end_date: event.dates?.end?.dateTime || event.dates?.end?.localDate || null,
        venue_name: venue?.name || null,
        venue_address: venue?.address?.line1 || null,
        venue_city: venue?.city?.name || null,
        venue_state: venue?.state?.name || null,
        url: event.url || null,
        image_url: event.images?.[0]?.url || null,
        category: classification?.segment?.name || null,
        tags,
      };

      // Insert or update event using admin client to bypass RLS
      const { error: upsertError } = await supabaseAdmin
        .from('events')
        .upsert(eventData, { onConflict: 'eventbrite_id' });

      if (upsertError) {
        console.error('Error upserting event:', upsertError);
      }
    }

    // Fetch cached events with attendance info using admin client, then filter to current user
    const { data: cachedEvents, error: fetchError } = await supabaseAdmin
      .from('events')
      .select(`
        *,
        event_attendances(user_id, status, event_id)
      `)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(20);

    if (fetchError) {
      console.error('Error fetching cached events:', fetchError);
      throw fetchError;
    }

    const eventsWithUserAttendance = (cachedEvents || []).map((e: any) => ({
      ...e,
      event_attendances: (e.event_attendances || []).filter((a: any) => a.user_id === user.id),
    }));

    return new Response(
      JSON.stringify({
        events: eventsWithUserAttendance,
        pagination: ticketmasterData.page || { size: 20, totalElements: events.length, number: page - 1 },
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in fetch-eventbrite-events:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});