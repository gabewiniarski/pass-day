type ParkIconVariant = "directory" | "tab" | "summary";

const iconByParkId: Record<number, string> = {
  65: "studios",
  64: "islands",
  334: "epic",
  67: "volcano",
  6: "kingdom",
  5: "epcot",
  7: "hollywood",
  8: "animal",
};

export default function ParkIcon({ parkId, variant = "directory" }: { parkId: number; variant?: ParkIconVariant }) {
  const icon = iconByParkId[parkId] ?? "studios";

  return (
    <span className={`park-icon park-icon-${icon} park-icon-${variant}`} aria-hidden="true">
      <span className="park-icon-art">
        <i />
        <b />
        <em />
      </span>
    </span>
  );
}
