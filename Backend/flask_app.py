"""
Flask API — Cardiac Death Risk Predictor
Converted from Streamlit app.py — same model loading, scaling, prediction,
and SurvSHAP(t) logic. Exposes two endpoints:
  POST /predict       → survival prediction (fast, ~1s)
  POST /predict/shap  → prediction + SurvSHAP(t) (slow, ~30-60s)
"""

import os, json, time, warnings
warnings.filterwarnings("ignore")

import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Allow React on localhost:3000

# ── Feature constants (must match training exactly) ────────────────────────────
FEATURES_18 = [
    "Gender", "Age", "Angina", "Previous_CABG", "Previous_PCI",
    "PMI", "AMI", "LVEF", "Ischemia", "Post_IDC",
    "Smoke", "Diabetes", "Hypertension", "Dyslipidemia",
    "AF", "Creatinina", "Angiography", "Vessels"
]
FEATURE_LABELS = [
    "Gender", "Age", "Angina", "Prev. CABG", "Prev. PCI",
    "Prev. MI", "Acute MI", "LVEF", "Ischemia", "Post IDC",
    "Smoke", "Diabetes", "Hypertension", "Dyslipidemia",
    "Atrial Fib.", "Creatinine", "Angiography", "Vessels"
]
CONTINUOUS_FEATURES = ["Age", "LVEF", "Vessels", "Creatinina"]
CONT_IDX            = [FEATURES_18.index(f) for f in CONTINUOUS_FEATURES]
HORIZON             = 7.0
ROC_THRESHOLD       = 0.2610  # Youden-optimal from Temporal Prognosis notebook

# ── Model paths (set env vars or place files in ./models & ./processed) ────────
MODELS_DIR    = os.environ.get("MODELS_DIR",    "models")
PROCESSED_DIR = os.environ.get("PROCESSED_DIR", "processed")

# ── Load assets once at startup ────────────────────────────────────────────────
print("Loading models…")
rsf_bb = joblib.load(os.path.join(MODELS_DIR, "rsf_bb.pkl"), mmap_mode='r')
scaler = joblib.load(os.path.join(MODELS_DIR, "scaler.pkl"))

# Background data for SurvSHAP (50 rows, same as Streamlit)
df_train = pd.read_csv(os.path.join(PROCESSED_DIR, "train_processed.csv"))
X_train  = df_train[FEATURES_18].values.astype(float)
rng      = np.random.RandomState(42)
bg_idx   = rng.choice(len(X_train), size=min(50, len(X_train)), replace=False)
bg_data  = pd.DataFrame(X_train[bg_idx], columns=FEATURE_LABELS)

print("✅ Models loaded.")


# ── Helpers (identical logic to Streamlit app) ─────────────────────────────────

def scale_patient(raw_values: np.ndarray) -> np.ndarray:
    """Scale only continuous columns — same as Streamlit scale_patient()."""
    x = raw_values.copy().astype(float)
    x[CONT_IDX] = scaler.transform(x[CONT_IDX].reshape(1, -1)).flatten()
    return x


def predict_patient(x_scaled: np.ndarray) -> dict:
    """Run RSF prediction and return serialisable dict."""
    X = x_scaled.reshape(1, -1)
    surv_fn    = rsf_bb.predict_survival_function(X)[0]
    cum_haz    = rsf_bb.predict_cumulative_hazard_function(X)[0]
    risk_score = rsf_bb.predict(X)[0]

    # Survival at 1, 3, 5, 7 years
    surv_at = {}
    for t in [1.0, 3.0, 5.0, HORIZON]:
        try:
            surv_at[t] = float(surv_fn(t))
        except Exception:
            surv_at[t] = None

    # Year-by-year table (1–7)
    yearly = []
    prev   = None
    for yr in range(1, int(HORIZON) + 1):
        try:
            sv = float(surv_fn(yr))
        except Exception:
            sv = None
        risk_pct = (1.0 - sv) * 100 if sv is not None else None
        # trend
        if prev is None or sv is None:
            trend = None
        else:
            delta = sv - prev
            trend = round(delta * 100, 2)
        yearly.append({"year": yr, "survival": round(sv * 100, 2) if sv else None,
                        "risk": round(risk_pct, 2) if risk_pct else None,
                        "trend": trend})
        prev = sv

    surv_7yr   = surv_at.get(HORIZON)
    risk_7yr   = (1.0 - surv_7yr) if surv_7yr is not None else None

    # Risk classification
    if surv_7yr is None:
        risk_class = "UNKNOWN"
    elif surv_7yr <= ROC_THRESHOLD:
        risk_class = "HIGH RISK"
    elif surv_7yr <= 0.60:
        risk_class = "MEDIUM RISK"
    else:
        risk_class = "LOW RISK"

    # Full survival curve for chart (200 points)
    t_pts  = np.linspace(0.01, HORIZON + 1, 200)
    try:
        s_curve  = [{"t": round(t, 3), "s": round(float(surv_fn(t)), 4)} for t in t_pts]
        ch_curve = [{"t": round(t, 3), "h": round(float(cum_haz(t)), 4)} for t in t_pts]
    except Exception:
        s_curve  = [{"t": round(float(x), 3), "s": round(float(y), 4)}
                    for x, y in zip(surv_fn.x, surv_fn.y)]
        ch_curve = [{"t": round(float(x), 3), "h": round(float(y), 4)}
                    for x, y in zip(cum_haz.x, cum_haz.y)]

    return {
        "risk_class":  risk_class,
        "risk_7yr":    round(risk_7yr  * 100, 2) if risk_7yr  is not None else None,
        "surv_7yr":    round(surv_7yr  * 100, 2) if surv_7yr  is not None else None,
        "surv_1yr":    round(surv_at[1.0] * 100, 2) if surv_at.get(1.0) else None,
        "surv_3yr":    round(surv_at[3.0] * 100, 2) if surv_at.get(3.0) else None,
        "surv_5yr":    round(surv_at[5.0] * 100, 2) if surv_at.get(5.0) else None,
        "risk_score":  round(float(risk_score), 4),
        "yearly":      yearly,
        "surv_curve":  s_curve,
        "hazard_curve": ch_curve,
    }


def compute_survshap(x_scaled: np.ndarray, time_grid: np.ndarray) -> dict | None:
    """
    Compute SurvSHAP(t) for one patient — same logic as Streamlit.
    Returns dict with shap_values list + aggregated integrals.
    """
    try:
        from survshap import SurvivalModelExplainer, PredictSurvSHAP
        from sksurv.util import Surv

        n_bg = len(bg_data)
        y_bg = Surv.from_arrays(
            event=np.ones(n_bg, dtype=bool),
            time=np.ones(n_bg) * HORIZON
        )

        explainer = SurvivalModelExplainer(
            model=rsf_bb,
            data=bg_data,
            y=y_bg,
            predict_survival_function          = lambda m, X: m.predict_survival_function(X),
            predict_cumulative_hazard_function = lambda m, X: m.predict_cumulative_hazard_function(X)
        )

        patient_df = pd.DataFrame(x_scaled.reshape(1, -1), columns=FEATURE_LABELS)

        pshap = PredictSurvSHAP(
            function_type        ="sf",
            calculation_method   ="kernel",
            aggregation_method   ="integral",
            B                    =25,
            max_shap_value_inputs=512,
            random_state         =42
        )
        pshap.fit(explainer, patient_df, timestamps=time_grid)

        result = pshap.result
        NON_TIME  = {"variable_name","variable_str","aggregated_change","B",
                     "label","index","variable_value","new_observation_id"}
        time_cols = [c for c in result.columns if str(c) not in NON_TIME]

        # Build per-feature output
        features_out = []
        for _, row in result.iterrows():
            shap_curve = row[time_cols].values.astype(float).tolist()
            features_out.append({
                "feature":    row["variable_name"],
                "integral":   round(float(row["aggregated_change"]), 6),
                "direction":  "protective" if float(row["aggregated_change"]) >= 0 else "harmful",
                "shap_curve": [round(v, 6) for v in shap_curve],
            })

        # Sort by abs(integral) descending
        features_out.sort(key=lambda x: abs(x["integral"]), reverse=True)

        return {
            "timestamps": [round(float(t), 4) for t in pshap.timestamps],
            "features":   features_out,
            "error":      None
        }

    except Exception as e:
        return {"features": [], "timestamps": [], "error": str(e)}


# ── Endpoint: Fast prediction (no SHAP) ───────────────────────────────────────
@app.route("/predict", methods=["POST"])
def predict():
    """
    POST /predict
    Body (JSON): { Gender, Age, Angina, Previous_CABG, Previous_PCI,
                   PMI, AMI, LVEF, Ischemia, Post_IDC, Smoke, Diabetes,
                   Hypertension, Dyslipidemia, AF, Creatinina, Angiography, Vessels }
    Returns: prediction result (risk class, survival probs, curves)
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body received"}), 400

        # Build raw feature vector in correct order
        raw_values = np.array(
            [float(data[f]) for f in FEATURES_18],
            dtype=float
        )

        x_scaled = scale_patient(raw_values)
        result   = predict_patient(x_scaled)
        return jsonify(result)

    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Endpoint: Prediction + SurvSHAP (slow ~30-60s) ────────────────────────────
@app.route("/predict/shap", methods=["POST"])
def predict_with_shap():
    """
    POST /predict/shap
    Same body as /predict.
    Returns: prediction result + shap.features + shap.timestamps
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON body received"}), 400

        raw_values = np.array(
            [float(data[f]) for f in FEATURES_18],
            dtype=float
        )

        x_scaled = scale_patient(raw_values)

        # Prediction
        result = predict_patient(x_scaled)

        # SurvSHAP
        time_grid = np.linspace(0.1, HORIZON - 0.1, 50)
        t0        = time.time()
        shap_out  = compute_survshap(x_scaled, time_grid)
        result["shap"]         = shap_out
        result["shap_elapsed"] = round(time.time() - t0, 2)

        return jsonify(result)

    except KeyError as e:
        return jsonify({"error": f"Missing field: {e}"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ── Health check ───────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": "rsf_bb", "horizon": HORIZON})


# if __name__ == "__main__":
#     app.run(debug=True, port=5000)

if __name__ == '__main__':
    # Keep debug mode on, but stop it from auto-restarting on file saves
    app.run(debug=True, use_reloader=False)