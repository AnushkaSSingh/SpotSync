import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  CarFront,
  Bookmark,
  AlertTriangle,
  Clock3,
  Wifi,
  Ticket,
  MapPin,
  ArrowRight,
  ParkingCircle,
  Activity,
  Layers,
  X,
  UserRound
} from 'lucide-react'

const OFFICIAL_BAYS = [
  'B1-A1',
  'B1-A2',
  'B1-A3',
  'B2-A1',
  'B2-A2',
  'B2-A3',
  'B2-A4'
]

const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    className: 'free',
    icon: CheckCircle2
  },
  OCCUPIED: {
    label: 'Occupied',
    className: 'occupied',
    icon: CarFront
  },
  RESERVED: {
    label: 'Reserved',
    className: 'reserved',
    icon: Bookmark
  },
  MISMATCH: {
    label: 'Mismatch',
    className: 'mismatch',
    icon: AlertTriangle
  },
  UNKNOWN: {
    label: 'Mismatch',
    className: 'mismatch',
    icon: AlertTriangle
  },
  OUT_OF_SERVICE: {
    label: 'Unavailable',
    className: 'unavailable',
    icon: AlertTriangle
  }
}

function normalizeStatus(status) {
  return String(status || 'AVAILABLE').toUpperCase()
}

function IconBox({ icon: Icon, className = '' }) {
  return (
    <div className={`pl-icon-box ${className}`}>
      <Icon size={21} />
    </div>
  )
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.AVAILABLE

  return (
    <span className={`pl-status ${config.className}`}>
      <span className="pl-status-dot" />
      {config.label}
    </span>
  )
}

export default function Layout({ spaces = [] }) {
  const navigate = useNavigate()

  const [selected, setSelected] = useState('B2-A3')
  const [floorFilter, setFloorFilter] = useState('BOTH')
  const [profileOpen, setProfileOpen] = useState(false)

  const bays = useMemo(() => {
    return OFFICIAL_BAYS.map(id => {
      const existing = spaces.find(space => space.id === id)

      return {
        id,
        floor: id.substring(0, 2),
        status: normalizeStatus(existing?.status),
        vehicle: existing?.vehicle || '',
        sensor: existing?.sensor || 'Online'
      }
    })
  }, [spaces])

  const current = bays.find(bay => bay.id === selected) || bays[0]

  const counts = {
    free: bays.filter(b => b.status === 'AVAILABLE').length,
    occupied: bays.filter(b => b.status === 'OCCUPIED').length,
    reserved: bays.filter(b => b.status === 'RESERVED').length,
    mismatch: bays.filter(b =>
      ['MISMATCH', 'UNKNOWN'].includes(b.status)
    ).length
  }

  const floors = [
    {
      id: 'B1',
      name: 'Basement 1',
      subtitle: 'Lower parking level'
    },
    {
      id: 'B2',
      name: 'Basement 2',
      subtitle: 'Upper parking level'
    }
  ].filter(floor =>
    floorFilter === 'BOTH' || floorFilter === floor.id
  )

  function handleBayAction() {
    if (!current) return

    switch (current.status) {
      case 'AVAILABLE':
        navigate('/entry')
        break

      case 'OCCUPIED':
        navigate('/exit')
        break

      case 'RESERVED':
        navigate('/allocation')
        break

      case 'MISMATCH':
      case 'UNKNOWN':
        navigate('/mismatches')
        break

      default:
        navigate('/system-health')
    }
  }

  function getActionLabel() {
    if (!current) return 'Select a bay'

    switch (current.status) {
      case 'AVAILABLE':
        return 'Start new entry'

      case 'OCCUPIED':
        return 'Process vehicle exit'

      case 'RESERVED':
        return 'View allocation'

      case 'MISMATCH':
      case 'UNKNOWN':
        return 'Resolve mismatch'

      default:
        return 'View system health'
    }
  }

  const statistics = [
    {
      label: 'Available spaces',
      value: counts.free,
      icon: CheckCircle2,
      color: 'green'
    },
    {
      label: 'Occupied',
      value: counts.occupied,
      icon: CarFront,
      color: 'red'
    },
    {
      label: 'Reserved',
      value: counts.reserved,
      icon: Bookmark,
      color: 'yellow'
    },
    {
      label: 'Mismatches',
      value: counts.mismatch,
      icon: AlertTriangle,
      color: 'purple'
    }
  ]

  return (
    <div className="parking-layout-page">

      {/* HEADER */}
      <header className="pl-header">
        <div>
          <div className="pl-eyebrow">
            STAFF CONSOLE / PARKING OPERATIONS
          </div>

          <h1>Parking Layout</h1>

          <p>
            Monitor parking availability and vehicle occupancy
            across both basement levels.
          </p>
        </div>

        <div className="pl-header-right">
          <div className="pl-live-indicator">
            <span />
            Live layout
          </div>

          {/* WORKING STAFF PROFILE BUTTON */}
          <button
            type="button"
            className="pl-staff-profile-button"
            onClick={() => setProfileOpen(true)}
            aria-label="Open staff profile"
          >
            <div className="pl-staff-avatar">
              ST
            </div>

            <div className="pl-staff-info">
              <strong>Staff STF-2041</strong>
              <span>Parking Supervisor</span>
            </div>
          </button>
        </div>
      </header>

      {/* STAFF PROFILE MODAL */}
      {profileOpen && (
        <div
          className="pl-profile-overlay"
          onClick={() => setProfileOpen(false)}
        >
          <div
            className="pl-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pl-profile-title"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              className="pl-profile-close"
              onClick={() => setProfileOpen(false)}
              aria-label="Close staff profile"
            >
              <X size={19} />
            </button>

            <div className="pl-profile-icon">
              <UserRound size={30} />
            </div>

            <h2 id="pl-profile-title">Staff Profile</h2>
            <p className="pl-profile-subtitle">
              Staff account information
            </p>

            <div className="pl-profile-details">
              <div>
                <span>Staff ID</span>
                <strong>STF-2041</strong>
              </div>

              <div>
                <span>Role</span>
                <strong>Parking Supervisor</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>Parking Operations</strong>
              </div>

              <div>
                <span>Account Status</span>
                <strong className="pl-account-active">
                  Active
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="pl-profile-done"
              onClick={() => setProfileOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* STATISTICS */}
      <section className="pl-stat-grid">
        {statistics.map(item => {
          const Icon = item.icon

          return (
            <article className="pl-stat-card" key={item.label}>
              <IconBox
                icon={Icon}
                className={item.color}
              />

              <div>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            </article>
          )
        })}
      </section>

      {/* FLOOR FILTER */}
      <section className="pl-toolbar">
        <div className="pl-floor-tabs">
          {[
            ['BOTH', 'Both floors'],
            ['B1', 'Basement 1'],
            ['B2', 'Basement 2']
          ].map(([id, label]) => (
            <button
              key={id}
              className={floorFilter === id ? 'active' : ''}
              onClick={() => setFloorFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="pl-bay-count">
          <Layers size={16} />
          7 Official Parking Bays
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="pl-content-grid">

        {/* FLOOR LAYOUT */}
        <div className="pl-floor-container">

          {floors.map(floor => {
            const floorBays = bays.filter(
              bay => bay.floor === floor.id
            )

            const inUse = floorBays.filter(
              bay => bay.status !== 'AVAILABLE'
            ).length

            return (
              <article className="pl-floor-card" key={floor.id}>

                <div className="pl-floor-header">
                  <div>
                    <h2>{floor.name}</h2>
                    <p>{floor.subtitle}</p>
                  </div>

                  <span className="pl-floor-usage">
                    {inUse}/{floorBays.length} in use
                  </span>
                </div>

                {/* PARKING BAYS ONLY */}
                <div className={`pl-bays-grid ${floor.id.toLowerCase()}`}>
                  {floorBays.map(bay => {
                    const config =
                      STATUS_CONFIG[bay.status] ||
                      STATUS_CONFIG.AVAILABLE

                    const Icon = config.icon

                    return (
                      <button
                        key={bay.id}
                        type="button"
                        className={`
                          pl-bay-card
                          ${config.className}
                          ${selected === bay.id ? 'selected' : ''}
                        `}
                        onClick={() => setSelected(bay.id)}
                      >
                        <div className="pl-bay-top">
                          <strong>{bay.id}</strong>
                          <Icon size={20} />
                        </div>

                        <span className="pl-bay-status">
                          {config.label}
                        </span>

                        {selected === bay.id && (
                          <span className="pl-selected-label">
                            Selected
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>

              </article>
            )
          })}

          {/* LEGEND */}
          <div className="pl-legend">
            <span>
              <i className="free" />
              Available
            </span>

            <span>
              <i className="occupied" />
              Occupied
            </span>

            <span>
              <i className="reserved" />
              Reserved
            </span>

            <span>
              <i className="mismatch" />
              Mismatch
            </span>
          </div>

        </div>

        {/* SELECTED BAY DETAILS */}
        <aside className="pl-detail-card">

          <div className="pl-detail-heading">
            <div>
              <span className="pl-detail-eyebrow">
                BAY INFORMATION
              </span>

              <h2>Selected Bay</h2>
            </div>

            <ParkingCircle size={24} />
          </div>

          {current && (
            <>
              <div className="pl-selected-bay">
                <span>Parking Space</span>

                <h1>{current.id}</h1>

                <StatusBadge status={current.status} />
              </div>

              <div className="pl-detail-divider" />

              <div className="pl-detail-information">

                <div className="pl-detail-row">
                  <CarFront size={19} />
                  <span>Vehicle</span>

                  <strong>
                    {current.vehicle || '—'}
                  </strong>
                </div>

                <div className="pl-detail-row">
                  <Ticket size={19} />
                  <span>Ticket</span>
                  <strong>—</strong>
                </div>

                <div className="pl-detail-row">
                  <MapPin size={19} />
                  <span>Floor</span>

                  <strong>
                    {current.floor === 'B1'
                      ? 'Basement 1'
                      : 'Basement 2'}
                  </strong>
                </div>

                <div className="pl-detail-row">
                  <Wifi size={19} />
                  <span>Sensor</span>

                  <strong>
                    {current.sensor}
                  </strong>
                </div>

                <div className="pl-detail-row">
                  <Clock3 size={19} />
                  <span>Last updated</span>
                  <strong>Live data</strong>
                </div>

              </div>

              {/* STATUS MESSAGE */}
              {['UNKNOWN', 'MISMATCH'].includes(current.status) && (
                <div className="pl-warning-box">
                  <AlertTriangle size={19} />

                  <div>
                    <strong>Attention required</strong>

                    <p>
                      This bay requires a status and
                      vehicle-location verification.
                    </p>
                  </div>
                </div>
              )}

              {current.status === 'OUT_OF_SERVICE' && (
                <div className="pl-warning-box">
                  <AlertTriangle size={19} />

                  <div>
                    <strong>Bay unavailable</strong>

                    <p>
                      This parking bay is currently
                      out of service.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION */}
              <button
                className="pl-action-button"
                onClick={handleBayAction}
                disabled={current.status === 'OUT_OF_SERVICE'}
              >
                {getActionLabel()}
                <ArrowRight size={18} />
              </button>
            </>
          )}

        </aside>

      </section>

      {/* BOTTOM INFORMATION */}
      <section className="pl-bottom-info">

        <div>
          <Activity size={19} />

          <div>
            <strong>Parking monitoring</strong>

            <span>
              View and manage all seven official parking spaces.
            </span>
          </div>
        </div>

        <button onClick={() => navigate('/sensors')}>
          Sensor monitoring
          <ArrowRight size={16} />
        </button>

      </section>

      {/* STYLES */}
      <style>{`

        .parking-layout-page {
          width: 100%;
          color: #25213b;
          font-family: inherit;
        }

        .pl-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .pl-eyebrow,
        .pl-detail-eyebrow {
          color: #8275b8;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.4px;
          margin-bottom: 9px;
        }

        .pl-header h1 {
          font-size: 27px;
          margin: 0 0 7px;
          font-weight: 750;
        }

        .pl-header p {
          color: #858196;
          font-size: 13px;
          margin: 0;
        }

        .pl-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pl-live-indicator {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 9px 13px;
          border-radius: 20px;
          background: #eaf8f0;
          color: #258451;
          font-size: 11px;
          font-weight: 700;
        }

        .pl-live-indicator span {
          width: 7px;
          height: 7px;
          background: #35ad69;
          border-radius: 50%;
        }

        /* STAFF PROFILE BUTTON */

        .pl-staff-profile-button {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 5px 9px;
          border: 1px solid transparent;
          border-radius: 10px;
          background: transparent;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          transition: .2s ease;
        }

        .pl-staff-profile-button:hover {
          background: #f5f2fb;
          border-color: #e8e1f5;
        }

        .pl-staff-avatar {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 50%;
          background: #eae4fa;
          color: #6546aa;
          display: grid;
          place-items: center;
          font-size: 12px;
          font-weight: 800;
        }

        .pl-staff-info {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .pl-staff-info strong {
          font-size: 11px;
          color: #29243e;
        }

        .pl-staff-info span {
          font-size: 10px;
          color: #9290a0;
        }

        /* STAFF PROFILE MODAL */

        .pl-profile-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: rgba(25, 19, 45, .48);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .pl-profile-modal {
          position: relative;
          width: 100%;
          max-width: 370px;
          background: white;
          border-radius: 17px;
          padding: 30px;
          text-align: center;
          box-shadow: 0 15px 55px rgba(30, 20, 55, .2);
          animation: plModalIn .2s ease;
        }

        @keyframes plModalIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pl-profile-close {
          position: absolute;
          top: 13px;
          right: 13px;
          width: 32px;
          height: 32px;
          border: none;
          border-radius: 8px;
          background: #f4f1f9;
          color: #706783;
          display: grid;
          place-items: center;
          cursor: pointer;
        }

        .pl-profile-icon {
          width: 62px;
          height: 62px;
          margin: 0 auto 15px;
          border-radius: 50%;
          background: #eee8fa;
          color: #7451b7;
          display: grid;
          place-items: center;
        }

        .pl-profile-modal h2 {
          margin: 0;
          font-size: 20px;
          color: #29243e;
        }

        .pl-profile-subtitle {
          color: #9290a0;
          font-size: 12px;
          margin: 7px 0 22px;
        }

        .pl-profile-details {
          text-align: left;
          border: 1px solid #eeedf3;
          border-radius: 11px;
          overflow: hidden;
        }

        .pl-profile-details div {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 13px;
          border-bottom: 1px solid #eeedf3;
        }

        .pl-profile-details div:last-child {
          border-bottom: none;
        }

        .pl-profile-details span {
          font-size: 11px;
          color: #858196;
        }

        .pl-profile-details strong {
          font-size: 11px;
          color: #353047;
          text-align: right;
        }

        .pl-profile-details .pl-account-active {
          color: #29945b;
        }

        .pl-profile-done {
          width: 100%;
          margin-top: 20px;
          padding: 12px;
          border: none;
          border-radius: 8px;
          background: #7451b7;
          color: white;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .pl-profile-done:hover {
          background: #60409f;
        }

        /* STATISTICS */

        .pl-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 23px;
        }

        .pl-stat-card {
          display: flex;
          align-items: center;
          gap: 13px;
          background: white;
          border: 1px solid #eeedf3;
          border-radius: 13px;
          padding: 17px;
          min-width: 0;
        }

        .pl-icon-box {
          width: 43px;
          height: 43px;
          flex-shrink: 0;
          border-radius: 11px;
          display: grid;
          place-items: center;
        }

        .pl-icon-box.green {
          background: #e8f7ef;
          color: #29945b;
        }

        .pl-icon-box.red {
          background: #ffebeb;
          color: #d94b4b;
        }

        .pl-icon-box.yellow {
          background: #fff6d9;
          color: #bd901d;
        }

        .pl-icon-box.purple {
          background: #f0eaff;
          color: #7954bd;
        }

        .pl-stat-card div:last-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .pl-stat-card span {
          font-size: 11px;
          color: #858196;
        }

        .pl-stat-card strong {
          font-size: 23px;
          font-weight: 750;
        }

        /* TOOLBAR */

        .pl-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          margin-bottom: 19px;
        }

        .pl-floor-tabs {
          display: flex;
          gap: 5px;
          padding: 4px;
          background: #f0eef6;
          border-radius: 9px;
        }

        .pl-floor-tabs button {
          padding: 9px 16px;
          border: none;
          border-radius: 7px;
          background: transparent;
          color: #777389;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        }

        .pl-floor-tabs button.active {
          background: white;
          color: #6849ad;
          box-shadow: 0 2px 6px #25213b10;
        }

        .pl-bay-count {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #858196;
          font-size: 11px;
          font-weight: 600;
        }

        /* MAIN GRID */

        .pl-content-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 18px;
          align-items: start;
        }

        .pl-floor-container {
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .pl-floor-card,
        .pl-detail-card {
          background: white;
          border: 1px solid #eeedf3;
          border-radius: 13px;
          padding: 20px;
        }

        .pl-floor-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 17px;
        }

        .pl-floor-header h2 {
          font-size: 15px;
          margin: 0 0 5px;
        }

        .pl-floor-header p {
          font-size: 10px;
          color: #9995a8;
          margin: 0;
        }

        .pl-floor-usage {
          background: #f3f0fa;
          color: #7356aa;
          padding: 7px 10px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 700;
        }

        /* PARKING BAY COLOURS */

        .pl-bays-grid {
          display: grid;
          gap: 12px;
        }

        .pl-bays-grid.b1 {
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }

        .pl-bays-grid.b2 {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .pl-bay-card {
          min-height: 112px;
          border: 1px solid transparent;
          border-radius: 10px;
          padding: 13px 11px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          gap: 12px;
          transition: .18s ease;
          position: relative;
        }

        .pl-bay-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px #29204412;
        }

        .pl-bay-card.selected {
          outline: 2px solid #8060c4;
          outline-offset: 2px;
        }

        /* GREEN = AVAILABLE */

        .pl-bay-card.free {
          background: #e9f8ee;
          border-color: #bfe8cd;
          color: #21864c;
        }

        /* RED = OCCUPIED */

        .pl-bay-card.occupied {
          background: #ffebeb;
          border-color: #f5c3c3;
          color: #d43e3e;
        }

        /* YELLOW = RESERVED */

        .pl-bay-card.reserved {
          background: #fff7dc;
          border-color: #f0df9f;
          color: #b88a12;
        }

        /* PURPLE = MISMATCH */

        .pl-bay-card.mismatch {
          background: #f1eaff;
          border-color: #d8c5fa;
          color: #7950bd;
        }

        .pl-bay-card.unavailable {
          background: #f0f0f2;
          border-color: #dedee3;
          color: #777783;
        }

        .pl-bay-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pl-bay-top strong {
          font-size: 12px;
        }

        .pl-bay-status {
          font-size: 11px;
          font-weight: 650;
        }

        .pl-selected-label {
          position: absolute;
          right: 9px;
          bottom: 9px;
          font-size: 8px;
          opacity: .7;
        }

        /* LEGEND */

        .pl-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 17px;
          padding: 3px 2px;
        }

        .pl-legend span {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #858196;
          font-size: 10px;
        }

        .pl-legend i {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .pl-legend i.free {
          background: #35a767;
        }

        .pl-legend i.occupied {
          background: #df4444;
        }

        .pl-legend i.reserved {
          background: #e0b52f;
        }

        .pl-legend i.mismatch {
          background: #895bc7;
        }

        /* SELECTED BAY DETAILS */

        .pl-detail-card {
          position: sticky;
          top: 15px;
        }

        .pl-detail-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 23px;
          color: #7658b6;
        }

        .pl-detail-heading h2 {
          color: #29243e;
          font-size: 15px;
          margin: 0;
        }

        .pl-selected-bay {
          background: #f7f5fb;
          border-radius: 10px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }

        .pl-selected-bay > span:first-child {
          color: #89849a;
          font-size: 10px;
        }

        .pl-selected-bay h1 {
          font-size: 27px;
          margin: 0;
        }

        .pl-status {
          width: fit-content;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 9px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
        }

        .pl-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .pl-status.free {
          background: #e8f7ed;
          color: #278b51;
        }

        .pl-status.occupied {
          background: #ffebeb;
          color: #d43e3e;
        }

        .pl-status.reserved {
          background: #fff7dc;
          color: #b88a12;
        }

        .pl-status.mismatch {
          background: #f1eaff;
          color: #7950bd;
        }

        .pl-status.unavailable {
          background: #f0f0f2;
          color: #777783;
        }

        .pl-detail-divider {
          height: 1px;
          background: #efedf3;
          margin: 19px 0;
        }

        .pl-detail-information {
          display: flex;
          flex-direction: column;
          gap: 19px;
        }

        .pl-detail-row {
          display: grid;
          grid-template-columns: 19px 1fr auto;
          gap: 9px;
          align-items: center;
          color: #89849a;
        }

        .pl-detail-row span {
          font-size: 10px;
        }

        .pl-detail-row strong {
          color: #353047;
          font-size: 10px;
          text-align: right;
          overflow-wrap: anywhere;
        }

        .pl-warning-box {
          display: flex;
          gap: 10px;
          margin-top: 20px;
          padding: 12px;
          background: #f1eaff;
          border-radius: 8px;
          color: #7950bd;
        }

        .pl-warning-box strong {
          font-size: 11px;
        }

        .pl-warning-box p {
          font-size: 10px;
          line-height: 1.5;
          margin: 5px 0 0;
        }

        .pl-action-button {
          margin-top: 23px;
          width: 100%;
          padding: 13px;
          border: none;
          border-radius: 8px;
          background: #7451b7;
          color: white;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .pl-action-button:hover:not(:disabled) {
          background: #60409f;
        }

        .pl-action-button:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        /* BOTTOM INFORMATION */

        .pl-bottom-info {
          margin-top: 18px;
          background: white;
          border: 1px solid #eeedf3;
          border-radius: 11px;
          padding: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .pl-bottom-info > div {
          display: flex;
          align-items: center;
          gap: 11px;
          color: #7658b6;
        }

        .pl-bottom-info > div div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .pl-bottom-info strong {
          color: #353047;
          font-size: 11px;
        }

        .pl-bottom-info span {
          color: #9290a0;
          font-size: 10px;
        }

        .pl-bottom-info button {
          display: flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          border: none;
          color: #7451b7;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        /* RESPONSIVE */

        @media(max-width: 1050px) {
          .pl-content-grid {
            grid-template-columns: 1fr;
          }

          .pl-detail-card {
            position: static;
          }
        }

        @media(max-width: 700px) {
          .pl-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .pl-header-right {
            flex-wrap: wrap;
          }

          .pl-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pl-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .pl-floor-tabs {
            width: 100%;
          }

          .pl-floor-tabs button {
            flex: 1;
            padding: 9px 5px;
            font-size: 10px;
          }

          .pl-bays-grid.b2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .pl-bays-grid.b1 {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .pl-bay-card {
            min-height: 95px;
          }

          .pl-bottom-info {
            align-items: flex-start;
            flex-direction: column;
          }
        }

        @media(max-width: 400px) {
          .pl-bays-grid.b1 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

      `}</style>

    </div>
  )
}