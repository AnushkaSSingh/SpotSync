import React, { useMemo, useState } from 'react'
import { Download, Printer, Search, Ticket, X } from 'lucide-react'
import { PageTitle, Card, Status, Table, Button } from '../components/Shared'

function value(...items) {
  const found = items.find(item => item !== undefined && item !== null && String(item).trim() !== '')
  return found === undefined ? '—' : String(found)
}

function csvCell(input) {
  return `"${String(input ?? '').replace(/"/g, '""')}"`
}

export default function Tickets({ sessions = [] }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sessions.filter(session => {
      const text = [
        session.ticket, session.ticket_id, session.sessionId, session.id,
        session.vehicle, session.registration_number,
        session.customer, session.bay, session.status
      ].map(item => String(item ?? '')).join(' ').toLowerCase()

      return !q || text.includes(q)
    })
  }, [sessions, query])

  function exportCsv() {
    const columns = ['Ticket ID', 'Vehicle', 'Customer', 'Parking Bay', 'Entry Time', 'Status']
    const lines = [
      columns.map(csvCell).join(','),
      ...rows.map(session => [
        value(session.ticket, session.ticket_id, session.sessionId, session.id),
        value(session.vehicle, session.registration_number, session.vehicle_number),
        value(session.customer, session.customer_name, session.owner_name),
        value(session.bay, session.slot_label, session.slot_name),
        value(session.entry, session.entry_time, session.started_at),
        value(session.status, session.state)
      ].map(csvCell).join(','))
    ]

    const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], {
      type: 'text/csv;charset=utf-8;'
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spotsync-tickets.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function printTicket(session) {
    setSelected(session)
    window.setTimeout(() => window.print(), 100)
  }

  const ticketId = session => value(session.ticket, session.ticket_id, session.sessionId, session.id)
  const vehicle = session => value(session.vehicle, session.registration_number, session.vehicle_number)
  const customer = session => value(session.customer, session.customer_name, session.owner_name)
  const bay = session => value(session.bay, session.slot_label, session.slot_name)
  const entry = session => value(session.entry, session.entry_time, session.started_at)
  const status = session => value(session.status, session.state)

  return (
    <>
      <PageTitle
        title="Digital tickets"
        subtitle="Search, review, export and print parking session tickets."
      />

      <Card title="Ticket register" subtitle={`${rows.length} matching records`}>
        <div className="search-row">
          <div className="search-box">
            <Search />
            <input
              aria-label="Search tickets"
              placeholder="Search by ticket, vehicle, customer or bay"
              value={query}
              onChange={event => setQuery(event.target.value)}
            />
          </div>
          <Button variant="outline" icon={Download} onClick={exportCsv}>
            Export CSV
          </Button>
        </div>

        {rows.length === 0 ? (
          <div className="empty-state" role="status">
            <Ticket size={28} />
            <h3>No tickets found</h3>
            <p>
              {sessions.length
                ? 'Try another search term.'
                : 'Tickets will appear here when parking sessions are available from the backend.'}
            </p>
          </div>
        ) : (
          <Table headers={['TICKET ID', 'VEHICLE', 'CUSTOMER', 'PARKING BAY', 'ENTRY TIME', 'STATUS', 'ACTIONS']}>
            {rows.map((session, index) => (
              <tr key={ticketId(session) === '—' ? index : ticketId(session)}>
                <td><b>{ticketId(session)}</b></td>
                <td>{vehicle(session)}</td>
                <td>{customer(session)}</td>
                <td>{bay(session)}</td>
                <td>{entry(session)}</td>
                <td><Status value={status(session)} /></td>
                <td>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => setSelected(session)}
                  >
                    <Ticket size={16} /> View
                  </button>
                  <button
                    type="button"
                    className="table-action"
                    onClick={() => printTicket(session)}
                  >
                    <Printer size={16} /> Print
                  </button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {selected && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setSelected(null)
          }}
        >
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ticket-detail-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="ticket-detail-title">Parking ticket</h2>
                <p>Session ticket details</p>
              </div>
              <button
                type="button"
                className="table-action"
                aria-label="Close ticket details"
                onClick={() => setSelected(null)}
              >
                <X size={18} />
              </button>
            </div>

            <dl className="ticket-detail-list">
              <div><dt>Ticket ID</dt><dd>{ticketId(selected)}</dd></div>
              <div><dt>Vehicle</dt><dd>{vehicle(selected)}</dd></div>
              <div><dt>Customer</dt><dd>{customer(selected)}</dd></div>
              <div><dt>Parking bay</dt><dd>{bay(selected)}</dd></div>
              <div><dt>Entry time</dt><dd>{entry(selected)}</dd></div>
              <div><dt>Status</dt><dd>{status(selected)}</dd></div>
            </dl>

            <p className="ticket-note">
              Secure QR codes are issued and validated by the backend. This
              register does not create or expose QR tokens.
            </p>

            <div className="search-row">
              <Button variant="outline" icon={Printer} onClick={() => window.print()}>
                Print details
              </Button>
              <Button onClick={() => setSelected(null)}>Close</Button>
            </div>
          </section>
        </div>
      )}

      <style>{`
        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: grid;
          place-items: center;
          padding: 18px;
          background: rgba(15, 23, 42, .55);
        }
        .modal-card {
          width: min(100%, 520px);
          max-height: 90vh;
          overflow: auto;
          padding: 22px;
          border-radius: 14px;
          background: white;
          color: #172033;
          box-shadow: 0 20px 60px rgba(0,0,0,.2);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
        }
        .modal-header h2 { margin: 0; font-size: 20px; }
        .modal-header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
        .ticket-detail-list { margin: 0; }
        .ticket-detail-list div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-bottom: 1px solid #edf0f4;
        }
        .ticket-detail-list dt { color: #64748b; font-size: 13px; }
        .ticket-detail-list dd {
          margin: 0;
          text-align: right;
          font-size: 13px;
          font-weight: 600;
          overflow-wrap: anywhere;
        }
        .ticket-note {
          margin: 16px 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.5;
        }
        .empty-state {
          display: grid;
          justify-items: center;
          gap: 8px;
          padding: 36px 12px;
          color: #64748b;
          text-align: center;
        }
        .empty-state h3 { margin: 4px 0 0; color: #172033; }
        .empty-state p { margin: 0; font-size: 13px; }
        @media print {
          body * { visibility: hidden !important; }
          .modal-card, .modal-card * { visibility: visible !important; }
          .modal-backdrop {
            position: absolute;
            inset: 0;
            display: block;
            padding: 0;
            background: white;
          }
          .modal-card {
            width: 100%;
            max-height: none;
            box-shadow: none;
          }
          .modal-header button, .search-row { display: none !important; }
        }
      `}</style>
    </>
  )
}

