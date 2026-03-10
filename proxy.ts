import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

// Next.js 16: proxy.ts replaces deprecated middleware.ts
// Runs at the edge to protect routes via NextAuth session
export async function proxy(request: NextRequest) {
    return auth(request as any);
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/review/:path*",
        "/account/:path*",
        "/auth/:path*",
    ],
};
