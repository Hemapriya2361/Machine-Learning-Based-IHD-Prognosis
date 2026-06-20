export function PredictButton({ onClick, loading }) {
  return (
    <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #222" }}>
      <button
        onClick={onClick}
        disabled={loading}
        style={{
          width: "100%",
          padding: "11px 0",
          borderRadius: 8,
          border: "none",
          background: loading
            ? "#555"
            : "linear-gradient(135deg, #C0392B, #8B0000)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 13,
          letterSpacing: 0.5,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "opacity 0.2s",
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 14, height: 14, border: "2px solid #fff",
              borderTopColor: "transparent", borderRadius: "50%",
              display: "inline-block",
              animation: "spin 0.7s linear infinite",
            }} />
            Predicting…
          </>
        ) : (
          " Predict Risk"
        )}
      </button>

      {/* spinner keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}