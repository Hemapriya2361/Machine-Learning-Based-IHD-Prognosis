import { COLORS } from "./constants";
import { RiskGauge } from "./RiskGauge";

const HIGH_RISK_RECS = ["Urgent cardiology referral","Consider ICD evaluation","Intensive statin + ACEi/ARB","Monthly follow-up x 6 months","Echo in 3 months"];
const MOD_RISK_RECS  = ["Cardiology review in 1 month","Optimise medical therapy","Lifestyle modification","6-month follow-up echo","Lipid panel + HbA1c check"];
const LOW_RISK_RECS  = ["Annual cardiology review","Continue current therapy","Lifestyle monitoring","Yearly echo if LVEF ≤50%","Annual lipid/glucose check"];

export function TabPatientPrediction({ patient, result, risk5, surv5, riskColor }) {
  const recs =
    result.risk_class === "HIGH RISK"   ? { list: HIGH_RISK_RECS, label: "High-Risk Protocol",    color: COLORS.hr,    borderColor: COLORS.hr + "22" }
    : result.risk_class === "MEDIUM RISK" ? { list: MOD_RISK_RECS,  label: "Moderate-Risk Protocol", color: COLORS.gold,  borderColor: COLORS.gold + "22" }
    :                                       { list: LOW_RISK_RECS,   label: "Standard Follow-up",    color: COLORS.green, borderColor: COLORS.green + "22" };

  return (
    <div>
      {/* Top row */}
      <div style={{ display: "grid", gridTemplateColumns: "290px 1fr 1fr", gap: 16, marginBottom: 16 }}>

        {/* Gauge card */}
        <div className="card">
          <RiskGauge risk={risk5} />
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              ["Survival S(7yr)", result.surv_7yr + "%", COLORS.lr],
              ["Risk P(death)",   result.risk_7yr + "%", COLORS.hr],
              ["S(1yr)",          result.surv_1yr + "%", COLORS.neu],
              ["S(3yr)",          result.surv_3yr + "%", COLORS.neu],
              ["S(5yr)",          result.surv_5yr + "%", COLORS.neu],
            ].map(([l, v, c]) => (
              <div key={l} className="stat-row">
                <span className="stat-label">{l}</span>
                <span style={{ color: c, fontWeight: 800, fontFamily: "'DM Mono', monospace", fontSize: 12 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Patient summary card */}
        <div className="card">
          <div className="card-title">Patient Summary</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Age",        patient.Age + " yrs"],
              ["Sex",        patient.Gender ? "Male" : "Female"],
              ["LVEF",       patient.LVEF + "%"],
              ["Creatinine", patient.Creatinina + " mg/dL"],
              ["Vessels",    patient.Vessels],
              ["Ischemia",   patient.Ischemia ? "Yes" : "No"],
            ].map(([k, v]) => (
              <div key={k} style={{
                padding: "8px 12px",
                background: COLORS.surfaceSub,
                borderRadius: 8,
                border: "1px solid " + COLORS.border,
              }}>
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginBottom: 2, letterSpacing: 0.3 }}>{k}</div>
                <div style={{ fontWeight: 700, color: COLORS.textPrimary, fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 5 }}>
            {["Diabetes","Hypertension","Smoke","Dyslipidemia","AF","PMI","AMI"]
              .filter((k) => patient[k])
              .map((k) => (
                <span
                  key={k}
                  className="risk-tag"
                  style={{
                    background: COLORS.hr + "12",
                    border: "1px solid " + COLORS.hr + "30",
                    color: COLORS.hr,
                  }}
                >
                  {k}
                </span>
              ))}
          </div>
        </div>

        {/* Clinical recs card */}
        <div className="card" style={{ borderColor: riskColor + "40", background: riskColor + "06" }}>
          <div className="card-title" style={{ color: riskColor }}>🩺 Clinical Recommendation</div>
          <div style={{ color: recs.color, fontWeight: 700, marginBottom: 10, fontSize: 12, letterSpacing: 0.2 }}>
            {recs.label}
          </div>
          {recs.list.map((r) => (
            <div
              key={r}
              style={{
                padding: "7px 0",
                borderBottom: "1px solid " + COLORS.border,
                fontSize: 12,
                color: COLORS.textSecondary,
                display: "flex",
                alignItems: "flex-start",
                gap: 7,
              }}
            >
              <span style={{ color: recs.color, fontSize: 10, marginTop: 1 }}>●</span>
              {r}
            </div>
          ))}
        </div>
      </div>

      {/* Year-by-year survival bars */}
      <div className="card">
        <div className="card-title"> Year-by-Year Survival Prognosis</div>
        <div style={{ display: "flex", gap: 0, alignItems: "flex-end", height: 160, paddingBottom: 8 }}>
          {(result.yearly || []).map(({ year, survival }) => {
            const pct = survival ?? 0;
            const c   = pct > 70 ? COLORS.lr : pct > 50 ? COLORS.gold : COLORS.hr;
            return (
              <div key={year} style={{ flex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end" }}>
                <div style={{ fontSize: 11, color: c, fontWeight: 700, marginBottom: 5, fontFamily: "'DM Mono', monospace" }}>{pct}%</div>
                <div
                  style={{
                    width: "calc(100% - 8px)",
                    height: (pct * 1.2) + "px",
                    maxHeight: 120,
                    background: `linear-gradient(to top, ${c}, ${c}50)`,
                    borderRadius: "5px 5px 0 0",
                    transition: "height 0.5s cubic-bezier(.22,1,.36,1)",
                    border: "1px solid " + c + "40",
                    borderBottom: "none",
                  }}
                />
                <div style={{ fontSize: 10, color: COLORS.textMuted, marginTop: 4 }}>{year}yr</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
