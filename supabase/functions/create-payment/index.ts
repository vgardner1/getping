import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Payment function called");
    
    // Initialize Stripe with the secret key from Supabase secrets
    const stripeKey = Deno.env.get("The Key to Ping");
    console.log("Stripe key exists:", !!stripeKey);
    
    if (!stripeKey) {
      throw new Error("The Key to Ping secret not found in environment");
    }
    
    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Get customer email from request body
    const requestBody = await req.json();
    console.log("Request body:", requestBody);
    
    const { email, name } = requestBody;

    console.log("Creating Stripe session");

    // Create checkout session options
    const sessionOptions: any = {
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "ping! - Presale",
              description: "Presale access to ping!"
            },
            unit_amount: 1999, // $19.99 presale
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.get("origin")}/payment-success`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        customer_name: name || '',
        customer_email: email || '',
      },
    };

    // Only include customer_email if we have a valid email
    if (email && email.includes('@')) {
      sessionOptions.customer_email = email;
    }

    // Create a one-time payment session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    console.log("Stripe session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});