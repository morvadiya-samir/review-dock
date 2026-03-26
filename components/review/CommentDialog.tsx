"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCommentSchema, type CreateCommentInput } from "@/lib/validations/comment";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Tag, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { CommentWithAuthor } from "@/types";

const TYPE_OPTIONS = [
    { value: "NOTE", label: "📝 Note" },
    { value: "BUG", label: "🐛 Bug" },
    { value: "SUGGESTION", label: "💡 Suggestion" },
    { value: "CONTENT_CHANGE", label: "✏️ Content Change" },
    { value: "DESIGN_CHANGE", label: "🎨 Design Change" },
];

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low", color: "text-green-400" },
    { value: "MEDIUM", label: "Medium", color: "text-yellow-400" },
    { value: "HIGH", label: "High", color: "text-orange-400" },
    { value: "CRITICAL", label: "Critical", color: "text-red-400" },
];

interface CommentDialogProps {
    pageId: string;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
}

export function CommentDialog({
    pageId,
    currentUserId,
    currentUserName,
    currentUserImage,
}: CommentDialogProps) {
    const {
        commentDialogOpen,
        setCommentDialogOpen,
        clickedElement,
        setClickedElement,
        addComment,
        mode,
    } = useReviewStore();

    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<CreateCommentInput>({
        resolver: zodResolver(createCommentSchema),
        defaultValues: {
            type: "NOTE",
            priority: "MEDIUM",
            elementSelector: "",
            elementTag: "",
        },
    });

    const close = () => {
        setCommentDialogOpen(false);
        setClickedElement(null);
        reset();
    };

    const onSubmit = async (data: CreateCommentInput) => {
        if (!clickedElement) return;
        setIsSubmitting(true);

        // Calculate percentage offset *inside* the clicked element
        let xPct, yPct;
        if (clickedElement) {
            const rect = clickedElement.rect;
            if (rect && rect.width > 0 && rect.height > 0 && clickedElement.x != null && clickedElement.y != null) {
                xPct = Math.min(100, Math.max(0, ((clickedElement.x - rect.left) / rect.width) * 100));
                yPct = Math.min(100, Math.max(0, ((clickedElement.y - rect.top) / rect.height) * 100));
            } else if (clickedElement.x != null && clickedElement.y != null) {
                // Fallback to window percentage if rect is invalid
                xPct = Math.min(100, Math.max(0, (clickedElement.x / window.innerWidth) * 100));
                yPct = Math.min(100, Math.max(0, (clickedElement.y / window.innerHeight) * 100));
            }
        }

        try {
            const res = await fetch(`/api/pages/${pageId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    elementSelector: clickedElement.selector,
                    elementTag: clickedElement.tagName,
                    elementText: clickedElement.textContent,
                    xPosition: xPct,
                    yPosition: yPct,
                }),
            });

            const json = await res.json();
            if (!res.ok) {
                toast.error(json.error || "Failed to save comment");
                return;
            }

            addComment(json.data as CommentWithAuthor);
            toast.success("Comment saved!");
            close();
        } catch {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (mode !== "review") return null;

    return (
        <AnimatePresence>
            {commentDialogOpen && clickedElement && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                        onClick={close}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
                    >
                        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1">
                                        <Code2 size={11} className="text-violet-400" />
                                        <span className="text-xs font-mono text-violet-300">
                                            {`<${clickedElement.tagName.toLowerCase()}>`}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-white">Add Comment</span>
                                </div>
                                <button
                                    onClick={close}
                                    className="text-slate-500 hover:text-white transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Element preview */}
                            {clickedElement.textContent && (
                                <div className="px-5 py-3 bg-slate-800/40 border-b border-slate-800">
                                    <p className="text-xs text-slate-500 mb-0.5">Element text:</p>
                                    <p className="text-xs text-slate-300 line-clamp-2 italic">
                                        &ldquo;{clickedElement.textContent}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-400">Your Note *</Label>
                                    <Textarea
                                        placeholder="What needs to change? Be specific..."
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 resize-none text-sm"
                                        rows={3}
                                        autoFocus
                                        {...register("content")}
                                    />
                                    {errors.content && (
                                        <p className="text-xs text-red-400">{errors.content.message}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-medium text-slate-400">Suggested Text (optional)</Label>
                                    <Input
                                        placeholder="Replacement text suggestion..."
                                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-violet-500 h-9 text-sm"
                                        {...register("suggestedText")}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-400">Type</Label>
                                        <Select
                                            defaultValue="NOTE"
                                            onValueChange={(v) => setValue("type", v as any)}
                                        >
                                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                {TYPE_OPTIONS.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="text-slate-300 text-xs focus:bg-slate-800 focus:text-white"
                                                    >
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-medium text-slate-400">Priority</Label>
                                        <Select
                                            defaultValue="MEDIUM"
                                            onValueChange={(v) => setValue("priority", v as any)}
                                        >
                                            <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white h-9 text-xs">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-slate-700">
                                                {PRIORITY_OPTIONS.map((opt) => (
                                                    <SelectItem
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="text-slate-300 text-xs focus:bg-slate-800 focus:text-white"
                                                    >
                                                        <span className={opt.color}>{opt.label}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={close}
                                        className="flex-1 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-800"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                                    >
                                        {isSubmitting ? (
                                            <><Loader2 className="mr-2 h-3 w-3 animate-spin" />Saving...</>
                                        ) : (
                                            "Save Comment"
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
