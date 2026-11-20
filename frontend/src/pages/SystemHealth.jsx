import React, { useMemo, useState } from 'react'
import {
  Activity, Wifi, WifiOff, Server, Database,
  Bell, CheckCheck, ShieldAlert, Car, Settings,
  Clock, CircleDot
} from 'lucide-react'

import { PageTitle, Card, Status } from '../components/Shared'
import { useSpotSync } from '../context/SpotSyncContext'

const categoryIcons = {
  Sensor: Wifi,
  Parking: Car,
  Security: ShieldAlert,
  System: Settings,
}

const priorityColors = {
  High: '#d04455',
  Medium: '#c18419',
  Low: '#16834b',
}

export default function SystemHealth() {
  const {
    sensors,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useSpotSync()

  const [notificationFilter, setNotificationFilter] = useState('All')
  const [selectedNotification, setSelectedNotification] = useState(null)

  const online = sensors.filter(s => s.status === 'Online').length
  const offline = sensors.filter(s => s.status === 'Offline').length
  const stale = sensors.filter(s => s.status === 'Stale').length
  const unread = notifications.filter(n => !n.read).length

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification =>
      notificationFilter === 'All' ||
      notification.category === notificationFilter
    )
  }, [notifications, notificationFilter])

  const currentSelected = notifications.find(
    item => item.id === selectedNotification?.id
  )

  const systemStatus = offline > 0 || stale > 0
    ? 'Attention Required'
    : 'Operational'

  const stats = [
    { label: 'System status', value: systemStatus, icon: Activity },
    { label: 'Sensors online', value: `${online}/${sensors.length}`, icon: Wifi },
    { label: 'Sensors offline', value: offline, icon: WifiOff },
    { label: 'Stale readings', value: stale, icon: Clock },
  ]

  const cardStyle = {
    background: '#fff',
    border: '1px solid #ece8f2',
    borderRadius: 12,
    padding: 18,
    marginBottom: 18,
  }

  return (
    <>
      <PageTitle
        title="Notifications & System Health"
        subtitle="Monitor alerts, sensor connectivity and infrastructure performance."
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <span style={{
          background: '#f1edfa',
          color: '#60449a',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: 12,
          fontWeight: 700,
        }}>
          DEMO DATA · NOT LIVE
        </span>
      </div>

      <div className="stats-grid">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10,
            }}>
              <div>
                <p style={{ color: '#777', margin: 0 }}>{label}</p>
                <h2 style={{
                  margin: '12px 0 0',
                  fontSize: 20,
                  color: label === 'System status'
                    ? (systemStatus === 'Operational' ? '#16834b' : '#c18419')
                    : '#292238',
                }}>
                  {value}
                </h2>
              </div>
              <Icon size={25} color="#7545e7" />
            </div>
          </Card>
        ))}
      </div>

      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 18,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Bell color="#7545e7" size={22} />
            <div>
              <h2 style={{ fontSize: 18, margin: 0 }}>Notifications</h2>
              <p style={{ margin: '5px 0 0', color: '#777184', fontSize: 12 }}>
                {unread} unread notification{unread !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={markAllNotificationsRead}
            disabled={unread === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              padding: '9px 13px',
              border: 0,
              borderRadius: 8,
              background: unread ? '#5b2ccb' : '#e8e3ef',
              color: unread ? '#fff' : '#777184',
              cursor: unread ? 'pointer' : 'not-allowed',
              fontWeight: 600,
            }}
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap',
          marginBottom: 16,
        }}>
          {['All', 'Sensor', 'Parking', 'Security', 'System'].map(category => (
            <button
              key={category}
              onClick={() => setNotificationFilter(category)}
              style={{
                padding: '8px 13px',
                borderRadius: 20,
                border: '1px solid #e5dfed',
                background: notificationFilter === category ? '#5b2ccb' : '#fff',
                color: notificationFilter === category ? '#fff' : '#625b70',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {filteredNotifications.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#777184', padding: 25 }}>
            No notifications in this category.
          </p>
        ) : (
          filteredNotifications.map(notification => {
            const Icon = categoryIcons[notification.category] || Bell

            return (
              <div
                key={notification.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 13,
                  padding: 15,
                  marginBottom: 10,
                  borderRadius: 10,
                  border: '1px solid #eeeaf3',
                  background: notification.read ? '#fff' : '#f8f5ff',
                }}
              >
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: '#eee8fb',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={19} color="#60449a" />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <b style={{ fontSize: 14 }}>{notification.title}</b>

                    {!notification.read && (
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: '#7545e7',
                      }} />
                    )}

                    <span style={{
                      fontSize: 10,
                      color: priorityColors[notification.priority],
                      background: `${priorityColors[notification.priority]}15`,
                      padding: '4px 7px',
                      borderRadius: 12,
                      fontWeight: 700,
                    }}>
                      {notification.priority}
                    </span>
                  </div>

                  <p style={{
                    margin: '6px 0',
                    fontSize: 13,
                    color: '#777184',
                    lineHeight: 1.5,
                  }}>
                    {notification.message}
                  </p>

                  <span style={{ fontSize: 11, color: '#9991a3' }}>
                    <Clock size={12} style={{ verticalAlign: 'middle' }} />
                    {' '}{notification.time} · {notification.category}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  <button
                    onClick={() => setSelectedNotification(notification)}
                    style={{
                      border: 0,
                      background: '#eee8fb',
                      color: '#60449a',
                      padding: '7px 10px',
                      borderRadius: 7,
                      cursor: 'pointer',
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    View
                  </button>

                  {!notification.read && (
                    <button
                      onClick={() => markNotificationRead(notification.id)}
                      style={{
                        border: '1px solid #ddd5eb',
                        background: '#fff',
                        color: '#60449a',
                        padding: '7px 10px',
                        borderRadius: 7,
                        cursor: 'pointer',
                        fontSize: 11,
                      }}
                    >
                      Read
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Sensor Connectivity</h2>
        <p style={{ color: '#777184', fontSize: 12, margin: '0 0 16px' }}>
          8 monitored sensors · S1–S7 parking bays · S8 entrance/ramp
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            minWidth: 650,
          }}>
            <thead>
              <tr>
                {['Sensor ID', 'Parking location', 'Connection', 'Signal', 'Battery'].map(h => (
                  <th key={h} style={{
                    padding: 13,
                    borderBottom: '1px solid #eee',
                    whiteSpace: 'nowrap',
                    color: '#777184',
                    fontSize: 12,
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {sensors.map(sensor => (
                <tr key={sensor.id}>
                  <td style={{ padding: 13 }}>{sensor.id}</td>
                  <td style={{ padding: 13 }}>{sensor.space}</td>
                  <td style={{ padding: 13 }}><Status value={sensor.status} /></td>
                  <td style={{ padding: 13 }}>{sensor.signal}</td>
                  <td style={{ padding: 13 }}>{sensor.battery}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 18, margin: '0 0 6px' }}>Infrastructure Overview</h2>
        <p style={{ color: '#777184', fontSize: 12, margin: '0 0 12px' }}>
          Demonstration system components and their sample status.
        </p>

        {[
          ['Application server', 'Running', Server],
          ['Database service', 'Connected', Database],
          ['Sensor network', offline || stale ? 'Attention required' : 'Operational', Wifi],
          ['Monitoring service', 'Running', Activity],
        ].map(([name, status, Icon]) => (
          <div
            className="settings-row"
            key={name}
            style={{ display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div className="settings-icon"><Icon size={20} /></div>

            <div style={{ flex: 1 }}>
              <b>{name}</b>
              <span>
                {name === 'Sensor network'
                  ? `${offline} offline and ${stale} stale sensor(s)`
                  : 'Demo service status'}
              </span>
            </div>

            <span style={{
              color: status === 'Attention required' ? '#d04455' : '#16834b',
              fontWeight: 700,
              fontSize: 12,
              whiteSpace: 'nowrap',
            }}>
              {status}
            </span>
          </div>
        ))}
      </div>

      <div style={{
        ...cardStyle,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}>
        <CircleDot size={19} color="#7545e7" />
        <div>
          <b style={{ fontSize: 14 }}>Monitoring Information</b>
          <p style={{
            color: '#777184',
            fontSize: 12,
            margin: '6px 0 0',
            lineHeight: 1.6,
          }}>
            All readings and notifications are demonstration data.
            Live monitoring requires backend and hardware integration.
            A sensor marked offline or stale must not be treated as an
            available parking space.
          </p>
        </div>
      </div>

      {currentSelected && (
        <div
          onClick={() => setSelectedNotification(null)}
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
              background: '#fff',
              borderRadius: 13,
              padding: 22,
              width: 'min(430px,100%)',
              boxShadow: '0 10px 35px #0002',
            }}
          >
            <h2 style={{ margin: '0 0 15px', fontSize: 19 }}>
              Notification Details
            </h2>

            <b>{currentSelected.title}</b>
            <p style={{ color: '#777184', lineHeight: 1.6, fontSize: 14 }}>
              {currentSelected.message}
            </p>

            <p style={{ fontSize: 13 }}><b>Category:</b> {currentSelected.category}</p>
            <p style={{ fontSize: 13 }}><b>Priority:</b> {currentSelected.priority}</p>
            <p style={{ fontSize: 13 }}><b>Time:</b> {currentSelected.time}</p>
            <p style={{ fontSize: 13 }}>
              <b>Read status:</b> {currentSelected.read ? 'Read' : 'Unread'}
            </p>

            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 9,
              marginTop: 20,
            }}>
              {!currentSelected.read && (
                <button
                  onClick={() => markNotificationRead(currentSelected.id)}
                  style={{
                    background: '#5b2ccb',
                    color: '#fff',
                    border: 0,
                    borderRadius: 8,
                    padding: '9px 13px',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  Mark as read
                </button>
              )}

              <button
                onClick={() => setSelectedNotification(null)}
                style={{
                  background: '#eeeaf3',
                  color: '#4c435b',
                  border: 0,
                  borderRadius: 8,
                  padding: '9px 13px',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}