import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProfileEditClient from "./profile-edit-client";

interface PageProps {
  params: Promise<{ userid: string }>;
}

async function getProfileData(userIdStr: string) {
  const numericId = parseInt(userIdStr, 10);
  if (isNaN(numericId)) return null;

  const user = await prisma.user.findUnique({
    where: { id: numericId },
    select: {
      id: true,
      name: true,
      handle: true,
      bio: true,
      location: true,
      profile_pic: true,
    },
  });

  return user;
}

async function getCurrentUserId(): Promise<number | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token")?.value;

  if (!authToken) return null;

  try {
    const { verifyToken } = await import("@/lib/auth/authUtils");
    const payload = await verifyToken(authToken);
    return payload?.userId ?? null;
  } catch {
    return null;
  }
}

export default async function ProfileEditPage({ params }: PageProps) {
  const resolvedParams = await params;
  const profileUserId = parseInt(resolvedParams.userid, 10);

  if (isNaN(profileUserId)) {
    notFound();
  }

  // Get current authenticated user
  const currentUserId = await getCurrentUserId();

  // Only allow users to edit their own profile
  if (currentUserId !== profileUserId) {
    notFound();
  }

  const profile = await getProfileData(resolvedParams.userid);

  if (!profile) {
    notFound();
  }

  return <ProfileEditClient initialData={profile} />;
}