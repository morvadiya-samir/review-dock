import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { updateCommentSchema } from "@/lib/validations/comment";

export const dynamic = "force-dynamic";

// PATCH /api/comments/[id]
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const comment = await prisma.comment.findFirst({
        where: { id, authorId: session.user.id },
    });

    if (!comment) {
        return NextResponse.json({ error: "Comment not found or not authorized" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateCommentSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const updated = await prisma.comment.update({
        where: { id },
        data: parsed.data,
        include: {
            author: { select: { id: true, name: true, email: true, image: true } },
        },
    });

    return NextResponse.json({ data: updated });
}

// DELETE /api/comments/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const comment = await prisma.comment.findFirst({
        where: { id, authorId: session.user.id },
    });

    if (!comment) {
        return NextResponse.json({ error: "Comment not found or not authorized" }, { status: 404 });
    }

    await prisma.comment.delete({ where: { id } });
    return NextResponse.json({ message: "Comment deleted" });
}
