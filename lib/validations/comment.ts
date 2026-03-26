import { z } from "zod";

export const createCommentSchema = z.object({
    content: z.string().min(1, "Comment cannot be empty").max(2000),
    elementSelector: z.string(),
    elementTag: z.string(),
    elementText: z.string().optional(),
    suggestedText: z.string().optional(),
    xPosition: z.number().min(0).max(100).optional(),
    yPosition: z.number().min(0).max(100).optional(),
    type: z.enum(["NOTE", "BUG", "SUGGESTION", "CONTENT_CHANGE", "DESIGN_CHANGE"]),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
    attachments: z.array(z.string()).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;

export const updateCommentSchema = z.object({
    content: z.string().min(1).max(2000).optional(),
    suggestedText: z.string().optional(),
    type: z.enum(["NOTE", "BUG", "SUGGESTION", "CONTENT_CHANGE", "DESIGN_CHANGE"]).optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
    status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]).optional(),
});

export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
