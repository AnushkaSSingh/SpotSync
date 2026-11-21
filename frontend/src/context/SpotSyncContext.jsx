import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getLatestSensorReadings, getStaffIncidents, getStaffNotifications } from '../services/staffApi'

const SpotSyncContext = createContext(null)
const PARKING_SENSOR_IDS = ['SENSOR_001','SENSOR_002','SENSOR_003','SENSOR_004','SENSOR_005','SENSOR_006','SENSOR_007']
const BAY_FLOOR = bay => String(bay || '').startsWith('B1-') ? 'Basement 1' : 'Basement 2'

function mapSensor(reading) {
  const status = String(reading.status || 'UNKNOWN').toUpperCase()
  const ageMs = reading.timestamp ? Date.now() - new Date(reading.timestamp).getTime() : Infinity
  const isFresh = Number.isFinite(ageMs) && ageMs >= -30000 && ageMs <= 120000
  const isOnline = reading.is_online !== false && isFresh
  return {
    id: reading.sensor_id,
    sensor_id: reading.sensor_id,
    space: reading.slot_number || 'Entrance / Ramp',
    slot_number: reading.slot_number || null,
    location: reading.slot_number ? BAY_FLOOR(reading.slot_number) : 'Entrance',
    status: isOnline ? 'Online' : 'Offline',
    occupancy: status,
    readingStatus: status,
    distance_cm: reading.distance_cm ?? null,
    lastSeen: reading.timestamp || null,
    timestamp: reading.timestamp || null,
    is_online: isOnline,
    slotId: reading.slot_id ?? null,
  }
}

function mapIncident(item) {
  return {
    id: item.id,
    space: item.slot_number || item.parking_slot_number || 'Unassigned bay',
    sensor: item.sensor_id || '—',
    expected: item.expected_status || '—',
    detected: item.detected_status || item.event_type || item.incident_type || '—',
    type: item.incident_type || item.type || 'Parking incident',
    priority: item.severity || 'Medium',
    status: item.status || 'Open',
    time: item.created_at || null,
    description: item.description || '',
  }
}

function mapNotification(item) {
  return {
    ...item,
    id: item.id,
    title: item.title || item.subject || item.type || 'SpotSync notification',
    message: item.message || item.body || item.description || '',
    detail: item.message || item.body || item.description || '',
    category: item.category || item.type || 'System',
    type: item.priority || item.severity || 'Info',
    priority: item.priority || item.severity || 'Low',
    time: item.created_at || item.timestamp || null,
    read: Boolean(item.is_read ?? item.read_at ?? item.read),
  }
}

export function SpotSyncProvider({ children }) {
  const [sensors, setSensors] = useState([])
  const [mismatches, setMismatches] = useState([])
  const [notifications, setNotifications] = useState([])
  const [lastSync, setLastSync] = useState(null)
  const [liveError, setLiveError] = useState('')

  useEffect(() => {
    let active = true
    let busy = false
    const load = async () => {
      if (busy || !localStorage.getItem('spotsync_access_token')) return
      busy = true
      try {
        const [sensorData, incidentData, notificationData] = await Promise.all([
          getLatestSensorReadings(), getStaffIncidents(), getStaffNotifications(),
        ])
        if (!active) return
        const readings = Array.isArray(sensorData) ? sensorData : (sensorData?.readings || [])
        const byId = new Map(readings.map(r => [r.sensor_id, r]))
        setSensors(PARKING_SENSOR_IDS.map(id => byId.get(id)).filter(Boolean).map(mapSensor))
        setMismatches((incidentData || []).map(mapIncident))
        setNotifications((notificationData || []).map(mapNotification))
        setLastSync(new Date())
        setLiveError('')
      } catch (error) {
        if (active) setLiveError(error.message || 'Live data unavailable')
      } finally { busy = false }
    }
    load()
    const timer = window.setInterval(load, 3000)
    return () => { active = false; window.clearInterval(timer) }
  }, [])

  const updateMismatchStatus = () => { /* Incident state is server-owned; resolve through its API. */ }
  const markNotificationRead = () => { /* Notification state is server-owned. */ }
  const markAllNotificationsRead = () => { /* Notification state is server-owned. */ }

  const value = useMemo(() => ({ sensors, mismatches, notifications, lastSync, liveError,
    updateMismatchStatus, markNotificationRead, markAllNotificationsRead }),
    [sensors, mismatches, notifications, lastSync, liveError])
  return <SpotSyncContext.Provider value={value}>{children}</SpotSyncContext.Provider>
}

export function useSpotSync() {
  const context = useContext(SpotSyncContext)
  if (!context) throw new Error('useSpotSync must be used inside SpotSyncProvider')
  return context
}
