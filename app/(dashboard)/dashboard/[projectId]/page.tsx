import { notFound, redirect } from "next/navigation";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectPagesTab } from "@/components/dashboard/ProjectPagesTab";
import { ProjectMembersTab } from "@/components/dashboard/ProjectMembersTab";
import { ProjectSettingsTab } from "@/components/dashboard/ProjectSettingsTab";
import { ArrowLeft, Globe, LayoutGrid, Download } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ projectId: string }> }): Promise<Metadata> {
    const { projectId } = await params;
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { name: true } });
    return { title: project?.name ?? "Project" };
}

export default async function ProjectDetailPage({
    params,
}: {
    params: Promise<{ projectId: string }>;
}) {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    const { projectId } = await params;

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
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

    if (!project) notFound();

    const isOwner = project.ownerId === session.user.id;
    const totalComments = project.pages.reduce(
        (acc: number, p: any) => acc + (p._count?.comments ?? 0),
        0
    );

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={14} />
                    All Projects
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-xl flex items-center justify-center">
                            <LayoutGrid size={20} className="text-violet-400" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                            <a
                                href={project.websiteUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-sm text-slate-400 hover:text-violet-400 transition-colors mt-0.5"
                            >
                                <Globe size={12} />
                                {project.websiteUrl}
                            </a>
                        </div>
                    </div>
                    <Badge
                        variant="secondary"
                        className={
                            project.status === "ACTIVE"
                                ? "bg-green-500/10 text-green-400 border-green-500/20"
                                : "bg-slate-700 text-slate-400"
                        }
                    >
                        {project.status.toLowerCase()}
                    </Badge>
                </div>

                {/* Stats row */}
                <div className="flex items-center gap-6 mt-4 text-sm text-slate-400">
                    <span><strong className="text-white">{project.pages.length}</strong> pages</span>
                    <span><strong className="text-white">{totalComments}</strong> comments</span>
                    <span><strong className="text-white">{project._count.members}</strong> members</span>
                    <div className="ml-auto">
                        <a
                            href={`/api/projects/${project.id}/export?format=csv`}
                            download
                        >
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
                            >
                                <Download size={12} /> Export CSV
                            </Button>
                        </a>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="pages">
                <TabsList className="bg-slate-800/50 border border-slate-700 p-1 h-auto">
                    <TabsTrigger value="pages" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-md px-4 py-1.5 text-sm">
                        Pages
                    </TabsTrigger>
                    <TabsTrigger value="members" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-md px-4 py-1.5 text-sm">
                        Team
                    </TabsTrigger>
                    {isOwner && (
                        <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-md px-4 py-1.5 text-sm">
                            Settings
                        </TabsTrigger>
                    )}
                </TabsList>

                <TabsContent value="pages" className="mt-4">
                    <ProjectPagesTab project={project} />
                </TabsContent>
                <TabsContent value="members" className="mt-4">
                    <ProjectMembersTab project={project} isOwner={isOwner} />
                </TabsContent>
                {isOwner && (
                    <TabsContent value="settings" className="mt-4">
                        <ProjectSettingsTab project={project} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
