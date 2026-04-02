"use client";

import { useReviewStore } from "@/stores/reviewStore";

import {
    Monitor, Tablet, Smartphone, Eye, MousePointer2,
    PanelRight, PanelRightClose, ArrowLeft, LayoutGrid
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DeviceType, ReviewMode } from "@/types";

const DEVICES: { type: DeviceType; icon: React.ElementType; label: string }[] = [
    { type: "desktop", icon: Monitor, label: "Desktop" },
    { type: "tablet", icon: Tablet, label: "Tablet" },
    { type: "mobile", icon: Smartphone, label: "Mobile" },
];

interface ReviewToolbarProps {
    projectId: string;
    projectName: string;
    pageUrl: string;
    pageId: string;
}

export function ReviewToolbar({ projectId, projectName, pageUrl, pageId }: ReviewToolbarProps) {
    void pageId;
    const { mode, setMode, device, setDevice, sidebarOpen, setSidebarOpen, comments } =
        useReviewStore();

    const openCount = comments.filter((c) => c.status === "OPEN").length;
    const resolvedCount = comments.filter((c) => c.status === "RESOLVED").length;

    return (
        <header className="h-14 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800 flex items-center px-4 gap-4 flex-shrink-0 z-50">
            {/* Back + Project name */}
            <div className="flex items-center gap-3 min-w-0">
                <Link
                    href={`/dashboard/${projectId}`}
                    className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors text-sm flex-shrink-0"
                >
                    <ArrowLeft size={14} />
                    <LayoutGrid size={14} />
                </Link>
                <div className="h-4 w-px bg-slate-700" />
                <span className="text-sm font-medium text-white truncate max-w-[140px]">{projectName}</span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-500 truncate max-w-[200px]">{pageUrl}</span>
            </div>

            <div className="flex-1" />

            {/* Mode Toggle */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {(["preview", "review"] as ReviewMode[]).map((m) => (
                    <button
                        key={m}
                        onClick={() => setMode(m)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                            mode === m
                                ? m === "review"
                                    ? "bg-violet-600 text-white shadow-sm"
                                    : "bg-slate-700 text-white"
                                : "text-slate-400 hover:text-slate-200"
                        )}
                    >
                        {m === "preview" ? <Eye size={12} /> : <MousePointer2 size={12} />}
                        {m === "preview" ? "Preview" : "Review"}
                    </button>
                ))}
            </div>

            {/* Device selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 gap-0.5">
                {DEVICES.map(({ type, icon: Icon, label }) => (
                    <button
                        key={type}
                        title={label}
                        onClick={() => setDevice(type)}
                        className={cn(
                            "p-1.5 rounded-md transition-all",
                            device === type
                                ? "bg-slate-700 text-white"
                                : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Icon size={14} />
                    </button>
                ))}
            </div>

            {/* Comment stats */}
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-400">
                <span>
                    <span className="text-white font-medium">{openCount}</span> open
                </span>
                <span>
                    <span className="text-green-400 font-medium">{resolvedCount}</span> resolved
                </span>
            </div>

            {/* Sidebar toggle */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-800"
                title="Toggle sidebar"
            >
                {sidebarOpen ? <PanelRightClose size={15} /> : <PanelRight size={15} />}
            </Button>
        </header>
    );
}
