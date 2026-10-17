
import { useEffect, useState } from 'react'
import { CarFront, MapPin, ParkingSquare, Activity, RefreshCw } from 'lucide-react'
import api from '../services/api'

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <article className="admin-stat-card">
      <div className="admin-stat-top">
        <span>{title}</span>
        <Icon size={21} />
      </div>
      <h2>{value}</h2>
      <p>{subtitle}</p>
    </article>
  )
}

function AdminDashboard() {
  const [lots, setLots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadDashboard() {
    setLoading(true)
    setError('')

    try {
      const response = await api.get('/parking/overview')
      const data = response.data
      setLots(Array.isArray(data.parking_lots) ? data.parking_lots : [])
    } catch (err) {
      setError(
        err.response?.data?.detail ||
        'Unable to load parking data. Check that the backend is running.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const totalSlots = lots.reduce(
    (sum, lot) => sum + Number(lot.total_slots || 0),
    0
  )

  const availableSlots = lots.reduce(
    (sum, lot) => sum + Number(lot.available_slots || 0),
    0
  )

  const occupiedSlots = Math.max(0, totalSlots - availableSlots)
  const occupancy = totalSlots
    ? Math.round((occupiedSlots / totalSlots) * 100)
    : 0

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e4e9e5',
    borderRadius: '16px',
    padding: '22px',
  }

  return (
    <div className="container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
          marginBottom: 28,
        }}
      >
        <div>
          <p style={{ color: '#7b68c8', fontWeight: 700, marginBottom: 8 }}>
            SPOTSYNC OPERATIONS
          </p>
          <h1 style={{ margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#66736a' }}>
            Monitor parking capacity and current availability.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="primary-button"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <RefreshCw size={17} />
          {loading ? 'Refreshing...' : 'Refresh data'}
        </button>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            padding: 16,
            marginBottom: 20,
            borderRadius: 12,
            background: '#fff1f0',
            color: '#a12622',
          }}
        >
          {error}
          <button
            type="button"
            onClick={loadDashboard}
            style={{ marginLeft: 12 }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && lots.length === 0 ? (
        <p role="status">Loading parking overview...</p>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 18,
              marginBottom: 28,
            }}
          >
            <StatCard
              title="Parking Locations"
              value={lots.length}
              subtitle="Locations returned by the API"
              icon={MapPin}
            />
            <StatCard
              title="Total Capacity"
              value={totalSlots}
              subtitle="Parking slots across listed locations"
              icon={ParkingSquare}
            />
            <StatCard
              title="Available Slots"
              value={availableSlots}
              subtitle="Slots currently reported available"
              icon={CarFront}
            />
            <StatCard
              title="Occupancy Rate"
              value={`${occupancy}%`}
              subtitle={`${occupiedSlots} occupied slots, calculated from capacity`}
              icon={Activity}
            />
          </div>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Parking Location Overview</h2>
            <p style={{ color: '#66736a' }}>
              Availability and capacity reported by the backend.
            </p>

            {lots.length === 0 ? (
              <p>No parking locations were returned by the API.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid #e4e9e5' }}>
                      <th style={{ padding: '14px 10px' }}>Location</th>
                      <th style={{ padding: '14px 10px' }}>Total slots</th>
                      <th style={{ padding: '14px 10px' }}>Available</th>
                      <th style={{ padding: '14px 10px' }}>Occupied</th>
                      <th style={{ padding: '14px 10px' }}>Occupancy</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lots.map((lot, index) => {
                      const total = Number(lot.total_slots || 0)
                      const available = Number(lot.available_slots || 0)
                      const occupied = Math.max(0, total - available)
                      const rate = total
                        ? Math.round((occupied / total) * 100)
                        : 0

                      return (
                        <tr
                          key={lot.id ?? lot.parking_lot_id ?? index}
                          style={{ borderBottom: '1px solid #eef0ee' }}
                        >
                          <td style={{ padding: '16px 10px' }}>
                            <strong>{lot.name || 'Unnamed location'}</strong>
                            <div style={{ color: '#66736a', fontSize: 13 }}>
                              {lot.address || 'Address unavailable'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 10px' }}>{total}</td>
                          <td style={{ padding: '16px 10px' }}>{available}</td>
                          <td style={{ padding: '16px 10px' }}>{occupied}</td>
                          <td style={{ padding: '16px 10px', minWidth: 120 }}>
                            <div
                              style={{
                                background: '#eeeaf9',
                                height: 7,
                                borderRadius: 8,
                                overflow: 'hidden',
                              }}
                            >
                              <div
                                style={{
                                  width: `${rate}%`,
                                  height: '100%',
                                  background: '#7b68c8',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: 13 }}>{rate}%</span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default AdminDashboard
