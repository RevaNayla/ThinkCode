import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

export default function TabDiscussion({ materi }) {
  const materiId = materi?.id;
  const [rooms, setRooms] = useState([]);
  const [title, setTitle] = useState("");
  const [capacity, setCapacity] = useState(30);

  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/rooms`);
      setRooms(res.data || res);
    } catch (err) {
      console.error("Load rooms error:", err);
    }
  };

  useEffect(() => {
    if (materiId) load();
  }, [materiId]);

  const addRoom = async () => {
    if (!title.trim()) return alert("Nama room wajib diisi!");

    try {
      await apiPost(`/admin/materi/${materiId}/rooms`, {
        title,
        capacity
      });

      setTitle("");
      setCapacity(30);
      load();
    } catch (err) {
      console.error(err);
      alert("Gagal membuat room");
    }
  };

  const updateRoom = async (id, field, value) => {
    try {
      await apiPut(`/admin/materi/${materiId}/rooms/${id}`, {
        [field]: value
      });
      load();
    } catch (err) {
      console.error(err);
      alert("Gagal update room");
    }
  };

  const deleteRoom = async (id) => {
    if (!window.confirm("Hapus room ini?")) return;

    try {
      await apiDelete(`/admin/materi/${materiId}/rooms/${id}`);
      load();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus room");
    }
  };

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      <h2>Discussion Rooms</h2>

      {/* FORM TAMBAH ROOM */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nama room..."
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <input
          type="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
          placeholder="Kapasitas"
          style={{
            width: 120,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={addRoom}
          style={{
            padding: "10px 16px",
            background: "#007bff",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Tambah
        </button>
      </div>

      {/* LIST ROOMS */}
      {rooms.map((room) => (
        <div
          key={room.id}
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px solid #eee",
            background: "#fff",
          }}
        >
          <input
            value={room.title}
            onChange={(e) => updateRoom(room.id, "title", e.target.value)}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <input
            type="number"
            min={1}
            value={room.capacity}
            onChange={(e) => updateRoom(room.id, "capacity", Number(e.target.value))}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
              marginBottom: 10,
            }}
          />

          <button
            onClick={() => deleteRoom(room.id)}
            style={{
              background: "#e74c3c",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Hapus
          </button>
        </div>
      ))}
    </div>
  );
}
