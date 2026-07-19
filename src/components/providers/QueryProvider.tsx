"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

/**
 * App-wide TanStack Query provider. The QueryClient is created once per client
 * (via useState's initializer) — never on the server and never re-created on
 * re-render — so cache state is neither shared across requests nor reset.
 *
 * Reach for React Query in Client Components (search, filters, mutations, polling).
 * Data only needed for initial page render should stay in Server Components,
 * which fetch through the same `@/lib/api` layer with plain async/await.
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000, // 1 min — mock data is static; tune per-endpoint for the real backend
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
