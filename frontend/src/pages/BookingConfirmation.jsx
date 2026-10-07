import { useMemo } from 'react'
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Car,
  CalendarCheck,
} from 'lucide-react'

const parking = {
  name: 'City Center Parking',
  address: 'MG Road, City Center',
}

export default function BookingConfirmation() {
  const params = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  )

  const slot = params.get('slot') || 'A01'
  const total = Number(params.get('total')) || 70

  function goHome() {
    window.history.pushState({}, '', '/home')
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  function goBack() {
    window.history.back()
  }

  return (
    <main className="confirmation-page">
      <div className="container">
        <button type="button" className="back-link" onClick={goBack}>
          <ArrowLeft size={17} />
          Back
        </button>

        <section className="confirmation-card">
          <div className="confirmation-icon">
            <CheckCircle2 size={42} />
          </div>

          <span className="section-kicker">BOOKING CONFIRMED</span>

          <h1>Your parking spot is reserved!</h1>

          <p className="confirmation-message">
            Your booking has been successfully confirmed. Your parking spot
            will be waiting for you.
          </p>

          <div className="confirmation-details">
            <div>
              <MapPin size={19} />
              <span>
                <small>Parking location</small>
                <strong>{parking.name}</strong>
                <em>{parking.address}</em>
              </span>
            </div>

            <div>
              <Car size={19} />
              <span>
                <small>Parking slot</small>
                <strong>{slot}</strong>
              </span>
            </div>

            <div>
              <CalendarCheck size={19} />
              <span>
                <small>Total paid</small>
                <strong>{'\u20B9'}{total}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            className="primary-button confirmation-home-button"
            onClick={goHome}
          >
            Back to Home
          </button>
        </section>
      </div>
    </main>
  )
}


