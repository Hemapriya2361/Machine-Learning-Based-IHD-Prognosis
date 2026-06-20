import { useState } from "react";
import "./App.css";
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
    <div className="app-root">

      {/* SIDEBAR */}
      <div
        className="sidebar"
        style={{
          width:    showSidebar ? 252 : 0,
          minWidth: showSidebar ? 252 : 0,
          padding:  showSidebar ? "22px 18px" : 0,
        }}
      >
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">❤️</div>
          <div className="sidebar-logo-title">CardiacRisk AI</div>
        </div>
        <SidebarInput patient={patient} setPatient={setPatient} />
        <PredictButton onClick={handlePredict} loading={loading} />
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* TOP BAR */}
        <div className="topbar">
          <button className="topbar-toggle" onClick={() => setShowSidebar((s) => !s)}>
            ☰
          </button>
          <div className="topbar-title">
            Cardiac Death Prediction — Ischemic Heart Disease
          </div>
          {result && (
            <div
              className="risk-badge"
              style={{
                background: riskColor + "18",
                border: "1px solid " + riskColor + "55",
                color: riskColor,
              }}
            >
              ⚡ {riskGroup} RISK · {result.risk_7yr}%
            </div>
          )}
        </div>

        {/* TABS */}
        <div className="tabs-bar">
          {TABS.map((t, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={"tab-btn" + (tab === i ? " active" : "")}
            >
              {t}
              {i === 2 && shapLoading && (
                <span style={{ marginLeft: 6, fontSize: 10, color: COLORS.amber }}>⏳</span>
              )}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div className="content-area">
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
        <div className="footer">
          <span>RSF with Bootstrap-Based Resampling · SurvSHAP(t)</span>
          <span>For research/educational use only — not a clinical decision tool</span>
        </div>
      </div>
    </div>
  );
}
