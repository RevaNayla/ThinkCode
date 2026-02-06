import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axiosClient";
import Layout from "../components/Layout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const buildUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${API_URL}${path}`;
};

export default function UploadAnswer() {
  const { materiId } = useParams();
  const [file, setFile] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [lastUpload, setLastUpload] = useState(null);
  const [feedback, setFeedback] = useState("Memuat feedback...");
  const [score, setScore] = useState(0);
  const [badge, setBadge] = useState(null); 
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);

  const token = localStorage.getItem("token");
  let userId = null;

  if (token) {
    try {
      userId = JSON.parse(atob(token.split(".")[1])).id;
    } catch (err) {
      console.error("Token invalid", err);
    }
  }

  useEffect(() => {
    if (!userId || !materiId) return;

    api
      .get(`/upload/${userId}/${materiId}`)
      .then(res => {
        console.log("API Response:", res.data);
        if (res.data.data) {
          const last = res.data.data;
          console.log("Badge object:", last.Badge);
          console.log("Badge image path:", last.Badge?.image);
          setLastUpload(last);
          setTextAnswer(last.note || "");
          setFile(
            last.filePath
              ? { 
                  name: last.filePath.split("/").pop(), 
                  url: buildUrl(last.filePath)
                }
              : null
          );
          setFeedback(last.feedback || "Belum ada feedback.");
          setScore(last.score || 0);
          setBadge(last.Badge); 
          console.log("Badge data:", last.Badge);
        } else {
          setLastUpload(null);
          setFeedback("Belum ada feedback.");
          setScore(0);
          setBadge(null);
        }
      })
      .catch(err => {
        console.log("Belum ada jawaban sebelumnya.", err);
        setFeedback("Belum ada feedback.");
        setScore(0);
        setBadge(null);
      });
  }, [userId, materiId]);

  const submit = async () => {
    if (!file && !textAnswer.trim()) {
      return alert("Isi jawaban atau unggah file terlebih dahulu.");
    }

    const form = new FormData();
    if (file instanceof File) form.append("file", file);
    form.append("materiId", materiId);
    form.append("note", textAnswer);

    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Jawaban berhasil dikirim!");

      const last = res.data.data;
      setLastUpload(last);
      setTextAnswer(last.note || "");
      setFile(
        last.filePath
          ? { 
              name: last.filePath.split("/").pop(), 
              url: buildUrl(last.filePath)
            }
          : null
      );
      setFeedback(last.feedback || "Belum ada feedback.");
      setScore(last.score || 0);
      setBadge(last.Badge); 

      api.get(`/materi/${materiId}`).then(res => {
        const completed =
          res.data?.data?.progress?.completedSections || [];

        if (!completed.includes("upload")) {
          api.post(`/materi/${materiId}/progress`, {
            completedSections: [...completed, "upload"],
          });
        }
      });

    } catch (err) {
      console.error(err);
      alert("Upload gagal.");
    }
  };

  const openModal = (file) => {
    setCurrentFile(file);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentFile(null);
  };

  const getFileType = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['pdf'].includes(ext)) return 'pdf';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) return 'image';
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext)) return 'video';
    return 'other';
  };

  const renderModalContent = () => {
    if (!currentFile) return null;
    const type = getFileType(currentFile.name);

    switch (type) {
      case 'pdf':
        return (
          <iframe
            src={currentFile.url}
            style={{ width: '100%', height: '500px', border: 'none' }}
            title="PDF Viewer"
          />
        );
      case 'image':
        return (
          <img
            src={currentFile.url}
            alt={currentFile.name}
            style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }}
          />
        );
      case 'video':
        return (
          <video
            controls
            style={{ maxWidth: '100%', maxHeight: '500px' }}
          >
            <source src={currentFile.url} type={`video/${currentFile.name.split('.').pop()}`} />
            Browser Anda tidak mendukung video.
          </video>
        );
      default:
        return (
          <div style={{ textAlign: 'center' }}>
            <p>File ini tidak dapat dipreview. Klik untuk download:</p>
            <a href={currentFile.url} download style={{ color: '#3759c7', textDecoration: 'underline' }}>
              Download {currentFile.name}
            </a>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div
        style={{
          padding: "15px 20px",
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ marginBottom: 5, color: "#333" }}>Upload Jawaban</h2>
            <p style={{ marginTop: 0, color: "#666", fontSize: 14 }}>
              Orientasi Masalah &gt; Diskusi &gt; Get Clue &gt; Upload
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

        <div
          style={{
            display: "flex",
            gap: 40,
            marginTop: 30,
            flexWrap: "wrap",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              flex: 1,
              minWidth: 300,
              background: "#ffffff",
              borderRadius: 16,
              padding: 25,
              minHeight: 400,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#3759c7" }}>Jawaban Kamu</h3>

            <textarea
              placeholder="Tulis jawabanmu di sini..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              style={{
                width: "93%",
                height: 180,
                borderRadius: 12,
                border: "1px solid #bbb",
                padding: 15,
                resize: "none",
                fontSize: 14,
                background: "#fafafa",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3759c7")}
              onBlur={(e) => (e.target.style.borderColor = "#bbb")}
            />

            {/* FILE */}
            <div
              style={{
                marginTop: 20,
                background: "#fafafa",
                border: "1px solid #ddd",
                padding: "15px 20px",
                borderRadius: 15,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, color: "#444" }}>
                  {file ? file.name : "Belum ada file dipilih."}
                </p>
                {file && file.url && (
                  <button
                    onClick={() => openModal(file)}
                    style={{
                      marginTop: 5,
                      fontSize: 12,
                      color: "#3759c7",
                      textDecoration: "underline",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Lihat File
                  </button>
                )}
              </div>

              <button
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "none",
                  background: "#3759c7",
                  color: "white",
                  fontSize: 22,
                  cursor: "pointer",
                  transition: "background 0.3s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#2a4a9c")}
                onMouseOut={(e) => (e.target.style.background = "#3759c7")}
              >
                +
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </div>

            <button
              onClick={submit}
              disabled={!userId || !materiId}
              style={{
                marginTop: 25,
                width: "100%",
                background: "#3759c7",
                color: "white",
                border: "none",
                borderRadius: 12,
                padding: "12px 0",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 15,
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
              Kirim Jawaban
            </button>
          </div>

          {/* RIGHT */}
          <div
            style={{
              width: 310,
              background: "#ffffff",
              borderRadius: 16,
              padding: 25,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
            }}
          >
            <h3 style={{ marginTop: 0, color: "#3759c7" }}>Feedback Guru</h3>

            <textarea
              value={feedback}
              disabled
              style={{
                width: "93%",
                height: 100,
                borderRadius: 12,
                border: "none",
                padding: 15,
                resize: "none",
                background: "#fafafa",
                fontSize: 14,
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.05)",
              }}
            />

            <div style={{ marginTop: 15 }}>
            <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>
              Score: <span style={{ color: "#3759c7" }}>{score}</span>
            </p>

            <div style={{ marginTop: 8 }}>
              <p style={{ margin: 0, fontWeight: 600, color: "#333" }}>
                Badge:
              </p>

              {badge ? (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center", 
                  }}
                >
                  <img
                    src={buildUrl(badge.image)}
                    alt={badge.badge_name || "Badge"}
                    style={{
                      width: 180,
                      height: 180,
                      objectFit: "contain",
                      borderRadius: 12,
                    }}
                    onError={(e) => {
                      console.error("Badge image error:", e.target.src);
                      e.target.style.display = "none";
                    }}
                  />

                  <span
                    style={{
                      marginTop: 6,
                      fontWeight: 600,
                      color: "#3e46b9",
                    }}
                  >
                    {badge.badge_name || "Nama Badge Tidak Tersedia"}
                  </span>
                </div>
              ) : (
                <span style={{ color: "#ff9800" }}>Belum ada</span>
              )}
            </div>
          </div>


            <button
              onClick={() => navigate("/leaderboard")}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #c0f4c6 0%, #a8e6a1 100%)",
                border: "none",
                borderRadius: 15,
                padding: "12px 0",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 20,
                color: "#2a8b46",
                transition: "transform 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
              onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
            >
              Lihat Leaderboard
            </button>
          </div>
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={closeModal} 
          >
            <div
              style={{
                background: "#fff",
                borderRadius: 16,
                padding: 20,
                maxWidth: "90%",
                maxHeight: "90%",
                overflow: "auto",
                position: "relative",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
              }}
              onClick={(e) => e.stopPropagation()} 
            >
              <button
                onClick={closeModal}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "none",
                  border: "none",
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#333",
                }}
              >
                ×
              </button>
              <h4 style={{ marginTop: 0, color: "#3759c7" }}>{currentFile?.name}</h4>
              {renderModalContent()}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}