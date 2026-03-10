import { create } from "zustand";
import type { CommentWithAuthor, ClickedElement, HoveredElement, ReviewMode, DeviceType } from "@/types";

interface ReviewStore {
    // Mode
    mode: ReviewMode;
    setMode: (mode: ReviewMode) => void;

    // Device
    device: DeviceType;
    setDevice: (device: DeviceType) => void;

    // Element interaction
    hoveredElement: HoveredElement | null;
    setHoveredElement: (el: HoveredElement | null) => void;

    clickedElement: ClickedElement | null;
    setClickedElement: (el: ClickedElement | null) => void;

    // Comment dialog
    commentDialogOpen: boolean;
    setCommentDialogOpen: (open: boolean) => void;

    // Comments
    comments: CommentWithAuthor[];
    setComments: (comments: CommentWithAuthor[]) => void;
    addComment: (comment: CommentWithAuthor) => void;
    updateComment: (id: string, updates: Partial<CommentWithAuthor>) => void;
    removeComment: (id: string) => void;

    // Selected comment (for sidebar highlight)
    selectedCommentId: string | null;
    setSelectedCommentId: (id: string | null) => void;

    // Sidebar
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;

    // Iframe ref signal
    iframeReady: boolean;
    setIframeReady: (ready: boolean) => void;
}

export const useReviewStore = create<ReviewStore>((set) => ({
    mode: "preview",
    setMode: (mode) => set({ mode }),

    device: "desktop",
    setDevice: (device) => set({ device }),

    hoveredElement: null,
    setHoveredElement: (hoveredElement) => set({ hoveredElement }),

    clickedElement: null,
    setClickedElement: (clickedElement) => set({ clickedElement }),

    commentDialogOpen: false,
    setCommentDialogOpen: (commentDialogOpen) => set({ commentDialogOpen }),

    comments: [],
    setComments: (comments) => set({ comments }),
    addComment: (comment) =>
        set((state) => ({ comments: [comment, ...state.comments] })),
    updateComment: (id, updates) =>
        set((state) => ({
            comments: state.comments.map((c) =>
                c.id === id ? { ...c, ...updates } : c
            ),
        })),
    removeComment: (id) =>
        set((state) => ({
            comments: state.comments.filter((c) => c.id !== id),
        })),

    selectedCommentId: null,
    setSelectedCommentId: (selectedCommentId) => set({ selectedCommentId }),

    sidebarOpen: true,
    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

    iframeReady: false,
    setIframeReady: (iframeReady) => set({ iframeReady }),
}));
