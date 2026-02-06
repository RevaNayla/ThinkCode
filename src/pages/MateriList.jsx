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

                <ProgressBar>
                  <div style={{ width: `${m.progress || 0}%` }} />
                </ProgressBar>

                <ActionLink to={`/materi/${m.id}`}>
                  Mulai / Lihat
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
  width: 320px;
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

const ProgressBar = styled.div`
  height: 10px;
  background: #e3e3e3;
  border-radius: 10px;
  overflow: hidden;

  div {
    height: 100%;
    background: #4a6cf7;
    transition: 0.3s;
  }
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
