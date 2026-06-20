export function MetricBadge({ value, compare, invert = false }) {
  const better = invert ? value < compare : value > compare;
  return (
    <span
      style={{
        background: better ? "#DCFCE7" : "#FEE2E2",
        color:      better ? "#166534" : "#991B1B",
        padding:    "3px 9px",
        borderRadius: 6,
        fontWeight: 700,
        fontSize: 13,
        fontFamily: "'DM Mono', monospace",
        border: `1px solid ${better ? "#BBF7D0" : "#FECACA"}`,
      }}
    >
      {value.toFixed(3)}
    </span>
  );
}
