import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Car,
  Check,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Star,
} from 'lucide-react'

const parking = {
  name: 'City Center Parking',
  address: 'MG Road, City Center',
  rating: 4.8,
  reviews: 124,
  price: 30,
}

export default function BookingDetails() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const slot = params.get('slot') || 'A01'

  const [selectedDuration, setSelectedDuration] = useState(2)

  const durationOptions = [
    { value: 2, label: '2 hours', fee: 60 },
    { value: 4, label: '4 hours', fee: 120 },
    { value: 24, label: 'Full day', fee: 250 },
  ]

  const selectedOption = durationOptions.find(
    (option) => option.value === selectedDuration
  )
  const duration = selectedDuration
  const parkingFee = selectedOption.fee
  const serviceFee = 10
  const total = parkingFee + serviceFee

  function goBack() {
    window.history.back()
  }

  function continueToPayment() {
    window.history.pushState(
      { slot, total },
      '',
      `/payment?parking=${encodeURIComponent(parking.name)}&slot=${slot}&total=${total}`,
    )

    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="booking-page">
      <div className="container">
        <button type="button" className="back-link" onClick={goBack}>
          <ArrowLeft size={17} />
          Back to parking
        </button>

        <div className="booking-heading">
          <span className="section-kicker">RESERVE YOUR SPOT</span>
          <h1>Confirm your booking</h1>
          <p>
            Review your parking details before continuing to payment.
          </p>
        </div>

        <section className="booking-layout">
          <div className="booking-main">
            <article className="booking-location-card">
              <div className="booking-location-icon">
                <Car size={24} />
              </div>

              <div className="booking-location-content">
                <div className="booking-location-title">
                  <div>
                    <span className="section-kicker">PARKING LOCATION</span>
                    <h2>{parking.name}</h2>
                  </div>

                  <span className="booking-live">
                    <span />
                    Live
                  </span>
                </div>

                <p className="booking-address">
                  <MapPin size={16} />
                  {parking.address}
                </p>

                <div className="booking-rating">
                  <Star size={14} fill="currentColor" />
                  <strong>{parking.rating}</strong>
                  <span>({parking.reviews} reviews)</span>
                </div>
              </div>
            </article>

            <article className="booking-section-card">
              <div className="booking-card-heading">
                <div>
                  <span className="section-kicker">PARKING SPOT</span>
                  <h2>Your selected spot</h2>
                </div>

                <div className="selected-slot-badge">
                  <Check size={15} />
                  Selected
                </div>
              </div>

              <div className="selected-slot">
                <div className="selected-slot-visual">
                  <Car size={28} />
                  <strong>{slot}</strong>
                </div>

                <div>
                  <strong>Parking slot {slot}</strong>
                  <span>Reserved for your vehicle</span>
                </div>
              </div>
            </article>

            <article className="booking-section-card">
              <div className="booking-card-heading">
                <div>
                  <span className="section-kicker">DURATION</span>
                  <h2>Parking duration</h2>
                </div>
              </div>

              <div className="duration-options">
                {durationOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`duration-option ${
                      selectedDuration === option.value ? 'selected' : ''
                    }`}
                    aria-pressed={selectedDuration === option.value}
                    onClick={() => setSelectedDuration(option.value)}
                  >
                    <Clock3 size={18} />
                    <span>
                      <strong>{option.label}</strong>
                      <small>₹{option.fee} parking fee</small>
                    </span>
                    {selectedDuration === option.value && <Check size={17} />}
                  </button>
                ))}
              </div>
            </article>

            <div className="booking-trust-note">
              <ShieldCheck size={19} />
              <div>
                <strong>Your booking is secure</strong>
                <span>
                  Your selected spot will be held while you complete checkout.
                </span>
              </div>
            </div>
          </div>

          <aside className="booking-price-card">
            <span className="section-kicker">BOOKING SUMMARY</span>
            <h2>Almost there</h2>

            <div className="price-summary">
              <div>
                <span>Parking</span>
                <strong>₹{parkingFee}</strong>
              </div>

              <div>
                <span>Duration</span>
                <strong>{selectedOption.label}</strong>
              </div>

              <div>
                <span>Service fee</span>
                <strong>₹{serviceFee}</strong>
              </div>
            </div>

            <div className="price-divider" />

            <div className="price-total">
              <span>Total</span>
              <strong>₹{total}</strong>
            </div>

            <button
              type="button"
              className="reserve-button"
              onClick={continueToPayment}
            >
              Continue to payment
              <ChevronRight size={17} />
            </button>

            <p className="secure-note">
              You won't be charged until you confirm your payment.
            </p>
          </aside>
        </section>
      </div>
    </main>
  )
}


