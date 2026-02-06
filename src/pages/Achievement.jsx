import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function Achievement() {
  const [collapsed, setCollapsed] = useState(false);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    api
      .get("/achievement")
      .then((res) => {
        setAchievements(res.data.data);
        setLoading(false);
      })
      .catch(() => {
        alert("Gagal memuat achievements");
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: 30 }}>Memuat data...</p>;

  return (
    <div style={{ display: "flex", }}>
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <main
        style={{
          flex: 1,
          padding: "40px",
          marginLeft: collapsed ? "70px" : "280px",
          transition: "0.3s",
        }}
      >
        {/* HEADER */}
        <h2>Achievement</h2>
        <h3 style={{ marginTop: 20 }}>Your Achievement</h3>

        {/* LIST ACHIEVEMENT */}
        <div
          style={{
            background: "#dcdedf",
            marginTop: 20,
            padding: 25,
            borderRadius: 18,
            display: "flex",
            gap: 25,
            flexWrap: "wrap",
          }}
        >
          {achievements.length === 0 && (
            <p>Belum ada achievement yang didapat.</p>
          )}

          {achievements.map((item) => (
            <CircleAchievement key={item.id} item={item} />
          ))}
        </div>
      </main>
    </div>
  );
}

/*CIRCLE ACHIEVEMENT */
function CircleAchievement({ item }) {
  return (
    <div style={{ width: 100, textAlign: "center" }}>
      <div
        style={{
          width: 90,
          height: 90,
          background: "white",
          borderRadius: "50%",
          boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={item.image}
          alt={item.title}
          style={{
            width: "155%",
            height: "155%",
            objectFit: "contain",
          }}
        />
      </div>

      <p
        style={{
          marginTop: 8,
          fontSize: 13,
          fontWeight: "bold",
          lineHeight: "16px",
        }}
      >
        {item.title}
      </p>
    </div>
  );
}
