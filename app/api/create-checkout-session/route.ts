import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    const { items } = await req.json();
    const { userId } = await auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    const line_items = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: `Guía Premium: ${item.title}`,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity || 1,
    }));

    const guideNames = items.map((i: any) => i.title).join(",");

    const session = await stripe.checkout.sessions.create({
      customer_email: user.primaryEmailAddress?.emailAddress,
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${req.headers.get("origin")}/board/guias-estudio?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/board/guias-estudio?payment_canceled=true`,
      metadata: {
        userId,
        action: "premium_guide",
        guideName: guideNames,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout Error:", err);
    return new NextResponse(err.message, { status: 500 });
  }
}
