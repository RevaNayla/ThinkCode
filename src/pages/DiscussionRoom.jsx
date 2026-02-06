import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";

import api from "../api/axiosClient";
import socket from "../socket";

import Layout from "../components/Layout";
import MiniLessonModal from "../components/MiniLessonModal";
import ClueProgress from "../components/ClueProgress";

export default function DiscussionRoom() {
  const { materiId, roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= STATE ================= */
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const [miniContent, setMiniContent] = useState("");
  const [showMini, setShowMini] = useState(false);

  const [clues, setClues] = useState([]);
  const [usedClues, setUsedClues] = useState([]);

  const [userXp, setUserXp] = useState(0); 

  const clueMax = 3;

  /* ================= REF ================= */
  const bottomRef = useRef(null);

  /* ================= LOAD USER XP ================= */
  useEffect(() => {
    if (!materiId || !user?.id) return;

    // Coba ambil dari /materi/{materiId} dulu
    api.get(`/materi/${materiId}`)
      .then(res => {
        console.log("API /materi response:", res.data); 
        const progress = res.data.data.progress;
        if (progress?.xp !== undefined) {
          setUserXp(progress.xp);
          console.log("XP loaded from /materi:", progress.xp); 
        } else {
          console.warn("XP not found in /materi, trying fallback...");
          // Fallback ke API baru
          return api.get(`/discussion/user-xp/${materiId}`);
        }
      })
      .then(fallbackRes => {
        if (fallbackRes) {
          console.log("Fallback API response:", fallbackRes.data); 
          setUserXp(fallbackRes.data.xp || 0);
          console.log("XP loaded from fallback:", fallbackRes.data.xp);
        }
      })
      .catch(err => {
        console.error("Error loading XP:", err); 
        setUserXp(0); 
      });
  }, [materiId, user?.id]);

  /* ================= MINI LESSON ================= */
  useEffect(() => {
    if (!materiId) return;

    api.get(`/discussion/mini/${materiId}`)
      .then(res => {
        setMiniContent(res.data?.data?.content || "Mini lesson tidak tersedia");
      })
      .catch(() => setMiniContent("Mini lesson tidak tersedia"));
  }, [materiId]);

  /* ================= LOAD CLUE MASTER ================= */
  useEffect(() => {
    if (!materiId) return;

    api.get(`/discussion/clue/${materiId}`)
      .then(res => {
        if (res.data.status) setClues(res.data.data || []);
      })
      .catch(err => console.error("ERROR load clues:", err));
  }, [materiId]);

  /* ================= LOAD USED CLUE ================= */
  const loadUsedClues = async () => {
    const res = await api.get(`/discussion/clue/used/${roomId}`);
    setUsedClues(res.data.data || []);
  };

  useEffect(() => {
    if (!roomId) return;
    loadUsedClues();
  }, [roomId]);

  /* ================= LOAD CHAT ================= */
  useEffect(() => {
    if (!roomId) return;

    api.get(`/discussion/room/${roomId}`).then(res => {
      setMessages(res.data.data || []);
      scrollBottom();
    });
  }, [roomId]);

  /* ================= SOCKET ================= */
  useEffect(() => {
    if (!roomId || !user?.id) return;

    socket.emit("joinRoom", {
      roomId: Number(roomId),
      userId: user.id,
    });

    socket.on("newMessage", msg => {
      setMessages(prev => [...prev, msg]);
      scrollBottom();
    });

    socket.on("clueUsed", data => {
      console.log('Received clueUsed:', data); 
      setMessages(prev => [
        ...prev,
        {
          id: `clue-${data.id}`,
          userName: "System",
          userInitial: "💡",
          message: data.clueText,  
          createdAt: data.createdAt,
          type: "clue",
        },
      ]);
      loadUsedClues();
      scrollBottom();
    });

    return () => {
      socket.off("newMessage");
      socket.off("clueUsed");
    };
  }, [roomId, user?.id]);

  /* ================= HELPER ================= */
  const scrollBottom = () => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  /* ================= ACTION ================= */
  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      roomId: Number(roomId),
      userId: user.id,
      message: text,
    });

    setText("");
  };

  const requestClue = async () => {
    if (usedClues.length >= clueMax) return;

    const nextClue = clues[usedClues.length];
    if (!nextClue) return;

    const isXpEnough = userXp >= nextClue.cost; 

    const result = await Swal.fire({
      title: "Ambil Clue?",
      html: `
        <p>XP <b>SEMUA anggota</b> akan berkurang <b>${nextClue.cost}</b></p>
        ${!isXpEnough ? '<p style="color: red;">⚠️ XP mungkin tidak cukup untuk semua anggota. Jika kurang, clue tidak bisa dibuka.</p>' : ''}
        <p>Dapatkan XP tambahan di <a href="/game" target="_blank">halaman Mini Game</a>.</p>
      `,
      icon: isXpEnough ? "warning" : "error",
      showCancelButton: true,
      confirmButtonText: "Ya, Ambil",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/discussion/room/${roomId}/clue/${nextClue.id}/use`);
      loadUsedClues();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Gagal membuka clue";
      Swal.fire({
        title: "Error",
        text: `${errorMsg}. Kunjungi halaman Mini Game untuk dapat XP tambahan.`,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <Layout>
      <Wrapper>
        <Header>
          <LeftHeader>
            <Title>Materi {materiId}</Title>
            <Breadcrumb>Orientasi Masalah &gt; Ruang Diskusi</Breadcrumb>
          </LeftHeader>
          <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
        </Header>

        <RoomCard>
          <RoomTop>
            <RoomName>Room {roomId}</RoomName>

            <RightTop>
              <ClueProgress
                usedClues={usedClues.length}
                totalClues={clueMax}
                onClick={requestClue}
              />
              <InfoButton onClick={() => setShowMini(true)}>i</InfoButton>
            </RightTop>
          </RoomTop>

          <ChatBox>
            {messages.map((m, i) => (
              <MessageBubble key={i}>
                <Avatar>{m.userInitial || "?"}</Avatar>
                <MsgContent>
                  <UserName>{m.type === "clue" ? "System" : m.userName}</UserName> 
                  <MessageText>{m.message}</MessageText>
                  <Time>{new Date(m.createdAt).toLocaleString()}</Time>
                </MsgContent>
              </MessageBubble>
            ))}
            <div ref={bottomRef} />
          </ChatBox>

          <BottomInput>
            <Input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Tulis pesan..."
            />

            <UploadButton
              onClick={() =>
                navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`)
              }
            >
              Upload Jawaban
            </UploadButton>

            <SendButton onClick={sendMessage}>Kirim</SendButton>
          </BottomInput>
        </RoomCard>

        <MiniLessonModal
          show={showMini}
          onClose={() => setShowMini(false)}
          content={miniContent}
        />
      </Wrapper>
    </Layout>
  );
}

/* ================= STYLED ================= */
const Wrapper = styled.div`
  padding: 15px 30px;
  font-family: 'Roboto', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 10px 0;
`;

const LeftHeader = styled.div``;

const Title = styled.h2`
  margin: 0;
`;

const Breadcrumb = styled.div`
  font-size: 13px;
  color: #777;
`;

const BackButton = styled.button`
  background: #3759c7;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: background 0.3s, transform 0.2s;

  &:hover {
    background: #2a4a9c;
    transform: scale(1.02);
  }
`;

const RoomCard = styled.div`
  background: #e9eaec;
  padding: 20px;
  border-radius: 14px;
`;

const RoomTop = styled.div`
  display: flex;
  justify-content: space-between;
`;

const RoomName = styled.div`
  background: white;
  padding: 7px 14px;
  border-radius: 20px;
  font-weight: bold;
`;

const RightTop = styled.div`
  display: flex;
  gap: 12px;
`;

const InfoButton = styled.div`
  width: 28px;
  height: 28px;
  background: #d9e6ff;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
`;

const ChatBox = styled.div`
  height: 360px;
  margin-top: 18px;
  background: #f5f5f5;
  padding: 15px;
  border-radius: 10px;
  overflow-y: auto;
`;

const MessageBubble = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
`;

const Avatar = styled.div`
  width: 42px;
  height: 42px;
  background: #dfe7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MsgContent = styled.div``;

const UserName = styled.div`
  font-weight: bold;
`;

const MessageText = styled.div`
  margin-top: 6px;
`;

const Time = styled.div`
  font-size: 11px;
  color: #777;
`;

const BottomInput = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const Input = styled.input`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
`;

const UploadButton = styled.button`
  padding: 12px 16px;
  background: #7ddf9c;
  border-radius: 10px;
  border: none;
`;

const SendButton = styled.button`
  padding: 12px 16px;
  background: #3759c7;
  color: white;
  border-radius: 10px;
  border: none;
`;