import { useState } from "react";
import Navbar from "../components/Navbar";
import api from "../api/axiosClient";
import Footer from "../components/Footer"; 
import "./help.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); 

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.status) {
        setError(res.data.message);
        setLoading(false);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = res.data.user.role;

      if (role === "teacher" || role === "admin") {
        window.location.href = "/admin";
      } else if (role === "student") {
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Gagal login. Periksa koneksi server.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <Navbar />

      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Selamat Datang Kembali</h2>
          <p style={styles.subtitle}>
            Masuk ke akun Anda untuk melanjutkan perjalanan belajar di ThinkCode.
          </p>
        </div>

        <div style={styles.formContainer}>
          {error && <p style={styles.error}>{error}</p>}

          <form onSubmit={submit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Masukkan password Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Sedang Masuk..." : "Masuk"}
            </button>
          </form>

          <div style={styles.links}>
            <p style={styles.small}>
              Belum punya akun? <a href="/register" style={styles.link}>Daftar Sekarang</a>
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
    padding: "40px 20px",
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
