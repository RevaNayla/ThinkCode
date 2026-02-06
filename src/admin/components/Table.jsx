export default function Table({ columns = [], data = [] }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 20 }}>
      <thead>
        <tr style={{ background: "#eef2ff" }}>
          {columns.map((col, idx) => (
            <th
              key={idx}
              style={{
                padding: 12,
                borderBottom: "2px solid #ccd3ff",
                textAlign: "left"
              }}
            >
              {col}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
            {Object.values(row).map((val, j) => (
              <td key={j} style={{ padding: 10 }}>{val}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
