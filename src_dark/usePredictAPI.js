import { useState, useCallback } from "react";

const API_BASE = "http://127.0.0.1:5000";

export function usePredictAPI() {
  const [result,      setResult]      = useState(null);   // prediction result
  const [shapResult,  setShapResult]  = useState(null);   // shap result (separate call)
  const [loading,     setLoading]     = useState(false);  // /predict loading
  const [shapLoading, setShapLoading] = useState(false);  // /predict/shap loading
  const [error,       setError]       = useState(null);

  // ── Fast prediction (called on every Predict button click) ──────────────────
  const predict = useCallback(async (patient) => {
    setLoading(true);
    setError(null);
    setShapResult(null); // clear old SHAP when patient changes

    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(patient),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Slow SHAP call (called only when user opens SHAP tab) ───────────────────
  const predictWithShap = useCallback(async (patient) => {
    setShapLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/predict/shap`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(patient),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);                          // also updates prediction result
      setShapResult(data.shap);
    } catch (e) {
      setError(e.message);
    } finally {
      setShapLoading(false);
    }
  }, []);

  // Derived risk color + group (same thresholds as Flask)
  const riskColor =
    !result ? "#7F8C8D"
    : result.risk_class === "HIGH RISK"   ? "#C0392B"
    : result.risk_class === "MEDIUM RISK" ? "#F39C12"
    : "#2980B9";

  const riskGroup =
    !result ? null
    : result.risk_class === "HIGH RISK"   ? "HIGH"
    : result.risk_class === "MEDIUM RISK" ? "MODERATE"
    : "LOW";

  // risk5 / surv5 as 0-1 decimals (for RiskGauge + existing components)
  const risk5 = result ? result.risk_7yr  / 100 : null;
  const surv5 = result ? result.surv_7yr  / 100 : null;

  return {
    result,
    shapResult,
    loading,
    shapLoading,
    error,
    predict,
    predictWithShap,
    // convenience
    risk5,
    surv5,
    riskColor,
    riskGroup,
  };
}