"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { timeAgo } from "@/lib/utils";
import type { ReplyType } from "@/types";

interface CommentRepliesProps {
    commentId: string;
    initialReplyCount: number;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
}

export function CommentReplies({
    commentId,
    initialReplyCount,
    currentUserId,
    currentUserName,
    currentUserImage,
}: CommentRepliesProps) {
    const [expanded, setExpanded] = useState(false);
    const [replies, setReplies] = useState<ReplyType[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [totalCount, setTotalCount] = useState(initialReplyCount);

    const loadReplies = async () => {
        if (loaded) { setExpanded(true); return; }
        const res = await fetch(`/api/comments/${commentId}/replies`);
        const json = await res.json();
        if (res.ok) {
            setReplies(json.data);
            setLoaded(true);
            setExpanded(true);
        }
    };

    const toggle = () => {
        if (expanded) { setExpanded(false); return; }
        loadReplies();
    };

    const sendReply = async () => {
        if (!replyText.trim()) return;
        setIsSending(true);
        try {
            const res = await fetch(`/api/comments/${commentId}/replies`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: replyText.trim() }),
            });
            const json = await res.json();
            if (!res.ok) { toast.error(json.error || "Failed to send reply"); return; }
            setReplies((prev) => [...prev, json.data]);
            setTotalCount((c) => c + 1);
            setReplyText("");
            setExpanded(true);
            setLoaded(true);
        } catch { toast.error("Something went wrong"); }
        finally { setIsSending(false); }
    };

    const initials = (name: string | null | undefined) =>
        name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) ?? "U";

    return (
        <div className="mt-3 border-t border-slate-800 pt-3 space-y-3">
            {/* Toggle replies */}
            {totalCount > 0 && (
                <button
                    onClick={toggle}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-violet-400 transition-colors"
                >
                    {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                    {expanded ? "Hide" : `View`} {totalCount} repl{totalCount === 1 ? "y" : "ies"}
                </button>
            )}

            {/* Replies list */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 overflow-hidden"
                    >
                        {replies.map((reply) => (
                            <div key={reply.id} className="flex gap-2">
                                <Avatar className="h-5 w-5 flex-shrink-0 mt-0.5">
                                    <AvatarImage src={reply.authorImage ?? undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-[8px] font-bold text-white">
                                        {initials(reply.authorName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-slate-300">{reply.authorName}</span>
                                        <span className="text-[10px] text-slate-600">{timeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{reply.content}</p>
                                </div>
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reply input */}
            <div className="flex gap-2 items-start">
                <Avatar className="h-5 w-5 flex-shrink-0 mt-1">
                    <AvatarImage src={currentUserImage ?? undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-indigo-600 text-[8px] font-bold text-white">
                        {initials(currentUserName)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-1.5">
                    <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Add a reply..."
                        className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-600 text-xs focus:border-violet-500/50 resize-none min-h-0 h-8 py-1.5 leading-tight"
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                sendReply();
                            }
                        }}
                    />
                    <Button
                        size="icon"
                        onClick={sendReply}
                        disabled={isSending || !replyText.trim()}
                        className="h-8 w-8 bg-violet-600/30 hover:bg-violet-600 text-violet-400 hover:text-white border border-violet-500/30 flex-shrink-0"
                    >
                        {isSending ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    </Button>
                </div>
            </div>
        </div>
    );
}
