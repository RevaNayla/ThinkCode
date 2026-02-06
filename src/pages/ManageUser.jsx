import LayoutAdmin from '../components/LayoutAdmin';
import { useEffect, useState } from 'react';
import api from '../api/axiosClient';


export default function ManageUsers(){
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);


useEffect(()=>{
api.get('/admin/users').then(r=>{ setUsers(r.data.data); setLoading(false); }).catch(()=>setLoading(false));
},[]);


return (
<LayoutAdmin>
<h1>Manage Users</h1>
{loading ? <p>Memuat...</p> : (
<table style={{ width:'100%', background:'#fff', borderRadius:8 }}>
<thead><tr><th>Nama</th><th>Email</th><th>Kelas</th><th>XP</th><th>Aksi</th></tr></thead>
<tbody>
{users.map(u=> (
<tr key={u.id}>
<td>{u.name}</td>
<td>{u.email}</td>
<td>{u.class}</td>
<td>{u.xp}</td>
<td>
<button onClick={()=>{ if(confirm('Reset password?')) api.post(`/admin/users/${u.id}/reset-password`) }}>Reset PW</button>
<button onClick={()=>{ if(confirm('Nonaktifkan user?')) api.delete(`/admin/users/${u.id}`) }}>Disable</button>
</td>
</tr>
))}
</tbody>
</table>
)}
</LayoutAdmin>
);
}