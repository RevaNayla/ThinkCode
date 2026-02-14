import { Link } from "react-router-dom";
import { useState } from "react"; 

export default function Navbar() {
  const [hoveredLink, setHoveredLink] = useState(null); 

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>ThinkCode</h2>

      <ul style={styles.menu}>
        <li>
          <Link
            to="/"
            style={{
              ...styles.link,
              ...(hoveredLink === "home" ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setHoveredLink("home")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Home
          </Link>
        </li>
        <li>
          <Link
            to="/tutorial"
            style={{
              ...styles.link,
              ...(hoveredLink === "tutorial" ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setHoveredLink("tutorial")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Tutorial
          </Link>
        </li>
        <li>
          <Link
            to="/about"
            style={{
              ...styles.link,
              ...(hoveredLink === "about" ? styles.linkHover : {}),
            }}
            onMouseEnter={() => setHoveredLink("about")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            About
          </Link>
        </li>
        <li>
          <Link
            to="/login"
            style={{
              ...styles.link,
              ...styles.loginLink, 
              ...(hoveredLink === "login" ? styles.loginLinkHover : {}),
            }}
            onMouseEnter={() => setHoveredLink("login")}
            onMouseLeave={() => setHoveredLink(null)}
          >
            Login
          </Link>
        </li>
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    padding: "20px 40px", 
    background: "linear-gradient(135deg, #4f60acff 0%, #8060a0ff 100%)", 
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)", 
    position: "sticky", 
    top: 0,
    zIndex: 1100,
    fontFamily: "'Roboto', sans-serif", 
  },
  logo: {
    fontSize: "28px",
    fontWeight: "700",
    backgroundImage: "linear-gradient(135deg, #ffffff, #e0e7ff)", 
    WebkitBackgroundClip: "text",
    color: "transparent",
    margin: 0,
    textShadow: "0 1px 3px rgba(0, 0, 0, 0.2)", 
  },
  menu: {
    listStyle: "none",
    display: "flex",
    gap: "30px", 
    margin: 0,
    padding: 0,
  },
  link: {
    textDecoration: "none",
    color: "#ffffff", 
    fontSize: "16px",
    fontWeight: "500",
    padding: "8px 16px",
    borderRadius: "20px", 
    transition: "all 0.3s ease", 
  },
  linkHover: {
    backgroundColor: "rgba(255, 255, 255, 0.2)", 
    transform: "translateY(-2px)", 
  },
  loginLink: {
    backgroundColor: "#ffffff", 
    color: "#667eea", 
    fontWeight: "600",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", 
  },
  loginLinkHover: {
    backgroundColor: "#f0f4ff", 
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
  },
};
