import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const comment = await prisma.comment.findUnique({
        where: { id },
        select: { attachments: true },
    });

    if (!comment || !comment.attachments.length) {
        return new NextResponse("Not Found", { status: 404 });
    }

    const dataUri = comment.attachments[0];
    const match = dataUri.match(/^data:(.+);base64,(.+)$/);

    if (!match) {
        return new NextResponse("Invalid image format", { status: 500 });
    }

    const [, mimeType, base64Data] = match;
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
        headers: {
            "Content-Type": mimeType,
            "Cache-Control": "public, max-age=31536000, immutable",
        },
    });
}
