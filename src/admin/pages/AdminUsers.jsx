import { useEffect, useState, useMemo } from "react";
import {
  apiGet,
  apiPost,
  apiPut,
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
  const [filterRole, setFilterRole] = useState("");

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
    role: "student",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    class: "",
    role: "",
    xp: 0,
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
      ];

      if (filterClass) query.push(`class=${filterClass}`);
      if (filterStatus !== "") query.push(`active=${filterStatus}`);
      if (filterRole) query.push(`role=${filterRole}`);

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
  }, [q, page, filterClass, filterStatus, filterRole]);

  async function handleResetPassword(id) {
    if (!window.confirm("Reset password user ini?")) return;
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
    if (!window.confirm("Hapus akun user ini?")) return;
    try {
      await apiDelete(`/admin/users/${id}`);
      load();
    } catch (e) {
      alert("Gagal hapus: " + e.message);
    }
  }

  async function handleAddUser() {
    if (!addForm.name || !addForm.email) {
      alert("Nama dan Email wajib diisi");
      return;
    }

    try {
      await apiPost("/admin/users", {
        name: addForm.name,
        email: addForm.email,
        class: addForm.class,
        role: addForm.role,
      });

      alert(`${addForm.role} berhasil ditambahkan\nPassword default: password123`);
      setAddForm({ name: "", email: "", class: "", role: "student" });
      setAddOpen(false);
      load();
    } catch (e) {
      alert("Gagal tambah user: " + e.message);
    }
  }

  async function handleEditUser() {
    if (!editForm.name || !editForm.email) {
      alert("Nama dan Email wajib diisi");
      return;
    }

    try {
    await apiPut(`/admin/users/${editUser.id}`, {
      name: editForm.name,
      email: editForm.email,
      class: editForm.class,
      role: editForm.role,
      xp: editForm.xp,
    });

      alert("User berhasil diperbarui");
      setEditForm({ name: "", email: "", class: "", role: "", xp: 0 });
      setEditUser(null);
      setEditOpen(false);
      load();
    } catch (e) {
      alert("Gagal edit user: " + e.message);
    }
  }

  function openEdit(u) {
    console.log("Opening edit for user:", u); 
    setEditUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      class: u.class || "",
      role: u.role,
      xp: u.xp || 0,
    });
    setEditOpen(true);
    console.log("editOpen set to true"); 
  }

  function exportExcel() {
    const rows = users.map((u, i) => ({
      No: (page - 1) * pageSize + i + 1,
      Nama: u.name,
      Email: u.email,
      Kelas: u.class ?? "-",
      XP: u.xp ?? 0,
      Role: u.role,
      Status: u.active ? "Aktif" : "Nonaktif",
    }));

    const ws = utils.json_to_sheet(rows);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Daftar User");
    writeFile(wb, "daftar_user.xlsx");
  }

  function exportPDF() {
    const doc = new jsPDF();
    doc.text("Daftar User", 14, 16);

    const body = users.map((u, i) => [
      (page - 1) * pageSize + i + 1,
      u.name,
      u.email,
      u.class ?? "-",
      u.xp ?? 0,
      u.role,
    ]);

    doc.autoTable({
      head: [["#", "Nama", "Email", "Kelas", "XP", "Role", "Status"]],
      body,
      startY: 22,
    });

    doc.save("daftar_user.pdf");
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
        <h1>👨‍🎓 Manajemen User</h1>

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

          <select
            className="select-modern"
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua Role</option>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>


          <StyledButton variant="success" onClick={exportExcel}>Export Excel</StyledButton>
          <StyledButton variant="primary" onClick={() => setAddOpen(true)}>
            + Tambah User
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
                <th>Role</th>
                <th style={{ width: 300 }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan="8" className="no-data">Tidak ada data</td></tr>
              )}
              {users.map((u, i) => (
                <tr key={u.id}>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.class ?? "-"}</td>
                  <td>{u.xp ?? 0}</td>
                  <td>{u.role}</td>
                  <td>
                    <StyledButton variant="info" onClick={() => openProfile(u)}>Profil</StyledButton>
                    <StyledButton variant="warning" onClick={() => openEdit(u)}>Edit</StyledButton>
                    <StyledButton variant="secondary" onClick={() => handleResetPassword(u.id)}>Reset PW</StyledButton>
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
                    <tr><td>Role</td><td>{modalUser.role}</td></tr>
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
              <h2>Tambah User</h2>
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
            <select
              className="select-modern"
              value={addForm.role}
              onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>

            <StyledButton variant="success" onClick={handleAddUser}>Simpan</StyledButton>
          </div>
        </div>
      )}

      {editOpen && editUser && (
        <div className="modal-overlay">
          <div className="modal-modern">
            <div className="modal-header">
              <h2>Edit User: {editUser.name}</h2>
              <StyledButton variant="danger" className="small" onClick={() => setEditOpen(false)}>X</StyledButton>
            </div>

            <input
              className="input-modern"
              placeholder="Nama"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            />
            <input
              className="input-modern"
              placeholder="Email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            />
            <input
              className="input-modern"
              placeholder="Kelas"
              value={editForm.class}
              onChange={(e) => setEditForm({ ...editForm, class: e.target.value })}
            />
            <select
              className="select-modern"
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <input
              className="input-modern"
              type="number"
              placeholder="XP"
              value={editForm.xp}
              onChange={(e) => setEditForm({ ...editForm, xp: parseInt(e.target.value) || 0 })}
            />

            <StyledButton variant="success" onClick={handleEditUser}>Simpan</StyledButton>
          </div>
        </div>
      )}
    </div>
  );
}