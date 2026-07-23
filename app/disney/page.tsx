import type { Metadata } from "next";
import ResortPage from "../ResortPage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Walt Disney World planner · Passday",
  description: "Walt Disney World crowd recommendations, weather, events, official news and all posted attraction waits.",
};

export default async function DisneyPage({
  searchParams,
}: {
  searchParams: Promise<{ park?: string }>;
}) {
  const { park } = await searchParams;
  const initialParkId = park && /^\d+$/.test(park) ? Number(park) : undefined;
  return <ResortPage resortKey="disney" initialParkId={initialParkId} />;
}
