import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../api/axiosClient";
import Layout from "../components/Layout";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE_URL = API_URL.replace('/api', '');

const buildUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path}`;
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

      // Perbaiki: Gunakan /complete-step untuk "submit_answer"
      console.log('Upload successful, attempting to complete "submit_answer"');
      api.get(`/materi/${materiId}`).then(res => {
        const completed = res.data?.data?.progress?.completedSections || [];
        if (!completed.includes("submit_answer")) {
          api.post(`/materi/${materiId}/complete-step`, { step: "submit_answer" })
            .then(() => {
              console.log('Step "submit_answer" completed');
            })
            .catch(err => console.error('Error completing "submit_answer":', err));
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
      <Wrapper>
        <Header>
          <HeaderLeft>
            <Title>Upload Jawaban</Title>
            <Breadcrumb>
              Orientasi Masalah &gt; Ruang Diskusi &gt; Workspace &gt; Upload
            </Breadcrumb>
          </HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            Kembali
          </BackButton>
        </Header>

        <Container>
          {/* LEFT */}
          <LeftPanel>
            <h3>Jawaban Kamu</h3>

            <AnswerTextarea
              placeholder="Tulis jawabanmu di sini..."
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
            />

            {/* FILE */}
            <FileSection>
              <div>
                <p>{file ? file.name : "Belum ada file dipilih."}</p>
                {file && file.url && (
                  <ViewFileButton onClick={() => openModal(file)}>
                    Lihat File
                  </ViewFileButton>
                )}
              </div>

              <UploadButton onClick={() => fileInputRef.current.click()}>
                +
              </UploadButton>

              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files[0])}
                style={{ display: "none" }}
              />
            </FileSection>

            <SubmitButton
              onClick={submit}
              disabled={!userId || !materiId}
            >
              Kirim Jawaban
            </SubmitButton>
          </LeftPanel>

          {/* RIGHT */}
          <RightPanel>
            <h3>Feedback Guru</h3>

            <FeedbackTextarea value={feedback} disabled />

            <ScoreBadgeSection>
              <p>
                Score: <ScoreValue>{score}</ScoreValue>
              </p>

              <div>
                <p>Badge:</p>

                {badge ? (
                  <BadgeContainer>
                    <BadgeImage
                      src={buildUrl(badge.image)}
                      alt={badge.badge_name || "Badge"}
                      onError={(e) => {
                        console.error("Badge image error:", e.target.src);
                        e.target.style.display = "none";
                      }}
                    />

                    <BadgeName>
                      {badge.badge_name || "Nama Badge Tidak Tersedia"}
                    </BadgeName>
                  </BadgeContainer>
                ) : (
                  <NoBadge>Belum ada</NoBadge>
                )}
              </div>
            </ScoreBadgeSection>

            <LeaderboardButton onClick={() => navigate("/leaderboard")}>
              Lihat Leaderboard
            </LeaderboardButton>
          </RightPanel>
        </Container>

        {/* MODAL */}
        {modalOpen && (
          <ModalOverlay onClick={closeModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <CloseButton onClick={closeModal}>×</CloseButton>
              <ModalTitle>{currentFile?.name}</ModalTitle>
              {renderModalContent()}
            </ModalContent>
          </ModalOverlay>
        )}
      </Wrapper>
    </Layout>
  );
}

// Styled Components
const Wrapper = styled.div`
  padding: 20px 40px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  z-index: 10;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const HeaderLeft = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-weight: 700;
  font-size: 32px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Breadcrumb = styled.div`
  font-size: 16px;
  color: #7f8c8d;
  margin-top: 8px;
  font-weight: 500;
`;

const BackButton = styled.button`
  background: #3759c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 14px 28px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;

  &:hover {
    background: #2a4a9c;
    transform: translateY(-2px);
  }
`;

const Container = styled.div`
  display: flex;
  gap: 40px;
  margin-top: 30px;
  flex-wrap: wrap;
`;

const LeftPanel = styled.div`
  flex: 1;
  min-width: 300px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  min-height: 400px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h3 {
    margin-top: 0;
    color: #3759c7;
  }
`;

const AnswerTextarea = styled.textarea`
  width: 93%;
  height: 180px;
  border-radius: 12px;
  border: 1px solid #bbb;
  padding: 15px;
  resize: none;
  font-size: 14px;
  background: #fafafa;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: border-color 0.3s;
  font-family: 'Roboto', sans-serif;

  &:focus {
    outline: none;
    border-color: #3759c7;
  }
`;

const FileSection = styled.div`
  margin-top: 20px;
  background: #fafafa;
  border: 1px solid #ddd;
  padding: 15px 20px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);

  div {
    flex: 1;

    p {
      margin: 0;
      font-size: 14px;
      color: #444;
    }
  }
`;

const ViewFileButton = styled.button`
  margin-top: 5px;
  font-size: 12px;
  color: #3759c7;
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
`;

const UploadButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: #3759c7;
  color: white;
  font-size: 22px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #2a4a9c;
  }
`;

const SubmitButton = styled.button`
  margin-top: 25px;
  width: 100%;
  background: #3759c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: #2a4a9c;
    transform: translateY(-2px);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const RightPanel = styled.div`
  width: 310px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h3 {
    margin-top: 0;
    color: #3759c7;
  }
`;

const FeedbackTextarea = styled.textarea`
  width: 93%;
  height: 100px;
  border-radius: 12px;
  border: none;
  padding: 15px;
  resize: none;
  background: #fafafa;
  font-size: 14px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
  font-family: 'Roboto', sans-serif;
`;

const ScoreBadgeSection = styled.div`
  margin-top: 15px;

  p {
    margin: 0 0 8px 0;
    font-weight: 600;
    color: #333;
  }

  div {
    margin-top: 8px;

    p {
      margin: 0 0 8px 0;
      font-weight: 600;
      color: #333;
    }
  }
`;

const ScoreValue = styled.span`
  color: #3759c7;
`;

const BadgeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BadgeImage = styled.img`
  width: 180px;
  height: 180px;
  object-fit: contain;
  border-radius: 12px;
`;

const BadgeName = styled.span`
  margin-top: 6px;
  font-weight: 600;
  color: #3e46b9;
`;

const NoBadge = styled.span`
  color: #ff9800;
`;

const LeaderboardButton = styled.button`
  width: 100%;
  background: linear-gradient(135deg, #c0f4c6 0%, #a8e6a1 100%);
  border: none;
  border-radius: 15px;
  padding: 12px 0;
  cursor: pointer;
  font-weight: 600;
  margin-top: 20px;
  color: #2a8b46;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  max-width: 90%;
  max-height: 90%;
  overflow: auto;
  position: relative;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;
