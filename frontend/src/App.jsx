import React, { useCallback, useEffect, useState } from 'react'
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom'

import { initialAlerts, initialSpaces } from './data/mockData'
import { SpotSyncProvider } from './context/SpotSyncContext'
import { Shell } from './components/Shared'

import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'
import StaffDashboard from './pages/StaffDashboard'

import Entry from './pages/Entry'
import TicketScanner from './pages/TicketScanner'
import Layout from './pages/Layout'
import Allocation from './pages/Allocation'
import Tickets from './pages/Tickets'
import Active from './pages/Active'
import Exit from './pages/Exit'
import History from './pages/History'
import Reservations from './pages/Reservations'
import Navigation from './pages/Navigation'
import PublicNavigation from './pages/PublicNavigation'
import Settings from './pages/Settings'

import Sensors from './pages/Sensors'
import Mismatches from './pages/Mismatches'
import Notifications from './pages/Notifications'
import SystemHealth from './pages/SystemHealth'

import {
  api,
  getAuthToken,
  clearAuthToken
} from './services/api'

function Workspace() {
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)

  const [spaces, setSpaces] = useState([])
  const [sessions, setSessions] = useState([])
  const [alerts] = useState([])

  const location = useLocation()
  const navigate = useNavigate()

  const path = location.pathname
  const go = target => navigate(target)

  // Public routes are rendered after all hooks to preserve hook order.
  const navigationMatch = path.match(/^\/navigate\/([^/]+)\/?$/)
  const driverMatch = path.match(/^\/driver\/([^/]+)\/?$/)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      if (!getAuthToken()) {
        if (active) setAuthChecking(false)
        return
      }

      try {
        const user = await api.auth.me()

        if (active) {
          setCurrentUser(user)
          setAuthenticated(true)
        }
      } catch {
        clearAuthToken()

        if (active) {
          setCurrentUser(null)
          setAuthenticated(false)
        }
      } finally {
        if (active) setAuthChecking(false)
      }
    }

    restoreSession()

    return () => {
      active = false
    }
  }, [])

  const loadRealSessions = useCallback(async () => {
    const [sessionResult, vehicleResult, slotResult] =
      await Promise.allSettled([
        api.sessions.list(),
        api.vehicles.list(),
        api.parking.slots({ availableOnly: false })
      ])

    let backendSlots = []

    if (slotResult.status === 'fulfilled') {
      const response = slotResult.value
      backendSlots = Array.isArray(response)
        ? response
        : response?.slots || []

      const backendSpaces = backendSlots.map(slot => {
        const displayCode =
          slot.display_code ||
          slot.slot_number ||
          `Bay ${slot.id}`

        const floorValue =
          typeof slot.floor === 'string'
            ? slot.floor
            : slot.floor?.name || slot.floor_name || ''

        const floorMatch = displayCode.match(/^(B\d+|GF|G|L\d+)/i)

        return {
          ...slot,
          id: displayCode,
          parking_slot_id: slot.id,
          floor: String(floorValue || floorMatch?.[1] || '').toUpperCase(),
          status: slot.status || (slot.is_available ? 'AVAILABLE' : 'UNKNOWN'),
          zone: slot.zone || 'A'
        }
      })

      if (backendSpaces.length) setSpaces(backendSpaces)
    } else {
      console.error('Unable to load parking bays:', slotResult.reason)
    }

    if (vehicleResult.status === 'rejected') {
      console.error('Unable to load vehicles:', vehicleResult.reason)
    }

    const vehicleResponse =
      vehicleResult.status === 'fulfilled' ? vehicleResult.value : null

    const vehicles = Array.isArray(vehicleResponse)
      ? vehicleResponse
      : vehicleResponse?.vehicles || []

    const vehicleMap = new Map(
      vehicles.map(vehicle => [vehicle.id, vehicle])
    )

    if (sessionResult.status === 'rejected') {
      console.error('Unable to load sessions:', sessionResult.reason)
      return []
    }

    const sessionResponse = sessionResult.value
    const backendSessions = Array.isArray(sessionResponse)
      ? sessionResponse
      : sessionResponse?.sessions || []

    const slotMap = new Map(
      backendSlots.map(slot => [slot.id, slot])
    )

    const realSessions = backendSessions.map(session => {
      const vehicle = vehicleMap.get(session.vehicle_id)
      const slot = slotMap.get(session.parking_slot_id)

      return {
        sessionId: session.id,
        ticket: `SESSION-${session.id}`,
        vehicle: vehicle?.vehicle_number || 'Vehicle unavailable',
        bay:
          slot?.display_code ||
          slot?.slot_number ||
          `Bay ${session.parking_slot_id}`,
        entry: session.started_at
          ? new Date(session.started_at).toLocaleString('en-IN')
          : 'Unknown',
        status: session.status,
        customer:
          currentUser?.full_name ||
          currentUser?.name ||
          currentUser?.email ||
          'Signed-in user',
        type: vehicle?.vehicle_type || 'Vehicle',
        startedAt: session.started_at,
        endedAt: session.ended_at,
        parkingSlotId: session.parking_slot_id,
        vehicleId: session.vehicle_id
      }
    })

    setSessions(realSessions)
    return realSessions
  }, [currentUser])

  useEffect(() => {
    if (!authenticated) return

    loadRealSessions().catch(error => {
      console.error('Unable to refresh parking data:', error)
    })
  }, [authenticated, loadRealSessions])

  function handleLogin(user) {
    setCurrentUser(user)
    setAuthenticated(true)
    navigate('/dashboard')
  }

  function handleLogout() {
    clearAuthToken()
    setCurrentUser(null)
    setAuthenticated(false)
    setSessions([])
    navigate('/login')
  }

  async function createSession() {
    await loadRealSessions()
  }

  async function processExit(sessionId) {
    if (!sessionId) {
      throw new Error('This session does not have a valid backend ID.')
    }

    await api.sessions.exit(Number(sessionId))
    await loadRealSessions()
  }

  if (navigationMatch) {
    return <PublicNavigation />
  }

  if (driverMatch) {
    return (
      <Navigate
        to={path.replace(/^\/driver\//, '/navigate/')}
        replace
      />
    )
  }

  if (path === '/') return <Landing />
  if (path === '/signup') return <SignUp />

  if (path === '/login') {
    if (authenticated) return <Navigate to="/dashboard" replace />
    return <Login onLogin={handleLogin} />
  }

  if (authChecking) {
    return (
      <div className="login-page">
        <div className="login-panel">
          <p>Checking your SpotSync session...</p>
        </div>
      </div>
    )
  }

  if (!authenticated) {
    return <Login onLogin={handleLogin} />
  }

  const common = {
    spaces,
    sessions,
    alerts,
    go,
    currentUser
  }

  let page

  switch (path) {
    case '/dashboard':
      page = <StaffDashboard {...common} />
      break
    case '/entry':
      page = <Entry spaces={spaces} onCreate={createSession} />
      break
    case '/layout':
      page = <Layout spaces={spaces} />
      break
    case '/allocation':
      page = <Allocation spaces={spaces} />
      break
    case '/tickets':
      page = <Tickets sessions={sessions} />
      break
    case '/ticket-scanner':
      page = <TicketScanner />
      break
    case '/active':
      page = <Active sessions={sessions} go={go} />
      break
    case '/exit':
      page = <Exit sessions={sessions} onExit={processExit} />
      break
    case '/history':
      page = <History sessions={sessions} />
      break
    case '/reservations':
      page = <Reservations />
      break
    case '/navigation':
      page = <Navigation spaces={spaces} />
      break
    case '/settings':
      page = <Settings />
      break
    case '/sensors':
      page = <Sensors />
      break
    case '/mismatches':
      page = <Mismatches />
      break
    case '/notifications':
      page = <Notifications />
      break
    case '/system-health':
      page = <SystemHealth />
      break
    default:
      page = <Navigate to="/dashboard" replace />
  }

  return (
    <Shell
      path={path}
      onNavigate={go}
      onLogout={handleLogout}
    >
      {page}
    </Shell>
  )
}

export default function App() {
  return (
    <SpotSyncProvider>
      <BrowserRouter>
        <Workspace />
      </BrowserRouter>
    </SpotSyncProvider>
  )
}

