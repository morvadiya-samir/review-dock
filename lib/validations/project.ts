import { z } from "zod";

export const createProjectSchema = z.object({
    name: z.string().min(1, "Project name is required").max(100),
    websiteUrl: z
        .string()
        .url("Please enter a valid URL")
        .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "URL must start with http:// or https://"
        ),
    description: z.string().max(500).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const addPageSchema = z.object({
    url: z
        .string()
        .url("Please enter a valid URL")
        .refine(
            (url) => url.startsWith("http://") || url.startsWith("https://"),
            "URL must start with http:// or https://"
        ),
    title: z.string().max(200).optional(),
});

export type AddPageInput = z.infer<typeof addPageSchema>;
