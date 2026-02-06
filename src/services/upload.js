export async function uploadVideo(materiId, file) {
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("token");
  const fd = new FormData();
  fd.append("video", file);
  const res = await fetch(`${API_BASE}/admin/materi/${materiId}/upload-video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: fd,
  });
  if(!res.ok) throw new Error(await res.text());
  return res.json();
}
