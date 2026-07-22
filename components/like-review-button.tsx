'use client';

import { useState } from 'react';

interface LikeReviewButtonProps {
  reviewId: string | number;
  initialLikes?: number;
  initialLiked?: boolean;
}

export default function LikeReviewButton({ reviewId, initialLikes, initialLiked }: LikeReviewButtonProps) {
  const [liked, setLiked] = useState(initialLiked ?? false);
  const [count, setCount] = useState(initialLikes ?? 0);

  async function toggleReviewLike() {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(data.liked);
      setCount(data.likes_count ?? 0);
    } catch {
      // silently fail
    }
  }

  return (
    <button 
      onClick={toggleReviewLike}
      className={`flex items-center gap-1 transition cursor-pointer ${
        liked ? 'text-brand-primary-button' : 'text-brand-secondary hover:text-brand-primary-button'
      }`}
    >
      {/* Safe check ensures we never call toLocaleString on undefined */}
      👍 {(count ?? 0).toLocaleString()}
    </button>
  );
}