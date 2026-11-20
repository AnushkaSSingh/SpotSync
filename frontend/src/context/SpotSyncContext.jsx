import React, { createContext, useContext, useState } from 'react'

const SpotSyncContext = createContext(null)

const initialSensors = [
  { id: 'S1', space: 'B1-01', location: 'Basement 1', status: 'Online', occupancy: 'Occupied', lastSeen: 'Just now', battery: '98%', signal: 'Strong' },
  { id: 'S2', space: 'B1-02', location: 'Basement 1', status: 'Online', occupancy: 'Available', lastSeen: 'Just now', battery: '95%', signal: 'Strong' },
  { id: 'S3', space: 'B1-03', location: 'Basement 1', status: 'Offline', occupancy: 'Unknown', lastSeen: '18 min ago', battery: '—', signal: 'No signal' },
  { id: 'S4', space: 'B2-01', location: 'Basement 2', status: 'Online', occupancy: 'Occupied', lastSeen: '1 min ago', battery: '91%', signal: 'Good' },
  { id: 'S5', space: 'B2-02', location: 'Basement 2', status: 'Stale', occupancy: 'Unknown', lastSeen: '12 min ago', battery: '63%', signal: 'Weak' },
  { id: 'S6', space: 'B2-03', location: 'Basement 2', status: 'Online', occupancy: 'Available', lastSeen: 'Just now', battery: '88%', signal: 'Good' },
  { id: 'S7', space: 'B2-04', location: 'Basement 2', status: 'Online', occupancy: 'Available', lastSeen: '2 min ago', battery: '96%', signal: 'Good' },
  { id: 'S8', space: 'Entrance / Ramp', location: 'Entrance', status: 'Online', occupancy: 'Operational', lastSeen: 'Just now', battery: '100%', signal: 'Strong' },
]

const initialMismatches = [
  { id: 'MM-001', space: 'B1-01', sensor: 'S1', expected: 'Available', detected: 'Occupied', type: 'Occupancy Conflict', priority: 'High', status: 'Pending', time: '10:25 AM' },
  { id: 'MM-002', space: 'B1-03', sensor: 'S3', expected: 'Occupied', detected: 'Unknown', type: 'Sensor Offline', priority: 'High', status: 'Investigating', time: '10:18 AM' },
  { id: 'MM-003', space: 'B2-02', sensor: 'S5', expected: 'Available', detected: 'Unknown', type: 'Stale Reading', priority: 'Medium', status: 'Pending', time: '10:05 AM' },
  { id: 'MM-004', space: 'B2-04', sensor: 'S7', expected: 'Occupied', detected: 'Available', type: 'Occupancy Conflict', priority: 'Medium', status: 'Resolved', time: '09:45 AM' },
]

const initialNotifications = [
  {
    id: 'NT-001',
    title: 'Sensor S3 is offline',
    message: 'Parking bay B1-03 has stopped reporting.',
    detail: 'Parking bay B1-03 has stopped reporting.',
    category: 'Sensor',
    type: 'Warning',
    priority: 'High',
    time: '2 min ago',
    read: false,
  },
  {
    id: 'NT-002',
    title: 'Vehicle mismatch detected',
    message: 'A vehicle was detected in a different bay than allocated.',
    detail: 'A vehicle was detected in a different bay than allocated.',
    category: 'Parking',
    type: 'Alert',
    priority: 'High',
    time: '18 min ago',
    read: false,
  },
  {
    id: 'NT-003',
    title: 'Sensor S5 has a stale reading',
    message: 'Sensor S5 has not sent a recent reliable reading.',
    detail: 'Sensor S5 has not sent a recent reliable reading.',
    category: 'Sensor',
    type: 'Warning',
    priority: 'Medium',
    time: '25 min ago',
    read: false,
  },
  {
    id: 'NT-004',
    title: 'System check completed',
    message: 'The sample monitoring check completed successfully.',
    detail: 'The sample monitoring check completed successfully.',
    category: 'System',
    type: 'Info',
    priority: 'Low',
    time: '35 min ago',
    read: true,
  },
  {
    id: 'NT-005',
    title: 'Parking area status updated',
    message: 'A sample parking status update was recorded.',
    detail: 'A sample parking status update was recorded.',
    category: 'Parking',
    type: 'Info',
    priority: 'Low',
    time: '1 hour ago',
    read: true,
  },
]

export function SpotSyncProvider({ children }) {
  const [sensors] = useState(initialSensors)
  const [mismatches, setMismatches] = useState(initialMismatches)
  const [notifications, setNotifications] = useState(initialNotifications)

  const updateMismatchStatus = (id, status) => {
    setMismatches(previous =>
      previous.map(item => item.id === id ? { ...item, status } : item)
    )
  }

  const markNotificationRead = id => {
    setNotifications(previous =>
      previous.map(item => item.id === id ? { ...item, read: true } : item)
    )
  }

  const markAllNotificationsRead = () => {
    setNotifications(previous =>
      previous.map(item => ({ ...item, read: true }))
    )
  }

  return (
    <SpotSyncContext.Provider value={{
      sensors,
      mismatches,
      notifications,
      updateMismatchStatus,
      markNotificationRead,
      markAllNotificationsRead,
    }}>
      {children}
    </SpotSyncContext.Provider>
  )
}

export function useSpotSync() {
  const context = useContext(SpotSyncContext)

  if (!context) {
    throw new Error('useSpotSync must be used inside SpotSyncProvider')
  }

  return context
}
