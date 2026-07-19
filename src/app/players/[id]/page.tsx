import { PlayerProfile } from "@/features/players";

// Server Component: only unwraps the async route param, then hands off to the
// client-side PlayerProfile, which fetches every endpoint from the browser.
export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlayerProfile id={id} />;
}
