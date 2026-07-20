import { authGuard } from "@/lib/auth/authUtils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export const revalidate = 0;

export default async function DashboardPage(props: {
  searchParams?: Promise<{ tab?: string }>;
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
  const searchParams = await props.searchParams;
  const activeTab = searchParams?.tab || "users";

  // 3. Fetch data dynamically based on the active tab/window context
  const [totalUsers, totalGames, totalReviews] = await Promise.all([
    prisma.user.count(),
    prisma.game.count(),
    prisma.review.count(),
  ]);

  let tabData: any[] = [];
  if (activeTab === "users") {
    tabData = await prisma.user.findMany({
      orderBy: { created_at: "desc" },
      include: { role: true },
    });
  } else if (activeTab === "games") {
    tabData = await prisma.game.findMany({
      orderBy: { created_at: "desc" },
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

  // 4. INLINE SERVER ACTIONS (Bypasses API routes entirely)
  async function makeAdminAction(formData: FormData) {
    "use server";
    const targetId = Number(formData.get("targetId"));
    
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    if (adminRole) {
      await prisma.user.update({
        where: { id: targetId },
        data: { role_id: adminRole.id },
      });
      revalidateTag("dashboard-admin");
      revalidateTag("dashboard-user");
    }
  }

  async function deleteUserAction(formData: FormData) {
    "use server";
    const targetId = Number(formData.get("targetId"));
    
    // Safety check against self-deletion
    if (targetId !== session?.userId) {
      await prisma.user.delete({ where: { id: targetId } });
      revalidateTag("dashboard-admin");
      revalidateTag("dashboard-user");
    }
  }

  async function deleteReviewAction(formData: FormData) {
    "use server";
    const targetId = Number(formData.get("targetId"));
    
    await prisma.review.delete({ where: { id: targetId } });
    revalidateTag("dashboard-admin");
    revalidateTag("dashboard-user");
  }

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
            activeTab === "users" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Users Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalUsers}</h2>
          {activeTab === "users" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </a>

        <a
          href="?tab=games"
          className={`block bg-brand-surface border rounded p-6 transition relative overflow-hidden ${
            activeTab === "games" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Games Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalGames}</h2>
          {activeTab === "games" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </a>

        <a
          href="?tab=reviews"
          className={`block bg-brand-surface border rounded p-6 transition relative overflow-hidden ${
            activeTab === "reviews" ? "border-brand-primary/50 ring-1 ring-brand-primary/30" : "border-white/5 hover:border-white/10"
          }`}
        >
          <p className="text-xs uppercase tracking-widest text-brand-primary-button font-bold">Reviews Window</p>
          <h2 className="text-4xl font-bold mt-2 text-white">{totalReviews}</h2>
          {activeTab === "reviews" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-primary-button" />}
        </a>
      </div>

      {/* SEPARATE MANAGEMENT VIEWPORTS */}
      <div className="bg-brand-surface border border-white/5 rounded-lg p-6 min-h-[400px]">
        
        {/* VIEWPORT 1: USERS DATA MATRIX */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">User Matrix Console</h2>
              <span className="text-xs font-mono text-gray-500">{tabData.length} records</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[550px] overflow-y-auto pr-2">
              {tabData.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-white">{u.name}</p>
                      {u.role?.name === "ADMIN" && (
                        <span className="text-[9px] uppercase tracking-wider font-bold bg-brand-primary/20 border border-brand-primary/40 px-1.5 py-0.5 rounded text-brand-primary-light">Admin</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">@{u.handle || "unregistered"} • {u.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {u.role?.name !== "ADMIN" && (
                      <form action={makeAdminAction}>
                        <input type="hidden" name="targetId" value={u.id} />
                        <button type="submit" className="px-3 py-1.5 rounded bg-brand-primary/10 border border-brand-primary/30 text-brand-primary-light text-xs font-semibold hover:bg-brand-primary/20 transition">
                          Make Admin
                        </button>
                      </form>
                    )}
                    {u.id !== session.userId && (
                      <form action={deleteUserAction}>
                        <input type="hidden" name="targetId" value={u.id} />
                        {/* Notice we replaced onSubmit with a safe native form button modifier */}
                        <button 
                          type="submit" 
                          formAction={deleteUserAction}
                          className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition"
                        >
                          Delete
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEWPORT 2: GAMES CATALOG */}
        {activeTab === "games" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">Application Catalog Titles</h2>
              <button className="px-3 py-1.5 rounded bg-brand-primary-button text-black text-xs font-bold hover:opacity-90 transition">
                + Append New Title
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-2">
              {tabData.map((game: any) => (
                <div key={game.id} className="bg-brand-bg/50 border border-white/5 p-4 rounded flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-white text-sm">{game.title}</h4>
                    <p className="text-xs text-gray-500 mt-1">Release Field: {new Date(game.release_date).toLocaleDateString()}</p>
                  </div>
                  <button className="px-2.5 py-1.5 rounded bg-white/5 border border-white/10 text-gray-400 text-xs hover:text-white hover:bg-white/10 transition">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEWPORT 3: REVIEW AUDIT LOG */}
        {activeTab === "reviews" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h2 className="font-headline text-2xl text-white font-bold">Review Feed Logs</h2>
              <span className="text-xs font-mono text-gray-500">Live Evaluation Data</span>
            </div>
            <div className="divide-y divide-white/5 max-h-[550px] overflow-y-auto pr-2">
              {tabData.map((review: any) => (
                <div key={review.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${review.recommended ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {review.recommended ? 'RECOMMENDED' : 'CRITIQUE'}
                      </span>
                      <h4 className="font-semibold text-white text-sm">{review.title}</h4>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 italic font-light">"{review.body}"</p>
                    <p className="text-[11px] text-gray-500">
                      By <span className="text-gray-300 font-medium">{review.user?.name || "Deleted User"}</span> on <span className="text-brand-primary-light font-medium">{review.game?.title || "Unknown Game"}</span>
                    </p>
                  </div>
                  <form action={deleteReviewAction}>
                    <input type="hidden" name="targetId" value={review.id} />
                    <button type="submit" className="px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/20 transition w-full sm:w-auto text-center">
                      Delete Review
                    </button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}