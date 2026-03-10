import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendProjectInvitationEmail } from "@/lib/email";
import { z } from "zod";

export const dynamic = "force-dynamic";

const inviteSchema = z.object({
    email: z.string().email("Valid email required"),
    role: z.enum(["EDITOR", "REVIEWER", "VIEWER"]).default("REVIEWER"),
});

// GET /api/projects/[id]/invitations
export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const invitations = await prisma.invitation.findMany({
        where: { projectId: id },
        include: {
            invitedBy: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ data: invitations });
}

// POST /api/projects/[id]/invitations  — send invitation
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // Only owners/editors can invite
    const project = await prisma.project.findFirst({
        where: {
            id,
            OR: [
                { ownerId: session.user.id },
                { members: { some: { userId: session.user.id, role: { in: ["OWNER", "EDITOR"] } } } },
            ],
        },
    });
    if (!project) return NextResponse.json({ error: "Project not found or insufficient permissions" }, { status: 404 });

    const body = await req.json();
    const parsed = inviteSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { email, role } = parsed.data;

    // Email Dispatch Variables
    const invitedByUsername = session.user.name || "A team member";
    const invitedByEmail = session.user.email || "noreply@reviewdock.com";
    const projectName = project.name;
    const projectUrl = project.websiteUrl;

    // Check if already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        const alreadyMember = await prisma.projectMember.findFirst({
            where: { projectId: id, userId: existingUser.id },
        });
        if (alreadyMember) {
            return NextResponse.json({ error: "User is already a member of this project" }, { status: 409 });
        }

        // Directly add as member if they have an account
        const member = await prisma.projectMember.create({
            data: { userId: existingUser.id, projectId: id, role: role as any },
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
        });

        // Dispatch Email
        await sendProjectInvitationEmail({ email, invitedByUsername, invitedByEmail, projectName, projectUrl, role });

        return NextResponse.json({ data: member, added: true }, { status: 201 });
    }

    // Check for existing pending invite
    const existingInvite = await prisma.invitation.findFirst({
        where: { projectId: id, email, status: "PENDING" },
    });
    if (existingInvite) {
        return NextResponse.json({ error: "An invitation for this email is already pending" }, { status: 409 });
    }

    const invitation = await prisma.invitation.create({
        data: { email, projectId: id, invitedById: session.user.id, status: "PENDING" },
        include: { invitedBy: { select: { id: true, name: true, email: true, image: true } } },
    });

    // Dispatch Email
    await sendProjectInvitationEmail({ email, invitedByUsername, invitedByEmail, projectName, projectUrl, role });

    return NextResponse.json({ data: invitation, added: false }, { status: 201 });
}
