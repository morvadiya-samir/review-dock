import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/projects/[id]/export?format=csv
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") ?? "csv";

    // Verify access
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
                include: {
                    comments: {
                        include: {
                            author: { select: { name: true, email: true } },
                            replies: { orderBy: { createdAt: "asc" } },
                        },
                        orderBy: { createdAt: "asc" },
                    },
                },
            },
        },
    });

    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

    if (format === "csv") {
        const rows: string[] = [
            // Header
            ["ID", "Page URL", "Element", "Type", "Priority", "Status", "Comment", "Suggested Text", "Author", "Replies", "Created At"].join(","),
        ];

        for (const page of project.pages) {
            for (const comment of page.comments) {
                const escape = (s: string | null | undefined) =>
                    `"${(s ?? "").replace(/"/g, '""').replace(/\n/g, " ")}"`;

                rows.push(
                    [
                        comment.id,
                        escape(page.url),
                        escape(`<${comment.elementTag.toLowerCase()}> ${comment.elementSelector}`),
                        comment.type,
                        comment.priority,
                        comment.status,
                        escape(comment.content),
                        escape(comment.suggestedText ?? ""),
                        escape(comment.author.name ?? comment.author.email),
                        comment.replies.length.toString(),
                        new Date(comment.createdAt).toISOString(),
                    ].join(",")
                );
            }
        }

        const csv = rows.join("\n");
        const filename = `${project.name.replace(/[^a-z0-9]/gi, "_")}_comments.csv`;

        return new NextResponse(csv, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    }

    // JSON export
    return NextResponse.json({
        project: {
            id: project.id,
            name: project.name,
            websiteUrl: project.websiteUrl,
            exportedAt: new Date().toISOString(),
            pages: project.pages.map((page) => ({
                id: page.id,
                url: page.url,
                title: page.title,
                comments: page.comments,
            })),
        },
    });
}
