import { useState, useEffect } from "react";
import { apiGet, apiPost, apiPut } from "../services/api";
import { useParams, useNavigate } from "react-router-dom";

export default function AdminMateriForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", active: true });

  useEffect(() => {
    if (id && id !== "new") {
      apiGet(`/admin/materi/${id}`).then(d => setForm(d));
    }
  }, [id]);

  async function submit(e) {
    e.preventDefault();
    try {
      if (id === "new") await apiPost("/admin/materi", form);
      else await apiPut(`/admin/materi/${id}`, form);
      navigate("/admin/materi");
    } catch (e) { alert("Error: "+e.message); }
  }

  return (
    <form onSubmit={submit}>
      <h1>{id==="new" ? "Buat Materi" : "Edit Materi"}</h1>
      <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Judul" />
      <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      <label><input type="checkbox" checked={form.active} onChange={e=>setForm({...form,active:e.target.checked})} /> Aktif</label>
      <button type="submit">Simpan</button>
    </form>
  );
}
