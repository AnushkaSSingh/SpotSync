import React, { useMemo, useState } from 'react'
import {
  Car, Truck, Bike, Zap, MapPin, Accessibility,
  ArrowRight, Check, ParkingCircle
} from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'

export default function Entry({ spaces = [], onCreate }) {
  const [plate, setPlate] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [nearEntrance, setNearEntrance] = useState(true)
  const [evCharging, setEvCharging] = useState(false)
  const [accessible, setAccessible] = useState(false)
  const [ticket, setTicket] = useState(null)
  const [error, setError] = useState('')

  const getBayId = (space) =>
    space?.name || space?.bay || space?.slot || space?.id || ''

  const getFloor = (space) => {
    const value = `${getBayId(space)} ${space?.floor || ''} ${space?.area || ''}`.toLowerCase()
    return value.includes('b2') || value.includes('basement 2')
      ? 'Basement 2'
      : 'Basement 1'
  }

  const isAvailable = (space) =>
    String(space?.status || '').toUpperCase() === 'AVAILABLE'

  const availableSpaces = useMemo(() => {
    const order = ['B1-A1', 'B1-A2', 'B1-A3', 'B2-A1', 'B2-A2', 'B2-A3', 'B2-A4']

    return spaces
      .filter(isAvailable)
      .sort((a, b) => {
        const ai = order.indexOf(getBayId(a))
        const bi = order.indexOf(getBayId(b))
        return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
      })
  }, [spaces])

  // Automatic allocation: no manual floor or bay selection.
  const suggestedSpace = useMemo(() => {
    if (!availableSpaces.length) return null

    let candidates = [...availableSpaces]

    if (evCharging) {
      const evSpaces = candidates.filter(
        space => space.evCharging === true ||
          String(space.type || '').toLowerCase() === 'ev'
      )

      if (evSpaces.length) candidates = evSpaces
    }

    if (accessible) {
      const accessibleSpaces = candidates.filter(
        space => space.accessible === true
      )

      if (accessibleSpaces.length) candidates = accessibleSpaces
    }

    if (nearEntrance) {
      candidates.sort((a, b) => {
        const distanceA = Number(a.distanceToEntrance ?? a.distance ?? 999)
        const distanceB = Number(b.distanceToEntrance ?? b.distance ?? 999)
        return distanceA - distanceB
      })
    }

    return candidates[0]
  }, [availableSpaces, evCharging, accessible, nearEntrance])

  const bayName = suggestedSpace ? getBayId(suggestedSpace) : 'No bay available'
  const floorName = getFloor(suggestedSpace)

  const distance = suggestedSpace?.distanceToEntrance ||
    suggestedSpace?.distance || '18 m'

  const allocateBay = () => {
    setError('')

    const formattedPlate = plate.trim().toUpperCase()

    if (!formattedPlate) {
      setError('Please enter the vehicle registration number.')
      return
    }

    if (!suggestedSpace) {
      setError('No available parking bay found.')
      return
    }

    const ticketData = {
      ticket: `SS-${String(Date.now()).slice(-6)}`,
      vehicle: formattedPlate,
      bay: bayName,
      entry: new Date().toLocaleString('en-IN'),
      status: 'PARKED',
      customer: '',
      type: vehicleType,
      contact: '',
      preferences: { nearEntrance, evCharging, accessible }
    }

    try {
      if (onCreate) onCreate(ticketData)
      setTicket(ticketData)
    } catch {
      setError('Unable to allocate the parking bay. Please try again.')
    }
  }

  const resetForm = () => {
    setPlate('')
    setVehicleType('Car')
    setNearEntrance(true)
    setEvCharging(false)
    setAccessible(false)
    setTicket(null)
    setError('')
  }

  const qrValue = ticket
    ? JSON.stringify({
        ticketId: ticket.ticket,
        vehicle: ticket.vehicle,
        bay: ticket.bay,
        entry: ticket.entry,
        status: ticket.status
      })
    : ''

  return (
    <div className="entry-page">
      <style>{`
        .entry-page {
          padding: 18px 24px;
          color: var(--text, #211044);
          font-family: Arial, sans-serif;
        }
        .entry-page * { box-sizing: border-box; }
        .entry-heading { margin-bottom: 16px; }
        .entry-heading h1 {
          font: 34px Georgia, serif;
          margin: 7px 0;
          color: #241044;
        }
        .entry-heading h1 em { color: #6830c4; }
        .entry-heading p { color: #82769a; font-size: 11px; }
        .entry-step {
          color: #5b2aa5;
          font-size: 10px;
          font-weight: bold;
        }
        .entry-layout {
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 16px;
          max-width: 1200px;
          align-items: stretch;
        }
        .entry-form-card {
          background: var(--card, white);
          border: 1px solid #e7def2;
          border-radius: 15px;
          padding: 19px;
          min-width: 0;
        }
        .entry-form-card h3 { font-size: 13px; margin: 0 0 17px; }
        .entry-label {
          display: block;
          font-size: 10px;
          font-weight: bold;
          margin-bottom: 8px;
        }
        .entry-plate {
          display: flex;
          height: 43px;
          border: 1px solid #a78ad7;
          border-radius: 8px;
          overflow: hidden;
          background: #fff7df;
        }
        .entry-country {
          width: 32px;
          background: #214eaa;
          color: white;
          display: grid;
          place-items: center;
          font-size: 9px;
          font-weight: bold;
        }
        .entry-plate input {
          width: 100%;
          min-width: 0;
          border: 0;
          outline: 0;
          background: transparent;
          text-align: center;
          font: bold 19px Georgia;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #625344;
        }
        .entry-hint { font-size: 9px; color: #9789ad; margin: 5px 0 17px; }
        .entry-vehicle-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 7px;
          margin-bottom: 17px;
        }
        .entry-vehicle {
          height: 53px;
          border: 1px solid #e5dcef;
          border-radius: 9px;
          background: var(--card, white);
          color: #5c4a78;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          font-size: 10px;
          cursor: pointer;
        }
        .entry-vehicle.selected {
          background: #f1eaff;
          border: 1.5px solid #6b2be0;
          color: #5b22bf;
        }
        .entry-preference {
          min-height: 53px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-bottom: 1px solid #eee8f4;
        }
        .entry-pref-icon {
          width: 27px;
          height: 27px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          color: #6328c8;
          background: #f1eaff;
          border-radius: 8px;
        }
        .entry-pref-text { flex: 1; }
        .entry-pref-text strong { display: block; font-size: 10px; }
        .entry-pref-text small { color: #9689a9; font-size: 9px; }
        .entry-toggle {
          width: 32px;
          height: 18px;
          padding: 2px;
          border: 0;
          border-radius: 20px;
          background: #dcd5e8;
          cursor: pointer;
        }
        .entry-toggle span {
          display: block;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: white;
          transition: transform .2s;
        }
        .entry-toggle.active { background: #5b20b9; }
        .entry-toggle.active span { transform: translateX(14px); }
        .entry-error { margin-top: 10px; color: #c43f4c; font-size: 11px; }

        .ticket-card {
          width: 100%;
          max-width: 430px;
          justify-self: center;
          align-self: center;
          overflow: hidden;
          border-radius: 21px;
          background: #fffaf1;
          box-shadow: 0 12px 27px #2b134f26;
          border: 1px solid #e9def1;
          color: #29134f;
        }
        .ticket-header {
          min-height: 40px;
          padding: 0 17px;
          background: linear-gradient(105deg, #401477, #6324a8);
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
          border-bottom: 3px solid #edc96b;
        }
        .ticket-header strong { font-size: 10px; }
        .ticket-match {
          background: white;
          color: #51208e;
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 9px;
          font-weight: bold;
        }
        .ticket-main { padding: 10px 18px 0; }
        .ticket-bay-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ticket-bay {
          font: bold 45px Georgia, serif;
          color: #301052;
          overflow-wrap: anywhere;
        }
        .ticket-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 7px 0 12px;
        }
        .ticket-badge {
          background: #eee5fa;
          border: 1px solid #d9c7f2;
          color: #4b2878;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 9px;
        }
        .ticket-divider {
          height: 20px;
          position: relative;
          display: flex;
          align-items: center;
        }
        .ticket-divider:before {
          content: "";
          width: 100%;
          border-top: 2px dashed #cbb7e6;
        }
        .ticket-divider:after, .ticket-divider span {
          content: "";
          position: absolute;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg, #f5f1fb);
          top: 0;
        }
        .ticket-divider:after { right: -29px; }
        .ticket-divider span { left: -29px; }
        .ticket-qr-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 5px 0 9px;
        }
        .ticket-qr-box {
          width: 124px;
          height: 124px;
          display: grid;
          place-items: center;
          border: 1px solid #e0d2ee;
          border-radius: 11px;
          background: white;
          padding: 8px;
        }
        .ticket-qr-caption {
          margin-top: 6px;
          color: #76638d;
          font-size: 8px;
          font-weight: bold;
        }
        .ticket-details { padding: 0 18px 10px; }
        .ticket-detail-row {
          min-height: 26px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          border-bottom: 1px dotted #d9cce3;
          font-size: 10px;
        }
        .ticket-detail-row span { color: #867697; }
        .ticket-detail-row strong { color: #30164f; text-align: right; }
        .ticket-actions { padding: 0 14px 12px; }
        .ticket-allocate {
          width: 100%;
          min-height: 38px;
          border: 0;
          border-radius: 22px;
          background: #542095;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 12px;
          font-weight: bold;
          cursor: pointer;
        }
        .ticket-allocate:disabled { opacity: .5; cursor: not-allowed; }
        .ticket-new {
          width: 100%;
          margin-top: 7px;
          border: 1px solid #d9c9eb;
          background: transparent;
          color: #55218d;
          border-radius: 20px;
          padding: 8px;
          font-size: 10px;
          cursor: pointer;
        }
        @media(max-width:760px) {
          .entry-page { padding: 15px 12px; }
          .entry-layout { grid-template-columns: 1fr; }
          .ticket-card { max-width: 430px; }
        }
        @media print {
          @page { size: 80mm 130mm; margin: 3mm; }
          body * { visibility: hidden !important; }
          .ticket-card, .ticket-card * { visibility: visible !important; }
          .ticket-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 74mm;
            max-width: 74mm;
            box-shadow: none;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .ticket-actions { display: none !important; }
        }
      `}</style>

      <div className="entry-heading">
        <div className="entry-step">STEP 1 OF 2 · VEHICLE REGISTRATION</div>
        <h1>Welcome a <em>new arrival</em></h1>
        <p>Register the vehicle and let SpotSync find its most suitable parking bay.</p>
      </div>

      <div className="entry-layout">
        <section className="entry-form-card">
          <h3>Vehicle entry details</h3>

          <label className="entry-label">Vehicle number plate *</label>
          <div className="entry-plate">
            <div className="entry-country">IND</div>
            <input
              value={plate}
              onChange={e => setPlate(e.target.value.toUpperCase())}
              placeholder="DL8C 5521"
              maxLength={13}
            />
          </div>
          <p className="entry-hint">Enter the registration number exactly as printed on the plate.</p>

          <label className="entry-label">Select vehicle type</label>
          <div className="entry-vehicle-grid">
            {[
              { name: 'Car', icon: Car },
              { name: 'SUV', icon: Truck },
              { name: 'Bike', icon: Bike },
              { name: 'EV', icon: Zap }
            ].map(({ name, icon: Icon }) => (
              <button
                key={name}
                type="button"
                className={`entry-vehicle ${vehicleType === name ? 'selected' : ''}`}
                onClick={() => setVehicleType(name)}
              >
                <Icon size={15} />{name}
              </button>
            ))}
          </div>

          <label className="entry-label">Parking preferences</label>

          {[
            {
              title: 'Near the entrance',
              description: 'Shorter walk to the entrance',
              icon: MapPin,
              checked: nearEntrance,
              change: setNearEntrance
            },
            {
              title: 'EV charging bay',
              description: 'Request an electric charging space',
              icon: Zap,
              checked: evCharging,
              change: setEvCharging
            },
            {
              title: 'Accessible parking',
              description: 'Request an accessible parking space',
              icon: Accessibility,
              checked: accessible,
              change: setAccessible
            }
          ].map(item => {
            const Icon = item.icon
            return (
              <div className="entry-preference" key={item.title}>
                <div className="entry-pref-icon"><Icon size={15} /></div>
                <div className="entry-pref-text">
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </div>
                <button
                  type="button"
                  className={`entry-toggle ${item.checked ? 'active' : ''}`}
                  onClick={() => item.change(!item.checked)}
                  aria-pressed={item.checked}
                >
                  <span />
                </button>
              </div>
            )
          })}

          {error && <div className="entry-error">{error}</div>}
        </section>

        <section className="ticket-card">
          <div className="ticket-header">
            <strong>SUGGESTED BAY</strong>
            <span className="ticket-match">96% match</span>
          </div>

          <div className="ticket-main">
            <div className="ticket-bay-row">
              <div className="ticket-bay">{ticket?.bay || bayName}</div>
              <small>BAY</small>
            </div>
            <div className="ticket-badges">
              <span className="ticket-badge"><ParkingCircle size={10} /> {ticket ? floorName : floorName}</span>
              <span className="ticket-badge"><MapPin size={10} /> {distance} to entrance</span>
              <span className="ticket-badge"><Check size={10} /> Available</span>
            </div>
          </div>

          <div className="ticket-divider"><span /></div>

          <div className="ticket-qr-area">
            <div className="ticket-qr-box">
              {ticket ? (
                <QRCodeSVG
                  value={qrValue}
                  size={106}
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#211044"
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#9889a8', fontSize: 9 }}>
                  <ParkingCircle size={24} />
                  <br />QR code generated after allocation
                </div>
              )}
            </div>
            <div className="ticket-qr-caption">
              {ticket ? 'SCAN AT EXIT BARRIER' : 'QR CODE PREVIEW'}
            </div>
          </div>

          <div className="ticket-details">
            <div className="ticket-detail-row">
              <span>Ticket ID</span>
              <strong>{ticket?.ticket || 'Generated on allocation'}</strong>
            </div>
            <div className="ticket-detail-row">
              <span>Vehicle</span>
              <strong>{ticket?.vehicle || plate || '—'}</strong>
            </div>
            <div className="ticket-detail-row">
              <span>Allocated bay</span>
              <strong>{ticket?.bay || bayName}</strong>
            </div>
            <div className="ticket-detail-row">
              <span>Area</span>
              <strong>{floorName}</strong>
            </div>
          </div>

          <div className="ticket-actions">
            {!ticket ? (
              <button
                type="button"
                className="ticket-allocate"
                disabled={!suggestedSpace}
                onClick={allocateBay}
              >
                Allocate bay <ArrowRight size={15} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="ticket-allocate"
                  onClick={() => window.print()}
                >
                  Print parking ticket <ArrowRight size={15} />
                </button>
                <button type="button" className="ticket-new" onClick={resetForm}>
                  Create new entry
                </button>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}