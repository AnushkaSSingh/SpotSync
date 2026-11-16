import React,{useMemo,useState} from 'react'
import {BrowserRouter,useLocation,useNavigate,Navigate,Routes,Route} from 'react-router-dom'
import {initialAlerts,initialSessions,initialSpaces} from './data/mockData'
import {Shell} from './components/Shared'
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

function Workspace() {
 const [authenticated,setAuthenticated]=useState(false)
 const [spaces,setSpaces]=useState(initialSpaces)
 const [sessions,setSessions]=useState(initialSessions)
 const [alerts,setAlerts]=useState(initialAlerts)
 const location=useLocation(),navigate=useNavigate()
 const go=path=>navigate(path)
 const path=location.pathname
 function createSession(item){setSessions(s=>[item,...s]);setSpaces(prev=>prev.map(x=>x.id===item.bay?{...x,status:'RESERVED'}:x))}
 function processExit(ticket){const session=sessions.find(s=>s.ticket===ticket);if(!session)return;setSessions(s=>s.filter(x=>x.ticket!==ticket));setSpaces(prev=>prev.map(x=>x.id===session.bay?{...x,status:'AVAILABLE',vehicle:''}:x))}
 if(path==='/login'||!authenticated)return <Login onLogin={()=>{setAuthenticated(true);navigate('/dashboard')}}/>
 const common={spaces,sessions,alerts,go}
 let page
 switch(path){
  case '/dashboard': page=<Dashboard {...common}/>;break
  case '/entry': page=<Entry spaces={spaces} onCreate={createSession}/>;break
  case '/layout': page=<Layout spaces={spaces}/>;break
  case '/allocation': page=<Allocation spaces={spaces}/>;break
  case '/tickets': page=<Tickets sessions={sessions}/>;break
  case '/active': page=<Active sessions={sessions} go={go}/>;break
  case '/exit': page=<Exit sessions={sessions} onExit={processExit}/>;break
  case '/history': page=<History sessions={sessions}/>;break
  case '/navigation': page=<Navigation spaces={spaces}/>;break
  case '/settings': page=<Settings/>;break
  default: page=<Dashboard {...common}/>
 }
 return <Shell path={path} onNavigate={go} onLogout={()=>{setAuthenticated(false);navigate('/login')}}>{page}</Shell>
}
export default function App(){return <BrowserRouter><Workspace/></BrowserRouter>}
