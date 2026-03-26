import { Plan, Role, CommentType, Priority, CommentStatus, MemberRole, ProjectStatus } from "@prisma/client";

// =====================
// User Types
// =====================
export interface UserProfile {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    role: Role;
    plan: Plan;
    createdAt: Date;
}

// =====================
// Project Types
// =====================
export interface ProjectWithStats {
    id: string;
    name: string;
    websiteUrl: string;
    description: string | null;
    status: ProjectStatus;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        pages: number;
        members: number;
    };
    pages?: PageWithCommentCount[];
    members?: ProjectMemberWithUser[];
}

export interface PageWithCommentCount {
    id: string;
    url: string;
    title: string | null;
    screenshot: string | null;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        comments: number;
    };
}

// =====================
// Comment Types
// =====================
export interface CommentWithAuthor {
    id: string;
    content: string;
    elementSelector: string;
    elementTag: string;
    elementText: string | null;
    suggestedText: string | null;
    xPosition: number | null;
    yPosition: number | null;
    type: CommentType;
    priority: Priority;
    status: CommentStatus;
    attachments: string[];
    pageId: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
    author: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
    replies?: ReplyType[];
    _count?: { replies: number };
}

export interface ReplyType {
    id: string;
    content: string;
    commentId: string;
    authorId: string;
    authorName: string;
    authorImage: string | null;
    createdAt: Date;
}

// =====================
// Member Types
// =====================
export interface ProjectMemberWithUser {
    id: string;
    role: MemberRole;
    userId: string;
    projectId: string;
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string;
        image: string | null;
    };
}

// =====================
// Review Interface Types
// =====================
export interface HoveredElement {
    tagName: string;
    textContent: string;
    selector: string;
    rect: DOMRect;
}

export interface ClickedElement extends HoveredElement {
    x: number;
    y: number;
    screenshot?: string;
}

export type ReviewMode = "preview" | "review";

export type DeviceType = "desktop" | "tablet" | "mobile";

export type PinPosition = {
    x: number; // percentage
    y: number; // percentage
};

// =====================
// API Response Types
// =====================
export interface ApiSuccess<T> {
    data: T;
    message?: string;
}

export interface ApiError {
    error: string;
    details?: unknown;
}

// =====================
// Form Types
// =====================
export interface CreateProjectInput {
    name: string;
    websiteUrl: string;
    description?: string;
}

export interface CreateCommentInput {
    content: string;
    elementSelector: string;
    elementTag: string;
    elementText?: string;
    suggestedText?: string;
    xPosition?: number;
    yPosition?: number;
    type: CommentType;
    priority: Priority;
    pageId: string;
}
