import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { createProjectSchema } from "@/lib/validations/project";

export const dynamic = "force-dynamic";

// GET /api/projects/[id]
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const project = await prisma.project.findFirst({
        where: {
            id,
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id } } },
            ],
        },
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
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ data: project });
}

// PATCH /api/projects/[id]
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
        where: { id, ownerId: session.user.id },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createProjectSchema.partial().safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const updated = await prisma.project.update({
        where: { id },
        data: {
            ...parsed.data,
            status: body.status ?? undefined,
        },
    });

    return NextResponse.json({ data: updated });
}

// DELETE /api/projects/[id]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const project = await prisma.project.findFirst({
        where: { id, ownerId: session.user.id },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
    }

    await prisma.project.delete({ where: { id } });

    return NextResponse.json({ message: "Project deleted" });
}
