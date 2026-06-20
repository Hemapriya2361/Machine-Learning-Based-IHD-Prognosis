import { COLORS } from "./constants";

export function PredictButton({ onClick, loading }) {
  return (
    <div className="predict-btn-wrap">
      <button
        onClick={onClick}
        disabled={loading}
        className="predict-btn"
        style={{
          background: loading
            ? COLORS.textMuted
            : `linear-gradient(135deg, ${COLORS.btnPrimary}, ${COLORS.btnHover})`,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.8 : 1,
        }}
      >
        {loading ? (
          <>
            <span className="spinner" />
            Predicting…
          </>
        ) : (
          "⚡ Predict Risk"
        )}
      </button>
    </div>
  );
}
