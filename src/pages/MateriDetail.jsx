import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import styled from "styled-components"; 
import api from "../api/axiosClient";
import MiniLessonModal from "../components/MiniLessonModal";
import Layout from "../components/Layout";

export default function MateriDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [showMini, setShowMini] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]); 

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

  const handleVideoEnd = () => {
    console.log('Video ended, attempting to complete "watch_video"');
    if (!completedSteps.includes("watch_video")) {
      api.post(`/materi/${id}/complete-step`, { step: "watch_video" })
        .then(() => {
          console.log('Step "watch_video" completed');
          setCompletedSteps(prev => [...prev, "watch_video"]);
        })
        .catch(err => console.error('Error completing "watch_video":', err));
    }
  };

  const handleOpenMini = () => {
    console.log('Mini lesson opened, attempting to complete "open_mini_lesson"');
    setShowMini(true);
    if (!completedSteps.includes("open_mini_lesson")) {
      api.post(`/materi/${id}/complete-step`, { step: "open_mini_lesson" })
        .then(() => {
          console.log('Step "open_mini_lesson" completed');
          setCompletedSteps(prev => [...prev, "open_mini_lesson"]);
        })
        .catch(err => console.error('Error completing "open_mini_lesson":', err));
    }
  };

  return (
    <Layout>
      <Wrapper>
        {/* HEADER */}
        <Header>
          <HeaderLeft>
            <Title>{data.materi?.title}</Title>
            <Breadcrumb>Orientasi Masalah</Breadcrumb>
          </HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            Kembali
          </BackButton>
        </Header>

        {/* VIDEO WRAPPER */}
        <VideoWrapper>
          {videoSection ? (
            videoSection.content.includes("/uploads/") ? (
              (() => {
                // Logika untuk handle URL: Jika sudah lengkap (https://), gunakan langsung; jika relatif, gabung baseUrl
                const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '');  // Base tanpa /api
                const videoSrc = videoSection.content.startsWith('https://') 
                  ? videoSection.content 
                  : `${baseUrl}${videoSection.content}`;
                console.log("Video src:", videoSrc);  // Tambah logging untuk debug
                return (
                  <video
                    src={videoSrc}
                    controls
                    preload="metadata"
                    onEnded={handleVideoEnd}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: 12,
                      background: "#000",
                      objectFit: "contain",
                    }}
                  />
                );
              })()
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
            <VideoPlaceholder>Video</VideoPlaceholder>
          )}

          {/* INFO BUTTON */}
          <InfoButton onClick={handleOpenMini}>
            i
          </InfoButton>
        </VideoWrapper>

        {/* BUTTON RUANG DISKUSI */}
        <DiscussionButtonContainer>
          <Link to={`/materi/${id}/discussion`}>
            <DiscussionButton>
              Join Ruang Diskusi
            </DiscussionButton>
          </Link>
        </DiscussionButtonContainer>

        {/* MINI LESSON MODAL */}
        {showMini && (
          <MiniLessonModal
            show={showMini}  
            onClose={() => setShowMini(false)}
            content={data.miniLesson?.content || "Mini lesson tidak ditemukan."}
          />
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

const VideoWrapper = styled.div`
  width: 70%;
  height: 380px;
  background: #d8d8d8;
  border-radius: 12px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const VideoPlaceholder = styled.strong`
  font-size: 22px;
`;

const InfoButton = styled.button`
  position: absolute;
  left: -15px;
  bottom: -15px;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background: #4e8df5;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #3b7dd8;
    transform: scale(1.1);
  }
`;

const DiscussionButtonContainer = styled.div`
  margin-top: 40px;
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

const DiscussionButton = styled.button`
  background: #a7eeb5;
  padding: 12px 35px;
  border-radius: 14px;
  border: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    background: #8fd3f4;
    transform: translateY(-2px);
  }
`;