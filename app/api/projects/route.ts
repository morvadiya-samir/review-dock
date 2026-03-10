import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";

export const dynamic = "force-dynamic";

// GET /api/projects — list user's projects
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await prisma.project.findMany({
        where: { ownerId: session.user.id },
        include: {
            pages: {
                include: { _count: { select: { comments: true } } },
                orderBy: { createdAt: "asc" },
            },
            members: {
                include: {
                    user: { select: { id: true, name: true, email: true, image: true } },
                },
            },
            _count: { select: { members: true, pages: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ data: projects });
}

// POST /api/projects — create project
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenUserId = session.user.id;

    // Verify the user in the token actually exists in the DB.
    // This guards against stale JWT tokens that reference a deleted/non-existent user.
    const dbUser = await prisma.user.findUnique({ where: { id: tokenUserId } });
    if (!dbUser) {
        console.error(
            `[POST /api/projects] Token userId "${tokenUserId}" has no matching User row. ` +
            `The session is stale — user must sign out and sign in again.`
        );
        return NextResponse.json(
            { error: "Your session is invalid. Please sign out and sign in again." },
            { status: 401 }
        );
    }

    const body = await req.json();
    const parsed = createProjectSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // --- ENFORCE PLAN LIMITS ---
    if (dbUser.plan === "FREE") {
        const projectCount = await prisma.project.count({ where: { ownerId: dbUser.id } });
        if (projectCount >= 3) {
            return NextResponse.json(
                { error: "Free plan limit reached. You can only create up to 3 projects. Please upgrade to Pro." },
                { status: 403 }
            );
        }
    }
    // ---------------------------

    const { name, websiteUrl, description } = parsed.data;

    // Create project + first page + make owner a member
    const project = await prisma.project.create({
        data: {
            name,
            websiteUrl,
            description,
            ownerId: dbUser.id,
            pages: {
                create: {
                    url: websiteUrl,
                    title: name + " — Home",
                },
            },
            members: {
                create: {
                    userId: dbUser.id,
                    role: "OWNER",
                },
            },
        },
        include: {
            pages: true,
            members: true,
        },
    });

    return NextResponse.json({ data: project }, { status: 201 });
}
