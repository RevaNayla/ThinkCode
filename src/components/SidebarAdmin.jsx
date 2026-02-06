import { Link } from 'react-router-dom';


export default function SidebarAdmin({ collapsed, toggle }) {
return (
<aside style={{ position: 'fixed', left:0, top:0, bottom:0, width: collapsed?70:250, background:'#0b1a2b', color:'#fff', padding:20 }}>
<button onClick={toggle} style={{ marginBottom:16 }}>{collapsed? '>' : '<'}</button>
{!collapsed && <h3>Admin Panel</h3>}
<nav style={{ display:'flex', flexDirection:'column', gap:10, marginTop:20 }}>
<Link to="/admin" style={{ color:'#fff' }}>Dashboard</Link>
<Link to="/admin/users" style={{ color:'#fff' }}>Users</Link>
<Link to="/admin/materi" style={{ color:'#fff' }}>Materi</Link>
<Link to="/admin/submissions" style={{ color:'#fff' }}>Submissions</Link>
<Link to="/admin/discussion" style={{ color:'#fff' }}>Discussion</Link>
<Link to="/admin/settings" style={{ color:'#fff' }}>Settings</Link>
</nav>
</aside>
);
}