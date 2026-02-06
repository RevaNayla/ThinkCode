import { useEffect, useState, useMemo } from "react";
import {
  apiGet,
  apiPost,
  apiPatch,
  apiDelete,
} from "../../services/api";
import "./admin-users.css"; 
import { utils, writeFile } from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styled from "styled-components"; 


const theme = {
  colors: {
    primary: "#007bff",    
    secondary: "#6c757d", 
    success: "#28a745",   
    danger: "#dc3545",     
    warning: "#ffc107",    
    info: "#17a2b8",       
    light: "#f8f9fa",      
    dark: "#343a40",       
  },
  borderRadius: "4px",
  padding: "8px 16px",
  fontSize: "14px",
};

const StyledButton = styled.button`
  background-color: ${(props) => theme.colors[props.variant] || theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius};
  padding: ${theme.padding};
  font-size: ${theme.fontSize};
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.1s ease;
  margin: 4px 8px; 

  &:hover {
    background-color: ${(props) => {

      const color = theme.colors[props.variant] || theme.colors.primary;
      return color.replace(/[^,]+(?=\$)/, (m) => parseInt(m) - 20);
    }};
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    background-color: ${theme.colors.light};
    color: ${theme.colors.secondary};
    cursor: not-allowed;
  }

  &.small {
    padding: 4px 8px;
    font-size: 12px;
  }
`;

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [q, setQ] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [total, setTotal] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalRooms, setModalRooms] = useState([]);
  const [modalHistory, setModalHistory] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    class: "",
  });

  const classOptions = useMemo(() => {
    const setData = new Set();
    users.forEach((u) => {
      if (u.class) setData.add(u.class);
    });
    return Array.from(setData);
  }, [users]);

  async function load() {
    setLoading(true);
    try {
      const query = [
        `q=${encodeURIComponent(q)}`,
        `page=${page}`,
        `limit=${pageSize}`,
        `role=student`,
      ];

      if (filterClass) query.push(`class=${filterClass}`);
      if (filterStatus !== "") query.push(`active=${filterStatus}`);

      const res = await apiGet(`/admin/users?${query.join("&")}`);
      setUsers(res.data ?? []);
      setTotal(res.pagination?.totalItems ?? (res.data ? res.data.length : 0));
    } catch (e) {
      console.error(e);
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [q, page, filterClass, filterStatus]);

  async function handleResetPassword(id) {
    if (!window.confirm("Reset password siswa ini?")) return;
    try {
      await apiPatch(`/admin/users/${id}/reset-password`, {});
      alert("Password berhasil direset.");
    } catch (e) {
      alert("Gagal reset: " + e.message);
    }
  }

  async function handleToggleActive(id, active) {
    try {
      await apiPatch(`/admin/users/${id}/toggle`, { active: !active });
      load();
    } catch (e) {
      alert("Gagal update: " + e.message);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus akun siswa ini?")) return;
    try {
      await apiDelete(`/admin/users/${id}`);
      load();
    } catch (e) {
      alert("Gagal hapus: " + e.message);
    }
  }

  async function handleAddStudent() {
    if (!addForm.name || !addForm.email) {
      alert("Nama dan Email wajib diisi");
      return;
    }

    try {
      await apiPost("/admin/users", {
        name: addForm.name,
        email: addForm.email,
        class: addForm.class,
        role: "student",
      });

      alert("Siswa berhasil ditambahkan\nPassword default: password123");
      setAddForm({ name: "", email: "", class: "" });
      setAddOpen(false);
      load();
    } catch (e) {
      alert("Gagal tambah siswa: " + e.message);
    }
  }

  function exportExcel() {
    const rows = users.map((u, i) => ({
      No: (page - 1) * pageSize + i + 1,
      Nama: u.name,
      Email: u.email,
      Kelas: u.class ?? "-",
      XP: u.xp ?? 0,
      Status: u.active ? "Aktif" : "Nonaktif",
    }));

    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Daftar Siswa");
    writeFile(wb, "daftar_siswa.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Daftar Siswa", 14, 16);

    const body = users.map((u, i) => [
      (page - 1) * pageSize + i + 1,
      u.name,
      u.email,
      u.class ?? "-",
      u.xp ?? 0,
      u.active ? "Aktif" : "Nonaktif",
    ]);

    doc.autoTable({
      head: [["#", "Nama", "Email", "Kelas", "XP", "Status"]],
      body,
      startY: 22,
    });

    doc.save("daftar_siswa.pdf");
  }

  async function openProfile(u) {
    setModalOpen(true);
    setModalUser(u);
    setModalRooms([]);
    setModalHistory([]);
    setModalLoading(true);

    try {
      const resRooms = await apiGet(`/admin/students/${u.id}/rooms`);
      setModalRooms(resRooms.data ?? []);

      const resHist = await apiGet(`/admin/students/${u.id}/history`);
      setModalHistory(resHist.data ?? []);
    } catch (e) {
      console.error("Error loading profile:", e);
      alert("Gagal memuat data profil");
    } finally {
      setModalLoading(false);
    }
  }

  return (
    <div className="admin-container">
      <div className="users-header-modern">
        <h1>👨‍🎓 Manajemen Siswa</h1>

        <div className="filter-bar">
          <input
            className="input-modern"
            placeholder="Cari nama / email..."
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />

          <select
            className="select-modern"
            value={filterClass}
            onChange={(e) => {
              setFilterClass(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Kelas</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/*<select
            className="select-modern"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Status</option>
            <option value="1">Aktif</option>
            <option value="0">Nonaktif</option>
          </select>*/}

          {/*<StyledButton variant="secondary" onClick={() => {
            setQ("");
            setFilterClass("");
            setFilterStatus("");
            setPage(1);
          }}>
            Reset
          </StyledButton>*/}

          <StyledButton variant="success" onClick={exportExcel}>Export Excel</StyledButton>
          <StyledButton variant="primary" onClick={() => setAddOpen(true)}>
            + Tambah Siswa
          </StyledButton>
        </div>
      </div>

      {loading ? (
        <p className="loading">Memuat data...</p>
      ) : (
        <div className="card-modern">
          <table className="table-modern">
            <thead>
              <tr>
                <th>#</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Kelas</th>
                <th>XP</th>
                {/*<th>Status</th>*/}
                <th style={{ width: 260 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="7" className="no-data">Tidak ada data</td></tr>
              )}
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.class ?? "-"}</td>
                  <td>{u.xp ?? 0}</td>
                  {/*<td>{u.active ? "Aktif" : "Nonaktif"}</td>*/}
                  <td>
                    <StyledButton variant="info" onClick={() => openProfile(u)}>Profil</StyledButton>
                    <StyledButton variant="warning" onClick={() => handleResetPassword(u.id)}>Reset PW</StyledButton>
                    {/*<StyledButton variant="secondary" onClick={() => handleToggleActive(u.id, u.active)}>
                      {u.active ? "Nonaktifkan" : "Aktifkan"}
                    </StyledButton>*/}
                    <StyledButton variant="danger" onClick={() => handleDelete(u.id)}>Hapus</StyledButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination-modern">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              Prev
            </button>
            <span>Hal {page} • {total} data</span>
            <button onClick={() => setPage((p) => p + 1)} disabled={page * pageSize >= total}>
              Next
            </button>
          </div>
        </div>
      )}

      {modalOpen && modalUser && (
        <div className="modal-overlay">
          <div className="modal-modern">
            <div className="modal-header">
              <h2>Profil: {modalUser.name}</h2>
              <StyledButton variant="danger" className="small" onClick={() => setModalOpen(false)}>X</StyledButton>
            </div>

            {modalLoading ? (
              <p>Memuat...</p>
            ) : (
              <>
                <table className="table-details">
                  <tbody>
                    <tr><td>Nama</td><td>{modalUser.name}</td></tr>
                    <tr><td>Email</td><td>{modalUser.email}</td></tr>
                    <tr><td>Kelas</td><td>{modalUser.class}</td></tr>
                    <tr><td>XP</td><td>{modalUser.xp}</td></tr>
                  </tbody>
                </table>

                <h3 style={{ marginTop: 20 }}>Kelompok Diskusi</h3>
                {modalRooms.length === 0 ? (
                  <p>Belum tergabung dalam room</p>
                ) : (
                  <table className="table-details">
                    <thead>
                      <tr>
                        <th>Materi</th>
                        <th>Room</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalRooms.map((r, i) => (
                        <tr key={i}>
                          <td>{r.materi}</td>
                          <td>{r.room_name}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {addOpen && (
        <div className="modal-overlay">
          <div className="modal-modern">
            <div className="modal-header">
              <h2>Tambah Siswa</h2>
              <StyledButton variant="danger" className="small" onClick={() => setAddOpen(false)}>X</StyledButton>
            </div>

            <input
              className="input-modern"
              placeholder="Nama"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
            />
            <input
              className="input-modern"
              placeholder="Email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
            />
            <input
              className="input-modern"
              placeholder="Kelas"
              value={addForm.class}
              onChange={(e) => setAddForm({ ...addForm, class: e.target.value })}
            />

            <StyledButton variant="success" onClick={handleAddStudent}>Simpan</StyledButton>
          </div>
        </div>
      )}
    </div>
  );
}