import { useState } from "react";
import { COLORS, TABS, defaultPatient } from "./constants";
import { usePredictAPI }         from "./usePredictAPI";
import { SidebarInput }          from "./SidebarInput";
import { PredictButton }         from "./PredictButton";
import { ResultsPlaceholder }    from "./ResultsPlaceholder";
import { TabPatientPrediction }  from "./TabPatientPrediction";
import { TabModelPerformance }   from "./TabModelPerformance";
import { TabSHAP }               from "./TabSHAP";
import { TabSurvivalCurves }     from "./TabSurvivalCurves";

export default function App() {
  const [patient,     setPatient]     = useState(defaultPatient);
  const [tab,         setTab]         = useState(0);
  const [showSidebar, setShowSidebar] = useState(true);

  const {
    result, shapResult,
    loading, shapLoading, error,
    predict, predictWithShap,
    risk5, surv5, riskColor, riskGroup,
  } = usePredictAPI();

  const handleTabClick = (i) => {
    setTab(i);
    if (i === 2 && !shapResult && !shapLoading && result) {
      predictWithShap(patient);
    }
  };

  const handlePredict = () => predict(patient);

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      background: "#0f0f0f", color: "#e0e0e0", fontSize: 13,
    }}>

      {/* SIDEBAR */}
      <div style={{
        width: showSidebar ? 240 : 0, minWidth: showSidebar ? 240 : 0,
        background: "#161616", borderRight: "1px solid #222",
        overflow: "hidden", transition: "width 0.3s, min-width 0.3s",
        padding: showSidebar ? "20px 16px" : 0,
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 20,
          paddingBottom: 14, borderBottom: "1px solid #222",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg,#C0392B,#8B0000)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>❤️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: "#fff" }}>CardiacRisk AI</div>
          </div>
        </div>
        <SidebarInput patient={patient} setPatient={setPatient} />
        <PredictButton onClick={handlePredict} loading={loading} />
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOP BAR */}
        <div style={{
          background: "#161616", borderBottom: "1px solid #222",
          padding: "0 24px", display: "flex", alignItems: "center", height: 52, gap: 16,
        }}>
          <button onClick={() => setShowSidebar((s) => !s)}
            style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 20, padding: "0 4px" }}>
            ☰
          </button>
          <div style={{ flex: 1 }}>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>
              Cardiac Death Prediction — Ischemic Heart Disease
            </span>
            {/* <span style={{ marginLeft: 12, fontSize: 11, color: "#666" }}>
              Pingitore et al. 2024 · RSF + Balanced Bootstrap · SurvSHAP(t)
            </span> */}
          </div>
          {result && (
            <div style={{
              padding: "4px 14px", borderRadius: 20,
              background: riskColor + "22", border: "1px solid " + riskColor,
              color: riskColor, fontWeight: 800, fontSize: 12, letterSpacing: 0.5,
            }}>
              ⚡ {riskGroup} RISK · {result.risk_7yr}%
            </div>
          )}
        </div>

        {/* TABS */}
        <div style={{ display: "flex", background: "#161616", borderBottom: "1px solid #222", padding: "0 16px" }}>
          {TABS.map((t, i) => (
            <button key={i} onClick={() => handleTabClick(i)} style={{
              padding: "12px 18px", background: "none", border: "none",
              borderBottom: tab === i ? "2px solid " + COLORS.hr : "2px solid transparent",
              color: tab === i ? "#fff" : "#777",
              cursor: "pointer", fontWeight: tab === i ? 700 : 400,
              fontSize: 13, transition: "color 0.15s",
            }}>
              {t}
              {i === 2 && shapLoading && <span style={{ marginLeft: 6, fontSize: 10, color: "#F39C12" }}>⏳</span>}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, padding: "20px 24px", overflowY: "auto" }}>
          {!result && tab !== 1 && <ResultsPlaceholder error={error} />}
          {tab === 0 && result && (
            <TabPatientPrediction patient={patient} result={result} risk5={risk5} surv5={surv5} riskColor={riskColor} />
          )}
          {tab === 1 && <TabModelPerformance />}
          {tab === 2 && result && (
            <TabSHAP surv5={surv5} shapResult={shapResult} shapLoading={shapLoading} />
          )}
          {tab === 3 && result && (
            <TabSurvivalCurves result={result} surv5={surv5} riskColor={riskColor} />
          )}
        </div>

        {/* FOOTER */}
        <div style={{
          background: "#161616", borderTop: "1px solid #222",
          padding: "8px 24px", display: "flex", justifyContent: "space-between",
          fontSize: 10, color: "#444",
        }}>
          <span> RSF with Bootstrap-Based Resampling  ·  SurvSHAP(t)</span>
          <span> For research/educational use only — not a clinical decision tool</span>
        </div>
      </div>
    </div>
  );
}