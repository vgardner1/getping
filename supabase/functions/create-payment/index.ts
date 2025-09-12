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

    console.log("Creating Stripe session for:", email);

    // Create a subscription session with trial
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "ping! - Access your new network today",
              description: "NFC ring with app access and networking features"
            },
            unit_amount: 999, // $9.99 setup fee
            recurring: null, // One-time setup fee
          },
          quantity: 1,
        },
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: "ping! Monthly Subscription",
              description: "Monthly access to ping! network and features"
            },
            unit_amount: 299, // $2.99 in cents
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        trial_period_days: 7, // 7 days free trial
      },
      success_url: `${req.headers.get("origin")}/signup?payment_success=true`,
      cancel_url: `${req.headers.get("origin")}/checkout`,
      metadata: {
        customer_name: name,
        customer_email: email,
      },
    });

    console.log("Stripe session created:", session.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Payment error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});