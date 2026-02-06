// AdminUserProfile.jsx
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../../services/api";
import "./admin-users.css";

export default function AdminUserProfile({ id, onClose, onUpdated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const d = await apiGet(`/admin/students/${id}`);
        if (mounted) setUser(d);
      } catch (e) {
        console.error(e);
      } finally { if (mounted) setLoading(false); }
    }
    load();
    return () => mounted = false;
  }, [id]);

  if (loading) return (
    <div className="modal-backdrop"><div className="modal">Loading...</div></div>
  );

  if (!user) return (
    <div className="modal-backdrop"><div className="modal">User tidak ditemukan</div></div>
  );

  async function sendNote() {
    if (!note.trim()) return alert("Tulis catatan terlebih dahulu");
    try {
      await apiPost(`/admin/students/${id}/notes`, { note });
      setNote("");
      alert("Catatan dikirim");
      onUpdated && onUpdated();
    } catch (e) {
      alert("Gagal kirim catatan: " + (e.message || e));
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e)=>e.stopPropagation()}>
        <div className="modal-header">
          <h3>{user.name}</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16 }}>
          <div>
            <img src={user.avatar || "/default-avatar.png"} alt="avatar" style={{ width: 160, height: 160, borderRadius: 8, objectFit: "cover" }} />
            <div style={{ marginTop: 12 }}>
              <div><strong>Email</strong><div>{user.email}</div></div>
              <div style={{ marginTop:8 }}><strong>XP</strong><div>{user.xp ?? 0}</div></div>
              <div style={{ marginTop:8 }}><strong>Progress</strong><div>{user.progress ?? 0}%</div></div>
            </div>
          </div>

          <div>
            <h4>Riwayat Badge & XP</h4>
            <ul>
              {(user.badges || []).map(b => <li key={b.id}>{b.name} — {b.date}</li>)}
            </ul>

            <h4>Activity Log</h4>
            <ul className="small-list">
              {(user.activity || []).slice(0, 10).map(a => <li key={a.id}>{a.time} — {a.action}</li>)}
            </ul>

            <h4>Kirim Catatan / Pesan</h4>
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="Catatan untuk siswa..." />
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={sendNote}>Kirim</button>
              <button onClick={onClose} className="secondary">Tutup</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
