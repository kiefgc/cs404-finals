'use client';

import { useState } from 'react';

interface DeleteReviewButtonProps {
  reviewId: string | number;
  isOwner: boolean;
  onDelete?: () => void;
}

export default function DeleteReviewButton({ reviewId, isOwner, onDelete }: DeleteReviewButtonProps) {
  if (!isOwner) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to archive review');
      }

      // Success - notify parent to refresh
      onDelete?.();
    } catch (err: any) {
      alert(err.message || 'Failed to archive review');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="flex items-center">
      <button
        onClick={() => setShowConfirm(true)}
        disabled={isDeleting}
        className="bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-950/60 px-4 py-2 rounded-xl font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? 'Archiving...' : 'Archive Review'}
      </button>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-brand-surface border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Archive Review?</h3>
            <p className="text-gray-400 mb-6">
              This will hide your review from public view. You can restore it later if needed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-brand-surface-elevated border border-white/10 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-rose-600 border border-rose-500 rounded-xl hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Archiving...' : 'Archive'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}