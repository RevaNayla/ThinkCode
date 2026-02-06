import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import Layout from "../components/Layout";

export default function DiscussionRooms() {
  const { id } = useParams(); // materiId
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Fetch rooms
      api.get(`/discussion/rooms/${id}`)
      .then((res) => {
        setRooms(res.data?.data || []);
      })
      .catch((err) => console.error(err));

    // Fetch progress user untuk cek roomId
    api
      .get(`/materi/${id}`)
      .then((res) => {
        setUserProgress(res.data?.data?.progress || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  // Fungsi untuk join room
  const handleJoinRoom = async (roomId) => {
    try {
      await api.post(`/discussion/room/${roomId}/join`);
      window.location.href = `/materi/${id}/room/${roomId}`;
    } catch (err) {
      alert(err.response?.data?.message || "Gagal join room");
    }
  };

  if (loading) return <p style={{ padding: 30 }}>Memuat...</p>;

  return (
    <Layout>
      <div
        style={{
          padding: "15px 30px",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: 25,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            background: "white",
            zIndex: 10,
            padding: "10px 0",
          }}
        >
          <div>
            <h2 style={{ margin: 0 }}>Ruang Diskusi</h2>
            <p style={{ margin: 0, color: "#666" }}>
              Pilih ruang diskusi yang tersedia
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#3759c7",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 14,
              transition: "background 0.3s, transform 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#2a4a9c";
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#3759c7";
              e.target.style.transform = "scale(1)";
            }}
          >
            Kembali
          </button>
        </div>

        {/* LIST ROOM */}
        <div
          style={{
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          {rooms.map((room) => {
            const isJoined = userProgress?.roomId === room.id; 
            const hasJoinedOther =
              userProgress?.roomId && userProgress.roomId !== room.id; 

            return (
              <div
                key={room.id}
                style={{
                  width: 260,
                  background: "white",
                  padding: 20,
                  borderRadius: 14,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                   {room.name || room.title}
                </h3>

                <p style={{ fontSize: 14, color: "#555" }}>
                  Kapasitas: {room.current || 0}/{room.capacity}
                </p>

                {isJoined ? (
                  <Link to={`/materi/${id}/room/${room.id}`}>
                    <button
                      style={{
                        marginTop: 10,
                        width: "100%",
                        background: "#4e8df5",
                        border: "none",
                        borderRadius: 12,
                        padding: "10px 0",
                        cursor: "pointer",
                        color: "white",
                      }}
                    >
                      Masuk Kembali
                    </button>
                  </Link>
                ) : hasJoinedOther ? (
                  <button
                    style={{
                      marginTop: 10,
                      width: "100%",
                      background: "#ddd",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 0",
                      cursor: "not-allowed",
                    }}
                    disabled
                  >
                    Sudah Join Room Lain
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinRoom(room.id)}
                    style={{
                      marginTop: 10,
                      width: "100%",
                      background:
                        room.current >= room.capacity ? "#ddd" : "#a7eeb5",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 0",
                      cursor:
                        room.current >= room.capacity ? "not-allowed" : "pointer",
                    }}
                    disabled={room.current >= room.capacity}
                  >
                    {room.current >= room.capacity ? "Penuh" : "Masuk Room"}
                  </button>
                )}
              </div>
            );
          })}

          {rooms.length === 0 && (
            <p style={{ color: "#777" }}>
              Belum ada ruang diskusi tersedia.
            </p>
          )}
        </div>
      </div>
    </Layout>
  );
}