import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

// Prevent static analysis at build time (Prisma needs runtime DATABASE_URL)
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
    // try {
    const body = await req.json();
    const parsed = signUpSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Validation failed", details: parsed.error.flatten() },
            { status: 400 }
        );
    }

    const { name, email, password } = parsed.data;
    console.log("email", email);
    const existingUser = await prisma.user.findUnique({ where: { email: email } });
    if (existingUser) {
        return NextResponse.json(
            { error: "An account with this email already exists" },
            { status: 409 }
        );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        },
        select: { id: true, name: true, email: true },
    });

    return NextResponse.json(
        { data: user, message: "Account created successfully" },
        { status: 201 }
    );
    // } catch (error) {
    //     console.error("[SIGNUP_ERROR]", error);
    //     return NextResponse.json(
    //         { error: "Internal server error" },
    //         { status: 500 }
    //     );
    // }
}
