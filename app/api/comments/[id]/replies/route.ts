import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/comments/[id]/replies
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const replies = await prisma.reply.findMany({
        where: { commentId: id },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ data: replies });
}

// POST /api/comments/[id]/replies
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (!body.content?.trim()) {
        return NextResponse.json({ error: "Reply content is required" }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id } });
    if (!comment) {
        return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, image: true },
    });

    const reply = await prisma.reply.create({
        data: {
            content: body.content.trim(),
            commentId: id,
            authorId: session.user.id,
            authorName: user?.name ?? session.user.email ?? "User",
            authorImage: user?.image ?? null,
        },
    });

    return NextResponse.json({ data: reply }, { status: 201 });
}
