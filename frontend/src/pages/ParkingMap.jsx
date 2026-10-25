import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Search, MapPin } from "lucide-react";
import "leaflet/dist/leaflet.css";
import "../styles/parkingmap.css";

const lots = [
  { id: 1, name: "MG Road Parking Hub", area: "MG Road, Bangalore", dist: "2.1 km", total: 50, available: 32, price: 50, pos: [12.9756, 77.6068] },
  { id: 2, name: "Indiranagar Parking Lot", area: "Indiranagar, Bangalore", dist: "3.4 km", total: 40, available: 18, price: 40, pos: [12.9784, 77.6408] },
  { id: 3, name: "Koramangala Parking", area: "Koramangala, Bangalore", dist: "5.2 km", total: 30, available: 10, price: 60, pos: [12.9352, 77.6245] },
];

const pin = new L.DivIcon({
  className: "",
  html: '<div class="map-pin">P</div>',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function ParkingMap() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(lots[0]);

  const shown = lots.filter((l) => {
    if (filter === "Open") return l.available > 0;
    if (filter === "Full") return l.available === 0;
    return true;
  });

  return (
    <>
      
      <div className="pm-wrap">
        <aside className="pm-list">
          <div className="pm-search">
            <Search size={16} />
            <input placeholder="Bangalore" />
          </div>

          <div className="pm-filters">
            {["All", "Open", "Full", "EV Charging"].map((f) => (
              <button key={f} className={filter === f ? "active" : ""} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>

          {shown.map((l) => (
            <div
              key={l.id}
              className={`pm-card ${selected.id === l.id ? "sel" : ""}`}
              onClick={() => setSelected(l)}
            >
              <div className="pm-thumb" />
              <div className="pm-info">
                <h4>{l.name}</h4>
                <small><MapPin size={11} /> {l.area}</small>
                <small>Total Slots: {l.total} · Available: <b className="green">{l.available}</b></small>
                <div className="pm-bottom">
                  <strong>₹{l.price}/hour</strong>
                  <button className="btn-primary pm-btn">View Details</button>
                </div>
              </div>
              <span className="pm-dist">{l.dist}</span>
            </div>
          ))}
        </aside>

        <MapContainer center={selected.pos} zoom={13} className="pm-map" key={selected.id}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap" />
          {shown.map((l) => (
            <Marker key={l.id} position={l.pos} icon={pin} eventHandlers={{ click: () => setSelected(l) }}>
              <Popup>
                <b>{l.name}</b><br />{l.dist} · {l.available} available
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </>
  );
}