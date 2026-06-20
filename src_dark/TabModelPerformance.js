import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { COLORS, metricsData, rocPoints, confMatrix } from "./constants";
import { MetricBadge } from "./MetricBadge";
import { ConfMatrix }   from "./ConfMatrix";

const TD_DATA = [
  { yr: "1-Year", rsf: 0.871, cox: 0.821 },
  { yr: "3-Year", rsf: 0.854, cox: 0.802 },
  { yr: "5-Year", rsf: 0.836, cox: 0.784 },
];

const card = { background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" };

export function TabModelPerformance() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* Metrics table */}
      <div style={{ ...card, gridColumn: "1/-1" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>Model Metrics — RSF vs Cox Baseline</div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 80px", gap: 0 }}>
          {["Metric", "RSF (Novelty)", "Cox Baseline", "Winner"].map((h) => (
            <div key={h} style={{ padding: "8px 12px", background: "#111", fontSize: 11, fontWeight: 700, color: "#888", borderBottom: "1px solid #222" }}>
              {h}
            </div>
          ))}
          {metricsData.map((row, i) => {
            const ibsBetter = row.metric.includes("IBS") ? row.rsf < row.cox : row.rsf > row.cox;
            return [
              <div key={`m${i}`} style={{ padding: "9px 12px", borderBottom: "1px solid #1a1a1a", fontSize: 13, color: "#ddd" }}>{row.metric}</div>,
              <div key={`r${i}`} style={{ padding: "9px 12px", borderBottom: "1px solid #1a1a1a" }}>
                <MetricBadge value={row.rsf} compare={row.cox} invert={row.metric.includes("IBS")} />
              </div>,
              <div key={`c${i}`} style={{ padding: "9px 12px", borderBottom: "1px solid #1a1a1a" }}>
                <MetricBadge value={row.cox} compare={row.rsf} invert={row.metric.includes("IBS")} />
              </div>,
              <div key={`w${i}`} style={{ padding: "9px 12px", borderBottom: "1px solid #1a1a1a", color: COLORS.green, fontWeight: 800 }}>
                {ibsBetter ? "RSF ✓" : "Cox"}
              </div>,
            ];
          })}
        </div>
      </div>

      {/* Confusion matrices */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>Confusion Matrices @ 5yr Threshold = 0.5</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <ConfMatrix data={confMatrix.rsf} title="RSF (Novelty)" />
          <ConfMatrix data={confMatrix.cox} title="Cox Baseline" />
        </div>
      </div>

      {/* ROC curve */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>ROC Curve — 5-Year Cardiac Death</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rocPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="fpr" tickFormatter={(v) => v.toFixed(1)} label={{ value: "FPR", position: "bottom", fill: "#666", fontSize: 11 }} tick={{ fill: "#666", fontSize: 10 }} />
            <YAxis domain={[0, 1]} tick={{ fill: "#666", fontSize: 10 }} label={{ value: "TPR", angle: -90, position: "left", fill: "#666", fontSize: 11 }} />
            <Tooltip formatter={(v, n) => [v.toFixed(3), n]} contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
            <ReferenceLine x={0} y={0} stroke="#555" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="rsf" stroke={COLORS.hr}  strokeWidth={2.5} dot={false} name="RSF (AUC=0.847)" />
            <Line type="monotone" dataKey="cox" stroke={COLORS.neu} strokeWidth={2}   strokeDasharray="5 5" dot={false} name="Cox (AUC=0.793)" />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time-dependent AUROC */}
      <div style={{ ...card, gridColumn: "1" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>Time-Dependent AUROC</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={TD_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="yr" tick={{ fill: "#888", fontSize: 11 }} />
            <YAxis domain={[0.7, 0.95]} tick={{ fill: "#888", fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rsf" fill={COLORS.hr}  name="RSF" radius={[3, 3, 0, 0]} />
            <Bar dataKey="cox" fill={COLORS.neu} name="Cox" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}