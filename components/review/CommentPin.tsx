"use client";

import { useReviewStore } from "@/stores/reviewStore";
import type { CommentWithAuthor } from "@/types";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-green-500 border-green-400",
    MEDIUM: "bg-yellow-500 border-yellow-400",
    HIGH: "bg-orange-500 border-orange-400",
    CRITICAL: "bg-red-500 border-red-400",
};

interface CommentPinProps {
    comment: CommentWithAuthor;
    index: number;
}

export function CommentPin({ comment, index }: CommentPinProps) {
    const { selectedCommentId, setSelectedCommentId } = useReviewStore();
    const isSelected = selectedCommentId === comment.id;

    if (!comment.xPosition || !comment.yPosition) return null;

    return (
        <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
            onClick={() => setSelectedCommentId(isSelected ? null : comment.id)}
            className="pointer-events-auto absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{
                left: `${comment.xPosition}%`,
                top: `${comment.yPosition}%`,
                zIndex: isSelected ? 50 : 30,
            }}
            title={`#${index}: ${comment.content.slice(0, 60)}`}
        >
            <div
                className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold border-2 shadow-lg transition-all duration-150",
                    PRIORITY_COLORS[comment.priority] ?? "bg-violet-500 border-violet-400",
                    isSelected ? "scale-125 ring-2 ring-white ring-offset-1 ring-offset-transparent" : "group-hover:scale-110"
                )}
            >
                {index}
            </div>
        </motion.button>
    );
}
