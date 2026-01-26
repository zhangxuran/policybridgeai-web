import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    const {
      orderId,
      amount,
      packageName,
      orderNumber,
      currency = "cny",
      language = "zh",
      packageType,
      successUrl,
      cancelUrl,
      paymentMethods = ["card", "alipay"],
    } = body;

    console.log("📥 Received request:", {
      orderId,
      amount,
      packageName,
      currency,
      paymentMethods,
    });

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }

    // Prepare checkout session data
    const checkoutData = new URLSearchParams({
      "payment_method_types[0]": "card",
      ...(paymentMethods.includes("alipay") && {
        "payment_method_types[1]": "alipay",
      }),
      "line_items[0][price_data][currency]": currency.toLowerCase(),
      "line_items[0][price_data][product_data][name]": packageName || "Package",
      "line_items[0][price_data][unit_amount]": String(Math.round(amount * 100)),
      "line_items[0][quantity]": "1",
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      "metadata[order_id]": orderId,
      "metadata[order_number]": orderNumber,
      "metadata[currency]": currency,
      "metadata[language]": language,
    });

    console.log("📤 Sending to Stripe API...");

    // Call Stripe API
    const stripeResponse = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: checkoutData.toString(),
    });

    const responseData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error("❌ Stripe error:", responseData);
      throw new Error(`Stripe API error: ${responseData.error?.message || "Unknown error"}`);
    }

    console.log("✅ Checkout session created:", responseData.id);

    return new Response(
      JSON.stringify({
        id: responseData.id,
        url: responseData.url,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return new Response(
      JSON.stringify({
        error: errorMessage,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});
