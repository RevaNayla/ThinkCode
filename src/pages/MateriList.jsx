import { useEffect, useState } from "react";
import { Link } from "react-router-dom"; 
import api from "../api/axiosClient";
import styled from "styled-components";
import Layout from "../components/Layout";

export default function MateriList() {
  const [materi, setMateri] = useState([]);

  useEffect(() => {
    api
      .get("/materi")
      .then(res => {
        setMateri(res.data?.data || []);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <PageWrapper>
      <Layout>
        <ContentArea>
          <Title>Materi</Title>

          <CardGrid>
            {materi.map(m => (
              <MateriCard key={m.id}>
                <h3>{m.title}</h3>
                <p>{m.description}</p>

                <ProgressWrapper>
                  <ProgressBar>
                    <ProgressFill style={{ width: `${Math.min(m.progress || 0, 100)}%` }} />
                    <ProgressText>
                      {Math.min(m.progress || 0, 100)}%
                    </ProgressText>
                  </ProgressBar>
                </ProgressWrapper>

                <ActionLink to={`/materi/${m.id}`}>
                  {m.progress >= 100 ? "Lihat" : "Mulai"}
                </ActionLink>
              </MateriCard>
            ))}
          </CardGrid>
        </ContentArea>
      </Layout>
    </PageWrapper>
  );
}

/*  Styled Components */

const PageWrapper = styled.div`
  font-family: 'Roboto', sans-serif;
  display: flex;
  width: 100%;
  gap: 24px;
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 20px;
`;

const Title = styled.h1`
  margin-bottom: 20px;
`;

const CardGrid = styled.div`
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
`;

const MateriCard = styled.div`
  width: 280px;
  background: #ffffff;
  padding: 20px;
  border-radius: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: 10px;

  h3 {
    margin: 0;
  }

  p {
    min-height: 40px;
    color: #444;
  }
`;

// Modifikasi: ProgressWrapper sekarang hanya wrap ProgressBar (karena teks sudah di dalam bar)
const ProgressWrapper = styled.div`
  position: relative;  // Untuk memastikan positioning overlay
`;

// Modifikasi: ProgressBar sekarang sebagai container dengan position relative
const ProgressBar = styled.div`
  position: relative;
  height: 24px;  // Ditingkatkan dari 10px agar teks lebih mudah dibaca
  background: #e3e3e3;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  align-items: center;
`;

// Modifikasi: ProgressFill adalah bagian bar yang terisi (sebelumnya div biasa)
const ProgressFill = styled.div`
  height: 100%;
  background: #4a6cf7;
  transition: 0.3s;
`;

// Modifikasi: ProgressText sekarang overlay di tengah bar
const ProgressText = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);  // Tengah bar
  font-size: 12px;
  font-weight: 600;
  color: #333;  // Warna gelap agar kontras di bar kosong; bisa diubah ke putih jika ingin di atas bar terisi
  z-index: 1;  // Pastikan di atas fill
`;

const ActionLink = styled(Link)`
  margin-top: 10px;
  color: #4a6cf7;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    opacity: 0.8;
  }
`;