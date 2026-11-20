import React, { useMemo, useState } from 'react'
import {
  MapPin,
  CarFront,
  Zap,
  Accessibility,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Gauge,
  SlidersHorizontal
} from 'lucide-react'

export default function Allocation({ spaces = [] }) {
  const [rules, setRules] = useState({
    nearest: true,
    congestion: true,
    keepEV: true,
    basement: true,
    autoConfirm: false
  })

  const [selectedBay, setSelectedBay] = useState(null)
  const [confirmed, setConfirmed] = useState(false)

  const vehicle = {
    registration: 'UP14 BT 3302',
    type: 'Car',
    entered: '10:58 AM',
    preference: 'Wants the entrance side · No EV needed'
  }

  const availableSpaces = useMemo(() => {
    const available = spaces.filter(space => {
      const status = String(space.status || 'AVAILABLE').toUpperCase()
      return status === 'AVAILABLE' || status === 'FREE'
    })

    // Demo recommendations if the supplied space list is empty.
    const source = available.length
      ? available
      : [
          { id: 'B1-A1', status: 'AVAILABLE', floor: 'Basement 1' },
          { id: 'B2-A4', status: 'AVAILABLE', floor: 'Basement 2' }
        ]

    return source.map((space, index) => {
      const id = space.id || space.name || `Bay ${index + 1}`
      const floor =
        space.floor ||
        (String(id).startsWith('B2') ? 'Basement 2' : 'Basement 1')

      const distance = index === 0 ? 18 : 42 + index * 8
      const congestion = index === 0 ? 'Low congestion' : 'Moderate congestion'

      let score = 96 - index * 7

      if (!rules.nearest) score -= 3
      if (!rules.congestion) score -= 2
      if (!rules.basement) score -= 1

      return {
        ...space,
        id,
        floor,
        distance,
        congestion,
        score: Math.max(50, score)
      }
    }).sort((a, b) => b.score - a.score)
  }, [spaces, rules])

  const recommendations = availableSpaces.slice(0, 3)

  const reservedSpaces = spaces.filter(space =>
    String(space.status || '').toUpperCase() === 'RESERVED'
  )

  const chosenBay =
    selectedBay ||
    recommendations[0]?.id ||
    null

  function toggleRule(key) {
    setRules(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setConfirmed(false)
  }

  function confirmAllocation() {
    if (!chosenBay) return

    setSelectedBay(chosenBay)
    setConfirmed(true)
  }

  const Toggle = ({ checked, onClick }) => (
    <button
      type="button"
      className={`allocation-toggle ${checked ? 'active' : ''}`}
      onClick={onClick}
      aria-pressed={checked}
    >
      <span />
    </button>
  )

  return (
    <div className="allocation-page">
      <style>{`
        .allocation-page {
          width: 100%;
          color: #211735;
          font-family: 'DM Sans', Arial, sans-serif;
          padding: 4px 2px 30px;
        }

        .allocation-page * {
          box-sizing: border-box;
        }

        .allocation-page button {
          font-family: inherit;
        }

        .allocation-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          margin-bottom: 22px;
        }

        .allocation-eyebrow {
          color: #7042c6;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .allocation-heading h1 {
          font-family: Georgia, serif;
          font-size: clamp(27px, 3vw, 35px);
          margin: 0;
          font-weight: 700;
          letter-spacing: -1px;
        }

        .allocation-heading h1 span {
          color: #6630c9;
          font-style: italic;
        }

        .allocation-heading p {
          color: #888096;
          font-size: 12px;
          margin: 7px 0 0;
        }

        .allocation-staff {
          background: white;
          border: 1px solid #e9e3f2;
          border-radius: 30px;
          padding: 9px 15px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        .allocation-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 14px;
          align-items: start;
        }

        .allocation-left,
        .allocation-right {
          display: flex;
          flex-direction: column;
          gap: 13px;
          min-width: 0;
        }

        .allocation-card {
          background: white;
          border: 1px solid #e9e3f1;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 3px 12px rgba(48, 27, 78, .025);
        }

        .allocation-vehicle {
          background: linear-gradient(120deg, #6330c8, #4c1e9c);
          color: white;
          border-radius: 16px;
          padding: 21px;
          min-height: 132px;
        }

        .allocation-vehicle small {
          color: #e3d5ff;
          font-size: 10px;
        }

        .allocation-vehicle h2 {
          font-family: Georgia, serif;
          font-size: clamp(25px, 3vw, 34px);
          margin: 8px 0;
          letter-spacing: 1px;
        }

        .allocation-vehicle p {
          font-size: 11px;
          color: #e4d9ff;
          margin: 0;
          line-height: 1.6;
        }

        .allocation-card h3 {
          font-family: Georgia, serif;
          font-size: 17px;
          margin: 0 0 15px;
        }

        .allocation-rule {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 11px 0;
          border-bottom: 1px solid #eeeaf3;
          font-size: 12px;
          color: #514761;
        }

        .allocation-rule:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .allocation-toggle {
          width: 35px;
          height: 20px;
          border: 0;
          border-radius: 20px;
          background: #ded9e7;
          padding: 3px;
          cursor: pointer;
          flex-shrink: 0;
          transition: .2s;
        }

        .allocation-toggle span {
          width: 14px;
          height: 14px;
          display: block;
          border-radius: 50%;
          background: white;
          transition: .2s;
        }

        .allocation-toggle.active {
          background: #6530c8;
        }

        .allocation-toggle.active span {
          transform: translateX(15px);
        }

        .allocation-scoring {
          padding: 18px;
        }

        .allocation-score-row {
          margin-top: 16px;
        }

        .allocation-score-label {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 10px;
          color: #766c84;
          margin-bottom: 7px;
        }

        .allocation-score-track {
          height: 6px;
          background: #eee8fa;
          border-radius: 20px;
          overflow: hidden;
        }

        .allocation-score-fill {
          height: 100%;
          background: #6530c8;
          border-radius: 20px;
        }

        .allocation-recommendation {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border: 1px solid #e9e3f1;
          border-radius: 13px;
          margin-bottom: 9px;
          cursor: pointer;
          transition: .2s;
        }

        .allocation-recommendation:hover {
          border-color: #a98ae3;
        }

        .allocation-recommendation.selected {
          border: 2px solid #7950ca;
          background: #f2edff;
          padding: 11px;
        }

        .allocation-score-circle {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border: 4px solid #e5dcf8;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #6030bd;
          font-family: Georgia, serif;
          font-weight: 700;
          font-size: 14px;
        }

        .allocation-rec-info {
          flex: 1;
          min-width: 0;
        }

        .allocation-rec-info strong {
          display: block;
          font-size: 11px;
          color: #332545;
          margin-bottom: 5px;
        }

        .allocation-rec-info p {
          color: #8c8398;
          font-size: 9px;
          line-height: 1.5;
          margin: 0;
        }

        .allocation-rec-badge {
          background: #dff5e9;
          color: #278352;
          border-radius: 20px;
          padding: 6px 9px;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .allocation-use {
          border: 1px solid #ded7e8;
          border-radius: 20px;
          background: white;
          padding: 7px 11px;
          color: #59476e;
          font-size: 9px;
          font-weight: 700;
          cursor: pointer;
        }

        .allocation-confirm {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 9px;
          background: #55219f;
          color: white;
          border: 0;
          border-radius: 25px;
          padding: 13px;
          margin-top: 10px;
          font-size: 11px;
          font-weight: 800;
          cursor: pointer;
          transition: .2s;
        }

        .allocation-confirm:hover {
          background: #7139cb;
        }

        .allocation-confirm:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .allocation-success {
          margin-top: 12px;
          background: #e8f8ef;
          border: 1px solid #c8ead6;
          color: #26764a;
          border-radius: 10px;
          padding: 11px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }

        .allocation-empty {
          color: #91879e;
          font-size: 12px;
          padding: 15px 5px;
          text-align: center;
        }

        @media(max-width:900px) {
          .allocation-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width:550px) {
          .allocation-heading {
            flex-direction: column;
          }

          .allocation-card {
            padding: 14px;
          }

          .allocation-recommendation {
            gap: 8px;
          }

          .allocation-rec-badge {
            display: none;
          }
        }
      `}</style>

      <div className="allocation-heading">
        <div>
          <div className="allocation-eyebrow">
            SMART ALLOCATION · ACTIVE
          </div>

          <h1>
            Finding the <span>right spot</span>
          </h1>

          <p>
            The engine weighs distance, congestion and your preferences.
          </p>
        </div>

        <div className="allocation-staff">
          SF · Staff STF-2041
        </div>
      </div>

      <div className="allocation-grid">

        {/* LEFT COLUMN */}
        <div className="allocation-left">

          <section className="allocation-vehicle">
            <small>Registration number</small>
            <h2>{vehicle.registration}</h2>
            <p>
              {vehicle.type} · Entered {vehicle.entered} · {vehicle.preference}
            </p>
          </section>

          <section className="allocation-card">
            <h3>Rules</h3>

            <div className="allocation-rule">
              <span>Nearest to entrance</span>
              <Toggle
                checked={rules.nearest}
                onClick={() => toggleRule('nearest')}
              />
            </div>

            <div className="allocation-rule">
              <span>Avoid crowded floors</span>
              <Toggle
                checked={rules.congestion}
                onClick={() => toggleRule('congestion')}
              />
            </div>

            <div className="allocation-rule">
              <span>Keep EV bays free</span>
              <Toggle
                checked={rules.keepEV}
                onClick={() => toggleRule('keepEV')}
              />
            </div>

            <div className="allocation-rule">
              <span>Prefer Basement 1</span>
              <Toggle
                checked={rules.basement}
                onClick={() => toggleRule('basement')}
              />
            </div>

            <div className="allocation-rule">
              <span>Auto-confirm best match</span>
              <Toggle
                checked={rules.autoConfirm}
                onClick={() => toggleRule('autoConfirm')}
              />
            </div>
          </section>

          <section className="allocation-card allocation-scoring">
            <h3>How scoring works</h3>

            {[
              ['Distance to entrance', 40],
              ['Floor congestion', 30],
              ['Driver preferences', 20],
              ['Bay availability', 10]
            ].map(([label, value]) => (
              <div className="allocation-score-row" key={label}>
                <div className="allocation-score-label">
                  <span>{label} · {value}%</span>
                </div>

                <div className="allocation-score-track">
                  <div
                    className="allocation-score-fill"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="allocation-right">

          <section className="allocation-card">
            <h3>Ranked recommendations</h3>

            {recommendations.length === 0 ? (
              <div className="allocation-empty">
                No available parking bays found.
              </div>
            ) : (
              recommendations.map((bay, index) => (
                <div
                  key={bay.id}
                  className={`allocation-recommendation ${
                    chosenBay === bay.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedBay(bay.id)
                    setConfirmed(false)
                  }}
                >
                  <div className="allocation-score-circle">
                    {bay.score}
                  </div>

                  <div className="allocation-rec-info">
                    <strong>
                      {bay.id} · {bay.floor}
                    </strong>

                    <p>
                      {bay.distance} m from entrance · {bay.congestion} · free now
                    </p>
                  </div>

                  {index === 0 ? (
                    <span className="allocation-rec-badge">
                      Best match
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="allocation-use"
                      onClick={e => {
                        e.stopPropagation()
                        setSelectedBay(bay.id)
                        setConfirmed(false)
                      }}
                    >
                      Use this
                    </button>
                  )}
                </div>
              ))
            )}

            <button
              className="allocation-confirm"
              type="button"
              disabled={!chosenBay}
              onClick={confirmAllocation}
            >
              Confirm {chosenBay || 'allocation'} for {vehicle.registration}
              <ArrowRight size={16} />
            </button>

            {confirmed && (
              <div className="allocation-success">
                <CheckCircle2 size={18} />
                {chosenBay} selected successfully in this frontend demo.
              </div>
            )}
          </section>

          <section className="allocation-card">
            <h3>Allocation overview</h3>

            <div className="allocation-rule">
              <span>
                <MapPin size={14} style={{ verticalAlign: 'middle' }} />
                {' '}Available bays
              </span>
              <strong>{availableSpaces.length}</strong>
            </div>

            <div className="allocation-rule">
              <span>
                <Clock3 size={14} style={{ verticalAlign: 'middle' }} />
                {' '}Reserved bays
              </span>
              <strong>{reservedSpaces.length}</strong>
            </div>

            <div className="allocation-rule">
              <span>
                <Gauge size={14} style={{ verticalAlign: 'middle' }} />
                {' '}Selected recommendation
              </span>
              <strong>{chosenBay || 'None'}</strong>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}