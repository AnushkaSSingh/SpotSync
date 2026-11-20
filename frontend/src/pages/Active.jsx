import React,{useMemo,useState} from 'react'
import {CarFront,Clock3,CalendarClock,ArrowRight,CheckCircle2} from 'lucide-react'
import {PageTitle,Card,Status,Table,Button,StatCard} from '../components/Shared'
export default function Active({sessions=[],go}) {
 const [checked,setChecked]=useState([])
 const parked=[{vehicle:'DL3C 7781',ticket:'SS-0412',bay:'B1-A2',entry:'10:42 AM',status:'Parked'},{vehicle:'HR26 DK 2091',ticket:'SS-0405',bay:'B2-A1',entry:'09:20 AM',status:'Parked'},{vehicle:'DL8C 5521',ticket:'SS-0409',bay:'B2-A2',entry:'10:20 AM',status:'Mismatch'}]
 const [held]=useState([{bay:'B1-A3',note:'Awaiting driver',time:'Reserved 11:15 AM'},{bay:'B2-A3',note:'DL8C 5521',time:'Reserved 10:20 AM'}])
 return <div className="pdf-page">
  <div className="active-welcome"><div><span className="eyebrow">RIGHT NOW · 10:58 AM</span><h1>Who’s parked today</h1><p>3 cars on the floor, 2 bays held for arrivals.</p></div><span className="staff-chip">SF · Staff STF-2041</span></div>
  <div className="pdf-stat-row"><div className="pdf-mini-stat"><span>Average stay</span><b>1h 12m</b></div><div className="pdf-mini-stat"><span>Longest stay</span><b>1h 38m</b></div><div className="pdf-mini-stat"><span>Next arrival</span><b>B1-A3</b></div></div>
  <div className="pdf-active-grid">
   <Card title="On the floor" subtitle="Vehicles currently parked"><Table headers={['VEHICLE','TICKET','BAY','SINCE','STATUS','ACTION']}>{parked.map((r,i)=><tr key={r.ticket}><td><b>{r.vehicle}</b></td><td>{r.ticket}</td><td>{r.bay}</td><td>{r.entry}</td><td><Status value={r.status}/></td><td><button className="pdf-text-btn" onClick={()=>go('/exit')}>{i===2?'Resolve':'Check out'} <ArrowRight size={13}/></button></td></tr>)}</Table></Card>
   <Card title="Held for arrivals" subtitle="Reserved spaces awaiting arrival">{held.map((r)=><div className="held-row" key={r.bay}><div className="held-icon"><CarFront size={17}/></div><div><b>{r.bay} · {r.note}</b><span>{r.time}</span></div><Status value="Reserved"/></div>)}<Button variant="outline" onClick={()=>go('/allocation')}>View allocation</Button></Card>
  </div>
 </div>
}
