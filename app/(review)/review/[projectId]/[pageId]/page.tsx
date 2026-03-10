import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { ReviewInterface } from "@/components/review/ReviewInterface";
import type { Metadata } from "next";

interface ReviewPageProps {
    params: Promise<{ projectId: string; pageId: string }>;
    searchParams: Promise<{ mode?: string }>;
}

export async function generateMetadata({ params }: ReviewPageProps): Promise<Metadata> {
    const { pageId } = await params;
    const page = await prisma.page.findUnique({ where: { id: pageId }, select: { title: true, url: true } });
    return { title: page?.title ?? page?.url ?? "Review" };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    const { projectId, pageId } = await params;

    const page = await prisma.page.findFirst({
        where: {
            id: pageId,
            projectId,
            project: {
                OR: [
                    { ownerId: session.user.id },
                    { members: { some: { userId: session.user.id } } },
                ],
            },
        },
        include: {
            project: { select: { id: true, name: true, websiteUrl: true } },
            comments: {
                include: {
                    author: { select: { id: true, name: true, email: true, image: true } },
                    replies: { orderBy: { createdAt: "asc" } },
                    _count: { select: { replies: true } },
                },
                orderBy: { createdAt: "desc" },
            },
        },
    });

    if (!page) notFound();

    return (
        <ReviewInterface
            page={page}
            currentUserId={session.user.id}
            currentUserName={session.user.name ?? ""}
            currentUserImage={session.user.image ?? null}
        />
    );
}
