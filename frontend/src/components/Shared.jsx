import React, { useEffect, useState } from 'react'

import {
  Activity,
  AlertTriangle,
  Bell,
  CarFront,
  ChevronDown,
  CircleHelp,
  Grid2X2,
  History,
  LayoutDashboard,
  LogOut,
  MapPin,
  ParkingCircle,
  Plus,
  Settings as SettingsIcon,
  Ticket,
  Gauge,
  Map,
  X,
  DoorOpen,
  Radio,
  ClipboardList,
  HeartPulse,
} from 'lucide-react'

// ==========================================
// SIDEBAR NAVIGATION
// ==========================================

export const navItems = [
  ['Dashboard', '/dashboard', LayoutDashboard],
  ['New Entry', '/entry', Plus],
  ['Parking Layout', '/layout', Grid2X2],
  ['Sensor Monitoring', '/sensors', Radio],
  ['Mismatch Management', '/mismatches', ClipboardList],
  ['Allocation', '/allocation', Gauge],
  ['Active Parking', '/active', CarFront],
  ['Exit Management', '/exit', DoorOpen],
  ['History', '/history', History],
  ['System Health', '/system-health', HeartPulse],
  ['Settings', '/settings', SettingsIcon],
]

// ==========================================
// BRAND
// ==========================================

export function Brand({ small = false }) {
  return (
    <div className={'brand ' + (small ? 'brand-small' : '')}>
      <span className="brand-mark">S</span>
      <span>
        Spot<span className="brand-accent">Sync</span>
      </span>
    </div>
  )
}

// ==========================================
// STATUS
// ==========================================

export function Status({ value }) {
  return (
    <span
      className={
        'status status-' +
        String(value).toLowerCase().replaceAll(' ', '-')
      }
    >
      {value}
    </span>
  )
}

// ==========================================
// PAGE TITLE
// ==========================================

export function PageTitle({
  eyebrow = 'STAFF CONSOLE',
  title,
  subtitle,
  action,
}) {
  return (
    <div className="page-title">
      <div>
        <div className="eyebrow">{eyebrow}</div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  )
}

// ==========================================
// CARD
// ==========================================

export function Card({
  title,
  subtitle,
  action,
  children,
  className = '',
}) {
  return (
    <section className={'card ' + className}>
      <div className="card-head">
        <div>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ==========================================
// STAT CARD
// ==========================================

export function StatCard({
  label,
  value,
  change,
  icon: Icon,
  tone = 'violet',
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={'stat-icon ' + tone}>
          {Icon && <Icon size={19} />}
        </span>
      </div>

      <strong>{value}</strong>
      <small>{change}</small>
    </div>
  )
}

// ==========================================
// BUTTON
// ==========================================

export function Button({
  children,
  variant = 'primary',
  onClick,
  icon: Icon,
  disabled = false,
  type = 'button',
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={'btn btn-' + variant}
      onClick={onClick}
    >
      {Icon && <Icon size={17} />}
      {children}
    </button>
  )
}

// ==========================================
// EMPTY STATE
// ==========================================

export function EmptyState({ title, detail }) {
  return (
    <div className="empty-state">
      <CircleHelp size={25} />
      <b>{title}</b>
      <span>{detail}</span>
    </div>
  )
}

// ==========================================
// TOPBAR
// ==========================================

export function Topbar({ onLogout, onNavigate }) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formattedDate = currentTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  })

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
  })

  return (
    <header className="topbar">
      <div className="topbar-left">
        <span className="live-dot" />
        Staff operations
        <span className="topbar-divider" />
        {formattedDate} · {formattedTime}
      </div>

      <div className="topbar-right">
        <button
          className="icon-button"
          aria-label="Notifications"
          onClick={() => onNavigate?.('/system-health')}
        >
          <Bell size={19} />
          <i />
        </button>

        <div className="staff-avatar">ST</div>

        <div className="staff-meta">
          <b>Staff STF-2041</b>
          <small>Parking supervisor</small>
        </div>

        <button className="logout-link" onClick={onLogout}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  )
}

// ==========================================
// SIDEBAR
// ==========================================

export function Sidebar({ path, onNavigate }) {
  return (
    <aside className="sidebar">
      <Brand />

      <div className="side-label">WORKSPACE</div>

      <nav>
        {navItems.map(([label, to, Icon]) => (
          <button
            key={to}
            className={'nav-link ' + (path === to ? 'active' : '')}
            onClick={() => onNavigate(to)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-illustration">
          Smart parking.
          <br />
          Smarter city.
        </div>

        <div className="system-status">
          <span className="live-dot" />
          Staff workspace
        </div>
      </div>
    </aside>
  )
}

// ==========================================
// MAIN APPLICATION SHELL
// AUTOMATIC SCROLLING
// ==========================================

export function Shell({
  path,
  onNavigate,
  onLogout,
  children,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        path={path}
        onNavigate={onNavigate}
      />

      <div className="main-shell">
        <Topbar
          onLogout={onLogout}
          onNavigate={onNavigate}
        />

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  )
}

// ==========================================
// TABLE
// ==========================================

export function Table({ headers, children }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>

        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

// ==========================================
// ICON EXPORTS
// ==========================================

export {
  Activity,
  AlertTriangle,
  Bell,
  CarFront,
  Ticket,
  Map,
  MapPin,
  SettingsIcon as Settings,
  Gauge,
  Grid2X2,
  X,
  ChevronDown,
  ParkingCircle,
  Plus,
  DoorOpen,
  History,
  LayoutDashboard,
  Radio,
  ClipboardList,
  HeartPulse,
}