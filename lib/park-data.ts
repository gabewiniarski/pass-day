import {
  getHistoricalWaitSignal,
  historicalWaitToOpportunity,
  historicalWaitToPressure,
} from "@/lib/thrill-history";
import { disneyCrowdToOpportunity, getDisneyCrowdSignal } from "@/lib/disney-history";
import { parkGroups, type ParkConfig, type ResortKey } from "@/lib/resorts";

export type WeatherDay = {
  date: string;
  code: number;
  high: number;
  low: number;
  feelsLike: number;
  rainChance: number;
  rainTotal: number | null;
  wind: number;
  condition: string;
  icon: string;
  weatherSource: "NOAA/NWS" | "Open-Meteo" | "Sample model";
};

export type Ride = {
  name: string;
  wait: number;
  isOpen: boolean;
  updatedAt: string;
};

export type ParkWait = ParkConfig & {
  avgWait: number;
  openCount: number;
  totalCount: number;
  live: boolean;
  rides: Ride[];
};

export type ParkEvent = {
  title: string;
  shortTitle: string;
  start: string;
  end: string;
  dateLabel: string;
  type: "Passholder" | "Seasonal" | "After hours" | "Entertainment";
  description: string;
  impact: number;
  url: string;
};

export type NewsItem = {
  title: string;
  description: string;
  date: string;
  url: string;
  category: string;
};

export type DayPlan = WeatherDay & {
  crowdIndex: number;
  crowdLabel: string;
  historicalWait: number;
  historicalWaitDelta: number;
  historicalWaitLabel: string;
  historicalUnit: "min" | "%";
  historicalReference: string;
  arrivalWindow: string;
  historicalDayShape: [string, string, string];
  crowdScore: number;
  weatherScore: number;
  visitScore: number;
  verdict: string;
  activeEvents: ParkEvent[];
  reasons: string[];
};

// Downtown Orlando point used by the National Weather Service forecast.
const ORLANDO = { latitude: 28.5383, longitude: -81.3792 };

export const NWS_ORLANDO_URL =
  "https://forecast.weather.gov/MapClick.php?lat=28.5383&lon=-81.3792";

export const universalEvents: ParkEvent[] = [
  {
    title: "Summer fun at Universal Orlando Resort",
    shortTitle: "Summer fun",
    start: "2026-05-23",
    end: "2026-08-10",
    dateLabel: "May 23 – Aug 10",
    type: "Entertainment",
    description: "Limited-time movie experiences, food, merchandise and the return of the Mega Movie Parade.",
    impact: 7,
    url: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
  },
  {
    title: "Volcano Bay Under the Stars",
    shortTitle: "Volcano Bay nights",
    start: "2026-05-03",
    end: "2026-08-21",
    dateLabel: "Select nights through Aug 21",
    type: "After hours",
    description: "A separately ticketed nighttime beach party with rides, a live DJ and character meet-and-greets.",
    impact: 2,
    url: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
  },
  {
    title: "Back to Hogwarts",
    shortTitle: "Back to Hogwarts",
    start: "2026-08-01",
    end: "2026-09-01",
    dateLabel: "Aug 1 – Sep 1",
    type: "Seasonal",
    description: "Limited-time Wizarding World experiences celebrating the traditional return to Hogwarts.",
    impact: 5,
    url: "https://blog.discoveruniversal.com/events/complete-guide-to-events-experiences-at-universal-orlando-resort-this-year/",
  },
  {
    title: "UOAP Nights",
    shortTitle: "UOAP Nights",
    start: "2026-08-15",
    end: "2026-08-16",
    dateLabel: "Aug 15 – 16",
    type: "Passholder",
    description: "A special two-night celebration built for Universal Orlando Annual Passholders.",
    impact: 16,
    url: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
  },
  {
    title: "Passholder Appreciation Days",
    shortTitle: "Passholder days",
    start: "2026-08-15",
    end: "2026-09-30",
    dateLabel: "Aug 15 – Sep 30",
    type: "Passholder",
    description: "More than six weeks of exclusive passholder offers, perks and special experiences.",
    impact: 5,
    url: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
  },
  {
    title: "Halloween Horror Nights 35",
    shortTitle: "HHN 35",
    start: "2026-08-28",
    end: "2026-11-01",
    dateLabel: "Select nights Aug 28 – Nov 1",
    type: "After hours",
    description: "Universal Orlando’s separately ticketed nighttime Halloween event returns for its 35th year.",
    impact: 11,
    url: "https://www.universalorlando.com/hhn",
  },
  {
    title: "Holidays at Universal Orlando Resort",
    shortTitle: "Holidays",
    start: "2026-11-14",
    end: "2027-01-03",
    dateLabel: "Nov 14 – Jan 3",
    type: "Seasonal",
    description: "Grinchmas, Christmas in The Wizarding World of Harry Potter and the holiday parade featuring Macy’s.",
    impact: 10,
    url: "https://blog.discoveruniversal.com/events/complete-guide-to-events-experiences-at-universal-orlando-resort-this-year/",
  },
];

export const disneyEvents: ParkEvent[] = [
  {
    title: "Cool KIDS’ SUMMER at Walt Disney World",
    shortTitle: "Cool KIDS’ SUMMER",
    start: "2026-05-26",
    end: "2026-09-08",
    dateLabel: "May 26 – Sep 8",
    type: "Entertainment",
    description: "Seasonal character experiences, family activities and refreshed entertainment across the four theme parks.",
    impact: 5,
    url: "https://disneyworld.disney.go.com/events-tours/calendar/",
  },
  {
    title: "Disney After Hours",
    shortTitle: "Disney After Hours",
    start: "2026-01-12",
    end: "2026-09-24",
    dateLabel: "Select nights through Sep 24",
    type: "After hours",
    description: "Limited-capacity separately ticketed evenings at Magic Kingdom, EPCOT and Disney’s Hollywood Studios.",
    impact: 6,
    url: "https://disneyworld.disney.go.com/events-tours/after-hours/",
  },
  {
    title: "Mickey’s Not-So-Scary Halloween Party",
    shortTitle: "Halloween Party",
    start: "2026-08-07",
    end: "2026-10-31",
    dateLabel: "Select nights Aug 7 – Oct 31",
    type: "After hours",
    description: "Magic Kingdom’s separately ticketed Halloween party returns with trick-or-treating, entertainment and fireworks.",
    impact: 10,
    url: "https://disneyworld.disney.go.com/events-tours/calendar/",
  },
  {
    title: "EPCOT International Food & Wine Festival",
    shortTitle: "Food & Wine",
    start: "2026-08-27",
    end: "2026-11-21",
    dateLabel: "Aug 27 – Nov 21",
    type: "Seasonal",
    description: "Global marketplaces, live music and festival programming return throughout EPCOT.",
    impact: 7,
    url: "https://disneyworld.disney.go.com/events-tours/epcot/epcot-international-food-and-wine-festival/",
  },
  {
    title: "Holidays at Walt Disney World Resort",
    shortTitle: "Disney Holidays",
    start: "2026-11-13",
    end: "2027-01-06",
    dateLabel: "Nov 13 – Jan 6",
    type: "Seasonal",
    description: "Holiday entertainment, décor and separately ticketed celebrations arrive across Walt Disney World.",
    impact: 10,
    url: "https://disneyworld.disney.go.com/events-tours/calendar/",
  },
];

export function getEvents(resort: ResortKey) {
  return resort === "disney" ? disneyEvents : universalEvents;
}

// Backward-compatible export for existing Universal integrations.
export const events = universalEvents;

const weatherLabels: Record<number, [string, string]> = {
  0: ["Clear", "sun"],
  1: ["Mostly clear", "sun"],
  2: ["Partly cloudy", "partly"],
  3: ["Cloudy", "cloud"],
  45: ["Foggy", "cloud"],
  48: ["Foggy", "cloud"],
  51: ["Light drizzle", "rain"],
  53: ["Drizzle", "rain"],
  55: ["Heavy drizzle", "rain"],
  61: ["Light rain", "rain"],
  63: ["Rain", "rain"],
  65: ["Heavy rain", "rain"],
  80: ["Rain showers", "rain"],
  81: ["Rain showers", "rain"],
  82: ["Heavy showers", "storm"],
  95: ["Thunderstorms", "storm"],
  96: ["Storms + hail", "storm"],
  99: ["Strong storms", "storm"],
};

function weatherLabel(code: number) {
  return weatherLabels[code] ?? ["Mixed weather", "partly"];
}

function round(value: number | undefined, fallback = 0) {
  return Math.round(value ?? fallback);
}

function fallbackWeather(): WeatherDay[] {
  const start = new Date();
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const rainChance = [42, 58, 35, 64, 28, 46, 52][index % 7];
    return {
      date: date.toISOString().slice(0, 10),
      code: rainChance > 55 ? 80 : index % 3 === 0 ? 2 : 1,
      high: 90 + (index % 3),
      low: 75 + (index % 2),
      feelsLike: 99 + (index % 4),
      rainChance,
      rainTotal: rainChance > 55 ? 0.24 : 0.08,
      wind: 9 + (index % 4),
      condition: rainChance > 55 ? "Rain showers" : "Partly cloudy",
      icon: rainChance > 55 ? "rain" : "partly",
      weatherSource: "Sample model",
    };
  });
}

type NwsPeriod = {
  startTime: string;
  isDaytime: boolean;
  temperature: number;
  probabilityOfPrecipitation?: { value?: number | null };
  windSpeed: string;
  shortForecast: string;
  detailedForecast: string;
};

function nwsWeatherType(shortForecast: string, rainChance: number) {
  const text = shortForecast.toLowerCase();
  if (/thunder|storm/.test(text)) {
    return { code: /severe|strong/.test(text) || rainChance >= 70 ? 95 : 80, icon: "storm" };
  }
  if (/rain|shower|drizzle/.test(text)) return { code: 80, icon: "rain" };
  if (/cloud|overcast/.test(text) && !/partly/.test(text)) return { code: 3, icon: "cloud" };
  if (/partly|mostly sunny|mostly clear/.test(text)) return { code: 2, icon: "partly" };
  return { code: 1, icon: "sun" };
}

function nwsFeelsLike(period: NwsPeriod) {
  const match = period.detailedForecast.match(
    /heat index(?: values)?(?: as high as| near| around)? (\d+)/i,
  );
  return match ? Number(match[1]) : period.temperature;
}

function nwsWindSpeed(value: string) {
  const speeds = value.match(/\d+/g)?.map(Number) ?? [0];
  return Math.max(...speeds);
}

async function getNwsWeather(): Promise<WeatherDay[]> {
  const headers = {
    Accept: "application/geo+json",
    "User-Agent": "Passday/1.0 (Orlando theme park planning dashboard)",
  };
  const pointResponse = await fetch(
    `https://api.weather.gov/points/${ORLANDO.latitude},${ORLANDO.longitude}`,
    { headers, next: { revalidate: 900 }, signal: AbortSignal.timeout(7000) },
  );
  if (!pointResponse.ok) throw new Error("NWS point forecast unavailable");
  const point = (await pointResponse.json()) as { properties?: { forecast?: string } };
  if (!point.properties?.forecast) throw new Error("NWS forecast URL missing");

  const forecastResponse = await fetch(point.properties.forecast, {
    headers,
    next: { revalidate: 900 },
    signal: AbortSignal.timeout(7000),
  });
  if (!forecastResponse.ok) throw new Error("NWS forecast unavailable");
  const forecast = (await forecastResponse.json()) as {
    properties?: { periods?: NwsPeriod[] };
  };
  const periods = forecast.properties?.periods ?? [];
  const daytime = periods.filter((period) => period.isDaytime);

  const days = daytime.map((period) => {
    const start = new Date(period.startTime).getTime();
    const night = periods.find((candidate) => {
      const candidateStart = new Date(candidate.startTime).getTime();
      return (
        !candidate.isDaytime &&
        candidateStart > start &&
        candidateStart - start < 24 * 60 * 60 * 1000
      );
    });
    const rainChance = Math.round(period.probabilityOfPrecipitation?.value ?? 0);
    const type = nwsWeatherType(period.shortForecast, rainChance);
    return {
      date: period.startTime.slice(0, 10),
      code: type.code,
      high: period.temperature,
      low: night?.temperature ?? period.temperature,
      feelsLike: nwsFeelsLike(period),
      rainChance,
      rainTotal: null,
      wind: nwsWindSpeed(period.windSpeed),
      condition: period.shortForecast,
      icon: type.icon,
      weatherSource: "NOAA/NWS" as const,
    };
  });
  if (!days.length) throw new Error("NWS returned no daytime forecast periods");
  return days.slice(0, 7);
}

async function getOpenMeteoWeather(): Promise<WeatherDay[]> {
  const params = new URLSearchParams({
    latitude: String(ORLANDO.latitude),
    longitude: String(ORLANDO.longitude),
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,precipitation_probability_max,precipitation_sum,wind_speed_10m_max",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "America/New_York",
    forecast_days: "14",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, {
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(7000),
  });
  if (!response.ok) throw new Error("Open-Meteo weather unavailable");
  const data = await response.json();
  const daily = data.daily;
  return daily.time.map((date: string, index: number) => {
    const [condition, icon] = weatherLabel(daily.weather_code[index]);
    return {
      date,
      code: daily.weather_code[index],
      high: round(daily.temperature_2m_max[index]),
      low: round(daily.temperature_2m_min[index]),
      feelsLike: round(daily.apparent_temperature_max[index]),
      rainChance: round(daily.precipitation_probability_max[index]),
      rainTotal: daily.precipitation_sum[index] ?? 0,
      wind: round(daily.wind_speed_10m_max[index]),
      condition,
      icon,
      weatherSource: "Open-Meteo" as const,
    };
  });
}

export async function getWeather(): Promise<{ days: WeatherDay[]; live: boolean }> {
  const [nwsResult, openMeteoResult] = await Promise.allSettled([
    getNwsWeather(),
    getOpenMeteoWeather(),
  ]);
  const nwsDays = nwsResult.status === "fulfilled" ? nwsResult.value : [];
  const extensionDays =
    openMeteoResult.status === "fulfilled" ? openMeteoResult.value : fallbackWeather();
  const byDate = new Map(extensionDays.map((day) => [day.date, day]));

  // NOAA/NWS is authoritative for the first seven days. Open-Meteo only
  // extends the planning window where the NWS point forecast stops.
  nwsDays.forEach((day) => byDate.set(day.date, day));
  return {
    days: [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 14),
    live: nwsDays.length > 0 || openMeteoResult.status === "fulfilled",
  };
}

function sortRidesByShortest(rides: Ride[]) {
  return [...rides].sort((a, b) => {
    if (a.isOpen !== b.isOpen) return a.isOpen ? -1 : 1;
    if (a.isOpen && a.wait !== b.wait) return a.wait - b.wait;
    return a.name.localeCompare(b.name);
  });
}

async function getOnePark(config: ParkConfig): Promise<ParkWait> {
  try {
    const response = await fetch(`https://queue-times.com/parks/${config.id}/queue_times.json`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("Wait times unavailable");
    const data = await response.json();
    const rawRides = [
      ...(data.rides ?? []),
      ...(data.lands ?? []).flatMap((land: { rides?: unknown[] }) => land.rides ?? []),
    ] as Array<{ name: string; wait_time: number; is_open: boolean; last_updated: string }>;
    const rides = sortRidesByShortest(
      rawRides.map((ride) => ({
        name: ride.name,
        wait: ride.wait_time ?? 0,
        isOpen: Boolean(ride.is_open),
        updatedAt: ride.last_updated,
      })),
    );
    const open = rides.filter((ride) => ride.isOpen);
    const avgWait = open.length ? Math.round(open.reduce((sum, ride) => sum + ride.wait, 0) / open.length) : 0;
    return {
      ...config,
      avgWait,
      openCount: open.length,
      totalCount: rides.length,
      live: true,
      rides,
    };
  } catch {
    const fallbackRides: Record<number, Ride[]> = {
      65: [
        { name: "Harry Potter and the Escape from Gringotts", wait: 45, isOpen: true, updatedAt: "" },
        { name: "Revenge of the Mummy", wait: 35, isOpen: true, updatedAt: "" },
        { name: "MEN IN BLACK Alien Attack", wait: 25, isOpen: true, updatedAt: "" },
      ],
      64: [
        { name: "Hagrid’s Magical Creatures Motorbike Adventure", wait: 75, isOpen: true, updatedAt: "" },
        { name: "Jurassic World VelociCoaster", wait: 50, isOpen: true, updatedAt: "" },
        { name: "The Amazing Adventures of Spider-Man", wait: 30, isOpen: true, updatedAt: "" },
      ],
      334: [
        { name: "Harry Potter and the Battle at the Ministry", wait: 80, isOpen: true, updatedAt: "" },
        { name: "Mario Kart: Bowser’s Challenge", wait: 65, isOpen: true, updatedAt: "" },
        { name: "Monsters Unchained", wait: 55, isOpen: true, updatedAt: "" },
      ],
      67: [
        { name: "Krakatau Aqua Coaster", wait: 40, isOpen: true, updatedAt: "" },
        { name: "Honu of Honu ika Moana", wait: 30, isOpen: true, updatedAt: "" },
      ],
      6: [
        { name: "Walt Disney’s Carousel of Progress", wait: 5, isOpen: true, updatedAt: "" },
        { name: "Tomorrowland Transit Authority PeopleMover", wait: 10, isOpen: true, updatedAt: "" },
        { name: "Haunted Mansion", wait: 25, isOpen: true, updatedAt: "" },
        { name: "Seven Dwarfs Mine Train", wait: 50, isOpen: true, updatedAt: "" },
      ],
      5: [
        { name: "Living with the Land", wait: 5, isOpen: true, updatedAt: "" },
        { name: "Spaceship Earth", wait: 10, isOpen: true, updatedAt: "" },
        { name: "Frozen Ever After", wait: 30, isOpen: true, updatedAt: "" },
        { name: "Guardians of the Galaxy: Cosmic Rewind", wait: 45, isOpen: true, updatedAt: "" },
      ],
      7: [
        { name: "Star Tours – The Adventures Continue", wait: 10, isOpen: true, updatedAt: "" },
        { name: "Toy Story Mania!", wait: 25, isOpen: true, updatedAt: "" },
        { name: "The Twilight Zone Tower of Terror", wait: 35, isOpen: true, updatedAt: "" },
        { name: "Slinky Dog Dash", wait: 60, isOpen: true, updatedAt: "" },
      ],
      8: [
        { name: "Expedition Everest", wait: 10, isOpen: true, updatedAt: "" },
        { name: "Kilimanjaro Safaris", wait: 20, isOpen: true, updatedAt: "" },
        { name: "Na’vi River Journey", wait: 30, isOpen: true, updatedAt: "" },
        { name: "Avatar Flight of Passage", wait: 55, isOpen: true, updatedAt: "" },
      ],
    };
    const rides = sortRidesByShortest(fallbackRides[config.id] ?? []);
    return {
      ...config,
      avgWait: rides.length ? Math.round(rides.reduce((sum, ride) => sum + ride.wait, 0) / rides.length) : 0,
      openCount: rides.length,
      totalCount: rides.length,
      live: false,
      rides,
    };
  }
}

export async function getWaitTimes(resort: ResortKey = "universal") {
  return Promise.all(parkGroups[resort].map(getOnePark));
}

function decodeXml(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

const universalFallbackNews: NewsItem[] = [
  {
    title: "Universal Celestial Goodnight debuts at Epic Universe",
    description: "Epic Universe’s new nighttime spectacular combines fountains, projections, drones and aerial effects.",
    date: "Jun 30, 2026",
    category: "Epic Universe",
    url: "https://media.universalparksusa.com/press-releases/",
  },
  {
    title: "The complete 2026 Universal Orlando event guide",
    description: "Official dates and planning details for seasonal events, passholder perks and resort celebrations.",
    date: "Jun 24, 2026",
    category: "Planning",
    url: "https://blog.discoveruniversal.com/events/complete-guide-to-events-experiences-at-universal-orlando-resort-this-year/",
  },
  {
    title: "Fast & Furious: Hollywood Drift races toward 2027",
    description: "Universal has announced a new high-speed coaster coming to Universal Orlando Resort.",
    date: "2026",
    category: "Coming soon",
    url: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
  },
];

const disneyFallbackNews: NewsItem[] = [
  {
    title: "New details about what’s coming to Walt Disney World in 2026",
    description: "Disney’s official look at refreshed attractions, seasonal experiences and new reasons to visit throughout 2026.",
    date: "Dec 3, 2025",
    category: "2026 preview",
    url: "https://disneyparksblog.com/wdw/2026-disney-world-calendar-and-details/",
  },
  {
    title: "Discovering Monstropolis at Walt Disney World",
    description: "Construction continues on the upcoming Monsters, Inc.-inspired land at Disney’s Hollywood Studios.",
    date: "Jun 4, 2026",
    category: "Hollywood Studios",
    url: "https://disneyparksblog.com/wdw/monsters-inc-land-monstropolis-walt-disney-world/",
  },
  {
    title: "Deals, updates and more fun during summer at Disney World",
    description: "The official guide to Cool KIDS’ SUMMER, refreshed attractions and seasonal experiences across the resort.",
    date: "Mar 12, 2026",
    category: "Planning",
    url: "https://disneyparksblog.com/wdw/summer-at-disney-world-deals-updates/",
  },
  {
    title: "Carousel of Progress prepares for its next chapter",
    description: "Disney shares the history of the Tomorrowland classic as work begins on its upcoming update.",
    date: "Jun 2026",
    category: "Magic Kingdom",
    url: "https://disneyparksblog.com/wdw/a-great-big-beautiful-tomorrow-the-carousel-of-progress-history/",
  },
];

async function getRssNews(feedUrl: string, fallback: NewsItem[]) {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: 3600 },
      headers: { "User-Agent": "Passday/1.0" },
      signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) throw new Error("News feed unavailable");
    const xml = await response.text();
    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
      .slice(0, 5)
      .map((match) => {
        const block = match[1];
        const pick = (tag: string) => block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))?.[1] ?? "";
        const rawDate = pick("pubDate");
        return {
          title: decodeXml(pick("title")),
          description: decodeXml(pick("description")).slice(0, 180),
          date: rawDate ? new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(rawDate)) : "Recent",
          url: decodeXml(pick("link")),
          category: "Official news",
        };
      })
      .filter((item) => item.title && item.url);
    if (!items.length) throw new Error("Empty news feed");
    return { items, live: true };
  } catch {
    return { items: fallback, live: false };
  }
}

export function getNews(resort: ResortKey = "universal") {
  return resort === "disney"
    ? getRssNews("https://disneyparksblog.com/wdw/feed/", disneyFallbackNews)
    : getRssNews(
        "https://media.universalparksusa.com/press-releases/feed/",
        universalFallbackNews,
      );
}

function dateInRange(date: string, start: string, end: string) {
  return date >= start && date <= end;
}

export function createDayPlans(
  weather: WeatherDay[],
  resort: ResortKey = "universal",
): DayPlan[] {
  const resortEvents = getEvents(resort);
  return weather.map((day) => {
    const local = new Date(`${day.date}T12:00:00`);
    const activeEvents = resortEvents.filter((event) =>
      dateInRange(day.date, event.start, event.end),
    );
    const eventImpact = activeEvents.reduce((max, event) => Math.max(max, event.impact), 0);
    const universalHistory = getHistoricalWaitSignal(local);
    const disneyHistory = getDisneyCrowdSignal(local);
    const historicalWait =
      resort === "disney" ? disneyHistory.expectedCrowd : universalHistory.expectedWait;
    const historicalWaitDelta =
      resort === "disney"
        ? disneyHistory.differenceFromTypical
        : universalHistory.differenceFromTypical;
    const historicalWaitLabel =
      resort === "disney" ? disneyHistory.label : universalHistory.label;
    const arrivalWindow =
      resort === "disney" ? disneyHistory.arrivalWindow : universalHistory.arrivalWindow;
    const historicalDayShape =
      resort === "disney" ? disneyHistory.dayShape : universalHistory.dayShape;
    const historicalPressure =
      resort === "disney"
        ? disneyHistory.expectedCrowd
        : historicalWaitToPressure(universalHistory.expectedWait);
    const historicalOpportunity =
      resort === "disney"
        ? disneyCrowdToOpportunity(disneyHistory.expectedCrowd)
        : historicalWaitToOpportunity(universalHistory.expectedWait);
    const crowdIndex = Math.max(
      18,
      Math.min(
        96,
        Math.round(historicalPressure + eventImpact - day.rainChance * 0.08),
      ),
    );
    const crowdScore = Math.max(
      35,
      Math.min(
        96,
        Math.round(
          historicalOpportunity -
            eventImpact * 0.55 +
            Math.min(3, day.rainChance * 0.04),
        ),
      ),
    );

    // Routine Orlando heat and afternoon showers should not make every day
    // look bad. Penalties begin above a Florida-normal feels-like baseline,
    // while severe storms still make a meaningful dent in the recommendation.
    const heatPenalty = Math.max(0, day.feelsLike - 94) * 1.6;
    const stormPenalty = day.code >= 95 ? 24 : day.code >= 80 ? 9 : 0;
    const weatherScore = Math.max(
      20,
      Math.min(
        100,
        Math.round(100 - day.rainChance * 0.23 - heatPenalty - stormPenalty),
      ),
    );
    const visitScore = Math.max(
      1,
      Math.min(100, Math.round(crowdScore * 0.64 + weatherScore * 0.36)),
    );
    const crowdLabel = crowdIndex < 40 ? "Light" : crowdIndex < 56 ? "Moderate" : crowdIndex < 72 ? "Busy" : "Very busy";
    const verdict = visitScore >= 82 ? "Great day" : visitScore >= 72 ? "Strong pick" : visitScore >= 60 ? "Worth a look" : "Tough tradeoff";
    const reasons = [
      `${historicalWaitLabel} · ~${historicalWait}${resort === "disney" ? "%" : " min"} ${resort === "disney" ? "Magic Kingdom crowd baseline" : "USF historical avg"}`,
      day.rainChance <= 35 ? "Lower rain risk" : day.rainChance >= 65 ? "Storms could interrupt outdoor rides" : "Typical Florida shower risk",
      activeEvents.length ? `${activeEvents[0].shortTitle} is happening` : "No major resort event premium",
    ];
    return {
      ...day,
      crowdIndex,
      crowdLabel,
      historicalWait,
      historicalWaitDelta,
      historicalWaitLabel,
      historicalUnit: resort === "disney" ? "%" : "min",
      historicalReference:
        resort === "disney" ? "Magic Kingdom crowd baseline" : "USF historical average",
      arrivalWindow,
      historicalDayShape,
      crowdScore,
      weatherScore,
      visitScore,
      verdict,
      activeEvents,
      reasons,
    };
  });
}
