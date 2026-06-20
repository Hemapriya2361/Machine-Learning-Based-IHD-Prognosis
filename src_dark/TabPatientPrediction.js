import { COLORS } from "./constants";
import { RiskGauge } from "./RiskGauge";

const HIGH_RISK_RECS = ["Urgent cardiology referral","Consider ICD evaluation","Intensive statin + ACEi/ARB","Monthly follow-up x 6 months","Echo in 3 months"];
const MOD_RISK_RECS  = ["Cardiology review in 1 month","Optimise medical therapy","Lifestyle modification","6-month follow-up echo","Lipid panel + HbA1c check"];
const LOW_RISK_RECS  = ["Annual cardiology review","Continue current therapy","Lifestyle monitoring","Yearly echo if LVEF ≤50%","Annual lipid/glucose check"];

export function TabPatientPrediction({ patient, result, risk5, surv5, riskColor }) {
  const recs =
    result.risk_class === "HIGH RISK"   ? { list: HIGH_RISK_RECS, label: "High-Risk Protocol",    color: "#e87070", border: "#2a1a1a" }
    : result.risk_class === "MEDIUM RISK" ? { list: MOD_RISK_RECS,  label: "Moderate-Risk Protocol", color: COLORS.gold, border: "#2a2a1a" }
    :                                       { list: LOW_RISK_RECS,   label: "Standard Follow-up",    color: COLORS.green, border: "#1a2a1a" };

  return (
    <div>
      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Gauge */}
        <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" }}>
          <RiskGauge risk={risk5} />
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Survival S(7yr)", result.surv_7yr + "%", COLORS.lr],
              ["Risk P(death)",   result.risk_7yr + "%", COLORS.hr],
              ["S(1yr)",          result.surv_1yr + "%", COLORS.neu],
              ["S(3yr)",          result.surv_3yr + "%", COLORS.neu],
              ["S(5yr)",          result.surv_5yr + "%", COLORS.neu],
            ].map(([l, v, c]) => (
              <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 12px", background: "#111", borderRadius: 6 }}>
                <span style={{ color: "#888", fontSize: 12 }}>{l}</span>
                <span style={{ color: c, fontWeight: 800 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient summary */}
        <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" }}>
          <div style={{ fontWeight: 700, color: "#fff", marginBottom: 12, fontSize: 13 }}>Patient Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {[
              ["Age",        patient.Age + " yrs"],
              ["Sex",        patient.Gender ? "Male" : "Female"],
              ["LVEF",       patient.LVEF + "%"],
              ["Creatinine", patient.Creatinina + " mg/dL"],
              ["Vessels",    patient.Vessels],
              ["Ischemia",   patient.Ischemia ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} style={{ padding: "6px 10px", background: "#111", borderRadius: 6 }}>
                <div style={{ fontSize: 10, color: "#666" }}>{k}</div>
                <div style={{ fontWeight: 700, color: "#ddd", fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {["Diabetes","Hypertension","Smoke","Dyslipidemia","AF","PMI","AMI"]
              .filter((k) => patient[k])
              .map((k) => (
                <span key={k} style={{
                  padding: "2px 8px", borderRadius: 12,
                  background: COLORS.hr + "22", border: "1px solid " + COLORS.hr + "44",
                  color: "#e87070", fontSize: 11,
                }}>{k}</span>
              ))}
          </div>
        </div>

        {/* Clinical recs */}
        <div style={{ background: riskColor + "11", borderRadius: 10, padding: "18px 16px", border: "1px solid " + riskColor + "44" }}>
          <div style={{ fontWeight: 700, color: riskColor, marginBottom: 10, fontSize: 13 }}>🩺 Clinical Recommendation</div>
          <div style={{ color: recs.color, fontWeight: 700, marginBottom: 8 }}>{recs.label}</div>
          {recs.list.map((r) => (
            <div key={r} style={{ padding: "5px 0", borderBottom: "1px solid " + recs.border, fontSize: 12, color: "#ccc" }}>• {r}</div>
          ))}
        </div>
      </div>

      {/* Year-by-year survival bars — from API result.yearly */}
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: "18px 16px", border: "1px solid #2a2a2a" }}>
        <div style={{ fontWeight: 700, color: "#fff", marginBottom: 14 }}> Year-by-Year Survival Prognosis</div>
        <div style={{ display: "flex", gap: 0 }}>
          {(result.yearly || []).map(({ year, survival }) => {
            const pct = survival ?? 0;
            const c   = pct > 70 ? COLORS.lr : pct > 50 ? COLORS.gold : COLORS.hr;
            return (
              <div key={year} style={{ flex: 1, textAlign: "center" }}>
                <div style={{
                  margin: "0 2px", height: (pct * 1.4) + "px", maxHeight: 140,
                  background: "linear-gradient(to top, " + c + ", " + c + "44)",
                  borderRadius: "4px 4px 0 0", transition: "height 0.4s",
                }} />
                <div style={{ fontSize: 11, color: c, fontWeight: 700, marginTop: 4 }}>{pct}%</div>
                <div style={{ fontSize: 10, color: "#666" }}>{year}yr</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}