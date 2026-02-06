import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiGet } from "../../services/api";
import "./user-profile.css";

export default function AdminUserProfilePage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const d = await apiGet(`/admin/students/${id}/full`);
        setUser(d);
      } catch (e) {
        console.error("Profile error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (!user) return <p>User tidak ditemukan</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img src={user.avatar || "/default-avatar.png"} className="avatar" />
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <p>XP: {user.xp} • Progress: {user.progress}%</p>
          <Link className="btn" to="/admin/users">Kembali</Link>
        </div>
      </div>

      <h2>Riwayat XP</h2>
      <ul className="list">
        {user.xp_log.map(x => (
          <li key={x.id}>{x.date} — {x.amount} XP — {x.note}</li>
        ))}
      </ul>

      <h2>Badge</h2>
      <div className="badge-list">
        {user.badges.map(b => (
          <div className="badge" key={b.id}>{b.name}</div>
        ))}
      </div>

      <h2>Progress per Materi</h2>
      <ul className="list">
        {user.materi_progress.map(mp => (
          <li key={mp.materi_id}>
            <strong>{mp.title}</strong> — {mp.progress}%
          </li>
        ))}
      </ul>

      <h2>Activity</h2>
      <ul className="list">
        {user.activity.map(a => (
          <li key={a.id}>{a.time} — {a.action}</li>
        ))}
      </ul>
    </div>
  );
}
