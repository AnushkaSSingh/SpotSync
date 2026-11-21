
import React, { useEffect, useMemo, useState } from 'react'
import {
  CheckCircle2,
  MapPin,
  RefreshCw,
  Navigation,
} from 'lucide-react'
import { api } from '../services/api'

const initialRules = [
  { id: 'entrance', label: 'Nearest to entrance', enabled: true },
  { id: 'crowd', label: 'Avoid crowded floors', enabled: true },
  { id: 'ev', label: 'Keep EV bays free', enabled: true },
  { id: 'basement', label: 'Prefer Basement 1', enabled: true },
  { id: 'auto', label: 'Auto-confirm best match', enabled: false },
]

export default function Allocation() {
  const [lots, setLots] = useState([])
  const [lotId, setLotId] = useState('')
  const [slots, setSlots] = useState([])

  const [vehicle, setVehicle] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [rules, setRules] = useState(initialRules)

  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [error, setError] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  useEffect(() => {
    loadLots()
  }, [])

  useEffect(() => {
    if (lotId) {
      loadSlots(lotId)
    } else {
      setSlots([])
    }
  }, [lotId])

  async function loadLots() {
    setLoading(true)
    setError('')

    try {
      const response = await api.parking.overview()
      const data = response?.parking_lots || []

      setLots(data)

      if (data.length > 0) {
        setLotId(String(data[0].id))
      } else {
        setLotId('')
        setSlots([])
      }
    } catch (err) {
      setError(err.message || 'Unable to load parking facilities.')
    } finally {
      setLoading(false)
    }
  }

  async function loadSlots(id) {
    setLoadingSlots(true)
    setError('')
    setSelectedSlot(null)
    setConfirmed(false)

    try {
      const response = await api.parking.slots({
        parkingLotId: id,
        availableOnly: true,
      })

      setSlots(response?.slots || [])
    } catch (err) {
      setSlots([])
      setError(err.message || 'Unable to load available parking bays.')
    } finally {
      setLoadingSlots(false)
    }
  }

  function toggleRule(id) {
    setRules(previous =>
      previous.map(rule =>
        rule.id === id
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    )
  }

  function ruleEnabled(id) {
    return rules.find(rule => rule.id === id)?.enabled ?? false
  }

  function selectSlot(slot) {
    if (slot.is_available !== true) return

    setSelectedSlot(slot)
    setConfirmed(false)
  }

  const selectedLot = lots.find(
    lot => String(lot.id) === lotId
  )

  const availableSlots = useMemo(
    () => slots.filter(slot => slot.is_available === true),
    [slots]
  )

  const displayedSlots = useMemo(() => {
    function scoreSlot(slot) {
      let score = 0

      const bay = String(
        slot.display_code || slot.slot_number || ''
      ).toUpperCase()

      const type = String(
        slot.slot_type || ''
      ).toUpperCase()

      if (ruleEnabled('basement') && bay.startsWith('B1')) {
        score += 30
      }

      if (
        ruleEnabled('ev') &&
        vehicleType !== 'EV' &&
        type.includes('EV')
      ) {
        score -= 100
      }

      if (vehicleType === 'EV' && type.includes('EV')) {
        score += 40
      }

      if (ruleEnabled('entrance')) {
        const distance = Number(slot.distance_from_entrance)

        if (Number.isFinite(distance) && distance >= 0) {
          score -= distance
        }
      }

      if (ruleEnabled('crowd')) {
        const occupancy = Number(slot.floor_occupancy)

        if (Number.isFinite(occupancy)) {
          score -= occupancy
        }
      }

      return score
    }

    return [...availableSlots].sort((a, b) => {
      const difference = scoreSlot(b) - scoreSlot(a)

      if (difference !== 0) return difference

      return String(a.slot_number || a.id).localeCompare(
        String(b.slot_number || b.id),
        undefined,
        { numeric: true }
      )
    })
  }, [availableSlots, rules, vehicleType])

  useEffect(() => {
    if (
      ruleEnabled('auto') &&
      displayedSlots.length > 0 &&
      !loadingSlots
    ) {
      setSelectedSlot(displayedSlots[0])
      setConfirmed(true)
    }
  }, [displayedSlots, loadingSlots, rules])

  function bayName(slot) {
    return slot.display_code || slot.slot_number || `Bay ${slot.id}`
  }

  function floorName(slot) {
    const name = bayName(slot).toUpperCase()

    if (name.startsWith('B1')) return 'Basement 1'
    if (name.startsWith('B2')) return 'Basement 2'

    return 'Floor information unavailable'
  }

  return (
    <div className="allocation-pdf">
      <div className="allocation-pdf-heading">
        <div>
          <div className="allocation-pdf-eyebrow">
            SMART ALLOCATION · ACTIVE
          </div>

          <h1>
            Finding the <em>right spot</em>
          </h1>

          <p>
            Select an available parking bay using live parking data.
          </p>
        </div>

        <span className="allocation-staff-chip">
          SF · Staff STF-2041
        </span>
      </div>

      {error && (
        <div className="allocation-alert" role="alert">
          {error}
        </div>
      )}

      <div className="allocation-pdf-grid">
        <div className="allocation-pdf-left">
          <section className="allocation-vehicle-card">
            <span>Registration number</span>

            <input
              value={vehicle}
              onChange={event => setVehicle(event.target.value.toUpperCase())}
              aria-label="Vehicle registration number"
              placeholder="Enter vehicle registration"
            />

            <div className="allocation-vehicle-type">
              <select
                value={vehicleType}
                onChange={event => {
                  setVehicleType(event.target.value)
                  setSelectedSlot(null)
                  setConfirmed(false)
                }}
                aria-label="Vehicle type"
              >
                <option>Car</option>
                <option>SUV</option>
                <option>EV</option>
                <option>Motorcycle</option>
              </select>

              <span>· Parking allocation preferences</span>
            </div>
          </section>

          <section className="allocation-pdf-card">
            <h2>Rules</h2>

            <div className="allocation-rules">
              {rules.map(rule => (
                <div className="allocation-rule" key={rule.id}>
                  <span>{rule.label}</span>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={rule.enabled}
                    aria-label={rule.label}
                    className={`allocation-switch ${rule.enabled ? 'on' : ''}`}
                    onClick={() => toggleRule(rule.id)}
                  >
                    <i />
                  </button>
                </div>
              ))}
            </div>

            <p className="allocation-pdf-footnote">
              Allocation preferences rank the available bays using
              the information supplied by the parking API.
              Preferences without corresponding API data are not
              used in the ranking.
            </p>
          </section>

          <section className="allocation-pdf-card allocation-scoring">
            <h2>Live parking information</h2>

            <div className="allocation-score-row">
              <div>
                <span>Total bays</span>
                <b>{selectedLot?.total_slots ?? '—'}</b>
              </div>
              <i>
                <span style={{ width: '100%' }} />
              </i>
            </div>

            <div className="allocation-score-row">
              <div>
                <span>Occupied bays</span>
                <b>{selectedLot?.occupied_slots ?? '—'}</b>
              </div>
              <i>
                <span style={{ width: '75%' }} />
              </i>
            </div>

            <div className="allocation-score-row">
              <div>
                <span>Available bays</span>
                <b>{selectedLot?.available_slots ?? '—'}</b>
              </div>
              <i>
                <span style={{ width: '50%' }} />
              </i>
            </div>

            <p className="allocation-pdf-footnote">
              Counts are supplied by the parking overview API.
              Available bays are loaded separately.
            </p>
          </section>
        </div>

        <div className="allocation-pdf-right">
          <section className="allocation-pdf-card allocation-recommendations">
            <div className="allocation-card-title">
              <h2>Recommended parking bays</h2>

              <button
                type="button"
                className="allocation-refresh-button"
                onClick={() => lotId && loadSlots(lotId)}
                disabled={!lotId || loadingSlots}
                title="Refresh available bays"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <label className="allocation-lot-select">
              <MapPin size={15} />

              <select
                value={lotId}
                onChange={event => setLotId(event.target.value)}
                disabled={loading || lots.length === 0}
                aria-label="Select parking facility"
              >
                {lots.map(lot => (
                  <option key={lot.id} value={String(lot.id)}>
                    {lot.name || `Parking lot ${lot.id}`}
                  </option>
                ))}
              </select>
            </label>

            {selectedLot && (
              <p className="allocation-lot-address">
                {selectedLot.address || 'Parking facility'}
                {' · '}
                {selectedLot.available_slots ?? '—'} available
              </p>
            )}

            {loading || loadingSlots ? (
              <div className="allocation-empty">
                Loading live parking availability...
              </div>
            ) : displayedSlots.length === 0 ? (
              <div className="allocation-empty">
                No available bays were returned for this facility.
              </div>
            ) : (
              <div className="allocation-recommendation-list">
                {displayedSlots.map((slot, index) => {
                  const active = selectedSlot?.id === slot.id

                  return (
                    <button
                      type="button"
                      key={slot.id}
                      className={`allocation-recommendation ${active ? 'selected' : ''}`}
                      onClick={() => selectSlot(slot)}
                    >
                      <span className="allocation-score-circle">
                        {index + 1}
                      </span>

                      <span className="allocation-rec-info">
                        <b>
                          {bayName(slot)}
                          {' · '}
                          {floorName(slot)}
                        </b>

                        <small>
                          {slot.slot_type || 'Parking bay'} · Available
                        </small>
                      </span>

                      <span className={`allocation-rec-action ${active ? 'active' : ''}`}>
                        {active ? 'Selected' : 'Select bay'}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            <button
              type="button"
              className="allocation-confirm-button"
              disabled={!selectedSlot || loadingSlots}
              onClick={() => setConfirmed(true)}
            >
              {selectedSlot
                ? `Confirm selection: ${bayName(selectedSlot)}`
                : 'Select an available bay'}
            </button>

            {confirmed && selectedSlot && (
              <div className="allocation-local-confirmation">
                <CheckCircle2 size={16} />

                Recommended bay selected: {bayName(selectedSlot)}.
                This is a local selection, not a completed reservation
                or parking session.
              </div>
            )}
          </section>

          {selectedSlot && (
            <section className="allocation-pdf-card allocation-route-card">
              <h2>
                <Navigation size={17} />
                Selected bay details
              </h2>

              <b>{bayName(selectedSlot)}</b>

              <p>
                Parking lot: {selectedLot?.name || lotId}
              </p>

              <p>
                Bay type: {selectedSlot.slot_type || 'Not specified'}
              </p>

              <p>
                Bay ID: {selectedSlot.id}
              </p>

              <p className="allocation-pdf-footnote">
                The selected bay can be passed to the entry or
                reservation workflow. This screen does not create
                a parking session or booking by itself.
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
