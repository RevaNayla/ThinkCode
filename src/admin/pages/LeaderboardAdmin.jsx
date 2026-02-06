import { useEffect, useState } from "react";
import api from "../../api/axiosClient";
import Sidebar from "../components/AdminSidebar";

export default function Leaderboard({ user }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false); 

  const [individu, setIndividu] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [materiList, setMateriList] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);

  const toggleSidebar = () => setCollapsed(!collapsed);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    loadIndividual();
    loadMateri();
  }, []);

  /* ================= LOAD INDIVIDUAL ================= */
  const loadIndividual = async () => {
    try {
      const res = await api.get("/leaderboard/individual");
      setIndividu(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= LOAD MATERI ================= */
  const loadMateri = async () => {
    try {
      const res = await api.get("/materi");
      setMateriList(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= LOAD KELOMPOK ================= */
  const loadKelompok = async (materiId) => {
    try {
      const res = await api.get(`/leaderboard/group?materiId=${materiId}`);
      setKelompok(res.data.data || []);
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= USER RANK ================= */
  const userRank =
    individu.findIndex((u) => u.id === user?.id) + 1 || "-";

  return (
    <div 
      style={{ 
        display: "flex", 
        minHeight: "100vh", 
        background: "#f5f6fa",
        overflowX: "hidden", 
        alignItems: "center",
      }}
    >
      {!isFullscreen && (
        <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />
      )}

      <main
        style={{
          flex: 1,
          padding: isFullscreen ? "20px" : "40px 20px", 
          marginLeft: isFullscreen ? 0 : (collapsed ? 30 : 0), 
          transition: "0.3s",
          display: "flex",
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          background: isFullscreen ? "#000" : "#f5f6fa", 
          overflowX: "hidden", 
          minHeight: "0vh",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "900px", 
            display: "flex",
            flexDirection: "column",
            alignItems: "center", 
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginBottom: 20,
            }}
          >
            <h1 style={{ fontSize: 30, fontWeight: 700, margin: 0 }}>
              🏆 Leaderboard
            </h1>
            <button
              onClick={toggleFullscreen}
              style={{
                padding: "10px 20px",
                borderRadius: 14,
                border: "none",
                background: "#6366f1",
                color: "white",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              {isFullscreen ? "Exit Fullscreen" : "View Fullscreen"}
            </button>
          </div>

          {userRank !== "-" && (
            <div
              style={{
                background: "white",
                padding: "15px 25px",
                borderRadius: 22,
                boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                marginBottom: 20,
                fontSize: 18,
                fontWeight: 600,
                textAlign: "center",
                width: "100%",
              }}
            >
              Your Rank: #{userRank}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: isFullscreen
                ? "1fr 1fr"
                : "minmax(350px, 420px) minmax(350px, 420px)", 
              gap: 40,
              alignItems: "start",
              width: "100%",
              justifyContent: "center", 
            }}
          >
            {/* ================= INDIVIDU ================= */}
            <Card title="Leaderboard Individu">
              {individu.map((u, i) => (
                <LeaderboardItem
                  key={u.id}
                  rank={i + 1}
                  name={u.name}
                  point={u.xp}
                  highlight={u.id === user?.id}
                />
              ))}
            </Card>

            {/* ================= KELOMPOK ================= */}
            <div>
              <Card title="Pilih Materi">
                {materiList.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMateri(m);
                      loadKelompok(m.id);
                    }}
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 14,
                      border: "none",
                      marginBottom: 10,
                      cursor: "pointer",
                      fontWeight: 600,
                      background:
                        selectedMateri?.id === m.id ? "#6366f1" : "#eef0f4",
                      color: selectedMateri?.id === m.id ? "white" : "#333",
                    }}
                  >
                    {m.title}
                  </button>
                ))}
              </Card>

              {selectedMateri && (
                <Card title={`Leaderboard Kelompok - ${selectedMateri.title}`}>
                  <GroupLeaderboardCard data={kelompok} />
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ================= CARD ================= */
function Card({ title, children }) {
  return (
    <div
      style={{
        background: "white",
        padding: 25,
        borderRadius: 22,
        boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
        marginBottom: 25,
      }}
    >
      <h3
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
        }}
      >
        {title}
      </h3>

      {children}
    </div>
  );
}

/* ================= INDIVIDUAL ITEM ================= */
function LeaderboardItem({ rank, name, point, highlight }) {
  const medal =
    rank === 1
      ? "#FFD700"
      : rank === 2
      ? "#C0C0C0"
      : rank === 3
      ? "#CD7F32"
      : "#e5e7eb";

  return (
    <div
      style={{
        background: highlight ? "#eef2ff" : "#f3f4f6",
        padding: "12px 16px",
        borderRadius: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        border: highlight ? "2px solid #6366f1" : "none",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: medal,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
        }}
      >
        {rank}
      </div>

      <div style={{ flex: 1, marginLeft: 14, fontWeight: 600 }}>
        {name}
      </div>

      <div style={{ fontWeight: 700 }}>
        {Math.round(point || 0)} XP
      </div>
    </div>
  );
}

/* ================= GROUP LIST ================= */
function GroupLeaderboardCard({ data = [] }) {
  if (!data.length) return <p>Belum ada data kelompok</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {data.map((room, i) => (
        <GroupLeaderboardItem
          key={room.roomId}
          rank={i + 1}
          room={room}
        />
      ))}
    </div>
  );
}

/* ================= GROUP ITEM ================= */
function GroupLeaderboardItem({ rank, room }) {
  const medal =
    rank === 1 ? "🥇" :
    rank === 2 ? "🥈" :
    rank === 3 ? "🥉" :
    "🏅";

  const progressColor =
    room.avgProgress >= 100
      ? "#22c55e"
      : room.avgProgress >= 70
      ? "#6366f1"
      : "#f59e0b";

  return (
    <div
      style={{
        background: "white",
        padding: 20,
        borderRadius: 20,
        boxShadow:
          rank === 1
            ? "0 10px 25px rgba(99,102,241,0.25)"
            : "0 4px 14px rgba(0,0,0,0.06)",
        border: rank === 1 ? "2px solid #6366f1" : "1px solid #eee",
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 30 }}>{medal}</div>

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {room.roomName}
          </div>

          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Rank #{rank}
          </div>
        </div>

        <div style={{ fontWeight: 700, fontSize: 18 }}>
          {Math.round(room.totalXp || 0)} XP
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div style={{ marginTop: 14 }}>
        <div
          style={{
            height: 8,
            background: "#eef0f4",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${room.avgProgress || 0}%`,
              height: "100%",
              background: progressColor,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 6,
            fontSize: 13,
            color: "#6b7280",
          }}
        >
          <span>Progress {Math.round(room.avgProgress || 0)}%</span>

          {room.finishTime && (
            <span>
              Finish{" "}
              {new Date(room.finishTime).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}