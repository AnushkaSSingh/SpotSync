import React, { useMemo, useState } from 'react'
import { useStaffIncidents } from '../hooks/useStaffIncidents'

const priorityColors = {
  High: '#d04444',
  Medium: '#c18419',
  Low: '#16845b',
}

const statusColors = {
  Pending: '#c18419',
  Investigating: '#60449a',
  Resolved: '#16845b',
}

function formatPriority(value) {
  const severity = String(value || '').toLowerCase()
  if (severity === 'critical' || severity === 'high') return 'High'
  if (severity === 'medium' || severity === 'moderate') return 'Medium'
  return 'Low'
}

function formatStatus(value) {
  return String(value || '').toLowerCase() === 'resolved'
    ? 'Resolved'
    : 'Pending'
}

export default function Mismatches() {
  const {
    incidents,
    loading,
    error,
    refreshIncidents,
    resolveStaffIncident,
  } = useStaffIncidents()

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [actionError, setActionError] = useState('')
  const [resolving, setResolving] = useState(false)

  const items = useMemo(() => incidents.map(item => ({
    ...item,
    space: item.parkingLotId || 'Not provided',
    sensor: item.sensorId || 'Not assigned',
    priority: formatPriority(item.severity),
    status: formatStatus(item.status),
    type: item.type || 'Occupancy mismatch',
    expected: 'Not provided by API',
    detected: item.description || 'Not provided',
    time: 'Not provided by API',
  })), [incidents])

  const filtered = useMemo(() => items.filter(item => {
    const matchesStatus = filter === 'All' || item.status === filter
    const matchesSearch =
      `${item.id} ${item.space} ${item.sensor} ${item.type} ${item.detected}`
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchesStatus && matchesSearch
  }), [items, filter, search])

  const pending = items.filter(item => item.status === 'Pending').length
  const investigating = items.filter(item => item.status === 'Investigating').length
  const resolved = items.filter(item => item.status === 'Resolved').length

  const currentSelected = items.find(item => item.id === selected?.id)

  const cardStyle = {
    background: '#fff',
    border: '1px solid #ece8f2',
    borderRadius: 12,
    padding: 18,
    boxShadow: '0 2px 8px rgba(30,20,50,0.03)',
  }

  const buttonStyle = {
    border: 0,
    borderRadius: 7,
    padding: '9px 13px',
    cursor: 'pointer',
    fontWeight: 600,
  }

  async function handleResolve() {
    if (!currentSelected || resolving) return

    setResolving(true)
    setActionError('')

    try {
      await resolveStaffIncident(currentSelected.id)
      setSelected(null)
    } catch (err) {
      setActionError(err.message || 'Unable to resolve this incident.')
    } finally {
      setResolving(false)
    }
  }

  return (
    <div style={{ padding: 24, color: '#292238', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 15,
        marginBottom: 22,
      }}>
        <div>
          <h1 style={{ fontSize: 25, margin: 0 }}>Mismatch Management</h1>
          <p style={{ color: '#777184', marginTop: 7 }}>
            Review and manage parking occupancy discrepancies.
          </p>
        </div>

        <button
          onClick={refreshIncidents}
          disabled={loading}
          style={{ ...buttonStyle, background: '#f1edfa', color: '#60449a' }}
        >
          {loading ? 'Refreshing...' : 'Refresh incidents'}
        </button>
      </div>

      {error && (
        <div style={{
          ...cardStyle,
          marginBottom: 18,
          color: '#b42318',
          background: '#fff5f5',
        }}>
          <strong>Unable to load live incidents:</strong> {error}
          <button
            onClick={refreshIncidents}
            style={{ ...buttonStyle, marginLeft: 12, background: '#60449a', color: '#fff' }}
          >
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div style={{ ...cardStyle, marginBottom: 18, color: '#b42318' }}>
          {actionError}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: 14,
        marginBottom: 22,
      }}>
        {[
          ['Total Mismatches', items.length, '#60449a'],
          ['Pending', pending, '#c18419'],
          ['Investigating', investigating, '#60449a'],
          ['Resolved', resolved, '#16845b'],
        ].map(([label, value, color]) => (
          <div key={label} style={cardStyle}>
            <div style={{ color: '#777184', fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 8 }}>
              {loading ? '—' : value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search mismatch, space or sensor..."
            style={{
              flex: '1 1 240px',
              minWidth: 0,
              padding: 11,
              border: '1px solid #ddd7e8',
              borderRadius: 8,
            }}
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              padding: 11,
              border: '1px solid #ddd7e8',
              borderRadius: 8,
              background: '#fff',
              minWidth: 160,
            }}
          >
            {['All', 'Pending', 'Investigating', 'Resolved'].map(status => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <h2 style={{ fontSize: 17, margin: '0 0 16px' }}>Live Mismatch Records</h2>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 900,
          textAlign: 'left',
        }}>
          <thead>
            <tr style={{ background: '#f8f6fb', color: '#777184', fontSize: 12 }}>
              {['Mismatch ID', 'Parking Lot', 'Sensor', 'Expected', 'Description', 'Priority', 'Status', 'Action'].map(label => (
                <th key={label} style={{ padding: 13 }}>{label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="8" style={{ padding: 25, textAlign: 'center', color: '#777184' }}>
                  Loading incidents from SpotSync server...
                </td>
              </tr>
            )}

            {!loading && filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eeeaf3', fontSize: 13 }}>
                <td style={{ padding: 14, fontWeight: 700 }}>{item.id}</td>
                <td style={{ padding: 14 }}>{item.space}</td>
                <td style={{ padding: 14 }}>{item.sensor}</td>
                <td style={{ padding: 14 }}>{item.expected}</td>
                <td style={{ padding: 14 }}>{item.detected}</td>
                <td style={{ padding: 14 }}>
                  <span style={{
                    color: priorityColors[item.priority],
                    background: `${priorityColors[item.priority]}15`,
                    padding: '5px 9px',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}>
                    {item.priority}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  <span style={{
                    color: statusColors[item.status],
                    background: `${statusColors[item.status]}15`,
                    padding: '5px 9px',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}>
                    {item.status}
                  </span>
                </td>
                <td style={{ padding: 14 }}>
                  <button
                    onClick={() => {
                      setSelected(item)
                      setActionError('')
                    }}
                    style={{ ...buttonStyle, background: '#f1edfa', color: '#60449a' }}
                  >
                    Review
                  </button>
                </td>
              </tr>
            ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan="8" style={{ padding: 25, textAlign: 'center', color: '#777184' }}>
                  {error ? 'Live incident records are unavailable.' : 'No mismatch records found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {currentSelected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#17102080',
            display: 'grid',
            placeItems: 'center',
            padding: 18,
            zIndex: 1000,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              ...cardStyle,
              width: 'min(460px,100%)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{currentSelected.id} Details</h2>
              <button onClick={() => setSelected(null)} aria-label="Close details">×</button>
            </div>

            <div style={{ lineHeight: 2.2, fontSize: 14, marginTop: 15 }}>
              <div><b>Parking lot:</b> {currentSelected.space}</div>
              <div><b>Sensor:</b> {currentSelected.sensor}</div>
              <div><b>Incident type:</b> {currentSelected.type}</div>
              <div><b>Description:</b> {currentSelected.detected}</div>
              <div><b>Severity:</b> {currentSelected.priority}</div>
              <div><b>Current status:</b> {currentSelected.status}</div>
              <div><b>Reported at:</b> {currentSelected.time}</div>
            </div>

            <div style={{ borderTop: '1px solid #eeeaf3', marginTop: 16, paddingTop: 16 }}>
              <p style={{ fontWeight: 600, fontSize: 14 }}>Incident action</p>

              {currentSelected.status !== 'Resolved' ? (
                <button
                  onClick={handleResolve}
                  disabled={resolving}
                  style={{
                    ...buttonStyle,
                    background: resolving ? '#aaa' : '#16845b',
                    color: '#fff',
                    cursor: resolving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resolving ? 'Resolving...' : 'Mark as Resolved'}
                </button>
              ) : (
                <span style={{ color: '#16845b', fontWeight: 600 }}>
                  This incident is resolved.
                </span>
              )}

              <p style={{ fontSize: 12, color: '#8a8295', marginTop: 15 }}>
                Resolving updates the incident through the backend. It does not physically correct or verify a parking sensor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
