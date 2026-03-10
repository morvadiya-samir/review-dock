"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Globe, Loader2, Plus, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { createProjectSchema, type CreateProjectInput } from "@/lib/validations/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewProjectPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CreateProjectInput>({
        resolver: zodResolver(createProjectSchema),
    });

    const onSubmit = async (data: CreateProjectInput) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Failed to create project");
                return;
            }

            toast.success("Project created!");
            router.push(`/dashboard/${json.data.id}`);
            router.refresh();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-4"
                >
                    <ArrowLeft size={14} />
                    Back to Dashboard
                </Link>
                <h1 className="text-2xl font-bold text-white">Create New Project</h1>
                <p className="text-slate-400 text-sm mt-1">
                    Add a website to start reviewing and collecting feedback.
                </p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8"
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                            Project Name <span className="text-red-400">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. My Company Website"
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 h-11"
                            {...register("name")}
                            disabled={isLoading}
                        />
                        {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                            Website URL <span className="text-red-400">*</span>
                        </Label>
                        <div className="relative">
                            <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <Input
                                placeholder="https://example.com"
                                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 h-11 pl-9"
                                {...register("websiteUrl")}
                                disabled={isLoading}
                            />
                        </div>
                        {errors.websiteUrl && (
                            <p className="text-xs text-red-400">{errors.websiteUrl.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-slate-300">
                            Description <span className="text-slate-500 text-xs">(optional)</span>
                        </Label>
                        <Textarea
                            placeholder="What's this project about? Any context for reviewers..."
                            className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 resize-none"
                            rows={3}
                            {...register("description")}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-sm text-slate-400">
                        <p className="font-medium text-slate-300 mb-1">What happens next?</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Your website homepage is added as the first page</li>
                            <li>• You can add more pages from the project dashboard</li>
                            <li>• Click any element in Review Mode to leave feedback</li>
                        </ul>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <Link href="/dashboard" className="flex-1">
                            <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25"
                        >
                            {isLoading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                            ) : (
                                <><Plus className="mr-2 h-4 w-4" /> Create Project</>
                            )}
                        </Button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
