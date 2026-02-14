import { useEffect, useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiPut, apiDelete } from "../../services/api";

/* ========= styled components ========= */
const Page = styled.div`
  padding: 28px;
  font-family: Inter, system-ui, Arial;
  color: #0f172a;
`;

const Header = styled.div`
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
`;

const Title = styled.h1`
  font-size:20px;
  margin:0;
  font-weight:700;
`;

const Button = styled.button`
  background:#4f46e5;
  color:white;
  border:none;
  padding:10px 14px;
  border-radius:8px;
  cursor:pointer;
  font-weight:600;
  &:hover{ opacity:0.9 }
`;

const Table = styled.table`
  width:100%;
  background:white;
  border-collapse:collapse;
  border-radius:10px;
  overflow:hidden;
  box-shadow:0 1px 3px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background:#f8fafc;
  text-align:left;
  padding:12px;
  font-size:13px;
  border-bottom:1px solid #e5e7eb;
`;

const Td = styled.td`
  padding:10px 12px;
  border-bottom:1px solid #eef2f7;
  font-size:14px;
`;

const RowActions = styled.div`
  display:flex;
  gap:8px;
`;

const ActionBtn = styled.button`
  border:none;
  padding:8px 10px;
  border-radius:6px;
  cursor:pointer;
  color:white;
  font-size:13px;
  ${({ type }) => type === "delete" ? `
    background:#dc2626;
  ` : `
    background:#0d9488;
  `}
`;

const ModalOverlay = styled.div`
  position:fixed;
  inset:0;
  background:rgba(0,0,0,0.45);
  display:flex;
  align-items:center;
  justify-content:center;
`;

const ModalCard = styled.div`
  width:420px;
  max-width:95%;
  background:white;
  border-radius:12px;
  padding:18px;
`;

const Field = styled.div`
  margin-bottom:12px;
`;

const Label = styled.label`
  font-size:14px;
  font-weight:600;
  margin-bottom:6px;
  display:block;
`;

const Input = styled.input`
  width:96%;
  padding:10px;
  border-radius:8px;
  border:1px solid #e2e8f0;
  font-size:14px;
`;

const Textarea = styled.textarea`
  width:100%;
  padding:10px;
  min-height:80px;
  border-radius:8px;
  border:1px solid #e2e8f0;
  font-size:14px;
`;

const Footer = styled.div`
  display:flex;
  justify-content:flex-end;
  gap:10px;
  margin-top:10px;
`;

const CancelBtn = styled.button`
  background:#e2e8f0;
  border:none;
  padding:8px 14px;
  border-radius:6px;
  cursor:pointer;
`;

const SaveBtn = styled.button`
  background:#4f46e5;
  color:white;
  border:none;
  padding:8px 14px;
  border-radius:6px;
  cursor:pointer;
  font-weight:600;
`;

function slugify(text = "") {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g,"-")
    .replace(/[^\w\-]+/g,"")
    .replace(/\-\-+/g,"-");
}

/* ========= component ========= */
export default function AdminMateri() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const emptyForm = {
    id: null,
    title: "",
    slug: "",
    description: ""
  };

  const [form, setForm] = useState(emptyForm);

  /* load data */
  useEffect(() => {
    setLoading(true);
    apiGet("/admin/materi")
      .then(res => {
        const data = res.data || res;
        setList(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
        setList([]);
      })
      .finally(() => setLoading(false));
  }, []);

  function openNewModal() {
    setForm(emptyForm);
    setIsEdit(false);
    setOpenModal(true);
  }

  function openEditModal(item) {
    setForm({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description
    });
    setIsEdit(true);
    setOpenModal(true);
  }

  async function handleSave() {
    if (!form.title) return alert("Judul tidak boleh kosong");
    const payload = {
      title: form.title,
      slug: form.slug || slugify(form.title),
      description: form.description
    };

    try {
      if (isEdit) {
        await apiPut(`/admin/materi/${form.id}`, payload);
        setList(prev => prev.map(x => x.id === form.id ? { ...x, ...payload } : x));
        alert("Materi berhasil diperbarui");
      } else {
        const res = await apiPost("/admin/materi", payload);
        const created = res.data || res;
        setList(prev => [...prev, created]);
        alert("Materi berhasil ditambahkan");
      }
      setOpenModal(false);
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan perubahan");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Hapus materi ini?")) return;
    try {
      await apiDelete(`/admin/materi/${id}`);
      setList(prev => prev.filter(x => x.id !== id));
      alert("Materi terhapus");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus materi");
    }
  }

  return (
    <Page>
      <Header>
        <Title>Manajemen Materi</Title>
        <Button onClick={openNewModal}>+ Tambah Materi</Button>
      </Header>

      {loading ? (
        <p>Memuat...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Judul</Th>
              <Th>Slug</Th>
              <Th style={{width:130}}>Aksi</Th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 ? (
              <tr>
                <Td colSpan={4} style={{textAlign:"center", padding:20}}>
                  Belum ada materi
                </Td>
              </tr>
            ) : (
              list.map((m, i) => (
                <tr key={m.id}>
                  <Td>{i + 1}</Td>
                  <Td>{m.title}</Td>
                  <Td>{m.slug}</Td>
                  <Td>
                    <RowActions>
                      <ActionBtn type="edit" onClick={() => navigate(`/admin/materi/${m.id}/edit`)}>
                        Edit
                      </ActionBtn>
                      <ActionBtn type="delete" onClick={() => handleDelete(m.id)}>
                        Hapus
                      </ActionBtn>
                    </RowActions>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      )}

      {/* modal */}
      {openModal && (
        <ModalOverlay onMouseDown={() => setOpenModal(false)}>
          <ModalCard onMouseDown={(e) => e.stopPropagation()}>
            <h3 style={{marginTop:0}}>
              {isEdit ? "Edit Materi" : "Tambah Materi"}
            </h3>

            <Field>
              <Label>Judul</Label>
              <Input
                value={form.title}
                onChange={e =>
                  setForm(f => ({
                    ...f,
                    title: e.target.value,
                    slug: slugify(e.target.value)
                  }))
                }
              />
            </Field>

            <Field>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
              />
            </Field>

            <Field>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </Field>

            <Footer>
              <CancelBtn onClick={() => setOpenModal(false)}>Batal</CancelBtn>
              <SaveBtn onClick={handleSave}>
                {isEdit ? "Simpan Perubahan" : "Tambahkan"}
              </SaveBtn>
            </Footer>
          </ModalCard>
        </ModalOverlay>
      )}
    </Page>
  );
}
