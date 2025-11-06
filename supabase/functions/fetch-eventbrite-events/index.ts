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

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { location, interests, page = 1 } = await req.json();

    const eventbriteToken = Deno.env.get('EVENTBRITE_PRIVATE_TOKEN');
    if (!eventbriteToken) {
      throw new Error('Eventbrite token not configured');
    }

    // Build Eventbrite API query
    const searchParams = new URLSearchParams({
      'location.address': location || 'Boston, MA',
      'expand': 'venue',
      'page': page.toString(),
      'page_size': '20',
    });

    // Add category filters based on interests
    if (interests && interests.length > 0) {
      // Map user interests to Eventbrite categories (simplified mapping)
      const categoryMap: Record<string, string> = {
        'technology': '102',
        'business': '101',
        'music': '103',
        'food': '110',
        'art': '105',
        'sports': '108',
      };
      
      const categories = interests
        .map((interest: string) => categoryMap[interest.toLowerCase()])
        .filter(Boolean);
      
      if (categories.length > 0) {
        searchParams.append('categories', categories.join(','));
      }
    }

    console.log('Fetching events from Eventbrite:', searchParams.toString());

    // Fetch events from Eventbrite
    const eventbriteResponse = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${searchParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${eventbriteToken}`,
        },
      }
    );

    if (!eventbriteResponse.ok) {
      const errorText = await eventbriteResponse.text();
      console.error('Eventbrite API error:', errorText);
      throw new Error(`Eventbrite API error: ${eventbriteResponse.status}`);
    }

    const eventbriteData = await eventbriteResponse.json();
    console.log('Received events:', eventbriteData.events?.length || 0);

    // Cache events in our database
    const events = eventbriteData.events || [];
    for (const event of events) {
      const eventData = {
        eventbrite_id: event.id,
        name: event.name?.text || '',
        description: event.description?.text || event.summary || '',
        start_date: event.start?.utc || new Date().toISOString(),
        end_date: event.end?.utc,
        venue_name: event.venue?.name,
        venue_address: event.venue?.address?.localized_address_display,
        venue_city: event.venue?.address?.city,
        venue_state: event.venue?.address?.region,
        url: event.url,
        image_url: event.logo?.url,
        category: event.category?.name,
        tags: event.tags?.map((t: any) => t.display_name) || [],
      };

      // Insert or update event
      const { error: upsertError } = await supabaseClient
        .from('events')
        .upsert(eventData, { onConflict: 'eventbrite_id' });

      if (upsertError) {
        console.error('Error upserting event:', upsertError);
      }
    }

    // Fetch cached events with attendance info
    const { data: cachedEvents, error: fetchError } = await supabaseClient
      .from('events')
      .select(`
        *,
        event_attendances(user_id, status)
      `)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true })
      .limit(20);

    if (fetchError) {
      console.error('Error fetching cached events:', fetchError);
      throw fetchError;
    }

    return new Response(
      JSON.stringify({
        events: cachedEvents,
        pagination: eventbriteData.pagination,
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