import React from 'react'
import { CheckCheck, AlertTriangle, Info, RefreshCw } from 'lucide-react'
import { PageTitle, Card, Button, Status } from '../components/Shared'
import { useStaffNotifications } from '../hooks/useStaffNotifications'

export default function Notifications() {
  const {
    notifications: items,
    loading,
    error,
    refreshNotifications,
  } = useStaffNotifications()

  const unread = items.filter(item => !item.read).length
  const acknowledged = items.length - unread

  function formatTime(value) {
    if (!value) return 'Time unavailable'

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) return 'Time unavailable'

    return date.toLocaleString()
  }

  function getNotificationType(type) {
    return String(type || 'info').toLowerCase()
  }

  return (
    <>
      <PageTitle
        title="Notifications"
        subtitle="Review staff alerts and monitor system updates."
        action={
          <Button
            onClick={refreshNotifications}
            icon={RefreshCw}
            variant="secondary"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        }
      />

      {error && (
        <Card title="Unable to load notifications">
          <p style={{ color: '#b42318', marginTop: 0 }}>{error}</p>
          <Button
            variant="secondary"
            onClick={refreshNotifications}
          >
            Try again
          </Button>
        </Card>
      )}

      <div className="stats-grid">
        <Card title="Total notifications">
          <h2>{loading ? '—' : items.length}</h2>
        </Card>
        <Card title="Unread">
          <h2>{loading ? '—' : unread}</h2>
        </Card>
        <Card title="Acknowledged">
          <h2>{loading ? '—' : acknowledged}</h2>
        </Card>
      </div>

      <Card
        title="Recent notifications"
        subtitle="Notifications retrieved from the SpotSync server"
      >
        {loading && (
          <p style={{ color: '#777', padding: '16px 4px' }}>
            Loading notifications...
          </p>
        )}

        {!loading && !error && items.length === 0 && (
          <p style={{ color: '#777', padding: '16px 4px' }}>
            No notifications are currently available.
          </p>
        )}

        {!loading && items.map(item => {
          const type = getNotificationType(item.type)
          const isWarning = ['warning', 'alert', 'critical', 'error'].includes(type)

          return (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '16px 4px',
                borderBottom: '1px solid #eeeaf4',
                background: item.read ? 'transparent' : '#faf8ff',
              }}
            >
              <span style={{
                color: isWarning ? '#c27b20' : '#7551c9',
              }}>
                {isWarning ? <AlertTriangle size={21} /> : <Info size={21} />}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <b>{item.title}</b>
                <p style={{ margin: '5px 0', color: '#777', fontSize: 13 }}>
                  {item.message}
                </p>
                <small style={{ color: '#999' }}>
                  {item.id} · {formatTime(item.createdAt)}
                </small>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Status value={item.read ? 'Read' : 'Unread'} />
              </div>
            </div>
          )
        })}

        <p style={{ fontSize: 12, color: '#888', marginTop: 14 }}>
          Notification status is displayed from backend data. Read and
          acknowledgement updates require a backend endpoint.
        </p>
      </Card>
    </>
  )
}
