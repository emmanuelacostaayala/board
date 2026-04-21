import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { submitClinicalCases } from "@/lib/actions/submitCases";
import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;
  
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("Missing STRIPE_WEBHOOK_SECRET");
    return new NextResponse("Webhook Secret not configured", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed. ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const action = session.metadata?.action || "";
    
    if (action.startsWith("late_fee_") && session.metadata?.userId) {
      const period = action.split("_").pop() || "2026";
      console.log(`[Stripe Webhook] Processing ${action} for userId: ${session.metadata.userId}`);
      
      try {
        const res = await submitClinicalCases(session.metadata.userId, period);
        if (!res.ok) {
           console.error(`[Stripe Webhook] Failed to submit cases: ${res.message}`);
        } else {
           console.log(`[Stripe Webhook] Successfully submitted cases for ${session.metadata.userId}`);
        }
      } catch (error) {
        console.error(`[Stripe Webhook] Submission Error:`, error);
      }
    } else if (session.metadata?.action === "ai_subscription" && session.metadata?.userId) {
       const client = await clerkClient();
       await client.users.updateUserMetadata(session.metadata.userId, {
         publicMetadata: { hasAISubscription: true }
       });
       console.log(`[Stripe Webhook] AI Subscription activated for ${session.metadata.userId}`);
    } else if (session.metadata?.action === "premium_guide" && session.metadata?.userId) {
       const client = await clerkClient();
       const user = await client.users.getUser(session.metadata.userId);
       const existingGuides = (user.publicMetadata?.premiumGuides as string[]) || [];
       const purchasedGuides = session.metadata.guideName.split(",");
       const newGuides = purchasedGuides.filter((g: string) => !existingGuides.includes(g));
       
       if (newGuides.length > 0) {
           await client.users.updateUserMetadata(session.metadata.userId, {
             publicMetadata: { premiumGuides: [...existingGuides, ...newGuides] }
           });
       }
       console.log(`[Stripe Webhook] Premium guides ${session.metadata.guideName} unlocked for ${session.metadata.userId}`);
    }
  } else if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
    const subscription = event.data.object as any;
    if (subscription.metadata?.action === "ai_subscription" && subscription.metadata?.userId) {
       if (subscription.status === "canceled" || subscription.status === "unpaid") {
           const client = await clerkClient();
           await client.users.updateUserMetadata(subscription.metadata.userId, {
             publicMetadata: { hasAISubscription: false }
           });
           console.log(`[Stripe Webhook] AI Subscription canceled for ${subscription.metadata.userId}`);
       }
    }
  }

  // Acknowledge receipt of the event
  return new NextResponse(null, { status: 200 });
}
