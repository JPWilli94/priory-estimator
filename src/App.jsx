import { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const EMAILJS_SERVICE_ID  = "service_2mp4ist";
const EMAILJS_TEMPLATE_ID = "template_nz76zgm";
const EMAILJS_PUBLIC_KEY  = "YREjE4LN9Cwe8Sqll";

// ─── Pricing Data (VAT inclusive) ─────────────────────────────────────────────
// ─── Pricing Data (VAT inclusive, product price + scenario price per m²) ──────
const pricingData = {
  "Amtico": {
    "First Woods/Stones":        { tier: 1, screed: 69.99, gf_ply_screed: 89.99, upstairs_ply_feather: 77.99, grind_dpm_screed: 90.99, dpm_sandwich: 105.99 },
    "First Laying Parquet":      { tier: 1, screed: 89.99, gf_ply_screed: 109.99, upstairs_ply_feather: 97.99, grind_dpm_screed: 110.99, dpm_sandwich: 125.99 },
    "Spacia Woods/Stones":       { tier: 2, screed: 84.99, gf_ply_screed: 104.99, upstairs_ply_feather: 92.99, grind_dpm_screed: 105.99, dpm_sandwich: 120.99 },
    "Spacia Laying Patterns":    { tier: 2, screed: 97.99, gf_ply_screed: 117.99, upstairs_ply_feather: 105.99, grind_dpm_screed: 118.99, dpm_sandwich: 133.99 },
    "Form Woods/Stones":         { tier: 3, screed: 103.99, gf_ply_screed: 123.99, upstairs_ply_feather: 111.99, grind_dpm_screed: 124.99, dpm_sandwich: 139.99 },
    "Form Laying Patterns":      { tier: 3, screed: 116.99, gf_ply_screed: 136.99, upstairs_ply_feather: 124.99, grind_dpm_screed: 137.99, dpm_sandwich: 152.99 },
    "Signature Woods/Stones":    { tier: 4, screed: 114.99, gf_ply_screed: 134.99, upstairs_ply_feather: 122.99, grind_dpm_screed: 135.99, dpm_sandwich: 150.99 },
    "Signature Laying Patterns": { tier: 4, screed: 137.99, gf_ply_screed: 152.99, upstairs_ply_feather: 140.99, grind_dpm_screed: 152.99, dpm_sandwich: 167.99 },
  },
  "Karndean": {
    "Knight Tile Woods/Stones":       { tier: 1, screed: 69.99, gf_ply_screed: 87.99, upstairs_ply_feather: 76.99, grind_dpm_screed: 89.99, dpm_sandwich: 104.99 },
    "Knight Tile Parquet":            { tier: 1, screed: 80.99, gf_ply_screed: 98.99, upstairs_ply_feather: 87.99, grind_dpm_screed: 101.99, dpm_sandwich: 116.99 },
    "Van Gogh Woods/Stones":          { tier: 2, screed: 82.99, gf_ply_screed: 100.99, upstairs_ply_feather: 89.99, grind_dpm_screed: 102.99, dpm_sandwich: 117.99 },
    "Van Gogh Parquet/Herringbone":   { tier: 2, screed: 98.99, gf_ply_screed: 116.99, upstairs_ply_feather: 104.99, grind_dpm_screed: 119.99, dpm_sandwich: 134.99 },
    "Art Select Woods/Stones":        { tier: 3, screed: 100.49, gf_ply_screed: 118.49, upstairs_ply_feather: 107.49, grind_dpm_screed: 120.49, dpm_sandwich: 135.49 },
    "Art Select Parquet/Random Tile": { tier: 3, screed: 128.99, gf_ply_screed: 146.99, upstairs_ply_feather: 135.99, grind_dpm_screed: 149.99, dpm_sandwich: 164.99 },
    "Art Select Basketweave":         { tier: 3, screed: 139.99, gf_ply_screed: 157.99, upstairs_ply_feather: 146.99, grind_dpm_screed: 160.99, dpm_sandwich: 175.99 },
  },
  "Invictus": {
    "Primus Woods/Stones":         { tier: 1, screed: 67.99, gf_ply_screed: 85.99, upstairs_ply_feather: 74.99, grind_dpm_screed: 87.99, dpm_sandwich: 102.99 },
    "Primus Parquet":              { tier: 1, screed: 84.99, gf_ply_screed: 102.99, upstairs_ply_feather: 90.99, grind_dpm_screed: 104.99, dpm_sandwich: 119.99 },
    "Maximus Woods/Stones":        { tier: 2, screed: 76.99, gf_ply_screed: 94.99, upstairs_ply_feather: 83.99, grind_dpm_screed: 96.99, dpm_sandwich: 111.99 },
    "Maximus Parquet/Herringbone": { tier: 2, screed: 92.99, gf_ply_screed: 110.99, upstairs_ply_feather: 99.99, grind_dpm_screed: 112.99, dpm_sandwich: 127.99 },
    "Ultimus Woods":               { tier: 3, screed: 87.99, gf_ply_screed: 105.99, upstairs_ply_feather: 94.99, grind_dpm_screed: 107.99, dpm_sandwich: 122.99 },
    "Ultimus Parquet/Herringbone": { tier: 3, screed: 103.99, gf_ply_screed: 121.99, upstairs_ply_feather: 110.99, grind_dpm_screed: 123.99, dpm_sandwich: 138.99 },
  },
  "J2": {
    "Natural Timbers Woods/Stones": { tier: 2, screed: 74.99, gf_ply_screed: 92.99, upstairs_ply_feather: 81.99, grind_dpm_screed: 94.99, dpm_sandwich: 109.99 },
    "Natural Timbers Parquet":      { tier: 2, screed: 92.99, gf_ply_screed: 110.99, upstairs_ply_feather: 99.99, grind_dpm_screed: 112.99, dpm_sandwich: 127.99 },
  },
};

const confidenceMultipliers = {
  high:   { low: 0.98, high: 1.05 },
  medium: { low: 1.00, high: 1.10 },
  low:    { low: 1.05, high: 1.30 },
};

const MIN_JOB_VALUE = 250;
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

function calculateEstimate({ room_size_m2, product_brand, product_range, subfloor_type, floor_level, is_new_build, property_age, mix_floor, mix_subfloor, mix_concrete_age }) {
  const { scenario, confidence } = deriveScenario({ subfloor_type, floor_level, is_new_build, property_age });
  const rangeData = pricingData[product_brand]?.[product_range];
  const area = parseFloat(room_size_m2);
  const m = confidenceMultipliers[confidence];
  const volumeDiscount = area > VOLUME_DISCOUNT_THRESHOLD ? (1 - VOLUME_DISCOUNT_RATE) : 1;

  let base;
  if (scenario === "mixed_wood") {
    const gf = rangeData?.["gf_ply_screed"] ?? 60;
    const up = rangeData?.["upstairs_ply_feather"] ?? 60;
    const upPct = (mix_floor ?? 50) / 100;        // value = Upstairs %
    base = (gf * (1 - upPct)) + (up * upPct);
  } else if (scenario === "mixed_concrete") {
    const wood = ((rangeData?.["gf_ply_screed"] ?? 60) + (rangeData?.["upstairs_ply_feather"] ?? 60)) / 2;
    const conc = rangeData?.["dpm_sandwich"] ?? 60;
    const concPct = (mix_subfloor ?? 50) / 100;   // value = Concrete %
    base = (wood * (1 - concPct)) + (conc * concPct);
  } else if (scenario === "mixed_concrete_age") {
    const dp  = rangeData?.["dpm_sandwich"]     ?? 60;
    const gr  = rangeData?.["grind_dpm_screed"] ?? 60;
    const sc  = rangeData?.["screed"]           ?? 60;
    const newerPct = (mix_concrete_age ?? 50) / 100; // value = Newer %
    const olderPct = 1 - newerPct;
    base = (dp * olderPct) + (gr * newerPct * 0.5) + (sc * newerPct * 0.5);
  } else {
    base = rangeData?.[scenario] ?? 60;
  }

  let total_low  = Math.round(base * m.low  * area * volumeDiscount);
  let total_high = Math.round(base * m.high * area * volumeDiscount);
  total_low  = Math.max(total_low,  MIN_JOB_VALUE);
  total_high = Math.max(total_high, MIN_JOB_VALUE);
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

const steps = ["Contact", "Area", "Product", "Subfloor", "Estimate"];

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
  const valid = parseFloat(data.room_size_m2) >= 1;
  return (
    <div>
      <h2 style={sh}>What's the total area?</h2>
      <p style={sp}>Enter the total floor area you need covered — this can span more than one room.</p>
      <div style={{ marginBottom: 24 }}>
        <Label>Total area (m²)</Label>
        <Input type="number" min="1" value={data.room_size_m2}
          onChange={v => setData(d => ({ ...d, room_size_m2: v }))} placeholder="e.g. 25" />
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
  const brands = Object.keys(pricingData);
  const ranges = data.product_brand ? Object.keys(pricingData[data.product_brand]) : [];
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
              const tier = pricingData[data.product_brand][r].tier;
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

function StepContact({ data, setData, onNext }) {
  const valid = data.name.trim() && data.email.includes("@") && data.phone.trim().length >= 7 && data.postcode.trim().length >= 5;
  return (
    <div>
      <h2 style={sh}>Let's get started</h2>
      <p style={sp}>Enter your details once and run as many estimates as you need.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 16 }}>
        <div><Label>Full name</Label><Input value={data.name} onChange={v => setData(d => ({ ...d, name: v }))} placeholder="Jane Smith" /></div>
        <div><Label>Email address</Label><Input value={data.email} onChange={v => setData(d => ({ ...d, email: v }))} placeholder="jane@example.com" /></div>
        <div><Label>Phone number</Label><Input value={data.phone} onChange={v => setData(d => ({ ...d, phone: v }))} placeholder="07700 900000" /></div>
        <div><Label>Postcode</Label><Input value={data.postcode} onChange={v => setData(d => ({ ...d, postcode: v }))} placeholder="CV32 4AB" /></div>
      </div>
      <p style={{ fontSize: 11, color: "#aaa", fontFamily: "'Montserrat', sans-serif", marginBottom: 24, lineHeight: 1.6 }}>
        Your details are used solely to send your estimate and arrange a survey. We do not share your data.
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={onNext} disabled={!valid}>Next →</Btn>
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
        emailjs.init(EMAILJS_PUBLIC_KEY);
        const subfloorLabel = scenarioLabels[result.scenario] ?? result.scenario;
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name:     data.name,
          from_email:    data.email,
          phone:         data.phone,
          postcode:      data.postcode,
          product:       `${data.product_brand} – ${data.product_range}`,
          area:          data.room_size_m2,
          estimate_low:  fmt(result.total_low),
          estimate_high: fmt(result.total_high),
          subfloor:      subfloorLabel,
        });
        setEmailSent(true);
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
            { label: "Min. value", value: "£250 inc. VAT" },
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
        <strong style={{ color: C.tealDark }}>This estimate does not include:</strong> the handling of any appliances or furniture, or any door trimming required after installation.
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
  name: "", email: "", phone: "", postcode: "", uplift: "",
};

export default function PrioryEstimator() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(defaultData);
  const next    = () => setStep(s => s + 1);
  const back    = () => setStep(s => s - 1);
  const restart = () => setStep(1); // Keep contact details, restart from Area

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
              LVT Estimator
            </div>
          </div>

          {/* Card */}
          <div style={{ background: C.card, borderRadius: 12, padding: "32px 28px", boxShadow: "0 4px 24px rgba(30,36,39,0.10)", border: `1px solid ${C.border}` }}>
            <ProgressBar current={step} />
            {step === 0 && <StepContact  data={data} setData={setData} onNext={next} />}
            {step === 1 && <StepRoom     data={data} setData={setData} onNext={next} onBack={back} />}
            {step === 2 && <StepProduct  data={data} setData={setData} onNext={next} onBack={back} />}
            {step === 3 && <StepSubfloor data={data} setData={setData} onNext={next} onBack={back} />}
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
