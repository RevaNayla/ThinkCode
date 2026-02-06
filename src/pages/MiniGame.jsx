import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Layout from "../components/Layout";
import api from "../api/axiosClient";

export default function MiniGame() {
  const navigate = useNavigate();

  const [materi, setMateri] = useState([]);
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const materiRes = await api.get("/materi");
        const levelRes = await api.get("/game/levels");
        const progressRes = await api.get("/game/progress");

        setMateri(materiRes.data?.data || []);
        setLevels(levelRes.data?.data || []);
        setProgress(progressRes.data?.data || []);
      } catch (err) {
        console.error("Gagal load mini game", err);
      }
    };

    load();
  }, []);

  /* ================= HELPER ================= */
  const isCompleted = (levelId) =>
    progress.some(
      (p) =>
        Number(p.levelId) === Number(levelId) &&
        (p.completed === true || Number(p.completed) === 1)
    );

  /* ================= BUILD MAP ================= */
  const buildMap = () => {
    return materi.map((m, materiIndex) => {
      const materiLevels = levels
        .filter((lvl) => lvl.materi_id === m.id)
        .sort((a, b) => a.levelNumber - b.levelNumber);

      let materiUnlocked = false;

      if (materiIndex === 0) {
        materiUnlocked = true; 
      } else {
        const prevMateri = materi[materiIndex - 1];
        const prevLevels = levels.filter(
          (l) => l.materi_id === prevMateri.id
        );

        materiUnlocked =
          prevLevels.length > 0 &&
          prevLevels.every((pl) => isCompleted(pl.id));
      }

      const mappedLevels = materiLevels.map((lvl, levelIndex) => {
        const completed = isCompleted(lvl.id);
        let unlocked = false;

        if (materiUnlocked) {
          if (levelIndex === 0) {
            unlocked = true;
          } else {
            unlocked = isCompleted(materiLevels[levelIndex - 1].id);
          }
        }

        return {
          ...lvl,
          completed,
          unlocked,
        };
      });

      return {
        ...m,
        unlocked: materiUnlocked,
        levels: mappedLevels,
      };
    });
  };

  const data = buildMap();

  /* ================= RENDER ================= */
  return (
    <Layout>
      <Wrapper>
        <Header>Mini Games</Header>

        <MapScroll>
          {data.map((m) => (
            <MateriSection key={m.id}>
              <LineWrapper>
                <HorizontalLine />
                <MateriTitle>{m.title}</MateriTitle>
                <HorizontalLine />
              </LineWrapper>

              <NodeColumn>
                {m.levels.map((lvl, index) => (
                  <NodeWrapper key={lvl.id}>
                    {index !== 0 && <LevelLine />}

                    <Node
                      $status={
                        lvl.completed
                          ? "completed"
                          : lvl.unlocked
                          ? "current"
                          : "locked"
                      }
                      onClick={() =>
                        lvl.unlocked &&
                        navigate(`/game/play/${lvl.id}`)
                      }
                    >
                      {lvl.levelNumber}
                    </Node>

                    <NodeLabel>{lvl.title}</NodeLabel>
                  </NodeWrapper>
                ))}
              </NodeColumn>
            </MateriSection>
          ))}
        </MapScroll>
      </Wrapper>
    </Layout>
  );
}

/* STYLED COMPONENTS */

const Wrapper = styled.div`
  padding: 20px 40px;
`;

const Header = styled.h2`
  margin-bottom: 25px;
`;

const MapScroll = styled.div`
  display: flex;
  flex-direction: column;
  gap: 140px;
  padding-bottom: 80px;
`;

const MateriSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LineWrapper = styled.div`
  display: flex;
  align-items: center;
  width: 90%;
`;

const HorizontalLine = styled.div`
  flex: 1;
  height: 2px;
  background: #d6cccc;
`;

const MateriTitle = styled.div`
  margin: 0 25px;
  font-size: 18px;
  font-weight: 600;
`;

const NodeColumn = styled.div`
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 55px;
`;

const NodeWrapper = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LevelLine = styled.div`
  width: 2px;
  height: 60px;
  background: #d6cccc;
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
`;

const Node = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: ${({ $status }) =>
    $status === "completed"
      ? "#9EE493"
      : $status === "current"
      ? "#AECBFA"
      : "#D9D9D9"};
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 22px;
  font-weight: bold;
  cursor: ${({ $status }) =>
    $status === "locked" ? "default" : "pointer"};
  transition: 0.25s;

  &:hover {
    transform: ${({ $status }) =>
      $status === "locked" ? "none" : "scale(1.08)"};
  }
`;

const NodeLabel = styled.div`
  margin-top: 6px;
  font-size: 14px;
`;
