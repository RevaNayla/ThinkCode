import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function History() {
  const { id } = useParams();
  const [collapsed, setCollapsed] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return window.location.href = "/login";

    api.get(`/materi/${id}/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        setHistory(res.data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        alert("Gagal memuat history");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p style={{ padding: 30 }}>Memuat history...</p>;

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar collapsed={collapsed} toggleSidebar={() => setCollapsed(!collapsed)} />
      <main style={{ flex: 1, padding: 40, marginLeft: collapsed ? 70 : 250 }}>
        <h2>History Jawaban</h2>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 12 }}>
          {history.length === 0 && <div style={{ color: "#666" }}>Belum ada jawaban.</div>}
          {history.map(h => (
            <div key={h.id} style={{ background: "#fff", padding: 14, borderRadius: 10 }}>
              <div style={{ fontWeight: 700 }}>{new Date(h.createdAt).toLocaleString()}</div>
              <div style={{ color: "#333", marginTop: 8 }}>{h.answerText}</div>
              {h.answerFile && (
                <div style={{ marginTop: 8 }}>
                  <a href={h.answerFile} target="_blank" rel="noreferrer">Lihat file</a>
                </div>
              )}
              <div style={{ marginTop: 8, color: "#666" }}>Feedback: {h.feedback || "-"}</div>
              <div style={{ marginTop: 6, color: "#666" }}>Badge: {h.badge || "-" } — XP: {h.xp || 0}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
