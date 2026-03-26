import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE /api/projects/[id]/pages/[pageId]
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; pageId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, pageId } = await params;

    // Check project access (Owner or Editor)
    const project = await prisma.project.findFirst({
        where: {
            id,
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id, role: { in: ["OWNER", "EDITOR"] } } } },
            ],
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or not authorized" }, { status: 404 });
    }

    try {
        await prisma.page.delete({
            where: {
                id: pageId,
                projectId: id,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error deleting page:", error);
        return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
    }
}
