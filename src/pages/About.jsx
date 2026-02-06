import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 

export default function About() {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/static/about").then((res) => {
      setInfo(res.data);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Memuat Informasi...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>Tentang ThinkCode</h2>
          <p style={styles.subtitle}>
            Pelajari lebih lanjut tentang platform e-learning kami
          </p>
        </div>
        <div style={styles.infoContainer}>
          <div style={styles.infoCard}>
            <h3 style={styles.cardTitle}>Informasi Aplikasi</h3>
            <ul style={styles.infoList}>
              <li style={styles.infoItem}>
                <strong>Nama Aplikasi:</strong> {info?.app || "N/A"}
              </li>
              <li style={styles.infoItem}>
                <strong>Versi:</strong> {info?.version || "N/A"}
              </li>
              <li style={styles.infoItem}>
                <strong>Dikembangkan Oleh:</strong> {info?.developer || "N/A"}
              </li>
              <li style={styles.infoItem}>
                <strong>Hak Cipta:</strong> {info?.copyright || "N/A"}
              </li>
            </ul>
          </div>
          <div style={styles.additionalCard}>
            <h3 style={styles.cardTitle}>Fitur Utama</h3>
            <p style={styles.additionalText}>
              ThinkCode menawarkan pembelajaran berbasis Problem-based Learning dimana didalamnya terdapat mini lesson, ruang diskusi kolaboratif, dan mini game yang menyenangkan untuk membuat pembelajaran lebih seru dan efektif.
            </p>
          </div>
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
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 200px)",
    backgroundColor: "#f4f7fa",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "5px solid #e0e0e0",
    borderTop: "5px solid #667eea",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    marginTop: "20px",
    fontSize: "18px",
    color: "#333",
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
  infoContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  infoCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  cardTitle: {
    fontSize: "24px",
    fontWeight: "600",
    margin: "0 0 20px",
    color: "#333",
  },
  infoList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  infoItem: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#555",
    marginBottom: "10px",
  },
  additionalCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  additionalText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#555",
    margin: 0,
  },
  achievementsCard: {
    background: "white",
    padding: "30px",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
  },
  achievementsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  achievementItem: {
    fontSize: "16px",
    lineHeight: "1.8",
    color: "#555",
    marginBottom: "15px",
    paddingLeft: "20px",
    position: "relative",
  },
};
