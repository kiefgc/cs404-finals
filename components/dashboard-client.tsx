"use client";

import { useState, useEffect } from "react";

/**
 * DashboardClient - Client-side component for the admin dashboard
 *
 * Handles all interactive admin actions via API routes:
 * - User management: Promote to Admin (POST /api/admin/make-admin), Delete User (DELETE /api/admin/delete-user)
 * - Game management: Add Game modal (POST /api/games), Delete Game (DELETE /api/games/[gameid])
 * - Review moderation: Delete Review (DELETE /api/admin/delete-review)
 * - Genre management: Fetch genres (GET /api/genres), Add Genre modal (POST /api/genres)
 *
 * Receives initial server-rendered data + activeTab from server component.
 * Manages local state for each tab independently to avoid over-fetching.
 * All mutations call API routes and revalidate server cache tags for consistency.
 *
 * @param stats - Aggregate counts { totalUsers, totalGames, totalReviews }
 * @param initialUsers - Pre-fetched user list (only when activeTab === "users")
 * @param initialGames - Pre-fetched game list (only when activeTab === "games")
 * @param initialReviews - Pre-fetched review list (only when activeTab === "reviews")
 * @param activeTab - Current active tab from URL (server-controlled)
 */
type DashboardClientProps = {
  stats: { totalUsers: number; totalGames: number; totalReviews: number };
  initialUsers: any[];
  initialGames: any[];
  initialReviews: any[];
  activeTab: "users" | "games" | "reviews";
};

export default function DashboardClient({
  stats,
  initialUsers,
  initialGames,
  initialReviews,
  activeTab,
}: DashboardClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [games, setGames] = useState(initialGames);
  const [reviews, setReviews] = useState(initialReviews);
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [showAddGameModal, setShowAddGameModal] = useState(false);
  const [showAddGenreModal, setShowAddGenreModal] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [newGame, setNewGame] = useState({
    title: "",
    description: "",
    release_date: "",
    cover_image: "",
    genre_ids: [] as number[],
  });
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);

  // Fetch genres on mount
  useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => setGenres(data.genres || []))
      .catch(console.error);
  }, []);

  // Sync with server data when activeTab changes
  useEffect(() => {
    setUsers(initialUsers);
    setGames(initialGames);
    setReviews(initialReviews);
  }, [initialUsers, initialGames, initialReviews, activeTab]);

  // API call helper
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: "Request failed" }));
      throw new Error(error.error || "Request failed");
    }
    return res.json();
  };

  // Action: Make Admin
  const handleMakeAdmin = async (userId: number) => {
    setLoading((prev) => ({ ...prev, [`make-admin-${userId}`]: true }));
    try {
      await apiCall("/api/admin/make-admin", {
        method: "POST",
        body: JSON.stringify({ targetId: userId }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, role: { name: "ADMIN", id: u.role.id } } : u
        )
      );
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to promote user");
    } finally {
      setLoading((prev) => ({ ...prev, [`make-admin-${userId}`]: false }));
    }
  };

  // Action: Delete User
  const handleDeleteUser = async (userId: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    setLoading((prev) => ({ ...prev, [`delete-user-${userId}`]: true }));
    try {
      await apiCall("/api/admin/delete-user", {
        method: "DELETE",
        body: JSON.stringify({ targetId: userId }),
      });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading((prev) => ({ ...prev, [`delete-user-${userId}`]: false }));
    }
  };

  // Action: Delete Review
  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to remove this review?")) return;
    setLoading((prev) => ({ ...prev, [`delete-review-${reviewId}`]: true }));
    try {
      await apiCall("/api/admin/delete-review", {
        method: "DELETE",
        body: JSON.stringify({ targetId: reviewId }),
      });
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete review");
    } finally {
      setLoading((prev) => ({ ...prev, [`delete-review-${reviewId}`]: false }));
    }
  };

  // Action: Delete Game
  const handleDeleteGame = async (gameId: number) => {
    if (!confirm("Are you sure you want to delete this game?")) return;
    setLoading((prev) => ({ ...prev, [`delete-game-${gameId}`]: true }));
    try {
      await apiCall(`/api/games/${gameId}`, {
        method: "DELETE",
      });
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete game");
    } finally {
      setLoading((prev) => ({ ...prev, [`delete-game-${gameId}`]: false }));
    }
  };

  // Action: Add New Game
  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading((prev) => ({ ...prev, "add-game": true }));
    try {
      const gameData = {
        title: newGame.title,
        description: newGame.description,
        release_date: newGame.release_date || new Date().toISOString(),
        cover_image: newGame.cover_image || undefined,
        genre_ids: newGame.genre_ids.length > 0 ? newGame.genre_ids : undefined,
      };
      const result = await apiCall("/api/games", {
        method: "POST",
        body: JSON.stringify(gameData),
      });
      // Add new game to local state
      if (result.game) {
        setGames((prev) => [result.game, ...prev]);
      }
      setShowAddGameModal(false);
      setNewGame({
        title: "",
        description: "",
        release_date: "",
        cover_image: "",
        genre_ids: [],
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add game");
    } finally {
      setLoading((prev) => ({ ...prev, "add-game": false }));
    }
  };

  // Handle genre selection
  const toggleGenre = (genreId: number) => {
    setNewGame((prev) => ({
      ...prev,
      genre_ids: prev.genre_ids.includes(genreId)
        ? prev.genre_ids.filter((id) => id !== genreId)
        : [...prev.genre_ids, genreId],
    }));
  };

  // Action: Add New Genre
  const handleAddGenre = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    setLoading((prev) => ({ ...prev, "add-genre": true }));
    try {
      const result = await apiCall("/api/genres", {
        method: "POST",
        body: JSON.stringify({ name: newGenreName.trim() }),
      });
      if (result.genre) {
        setGenres((prev) => [...prev, result.genre]);
        setNewGenreName("");
      }
      setShowAddGenreModal(false);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to add genre");
    } finally {
      setLoading((prev) => ({ ...prev, "add-genre": false }));
    }
  };

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="pb-3 px-4">User</th>
              <th className="pb-3 px-4">Role</th>
              <th className="pb-3 px-4">Joined</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-white/2.5 transition">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center font-bold text-brand-primary-light text-sm">
                      {u.name?.[0] || u.email?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{u.name || "Unnamed"}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      u.role.name === "ADMIN"
                        ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        : "bg-gray-700/50 text-gray-300"
                    }`}
                  >
                    {u.role.name}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-500 text-sm">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <div className="flex gap-2">
                    {u.role.name !== "ADMIN" && (
                      <button
                        onClick={() => handleMakeAdmin(u.id)}
                        disabled={loading[`make-admin-${u.id}`]}
                        className="px-3 py-1.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary-light text-xs font-semibold hover:bg-brand-primary/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading[`make-admin-${u.id}`] ? "Promoting..." : "Make Admin"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      disabled={loading[`delete-user-${u.id}`]}
                      className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading[`delete-user-${u.id}`] ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGamesTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-headline text-xl text-white">Games Library</h3>
        <button
          onClick={() => setShowAddGameModal(true)}
          className="px-4 py-2 rounded bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold text-xs uppercase tracking-widest transition"
        >
          Add New Game
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="pb-3 px-4">Cover</th>
              <th className="pb-3 px-4">Title</th>
              <th className="pb-3 px-4">Release Date</th>
              <th className="pb-3 px-4">Genres</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {games.map((g: any) => (
              <tr key={g.id} className="hover:bg-white/2.5 transition">
                <td className="py-4 px-4">
                  {g.cover_image && (
                    <img
                      src={g.cover_image}
                      alt={g.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  )}
                </td>
                <td className="py-4 px-4 font-semibold text-white">{g.title}</td>
                <td className="py-4 px-4 text-gray-500 text-sm">
                  {g.release_date ? new Date(g.release_date).toLocaleDateString() : "TBD"}
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-wrap gap-1">
                    {g.game_genres?.map((gg: any) => (
                      <span
                        key={gg.genre.id}
                        className="px-2 py-0.5 rounded text-[10px] bg-brand-primary/10 text-brand-primary-light border border-brand-primary/20"
                      >
                        {gg.genre.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <button
                    disabled={loading[`delete-game-${g.id}`]}
                    onClick={() => handleDeleteGame(g.id)}
                    className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[`delete-game-${g.id}`] ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {games.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No games in library. Click "Add New Game" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-gray-500">
              <th className="pb-3 px-4">Game</th>
              <th className="pb-3 px-4">Author</th>
              <th className="pb-3 px-4">Rating</th>
              <th className="pb-3 px-4">Date</th>
              <th className="pb-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {reviews.map((r: any) => (
              <tr key={r.id} className="hover:bg-white/2.5 transition">
                <td className="py-4 px-4 font-medium text-white">{r.game?.title}</td>
                <td className="py-4 px-4 text-gray-300">{r.user?.name}</td>
                <td className="py-4 px-4">
                  <span className="font-bold text-yellow-400">{r.rating}/10</span>
                </td>
                <td className="py-4 px-4 text-gray-500 text-sm">
                  {new Date(r.created_at).toLocaleDateString()}
                </td>
                <td className="py-4 px-4">
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    disabled={loading[`delete-review-${r.id}`]}
                    className="sm:self-center px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[`delete-review-${r.id}`] ? "Deleting..." : "Delete Review"}
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center text-gray-500">
                  No reviews yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Render only the active tab
  const renderActiveTab = () => {
    switch (activeTab) {
      case "users":
        return renderUsersTab();
      case "games":
        return renderGamesTab();
      case "reviews":
        return renderReviewsTab();
      default:
        return null;
    }
  };

  // Add Game Modal
  const renderAddGameModal = () => (
    showAddGameModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-brand-surface border border-white/10 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-2xl text-white">Add New Game</h3>
            <button
              onClick={() => setShowAddGameModal(false)}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddGame} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newGame.title}
                onChange={(e) => setNewGame({ ...newGame, title: e.target.value })}
                required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition"
                placeholder="Game Title"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Description *
              </label>
              <textarea
                value={newGame.description}
                onChange={(e) => setNewGame({ ...newGame, description: e.target.value })}
                required
                rows={4}
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition"
                placeholder="Game description..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Release Date
                </label>
                <input
                  type="date"
                  value={newGame.release_date}
                  onChange={(e) => setNewGame({ ...newGame, release_date: e.target.value })}
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={newGame.cover_image}
                  onChange={(e) => setNewGame({ ...newGame, cover_image: e.target.value })}
                  className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {genres.length > 0 ? genres.map((genre) => (
                  <button
                    type="button"
                    key={genre.id}
                    onClick={() => toggleGenre(genre.id)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition ${
                      newGame.genre_ids.includes(genre.id)
                        ? "bg-brand-primary-button text-brand-bg border border-brand-primary-button"
                        : "bg-white/5 text-gray-300 border border-white/10 hover:border-brand-primary/30"
                    }`}
                  >
                    {genre.name}
                  </button>
                )) : (
                  <span className="text-gray-500 text-xs">Loading genres...</span>
                )}
              </div>
              {genres.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowAddGenreModal(true)}
                  className="mt-2 text-xs text-brand-primary-light hover:text-brand-primary-button underline"
                >
                  + Add New Genre
                </button>
              )}
            </div>
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddGameModal(false)}
                className="flex-1 px-4 py-2.5 rounded bg-transparent border border-white/10 hover:border-white/30 text-white font-bold text-xs uppercase tracking-widest transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading["add-game"]}
                className="flex-1 px-4 py-2.5 rounded bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold text-xs uppercase tracking-widest transition disabled:opacity-50"
              >
                {loading["add-game"] ? "Adding..." : "Add Game"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );

  // Add Genre Modal
  const renderAddGenreModal = () =>
    showAddGenreModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-brand-surface border border-white/10 rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline text-2xl text-white">Add New Genre</h3>
            <button
              onClick={() => setShowAddGenreModal(false)}
              className="text-gray-400 hover:text-white transition"
            >
              ✕
            </button>
          </div>
          <form onSubmit={handleAddGenre} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                Genre Name *
              </label>
              <input
                type="text"
                value={newGenreName}
                onChange={(e) => setNewGenreName(e.target.value)}
                required
                className="w-full bg-white text-black px-4 py-3 rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-primary-button transition"
                placeholder="e.g., Platformer"
              />
            </div>
            <div className="flex gap-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddGenreModal(false)}
                className="flex-1 px-4 py-2.5 rounded bg-transparent border border-white/10 hover:border-white/30 text-white font-bold text-xs uppercase tracking-widest transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading["add-genre"]}
                className="flex-1 px-4 py-2.5 rounded bg-brand-primary-button hover:bg-brand-primary-light text-brand-bg font-bold text-xs uppercase tracking-widest transition disabled:opacity-50"
              >
                {loading["add-genre"] ? "Adding..." : "Add Genre"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

  return (
    <div className="space-y-6">
      {renderActiveTab()}
      {renderAddGameModal()}
      {renderAddGenreModal()}
    </div>
  );
}