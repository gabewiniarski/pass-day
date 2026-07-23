"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import sidebarStyles from "./sidebar.module.css";
import ParkIcon from "./ParkIcon";
import {
  NWS_ORLANDO_URL,
  type DayPlan,
  type NewsItem,
  type ParkEvent,
  type ParkWait,
} from "@/lib/park-data";
import { resortViews, type ResortKey } from "@/lib/resorts";

type Props = {
  plans: DayPlan[];
  parks: ParkWait[];
  events: ParkEvent[];
  news: NewsItem[];
  sourceStatus: { weather: boolean; waits: boolean; news: boolean };
  generatedAt: string;
  resortKey: ResortKey;
  initialParkId?: number;
};

const dateLong = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });
const dateShort = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

function asDate(value: string) {
  return new Date(`${value}T12:00:00`);
}

function WeatherMark({ icon, condition }: { icon: string; condition: string }) {
  return (
    <span className={`weather-mark weather-${icon}`} role="img" aria-label={condition}>
      <span className="weather-sun-shape" />
      <span className="weather-cloud-shape"><i /></span>
      <span className="weather-rain-shape"><i /><i /><i /></span>
      <span className="weather-bolt-shape" />
    </span>
  );
}

function scoreTone(score: number) {
  return score >= 72 ? "good" : score >= 60 ? "fair" : "hard";
}

export default function Dashboard({ plans, parks, events, news, sourceStatus, generatedAt, resortKey, initialParkId }: Props) {
  const resort = resortViews[resortKey];
  const passProfiles = resort.passes as Record<string, { access: string; guidance: string; action: string }>;
  const ranked = useMemo(() => [...plans].sort((a, b) => b.visitScore - a.visitScore), [plans]);
  const [selectedDate, setSelectedDate] = useState(plans[0]?.date ?? ranked[0]?.date);
  const [parkId, setParkId] = useState(parks.some((park) => park.id === initialParkId) ? initialParkId! : (parks[0]?.id ?? 65));
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [passType, setPassType] = useState<string>(resort.defaultPass);
  const [passLoading, setPassLoading] = useState(false);
  const passTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selected = plans.find((day) => day.date === selectedDate) ?? ranked[0];
  const selectedPlanIndex = Math.max(0, plans.findIndex((day) => day.date === selected.date));
  const forecastPageStart = Math.floor(selectedPlanIndex / 7) * 7;
  const visiblePlans = plans.slice(forecastPageStart, forecastPageStart + 7);
  const forecastRange = visiblePlans.length
    ? `${dateShort.format(asDate(visiblePlans[0].date)).split(", ")[1]} – ${dateShort.format(asDate(visiblePlans[visiblePlans.length - 1].date)).split(", ")[1]}`
    : "";
  const selectedPark = parks.find((park) => park.id === parkId) ?? parks[0];
  const best = ranked[0];
  const nextEvent = events.find((event) => event.end >= (plans[0]?.date ?? ""));
  const openParks = parks.filter((park) => park.openCount > 0);
  const quietestPark = [...openParks].sort((a, b) => a.avgWait - b.avgWait)[0];
  const passProfile = passProfiles[passType] ?? passProfiles[resort.defaultPass];

  useEffect(() => {
    return () => {
      if (passTimer.current) clearTimeout(passTimer.current);
    };
  }, []);

  function changePass(nextPass: string) {
    if (!(nextPass in passProfiles) || nextPass === passType) return;
    if (passTimer.current) clearTimeout(passTimer.current);
    setPassType(nextPass);
    setPassLoading(true);
    setAnswer(null);
    passTimer.current = setTimeout(() => setPassLoading(false), 450);
  }

  function getAnswer(raw: string) {
    const q = raw.toLowerCase();
    if (/best|which day|\bgo\b/.test(q)) {
      return `${dateLong.format(asDate(best.date))} is the strongest pick in the forecast window. Its visit score is ${best.visitScore}/100, with ${best.crowdLabel.toLowerCase()} modeled crowds and a ${best.rainChance}% chance of rain.`;
    }
    if (/rain|storm|weather|temperature|hot/.test(q)) {
      const driest = [...plans].sort((a, b) => a.rainChance - b.rainChance)[0];
      return `${dateShort.format(asDate(driest.date))} currently has the lowest rain risk at ${driest.rainChance}%. For ${dateShort.format(asDate(selected.date))}, expect ${selected.condition.toLowerCase()}, ${selected.high}°F and a ${selected.rainChance}% rain chance.`;
    }
    if (/crowd|quiet|busy/.test(q)) {
      const lightest = [...plans].sort((a, b) => a.crowdIndex - b.crowdIndex)[0];
      return `${dateLong.format(asDate(lightest.date))} has the lightest modeled crowds in this window at ${lightest.crowdIndex}/100 pressure. Its ${lightest.historicalReference.toLowerCase()} is about ${lightest.historicalWait}${lightest.historicalUnit}. The estimate combines that demand proxy with events and forecasted rain.`;
    }
    if (/wait|ride|line|right now/.test(q)) {
      if (!quietestPark) return "The parks appear to be closed right now, so live posted waits are not available yet.";
      return `${quietestPark.name} currently has the lowest average posted wait at about ${quietestPark.avgWait} minutes across ${quietestPark.openCount} open attractions.`;
    }
    if (/event|hhn|halloween|passholder|appreciation/.test(q)) {
      return nextEvent
        ? `${nextEvent.title} is the next event on the calendar (${nextEvent.dateLabel}). ${nextEvent.description}`
        : "There are no additional dated resort events in the current calendar. Check the official event guide for newly announced dates.";
    }
    if (resortKey === "universal" && /epic/.test(q)) {
      const epic = parks.find((park) => park.id === 334);
      return epic?.openCount
        ? `Epic Universe is currently averaging about ${epic.avgWait} minutes across ${epic.openCount} open attractions. For a full day, arrive before opening and prioritize Battle at the Ministry or Mario Kart first.`
        : "Epic Universe appears closed right now. Check back near park opening for live posted waits.";
    }
    if (/blockout|blackout|pass/.test(q)) {
      return `Your saved pass is ${passType}. Blockout calendars, reservations and benefits can change, so Passday links you to ${resort.independentLabel}’s official passholder pages for the final eligibility check.`;
    }
    return `For ${dateShort.format(asDate(selected.date))}: the visit score is ${selected.visitScore}/100, crowds are ${selected.crowdLabel.toLowerCase()}, the ${selected.historicalReference.toLowerCase()} is about ${selected.historicalWait}${selected.historicalUnit}, the high is ${selected.high}°F, and rain risk is ${selected.rainChance}%.`;
  }

  function submitQuestion(event: FormEvent) {
    event.preventDefault();
    if (!question.trim()) return;
    setAnswer(getAnswer(question));
  }

  function askQuick(prompt: string) {
    setQuestion(prompt);
    setAnswer(getAnswer(prompt));
  }

  function selectForecastDate(nextDate: string) {
    if (plans.some((day) => day.date === nextDate)) setSelectedDate(nextDate);
  }

  function changeForecastPage(direction: -1 | 1) {
    const nextStart = forecastPageStart + direction * 7;
    const nextDay = plans[nextStart];
    if (nextDay) setSelectedDate(nextDay.date);
  }

  const updated = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(generatedAt));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand brand-logo-link" href="/" aria-label="PASS DAY park selection home">
          <Image className="brand-mark-image" src="/brand/passday-mark.png" width={1016} height={1010} alt="" priority />
          <span className="brand-lockup-v2"><span className="brand-pass-v2">PASS</span><span className="brand-day-v2">DAY</span></span>
        </Link>

        <div className={sidebarStyles.picker}>
          <span className={sidebarStyles.label}>Choose resort</span>
          <div className={sidebarStyles.toggle} role="group" aria-label="Choose resort">
            <Link
              className={`${sidebarStyles.option} ${resortKey === "universal" ? sidebarStyles.active : ""}`}
              href="/universal"
              aria-current={resortKey === "universal" ? "page" : undefined}
            >
              <span className={sidebarStyles.mark} aria-hidden="true">U</span>
              <span>Universal</span>
            </Link>
            <Link
              className={`${sidebarStyles.option} ${resortKey === "disney" ? sidebarStyles.active : ""}`}
              href="/disney"
              aria-current={resortKey === "disney" ? "page" : undefined}
            >
              <span className={sidebarStyles.mark} aria-hidden="true">D</span>
              <span>Disney</span>
            </Link>
          </div>
        </div>

        <nav className="sidebar-menu" aria-label="Main navigation">
          <span className="sidebar-section-label">Explore</span>
          <a className="active" href="#planner"><span>01</span> Plan a day</a>
          <a href="#waits"><span>02</span> Live waits</a>
          <a href="#events"><span>03</span> Events</a>
          <a href="#news"><span>04</span> Park news</a>
        </nav>

        <div className={`pass-card ${passLoading ? "is-loading" : ""}`} aria-busy={passLoading}>
          <p>My annual pass</p>
          <select value={passType} onChange={(event) => changePass(event.target.value)} aria-label="Annual pass type">
            {Object.keys(passProfiles).map((pass) => <option key={pass}>{pass}</option>)}
          </select>
          <a href={resort.passUrl} target="_blank" rel="noreferrer">Check blockout dates ↗</a>
        </div>

        <p className="sidebar-note">Independent planning tool. Not affiliated with {resort.independentLabel}.</p>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <span className="live-dot" /> {selectedPark.name} desk
          </div>
          <p><Link href="/">All parks</Link> · Updated {updated} ET</p>
        </header>

        <section className="hero" id="planner">
          <div className="hero-copy">
            <p className="eyebrow">{resort.heroEyebrow}</p>
            <h1>Pick a day.<br /><em>Own the park.</em></h1>
            <p className="lede">Crowd pressure, Florida weather, current waits and park happenings—distilled into one clear call.</p>

            <form className="ask-box" onSubmit={submitQuestion}>
              <label htmlFor="question">Ask the park desk</label>
              <div>
                <input id="question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Is next Tuesday worth it?" />
                <button type="submit" aria-label="Ask question">Ask <span>↗</span></button>
              </div>
            </form>
            <div className="quick-asks" aria-label="Suggested questions">
              {["What’s the best day?", "When will it be quiet?", "Any passholder events?"].map((prompt) => (
                <button key={prompt} onClick={() => askQuick(prompt)}>{prompt}</button>
              ))}
            </div>
            {answer && <div className="answer-card" role="status"><span>Desk answer</span><p>{answer}</p><button onClick={() => setAnswer(null)} aria-label="Close answer">×</button></div>}
          </div>

          <figure className="park-hero-visual" key={selectedPark.id}>
            <Image
              src={selectedPark.heroImage}
              alt={`Original editorial illustration representing ${selectedPark.name}`}
              fill
              priority
              sizes="(max-width: 760px) 100vw, (max-width: 1120px) 70vw, 44vw"
            />
            <div className="park-hero-topline">
              <span>Park desk · original illustration</span>
              <span className={selectedPark.live ? "is-live" : ""}><i /> {selectedPark.live ? "Live waits" : "Planning view"}</span>
            </div>
            <figcaption>
              <p>{resort.name}</p>
              <h2>{selectedPark.name}</h2>
              <span>{selectedPark.descriptor}</span>
              <div className="park-hero-metrics">
                <div>
                  <small>Current average</small>
                  <strong>{selectedPark.openCount ? `${selectedPark.avgWait} min` : "Park closed"}</strong>
                </div>
                <div>
                  <small>Best upcoming day</small>
                  <strong>{dateShort.format(asDate(best.date))}</strong>
                </div>
                <button onClick={() => setSelectedDate(best.date)}>
                  <span className={`park-hero-score ${scoreTone(best.visitScore)}`}>{best.visitScore}</span>
                  View plan <b>→</b>
                </button>
              </div>
            </figcaption>
          </figure>
        </section>

        <section className="section forecast-section">
          <div className="section-heading">
            <div><p className="eyebrow">14-day outlook · seven at a time</p><h2>Seven days, ranked.</h2></div>
            <div className="forecast-meta">
              <div className="forecast-status-row">
                <div className="legend"><span><i className="legend-good" /> Better</span><span><i className="legend-hard" /> Tougher</span></div>
                <a className={`source-badge ${sourceStatus.weather ? "is-live" : ""}`} href={NWS_ORLANDO_URL} target="_blank" rel="noreferrer">
                  <span /> {sourceStatus.weather ? "Live · Orlando, FL" : "Sample · Orlando, FL"}
                </a>
              </div>
              <div className="forecast-controls">
                <div className="week-switcher" aria-label="Browse seven-day forecast groups">
                  <button type="button" onClick={() => changeForecastPage(-1)} disabled={forecastPageStart === 0} aria-label="Show previous seven days">←</button>
                  <span><small>Showing</small>{forecastRange}</span>
                  <button type="button" onClick={() => changeForecastPage(1)} disabled={forecastPageStart + 7 >= plans.length} aria-label="Show next seven days">→</button>
                </div>
                <label className="date-picker">
                  <span>Choose date</span>
                  <input
                    type="date"
                    value={selected.date}
                    min={plans[0]?.date}
                    max={plans[plans.length - 1]?.date}
                    onChange={(event) => selectForecastDate(event.target.value)}
                    aria-label="Choose a date in the forecast window"
                  />
                </label>
              </div>
            </div>
          </div>
          <div className="forecast-rail">
            {visiblePlans.map((day) => (
              <button key={day.date} className={`day-card ${day.date === selected.date ? "selected" : ""}`} onClick={() => setSelectedDate(day.date)}>
                <div className="day-card-head">
                  <div>
                    <p>{plans.findIndex((item) => item.date === day.date) === 0 ? "Today" : dateShort.format(asDate(day.date)).split(",")[0]}</p>
                    <small>{dateShort.format(asDate(day.date)).split(", ")[1]}</small>
                  </div>
                  <span className="rank"><small>Rank</small>#{ranked.findIndex((item) => item.date === day.date) + 1}</span>
                </div>
                <div className="day-card-weather"><WeatherMark icon={day.icon} condition={day.condition} /></div>
                <div className="day-card-foot">
                  <strong>{day.high}°</strong>
                  <span className={`score ${scoreTone(day.visitScore)}`}><small>Score</small>{day.visitScore}</span>
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="section split-section">
          <article className="day-detail">
            <div className="section-heading compact">
              <div><p className="eyebrow">Your selected day</p><h2>{dateLong.format(asDate(selected.date))}</h2></div>
              <span className={`big-score ${scoreTone(selected.visitScore)}`}>{selected.visitScore}</span>
            </div>
            <div className="detail-grid">
              <div className="detail-stat"><span>Modeled crowds</span><b>{selected.crowdLabel}</b><small>{selected.crowdIndex} / 100 pressure</small></div>
              <div className="detail-stat"><span>Forecast</span><b>{selected.high}° / {selected.low}°</b><small>Feels like {selected.feelsLike}° · {selected.weatherSource}</small></div>
              <div className="detail-stat"><span>Rain</span><b>{selected.rainChance}%</b><small>{selected.rainTotal === null ? "Daytime chance · NOAA/NWS" : `${selected.rainTotal.toFixed(2)} in projected`}</small></div>
            </div>
            <section className="history-lens" aria-labelledby="history-lens-title">
              <div className="history-lens-heading">
                <div>
                  <span>{resort.historyEyebrow}</span>
                  <h3 id="history-lens-title">{resort.historyTitle}</h3>
                </div>
                <span className={`history-badge ${selected.historicalWaitDelta >= 3 ? "is-heavy" : selected.historicalWaitDelta <= -3 ? "is-light" : ""}`}>
                  {selected.historicalWaitLabel}
                </span>
              </div>
              <div className="history-lens-body">
                <div className="history-average">
                  <strong>~{selected.historicalWait}<small>{selected.historicalUnit}</small></strong>
                  <span>{resort.historyMetric}</span>
                  <small>
                    {selected.historicalWaitDelta === 0
                      ? `Right at the ${resort.historyTypical}`
                      : `${selected.historicalWaitDelta > 0 ? "+" : ""}${selected.historicalWaitDelta}${selected.historicalUnit} vs. the ${resort.historyTypical}`}
                  </small>
                </div>
                <div className="history-shape" aria-label="Typical wait pattern through the day">
                  {selected.historicalDayShape.map((shape, index) => (
                    <div key={shape} className={`history-shape-${index + 1}`}>
                      <i />
                      <span>{index === 0 ? selected.arrivalWindow : index === 1 ? "Late morning–midday" : "Final 90 minutes"}<b>{shape}</b></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="history-lens-footer">
                <p>Directional demand proxy from {resort.historySourceName}’s published patterns; events and weather are applied separately.</p>
                <a href={resort.historySourceUrl} target="_blank" rel="noreferrer">Explore historical source ↗</a>
              </div>
            </section>
            <div className={`pass-lens ${passLoading ? "is-loading" : ""}`} aria-live="polite" aria-busy={passLoading}>
              <div className="pass-lens-heading">
                <div><span>Annual pass lens</span><b>{passType}</b></div>
                <select value={passType} onChange={(event) => changePass(event.target.value)} aria-label="Change annual pass type">
                  {Object.keys(passProfiles).map((pass) => <option key={pass}>{pass}</option>)}
                </select>
              </div>
              {passLoading ? (
                <div className="pass-shimmer" aria-label={`Loading ${passType} pass details`}>
                  <i /><i /><i />
                </div>
              ) : (
                <div className="pass-lens-content">
                  <div><span>Planning stance</span><strong>{passProfile.access}</strong></div>
                  <p>{passProfile.guidance}</p>
                  <div className="pass-lens-footer">
                    <small><b>Score impact:</b> none—rankings remain crowd + weather</small>
                    <a href={resort.passUrl} target="_blank" rel="noreferrer">{passProfile.action} ↗</a>
                  </div>
                </div>
              )}
            </div>
            <div className="game-plan">
              <p>Park-day playbook</p>
              <ol>
                <li><span>01</span><div><b>Own the opening hour</b><small>Be at security 35–45 minutes early—the historical profile is lightest near opening.</small></div></li>
                <li><span>02</span><div><b>Front-load your headliners</b><small>Finish your top outdoor attraction before the typical late-morning wait build.</small></div></li>
                <li><span>03</span><div><b>Save a flexible final-hour list</b><small>{selected.rainChance >= 55 ? "Use indoor shows during showers, then revisit outdoor priorities as waits ease." : "Keep two nearby attractions ready for the typical late-day easing."}</small></div></li>
              </ol>
            </div>
          </article>

          <aside className="method-card">
            <p className="eyebrow">How the score works</p>
            <h3>Good for Florida.</h3>
            <div className="formula">
              <span>64%</span>
              <p><b>Crowd opportunity</b>Historical wait patterns, major events and weather response</p>
              <strong>{selected.crowdScore}<small>/100</small></strong>
            </div>
            <div className="formula">
              <span>36%</span>
              <p><b>Weather usability</b>Rain probability, heat index and storm severity</p>
              <strong>{selected.weatherScore}<small>/100</small></strong>
            </div>
            <a className="method-source" href={resort.historySourceUrl} target="_blank" rel="noreferrer">Historical baseline · {resort.historySourceName} ↗</a>
            <p className="method-note">The score asks whether this is a good {resort.independentLabel} day for Orlando—not whether the weather is perfect. Routine heat and showers are normalized; peak waits and severe storms still pull the score down.</p>
          </aside>
        </section>

        <section className="section waits-section" id="waits">
          <div className="section-heading">
            <div><p className="eyebrow">On the ground · shortest first</p><h2>Every posted wait, park by park.</h2></div>
            <div className={`source-badge ${sourceStatus.waits ? "is-live" : ""}`}><span /> {sourceStatus.waits ? "Live posted waits" : "Sample waits"}</div>
          </div>
          <div className="park-tabs" role="tablist" aria-label="Choose a park">
            {parks.map((park) => (
              <button key={park.id} role="tab" aria-selected={park.id === selectedPark.id} onClick={() => setParkId(park.id)}>
                <ParkIcon parkId={park.id} variant="tab" />
                <span className="park-tab-copy">
                  <strong>{park.shortName}</strong>
                  <small>{park.openCount ? `${park.avgWait} min average` : "Park closed"}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="waits-card">
            <div className="wait-summary">
              <div className="wait-summary-park"><ParkIcon parkId={selectedPark.id} variant="summary" /><p>{selectedPark.name}</p></div>
              <strong>{selectedPark.openCount ? selectedPark.avgWait : "—"}<small>{selectedPark.openCount ? "min average" : "park appears closed"}</small></strong>
              <span>{selectedPark.openCount} of {selectedPark.totalCount} attractions posting · shortest wait first</span>
            </div>
            <div className="ride-list">
              {selectedPark.rides.map((ride) => (
                <div key={ride.name}><span className={ride.isOpen ? "ride-open" : "ride-closed"} /><p>{ride.name}<small>{ride.isOpen ? "Open" : "Closed"}</small></p><b>{ride.isOpen ? ride.wait : "—"}<small>{ride.isOpen ? "min" : ""}</small></b></div>
              ))}
            </div>
          </div>
          <a className="attribution" href="https://queue-times.com/" target="_blank" rel="noreferrer">Powered by Queue-Times.com ↗</a>
        </section>

        <section className="section events-section" id="events">
          <div className="section-heading">
            <div><p className="eyebrow">Mark the calendar</p><h2>Upcoming at the resort.</h2></div>
            <a href={resort.eventsUrl} target="_blank" rel="noreferrer">Official calendar ↗</a>
          </div>
          <div className="event-grid">
            {events.filter((event) => event.end >= (plans[0]?.date ?? "")).slice(0, 6).map((event, index) => (
              <a className={`event-card event-${(index % 3) + 1}`} href={event.url} target="_blank" rel="noreferrer" key={event.title}>
                <div><span>{event.type}</span><b>0{index + 1}</b></div>
                <p>{event.dateLabel}</p>
                <h3>{event.title}</h3>
                <small>{event.description}</small>
                <i>Open details ↗</i>
              </a>
            ))}
          </div>
        </section>

        <section className="section news-section" id="news">
          <div className="section-heading">
            <div><p className="eyebrow">The park wire</p><h2>News worth knowing.</h2></div>
            <div className={`source-badge ${sourceStatus.news ? "is-live" : ""}`}><span /> {sourceStatus.news ? "Official feed" : "Official picks"}</div>
          </div>
          <div className="news-list">
            {news.map((item, index) => (
              <a href={item.url} target="_blank" rel="noreferrer" key={`${item.title}-${index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><p>{item.category} · {item.date}</p><h3>{item.title}</h3><small>{item.description}</small></div>
                <b>↗</b>
              </a>
            ))}
          </div>
        </section>

        <footer>
          <Link className="brand brand-logo-link footer-brand" href="/">
            <Image className="brand-mark-image" src="/brand/passday-mark.png" width={1016} height={1010} alt="" />
            <span className="brand-lockup-v2"><span className="brand-pass-v2">PASS</span><span className="brand-day-v2">DAY</span></span>
          </Link>
          <p>7-day Orlando forecast by <a href={NWS_ORLANDO_URL} target="_blank" rel="noreferrer">NOAA/NWS</a>; days 8–14 by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> · Live waits by <a href="https://queue-times.com/" target="_blank" rel="noreferrer">Queue-Times</a> · Historical patterns by <a href={resort.historySourceUrl} target="_blank" rel="noreferrer">{resort.historySourceName}</a>.</p>
          <p>{resort.legal}</p>
        </footer>
      </main>
    </div>
  );
}
