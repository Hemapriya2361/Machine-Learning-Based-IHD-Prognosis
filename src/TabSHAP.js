import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line, Legend,
} from "recharts";
import { COLORS } from "./constants";

// Light-theme tooltip style
const tooltipStyle = {
  background: "#FFFFFF",
  border: "1px solid #E8E4DC",
  borderRadius: 8,
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  fontSize: 12,
  color: "#1C1C1E",
};

function ShapLoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 14 }}>
      <div style={{
        width: 34, height: 34,
        border: "3px solid #E8E4DC",
        borderTopColor: COLORS.btnPrimary,
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 600 }}>Computing SurvSHAP(t)…</div>
      <div style={{ color: COLORS.textMuted, fontSize: 11, textAlign: "center", maxWidth: 280, lineHeight: 1.6 }}>
        This uses KernelSHAP on 50 background patients.<br />Usually takes 30–60 seconds.
      </div>
    </div>
  );
}

export function TabSHAP({ surv5, shapResult, shapLoading }) {

  if (shapLoading) return <ShapLoadingState />;

  if (!shapResult || shapResult.error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
        <div style={{ fontSize: 34 }}>🧬</div>
        <div style={{ color: COLORS.textSecondary, fontSize: 13, fontWeight: 500 }}>
          {shapResult?.error
            ? "SurvSHAP(t) computation failed: " + shapResult.error
            : "SurvSHAP(t) will compute when you open this tab after predicting."}
        </div>
      </div>
    );
  }

  const features   = shapResult.features   || [];
  const timestamps = shapResult.timestamps || [];

  const barData = features.map((f) => ({
    feature: f.feature,
    shap:    parseFloat(f.integral.toFixed(4)),
    dir:     f.direction,
  }));

  const top6      = features.slice(0, 6);
  const curveData = timestamps.map((t, ti) => {
    const pt = { t: parseFloat(t.toFixed(2)) };
    top6.forEach((f) => { pt[f.feature] = parseFloat((f.shap_curve[ti] || 0).toFixed(5)); });
    return pt;
  });

  const LINE_COLORS = [COLORS.hr, COLORS.lr, COLORS.gold, COLORS.green, COLORS.neu, "#7C3AED"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* Integral bar chart */}
      <div className="card">
        <div className="card-title">🌍 SurvSHAP(t) — Integral Attributions</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 14, lineHeight: 1.5 }}>
          S(7yr) ={" "}
          <span style={{ color: COLORS.lr, fontWeight: 700 }}>
            {surv5 ? (surv5 * 100).toFixed(1) + "%" : "—"}
          </span>
          {" "}· Positive = protective · Negative = harmful
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
            <XAxis type="number" tick={{ fill: COLORS.textMuted, fontSize: 10 }} />
            <YAxis type="category" dataKey="feature" width={104} tick={{ fill: COLORS.textSecondary, fontSize: 11 }} />
            <ReferenceLine x={0} stroke={COLORS.borderStrong} strokeWidth={1.5} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [v > 0 ? "+" + v : v, "SurvSHAP integral"]}
            />
            <Bar dataKey="shap" radius={[0, 4, 4, 0]}>
              {barData.map((d, i) => (
                <Cell key={i} fill={d.shap >= 0 ? COLORS.lr : COLORS.hr} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 16, marginTop: 10, justifyContent: "center", fontSize: 11, color: COLORS.textMuted }}>
          <span style={{ color: COLORS.lr }}>● Protective (↑ S(t))</span>
          <span style={{ color: COLORS.hr }}>● Harmful (↓ S(t))</span>
        </div>
      </div>

      {/* SHAP(t) time curves */}
      <div className="card">
        <div className="card-title">📈 SurvSHAP(t) — Feature Contributions over Time</div>
        <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 14 }}>
          Top 6 features · how each shifts S(t) at every time point
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E4DC" />
            <XAxis
              dataKey="t"
              tickFormatter={(v) => v.toFixed(1)}
              label={{ value: "Years", position: "bottom", fill: COLORS.textMuted, fontSize: 10 }}
              tick={{ fill: COLORS.textMuted, fontSize: 10 }}
            />
            <YAxis tick={{ fill: COLORS.textMuted, fontSize: 10 }} />
            <ReferenceLine y={0} stroke={COLORS.borderStrong} strokeDasharray="3 3" />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v) => [v > 0 ? "+" + v : v, ""]}
            />
            {top6.map((f, i) => (
              <Line
                key={f.feature}
                type="monotone"
                dataKey={f.feature}
                stroke={LINE_COLORS[i]}
                strokeWidth={1.8}
                dot={false}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6, color: COLORS.textSecondary }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Attribution table */}
      <div className="card" style={{ gridColumn: "1/-1" }}>
        <div className="card-title">📋 Full SurvSHAP(t) Attribution Table</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#F8F7F4" }}>
                {["Rank", "Feature", "SurvSHAP Integral", "Direction"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "9px 14px",
                      color: COLORS.textMuted,
                      fontWeight: 600,
                      textAlign: "left",
                      borderBottom: "1px solid #E8E4DC",
                      fontSize: 11,
                      letterSpacing: 0.3,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr
                  key={f.feature}
                  style={{
                    borderBottom: "1px solid #F0EDE7",
                    background: i % 2 === 0 ? "#FFFFFF" : "#FAF9F6",
                  }}
                >
                  <td style={{ padding: "9px 14px", color: COLORS.textMuted, fontFamily: "'DM Mono', monospace" }}>{i + 1}</td>
                  <td style={{ padding: "9px 14px", color: COLORS.textPrimary, fontWeight: 600 }}>{f.feature}</td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      color: f.integral >= 0 ? COLORS.lr : COLORS.hr,
                      fontWeight: 700,
                      fontFamily: "'DM Mono', monospace",
                    }}>
                      {f.integral > 0 ? "+" : ""}{f.integral.toFixed(5)}
                    </span>
                  </td>
                  <td style={{ padding: "9px 14px" }}>
                    <span style={{
                      padding: "2px 9px",
                      borderRadius: 12,
                      fontSize: 11,
                      fontWeight: 700,
                      background: f.direction === "protective" ? "#F0FDF4" : "#FEF2F2",
                      border: `1px solid ${f.direction === "protective" ? "#BBF7D0" : "#FECACA"}`,
                      color: f.direction === "protective" ? COLORS.green : COLORS.hr,
                    }}>
                      {f.direction === "protective" ? "↑ Protective" : "↓ Harmful"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
