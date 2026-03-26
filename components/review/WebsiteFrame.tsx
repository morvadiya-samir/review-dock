"use client";

import { useRef, useEffect } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { CommentPin } from "./CommentPin";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const DEVICE_WIDTHS: Record<string, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "390px",
};

const DEVICE_HEIGHTS: Record<string, string> = {
    desktop: "100%",
    tablet: "900px",
    mobile: "844px",
};

interface WebsiteFrameProps {
    pageUrl: string;
    pageId: string;
}

export function WebsiteFrame({ pageUrl, pageId }: WebsiteFrameProps) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { mode, device, comments, iframeReady, setIframeReady } = useReviewStore();

    const proxyUrl = `/api/proxy?url=${encodeURIComponent(pageUrl)}&mode=${mode}`;

    // Reload iframe when mode changes so script injection can apply
    useEffect(() => {
        setIframeReady(false);
        if (iframeRef.current) {
            iframeRef.current.src = proxyUrl;
        }
    }, [mode, proxyUrl, setIframeReady]);

    // Continuously sync active comments to iframe so it calculates their bounding rects
    useEffect(() => {
        if (iframeReady && iframeRef.current?.contentWindow) {
            iframeRef.current.contentWindow.postMessage({
                type: 'SYNC_COMMENTS',
                comments: comments.map(c => ({ id: c.id, elementSelector: c.elementSelector }))
            }, '*');
        }
    }, [iframeReady, comments]);

    const containerStyle =
        device === "desktop"
            ? { width: "100%", height: "100%" }
            : {
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100%",
                background: `radial-gradient(ellipse at center, rgba(99,102,241,0.04) 0%, transparent 70%)`,
            };

    const frameStyle =
        device === "desktop"
            ? { width: "100%", height: "100%", border: "none" }
            : {
                width: DEVICE_WIDTHS[device],
                height: DEVICE_HEIGHTS[device],
                border: "8px solid #1e293b",
                borderRadius: "12px",
                boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
                overflow: "hidden",
            };

    return (
        <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden bg-slate-950/50"
            style={containerStyle}
        >
            {/* Loading overlay */}
            {!iframeReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-10">
                    <div className="text-center space-y-3">
                        <Loader2 size={24} className="text-violet-400 animate-spin mx-auto" />
                        <p className="text-sm text-slate-400">Loading website...</p>
                    </div>
                </div>
            )}

            {/* Review mode indicator bar */}
            {mode === "review" && iframeReady && (
                <div className="absolute top-0 left-0 right-0 z-20 bg-violet-600/10 border-b border-violet-500/30 px-4 py-1.5 flex items-center justify-center pointer-events-none">
                    <p className="text-xs text-violet-400 font-medium">
                        🎯 Review Mode — hover to highlight, click to annotate
                    </p>
                </div>
            )}

            {/* The responsive frame wrapper */}
            <div style={frameStyle} className="relative bg-white flex-shrink-0">
                <iframe
                    ref={iframeRef}
                    src={proxyUrl}
                    style={{ width: "100%", height: "100%", border: "none" }}
                    title="Website preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    onLoad={() => setIframeReady(true)}
                />

                {/* Comment pins overlay — exactly aligns with iframe padding/viewport */}
                {mode === "review" && iframeReady && (
                    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden rounded-[12px]">
                        {comments.map((comment, index) => (
                            <CommentPin
                                key={comment.id}
                                comment={comment}
                                index={comments.length - index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
