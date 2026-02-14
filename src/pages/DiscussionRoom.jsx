import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Swal from "sweetalert2";

import api from "../api/axiosClient";
import Layout from "../components/Layout";
import MiniLessonModal from "../components/MiniLessonModal";
import ClueProgress from "../components/ClueProgress";

export default function DiscussionRoom() {
  const { materiId, roomId } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  /* ================= STATE ================= */
  const [miniContent, setMiniContent] = useState("");
  const [showMini, setShowMini] = useState(false);
  const [pseudocode, setPseudocode] = useState("");
  const [clues, setClues] = useState([]);
  const [usedClues, setUsedClues] = useState([]);
  const [userXp, setUserXp] = useState(0);
  const clueMax = 3;

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [flowchart, setFlowchart] = useState({ conditions: [], elseInstruction: "" });

  const [performanceScore, setPerformanceScore] = useState(null);
  const [isPerformanceExpanded, setIsPerformanceExpanded] = useState(false);

const [isSubmitted, setIsSubmitted] = useState(false);

const loadSubmissionStatus = async () => {
  try {
    const res = await api.get(`/discussion/submission/status/${roomId}`);
    setIsSubmitted(res.data.submitted); 
  } catch (err) {
    console.error("Error loading submission status:", err);
  }
};

useEffect(() => {
  if (!roomId) return;
  loadSubmissionStatus();
}, [roomId]);

const loadPerformance = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.get(
      `/discussion/room/${roomId}/performance`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    setPerformanceScore(res.data.score);

  } catch (err) {
    console.error("Error load performance:", err);
  }
};

useEffect(() => {
  loadPerformance();
}, [roomId]);


useEffect(() => {
  if (!tasks.length) return;

  const allDone = tasks.every(task => task.done);

  if (allDone && performanceScore !== null) {
    Swal.fire({
      title: `🎉 Room Performance: ${getStars(performanceScore)}`,
      text: "Kerja tim yang luar biasa!",
      icon: "success"
    });
  }
}, [tasks]);


// ================= LOAD WORKSPACE DENGAN POLLING =================
const loadWorkspace = async () => {
  try {
    console.log("Loading workspace for room:", roomId);

    const res = await api.get(`/discussion/workspace/${roomId}`);
    const data = res?.data?.data || {};

    console.log("RAW RESPONSE:", data);

    // =========================
    // 1️⃣ PSEUDOCODE
    // =========================
    setPseudocode(data.pseudocode || "");

    // =========================
    // 2️⃣ FLOWCHART DEFAULT
    // =========================
    let loadedFlowchart = {
      conditions: [],
      elseInstruction: ""
    };

    // =========================
    // 3️⃣ PARSE FLOWCHART
    // =========================
    if (data.flowchart) {
      try {
        loadedFlowchart =
          typeof data.flowchart === "string"
            ? JSON.parse(data.flowchart)
            : data.flowchart;

        console.log("FLOWCHART PARSED:", loadedFlowchart);
      } catch (parseError) {
        console.error("❌ Error parsing flowchart:", parseError);
      }
    }

    // =========================
    // 4️⃣ SET STATE
    // =========================
    setConditions(Array.isArray(loadedFlowchart.conditions) 
      ? loadedFlowchart.conditions 
      : []
    );

    setElseInstruction(loadedFlowchart.elseInstruction || "");

    console.log("Workspace synced successfully ✅");

  } catch (err) {
    console.error("❌ Error loading workspace:", err);
  }
};

useEffect(() => {
  if (!roomId) return;

  console.log("CALLING loadWorkspace...");
  loadWorkspace();
}, [roomId]);


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

  /* ================= LOAD CLUES ================= */
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

  /* ================= REQUEST CLUE ================= */
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
        <p>Dapatkan XP tambahan di <Link to="/game"> halaman Mini Game</a>.</p>
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

  /* ================= FLOWCHART ================= */
const [conditions, setConditions] = useState([]);
const [elseInstruction, setElseInstruction] = useState("");


const addCondition = () => {
  const next = conditions.length + 1;

  const newConditions = [
    ...conditions,
    { condition: `Kondisi ${next}`, yes: `Instruksi ${next}` }
  ];

  setConditions(newConditions);
};


const updateCondition = (index, field, value) => {
  const updated = [...conditions];
  updated[index][field] = value;
  setConditions(updated);
  setFlowchart(prev => ({ ...prev, conditions: updated }));  // Sinkronkan
};

const handleAddElse = () => {
  setElseInstruction("Instruksi ELSE");
  setFlowchart(prev => ({ ...prev, elseInstruction: "Instruksi ELSE" }));
  console.log("ELSE ditambahkan:", "Instruksi ELSE");
  alert("Instruksi ELSE telah ditambahkan! (State diperbarui untuk disimpan)");
};

  const renderFlowchart = () => {
    const height = 160 + conditions.length * 180 + (elseInstruction ? 120 : 0);

    return (
      <svg
        width="170%"
        height={height}
        viewBox={`160 0 640 ${height}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill="#000" />
          </marker>
        </defs>

        {/* START */}
        <ellipse
          cx="300"
          cy="80"
          rx="70"
          ry="30"
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />
        <text x="300" y="85" textAnchor="middle">
          Mulai
        </text>

        {conditions.map((item, index) => {
          const y = 180 + index * 180;

          return (
            <g key={index}>
              {/* Garis dari atas */}
              <line
                x1="300"
                y1={index === 0 ? 110 : y - 100}
                x2="300"
                y2={y - 40}
                stroke="#000"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />

              {/* Diamond */}
              <polygon
                points={`300,${y - 40} 380,${y} 300,${y + 40} 220,${y}`}
                fill="#fff"
                stroke="#000"
                strokeWidth="2"
              />

              {/* INPUT KONDISI */}
              <foreignObject
                x="240"
                y={y - 20}
                width="120"
                height="40"
              >
                <input
                  value={item.condition}
                  onChange={(e) =>
                    updateCondition(index, "condition", e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontWeight: "bold",
                  }}
                />
              </foreignObject>

              {/* YES LABEL */}
              <text x="395" y={y - 10} fontSize="13">
                Ya
              </text>

              {/* Garis ke kanan */}
              <line
                x1="380"
                y1={y}
                x2="580"
                y2={y}
                stroke="#000"
                strokeWidth="2"
                markerEnd="url(#arrow)"
              />

              {/* Process Box */}
              <rect
                x="580"
                y={y - 30}
                width="200"
                height="60"
                fill="#fff"
                stroke="#000"
                strokeWidth="2"
                rx="6"
              />

              {/* INPUT INSTRUKSI YES */}
              <foreignObject
                x="600"
                y={y - 20}
                width="160"
                height="40"
              >
                <input
                  value={item.yes}
                  onChange={(e) =>
                    updateCondition(index, "yes", e.target.value)
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    textAlign: "center",
                    border: "none",
                    background: "transparent",
                    outline: "none",
                  }}
                />
              </foreignObject>

              {/* Garis turun dari process */}
              <line
                x1="680"
                y1={y + 30}
                x2="680"
                y2={height - 60}
                stroke="#000"
                strokeWidth="2"
              />

              {/* LABEL NO */}
              <text x="245" y={y + 60} fontSize="13">
                Tidak
              </text>

              {/* Garis ke bawah */}
              {index < conditions.length - 1 && (
                <line
                  x1="300"
                  y1={y + 40}
                  x2="300"
                  y2={y + 100}
                  stroke="#000"
                  strokeWidth="2"
                  markerEnd="url(#arrow)"
                />
              )}

              {/* ELSE */}
              {index === conditions.length - 1 && elseInstruction && (
                <>
                  <line
                    x1="300"
                    y1={y + 40}
                    x2="300"
                    y2={y + 100}
                    stroke="#000"
                    strokeWidth="2"
                    markerEnd="url(#arrow)"
                  />

                  <rect
                    x="200"
                    y={y + 100}
                    width="200"
                    height="60"
                    fill="#fff"
                    stroke="#000"
                    strokeWidth="2"
                    rx="6"
                  />

                  <foreignObject
                    x="220"
                    y={y + 115}
                    width="160"
                    height="40"
                  >
                    <input
                      value={elseInstruction}
                      onChange={(e) =>
                        setElseInstruction(e.target.value)
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        textAlign: "center",
                        border: "none",
                        background: "transparent",
                        outline: "none",
                      }}
                    />
                  </foreignObject>
                </>
              )}
            </g>
          );
        })}

        {/* END */}
        <ellipse
          cx="680"
          cy={height - 30}
          rx="70"
          ry="30"
          fill="#fff"
          stroke="#000"
          strokeWidth="2"
        />
        <text x="680" y={height - 25} textAnchor="middle">
          Selesai
        </text>
      </svg>
    );
  };

useEffect(() => {
  if (!roomId) return;
  const loadTasks = async () => {
    try {
      const res = await api.get(`/discussion/task/${roomId}`);
      const taskMap = res.data.data; // {1: false, 2: true, ...}
      const defaultTasks = [
        { id: 1, text: "Identifikasi masalah dari video", done: false },
        { id: 2, text: "Tentukan data yang diperlukan", done: false },
        { id: 3, text: "Susun pseudocode", done: false },
        { id: 4, text: "Buat flowchart", done: false },
        { id: 5, text: "Implementasi program C", done: false },
      ];
      const updatedTasks = defaultTasks.map(task => ({
        ...task,
        done: taskMap[task.id] || false,
      }));
      setTasks(updatedTasks);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setTasks(defaultTasks); 
    } finally {
      setTasksLoading(false);
    }
  };
  loadTasks();
}, [roomId]);

const toggleTask = async (taskId, currentDone) => {
  try {
    await api.put(`/discussion/task/${roomId}/${taskId}`, {
      done: !currentDone,  
    });
    
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, done: !currentDone } : task
      )
    );
  } catch {
    Swal.fire("Error", "Gagal update task", "error");
  }
};

  /* ================= SAVE ================= */
const savePseudocode = async () => {
  try {
    await api.post(`/discussion/workspace/pseudocode/${roomId}/save`, {
      pseudocode
    });

    Swal.fire("Pseudocode berhasil disimpan!");
  } catch (err) {
    console.error("Error saving pseudocode:", err);
    Swal.fire("Error", "Gagal menyimpan pseudocode", "error");
  }
};


const saveFlowchart = async () => {
  try {
  await api.post(`/discussion/workspace/flowchart/${roomId}/save`, {
    flowchart: {
      conditions,
      elseInstruction
    }
  });


    Swal.fire("Flowchart berhasil disimpan!");
  } catch (err) {
    console.error("Error saving flowchart:", err);
    Swal.fire("Error", "Gagal menyimpan flowchart", "error");
  }
};

const getStars = (score) => {
  if (score >= 80) return "⭐⭐⭐⭐⭐";
  if (score >= 60) return "⭐⭐⭐⭐☆";
  if (score >= 40) return "⭐⭐⭐☆☆";
  if (score >= 20) return "⭐⭐☆☆☆";
  return "⭐☆☆☆☆";
};


  /* ================= UI ================= */
  return (
    <Layout>
      <Wrapper>
        <Header>
          <HeaderTop>
            <HeaderLeft>
              <Title>Materi {materiId}</Title>
              <Breadcrumb>
                Orientasi Masalah &gt; Ruang Diskusi &gt; Workspace
              </Breadcrumb>
            </HeaderLeft>

            <HeaderRight>
              <InfoButton onClick={() => setShowMini(true)}>i</InfoButton>
              <BackButton onClick={() => window.history.back()}>
                Kembali
              </BackButton>
            </HeaderRight>
          </HeaderTop>
          {/* TEAM PERFORMANCE (HANYA MUNCUL SAAT EXPANDED) */}
          {performanceScore !== null && (
            <PerformanceBox>
              <div className="label">🎮 Team Performance</div>

              <div className="stars">
                {getStars(performanceScore)}
              </div>

              <ProgressWrapper>
                <ProgressBar>
                  <div style={{ width: `${performanceScore || 0}%` }} />
                </ProgressBar>

                <span>
                  {Math.round(performanceScore || 0)}%
                </span>
              </ProgressWrapper>
            </PerformanceBox>
          )}
        </Header>

        <Container>
          {/* ================= LEFT PANEL ================= */}
          <LeftPanel>
            {/* ===== CLUE ===== */}
            <Card>
              <ClueHeader>
                <span>Clue {usedClues.length}/{clueMax}</span>
                <button
                  disabled={usedClues.length >= clueMax}
                  onClick={requestClue}
                >
                  Ambil Clue
                </button>
              </ClueHeader>

              <ClueList>
                {Array.from({ length: clueMax }).map((_, index) => {
                  const unlocked = index < usedClues.length;

                  return (
                    <ClueItem key={index} unlocked={unlocked}>
                      {unlocked ? (
                        <>
                          <strong>Clue {index + 1}:</strong>
                          <div>{clues[index]?.content}</div>
                        </>
                      ) : (
                        <>🔒 Clue {index + 1}</>
                      )}
                    </ClueItem>
                  );
                })}
              </ClueList>
            </Card>

            {/* ===== TASK ===== */}
            <Card>
              <h4>Task</h4>

              <TaskList>
                {tasks.map(task => (
                  <TaskItem key={task.id} done={task.done}>
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() => toggleTask(task.id, task.done)}
                      />
                    <span>{task.text}</span>
                  </TaskItem>
                ))}
              </TaskList>
            </Card>

            <UploadButton
              onClick={() => {
                const allDone = tasks.every(task => task.done);

                if (!allDone) {
                  Swal.fire({
                    icon: "warning",
                    title: "Task Belum Selesai",
                    text: "Semua task harus dicentang sebelum upload jawaban.",
                  });
                  return;
                }

                navigate(`/materi/${materiId}/room/${roomId}/upload-jawaban`);
              }}
            >
              Upload Jawaban
            </UploadButton>
          </LeftPanel>

          {/* ================= RIGHT PANEL ================= */}
          <RightPanel>
            {/* ===== PSEUDOCODE ===== */}
            <Card>
              <h4>Pseudocode</h4>
              <textarea
                value={pseudocode}
                onChange={(e) => setPseudocode(e.target.value)}
                placeholder="Tulis pseudocode di sini..."
              />
              <SaveButton 
                onClick={savePseudocode}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Sudah Dikirim" : "Simpan Pseudocode"}
              </SaveButton>
            </Card>

            {/* ===== FLOWCHART ===== */}
            <FlowchartCard>
              <h4>Flowchart</h4>
              <p style={{ fontSize: '12px', color: '#777' }}>Double-click pada label untuk edit. Klik button tambah kondisi untuk menambahkan kondisi dan buuton else untuk memambahkan else.</p>
              <div style={{ display: "flex", justifyContent: "center", overflowX: "hidden" }}>
                {renderFlowchart()}
              </div>

              <ButtonRow>
                <button onClick={addCondition}>
                  Tambah Kondisi (Else If)
                </button>

                <button onClick={() => {
                  if (!elseInstruction) {
                    setElseInstruction("Instruksi ELSE");
                    alert("Instruksi ELSE ditambahkan!");
                  } else {
                    alert("ELSE sudah ada.");
                  }
                }}>
                  Tambah ELSE
                </button>
              </ButtonRow>
              <SaveButton 
                onClick={saveFlowchart}
                disabled={isSubmitted}
              >
                {isSubmitted ? "Sudah Dikirim" : "Simpan Flowchart"}
              </SaveButton>
            </FlowchartCard>

          </RightPanel>
        </Container>
        <MiniLessonModal
          show={showMini}
          onClose={() => setShowMini(false)}
          content={miniContent}
        />
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
  flex-direction: column;   
  gap: 20px;                
  position: sticky;
  top: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(15px);
  z-index: 10;
  padding: 20px 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
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

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const HeaderRight = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-end;
`;

const InfoButton = styled.button`
  width: 40px;
  height: 40px;
  background: #4e8df5;
  border: none;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  font-size: 18px;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(87, 137, 245, 0.4);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(87, 137, 245, 0.4);
  }
`;

const Container = styled.div`
  display: flex;
  gap: 40px;
  padding: 40px;
  min-height: 80vh;
`;

const LeftPanel = styled.div`
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 25px;
`;
const PerformanceBox = styled.div`
  width: 97%;
  padding: 8px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;

  display: flex;
  align-items: center;
  gap: 20px;
  justify-content: space-between;

  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  font-size: 13px;

  .label {
    font-weight: 500;
    opacity: 0.9;
    white-space: nowrap;
  }

  .stars {
    font-size: 16px;
    white-space: nowrap;
  }
`;
const ProgressWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 220px;

span {
  font-size: 11px;
  font-weight: 600;
  background: rgba(255,255,255,0.2);
  padding: 3px 8px;
  border-radius: 20px;
  min-width: 40px;
  text-align: center;
}
`;


const PerformanceHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  h4 {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
`;

const ToggleSection = styled.div`
  margin-top: 20px;
  display: flex;
  justify-content: center;
  width: 100%;
`;
const ToggleButton = styled.button`
  background: none;
  border: none;
  color: #5f6fb841;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.3s ease;

  &:hover {
    color: #5a67d8;
  }
`;
const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  overflow: hidden;

  div {
    height: 100%;
    background: white;
    border-radius: 10px;
    transition: width 0.4s ease;
  }
`;
const Card = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h4 {
    margin: 0 0 15px 0;
    color: #2c3e50;
    font-weight: 600;
    font-size: 20px;
  }

  textarea {
    width: 94%;
    height: 250px;
    margin-top: 15px;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 15px;
    font-family: 'Roboto', sans-serif;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #667eea;
    }
  }
`;

const FlowchartCard = styled.div`
  padding: 10px;
  border-radius: 15px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);

  h4 {
    margin: 0 0 10px 0;
    color: #2c3e50;
    font-weight: 600;
    font-size: 20px;
  }

  p {
    margin: 0 0 20px 0;
    font-size: 13px;
    color: #7f8c8d;
  }
`;

const ClueHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  span {
    font-weight: 600;
    color: #2c3e50;
    font-size: 16px;
  }

  button {
    background: #4e8df5;
    color: white;
    border: none;
    border-radius: 10px;
    padding: 10px 20px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(164, 154, 255, 0.4);

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff6b6b, #feca57);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 154, 158, 0.6);
    }

    &:disabled {
      background: #ccc;
      cursor: not-allowed;
      box-shadow: none;
    }
  }
`;

const ClueList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ClueItem = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== "unlocked" 
})`
  padding: 15px;
  border-radius: 12px;
  background: ${({ unlocked }) =>
    unlocked ? "linear-gradient(135deg, #a8edea 0%, #b8aef0 100%)" : "linear-gradient(135deg, #d3cce3 0%, #e9e4f0 100%)"};
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-2px);
  }

  strong {
    color: #2c3e50;
  }

  div {
    margin-top: 5px;
    color: #34495e;
  }
`;

const ButtonRow = styled.div`
  margin-top: 25px;
  display: flex;
  gap: 20px;
  justify-content: center;

  button {
    padding: 12px 24px;
    border: none;
    border-radius: 12px;
    background: #2a8b46;
    color: white;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.3s ease;

    &:hover {
      background: #255031;
      transform: translateY(-2px);
    }
  }
`;

const SaveButton = styled.button`
  width: 100%;
  padding: 14px 20px;
  background: ${({ disabled }) => disabled ? "#ccc" : "#3759c7"};
  border: none;
  border-radius: 15px;
  font-weight: 600;
  font-size: 16px;
  color: white;
  cursor: ${({ disabled }) => disabled ? "not-allowed" : "pointer"};
  transition: all 0.3s ease;
  margin-top: 20px;

  &:hover {
    ${({ disabled }) =>
      !disabled &&
      `
        background: #2a4a9c;
        transform: translateY(-2px);
      `}
  }
`;


const TaskList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 15px;
`;

const TaskItem = styled.label.withConfig({
  shouldForwardProp: (prop) => prop !== "done"  
})`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
  cursor: pointer;
  padding: 10px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateX(5px);
  }

  span {
    text-decoration: ${({ done }) => (done ? "line-through" : "none")};
    opacity: ${({ done }) => (done ? 0.6 : 1)};
    color: #2c3e50;
  }

  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
    accent-color: #667eea;
  }
`;

const UploadButton = styled.button`
  padding: 14px 20px;
  background: #3759c7;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #2a4a9c;
    transform: translateY(-2px);
  }
`;