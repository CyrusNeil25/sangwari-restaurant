import { PageLoader } from "@/components/site/PageLoader";

/**
 * Next.js built-in loading UI (App Router Suspense boundary).
 * Shown while any Server Component in the route is fetching data.
 */
export default function Loading() {
  return <PageLoader visible />;
}
