import {
  LayoutDashboard,
  ClipboardPlus,
  CarFront,
  Map,
  Sparkles,
  Ticket,
  ParkingCircle,
  LogOut,
  History,
  Navigation,
  Settings,
  ChevronLeft,
} from 'lucide-react'

const navigationItems = [
  {
    label: 'Dashboard',
    path: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'New Entry',
    path: '/new-entry',
    icon: ClipboardPlus,
  },
  {
    label: 'Parking Layout',
    path: '/parking-layout',
    icon: CarFront,
  },
  {
    label: 'Smart Allocation',
    path: '/allocation',
    icon: Sparkles,
  },
  {
    label: 'Digital Tickets',
    path: '/ticket',
    icon: Ticket,
  },
  {
    label: 'Active Parking',
    path: '/active-parking',
    icon: ParkingCircle,
  },
  {
    label: 'Exit Management',
    path: '/exit-management',
    icon: LogOut,
  },
  {
    label: 'History',
    path: '/history',
    icon: History,
  },
  {
    label: 'Mall Navigation',
    path: '/navigation',
    icon: Navigation,
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]

function Sidebar({ activePath, onNavigate, collapsed = false }) {
  const currentPath = activePath || window.location.pathname

  const handleNavigation = (event, path) => {
    event.preventDefault()

    if (onNavigate) {
      onNavigate(path)
    } else {
      window.history.pushState({}, '', path)
      window.dispatchEvent(new PopStateEvent('popstate'))
    }
  }

  return (
    <aside className={`staff-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <CarFront size={25} strokeWidth={2.2} />
        </div>

        {!collapsed && (
          <div className="sidebar-brand-text">
            <span>SpotSync</span>
            <small>SMART PARKING</small>
          </div>
        )}
      </div>

      <div className="sidebar-section-label">
        {!collapsed && 'WORKSPACE'}
      </div>

      <nav className="sidebar-navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPath === item.path

          return (
            <a
              key={item.path}
              href={item.path}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={(event) => handleNavigation(event, item.path)}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={20} strokeWidth={1.9} />
              {!collapsed && <span>{item.label}</span>}
            </a>
          )
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-system-status">
          <span className="status-indicator" />
          {!collapsed && (
            <div>
              <strong>System Online</strong>
              <small>Parking system active</small>
            </div>
          )}
        </div>

        <button
          type="button"
          className="sidebar-collapse-button"
          title="Collapse sidebar"
        >
          <ChevronLeft size={18} />
          {!collapsed && <span>Collapse sidebar</span>}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar