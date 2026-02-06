import { useState } from "react";
import SidebarAdmin from "./SidebarAdmin";


export default function LayoutAdmin({ children }) {
const [collapsed, setCollapsed] = useState(false);


return (
<div style={{ display: 'flex' }}>
<SidebarAdmin collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
<main style={{ flex: 1, marginLeft: collapsed ? 70 : 250, transition: '0.3s', padding: 24 }}>
{children}
</main>
</div>
);
}
