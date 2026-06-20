export function MetricBadge({ value, compare, invert = false }) {
  const better = invert ? value < compare : value > compare;
  return (
    <span
      style={{
        background: better ? "#d4edda" : "#f8d7da",
        color: better ? "#155724" : "#721c24",
        padding: "2px 7px",
        borderRadius: 4,
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {value.toFixed(3)}
    </span>
  );
}