"use client";

import { useState } from "react";

type DashboardClientProps = {
  stats: { totalUsers: number; totalGames: number; totalReviews: number };
  initialUsers: any[];
  initialGames: any[];
  initialReviews: any[];
};

export default function DashboardClient({
  stats,
  initialUsers,
  initialGames,
  initialReviews,
}: DashboardClientProps) {
  // Manage separate active windows: 'users' | 'games' | 'reviews'
  const [activeTab, setActiveTab] = useState<"users" | "games" | "reviews">("users");
  const [users, setUsers] = useState(initialUsers);
  const [games, setGames] = useState(initialGames);
  const [reviews, setReviews] = useState(initialReviews);

  // Placeholder actions - Replace with your Server Actions / API calls
  const handleMakeAdmin = async (userId: number) => {
    alert(`Action: Promote user ID ${userId} to ADMIN`);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(users.filter((u) => u.id !== userId));
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (confirm("Are you sure you want to remove this review?")) {
      setReviews(reviews.filter((r) => r.id !== reviewId));
    }
  };

  return (
    <div className="space-y-8">
      
      {/* WINDOW TOGGLE METRICS */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`text-left bg-brand-surface border rounded p-6 transition group relative overflow-hidden ${
            activeTab === "users" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Users Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{stats.totalUsers}</h2>
          {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </button>

        <button
          onClick={() => setActiveTab("games")}
          className={`text-left bg-brand-surface border rounded p-6 transition group relative overflow-hidden ${
            activeTab === "games" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Games Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{stats.totalGames}</h2>
          {activeTab === "games" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </button>

        <button
          onClick={() => setActiveTab("reviews")}
          className={`text-left bg-brand-surface border rounded p-6 transition group relative overflow-hidden ${
            activeTab === "reviews" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Reviews Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{stats.totalReviews}</h2>
          {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </button>
      </div>

      {/* DYNAMIC WINDOW CONTENTS */}
      <div className="bg-brand-surface border border-white/5 rounded-lg p-6 min-h-[400px]">
        
        {/* WINDOW 1: USER MANAGEMENT */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">Active Users Database</h2>
              <span className="text-xs font-mono text-gray-500">Showing {users.length} profiles</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto pr-2">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{u.name}</p>
                      {u.role.name === "ADMIN" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-primary/20 border border-brand-primary/40 px-1.5 py-0.5 rounded text-brand-primary-light">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{u.handle || "no-handle"} • {u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {u.role.name !== "ADMIN" && (
                      <button 
                        onClick={() => handleMakeAdmin(u.id)}
                        className="px-3 py-1.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary-light text-xs font-semibold hover:bg-brand-primary/20 transition"
                      >
                        Make Admin
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteUser(u.id)}
                      className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINDOW 2: GAME MANAGEMENT */}
        {activeTab === "games" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">Catalogued Titles</h2>
              <button className="px-3 py-1.5 rounded bg-brand-primary-button text-black text-xs font-bold hover:opacity-90 transition">
                + Add New Game
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
              {games.map((game) => (
                <div key={game.id} className="bg-brand-bg/50 border border-white/5 p-4 rounded flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{game.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Released: {new Date(game.release_date).toLocaleDateString()}</p>
                    <p className="text-xs text-brand-primary-light font-mono mt-0.5">★ {game.rating_avg.toFixed(1)} / 5.0</p>
                  </div>
                  <button className="px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* WINDOW 3: REVIEW MODERATION */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">Community Reviews Feed</h2>
              <span className="text-xs font-mono text-gray-500">Live Stream Logs</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto pr-2">
              {reviews.map((review) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${review.recommended ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {review.recommended ? 'RECOMMENDED' : 'CRITIQUE'}
                      </span>
                      <h4 className="font-semibold text-white text-sm">{review.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 italic font-light">&quot;{review.body}&quot;</p>
                    <p className="text-[11px] text-gray-500">
                      By <span className="text-gray-300 font-medium">{review.user?.name || "Deleted User"}</span> on <span className="text-brand-primary-light font-medium">{review.game?.title || "Unknown Game"}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => handleDeleteReview(review.id)}
                    className="sm:self-center px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition w-full sm:w-auto text-center"
                  >
                    Delete Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}