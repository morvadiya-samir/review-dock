import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { addPageSchema } from "@/lib/validations/project";

export const dynamic = "force-dynamic";

// GET /api/projects/[id]/pages
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const pages = await prisma.page.findMany({
        where: {
            projectId: id,
            project: {
                OR: [
                    { ownerId: session.user.id },
                    { members: { some: { userId: session.user.id } } },
                ],
            },
        },
        include: { _count: { select: { comments: true } } },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: pages });
}

// POST /api/projects/[id]/pages
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check project access
    const project = await prisma.project.findFirst({
        where: {
            id,
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id, role: { in: ["OWNER", "EDITOR"] } } } },
            ],
        },
        include: {
            owner: { select: { plan: true } },
            _count: { select: { pages: true } },
        }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
    }

    // --- ENFORCE PLAN LIMITS ---
    if (project.owner.plan === "FREE") {
        if (project._count.pages >= 10) {
            return NextResponse.json(
                { error: "Free plan limit reached. Projects are limited to 10 pages. Please upgrade to Pro." },
                { status: 403 }
            );
        }
    }
    // ---------------------------

    const body = await req.json();
    const parsed = addPageSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const page = await prisma.page.create({
        data: {
            url: parsed.data.url,
            title: parsed.data.title,
            projectId: id,
        },
    });

    return NextResponse.json({ data: page }, { status: 201 });
}
