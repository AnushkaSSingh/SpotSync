import React, { useMemo, useState } from 'react'
import {
  CalendarDays,
  Download,
  Search,
  TrendingUp,
  Clock,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  X
} from 'lucide-react'

import {
  PageTitle,
  Card,
  StatCard,
  Status,
  Table,
  Button
} from '../components/Shared'

const PAGE_SIZE = 10

function formatDate(value) {
  if (!value) return '—'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleString('en-IN')
}

function getDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return null

  const start = new Date(startedAt).getTime()
  const end = new Date(endedAt).getTime()

  if (
    Number.isNaN(start) ||
    Number.isNaN(end) ||
    end < start
  ) {
    return null
  }

  return Math.floor((end - start) / 60000)
}

function formatDuration(minutes) {
  if (minutes === null || minutes === undefined) return '—'

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  return `${hours}h ${remainingMinutes}m`
}

function escapeCSV(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function getFloor(session) {
  if (session.floor) return String(session.floor)
  if (session.floorName) return String(session.floorName)
  if (session.floor_name) return String(session.floor_name)

  const bay = String(session.bay || '')
  const match = bay.match(/^(B\d+|GF|G|L\d+)/i)

  return match ? match[1].toUpperCase() : 'Unknown'
}

function getExitTime(session) {
  const value = session.endedAt || session.ended_at
  return value ? new Date(value).getTime() : 0
}

function getEntryTime(session) {
  const value = session.startedAt || session.started_at
  return value ? new Date(value).getTime() : 0
}

export default function History({ sessions = [] }) {
  const [search, setSearch] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState('')
  const [floorFilter, setFloorFilter] = useState('ALL')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortBy, setSortBy] = useState('exit-newest')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState(null)

  const completedSessions = useMemo(
    () =>
      sessions.filter(
        session =>
          String(session.status || '').toUpperCase() === 'COMPLETED'
      ),
    [sessions]
  )

  const floorOptions = useMemo(
    () =>
      [...new Set(completedSessions.map(getFloor))]
        .filter(Boolean)
        .sort(),
    [completedSessions]
  )

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase()
    const vehicleQuery = vehicleFilter.trim().toLowerCase()

    const startBoundary = fromDate
      ? new Date(`${fromDate}T00:00:00`).getTime()
      : null

    const endBoundary = toDate
      ? new Date(`${toDate}T23:59:59.999`).getTime()
      : null

    const result = completedSessions.filter(session => {
      const searchable = [
        session.ticket,
        session.sessionId,
        session.vehicle,
        session.bay,
        session.customer
      ].join(' ').toLowerCase()

      if (query && !searchable.includes(query)) return false

      if (
        vehicleQuery &&
        !String(session.vehicle || '').toLowerCase().includes(vehicleQuery)
      ) {
        return false
      }

      if (floorFilter !== 'ALL' && getFloor(session) !== floorFilter) {
        return false
      }

      const exitTime = getExitTime(session)

      if (startBoundary !== null && exitTime < startBoundary) {
        return false
      }

      if (endBoundary !== null && exitTime > endBoundary) {
        return false
      }

      return true
    })

    result.sort((a, b) => {
      if (sortBy === 'exit-oldest') return getExitTime(a) - getExitTime(b)
      if (sortBy === 'entry-newest') return getEntryTime(b) - getEntryTime(a)
      if (sortBy === 'entry-oldest') return getEntryTime(a) - getEntryTime(b)

      if (sortBy === 'duration-longest') {
        return (
          (getDuration(b.startedAt, b.endedAt) ?? -1) -
          (getDuration(a.startedAt, a.endedAt) ?? -1)
        )
      }

      if (sortBy === 'duration-shortest') {
        return (
          (getDuration(a.startedAt, a.endedAt) ?? Infinity) -
          (getDuration(b.startedAt, b.endedAt) ?? Infinity)
        )
      }

      return getExitTime(b) - getExitTime(a)
    })

    return result
  }, [
    completedSessions,
    search,
    vehicleFilter,
    floorFilter,
    fromDate,
    toDate,
    sortBy
  ])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSessions.length / PAGE_SIZE)
  )

  const currentPage = Math.min(page, totalPages)

  const visibleRows = filteredSessions.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const completedToday = completedSessions.filter(session => {
    const exit = session.endedAt || session.ended_at

    if (!exit) return false

    return new Date(exit).toDateString() === new Date().toDateString()
  }).length

  const durations = completedSessions
    .map(session =>
      getDuration(
        session.startedAt || session.started_at,
        session.endedAt || session.ended_at
      )
    )
    .filter(duration => duration !== null)

  const averageDuration = durations.length
    ? Math.round(
        durations.reduce((total, duration) => total + duration, 0) /
        durations.length
      )
    : null

  function resetFilters() {
    setSearch('')
    setVehicleFilter('')
    setFloorFilter('ALL')
    setFromDate('')
    setToDate('')
    setSortBy('exit-newest')
    setPage(1)
    setSelected(null)
  }

  function exportHistory() {
    if (!filteredSessions.length) return

    const headers = [
      'Ticket ID',
      'Session ID',
      'Vehicle',
      'Customer',
      'Parking Bay',
      'Floor',
      'Entry Time',
      'Exit Time',
      'Duration',
      'Status'
    ]

    const data = filteredSessions.map(session => [
      session.ticket,
      session.sessionId,
      session.vehicle,
      session.customer,
      session.bay,
      getFloor(session),
      formatDate(session.startedAt || session.started_at),
      formatDate(session.endedAt || session.ended_at),
      formatDuration(
        getDuration(
          session.startedAt || session.started_at,
          session.endedAt || session.ended_at
        )
      ),
      session.status
    ])

    const csv = [headers, ...data]
      .map(row => row.map(escapeCSV).join(','))
      .join('\n')

    const blob = new Blob(
      ['\uFEFF' + csv],
      { type: 'text/csv;charset=utf-8;' }
    )

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'spotsync-parking-history.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  function updateFilter(callback, value) {
    callback(value)
    setPage(1)
    setSelected(null)
  }

  return (
    <>
      <PageTitle
        title="Parking history"
        subtitle="Review, filter and export completed parking sessions."
        action={
          <Button
            variant="outline"
            icon={Download}
            onClick={exportHistory}
            disabled={filteredSessions.length === 0}
          >
            Export filtered report
          </Button>
        }
      />

      <div className="stats-grid compact-stats">
        <StatCard
          label="Completed sessions"
          value={completedSessions.length}
          change="All recorded completed sessions"
          icon={CalendarDays}
        />

        <StatCard
          label="Exits today"
          value={completedToday}
          change="Completed departures today"
          icon={TrendingUp}
          tone="green"
        />

        <StatCard
          label="Average duration"
          value={
            averageDuration !== null
              ? formatDuration(averageDuration)
              : '—'
          }
          change="Based on completed sessions"
          icon={Clock}
          tone="blue"
        />
      </div>

      <Card
        title="Session history"
        subtitle={`${filteredSessions.length} matching records out of ${completedSessions.length} completed sessions`}
      >
        <div style={filterPanelStyle}>
          <div className="search-box full">
            <Search />
            <input
              value={search}
              onChange={event =>
                updateFilter(setSearch, event.target.value)
              }
              placeholder="Search ticket, session, vehicle, customer or bay"
            />
          </div>

          <div style={filterGridStyle}>
            <label style={filterLabelStyle}>
              Vehicle registration
              <input
                value={vehicleFilter}
                onChange={event =>
                  updateFilter(setVehicleFilter, event.target.value)
                }
                placeholder="Filter vehicle"
                style={filterInputStyle}
              />
            </label>

            <label style={filterLabelStyle}>
              Floor
              <select
                value={floorFilter}
                onChange={event =>
                  updateFilter(setFloorFilter, event.target.value)
                }
                style={filterInputStyle}
              >
                <option value="ALL">All floors</option>
                {floorOptions.map(floor => (
                  <option key={floor} value={floor}>{floor}</option>
                ))}
              </select>
            </label>

            <label style={filterLabelStyle}>
              Exit date from
              <input
                type="date"
                value={fromDate}
                max={toDate || undefined}
                onChange={event =>
                  updateFilter(setFromDate, event.target.value)
                }
                style={filterInputStyle}
              />
            </label>

            <label style={filterLabelStyle}>
              Exit date to
              <input
                type="date"
                value={toDate}
                min={fromDate || undefined}
                onChange={event =>
                  updateFilter(setToDate, event.target.value)
                }
                style={filterInputStyle}
              />
            </label>

            <label style={filterLabelStyle}>
              Sort records
              <select
                value={sortBy}
                onChange={event =>
                  updateFilter(setSortBy, event.target.value)
                }
                style={filterInputStyle}
              >
                <option value="exit-newest">Exit: newest first</option>
                <option value="exit-oldest">Exit: oldest first</option>
                <option value="entry-newest">Entry: newest first</option>
                <option value="entry-oldest">Entry: oldest first</option>
                <option value="duration-longest">Longest duration</option>
                <option value="duration-shortest">Shortest duration</option>
              </select>
            </label>

            <div style={{ display: 'flex', alignItems: 'end' }}>
              <Button
                type="button"
                variant="outline"
                icon={X}
                onClick={resetFilters}
              >
                Clear filters
              </Button>
            </div>
          </div>
        </div>

        <Table
          headers={[
            'TICKET',
            'VEHICLE',
            'CUSTOMER',
            'BAY',
            'ENTRY',
            'EXIT',
            'DURATION',
            'STATUS',
            'DETAILS'
          ]}
        >
          {visibleRows.map(session => {
            const duration = getDuration(
              session.startedAt || session.started_at,
              session.endedAt || session.ended_at
            )

            return (
              <tr key={session.sessionId}>
                <td><b>{session.ticket || `SESSION-${session.sessionId}`}</b></td>
                <td>{session.vehicle || '—'}</td>
                <td>{session.customer || '—'}</td>
                <td>{session.bay || '—'}</td>
                <td>{formatDate(session.startedAt || session.started_at)}</td>
                <td>{formatDate(session.endedAt || session.ended_at)}</td>
                <td>{formatDuration(duration)}</td>
                <td><Status value={session.status} /></td>
                <td>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => setSelected(session)}
                  >
                    View
                  </button>
                </td>
              </tr>
            )
          })}
        </Table>

        {visibleRows.length === 0 && (
          <div className="empty-state">
            <b>
              {completedSessions.length === 0
                ? 'No completed parking sessions yet'
                : 'No matching parking records'}
            </b>
            <span>
              {completedSessions.length === 0
                ? 'Completed vehicle exits will appear here when returned by the backend.'
                : 'Try changing your search or filters.'}
            </span>
          </div>
        )}

        {filteredSessions.length > 0 && (
          <div style={paginationStyle}>
            <span>
              Showing {(currentPage - 1) * PAGE_SIZE + 1}–
              {Math.min(currentPage * PAGE_SIZE, filteredSessions.length)}
              {' '}of {filteredSessions.length}
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                type="button"
                className="table-action"
                disabled={currentPage <= 1}
                onClick={() => setPage(value => Math.max(1, value - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <b>{currentPage} / {totalPages}</b>

              <button
                type="button"
                className="table-action"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setPage(value => Math.min(totalPages, value + 1))
                }
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </Card>

      {selected && (
        <Card
          title="Parking session details"
          subtitle={`Session ${selected.sessionId}`}
          action={
            <button
              type="button"
              className="table-action"
              onClick={() => setSelected(null)}
            >
              <X size={16} /> Close
            </button>
          }
        >
          <div style={detailsGridStyle}>
            <Detail label="Ticket ID" value={selected.ticket} />
            <Detail label="Session ID" value={selected.sessionId} />
            <Detail label="Vehicle" value={selected.vehicle} />
            <Detail label="Customer" value={selected.customer} />
            <Detail label="Parking bay" value={selected.bay} />
            <Detail label="Floor" value={getFloor(selected)} />
            <Detail
              label="Entry time"
              value={formatDate(selected.startedAt || selected.started_at)}
            />
            <Detail
              label="Exit time"
              value={formatDate(selected.endedAt || selected.ended_at)}
            />
            <Detail
              label="Duration"
              value={formatDuration(
                getDuration(
                  selected.startedAt || selected.started_at,
                  selected.endedAt || selected.ended_at
                )
              )}
            />
            <Detail label="Status" value={selected.status} />
          </div>
        </Card>
      )}
    </>
  )
}

function Detail({ label, value }) {
  return (
    <div style={detailStyle}>
      <small>{label}</small>
      <b>{value || 'Not available'}</b>
    </div>
  )
}

const filterPanelStyle = {
  display: 'grid',
  gap: 16,
  marginBottom: 20
}

const filterGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
  gap: 14
}

const filterLabelStyle = {
  display: 'grid',
  gap: 7,
  fontSize: 12,
  fontWeight: 600
}

const filterInputStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  padding: '10px 12px',
  borderRadius: 9,
  border: '1px solid var(--border, #ded9e8)',
  background: 'var(--surface, #fff)',
  color: 'inherit',
  font: 'inherit'
}

const paginationStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 12,
  paddingTop: 18,
  marginTop: 12,
  borderTop: '1px solid var(--border, #ded9e8)',
  fontSize: 13
}

const detailsGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12
}

const detailStyle = {
  display: 'grid',
  gap: 7,
  padding: 14,
  borderRadius: 10,
  background: 'var(--surface-muted, rgba(120, 100, 160, 0.08))',
  minWidth: 0,
  overflowWrap: 'anywhere'
}
