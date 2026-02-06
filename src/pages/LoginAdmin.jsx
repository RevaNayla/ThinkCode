import { useState } from "react";
import api from "../api/axiosClient";

export default function LoginAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", { email, password });

      if (!res.data.status) {
        setError(res.data.message);
        return;
      }

      if (res.data.user.role !== "teacher" && res.data.user.role !== "admin") {
        setError("Anda tidak memiliki akses ke halaman guru/admin.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/guru";

    } catch (err) {
      setError("Gagal login admin.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.box}>
        <h2 style={styles.title}>Login Admin/Guru</h2>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={submit} style={styles.form}>
          <input
            type="email"
            placeholder="Email Admin/Guru"
            style={styles.input}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            style={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.btn}>Login Admin</button>
        </form>

        <p style={styles.small}>
          ← <a href="/login">Kembali ke Login Siswa</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    height: "100vh",
    background: "#f8f9fa",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 380,
    padding: 30,
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  title: {
    textAlign: "center",
    marginBottom: 25,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  input: {
    padding: 12,
    borderRadius: 6,
    border: "1px solid #ccc",
  },
  btn: {
    padding: 12,
    background: "#0B5ED7",
    border: "none",
    borderRadius: 8,
    color: "white",
    cursor: "pointer",
  },
  small: {
    marginTop: 15,
    textAlign: "center",
  },
  error: {
    background: "#ffdddd",
    padding: 10,
    borderRadius: 5,
    color: "#b30000",
    textAlign: "center",
    marginBottom: 15,
  },
};
