import { useMemo } from 'react'
import { CheckCircle2 } from 'lucide-react'
import '../styles/confirmation-purple.css'

// Set to true once the My Bookings page (image 7) exists and has a route.
const BOOKINGS_READY = false

function hourText(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const twelve = hour % 12 || 12
  return `${String(twelve).padStart(2, '0')}:00 ${suffix}`
}

function go(path) {
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo({ top: 0 })
}

export default function BookingConfirmation() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])

  const parkingName = params.get('parking') || 'City Center Parking'
  const slot = params.get('slot') || 'A01'
  const total = Number(params.get('total')) || 70
  const date = params.get('date')
  const time = params.get('time')
  const duration = Number(params.get('duration')) || null

  // Display reference only. It is not saved anywhere yet.
  const reference = useMemo(
    () => params.get('booking') || `SS${Date.now().toString().slice(-6)}`,
    [params]
  )

  const dateText = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null

  let timeText = null
  if (time) {
    const start = Number(time.split(':')[0])
    timeText =
      duration === 24
        ? `${hourText(start)} · 24 hours`
        : duration
          ? `${hourText(start)} - ${hourText((start + duration) % 24)}`
          : hourText(start)
  }

  const whenText = [timeText, dateText].filter(Boolean).join(', ')

  return (
    <main className="cf-page">
      <div className="container">
        <section className="cf-card">
          <div className="cf-check">
            <CheckCircle2 size={44} />
          </div>

          <h1>Booking Confirmed!</h1>
          <p className="cf-sub">Your parking slot has been successfully booked.</p>

          <div className="cf-details">
            <div>
              <span>Booking ID</span>
              <strong>#{reference}</strong>
            </div>

            <div>
              <span>Facility</span>
              <strong>{parkingName}</strong>
            </div>

            <div>
              <span>Parking slot</span>
              <strong>{slot}</strong>
            </div>

            {whenText && (
              <div>
                <span>Time</span>
                <strong>{whenText}</strong>
              </div>
            )}

            <div>
              <span>Amount</span>
              <strong>&#8377;{total}.00</strong>
            </div>
          </div>

          <div className="cf-actions">
            {BOOKINGS_READY && (
              <button type="button" className="cf-primary" onClick={() => go('/bookings')}>
                View My Bookings
              </button>
            )}

            <button
              type="button"
              className={BOOKINGS_READY ? 'cf-outline' : 'cf-primary'}
              onClick={() => go('/home')}
            >
              Go to Home
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}