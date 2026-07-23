import Link from "next/link";
import Image from "next/image";
import ParkIcon from "./ParkIcon";
import { parkGroups, resortViews, type ResortKey } from "@/lib/resorts";

const resortOrder: ResortKey[] = ["universal", "disney"];

export default function Home() {
  return (
    <main className="park-home">
      <header className="home-topbar">
        <Link className="brand brand-logo-link" href="/" aria-label="PASS DAY home">
          <Image className="brand-mark-image" src="/brand/passday-mark.png" width={1016} height={1010} alt="" priority />
          <span className="brand-lockup-v2"><span className="brand-pass-v2">PASS</span><span className="brand-day-v2">DAY</span></span>
        </Link>
        <span><i /> Live weather and posted waits</span>
      </header>

      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow">One decision desk · eight Orlando parks</p>
          <h1><span>Where do you want</span><span>to <em>spend the day?</em></span></h1>
          <p>Choose a park to open its resort dashboard. Universal and Disney stay completely separate, with their own scores, passes, events, news and live waits.</p>
        </div>
        <div className="home-video-stage">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            poster="/brand/passday-mark.png"
            aria-label="Animated Pass Day logo"
          >
            <source src="/media/passday-hero.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <div className="resort-directory">
        {resortOrder.map((resortKey, resortIndex) => {
          const resort = resortViews[resortKey];
          return (
            <section className={`resort-group resort-group-${resortKey}`} key={resortKey}>
              <div className="resort-group-heading">
                <div>
                  <span>0{resortIndex + 1} · Orlando resort</span>
                  <h2>{resort.fullName}</h2>
                </div>
                <Link href={`/${resortKey}`}>Open resort planner <b>→</b></Link>
              </div>
              <div className="park-directory-grid">
                {parkGroups[resortKey].map((park, index) => (
                  <Link className="park-directory-card" href={`/${resortKey}?park=${park.id}`} key={park.id}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <ParkIcon parkId={park.id} />
                    <p>{resort.name}</p>
                    <h3>{park.name}</h3>
                    <small>{park.descriptor}</small>
                    <strong>Open park desk <b>↗</b></strong>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <footer className="home-footer">
        <p>Independent and unofficial. Park names and related indicia belong to their respective owners.</p>
        <p>Weather · crowd outlooks · events · news · every posted wait</p>
      </footer>
    </main>
  );
}
