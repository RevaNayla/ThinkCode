import { useState } from "react";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 
import "./help.css";

export default function Help() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [loading, setLoading] = useState(false); 
  const [success, setSuccess] = useState(false); 

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/help/send", form);
      alert(res.data.message);
      if (res.data.status) {
        setForm({ name: "", email: "", message: "" });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000); 
      }
    } catch (error) {
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Bantuan & Dukungan</h2>
          <p style={styles.subtitle}>
            Ada pertanyaan atau masalah? Kami siap membantu! Isi formulir di bawah ini dan tim kami akan segera merespons.
          </p>
        </div>
        <div style={styles.formContainer}>
          {success && (
            <div style={styles.successMessage}>
              Pesan Anda telah dikirim! Kami akan segera menghubungi Anda.
            </div>
          )}
          <form onSubmit={submit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nama Lengkap</label>
              <input
                type="text"
                placeholder="Masukkan nama Anda"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                placeholder="Masukkan email Anda"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={styles.input}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Pesan Bantuan</label>
              <textarea
                placeholder="Jelaskan masalah atau pertanyaan Anda"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows="6"
                style={styles.textarea}
                required
              />
            </div>
            <button type="submit" style={styles.btn} disabled={loading}>
              {loading ? "Mengirim..." : "Kirim Pesan"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    fontFamily: "'Roboto', sans-serif",
    minHeight: "calc(100vh - 200px)",
    backgroundColor: "#f4f7fa", 
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
    color: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "700",
    margin: "0 0 10px",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  subtitle: {
    fontSize: "18px",
    margin: 0,
    opacity: "0.9",
  },
  formContainer: {
    maxWidth: "600px",
    margin: "0 auto",
    background: "white",
    padding: "40px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    marginBottom: "40px",
  },
  successMessage: {
    background: "#d4edda",
    color: "#155724",
    padding: "15px",
    borderRadius: "5px",
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
    transition: "border-color 0.3s ease",
  },
  textarea: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    fontSize: "16px",
    resize: "vertical",
    transition: "border-color 0.3s ease",
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
  additionalInfo: {
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
    padding: "20px",
    background: "white",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
  },
  infoTitle: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 15px",
    color: "#333",
  },
  infoText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#555",
    margin: "10px 0",
  },
};
