import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerSection}>
          <h3 style={styles.footerTitle}>ThinkCode</h3>
          <p style={styles.footerText}>
            Platform e-learning inovatif dengan gamifikasi untuk pembelajaran yang seru dan efektif. Mulai perjalanan belajarmu hari ini!
          </p>
          <div style={styles.socialIcons}>
            <a href="#" style={styles.socialLink}>Facebook</a>
            <a href="#" style={styles.socialLink}>Twitter</a>
            <a href="#" style={styles.socialLink}>Instagram</a>
          </div>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerSubtitle}>Navigasi Cepat</h4>
          <ul style={styles.footerLinks}>
            <li><Link to="/" style={styles.footerLink}>Home</Link></li>
            <li><Link to="/tutorial" style={styles.footerLink}>Tutorial</Link></li>
            <li><Link to="/about" style={styles.footerLink}>About</Link></li>
            <li><Link to="/help" style={styles.footerLink}>Help</Link></li>
            <li><Link to="/login" style={styles.footerLink}>Login</Link></li>
          </ul>
        </div>
        <div style={styles.footerSection}>
          <h4 style={styles.footerSubtitle}>Kontak Kami</h4>
          <p style={styles.footerText}>Email: N/A</p>
          <p style={styles.footerText}>Telepon: N/A</p>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p style={styles.footerBottomText}>© 2026 ThinkCode. All rights reserved.</p>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
    color: "white",
    padding: "40px 20px 20px",
    fontFamily: "'Roboto', sans-serif",
    position: "relative",
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    maxWidth: "1200px",
    margin: "0 auto",
    gap: "30px",
  },
  footerSection: {
    flex: "1",
    minWidth: "250px",
  },
  footerTitle: {
    fontSize: "28px",
    fontWeight: "700",
    margin: "0 0 15px",
    textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
  },
  footerSubtitle: {
    fontSize: "20px",
    fontWeight: "600",
    margin: "0 0 15px",
  },
  footerText: {
    fontSize: "14px",
    lineHeight: "1.6",
    margin: "5px 0",
    opacity: "0.9",
  },
  socialIcons: {
    display: "flex",
    gap: "15px",
    marginTop: "15px",
  },
  socialLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "16px",
    fontWeight: "500",
    padding: "5px 10px",
    borderRadius: "5px",
    background: "rgba(255, 255, 255, 0.1)",
    transition: "background 0.3s ease",
  },
  footerLinks: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  footerLink: {
    color: "white",
    textDecoration: "none",
    fontSize: "14px",
    lineHeight: "1.8",
    transition: "color 0.3s ease",
  },
  newsletterInput: {
    width: "100%",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    marginBottom: "10px",
    fontSize: "14px",
  },
  newsletterBtn: {
    padding: "10px 20px",
    background: "#ffffff",
    color: "#667eea",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.3s ease",
  },
  footerBottom: {
    borderTop: "1px solid rgba(255, 255, 255, 0.2)",
    marginTop: "30px",
    paddingTop: "20px",
    textAlign: "center",
  },
  footerBottomText: {
    fontSize: "12px",
    opacity: "0.8",
    margin: 0,
  },
};

