import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div style={{ display: "flex",  }}>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />

      <main
        style={{
          flex: 1,
          padding: 40,
          marginLeft: collapsed ? 70 : 250,
          transition: "0.3s",
          minHeight: "100vh",
        }}
      >
        {children}
      </main>
    </div>
  );
}
