import React, { useCallback, useEffect, useState } from 'react'
import PublicNavigation from './pages/PublicNavigation'
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom'
import {
  initialAlerts,
  initialSpaces
} from './data/mockData'

import { Shell } from './components/Shared'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Entry from './pages/Entry'
import Layout from './pages/Layout'
import Allocation from './pages/Allocation'
import Tickets from './pages/Tickets'
import Active from './pages/Active'
import Exit from './pages/Exit'
import History from './pages/History'
import Navigation from './pages/Navigation'
import Settings from './pages/Settings'
import Reservations from './pages/Reservations'
import {
  api,
  getAuthToken,
  clearAuthToken
} from './services/api'

function Workspace() {
  const [authenticated, setAuthenticated] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  
  
  const [spaces, setSpaces] = useState(initialSpaces)
  const [sessions, setSessions] = useState([])
  const [alerts, setAlerts] = useState(initialAlerts)

  const location = useLocation()
  const navigate = useNavigate()

  const go = path => navigate(path)
  const path = location.pathname
  const driverMatch = path.match(/^\/driver\/([^/]+)\/?$/)

  useEffect(() => {
    let active = true

    async function restoreSession() {
      const token = getAuthToken()

      if (!token) {
        if (active) {
          setAuthenticated(false)
          setAuthChecking(false)
        }
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
        if (active) {
          setAuthChecking(false)
        }
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

    // Load real parking bays independently of session/vehicle failures.
    if (slotResult.status === 'fulfilled') {
      const slotResponse = slotResult.value
      const backendSlots = Array.isArray(slotResponse)
        ? slotResponse
        : slotResponse?.slots || []

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

      if (backendSpaces.length > 0) {
        setSpaces(backendSpaces)
        console.info(
          `Navigation received ${backendSpaces.length} real parking bays.`
        )
      } else {
        console.warn('Parking slots API returned no parking bays.')
      }
    } else {
      console.error('Unable to load real parking bays:', slotResult.reason)
    }

    const vehicleResponse =
      vehicleResult.status === 'fulfilled'
        ? vehicleResult.value
        : null

    if (vehicleResult.status === 'rejected') {
      console.error('Unable to load vehicles:', vehicleResult.reason)
    }

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

    const slotResponse =
      slotResult.status === 'fulfilled' ? slotResult.value : null

    const backendSlots = Array.isArray(slotResponse)
      ? slotResponse
      : slotResponse?.slots || []

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

    async function load() {
      try {
        await loadRealSessions()
      } catch (error) {
        console.error(
          'Unable to load parking sessions:',
          error
        )
      }
    }

    load()
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
    try {
      await loadRealSessions()
    } catch (error) {
      console.error(
        'Session was created, but refreshing the session list failed:',
        error
      )
    }
  }

  async function processExit(sessionId) {
    if (!sessionId) {
      throw new Error(
        'This session does not have a valid backend ID.'
      )
    }

    await api.sessions.exit(Number(sessionId))

    try {
      await loadRealSessions()
    } catch (error) {
      console.error(
        'Exit succeeded, but refreshing sessions failed:',
        error
      )

      setSessions(previous =>
        previous.map(session =>
          Number(session.sessionId) === Number(sessionId)
            ? {
                ...session,
                status: 'COMPLETED',
                endedAt: new Date().toISOString()
              }
            : session
        )
      )
    }
  }

  const navigationMatch = path.match(/^\/navigate\/([^/]+)\/?$/)

  // Public driver navigation route — no staff login required.
  if (navigationMatch) {
    return <PublicNavigation />
  }
  // Public driver ticket route â€” no staff login required.
  if (driverMatch) {
    return (
      <Navigate
        to={path.replace(/^\/driver\//, '/navigate/')}
        replace
      />
    )
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

  if (path === '/login') {
    return <Navigate to="/dashboard" replace />
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
      page = <Dashboard {...common} />
      break

    case '/entry':
      page = (
        <Entry
          spaces={spaces}
          onCreate={createSession}
        />
      )
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

    case '/active':
      page = <Active sessions={sessions} go={go} />
      break

    case '/exit':
      page = (
        <Exit
          sessions={sessions}
          onExit={processExit}
        />
      )
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

    default:
      page = <Dashboard {...common} />
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
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  )
}




