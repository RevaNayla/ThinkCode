import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { apiGet, apiPut } from "../../services/api";
import {
  FaUser,
  FaLock,
  FaUserTie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEdit,
  FaShieldAlt,
  FaMagic,
} from "react-icons/fa";

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

// Styled Components
const Container = styled.div`
  justify-content: center;
  align-items: center;
`;

const Wrapper = styled.div`
  max-width: 1200px;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  animation: ${fadeIn} 0.8s ease-out;
`;

const HeaderCard = styled.div`
  background: linear-gradient(135deg, #1E1E2F 0%, #3A3A4F 100%);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  gap: 20px;
  color: white;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
  }
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(10px);
`;

const HeaderInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
`;

const Email = styled.p`
  font-size: 1.2rem;
  margin: 10px 0;
  opacity: 0.9;
`;

const RoleBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 50px;
  background: rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  font-weight: bold;
  backdrop-filter: blur(10px);
`;

const AlertCard = styled.div`
  background: ${props => props.type === 'error' ? '#fef2f2' : '#f0fdf4'};
  border-left: 4px solid ${props => props.type === 'error' ? '#ef4444' : '#22c55e'};
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;
  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-10px) rotate(1deg);
    box-shadow: 0 20px 40px rgba(30, 30, 47, 0.3);
  }
`;

const SecurityCard = styled.div`
  background: linear-gradient(135deg, #ffffff, #f8f9fa);
  border-radius: 20px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(30, 30, 47, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover {
    transform: translateY(-10px) rotate(-1deg);
    box-shadow: 0 20px 40px rgba(30, 30, 47, 0.3);
  }
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1E1E2F;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4b5563;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 6px;
  border: 2px solid #d1d5db;
  border-radius: 10px;
  font-size: 1rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  &:focus {
    outline: none;
    border-color: #1E1E2F;
    box-shadow: 0 0 0 3px rgba(30, 30, 47, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px 20px;
  background: linear-gradient(135deg, #1E1E2F, #3A3A4F);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(30, 30, 47, 0.3);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #1E1E2F, #2D2D3A);
`;

const Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid #ffffff;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 1.2rem;
  color: #ffffff;
  font-weight: 600;
`;

export default function AdminProfile() {
  const [profile, setProfile] = useState({ name: "", email: "", role: "" });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiGet("/admin/profile");
      let data = res.data.data || res.data.user || res.data;
      if (Array.isArray(data)) data = data[0];

      setProfile({
        name: data?.name || "",
        email: data?.email || "",
        role: data?.role || "",
      });
    } catch (err) {
      setError("Gagal memuat profil");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPut("/admin/profile", {
        name: profile.name,
        email: profile.email,
      });
      setSuccess("Profil berhasil diperbarui");
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Gagal memperbarui profil");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  const updatePassword = async () => {
    if (!password) {
      setError("Password tidak boleh kosong");
      setTimeout(() => setError(""), 5000);
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await apiPut("/admin/profile/password", { newPassword: password });
      setPassword("");
      setSuccess("Password berhasil diubah");
      setTimeout(() => setSuccess(""), 5000);
    } catch {
      setError("Gagal mengubah password");
      setTimeout(() => setError(""), 5000);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <LoadingContainer>
        <div className="text-center">
          <Spinner />
          <LoadingText>Memuat profil...</LoadingText>
        </div>
      </LoadingContainer>
    );

  return (
    <Container>
      <Wrapper>
        {/* HEADER CARD */}
        <HeaderCard>
          <Avatar>
            {profile.role === "admin" ? <FaUserTie /> : <FaUser />}
          </Avatar>
          <HeaderInfo>
            <Name>{profile.name}</Name>
            <Email>{profile.email}</Email>
            <RoleBadge>
              <FaShieldAlt />
              {profile.role.toUpperCase()}
            </RoleBadge>
          </HeaderInfo>
        </HeaderCard>

        {/* ALERT CARDS */}
        {error && (
          <AlertCard type="error">
            <FaExclamationTriangle />
            <span>{error}</span>
          </AlertCard>
        )}

        {success && (
          <AlertCard type="success">
            <FaCheckCircle />
            <span>{success}</span>
          </AlertCard>
        )}

        {/* CONTENT CARDS */}
        <ContentGrid>
          {/* INFORMASI AKUN CARD */}
          <InfoCard>
            <CardTitle>
              <FaEdit />
              Informasi Akun
            </CardTitle>

            <FormGroup>
              <Label>Nama Lengkap</Label>
              <Input
                type="text"
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
                placeholder="Masukkan nama lengkap"
              />
            </FormGroup>

            <FormGroup>
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
                placeholder="Masukkan alamat email"
              />
            </FormGroup>

            <Button onClick={updateProfile} disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </InfoCard>

          {/* KEAMANAN CARD */}
          <SecurityCard>
            <CardTitle>
              <FaLock />
              Keamanan Akun
            </CardTitle>

            <FormGroup>
              <Label>Password Baru</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password baru"
              />
            </FormGroup>

            <Button onClick={updatePassword} disabled={saving}>
              {saving ? "Mengubah..." : "Ubah Password"}
            </Button>
          </SecurityCard>
        </ContentGrid>
      </Wrapper>
    </Container>
  );
}