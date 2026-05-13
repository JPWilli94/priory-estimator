import { useState, useEffect } from "react";

const EMAILJS_SERVICE_ID  = "service_2mp4ist";
const EMAILJS_TEMPLATE_ID = "template_4l4phuh";
const EMAILJS_PUBLIC_KEY  = "YREjE4LN9Cwe8Sqll";

// ─── Pricing Data — Three-component structure (all inc. VAT) ─────────────────
// Product costs per m² (varies by brand/range)
const productCosts = {
  "Amtico": {
    "First Woods/Stones":        { cost: 32, tier: 1, installType: "ws" },
    "First Laying Parquet":      { cost: 41, tier: 1, installType: "lp" },
    "Spacia Woods/Stones":       { cost: 47, tier: 2, installType: "ws" },
    "Spacia Laying Patterns":    { cost: 49, tier: 2, installType: "lp" },
    "Form Woods/Stones":         { cost: 66, tier: 3, installType: "ws" },
    "Form Laying Patterns":      { cost: 68, tier: 3, installType: "lp" },
    "Signature Woods/Stones":    { cost: 77, tier: 4, installType: "ws" },
    "Signature Laying Patterns": { cost: 79, tier: 4, installType: "lp_premium" },
  },
  "Karndean": {
    "Knight Tile Woods/Stones":       { cost: 32, tier: 1, installType: "ws" },
    "Knight Tile Parquet":            { cost: 37, tier: 1, installType: "lp" },
    "Van Gogh Woods/Stones":          { cost: 45, tier: 2, installType: "ws" },
    "Van Gogh Parquet/Herringbone":   { cost: 45, tier: 2, installType: "lp" },
    "Art Select Woods/Stones":        { cost: 62, tier: 3, installType: "ws" },
    "Art Select Parquet/Random Tile": { cost: 70, tier: 3, installType: "lp" },
    "Art Select Basketweave":         { cost: 87, tier: 3, installType: "lp_premium" },
  },
  "Invictus": {
    "Primus Woods/Stones":         { cost: 30, tier: 1, installType: "ws" },
    "Primus Parquet":              { cost: 36, tier: 1, installType: "lp" },
    "Maximus Woods/Stones":        { cost: 39, tier: 2, installType: "ws" },
    "Maximus Parquet/Herringbone": { cost: 44, tier: 2, installType: "lp" },
    "Ultimus Woods":               { cost: 50, tier: 3, installType: "ws" },
    "Ultimus Parquet/Herringbone": { cost: 55, tier: 3, installType: "lp" },
  },
  "J2": {
    "Natural Timbers Woods/Stones": { cost: 37, tier: 2, installType: "ws" },
    "Natural Timbers Parquet":      { cost: 42, tier: 2, installType: "lp" },
  },
};

// Subfloor materials costs per m² (same across all brands)
const materialsCosts = {
  screed:               19,
  gf_ply_screed:        33,
  upstairs_ply_feather: 22,
  grind_dpm_screed:     36,
  dpm_sandwich:         49,
};

// Installation labour costs per m² by install type and scenario
// ws = Woods/Stones, lp = Laying Pattern, lp_premium = Art Select Basketweave / Signature Laying Patterns
const labourCosts = {
  ws: {
    screed: 19, gf_ply_screed: 26, upstairs_ply_feather: 23, grind_dpm_screed: 24, dpm_sandwich: 26,
  },
  lp: {
    screed: 30, gf_ply_screed: 37, upstairs_ply_feather: 34, grind_dpm_screed: 35, dpm_sandwich: 37,
  },
  lp_premium: {
    screed: 35, gf_ply_screed: 42, upstairs_ply_feather: 39, grind_dpm_screed: 40, dpm_sandwich: 42,
  },
};

const MIN_INSTALL_CHARGE = 150;

const confidenceMultipliers = {
  high:   { low: 0.98, high: 1.05 },
  medium: { low: 0.95, high: 1.10 },
  low:    { low: 0.90, high: 1.30 },
};

const VOLUME_DISCOUNT_THRESHOLD = 50;
const VOLUME_DISCOUNT_RATE = 0.05;

const scenarioLabels = {
  gf_ply_screed:        "Timber Subfloor Preparation (Ground Floor)",
  upstairs_ply_feather: "Timber Subfloor Preparation (Upstairs)",
  mixed_wood:           "Mixed Timber Subfloor Preparation",
  grind_dpm_screed:     "Concrete Subfloor Preparation (New Build)",
  dpm_sandwich:         "Concrete Subfloor Preparation (Pre 1970)",
  screed:               "Concrete Subfloor Preparation (Post 1970)",
  mixed_concrete:       "Mixed Subfloor Preparation",
  mixed_concrete_age:   "Mixed Concrete Subfloor Preparation",
};

const scenarioDescriptions = {
  gf_ply_screed: `Materials supplied include:\n\n• Plywood to provide a suitable base over the existing timber subfloor.\n• Primer suitable for use prior to the application of levelling compounds.\n• Flexible smoothing compound to provide a stable, reinforced and level surface suitable for LVT installation.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  upstairs_ply_feather: `Materials supplied include:\n\n• Plywood to provide a suitable base over the existing timber subfloor.\n• Feather finishing compound for minor surface preparation and smoothing.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  mixed_wood: `Materials supplied include:\n\n• Plywood to provide a suitable base over the existing timber subfloor.\n• Primer and/or feather finishing compound as required for each floor level.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  grind_dpm_screed: `Materials supplied include:\n\n• Abrasive consumables for the mechanical scarification of the existing subfloor to remove surface contaminants and provide a suitable key.\n• Rapid drying waterproof surface membrane for the control of residual moisture.\n• Smoothing compound to provide a smooth, level surface suitable for LVT installation.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  dpm_sandwich: `Materials supplied include:\n\n• Base smoothing compound to regulate the subfloor and provide a suitable surface prior to application of the damp proof membrane.\n• Epoxy resin damp proof membrane for the control of residual moisture.\n• Grip primer suitable for application over cured epoxy DPM to promote adhesion of levelling compounds.\n• Smoothing compound to provide a smooth, level surface suitable for LVT installation.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  screed: `Materials supplied include:\n\n• Primer suitable for use prior to the application of levelling compounds.\n• Smoothing compound to provide a smooth, level surface suitable for LVT installation.\n• Recommended LVT adhesive for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  mixed_concrete_age: `Materials supplied include:\n\n• Base smoothing compound and epoxy resin damp proof membrane as required.\n• Grip primer suitable for application over cured epoxy DPM.\n• Abrasive consumables for mechanical scarification where required.\n• Rapid drying waterproof surface membrane where required.\n• Smoothing compound to provide a smooth, level surface suitable for LVT installation.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
  mixed_concrete: `Materials supplied include:\n\n• Plywood or appropriate subfloor preparation materials as required.\n• Damp proof membrane and/or smoothing compounds as required for each subfloor type.\n• Recommended LVT adhesive suitable for the installation of LVT flooring.\n\nAll materials supplied in accordance with manufacturer recommendations.`,
};

function deriveScenario({ subfloor_type, floor_level, is_new_build, property_age }) {
  if (subfloor_type === "wood") {
    if (floor_level === "mixed")    return { scenario: "mixed_wood",           confidence: "medium" };
    if (floor_level === "upstairs") return { scenario: "upstairs_ply_feather", confidence: "high" };
    return                                 { scenario: "gf_ply_screed",         confidence: "high" };
  }
  if (subfloor_type === "concrete") {
    if (is_new_build)                      return { scenario: "grind_dpm_screed",  confidence: "high" };
    if (property_age === "pre_1970")       return { scenario: "dpm_sandwich",      confidence: "high" };
    if (property_age === "post_1970")      return { scenario: "screed",            confidence: "high" };
    if (property_age === "mixed_age")      return { scenario: "mixed_concrete_age", confidence: "medium" };
  }
  if (subfloor_type === "mixed")    return { scenario: "mixed_concrete",      confidence: "low" };
  return { scenario: "dpm_sandwich", confidence: "low" };
}

// Helper: get total per m² for a given scenario and install type
function getScenarioRate(scenario, installType) {
  const materials = materialsCosts[scenario] ?? 19;
  const labour = labourCosts[installType]?.[scenario] ?? 19;
  return { materials, labour };
}

function calculateEstimate({ room_size_m2, product_brand, product_range, subfloor_type, floor_level, is_new_build, property_age, mix_floor, mix_subfloor, mix_concrete_age }) {
  const { scenario, confidence } = deriveScenario({ subfloor_type, floor_level, is_new_build, property_age });
  const rangeData = productCosts[product_brand]?.[product_range];
  const productCost = rangeData?.cost ?? 40;
  const installType = rangeData?.installType ?? "ws";
  const area = parseFloat(room_size_m2);
  const m = confidenceMultipliers[confidence];
  const volumeDiscount = area > VOLUME_DISCOUNT_THRESHOLD ? (1 - VOLUME_DISCOUNT_RATE) : 1;

  let materialsPerM2, labourPerM2;

  if (scenario === "mixed_wood") {
    const upPct = (mix_floor ?? 50) / 100;
    const gf = getScenarioRate("gf_ply_screed", installType);
    const up = getScenarioRate("upstairs_ply_feather", installType);
    materialsPerM2 = (materialsCosts.gf_ply_screed * (1 - upPct)) + (materialsCosts.upstairs_ply_feather * upPct);
    labourPerM2 = (gf.labour * (1 - upPct)) + (up.labour * upPct);
  } else if (scenario === "mixed_concrete") {
    const concPct = (mix_subfloor ?? 50) / 100;
    const avgWoodMat = (materialsCosts.gf_ply_screed + materialsCosts.upstairs_ply_feather) / 2;
    const avgWoodLab = (labourCosts[installType].gf_ply_screed + labourCosts[installType].upstairs_ply_feather) / 2;
    materialsPerM2 = (avgWoodMat * (1 - concPct)) + (materialsCosts.dpm_sandwich * concPct);
    labourPerM2 = (avgWoodLab * (1 - concPct)) + (labourCosts[installType].dpm_sandwich * concPct);
  } else if (scenario === "mixed_concrete_age") {
    const newerPct = (mix_concrete_age ?? 50) / 100;
    const olderPct = 1 - newerPct;
    materialsPerM2 = (materialsCosts.dpm_sandwich * olderPct) + (materialsCosts.grind_dpm_screed * newerPct * 0.5) + (materialsCosts.screed * newerPct * 0.5);
    labourPerM2 = (labourCosts[installType].dpm_sandwich * olderPct) + (labourCosts[installType].grind_dpm_screed * newerPct * 0.5) + (labourCosts[installType].screed * newerPct * 0.5);
  } else {
    materialsPerM2 = materialsCosts[scenario] ?? 19;
    labourPerM2 = labourCosts[installType]?.[scenario] ?? 19;
  }

  // Calculate components
  const totalProduct   = productCost * area;
  const totalMaterials = materialsPerM2 * area;
  const rawLabour      = labourPerM2 * area;
  const totalLabour    = Math.max(rawLabour, MIN_INSTALL_CHARGE);

  // Total before confidence
  const subtotal = (totalProduct + totalMaterials + totalLabour) * volumeDiscount;

  let total_low  = Math.round(subtotal * m.low);
  let total_high = Math.round(subtotal * m.high);

  return { scenario, confidence, total_low, total_high };
}

// ─── Design tokens — from logo: teal #3dbcb4, charcoal #1e2427, white ─────────
const C = {
  teal:        "#3dbcb4",
  tealDark:    "#2ea39c",
  tealLight:   "#e8f8f7",
  charcoal:    "#1e2427",
  charcoalMid: "#3a4448",
  text:        "#1e2427",
  muted:       "#6b7c80",
  border:      "#dde3e4",
  bg:          "#f4f6f6",
  card:        "#ffffff",
  inputBg:     "#f9fafa",
};

const steps = ["Area", "Product", "Subfloor", "Contact", "Estimate"];

const roomOptions = [
  "Kitchen",
  "Living Room",
  "Hallway",
  "Landing",
  "Bathroom",
  "Bedroom",
  "Dining Room",
  "Utility Room",
  "Conservatory",
  "Study",
  "Commercial / Office",
  "Other",
];

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({ current }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {steps.map((_, i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 2,
            background: i < current ? C.teal : i === current ? C.charcoal : C.border,
            transition: "background 0.3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {steps.map((label, i) => (
          <span key={label} style={{
            fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
            fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
            color: i === current ? C.charcoal : i < current ? C.teal : "#bbb",
          }}>{label}</span>
        ))}
      </div>
    </div>
  );
}

function Label({ children }) {
  return (
    <label style={{
      display: "block", fontSize: 11, letterSpacing: "0.12em",
      textTransform: "uppercase", color: C.muted,
      fontFamily: "'Montserrat', sans-serif", fontWeight: 600, marginBottom: 8,
    }}>{children}</label>
  );
}

function Input({ value, onChange, type = "text", placeholder, min }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type} value={value} min={min} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%", background: C.inputBg,
        border: `1.5px solid ${focused ? C.teal : C.border}`,
        borderRadius: 6, color: C.text,
        fontFamily: "'Montserrat', sans-serif", fontSize: 15,
        padding: "12px 14px", outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s",
      }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", background: C.inputBg,
          border: `1.5px solid ${focused ? C.teal : C.border}`,
          borderRadius: 6, color: value ? C.text : C.muted,
          fontFamily: "'Montserrat', sans-serif", fontSize: 15,
          padding: "12px 40px 12px 14px", outline: "none", boxSizing: "border-box",
          appearance: "none", cursor: "pointer", transition: "border-color 0.2s",
        }}
      >
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <div style={{
        position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
        pointerEvents: "none", color: C.muted, fontSize: 11,
      }}>▼</div>
    </div>
  );
}

function OptionCard({ label, sub, selected, onClick }) {
  return (
    <div onClick={onClick} style={{
      border: `1.5px solid ${selected ? C.teal : C.border}`,
      borderRadius: 8, padding: "14px 16px", cursor: "pointer",
      background: selected ? C.tealLight : C.inputBg,
      transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
        border: `2px solid ${selected ? C.teal : C.border}`,
        background: selected ? C.teal : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
      </div>
      <div>
        <div style={{ color: C.charcoal, fontSize: 14, fontFamily: "'Montserrat', sans-serif", fontWeight: selected ? 600 : 400 }}>{label}</div>
        {sub && <div style={{ color: C.muted, fontSize: 12, fontFamily: "'Montserrat', sans-serif", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function Btn({ onClick, disabled, children, secondary }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: secondary ? "transparent" : disabled ? "#c8d4d5" : hov ? C.tealDark : C.teal,
        color: secondary ? C.muted : disabled ? "#8fa6a8" : "#fff",
        border: secondary ? `1.5px solid ${C.border}` : "none",
        borderRadius: 6, padding: "13px 28px",
        fontFamily: "'Montserrat', sans-serif", fontSize: 12,
        letterSpacing: "0.1em", textTransform: "uppercase",
        cursor: disabled ? "not-allowed" : "pointer",
        fontWeight: 700, transition: "all 0.2s",
      }}
    >{children}</button>
  );
}

function MixSlider({ leftLabel, rightLabel, value, onChange }) {
  return (
    <div style={{ marginTop: 16, marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontFamily: "'Montserrat', sans-serif", color: C.charcoal, fontWeight: 600 }}>
          {leftLabel}: <span style={{ color: C.teal }}>{100 - value}%</span>
        </span>
        <span style={{ fontSize: 12, fontFamily: "'Montserrat', sans-serif", color: C.charcoal, fontWeight: 600 }}>
          {rightLabel}: <span style={{ color: C.teal }}>{value}%</span>
        </span>
      </div>
      <input
        type="range" min="0" max="100" step="5" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: C.teal, cursor: "pointer" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Montserrat', sans-serif" }}>100% {leftLabel}</span>
        <span style={{ fontSize: 10, color: C.muted, fontFamily: "'Montserrat', sans-serif" }}>100% {rightLabel}</span>
      </div>
    </div>
  );
}
const sh = { fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 700, color: C.charcoal, margin: "0 0 6px 0", letterSpacing: "-0.01em" };
const sp = { fontFamily: "'Montserrat', sans-serif", fontSize: 14, color: C.muted, margin: "0 0 28px 0", lineHeight: 1.6, fontWeight: 400 };

// ─── Steps ────────────────────────────────────────────────────────────────────
function StepRoom({ data, setData, onNext }) {
  const area = parseFloat(data.room_size_m2);
  const validArea = area >= 1;
  const validRooms = (data.rooms ?? []).length > 0;
  const valid = validArea && validRooms;
  const isLarge = area > 100;

  const toggleRoom = (room) => {
    setData(d => {
      const current = d.rooms ?? [];
      return { ...d, rooms: current.includes(room) ? current.filter(r => r !== room) : [...current, room] };
    });
  };

  return (
    <div>
      <h2 style={sh}>What's the total area?</h2>
      <p style={sp}>Enter the total floor area you need covered — this can span more than one room.</p>
      <div style={{ marginBottom: 16 }}>
        <Label>Total area (m²)</Label>
        <Input type="number" min="1" value={data.room_size_m2}
          onChange={v => setData(d => ({ ...d, room_size_m2: v }))} placeholder="e.g. 25" />
      </div>
      {isLarge && (
        <div style={{
          background: "#fff8e6", border: "1.5px solid #f0c040",
          borderRadius: 8, padding: "12px 16px", marginBottom: 16,
          fontSize: 13, color: "#7a5c00", fontFamily: "'Montserrat', sans-serif", lineHeight: 1.6,
        }}>
          <strong>Large area detected.</strong> For areas over 100m² we recommend calling us directly on <strong>01926 833 363</strong> for a more tailored estimate. You're welcome to continue if you'd like a rough guide.
        </div>
      )}

      <div style={{ marginBottom: 20 }}>
        <Label>Which room(s)? (select all that apply)</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {roomOptions.map(room => {
            const selected = (data.rooms ?? []).includes(room);
            return (
              <div key={room} onClick={() => toggleRoom(room)} style={{
                padding: "8px 14px", borderRadius: 20, cursor: "pointer",
                border: `1.5px solid ${selected ? C.teal : C.border}`,
                background: selected ? C.tealLight : C.inputBg,
                fontSize: 12, fontFamily: "'Montserrat', sans-serif",
                fontWeight: selected ? 600 : 400, color: C.charcoal,
                transition: "all 0.2s",
              }}>
                {selected && <span style={{ color: C.teal, marginRight: 5 }}>✓</span>}
                {room}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ textAlign: "right" }}>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
}

function StarRating({ tier }) {
  return (
    <span style={{ color: C.teal, fontSize: 12, letterSpacing: 1 }}>
      {"★".repeat(tier)}{"☆".repeat(4 - tier)}
    </span>
  );
}

function StepProduct({ data, setData, onNext, onBack }) {
  const brands = Object.keys(productCosts);
  const ranges = data.product_brand ? Object.keys(productCosts[data.product_brand]) : [];
  const valid = data.product_brand && data.product_range;
  return (
    <div>
      <h2 style={sh}>Choose your product</h2>
      <p style={sp}>Select the brand and range you're interested in.</p>
      <div style={{ marginBottom: 20 }}>
        <Label>Brand</Label>
        <Select value={data.product_brand}
          onChange={v => setData(d => ({ ...d, product_brand: v, product_range: "" }))}
          options={brands.map(b => ({ value: b, label: b }))} placeholder="Select brand…" />
      </div>
      {data.product_brand && (
        <div style={{ marginBottom: 24 }}>
          <Label>Range</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ranges.map(r => {
              const tier = productCosts[data.product_brand][r].tier;
              const selected = data.product_range === r;
              return (
                <div key={r} onClick={() => setData(d => ({ ...d, product_range: r }))} style={{
                  border: `1.5px solid ${selected ? C.teal : C.border}`,
                  borderRadius: 8, padding: "12px 16px", cursor: "pointer",
                  background: selected ? C.tealLight : C.inputBg,
                  transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                      border: `2px solid ${selected ? C.teal : C.border}`,
                      background: selected ? C.teal : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.2s",
                    }}>
                      {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ color: C.charcoal, fontSize: 14, fontFamily: "'Montserrat', sans-serif", fontWeight: selected ? 600 : 400 }}>{r}</span>
                  </div>
                  <StarRating tier={tier} />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {data.product_brand && (
        <div style={{ fontSize: 11, color: C.muted, fontFamily: "'Montserrat', sans-serif", marginBottom: 24, display: "flex", gap: 16 }}>
          <span>★ Entry level</span>
          <span>★★ Mid range</span>
          <span>★★★ Upper mid</span>
          <span>★★★★ Premium</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn onClick={onBack} secondary>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
}

function StepSubfloor({ data, setData, onNext, onBack }) {
  const valid = data.subfloor_type && (
    data.subfloor_type === "mixed" ||
    (data.subfloor_type === "wood" && data.floor_level) ||
    (data.subfloor_type === "concrete" && (data.is_new_build || data.property_age))
  );
  return (
    <div>
      <h2 style={sh}>Tell us about the subfloor</h2>
      <p style={sp}>This helps us estimate preparation costs accurately. The type of subfloor affects the preparation work required, which is included in your estimate.</p>

      <div style={{ marginBottom: 20 }}>
        <Label>Subfloor type</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { value: "wood",     label: "Timber / Wood",  sub: "Floorboards or chipboard" },
            { value: "concrete", label: "Concrete",       sub: "Solid concrete slab" },
            { value: "mixed",    label: "Mixed",          sub: "Combination of timber and concrete" },
          ].map(o => (
            <OptionCard key={o.value} label={o.label} sub={o.sub}
              selected={data.subfloor_type === o.value}
              onClick={() => setData(d => ({ ...d, subfloor_type: o.value, floor_level: "", is_new_build: false, property_age: "" }))} />
          ))}
        </div>
      </div>

      {data.subfloor_type === "wood" && (
        <div style={{ marginBottom: 20 }}>
          <Label>Which floor level?</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { value: "ground",   label: "Ground Floor" },
              { value: "upstairs", label: "Upstairs" },
              { value: "mixed",    label: "Mixed", sub: "Combination of ground floor and upstairs" },
            ].map(o => (
              <OptionCard key={o.value} label={o.label} sub={o.sub} selected={data.floor_level === o.value}
                onClick={() => setData(d => ({ ...d, floor_level: o.value }))} />
            ))}
          </div>
          {data.floor_level === "mixed" && (
            <MixSlider
              leftLabel="Ground Floor" rightLabel="Upstairs"
              value={data.mix_floor ?? 50}
              onChange={v => setData(d => ({ ...d, mix_floor: v }))}
            />
          )}
        </div>
      )}

      {data.subfloor_type === "mixed" && (
        <div style={{ marginBottom: 20 }}>
          <MixSlider
            leftLabel="Timber" rightLabel="Concrete"
            value={data.mix_subfloor ?? 50}
            onChange={v => setData(d => ({ ...d, mix_subfloor: v }))}
          />
        </div>
      )}

      {data.subfloor_type === "concrete" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Label>Is this a new build?</Label>
            <div style={{ display: "flex", gap: 10 }}>
              {[{ value: true, label: "Yes" }, { value: false, label: "No" }].map(o => (
                <div key={String(o.value)} style={{ flex: 1 }}>
                  <OptionCard label={o.label} selected={data.is_new_build === o.value}
                    onClick={() => setData(d => ({ ...d, is_new_build: o.value, property_age: o.value ? "" : d.property_age }))} />
                </div>
              ))}
            </div>
          </div>
          {!data.is_new_build && (
            <div style={{ marginBottom: 20 }}>
              <Label>Property age</Label>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { value: "pre_1970",  label: "Before 1970" },
                  { value: "post_1970", label: "1970 or later" },
                  { value: "mixed_age", label: "Mixed", sub: "e.g. older property with newer extension" },
                ].map(o => (
                  <OptionCard key={o.value} label={o.label} sub={o.sub} selected={data.property_age === o.value}
                    onClick={() => setData(d => ({ ...d, property_age: o.value }))} />
                ))}
              </div>
              {data.property_age === "mixed_age" && (
                <MixSlider
                  leftLabel="Pre-1970" rightLabel="Newer"
                  value={data.mix_concrete_age ?? 50}
                  onChange={v => setData(d => ({ ...d, mix_concrete_age: v }))}
                />
              )}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <Btn onClick={onBack} secondary>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
      </div>
    </div>
  );
}

function StepContact({ data, setData, onNext, onBack }) {
  const isValidName     = data.name.trim().split(" ").filter(w => w.length > 0).length >= 2;
  const isValidEmail    = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email);
  const isValidPhone    = /^0\d{10}$/.test(data.phone.replace(/\s/g, ""));
  const isValidPostcode = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(data.postcode.trim());
  const valid = isValidName && isValidEmail && isValidPhone && isValidPostcode && data.dataConsent;
  return (
    <div>
      <h2 style={sh}>Almost there</h2>
      <p style={sp}>Enter your details to view your estimate. We'll send a copy to your email for your records.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
        <div>
          <Label>Full name</Label>
          <Input value={data.name} onChange={v => setData(d => ({ ...d, name: v }))} placeholder="Jane Smith" />
          {data.name.length > 0 && !isValidName && <p style={{ fontSize: 11, color: "#c0392b", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>Please enter your first and last name</p>}
        </div>
        <div>
          <Label>Email address</Label>
          <Input value={data.email} onChange={v => setData(d => ({ ...d, email: v }))} placeholder="jane@example.com" />
          {data.email.length > 0 && !isValidEmail && <p style={{ fontSize: 11, color: "#c0392b", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>Please enter a valid email address</p>}
        </div>
        <div>
          <Label>Phone number</Label>
          <Input value={data.phone} onChange={v => setData(d => ({ ...d, phone: v }))} placeholder="07700 900000" />
          {data.phone.length > 0 && !isValidPhone && <p style={{ fontSize: 11, color: "#c0392b", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>Please enter a valid UK phone number starting with 0</p>}
        </div>
        <div>
          <Label>Postcode</Label>
          <Input value={data.postcode} onChange={v => setData(d => ({ ...d, postcode: v }))} placeholder="CV32 4AB" />
          {data.postcode.length > 0 && !isValidPostcode && <p style={{ fontSize: 11, color: "#c0392b", fontFamily: "'Montserrat', sans-serif", marginTop: 4 }}>Please enter a valid UK postcode</p>}
        </div>
      </div>
      <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div onClick={() => setData(d => ({ ...d, dataConsent: !d.dataConsent }))} style={{
          display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${data.dataConsent ? C.teal : C.border}`,
            background: data.dataConsent ? C.teal : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {data.dataConsent && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: C.charcoal, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5 }}>
            I consent to Priory Carpets & Flooring processing my data to provide this estimate and contact me regarding my enquiry. <span style={{ color: "#c0392b" }}>*</span>
          </span>
        </div>
        <div onClick={() => setData(d => ({ ...d, marketing: !d.marketing }))} style={{
          display: "flex", alignItems: "flex-start", gap: 12, cursor: "pointer",
        }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4, flexShrink: 0, marginTop: 1,
            border: `1.5px solid ${data.marketing ? C.teal : C.border}`,
            background: data.marketing ? C.teal : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {data.marketing && <span style={{ color: "#fff", fontSize: 13, lineHeight: 1 }}>✓</span>}
          </div>
          <span style={{ fontSize: 12, color: C.muted, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.5 }}>
            I'm happy to receive occasional marketing communications from Priory Carpets & Flooring. You can unsubscribe at any time.
          </span>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'Montserrat', sans-serif", marginBottom: 24, lineHeight: 1.6 }}>
        Your details are used solely to send your estimate and arrange a survey. We do not share your data.
      </p>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Btn onClick={onBack} secondary>← Back</Btn>
        <Btn onClick={onNext} disabled={!valid}>View Estimate →</Btn>
      </div>
    </div>
  );
}

const confBadge = {
  high:   { label: "High Confidence",   bg: "#e6f6f0", color: "#2a7a52", border: "#a8dfc5" },
  medium: { label: "Medium Confidence", bg: "#fef6e6", color: "#8a6010", border: "#f0d080" },
  low:    { label: "Lower Confidence",  bg: "#fdecea", color: "#a03020", border: "#f4b0a8" },
};

function StepEstimate({ data, onRestart }) {
  const result = calculateEstimate(data);
  const badge = confBadge[result.confidence];
  const fmt = n => `£${n.toLocaleString()}`;
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const sendEmail = async () => {
      try {
        const ejs = window.emailjs;
        if (!ejs) { console.error("EmailJS not loaded"); return; }
        const subfloorLabel = scenarioLabels[result.scenario] ?? result.scenario;
        await ejs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          name:          data.name,
          message:       `New LVT estimate lead from ${data.name}`,
          from_name:     data.name,
          from_email:    data.email,
          phone:         data.phone,
          postcode:      data.postcode,
          product:       `${data.product_brand} – ${data.product_range}`,
          area:          data.room_size_m2,
          rooms:         (data.rooms ?? []).join(", "),
          estimate_low:  fmt(result.total_low),
          estimate_high: fmt(result.total_high),
          subfloor:      subfloorLabel,
          marketing:     data.marketing ? "Yes — opted in" : "No — not opted in",
        }, EMAILJS_PUBLIC_KEY);
        setEmailSent(true);
        console.log("Email sent successfully");
      } catch (err) {
        console.error("EmailJS error:", err);
      }
    };
    sendEmail();
  }, []);

  return (
    <div>
      {/* Estimate hero */}
      <div style={{ background: C.charcoal, borderRadius: 10, padding: "24px 22px", marginBottom: 20 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.teal, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, marginBottom: 10 }}>
          Total Project Estimate (inc. VAT)
        </div>
        <div style={{ fontSize: 34, fontFamily: "'Montserrat', sans-serif", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 16 }}>
          {fmt(result.total_low)} – {fmt(result.total_high)}
        </div>
        <div style={{ display: "inline-block", background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, borderRadius: 20, padding: "4px 12px", fontSize: 11, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          {badge.label}
        </div>
      </div>

      {/* Details */}
      <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: "18px 20px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[
            { label: "Product",    value: `${data.product_brand} – ${data.product_range}` },
            { label: "Area",       value: `${data.room_size_m2} m²` },
            { label: "Rooms",      value: (data.rooms ?? []).join(", ") || "—" },
          ].map(row => (
            <div key={row.label}>
              <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>{row.label}</div>
              <div style={{ fontSize: 13, color: C.text, fontFamily: "'Montserrat', sans-serif", fontWeight: 500 }}>{row.value}</div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
          <div style={{ fontSize: 10, color: C.muted, fontFamily: "'Montserrat', sans-serif", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>What's included</div>
          <div style={{ fontSize: 13, color: C.text, fontFamily: "'Montserrat', sans-serif", fontWeight: 400, lineHeight: 1.8 }}>
            {scenarioDescriptions[result.scenario].split("\n").map((line, i) => (
              <div key={i} style={{ marginBottom: line === "" ? 6 : 0 }}>{line}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div style={{ background: C.tealLight, border: `1.5px solid ${C.teal}55`, borderRadius: 8, padding: "14px 16px", marginBottom: 20, fontSize: 12, color: C.charcoalMid, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.7 }}>
        <strong style={{ color: C.tealDark }}>Please note:</strong> This is a budgetary estimate only and is subject to a site survey. Priory Flooring acts as an agent for the customer in arranging a suitably qualified fitter. All prices are inclusive of VAT and fitting.<br /><br />
        <strong style={{ color: C.tealDark }}>This estimate does not include:</strong> the uplift and disposal of existing floor coverings, the handling of any appliances or furniture, or any door trimming required after installation.
      </div>

      {/* Survey CTA */}
      <div style={{ background: C.charcoal, borderRadius: 10, padding: "22px 22px", marginBottom: 24 }}>
        <div style={{ fontSize: 14, color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700, marginBottom: 6 }}>Ready for an accurate price?</div>
        <div style={{ fontSize: 13, color: "#7ab0b5", fontFamily: "'Montserrat', sans-serif", marginBottom: 18, lineHeight: 1.6 }}>
          Get in touch to book your free no-obligation survey.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href="tel:01926833363" style={{ display: "flex", alignItems: "center", gap: 12, background: C.teal, borderRadius: 6, padding: "12px 16px", textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>📞</span>
            <div>
              <div style={{ fontSize: 13, color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>01926 833 363</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "'Montserrat', sans-serif" }}>Mon – Sat: 9am – 5pm</div>
            </div>
          </a>
          <a href="mailto:admin@prioryflooring.com" style={{ display: "flex", alignItems: "center", gap: 12, background: "#2e3d42", borderRadius: 6, padding: "12px 16px", textDecoration: "none" }}>
            <span style={{ fontSize: 18 }}>✉️</span>
            <div>
              <div style={{ fontSize: 13, color: "#fff", fontFamily: "'Montserrat', sans-serif", fontWeight: 700 }}>admin@prioryflooring.com</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontFamily: "'Montserrat', sans-serif" }}>We'll get back to you promptly</div>
            </div>
          </a>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button onClick={onRestart} style={{ background: "none", border: "none", color: "#aaa", fontFamily: "'Montserrat', sans-serif", fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
          New estimate — your details will be kept
        </button>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
const defaultData = {
  room_size_m2: "", product_brand: "", product_range: "",
  subfloor_type: "", floor_level: "", is_new_build: false, property_age: "",
  mix_floor: 50, mix_subfloor: 50, mix_concrete_age: 50,
  rooms: [],
  name: "", email: "", phone: "", postcode: "", dataConsent: false, marketing: false,
};

export default function PrioryEstimator() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(defaultData);
  const next    = () => setStep(s => s + 1);
  const back    = () => setStep(s => s - 1);
  const restart = () => {
    // Reset estimate fields but keep contact details
    setData(d => ({
      ...d,
      room_size_m2: "", product_brand: "", product_range: "",
      subfloor_type: "", floor_level: "", is_new_build: false, property_age: "",
      mix_floor: 50, mix_subfloor: 50, mix_concrete_age: 50,
      rooms: [],
    }));
    setStep(0);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: #fff; color: #1e2427; }
      `}</style>

      <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 500 }}>

          {/* Header — matches logo exactly */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 300, fontSize: 48, color: C.teal, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 2 }}>
              PRIORY
            </div>
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 400, fontSize: 13, color: C.charcoal, letterSpacing: "0.18em", textTransform: "uppercase", marginBottom: 20 }}>
              CARPETS &amp; FLOORING
            </div>
            <div style={{ width: 40, height: 2, background: C.teal, margin: "0 auto 14px", borderRadius: 2 }} />
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, color: C.teal, fontWeight: 600, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Luxury Vinyl Tile Estimator
            </div>
          </div>

          {/* Card */}
          <div style={{ background: C.card, borderRadius: 12, padding: "32px 28px", boxShadow: "0 4px 24px rgba(30,36,39,0.10)", border: `1px solid ${C.border}` }}>
            <ProgressBar current={step} />
            {step === 0 && <StepRoom     data={data} setData={setData} onNext={next} />}
            {step === 1 && <StepProduct  data={data} setData={setData} onNext={next} onBack={back} />}
            {step === 2 && <StepSubfloor data={data} setData={setData} onNext={next} onBack={back} />}
            {step === 3 && <StepContact  data={data} setData={setData} onNext={next} onBack={back} />}
            {step === 4 && <StepEstimate data={data} onRestart={restart} />}
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#aaa", fontFamily: "'Montserrat', sans-serif", letterSpacing: "0.04em", lineHeight: 1.9 }}>
            Priory Carpets &amp; Flooring · Leamington Spa<br />
            01926 833 363 · admin@prioryflooring.com
          </div>

        </div>
      </div>
    </>
  );
}
