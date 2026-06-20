export function ConfMatrix({ data, title }) {
  const { tn, fp, fn, tp } = data;
  const cells = [
    { label: "TN", val: tn, sub: "Survived → Survived", bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF" },
    { label: "FP", val: fp, sub: "Survived → Death",    bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
    { label: "FN", val: fn, sub: "Death → Survived",    bg: "#FEF2F2", border: "#FECACA", text: "#991B1B" },
    { label: "TP", val: tp, sub: "Death → Death",       bg: "#F0FDF4", border: "#BBF7D0", text: "#166534" },
  ];
  const acc = (((tn + tp) / (tn + fp + fn + tp)) * 100).toFixed(1);

  return (
    <div>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10, color: "#1C1C1E" }}>{title}</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {cells.map((c) => (
          <div
            key={c.label}
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
              borderRadius: 8,
              padding: "10px 8px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 22, fontWeight: 900, color: c.text, fontFamily: "'DM Mono', monospace" }}>{c.val}</div>
            <div style={{ fontSize: 10, color: "#6B7280", marginTop: 3 }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "center", marginTop: 7 }}>
        Accuracy: <strong style={{ color: "#4B5563" }}>{acc}%</strong>
      </div>
    </div>
  );
}
