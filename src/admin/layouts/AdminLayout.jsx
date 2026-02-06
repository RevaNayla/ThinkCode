import AdminSidebar from "../components/AdminSidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex" }}>
      <AdminSidebar />

      <main style={{ marginLeft: 240, padding: 30, width: "100%" }}>
        <Outlet />
      </main>
    </div>
  );
}
