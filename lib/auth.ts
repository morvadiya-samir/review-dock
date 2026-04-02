import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

export const authConfig: NextAuthConfig = {
    session: { strategy: "jwt" },
    pages: {
        signIn: "/auth/signin",
        error: "/auth/signin",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as { role?: string, plan?: string }).role;
                token.plan = (user as { role?: string, plan?: string }).plan;
            }
            // Fallback: NextAuth v5 also stores the user id in token.sub
            if (!token.id && token.sub) {
                token.id = token.sub;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // token.id is set from authorize(); token.sub is NextAuth's built-in fallback
                session.user.id = (token.id ?? token.sub) as string;
                (session.user as { role?: unknown, plan?: unknown }).role = token.role;
                (session.user as { role?: unknown, plan?: unknown }).plan = token.plan;
            }
            return session;
        },
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
            const isOnReview = nextUrl.pathname.startsWith("/review");
            const isOnAuth = nextUrl.pathname.startsWith("/auth");

            if (isOnDashboard || isOnReview) {
                if (isLoggedIn) return true;
                return false; // redirect to signin
            } else if (isLoggedIn && isOnAuth) {
                return Response.redirect(new URL("/dashboard", nextUrl));
            }
            return true;
        },
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
        }),
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const parsed = loginSchema.safeParse(credentials);
                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user || !user.password) return null;

                const passwordsMatch = await bcrypt.compare(password, user.password);
                if (!passwordsMatch) return null;

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                    plan: user.plan,
                };
            },
        }),
    ],
};
