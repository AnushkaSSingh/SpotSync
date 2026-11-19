import React, { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock, Search } from 'lucide-react'
import { PageTitle, Card, Button, Status } from '../components/Shared'

const initialData = [
  { id: 'MM-1021', vehicle: 'UP16 AB 2345', expected: 'B1-A04', detected: 'B1-A07', time: '10:42 AM', severity: 'High', resolved: false },
  { id: 'MM-1022', vehicle: 'DL8C XY 7821', expected: 'B2-A03', detected: 'B2-A05', time: '11:15 AM', severity: 'Medium', resolved: false },
  { id: 'MM-1023', vehicle: 'UP14 CD 4567', expected: 'B1-B02', detected: 'B1-B02', time: '11:38 AM', severity: 'Low', resolved: true }
]

export default function Mismatches() {
  const [items, setItems] = useState(initialData)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const filtered = items.filter(item =>
    (filter === 'All' || (filter === 'Open' ? !item.resolved : item.resolved)) &&
    `${item.id} ${item.vehicle} ${item.expected} ${item.detected}`
      .toLowerCase().includes(search.toLowerCase())
  )

  const resolve = id => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, resolved: true } : item
    ))
  }

  const openCount = items.filter(item => !item.resolved).length
  const resolvedCount = items.filter(item => item.resolved).length

  return (
    <>
      <PageTitle
        title="Mismatch Management"
        subtitle="Monitor vehicle-to-slot mismatches and manage corrective actions."
      />

      <div className="stats-grid">
        <Card title="Total mismatches">
          <h2>{items.length}</h2>
        </Card>
        <Card title="Open mismatches">
          <h2>{openCount}</h2>
        </Card>
        <Card title="Resolved">
          <h2>{resolvedCount}</h2>
        </Card>
      </div>

      <Card title="Detected mismatches" subtitle="Sample monitoring records">
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ position: 'relative', flex: '1 1 220px' }}>
            <Search size={17} style={{ position: 'absolute', left: 12, top: 13 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search vehicle, bay or ID..."
              style={{ padding: '11px 12px 11px 38px', width: '100%', border: '1px solid #ded7ed', borderRadius: 9 }}
            />
          </div>

          {['All', 'Open', 'Resolved'].map(value => (
            <Button
              key={value}
              variant={filter === value ? 'primary' : 'secondary'}
              onClick={() => setFilter(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {['Alert ID', 'Vehicle', 'Expected bay', 'Detected bay', 'Time', 'Severity', 'Status', 'Action'].map(h => (
                  <th key={h} style={{ padding: 12, borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id}>
                  <td style={{ padding: 12 }}>{item.id}</td>
                  <td style={{ padding: 12 }}>{item.vehicle}</td>
                  <td style={{ padding: 12 }}>{item.expected}</td>
                  <td style={{ padding: 12 }}>{item.detected}</td>
                  <td style={{ padding: 12, whiteSpace: 'nowrap' }}>{item.time}</td>
                  <td style={{ padding: 12 }}>{item.severity}</td>
                  <td style={{ padding: 12 }}>
                    <Status value={item.resolved ? 'Resolved' : 'Open'} />
                  </td>
                  <td style={{ padding: 12 }}>
                    {item.resolved
                      ? <CheckCircle2 size={19} color="green" />
                      : <Button onClick={() => resolve(item.id)}>Resolve</Button>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="8" style={{ padding: 25, textAlign: 'center' }}>No mismatches found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p style={{ color: '#777', fontSize: 13, marginTop: 14 }}>
        <AlertTriangle size={14} style={{ verticalAlign: 'middle' }} /> Demo records only. Live sensor integration is not connected.
      </p>
    </>
  )
}