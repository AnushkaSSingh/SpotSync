import React, { useState } from 'react'
import {
  Bell, Building2, Monitor, Save, ShieldCheck,
  SlidersHorizontal, Radio, IndianRupee, Wifi,
  WifiOff, CheckCircle2
} from 'lucide-react'
import { PageTitle, Card, Button, Status } from '../components/Shared'

const inputStyle = {
  width: '100%',
  padding: '11px 13px',
  border: '1px solid #ded7ed',
  borderRadius: '9px',
  marginTop: '7px',
  outlineColor: '#7545e7',
  fontSize: '14px'
}

export default function Settings() {
  const [rates, setRates] = useState({
    first: '40',
    extra: '30',
    daily: '250'
  })

  const [toggles, setToggles] = useState({
    mismatch: true,
    sensor: true,
    maintenance: true,
    daily: false
  })

  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function updateRate(key, value) {
    setRates(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function flip(key) {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }))
    setSaved(false)
  }

  function saveSettings(e) {
    e.preventDefault()

    const values = Object.values(rates).map(Number)

    if (values.some(value => !Number.isFinite(value) || value < 0 || value === 0)) {
      setError('Please enter valid positive parking rates.')
      setSaved(false)
      return
    }

    setError('')
    setSaved(true)
  }

  return (
    <>
      <PageTitle
        title="Settings"
        subtitle="Manage parking rates, sensors, notifications and staff preferences."
      />

      <div className="settings-grid">

        <Card title="Parking rates" subtitle="Demo pricing configuration">
          <form onSubmit={saveSettings}>
            {[
              ['first', 'First hour rate (₹)'],
              ['extra', 'Each extra hour (₹)'],
              ['daily', 'Daily maximum cap (₹)']
            ].map(([key, label]) => (
              <label key={key} style={{ display: 'block', marginBottom: 17 }}>
                <b>{label}</b>
                <input
                  type="number"
                  min="1"
                  value={rates[key]}
                  onChange={e => updateRate(key, e.target.value)}
                  style={inputStyle}
                  required
                />
              </label>
            ))}

            <div className="settings-foot">
              <IndianRupee size={17} />
              First hour ₹{rates.first || 0} · Extra hour ₹{rates.extra || 0}
              · Daily cap ₹{rates.daily || 0}
            </div>

            <Button type="submit" icon={Save}>Save settings</Button>
          </form>
        </Card>

        <Card title="Slots & sensor health" subtitle="Configured demo sensor status">
          {[
            ['S1', 'B1-A1', 'Online', true],
            ['S2', 'B1-A2', 'Online', true],
            ['S3', 'B1-A3', 'Offline', false],
            ['S4', 'B2-A1', 'Online', true]
          ].map(([sensor, bay, status, online]) => (
            <div className="settings-row" key={sensor}>
              <div className="settings-icon">
                {online ? <Wifi /> : <WifiOff />}
              </div>
              <div>
                <b>{sensor} → {bay}</b>
                <span>{online ? 'Demo sensor connected' : 'Connection unavailable in demo'}</span>
              </div>
              <span style={{
                color: online ? '#16834b' : '#d04455',
                fontWeight: 700,
                fontSize: 12
              }}>
                {status}
              </span>
            </div>
          ))}
          <p className="settings-foot">
            <Radio size={16} />
            Sensor readings are sample data, not live hardware readings.
          </p>
        </Card>

        <Card title="Notification preferences" subtitle="Choose which alerts you want displayed">
          <div className="toggle-list">
            {[
              ['mismatch', 'Parking mismatch alerts', 'Vehicle detected in a different bay'],
              ['sensor', 'Sensor offline alerts', 'Sensor disconnected or unreliable'],
              ['maintenance', 'Maintenance alerts', 'Parking space out of service'],
              ['daily', 'Daily activity summary', 'Daily parking operations summary']
            ].map(([key, title, desc]) => (
              <div className="toggle-row" key={key}>
                <div>
                  <b>{title}</b>
                  <span>{desc}</span>
                </div>
                <button
                  type="button"
                  className={'switch ' + (toggles[key] ? 'on' : '')}
                  onClick={() => flip(key)}
                  aria-label={`Toggle ${title}`}
                  aria-pressed={toggles[key]}
                >
                  <i />
                </button>
              </div>
            ))}
          </div>
          <Button icon={Bell} onClick={() => setSaved(true)}>
            Save preferences
          </Button>
        </Card>

        <Card title="Staff access" subtitle="Current staff account information">
          <div className="settings-row">
            <div className="settings-icon"><ShieldCheck /></div>
            <div>
              <b>Staff ID</b>
              <span>STF-2041</span>
            </div>
            <span className="setting-value">Active</span>
          </div>

          <div className="settings-row">
            <div className="settings-icon"><Building2 /></div>
            <div>
              <b>Role</b>
              <span>Parking Supervisor</span>
            </div>
            <span className="setting-value">Staff</span>
          </div>

          <div className="settings-row">
            <div className="settings-icon"><Monitor /></div>
            <div>
              <b>Appearance</b>
              <span>Light interface · Purple theme</span>
            </div>
            <span className="setting-value">Default</span>
          </div>

          <p className="settings-foot">
            <ShieldCheck size={16} />
            Account permissions are displayed for demonstration.
          </p>
        </Card>
      </div>

      {error && <p style={{ color: '#d04455', marginTop: 15 }}>{error}</p>}

      {saved && (
        <p className="success-note">
          <CheckCircle2 size={16} /> Changes saved for this browser session only.
          No backend settings have been modified.
        </p>
      )}

      <div className="settings-foot">
        <SlidersHorizontal size={17} />
        Demo settings · Changes are not yet connected to the backend.
      </div>
    </>
  )
}