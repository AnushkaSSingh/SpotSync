import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  MapPin,
  Navigation,
  ShieldCheck,
  Star,
  Zap,
} from 'lucide-react'

const slots = [
  { id: 'A01', status: 'available' },
  { id: 'A02', status: 'available' },
  { id: 'A03', status: 'occupied' },
  { id: 'A04', status: 'available' },
  { id: 'A05', status: 'reserved' },
  { id: 'A06', status: 'available' },
  { id: 'B01', status: 'available' },
  { id: 'B02', status: 'occupied' },
  { id: 'B03', status: 'available' },
  { id: 'B04', status: 'available' },
  { id: 'B05', status: 'occupied' },
  { id: 'B06', status: 'available' },
  { id: 'C01', status: 'available' },
  { id: 'C02', status: 'available' },
  { id: 'C03', status: 'reserved' },
  { id: 'C04', status: 'available' },
  { id: 'C05', status: 'available' },
  { id: 'C06', status: 'occupied' },
]

const parking = {
  name: 'City Center Parking',
  address: 'MG Road, City Center',
  distance: '0.4 km',
  rating: 4.8,
  reviews: 124,
  available: 18,
  total: 42,
  price: 30,
}

function SlotButton({ slot, selected, onSelect }) {
  const disabled = slot.status !== 'available'

  return (
    <button
      type="button"
      className={`parking-slot ${slot.status} ${selected ? 'selected' : ''}`}
      disabled={disabled}
      onClick={() => onSelect(slot.id)}
      aria-label={`${slot.id} ${slot.status}`}
    >
      <Car size={17} />
      <span>{slot.id}</span>
      {selected && (
        <span className="slot-check">
          <Check size={10} />
        </span>
      )}
    </button>
  )
}

export default function ParkingDetails() {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [saved, setSaved] = useState(false)

  const selected = useMemo(
    () => slots.find((slot) => slot.id === selectedSlot),
    [selectedSlot],
  )

  function goBack() {
    window.history.back()
  }

  function continueBooking() {
    if (!selectedSlot) return

    window.history.pushState(
      { parking: parking.name, slot: selectedSlot },
      '',
      `/booking?parking=${encodeURIComponent(parking.name)}&slot=${selectedSlot}`,
    )

    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="parking-details-page">
      <div className="container">
        <button type="button" className="back-link" onClick={goBack}>
          <ArrowLeft size={17} />
          Back to parking
        </button>

        <section className="parking-details-hero">
          <div className="parking-details-image">
            <div className="details-image-pattern" />
            <div className="details-image-icon">
              <Car size={40} />
            </div>

            <span className="details-live-badge">
              <span />
              Live availability
            </span>
          </div>

          <div className="parking-details-info">
            <div className="details-title-row">
              <div>
                <span className="section-kicker">PARKING LOCATION</span>
                <h1>{parking.name}</h1>

                <p className="details-address">
                  <MapPin size={16} />
                  {parking.address}
                </p>
              </div>

              <button
                type="button"
                className={`details-save ${saved ? 'saved' : ''}`}
                onClick={() => setSaved(!saved)}
                aria-label={saved ? 'Remove from saved locations' : 'Save location'}
              >
                <Heart size={20} fill={saved ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="details-rating-row">
              <span className="details-rating">
                <Star size={15} fill="currentColor" />
                {parking.rating}
              </span>
              <span>{parking.reviews} reviews</span>
              <span>•</span>
              <span>{parking.distance} away</span>
            </div>

            <div className="details-feature-list">
              <div>
                <Zap size={17} />
                <span>EV charging</span>
              </div>

              <div>
                <ShieldCheck size={17} />
                <span>Secure & monitored</span>
              </div>

              <div>
                <Clock3 size={17} />
                <span>Open 24/7</span>
              </div>
            </div>

            <div className="details-price">
              <strong>₹{parking.price}</strong>
              <span>/hour</span>
            </div>
          </div>
        </section>

        <section className="slot-selection-section">
          <div className="slot-selection-main">
            <div className="slot-section-heading">
              <div>
                <span className="section-kicker">LIVE PARKING GRID</span>
                <h2>Choose your spot</h2>
                <p>
                  Select an available parking space. Availability updates in
                  real time.
                </p>
              </div>

              <div className="slot-legend">
                <span>
                  <i className="legend-dot available" />
                  Available
                </span>
                <span>
                  <i className="legend-dot selected" />
                  Selected
                </span>
                <span>
                  <i className="legend-dot occupied" />
                  Occupied
                </span>
              </div>
            </div>

            <div className="parking-floor">
              <div className="floor-label">ENTRY</div>

              <div className="parking-lane">
                <div className="lane-arrow">
                  <Navigation size={16} />
                </div>
              </div>

              <div className="slot-row">
                {slots.slice(0, 6).map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot === slot.id}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>

              <div className="parking-divider">
                <span>A ROW</span>
              </div>

              <div className="slot-row">
                {slots.slice(6, 12).map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot === slot.id}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>

              <div className="parking-divider">
                <span>B ROW</span>
              </div>

              <div className="slot-row">
                {slots.slice(12, 18).map((slot) => (
                  <SlotButton
                    key={slot.id}
                    slot={slot}
                    selected={selectedSlot === slot.id}
                    onSelect={setSelectedSlot}
                  />
                ))}
              </div>

              <div className="floor-exit">
                <span>EXIT</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>

          <aside className="booking-summary-card">
            <div className="summary-card-heading">
              <div>
                <span className="section-kicker">YOUR RESERVATION</span>
                <h3>Booking summary</h3>
              </div>

              <div className="summary-live">
                <span />
                Live
              </div>
            </div>

            <div className="summary-location">
              <div className="summary-icon">
                <MapPin size={18} />
              </div>

              <div>
                <strong>{parking.name}</strong>
                <span>{parking.address}</span>
              </div>
            </div>

            <div className="summary-divider" />

            <div className="summary-detail">
              <span>Selected spot</span>
              <strong>{selected ? selected.id : 'Select a spot'}</strong>
            </div>

            <div className="summary-detail">
              <span>Availability</span>
              <strong>{parking.available} spots</strong>
            </div>

            <div className="summary-detail">
              <span>Rate</span>
              <strong>₹{parking.price}/hr</strong>
            </div>

            <div className="summary-note">
              <ShieldCheck size={15} />
              <span>Your spot will be held during checkout.</span>
            </div>

            <button
              type="button"
              className="reserve-button"
              disabled={!selectedSlot}
              onClick={continueBooking}
            >
              {selectedSlot ? `Continue with ${selectedSlot}` : 'Select a spot'}
              <ChevronRight size={17} />
            </button>

            <p className="secure-note">
              No payment is charged until you confirm your booking.
            </p>
          </aside>
        </section>
      </div>
    </main>
  )
}
