import { useEffect, useState } from "react";
import { apiGet, apiUpload, apiDelete } from "../../../services/api";

export default function TabFiles({ materiId }) {
  const [list, setList] = useState([]);

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/files`);
      setList(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, [materiId]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const form = new FormData();
    form.append("file", file);

    try {
      await apiUpload(`/admin/materi/${materiId}/files/upload`, form);
      load();
    } catch (err) {
      console.error(err);
      alert("Gagal mengupload");
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Hapus file ini?")) return;

    try {
      await apiDelete(`/admin/materi/${materiId}/files/${id}`);
      load();
    } catch (err) {
      alert("Gagal menghapus");
    }
  };

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      <h2>File Uploads</h2>

      <input type="file" onChange={handleUpload} />

      {list.map((f) => (
        <div
          key={f.id}
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px solid #eee",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}
        >
          <a
            href={f.filePath}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: "none", color: "#007bff" }}
          >
            {f.filePath}
          </a>

          <button
            onClick={() => remove(f.id)}
            style={{
              background: "#e74c3c",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer"
            }}
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
