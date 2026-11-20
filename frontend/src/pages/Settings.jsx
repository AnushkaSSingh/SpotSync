import React, { useState, useEffect } from 'react'
import {
  Wifi,
  WifiOff,
  Save,
  CheckCircle2,
  Sun,
  Moon,
  Clock
} from 'lucide-react'
import { Card, Button } from '../components/Shared'

const field = {
  width: '100%',
  padding: '11px 12px',
  border: '1px solid var(--line)',
  borderRadius: 8,
  marginTop: 7,
  fontSize: 13,
  background: 'var(--surface)',
  color: 'var(--ink)'
}

export default function Settings() {
  const [rates, setRates] = useState({
    four: '60',
    two: '40'
  })

  const [saved, setSaved] = useState(false)

  const [alerts, setAlerts] = useState({
    mismatch: true,
    sensor: true,
    capacity: true,
    daily: false,
    reservation: true
  })

  const [appearance, setAppearance] = useState(() => {
    return localStorage.getItem('spotsync-theme') || 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appearance)
    localStorage.setItem('spotsync-theme', appearance)
  }, [appearance])

  const sensors = [
    { id: 'S1', bay: 'B1-A1', status: 'Online' },
    { id: 'S2', bay: 'B1-A2', status: 'Online' },
    { id: 'S3', bay: 'B1-A3', status: 'Offline' },
    { id: 'S4', bay: 'B2-A1', status: 'Online' },
    { id: 'S5', bay: 'B2-A2', status: 'Stale' },
    { id: 'S6', bay: 'B2-A3', status: 'Online' },
    { id: 'S7', bay: 'B2-A4', status: 'Online' },
    { id: 'S8', bay: 'Entrance / Ramp', status: 'Operational' }
  ]

  const toggle = (key) => {
    setAlerts(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
    setSaved(false)
  }

  const save = (e) => {
    e.preventDefault()
    setSaved(true)
  }

  return (
    <div className="pdf-page">

      <div className="settings-heading">
        <div>
          <span className="eyebrow">STAFF STF-2041 · ADMIN</span>
          <h1>Make it yours</h1>
          <p>Rates, sensors and alerts for this car park.</p>
        </div>

        <Button
          icon={Save}
          onClick={() => setSaved(true)}
        >
          Save changes
        </Button>
      </div>

      {/* THREE INDEPENDENT COLUMNS */}
      <div
        className="pdf-settings-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '16px',
          alignItems: 'start'
        }}
      >

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

          <Card
            title="Parking rates"
            subtitle="Set the hourly rate by vehicle type"
          >
            <form onSubmit={save}>
              <label className="pdf-field">
                4-wheeler · per hour (₹)
                <input
                  style={field}
                  type="number"
                  min="1"
                  value={rates.four}
                  onChange={e =>
                    setRates(prev => ({
                      ...prev,
                      four: e.target.value
                    }))
                  }
                />
              </label>

              <label className="pdf-field">
                2-wheeler · per hour (₹)
                <input
                  style={field}
                  type="number"
                  min="1"
                  value={rates.two}
                  onChange={e =>
                    setRates(prev => ({
                      ...prev,
                      two: e.target.value
                    }))
                  }
                />
              </label>

              <Button type="submit" icon={Save}>
                Save rates
              </Button>
            </form>
          </Card>

          <Card
            title="Staff access"
            subtitle="Accounts and permissions"
          >
            <div className="pdf-staff-row">
              <div className="pdf-person">ST</div>
              <div>
                <b>Staff 2041 (STF-2041)</b>
                <span>Admin · full access</span>
              </div>
              <strong>Admin</strong>
            </div>

            <div className="pdf-staff-row">
              <div className="pdf-person">ST</div>
              <div>
                <b>Staff 2045 (STF-2045)</b>
                <span>Entry & exit only</span>
              </div>
              <strong>Staff</strong>
            </div>
          </Card>

        </div>

        {/* MIDDLE COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

          <Card
            title="Sensor health · 8 linked"
            subtitle="Connection status for parking bays and entrance"
          >
            {sensors.map(sensor => (
              <div className="pdf-sensor-row" key={sensor.id}>
                <div className="pdf-sensor-icon">
                  {sensor.status === 'Offline'
                    ? <WifiOff />
                    : sensor.status === 'Stale'
                      ? <Clock />
                      : <Wifi />
                  }
                </div>

                <b>{sensor.id} · {sensor.bay}</b>

                <span
                  className={
                    sensor.status === 'Offline'
                      ? 'offline'
                      : sensor.status === 'Stale'
                        ? 'stale'
                        : 'online'
                  }
                >
                  {sensor.status}
                </span>
              </div>
            ))}
          </Card>

        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>

          <Card
            title="Notification alerts"
            subtitle="Choose which events should notify staff"
          >
            {[
              ['mismatch', 'Mismatch alerts'],
              ['sensor', 'Sensor offline alerts'],
              ['capacity', 'Capacity alerts'],
              ['daily', 'Daily summary (9 PM)'],
              ['reservation', 'Reservation alerts']
            ].map(([key, label]) => (
              <div className="pdf-toggle-row" key={key}>
                <span>{label}</span>

                <button
                  type="button"
                  className={'switch ' + (alerts[key] ? 'on' : '')}
                  onClick={() => toggle(key)}
                  aria-pressed={alerts[key]}
                >
                  <i />
                </button>
              </div>
            ))}
          </Card>

          <Card
            title="Appearance"
            subtitle="Choose the staff console theme"
          >
            <div className="appearance-options">
              <button
                type="button"
                className={
                  'theme-choice ' +
                  (appearance === 'light' ? 'chosen' : '')
                }
                onClick={() => setAppearance('light')}
                aria-pressed={appearance === 'light'}
              >
                <Sun />
                Light Mode
              </button>

              <button
                type="button"
                className={
                  'theme-choice ' +
                  (appearance === 'dark' ? 'chosen' : '')
                }
                onClick={() => setAppearance('dark')}
                aria-pressed={appearance === 'dark'}
              >
                <Moon />
                Dark Mode
              </button>
            </div>

            <p className="theme-description">
              {appearance === 'dark'
                ? 'Dark appearance is active across the staff console.'
                : 'Light appearance is active across the staff console.'
              }
            </p>
          </Card>

        </div>
      </div>

      {saved && (
        <p className="success-note">
          <CheckCircle2 size={15} />
          Settings saved for this browser session.
        </p>
      )}

    </div>
  )
}