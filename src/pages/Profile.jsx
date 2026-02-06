import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Layout from "../components/Layout";

const BASE_URL = "http://localhost:5000"; 
export default function Profile() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editPassword, setEditPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login");

    try {
      const res = await api.get("/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setData(res.data);
      setName(res.data.user?.name || "");
      setEmail(res.data.user?.email || "");
    } catch {
      alert("Session habis");
      localStorage.clear();
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  /* ================= UPDATE PROFILE ================= */
  const saveProfile = async () => {
    const token = localStorage.getItem("token");

    try {
      await api.put(
        "/profile",
        { name, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Profil berhasil diperbarui");

      fetchProfile();
    } catch {
      alert("Gagal memperbarui profil");
    }
  };

  /* ================= UPDATE PASSWORD ================= */
  const savePassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Password baru tidak sama");
    }

    const token = localStorage.getItem("token");

    try {
      await api.put(
        "/profile/password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Password berhasil diganti");
      setEditPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      fetchProfile();
    } catch (err) {
      alert(err.response?.data?.message || "Gagal mengganti password");
    }
  };

  if (loading) {
    return (
      <Layout>
        <p style={styles.loading}>Loading profile...</p>
      </Layout>
    );
  }

  const { user, statistik, materi, achievements } = data;

  return (
    <Layout>
      <div style={styles.container}>
        {/* HEADER */}
        <div style={styles.header}>
          <h2 style={styles.title}>Profil Saya</h2>
          <button
            style={styles.logout}
            onClick={() => {
              localStorage.clear();
              window.location.href = "/login";
            }}
          >
            Logout
          </button>
        </div>

        {/* INFO */}
        <div style={styles.grid}>
          <InfoBox label="Nama" value={user.name} />
          <InfoBox label="Email" value={user.email} />
          <InfoBox label="Kelas" value={user.class || "-"} />
        </div>

        {/* STAT */}
        <div style={styles.grid}>
          <StatBox label="Total XP" value={statistik?.totalXp || 0} />
          <StatBoxWithButton
            label="Total Badge"
            value={`${achievements?.length || 0} Badge`}
            buttonText="View More"
            onButtonClick={() => window.location.href = "/achievement"}
          />
          <StatBox
            label="Password"
            value="Ganti Password"
            clickable
            onClick={() => setEditPassword(true)}
          />
        </div>

        {/* MATERI */}
        <h3 style={styles.section}>Materi Terakhir</h3>
        <div style={styles.row}>
          {materi?.length > 0 ? (
            materi.slice(0, 3).map(m => (
              <div key={m.id} style={styles.materi}>
                <strong>{m.Materi?.title || "Materi"}</strong>
                <div style={styles.progress}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${m.percent || 0}%`
                    }}
                  />
                </div>
                <small>{m.percent || 0}%</small>
              </div>
            ))
          ) : (
            <p style={styles.noData}>Belum ada progres</p>
          )}
        </div>
        <button
          style={styles.viewMore}
          onClick={() => window.location.href = "/materi"} 
        >
          View More
        </button>

        {/* MODAL PASSWORD */}
        {editPassword && (
          <div style={styles.modal}>
            <div style={styles.modalBox}>
              <h3>Ganti Password</h3>
              <input
                style={styles.input}
                type="password"
                placeholder="Password lama"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Password baru"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              <input
                style={styles.input}
                type="password"
                placeholder="Konfirmasi password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              <div style={styles.btnGroup}>
                <button style={styles.save} onClick={savePassword}>
                  Simpan
                </button>
                <button
                  style={styles.cancel}
                  onClick={() => setEditPassword(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

/* ================= COMPONENTS ================= */

function InfoBox({ label, value }) {
  return (
    <div style={boxStyle}>
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function StatBox({ label, value, clickable, onClick }) {
  return (
    <div
      style={{
        ...boxStyle,
        cursor: clickable ? "pointer" : "default",
        color: clickable ? "#0984e3" : "#000"
      }}
      onClick={onClick}
    >
      <small>{label}</small>
      <strong>{value}</strong>
    </div>
  );
}

function StatBoxWithButton({ label, value, buttonText, onButtonClick }) {
  return (
    <div style={boxStyle}>
      <small>{label}</small>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <strong>{value}</strong>
        <button style={styles.smallButton} onClick={onButtonClick}>{buttonText}</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: 30,

  },
  loading: {
    padding: 40,
    textAlign: "center",
    fontSize: 18
  },
  header: {
    background: "white",
    padding: 20,
    borderRadius: 18,
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 30,
    boxShadow: "0 8px 25px rgba(0,0,0,.08)"
  },
  title: { margin: 0 },
  logout: {
    background: "#ff7675",
    border: "none",
    color: "white",
    padding: "10px 20px",
    borderRadius: 25,
    cursor: "pointer"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30
  },
  section: {
    marginBottom: 15
  },
  row: {
    display: "flex",
    gap: 15,
    flexWrap: "wrap",
    marginBottom: 15
  },
  noData: {
    color: "#7f8c8d",
    fontStyle: "italic",
    textAlign: "center",
    width: "100%"
  },
  materi: {
    width: 180,
    padding: 15,
    borderRadius: 15,
    background: "white",
    boxShadow: "0 6px 20px rgba(0,0,0,.1)"
  },
  progress: {
    height: 8,
    background: "#eee",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 10
  },
  progressFill: {
    height: "100%",
    background: "#58cc02"
  },
  viewMoreContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: 30
  },
  viewMore: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: 10,
    cursor: "pointer",
    fontSize: 14
  },
  smallButton: {
    background: "#667eea",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: 5,
    cursor: "pointer",
    fontSize: 12
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalBox: {
    background: "white",
    padding: 25,
    borderRadius: 20,
    width: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #ccc"
  },
  btnGroup: {
    display: "flex",
    gap: 10,
    marginTop: 10
  },
  save: {
    flex: 1,
    background: "#58cc02",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 10,
    cursor: "pointer"
  },
  cancel: {
    flex: 1,
    background: "#b2bec3",
    color: "white",
    border: "none",
    padding: 12,
    borderRadius: 10,
    cursor: "pointer"
  }
};

const boxStyle = {
  background: "white",
  padding: 20,
  borderRadius: 18,
  boxShadow: "0 6px 20px rgba(0,0,0,.08)",
  display: "flex",
  flexDirection: "column",
  gap: 6
};