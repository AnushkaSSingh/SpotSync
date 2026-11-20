import React from 'react'
import { CheckCheck, AlertTriangle, Info } from 'lucide-react'
import { PageTitle, Card, Button, Status } from '../components/Shared'
import { useSpotSync } from '../context/SpotSyncContext'

export default function Notifications() {
  const {
    notifications: items,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSpotSync()

  const unread = items.filter(item => !item.read).length

  return (
    <>
      <PageTitle
        title="Notifications"
        subtitle="Review staff alerts and acknowledge items that have been checked."
        action={
          <Button
            onClick={markAllNotificationsRead}
            icon={CheckCheck}
            variant="secondary"
          >
            Mark all read
          </Button>
        }
      />

      <div className="stats-grid">
        <Card title="Total notifications"><h2>{items.length}</h2></Card>
        <Card title="Unread"><h2>{unread}</h2></Card>
        <Card title="Acknowledged"><h2>{items.length - unread}</h2></Card>
      </div>

      <Card title="Recent notifications" subtitle="Shared staff alerts">
        {items.map(item => (
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
              color: item.type === 'Warning' || item.type === 'Alert'
                ? '#c27b20'
                : '#7551c9',
            }}>
              {item.type === 'Info' ? <Info size={21} /> : <AlertTriangle size={21} />}
            </span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <b>{item.title}</b>
              <p style={{ margin: '5px 0', color: '#777', fontSize: 13 }}>
                {item.message}
              </p>
              <small style={{ color: '#999' }}>
                {item.id} · {item.time}
              </small>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Status value={item.read ? 'Read' : 'Unread'} />

              {!item.read && (
                <Button
                  variant="secondary"
                  onClick={() => markNotificationRead(item.id)}
                >
                  Mark read
                </Button>
              )}
            </div>
          </div>
        ))}

        <p style={{ fontSize: 12, color: '#888', marginTop: 14 }}>
          Demo notifications are shared across the staff pages during this React session.
          Live alerts require backend integration.
        </p>
      </Card>
    </>
  )
}