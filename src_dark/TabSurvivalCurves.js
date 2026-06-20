import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { COLORS, kmData } from "./constants";

const CALIBRATION_ROWS = [
  ["Integrated Brier Score (RSF)", "0.118", "Lower = better (ref: 0.25)",     COLORS.lr],
  ["Integrated Brier Score (Cox)", "0.143", "RSF is 17.5% better calibrated", COLORS.neu],
  ["Harrell C-index (RSF)",        "0.831", "Excellent discrimination (>0.8)", COLORS.lr],
  ["Harrell C-index (Cox)",        "0.779", "Good discrimination (0.75-0.8)",  COLORS.neu],
];

const AT_RISK = [
  ["High Risk", COLORS.hr, [280, 201, 148, 122, 98, 71]],
  ["Low Risk",  COLORS.lr, [518, 502, 489, 481, 470, 458]],
];

const card = { background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" };

export function TabSurvivalCurves({ result, surv5, riskColor }) {
  // Use real survival curve from API
  const survCurve   = result.surv_curve   || [];
  const hazardCurve = result.hazard_curve || [];

  // Individual patient yearly points for the small chart
  const yearlyData = (result.yearly || []).map(({ year, survival }) => ({
    yr:   year,
    surv: (survival ?? 0) / 100,
  }));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* KM Curves (population-level, static reference) */}
      <div style={{ ...card, gridColumn: "1/-1" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}> Kaplan-Meier Survival Curves — RSF Risk Stratification</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 14 }}>
          Ischemic Heart Disease: Cardiac Death Endpoint | Threshold: S(7yr) ≤ 26% = High Risk
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="t" type="number" domain={[0, 8]} label={{ value: "Time (Years)", position: "bottom", fill: "#666", fontSize: 11 }} tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => (v * 100).toFixed(0) + "%"} tick={{ fill: "#888", fontSize: 10 }} label={{ value: "Survival Prob.", angle: -90, position: "left", fill: "#666", fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [(v * 100).toFixed(1) + "%", n]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
            <ReferenceLine x={7} stroke="#555" strokeDasharray="4 4" label={{ value: "7yr horizon", fill: "#666", fontSize: 10 }} />
            <Line data={kmData.hr} type="stepAfter" dataKey="s" stroke={COLORS.hr} strokeWidth={2.5} dot={false} name="High Risk (n≈280)" />
            <Line data={kmData.lr} type="stepAfter" dataKey="s" stroke={COLORS.lr} strokeWidth={2.5} strokeDasharray="6 3" dot={false} name="Low Risk (n≈518)" />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
          </LineChart>
        </ResponsiveContainer>
        {/* At-risk table */}
        <div style={{ marginTop: 12, borderTop: "1px solid #222", paddingTop: 10 }}>
          <div style={{ fontSize: 10, color: "#666", marginBottom: 6 }}>Number at risk</div>
          <div style={{ display: "grid", gridTemplateColumns: "80px repeat(6, 1fr)", fontSize: 11 }}>
            {["", "t=0", "t=2", "t=4", "t=5", "t=6", "t=8"].map((h, i) => (
              <div key={i} style={{ padding: "3px 6px", color: "#666", fontWeight: i === 0 ? 700 : 400 }}>{h}</div>
            ))}
            {AT_RISK.map(([label, color, vals]) => [
              <div key={label} style={{ padding: "3px 6px", color, fontWeight: 700, fontSize: 10 }}>{label}</div>,
              ...vals.map((v, i) => <div key={label + i} style={{ padding: "3px 6px", color, fontSize: 11 }}>{v}</div>),
            ])}
          </div>
        </div>
      </div>

      {/* Individual patient survival S(t) — REAL from API */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}> Individual Survival Curve — Current Patient</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>
          RSF predicted S(t) · 7yr risk = <span style={{ color: riskColor, fontWeight: 700 }}>{result.risk_7yr}%</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={survCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="t" tickFormatter={(v) => v.toFixed(0)} label={{ value: "Years", position: "bottom", fill: "#666", fontSize: 10 }} tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis domain={[0, 1]} tickFormatter={(v) => (v * 100).toFixed(0) + "%"} tick={{ fill: "#888", fontSize: 10 }} />
            <ReferenceLine x={7} stroke="#555" strokeDasharray="4 4" />
            <Tooltip formatter={(v) => [(v * 100).toFixed(1) + "%", "S(t)"]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
            <Line type="monotone" dataKey="s" stroke={riskColor} strokeWidth={2.5} dot={false} name="S(t)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Cumulative hazard H(t) — REAL from API */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>Cumulative Hazard H(t) — Current Patient</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>RSF predicted cumulative hazard function</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={hazardCurve}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="t" tickFormatter={(v) => v.toFixed(0)} label={{ value: "Years", position: "bottom", fill: "#666", fontSize: 10 }} tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} />
            <ReferenceLine x={7} stroke="#555" strokeDasharray="4 4" />
            <Tooltip formatter={(v) => [v.toFixed(4), "H(t)"]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
            <Line type="monotone" dataKey="h" stroke={COLORS.hr} strokeWidth={2.5} dot={false} name="H(t)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Calibration summary (static) */}
      <div style={{ ...card, gridColumn: "1/-1" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>Model Calibration Summary</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CALIBRATION_ROWS.map(([label, val, note, col]) => (
            <div key={label} style={{ padding: "10px 12px", background: "#111", borderRadius: 8, borderLeft: "3px solid " + col }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                <span style={{ fontSize: 12, color: "#ccc" }}>{label}</span>
                <span style={{ fontWeight: 800, color: col }}>{val}</span>
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>{note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}