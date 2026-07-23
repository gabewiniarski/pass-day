import Dashboard from "./Dashboard";
import { createDayPlans, getEvents, getNews, getWaitTimes, getWeather } from "@/lib/park-data";
import type { ResortKey } from "@/lib/resorts";

export default async function ResortPage({
  resortKey,
  initialParkId,
}: {
  resortKey: ResortKey;
  initialParkId?: number;
}) {
  const [weather, parks, news] = await Promise.all([
    getWeather(),
    getWaitTimes(resortKey),
    getNews(resortKey),
  ]);
  const events = getEvents(resortKey);
  const plans = createDayPlans(weather.days, resortKey);

  return (
    <Dashboard
      plans={plans}
      parks={parks}
      events={events}
      news={news.items}
      sourceStatus={{
        weather: weather.live,
        waits: parks.some((park) => park.live),
        news: news.live,
      }}
      generatedAt={new Date().toISOString()}
      resortKey={resortKey}
      initialParkId={initialParkId}
    />
  );
}
