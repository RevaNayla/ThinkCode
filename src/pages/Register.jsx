import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosClient";
import Footer from "../components/Footer"; 
import "./help.css";

export default function Register() {
  const [data, setData] = useState({
    name: "",
    email: "",
    class: "", // Kelas sekarang diketik manual
    password: "",
    // Role dihapus dari state, default "student"
  });

  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(""); 

  // useEffect untuk fetch classes dihapus karena kelas diketik manual

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/register", {
        ...data,
        role: "student" // Role default student
      });

      alert(res.data.message);

      if (res.data.status === true) {
        window.location.href = "/login";
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Daftar Akun Baru</h2>
          <p style={styles.subtitle}>
            Bergabunglah dengan ThinkCode dan mulai perjalanan belajar Anda hari ini!
          </p>
        </div>

        <div style={styles.formContainer}>
          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={submit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Kelas</label>
              <input
                type="text"
                placeholder="Masukkan kelas Anda (contoh: X TL 1)"
                value={data.class}
                onChange={(e) => setData({ ...data, class: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            {/* Field Role dihapus */}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password Anda"
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          <div style={styles.links}>
            <p style={styles.small}>
              Sudah punya akun? <a href="/login" style={styles.link}>Masuk</a>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

const styles = {
  pageContainer: {
    fontFamily: "'Roboto', sans-serif", 
    minHeight: "100vh",
    backgroundColor: "#f4f7fa", 
  },
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 10px",
    minHeight: "calc(100vh - 200px)", 
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
    padding: "10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
    color: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    width: "100%",
  },
  title: {
    fontSize: "32px",
    fontWeight: "700",
    margin: "0 0 10px",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    fontSize: "16px",
    margin: 0,
    opacity: "0.9",
  },
  formContainer: {
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    maxWidth: "400px",
    width: "100%",
  },
  error: {
    padding: "15px",
    background: "#f8d7da",
    color: "#721c24",
    borderRadius: "8px",
    marginBottom: "20px",
    textAlign: "center",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "5px",
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
  },
  btn: {
    padding: "15px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
  links: {
    marginTop: "20px",
    textAlign: "center",
  },
  small: {
    fontSize: "14px",
    color: "#666",
    margin: "5px 0",
  },
  link: {
    color: "#667eea",
    textDecoration: "none",
    fontWeight: "500",
    transition: "color 0.3s ease",
  },
};