import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer"; 

export default function Tutorial() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    api.get("/static/tutorial").then((res) => {
      setData(res.data);
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
          <p style={styles.loadingText}>Memuat Tutorial...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>{data?.title || "Tutorial"}</h2>
          <p style={styles.description}>
            Ikuti langkah-langkah berikut untuk memahami materi dengan mudah.
          </p>
        </div>
        <div style={styles.stepsContainer}>
          {data?.steps?.map((step, index) => (
            <div key={index} style={styles.stepCard}>
              <div style={styles.stepNumber}>
                {index + 1}
              </div>
              <p style={styles.stepText}>{step}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}

const styles = {
  container: {
    fontFamily: "'Roboto', sans-serif", 
    minHeight: "100vh",
    backgroundColor: "#f4f7fa", 
    padding: "20px",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
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
  description: {
    fontSize: "18px",
    margin: 0,
    opacity: "0.9",
  },
  stepsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    maxWidth: "800px",
    margin: "0 auto",
  },
  stepCard: {
    display: "flex",
    alignItems: "center",
    background: "white",
    padding: "20px",
    borderRadius: "10px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease", 
  },
  stepNumber: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
    fontWeight: "bold",
    marginRight: "20px",
    flexShrink: 0,
  },
  stepText: {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#333",
    margin: 0,
  },
};
