import { useState } from "react";
import { apiPost } from "../../services/api";

export default function AdminUserAdd() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  function handle(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();

    if (!form.name) return alert("Nama wajib diisi");
    if (!form.email.match(/.+@.+\..+/)) return alert("Email tidak valid");
    if (form.password.length < 6) return alert("Password minimal 6 karakter");

    try {
      await apiPost("/admin/students", form);
      alert("Siswa berhasil ditambahkan");
      setForm({ name: "", email: "", password: "" });
    } catch (e) {
      alert("Gagal: " + e.message);
    }
  }

  return (
    <div>
      <h1>Tambah Siswa</h1>

      <form className="form" onSubmit={submit}>
        <label>Nama</label>
        <input name="name" value={form.name} onChange={handle} />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handle} />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handle}
        />

        <button type="submit" className="btn">Tambah</button>
      </form>
    </div>
  );
}
