import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div style={styles.container}>
      <Navbar />

      <div style={styles.hero}>
        <div style={styles.welcomeBanner}>
          Selamat Datang di ThinkCode — Platform E-Learning dengan Gamifikasi
        </div>

        <h1 style={styles.title}>Belajar Lebih Seru Dengan ThinkCode</h1>
        <p style={styles.subtitle}>
          Mulai perjalanan belajarmu dengan mini lesson, ruang diskusi, dan mini game!
        </p>

        <Link to="/login">
          <button style={styles.btn}>Masuk Sekarang</button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Roboto', sans-serif", 
    backgroundColor: "#426c96ff", 
  },
  hero: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "80px 20px",
    minHeight: "calc(80vh - 90px)", 
    background: "linear-gradient(135deg, #5e72d4b7 0%, #8e7f9eff 100%)",
    color: "white",
  },
  welcomeBanner: {
    background: "rgba(255, 255, 255, 0.1)", 
    padding: "15px 30px",
    borderRadius: "25px",
    fontSize: "18px",
    fontWeight: "500",
    marginBottom: "30px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)", 
  },
  title: {
    fontSize: "48px",
    fontWeight: "700",
    margin: "20px 0",
    lineHeight: "1.2",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)", 
  },
  subtitle: {
    fontSize: "20px",
    margin: "10px 0 40px",
    maxWidth: "600px",
    lineHeight: "1.5",
    opacity: "0.9",
  },
  btn: {
    padding: "15px 40px",
    background: "#ffffff",
    color: "#667eea",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "18px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "1px",
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  },
};
