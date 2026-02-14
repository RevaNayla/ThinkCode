import { useEffect, useState } from "react";
import api from "../api/axiosClient";
import Sidebar from "../components/Sidebar";

export default function Leaderboard({ user }) {
  const [collapsed, setCollapsed] = useState(false);

  const [individu, setIndividu] = useState([]);
  const [kelompok, setKelompok] = useState([]);
  const [materiList, setMateriList] = useState([]);

  const [selectedMateri, setSelectedMateri] = useState(null);

  const toggleSidebar = () => setCollapsed(!collapsed);

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
    <div style={{ display: "flex",}}>
      <Sidebar collapsed={collapsed} toggleSidebar={toggleSidebar} />

      <main
        style={{
          flex: 1,
          padding: "40px 60px",
          marginLeft: collapsed ? 70 : 250,
          transition: "0.3s",
        }}
      >
        {/* TITLE */}
        <h1 style={{ fontSize: 30, fontWeight: 700, marginBottom: 20 }}>
          🏆 Leaderboard
        </h1>
        

        {/* GRID 2 COLUMN */}
        <div
          style={{
            fontFamily: 'Roboto, sans-serif',
            display: "grid",
            gridTemplateColumns: "420px 420px",
            gap: 40,
            alignItems: "start",
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
                    fontFamily: 'Roboto, sans-serif', 
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
        <div
          style={{
            fontSize: 13,
            color: "#6b7280",
            marginTop: 6
          }}
        >
          Performance: {Math.round(room.performanceScore || 0)}%
        </div>
      </div>
    </div>
  );
}
