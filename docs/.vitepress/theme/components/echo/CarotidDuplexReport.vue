<script setup lang="ts">
import { ref, computed } from "vue";

// ══════════════════════════════════════════════════════════════════
// Carotid Duplex & Transcranial Doppler Report Tool
// 頸動脈雙功能超音波暨經顱都卜勒超音波報告工具
//
// Formulas implemented (validated against the sample report):
//   MCA/ICA mean-V ratio (Lindegaard ratio)
//     = MeanV(M1) / MeanV(extracranial ICA)
//     where MeanV(ICA) is estimated as (PSV + 2×EDV) / 3
//   ICA/CCA PSV ratio  = PSV(ICA) / PSV(CCA)
//   Bil CCA PSV ratio  = PSV(Rt CCA) / PSV(Lt CCA)
//   Stenosis grading (NASCET-type criteria, table 2):
//     PSV(ICA) <125 or ratio <2.0        → 0-49%
//     PSV(ICA) 125-249 or ratio 2.0-3.9  → 50-69%
//     PSV(ICA) ≥250 or ratio ≥4.0        → 70-99%
//     (worse of the two criteria is used)
// ══════════════════════════════════════════════════════════════════

function taiwanToday() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Taipei" });
}

// ── Patient / header info ────────────────────────────────────────
const patient = ref({
  name: "",
  mrn: "",
  age: "",
  sex: "",
  bedNo: "",
  tel: "",
  address: "",
  clinicalDx: "",
});
const examDate = ref(taiwanToday());
const examTime = ref("");

// ── Vessel data models ───────────────────────────────────────────
// Transcranial vessels: PS / ED / RI / MV (mean velocity)
function newTC() {
  return { ps: "", ed: "", ri: "", mv: "", turb: false };
}
// Extracranial (carotid probe) vessels: PS / ED / RI / FV (flow volume)
function newCA() {
  return { ps: "", ed: "", ri: "", fv: "", turb: false };
}

const tc = ref({
  oa: { right: newTC(), left: newTC() },
  a1: { right: newTC(), left: newTC() },
  m1: { right: newTC(), left: newTC() },
  p1: { right: newTC(), left: newTC() },
  vaIntra: { right: newTC(), left: newTC() },
  ba: newTC(),
});

const ca = ref({
  cca: { right: newCA(), left: newCA() },
  bif: { right: newCA(), left: newCA() },
  ica: { right: newCA(), left: newCA() },
  eca: { right: newCA(), left: newCA() },
  vaExtra: { right: newCA(), left: newCA() },
});

const oaFlow = ref<{ right: string; left: string }>({
  right: "antegrade",
  left: "antegrade",
});
const flowOptions = [
  { v: "antegrade", l: "Antegrade (normal)" },
  { v: "retrograde", l: "Retrograde (reversed)" },
];

const icaStatus = ref<{ right: string; left: string }>({
  right: "patent",
  left: "patent",
});
const icaStatusOptions = [
  { v: "patent", l: "Patent — assess by PSV / ratio below" },
  { v: "pseudo", l: "Suspected pseudo-occlusion" },
  { v: "recent", l: "Recent total occlusion" },
  { v: "chronic", l: "Chronic total occlusion" },
];

// ── Diagram nodes (vessel schematic ⇄ form, two-way linked) ───────
// Rebuilt as a computed so the references stay valid after reset().
const _TCF = ["ps", "ed", "ri", "mv"];
const _CAF = ["ps", "ed", "ri", "fv"];
const diagramNodes = computed(() => {
  const t = tc.value;
  const c = ca.value;
  const SC = 1.35,
    TX = -175,
    TY = -91;
  const gx = (v) => TX + SC * v;
  const gy = (v) => TY + SC * v;
  return [
    // Right side — clusters in the left margin (cx = 8)
    { id: "a1r", label: "R A1", side: "r", cx: 6, cy: 24, nx: gx(455), ny: gy(130), fields: _TCF, m: t.a1.right },
    { id: "oar", label: "R OA", side: "r", cx: 6, cy: 136, nx: gx(410), ny: gy(166), fields: _TCF, m: t.oa.right },
    { id: "m1r", label: "R M1", side: "r", cx: 6, cy: 248, nx: gx(355), ny: gy(235), fields: _TCF, m: t.m1.right },
    { id: "p1r", label: "R P1", side: "r", cx: 6, cy: 360, nx: gx(462), ny: gy(325), fields: _TCF, m: t.p1.right },
    { id: "vir", label: "R VA intra", side: "r", cx: 6, cy: 472, nx: gx(468), ny: gy(430), fields: _TCF, m: t.vaIntra.right },
    { id: "icar", label: "R ICA", side: "r", cx: 6, cy: 584, nx: gx(440), ny: gy(520), fields: _CAF, m: c.ica.right },
    { id: "ecar", label: "R ECA", side: "r", cx: 6, cy: 696, nx: gx(479), ny: gy(556), fields: _CAF, m: c.eca.right },
    { id: "bifr", label: "R BIF", side: "r", cx: 6, cy: 808, nx: gx(442), ny: gy(610), fields: _CAF, m: c.bif.right },
    { id: "vexr", label: "R VA extra", side: "r", cx: 6, cy: 920, nx: gx(400), ny: gy(690), fields: _CAF, m: c.vaExtra.right },
    { id: "ccar", label: "R CCA", side: "r", cx: 6, cy: 1032, nx: gx(447), ny: gy(715), fields: _CAF, m: c.cca.right },
    // Left side — clusters in the right margin (cx = 852)
    { id: "a1l", label: "L A1", side: "l", cx: 818, cy: 24, nx: gx(545), ny: gy(130), fields: _TCF, m: t.a1.left },
    { id: "oal", label: "L OA", side: "l", cx: 818, cy: 136, nx: gx(590), ny: gy(166), fields: _TCF, m: t.oa.left },
    { id: "m1l", label: "L M1", side: "l", cx: 818, cy: 248, nx: gx(645), ny: gy(235), fields: _TCF, m: t.m1.left },
    { id: "p1l", label: "L P1", side: "l", cx: 818, cy: 360, nx: gx(538), ny: gy(325), fields: _TCF, m: t.p1.left },
    { id: "vil", label: "L VA intra", side: "l", cx: 818, cy: 472, nx: gx(532), ny: gy(430), fields: _TCF, m: t.vaIntra.left },
    { id: "ical", label: "L ICA", side: "l", cx: 818, cy: 584, nx: gx(560), ny: gy(520), fields: _CAF, m: c.ica.left },
    { id: "ecal", label: "L ECA", side: "l", cx: 818, cy: 696, nx: gx(521), ny: gy(556), fields: _CAF, m: c.eca.left },
    { id: "bifl", label: "L BIF", side: "l", cx: 818, cy: 808, nx: gx(558), ny: gy(610), fields: _CAF, m: c.bif.left },
    { id: "vexl", label: "L VA extra", side: "l", cx: 818, cy: 920, nx: gx(600), ny: gy(690), fields: _CAF, m: c.vaExtra.left },
    { id: "ccal", label: "L CCA", side: "l", cx: 818, cy: 1032, nx: gx(553), ny: gy(715), fields: _CAF, m: c.cca.left },
    // Basilar — midline, cluster centred at the bottom
    { id: "ba", label: "BA (midline)", side: "mid", cx: 412, cy: 1000, nx: gx(500), ny: gy(388), fields: _TCF, m: t.ba },
  ];
});

// ── B-mode plaque findings ───────────────────────────────────────
interface Plaque {
  id: number;
  side: string;
  distribution: string;
  internalPattern: string;
  appearance: string;
  site: string;
  diameter: string;
  stenosisD: string;
  stenosisA: string;
}
let pid = 0;
const plaques = ref<Plaque[]>([]);
function addPlaque() {
  plaques.value.push({
    id: pid++,
    side: "right",
    distribution: "segmental",
    internalPattern: "eccentric",
    appearance: "heterogeneous",
    site: "",
    diameter: "",
    stenosisD: "",
    stenosisA: "",
  });
}
function removePlaque(id: number) {
  plaques.value = plaques.value.filter((p) => p.id !== id);
}
const distributionOptions = [
  { v: "single", l: "Single" },
  { v: "discrete", l: "Discrete" },
  { v: "segmental", l: "Segmental" },
];
const internalOptions = [
  { v: "eccentric", l: "Eccentric" },
  { v: "concentric", l: "Concentric" },
];
const appearanceOptions = [
  { v: "homogeneous", l: "Homogeneous" },
  { v: "heterogeneous", l: "Heterogeneous" },
  { v: "ulcerated", l: "Ulcerated" },
  { v: "hemorrhage", l: "Intraplaque hemorrhage" },
  { v: "moving", l: "Moving / floating" },
];

function areaStenosisGrade(areaPct: string) {
  const a = parseFloat(areaPct);
  if (isNaN(a)) return "";
  if (a < 75) return "0-49%";
  if (a <= 90) return "50-69%";
  return "91-99% (area) → 70-99%";
}

// ── Core calculations ────────────────────────────────────────────
function num(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function meanVFromPSED(ps: string, ed: string) {
  const p = num(ps);
  const e = num(ed);
  if (p === null || e === null) return null;
  return (p + 2 * e) / 3;
}

function lindegaard(side: "right" | "left") {
  const m1mv = num(tc.value.m1[side].mv);
  const icaMeanV = meanVFromPSED(ca.value.ica[side].ps, ca.value.ica[side].ed);
  if (m1mv === null || icaMeanV === null || icaMeanV === 0) return null;
  return m1mv / icaMeanV;
}

function lindegaardClass(val: number | null) {
  if (val === null) return "—";
  if (val < 3) return "Normal";
  if (val <= 6) return "Mildly elevated (correlate for vasospasm)";
  return "Markedly elevated (severe vasospasm range)";
}

function icaCcaRatio(side: "right" | "left") {
  const icaPs = num(ca.value.ica[side].ps);
  const ccaPs = num(ca.value.cca[side].ps);
  if (icaPs === null || ccaPs === null || ccaPs === 0) return null;
  return icaPs / ccaPs;
}

function bilCcaRatio() {
  const r = num(ca.value.cca.right.ps);
  const l = num(ca.value.cca.left.ps);
  if (r === null || l === null || l === 0) return null;
  return r / l;
}

function occlusionLabel(status: string) {
  switch (status) {
    case "pseudo":
      return "Suspected pseudo-occlusion";
    case "recent":
      return "Recent total occlusion";
    case "chronic":
      return "Chronic total occlusion";
    default:
      return "Patent";
  }
}

function gradeStenosis(side: "right" | "left") {
  if (icaStatus.value[side] !== "patent")
    return occlusionLabel(icaStatus.value[side]);
  const psv = num(ca.value.ica[side].ps);
  const ratio = icaCcaRatio(side);
  const order: Record<string, number> = {
    "0-49%": 0,
    "50-69%": 1,
    "70-99%": 2,
  };
  let gradeFromPsv: string | null = null;
  if (psv !== null) {
    gradeFromPsv = psv >= 250 ? "70-99%" : psv >= 125 ? "50-69%" : "0-49%";
  }
  let gradeFromRatio: string | null = null;
  if (ratio !== null) {
    gradeFromRatio =
      ratio >= 4.0 ? "70-99%" : ratio >= 2.0 ? "50-69%" : "0-49%";
  }
  if (gradeFromPsv && gradeFromRatio) {
    return order[gradeFromPsv] >= order[gradeFromRatio]
      ? gradeFromPsv
      : gradeFromRatio;
  }
  return gradeFromPsv || gradeFromRatio || "Insufficient data";
}

const mcaIcaRight = computed(() => lindegaard("right"));
const mcaIcaLeft = computed(() => lindegaard("left"));
const icaCcaRight = computed(() => icaCcaRatio("right"));
const icaCcaLeft = computed(() => icaCcaRatio("left"));
const bilCca = computed(() => bilCcaRatio());
const gradeRight = computed(() => gradeStenosis("right"));
const gradeLeft = computed(() => gradeStenosis("left"));

function fmt(v: number | null, digits = 1) {
  return v === null ? "—" : v.toFixed(digits);
}

function flagClass(v: number | null, lo: number, hi: number | null) {
  if (v === null) return "";
  if (hi === null) return v > lo ? "flag-abnormal" : "flag-normal";
  return v < lo || v > hi ? "flag-abnormal" : "flag-normal";
}

// ── Turbulence summary ───────────────────────────────────────────
const tcLabels: Record<string, string> = {
  oa: "OA",
  a1: "A1 (ACA)",
  m1: "M1 (MCA)",
  p1: "P1 (PCA)",
  vaIntra: "VA (intracranial)",
};
const caLabels: Record<string, string> = {
  cca: "CCA",
  bif: "BIF",
  ica: "ICA",
  eca: "ECA",
  vaExtra: "VA (extracranial)",
};

function turbulentVessels() {
  const list: string[] = [];
  (Object.keys(tcLabels) as Array<keyof typeof tc.value>).forEach((key) => {
    const v = tc.value[key] as any;
    if (v.right?.turb) list.push("R " + tcLabels[key as string]);
    if (v.left?.turb) list.push("L " + tcLabels[key as string]);
  });
  if (tc.value.ba.turb) list.push("BA");
  (Object.keys(caLabels) as Array<keyof typeof ca.value>).forEach((key) => {
    const v = ca.value[key] as any;
    if (v.right?.turb) list.push("R " + caLabels[key as string]);
    if (v.left?.turb) list.push("L " + caLabels[key as string]);
  });
  return list;
}

// ── Auto-generated interpretation ────────────────────────────────
function buildInterpretation() {
  const lines: string[] = [];
  let n = 1;

  (["right", "left"] as const).forEach((side) => {
    const label = side === "right" ? "R" : "L";
    const grade = gradeStenosis(side);
    if (icaStatus.value[side] !== "patent") {
      lines.push(
        `${n++}) ${label} ICA: ${occlusionLabel(icaStatus.value[side])}.`,
      );
    } else if (grade && grade !== "Insufficient data" && grade !== "0-49%") {
      const psv = ca.value.ica[side].ps || "—";
      const edv = ca.value.ica[side].ed || "—";
      const ratio = icaCcaRatio(side);
      lines.push(
        `${n++}) ${grade} stenosis suspected in ${label} ICA (PSV/EDV = ${psv}/${edv} cm/s` +
          (ratio !== null ? `, ICA/CCA ratio = ${ratio.toFixed(1)}` : "") +
          `).`,
      );
    }
  });

  const bc = bilCcaRatio();
  if (bc !== null && (bc < 0.7 || bc > 1.3)) {
    lines.push(
      `${n++}) Asymmetric bilateral CCA flow (Rt/Lt PSV ratio = ${bc.toFixed(2)}).`,
    );
  }

  (["right", "left"] as const).forEach((side) => {
    const lr = lindegaard(side);
    if (lr !== null && lr >= 3) {
      const label = side === "right" ? "R" : "L";
      lines.push(
        `${n++}) Elevated ${label} MCA/ICA mean-V ratio (${lr.toFixed(1)}) — ${lindegaardClass(lr)}.`,
      );
    }
  });

  (["right", "left"] as const).forEach((side) => {
    if (oaFlow.value[side] === "retrograde") {
      const label = side === "right" ? "R" : "L";
      lines.push(
        `${n++}) Reversed ${label} ophthalmic arterial flow, suggesting ECA-to-OA collateral supply — consider proximal ICA/CCA disease.`,
      );
    }
  });

  const tv = turbulentVessels();
  if (tv.length)
    lines.push(`${n++}) Turbulent flow noted at: ${tv.join(", ")}.`);

  if (plaques.value.length) {
    const desc = plaques.value
      .map((p) => {
        const label = p.side === "right" ? "Rt" : "Lt";
        return (
          `${label} ${p.site || "—"} (${p.distribution}, ${p.internalPattern}, ${p.appearance}` +
          (p.stenosisD ? `, ${p.stenosisD}% diameter stenosis` : "") +
          (p.stenosisA ? `, ${p.stenosisA}% area stenosis` : "") +
          `)`
        );
      })
      .join("; ");
    lines.push(`${n++}) Atheromatous plaques: ${desc}.`);
  }

  if (lines.length === 0) {
    lines.push(
      "No significant stenosis, occlusion, or flow abnormality identified.",
    );
  }
  return lines;
}

const interpretation = computed(() => buildInterpretation());

// ── Additional free-text sections ────────────────────────────────
const otherFindings = ref("");
const impression = ref("");

// ── Report generation ────────────────────────────────────────────
function vLine(label: string, v: any, unit = "") {
  const parts: string[] = [];
  if (v.ps) parts.push(`PS ${v.ps}`);
  if (v.ed) parts.push(`ED ${v.ed}`);
  if (v.ri) parts.push(`RI ${v.ri}`);
  if (v.mv) parts.push(`MV ${v.mv}`);
  if (v.fv) parts.push(`FV ${v.fv}`);
  if (v.turb) parts.push("**turbulent**");
  return parts.length ? `- **${label}:** ${parts.join(", ")}${unit}` : "";
}

function generateReport() {
  const lines: string[] = [];
  lines.push("# 頸動脈雙功能超音波暨經顱都卜勒報告");
  lines.push("**Carotid Duplex & Transcranial Doppler Report**");
  lines.push("");
  lines.push(
    `**檢查日期 (Exam Date):** ${examDate.value}` +
      (examTime.value ? `  **時間:** ${examTime.value}` : ""),
  );
  if (patient.value.name) lines.push(`**姓名 (Name):** ${patient.value.name}`);
  if (patient.value.mrn) lines.push(`**病歷號 (MRN):** ${patient.value.mrn}`);
  if (patient.value.age) lines.push(`**年齡 (Age):** ${patient.value.age}`);
  if (patient.value.sex) lines.push(`**性別 (Sex):** ${patient.value.sex}`);
  if (patient.value.bedNo)
    lines.push(`**床號 (Bed No):** ${patient.value.bedNo}`);
  if (patient.value.clinicalDx)
    lines.push(`**Clinical diagnosis:** ${patient.value.clinicalDx}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Transcranial Doppler（顱內血流；PS/ED/RI/MV cm/s）");
  lines.push("");
  lines.push("**Right:**");
  [
    vLine("OA", tc.value.oa.right),
    vLine("A1 (ACA)", tc.value.a1.right),
    vLine("M1 (MCA)", tc.value.m1.right),
    vLine("P1 (PCA)", tc.value.p1.right),
    vLine("VA (intracranial)", tc.value.vaIntra.right),
  ]
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  lines.push(
    `- **Ophthalmic flow direction:** ${flowOptions.find((o) => o.v === oaFlow.value.right)?.l}`,
  );
  lines.push("");
  lines.push("**Left:**");
  [
    vLine("OA", tc.value.oa.left),
    vLine("A1 (ACA)", tc.value.a1.left),
    vLine("M1 (MCA)", tc.value.m1.left),
    vLine("P1 (PCA)", tc.value.p1.left),
    vLine("VA (intracranial)", tc.value.vaIntra.left),
  ]
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  lines.push(
    `- **Ophthalmic flow direction:** ${flowOptions.find((o) => o.v === oaFlow.value.left)?.l}`,
  );
  const baLine = vLine("BA (midline)", tc.value.ba);
  if (baLine) {
    lines.push("");
    lines.push(baLine);
  }
  lines.push("");

  lines.push("## Extracranial Carotid Duplex（顱外頸動脈；PS/ED/RI/FV）");
  lines.push("");
  lines.push("**Right:**");
  [
    vLine("CCA", ca.value.cca.right),
    vLine("BIF", ca.value.bif.right),
    vLine("ICA", ca.value.ica.right),
    vLine("ECA", ca.value.eca.right),
    vLine("VA (extracranial)", ca.value.vaExtra.right),
  ]
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  lines.push(`- **ICA status:** ${occlusionLabel(icaStatus.value.right)}`);
  lines.push("");
  lines.push("**Left:**");
  [
    vLine("CCA", ca.value.cca.left),
    vLine("BIF", ca.value.bif.left),
    vLine("ICA", ca.value.ica.left),
    vLine("ECA", ca.value.eca.left),
    vLine("VA (extracranial)", ca.value.vaExtra.left),
  ]
    .filter(Boolean)
    .forEach((l) => lines.push(l));
  lines.push(`- **ICA status:** ${occlusionLabel(icaStatus.value.left)}`);
  lines.push("");

  lines.push("## Computed Ratios & Grading");
  lines.push("");
  lines.push(
    `- **MCA/ICA mean-V ratio (NL < 3.0):** Rt ${fmt(mcaIcaRight.value)}, Lt ${fmt(mcaIcaLeft.value)}`,
  );
  lines.push(
    `- **ICA/CCA PS ratio (NL < 1.5):** Rt ${fmt(icaCcaRight.value)}, Lt ${fmt(icaCcaLeft.value)}`,
  );
  lines.push(`- **Bil CCA PS ratio (NL 0.7-1.3):** ${fmt(bilCca.value, 2)}`);
  lines.push(`- **R ICA stenosis grade:** ${gradeRight.value}`);
  lines.push(`- **L ICA stenosis grade:** ${gradeLeft.value}`);
  lines.push("");

  if (plaques.value.length) {
    lines.push("## B-mode Plaque Findings");
    lines.push("");
    plaques.value.forEach((p, i) => {
      const label = p.side === "right" ? "Rt" : "Lt";
      lines.push(
        `${i + 1}. **${label} ${p.site || "—"}** — ${p.distribution}, ${p.internalPattern}, ${p.appearance}` +
          (p.diameter ? `, diameter ${p.diameter} mm` : "") +
          (p.stenosisD ? `, ${p.stenosisD}% stenosis(D)` : "") +
          (p.stenosisA
            ? `, ${p.stenosisA}% stenosis(A) [${areaStenosisGrade(p.stenosisA)}]`
            : ""),
      );
    });
    lines.push("");
  }

  if (otherFindings.value.trim()) {
    lines.push("## Other Findings");
    lines.push(otherFindings.value.trim());
    lines.push("");
  }

  lines.push("## Auto-generated Interpretation");
  lines.push("");
  interpretation.value.forEach((l) => lines.push(l));
  lines.push("");

  lines.push("---");
  lines.push("## Impression（印象／結論）");
  lines.push(impression.value.trim() || interpretation.value.join(" "));
  lines.push("");
  lines.push("---");
  lines.push("*Report generated by Carotid Duplex & TCD Template tool*");

  return lines.join("\n");
}

const showResults = ref(false);
const copied = ref(false);

async function copyReport() {
  await navigator.clipboard.writeText(generateReport());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function useAutoInterpretation() {
  impression.value = interpretation.value.map((l, i) => l).join("\n");
}

function reset() {
  patient.value = {
    name: "",
    mrn: "",
    age: "",
    sex: "",
    bedNo: "",
    tel: "",
    address: "",
    clinicalDx: "",
  };
  examDate.value = taiwanToday();
  examTime.value = "";
  tc.value = {
    oa: { right: newTC(), left: newTC() },
    a1: { right: newTC(), left: newTC() },
    m1: { right: newTC(), left: newTC() },
    p1: { right: newTC(), left: newTC() },
    vaIntra: { right: newTC(), left: newTC() },
    ba: newTC(),
  };
  ca.value = {
    cca: { right: newCA(), left: newCA() },
    bif: { right: newCA(), left: newCA() },
    ica: { right: newCA(), left: newCA() },
    eca: { right: newCA(), left: newCA() },
    vaExtra: { right: newCA(), left: newCA() },
  };
  oaFlow.value = { right: "antegrade", left: "antegrade" };
  icaStatus.value = { right: "patent", left: "patent" };
  plaques.value = [];
  otherFindings.value = "";
  impression.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="carotid-report">
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span class="intro-text">
        <span class="intro-zh"
          >輸入各血管 PS / ED / RI / MV(或FV)
          四項數值，系統自動計算比值並產生解讀。</span
        >
        <span class="intro-en"
          >Enter the 4 Doppler values (PS/ED/RI/MV or FV) per vessel; ratios,
          stenosis grading, and interpretation are generated
          automatically.</span
        >
      </span>
    </div>

    <!-- ======================== SECTION: Probe ======================== -->
    <div class="cr-section">
      <div class="probe-bar">
        <span class="probe-tag">Probe</span>
        <span class="probe-chip tcd">
          <svg
            class="probe-ico"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 12a8 8 0 0 1 8-8" />
            <path d="M6.5 12a5.5 5.5 0 0 1 5.5-5.5" />
            <path d="M9 12a3 3 0 0 1 3-3" />
            <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          <span>Transcranial <b>2–3 MHz</b></span>
        </span>
        <span class="probe-chip cca">
          <svg
            class="probe-ico"
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
          >
            <path d="M4 12a8 8 0 0 1 8-8" />
            <path d="M6.5 12a5.5 5.5 0 0 1 5.5-5.5" />
            <path d="M9 12a3 3 0 0 1 3-3" />
            <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
          </svg>
          <span>Carotid <b>5–10 MHz</b></span>
        </span>
      </div>
    </div>

    <!-- ======================== SECTION: Reference Diagram ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Vessel Reference Diagram（血管示意圖）</span
        >
      </div>
      <div class="svg-wrap">
        <svg
          viewBox="0 0 1000 1180"
          xmlns="http://www.w3.org/2000/svg"
          class="ref-svg"
        >
          <!-- ===== Anatomy (schematic) ===== -->
          <g transform="translate(-175,-91) scale(1.35)">
          <!-- Circle of Willis + basilar (brand) -->
          <path d="M 455 130 Q 500 108 545 130" class="dg-cow" />
          <path d="M 455 130 Q 438 178 432 240" class="dg-cow" />
          <path d="M 545 130 Q 562 178 568 240" class="dg-cow" />
          <path d="M 432 240 Q 448 292 462 325 Q 482 342 500 348" class="dg-cow" />
          <path d="M 568 240 Q 552 292 538 325 Q 518 342 500 348" class="dg-cow" />
          <path d="M 500 348 L 500 410" class="dg-cow" />
          <!-- M1 (MCA) -->
          <path d="M 432 240 Q 393 236 355 235" class="dg-vessel" />
          <path d="M 568 240 Q 607 236 645 235" class="dg-vessel" />
          <!-- OA (ophthalmic) + orbit hint -->
          <path d="M 432 240 Q 418 198 410 168" class="dg-vessel" />
          <path d="M 568 240 Q 582 198 590 168" class="dg-vessel" />
          <circle cx="405" cy="156" r="7" class="dg-eye" />
          <circle cx="595" cy="156" r="7" class="dg-eye" />
          <!-- Vertebral artery: extracranial → intracranial → basilar confluence -->
          <path d="M 500 410 Q 486 418 468 430 L 400 690" class="dg-vessel" />
          <path d="M 500 410 Q 514 418 532 430 L 600 690" class="dg-vessel" />
          <!-- ICA (siphon → cervical → bifurcation) -->
          <path d="M 432 240 L 440 520 L 442 610" class="dg-vessel" />
          <path d="M 568 240 L 560 520 L 558 610" class="dg-vessel" />
          <!-- ECA (external carotid) -->
          <path d="M 442 610 Q 462 585 478 560 Q 486 545 488 528" class="dg-vessel" />
          <path d="M 558 610 Q 538 585 522 560 Q 514 545 512 528" class="dg-vessel" />
          <!-- CCA (common carotid trunk) -->
          <path d="M 442 610 L 447 700 L 449 768" class="dg-vessel" />
          <path d="M 558 610 L 553 700 L 551 768" class="dg-vessel" />

          </g>
          <!-- ===== Vessel nodes + linked input clusters ===== -->
          <template v-for="n in diagramNodes" :key="n.id">
            <line
              :x1="n.side === 'l' ? n.cx : n.side === 'mid' ? n.cx + 88 : n.cx + 176"
              :y1="n.side === 'mid' ? n.cy : n.cy + 28"
              :x2="n.nx"
              :y2="n.ny"
              class="dg-leader"
            />
            <circle :cx="n.nx" :cy="n.ny" r="4.5" class="dg-node" />
            <foreignObject :x="n.cx" :y="n.cy" width="176" height="104">
              <div class="dg-cluster" xmlns="http://www.w3.org/1999/xhtml">
                <div class="dg-cluster-title">{{ n.label }}</div>
                <div class="dg-inputs">
                  <label v-for="f in n.fields" :key="f">
                    <span>{{ f.toUpperCase() }}</span>
                    <input v-model="n.m[f]" inputmode="decimal" />
                  </label>
                </div>
              </div>
            </foreignObject>
          </template>
        </svg>
      </div>
    </div>

    <!-- ======================== SECTION: Ophthalmic ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Ophthalmic Artery（眼動脈）— PS/ED/RI/MV</span
        >
      </div>
      <div class="vessel-grid">
        <div class="vessel-block">
          <span class="vessel-title">Right OA</span>
          <div class="vessel-dims">
            <label>PS <input v-model="tc.oa.right.ps" /></label>
            <label>ED <input v-model="tc.oa.right.ed" /></label>
            <label>RI <input v-model="tc.oa.right.ri" /></label>
            <label>MV <input v-model="tc.oa.right.mv" /></label>
          </div>
          <label class="field small-field"
            ><span class="field-label">Flow direction</span>
            <select v-model="oaFlow.right">
              <option v-for="o in flowOptions" :key="o.v" :value="o.v">
                {{ o.l }}
              </option>
            </select>
          </label>
          <label class="turb-check"
            ><input type="checkbox" v-model="tc.oa.right.turb" />
            Turbulent</label
          >
        </div>
        <div class="vessel-block">
          <span class="vessel-title">Left OA</span>
          <div class="vessel-dims">
            <label>PS <input v-model="tc.oa.left.ps" /></label>
            <label>ED <input v-model="tc.oa.left.ed" /></label>
            <label>RI <input v-model="tc.oa.left.ri" /></label>
            <label>MV <input v-model="tc.oa.left.mv" /></label>
          </div>
          <label class="field small-field"
            ><span class="field-label">Flow direction</span>
            <select v-model="oaFlow.left">
              <option v-for="o in flowOptions" :key="o.v" :value="o.v">
                {{ o.l }}
              </option>
            </select>
          </label>
          <label class="turb-check"
            ><input type="checkbox" v-model="tc.oa.left.turb" />
            Turbulent</label
          >
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: A1/M1/P1 ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Anterior / Middle / Posterior Cerebral Arteries（A1・M1・P1）—
          PS/ED/RI/MV</span
        >
      </div>
      <div class="vessel-grid three-col">
        <template
          v-for="(vKey, idx) in [
            ['a1', 'A1 (ACA)'],
            ['m1', 'M1 (MCA)'],
            ['p1', 'P1 (PCA)'],
          ]"
          :key="idx"
        >
          <div class="vessel-block">
            <span class="vessel-title">Right {{ vKey[1] }}</span>
            <div class="vessel-dims">
              <label
                >PS <input v-model="(tc as any)[vKey[0]].right.ps"
              /></label>
              <label
                >ED <input v-model="(tc as any)[vKey[0]].right.ed"
              /></label>
              <label
                >RI <input v-model="(tc as any)[vKey[0]].right.ri"
              /></label>
              <label
                >MV <input v-model="(tc as any)[vKey[0]].right.mv"
              /></label>
            </div>
            <label class="turb-check"
              ><input
                type="checkbox"
                v-model="(tc as any)[vKey[0]].right.turb"
              />
              Turbulent</label
            >
          </div>
          <div class="vessel-block">
            <span class="vessel-title">Left {{ vKey[1] }}</span>
            <div class="vessel-dims">
              <label>PS <input v-model="(tc as any)[vKey[0]].left.ps" /></label>
              <label>ED <input v-model="(tc as any)[vKey[0]].left.ed" /></label>
              <label>RI <input v-model="(tc as any)[vKey[0]].left.ri" /></label>
              <label>MV <input v-model="(tc as any)[vKey[0]].left.mv" /></label>
            </div>
            <label class="turb-check"
              ><input
                type="checkbox"
                v-model="(tc as any)[vKey[0]].left.turb"
              />
              Turbulent</label
            >
          </div>
        </template>
      </div>
    </div>

    <!-- ======================== SECTION: Vertebrobasilar (intracranial) ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Vertebrobasilar System — Intracranial（顱內椎基底動脈）—
          PS/ED/RI/MV</span
        >
      </div>
      <div class="vessel-grid">
        <div class="vessel-block">
          <span class="vessel-title">Right VA (intracranial)</span>
          <div class="vessel-dims">
            <label>PS <input v-model="tc.vaIntra.right.ps" /></label>
            <label>ED <input v-model="tc.vaIntra.right.ed" /></label>
            <label>RI <input v-model="tc.vaIntra.right.ri" /></label>
            <label>MV <input v-model="tc.vaIntra.right.mv" /></label>
          </div>
          <label class="turb-check"
            ><input type="checkbox" v-model="tc.vaIntra.right.turb" />
            Turbulent</label
          >
        </div>
        <div class="vessel-block">
          <span class="vessel-title">Left VA (intracranial)</span>
          <div class="vessel-dims">
            <label>PS <input v-model="tc.vaIntra.left.ps" /></label>
            <label>ED <input v-model="tc.vaIntra.left.ed" /></label>
            <label>RI <input v-model="tc.vaIntra.left.ri" /></label>
            <label>MV <input v-model="tc.vaIntra.left.mv" /></label>
          </div>
          <label class="turb-check"
            ><input type="checkbox" v-model="tc.vaIntra.left.turb" />
            Turbulent</label
          >
        </div>
        <div class="vessel-block ba-block">
          <span class="vessel-title">BA (Basilar, midline)</span>
          <div class="vessel-dims">
            <label>PS <input v-model="tc.ba.ps" /></label>
            <label>ED <input v-model="tc.ba.ed" /></label>
            <label>RI <input v-model="tc.ba.ri" /></label>
            <label>MV <input v-model="tc.ba.mv" /></label>
          </div>
          <label class="turb-check"
            ><input type="checkbox" v-model="tc.ba.turb" /> Turbulent</label
          >
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Extracranial Carotid ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Extracranial Carotid System（顱外頸動脈）— PS/ED/RI/FV</span
        >
      </div>
      <div class="vessel-grid">
        <template
          v-for="(vKey, idx) in [
            ['cca', 'CCA'],
            ['bif', 'BIF'],
            ['ica', 'ICA'],
            ['eca', 'ECA'],
          ]"
          :key="idx"
        >
          <div class="vessel-block">
            <span class="vessel-title">Right {{ vKey[1] }}</span>
            <div class="vessel-dims">
              <label
                >PS <input v-model="(ca as any)[vKey[0]].right.ps"
              /></label>
              <label
                >ED <input v-model="(ca as any)[vKey[0]].right.ed"
              /></label>
              <label
                >RI <input v-model="(ca as any)[vKey[0]].right.ri"
              /></label>
              <label
                >FV <input v-model="(ca as any)[vKey[0]].right.fv"
              /></label>
            </div>
            <label class="turb-check"
              ><input
                type="checkbox"
                v-model="(ca as any)[vKey[0]].right.turb"
              />
              Turbulent</label
            >
          </div>
          <div class="vessel-block">
            <span class="vessel-title">Left {{ vKey[1] }}</span>
            <div class="vessel-dims">
              <label>PS <input v-model="(ca as any)[vKey[0]].left.ps" /></label>
              <label>ED <input v-model="(ca as any)[vKey[0]].left.ed" /></label>
              <label>RI <input v-model="(ca as any)[vKey[0]].left.ri" /></label>
              <label>FV <input v-model="(ca as any)[vKey[0]].left.fv" /></label>
            </div>
            <label class="turb-check"
              ><input
                type="checkbox"
                v-model="(ca as any)[vKey[0]].left.turb"
              />
              Turbulent</label
            >
          </div>
        </template>
      </div>

      <div class="sub-section-label">
        Extracranial Vertebral Artery（顱外椎動脈）
      </div>
      <div class="vessel-grid">
        <div class="vessel-block">
          <span class="vessel-title">Right VA (extracranial)</span>
          <div class="vessel-dims">
            <label>PS <input v-model="ca.vaExtra.right.ps" /></label>
            <label>ED <input v-model="ca.vaExtra.right.ed" /></label>
            <label>RI <input v-model="ca.vaExtra.right.ri" /></label>
            <label>FV <input v-model="ca.vaExtra.right.fv" /></label>
          </div>
          <label class="turb-check"
            ><input type="checkbox" v-model="ca.vaExtra.right.turb" />
            Turbulent</label
          >
        </div>
        <div class="vessel-block">
          <span class="vessel-title">Left VA (extracranial)</span>
          <div class="vessel-dims">
            <label>PS <input v-model="ca.vaExtra.left.ps" /></label>
            <label>ED <input v-model="ca.vaExtra.left.ed" /></label>
            <label>RI <input v-model="ca.vaExtra.left.ri" /></label>
            <label>FV <input v-model="ca.vaExtra.left.fv" /></label>
          </div>
          <label class="turb-check"
            ><input type="checkbox" v-model="ca.vaExtra.left.turb" />
            Turbulent</label
          >
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Computed Ratios ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Computed Ratios &amp; Grading（自動計算）</span
        >
      </div>
      <div class="ratio-grid">
        <div class="ratio-card">
          <div class="ratio-head">
            <span class="ratio-name">MCA/ICA mean-V</span>
            <span class="ratio-range">NL &lt; 3.0</span>
          </div>
          <div class="ratio-tiles">
            <div :class="['ratio-tile', flagClass(mcaIcaRight, 0, 3)]">
              <span class="tile-side">Rt</span>
              <span class="tile-val">{{ fmt(mcaIcaRight) }}</span>
            </div>
            <div :class="['ratio-tile', flagClass(mcaIcaLeft, 0, 3)]">
              <span class="tile-side">Lt</span>
              <span class="tile-val">{{ fmt(mcaIcaLeft) }}</span>
            </div>
          </div>
          <div class="ratio-note">
            Rt {{ lindegaardClass(mcaIcaRight) }} · Lt
            {{ lindegaardClass(mcaIcaLeft) }}
          </div>
        </div>

        <div class="ratio-card">
          <div class="ratio-head">
            <span class="ratio-name">ICA/CCA PS</span>
            <span class="ratio-range">NL &lt; 1.5</span>
          </div>
          <div class="ratio-tiles">
            <div :class="['ratio-tile', flagClass(icaCcaRight, 0, 1.5)]">
              <span class="tile-side">Rt</span>
              <span class="tile-val">{{ fmt(icaCcaRight) }}</span>
            </div>
            <div :class="['ratio-tile', flagClass(icaCcaLeft, 0, 1.5)]">
              <span class="tile-side">Lt</span>
              <span class="tile-val">{{ fmt(icaCcaLeft) }}</span>
            </div>
          </div>
        </div>

        <div class="ratio-card">
          <div class="ratio-head">
            <span class="ratio-name">Bil CCA PS</span>
            <span class="ratio-range">NL 0.7–1.3</span>
          </div>
          <div class="ratio-tiles">
            <div :class="['ratio-tile', flagClass(bilCca, 0.7, 1.3)]">
              <span class="tile-side">R / L</span>
              <span class="tile-val">{{ fmt(bilCca, 2) }}</span>
            </div>
          </div>
        </div>

        <div class="ratio-card grade-card">
          <div class="ratio-head">
            <span class="ratio-name">ICA Stenosis Grade</span>
            <span class="ratio-range">NASCET</span>
          </div>
          <div class="ratio-tiles">
            <div class="grade-tile">
              <span class="tile-side">Rt</span>
              <span class="grade-text">{{ gradeRight }}</span>
            </div>
            <div class="grade-tile">
              <span class="tile-side">Lt</span>
              <span class="grade-text">{{ gradeLeft }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: ICA Occlusion Assessment ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >ICA Occlusion / Pseudo-occlusion Assessment（阻塞評估）</span
        >
      </div>
      <div class="field-row">
        <label class="field">
          <span class="field-label">Right ICA status</span>
          <select v-model="icaStatus.right">
            <option v-for="o in icaStatusOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
        <label class="field">
          <span class="field-label">Left ICA status</span>
          <select v-model="icaStatus.left">
            <option v-for="o in icaStatusOptions" :key="o.v" :value="o.v">
              {{ o.l }}
            </option>
          </select>
        </label>
      </div>
      <div class="criteria-box">
        <div class="criteria-title">Reference criteria</div>
        <div class="crit-item">
          <span class="crit-label">Pseudo-occlusion</span>
          <ul class="crit-list">
            <li>B-mode thrombus with a possibly visible narrowed patent lumen</li>
            <li>String-sign / punctate color flash</li>
            <li>
              Markedly decreased velocity ± high resistance; slightly elevated
              turbulent flow with prolonged acceleration time
            </li>
          </ul>
        </div>
        <div class="crit-item">
          <span class="crit-label">Total occlusion</span>
          <ul class="crit-list">
            <li>B-mode thrombus filling the whole lumen</li>
            <li>No color signal (low-flow / high-sensitivity setting)</li>
            <li>No Doppler waveform</li>
          </ul>
        </div>
        <div class="crit-item">
          <span class="crit-label">Recent occlusion</span>
          <ul class="crit-list">
            <li>Homogeneous fresh thrombus (may move with pulsation)</li>
            <li>
              Possible spontaneous echo contrast proximal to the occlusion; may
              be hypoechogenic
            </li>
            <li>No color signal</li>
            <li>
              No waveform; may show a back-and-forth pattern proximal to the
              occlusion
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: B-mode Plaques ======================== -->
    <div class="cr-section">
      <div class="section-header section-header-row">
        <span class="section-label">B-mode Plaque Findings（斑塊型態）</span>
        <button class="btn-add" @click="addPlaque">+ Add Plaque</button>
      </div>
      <div v-for="p in plaques" :key="p.id" class="plaque-card">
        <div class="plaque-header">
          <span class="plaque-title">Plaque {{ plaques.indexOf(p) + 1 }}</span>
          <button class="btn-remove" @click="removePlaque(p.id)">✕</button>
        </div>
        <div class="plaque-grid">
          <label class="field"
            ><span class="field-label">Side</span>
            <select v-model="p.side">
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </label>
          <label class="field"
            ><span class="field-label">Site</span>
            <input v-model="p.site" placeholder="e.g. ICA bulb, BIF, mid CCA" />
          </label>
          <label class="field"
            ><span class="field-label">Distribution</span>
            <select v-model="p.distribution">
              <option v-for="o in distributionOptions" :key="o.v" :value="o.v">
                {{ o.l }}
              </option>
            </select>
          </label>
          <label class="field"
            ><span class="field-label">Internal (內徑)</span>
            <select v-model="p.internalPattern">
              <option v-for="o in internalOptions" :key="o.v" :value="o.v">
                {{ o.l }}
              </option>
            </select>
          </label>
          <label class="field"
            ><span class="field-label">Appearance (外觀)</span>
            <select v-model="p.appearance">
              <option v-for="o in appearanceOptions" :key="o.v" :value="o.v">
                {{ o.l }}
              </option>
            </select>
          </label>
          <label class="field"
            ><span class="field-label">Diameter (mm)</span>
            <input v-model="p.diameter" placeholder="e.g. 2.3" />
          </label>
          <label class="field"
            ><span class="field-label">Stenosis (D) %</span>
            <input v-model="p.stenosisD" placeholder="diameter %" />
          </label>
          <label class="field"
            ><span class="field-label">Stenosis (A) %</span>
            <input v-model="p.stenosisA" placeholder="area %" />
          </label>
          <label class="field"
            ><span class="field-label">Grade (from Area %)</span>
            <input
              :value="areaStenosisGrade(p.stenosisA)"
              readonly
              class="grade-output"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- ======================== SECTION: Other Findings ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label">Other Findings（其他發現）</span>
      </div>
      <textarea
        v-model="otherFindings"
        rows="3"
        placeholder="Any additional findings..."
      ></textarea>
    </div>

    <!-- ======================== SECTION: Auto Interpretation ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label"
          >Auto-generated Interpretation（自動解讀）</span
        >
      </div>
      <ol class="interp-list">
        <li v-for="(line, i) in interpretation" :key="i">
          {{ line.replace(/^\d+\)\s*/, "") }}
        </li>
      </ol>
      <button class="btn-add" @click="useAutoInterpretation">
        ↓ Copy into Impression
      </button>
    </div>

    <!-- ======================== SECTION: Impression ======================== -->
    <div class="cr-section">
      <div class="section-header">
        <span class="section-label">Impression（印象／結論）</span>
      </div>
      <textarea
        v-model="impression"
        rows="5"
        placeholder="Editable final impression — click 'Copy into Impression' above to prefill from the auto-generated interpretation."
      ></textarea>
    </div>

    <!-- ======================== ACTIONS ======================== -->
    <div class="cr-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起報告" : "產生報告" }}
      </button>
      <button class="btn-copy" @click="copyReport">
        {{ copied ? "已複製 ✓" : "複製 Markdown 報告" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>

    <div v-if="showResults" class="report-output">
      <div class="output-header">報告內容 (Report Output)</div>
      <pre class="output-body">{{ generateReport() }}</pre>
    </div>
  </div>
</template>

<style scoped>
.carotid-report {
  max-width: 920px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

.intro-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-brand-1);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.cr-section {
  margin-bottom: 1.25rem;
}
.section-header {
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  margin-bottom: 0.75rem;
}
.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-header-row .btn-add {
  margin-top: 0;
}
.section-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sub-section-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  margin: 0.75rem 0 0.4rem;
}
.probe-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.probe-tag {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}
.probe-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.34rem 0.8rem;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.probe-chip b {
  color: var(--vp-c-text-1);
  font-weight: 800;
}
.probe-ico {
  flex: none;
}
.probe-chip.tcd .probe-ico {
  color: var(--vp-c-brand-1);
}
.probe-chip.cca .probe-ico {
  color: #0d9488;
}
.dark .probe-chip.cca .probe-ico {
  color: #2dd4bf;
}
.intro-zh,
.intro-en {
  display: block;
}
.intro-en {
  margin-top: 0.2rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.field.wide {
  grid-column: span 2;
}
.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  letter-spacing: 0.02em;
}
.field input,
.field select {
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  transition: border-color 0.2s;
}
.field input:focus,
.field select:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.field select {
  cursor: pointer;
}
.small-field {
  margin-top: 0.5rem;
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.field-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

/* SVG reference diagram */
.svg-wrap {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 0.5rem;
  background: var(--vp-c-bg-soft);
  overflow-x: auto;
}
.ref-svg {
  width: 100%;
  height: auto;
  display: block;
}
.svg-label {
  font-size: 11px;
  font-weight: 700;
  fill: var(--vp-c-text-1);
}
.svg-label-sm {
  font-size: 9px;
  fill: var(--vp-c-text-2);
}
/* Diagram schematic + linked input clusters */
.dg-cow {
  fill: none;
  stroke: var(--vp-c-brand-1);
  stroke-width: 2.5;
  stroke-linecap: round;
}
.dg-vessel {
  fill: none;
  stroke: var(--vp-c-text-2);
  stroke-width: 2;
  stroke-linecap: round;
}
.dg-eye {
  fill: none;
  stroke: var(--vp-c-text-3);
  stroke-width: 1.5;
}
.dg-node {
  fill: var(--vp-c-brand-1);
  stroke: var(--vp-c-bg);
  stroke-width: 1.5;
}
.dg-leader {
  stroke: var(--vp-c-text-3);
  stroke-width: 1;
  stroke-dasharray: 3 3;
  opacity: 0.6;
}
.dg-cluster {
  box-sizing: border-box;
  height: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  padding: 5px 6px;
}
.dg-cluster-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.2;
  margin-bottom: 5px;
}
.dg-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5px 7px;
}
.dg-inputs label {
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.dg-inputs input {
  width: 100%;
  min-width: 0;
  padding: 3px 5px;
  font-size: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.dg-inputs input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

/* Vessel input blocks */
.vessel-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.6rem;
}
.vessel-grid.three-col {
  grid-template-columns: 1fr 1fr;
}
.vessel-block {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.6rem 0.8rem;
  background: var(--vp-c-bg-soft);
}
.vessel-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  display: block;
  margin-bottom: 0.4rem;
}
.vessel-dims {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.vessel-dims label {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.vessel-dims input {
  width: 100%;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.82rem;
  font-family: inherit;
}
.vessel-dims input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.ba-block {
  grid-column: 1 / -1;
}
.turb-check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  cursor: pointer;
}

/* Ratio cards */
.ratio-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.7rem;
}
.ratio-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 0.75rem 0.85rem;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.ratio-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}
.ratio-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ratio-range {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
.ratio-tiles {
  display: flex;
  gap: 0.5rem;
}
.ratio-tile {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.4rem;
  border-radius: 9px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.tile-side {
  font-size: 0.62rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
}
.tile-val {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-1);
}
.ratio-tile.flag-normal {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.ratio-tile.flag-normal .tile-val,
.ratio-tile.flag-normal .tile-side {
  color: var(--vp-c-brand-1);
}
.ratio-tile.flag-abnormal {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}
.ratio-tile.flag-abnormal .tile-val,
.ratio-tile.flag-abnormal .tile-side {
  color: #ef4444;
}
.ratio-note {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.grade-card {
  grid-column: span 2;
}
.grade-tile {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.8rem;
  border-radius: 9px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.grade-text {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

/* Criteria reference box */
.criteria-box {
  margin-top: 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0.7rem 0.9rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.76rem;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
.criteria-title {
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
}
.crit-item + .crit-item {
  margin-top: 0.55rem;
  padding-top: 0.55rem;
  border-top: 1px dashed var(--vp-c-divider);
}
.crit-label {
  display: inline-block;
  font-weight: 800;
  font-size: 0.76rem;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.3rem;
}
.crit-list {
  margin: 0;
  padding-left: 1.05rem;
  display: flex;
  flex-direction: column;
  gap: 0.22rem;
}
.crit-list li {
  line-height: 1.5;
}

/* Plaque cards */
.plaque-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  margin-bottom: 0.6rem;
  overflow: hidden;
}
.plaque-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.45rem 0.8rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.plaque-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.plaque-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  padding: 0.7rem;
}
.grade-output {
  font-weight: 700;
  background: var(--vp-c-bg-mute) !important;
  color: var(--vp-c-brand-1) !important;
  cursor: default;
}

.btn-remove {
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 1.1rem;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: background 0.15s;
}
.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
}

.btn-add {
  padding: 5px 14px;
  border: 1.5px solid var(--vp-c-brand-1);
  border-radius: 6px;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  margin-top: 0.5rem;
}
.btn-add:hover {
  background: var(--vp-c-brand-soft);
}

.interp-list {
  padding-left: 1.4rem;
  margin: 0;
  font-size: 0.85rem;
  line-height: 1.8;
  color: var(--vp-c-text-1);
}

textarea {
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
textarea:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.cr-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

.report-output {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
}
.output-header {
  padding: 0.55rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.output-body {
  padding: 1rem;
  font-size: 0.78rem;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: "SF Mono", "JetBrains Mono", monospace;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
  margin: 0;
}

@media (max-width: 640px) {
  .patient-grid,
  .field-row,
  .vessel-grid,
  .ratio-grid,
  .plaque-grid {
    grid-template-columns: 1fr;
  }
  .field.wide {
    grid-column: span 1;
  }
  .grade-card {
    grid-column: span 1;
  }
}
</style>
