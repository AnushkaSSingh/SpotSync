import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  CreditCard,
  Landmark,
  Lock,
  MapPin,
  ShieldCheck,
  Smartphone,
  Wallet,
} from 'lucide-react'
import '../styles/payment-purple.css'

const METHODS = [
  { id: 'upi', label: 'UPI', hint: 'Pay with any UPI app', icon: Smartphone },
  { id: 'card', label: 'Credit / Debit Card', hint: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'wallet', label: 'Wallet', hint: 'Paytm, PhonePe and more', icon: Wallet },
  { id: 'razorpay', label: 'Razorpay', hint: 'Cards, netbanking, UPI', icon: Landmark },
]

function hourText(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const twelve = hour % 12 || 12
  return `${String(twelve).padStart(2, '0')}:00 ${suffix}`
}

export default function Payment() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])

  const parkingName = params.get('parking') || 'City Center Parking'
  const slot = params.get('slot') || 'A01'
  const total = Number(params.get('total')) || 70
  const date = params.get('date')
  const time = params.get('time')
  const duration = Number(params.get('duration')) || null

  const serviceFee = 10
  const parkingFee = total - serviceFee

  const [method, setMethod] = useState('upi')

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
          ? `${hourText(start)} – ${hourText((start + duration) % 24)}`
          : hourText(start)
  }

  const durationText = duration === 24 ? 'Full day' : duration ? `${duration} hours` : null

  function goBack() {
    window.history.back()
  }

  function confirmPayment() {
    const query = new URLSearchParams({
      parking: parkingName,
      slot,
      total: String(total),
      method,
    })
    if (date) query.set('date', date)
    if (time) query.set('time', time)
    if (duration) query.set('duration', String(duration))

    window.history.pushState({ slot, total }, '', `/booking-confirmation?${query}`)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="pay-page">
      <div className="container">
        <button type="button" className="back-link" onClick={goBack}>
          <ArrowLeft size={17} />
          Back to booking
        </button>

        <div className="pay-grid">
          <aside className="pay-card">
            <h2>Payment Summary</h2>

            <div className="pay-lot">
              <div className="pay-thumb">
                <Car size={22} />
              </div>
              <div>
                <strong>{parkingName}</strong>
                <span className="pay-muted">
                  <MapPin size={12} /> Slot {slot}
                </span>
              </div>
            </div>

            {dateText && (
              <div className="pay-row">
                <span>Booking time</span>
                <strong>
                  {dateText}
                  {timeText && `, ${timeText}`}
                </strong>
              </div>
            )}

            {durationText && (
              <div className="pay-row">
                <span>Duration</span>
                <strong>{durationText}</strong>
              </div>
            )}

            <div className="pay-row">
              <span>Parking fee</span>
              <strong>&#8377;{parkingFee}</strong>
            </div>

            <div className="pay-row">
              <span>Service fee</span>
              <strong>&#8377;{serviceFee}</strong>
            </div>

            <div className="pay-total">
              <span>Amount</span>
              <strong>&#8377;{total}</strong>
            </div>
          </aside>

          <section className="pay-card">
            <h2>Choose Payment Method</h2>

            <div className="pay-methods" role="radiogroup" aria-label="Payment method">
              {METHODS.map(({ id, label, hint, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={method === id}
                  className={`pay-method ${method === id ? 'selected' : ''}`}
                  onClick={() => setMethod(id)}
                >
                  <span className="pay-radio" />
                  <span className="pay-method-text">
                    <strong>{label}</strong>
                    <small>{hint}</small>
                  </span>
                  <Icon size={22} />
                  {method === id && <CheckCircle2 size={18} className="pay-tick" />}
                </button>
              ))}
            </div>

            <button type="button" className="pay-now" onClick={confirmPayment}>
              Pay Now &#8377;{total}
            </button>

            <p className="pay-secure">
              <Lock size={13} /> Secure payment
            </p>

            <div className="pay-demo">
              <ShieldCheck size={17} />
              <span>This is a frontend demo. No real payment will be charged.</span>
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}