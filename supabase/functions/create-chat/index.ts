import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateChatRequest {
  targetUserId: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get user from JWT token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { targetUserId } = await req.json() as CreateChatRequest

    if (!targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Target user ID is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Prevent self-conversations
    if (user.id === targetUserId) {
      return new Response(
        JSON.stringify({ error: 'Cannot create conversation with yourself' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating chat between:', user.id, 'and', targetUserId)

    // Step 1: Ensure both users have connections (bidirectional)
    console.log('Creating connections...')
    
    // Create forward connection
    const { error: forwardConnError } = await supabase
      .from('connections')
      .upsert({
        user_id: user.id,
        target_user_id: targetUserId
      }, {
        onConflict: 'user_id,target_user_id'
      })

    if (forwardConnError) {
      console.error('Error creating forward connection:', forwardConnError)
    }

    // Create reciprocal connection
    const { error: reciprocalConnError } = await supabase
      .from('connections')
      .upsert({
        user_id: targetUserId,
        target_user_id: user.id
      }, {
        onConflict: 'user_id,target_user_id'
      })

    if (reciprocalConnError) {
      console.error('Error creating reciprocal connection:', reciprocalConnError)
    }

    // Step 2: Check for existing conversation
    console.log('Checking for existing conversation...')
    const { data: existingConversations, error: convSearchError } = await supabase
      .from('conversation_participants')
      .select(`
        conversation_id,
        conversations!inner(id, category)
      `)
      .eq('user_id', user.id)

    if (convSearchError) {
      console.error('Error searching conversations:', convSearchError)
      return new Response(
        JSON.stringify({ error: 'Failed to search existing conversations' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    let conversationId: string | null = null

    // Check if any of these conversations include the target user
    if (existingConversations && existingConversations.length > 0) {
      for (const conv of existingConversations) {
        const { data: targetParticipant, error: targetError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conv.conversation_id)
          .eq('user_id', targetUserId)
          .single()

        if (!targetError && targetParticipant) {
          conversationId = conv.conversation_id
          console.log('Found existing conversation:', conversationId)
          break
        }
      }
    }

    // Step 3: Create new conversation if none exists
    if (!conversationId) {
      console.log('Creating new conversation...')
      const { data: newConversation, error: newConvError } = await supabase
        .from('conversations')
        .insert({
          category: 'personal'
        })
        .select('id')
        .single()

      if (newConvError || !newConversation) {
        console.error('Error creating conversation:', newConvError)
        return new Response(
          JSON.stringify({ error: 'Failed to create conversation' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      conversationId = newConversation.id

      // Add participants to the conversation
      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: conversationId,
            user_id: user.id
          },
          {
            conversation_id: conversationId,
            user_id: targetUserId
          }
        ])

      if (participantsError) {
        console.error('Error adding participants:', participantsError)
        return new Response(
          JSON.stringify({ error: 'Failed to add conversation participants' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log('Successfully created new conversation:', conversationId)
    }

    // Step 4: Verify the target user profile exists
    const { data: targetProfile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', targetUserId)
      .single()

    if (profileError) {
      console.error('Error fetching target profile:', profileError)
    }

    const targetName = targetProfile?.display_name || 'User'

    return new Response(
      JSON.stringify({ 
        success: true,
        conversationId,
        targetUserId,
        targetName,
        message: conversationId ? 'Chat ready' : 'New chat created'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in create-chat function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})