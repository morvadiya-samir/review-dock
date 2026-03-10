"use client";

import { useEffect, useRef, useCallback } from "react";
import { useReviewStore } from "@/stores/reviewStore";
import { ReviewToolbar } from "./ReviewToolbar";
import { WebsiteFrame } from "./WebsiteFrame";
import { CommentSidebar } from "./CommentSidebar";
import { CommentDialog } from "./CommentDialog";
import type { CommentWithAuthor } from "@/types";

interface Page {
    id: string;
    url: string;
    title: string | null;
    project: { id: string; name: string; websiteUrl: string };
    comments: CommentWithAuthor[];
}

interface ReviewInterfaceProps {
    page: Page;
    currentUserId: string;
    currentUserName: string;
    currentUserImage: string | null;
}

export function ReviewInterface({
    page,
    currentUserId,
    currentUserName,
    currentUserImage,
}: ReviewInterfaceProps) {
    const {
        mode,
        setComments,
        setClickedElement,
        setCommentDialogOpen,
        setHoveredElement,
        setIframeReady,
        sidebarOpen,
    } = useReviewStore();

    // Load initial comments from SSR data
    useEffect(() => {
        setComments(page.comments);
    }, [page.comments, setComments]);

    // Listen for postMessage events from the proxied iframe
    const handleMessage = useCallback(
        (event: MessageEvent) => {
            const { type, data } = event.data ?? {};
            if (!type) return;

            if (type === "IFRAME_READY") {
                setIframeReady(true);
            }

            if (type === "ELEMENT_HOVER" && mode === "review") {
                setHoveredElement(data);
            }

            if (type === "ELEMENT_CLICK" && mode === "review") {
                setClickedElement(data);
                setCommentDialogOpen(true);
            }
        },
        [mode, setClickedElement, setCommentDialogOpen, setHoveredElement, setIframeReady]
    );

    useEffect(() => {
        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [handleMessage]);

    return (
        <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
            {/* Top Toolbar */}
            <ReviewToolbar
                projectId={page.project.id}
                projectName={page.project.name}
                pageUrl={page.url}
                pageId={page.id}
            />

            {/* Main Area */}
            <div className="flex flex-1 overflow-hidden">
                {/* Website Iframe */}
                <div className="flex-1 flex flex-col overflow-hidden relative">
                    <WebsiteFrame pageUrl={page.url} pageId={page.id} />
                </div>

                {/* Comments Sidebar */}
                {sidebarOpen && (
                    <CommentSidebar
                        pageId={page.id}
                        currentUserId={currentUserId}
                        currentUserName={currentUserName}
                        currentUserImage={currentUserImage}
                    />
                )}
            </div>

            {/* Comment Dialog (appears when element clicked in review mode) */}
            <CommentDialog
                pageId={page.id}
                currentUserId={currentUserId}
                currentUserName={currentUserName}
                currentUserImage={currentUserImage}
            />
        </div>
    );
}
