import LayoutAdmin from '../components/LayoutAdmin';
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';


export default function Submissions(){
const [subs, setSubs] = useState([]);
useEffect(()=>{ api.get('/admin/submissions').then(r=>setSubs(r.data.data)) },[]);


return (
<LayoutAdmin>
<h1>Submissions</h1>
<div>
{subs.map(s=> (
<div key={s.id} style={{ background:'#fff', padding:12, borderRadius:8, marginBottom:10 }}>
<div style={{ display:'flex', justifyContent:'space-between' }}>
<div><b>{s.userName}</b> - {s.materiTitle}</div>
<div>{s.status}</div>
</div>
<div style={{ marginTop:8 }}>{s.note}</div>
<div style={{ marginTop:10 }}>
<button onClick={()=>api.post(`/admin/submissions/${s.id}/feedback`, {score:100, comment:'Bagus'})}>Beri Feedback</button>
</div>
</div>
))}
</div>
</LayoutAdmin>
);
}