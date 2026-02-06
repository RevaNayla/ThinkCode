import { useState } from "react";
import { apiPost } from "../../services/api";
import * as XLSX from "xlsx";

export default function AdminUserImport() {
  const [rows, setRows] = useState([]);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const workbook = XLSX.read(evt.target.result, { type: "binary" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);

      setRows(data);
    };
    reader.readAsBinaryString(file);
  }

  async function submit() {
    if (rows.length === 0) return alert("CSV kosong");

    try {
      await apiPost("/admin/students/import", { rows });
      alert("Berhasil import siswa");
      setRows([]);
    } catch (e) {
      alert("Gagal import: " + e.message);
    }
  }

  return (
    <div>
      <h1>Import Siswa via CSV</h1>
      <input type="file" accept=".csv,.xlsx" onChange={handleFile} />

      {rows.length > 0 && (
        <>
          <h3>Preview ({rows.length} siswa)</h3>
          <table className="preview-table">
            <thead>
              <tr>
                {Object.keys(rows[0]).map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r,i) => (
                <tr key={i}>
                  {Object.values(r).map((v,j) => <td key={j}>{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>

          <button className="btn" onClick={submit}>Import</button>
        </>
      )}
    </div>
  );
}
