import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { z } from "zod";

const createGenreSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ genres });
  } catch (error) {
    console.error("Error fetching genres:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await authGuard();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true },
    });

    if (!user || user.role.name !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validation = createGenreSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    const genre = await prisma.genre.create({
      data: { name },
    });

    revalidateTag("genres", {});

    return NextResponse.json({ genre }, { status: 201 });
  } catch (error) {
    console.error("Error creating genre:", error);
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Genre already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}