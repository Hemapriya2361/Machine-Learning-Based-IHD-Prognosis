const FIELDS = [
  { key: "Age",       label: "Age (years)",         type: "number", min: 1,  max: 100 },
  { key: "LVEF",      label: "LVEF (%)",             type: "number", min: 10,  max: 75  },
  { key: "Creatinina",label: "Creatinine (mg/dL)",   type: "number", min: 0.5, max: 10, step: 0.1 },
  { key: "Vessels",   label: "Vessels affected",     type: "number", min: 0,   max: 5   },
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
    <div style={{ padding: "0 0 20px 0" }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#aaa",
        letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase",
      }}>
        Patient Input
      </div>

      {FIELDS.map((f) => (
        <div key={f.key} style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "#ccc", display: "block", marginBottom: 4 }}>
            {f.label}
          </label>
          <input
            type="range"
            min={f.min} max={f.max} step={f.step || 1}
            value={patient[f.key]}
            onChange={(e) =>
              setPatient((p) => ({ ...p, [f.key]: parseFloat(e.target.value) }))
            }
            style={{ width: "100%", accentColor: "#C0392B" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888" }}>
            <span>{f.min}</span>
            <span style={{ color: "#fff", fontWeight: 700 }}>{patient[f.key]}</span>
            <span>{f.max}</span>
          </div>
        </div>
      ))}

      <div style={{
        fontSize: 11, fontWeight: 700, color: "#aaa",
        letterSpacing: 1.5, margin: "16px 0 10px", textTransform: "uppercase",
      }}>
        Risk Factors
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {TOGGLES.map((t) => (
          <label
            key={t.key}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              cursor: "pointer", fontSize: 12,
              color: patient[t.key] ? "#e74c3c" : "#888",
            }}
          >
            <div
              onClick={() => setPatient((p) => ({ ...p, [t.key]: p[t.key] ? 0 : 1 }))}
              style={{
                width: 36, height: 20, borderRadius: 10,
                background: patient[t.key] ? "#C0392B" : "#333",
                position: "relative", transition: "background 0.2s",
                flexShrink: 0, cursor: "pointer",
              }}
            >
              <div
                style={{
                  position: "absolute", top: 3,
                  left: patient[t.key] ? 18 : 3,
                  width: 14, height: 14, borderRadius: "50%",
                  background: "#fff", transition: "left 0.2s",
                }}
              />
            </div>
            {t.label}
          </label>
        ))}
      </div>
    </div>
  );
}