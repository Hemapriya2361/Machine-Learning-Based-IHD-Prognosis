import { COLORS } from "./constants";

export function RiskGauge({ risk }) {
  const pct   = Math.round(risk * 100);
  const color = risk > 0.5 ? COLORS.hr : risk > 0.3 ? COLORS.gold : COLORS.lr;
  const label = risk > 0.5 ? "HIGH RISK" : risk > 0.3 ? "MODERATE RISK" : "LOW RISK";
  const angle = -135 + pct * 2.7;

  return (
    <div style={{ textAlign: "center", padding: "10px 0" }}>
      <svg width="200" height="120" viewBox="0 0 200 120">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke="#2a2a2a" strokeWidth="18" strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none" stroke={color} strokeWidth="18"
          strokeDasharray={`${pct * 2.51} 251`} strokeLinecap="round"
        />
        <g transform={`rotate(${angle}, 100, 100)`}>
          <line x1="100" y1="100" x2="100" y2="35" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="100" r="6" fill="#fff" />
        </g>
        <text x="100" y="88"  textAnchor="middle" fill={color} fontSize="28" fontWeight="900">{pct}%</text>
        <text x="100" y="108" textAnchor="middle" fill={color} fontSize="11" fontWeight="700" letterSpacing="1">{label}</text>
      </svg>
      <div style={{ fontSize: 12, color: "#aaa", marginTop: -4 }}>
        5-Year Cardiac Death Risk &nbsp; P(event ≤ 5yr)
      </div>
    </div>
  );
}