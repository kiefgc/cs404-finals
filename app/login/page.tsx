"use client";

import { Suspense } from "react";
import LoginForm from "./login-form";

/**
 * Login Page - Server Component with Suspense Boundary
 *
 * WHY SPLIT INTO TWO FILES?
 * - Next.js App Router requires `useSearchParams()` to be wrapped in a Suspense boundary
 * - `LoginForm` (client component) uses `useSearchParams()` to read the `?from=` redirect param
 * - By keeping `page.tsx` as a Server Component (no "use client"), we push the client boundary
 *   to the leaf component (`LoginForm`) — following the "push client components to the leaves" pattern
 * - The Suspense fallback shows a centered spinner while the client component loads
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[75vh]" />}>
      <LoginForm />
    </Suspense>
  );
}