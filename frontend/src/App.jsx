import React, { useState } from 'react'
import {
  BrowserRouter,
  useLocation,
  useNavigate,
  Navigate
} from 'react-router-dom'

import { initialAlerts, initialSessions, initialSpaces } from './data/mockData'
import { Shell } from './components/Shared'

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
import Mismatches from './pages/Mismatches'

function Workspace() {
  const [authenticated, setAuthenticated] = useState(false)
  const [spaces, setSpaces] = useState(initialSpaces)
  const [sessions, setSessions] = useState(initialSessions)
  const [alerts] = useState(initialAlerts)

  const location = useLocation()
  const navigate = useNavigate()
  const go = path => navigate(path)
  const path = location.pathname

  function createSession(item) {
    setSessions(prev => [item, ...prev])
    setSpaces(prev => prev.map(space =>
      space.id === item.bay
        ? { ...space, status: 'RESERVED' }
        : space
    ))
  }

  function processExit(ticket) {
    const session = sessions.find(s => s.ticket === ticket)
    if (!session) return

    setSessions(prev => prev.filter(s => s.ticket !== ticket))
    setSpaces(prev => prev.map(space =>
      space.id === session.bay
        ? { ...space, status: 'AVAILABLE', vehicle: '' }
        : space
    ))
  }

  if (path === '/login' || !authenticated) {
    return (
      <Login onLogin={() => {
        setAuthenticated(true)
        navigate('/dashboard')
      }} />
    )
  }

  let page

  switch (path) {
    case '/dashboard':
      page = <StaffDashboard />
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
    case '/system-health':
      page = <SystemHealth />
      break
    default:
      return <Navigate to="/dashboard" replace />
  }

  return (
    <Shell
      path={path}
      onNavigate={go}
      onLogout={() => {
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
    <BrowserRouter>
      <Workspace />
    </BrowserRouter>
  )
}
