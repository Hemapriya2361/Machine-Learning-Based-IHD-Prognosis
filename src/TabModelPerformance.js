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

const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E8E4DC",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: 12,
  color: "#1C1C1E",
};

export function TabModelPerformance() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* Metrics table */}
      <div className="card" style={{ gridColumn: "1/-1" }}>
        <div className="card-title">Model Metrics — RSF vs Cox Baseline</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#F8F7F4" }}>
                {["Metric", "RSF (Novelty)", "Cox Baseline", "Winner"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 14px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: COLORS.textMuted,
                      borderBottom: "1px solid #E8E4DC",
                      textAlign: "left",
                      letterSpacing: 0.3,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metricsData.map((row, i) => {
                const ibsBetter = row.metric.includes("IBS") ? row.rsf < row.cox : row.rsf > row.cox;
                return (
                  <tr
                    key={row.metric}
                    style={{
                      borderBottom: "1px solid #F0EDE7",
                      background: i % 2 === 0 ? "#FFFFFF" : "#FAF9F6",
                    }}
                  >
                    <td style={{ padding: "10px 14px", color: COLORS.textPrimary, fontWeight: 500 }}>{row.metric}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <MetricBadge value={row.rsf} compare={row.cox} invert={row.metric.includes("IBS")} />
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <MetricBadge value={row.cox} compare={row.rsf} invert={row.metric.includes("IBS")} />
                    </td>
                    <td style={{ padding: "10px 14px", color: COLORS.green, fontWeight: 800, fontSize: 12 }}>
                      {ibsBetter ? "RSF ✓" : "Cox"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confusion matrices */}
      <div className="card">
        <div className="card-title">Confusion Matrices @ 5yr Threshold = 0.5</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          <ConfMatrix data={confMatrix.rsf} title="RSF (Novelty)" />
          <ConfMatrix data={confMatrix.cox} title="Cox Baseline" />
        </div>
      </div>

      {/* ROC curve */}
      <div className="card">
        <div className="card-title">ROC Curve — 5-Year Cardiac Death</div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rocPoints}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
            <XAxis
              dataKey="fpr"
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: "FPR", position: "bottom", fill: COLORS.textMuted, fontSize: 11 }}
              tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            />
            <YAxis
              domain={[0, 1]}
              tick={{ fill: COLORS.textMuted, fontSize: 10 }}
              label={{ value: "TPR", angle: -90, position: "left", fill: COLORS.textMuted, fontSize: 11 }}
            />
            <Tooltip formatter={(v, n) => [v.toFixed(3), n]} contentStyle={tooltipStyle} />
            <ReferenceLine x={0} y={0} stroke={COLORS.borderStrong} strokeDasharray="4 4" />
            <Line type="monotone" dataKey="rsf" stroke={COLORS.hr}  strokeWidth={2.5} dot={false} name="RSF (AUC=0.847)" />
            <Line type="monotone" dataKey="cox" stroke={COLORS.neu} strokeWidth={2}   strokeDasharray="5 5" dot={false} name="Cox (AUC=0.793)" />
            <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time-dependent AUROC */}
      <div className="card" style={{ gridColumn: "1" }}>
        <div className="card-title">Time-Dependent AUROC</div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={TD_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
            <XAxis dataKey="yr" tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
            <YAxis domain={[0.7, 0.95]} tick={{ fill: COLORS.textMuted, fontSize: 11 }} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="rsf" fill={COLORS.hr}  name="RSF" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cox" fill={COLORS.neu} name="Cox" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
