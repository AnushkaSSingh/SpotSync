import '../styles/staff-dashboard.css'
import {
  CarFront,
  ParkingCircle,
  CircleParking,
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ArrowRight,
  Clock3,
  MapPin,
  Sparkles,
  Navigation,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Users,
  Bell,
} from 'lucide-react'

const summaryCards = [
  {
    title: 'Total Parking Spaces',
    value: '08',
    subtitle: 'Across 2 floors',
    icon: CircleParking,
    color: 'purple',
  },
  {
    title: 'Available Spaces',
    value: '05',
    subtitle: 'Ready for allocation',
    icon: ParkingCircle,
    color: 'green',
  },
  {
    title: 'Occupied Spaces',
    value: '02',
    subtitle: 'Vehicles detected',
    icon: CarFront,
    color: 'blue',
  },
  {
    title: 'Reserved Spaces',
    value: '01',
    subtitle: 'Awaiting vehicle arrival',
    icon: Clock3,
    color: 'pink',
  },
  {
    title: 'Sensor Alerts',
    value: '01',
    subtitle: 'Needs staff attention',
    icon: AlertTriangle,
    color: 'orange',
  },
]

const floors = [
  {
    name: 'Basement 1',
    id: 'B1',
    spaces: [
      { id: 'B1-A1', status: 'occupied' },
      { id: 'B1-A2', status: 'available' },
      { id: 'B1-A3', status: 'reserved' },
      { id: 'B1-A4', status: 'available' },
    ],
  },
  {
    name: 'Basement 2',
    id: 'B2',
    spaces: [
      { id: 'B2-A1', status: 'available' },
      { id: 'B2-A2', status: 'occupied' },
      { id: 'B2-A3', status: 'available' },
      { id: 'B2-A4', status: 'unknown' },
    ],
  },
]

const activities = [
  {
    title: 'Vehicle entered parking',
    description: 'Vehicle assigned to B1-A1',
    time: '10:42 AM',
    icon: CarFront,
    type: 'success',
  },
  {
    title: 'Parking space reserved',
    description: 'Space B1-A3 allocated',
    time: '10:35 AM',
    icon: CheckCircle2,
    type: 'purple',
  },
  {
    title: 'Sensor reliability alert',
    description: 'Sensor S8 needs attention',
    time: '10:21 AM',
    icon: AlertTriangle,
    type: 'warning',
  },
]

function SummaryCard({ card }) {
  const Icon = card.icon

  return (
    <article className="dashboard-stat-card">
      <div className="dashboard-stat-top">
        <span>{card.title}</span>
        <div className={`dashboard-stat-icon ${card.color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2>{card.value}</h2>
      <p>{card.subtitle}</p>
    </article>
  )
}

function FloorStatusCard({ floor }) {
  return (
    <article className="floor-status-card">
      <div className="floor-status-heading">
        <div>
          <span className="floor-label">{floor.id}</span>
          <h3>{floor.name}</h3>
        </div>

        <span className="floor-space-count">
          {floor.spaces.length} Spaces
        </span>
      </div>

      <div className="floor-space-grid">
        {floor.spaces.map((space) => (
          <div
            key={space.id}
            className={`floor-space ${space.status}`}
          >
            <CarFront size={22} />
            <strong>{space.id}</strong>
            <span>
              {space.status === 'unknown'
                ? 'Unknown'
                : space.status.charAt(0).toUpperCase() +
                  space.status.slice(1)}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function StaffDashboard() {
  return (
    <div className="staff-dashboard">

      {/* Welcome section */}
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">
            SPOTSYNC OPERATIONS
          </span>

          <h2>Welcome back, Staff!</h2>

          <p>
            Here's what's happening across your mall parking system.
          </p>
        </div>

        <div className="dashboard-date">
          <Clock3 size={17} />
          <span>Live Parking Overview</span>
        </div>
      </section>

      {/* Summary cards */}
      <section className="dashboard-summary-grid">
        {summaryCards.map((card) => (
          <SummaryCard key={card.title} card={card} />
        ))}
      </section>

      {/* Floor status */}
      <section className="dashboard-section">
        <div className="dashboard-section-heading">
          <div>
            <h2>Floor Status</h2>
            <p>Live overview of parking spaces across floors.</p>
          </div>

          <button type="button" className="dashboard-text-button">
            View Parking Layout <ArrowRight size={16} />
          </button>
        </div>

        <div className="floor-status-grid">
          {floors.map((floor) => (
            <FloorStatusCard key={floor.id} floor={floor} />
          ))}
        </div>

        <div className="floor-legend">
          <span><i className="legend-dot available" /> Available</span>
          <span><i className="legend-dot occupied" /> Occupied</span>
          <span><i className="legend-dot reserved" /> Reserved</span>
          <span><i className="legend-dot unknown" /> Unknown</span>
        </div>
      </section>

      {/* Activity and alerts */}
      <section className="dashboard-two-column">

        <div className="dashboard-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest parking system updates.</p>
            </div>

            <Activity size={20} className="panel-heading-icon" />
          </div>

          <div className="activity-list">
            {activities.map((activity, index) => {
              const Icon = activity.icon

              return (
                <div className="activity-item" key={index}>
                  <div className={`activity-icon ${activity.type}`}>
                    <Icon size={19} />
                  </div>

                  <div className="activity-details">
                    <strong>{activity.title}</strong>
                    <span>{activity.description}</span>
                  </div>

                  <time>{activity.time}</time>
                </div>
              )
            })}
          </div>
        </div>

        <div className="dashboard-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Alerts & Notifications</h2>
              <p>Items that require staff attention.</p>
            </div>

            <Bell size={20} className="panel-heading-icon" />
          </div>

          <div className="dashboard-alert warning-alert">
            <div className="alert-icon">
              <AlertTriangle size={19} />
            </div>

            <div>
              <strong>Sensor S8 reliability issue</strong>
              <p>
                B2-A4 has unreliable sensor readings.
                Space availability cannot be confirmed.
              </p>
              <span>Sensor Monitoring</span>
            </div>
          </div>

          <div className="dashboard-alert mismatch-alert">
            <div className="alert-icon">
              <CarFront size={19} />
            </div>

            <div>
              <strong>Parking mismatch detected</strong>
              <p>
                A vehicle may be detected in a different
                space than its assigned location.
              </p>
              <button type="button">
                Review mismatch <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* Smart allocation */}
      <section className="dashboard-feature-grid">

        <article className="dashboard-feature-card">
          <div className="feature-card-icon purple-feature">
            <Sparkles size={22} />
          </div>

          <div className="feature-card-content">
            <span className="feature-label">SMART ALLOCATION</span>
            <h3>Intelligent Parking Allocation</h3>
            <p>
              Find suitable parking spaces using availability,
              floor congestion and distance from entrances.
            </p>

            <button type="button" className="feature-action">
              Open Allocation <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

        {/* Mall navigation */}
        <article className="dashboard-feature-card">
          <div className="feature-card-icon blue-feature">
            <Navigation size={22} />
          </div>

          <div className="feature-card-content">
            <span className="feature-label">MALL NAVIGATION</span>
            <h3>Smart Mall Navigation</h3>
            <p>
              Help staff locate parking spaces and identify
              routes through the mall.
            </p>

            <button type="button" className="feature-action">
              Explore Navigation <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

        {/* Analytics */}
        <article className="dashboard-feature-card">
          <div className="feature-card-icon pink-feature">
            <TrendingUp size={22} />
          </div>

          <div className="feature-card-content">
            <span className="feature-label">PARKING ANALYTICS</span>
            <h3>Parking Insights</h3>
            <p>
              Review floor utilization, peak parking hours
              and availability trends.
            </p>

            <button type="button" className="feature-action">
              View Analytics <ArrowUpRight size={16} />
            </button>
          </div>
        </article>

      </section>

      {/* Quick overview */}
      <section className="dashboard-bottom-card">
        <div className="bottom-card-icon">
          <MapPin size={23} />
        </div>

        <div>
          <h3>Parking System Overview</h3>
          <p>
            2 floors · 8 parking spaces · 8 sensor points
          </p>
        </div>

        <div className="system-online-badge">
          <span />
          System Overview
        </div>
      </section>

      <p className="dashboard-demo-note">
        Dashboard preview — sample display data.
        Live sensor and backend integration will be added later.
      </p>

    </div>
  )
}

export default StaffDashboard 