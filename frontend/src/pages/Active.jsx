import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  CarFront,
  Clock3,
  Search,
  RefreshCw,
  ChevronRight
} from 'lucide-react'

import {
  PageTitle,
  Card,
  Status,
  Table,
  Button
} from '../components/Shared'

import { api } from '../services/api'

function getDuration(startedAt) {
  if (!startedAt) return '—'

  const start = new Date(startedAt).getTime()

  if (Number.isNaN(start)) return '—'

  const minutes = Math.max(0, Math.floor((Date.now() - start) / 60000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${String(hours).padStart(2, '0')}h ${String(
    remainingMinutes
  ).padStart(2, '0')}m`
}

function getFloor(session) {
  if (session.floor) return String(session.floor)
  if (session.floor_name) return String(session.floor_name)

  const match = String(session.bay || '').match(/^(B\d+|GF|G|L\d+)/i)
  return match ? match[1].toUpperCase() : 'Unknown'
}

function getItems(response, key) {
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.[key])) return response[key]
  return []
}

export default function Active({ sessions = [], go }) {
  const [liveSessions, setLiveSessions] = useState(sessions)
  const [search, setSearch] = useState('')
  const [floorFilter, setFloorFilter] = useState('ALL')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedId, setSelectedId] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshError, setRefreshError] = useState('')

  useEffect(() => {
    setLiveSessions(sessions)
  }, [sessions])

  const refreshSessions = useCallback(async () => {
    setRefreshing(true)
    setRefreshError('')

    try {
      const [sessionResponse, vehicleResponse, slotResponse] =
        await Promise.all([
          api.sessions.list(),
          api.vehicles.list(),
          api.parking.slots({ availableOnly: false })
        ])

      const vehicleMap = new Map(
        getItems(vehicleResponse, 'vehicles').map(vehicle => [
          String(vehicle.id),
          vehicle
        ])
      )

      const slotMap = new Map(
        getItems(slotResponse, 'slots').map(slot => [
          String(slot.id),
          slot
        ])
      )

      const records = getItems(sessionResponse, 'sessions')

      const mapped = records.map(session => {
        const vehicle = vehicleMap.get(String(session.vehicle_id))
        const slot = slotMap.get(String(session.parking_slot_id))

        return {
          sessionId: session.id,
          ticket: `SESSION-${session.id}`,
          vehicle:
            vehicle?.vehicle_number ||
            vehicle?.registration_number ||
            'Vehicle unavailable',
          bay:
            slot?.display_code ||
            slot?.slot_number ||
            `Bay ${session.parking_slot_id}`,
          floor: slot?.floor || slot?.floor_name || '',
          entry: session.started_at
            ? new Date(session.started_at).toLocaleString('en-IN')
            : '—',
          startedAt: session.started_at,
          endedAt: session.ended_at,
          status: session.status,
          customer: session.customer_name || 'Registered customer',
          vehicleType: vehicle?.vehicle_type || 'Vehicle',
          parkingSlotId: session.parking_slot_id,
          vehicleId: session.vehicle_id
        }
      })

      setLiveSessions(mapped)
      setLastUpdated(new Date())
    } catch (error) {
      setRefreshError(
        error.message || 'Unable to refresh active parking sessions.'
      )
    } finally {
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    refreshSessions()

    const interval = window.setInterval(refreshSessions, 30000)

    return () => window.clearInterval(interval)
  }, [refreshSessions])

  const activeSessions = useMemo(
    () =>
      liveSessions.filter(
        session => String(session.status).toUpperCase() === 'ACTIVE'
      ),
    [liveSessions]
  )

  const floorOptions = useMemo(
    () => [...new Set(activeSessions.map(getFloor))].sort(),
    [activeSessions]
  )

  const rows = useMemo(() => {
    const query = search.trim().toLowerCase()

    const result = activeSessions.filter(session => {
      const searchable = [
        session.vehicle,
        session.ticket,
        session.bay,
        session.customer,
        session.vehicleType
      ].join(' ').toLowerCase()

      if (query && !searchable.includes(query)) return false

      if (
        floorFilter !== 'ALL' &&
        getFloor(session) !== floorFilter
      ) {
        return false
      }

      return true
    })

    result.sort((a, b) => {
      const aTime = new Date(a.startedAt || 0).getTime()
      const bTime = new Date(b.startedAt || 0).getTime()

      return sortBy === 'oldest'
        ? aTime - bTime
        : bTime - aTime
    })

    return result
  }, [activeSessions, search, floorFilter, sortBy])

  const current =
    rows.find(session => String(session.sessionId) === String(selectedId)) ||
    rows[0] ||
    null

  return (
    <>
      <PageTitle
        title="Active parking"
        subtitle="Monitor vehicles currently registered in the parking facility."
        action={
          <Button
            variant="outline"
            icon={RefreshCw}
            onClick={refreshSessions}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh sessions'}
          </Button>
        }
      />

      {refreshError && (
        <div style={noticeStyle}>
          Live refresh failed: {refreshError}
          <span>
            Showing the latest session data already available in this page.
          </span>
        </div>
      )}

      <div style={metaStyle}>
        <span>
          {lastUpdated
            ? `Last updated: ${lastUpdated.toLocaleTimeString('en-IN')}`
            : 'Waiting for session data'}
        </span>
        <span>Automatic refresh every 30 seconds</span>
      </div>

      <div className="active-grid">
        <Card
          title="Active vehicle sessions"
          subtitle={`${rows.length} matching sessions · ${activeSessions.length} active in total`}
        >
          <div className="search-box full">
            <Search />
            <input
              placeholder="Search registration, ticket, bay or customer"
              value={search}
              onChange={event => setSearch(event.target.value)}
            />
          </div>

          <div style={filtersStyle}>
            <label>
              Floor
              <select
                value={floorFilter}
                onChange={event => setFloorFilter(event.target.value)}
              >
                <option value="ALL">All floors</option>
                {floorOptions.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </label>

            <label>
              Sort by entry
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
          </div>

          <Table headers={['TICKET', 'VEHICLE', 'BAY', 'ENTRY', 'STATUS', 'DETAILS']}>
            {rows.map(session => (
              <tr
                key={session.sessionId}
                className={
                  String(selectedId) === String(session.sessionId)
                    ? 'row-selected'
                    : ''
                }
              >
                <td><b>{session.ticket}</b></td>
                <td>{session.vehicle}</td>
                <td>{session.bay}</td>
                <td>{session.entry || '—'}</td>
                <td><Status value={session.status} /></td>
                <td>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => setSelectedId(session.sessionId)}
                  >
                    View <ChevronRight size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </Table>

          {rows.length === 0 && (
            <div className="empty-state">
              <b>No active sessions found</b>
              <span>
                {search || floorFilter !== 'ALL'
                  ? 'Try changing your search or floor filter.'
                  : 'New vehicle entries will appear here when returned by the backend.'}
              </span>
            </div>
          )}
        </Card>

        <Card
          title="Session details"
          subtitle="Selected active vehicle"
        >
          {current ? (
            <>
              <div className="session-focus">
                <div className="vehicle-circle">
                  <CarFront size={29} />
                </div>

                <h2>{current.vehicle || 'Unknown vehicle'}</h2>
                <Status value={current.status} />
              </div>

              <div className="detail-rows">
                <div>
                  <span>Ticket</span>
                  <b>{current.ticket}</b>
                </div>

                <div>
                  <span>Session ID</span>
                  <b>{current.sessionId}</b>
                </div>

                <div>
                  <span>Vehicle type</span>
                  <b>{current.vehicleType || '—'}</b>
                </div>

                <div>
                  <span>Parking bay</span>
                  <b>{current.bay || '—'}</b>
                </div>

                <div>
                  <span>Floor</span>
                  <b>{getFloor(current)}</b>
                </div>

                <div>
                  <span>Customer</span>
                  <b>{current.customer || '—'}</b>
                </div>

                <div>
                  <span>Entry time</span>
                  <b>{current.entry || '—'}</b>
                </div>
              </div>

              <div className="duration-box">
                <Clock3 />
                <span>Session duration</span>
                <b>{getDuration(current.startedAt)}</b>
                <small>Calculated from the recorded entry time</small>
              </div>

              <Button onClick={() => go('/exit')}>
                Open exit management
              </Button>
            </>
          ) : (
            <div className="empty-state">
              <b>No active session selected</b>
              <span>Active vehicle details will appear here.</span>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

const filtersStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
  margin: '14px 0'
}

const noticeStyle = {
  padding: 14,
  marginBottom: 14,
  borderRadius: 10,
  background: 'rgba(220, 150, 50, 0.12)',
  display: 'grid',
  gap: 5,
  fontSize: 13
}

const metaStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
  marginBottom: 12,
  fontSize: 12,
  opacity: 0.75
}
