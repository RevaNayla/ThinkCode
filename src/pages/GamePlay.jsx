import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { apiGet, apiPost } from "../services/api";
import Sidebar from "../components/Sidebar";

export default function GamePlay() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [level, setLevel] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [result, setResult] = useState(null);

  const timeoutRef = useRef(null);

  /* ================= LOAD LEVEL ================= */
  useEffect(() => {
    let mounted = true;

    const loadLevel = async () => {
      try {
        const res = await apiGet(`/game/level/${id}`);
        if (!res.status) throw new Error("Load gagal");

        const fixedQuestions = (res.questions || []).map((q) => {
          let meta = q.meta;
          if (typeof meta === "string") {
            try {
              meta = JSON.parse(meta);
            } catch {
              meta = {};
            }
          }
          return { ...q, meta };
        });

        if (mounted) {
          setLevel(res.level);
          setQuestions(fixedQuestions);
          setIndex(0);
          setAnswers([]);
          setResult(null);
        }
      } catch (err) {
        console.error(err);
        alert("Gagal memuat level");
      }
      
    };

    loadLevel();
    return () => {
      mounted = false;
      clearTimeout(timeoutRef.current);
    };
  }, [id]);

  if (!level) return <LoadingText>Memuat level...</LoadingText>;
  if (!questions.length)
    return <LoadingText>Level belum memiliki soal</LoadingText>;

  const q = questions[index];

  /* ================= SUBMIT JAWABAN ================= */
  const submitAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);

    let correct = false;

    if (q.type === "mcq") {
      correct = Number(answer) === Number(q.meta.answerIndex);
    }

    if (["essay", "fill"].includes(q.type)) {
      correct =
        String(answer).trim().toLowerCase() ===
        String(q.meta.answer).trim().toLowerCase();
    }

    setFeedback(correct ? "correct" : "wrong");

    timeoutRef.current = setTimeout(() => {
      setFeedback(null);
      if (index + 1 < questions.length) {
        setIndex((prev) => prev + 1);
      } else {
        finish(newAnswers);
      }
    }, 700);
  };

  /* ================= SUBMIT LEVEL ================= */
  const finish = async (finalAnswers) => {
    try {
      const payload = finalAnswers.map((a, i) => ({
        questionId: questions[i].id,
        answer: a,
      }));

      const res = await apiPost(`/game/submit/${level.id}`, {
        answers: payload,
      });

      if (!res.status) throw new Error("Submit gagal");
      setResult(res);
    } catch (err) {
      console.error(err);
      alert("Gagal submit hasil");
    }
  };

  return (
    <Container>
      <Sidebar
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />

      <Main collapsed={collapsed}>
        <Header>
          <Title>{level.title}</Title>
          <BackButton onClick={() => navigate(-1)}>Kembali</BackButton>
        </Header>

        <Card>
          <QuestionCounter>
            Soal {index + 1} / {questions.length}
          </QuestionCounter>

          <QuestionContent>{q.content}</QuestionContent>

          {q.type === "mcq" && <MCQ q={q} onSubmit={submitAnswer} />}
          {["essay", "fill"].includes(q.type) && (
            <Essay onSubmit={submitAnswer} />
          )}

          {feedback && (
            <Feedback correct={feedback === "correct"}>
              {feedback === "correct" ? "Benar!" : "Salah"}
            </Feedback>
          )}
        </Card>
      </Main>

      {/* ================= POPUP ================= */}
      {result && (
        <Overlay>
          <Modal>
            <h2>🎉 Level Selesai</h2>
            <p>Skor: <b>{result.scorePercent}%</b></p>
            <p>Benar: {result.correct} / {result.total}</p>
            <p>XP Didapat: <b>{result.gainedXp}</b></p>
            <p>Total XP: <b>{result.totalXpUser}</b></p>

            {result.badge && (
              <>
                <h4>🏅 Badge Baru</h4>
                <BadgeImage
                  src={result.badge.image}
                  alt={result.badge.badge_name}
                />
                <div>{result.badge.badge_name}</div>
              </>
            )}

            <Button onClick={() => navigate("/game")}>
              Kembali ke Peta Level
            </Button>
          </Modal>
        </Overlay>
      )}
    </Container>
  );
}

/* ================= MCQ ================= */
function MCQ({ q, onSubmit }) {
  if (!Array.isArray(q.meta?.options)) {
    return <ErrorText>⚠️ Opsi belum tersedia</ErrorText>;
  }

  return (
    <OptionsContainer>
      {q.meta.options.map((opt, i) => (
        <OptionButton key={i} onClick={() => onSubmit(i)}>
          {opt}
        </OptionButton>
      ))}
    </OptionsContainer>
  );
}

/* ================= ESSAY ================= */
function Essay({ onSubmit }) {
  const [val, setVal] = useState("");
  return (
    <>
      <Textarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Tulis jawaban Anda..."
      />
      <Button onClick={() => onSubmit(val)}>Kirim</Button>
    </>
  );
}

/* ================= STYLED COMPONENTS ================= */
const Container = styled.div`
  min-height: 100vh;
  display: flex;
`;

const Main = styled.main`
  padding: 30px;
  margin-left: ${(props) => (props.collapsed ? "70px" : "280px")};
  flex: 1;
  transition: margin-left 0.3s;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
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

const Card = styled.div`
  margin-top: 15px;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const QuestionCounter = styled.div`
  font-size: 14px;
  color: #666;
`;

const QuestionContent = styled.div`
  margin-top: 12px;
  font-size: 16px;
  line-height: 1.5;
`;

const OptionsContainer = styled.div`
  margin-top: 12px;
`;

const OptionButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 8px;
  border: 1px solid #ddd;
  text-align: left;
  background: #f9f9f9;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: #e0e0e0;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  height: 90px;
  margin-top: 10px;
  padding: 10px 5px;
  border-radius: 8px;
  border: 1px solid #ddd;
  resize: vertical;
`;

const Feedback = styled.div`
  margin-top: 12px;
  font-weight: 700;
  color: ${(props) => (props.correct ? "green" : "red")};
`;

const LoadingText = styled.p`
  padding: 30px;
  text-align: center;
`;

const ErrorText = styled.p`
  color: red;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const Modal = styled.div`
  background: #fff;
  padding: 30px;
  border-radius: 16px;
  width: 360px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const BadgeImage = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  margin: 10px 0;
`;

const Button = styled.button`
  margin-top: 15px;
  padding: 10px 22px;
  border-radius: 8px;
  background: #3759c7;
  color: #fff;
  border: none;
  cursor: pointer;
  font-weight: 600;

  &:hover {
    background: #2a4a9c;
  }
`;