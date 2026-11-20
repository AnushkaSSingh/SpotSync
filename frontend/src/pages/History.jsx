import React, { useMemo, useState } from 'react'
import { Download, Search } from 'lucide-react'
import { Card, Button, Table } from '../components/Shared'

const initialRecords = [
  { ticket:'SS-0398', plate:'HR26 DK 2091', slot:'B2-A4', in:'08:40', out:'10:15', minutes:95, fee:95, daysAgo:0 },
  { ticket:'SS-0391', plate:'DL1C 4420', slot:'B1-A1', in:'08:05', out:'09:30', minutes:85, fee:85, daysAgo:0 },
  { ticket:'SS-0387', plate:'UP14 BT 3302', slot:'B1-A3', in:'07:50', out:'08:55', minutes:65, fee:60, daysAgo:1 },
  { ticket:'SS-0380', plate:'DL5S 9017', slot:'B2-A2', in:'07:30', out:'08:10', minutes:40, fee:40, daysAgo:2 },
  { ticket:'SS-0376', plate:'DL3C 1188', slot:'B1-A2', in:'07:12', out:'07:48', minutes:36, fee:40, daysAgo:4 }
]

function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth()+1).padStart(2,'0')
  const d = String(date.getDate()).padStart(2,'0')
  return `${y}-${m}-${d}`
}

function parseDate(value) {
  const [y,m,d] = value.split('-').map(Number)
  return new Date(y,m-1,d)
}

function formatDate(value) {
  return parseDate(value).toLocaleDateString('en-IN',{
    day:'2-digit',month:'short'
  })
}

function formatDuration(minutes) {
  const hours = Math.floor(minutes/60)
  const mins = minutes%60
  return hours ? `${hours}h ${String(mins).padStart(2,'0')}m` : `${mins}m`
}

export default function History() {
  const today = new Date()
  const todayKey = dateKey(today)

  const [query,setQuery] = useState('')
  const [range,setRange] = useState('Today')
  const [from,setFrom] = useState(todayKey)
  const [to,setTo] = useState(todayKey)

  const records = useMemo(() => initialRecords.map(record => {
    const date = new Date(today)
    date.setDate(date.getDate()-record.daysAgo)
    return {...record,date:dateKey(date)}
  }), [])

  const rangeDates = useMemo(() => {
    const end = parseDate(todayKey)
    const start = new Date(end)

    if(range === 'Last 7 days') start.setDate(start.getDate()-6)
    if(range === 'Last month') start.setDate(start.getDate()-29)
    if(range === 'Custom range') {
      return {start:parseDate(from),end:parseDate(to)}
    }

    return {start,end}
  },[range,from,to,todayKey])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()

    return records.filter(record => {
      const date = parseDate(record.date)
      const matchesDate = date >= rangeDates.start && date <= rangeDates.end
      const matchesSearch = !term ||
        `${record.ticket} ${record.plate} ${record.slot}`.toLowerCase().includes(term)

      return matchesDate && matchesSearch
    }).sort((a,b)=>b.date.localeCompare(a.date))
  },[records,rangeDates,query])

  const totalRevenue = filtered.reduce((sum,r)=>sum+r.fee,0)
  const averageStay = filtered.length
    ? Math.round(filtered.reduce((sum,r)=>sum+r.minutes,0)/filtered.length)
    : 0

  const peakHours = filtered.length ? '6–9 PM' : '—'

  const chartDays = useMemo(() => {
    const end = rangeDates.end
    return Array.from({length:7},(_,index)=>{
      const date = new Date(end)
      date.setDate(date.getDate()-(6-index))
      const key = dateKey(date)
      return {
        key,
        label:date.toLocaleDateString('en-IN',{weekday:'short'}),
        count:filtered.filter(r=>r.date===key).length
      }
    })
  },[filtered,rangeDates])

  const maxCount = Math.max(1,...chartDays.map(d=>d.count))

  function exportCSV() {
    const rows = [
      ['Date','Ticket','Plate','Slot','In','Out','Stay','Fee'],
      ...filtered.map(r=>[
        r.date,r.ticket,r.plate,r.slot,r.in,r.out,
        formatDuration(r.minutes),r.fee
      ])
    ]

    const csv = rows.map(row =>
      row.map(value=>`"${String(value).replaceAll('"','""')}"`).join(',')
    ).join('\r\n')

    const blob = new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'})
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'spotsync-history.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="pdf-page history-page">
      <div className="history-heading">
        <div>
          <span className="eyebrow">
            PARKING HISTORY · {today.toLocaleDateString('en-IN',{
              weekday:'long',day:'2-digit',month:'short',year:'numeric'
            }).toUpperCase()}
          </span>
          <h1>Everything that came and went</h1>
          <p>Search by plate, ticket or slot, or pick a date range.</p>
        </div>
        <Button icon={Download} onClick={exportCSV}>Export CSV</Button>
      </div>

      <div className="pdf-stat-row four">
        <div className="pdf-mini-stat">
          <span>Visits in range</span><b>{filtered.length}</b>
        </div>
        <div className="pdf-mini-stat">
          <span>Revenue in range</span><b>₹{totalRevenue}</b>
        </div>
        <div className="pdf-mini-stat">
          <span>Average stay</span><b>{filtered.length?formatDuration(averageStay):'—'}</b>
        </div>
        <div className="pdf-mini-stat">
          <span>Peak hours</span><b>{peakHours}</b>
        </div>
      </div>

      <div className="history-tools">
        <div className="history-tabs">
          {['Today','Last 7 days','Last month','Custom range'].map(item=>(
            <button
              key={item}
              className={range===item?'selected':''}
              onClick={()=>setRange(item)}
            >{item}</button>
          ))}
        </div>

        <label className="pdf-search">
          <Search size={16}/>
          <input
            value={query}
            onChange={e=>setQuery(e.target.value)}
            placeholder="Search vehicle, ticket ID or slot..."
          />
        </label>

        {range==='Custom range'&&(
          <div className="date-range">
            <input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)}/>
            <span>to</span>
            <input type="date" value={to} min={from} max={todayKey} onChange={e=>setTo(e.target.value)}/>
          </div>
        )}
      </div>

      <Card title="Visit records" subtitle="Completed parking sessions">
        {filtered.length ? (
          <Table headers={['DATE','TICKET','PLATE','SLOT','IN','OUT','STAY','FEE']}>
            {filtered.map(record=>(
              <tr key={record.ticket}>
                <td>{formatDate(record.date)}</td>
                <td><b>{record.ticket}</b></td>
                <td>{record.plate}</td>
                <td>{record.slot}</td>
                <td>{record.in}</td>
                <td>{record.out}</td>
                <td>{formatDuration(record.minutes)}</td>
                <td>₹{record.fee}</td>
              </tr>
            ))}
          </Table>
        ) : (
          <div className="empty-state">
            <b>No matching visits</b>
            <span>Try another date range or search term.</span>
          </div>
        )}
      </Card>

      <div className="pdf-history-bottom">
        <Card title="Entries this week" subtitle="Daily completed visits">
          <div className="week-chart">
            {chartDays.map(day=>(
              <div key={day.key}>
                <span
                  title={`${day.count} visits`}
                  style={{height:`${day.count?Math.max(12,day.count/maxCount*88):3}%`}}
                />
                <small>{day.label}</small>
              </div>
            ))}
          </div>
        </Card>

        <div className="history-insight">
          <b>{filtered.length ? 'Parking activity summary' : 'No activity in this range'}</b>
          <p>
            {filtered.length
              ? `${filtered.length} completed visits and ₹${totalRevenue} recorded in the selected period.`
              : 'Choose another date range to view parking activity.'}
          </p>
        </div>
      </div>
    </div>
  )
}
