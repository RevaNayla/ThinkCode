import { useEffect, useState } from "react";
import styled from "styled-components"; 
import AdminCard from "../components/AdminCard";
import { apiGet } from "../../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalSiswa: 0,
    totalMateri: 0,
    totalRoom: 0,
    pendingSubmission: 0,
    avgProgress: 0,
    topXP: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const s = await apiGet("/admin/summary");
        setStats(s);
        const act = await apiGet("/admin/recent-activity?limit=10");
        setRecentActivity(act);
      } catch (e) {
        console.error("Load dashboard", e);
      }
    }
    load();
  }, []);

  return (
    <DashboardContainer>
      <PageTitle>Dashboard Guru</PageTitle>

      <StatsGrid>
        <AdminCard title="Jumlah Siswa" value={stats.totalSiswa} />
        <AdminCard title="Jumlah Materi" value={stats.totalMateri} />
        <AdminCard title="Ruang Diskusi" value={stats.totalRoom} />
        <AdminCard title="Submission Menunggu" value={stats.pendingSubmission} />
        <AdminCard title="Progress Rata-rata (%)" value={stats.avgProgress} />
      </StatsGrid>

      <Section>
        <SectionTitle>XP Teratas</SectionTitle>
        <TopXPList>
          {stats.topXP && stats.topXP.map((t, i) => (
            <XPItem key={i}>
              <Rank>{i + 1}.</Rank> {t.name} — {t.xp} XP
            </XPItem>
          ))}
        </TopXPList>
      </Section>

      <Section>
        <SectionTitle>Aktivitas Terbaru</SectionTitle>
        <ActivityList>
          {recentActivity.map((r) => (
            <ActivityItem key={r.id}>
              <TimeStamp>{r.time}</TimeStamp> — <User>{r.user}</User>: {r.action}
            </ActivityItem>
          ))}
        </ActivityList>
      </Section>
    </DashboardContainer>
  );
}

// Styled Components
const DashboardContainer = styled.div`
  padding: 10px;
  margin: 0 auto;
  font-family: 'Arial', sans-serif;
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 15px;
  text-align: center;
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
`;

const Section = styled.div`
  margin-top: 40px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 500;
`;

const TopXPList = styled.ol`
  list-style: none;
  padding: 0;
`;

const XPItem = styled.li`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #eee;
  font-size: 1.1rem;
  color: #555;

  &:last-child {
    border-bottom: none;
  }
`;

const Rank = styled.span`
  font-weight: bold;
  color: #007bff;
  margin-right: 10px;
  min-width: 20px;
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
`;

const ActivityItem = styled.li`
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 1rem;
  color: #666;

  &:last-child {
    border-bottom: none;
  }
`;

const TimeStamp = styled.span`
  font-weight: bold;
  color: #007bff;
`;

const User = styled.span`
  font-weight: 500;
  color: #333;
`;