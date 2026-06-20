import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell, LineChart, Line, Legend,
} from "recharts";
import { COLORS } from "./constants";

const card = { background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" };

function ShapLoadingState() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 12 }}>
      <div style={{
        width: 32, height: 32, border: "3px solid #333",
        borderTopColor: "#C0392B", borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ color: "#888", fontSize: 13 }}>Computing SurvSHAP(t)…</div>
      <div style={{ color: "#555", fontSize: 11, textAlign: "center", maxWidth: 280 }}>
        This uses KernelSHAP on 50 background patients.<br />Usually takes 30–60 seconds.
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export function TabSHAP({ surv5, shapResult, shapLoading }) {

  if (shapLoading) return <ShapLoadingState />;

  if (!shapResult || shapResult.error) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 300, gap: 10 }}>
        <div style={{ fontSize: 32 }}>🧬</div>
        <div style={{ color: "#777", fontSize: 13 }}>
          {shapResult?.error
            ? "SurvSHAP(t) computation failed: " + shapResult.error
            : "SurvSHAP(t) will compute when you open this tab after predicting."}
        </div>
      </div>
    );
  }

  const features   = shapResult.features   || [];
  const timestamps = shapResult.timestamps || [];

  // Bar chart data — sorted by abs(integral)
  const barData = features.map((f) => ({
    feature:  f.feature,
    shap:     parseFloat(f.integral.toFixed(4)),
    dir:      f.direction,
  }));

  // Time-curve chart data — top 6 features
  const top6       = features.slice(0, 6);
  const curveData  = timestamps.map((t, ti) => {
    const pt = { t: parseFloat(t.toFixed(2)) };
    top6.forEach((f) => { pt[f.feature] = parseFloat((f.shap_curve[ti] || 0).toFixed(5)); });
    return pt;
  });

  const LINE_COLORS = [COLORS.hr, COLORS.lr, COLORS.gold, COLORS.green, COLORS.neu, "#8E44AD"];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

      {/* Integral bar chart */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>🌍 SurvSHAP(t) — Integral Attributions</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>
          S(7yr) = <span style={{ color: COLORS.lr, fontWeight: 700 }}>{surv5 ? (surv5 * 100).toFixed(1) + "%" : "—"}</span>
          &nbsp;· Positive = protective · Negative = harmful
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis type="number" tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis type="category" dataKey="feature" width={100} tick={{ fill: "#ccc", fontSize: 11 }} />
            <ReferenceLine x={0} stroke="#555" />
            <Tooltip
              contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }}
              formatter={(v) => [v > 0 ? "+" + v : v, "SurvSHAP integral"]}
            />
            <Bar dataKey="shap" radius={[0, 3, 3, 0]}>
              {barData.map((d, i) => (
                <Cell key={i} fill={d.shap >= 0 ? COLORS.lr : COLORS.hr} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 14, marginTop: 10, justifyContent: "center", fontSize: 11 }}>
          <span> Protective (↑ S(t))</span>
          <span> Harmful (↓ S(t))</span>
        </div>
      </div>

      {/* SHAP(t) time curves */}
      <div style={card}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 4 }}>📈 SurvSHAP(t) — Feature Contributions over Time</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 12 }}>Top 6 features · how each shifts S(t) at every time point</div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={curveData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#222" />
            <XAxis dataKey="t" tickFormatter={(v) => v.toFixed(1)} label={{ value: "Years", position: "bottom", fill: "#666", fontSize: 10 }} tick={{ fill: "#888", fontSize: 10 }} />
            <YAxis tick={{ fill: "#888", fontSize: 10 }} />
            <ReferenceLine y={0} stroke="#555" strokeDasharray="3 3" />
            <Tooltip contentStyle={{ background: "#1a1a1a", border: "1px solid #333" }} formatter={(v) => [v > 0 ? "+" + v : v, ""]} />
            {top6.map((f, i) => (
              <Line key={f.feature} type="monotone" dataKey={f.feature}
                stroke={LINE_COLORS[i]} strokeWidth={1.8} dot={false} />
            ))}
            <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Feature attribution table */}
      <div style={{ ...card, gridColumn: "1/-1" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}>📋 Full SurvSHAP(t) Attribution Table</div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#111" }}>
                {["Rank", "Feature", "SurvSHAP Integral", "Direction"].map((h) => (
                  <th key={h} style={{ padding: "8px 12px", color: "#888", fontWeight: 600, textAlign: "left", borderBottom: "1px solid #2a2a2a" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.feature} style={{ borderBottom: "1px solid #1a1a1a" }}>
                  <td style={{ padding: "8px 12px", color: "#666" }}>{i + 1}</td>
                  <td style={{ padding: "8px 12px", color: "#ddd", fontWeight: 600 }}>{f.feature}</td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{ color: f.integral >= 0 ? COLORS.lr : COLORS.hr, fontWeight: 700 }}>
                      {f.integral > 0 ? "+" : ""}{f.integral.toFixed(5)}
                    </span>
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    <span style={{
                      color: f.direction === "protective" ? COLORS.green : COLORS.hr,
                      fontWeight: 700, fontSize: 11,
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