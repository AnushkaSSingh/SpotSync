import { useNavigate } from 'react-router-dom'
import '../styles/staff-dashboard.css'
import {
  CarFront,
  CircleParking,
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock3,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Bell,
  MapPin,
} from 'lucide-react'

const floors = [
  {
    id: 'B1',
    name: 'Basement 1',
    spaces: [
      { id: 'B1-A1', status: 'available' },
      { id: 'B1-A2', status: 'occupied' },
      { id: 'B1-A3', status: 'reserved' },
      { id: 'B1-A4', status: 'unknown' },
    ],
  },
  {
    id: 'B2',
    name: 'Basement 2',
    spaces: [
      { id: 'B2-A1', status: 'occupied' },
      { id: 'B2-A2', status: 'unknown' },
      { id: 'B2-A3', status: 'reserved' },
    ],
  },
]

const activities = [
  { plate: 'DL3C 7781', action: 'Entry confirmed', slot: 'B1-A2', time: '10:42 AM', type: 'success' },
  { plate: 'HR26 DK 2091', action: 'Exit completed', slot: 'B2-A1', time: '10:15 AM', type: 'success' },
  { plate: 'UP14 BT 3302', action: 'Entry confirmed', slot: 'B1-A1', time: '09:58 AM', type: 'purple' },
]

const allSpaces = floors.flatMap((floor) => floor.spaces)
const total = allSpaces.length
const available = allSpaces.filter((space) => space.status === 'available').length
const occupied = allSpaces.filter((space) => space.status === 'occupied').length
const attention = allSpaces.filter((space) => space.status === 'unknown').length

const statusLabels = {
  available: 'Free',
  occupied: 'Occupied',
  reserved: 'Reserved',
  unknown: 'Needs attention',
}

function StaffDashboard() {
  const navigate = useNavigate()

  const cards = [
    { title: 'Total parking spaces', value: total, subtitle: 'Across 2 floors', icon: CircleParking, color: 'purple' },
    { title: 'Available now', value: available, subtitle: 'Ready for allocation', icon: CheckCircle2, color: 'green' },
    { title: 'Occupied', value: occupied, subtitle: 'Vehicles detected', icon: CarFront, color: 'blue' },
    { title: 'Needs attention', value: attention, subtitle: 'Sensor or mismatch alerts', icon: AlertTriangle, color: 'orange' },
  ]

  return (
    <div className="staff-dashboard">
      <section className="dashboard-welcome">
        <div>
          <span className="dashboard-eyebrow">SUNDAY, 15 NOV 2026 / OPERATIONS OVERVIEW</span>
          <h2>Good morning, Staff 2041</h2>
          <p>Here's how your car park is moving right now.</p>
        </div>
        <button className="dashboard-primary-button" onClick={() => navigate('/entry')}>
          + New entry
        </button>
      </section>

      <section className="dashboard-summary-grid">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <article className="dashboard-stat-card" key={card.title}>
              <div className="dashboard-stat-top">
                <span>{card.title}</span>
                <div className={`dashboard-stat-icon ${card.color}`}>
                  <Icon size={20} />
                </div>
              </div>
              <h2>{card.value}</h2>
              <p>{card.subtitle}</p>
            </article>
          )
        })}
      </section>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel floor-plan-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Live floor plan</h2>
              <p>Tap a bay to inspect its status.</p>
            </div>
            <button className="dashboard-text-button" onClick={() => navigate('/layout')}>
              View layout <ArrowRight size={15} />
            </button>
          </div>

          {floors.map((floor) => (
            <div className="dashboard-floor" key={floor.id}>
              <span className="dashboard-floor-label">{floor.name}</span>
              <div className="dashboard-bay-grid">
                {floor.spaces.map((space) => (
                  <button
                    type="button"
                    key={space.id}
                    className={`dashboard-bay ${space.status}`}
                    onClick={() => navigate('/layout')}
                  >
                    <strong>{space.id}</strong>
                    <span>{statusLabels[space.status]}</span>
                    {space.status === 'occupied' && <CarFront size={19} />}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="floor-legend">
            <span><i className="legend-dot available" /> Free</span>
            <span><i className="legend-dot occupied" /> Occupied</span>
            <span><i className="legend-dot reserved" /> Reserved</span>
            <span><i className="legend-dot unknown" /> Attention</span>
          </div>
        </article>

        <article className="dashboard-panel attention-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Attention needed</h2>
              <p>Resolve issues before the next rush.</p>
            </div>
            <Bell size={20} className="panel-heading-icon" />
          </div>

          <div className="dashboard-alert mismatch-alert">
            <div>
              <span className="alert-tag">MISMATCH</span>
              <strong>Parking mismatch detected</strong>
              <p>A vehicle's detected location differs from its assigned bay.</p>
              <button onClick={() => navigate('/mismatches')}>
                Review mismatch <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="dashboard-alert warning-alert">
            <div>
              <span className="alert-tag">SENSOR OFFLINE</span>
              <strong>Sensor needs attention</strong>
              <p>Check sensor status and the affected parking bay.</p>
              <button onClick={() => navigate('/system-health')}>
                Check system health <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Recent activity</h2>
              <p>Live entry and exit updates.</p>
            </div>
            <Activity size={20} className="panel-heading-icon" />
          </div>

          <div className="activity-list">
            {activities.map((item) => (
              <div className="activity-item" key={item.plate}>
                <div className={`activity-icon ${item.type}`}>
                  <CarFront size={19} />
                </div>
                <div className="activity-details">
                  <strong>{item.plate}</strong>
                  <span>{item.action}</span>
                </div>
                <div className="activity-slot">
                  <strong>{item.slot}</strong>
                  <time>{item.time}</time>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-panel smart-allocation-panel">
          <div className="dashboard-section-heading">
            <div>
              <h2>Smart allocation</h2>
              <p>Recommended bay for the next arrival.</p>
            </div>
            <Sparkles size={20} className="panel-heading-icon" />
          </div>

          <div className="allocation-recommendation">
            <div className="recommended-bay">
              <MapPin size={24} />
              <strong>B1-A1</strong>
            </div>
            <div>
              <strong>Nearest to entrance</strong>
              <p>Low congestion · Check live availability</p>
              <span className="match-score">Suggested bay</span>
            </div>
          </div>

          <button className="dashboard-text-button" onClick={() => navigate('/allocation')}>
            View allocation <ArrowRight size={15} />
          </button>
        </article>
      </section>

      <p className="dashboard-demo-note">
        Dashboard preview · Sample display data. Live values require backend integration.
      </p>
    </div>
  )
}

export default StaffDashboard