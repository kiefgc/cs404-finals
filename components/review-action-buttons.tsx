'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LikeReviewButton from './like-review-button';
import DeleteReviewButton from './delete-review-button';

interface ReviewActionButtonsProps {
  reviewId: number;
  initialLikes?: number;
  initialLiked?: boolean;
  isOwner?: boolean;
  currentUserId?: number;
}

export default function ReviewActionButtons({
  reviewId,
  initialLikes,
  initialLiked,
  isOwner = false,
  currentUserId
}: ReviewActionButtonsProps) {
  const router = useRouter();
  // Use nullish coalescing to fall back to 0 if initialLikes is undefined or null
  const [likesCount, setLikesCount] = useState(initialLikes ?? 0);
  const [liked, setLiked] = useState(initialLiked ?? false);

  async function toggleLike() {
    try {
      const res = await fetch(`/api/reviews/${reviewId}/like`, { method: 'POST' });
      if (!res.ok) return;
      const data = await res.json();
      setLiked(data.liked);
      setLikesCount(data.likes_count ?? 0);
    } catch {
      // silently fail
    }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleReport = () => {
    alert('Report submitted. Our team will review this content.');
  };

  const handleDeleteComplete = () => {
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {/* LIKE CARD */}
      <button
        onClick={toggleLike}
        className={`bg-brand-surface border rounded-lg p-4 text-center transition group shadow-md cursor-pointer ${
          liked ? 'border-brand-primary-button/30 bg-brand-primary-button/10' : 'border-white/5 hover:border-brand-primary-button/30'
        }`}
      >
        <div className="text-2xl mb-2 group-hover:scale-110 transition">
          {liked ? '❤️' : '👍'}
        </div>
        <div className="text-sm font-mono font-bold text-brand-primary-button">
          {(likesCount ?? 0).toLocaleString()}
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
          {liked ? 'Liked' : 'Found Helpful'}
        </div>
      </button>

      {/* SHARE CARD */}
      <button
        onClick={handleShare}
        className="bg-brand-surface border border-white/5 hover:border-brand-primary-button/30 rounded-lg p-4 text-center transition group shadow-md cursor-pointer"
      >
        <div className="text-2xl mb-2 group-hover:scale-110 transition">🔗</div>
        <div className="text-sm font-semibold text-gray-300">
          Share
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
          Review Link
        </div>
      </button>

      {/* REPORT CARD */}
      <button
        onClick={handleReport}
        className="bg-brand-surface border border-white/5 hover:border-red-500/30 rounded-lg p-4 text-center transition group shadow-md cursor-pointer"
      >
        <div className="text-2xl mb-2 group-hover:scale-110 transition">⚠️</div>
        <div className="text-sm font-semibold text-gray-300">
          Report
        </div>
        <div className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mt-1">
          Inappropriate
        </div>
      </button>

      {/* DELETE/ARCHIVE CARD - Only for owner */}
      {isOwner && currentUserId && (
        <DeleteReviewButton
          reviewId={reviewId}
          isOwner={isOwner}
          onDelete={handleDeleteComplete}
        />
      )}
    </div>
  );
}