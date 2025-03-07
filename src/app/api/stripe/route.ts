// /api/stripe

import { stripe } from "@/lib/stripe";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { userSubscription } from "@/lib/db/schema";
import { NextResponse } from "next/server";

// Ensure we have a valid base URL, defaulting to localhost if not set
const baseUrl = process.env.NEXT_BASE_URL || "http://localhost:3000";
const return_url = `${baseUrl}/`;

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    const _userSubscription = await db
      .select()
      .from(userSubscription)
      .where(eq(userSubscription.userId, userId));

    if (_userSubscription[0] && _userSubscription[0].stripeCustomerId) {
      // trying to cancel at the billing portal
      const stripeSession = await stripe.billingPortal.sessions.create({
        customer: _userSubscription[0].stripeCustomerId,
        return_url,
      });

      return NextResponse.json({ url: stripeSession.url });
    }
    //users's first time trying to subscripe
    const stripeSession = await stripe.checkout.sessions.create({
      customer_email: user?.emailAddresses[0].emailAddress,
      success_url: return_url,
      cancel_url: return_url,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      line_items: [
        {
          price_data: {
            currency: "USD",
            product_data: {
              name: "CHATPDF Pro Plan",
              description: "Unlimited PDF Sessions",
            },
            unit_amount: 2000,
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      metadata: { UserId: userId },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error) {
    console.log("[STRIPE_CHECKOUT]", error);
    return new Response("Internal Error", { status: 500 });
  }
}
