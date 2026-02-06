import React from "react";
import {
  FaHome,
  FaBook,
  FaGamepad,
  FaTrophy,
  FaMedal,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Sidebar({ collapsed, toggleSidebar }) {
  return (
    <aside
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: collapsed ? "70px" : "250px",
        background: "#b9c7d8",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        transition: "0.3s",
        zIndex: 1000,
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: "absolute",
          top: 20,
          right: "-20px",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "#617496ff",
          color: "white",
          fontSize: 20,
        }}
      >
        ☰
      </button>

      {/* Logo */}
      <h2
        style={{
          padding: 35,
          marginBottom: 25,
          opacity: collapsed ? 0 : 1,
          transition: "0.2s",
          backgroundImage: "linear-gradient(135deg, #3759c7ff, #aa86ffff)",
          WebkitBackgroundClip: "text",
          color: "transparent",
          whiteSpace: "nowrap",
        }}
      >
        ThinkCode
      </h2>

      {/* Menu Items */}
      <SidebarItem href="/dashboard" collapsed={collapsed}>
        <FaHome />
        {!collapsed && <span>Dashboard</span>}
      </SidebarItem>

      <SidebarItem href="/materi" collapsed={collapsed}>
        <FaBook />
        {!collapsed && <span>Materi</span>}
      </SidebarItem>

      <SidebarItem href="/game" collapsed={collapsed}>
        <FaGamepad />
        {!collapsed && <span>Mini Game</span>}
      </SidebarItem>

      <SidebarItem href="/leaderboard" collapsed={collapsed}>
        <FaTrophy />
        {!collapsed && <span>Leaderboard</span>}
      </SidebarItem>

      <SidebarItem href="/achievement" collapsed={collapsed}>
        <FaMedal />
        {!collapsed && <span>Achievement</span>}
      </SidebarItem>

      <SidebarItem href="/profile" collapsed={collapsed}>
        <FaUser />
        {!collapsed && <span>Profile</span>}
      </SidebarItem>

      {/* Logout */}
      <div style={{ marginTop: "auto", paddingBottom: 30 }}>
        <LogoutButton collapsed={collapsed}>
          <FaSignOutAlt />
          {!collapsed && <span>Logout</span>}
        </LogoutButton>
      </div>
    </aside>
  );
}


function SidebarItem({ href, collapsed, children }) {
  return (
    <button
      onClick={() => (window.location.href = href)}
      style={{
        marginBottom: 10,
        padding: collapsed ? "10px 5px" : "10px",
        background: "#617496",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
        transition: "0.3s",
        width: "100%",
      }}
    >
      {children}
    </button>
  );
}


function LogoutButton({ collapsed, children }) {
  return (
    <button
      onClick={() => {
        localStorage.clear();
        window.location.href = "/login";
      }}
      style={{
        position: "absolute",
        bottom: 60,
        left: collapsed ? 10 : 20,
        right: collapsed ? 10 : 20,
        padding: collapsed ? "10px 5px" : "10px",
        background: "#ff4c4c",
        color: "white",
        border: "none",
        borderRadius: 6,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      {children}
    </button>
  );
}


