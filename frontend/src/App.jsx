import React, { useEffect, useState } from 'react'
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom'

import { initialAlerts, initialSessions, initialSpaces } from './data/mockData'
import { SpotSyncProvider } from './context/SpotSyncContext'
import { Shell } from './components/Shared'
import { getToken, getCurrentUser, logoutUser } from './services/api'

import Landing from './pages/Landing'
import SignUp from './pages/SignUp'
import Login from './pages/Login'

import StaffDashboard from './pages/StaffDashboard'
import Entry from './pages/Entry'
import Layout from './pages/Layout'
import Allocation from './pages/Allocation'
import Tickets from './pages/Tickets'
import Active from './pages/Active'
import Exit from './pages/Exit'
import History from './pages/History'
import Navigation from './pages/Navigation'
import Settings from './pages/Settings'
import SystemHealth from './pages/SystemHealth'
import Sensors from './pages/Sensors'
import Mismatches from './pages/Mismatches'
import Notifications from './pages/Notifications'

function Workspace() {
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  const [spaces, setSpaces] = useState(initialSpaces)
  const [sessions, setSessions] = useState(initialSessions)
  const [alerts] = useState(initialAlerts)

  const location = useLocation()
  const navigate = useNavigate()
  const go = path => navigate(path)
  const path = location.pathname

  useEffect(() => {
    let active = true

    async function verifySession() {
      if (!getToken()) {
        if (active) setCheckingAuth(false)
        return
      }

      try {
        await getCurrentUser()

        if (active) {
          setAuthenticated(true)
        }
      } catch (error) {
        if (active) {
          setAuthenticated(false)
        }
      } finally {
        if (active) {
          setCheckingAuth(false)
        }
      }
    }

    verifySession()

    return () => {
      active = false
    }
  }, [])

  if (path === '/') return <Landing />
  if (path === '/signup') return <SignUp />

  if (path === '/login') {
    return (
      <Login
        onLogin={() => {
          setAuthenticated(true)
          navigate('/dashboard')
        }}
      />
    )
  }

  if (checkingAuth) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        color: '#60449a',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 600
      }}>
        Verifying your SpotSync session...
      </div>
    )
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />
  }

  function createSession(item) {
    setSessions(previous => [item, ...previous])
    setSpaces(previous => previous.map(space =>
      space.id === item.bay
        ? { ...space, status: 'RESERVED' }
        : space
    ))
  }

  function processExit(ticket) {
    const session = sessions.find(item => item.ticket === ticket)
    if (!session) return

    setSessions(previous => previous.filter(item => item.ticket !== ticket))
    setSpaces(previous => previous.map(space =>
      space.id === session.bay
        ? { ...space, status: 'AVAILABLE', vehicle: '' }
        : space
    ))
  }

  let page

  switch (path) {
    case '/dashboard':
      page = <StaffDashboard spaces={spaces} sessions={sessions} alerts={alerts} />
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
    case '/active':
      page = <Active sessions={sessions} go={go} />
      break
    case '/exit':
      page = <Exit sessions={sessions} onExit={processExit} />
      break
    case '/history':
      page = <History sessions={sessions} />
      break
    case '/navigation':
      page = <Navigation spaces={spaces} />
      break
    case '/settings':
      page = <Settings />
      break
    case '/mismatches':
      page = <Mismatches />
      break
    case '/sensors':
      page = <Sensors />
      break
    case '/system-health':
      page = <SystemHealth />
      break
    case '/notifications':
      page = <Notifications />
      break
    default:
      return <Navigate to="/dashboard" replace />
  }

  return (
    <Shell
      path={path}
      onNavigate={go}
      onLogout={() => {
        logoutUser()
        setAuthenticated(false)
        navigate('/login')
      }}
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
