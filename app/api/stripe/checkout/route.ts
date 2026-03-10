import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { z } from "zod";

export const dynamic = "force-dynamic";

const checkoutSchema = z.object({
    plan: z.enum(["PRO", "ENTERPRISE"]),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
});

const PLAN_PRICE_IDS: Record<string, string> = {
    PRO: process.env.STRIPE_PRO_PRICE_ID ?? "price_mock_pro",
    ENTERPRISE: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "price_mock_ent",
};

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const parsed = checkoutSchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json({ error: "Invalid request" }, { status: 400 });
        }

        const { plan, successUrl, cancelUrl } = parsed.data;

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true, email: true, stripeCustomerId: true },
        });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        const priceId = PLAN_PRICE_IDS[plan];

        let customerId = user.stripeCustomerId;
        if (!customerId) {
            const customer = await stripe.customers.create({
                email: user.email,
                metadata: { userId: user.id },
            });
            customerId = customer.id;
            await prisma.user.update({
                where: { id: user.id },
                data: { stripeCustomerId: customer.id },
            });
        }

        // Check if they already have an active subscription and redirect to portal if so
        const subscriptions = await stripe.subscriptions.list({
            customer: customerId,
            status: 'active',
        });

        if (subscriptions.data.length > 0) {
            // Create billing portal session instead of checkout
            const portalSession = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: successUrl,
            });
            return NextResponse.json({ url: portalSession.url });
        }

        // Create new checkout session
        const stripeSession = await stripe.checkout.sessions.create({
            customer: customerId,
            mode: "subscription",
            payment_method_types: ["card"],
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                userId: user.id,
                plan,
            },
            subscription_data: {
                metadata: {
                    userId: user.id,
                    plan,
                }
            }
        });

        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
