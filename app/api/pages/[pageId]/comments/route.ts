import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createCommentSchema } from "@/lib/validations/comment";

export const dynamic = "force-dynamic";

// GET /api/pages/[pageId]/comments
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId } = await params;
    const { searchParams } = new URL(req.url);

    const type = searchParams.get("type") ?? undefined;
    const priority = searchParams.get("priority") ?? undefined;
    const status = searchParams.get("status") ?? undefined;

    const comments = await prisma.comment.findMany({
        where: {
            pageId,
            ...(type ? { type: type as any } : {}),
            ...(priority ? { priority: priority as any } : {}),
            ...(status ? { status: status as any } : {}),
        },
        include: {
            author: { select: { id: true, name: true, email: true, image: true } },
            replies: { orderBy: { createdAt: "asc" } },
            _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: comments });
}

// POST /api/pages/[pageId]/comments
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ pageId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { pageId } = await params;
    const body = await req.json();
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    // Verify page exists
    const page = await prisma.page.findUnique({ where: { id: pageId } });
    if (!page) {
        return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    const comment = await prisma.comment.create({
        data: {
            ...parsed.data,
            pageId,
            authorId: session.user.id,
        },
        include: {
            author: { select: { id: true, name: true, email: true, image: true } },
        },
    });

    return NextResponse.json({ data: comment }, { status: 201 });
}
