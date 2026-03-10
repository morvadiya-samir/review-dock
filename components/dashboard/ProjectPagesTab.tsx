"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
    Plus, ExternalLink, MessageSquare, ArrowRight, Globe, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { timeAgo } from "@/lib/utils";

interface Page {
    id: string;
    url: string;
    title: string | null;
    projectId: string;
    createdAt: Date;
    _count?: { comments: number };
}

interface Project {
    id: string;
    pages: Page[];
}

export function ProjectPagesTab({ project }: { project: Project }) {
    const router = useRouter();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUrl, setNewUrl] = useState("");
    const [isAdding, setIsAdding] = useState(false);

    const addPage = async () => {
        if (!newUrl.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch(`/api/projects/${project.id}/pages`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: newUrl }),
            });
            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Failed to add page");
                return;
            }
            toast.success("Page added!");
            setNewUrl("");
            setShowAddForm(false);
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{project.pages.length} page{project.pages.length !== 1 ? "s" : ""}</p>
                <Button
                    size="sm"
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-violet-600 hover:bg-violet-500 text-white"
                >
                    <Plus size={14} className="mr-1.5" /> Add Page
                </Button>
            </div>

            {showAddForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3"
                >
                    <p className="text-sm font-medium text-white">Add a new page</p>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input
                                value={newUrl}
                                onChange={(e) => setNewUrl(e.target.value)}
                                placeholder="https://example.com/about"
                                className="pl-8 bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 h-10"
                                onKeyDown={(e) => e.key === "Enter" && addPage()}
                            />
                        </div>
                        <Button onClick={addPage} disabled={isAdding} size="sm" className="bg-violet-600 hover:bg-violet-500 h-10">
                            {isAdding ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)} className="text-slate-400 h-10">
                            Cancel
                        </Button>
                    </div>
                </motion.div>
            )}

            {project.pages.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                    <Globe size={32} className="mx-auto mb-2 text-slate-700" />
                    <p className="text-sm">No pages yet. Add a page to start reviewing.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {project.pages.map((page) => (
                        <div
                            key={page.id}
                            className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-violet-500/40 transition-all"
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-white truncate">
                                        {page.title ?? page.url}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{page.url}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 text-xs">
                                        <MessageSquare size={10} className="mr-1" />
                                        {page._count?.comments ?? 0}
                                    </Badge>
                                    <a
                                        href={page.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-slate-600 hover:text-slate-400 transition-colors"
                                    >
                                        <ExternalLink size={14} />
                                    </a>
                                    <Link href={`/review/${project.id}/${page.id}`}>
                                        <Button size="sm" className="h-8 bg-violet-600/20 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 text-xs px-3 transition-all">
                                            Review <ArrowRight size={12} className="ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
