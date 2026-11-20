import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Clock3,
  RefreshCw,
  Search,
  XCircle
} from 'lucide-react'
import {
  api
} from '../services/api'
import {
  PageTitle,
  Card,
  Button,
  Status,
  EmptyState
} from '../components/Shared'

function getItems(response, keys = []) {
  if (Array.isArray(response)) return response

  for (const key of keys) {
    if (Array.isArray(response?.[key])) {
      return response[key]
    }
  }

  return []
}

function getBookingId(booking) {
  return booking.id ?? booking.booking_id ?? booking.reservation_id
}

function getVehicleLabel(vehicle) {
  return (
    vehicle.vehicle_number ||
    vehicle.registration_number ||
    vehicle.plate_number ||
    `Vehicle ${vehicle.id}`
  )
}

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  })
}

function toLocalDateTimeValue(date) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset)
    .toISOString()
    .slice(0, 16)
}

function getBookingStatus(booking) {
  return String(
    booking.status ||
    booking.booking_status ||
    booking.reservation_status ||
    'UNKNOWN'
  ).toUpperCase()
}

export default function Reservations() {
  const [bookings, setBookings] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [slots, setSlots] = useState([])

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [cancellingId, setCancellingId] = useState(null)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const [form, setForm] = useState({
    vehicle_id: '',
    parking_slot_id: '',
    start_time: toLocalDateTimeValue(
      new Date(Date.now() + 60 * 60 * 1000)
    ),
    end_time: toLocalDateTimeValue(
      new Date(Date.now() + 3 * 60 * 60 * 1000)
    )
  })

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const results = await Promise.allSettled([
        api.bookings.list(),
        api.vehicles.list(),
        api.parking.slots({ availableOnly: false })
      ])

      const bookingResult = results[0]
      const vehicleResult = results[1]
      const slotResult = results[2]

      if (bookingResult.status === 'fulfilled') {
        setBookings(
          getItems(bookingResult.value, [
            'bookings',
            'reservations',
            'items'
          ])
        )
      } else {
        setBookings([])
        setError(
          `Unable to load reservations: ${bookingResult.reason?.message || 'Backend request failed'}`
        )
      }

      if (vehicleResult.status === 'fulfilled') {
        setVehicles(
          getItems(vehicleResult.value, [
            'vehicles',
            'items'
          ])
        )
      }

      if (slotResult.status === 'fulfilled') {
        setSlots(
          getItems(slotResult.value, [
            'slots',
            'parking_slots',
            'items'
          ])
        )
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const availableSlots = useMemo(() => {
    return slots.filter(slot => {
      const status = String(slot.status || '').toUpperCase()

      return (
        slot.is_available !== false &&
        status !== 'OCCUPIED' &&
        status !== 'RESERVED'
      )
    })
  }, [slots])

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase()

    return bookings.filter(booking => {
      const id = String(getBookingId(booking) ?? '')
      const vehicle =
        booking.vehicle_number ||
        booking.registration_number ||
        booking.vehicle?.vehicle_number ||
        ''

      const slot =
        booking.slot_number ||
        booking.display_code ||
        booking.parking_slot_id ||
        ''

      const matchesSearch =
        !query ||
        id.toLowerCase().includes(query) ||
        String(vehicle).toLowerCase().includes(query) ||
        String(slot).toLowerCase().includes(query)

      const status = getBookingStatus(booking)

      const matchesStatus =
        statusFilter === 'ALL' ||
        status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  const counts = useMemo(() => {
    return {
      total: bookings.length,
      active: bookings.filter(booking =>
        ['CONFIRMED', 'ACTIVE', 'PENDING'].includes(
          getBookingStatus(booking)
        )
      ).length,
      completed: bookings.filter(booking =>
        getBookingStatus(booking) === 'COMPLETED'
      ).length,
      cancelled: bookings.filter(booking =>
        ['CANCELLED', 'EXPIRED'].includes(
          getBookingStatus(booking)
        )
      ).length
    }
  }, [bookings])

  function updateForm(event) {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  async function createReservation(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!form.vehicle_id || !form.parking_slot_id) {
      setError('Select a vehicle and parking space.')
      return
    }

    const start = new Date(form.start_time)
    const end = new Date(form.end_time)

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end <= start
    ) {
      setError('Please select a valid end time after the start time.')
      return
    }

    setSubmitting(true)

    try {
      await api.bookings.create({
        vehicle_id: Number(form.vehicle_id),
        parking_slot_id: Number(form.parking_slot_id),
        start_time: start.toISOString(),
        end_time: end.toISOString()
      })

      setSuccess('Reservation created successfully.')
      await loadData()
    } catch (requestError) {
      setError(
        requestError.message || 'Unable to create the reservation.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function cancelReservation(booking) {
    const bookingId = getBookingId(booking)

    if (!bookingId) {
      setError('This reservation does not have a valid booking ID.')
      return
    }

    const status = getBookingStatus(booking)

    if (['CANCELLED', 'COMPLETED', 'EXPIRED'].includes(status)) {
      setError('This reservation can no longer be cancelled.')
      return
    }

    setError('')
    setSuccess('')
    setCancellingId(bookingId)

    try {
      await api.bookings.cancel(bookingId)
      setSuccess(`Reservation ${bookingId} cancelled.`)
      await loadData()
    } catch (requestError) {
      setError(
        requestError.message || 'Unable to cancel this reservation.'
      )
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="reservations-page">
      <PageTitle
        title="Reservations"
        subtitle="Create, monitor and manage parking reservations."
        action={
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>
        }
      />

      {error && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 10,
            background: '#fff1f0',
            color: '#b42318'
          }}
        >
          {error}
        </div>
      )}

      {success && (
        <div
          role="status"
          style={{
            padding: '12px 16px',
            marginBottom: 16,
            borderRadius: 10,
            background: '#ecfdf3',
            color: '#067647'
          }}
        >
          {success}
        </div>
      )}

      <div
        className="stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 14,
          marginBottom: 22
        }}
      >
        {[
          ['Total reservations', counts.total],
          ['Active / pending', counts.active],
          ['Completed', counts.completed],
          ['Cancelled / expired', counts.cancelled]
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <span className="stat-icon violet">
                <CalendarDays size={18} />
              </span>
            </div>
            <strong>{value}</strong>
            <small>Backend reservation records</small>
          </div>
        ))}
      </div>

      <Card
        title="Create a reservation"
        subtitle="Choose a registered vehicle, parking space and reservation period."
      >
        <form onSubmit={createReservation}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: 16,
              padding: 18
            }}
          >
            <label className="form-field">
              <span>Vehicle</span>
              <select
                name="vehicle_id"
                value={form.vehicle_id}
                onChange={updateForm}
                required
                style={fieldStyle}
              >
                <option value="">Select vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {getVehicleLabel(vehicle)}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Parking space</span>
              <select
                name="parking_slot_id"
                value={form.parking_slot_id}
                onChange={updateForm}
                required
                style={fieldStyle}
              >
                <option value="">Select parking space</option>
                {availableSlots.map(slot => (
                  <option key={slot.id} value={slot.id}>
                    {slot.display_code ||
                      slot.slot_number ||
                      `Slot ${slot.id}`}
                    {slot.floor ? ` — ${slot.floor}` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="form-field">
              <span>Start time</span>
              <input
                type="datetime-local"
                name="start_time"
                value={form.start_time}
                onChange={updateForm}
                required
                style={fieldStyle}
              />
            </label>

            <label className="form-field">
              <span>End time</span>
              <input
                type="datetime-local"
                name="end_time"
                value={form.end_time}
                onChange={updateForm}
                min={form.start_time}
                required
                style={fieldStyle}
              />
            </label>
          </div>

          <div style={{ padding: '0 18px 18px' }}>
            <Button
              type="submit"
              icon={CalendarDays}
              disabled={
                submitting ||
                vehicles.length === 0 ||
                availableSlots.length === 0
              }
            >
              {submitting ? 'Creating reservation...' : 'Create reservation'}
            </Button>

            {vehicles.length === 0 && (
              <p style={hintStyle}>
                No registered vehicles are currently available.
              </p>
            )}

            {availableSlots.length === 0 && (
              <p style={hintStyle}>
                No available parking spaces were returned by the backend.
              </p>
            )}
          </div>
        </form>
      </Card>

      <div style={{ height: 20 }} />

      <Card
        title="Reservation records"
        subtitle="Search and manage reservations returned by the backend."
        action={
          <span style={{ color: '#64748b', fontSize: 13 }}>
            {filteredBookings.length} records
          </span>
        }
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 12,
            padding: 16
          }}
        >
          <div style={{ ...searchStyle, flex: '1 1 220px' }}>
            <Search size={17} />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search booking, vehicle or space..."
              style={searchInputStyle}
            />
          </div>

          <select
            value={statusFilter}
            onChange={event => setStatusFilter(event.target.value)}
            style={{ ...fieldStyle, width: 'auto', minWidth: 160 }}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        {loading ? (
          <div style={{ padding: 28, textAlign: 'center' }}>
            Loading reservations...
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="No reservations found"
            detail={
              bookings.length === 0
                ? 'Reservations will appear here when the backend returns booking records.'
                : 'Try changing your search or status filter.'
            }
          />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>Reservation</th>
                  <th style={cellStyle}>Vehicle</th>
                  <th style={cellStyle}>Parking space</th>
                  <th style={cellStyle}>Start time</th>
                  <th style={cellStyle}>End time</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => {
                  const id = getBookingId(booking)
                  const status = getBookingStatus(booking)
                  const canCancel = ![
                    'CANCELLED',
                    'COMPLETED',
                    'EXPIRED'
                  ].includes(status)

                  return (
                    <tr key={id}>
                      <td style={cellStyle}>
                        #{id ?? '—'}
                      </td>
                      <td style={cellStyle}>
                        {booking.vehicle_number ||
                          booking.registration_number ||
                          booking.vehicle?.vehicle_number ||
                          booking.vehicle_id ||
                          '—'}
                      </td>
                      <td style={cellStyle}>
                        {booking.display_code ||
                          booking.slot_number ||
                          booking.parking_slot_id ||
                          '—'}
                      </td>
                      <td style={cellStyle}>
                        {formatDate(
                          booking.start_time ||
                          booking.starts_at
                        )}
                      </td>
                      <td style={cellStyle}>
                        {formatDate(
                          booking.end_time ||
                          booking.expires_at
                        )}
                      </td>
                      <td style={cellStyle}>
                        <Status value={status} />
                      </td>
                      <td style={cellStyle}>
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() => cancelReservation(booking)}
                            disabled={cancellingId === id}
                            style={cancelButtonStyle}
                          >
                            <XCircle size={15} />
                            {cancellingId === id
                              ? 'Cancelling...'
                              : 'Cancel'}
                          </button>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

const fieldStyle = {
  display: 'block',
  width: '100%',
  minHeight: 42,
  padding: '9px 11px',
  border: '1px solid #dbe2ea',
  borderRadius: 8,
  background: '#fff',
  color: '#1e293b',
  font: 'inherit',
  marginTop: 7
}

const hintStyle = {
  color: '#64748b',
  fontSize: 13,
  marginTop: 10
}

const searchStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 9,
  padding: '0 12px',
  border: '1px solid #dbe2ea',
  borderRadius: 8,
  minHeight: 42,
  color: '#64748b'
}

const searchInputStyle = {
  border: 0,
  outline: 0,
  minWidth: 0,
  width: '100%',
  font: 'inherit'
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  textAlign: 'left',
  fontSize: 13
}

const cellStyle = {
  padding: '13px 14px',
  borderBottom: '1px solid #edf0f4',
  whiteSpace: 'nowrap'
}

const cancelButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  border: '1px solid #fecaca',
  borderRadius: 7,
  padding: '7px 9px',
  background: '#fff',
  color: '#b42318',
  cursor: 'pointer'
}