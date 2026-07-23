import { withAuth } from '@/lib/auth/routeHandler';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

// POST - Follow a user
export const POST = withAuth(async (req: Request, user, context) => {
  const { params } = context!;
  const { userid } = await params;
  const targetUserId = parseInt(userid, 10);

  if (isNaN(targetUserId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Can't follow yourself
  if (targetUserId === user.userId) {
    return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
  }

  // Check if target user exists
  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true },
  });

  if (!targetUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Check if already following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      following_id_follower_id: {
        following_id: targetUserId,
        follower_id: user.userId,
      },
    },
  });

  if (existingFollow) {
    return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
  }

  // Create follow relationship
  await prisma.follow.create({
    data: {
      following_id: targetUserId,
      follower_id: user.userId,
    },
  });

  // Return updated follower count
  const followerCount = await prisma.follow.count({
    where: { following_id: targetUserId },
  });

  return NextResponse.json({
    following: true,
    followersCount: followerCount
  });
});

// DELETE - Unfollow a user
export const DELETE = withAuth(async (req: Request, user, context) => {
  const { params } = context!;
  const { userid } = await params;
  const targetUserId = parseInt(userid, 10);

  if (isNaN(targetUserId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Check if following
  const existingFollow = await prisma.follow.findUnique({
    where: {
      following_id_follower_id: {
        following_id: targetUserId,
        follower_id: user.userId,
      },
    },
  });

  if (!existingFollow) {
    return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
  }

  // Delete follow relationship
  await prisma.follow.delete({
    where: {
      following_id_follower_id: {
        following_id: targetUserId,
        follower_id: user.userId,
      },
    },
  });

  // Return updated follower count
  const followerCount = await prisma.follow.count({
    where: { following_id: targetUserId },
  });

  return NextResponse.json({
    following: false,
    followersCount: followerCount
  });
});

// GET - Check follow status and get follower count
export const GET = withAuth(async (req: Request, user, context) => {
  const { params } = context!;
  const { userid } = await params;
  const targetUserId = parseInt(userid, 10);

  if (isNaN(targetUserId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  const isFollowing = await prisma.follow.findUnique({
    where: {
      following_id_follower_id: {
        following_id: targetUserId,
        follower_id: user.userId,
      },
    },
  });

  const followerCount = await prisma.follow.count({
    where: { following_id: targetUserId },
  });

  return NextResponse.json({
    following: !!isFollowing,
    followersCount: followerCount
  });
});