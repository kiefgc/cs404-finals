'use client';

import { useState } from 'react';

interface LikeReviewButtonProps {
  reviewId: string | number; // or number, depending on your schema
  initialLikes?: number; // Marked as optional for safety
}

export default function LikeReviewButton({ reviewId, initialLikes }: LikeReviewButtonProps) {
  const [liked, setLiked] = useState(false);
  // Fallback to 0 if initialLikes is undefined or null
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