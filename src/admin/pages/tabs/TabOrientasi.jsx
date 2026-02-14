import { useEffect, useState } from "react";
import { apiGet, apiPut, apiDelete, apiUpload } from "../../../services/api";

export default function TabOrientasi({ materiId }) {
  const [data, setData] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const baseUrl = import.meta.env.VITE_API_URL.replace('/api', ''); 

  // Load Orientasi
  const loadData = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/orientasi`);
      setData(res || {});
      setVideoUrl(res?.content || "");
    } catch (err) {
      console.error("LOAD ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [materiId]);

  // Save URL
  const handleSaveUrl = async () => {
    if (!videoUrl.trim()) return alert("URL tidak boleh kosong");
    setSaving(true);
    try {
      await apiPut(`/admin/materi/${materiId}/orientasi`, { videoUrl });
      await loadData();
      alert("Orientasi disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan");
    }
    setSaving(false);
  };

  // Upload File
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await apiUpload(
        `/admin/materi/${materiId}/orientasi/upload`,
        file 
      );
      await loadData();
      alert("Upload berhasil");
    } catch (err) {
      console.error(err);
      alert("Upload gagal");
    }
    setUploading(false);
  };


  // Delete
  const handleDelete = async () => {
    if (!window.confirm("Hapus orientasi?")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/orientasi`);
      setData(null);
      setVideoUrl("");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus");
    }
  };

  if (loading) return <div>Memuat orientasi...</div>;

  return (
    <div style={{
      padding: 20,
      display: "flex",
      flexDirection: "column",
      gap: 20
    }}>
      
      <h2 style={{ margin: 0 }}>Orientasi Masalah</h2>

    {/* PREVIEW */}
    {data?.content ? (
      data.content.includes("/uploads/") ? (
        <video
          src={`${baseUrl}${data.content}`} 
          controls
          preload="metadata"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      ) : (
        <a
          href={data.content}
          target="_blank"
          rel="noreferrer"
          style={{ color: "#fff" }}
        >
          {data.content}
        </a>
      )
    ) : (
      <div style={{ color: "#fff", opacity: 0.7 }}>
        Belum ada orientasi
      </div>
    )}


      {/* INPUT URL */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="Masukkan URL video..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={handleSaveUrl}
          disabled={saving}
          style={{
            background: "#007bff",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          {saving ? "Menyimpan..." : "Simpan URL"}
        </button>
      </div>

      {/* UPLOAD FILE */}
      <div>
        <label style={{ display: "block", marginBottom: 8 }}>
          Upload Video
        </label>
        <input
          type="file"
          accept="video/*"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>

      {/* DELETE */}
      {data?.content && (
        <button
          onClick={handleDelete}
          style={{
            marginTop: 10,
            background: "#e74c3c",
            color: "white",
            padding: "10px 16px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            width: "fit-content",
          }}
        >
          Hapus Orientasi
        </button>
      )}
    </div>
  );
}
