export default function AdminCard({ title, value }) {
  return (
    <div style={{
      background: "white",
      padding: 20,
      borderRadius: 12,
      boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
    }}>
      <div style={{ fontSize: 18, color: "#555" }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: "bold", marginTop: 10 }}>
        {value}
      </div>
    </div>
  );
}
