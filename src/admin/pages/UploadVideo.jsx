import { useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import api from "../../api/axiosClient";

export default function UploadVideo() {
  const [materiId, setMateriId] = useState("");
  const [title, setTitle] = useState("");
  const [video, setVideo] = useState(null);

  const upload = async () => {
    if (!video) {
      alert("Pilih video dulu");
      return;
    }

    const form = new FormData();
    form.append("video", video);
    form.append("materiId", materiId);
    form.append("title", title);

    try {
      const res = await api.post("/video/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Upload berhasil");
    } catch (err) {
      alert("Upload gagal");
    }
  };

  return (
    <AdminLayout>
      <h2>Upload Video Orientasi Masalah</h2>

      <div style={{ marginTop: 20 }}>
        <label>Materi ID:</label><br />
        <input value={materiId} onChange={e => setMateriId(e.target.value)} />

        <br /><br />
        <label>Judul Video:</label><br />
        <input value={title} onChange={e => setTitle(e.target.value)} />

        <br /><br />
        <label>Upload File Video (MP4):</label><br />
        <input type="file" accept="video/mp4"
          onChange={e => setVideo(e.target.files[0])} />

        <br /><br />
        <button
          onClick={upload}
          style={{ padding: "10px 20px", background: "#3759c7", color: "#fff", borderRadius: 8 }}
        >
          Upload
        </button>
      </div>
    </AdminLayout>
  );
}
