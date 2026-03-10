import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// DELETE /api/projects/[id]/members/[memberId]  - remove member
export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id, memberId } = await params;

    // Only project owner can remove members
    const project = await prisma.project.findFirst({
        where: { id, ownerId: session.user.id },
    });
    if (!project) return NextResponse.json({ error: "Not authorized" }, { status: 403 });

    const member = await prisma.projectMember.findUnique({ where: { id: memberId } });
    if (!member || member.role === "OWNER") {
        return NextResponse.json({ error: "Cannot remove this member" }, { status: 400 });
    }

    await prisma.projectMember.delete({ where: { id: memberId } });
    return NextResponse.json({ message: "Member removed" });
}
