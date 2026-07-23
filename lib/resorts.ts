import { THRILL_DATA_URL } from "@/lib/thrill-history";

export type ResortKey = "universal" | "disney";

export type ParkConfig = {
  id: number;
  name: string;
  shortName: string;
  slug: string;
  descriptor: string;
  heroImage: string;
};

type PassProfile = {
  access: string;
  guidance: string;
  action: string;
};

export const parkGroups: Record<ResortKey, ParkConfig[]> = {
  universal: [
    { id: 65, name: "Universal Studios Florida", shortName: "Studios", slug: "studios", descriptor: "Movies, Diagon Alley and classic thrills", heroImage: "/parks/universal-studios-florida.jpg" },
    { id: 64, name: "Islands of Adventure", shortName: "Islands", slug: "islands", descriptor: "Coasters, superheroes and Hogsmeade", heroImage: "/parks/islands-of-adventure.jpg" },
    { id: 334, name: "Universal Epic Universe", shortName: "Epic", slug: "epic", descriptor: "Five immersive worlds and new headliners", heroImage: "/parks/epic-universe.jpg" },
    { id: 67, name: "Universal Volcano Bay", shortName: "Volcano Bay", slug: "volcano-bay", descriptor: "Water rides, beaches and Krakatau", heroImage: "/parks/volcano-bay.jpg" },
  ],
  disney: [
    { id: 6, name: "Magic Kingdom", shortName: "Magic Kingdom", slug: "magic-kingdom", descriptor: "Castle classics, mountains and fireworks", heroImage: "/parks/magic-kingdom.jpg" },
    { id: 5, name: "EPCOT", shortName: "EPCOT", slug: "epcot", descriptor: "World Showcase, festivals and future-facing rides", heroImage: "/parks/epcot.jpg" },
    { id: 7, name: "Disney’s Hollywood Studios", shortName: "Hollywood", slug: "hollywood-studios", descriptor: "Star Wars, Toy Story and Hollywood thrills", heroImage: "/parks/hollywood-studios.jpg" },
    { id: 8, name: "Disney’s Animal Kingdom", shortName: "Animal Kingdom", slug: "animal-kingdom", descriptor: "Pandora, wildlife and expedition adventures", heroImage: "/parks/animal-kingdom.jpg" },
  ],
};

const universalPasses: Record<string, PassProfile> = {
  Premier: {
    access: "Lowest blockout sensitivity",
    guidance: "Your tier generally offers the broadest flexibility, but separately ticketed events and product-specific terms can still apply.",
    action: "Confirm today’s park access before leaving",
  },
  Preferred: {
    access: "Broad date flexibility",
    guidance: "Most planning can start with the visit score, followed by a quick official eligibility check for your exact pass product.",
    action: "Verify the selected date on the official calendar",
  },
  Power: {
    access: "Blockout-aware planning",
    guidance: "High-demand periods may have restrictions, so eligibility should be confirmed before treating a highly ranked day as available.",
    action: "Check your product’s blockout calendar",
  },
  Seasonal: {
    access: "Most blockout-sensitive",
    guidance: "Crowd-friendly dates can still be unavailable to this tier during peak periods. Treat the official calendar as the final access check.",
    action: "Confirm access before building the day plan",
  },
};

const disneyPasses: Record<string, PassProfile> = {
  "Disney Incredi-Pass": {
    access: "Broadest date flexibility",
    guidance: "This pass generally offers the broadest calendar access, but park reservations, capacity and separately ticketed events can still apply.",
    action: "Verify admission and reservation availability",
  },
  "Disney Sorcerer Pass": {
    access: "Holiday-aware planning",
    guidance: "Use the visit score to shortlist a day, then confirm blockouts and reservation availability before locking it in.",
    action: "Check the official admission calendar",
  },
  "Disney Pirate Pass": {
    access: "Blockout-sensitive planning",
    guidance: "Peak and holiday periods may be unavailable, so confirm your exact calendar before treating a ranked day as bookable.",
    action: "Confirm blockouts and reservations",
  },
  "Disney Pixie Dust Pass": {
    access: "Weekday-first planning",
    guidance: "This tier is the most calendar-sensitive. A highly recommended day still needs an official blockout and reservation check.",
    action: "Confirm weekday eligibility",
  },
};

export const resortViews = {
  universal: {
    key: "universal",
    name: "Universal Orlando",
    fullName: "Universal Orlando Resort",
    independentLabel: "Universal",
    heroEyebrow: "A smarter way to use your Universal pass",
    historyEyebrow: "Universal Studios history",
    historyTitle: "What a comparable Universal day usually feels like",
    historyMetric: "Expected USF average",
    historyTypical: "published USF typical day",
    historySourceName: "Thrill Data",
    historySourceUrl: THRILL_DATA_URL,
    eventsUrl: "https://www.universalorlando.com/web/en/us/things-to-do/whats-happening",
    newsUrl: "https://media.universalparksusa.com/press-releases/",
    passUrl: "https://www.universalorlando.com/web/en/us/tickets-packages/annual-passes/blockout-dates",
    defaultPass: "Preferred",
    passes: universalPasses,
    legal: "Universal elements and all related indicia TM & © Universal Studios. Passday is independent and unofficial.",
  },
  disney: {
    key: "disney",
    name: "Walt Disney World",
    fullName: "Walt Disney World Resort",
    independentLabel: "Disney",
    heroEyebrow: "A smarter way to use your Disney pass",
    historyEyebrow: "Magic Kingdom history",
    historyTitle: "What a comparable Disney day usually feels like",
    historyMetric: "Historical crowd baseline",
    historyTypical: "Magic Kingdom historical norm",
    historySourceName: "Queue-Times",
    historySourceUrl: "https://queue-times.com/parks/6/stats",
    eventsUrl: "https://disneyworld.disney.go.com/events-tours/calendar/",
    newsUrl: "https://disneyparksblog.com/wdw/",
    passUrl: "https://disneyworld.disney.go.com/passes/blockout-dates/",
    defaultPass: "Disney Sorcerer Pass",
    passes: disneyPasses,
    legal: "Disney names and related indicia are trademarks of Disney. Passday is independent and unofficial.",
  },
} as const;

export type ResortView = (typeof resortViews)[ResortKey];
