import React from 'react'
import { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CarFront, CheckCircle2, ChevronDown, CircleHelp, Clock3, Gauge, Grid2X2, History, LayoutDashboard, LogOut, Map, MapPin, ParkingCircle, Plus, Settings, ShieldCheck, Ticket, Users, Wrench, X } from 'lucide-react'

export const navItems = [
  ['Dashboard','/dashboard',LayoutDashboard],['New Entry','/entry',Plus],['Parking Layout','/layout',Grid2X2],
  ['Smart Allocation','/allocation',Gauge],['Digital Tickets','/tickets',Ticket],['Active Parking','/active',CarFront],
  ['Exit Management','/exit',LogOut],['History','/history',History],['Mall Navigation','/navigation',Map],['Settings','/settings',Settings],['Mismatch Management','/mismatches',AlertTriangle],['System Health','/system-health',Activity]

]
export function Brand({small=false}) { return <div className={'brand '+(small?'brand-small':'')}><span className="brand-mark"><ParkingCircle size={25}/></span><span>Spot<span className="brand-accent">Sync</span></span></div> }
export function Status({value}) { return <span className={'status status-'+String(value).toLowerCase().replaceAll(' ','-')}>{value}</span> }
export function PageTitle({eyebrow='STAFF CONSOLE',title,subtitle,action}) { return <div className="page-title"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div> }
export function Card({title,subtitle,action,children,className=''}) { return <section className={'card '+className}><div className="card-head"><div><h3>{title}</h3>{subtitle&&<p>{subtitle}</p>}</div>{action}</div>{children}</section> }
export function StatCard({label,value,change,icon:Icon,tone='violet'}) { return <div className="stat-card"><div className="stat-top"><span>{label}</span><span className={'stat-icon '+tone}><Icon size={19}/></span></div><strong>{value}</strong><small>{change}</small></div> }
export function Button({children,variant='primary',onClick,icon:Icon,disabled=false,type='button'}) { return <button type={type} disabled={disabled} className={'btn btn-'+variant} onClick={onClick}>{Icon&&<Icon size={17}/>} {children}</button> }
export function EmptyState({title,detail}) { return <div className="empty-state"><CircleHelp size={25}/><b>{title}</b><span>{detail}</span></div> }
export function Topbar({onLogout}) { return <header className="topbar"><div className="topbar-left"><span className="live-dot"/> Staff operations <span className="topbar-divider"/> Tuesday, 17 November 2026</div><div className="topbar-right"><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><div className="staff-avatar">ST</div><div className="staff-meta"><b>Staff STF-2041</b><small>Parking supervisor</small></div><ChevronDown size={15}/><button className="logout-link" onClick={onLogout}><LogOut size={16}/> Logout</button></div></header> }
export function Sidebar({path,onNavigate}) { return <aside className="sidebar"><Brand/><div className="side-label">WORKSPACE</div><nav>{navItems.map(([label,to,Icon])=><button key={to} className={'nav-link '+(path===to?'active':'')} onClick={()=>onNavigate(to)}><Icon size={18}/><span>{label}</span>{label==='Alerts'&&<i/>}</button>)}</nav><div className="sidebar-bottom"><div className="sidebar-illustration"><ParkingCircle size={34}/><span>SMART PARKING<br/>SMARTER CITY</span></div><div className="system-status"><span className="live-dot"/> Demo workspace</div></div></aside> }
export function Shell({path,onNavigate,onLogout,children}) { return <div className="app-shell"><Sidebar path={path} onNavigate={onNavigate}/><div className="main-shell"><Topbar onLogout={onLogout}/><main className="main-content">{children}</main></div></div> }
export function Table({headers,children}) { return <div className="table-wrap"><table><thead><tr>{headers.map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{children}</tbody></table></div> }
export { Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, BarChart3, Bell, CarFront, CheckCircle2, Clock3, MapPin, ShieldCheck, Ticket, Users, Wrench, X }
