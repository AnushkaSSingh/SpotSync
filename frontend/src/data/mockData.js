export const initialSpaces = [
  ...['B1','B2'].flatMap((floor, fi) => [1,2,3,4].map((n) => ({
    id: `${floor}-A${n}`, floor, zone: 'A', status: (
      fi === 0 ? ['OCCUPIED','RESERVED','AVAILABLE','OUT_OF_SERVICE'] :
      ['OCCUPIED','OCCUPIED','UNKNOWN','AVAILABLE']
    )[n-1], sensor: `S${fi*4+n}`, vehicle: fi === 0 && n === 1 ? 'HR26 DK 7788' : fi === 1 && n === 2 ? 'UP16 BT 3090' : ''
  })))
]
export const initialSessions = [
  { ticket:'SS-0412', vehicle:'UP80 CD 4410', bay:'B1-A2', entry:'10:42 AM', status:'RESERVED', customer:'Aarav Sharma', type:'Car' },
  { ticket:'SS-0409', vehicle:'DL8C 5521', bay:'B2-A3', entry:'10:31 AM', status:'MISMATCH', customer:'Meera Kapoor', type:'SUV' },
  { ticket:'SS-0401', vehicle:'HR26 DK 7788', bay:'B1-A1', entry:'09:50 AM', status:'OCCUPIED', customer:'Rohan Verma', type:'Car' },
  { ticket:'SS-0395', vehicle:'UP16 BT 3090', bay:'B2-A2', entry:'09:12 AM', status:'OCCUPIED', customer:'Ananya Singh', type:'Car' },
]
export const initialAlerts = [
  { id:'ALT-204', title:'Parking mismatch detected', detail:'DL8C 5521 assigned to B1-A1; detected at B2-A3.', severity:'High', time:'2 min ago', type:'Mismatch' },
  { id:'ALT-203', title:'Sensor reliability warning', detail:'Sensor S7 has not sent a reliable reading.', severity:'Medium', time:'8 min ago', type:'Sensor' },
  { id:'ALT-201', title:'Space unavailable', detail:'B1-A4 is marked out of service.', severity:'Low', time:'24 min ago', type:'Maintenance' },
]
