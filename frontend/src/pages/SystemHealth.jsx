import React from 'react'
import {
  Activity, Wifi, WifiOff, Server, Database,
  CheckCircle2, AlertTriangle, Clock
} from 'lucide-react'
import { PageTitle, Card, Status } from '../components/Shared'

const sensors = [
  { id: 'SNS-001', location: 'B1-A01', status: 'Online', signal: 'Strong', battery: '96%' },
  { id: 'SNS-002', location: 'B1-A02', status: 'Online', signal: 'Strong', battery: '91%' },
  { id: 'SNS-003', location: 'B1-A03', status: 'Offline', signal: 'No signal', battery: '12%' },
  { id: 'SNS-004', location: 'B2-A01', status: 'Online', signal: 'Good', battery: '84%' },
  { id: 'SNS-005', location: 'B2-A02', status: 'Online', signal: 'Good', battery: '89%' }
]

export default function SystemHealth() {
  const online = sensors.filter(s => s.status === 'Online').length

  const stats = [
    { label: 'System status', value: 'Operational', icon: CheckCircle2 },
    { label: 'Sensors online', value: `${online}/${sensors.length}`, icon: Wifi },
    { label: 'Sensors offline', value: sensors.length - online, icon: WifiOff },
    { label: 'System uptime', value: '99.8%', icon: Activity }
  ]

  return (
    <>
      <PageTitle
        title="System Health"
        subtitle="Monitor system performance, sensor connectivity and infrastructure."
      />

      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: '#777', margin: 0 }}>{label}</p>
                <h2 style={{ margin: '12px 0 0' }}>{value}</h2>
              </div>
              <Icon size={25} color="#7545e7" />
            </div>
          </Card>
        ))}
      </div>

      <Card title="Sensor connectivity" subtitle="Current sample sensor records">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                {['Sensor ID', 'Parking location', 'Connection', 'Signal', 'Battery'].map(h => (
                  <th key={h} style={{ padding: 13, borderBottom: '1px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sensors.map(sensor => (
                <tr key={sensor.id}>
                  <td style={{ padding: 13 }}>{sensor.id}</td>
                  <td style={{ padding: 13 }}>{sensor.location}</td>
                  <td style={{ padding: 13 }}>
                    <Status value={sensor.status} />
                  </td>
                  <td style={{ padding: 13 }}>{sensor.signal}</td>
                  <td style={{ padding: 13 }}>{sensor.battery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 20 }}>
        <Card title="Infrastructure overview" subtitle="Demo system components">
          {[
            ['Application server', 'Running', Server],
            ['Database service', 'Connected', Database],
            ['Sensor network', 'Attention required', Wifi],
            ['Monitoring service', 'Running', Activity]
          ].map(([name, status, Icon]) => (
            <div className="settings-row" key={name}>
              <div className="settings-icon"><Icon size={20} /></div>
              <div>
                <b>{name}</b>
                <span>{status === 'Attention required' ? 'One sample sensor is offline' : 'Demo service status'}</span>
              </div>
              <span style={{
                color: status === 'Attention required' ? '#d04455' : '#16834b',
                fontWeight: 700,
                fontSize: 12
              }}>{status}</span>
            </div>
          ))}
        </Card>
      </div>

      <p style={{ color: '#777', fontSize: 13, marginTop: 14 }}>
        <AlertTriangle size={14} style={{ verticalAlign: 'middle' }} />
        {' '}All readings are demonstration data. Live monitoring requires backend and hardware integration.
      </p>
    </>
  )
}