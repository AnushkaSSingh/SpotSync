import { useState } from "react";
import "./parking-layout.css";

const ICONS = {
  park: '<circle cx="12" cy="12" r="9"/><path d="M10 17V7h3a2.5 2.5 0 0 1 0 5h-3"/>',
  car: '<path d="M4 16v-4l2-5h12l2 5v4"/><path d="M4 12h16"/><circle cx="7.5" cy="16.5" r="1.5"/><circle cx="16.5" cy="16.5" r="1.5"/>',
  book: '<path d="M7 4h10v17l-5-4-5 4z"/>',
  warn: '<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  ticket: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M9 10h6M9 14h4"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  wifi: '<path d="M3 9a14 14 0 0 1 18 0M6 12.5a9 9 0 0 1 12 0M9 16a4.5 4.5 0 0 1 6 0"/><path d="M12 19.5h.01"/>',
};

function Icon({ name }) {
  return <svg viewBox="0 0 24 24" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />;
}

const LABEL = { free: "Free", occupied: "Occupied", reserved: "Reserved", mismatch: "Mismatch" };
const BAY_ICON = { free: "park", occupied: "car", reserved: "book", mismatch: "warn" };
const PREFIX = { free: "\u2713 ", occupied: "\u2022 ", reserved: "", mismatch: "\u26A0 " };

function Pill({ s }) {
  return <span className={"pill " + s}>{PREFIX[s] + LABEL[s]}</span>;
}

const INITIAL_FLOORS = [
  {
    name: "Basement 1",
    use: "1/3",
    bays: [
      { id: "B1-A1", s: "free" },
      { id: "B1-A2", s: "occupied", v: "DL3C 7781", t: "SS-0412", since: "10:42 AM", sensor: "Online" },
      { id: "B1-A3", s: "reserved", v: "Awaiting driver", t: "-", since: "11:15 AM", sensor: "Online" },
    ],
  },
  {
    name: "Basement 2",
    use: "3/4",
    bays: [
      { id: "B2-A1", s: "occupied", v: "HR26 DK 2091", t: "SS-0405", since: "09:20 AM", sensor: "Online" },
      { id: "B2-A2", s: "mismatch", v: "DL8C 5521", t: "SS-0409", since: "10:20 AM", sensor: "Online", match: 96, note: "Vehicle type doesn't fit this bay" },
      { id: "B2-A3", s: "reserved", v: "DL8C 5521", t: "SS-0409", since: "10:20 AM", sensor: "Online" },
      { id: "B2-A4", s: "free" },
    ],
  },
];

export default function ParkingLayout() {
  const [floors, setFloors] = useState(INITIAL_FLOORS);
  const [selected, setSelected] = useState("B2-A2");

  const allBays = floors.flatMap((f) => f.bays);
  const bay = allBays.find((b) => b.id === selected);

  const resolveMismatch = () => {
    setFloors((prev) =>
      prev.map((f) => ({
        ...f,
        bays: f.bays.map((b) =>
          b.id === selected ? { ...b, s: "occupied", note: undefined, match: undefined } : b
        ),
      }))
    );
  };

  const rows = bay.v
    ? [["car", "Vehicle", bay.v], ["ticket", "Ticket", bay.t], ["clock", "Since", bay.since], ["wifi", "Sensor", bay.sensor]]
    : [["car", "Vehicle", "-"], ["ticket", "Ticket", "-"], ["clock", "Since", "-"], ["wifi", "Sensor", "Online"]];

  let action;
  if (bay.s === "mismatch") action = <button className="btn" onClick={resolveMismatch}>Resolve mismatch</button>;
  else if (bay.s === "free") action = <a className="btn" href="/new-entry">Start new entry</a>;
  else if (bay.s === "occupied") action = <a className="btn" href="/exit-management">Process an exit</a>;
  else action = <a className="btn" href="/allocation">View allocation</a>;

  return (
    <section className="pl">
      <div className="head">
        <div>
          <h1 className="serif">Parking Layout</h1>
          <p className="sub">View the current parking bays across all basement levels.</p>
        </div>
        <div className="staffpill"><div className="av">ST</div>Staff STF-2041 {"\u2304"}</div>
      </div>

      <div className="chips">
        {["free", "occupied", "reserved", "mismatch"].map((s) => (
          <div className="chip" key={s}>
            <Pill s={s} />
            <span>{allBays.filter((b) => b.s === s).length}</span>
          </div>
        ))}
      </div>

      <div className="grid">
        <div>
          {floors.map((f) => (
            <section className="floor" key={f.name}>
              <h3 className="serif">{f.name} <span>{"\u00B7"} {f.use} in use</span></h3>
              <div className="bays">
                {f.bays.map((b) => (
                  <button
                    key={b.id}
                    className={"bay " + b.s + (b.id === selected ? " sel" : "")}
                    onClick={() => setSelected(b.id)}
                  >
                    <div className="circ"><Icon name={BAY_ICON[b.s]} /></div>
                    <span className="bid">{b.id}</span>
                    <Pill s={b.s} />
                    {b.s === "mismatch" && b.note && <span className="note">{b.note}</span>}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="panel">
          <div className="ptop">
            <span>Selected bay {"\u00B7"} {bay.id}</span>
            {bay.match && <span className="match">{bay.match}% match</span>}
          </div>
          <Pill s={bay.s} />
          <div className="bigid serif">{bay.id}</div>
          {rows.map((r) => (
            <div className="row" key={r[1]}>
              <Icon name={r[0]} />
              <span className="k">{r[1]}</span>
              <b>{r[2]}</b>
            </div>
          ))}
          {action}
        </aside>
      </div>
    </section>
  );
}
