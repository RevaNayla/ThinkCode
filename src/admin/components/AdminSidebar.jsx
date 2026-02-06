import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  FileCheck,
  Award,
  Gamepad2,
  User,
  LogOut,
  Trophy,
} from "lucide-react";

export default function AdminSidebar() {
  return (
    <aside
      style={{
        width: 240,
        height: "100vh",
        background: "#1E1E2F",
        color: "white",
        padding: "20px 10px",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 30, textAlign: "center" }}>
        Admin Panel
      </h2>

      <nav style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <SidebarItem to="/admin" label="Dashboard" icon={<LayoutDashboard size={20} />} />
        <SidebarItem to="/admin/materi" label="Materi" icon={<BookOpen size={20} />} />
        <SidebarItem to="/admin/users" label="Siswa" icon={<Users size={20} />} />
        <SidebarItem to="/admin/roommateri" label="Room Diskusi" icon={<MessageSquare size={20} />} />
        <SidebarItem to="/admin/submission" label="Submission" icon={<FileCheck size={20} />} />
        <SidebarItem to="/admin/leaderboard" label="Leaderboard" icon={<Trophy size={20} />} />
        <SidebarItem to="/admin/minigame" label="Mini Game" icon={<Gamepad2 size={20} />} />
        <SidebarItem to="/admin/badges" label="Badge" icon={<Award size={20} />} />
        <SidebarItem to="/admin/profile" label="Profile" icon={<User size={20} />} />
      </nav>

      <div>
        <SidebarItem to="/logout" label="Logout" icon={<LogOut size={20} />} />
      </div>
    </aside>
  );
}

function SidebarItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "sidebar-item " + (isActive ? "active" : "")
      }
      style={{
        textDecoration: "none",
        color: "white",
      }}
    >
      <div
        style={{
          padding: "12px 15px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
          cursor: "pointer",
        }}
      >
        {icon}
        <span style={{ fontSize: 15 }}>{label}</span>
      </div>
    </NavLink>
  );
}
