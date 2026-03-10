import { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { LayoutGrid, Zap, Users, MessageSquare, Github, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Sign Up",
    description: "Create your free ReviewDock account.",
};

const features = [
    { icon: Zap, label: "Review any website instantly" },
    { icon: MessageSquare, label: "Click elements to annotate" },
    { icon: Users, label: "Collaborate with your team" },
];

export default function SignUpPage() {
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

                <div className="relative z-10 space-y-8">
                    <div>
                        <h2 className="text-3xl font-bold text-white leading-tight">
                            Review websites.
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">
                                Ship faster.
                            </span>
                        </h2>
                        <p className="mt-3 text-slate-400 text-lg">
                            The fastest way to collect and manage website feedback with your team.
                        </p>
                    </div>

                    <ul className="space-y-4">
                        {features.map(({ icon: Icon, label }) => (
                            <li key={label} className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-violet-500/20 rounded-lg flex items-center justify-center border border-violet-500/20">
                                    <Icon size={16} className="text-violet-400" />
                                </div>
                                <span className="text-slate-300 text-sm">{label}</span>
                            </li>
                        ))}
                    </ul>

                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                        <p className="text-sm text-slate-300 font-medium">Free plan includes:</p>
                        <ul className="mt-2 space-y-1">
                            {["2 projects", "50 comments", "Full review tools"].map((item) => (
                                <li key={item} className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
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
                        <h1 className="text-3xl font-bold text-white">Create your account</h1>
                        <p className="mt-2 text-slate-400">Free forever. No credit card required.</p>
                    </div>

                    <SignUpForm />

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
                                    Sign up with Google
                                </button>
                            </form>

                            <form action="/api/auth/signin/github" method="POST">
                                <button
                                    type="submit"
                                    className="w-full relative flex items-center justify-center gap-3 bg-[#24292e] hover:bg-[#1b1f23] border border-slate-700 text-white font-semibold h-11 rounded-lg transition-colors"
                                >
                                    <Github size={18} />
                                    Sign up with GitHub
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
