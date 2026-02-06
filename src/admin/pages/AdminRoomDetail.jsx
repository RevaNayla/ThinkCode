import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import styled from "styled-components"; 

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Arial', sans-serif;
  background-color: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  color: #333;
  margin: 0;
`;

const Status = styled.p`
  color: ${props => (props.isClosed ? '#d9534f' : '#5cb85c')};
  font-weight: bold;
  margin: 0;
`;

const BackButton = styled.button`
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }
`;

const ClueSection = styled.section`
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ClueTitle = styled.h3`
  color: #333;
  margin: 0 0 10px 0;
`;

const MainSection = styled.section`
  display: flex;
  gap: 20px;
`;

const ChatContainer = styled.div`
  flex: 1;
`;

const ChatTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const ChatBox = styled.div`
  height: 420px;
  overflow-y: auto;
  border: 1px solid #ddd;
  padding: 12px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const Message = styled.div`
  margin-bottom: 15px;
  padding: 10px;
  border-radius: 5px;
  background-color: #f1f1f1;
`;

const SenderName = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #007bff;
`;

const MessageText = styled.div`
  margin: 5px 0;
  color: #333;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: #666;
`;

const MembersContainer = styled.div`
  width: 300px;
`;

const MembersTitle = styled.h3`
  color: #333;
  margin-bottom: 10px;
`;

const MembersList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MemberItem = styled.li`
  padding: 8px 0;
  border-bottom: 1px solid #eee;

  &:last-child {
    border-bottom: none;
  }
`;

const Loading = styled.p`
  text-align: center;
  font-size: 18px;
  color: #666;
`;

export default function AdminRoomDetail() {
  const { roomId } = useParams();
  const [roomMeta, setRoomMeta] = useState(null);
  const [messages, setMessages] = useState([]);
  const [clueInfo, setClueInfo] = useState({ used: 0, max: 3 });
  const [members, setMembers] = useState([]);
  const socketRef = useRef(null);
  const messagesRef = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const socket = io("http://localhost:5000", {
      auth: { token }
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected:", socket.id);
      socket.emit("join_room", { roomId: Number(roomId) });
      socket.emit("admin_request_clue", { roomId: Number(roomId) });
      socket.emit("refresh_meta", { roomId: Number(roomId) });
    });


    socket.on("room_message", (msg) => {
      messagesRef.current = [...messagesRef.current, msg];
      setMessages([...messagesRef.current]);
    });

    socket.on("room_meta", (meta) => {
      setRoomMeta(meta);
      if (meta.clueUsed !== undefined) setClueInfo({ used: meta.clueUsed, max: meta.maxClue || 5 });
    });

    socket.on("clue_update", (c) => {
      console.log("ADMIN CLUE UPDATE:", c);
      setClueInfo({ used: c.used, max: c.max });
    });

    socket.on("presence", (p) => {
      console.log("presence:", p);
    });

    socket.on("action_error", (err) => {
      alert(err.message);
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    fetchInitialData();

    return () => {
      socket.emit("leave_room", { roomId: Number(roomId) });
      socket.disconnect();
    };

  }, [roomId]);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem("token");
      const r = await fetch(`http://localhost:5000/api/admin/discussion/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jr = await r.json();
      if (jr.status && jr.data) {
        setRoomMeta(jr.data.room);
        setMessages(jr.data.messages || []);
        messagesRef.current = jr.data.messages || [];
        setClueInfo(jr.data.clue || { used: 0, max: 5 });
      }

      const m = await fetch(`http://localhost:5000/api/admin/discussion/room/${roomId}/members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const jm = await m.json();
      setMembers(jm.data || []);

    } catch (e) {
      console.error("initial load error:", e);
    }
  };

  if (!roomMeta) return <Loading>Memuat...</Loading>;

  return (
    <Container>
      <Header>
        <div>
          <Title>Observer — Room: {roomMeta.room_name}</Title>
          <Status isClosed={roomMeta.is_closed}>
            Status: {roomMeta.is_closed ? "Ditutup" : "Terbuka"}
          </Status>
        </div>
        <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
      </Header>

      <ClueSection>
        <ClueTitle>Clue usage: {clueInfo.used} / {clueInfo.max}</ClueTitle>
      </ClueSection>

      <MainSection>
        <ChatContainer>
          <ChatTitle>Chat (Realtime)</ChatTitle>
          <ChatBox>
            {messages.map((m, idx) => (
              <Message key={idx}>
                <SenderName>{m.sender_name || `User ${m.userId}`}</SenderName>
                <MessageText>{m.message}</MessageText>
                <Timestamp>{new Date(m.timestamp).toLocaleString()}</Timestamp>
              </Message>
            ))}
          </ChatBox>
        </ChatContainer>

        <MembersContainer>
          <MembersTitle>Anggota ({members.length})</MembersTitle>
          <MembersList>
            {members.map(m => (
              <MemberItem key={m.id}>{m.name || `User ${m.user_id}`}</MemberItem>
            ))}
          </MembersList>
        </MembersContainer>
      </MainSection>
    </Container>
  );
}