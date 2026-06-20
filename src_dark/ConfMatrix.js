export function ConfMatrix({ data, title }) {
  const { tn, fp, fn, tp } = data;
  const cells = [
    { label: "TN", val: tn, sub: "Survived → Survived", col: "#1a3a4a" },
    { label: "FP", val: fp, sub: "Survived → Death",    col: "#3a1a1a" },
    { label: "FN", val: fn, sub: "Death → Survived",    col: "#3a1a1a" },
    { label: "TP", val: tp, sub: "Death → Death",       col: "#1a3a1a" },
  ];
  const acc = (((tn + tp) / (tn + fp + fn + tp)) * 100).toFixed(1);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: "#ddd" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
        {cells.map((c) => (
          <div
            key={c.label}
            style={{ background: c.col, borderRadius: 6, padding: "10px 8px", textAlign: "center" }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: "#fff" }}>{c.val}</div>
            <div style={{ fontSize: 10, color: "#aaa", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#888", textAlign: "center", marginTop: 6 }}>
        Accuracy: {acc}%
      </div>
    </div>
  );
}