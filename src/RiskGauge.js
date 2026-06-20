import { COLORS } from "./constants";

export function RiskGauge({ risk }) {
  const pct   = Math.round(risk * 100);
  const color = risk > 0.5 ? COLORS.hr : risk > 0.3 ? COLORS.gold : COLORS.lr;
  const label = risk > 0.5 ? "HIGH RISK" : risk > 0.3 ? "MODERATE RISK" : "LOW RISK";
  const angle = -135 + pct * 2.7;

  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        {/* Track */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={COLORS.border}
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Fill arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={color}
          strokeWidth="16"
          strokeDasharray={`${pct * 2.51} 251`}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 6px ${color}66)` }}
        />
        {/* Needle */}
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line
            x1="100" y1="100" x2="100" y2="36"
            stroke={COLORS.textPrimary}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="100" cy="100" r="6" fill={COLORS.textPrimary} />
          <circle cx="100" cy="100" r="3" fill={COLORS.surface} />
        </g>
        {/* Percentage */}
        <text
          x="100" y="87"
          textAnchor="middle"
          fill={color}
          fontSize="28"
          fontWeight="900"
          fontFamily="'DM Sans', sans-serif"
        >
          {pct}%
        </text>
        {/* Label */}
        <text
          x="100" y="107"
          textAnchor="middle"
          fill={color}
          fontSize="10"
          fontWeight="700"
          letterSpacing="1.5"
          fontFamily="'DM Sans', sans-serif"
        >
          {label}
        </text>
      </svg>
      <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: -4, letterSpacing: 0.2 }}>
        5-Year Cardiac Death Risk &nbsp; P(event ≤ 5yr)
      </div>
    </div>
  );
}
