import { useEffect, useState } from "react";
import { apiGet } from "../services/api";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

export default function GameMap() {
  const [levels, setLevels] = useState([]);
  const [progress, setProgress] = useState([]);

  // ================= LOAD DATA =================
  useEffect(() => {
    apiGet("/game/map").then(res => {
      if (res.status) {
        console.log("LEVELS DARI API:", res.levels);
      console.log("PROGRESS DARI API:", res.progress);
        setLevels(res.levels);
        setProgress(res.progress);
      }
    });
  }, []);

  // ================= GROUP BY MATERI =================
  const materiList = Object.values(
    levels.reduce((acc, lvl) => {
      if (!acc[lvl.materiId]) {
        acc[lvl.materiId] = {
          materiId: lvl.materiId,
          materiName: lvl.materiName,
          levels: []
        };
      }
      acc[lvl.materiId].levels.push(lvl);
      return acc;
    }, {})
  ).sort((a, b) => a.materiId - b.materiId);  

  // ================= UNLOCK LOGIC =================
  const isCompleted = (levelId) => {
  const found = progress.find(p => p.levelId === levelId);
  console.log("CHECK LEVEL:", levelId, found);
  return found && Number(found.completed) === 1;
};

  const isUnlocked = (materiIndex, levelIndex) => {
    console.log(`Checking unlock: materiIndex=${materiIndex}, levelIndex=${levelIndex}`);

    if (materiIndex === 0 && levelIndex === 0) return true;

    if (levelIndex === 0) {
      const prevMateriLevels = materiList[materiIndex - 1].levels;
      return prevMateriLevels.every(l => isCompleted(l.id));
    }

    const prevLevel = materiList[materiIndex].levels[levelIndex - 1];
    return isCompleted(prevLevel.id);

    
  };

  return (
    <Layout>
        <div style={{ padding: 40, fontFamily: 'Roboto, sans-serif' }}>
        {materiList.map((materi, mIdx) => (
          <div key={materi.materiId} style={{ marginBottom: 60 }}>

            <h3 style={{ textAlign: "center" }}>{materi.materiName}</h3>

            <div style={{ display: "flex", justifyContent: "center", gap: 30 }}>
              {materi.levels.map((lvl, lIdx) => {
                const unlocked = isUnlocked(mIdx, lIdx);
                const completed = isCompleted(lvl.id);

                return unlocked ? (
                  <Link key={lvl.id} to={`/game/play/${lvl.id}`}>
                    <div style={{
                      width: 50,
                      height: 50,
                      borderRadius: "50%",
                      background: completed ? "#4caf50" : "#ccc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700
                    }}>
                      {lvl.levelNumber}
                    </div>
                  </Link>
                ) : (
                  <div key={lvl.id} style={{
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    background: "#999",
                    opacity: 0.4,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    🔒
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
