"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Bell, LogOut, User, Moon, Sun, ArrowUpCircle } from "lucide-react";
import { useTheme } from "next-themes";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function Navbar() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const user = session?.user as { name?: string | null, email?: string | null, image?: string | null, plan?: string };

    const initials = user?.name
        ?.split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U";

    return (
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-40">
            {/* Left: breadcrumb placeholder */}
            <div className="flex items-center gap-2">
                <p className="text-sm text-slate-400">
                    Welcome back,{" "}
                    <span className="text-white font-medium">{user?.name ?? "there"}</span>
                </p>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
                {/* Upgrade Button (Free users only) */}
                {user?.plan === "FREE" && (
                    <Button
                        variant="default"
                        size="sm"
                        disabled={isLoading}
                        onClick={async () => {
                            setIsLoading(true);
                            try {
                                const res = await fetch("/api/stripe/checkout", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                        plan: "PRO",
                                        successUrl: `${window.location.origin}/dashboard?upgrade=success`,
                                        cancelUrl: `${window.location.origin}/dashboard`,
                                    }),
                                });
                                const data = await res.json();
                                if (data.url) window.location.href = data.url;
                            } catch (err) {
                                console.error(err);
                            } finally {
                                setIsLoading(false);
                            }
                        }}
                        className="h-8 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 hidden sm:flex items-center gap-1.5 shadow-lg shadow-violet-500/20"
                    >
                        <ArrowUpCircle size={14} />
                        <span className="text-xs font-semibold">Upgrade to Pro</span>
                    </Button>
                )}

                {/* Theme toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800"
                >
                    <Sun size={16} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon size={16} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Notifications */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-slate-400 hover:text-white hover:bg-slate-800 relative"
                >
                    <Bell size={16} />
                    <Badge className="absolute -top-0.5 -right-0.5 h-4 w-4 p-0 text-[10px] flex items-center justify-center bg-violet-600 border-0">
                        3
                    </Badge>
                </Button>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-9 w-9 rounded-full p-0 hover:ring-2 hover:ring-violet-500/50 transition-all">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 bg-slate-900 border-slate-700">
                        <DropdownMenuLabel className="text-slate-300">
                            <div>
                                <p className="font-medium text-white truncate">{user?.name}</p>
                                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem asChild className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                            <Link href="/account">
                                <User size={14} className="mr-2" />
                                Account Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-slate-700" />
                        <DropdownMenuItem
                            className="text-red-400 focus:bg-slate-800 focus:text-red-400 cursor-pointer"
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        >
                            <LogOut size={14} className="mr-2" />
                            Sign out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
