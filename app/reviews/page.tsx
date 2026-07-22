import { headers } from 'next/headers';
import { authGuard } from '@/lib/auth/authUtils';
import ReviewsPageClient from '@/components/reviews-page-client';

async function getInitialReviews() {
  // Get current user session
  const session = await authGuard(['USER', 'ADMIN']);
  const userId = session?.userId;

  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';

  // Build query params including userId for like status
  const params = new URLSearchParams();
  params.set('limit', '5');
  params.set('sort', 'recent');
  if (userId) {
    params.set('userId', userId.toString());
  }

  const response = await fetch(`${protocol}://${host}/api/reviews?${params.toString()}`, {
    next: { revalidate: 0, tags: ['reviews'] },
  });

  if (!response.ok) {
    return { reviews: [], nextCursor: undefined };
  }

  return response.json();
}

export default async function ReviewsPage() {
  const session = await authGuard(['USER', 'ADMIN']);
  const { reviews: initialReviews, nextCursor } = await getInitialReviews();

  return (
    <ReviewsPageClient initialReviews={initialReviews} nextCursor={nextCursor} currentUserId={session?.userId} />
  );
}