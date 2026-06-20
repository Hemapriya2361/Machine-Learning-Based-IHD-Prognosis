import { COLORS } from "./constants";

export function ResultsPlaceholder({ error }) {
  if (error) {
    return (
      <div className="placeholder-wrap">
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ color: COLORS.hr, fontWeight: 700, fontSize: 14 }}>Prediction failed</div>
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="placeholder-wrap">
      <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.textSecondary }}>
        No prediction yet
      </div>
      <div className="placeholder-sub">
        Adjust patient inputs in the sidebar,<br />
        then click{" "}
        <strong style={{ color: COLORS.btnPrimary }}>⚡ Predict Risk</strong>{" "}
        to run the model.
      </div>
    </div>
  );
}
