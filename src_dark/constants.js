export const COLORS = {
  hr: "#C0392B",
  lr: "#2980B9",
  neu: "#7F8C8D",
  gold: "#F39C12",
  green: "#27AE60",
};

export const TABS = [
  " Patient Prediction",
  " Model Performance",
  " Feature Importance (SHAP)",
  " Survival Curves",
];

export const defaultPatient = {
  Gender: 1, Age: 62, Angina: 1, Previous_CABG: 0, Previous_PCI: 1,
  PMI: 1, AMI: 0, LVEF: 38, Ischemia: 1, Post_IDC: 0,
  Smoke: 1, Diabetes: 1, Hypertension: 1, Dyslipidemia: 1,
  AF: 0, Creatinina: 1.1, Angiography: 1, Vessels: 3,
};

export const featureLabels = [
  "Gender", "Age", "Angina", "Prev. CABG", "Prev. PCI",
  "Prev. MI", "Acute MI", "LVEF", "Ischemia", "Post IDC",
  "Smoke", "Diabetes", "Hypertension", "Dyslipidemia",
  "Atrial Fib.", "Creatinine", "Angiography", "Vessels",
];

export const shapData = [
  { feature: "LVEF",         shap: 0.142,  dir: "risk" },
  { feature: "Age",          shap: 0.118,  dir: "risk" },
  { feature: "Dyslipidemia", shap: 0.095,  dir: "risk" },
  { feature: "Creatinine",   shap: 0.082,  dir: "risk" },
  { feature: "Prev. MI",     shap: 0.071,  dir: "risk" },
  { feature: "Diabetes",     shap: 0.063,  dir: "risk" },
  { feature: "Vessels",      shap: 0.055,  dir: "risk" },
  { feature: "Smoke",        shap: -0.041, dir: "protect" },
  { feature: "Hypertension", shap: 0.038,  dir: "risk" },
  { feature: "Ischemia",     shap: -0.029, dir: "protect" },
];

export const kmData = {
  hr: [
    { t: 0, s: 1.0 }, { t: 1, s: 0.81 }, { t: 2, s: 0.68 }, { t: 3, s: 0.57 },
    { t: 4, s: 0.49 }, { t: 5, s: 0.42 }, { t: 6, s: 0.37 }, { t: 7, s: 0.33 }, { t: 8, s: 0.30 },
  ],
  lr: [
    { t: 0, s: 1.0 }, { t: 1, s: 0.97 }, { t: 2, s: 0.94 }, { t: 3, s: 0.91 },
    { t: 4, s: 0.88 }, { t: 5, s: 0.85 }, { t: 6, s: 0.83 }, { t: 7, s: 0.81 }, { t: 8, s: 0.79 },
  ],
};

export const metricsData = [
  { metric: "AUROC @ 5-Year",  rsf: 0.847, cox: 0.793 },
  { metric: "Harrell C-index", rsf: 0.831, cox: 0.779 },
  { metric: "F1-Score (Macro)",rsf: 0.762, cox: 0.701 },
  { metric: "IBS (↓ better)",  rsf: 0.118, cox: 0.143 },
  { metric: "TD-AUROC @ 1yr",  rsf: 0.871, cox: 0.821 },
  { metric: "TD-AUROC @ 3yr",  rsf: 0.854, cox: 0.802 },
  { metric: "TD-AUROC @ 5yr",  rsf: 0.836, cox: 0.784 },
];

export const rocPoints = Array.from({ length: 21 }, (_, i) => {
  const fpr = i / 20;
  return {
    fpr,
    rsf: Math.min(1, Math.pow(fpr, 0.35) * 1.05),
    cox: Math.min(1, Math.pow(fpr, 0.48) * 1.02),
  };
});

export const confMatrix = {
  rsf: { tn: 521, fp: 87, fn: 64, tp: 126 },
  cox: { tn: 490, fp: 118, fn: 89, tp: 101 },
};