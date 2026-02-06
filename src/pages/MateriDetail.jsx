import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axiosClient";
import MiniLessonModal from "../components/MiniLessonModal";
import Layout from "../components/Layout";

export default function MateriDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showMini, setShowMini] = useState(false);

  useEffect(() => {
    api
      .get(`/materi/${id}`)
      .then(res => {
        setData(res.data?.data || null); 
      })
      .catch(err => console.error(err));
  }, [id]);

  if (!data) {
    return <p style={{ padding: 30 }}>Memuat...</p>;
  }

  const videoSection = data.sections?.find(
    s => s.type === "video" && s.content
  );

  return (
    <Layout>
      <div
        style={{
          padding: "30px 40px",

        }}
      >
        {/* HEADER */}
        <div
          style={{
            marginBottom: 20,
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
            <h2 style={{ margin: 0 }}>{data.materi?.title}</h2>
            <p style={{ margin: 0, color: "#666" }}>
              Orientasi Masalah
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

        {/* VIDEO WRAPPER */}
        <div
          style={{
            width: "70%",
            height: 380,
            background: "#d8d8d8",
            borderRadius: 12,
            position: "relative",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {videoSection ? (
            videoSection.content.includes("/uploads/") ? (
              <video
                src={`http://localhost:5000${videoSection.content}`}
                controls
                preload="metadata"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  background: "#000",
                  objectFit: "contain",
                }}
              />
            ) : (
              <iframe
                title="materi-video"
                width="100%"
                height="100%"
                src={videoSection.content}
                style={{ border: "none", borderRadius: 12 }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            )
          ) : (
            <strong style={{ fontSize: 22 }}>Video</strong>
          )}

          {/* INFO BUTTON */}
          <button
            onClick={() => setShowMini(true)}
            style={{
              position: "absolute",
              left: -15,
              bottom: -15,
              width: 45,
              height: 45,
              borderRadius: "50%",
              background: "#4e8df5",
              border: "none",
              color: "white",
              fontSize: 20,
              cursor: "pointer",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
            }}
          >
            i
          </button>
        </div>

        {/* BUTTON RUANG DISKUSI */}
        <div
          style={{
            marginTop: 40,
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Link to={`/materi/${id}/discussion`}>
            <button
              style={{
                background: "#a7eeb5",
                padding: "12px 35px",
                borderRadius: 14,
                border: "none",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 500,
              }}
            >
              Join Ruang Diskusi
            </button>
          </Link>
        </div>

        {/* MINI LESSON MODAL */}
        {showMini && (
          <MiniLessonModal
            show={showMini}  
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Mini lesson tidak ditemukan."}
          />
        )}
      </div>
    </Layout>
  );
}