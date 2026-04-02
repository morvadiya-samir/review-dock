"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    FolderOpen,
    Settings,
    LayoutGrid,
    ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/dashboard", label: "Projects", icon: FolderOpen, exact: false },
    { href: "/account", label: "Settings", icon: Settings, exact: false },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-60 bg-slate-900/50 border-r border-slate-800 min-h-screen">
            {/* Logo */}
            <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md shadow-violet-500/30">
                    <LayoutGrid size={16} className="text-white" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">ReviewDock</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.exact
                        ? pathname === item.href
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                                isActive
                                    ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
                                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                            )}
                        >
                            <item.icon
                                size={17}
                                className={cn(
                                    "transition-colors",
                                    isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"
                                )}
                            />
                            {item.label}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-active"
                                    className="absolute right-2.5"
                                    initial={false}
                                >
                                    <ChevronRight size={14} className="text-violet-400" />
                                </motion.div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800">
                <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-400">Free Plan</p>
                    <p className="text-xs text-violet-400 font-medium mt-0.5">2 / 2 projects used</p>
                    <Link
                        href="/pricing"
                        className="mt-2 block text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-md py-1.5 font-medium transition-all"
                    >
                        Upgrade to Pro
                    </Link>
                </div>
            </div>
        </aside>
    );
}
