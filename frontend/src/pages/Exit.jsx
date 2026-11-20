import React, { useMemo, useState } from 'react'
import {
  CheckCircle2,
  LogOut,
  Search,
  AlertTriangle,
  X
} from 'lucide-react'

import {
  PageTitle,
  Card,
  Button,
  Status,
  Table
} from '../components/Shared'

export default function Exit({ sessions = [], onExit }) {
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [done, setDone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const activeSessions = useMemo(
    () =>
      sessions.filter(
        session => String(session.status).toUpperCase() === 'ACTIVE'
      ),
    [sessions]
  )

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase()

    return activeSessions.filter(session => {
      const searchText = [
        session.vehicle,
        session.ticket,
        session.bay,
        session.customer
      ]
        .join(' ')
        .toLowerCase()

      return searchText.includes(query)
    })
  }, [activeSessions, q])

  const current =
    rows.find(session => String(session.sessionId) === String(selected)) ||
    rows[0] ||
    null

  function selectSession(session) {
    setSelected(session.sessionId)
    setConfirming(false)
    setError('')
    setDone('')
  }

  async function confirmExit() {
    if (!current || loading || !confirming) return

    if (!current.sessionId) {
      setError('The backend session ID is missing. This session cannot be exited.')
      return
    }

    if (String(current.status).toUpperCase() !== 'ACTIVE') {
      setError('This session is no longer active. Refresh the session list.')
      setConfirming(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      await onExit(current.sessionId)
      setDone(String(current.sessionId))
      setConfirming(false)
    } catch (err) {
      setError(err.message || 'Unable to complete vehicle exit.')
      setConfirming(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <PageTitle
        title="Exit management"
        subtitle="Review and confirm a parking session before recording a vehicle departure."
      />

      <div className="active-grid">
        <Card
          title="Find a vehicle"
          subtitle="Select the active session presented at the exit desk"
        >
          <div className="search-box full">
            <Search />
            <input
              placeholder="Search ticket, registration or bay"
              value={q}
              onChange={event => {
                setQ(event.target.value)
                setSelected(null)
                setConfirming(false)
                setError('')
              }}
            />
          </div>

          <Table headers={['TICKET', 'VEHICLE', 'BAY', 'STATUS']}>
            {rows.map(session => (
              <tr
                key={session.sessionId}
                className={
                  String(selected) === String(session.sessionId)
                    ? 'row-selected'
                    : ''
                }
                onClick={() => selectSession(session)}
              >
                <td><b>{session.ticket || `Session ${session.sessionId}`}</b></td>
                <td>{session.vehicle || 'Unknown vehicle'}</td>
                <td>{session.bay || '—'}</td>
                <td><Status value={session.status} /></td>
              </tr>
            ))}
          </Table>

          {rows.length === 0 && (
            <div className="empty-state">
              <b>No active sessions found</b>
              <span>
                {q
                  ? 'Try another registration number, ticket ID or bay.'
                  : 'There are currently no active vehicles available for exit.'}
              </span>
            </div>
          )}
        </Card>

        <Card
          title="Confirm vehicle exit"
          subtitle="Check the session details before submitting the exit request"
        >
          {current ? (
            <>
              <div className="exit-vehicle">
                <div className="vehicle-circle">
                  <LogOut />
                </div>

                <h2>{current.vehicle || 'Unknown vehicle'}</h2>
                <Status value={current.status} />
              </div>

              <div className="detail-rows">
                <div>
                  <span>Ticket ID</span>
                  <b>{current.ticket || '—'}</b>
                </div>

                <div>
                  <span>Backend session ID</span>
                  <b>{current.sessionId ?? 'Missing'}</b>
                </div>

                <div>
                  <span>Parking bay</span>
                  <b>{current.bay || '—'}</b>
                </div>

                <div>
                  <span>Entry time</span>
                  <b>{current.entry || '—'}</b>
                </div>

                <div>
                  <span>Customer</span>
                  <b>{current.customer || '—'}</b>
                </div>
              </div>

              {confirming && (
                <div style={confirmationStyle}>
                  <AlertTriangle size={20} />
                  <b>Confirm this vehicle's exit?</b>
                  <span>
                    This sends an exit request for {current.vehicle || 'this vehicle'}.
                    The backend must process the session and confirm the parking
                    space's vacancy.
                  </span>

                  <div style={actionsStyle}>
                    <Button
                      onClick={confirmExit}
                      disabled={loading}
                    >
                      {loading ? 'Submitting...' : 'Yes, confirm exit'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => {
                        setConfirming(false)
                        setError('')
                      }}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {!confirming && !done && (
                <Button
                  onClick={() => {
                    setError('')
                    setConfirming(true)
                  }}
                  icon={CheckCircle2}
                  disabled={loading}
                >
                  Confirm vehicle exit
                </Button>
              )}

              {error && (
                <p className="error-note" role="alert">
                  {error}
                </p>
              )}

              {done === String(current.sessionId) && (
                <div style={successStyle}>
                  <CheckCircle2 size={18} />
                  <div>
                    <b>Exit request accepted by the backend.</b>
                    <span>
                      The session refresh has been requested. Parking-space
                      vacancy must be confirmed by the backend; this page
                      does not release the space itself.
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <b>No active session selected</b>
              <span>Choose an active vehicle from the list.</span>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}

const confirmationStyle = {
  display: 'grid',
  gap: 10,
  padding: 14,
  marginTop: 16,
  borderRadius: 10,
  background: 'rgba(220, 150, 50, 0.12)',
  fontSize: 13
}

const actionsStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 4
}

const successStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: 10,
  padding: 14,
  marginTop: 14,
  borderRadius: 10,
  background: 'rgba(40, 160, 100, 0.10)',
  fontSize: 13
}
