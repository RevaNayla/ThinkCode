import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete, apiUpload,} from "../../../services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";


/* ================= QUILL CONFIG ================= */
const quillModules = (materiId) => ({
  toolbar: {
    container: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["image"], 
      ["clean"],
    ],
    handlers: {
      image: function () {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.onchange = async () => {
          const file = input.files[0];
          if (!file) return;

          try {
            const res = await apiUpload(
              `/admin/materi/${materiId}/sections/upload`,
              file
            );

            const quill = this.quill;
            const range = quill.getSelection(true);

            quill.insertEmbed(range.index, "image", res.url);
            quill.setSelection(range.index + 1);
          } catch (err) {
            console.error(err);
            alert("Upload gambar gagal");
          }
        };
      },
    },
  },
});

export default function TabSections({ materiId }) {
  const [sections, setSections] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  /* ================= LOAD DATA ================= */
  const loadSections = async () => {
    try {
      const res = await apiGet(`/admin/materi/${materiId}/sections`);
      setSections(res);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (materiId) loadSections();
  }, [materiId]);

  /* ================= CRUD ================= */
  const addSection = async () => {
    if (!newTitle.trim()) return;

    try {
      await apiPost(`/admin/materi/${materiId}/sections`, {
        title: newTitle,
        type: "mini",
        content: "",
      });
      setNewTitle("");
      loadSections();
    } catch (err) {
      alert("Gagal menambah section");
    }
  };

  const updateSection = async (id, field, value) => {
    try {
      await apiPut(`/admin/materi/${materiId}/sections/${id}`, {
        [field]: value,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteSection = async (id) => {
    if (!window.confirm("Hapus Mini Lesson ini?")) return;

    try {
      await apiDelete(`/admin/materi/${materiId}/sections/${id}`);
      loadSections();
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= RENDER ================= */
  return (
    <div style={{ padding: 20 }}>
      <h2>Mini Lesson / Sections</h2>

      {/* ===== ADD SECTION ===== */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Judul Mini Lesson"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={addSection}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#007bff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Tambah
        </button>
      </div>

      {/* ===== LIST SECTION ===== */}
      {sections
        .filter((s) => s.type === "mini")
        .map((s) => (
          <div
            key={s.id}
            style={{
              marginBottom: 30,
              padding: 20,
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              background: "#fff",
            }}
          >
            {/* Title */}
            <input
              value={s.title}
              onChange={(e) =>
                updateSection(s.id, "title", e.target.value)
              }
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ccc",
                marginBottom: 12,
                fontWeight: "bold",
              }}
            />

            <ReactQuill
              theme="snow"
              value={s.content || ""}
              modules={quillModules(materiId)}
              onChange={(val) =>
                updateSection(s.id, "content", val)
              }
            />

            <button
              onClick={() => deleteSection(s.id)}
              style={{
                marginTop: 12,
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
