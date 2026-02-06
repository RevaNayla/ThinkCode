import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../../../services/api";

export default function TabOverview({ materiId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}`);
      setData(res.data ?? res);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [materiId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await apiPut(`/admin/materi/${materiId}`, data);
      setData(res.data ?? data);
      alert("Data berhasil disimpan");
    } catch (err) {
      console.error(err);
      alert("Gagal menyimpan");
    }
    setSaving(false);
  };

  if (loading || !data) return "Memuat...";

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 15 }}>
      <h2>Overview Materi</h2>

      <input
        value={data.title || ""}
        onChange={(e) => setData({ ...data, title: e.target.value })}
        placeholder="Judul materi"
      />

      <textarea
        value={data.description || ""}
        onChange={(e) => setData({ ...data, description: e.target.value })}
        rows={5}
      />

      <input
        type="number"
        value={data.order ?? 0}
        onChange={(e) => setData({ ...data, order: Number(e.target.value) })}
      />

      <label>
        <input
          type="checkbox"
          checked={Boolean(data.active)}
          onChange={(e) =>
            setData({ ...data, active: e.target.checked })
          }
        />
        Aktifkan Materi
      </label>

      <button onClick={handleSave} disabled={saving}>
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </div>
  );
}
