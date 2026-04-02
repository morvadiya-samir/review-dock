import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Plus, FolderOpen, ArrowRight, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";
import { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    const projects = await prisma.project.findMany({
        where: { ownerId: session.user.id },
        include: {
            pages: {
                include: { _count: { select: { comments: true } } },
            },
            _count: { select: { members: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    const totalComments = projects.flatMap((p: any) => p.pages).reduce(
        (acc: number, page) => acc + (page._count?.comments ?? 0),
        0
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">My Projects</h1>
                    <p className="text-slate-400 text-sm mt-1">
                        {projects.length === 0
                            ? "Create your first project to start reviewing websites."
                            : `${projects.length} project${projects.length !== 1 ? "s" : ""} · ${totalComments} total comments`}
                    </p>
                </div>
                <Link href="/dashboard/new">
                    <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25">
                        <Plus size={16} className="mr-1.5" />
                        New Project
                    </Button>
                </Link>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {projects.map((project: any) => {
                        const commentCount = project.pages.reduce(
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (acc: number, p: any) => acc + (p._count?.comments ?? 0),
                            0
                        );
                        return (
                            <Link
                                key={project.id}
                                href={`/dashboard/${project.id}`}
                                className="group bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-violet-500/40 hover:bg-slate-900 transition-all duration-200 block"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <LayoutGrid size={16} className="text-violet-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white truncate group-hover:text-violet-300 transition-colors">
                                                {project.name}
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{project.websiteUrl}</p>
                                        </div>
                                    </div>
                                    <Badge
                                        variant="secondary"
                                        className={
                                            project.status === "ACTIVE"
                                                ? "bg-green-500/10 text-green-400 border-green-500/20 flex-shrink-0"
                                                : "bg-slate-700 text-slate-400 flex-shrink-0"
                                        }
                                    >
                                        {project.status.toLowerCase()}
                                    </Badge>
                                </div>

                                {project.description && (
                                    <p className="mt-3 text-xs text-slate-400 line-clamp-2">
                                        {project.description}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <FolderOpen size={12} />
                                            {project.pages.length} page{project.pages.length !== 1 ? "s" : ""}
                                        </span>
                                        <span>{commentCount} comment{commentCount !== 1 ? "s" : ""}</span>
                                    </div>
                                    <span>{timeAgo(project.updatedAt)}</span>
                                </div>

                                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        {project._count.members} member{project._count.members !== 1 ? "s" : ""}
                                    </span>
                                    <ArrowRight
                                        size={14}
                                        className="text-slate-600 group-hover:text-violet-400 group-hover:translate-x-1 transition-all"
                                    />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 border border-slate-700">
                <FolderOpen size={28} className="text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-white">No projects yet</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-xs">
                Create your first project to start reviewing websites and collecting feedback.
            </p>
            <Link href="/dashboard/new" className="mt-6">
                <Button className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white">
                    <Plus size={16} className="mr-1.5" />
                    Create your first project
                </Button>
            </Link>
        </div>
    );
}
