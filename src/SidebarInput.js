import { COLORS } from "./constants";

const FIELDS = [
  { key: "Age",       label: "Age (years)",         type: "number", min: 1,  max: 100 },
  { key: "LVEF",      label: "LVEF (%)",             type: "number", min: 10, max: 75  },
  { key: "Creatinina",label: "Creatinine (mg/dL)",   type: "number", min: 0.5,max: 10, step: 0.1 },
  { key: "Vessels",   label: "Vessels affected",     type: "number", min: 0,  max: 5   },
];

const TOGGLES = [
  { key: "Gender",       label: "Male"         },
  { key: "Angina",       label: "Angina"       },
  { key: "PMI",          label: "Prev. MI"     },
  { key: "AMI",          label: "Acute MI"     },
  { key: "Previous_PCI", label: "Prev. PCI"   },
  { key: "Previous_CABG",label: "Prev. CABG"  },
  { key: "Smoke",        label: "Smoker"       },
  { key: "Diabetes",     label: "Diabetes"     },
  { key: "Hypertension", label: "Hypertension" },
  { key: "Dyslipidemia", label: "Dyslipidemia" },
  { key: "AF",           label: "Atrial Fib."  },
  { key: "Ischemia",     label: "Ischemia"     },
  { key: "Post_IDC",     label: "Post IDC"     },
  { key: "Angiography",  label: "Angiography"  },
];

export function SidebarInput({ patient, setPatient }) {
  return (
    <div style={{ padding: "0 0 20px 0", flex: 1, overflowY: "auto" }}>

      <div className="section-header">Patient Input</div>

      {FIELDS.map((f) => (
        <div key={f.key} style={{ marginBottom: 16 }}>
          <label className="range-label">{f.label}</label>
          <input
            type="range"
            min={f.min} max={f.max} step={f.step || 1}
            value={patient[f.key]}
            onChange={(e) =>
              setPatient((p) => ({ ...p, [f.key]: parseFloat(e.target.value) }))
            }
          />
          <div className="range-value-row">
            <span>{f.min}</span>
            <span className="current">{patient[f.key]}</span>
            <span>{f.max}</span>
          </div>
        </div>
      ))}

      <div className="section-header" style={{ marginTop: 18 }}>Risk Factors</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {TOGGLES.map((t) => {
          const on = !!patient[t.key];
          return (
            <label
              key={t.key}
              className="toggle-label"
              style={{ color: on ? COLORS.hr : COLORS.textMuted }}
            >
              <div
                className="toggle-track"
                onClick={() => setPatient((p) => ({ ...p, [t.key]: p[t.key] ? 0 : 1 }))}
                style={{ background: on ? COLORS.hr : COLORS.border }}
              >
                <div
                  className="toggle-thumb"
                  style={{ left: on ? 18 : 3 }}
                />
              </div>
              {t.label}
            </label>
          );
        })}
      </div>
    </div>
  );
}
