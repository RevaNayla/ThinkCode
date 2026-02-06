import LayoutAdmin from '../components/LayoutAdmin';
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';


export default function ManageMateri(){
const [materi, setMateri] = useState([]);
useEffect(()=>{ api.get('/admin/materi').then(r=>setMateri(r.data.data)) },[]);


return (
<LayoutAdmin>
<h1>Materi</h1>
<div style={{ display:'flex', gap:12 }}>
{materi.map(m=> (
<div key={m.id} style={{ width:280, background:'#fff', padding:12, borderRadius:8 }}>
<h3>{m.title}</h3>
<p style={{ fontSize:13 }}>{m.description}</p>
<div style={{ marginTop:8 }}>
<button onClick={()=>window.location.href=`/admin/materi/${m.id}`}>Edit</button>
<button onClick={()=>api.delete(`/admin/materi/${m.id}`)}>Delete</button>
</div>
</div>
))}
</div>
</LayoutAdmin>
);
}