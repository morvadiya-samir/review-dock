import Stripe from "stripe";

export const stripe = new Stripe(
    process.env.STRIPE_SECRET_KEY || "sk_test_mock_for_build",
    {
        apiVersion: "2025-02-24.acacia" as any,
        appInfo: {
            name: "ReviewDock",
            version: "1.0.0",
        },
    });
