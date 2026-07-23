# Final Documentation - Authentication & Actions Modules

## Overview

This document provides comprehensive documentation for the authentication system (`lib/auth/`) and server actions (`lib/actions/`) in the CS404 Finals project.

---

## 1. Authentication Module (`lib/auth/`)

The authentication module handles user authentication, token management, and route protection using JWT tokens.

### 1.1 File Structure

```
lib/auth/
├── authUtils.ts      # Core JWT utilities and auth guards
├── actions.ts        # Server actions for login, register, logout
└── routeHandler.ts   # Higher-order functions for protecting API routes
```

### 1.2 `authUtils.ts` - Core Authentication Utilities

**Purpose**: Provides JWT token signing/verification, and authentication guard functions for server-side use.

#### Types

```typescript
interface UserPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}
```

#### Functions

| Function                                                                  | Description                                                                              |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `getJwtSecret(): Uint8Array`                                              | Returns the JWT signing secret (with fallback for development)                           |
| `signToken(payload: UserPayload): Promise<string>`                        | Creates a signed JWT token (HS256, 7-day expiry)                                         |
| `verifyToken(token: string): Promise<UserPayload \| null>`                | Verifies and decodes a JWT token                                                         |
| `authGuard(requiredRoles?, providedToken?): Promise<UserPayload \| null>` | Validates auth token, checks roles. Supports optional explicit token for Edge/Middleware |
| `requireAuth(requiredRoles?): Promise<UserPayload>`                       | Throws on auth failure (stricter than authGuard)                                         |

#### Key Features

- **Flexible runtime**: Works in Node.js, Edge, and Middleware contexts
- **Role-based access**: Supports role checking via `requiredRoles` parameter (default: `["USER", "ADMIN"]`)
- **Token sources**: Reads from cookies (`auth_token`) or accepts explicit token parameter
- **Graceful errors**: `authGuard` returns `null` on failure; `requireAuth` throws errors

#### JWT Configuration

- Algorithm: HS256
- Expiration: 7 days
- Secret: From `JWT_SECRET` env var (with dev fallback)

---

### 1.3 `actions.ts` - Server Actions (Authentication)

**Purpose**: Implements user registration, login, and logout as Next.js Server Actions.

#### Actions

##### `registerUser(formData: FormData)`

Registers a new user with validation.

**Validation Schema**:

```typescript
registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  handle: z.string().min(2),
  bio: z.string().optional(),
  location: z.string().optional(),
});
```

**Process**:

1. Validates input with Zod
2. Checks for existing email/handle (case-insensitive)
3. Hashes password with bcrypt (cost: 12)
4. Fetches default "USER" role
5. Creates user in database (password hash stored in `supabase_id` column)
6. Returns `{ success: true }` or `{ success: false, error: string }`

##### `loginUser(formData: FormData)`

Authenticates user and sets auth cookie.

**Validation Schema**:

```typescript
loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
```

**Process**:

1. Validates input
2. Finds user by email (includes role relation)
3. Verifies password against bcrypt hash in `supabase_id`
4. Generates JWT with `{ userId, email, role }`
5. Sets `auth_token` cookie (httpOnly, secure in prod, sameSite: strict, 7-day maxAge)
6. Returns `{ success: true }` or `{ success: false, error: string }`

##### `logoutUser()`

Clears auth cookie and redirects to home.

**Process**:

1. Sets `auth_token` cookie to expired (Date(0))
2. Redirects to `/`

---

### 1.4 `routeHandler.ts` - API Route Protection

**Purpose**: Higher-order functions to protect API routes with authentication.

#### Functions

##### `withAuth(handler, requiredRoles?)`

Wraps an API route handler with authentication.

```typescript
withAuth(
  async (req, user, context) => {
    /* handler logic */
  },
  ["USER", "ADMIN"], // optional roles
);
```

**Parameters**:

- `handler`: Function receiving `(req, user, context?)`
- `requiredRoles`: Array of allowed roles (default: `["USER", "ADMIN"]`)

**Returns**: Async function `(req, context?) => Promise<Response>`

**Behavior**:

- Calls `authGuard` to validate token
- Returns 401 if unauthorized
- Returns 500 on internal errors
- Passes authenticated `user` and route `context` (including `params`) to handler

##### `withUserData(handler, requiredRoles?)`

Simplified wrapper for data-fetching routes.

```typescript
withUserData(
  async (user) => {
    /* fetch and return data */
  },
  ["USER", "ADMIN"],
);
```

**Parameters**:

- `handler`: Function receiving `user` and returning data
- `requiredRoles`: Array of allowed roles (default: `["USER", "ADMIN"]`)

**Returns**: Async function `() => Promise<NextResponse>`

**Behavior**:

- Validates auth via `authGuard`
- Calls handler with user object
- Returns JSON response with data or error

---

## 2. Actions Module (`lib/actions/`)

### 2.1 File Structure

```
lib/actions/
└── gameActions.ts    # Server actions for game interactions
```

### 2.2 `gameActions.ts` - Game Interaction Actions

**Purpose**: Server actions for user interactions with games (save/unsave, like reviews).

#### Actions

##### `toggleSaveGame(gameId: number)`

Toggles save/unsave state for a game.

**Process**:

1. Reads `auth_token` from cookies
2. Verifies token via `verifyToken`
3. Calls `/api/games/${gameId}/save` POST endpoint with token in Cookie header
4. Returns `{ success: boolean, ...responseData }`

**Error Handling**:

- Returns `{ success: false, error: "Not authenticated" }` if no token
- Returns `{ success: false, error: "Invalid token" }` if token invalid
- Catches exceptions, returns `{ success: false, error: "Failed to save game" }`

##### `toggleLikeReview(reviewId: number)`

Toggles like/unlike state for a review.

**Process**:

1. Reads `auth_token` from cookies
2. Verifies token via `verifyToken`
3. Calls `/api/reviews/${reviewId}/like` POST endpoint with token in Cookie header
4. Returns `{ success: boolean, ...responseData }`

**Error Handling**: Same pattern as `toggleSaveGame`

---

## 3. Integration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER REGISTRATION                        │
├─────────────────────────────────────────────────────────────────┤
│  Client Form → registerUser(formData) → Prisma (create user)    │
│                                    → bcrypt hash password       │
│                                    → Return success/error       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                         USER LOGIN                              │
├─────────────────────────────────────────────────────────────────┤
│  Client Form → loginUser(formData) → Prisma (find user)         │
│                                    → bcrypt compare password    │
│                                    → signToken(payload)         │
│                                    → Set auth_token cookie      │
│                                    → Return success/error       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PROTECTED API ROUTES                         │
├─────────────────────────────────────────────────────────────────┤
│  Request → withAuth/withUserData → authGuard()                  │
│                                    → verifyToken(cookie)        │
│                                    → Check roles                │
│                                    → Call handler / Return 401  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER ACTIONS                              │
├─────────────────────────────────────────────────────────────────┤
│  Client → gameActions.toggleSaveGame()                          │
│         → Read cookie → verifyToken → Call API route            │
│         → Return result                                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Security Considerations

| Aspect           | Implementation                                      |
| ---------------- | --------------------------------------------------- |
| Password Storage | bcrypt with cost 12, stored in `supabase_id` column |
| Token Storage    | httpOnly, secure (prod), sameSite: strict cookie    |
| Token Algorithm  | HS256 (symmetric)                                   |
| Token Expiry     | 7 days                                              |
| Role Validation  | Checked on every protected request                  |
| Input Validation | Zod schemas on all server actions                   |
| SQL Injection    | Protected by Prisma ORM                             |

---

## 5. Environment Variables

| Variable              | Description                              | Required                        |
| --------------------- | ---------------------------------------- | ------------------------------- |
| `JWT_SECRET`          | Secret key for JWT signing               | Yes (prod)                      |
| `NEXT_PUBLIC_APP_URL` | Base URL for API calls in server actions | No (defaults to localhost:3000) |
| `NODE_ENV`            | Determines cookie secure flag            | No                              |

---

## 6. Usage Examples

### Protecting an API Route

```typescript
// app/api/profile/route.ts
import { withUserData } from "@/lib/auth/routeHandler";

export const GET = withUserData(async (user) => {
  const profile = await prisma.user.findUnique({
    where: { id: user.userId },
    select: { name: true, email: true, handle: true },
  });
  return profile;
});
```

### Using Server Actions in Components

```typescript
// Component
import { toggleSaveGame } from "@/lib/actions/gameActions";

async function handleSave(gameId: number) {
  const result = await toggleSaveGame(gameId);
  if (result.success) {
    // Update UI
  }
}
```

### Custom Role Protection

```typescript
// Admin-only route
export const GET = withAuth(
  async (req, user) => {
    // user.role === "ADMIN" guaranteed
    return NextResponse.json({ adminData: "..." });
  },
  ["ADMIN"],
);
```

---

## 7. API Routes (`app/api/`)

The API layer provides RESTful endpoints for the frontend, using the authentication utilities and Prisma for data access.

### 7.1 File Structure

```
app/api/
├── auth/
│   ├── login/route.ts           # User login (POST)
│   ├── register/route.ts        # User registration (POST)
│   ├── logout/route.ts          # User logout (GET)
│   └── google/
│       ├── initiate/route.ts    # Google OAuth initiate (GET)
│       └── callback/route.ts    # Google OAuth callback (GET)
├── dashboard/route.ts           # Dashboard data (GET, protected)
├── library/route.ts             # User library CRUD (POST, DELETE, protected)
├── library/add/route.ts         # Add game to library (POST, protected)
├── reviews/
│   ├── route.ts                 # Reviews feed & create (GET, POST)
│   ├── [id]/route.ts            # Single review CRUD (GET, PATCH, DELETE)
│   └── [id]/like/route.ts       # Toggle review like (POST, protected)
├── admin/
│   ├── make-admin/route.ts      # Promote user to admin (POST, admin)
│   ├── delete-user/route.ts     # Delete user (DELETE, admin)
│   └── delete-review/route.ts   # Archive review (DELETE, admin)
├── games/
│   ├── route.ts                 # Games list & create (GET, POST)
│   ├── [gameid]/route.ts        # Game detail & delete (GET, DELETE)
│   └── [gameid]/save/route.ts   # Toggle save game (POST, protected)
├── genres/route.ts              # Genres list & create (GET, POST)
└── user/profile/route.ts        # User profile (GET, PATCH, protected)
```

---

### 7.2 Authentication Routes (`app/api/auth/`)

#### `POST /api/auth/login`

Authenticates user and sets auth cookie.

**Request Body**:

```json
{ "email": "user@example.com", "password": "password123" }
```

**Response**: `{ success: true }` or `{ success: false, error: string }`

**Sets**: `auth_token` httpOnly cookie (7 days, secure in prod, sameSite: strict)

---

#### `POST /api/auth/register`

Registers a new user.

**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "handle": "johndoe",
  "bio": "Optional bio",
  "location": "Optional location"
}
```

**Validation**: Email format, password ≥8 chars, name required, handle ≥2 chars

**Response**: `{ success: true }` or `{ success: false, error: string }`

---

#### `GET /api/auth/logout`

Clears auth cookie and redirects to home.

**Response**: Redirect to `/`

---

#### `GET /api/auth/google/initiate`

Initiates Google OAuth flow (mock implementation).

**Response**: Redirect to `/api/auth/google/callback?code=mock_code`

---

#### `GET /api/auth/google/callback`

Handles Google OAuth callback (mock implementation).

**Process**: Mock Google user → Find/create user → Sign JWT → Set cookie → Redirect to `/`

**Response**: Redirect to `/` (with auth cookie)

---

### 7.3 Dashboard Route (`app/api/dashboard/route.ts`)

#### `GET /api/dashboard`

Returns dashboard data based on user role. Protected via `withAuth`.

**Auth**: Required (`USER` or `ADMIN`)

**Response (USER)**:

```json
{
  "role": "USER",
  "profile": { "id": 1, "name": "...", "handle": "...", "email": "...", "bio": "...", "location": "...", "profile_pic": "...", "role": "USER", "created_at": "..." },
  "metrics": { "gamesCount": 5, "reviewsCount": 3, "followersCount": 0, "followingCount": 0 },
  "followers": [],
  "following": [],
  "recentReviews": [...]
}
```

**Response (ADMIN)**:

```json
{
  "role": "ADMIN",
  "metrics": { "totalUsers": 100, "totalGames": 50, "totalReviews": 200, "activeReviews": 180, "archivedReviews": 20, "reviewArchivalRate": 10 },
  "latestUsers": [...],
  "latestReviews": [...]
}
```

**Caching**: `unstable_cache` with 60s revalidation, tags: `dashboard-admin`, `dashboard-user`

---

### 7.4 Library Routes (`app/api/library/`)

#### `POST /api/library`

Add a game to user's library. Protected via `withAuth`.

**Request Body**: `{ "game_id": 123 }`

**Response**: `{ success: true }` or error

---

#### `DELETE /api/library`

Remove a game from user's library. Protected via `withAuth`.

**Request Body**: `{ "game_id": 123 }`

**Response**: `{ success: true }`

---

#### `POST /api/library/add`

Alternative endpoint to add game to library. Protected via `withAuth`.

**Request Body**: `{ "gameId": 123 }`

**Response**: `{ success: true, gameId: 123 }`

**Cache Invalidation**: `games`, `dashboard-user` tags

---

### 7.5 Reviews Routes (`app/api/reviews/`)

#### `GET /api/reviews`

Fetch reviews feed with filtering, sorting, pagination. Public access.

**Query Parameters**:

- `limit`: 1-20 (default: 6)
- `game`: string (search by game title)
- `user`: number (filter by user ID)
- `sort`: "recent" | "rating" | "popular" (default: "recent")

**Response**: `{ reviews: Review[] }`

**Caching**: `unstable_cache` with 60s revalidation, tag: `reviews`

---

#### `POST /api/reviews`

Create a new review. Protected via `withAuth`.

**Request Body**:

```json
{
  "game_id": 123,
  "title": "Great game!",
  "body": "Detailed review...",
  "rating": 9,
  "recommended": true
}
```

**Validation**: game_id required, title 1-100 chars, body required, rating 1-10

**Response**: `{ review: Review }` (201)

**Cache Invalidation**: `reviews` tag

---

#### `GET /api/reviews/[id]`

Fetch single review by ID. Public access.

**Response**: `{ review: Review }` with user, game, likes_count, liked_by_current_user

---

#### `PATCH /api/reviews/[id]`

Update a review. Protected via `withAuth` (owner or ADMIN).

**Request Body**: Partial of create schema (title, body, rating, recommended)

**Permissions**: Owner or ADMIN; non-admins cannot edit archived reviews

**Response**: `{ review: Review }`

---

#### `DELETE /api/reviews/[id]`

Soft-delete (archive) a review. Protected via `withAuth` (owner or ADMIN).

**Response**: `{ success: true }`

**Cache Invalidation**: `reviews` tag

---

#### `POST /api/reviews/[id]/like`

Toggle like on a review. Protected via `withAuth`.

**Response**: `{ success: true, liked: boolean, likes_count: number }`

**Cache Invalidation**: `reviews` tag (via PATCH handler)

---

### 7.6 Admin Routes (`app/api/admin/`)

All admin routes require authenticated ADMIN user (checked via `authGuard` + role check).

---

#### `POST /api/admin/make-admin`

Promote a user to ADMIN.

**Request Body**: `{ "targetId": 123 }`

**Response**: `{ success: true }`

**Protection**: Prevents self-promotion

**Cache Invalidation**: `dashboard-admin`, `dashboard-user`

---

#### `DELETE /api/admin/delete-user`

Delete a user account.

**Request Body**: `{ "targetId": 123 }`

**Response**: `{ success: true }`

**Protection**: Prevents self-deletion

**Cache Invalidation**: `dashboard-admin`, `dashboard-user`

---

#### `DELETE /api/admin/delete-review`

Archive (soft-delete) a review.

**Request Body**: `{ "targetId": 123 }`

**Note**: Uses hard delete (`prisma.review.delete`) despite "archive" comment

**Cache Invalidation**: `dashboard-reviews`, `dashboard-admin`, `dashboard-user`

---

### 7.7 Games Routes (`app/api/games/`)

#### `GET /api/games`

List games with search, filter, pagination. Public access.

**Query Parameters**:

- `search`: string (title contains)
- `genre`: string (filter by genre name)
- `sort`: "title" | "release_date" | "rating"
- `order`: "asc" | "desc"
- `page`: number (default: 1)
- `limit`: 1-50 (default: 20)

**Response**:

```json
{
  "games": [{ "id": 1, "title": "...", "genres": ["Action"], ... }],
  "pagination": { "total": 100, "page": 1, "limit": 20, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
}
```

**Caching**: `unstable_cache` with 60s revalidation, tag: `games`

---

#### `POST /api/games`

Create a new game. Admin only (checked via `authGuard` + role).

**Request Body**:

```json
{
  "title": "Game Title",
  "description": "Description...",
  "release_date": "2024-01-15",
  "cover_image": "https://...",
  "genre_ids": [1, 2],
  "rating": 8.5
}
```

**Response**: `{ game: Game }` (201)

**Cache Invalidation**: `games`, `dashboard-admin`, `dashboard-user`

---

#### `GET /api/games/[gameid]`

Fetch game detail with reviews, genres, save/like status. Public (optional auth for user-specific fields).

**Process**:

1. Optional auth via `authGuard` (catches auth errors, continues as guest)
2. Fetches cached base game data
3. Checks if current user saved the game (non-cached)
4. Checks like status for each review (non-cached, per review)
5. Returns formatted response

**Response**:

```json
{
  "id": 1,
  "title": "...",
  "description": "...",
  "release_date": "...",
  "cover_image": "...",
  "genres": ["Action", "RPG"],
  "rating_avg": 8.5,
  "reviews_count": 10,
  "saves_count": 50,
  "reviews": [...],
  "saved_by_current_user": false
}
```

**Caching**: Base game data cached 300s (tag: `game`); user-specific fields computed per-request

---

#### `DELETE /api/games/[gameid]`

Delete a game. Admin only.

**Response**: `{ success: true }`

**Cache Invalidation**: `dashboard-admin`, `dashboard-user`, `game`

---

#### `POST /api/games/[gameid]/save`

Toggle save/unsave game in user's library. Protected via `withAuth`.

**Response**: `{ success: true, saved: boolean }`

**Cache Invalidation**: `games`, `dashboard-user`

---

### 7.8 Genres Route (`app/api/genres/route.ts`)

#### `GET /api/genres`

List all genres. Public access.

**Response**: `{ genres: Genre[] }`

---

#### `POST /api/genres`

Create a genre. Admin only.

**Request Body**: `{ "name": "Action" }`

**Validation**: name 1-50 chars

**Response**: `{ genre: Genre }` (201)

**Cache Invalidation**: `genres`

---

### 7.9 User Profile Route (`app/api/user/profile/route.ts`)

#### `GET /api/user/profile`

Fetch current user's profile with saved games. Protected via `withUserData`.

**Response**:

```json
{
  "user_id": 1,
  "name": "...",
  "handle": "...",
  "role": "USER",
  "bio": "...",
  "location": "...",
  "joined": "Joined Jan 1, 2024",
  "profile_pic": "...",
  "gamesCount": 5,
  "reviewsCount": 3,
  "followersCount": 0,
  "liked_games": [1, 2, 3]
}
```

---

#### `PATCH /api/user/profile`

Update user profile. Protected via `withAuth`.

**Request Body** (all optional):

```json
{
  "name": "New Name",
  "handle": "newhandle",
  "bio": "New bio",
  "location": "New location",
  "profile_pic": "https://..."
}
```

**Validation**: handle alphanumeric + underscore/hyphen, max 50 chars; bio max 500; location max 100; profile_pic valid URL

**Handle Uniqueness**: Checked against other users

**Response**: Updated profile object (same shape as GET)

---

## 8. Caching Strategy

| Route                    | Cache Type       | Tags              | Revalidate |
| ------------------------ | ---------------- | ----------------- | ---------- |
| `/api/dashboard` (admin) | `unstable_cache` | `dashboard-admin` | 60s        |
| `/api/dashboard` (user)  | `unstable_cache` | `dashboard-user`  | 60s        |
| `/api/reviews` (GET)     | `unstable_cache` | `reviews`         | 60s        |
| `/api/games` (GET)       | `unstable_cache` | `games`           | 60s        |
| `/api/games/[id]` (GET)  | `unstable_cache` | `game`            | 300s       |
| `/api/genres` (GET)      | None             | -                 | -          |

**Invalidation Pattern**: Mutations call `revalidateTag(tagName)` for relevant tags.

---

## 9. Authorization Patterns

| Pattern        | Implementation                                                               |
| -------------- | ---------------------------------------------------------------------------- | --- | --------------------------------- |
| Public routes  | No auth wrapper (e.g., `GET /api/reviews`, `GET /api/games`)                 |
| User protected | `withAuth` / `withUserData` (checks token + USER/ADMIN roles)                |
| Owner or Admin | Manual check in handler: `user.role === "ADMIN"                              |     | resource.user_id === user.userId` |
| Admin only     | `authGuard()` + manual `user.role.name === "ADMIN"` check                    |
| Optional auth  | Try `authGuard`, catch error, proceed as guest (e.g., `GET /api/games/[id]`) |
