"use client";

import { useState } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, Clock, AlertCircle,
    Trash2, MessageSquare
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, timeAgo } from "@/lib/utils";
import { CommentReplies } from "./CommentReplies";
import type { CommentWithAuthor } from "@/types";

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-green-500/10 text-green-400 border-green-500/20",
    MEDIUM: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    CRITICAL: "bg-red-500/10 text-red-400 border-red-500/20",
};

const STATUS_ICONS: Record<string, React.ElementType> = {
    OPEN: AlertCircle,
    IN_PROGRESS: Clock,
    RESOLVED: CheckCircle2,
    CLOSED: CheckCircle2,
};

const STATUS_COLORS: Record<string, string> = {
    OPEN: "text-blue-400",
    IN_PROGRESS: "text-yellow-400",
    RESOLVED: "text-green-400",
    CLOSED: "text-slate-400",
};

function CommentCard({
    comment,
    index,
    currentUserId,
    currentUserName,
    currentUserImage,
}: {
    comment: CommentWithAuthor;
    index: number;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
}) {
    const { selectedCommentId, setSelectedCommentId, removeComment, updateComment } =
        useReviewStore();
    const isSelected = selectedCommentId === comment.id;
    const [expanded, setExpanded] = useState(false);
    const [resolving, setResolving] = useState(false);

    const StatusIcon = STATUS_ICONS[comment.status] ?? AlertCircle;

    const initials = comment.author.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) ?? "U";

    const resolve = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setResolving(true);
        try {
            const newStatus = comment.status === "RESOLVED" ? "OPEN" : "RESOLVED";
            const res = await fetch(`/api/comments/${comment.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                updateComment(comment.id, { status: newStatus });
                toast.success(newStatus === "RESOLVED" ? "Comment resolved!" : "Reopened");
            }
        } catch {
            toast.error("Failed to update status");
        } finally {
            setResolving(false);
        }
    };

    const deleteComment = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (comment.authorId !== currentUserId) return;
        try {
            await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
            removeComment(comment.id);
            toast.success("Comment deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
                "rounded-xl border transition-all duration-150 cursor-pointer",
                isSelected
                    ? "border-violet-500/50 bg-violet-500/5"
                    : "border-slate-800 bg-slate-900/60 hover:border-slate-700"
            )}
            onClick={() => setSelectedCommentId(isSelected ? null : comment.id)}
        >
            <div className="p-3">
                {/* Author + meta */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-400 flex-shrink-0">
                            #{index}
                        </span>
                        <Avatar className="h-6 w-6 flex-shrink-0">
                            <AvatarImage src={comment.author.image ?? undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-[9px] font-bold text-white">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-slate-400 truncate">{comment.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <StatusIcon
                            size={12}
                            className={STATUS_COLORS[comment.status] ?? "text-slate-400"}
                        />
                    </div>
                </div>

                {/* Element tag */}
                <div className="mt-2 flex items-center gap-1.5">
                    <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] px-1.5 py-0 h-4">
                        {`<${comment.elementTag.toLowerCase()}>`}
                    </Badge>
                    <Badge
                        variant="secondary"
                        className={cn("text-[10px] px-1.5 py-0 h-4 border", PRIORITY_COLORS[comment.priority])}
                    >
                        {comment.priority.toLowerCase()}
                    </Badge>
                </div>

                {/* Comment content */}
                <p className="mt-2 text-xs text-slate-300 line-clamp-2">{comment.content}</p>

                {/* Suggested text */}
                {comment.suggestedText && (
                    <div className="mt-1.5 bg-slate-800/50 border border-slate-700/50 rounded-lg px-2 py-1.5">
                        <p className="text-[10px] text-slate-500 mb-0.5">Suggested:</p>
                        <p className="text-[11px] text-violet-300 italic line-clamp-2">&ldquo;{comment.suggestedText}&rdquo;</p>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">{timeAgo(comment.createdAt)}</span>
                    <div className="flex items-center gap-1">
                        {comment.authorId === currentUserId && (
                            <button
                                onClick={deleteComment}
                                className="p-1 text-slate-600 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={11} />
                            </button>
                        )}
                        <button
                            onClick={resolve}
                            disabled={resolving}
                            className={cn(
                                "p-1 transition-colors",
                                comment.status === "RESOLVED"
                                    ? "text-green-400 hover:text-slate-400"
                                    : "text-slate-600 hover:text-green-400"
                            )}
                            title={comment.status === "RESOLVED" ? "Reopen" : "Resolve"}
                        >
                            <CheckCircle2 size={11} />
                        </button>
                    </div>
                </div>

                {/* Replies */}
                <CommentReplies
                    commentId={comment.id}
                    initialReplyCount={comment._count?.replies ?? 0}
                    currentUserId={currentUserId}
                    currentUserName={currentUserName}
                    currentUserImage={currentUserImage}
                />
            </div>
        </motion.div>
    );
}

export function CommentSidebar({
    pageId,
    currentUserId,
    currentUserName,
    currentUserImage,
}: {
    pageId: string;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
}) {
    const { comments, mode } = useReviewStore();
    const [filter, setFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

    const filtered = comments.filter((c) => {
        if (filter === "OPEN") return c.status === "OPEN" || c.status === "IN_PROGRESS";
        if (filter === "RESOLVED") return c.status === "RESOLVED" || c.status === "CLOSED";
        return true;
    });

    return (
        <aside className="w-80 flex flex-col border-l border-slate-800 bg-slate-900/50 h-full overflow-hidden">
            {/* Sidebar header */}
            <div className="p-4 border-b border-slate-800 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                        <MessageSquare size={14} className="text-violet-400" />
                        Comments
                        <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-slate-700 text-[10px] h-4 px-1.5">
                            {comments.length}
                        </Badge>
                    </h2>
                </div>

                {/* Filter tabs */}
                <div className="flex gap-1 bg-slate-800/50 rounded-lg p-0.5">
                    {(["ALL", "OPEN", "RESOLVED"] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex-1 text-[10px] font-medium py-1 rounded-md transition-all",
                                filter === f
                                    ? "bg-slate-700 text-white"
                                    : "text-slate-500 hover:text-slate-300"
                            )}
                        >
                            {f === "ALL" ? `All (${comments.length})` : f === "OPEN" ? `Open (${comments.filter(c => c.status === "OPEN" || c.status === "IN_PROGRESS").length})` : `Done (${comments.filter(c => c.status === "RESOLVED" || c.status === "CLOSED").length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Comment list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                <AnimatePresence mode="popLayout">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <MessageSquare size={24} className="text-slate-700 mb-2" />
                            <p className="text-xs text-slate-500">
                                {mode === "review"
                                    ? "Click any element on the page to add a comment"
                                    : "Switch to Review Mode to add comments"}
                            </p>
                        </div>
                    ) : (
                        filtered.map((comment, i) => (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                index={comments.indexOf(comment) + 1}
                                currentUserId={currentUserId}
                                currentUserName={currentUserName}
                                currentUserImage={currentUserImage}
                            />
                        ))
                    )}
                </AnimatePresence>
            </div>
        </aside>
    );
}
