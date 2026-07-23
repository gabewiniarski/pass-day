import type { Metadata } from "next";
import ResortPage from "../ResortPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Universal Orlando planner · Passday",
  description: "Universal Orlando crowd recommendations, weather, events, news and all posted attraction waits.",
};

export default async function UniversalPage({
  searchParams,
}: {
  searchParams: Promise<{ park?: string }>;
}) {
  const { park } = await searchParams;
  const initialParkId = park && /^\d+$/.test(park) ? Number(park) : undefined;
  return <ResortPage resortKey="universal" initialParkId={initialParkId} />;
}
