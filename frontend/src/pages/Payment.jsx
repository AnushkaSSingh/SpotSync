import { useMemo } from 'react'
import {
  ArrowLeft,
  Car,
  CheckCircle2,
  CreditCard,
  MapPin,
  ShieldCheck,
} from 'lucide-react'

const parking = {
  name: 'City Center Parking',
  address: 'MG Road, City Center',
  price: 30,
}

export default function Payment() {
  const params = useMemo(
    () => new URLSearchParams(window.location.search),
    [],
  )

  const slot = params.get('slot') || 'A01'
  const total = Number(params.get('total')) || 70

  const parkingFee = total - 10
  const serviceFee = 10

  function goBack() {
    window.history.back()
  }

  function confirmPayment() {
    window.history.pushState(
      { slot, total },
      '',
      `/booking-confirmation?parking=${encodeURIComponent(parking.name)}&slot=${slot}&total=${total}`,
    )

    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return (
    <main className="payment-page">
      <div className="container">
        <button type="button" className="back-link" onClick={goBack}>
          <ArrowLeft size={17} />
          Back to booking
        </button>

        <div className="payment-heading">
          <span className="section-kicker">SECURE CHECKOUT</span>
          <h1>Complete your payment</h1>
          <p>Review your booking and choose a payment method.</p>
        </div>

        <section className="payment-layout">
          <div className="payment-main">
            <article className="payment-section-card">
              <div className="payment-location-icon">
                <Car size={24} />
              </div>

              <div>
                <span className="section-kicker">PARKING LOCATION</span>
                <h2>{parking.name}</h2>
                <p className="payment-address">
                  <MapPin size={16} />
                  {parking.address}
                </p>
              </div>
            </article>

            <article className="payment-section-card">
              <div className="payment-card-heading">
                <div>
                  <span className="section-kicker">PAYMENT METHOD</span>
                  <h2>Choose how to pay</h2>
                </div>
              </div>

              <button type="button" className="payment-method selected">
                <CreditCard size={20} />
                <span>
                  <strong>Card payment</strong>
                  <small>Credit or debit card</small>
                </span>
                <CheckCircle2 size={19} />
              </button>

              <div className="payment-demo-note">
                <ShieldCheck size={18} />
                <span>This is a frontend demo. No real payment will be charged.</span>
              </div>
            </article>
          </div>

          <aside className="payment-summary-card">
            <span className="section-kicker">BOOKING SUMMARY</span>
            <h2>Payment details</h2>

            <div className="payment-summary-row">
              <span>Parking slot</span>
              <strong>{slot}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Parking fee</span>
              <strong>&#8377;{parkingFee}</strong>
            </div>

            <div className="payment-summary-row">
              <span>Service fee</span>
              <strong>&#8377;{serviceFee}</strong>
            </div>

            <div className="price-divider" />

            <div className="payment-total">
              <span>Total</span>
              <strong>&#8377;{total}</strong>
            </div>

            <button
              type="button"
              className="reserve-button"
              onClick={confirmPayment}
            >
              Confirm & Pay
            </button>

            <p className="secure-note">
              Your booking information is kept secure.
            </p>
          </aside>
        </section>
      </div>
    </main>
  )
}


