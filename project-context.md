# Project Context: Game Review & Aggregation Platform

This document serves as the absolute source of truth for the project context, database constraints, architectural design, implementation progress, and upcoming implementation prompts. Open Claw must reference this file before executing any task.

---

## 1. Core Technical Stack & Architectural Constraints

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (Responsive, mobile-friendly design required)
- **Database:** PostgreSQL managed via Prisma ORM
- **Authentication:** Custom Stateless JWTs signed via `jose` and stored in a secure, HTTP-Only cookie named `auth_token`. **Do not use Supabase Auth for session tokens.**
- **Safe DB Constraints:** The database already exists and contains live data. Do NOT use destructive database commands (like `prisma db push` or raw table drops). Always use safe Prisma generation techniques.

---

## 2. Active Database Schema (Prisma)

```prisma
datasource db {
  provider = "postgresql"
}

generator client {
  provider = "prisma-client-js"
}

model Role {
  id    Int    @id @default(autoincrement())
  name  String @unique // e.g., "USER", "ADMIN"
  users User[]

  @@map("roles")
}

model User {
  id           Int         @id @default(autoincrement())
  supabase_id  String      @unique
  name         String
  handle       String      @unique @default("")
  email        String      @unique
  password     String?     // Nullable to support social logins/OAuth safely
  bio          String?     @db.Text
  profile_pic  String?
  location     String      @default("")
  role_id      Int
  created_at   DateTime    @default(now())

  role         Role        @relation(fields: [role_id], references: [id])
  reviews      Review[]
  likes        Like[]
  saved_games  SavedGame[]

  // Self-referential relations for social system
  following    Follow[]    @relation("UserFollowing")
  followers    Follow[]    @relation("UserFollowers")

  @@map("users")
}

model Follow {
  id           Int  @id @default(autoincrement())
  following_id Int
  follower_id  Int

  following    User @relation("UserFollowing", fields: [following_id], references: [id], onDelete: Cascade)
  follower     User @relation("UserFollowers", fields: [follower_id], references: [id], onDelete: Cascade)

  @@unique([following_id, follower_id])
  @@map("follows")
}

model Game {
  id           Int         @id @default(autoincrement())
  title        String
  release_date DateTime
  cover_image  String?
  description  String      @db.Text
  rating_avg   Float       @default(0.0)
  created_at   DateTime    @default(now())

  reviews      Review[]
  game_genres  GameGenre[]
  saved_by     SavedGame[]

  @@map("games")
}

model Genre {
  id          Int         @id @default(autoincrement())
  name        String      @unique
  game_genres GameGenre[]

  @@map("genres")
}

model GameGenre {
  game_id  Int
  genre_id Int

  game     Game  @relation(fields: [game_id], references: [id], onDelete: Cascade)
  genre    Genre @relation(fields: [genre_id], references: [id], onDelete: Cascade)

  @@id([game_id, genre_id])
  @@map("game_genres")
}

model SavedGame {
  user_id Int
  game_id Int

  user    User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  game    Game @relation(fields: [game_id], references: [id], onDelete: Cascade)

  @@id([user_id, game_id])
  @@map("saved_games")
}

model Review {
  id           Int      @id @default(autoincrement())
  game_id      Int
  user_id      Int
  title        String   // Serves as review_title
  body         String   @db.Text
  rating       Int
  recommended  Boolean  @default(true)
  created_at   DateTime @default(now())
  updated_at   DateTime @updatedAt
  is_archived  Boolean  @default(false)

  game         Game     @relation(fields: [game_id], references: [id], onDelete: Cascade)
  user         User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  likes        Like[]

  @@map("reviews")
}

model Like {
  user_id   Int
  review_id Int

  user      User   @relation(fields: [user_id], references: [id], onDelete: Cascade)
  review    Review @relation(fields: [review_id], references: [id], onDelete: Cascade)

  @@id([user_id, review_id])
  @@map("likes")
}
```

## 3. Frontend Mappings & Data Dependencies

/ (Root Layout & Home Page): Public. Fetches Featured Review (title, body, id), Latest Critiques Grid (maps components using <ReviewCard />), and Latest Games Grid (maps components using <GameCard />).

/games (Games Index Catalog): Public. Fetches full array collection (ALL_GAMES) for mapping over items using game_id. Includes a title search string filter and a nested GameGenre relationship selector.

/games/[gameid] (Dynamic Game Details): Public. Fetches dynamic game rows matching gameid (title, release_date, rating_avg, description). Returns a nested array of reviews exposing properties explicitly tailored to the UI components: id, user, recommended, text, time, and upvotes. Contains a Server Action to save games into the SavedGame table.

/journal (Review Creator / Editor): Protected by Auth. Form bindings map text blocks (title, description, content), images (thumbnail), and a boolean (recommended) to either draft caching mechanisms or fully published review interactions.

/login & /register (Authentication Interface): Public. Captures forms and targets customized JWT backend workflows.

/profile/[userid] (Main User Dashboard): Public/Dynamic. Displays aggregate profile contexts: name, role, bio, gamesCount, reviewsCount, and followersCount.

/profile/[userid]/games: Public/Dynamic. Uses profileUser.name context headers. Inspects userLikedGames array length and maps entities with game_id.

/profile/[userid]/reviews: Public/Dynamic. Returns a deep list (userRecentReviews) exposing structural properties: review_id, user_name, date_created, game_title, recommended, review_title, body, and likes_count.

/reviews (Global Reviews Feed): Public. Returns a collection of reviews capped strictly at the 6 most recent active entries. Must map structural property schemas: review_id, user_name, date_created, game_title, recommended, review_title, body, and likes_count.

/reviews/[reviewid] (Dynamic Review Details): Public. Fetches details using the dynamic route parameters, resolving secondary nested lookups like getUserById and getReviewsByUserId to append corresponding metadata alongside standard review datasets.

## 4. Current Implementation Progress

[x] **Prompt 1: Authentication & Backend Infrastructure**
_ Fully integrated token-based authentication using `jose` (`authUtils.ts`).
_ Implemented secure, HTTP-only, and environment-adaptive session cookies (`secure: process.env.NODE_ENV === "production"`).
_ Upgraded all API route wrappers to comply with Next.js 15's asynchronous headers and cookie requirements.
_ Resolved all TypeScript/Zod API validation types and route handler schema mismatches.

[x] **Database Optimization & Production Readiness (In Progress)** \* Consolidating separate `new PrismaClient()` instantiations into a single, global Prisma client wrapper (`lib/prisma.ts`) to prevent database connection leaks in serverless production environments.

[x] **Prompt 2: Authentication API & UI Pages (/register, /login, /logout)**

- Implemented secure backend endpoints for user registration, login, and logout
- Created `/api/auth/register` with Zod validation, bcrypt hashing, and unique constraint checks
- Created `/api/auth/login` with credential verification, JWT generation, and social login detection
- Enhanced `/api/auth/logout` for clean cookie deletion and session termination
- Integrated global Prisma singleton to prevent connection leaks
- Implemented secure JWT signing with `jose`, HTTP-only cookies with `secure` and `sameSite` flags
- Added comprehensive error handling for all authentication flows

[x] **Prompt 3: Public Feeds Backend with Advanced Search, Filtering, & Sorting**

- **Fully implemented API routes for public feeds**:
  - `/api/games`: Catalog with search, filtering, sorting, and pagination
  - `/api/reviews`: Global feed with archived review filtering and sorting
- **Schema-accurate implementation**:
  - Uses correct `game_genres` relation for genres
  - Properly handles both `created_at` and `updated_at` fields
  - Follows all Prisma model definitions
- **Production-ready features**:
  - Comprehensive Zod validation for all parameters
  - Secure error handling with appropriate HTTP status codes
  - Global Prisma singleton integration
  - Confirmed 200 OK responses with live data
- **Complete testing**:
  - TypeScript compilation verified
  - Runtime validation with seeded database
  - Works with all supported query parameters

[x] **Prompt 4: Review CRUD Backend - COMPLETE**

- **Fully implemented review management API** covering all CRUD operations
- **Production-ready endpoints:**
  - ✅ Review creation (`POST /api/reviews`)
  - ✅ Single review fetch (`GET /api/reviews/[id]`)
  - ✅ Review feed (`GET /api/reviews`)
  - ✅ Partial updates (`PATCH /api/reviews/[id]`)
  - ✅ Soft-deletion (`DELETE /api/reviews/[id]`)
- **Architectural Integrity:**
  - ✅ Proper RESTful organization (POST on collection, PATCH/DELETE on detail)
  - ✅ Higher-Order Component pattern for authorization (`withAuth`)
  - ✅ Clean URL parameter parsing preserving route context
  - ✅ TypeScript compilation verified (0 errors)
- **Robust Security:**
  - ✅ JWT-based authentication with `withAuth` HOC
  - ✅ Owner verification with admin override
  - ✅ 403 Forbidden for unauthorized access
  - ✅ Zod schema validation for all inputs
- **Quality Standards:**
  - ✅ Strict 1-10 rating validation
  - ✅ Soft-deletion implementation (`is_archived`)
  - ✅ Comprehensive error handling
  - ✅ Proper HTTP status codes
  - ✅ Schema-compliant Prisma queries

[ ] Prompt 5: Dynamic Game View & Library Integrations (/games/[gameid]).

[x] **Prompt 6: Role-Restricted Portals & Metrics Dashboard (/dashboard) - COMPLETE**

- **Fully implemented admin dashboard** with URL-driven tab navigation
- **Server Component (`app/dashboard/page.tsx`)**:
  - Authenticates and authorizes ADMIN users only via `authGuard`
  - Reads active tab from URL search params (`?tab=users|games|reviews`)
  - Dynamically fetches only the active tab's data (no over-fetching)
  - Disables caching (`revalidate = 0`) for real-time admin data
  - Passes initial data + `activeTab` to client component
- **Client Component (`components/dashboard-client.tsx`)**:
  - Manages local state for all three tabs independently
  - Provides optimistic UI updates with loading states
  - **User Management**: Make Admin (POST `/api/admin/make-admin`), Delete User (DELETE `/api/admin/delete-user`)
  - **Game Management**: Add Game modal (POST `/api/games`), Delete Game (DELETE `/api/games/[gameid]`)
  - **Review Moderation**: Delete Review (DELETE `/api/admin/delete-review`)
  - All mutations revalidate server cache tags for instant UI consistency
  - **Genre Management**: Dynamic genre fetching from `/api/genres`, Add Genre modal (POST `/api/genres`)

**New API Routes Added:**
- `POST /api/admin/make-admin` - Promote user to ADMIN (admin only)
- `DELETE /api/admin/delete-user` - Delete user account (admin only, prevents self-delete)
- `DELETE /api/admin/delete-review` - Archive/remove review (admin only)
- `POST /api/games` - Create new game in library (admin only, with genre associations)
- `DELETE /api/games/[gameid]` - Delete game from library (admin only)
- `GET/POST /api/genres` - List all genres / Create new genre (admin only for POST)

**Cache Invalidation Strategy:**
- `dashboard-admin` - Admin view metrics and lists
- `dashboard-user` - User-facing counts
- `dashboard-reviews` - Review lists
- `games` / `games-[id]` - Game catalog and detail pages
- `genres` - Genre list for game creation modal

**Key Fixes Applied:**
- **Doubled windows issue**: Server component controls active tab via URL params; client component receives `activeTab` prop and renders only that tab
- **Genre FK constraint**: Seeded all 8 default genres (Action, Adventure, RPG, Strategy, Simulation, Sports, Horror, Puzzle) in `prisma/seed.ts`; client fetches genres dynamically from API
- **Next.js 16 `revalidateTag`**: Fixed to use 2-argument form (`revalidateTag("tag", {})`)
- **Login page Suspense**: Added Suspense boundary for `useSearchParams()` in `app/login/page.tsx` — split into `page.tsx` (server + Suspense) + `login-form.tsx` (client) to push client boundary to the leaves

## 5. Sequential Engineering Execution Prompts

Prompt 1: Project Setup, Prisma Client, and Token (JWT) Utilities
Status: Partially Completed (authUtils created). Verify configuration.

Ensure the helper is treated as a pure server-side architecture. Prevent any exposure to client bundles using the "server-only" module import boundary.

Read process.env.JWT_SECRET natively. Ensure signToken targets an expiration life-cycle window of 7 days, and verifyToken returns a typed user payload object or null if the verification sequence fails.

Establish authGuard(requiredRoles: string[] = ["USER", "ADMIN"]) utilizing await cookies(). Extract "auth_token", unpack the signature safely, evaluate group classifications against the array targets, and return { userId: number; email: string; role: string } or fail with explicit local debugging logs.

Prompt 2: Authentication API & UI Pages (/register, /login, and /logout)
Status: Pending

Registration View (/register): Collect fields for email, password, name, handle, bio, and location. Build Zod validation structures enforcing strict email matching configurations and minimum password requirements (minimum 8 characters). Hash user passwords securely via bcryptjs. Query the Role entity table to match the name signature "USER", appending the resulting record row to the target transactional structure during new user row creations.

Login View (/login): Implement dynamic email lookup checks extracting the user table parameters alongside contextual joined database roles. If the password structures validate against the stored hashes, issue custom JWT states containing { userId: user.id, email: user.email, role: user.role.name } set inside secure HTTP-Only, SameSite=Strict cookies titled "auth_token".

Logout Interface: Develop server-side handlers designed to expire the target session cookie array entirely before forcing clean client redirects back to the main route catalog home page (/).

Prompt 3: Public Feeds with Advanced Search, Filtering, & Sorting (/, /games, and /reviews)
Status: Pending

Home Catalog (/): Fetch and render the 6 most recent active user reviews alongside the 6 most recent unique game entries. Integrate a strict global constraint filter to drop all soft-deleted records (is_archived: true) from every collection.

Games Grid (/games): Construct dynamic searchable grids targeting active platform listings. Implement simple input filtering configurations filtering across localized titles, alongside contextual dropdown elements targeting relational GameGenre structures using precise multi-level Prisma lookup joins.

Reviews Hub (/reviews): Extract the 6 most recent active reviews containing full meta details (game_title, review_title, body, rating, recommended, likes_count, user_name). Append sorting toggles supporting clean switching modes between "Most Recent" (created_at: desc) and "Most Liked" (ordering dynamically based on nested relational Like record counts).

Prompt 4: Dynamic Detail Pages & Review CRUD (/journal, /reviews/[id], and Editing/Deletion)
Status: Pending

Creation View (/journal): Enforce strict session validation checks via authGuard. Render clean select targets mapping to accessible index tables alongside text input zones for titles, bodies, ratings (1 to 10), and recommendation switches. Pass all client-side parameters through Zod layers before committing changes down to Prisma engine levels.

Details Catalog (/reviews/[id]): Expose contextual review records paired alongside parent game rows and author metric profiles.

Modifications Workspace (/reviews/[id]/edit): Guard route configurations closely. Only allow execution operations if session contexts reveal structural alignment matching the original review author or active account admin profiles.

Archival / Moderation Control Layers: Provide soft-deletion logic patterns. Authors can clear their specific listings, while Admin accounts gain direct execution access overrides to flag targeted records cleanly down to safe soft-deleted states (is_archived: true). Ensure role authorization checks are fully re-validated on the server before mutating row targets.

Prompt 5: Dynamic Game View & Library Integrations (/games/[gameid])
Status: Pending

Dynamic Details View (/games/[gameid]): Pull exact entity properties (title, release_date, cover_image, description, rating_avg) along with all attached active non-archived reviews.

Library Action Actions: Wire up an "Add to Saved Games" engine component. Check user session context states inside the execution action thread and create or connect the targeted database records into the corresponding SavedGame link tables cleanly.

Interactions Toggle: Build atomic like counters right next to each mapped review. Trigger standard write mutations against Like link entities using safe toggle patterns to modify total counts accurately without state-desynchronization anomalies.

Prompt 6: Role-Restricted Portals & Metrics Dashboard (/dashboard)
Status: Pending

Authentication Gateways: Secure the main dashboard route paths using standard cookie inspection layers. Fail cleanly into dedicated login routes if session contexts verify as missing or broken.

Standard Interfaces (Role: "USER"): Unpack specific account telemetry including library lengths, historical submission counts, and related social network follower statistics.

Administrative Overviews (Role: "ADMIN"): Render high-level telemetry insights using lightning-fast Prisma aggregation queries (e.g., prisma.user.count(), total active/archived review ratios). Expose instant moderation columns showing the latest 5 user accounts created alongside the latest 5 review entries submitted across the system.

---

# 🔐 Authentication & Database Architecture (Next.js 15+ & Prisma)

This document defines the authentication, API, and database standards used throughout the project. All new code should follow these conventions to maintain compatibility with Next.js 15 and the existing Prisma schema.

---

# Next.js 15 Integration Standards

## 1. Asynchronous Cookies API

The `cookies()` API is asynchronous in Next.js 15 and **must always be awaited**.

### ✅ Correct

```ts
const cookieStore = await cookies();
const token = cookieStore.get("auth_token")?.value;
```

### ❌ Incorrect

```ts
const token = cookies().get("auth_token")?.value;
```

---

## 2. `"use server"` Placement

### Server Actions

Server Action files **must** begin with:

```ts
"use server";
```

Example:

```text
lib/auth/actions.ts
```

This allows Client Components to securely invoke server-side logic.

### API Route Handlers

Do **not** include `"use server";` inside files under:

```text
app/api/**/route.ts
```

API routes already execute on the server, and adding the directive can cause build failures.

---

## 3. Route Handler Pattern

API routes should use the project's authentication wrappers rather than manually validating authentication.

### GET Routes

```ts
export const GET = withUserData(async (user) => {
    ...
});
```

### POST Routes

```ts
export const POST = withAuth(async (req, user) => {
    ...
});
```

This keeps authentication logic centralized and consistent.

---

## 4. Zod Validation

When handling validation failures, use the `.issues` property instead of `.errors`.

### ✅ Correct

```ts
return {
  success: false,
  error: validation.error.issues[0].message,
};
```

---

# Prisma Database Standards

All database operations must align with the existing PostgreSQL schema defined in `schema.prisma`.

---

## 1. User Library Model

The user's game library is represented by the **SavedGame** model.

### ✅ Correct

```ts
prisma.savedGame;
```

### ❌ Incorrect

```ts
prisma.userGameLibrary;
```

---

## 2. User Relation Name

The relation on the `User` model is named:

```text
saved_games
```

Do not reference a relation named `library`.

---

## 3. Loading a User Profile

When retrieving a user's profile together with their saved games, include both the user's role and the `saved_games` relation.

```ts
const profileData = await prisma.user.findUnique({
  where: {
    id: user.userId,
  },
  include: {
    role: true,
    saved_games: {
      include: {
        game: true,
      },
    },
  },
});
```

---

## 4. Mapping Saved Games

Provide explicit typing when mapping saved games to avoid implicit `any` compiler errors.

```ts
const likedGames = profileData.saved_games.map(
  (lib: { game_id: number }) => lib.game_id,
);

const gamesCount = profileData.saved_games.length;
```

---

# Summary

Follow these standards throughout the codebase:

- Always `await cookies()` in Next.js 15.
- Use `"use server";` **only** in Server Action files.
- Never place `"use server";` in API route handlers.
- Use the project's `withAuth()` and `withUserData()` wrappers for authenticated routes.
- Access Zod validation errors through `.issues`.
- Use `SavedGame` (`prisma.savedGame`) as the library model.
- Use the `saved_games` relation on the `User` model.
- Include `saved_games` when loading user profiles.
- Explicitly type `.map()` callbacks when accessing saved game data.
