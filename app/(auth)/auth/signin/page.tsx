import { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/SignInForm";
import { LayoutGrid, Github, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to your ReviewDock account.",
};

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex">
            {/* Left Panel — Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-900/40 to-slate-900 relative p-12 flex-col justify-between border-r border-slate-800">
                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <LayoutGrid size={18} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white tracking-tight">ReviewDock</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <blockquote className="space-y-3">
                        <p className="text-2xl font-semibold text-white leading-snug">
                            &ldquo;ReviewDock transformed how our team gives feedback on web projects. No more screenshots with arrows!&rdquo;
                        </p>
                        <footer className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
                            <div>
                                <p className="text-sm font-medium text-white">Sarah Chen</p>
                                <p className="text-xs text-slate-400">Lead Designer, Acme Inc.</p>
                            </div>
                        </footer>
                    </blockquote>
                </div>

                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                </div>
            </div>

            {/* Right Panel — Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex justify-center">
                        <Link href="/" className="flex items-center gap-2.5">
                            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                <LayoutGrid size={18} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">ReviewDock</span>
                        </Link>
                    </div>

                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-bold text-white">Welcome back</h1>
                        <p className="mt-2 text-slate-400">Sign in to continue to ReviewDock</p>
                    </div>

                    <SignInForm />

                    {/* --- OAuth Buttons --- */}
                    <div className="mt-8">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-800" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-slate-950 px-2 text-slate-500 font-medium tracking-wider">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <form action="/api/auth/signin/google" method="POST">
                                <button
                                    type="submit"
                                    className="w-full relative flex items-center justify-center gap-3 bg-white text-black font-semibold h-11 rounded-lg hover:bg-slate-100 transition-colors"
                                >
                                    <Mail size={18} className="text-red-500" />
                                    Sign in with Google
                                </button>
                            </form>

                            <form action="/api/auth/signin/github" method="POST">
                                <button
                                    type="submit"
                                    className="w-full relative flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#1b1f23] border border-slate-700 text-white font-semibold h-11 rounded-lg transition-colors"
                                >
                                    <Github size={18} />
                                    Sign in with GitHub
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
