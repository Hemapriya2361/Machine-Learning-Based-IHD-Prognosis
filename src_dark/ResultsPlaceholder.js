export function ResultsPlaceholder({ error }) {
  if (error) {
    return (
      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: 300, gap: 12,
      }}>
        <div style={{ fontSize: 36 }}>⚠️</div>
        <div style={{ color: "#C0392B", fontWeight: 700, fontSize: 14 }}>Prediction failed</div>
        <div style={{
          color: "#888", fontSize: 12, maxWidth: 360,
          textAlign: "center", background: "#1a1a1a",
          padding: "10px 16px", borderRadius: 8, border: "1px solid #2a2a2a",
        }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      height: 340, gap: 16, color: "#555",
    }}>
      {/* <div style={{ fontSize: 52 }}>🫀</div> */}
      <div style={{ fontWeight: 700, fontSize: 15, color: "#777" }}>
        No prediction yet
      </div>
      <div style={{ fontSize: 12, color: "#555", textAlign: "center", maxWidth: 280 }}>
        Adjust patient inputs in the sidebar,<br />
        then click <strong style={{ color: "#C0392B" }}>Predict Risk</strong> to run the model.
      </div>
      <div style={{
        marginTop: 8, display: "flex", flexDirection: "column", gap: 8,
        fontSize: 11, color: "#444",
      }}>
        {/* {[
          "  Risk classification (High / Medium / Low)",
          "  Survival curve S(t) and hazard H(t)",
          "  Year-by-year survival prognosis",
          "  SurvSHAP(t) feature attribution",
        ].map((line) => (
          <div key={line}>{line}</div>
        ))} */}
      </div>
    </div>
  );
}