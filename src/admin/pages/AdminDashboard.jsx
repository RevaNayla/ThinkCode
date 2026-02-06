import { useEffect, useState } from "react";
import AdminCard from "../components/AdminCard";
import { apiGet } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalMateri: 0,
    totalRoom: 0,
    pendingSubmission: 0,
    avgProgress: 0,
    topXP: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const s = await apiGet("/admin/summary");
        setStats(s);
        const act = await apiGet("/admin/recent-activity?limit=10");
        setRecentActivity(act);
      } catch (e) {
        console.error("Load dashboard", e);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="page-title">Dashboard Guru</h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 18
      }}>
        <AdminCard title="Jumlah Siswa" value={stats.totalSiswa} />
        <AdminCard title="Jumlah Materi" value={stats.totalMateri} />
        <AdminCard title="Ruang Diskusi" value={stats.totalRoom} />
        <AdminCard title="Submission Menunggu" value={stats.pendingSubmission} />
        <AdminCard title="Progress Rata-rata (%)" value={stats.avgProgress} />
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>XP Teratas</h2>
        <ol>
          {stats.topXP && stats.topXP.map((t, i) => (
            <li key={i}>{t.name} — {t.xp} XP</li>
          ))}
        </ol>
      </div>

      <div style={{ marginTop: 28 }}>
        <h2>Aktivitas Terbaru</h2>
        <ul>
          {recentActivity.map((r) => (
            <li key={r.id}>{r.time} — {r.user}: {r.action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
