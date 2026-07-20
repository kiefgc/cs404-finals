import { authGuard } from "@/lib/auth/authUtils";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/dashboard-client";

/**
 * Admin Dashboard - Server Component
 *
 * - Authenticates and authorizes ADMIN users only
 * - Reads active tab from URL search params (?tab=users|games|reviews)
 * - Dynamically fetches only the active tab's data (no over-fetching)
 * - Disables caching (revalidate = 0) for real-time admin data
 * - Passes initial data + activeTab to client component for interactivity
 */
export const revalidate = 0;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // 1. Authentication and Authorization Guard Checks
  const session = await authGuard();
  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { role: true },
  });

  if (!user || user.role.name !== "ADMIN") {
    redirect("/");
  }

  // 2. Read Active Window from URL Search Params
  const resolvedSearchParams = await searchParams;
  const activeTab = resolvedSearchParams?.tab || "users";

  // 3. Fetch data dynamically based on the active tab/window context
  const [totalUsers, totalGames, totalReviews] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.review.count(),
  ]);

  let tabData: any[] = [];
  let genres: { id: number; name: string }[] = [];

  if (activeTab === "users") {
    tabData = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      include: { role: true },
    });
  } else if (activeTab === "games") {
    tabData = await prisma.game.findMany({
      orderBy: { created_at: "desc" },
      include: {
        game_genres: {
          include: {
            genre: true,
          },
        },
      },
    });
    // Fetch all genres for the add game modal
    genres = await prisma.genre.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } else if (activeTab === "reviews") {
    tabData = await prisma.review.findMany({
      orderBy: { created_at: "desc" },
      include: {
        user: true,
        game: true,
      },
    });
  }

  // 4. Import and render the client component
  const DashboardClient = (await import("@/components/dashboard-client")).default;

  return (
    <div className="space-y-10">
      {/* Dashboard Header Layout */}
      <div className="border-b border-white/5 pb-4">
        <h1 className="font-headline text-4xl text-white font-bold">
          Admin Dashboard
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          Manage users, games, and reviews.
        </p>
      </div>

      {/* METRIC CARD WINDOW CONTROLLERS */}
      <div className="grid md:grid-cols-3 gap-6">
        <a
          href="?tab=users"
          className={`block bg-brand-surface border rounded p-6 transition relative overflow-hidden ${
            activeTab === "users"
              ? "border-brand-primary/50 ring-1 ring-brand-primary/30"
              : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">
            Users Window
          </p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalUsers}</h2>
          {activeTab === "users" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />
          )}
        </a>

        <a
          href="?tab=games"
          className={`block bg-brand-surface border rounded p-6 transition relative overflow-hidden ${
            activeTab === "games"
              ? "border-brand-primary/50 ring-1 ring-brand-primary/30"
              : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">
            Games Window
          </p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalGames}</h2>
          {activeTab === "games" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />
          )}
        </a>

        <a
          href="?tab=reviews"
          className={`block bg-brand-surface border rounded p-6 transition relative overflow-hidden ${
            activeTab === "reviews"
              ? "border-brand-primary/50 ring-1 ring-brand-primary/30"
              : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">
            Reviews Window
          </p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalReviews}</h2>
          {activeTab === "reviews" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />
          )}
        </a>
      </div>

      {/* SEPARATE MANAGEMENT VIEWPORTS */}
      <div className="bg-brand-surface border border-white/5 rounded-lg p-6 min-h-[400px]">
        <DashboardClient
          stats={{ totalUsers, totalGames, totalReviews }}
          initialUsers={activeTab === "users" ? tabData : []}
          initialGames={activeTab === "games" ? tabData : []}
          initialReviews={activeTab === "reviews" ? tabData : []}
          initialGenres={genres}
          activeTab={activeTab as "users" | "games" | "reviews"}
        />
      </div>
    </div>
  );
}