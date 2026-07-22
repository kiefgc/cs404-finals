'use client';

import { useState } from 'react';

interface FollowButtonProps {
  targetUserId: number;
  initialFollowing: boolean;
  initialFollowersCount: number;
  currentUserId: number;
}

export default function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowersCount,
  currentUserId
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followersCount, setFollowersCount] = useState(initialFollowersCount);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const method = isFollowing ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/${targetUserId}/follow`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to update follow status');
      }

      const data = await response.json();
      setIsFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch (error) {
      console.error('Follow error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition-colors ${
        isFollowing
          ? 'border border-neutral-700 bg-neutral-900 text-gray-300 hover:bg-neutral-800'
          : 'border border-brand-primary-button bg-brand-primary-button/10 text-brand-primary-button hover:bg-brand-primary-button/20'
      } ${loading ? 'opacity-50 cursor-wait' : ''}`}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}