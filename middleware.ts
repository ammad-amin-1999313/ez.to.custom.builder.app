import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require authentication. Everything else is public by default.
// /builder is intentionally PUBLIC: unauthenticated users can play with the
// builder, but the Save button is disabled and a "Sign in to save" CTA is
// shown — the page itself enforces this UX (see BuilderPage / BlocksSidebar).
const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files; match everything else.
    "/((?!_next/static|_next/image|favicon.ico).*)",
    // Always run for API + tRPC routes (so auth() in route handlers works).
    "/(api|trpc)(.*)",
  ],
};
