import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../services/api";

export default function TabClues({ materiId }) {
  const [list, setList] = useState([]);
  const [newClue, setNewClue] = useState("");
  const [newCost, setNewCost] = useState(10);

  // Load Clue
  const load = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/clues`);
      setList(res);
    } catch (err) {
      console.error("Load clues error:", err);
    }
  };

  useEffect(() => {
    load();
  }, [materiId]);

  // Add Clue
  const add = async () => {
    if (!newClue.trim()) return;

    try {
      await apiPost(`/admin/materi/${materiId}/clues`, {
        clueText: newClue,
        cost: newCost
      });
      setNewClue("");
      load();
    } catch (err) {
      alert("Gagal menambah clue");
      console.error(err);
    }
  };

  // Save Update
  const saveField = async (id, field, value) => {
    try {
      await apiPut(`/admin/materi/${materiId}/clues/${id}`, {
        [field]: value
      });
      load();
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Delete Clue
  const remove = async (id) => {
    if (!window.confirm("Hapus clue?")) return;
    try {
      await apiDelete(`/admin/materi/${materiId}/clues/${id}`);
      load();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 20 }}>
      <h2>Clues (Maks 5)</h2>

      {/* ADD FORM */}
      <div style={{ display: "flex", gap: 10 }}>
        <input
          value={newClue}
          onChange={(e) => setNewClue(e.target.value)}
          placeholder="Teks clue"
          style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <input
          type="number"
          value={newCost}
          onChange={(e) => setNewCost(Number(e.target.value))}
          style={{ width: 80, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
        />

        <button
          onClick={add}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer"
          }}
        >
          Tambah
        </button>
      </div>

      {/* LIST */}
      {list.map((c, i) => (
        <div
          key={c.id}
          style={{
            padding: 16,
            borderRadius: 10,
            border: "1px solid #eee",
            background: "#fff"
          }}
        >
          {/* TEXTAREA LOCAL EDIT */}
          <textarea
            value={c.clueText}
            rows={3}
            onChange={(e) => {
              const copy = [...list];
              copy[i].clueText = e.target.value;
              setList(copy);
            }}
            style={{
              width: "100%",
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
              resize: "vertical",
              marginBottom: 10
            }}
          />

          {/* COST LOCAL EDIT */}
          <input
            type="number"
            value={c.cost}
            onChange={(e) => {
              const copy = [...list];
              copy[i].cost = Number(e.target.value);
              setList(copy);
            }}
            style={{
              width: 100,
              padding: 10,
              border: "1px solid #ccc",
              borderRadius: 8,
              marginRight: 10
            }}
          />

          {/* SAVE BUTTON FOR TEXT */}
          <button
            onClick={() => saveField(c.id, "clueText", c.clueText)}
            style={{
              background: "#28a745",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Simpan Teks
          </button>

          {/* SAVE BUTTON FOR COST */}
          <button
            onClick={() => saveField(c.id, "cost", c.cost)}
            style={{
              background: "#17a2b8",
              color: "#fff",
              padding: "8px 14px",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
              marginRight: 10
            }}
          >
            Simpan Cost
          </button>

          {/* DELETE */}
          <button
            onClick={() => remove(c.id)}
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
