import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const signature = req.headers.get("Stripe-Signature") as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error("Missing STRIPE_WEBHOOK_SECRET");
        return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
        console.error(`Webhook signature verification failed: ${(err as Error).message}`);
        return NextResponse.json({ error: `Webhook Error: ${(err as Error).message}` }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed": {
                const session = event.data.object as { metadata?: { userId?: string, plan?: string }, customer?: string };
                const userId = session.metadata?.userId;
                const plan = session.metadata?.plan as "PRO" | "ENTERPRISE" | undefined;

                if (userId && plan) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { plan, stripeCustomerId: session.customer as string },
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const subscription = event.data.object as { metadata?: { userId?: string } };
                const userId = subscription.metadata?.userId;

                if (userId) {
                    await prisma.user.update({
                        where: { id: userId },
                        data: { plan: "FREE" }, // Downgrade to free on cancellation
                    });
                }
                break;
            }

            case "customer.subscription.updated": {
                // const subscription = event.data.object as any;
                // Handle updates (e.g. paused -> active) if needed
                break;
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("Webhook handler failed:", error);
        return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
    }
}
