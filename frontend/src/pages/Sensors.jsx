import React, { useMemo, useState } from 'react'
import { useSpotSync } from '../context/SpotSyncContext'

const statusColors = {
  Online: '#16845b',
  Offline: '#d04444',
  Stale: '#c18419',
}

export default function Sensors() {
  const { sensors } = useSpotSync()

  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const filtered = useMemo(() => sensors.filter(sensor => {
    const matchesStatus = filter === 'All' || sensor.status === filter
    const matchesSearch =
      `${sensor.id} ${sensor.space} ${sensor.location}`
        .toLowerCase()
        .includes(search.toLowerCase())

    return matchesStatus && matchesSearch
  }), [sensors, filter, search])

  const online = sensors.filter(s => s.status === 'Online').length
  const offline = sensors.filter(s => s.status === 'Offline').length
  const stale = sensors.filter(s => s.status === 'Stale').length

  const cardStyle = {
    background: '#fff',
    border: '1px solid #ece8f2',
    borderRadius: 12,
    padding: 18,
    boxShadow: '0 2px 8px rgba(30,20,50,0.03)',
  }

  return (
    <div style={{ padding: 24, color: '#292238', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: 22,
      }}>
        <div>
          <h1 style={{ fontSize: 25, margin: 0 }}>Sensor Monitoring</h1>
          <p style={{ color: '#777184', margin: '7px 0 0' }}>
            Monitor connectivity and status of all parking sensors.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#777184', fontSize: 12 }}>
            Last refreshed: {lastRefreshed.toLocaleTimeString('en-IN')}
          </span>

          <button
            onClick={() => setLastRefreshed(new Date())}
            style={{
              background: '#5b2ccb',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              padding: '10px 15px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            ↻ Refresh
          </button>

          <span style={{
            background: '#f1edfa',
            color: '#60449a',
            borderRadius: 8,
            padding: '9px 13px',
            fontSize: 12,
            fontWeight: 600,
          }}>
            DEMO DATA · NOT LIVE
          </span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))',
        gap: 14,
        marginBottom: 22,
      }}>
        {[
          ['Total Sensors', sensors.length, '#60449a'],
          ['Online', online, '#16845b'],
          ['Offline', offline, '#d04444'],
          ['Stale Readings', stale, '#c18419'],
        ].map(([label, value, color]) => (
          <div key={label} style={cardStyle}>
            <div style={{ color: '#777184', fontSize: 13 }}>{label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginTop: 8 }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search sensor, space or location..."
            aria-label="Search sensors"
            style={{
              flex: '1 1 240px',
              minWidth: 0,
              padding: 11,
              border: '1px solid #ddd7e8',
              borderRadius: 8,
              fontSize: 14,
            }}
          />

          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            aria-label="Filter by sensor status"
            style={{
              padding: 11,
              border: '1px solid #ddd7e8',
              borderRadius: 8,
              background: '#fff',
              minWidth: 150,
            }}
          >
            {['All', 'Online', 'Offline', 'Stale'].map(item => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ ...cardStyle, overflowX: 'auto' }}>
        <h2 style={{ fontSize: 17, margin: '0 0 16px' }}>All Sensors</h2>

        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          minWidth: 680,
          textAlign: 'left',
        }}>
          <thead>
            <tr style={{ background: '#f8f6fb', color: '#777184', fontSize: 12 }}>
              {['Sensor ID', 'Assigned Space', 'Location', 'Connectivity', 'Occupancy', 'Last Seen', ''].map(item => (
                <th key={item} style={{ padding: 13 }}>{item}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filtered.map(sensor => (
              <tr key={sensor.id} style={{ borderBottom: '1px solid #eeeaf3', fontSize: 13 }}>
                <td style={{ padding: 14, fontWeight: 700 }}>{sensor.id}</td>
                <td style={{ padding: 14 }}>{sensor.space}</td>
                <td style={{ padding: 14 }}>{sensor.location}</td>
                <td style={{ padding: 14 }}>
                  <span style={{
                    color: statusColors[sensor.status],
                    background: `${statusColors[sensor.status]}15`,
                    padding: '5px 9px',
                    borderRadius: 20,
                    fontWeight: 600,
                  }}>
                    {sensor.status}
                  </span>
                </td>
                <td style={{ padding: 14 }}>{sensor.occupancy}</td>
                <td style={{ padding: 14 }}>{sensor.lastSeen}</td>
                <td style={{ padding: 14 }}>
                  <button
                    onClick={() => setSelected(sensor)}
                    style={{
                      border: 0,
                      background: '#f1edfa',
                      color: '#60449a',
                      padding: '7px 11px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan="7" style={{ padding: 25, textAlign: 'center' }}>
                  No sensors match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
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
            style={{ ...cardStyle, width: 'min(420px,100%)' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h2 style={{ margin: 0, fontSize: 19 }}>{selected.id} Details</h2>
              <button onClick={() => setSelected(null)} aria-label="Close details">×</button>
            </div>

            <div style={{ lineHeight: 2.2, fontSize: 14, marginTop: 12 }}>
              <div><b>Assigned space:</b> {selected.space}</div>
              <div><b>Location:</b> {selected.location}</div>
              <div><b>Connectivity:</b> {selected.status}</div>
              <div><b>Occupancy:</b> {selected.occupancy}</div>
              <div><b>Last communication:</b> {selected.lastSeen}</div>
              <div><b>Battery:</b> {selected.battery}</div>
            </div>

            <p style={{ color: '#8a8295', fontSize: 12 }}>
              Sample interface data. No physical sensor is connected.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}