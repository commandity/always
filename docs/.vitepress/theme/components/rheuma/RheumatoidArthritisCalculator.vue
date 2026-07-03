<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"r3" | "das" | "cdai">("r3");

// ══════════════ RAPID3 快速評估（Routine Assessment）══════════════

// ── RAPID3: Routine Assessment of Patient Index Data 3 ────────────
// Pincus 2008 — patient-reported outcome, no lab / no joint exam
// Part 1: MDHAQ 10 items × 0/1/2/3 → raw 0–30 → ÷3 → 0–10
// Part 2: Pain VAS 0–10
// Part 3: Global Health VAS 0–10
// RAPID3 = MDHAQ_scaled + Pain + GH → 0–30

// ── MDHAQ items (3 functional domains) ───────────────────────────
const items = [
  // ── 自我照顧（Self-Care） ─────────────────────────────────────
  {
    key: "q1",
    sub: "SC",
    name: "穿衣，包括鞋帶和鈕扣",
    en: "Dressing, including shoelaces and buttons",
    hint: "包含所有衣物穿脫，如拉鍊、扣鈕扣、綁鞋帶",
  },
  {
    key: "q2",
    sub: "SC",
    name: "起床和下床",
    en: "Getting in and out of bed",
    hint: "從床上起身或躺下的動作",
  },
  {
    key: "q3",
    sub: "SC",
    name: "將滿杯水舉到嘴邊",
    en: "Lifting a full cup or glass to your mouth",
    hint: "用手舉起裝滿水的杯子並喝水",
  },
  {
    key: "q5",
    sub: "SC",
    name: "清洗和擦乾全身",
    en: "Washing and drying your entire body",
    hint: "包含洗澡、淋浴及擦乾身體各部位",
  },
  {
    key: "q7",
    sub: "SC",
    name: "開關水龍頭",
    en: "Turning faucets on and off",
    hint: "旋轉或扳動水龍頭開關",
  },
  // ── 行動能力（Mobility） ──────────────────────────────────────
  {
    key: "q4",
    sub: "MB",
    name: "在平地上走路",
    en: "Walking on flat ground",
    hint: "在平坦地面上行走，不計算樓梯",
  },
  {
    key: "q6",
    sub: "MB",
    name: "彎腰從地板撿起衣物",
    en: "Bending down to pick up clothing from the floor",
    hint: "彎腰或蹲下從地上撿拾物品",
  },
  {
    key: "q8",
    sub: "MB",
    name: "上下車",
    en: "Getting in and out of a car",
    hint: "進出汽車的動作，包含推開車門",
  },
  // ── 生活參與（Activities） ────────────────────────────────────
  {
    key: "q9",
    sub: "AC",
    name: "步行兩英里或三公里",
    en: "Walk 2 miles or 3 km (if you wish)",
    hint: "持續步行較長距離的能力（如果您願意的話）",
  },
  {
    key: "q10",
    sub: "AC",
    name: "參加您喜歡的娛樂活動和運動",
    en: "Participate in sports and recreation (if you wish)",
    hint: "參與您有興趣的休閒活動或運動（如果您願意的話）",
  },
];

const domainDefs = {
  SC: { name: "自我照顧", sub: "Self-Care · 5 題", color: "sc", items: 5 },
  MB: { name: "行動能力", sub: "Mobility · 3 題", color: "mb", items: 3 },
  AC: { name: "生活參與", sub: "Activities · 2 題", color: "ac", items: 2 },
};

const diffOptions = [
  { value: 0, label: "沒有困難", desc: "No difficulty" },
  { value: 1, label: "有些困難", desc: "Some difficulty" },
  { value: 2, label: "很大困難", desc: "Much difficulty" },
  { value: 3, label: "無法進行", desc: "Unable to do" },
];

// ── State ─────────────────────────────────────────────────────────
const answers = ref<Record<string, number | null>>(
  Object.fromEntries(items.map((q) => [q.key, null])),
);
const painInput = ref("");
const r3_ghInput = ref("");
const r3_showResults = ref(false);
const r3_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => items.filter((q) => answers.value[q.key] !== null).length,
);
const allAnswered = computed(() => answeredCount.value === 10);

const mdhaqRaw = computed(() => {
  if (!allAnswered.value) return null;
  return items.reduce((sum, q) => sum + (answers.value[q.key] ?? 0), 0);
});
const mdhaqScore = computed(() =>
  mdhaqRaw.value !== null ? Math.round((mdhaqRaw.value / 3) * 10) / 10 : null,
);

const pain = computed(() => {
  const v = parseFloat(painInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const r3_gh = computed(() => {
  const v = parseFloat(r3_ghInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const r3_isComplete = computed(
  () => allAnswered.value && pain.value !== null && r3_gh.value !== null,
);

// RAPID3 = MDHAQ_scaled (0–10) + Pain (0–10) + GH (0–10)
const rapid3 = computed(() => {
  if (!r3_isComplete.value) return null;
  return Math.round((mdhaqScore.value! + pain.value! + r3_gh.value!) * 10) / 10;
});

// DAS28 ≈ 0.302 × RAPID3 + 1.671  (Pincus 2011)
const r3_das28Approx = computed(() =>
  rapid3.value !== null
    ? Math.round((0.302 * rapid3.value + 1.671) * 100) / 100
    : null,
);

// ── Severity ───────────────────────────────────────────────────────
const r3_severity = computed(() => {
  const r = rapid3.value;
  if (r === null)
    return {
      level: "待完成",
      color: "filling",
      tag: "—",
      advice: "請完成所有題目以計算 RAPID3",
    };
  if (r <= 3)
    return {
      level: "接近緩解（Near Remission）",
      color: "normal",
      tag: "近緩解",
      advice: "疾病活動性很低，症狀控制良好，維持現有治療方案並定期監測",
    };
  if (r <= 6)
    return {
      level: "輕度嚴重度（Low Severity）",
      color: "mild",
      tag: "輕度",
      advice: "輕度疾病活動性，需要持續監測，目標達到近緩解",
    };
  if (r <= 12)
    return {
      level: "中度嚴重度（Moderate）",
      color: "moderate",
      tag: "中度",
      advice: "中度疾病活動性，可能需要調整治療，建議與醫師討論",
    };
  return {
    level: "高度嚴重度（High Severity）",
    color: "severe",
    tag: "高度",
    advice: "高度疾病活動性，需要積極治療，請盡快回診調整方案",
  };
});

// ── Helpers ───────────────────────────────────────────────────────
function domainScore(d: "SC" | "MB" | "AC") {
  return items
    .filter((q) => q.sub === d)
    .reduce((sum, q) => sum + (answers.value[q.key] ?? 0), 0);
}
const scoreSC = computed(() => domainScore("SC"));
const scoreMB = computed(() => domainScore("MB"));
const scoreAC = computed(() => domainScore("AC"));

function r3_setVas(target: "pain" | "gh", val: number) {
  if (target === "pain") painInput.value = val.toString();
  else r3_ghInput.value = val.toString();
}

// ── Markdown ───────────────────────────────────────────────────────
function r3_generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = r3_severity.value;
  const qLines = items
    .map((q) => {
      const v = answers.value[q.key];
      const opt = diffOptions.find((o) => o.value === v);
      return `  - ${q.name}：${opt?.label ?? "未作答"}（${v ?? "—"}）`;
    })
    .join("\n");
  return `# RAPID3 快速評估指數評估結果\n\n## 評估日期：${date}\n\n## 第一部分：身體功能評估（MDHAQ）\n\n${qLines}\n\n- **MDHAQ 原始分**：${mdhaqRaw.value} / 30\n- **MDHAQ 換算分**：${mdhaqScore.value} / 10（÷3）\n\n## 第二部分 & 第三部分\n\n- **疼痛程度（Pain）**：${pain.value} / 10\n- **整體健康狀態（GH）**：${r3_gh.value} / 10\n\n## 計算結果\n\nRAPID3 = ${mdhaqScore.value} + ${pain.value} + ${r3_gh.value} = **${rapid3.value} / 30**\n\n- **疾病活動度**：${sv.level}\n- **臨床建議**：${sv.advice}\n- **DAS28 近似值**：≈ ${r3_das28Approx.value}\n\n> 切截值：≤ 3 接近緩解 / ≤ 6 輕度 / ≤ 12 中度 / > 12 高度`;
}

async function r3_copyMarkdown() {
  await navigator.clipboard.writeText(r3_generateMarkdown());
  r3_copied.value = true;
  setTimeout(() => (r3_copied.value = false), 2000);
}

function r3_reset() {
  items.forEach((q) => {
    answers.value[q.key] = null;
  });
  painInput.value = "";
  r3_ghInput.value = "";
  r3_showResults.value = false;
}

const domainOrder = ["SC", "MB", "AC"] as const;
const qIndex = (() => {
  const map: Record<string, number> = {};
  // original question numbers
  const nums: Record<string, number> = {
    q1: 1,
    q2: 2,
    q3: 3,
    q4: 4,
    q5: 5,
    q6: 6,
    q7: 7,
    q8: 8,
    q9: 9,
    q10: 10,
  };
  items.forEach((q) => {
    map[q.key] = nums[q.key];
  });
  return map;
})();

// ══════════════ DAS28 疾病活動（Disease Activity Score）══════════════

// ── All 28 joints mapped to SVG ellipse IDs ───────────────────────
const das_joints = [
  // Right large joints
  { key: "Rshoulder", label: "右肩", group: "large" },
  { key: "Relbow", label: "右肘", group: "large" },
  { key: "Rwrist", label: "右腕", group: "large" },
  { key: "Rknee", label: "右膝", group: "large" },
  // Left large joints
  { key: "Lshoulder", label: "左肩", group: "large" },
  { key: "Lelbow", label: "左肘", group: "large" },
  { key: "Lwrist", label: "左腕", group: "large" },
  { key: "Lknee", label: "左膝", group: "large" },
  // Right hand
  { key: "R1thPIP", label: "右 1st PIP", group: "rhand" },
  { key: "R1thMCP", label: "右 1st MCP", group: "rhand" },
  { key: "R2thPIP", label: "右 2nd PIP", group: "rhand" },
  { key: "R2thMCP", label: "右 2nd MCP", group: "rhand" },
  { key: "R3thPIP", label: "右 3rd PIP", group: "rhand" },
  { key: "R3thMCP", label: "右 3rd MCP", group: "rhand" },
  { key: "R4thPIP", label: "右 4th PIP", group: "rhand" },
  { key: "R4thMCP", label: "右 4th MCP", group: "rhand" },
  { key: "R5thPIP", label: "右 5th PIP", group: "rhand" },
  { key: "R5thMCP", label: "右 5th MCP", group: "rhand" },
  // Left hand
  { key: "L1thPIP", label: "左 1st PIP", group: "lhand" },
  { key: "L1thMCP", label: "左 1st MCP", group: "lhand" },
  { key: "L2thPIP", label: "左 2nd PIP", group: "lhand" },
  { key: "L2thMCP", label: "左 2nd MCP", group: "lhand" },
  { key: "L3thPIP", label: "左 3rd PIP", group: "lhand" },
  { key: "L3thMCP", label: "左 3rd MCP", group: "lhand" },
  { key: "L4thPIP", label: "左 4th PIP", group: "lhand" },
  { key: "L4thMCP", label: "左 4th MCP", group: "lhand" },
  { key: "L5thPIP", label: "左 5th PIP", group: "lhand" },
  { key: "L5thMCP", label: "左 5th MCP", group: "lhand" },
];

// ── SVG ellipse coordinates (from original SVG) ───────────────────
const ellipses: Record<
  string,
  { cx: number; cy: number; rx: number; ry: number }
> = {
  // Large joints — from real BODY.svg
  Rshoulder: { cx: 134.11, cy: 39.77, rx: 5.25, ry: 5.29 },
  Relbow: { cx: 126.03, cy: 69.08, rx: 5.24, ry: 5.29 },
  Rwrist: { cx: 120.78, cy: 93.27, rx: 5.24, ry: 5.29 },
  Rknee: { cx: 141.58, cy: 142.68, rx: 5.25, ry: 5.29 },
  Lshoulder: { cx: 194.07, cy: 39.77, rx: 5.24, ry: 5.29 },
  Lelbow: { cx: 200.38, cy: 69.08, rx: 5.25, ry: 5.29 },
  Lwrist: { cx: 207.39, cy: 94.71, rx: 5.24, ry: 5.29 },
  Lknee: { cx: 188.83, cy: 142.68, rx: 5.25, ry: 5.29 },
  // Right hand finger joints
  R1thPIP: { cx: 15.18, cy: 103.2, rx: 4.92, ry: 4.96 },
  R1thMCP: { cx: 24.32, cy: 117.2, rx: 4.92, ry: 4.96 },
  R2thPIP: { cx: 37.9, cy: 71.98, rx: 4.92, ry: 4.96 },
  R2thMCP: { cx: 38.1, cy: 94.71, rx: 4.92, ry: 4.96 },
  R3thPIP: { cx: 57.67, cy: 65.58, rx: 4.93, ry: 4.96 },
  R3thMCP: { cx: 57.67, cy: 93.27, rx: 4.93, ry: 4.96 },
  R4thPIP: { cx: 76.4, cy: 71.98, rx: 4.93, ry: 4.96 },
  R4thMCP: { cx: 75.47, cy: 94.71, rx: 4.92, ry: 4.96 },
  R5thPIP: { cx: 93.62, cy: 76.95, rx: 4.92, ry: 4.96 },
  R5thMCP: { cx: 93.51, cy: 95.78, rx: 4.93, ry: 4.96 },
  // Left hand finger joints
  L1thPIP: { cx: 314.6, cy: 104.63, rx: 4.92, ry: 4.96 },
  L1thMCP: { cx: 305.46, cy: 118.63, rx: 4.93, ry: 4.96 },
  L2thPIP: { cx: 291.88, cy: 73.42, rx: 4.92, ry: 4.96 },
  L2thMCP: { cx: 291.68, cy: 96.14, rx: 4.93, ry: 4.96 },
  L3thPIP: { cx: 272.11, cy: 67.02, rx: 4.93, ry: 4.96 },
  L3thMCP: { cx: 272.11, cy: 94.71, rx: 4.93, ry: 4.96 },
  L4thPIP: { cx: 253.37, cy: 73.42, rx: 4.92, ry: 4.96 },
  L4thMCP: { cx: 254.3, cy: 96.14, rx: 4.92, ry: 4.96 },
  L5thPIP: { cx: 236.16, cy: 78.38, rx: 4.93, ry: 4.96 },
  L5thMCP: { cx: 236.27, cy: 97.22, rx: 4.93, ry: 4.96 },
};

// ── State ─────────────────────────────────────────────────────────
const das_tender = ref<Record<string, boolean>>(
  Object.fromEntries(das_joints.map((j) => [j.key, false])),
);
const das_swollen = ref<Record<string, boolean>>(
  Object.fromEntries(das_joints.map((j) => [j.key, false])),
);
const das_mode = ref<"tender" | "swollen">("tender");
const das_hoveredKey = ref<string | null>(null);
const labMode = ref<"ESR" | "CRP">("ESR"); // which inflammatory marker
const esrInput = ref("");
const crpInput = ref("");
const das_ghInput = ref("");
const das_showResults = ref(false);
const das_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const das_tjc = computed(() => Object.values(das_tender.value).filter(Boolean).length);
const das_sjc = computed(() => Object.values(das_swollen.value).filter(Boolean).length);

const esr = computed(() => {
  const v = parseFloat(esrInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const crp = computed(() => {
  const v = parseFloat(crpInput.value);
  return isNaN(v) || v < 0 ? null : v;
});
const das_gh = computed(() => {
  const v = parseFloat(das_ghInput.value);
  return isNaN(v) || v < 0 || v > 100 ? null : v;
});

// whichever marker the user chose must be filled
const markerOk = computed(() =>
  labMode.value === "ESR" ? esr.value !== null : crp.value !== null,
);
const das_isComplete = computed(() => markerOk.value && das_gh.value !== null);

const das28 = computed(() => {
  if (!das_isComplete.value) return null;

  if (labMode.value === "ESR") {
    // DAS28-ESR = 0.56√TJC + 0.28√SJC + 0.70×ln(ESR) + 0.014×GH
    const val =
      0.56 * Math.sqrt(das_tjc.value) +
      0.28 * Math.sqrt(das_sjc.value) +
      0.7 * Math.log(esr.value!) +
      0.014 * das_gh.value!;
    return Math.round(val * 100) / 100;
  } else {
    // DAS28-CRP = 0.56√TJC + 0.28√SJC + 0.36×ln(CRP+1) + 0.014×GH + 0.96
    const val =
      0.56 * Math.sqrt(das_tjc.value) +
      0.28 * Math.sqrt(das_sjc.value) +
      0.36 * Math.log(crp.value! + 1) +
      0.014 * das_gh.value! +
      0.96;
    return Math.round(val * 100) / 100;
  }
});

const das_severity = computed(() => {
  const d = das28.value;
  if (d === null)
    return {
      level: "待完成",
      color: "filling",
      advice: "請輸入 ESR 及 GH 以計算 DAS28",
      tag: "—",
    };
  if (d < 2.6)
    return {
      level: "疾病緩解（Remission）",
      color: "normal",
      advice: "治療目標已達成，維持現有治療方案並定期監測",
      tag: "緩解期",
    };
  if (d < 3.2)
    return {
      level: "低度疾病活動（Low）",
      color: "mild",
      advice: "低度活動，維持治療並密切追蹤，目標達到緩解",
      tag: "低活動度",
    };
  if (d < 5.1)
    return {
      level: "中度疾病活動（Moderate）",
      color: "moderate",
      advice: "中度活動，建議調整治療方案，考慮加強 DMARD 或生物製劑",
      tag: "中活動度",
    };
  return {
    level: "高度疾病活動（High）",
    color: "severe",
    advice: "高度活動，強烈建議調整治療，評估生物製劑或 JAK 抑制劑",
    tag: "高活動度",
  };
});

// Joint state for colour
function state(key: string): "none" | "tender" | "swollen" | "both" {
  const t = das_tender.value[key],
    s = das_swollen.value[key];
  if (t && s) return "both";
  if (t) return "tender";
  if (s) return "swollen";
  return "none";
}

function das_clickJoint(key: string) {
  if (das_mode.value === "tender") das_tender.value[key] = !das_tender.value[key];
  else das_swollen.value[key] = !das_swollen.value[key];
}

// Fill colour per state
function jointFill(key: string): string {
  const s = state(key);
  if (s === "tender") return "rgba(239, 68, 68, 0.45)";
  if (s === "swollen") return "rgba(59, 130, 246, 0.45)";
  if (s === "both") return "rgba(124, 58, 237, 0.45)";
  return "rgba(255, 255, 255, 0.55)";
}
function jointStroke(key: string): string {
  const s = state(key);
  if (s === "tender") return "#ef4444";
  if (s === "swollen") return "#3b82f6";
  if (s === "both") return "#7c3aed";
  return "rgba(0, 0, 0, 0.15)";
}

function das_hoverFill(key: string): string | null {
  if (das_hoveredKey.value !== key) return null;
  const s = state(key);
  const m = das_mode.value;
  if (s === "none")
    return m === "tender"
      ? "rgba(239, 68, 68, 0.18)"
      : "rgba(59, 130, 246, 0.18)";
  if (
    (s === "tender" && m === "swollen") ||
    (s === "swollen" && m === "tender")
  )
    return "rgba(124, 58, 237, 0.3)";
  return null;
}
function das_hoverStroke(key: string): string | null {
  if (das_hoveredKey.value !== key) return null;
  const s = state(key);
  const m = das_mode.value;
  if (s === "none") return m === "tender" ? "#ef4444" : "#3b82f6";
  if (
    (s === "tender" && m === "swollen") ||
    (s === "swollen" && m === "tender")
  )
    return "#7c3aed";
  return null;
}

function das_generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const tList =
    das_joints
      .filter((j) => das_tender.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  const sList =
    das_joints
      .filter((j) => das_swollen.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  const sv = das_severity.value;
  const labLine =
    labMode.value === "ESR"
      ? `- **ESR**：${esrInput.value} mm/hour`
      : `- **CRP**：${crpInput.value} mg/L`;
  const formulaLine =
    labMode.value === "ESR"
      ? `DAS28-ESR = 0.56 × √${das_tjc.value} + 0.28 × √${das_sjc.value} + 0.70 × ln(${esrInput.value}) + 0.014 × ${das_ghInput.value}`
      : `DAS28-CRP = 0.56 × √${das_tjc.value} + 0.28 × √${das_sjc.value} + 0.36 × ln(${crpInput.value}+1) + 0.014 × ${das_ghInput.value} + 0.96`;

  return `# DAS28 類風濕性關節炎疾病活動指數評估結果\n\n## 評估日期：${date}\n\n## 關節評估\n\n- **觸痛關節數（TJC28）**：${das_tjc.value} 個\n  - 觸痛關節：${tList}\n- **腫脹關節數（SJC28）**：${das_sjc.value} 個\n  - 腫脹關節：${sList}\n\n## 實驗室及整體評估\n\n${labLine}\n- **GH 整體健康狀態**：${das_ghInput.value} 分（0–100）\n\n## 計算結果\n\n${formulaLine}\n\n**DAS28 分數：${das28.value}**（版本：DAS28-${labMode.value}）\n\n- **疾病活動度**：${sv.level}\n- **臨床建議**：${sv.advice}`;
}

async function das_copyMarkdown() {
  await navigator.clipboard.writeText(das_generateMarkdown());
  das_copied.value = true;
  setTimeout(() => (das_copied.value = false), 2000);
}

function das_reset() {
  das_joints.forEach((j) => {
    das_tender.value[j.key] = false;
    das_swollen.value[j.key] = false;
  });
  esrInput.value = "";
  crpInput.value = "";
  das_ghInput.value = "";
  das_showResults.value = false;
}

// ══════════════ CDAI 臨床活動（Clinical Disease Activity）══════════════

// ── 28 Joint definitions ──────────────────────────────────────────
const cdai_joints = [
  { key: "Rshoulder", label: "右肩" },
  { key: "Lshoulder", label: "左肩" },
  { key: "Relbow", label: "右肘" },
  { key: "Lelbow", label: "左肘" },
  { key: "Rwrist", label: "右腕" },
  { key: "Lwrist", label: "左腕" },
  { key: "Rknee", label: "右膝" },
  { key: "Lknee", label: "左膝" },
  { key: "R1thPIP", label: "右拇 PIP" },
  { key: "R1thMCP", label: "右拇 MCP" },
  { key: "R2thPIP", label: "右食 PIP" },
  { key: "R2thMCP", label: "右食 MCP" },
  { key: "R3thPIP", label: "右中 PIP" },
  { key: "R3thMCP", label: "右中 MCP" },
  { key: "R4thPIP", label: "右無 PIP" },
  { key: "R4thMCP", label: "右無 MCP" },
  { key: "R5thPIP", label: "右小 PIP" },
  { key: "R5thMCP", label: "右小 MCP" },
  { key: "L1thPIP", label: "左拇 PIP" },
  { key: "L1thMCP", label: "左拇 MCP" },
  { key: "L2thPIP", label: "左食 PIP" },
  { key: "L2thMCP", label: "左食 MCP" },
  { key: "L3thPIP", label: "左中 PIP" },
  { key: "L3thMCP", label: "左中 MCP" },
  { key: "L4thPIP", label: "左無 PIP" },
  { key: "L4thMCP", label: "左無 MCP" },
  { key: "L5thPIP", label: "左小 PIP" },
  { key: "L5thMCP", label: "左小 MCP" },
];

// ── SVG ellipse coordinates (from real BODY.svg) ──────────────────
const E: Record<string, { cx: number; cy: number; rx: number; ry: number }> = {
  Rshoulder: { cx: 134.11, cy: 39.77, rx: 5.25, ry: 5.29 },
  Relbow: { cx: 126.03, cy: 69.08, rx: 5.24, ry: 5.29 },
  Rwrist: { cx: 120.78, cy: 93.27, rx: 5.24, ry: 5.29 },
  Rknee: { cx: 141.58, cy: 142.68, rx: 5.25, ry: 5.29 },
  Lshoulder: { cx: 194.07, cy: 39.77, rx: 5.24, ry: 5.29 },
  Lelbow: { cx: 200.38, cy: 69.08, rx: 5.25, ry: 5.29 },
  Lwrist: { cx: 207.39, cy: 94.71, rx: 5.24, ry: 5.29 },
  Lknee: { cx: 188.83, cy: 142.68, rx: 5.25, ry: 5.29 },
  R1thPIP: { cx: 15.18, cy: 103.2, rx: 4.92, ry: 4.96 },
  R1thMCP: { cx: 24.32, cy: 117.2, rx: 4.92, ry: 4.96 },
  R2thPIP: { cx: 37.9, cy: 71.98, rx: 4.92, ry: 4.96 },
  R2thMCP: { cx: 38.1, cy: 94.71, rx: 4.92, ry: 4.96 },
  R3thPIP: { cx: 57.67, cy: 65.58, rx: 4.93, ry: 4.96 },
  R3thMCP: { cx: 57.67, cy: 93.27, rx: 4.93, ry: 4.96 },
  R4thPIP: { cx: 76.4, cy: 71.98, rx: 4.93, ry: 4.96 },
  R4thMCP: { cx: 75.47, cy: 94.71, rx: 4.92, ry: 4.96 },
  R5thPIP: { cx: 93.62, cy: 76.95, rx: 4.92, ry: 4.96 },
  R5thMCP: { cx: 93.51, cy: 95.78, rx: 4.93, ry: 4.96 },
  L1thPIP: { cx: 314.6, cy: 104.63, rx: 4.92, ry: 4.96 },
  L1thMCP: { cx: 305.46, cy: 118.63, rx: 4.93, ry: 4.96 },
  L2thPIP: { cx: 291.88, cy: 73.42, rx: 4.92, ry: 4.96 },
  L2thMCP: { cx: 291.68, cy: 96.14, rx: 4.93, ry: 4.96 },
  L3thPIP: { cx: 272.11, cy: 67.02, rx: 4.93, ry: 4.96 },
  L3thMCP: { cx: 272.11, cy: 94.71, rx: 4.93, ry: 4.96 },
  L4thPIP: { cx: 253.37, cy: 73.42, rx: 4.92, ry: 4.96 },
  L4thMCP: { cx: 254.3, cy: 96.14, rx: 4.92, ry: 4.96 },
  L5thPIP: { cx: 236.16, cy: 78.38, rx: 4.93, ry: 4.96 },
  L5thMCP: { cx: 236.27, cy: 97.22, rx: 4.93, ry: 4.96 },
};

// ── State ─────────────────────────────────────────────────────────
const cdai_tender = ref<Record<string, boolean>>(
  Object.fromEntries(cdai_joints.map((j) => [j.key, false])),
);
const cdai_swollen = ref<Record<string, boolean>>(
  Object.fromEntries(cdai_joints.map((j) => [j.key, false])),
);
const cdai_mode = ref<"tender" | "swollen">("tender");
const cdai_hoveredKey = ref<string | null>(null);
const pgaInput = ref("");
const egaInput = ref("");
const cdai_showResults = ref(false);
const cdai_copied = ref(false);

// ── Joint helpers ─────────────────────────────────────────────────
function jState(key: string) {
  const t = cdai_tender.value[key],
    s = cdai_swollen.value[key];
  if (t && s) return "both";
  if (t) return "tender";
  if (s) return "swollen";
  return "none";
}
function jFill(key: string) {
  const s = jState(key);
  if (s === "tender") return "rgba(239, 68, 68, 0.45)";
  if (s === "swollen") return "rgba(59, 130, 246, 0.45)";
  if (s === "both") return "rgba(124, 58, 237, 0.45)";
  return "rgba(255, 255, 255, 0.55)";
}
function jStroke(key: string) {
  const s = jState(key);
  if (s === "tender") return "#ef4444";
  if (s === "swollen") return "#3b82f6";
  if (s === "both") return "#7c3aed";
  return "rgba(0, 0, 0, 0.15)";
}
function cdai_hoverFill(key: string): string | null {
  if (cdai_hoveredKey.value !== key) return null;
  const s = jState(key);
  const m = cdai_mode.value;
  if (s === "none")
    return m === "tender"
      ? "rgba(239, 68, 68, 0.18)"
      : "rgba(59, 130, 246, 0.18)";
  if (
    (s === "tender" && m === "swollen") ||
    (s === "swollen" && m === "tender")
  )
    return "rgba(124, 58, 237, 0.3)";
  return null;
}
function cdai_hoverStroke(key: string): string | null {
  if (cdai_hoveredKey.value !== key) return null;
  const s = jState(key);
  const m = cdai_mode.value;
  if (s === "none") return m === "tender" ? "#ef4444" : "#3b82f6";
  if (
    (s === "tender" && m === "swollen") ||
    (s === "swollen" && m === "tender")
  )
    return "#7c3aed";
  return null;
}
function cdai_clickJoint(key: string) {
  if (cdai_mode.value === "tender") cdai_tender.value[key] = !cdai_tender.value[key];
  else cdai_swollen.value[key] = !cdai_swollen.value[key];
}

// ── Computed scores ───────────────────────────────────────────────
const cdai_tjc = computed(() => Object.values(cdai_tender.value).filter(Boolean).length);
const cdai_sjc = computed(() => Object.values(cdai_swollen.value).filter(Boolean).length);
const pga = computed(() => {
  const v = parseFloat(pgaInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const ega = computed(() => {
  const v = parseFloat(egaInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const cdai_isComplete = computed(() => pga.value !== null && ega.value !== null);

// CDAI = TJC + SJC + PGA + EGA  (range 0–76)
const cdai = computed(() => {
  if (!cdai_isComplete.value) return null;
  return (
    Math.round((cdai_tjc.value + cdai_sjc.value + pga.value! + ega.value!) * 10) / 10
  );
});

// DAS28 approximate (Smolen 2005)
const cdai_das28Approx = computed(() =>
  cdai.value !== null
    ? Math.round((0.0554 * cdai.value + 2.213) * 100) / 100
    : null,
);

// ── Severity ───────────────────────────────────────────────────────
const cdai_severity = computed(() => {
  const c = cdai.value;
  if (c === null)
    return {
      level: "待完成",
      color: "filling",
      advice: "請填寫 PGA 及 EGA 以計算 CDAI",
      tag: "—",
    };
  if (c <= 2.8)
    return {
      level: "疾病緩解（Remission）",
      color: "normal",
      advice: "治療目標達成，維持現有方案並定期監測",
      tag: "緩解期",
    };
  if (c <= 10)
    return {
      level: "低度活動（Low）",
      color: "mild",
      advice: "低度活動，維持治療並密切追蹤，目標達到緩解",
      tag: "低活動度",
    };
  if (c <= 22)
    return {
      level: "中度活動（Moderate）",
      color: "moderate",
      advice: "中度活動，建議調整治療方案，考慮強化 DMARD 或生物製劑",
      tag: "中活動度",
    };
  return {
    level: "高度活動（High）",
    color: "severe",
    advice: "高度活動，強烈建議調整治療，評估生物製劑或 JAK 抑制劑",
    tag: "高活動度",
  };
});

// ── VAS slider ────────────────────────────────────────────────────
function cdai_setVas(target: "pga" | "ega", val: number) {
  const str = val.toString();
  if (target === "pga") pgaInput.value = str;
  else egaInput.value = str;
}

// ── Markdown output ───────────────────────────────────────────────
function cdai_generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = cdai_severity.value;
  const tList =
    cdai_joints
      .filter((j) => cdai_tender.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  const sList =
    cdai_joints
      .filter((j) => cdai_swollen.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  return `# CDAI 臨床疾病活動指數評估結果

## 評估日期：${date}

## 關節評估

- **觸痛關節數（TJC28）**：${cdai_tjc.value} 個（${tList}）
- **腫脹關節數（SJC28）**：${cdai_sjc.value} 個（${sList}）

## 整體評估

- **患者整體評估（PGA）**：${pga.value} 分（0–10）
- **醫師整體評估（EGA）**：${ega.value} 分（0–10）

## 計算結果

CDAI = ${cdai_tjc.value} + ${cdai_sjc.value} + ${pga.value} + ${ega.value} = **${cdai.value} / 76**

- **疾病活動度**：${sv.level}
- **臨床建議**：${sv.advice}
- **DAS28 近似值**：≈ ${cdai_das28Approx.value}（換算參考，不可替代直接計算）

> 切截值：≤ 2.8 緩解 / ≤ 10 低 / ≤ 22 中 / > 22 高`;
}

async function cdai_copyMarkdown() {
  await navigator.clipboard.writeText(cdai_generateMarkdown());
  cdai_copied.value = true;
  setTimeout(() => (cdai_copied.value = false), 2000);
}

function cdai_reset() {
  cdai_joints.forEach((j) => {
    cdai_tender.value[j.key] = false;
    cdai_swollen.value[j.key] = false;
  });
  pgaInput.value = "";
  egaInput.value = "";
  cdai_showResults.value = false;
}
</script>

<template>
  <div class="raassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'r3' }"
        @click="activeTab = 'r3'"
      >
        <span class="tab-label">RAPID3 快速評估</span>
        <span class="tab-sub">Routine Assessment</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'das' }"
        @click="activeTab = 'das'"
      >
        <span class="tab-label">DAS28 疾病活動</span>
        <span class="tab-sub">Disease Activity Score</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cdai' }"
        @click="activeTab = 'cdai'"
      >
        <span class="tab-label">CDAI 臨床活動</span>
        <span class="tab-sub">Clinical Disease Activity</span>
      </button>
    </div>

  <div v-show="activeTab === 'r3'" class="r3">
    <!-- Header -->
    <div class="r3-header">
      <div class="header-title">
        <h2 class="title">RAPID3 快速評估指數</h2>
        <p class="subtitle">
          Routine Assessment of Patient Index Data 3 · 患者自填 ·
          無需關節檢查或實驗室 · 約 3 分鐘
        </p>
      </div>
      <div class="score-badge" :class="r3_severity.color">
        <span class="score-number">{{ rapid3 ?? "—" }}</span>
        <span class="score-label">{{ r3_severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="r3_severity.color"
          :style="{
            width:
              rapid3 !== null ? Math.min((rapid3 / 30) * 100, 100) + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-g">3</span>
        <span class="tick-y">6</span>
        <span class="tick-o">12</span>
        <span>30</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 <= 3 }"
      >
        <span class="risk-score">≤ 3</span>
        <span class="risk-rate normal-risk">接近緩解</span>
        <span class="risk-tag">Near Remission</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 > 3 && rapid3 <= 6 }"
      >
        <span class="risk-score">3.1–6</span>
        <span class="risk-rate mild-risk">輕度</span>
        <span class="risk-tag">Low Severity</span>
      </div>
      <div
        class="risk-pill"
        :class="{
          'risk-active': rapid3 !== null && rapid3 > 6 && rapid3 <= 12,
        }"
      >
        <span class="risk-score">6.1–12</span>
        <span class="risk-rate moderate-risk">中度</span>
        <span class="risk-tag">Moderate</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 > 12 }"
      >
        <span class="risk-score">&gt; 12</span>
        <span class="risk-rate severe-risk">高度</span>
        <span class="risk-tag">High Severity</span>
      </div>
    </div>

    <!-- Sub-scores -->
    <div class="sub-scores">
      <div class="sub-pill sc-pill">
        <span class="sub-label">自我照顧（SC）</span>
        <span class="sub-val">{{ scoreSC }}</span>
      </div>
      <div class="sub-pill mb-pill">
        <span class="sub-label">行動能力（MB）</span>
        <span class="sub-val">{{ scoreMB }}</span>
      </div>
      <div class="sub-pill ac-pill">
        <span class="sub-label">生活參與（AC）</span>
        <span class="sub-val">{{ scoreAC }}</span>
      </div>
      <div class="sub-pill mdhaq-pill">
        <span class="sub-label">MDHAQ 換算（÷3）</span>
        <span class="sub-val">{{ mdhaqScore ?? "—" }}</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請根據您<strong>過去一週</strong>的情況填寫以下問題。第一部分共 10
        題，每題選一個選項；第二、三部分為數字評分（0–10）。完全由患者自行填寫，不需要醫師進行關節檢查。</span
      >
    </div>

    <!-- ── PART 1: MDHAQ groups ─────────────────────────────────── -->
    <div v-for="dk in domainOrder" :key="dk" class="r3-group">
      <div class="group-header" :class="domainDefs[dk].color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ domainDefs[dk].name }}</span>
          <span class="group-sub">{{ domainDefs[dk].sub }}</span>
        </div>
        <div class="group-score-pill" :class="domainDefs[dk].color + '-pill'">
          {{ dk === "SC" ? scoreSC : dk === "MB" ? scoreMB : scoreAC }} 分
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="item in items.filter((q) => q.sub === dk)"
          :key="item.key"
          class="r3-item"
          :class="{
            active: answers[item.key] !== null && answers[item.key]! > 0,
            flagged: answers[item.key] !== null && answers[item.key]! >= 2,
            answered: answers[item.key] !== null,
            high: answers[item.key] !== null && answers[item.key]! >= 2,
            [domainDefs[dk].color + '-active']:
              answers[item.key] !== null && answers[item.key]! > 0,
          }"
        >
          <div class="item-header">
            <span class="item-qnum" :class="domainDefs[dk].color + '-qnum'">
              Q{{ qIndex[item.key] }}
            </span>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.en }}</span>
              <span class="item-hint">{{ item.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                'score-null': answers[item.key] === null,
                'score-zero': answers[item.key] === 0,
                'score-flagged':
                  answers[item.key] !== null && answers[item.key]! >= 2,
              }"
            >
              {{ answers[item.key] !== null ? answers[item.key] : "—" }}
            </span>
          </div>

          <!-- 4-column option row -->
          <div class="option-row">
            <label
              v-for="opt in diffOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: answers[item.key] === opt.value,
                flagged: answers[item.key] === opt.value && opt.value >= 2,
                [domainDefs[dk].color + '-opt']:
                  answers[item.key] === opt.value && opt.value > 0,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="opt.value"
                v-model="answers[item.key]"
              />
              <span class="opt-num">{{ opt.value }}</span>
              <span class="opt-desc">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- MDHAQ footer -->
    <div class="mdhaq-footer" v-if="allAnswered">
      <span class="mf-label">MDHAQ 原始分：</span>
      <span class="mf-raw">{{ mdhaqRaw }} / 30</span>
      <span class="mf-arrow">→ 換算（÷3）→</span>
      <span class="mf-score">{{ mdhaqScore }} / 10</span>
    </div>
    <div class="mdhaq-footer mf-pending" v-else>
      <span class="intro-dot">◉</span> 第一部分尚有
      {{ 10 - answeredCount }} 題未作答
    </div>

    <!-- ── PART 2: Pain VAS ─────────────────────────────────────── -->
    <div class="vas-section">
      <div class="vas-section-header">
        <div class="vas-header-left">
          <span class="vas-part-num pain-num">2</span>
          <div>
            <span class="vas-part-title"
              >疼痛程度 <span class="vas-abbr">Pain</span></span
            >
            <span class="vas-part-sub"
              >請評估過去一週因關節炎引起的疼痛 · 0 = 無痛，10 = 最嚴重</span
            >
          </div>
        </div>
        <div class="vas-score-box" :class="{ 'vsb-filled': painInput !== '' }">
          <input
            v-model="painInput"
            type="number"
            min="0"
            max="10"
            step="0.5"
            placeholder="0–10"
            class="vas-score-input"
          />
        </div>
      </div>
      <div class="vas-slider-wrap">
        <span class="vas-anchor-l">0<br /><small>無痛</small></span>
        <div class="vas-track">
          <div
            class="pain-fill"
            :style="{ width: pain !== null ? (pain / 10) * 100 + '%' : '0%' }"
          />
          <div
            class="vas-thumb pain-thumb"
            v-if="pain !== null"
            :style="{ left: (pain / 10) * 100 + '%' }"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            :value="pain ?? 0"
            @input="
              r3_setVas(
                'pain',
                parseFloat(($event.target as HTMLInputElement).value),
              )
            "
            class="vas-range"
          />
        </div>
        <span class="vas-anchor-r">10<br /><small>極痛</small></span>
      </div>
    </div>

    <!-- ── PART 3: GH VAS ──────────────────────────────────────── -->
    <div class="vas-section">
      <div class="vas-section-header">
        <div class="vas-header-left">
          <span class="vas-part-num gh-num">3</span>
          <div>
            <span class="vas-part-title"
              >整體健康狀態 <span class="vas-abbr">GH</span></span
            >
            <span class="vas-part-sub"
              >考慮過去一週疾病、身體、情緒和社交各方面 · 0 = 非常好，10 =
              非常差</span
            >
          </div>
        </div>
        <div class="vas-score-box" :class="{ 'vsb-filled': r3_ghInput !== '' }">
          <input
            v-model="r3_ghInput"
            type="number"
            min="0"
            max="10"
            step="0.5"
            placeholder="0–10"
            class="vas-score-input"
          />
        </div>
      </div>
      <div class="vas-slider-wrap">
        <span class="vas-anchor-l">0<br /><small>很好</small></span>
        <div class="vas-track">
          <div
            class="gh-fill"
            :style="{ width: r3_gh !== null ? (r3_gh / 10) * 100 + '%' : '0%' }"
          />
          <div
            class="vas-thumb gh-thumb"
            v-if="r3_gh !== null"
            :style="{ left: (r3_gh / 10) * 100 + '%' }"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            :value="r3_gh ?? 0"
            @input="
              r3_setVas(
                'gh',
                parseFloat(($event.target as HTMLInputElement).value),
              )
            "
            class="vas-range"
          />
        </div>
        <span class="vas-anchor-r">10<br /><small>很差</small></span>
      </div>
    </div>

    <!-- Result card -->
    <div class="r3-result" :class="r3_severity.color">
      <div class="result-left">
        <span class="result-number">{{ rapid3 ?? "—" }}</span>
        <span class="result-max">/ 30</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ r3_severity.level }}</span>
        <span class="result-advice">{{ r3_severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill sc-pill-sm"
            >MDHAQ：{{ mdhaqScore ?? "—" }}</span
          >
          <span class="breakdown-pill mb-pill-sm">疼痛：{{ pain ?? "—" }}</span>
          <span class="breakdown-pill ac-pill-sm">整體：{{ r3_gh ?? "—" }}</span>
          <span class="breakdown-pill approx-pill" v-if="r3_das28Approx"
            >≈ DAS28 {{ r3_das28Approx }}</span
          >
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="r3_showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div v-for="dk in domainOrder" :key="dk">
        <div
          class="detail-section-title"
          :class="domainDefs[dk].color + '-section'"
        >
          {{ domainDefs[dk].name }}（{{
            dk === "SC" ? scoreSC : dk === "MB" ? scoreMB : scoreAC
          }}
          分）
        </div>
        <div
          v-for="item in items.filter((q) => q.sub === dk)"
          :key="item.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ qIndex[item.key] }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              brand: answers[item.key] !== null && answers[item.key]! > 0,
              flagged: answers[item.key] !== null && answers[item.key]! >= 2,
              zero: answers[item.key] === 0,
            }"
          >
            {{ answers[item.key] !== null ? answers[item.key] : "—" }}
          </span>
          <span class="detail-desc">{{
            diffOptions.find((o) => o.value === answers[item.key])?.label ?? "—"
          }}</span>
        </div>
      </div>

      <div
        class="detail-section-title"
        style="color: #6366f1; background: rgba(99, 102, 241, 0.05)"
      >
        VAS 評估
      </div>
      <div class="detail-row">
        <span class="detail-qnum">P2</span>
        <span class="detail-domain">疼痛程度（Pain）</span>
        <span class="detail-score brand">{{ pain ?? "—" }}</span>
        <span class="detail-desc">/ 10</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">P3</span>
        <span class="detail-domain">整體健康狀態（GH）</span>
        <span class="detail-score brand">{{ r3_gh ?? "—" }}</span>
        <span class="detail-desc">/ 10</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">RAPID3 總分</span>
        <span class="detail-score brand">{{ rapid3 ?? "—" }}</span>
        <span class="detail-desc">{{ r3_severity.tag }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="r3-actions">
      <button class="btn-view" @click="r3_showResults = !r3_showResults">
        {{ r3_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!r3_isComplete" @click="r3_copyMarkdown">
        {{ r3_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="r3_reset">重置</button>
    </div>
    <p class="progress-hint" v-if="answeredCount > 0 && !r3_isComplete">
      {{
        allAnswered
          ? "請完成疼痛及整體健康評估"
          : `第一部分已完成 ${answeredCount} / 10 題`
      }}
    </p>
  </div>

  <div v-show="activeTab === 'das'" class="das">
    <!-- Header -->
    <div class="das-header">
      <div class="header-title">
        <h2 class="title">DAS28 疾病活動指數</h2>
        <p class="subtitle">
          Disease Activity Score 28 · 類風濕性關節炎活動度評估
        </p>
      </div>
      <div class="score-badge" :class="das_severity.color">
        <span class="score-number">{{ das28 ?? "—" }}</span>
        <span class="score-label">{{ das_severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="das_severity.color"
          :style="{
            width:
              das28 !== null ? Math.min((das28 / 8) * 100, 100) + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span><span class="tick-threshold">2.6</span> <span>3.2</span
        ><span>5.1</span><span>8</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div
        class="risk-pill"
        :class="{ 'risk-active': das28 !== null && das28 < 2.6 }"
      >
        <span class="risk-score">&lt; 2.6</span>
        <span class="risk-rate normal-risk">緩解期</span>
        <span class="risk-tag">Remission</span>
      </div>
      <div
        class="risk-pill"
        :class="{
          'risk-active': das28 !== null && das28 >= 2.6 && das28 < 3.2,
        }"
      >
        <span class="risk-score">2.6–3.2</span>
        <span class="risk-rate mild-risk">低活動度</span>
        <span class="risk-tag">Low Activity</span>
      </div>
      <div
        class="risk-pill"
        :class="{
          'risk-active': das28 !== null && das28 >= 3.2 && das28 < 5.1,
        }"
      >
        <span class="risk-score">3.2–5.1</span>
        <span class="risk-rate moderate-risk">中活動度</span>
        <span class="risk-tag">Moderate</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': das28 !== null && das28 >= 5.1 }"
      >
        <span class="risk-score">&gt; 5.1</span>
        <span class="risk-rate severe-risk">高活動度</span>
        <span class="risk-tag">High Activity</span>
      </div>
    </div>

    <!-- ══ 關節評估（與 CDAI 同款結構）══ -->
    <div class="step-card">
      <div class="step-header">
        <div class="step-info">
          <span class="step-title">關節評估（28 個關節）</span>
          <span class="step-sub">點擊身體圖上的白色圓點標記關節狀態</span>
        </div>
        <div class="step-counts">
          <div class="sc-item tender-sc">
            <span class="sc-dot"></span>
            <span class="sc-n">{{ das_tjc }}</span>
            <span class="sc-lbl">觸痛</span>
          </div>
          <div class="sc-item swollen-sc">
            <span class="sc-dot2"></span>
            <span class="sc-n">{{ das_sjc }}</span>
            <span class="sc-lbl">腫脹</span>
          </div>
        </div>
      </div>

      <!-- Mode toggle -->
      <div class="mode-row">
        <button
          class="mode-btn"
          :class="das_mode === 'tender' ? 'mode-btn-tender' : 'mode-btn-off'"
          @click="das_mode = 'tender'"
        >
          <span class="mbdot" style="background: #ef4444"></span>
          觸痛（TJC）· {{ das_tjc }} 個
        </button>
        <button
          class="mode-btn"
          :class="das_mode === 'swollen' ? 'mode-btn-swollen' : 'mode-btn-off'"
          @click="das_mode = 'swollen'"
        >
          <span class="mbdot" style="background: #3b82f6"></span>
          腫脹（SJC）· {{ das_sjc }} 個
        </button>
      </div>

      <!-- SVG Body diagram -->
      <div class="diagram-wrap">
      <svg
        viewBox="0 0 329.79 200"
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        class="body-svg"
      >
        <!-- Real body from BODY.svg -->
        <path
          fill-rule="evenodd"
          d="M221.16,105.56c-.47-.54-.91-1.08-1.39-1.62-.64-.71-.98-1.49-1.24-2.3-.33-1.01-.68-2.01-1.03-3.02-.28-.83-.87-1.53-1.72-2.17-1.19-.91-2.23-1.91-3.3-2.89-.21-.19-.32-.44-.37-.67-.1-.48-.1-.97-.17-1.45-.19-1.28-.45-2.57-.59-3.85-.23-2.17-.37-4.34-.57-6.51-.16-1.76-.31-3.52-.54-5.27-.36-2.75-1.17-5.44-2.76-8.01-.11-.18-.13-.41-.11-.62.06-.51.22-1.02.26-1.54.12-1.6.04-3.2-.3-4.78-.74-3.48-2.11-6.92-3.68-10.27-.13-.3-.23-.62-.22-.93.03-.5.19-.99.25-1.49.06-.54.01-1.09.12-1.63.24-1.22.18-2.43-.14-3.63-.51-1.96-1.81-4.1-3.52-6.05-1.65-1.88-3.77-2.95-6.12-3.98-1.1-.48-2.26-.82-3.52-1.05-1.29-.24-2.64-.24-3.9-.62-.54-.16-1.13-.26-1.66-.44-2.21-.78-4.38-1.62-6.6-2.39-1.62-.56-3.28-1.04-4.95-1.52-.58-.17-.64-.13-.7-.53-.32-2.28.39-4.68.39-4.76,0-.01-.01-.02-.01-.04.03-.03.06-.05.09-.08.47-.5.82-1.03.95-1.63.09-.42.18-.83.27-1.25.7.07,1.38.03,1.73-.31.26-.25.34-.54.56-.81.22-.29.6-.51.9-.76.64-.51.79-1.24.8-1.93,0-.62.17-2.08-1.04-2.24-.26-.03-.61.11-.92.28,0,0,0-.02,0-.03.12-.61.1-1.23.32-1.84.78-2.17.29-4.32-1.12-6.13-1.83-2.33-5.22-4.09-9.45-4.61-10.09-1.23-18.52,3.6-17.28,10.63.11.61.42,1.2.68,1.79.04.07.09.15.13.22-.33-.19-.71-.35-.99-.32-1.21.16-1.05,1.63-1.04,2.24,0,.69.16,1.41.8,1.93.3.24.68.47.9.76.21.28.3.56.56.81.42.41,1.34.38,2.17.25.06.21.09.42.11.63.06.73.31,1.42.89,2.04.25.26.52.52.78.78.15,1.15.48,3.49.56,3.97.11.63-.3.83-1.2,1.12-.08.02-.17.05-.25.08-1.48.49-2.98.96-4.43,1.5-1.99.73-3.95,1.51-5.93,2.28-1,.39-2.02.75-3.13.88-.47.05-.95.09-1.4.18-1,.21-2.08.32-2.97.67-3.01,1.19-5.67,2.35-7.67,4.78-2.37,2.88-4.13,6.19-3.42,9.52.02.09,0,.18,0,.27-.08.6.07,1.18.23,1.76.17.58.25,1.18-.02,1.76-1.43,3.02-2.69,6.1-3.48,9.23-.62,2.46-.9,4.95-.33,7.44.07.3,0,.56-.17.84-.81,1.34-1.45,2.72-1.88,4.13-.83,2.74-1.12,5.51-1.33,8.29-.1,1.28-.14,2.55-.26,3.83-.15,1.58-.35,3.15-.55,4.73-.13,1.03-.35,2.06-.41,3.09-.04.8-.29,1.51-1.07,2.15-1.05.85-2.03,1.75-3.08,2.6-.44.36-.86.71-1.03,1.16-.46,1.22-.92,2.44-1.35,3.67-.24.68-.44,1.37-.95,1.99-.55.68-1.13,1.35-1.71,2.02-.35.4-.18.71.5.81,1.05.15,2.08.16,2.94-.36.53-.32,1.02-.68,1.52-1.03.16-.11.29-.25.43-.38.04.01.09.03.13.04-.02.16-.03.32-.06.48-.2,1.24-.43,2.47-.62,3.71-.16,1.07-.28,2.15-.39,3.23-.05.42-.03.85-.02,1.27,0,.2.2.34.47.4.26.06.4-.06.57-.17,1-.63,1.48-1.44,1.81-2.3.59-1.56,1.13-3.13,1.7-4.69.04-.1.14-.19.2-.28.14.11.17.19.17.27-.02.4-.05.79-.08,1.19-.07.99-.15,1.97-.22,2.96-.09,1.2-.11,2.4.14,3.59.17.05.32.07.45.12.37.16.7.11.96-.1.17-.13.3-.3.38-.46.63-1.29.87-2.64,1.21-3.97.19-.75.32-1.5.47-2.25.07.12.11.24.11.35.02,1.32,0,2.64.05,3.97.01.47.11.93.21,1.4.06.3.35.45.76.49.29.03.7-.15.84-.39.08-.12.1-.26.14-.39.15-.63.28-1.27.44-2.01.28.46.49.83.71,1.19.32.5.32.5,1.14.42.08,0,.17-.01.31-.02.07-.24.2-.48.21-.71.02-.65-.03-1.31-.03-1.96-.02-1.57-.27-3.14.3-4.71.33-.89.26-1.84.36-2.76.03-.3-.01-.61.03-.91.17-1.21.29-2.42.22-3.64-.07-1.16-.2-2.32-.73-3.42-.2-.41-.17-.75.04-1.13.77-1.41,1.61-2.81,2.28-4.24,1.58-3.39,3.11-6.8,4.63-10.2.95-2.14,1.56-4.31,1.44-6.56-.03-.57.1-1.15.12-1.73.03-.7.05-1.4.02-2.09-.02-.42.07-.8.39-1.18.93-1.1,1.62-2.27,2.27-3.46.68-1.26,1.22-2.54,1.67-3.85.05-.16.07-.35.33-.49.33.5.64.97.94,1.44.06.09.05.21.07.31.28,1.81.56,3.63.84,5.44.16,1.01.42,2.02.5,3.03.1,1.15.04,2.31.07,3.47.04,1.43.09,2.86.19,4.28.04.56.25,1.11.41,1.66.12.41.2.79-.02,1.21-.22.41-.38.85-.51,1.27-.58,1.82-1.02,3.65-.36,5.51.06.19.05.4,0,.59-.31,1.1-.67,2.21-.97,3.31-1,3.59-2.02,7.2-2.94,10.8-.46,1.78-.75,3.58-1.02,5.38-.36,2.45-.51,4.92-.43,7.38.05,1.52.14,3.04.29,4.56.08.81.38,1.62.5,2.43.35,2.36,1.01,4.69,1.31,7.05.2,1.58.3,3.15-.1,4.72-.56,2.15-.75,4.32-.63,6.49.03.46-.06.89-.3,1.33-1.04,1.93-1.59,3.95-1.87,5.96-1.07,7.63-.79,15.23-.02,22.94,0,0,.36,5.99.36,7.35s-.62,3.32-1.55,4.6c-2.62,3.64-7.13,6.98-11,10.2-2.01,1.68-2.31,1.42-3.3,1.95-.92.49-1.05.75-1.57,1.31-.49.53-.21.92-.21.92-.59,1.08.52,1.22.52,1.22.71.88,1.9.6,1.9.6,1.66,1.12,2.65.22,2.65.22,1.89,1.48,3.85,1.16,6.1-.16,2.25-1.32,2.04-.76,3.26-1.08,5.24-1.38,5.49-4.87,10.01-6.59,4.99-1.9,6.27-3.95,5.68-5.27-.59-1.32-.95-3.2-.95-3.2.53-.24.71-1,.41-1.75-.95-2.43-.59-2.72.14-7.73,1.09-4.57,2.01-9.75,5.22-13.7,1.15-1.41,1.9-3.05,2.18-4.72.2-1.24.19-2.49.14-3.73-.07-1.54-.32-3.06-.65-4.58-.24-1.13-.48-2.26-.73-3.38-.05-.25,0-.47.22-.69.63-.62,1.03-1.32,1.32-2.04.57-1.41.9-2.85.92-4.32,0-.79.04-1.58.14-2.37.07-.6.1-1.21.54-1.77,1.89-2.44,3.4-4.99,4.57-7.64,1.13-2.55,1.97-5.15,2.84-7.74.73-2.17,1.46-4.35,2.19-6.52.05.21.09.43.16.64.23.65.48,1.3.72,1.95.8,2.18,1.63,4.37,2.39,6.55,1.54,4.4,3.71,8.74,6.92,12.73,0,0-.01,0-.03,0,.1.13.19.27.26.4.03.08.06.15.07.22.24,1.45.44,2.43.47,2.86h.01c0,.22.02.45.02.68.01,1.09.2,2.56.92,4.32.29.72.7,1.41,1.32,2.04.17.17.8.9-.11,4.52-.38,1.51-.43,3.05-.42,4.59,0,1.25.06,2.49.33,3.73.36,1.66,1.21,3.28,2.41,4.66,3.3,3.79,3.99,8.95,5.23,13.39.98,5,1.19,5.08.36,7.52-.26.77.17,1.71.71,1.93,0,0-.25,1.25-.54,2.61-.5,2.42.07,3.77,5.32,5.85,4.54,1.8,4.68,5.33,10.1,6.61,1.23.29,1.16-.14,3.31,1.25,2.26,1.46,4.12,1.44,5.94-.08,0,0,1.09.77,2.6-.2,0,0,1.41.22,1.92-.63,0,0,1.3-.33.39-1.19,0,0,.9-.35-1.11-1.94-.57-.45-1.56-.27-3.64-2.11-2.98-2.63-5.92-5.31-8.75-8-1.32-1.26-2.71-2.3-3.26-3.73-.55-1.42-.81-1.6-.85-2.94-.09-3.46.14-7.04.27-10.57-.06-6.71.06-13.33-.95-19.99-.21-1.39-1.73-5.16-2-5.62-.34-.71-.65-1.44-.63-1.68.12-2.17-.06-4.35-.62-6.49-.4-1.53-.53-3.24-.37-4.78.08-.75.14-1.51.24-2.27.11-.88.32-1.75.47-2.62.19-1.01.37-2.02.53-3.03.15-.95.36-1.9.4-2.86.07-1.5.03-3.01.02-4.51-.02-2.51-.29-5.01-.81-7.5-.44-2.09-.9-4.18-1.46-6.26-.59-2.15-1.31-4.29-1.99-6.43-.63-1.98-1.29-3.95-1.91-5.92-.05-.16-.05-.34,0-.49.37-1.24.31-2.48-.03-3.72-.26-.96-.62-1.9-.97-2.84-.14-.39-.17-.77-.07-1.17.13-.51.3-1.02.32-1.54.04-1.08,0-2.16-.01-3.24-.02-.9-.11-1.8-.06-2.69.07-1.38.19-2.76.35-4.14.24-2.09.53-4.18.81-6.27.04-.29.68-1.23.99-1.47.06.14.12.27.17.4.88,2.5,2.12,4.9,3.95,7.16.19.24.28.47.26.74-.03.39-.07.79-.05,1.18.05,1,.22,2.01.18,3-.07,2.08.44,4.09,1.29,6.07.63,1.46,1.32,2.9,1.97,4.36,1.17,2.62,2.2,5.27,3.66,7.83.54.95,1.03,1.92,1.56,2.87.14.25.17.48,0,.74-.17.26-.26.55-.34.83-.41,1.47-.59,2.95-.43,4.44.08.74.19,1.49.21,2.23.05,1.46.05,2.92.7,4.33.02.06.03.12.03.18,0,1.12,0,2.25-.02,3.38,0,.7-.09,1.4-.08,2.09,0,.26.13.53.2.77.24.02.39.04.54.05.55.06.58.05.82-.29.17-.25.33-.5.48-.75.09-.16.17-.32.25-.47.25.66.38,1.29.53,1.92.03.12.05.24.12.35.14.23.56.43.82.41.38-.03.73-.23.8-.52.1-.42.21-.84.22-1.26.03-1.35.02-2.71.03-4.06,0-.12.04-.24.08-.42.28,1.23.52,2.39.83,3.54.25.93.58,1.84.9,2.76.21.58.71.72,1.49.47.1-.03.2-.05.32-.08.47-2.67-.21-5.3-.14-8.01.31.13.32.28.37.42.22.65.43,1.31.67,1.95.29.77.66,1.52.9,2.29.32.98.79,1.89,1.88,2.62.16.11.29.25.56.19.28-.06.46-.2.5-.4.02-.07.02-.15.01-.23-.11-1.21-.18-2.43-.34-3.64-.23-1.66-.52-3.32-.79-5.01.2.17.36.33.54.47.32.26.63.52.98.75.96.65,2.11.89,3.46.69.69-.1.91-.43.56-.83Z"
          fill="#F2C88D"
        />
        <!-- Right hand -->
        <path
          d="M38.14,48.44h0c-3.62,0-6.54,2.95-6.54,6.6v48.67h0c-.14,4.55.43,5.63-1.76,5.58-2.31-.05-4.37-1.46-5.52-3.49-3.54-6.23-7.68-9.98-10.87-12.16-2.85-1.94-6.77-3.4-10.21-3.41-3.96-.02-3.27,5.36-3.03,5.8.93,1.73,1.94,3.39,3.45,4.63,2.84,2.34,5.08,5.87,6.62,8.8,1.32,2.51,16.66,26.59,19.19,30.71,6.02,10.87,18.57,18.36,33.11,18.36,20.4,0,34.85-6.28,36.67-32.84v-59.65c0-3.04-2.44-5.5-5.46-5.5h-.02c-3.01,0-5.45,2.46-5.45,5.5v27.48c0,1.82-1.46,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-43.97c0-3.04-2.44-5.49-5.45-5.49h0c-3.01,0-5.45,2.46-5.45,5.49v39.58c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-49.47c0-3.64-2.93-6.6-6.54-6.6h0c-3.62,0-6.54,2.95-6.54,6.6v49.47c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-34.08c0-3.64-2.93-6.6-6.55-6.6Z"
          fill="#F2C88D"
        />
        <!-- Left hand -->
        <path
          d="M285.1,56.47v34.08c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-49.47c0-3.64-2.93-6.6-6.55-6.6h0c-3.61,0-6.54,2.95-6.54,6.6v49.47c0,1.82-1.47,3.3-3.27,3.3h0c-1.8,0-3.27-1.48-3.27-3.3v-39.57c0-3.04-2.44-5.5-5.45-5.5h0c-3.01,0-5.45,2.46-5.45,5.5v43.97c0,1.82-1.46,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-27.48c0-3.04-2.44-5.5-5.46-5.5h-.02c-3.01,0-5.45,2.46-5.45,5.5v59.64c1.82,26.56,16.27,32.84,36.67,32.84,14.54,0,27.09-7.49,33.11-18.36,2.53-4.12,17.88-28.2,19.2-30.71,1.54-2.93,3.79-6.46,6.62-8.8,1.51-1.24,2.52-2.9,3.45-4.63.24-.44.93-5.82-3.03-5.8-3.44.01-7.36,1.47-10.21,3.41-3.19,2.17-7.34,5.93-10.87,12.16-1.15,2.02-3.21,3.44-5.52,3.49-2.18.05-1.62-1.03-1.76-5.58h0v-48.67c0-3.64-2.93-6.6-6.54-6.6h0c-3.62,0-6.55,2.95-6.55,6.59Z"
          fill="#F2C88D"
        />

        <!-- Clickable joint ellipses — rendered via Vue loop -->
        <ellipse
          v-for="j in das_joints"
          :key="j.key"
          class="joint-ellipse"
          :cx="ellipses[j.key].cx"
          :cy="ellipses[j.key].cy"
          :rx="ellipses[j.key].rx"
          :ry="ellipses[j.key].ry"
          :fill="das_hoverFill(j.key) ?? jointFill(j.key)"
          :stroke="das_hoverStroke(j.key) ?? jointStroke(j.key)"
          stroke-miterlimit="10"
          :stroke-width="das_hoveredKey === j.key ? 2 : 3"
          @mouseenter="das_hoveredKey = j.key"
          @mouseleave="das_hoveredKey = null"
          @click="das_clickJoint(j.key)"
        />

        <!-- Labels -->
        <text
          fill="#f33"
          font-family="'Noto Sans TC', 'NotoSansTC-Black', sans-serif"
          font-size="17"
          font-weight="900"
          transform="translate(57.67 147.97)"
        >
          R
        </text>
        <text
          fill="#03f"
          font-family="'Noto Sans TC', 'NotoSansTC-Black', sans-serif"
          font-size="17"
          font-weight="900"
          transform="translate(259.23 147.97)"
        >
          L
        </text>
      </svg>

      <!-- Legend -->
      <div class="legend">
        <div class="leg-row">
          <span
            class="leg-dot"
            style="background: #ffffff; border: 2px solid #cccccc"
          ></span
          >未標記
        </div>
        <div class="leg-row">
          <span class="leg-dot" style="background: #ef4444"></span>觸痛
        </div>
        <div class="leg-row">
          <span class="leg-dot" style="background: #3b82f6"></span>腫脹
        </div>
        <div class="leg-row">
          <span class="leg-dot" style="background: #7c3aed"></span>兩者
        </div>
      </div>
      </div>

      <!-- TJC / SJC summary bars -->
      <div class="joint-summary">
        <div class="js-row">
          <span class="js-label tender-label">觸痛 TJC</span>
          <div class="js-bar-wrap">
            <div class="js-bar">
              <div
                class="js-fill tender-fill"
                :style="{ width: (das_tjc / 28) * 100 + '%' }"
              />
            </div>
          </div>
          <span class="js-count tender-count"
            >{{ das_tjc }}<span class="js-denom">/28</span></span
          >
        </div>
        <div class="js-row">
          <span class="js-label swollen-label">腫脹 SJC</span>
          <div class="js-bar-wrap">
            <div class="js-bar">
              <div
                class="js-fill swollen-fill"
                :style="{ width: (das_sjc / 28) * 100 + '%' }"
              />
            </div>
          </div>
          <span class="js-count swollen-count"
            >{{ das_sjc }}<span class="js-denom">/28</span></span
          >
        </div>
      </div>
    </div>

    <!-- Lab mode toggle + inputs -->
    <div class="lab-mode-row">
      <span class="lab-mode-label">發炎指標：</span>
      <div class="lab-mode-toggle">
        <button
          class="lab-mode-btn"
          :class="{ 'lm-active-esr': labMode === 'ESR' }"
          @click="
            labMode = 'ESR';
            crpInput = '';
          "
        >
          <span class="lm-dot esr-dot"></span>ESR（紅血球沉降速率）
        </button>
        <button
          class="lab-mode-btn"
          :class="{ 'lm-active-crp': labMode === 'CRP' }"
          @click="
            labMode = 'CRP';
            esrInput = '';
          "
        >
          <span class="lm-dot crp-dot"></span>CRP（C 反應蛋白）
        </button>
      </div>
    </div>

    <div class="lab-section">
      <!-- ESR input -->
      <div class="lab-group" v-if="labMode === 'ESR'">
        <label class="lab-label">
          ESR 紅血球沉降速率
          <span class="lab-version-tag esr-tag">DAS28-ESR</span>
        </label>
        <div class="lab-wrap" :class="{ filled: esrInput !== '' }">
          <input
            v-model="esrInput"
            type="number"
            placeholder="輸入 ESR"
            min="1"
            max="200"
            class="lab-input"
          />
          <span class="lab-unit">mm/hour</span>
        </div>
        <div class="lab-hint-text">
          正常值：男性 &lt; 15，女性 &lt; 20 mm/hour
        </div>
      </div>
      <!-- CRP input -->
      <div class="lab-group" v-if="labMode === 'CRP'">
        <label class="lab-label">
          CRP C 反應蛋白
          <span class="lab-version-tag crp-tag">DAS28-CRP</span>
        </label>
        <div class="lab-wrap" :class="{ filled: crpInput !== '' }">
          <input
            v-model="crpInput"
            type="number"
            placeholder="輸入 CRP"
            min="0"
            max="300"
            step="0.1"
            class="lab-input"
          />
          <span class="lab-unit">mg/L</span>
        </div>
        <div class="lab-hint-text">
          正常值：&lt; 5 mg/L；CRP = 0 時請輸入 0（公式使用 ln(CRP+1)）
        </div>
      </div>
      <!-- GH -->
      <div class="lab-group">
        <label class="lab-label">GH 整體健康狀態（患者自評）</label>
        <div class="lab-wrap" :class="{ filled: das_ghInput !== '' }">
          <input
            v-model="das_ghInput"
            type="number"
            placeholder="0–100"
            min="0"
            max="100"
            class="lab-input"
          />
          <span class="lab-unit">分（0=最好，100=最差）</span>
        </div>
      </div>
    </div>

    <!-- Formula -->
    <div class="formula-card">
      <div class="formula-title-row">
        <div class="formula-title" v-if="labMode === 'ESR'">
          DAS28-ESR = 0.56 × √TJC + 0.28 × √SJC + 0.70 × ln(ESR) + 0.014 × GH
        </div>
        <div class="formula-title" v-else>
          DAS28-CRP = 0.56 × √TJC + 0.28 × √SJC + 0.36 × ln(CRP+1) + 0.014 × GH
          + 0.96
        </div>
        <span
          class="formula-version-pill"
          :class="labMode === 'ESR' ? 'esr-pill' : 'crp-pill'"
        >
          {{ labMode }}
        </span>
      </div>
      <div class="formula-eq" v-if="labMode === 'ESR'">
        = 0.56 × √<b>{{ das_tjc }}</b> + 0.28 × √<b>{{ das_sjc }}</b> + 0.70 × ln(<b>{{
          esrInput || "?"
        }}</b
        >) + 0.014 × <b>{{ das_ghInput || "?" }}</b>
        <span class="formula-ans" :class="das_severity.color">
          = {{ das28 ?? "—" }}</span
        >
      </div>
      <div class="formula-eq" v-else>
        = 0.56 × √<b>{{ das_tjc }}</b> + 0.28 × √<b>{{ das_sjc }}</b> + 0.36 × ln(<b>{{
          crpInput !== "" ? crpInput + "+1" : "?"
        }}</b
        >) + 0.014 × <b>{{ das_ghInput || "?" }}</b> + 0.96
        <span class="formula-ans" :class="das_severity.color">
          = {{ das28 ?? "—" }}</span
        >
      </div>
    </div>

    <!-- Result card -->
    <div class="das-result" :class="das_severity.color">
      <div class="result-left">
        <span class="result-number">{{ das28 ?? "—" }}</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ das_severity.level }}</span>
        <span class="result-advice">{{ das_severity.advice }}</span>
        <div class="result-sub">
          <span class="sub-pill">TJC：{{ das_tjc }}</span>
          <span class="sub-pill">SJC：{{ das_sjc }}</span>
          <span class="sub-pill" v-if="esr">ESR：{{ esr }}</span>
          <span class="sub-pill" v-if="das_gh !== null">GH：{{ das_gh }}</span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="das_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-domain">觸痛關節數（TJC28）</span
        ><span class="detail-score brand">{{ das_tjc }}</span
        ><span class="detail-desc">個</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">腫脹關節數（SJC28）</span
        ><span class="detail-score brand">{{ das_sjc }}</span
        ><span class="detail-desc">個</span>
      </div>
      <div class="detail-row" v-if="labMode === 'ESR'">
        <span class="detail-domain">ESR</span
        ><span class="detail-score brand">{{ esrInput || "—" }}</span
        ><span class="detail-desc">mm/hr</span>
      </div>
      <div class="detail-row" v-else>
        <span class="detail-domain">CRP</span
        ><span class="detail-score brand">{{ crpInput || "—" }}</span
        ><span class="detail-desc">mg/L</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">GH</span
        ><span class="detail-score brand">{{ das_ghInput || "—" }}</span
        ><span class="detail-desc">分</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">DAS28 分數</span
        ><span class="detail-score brand">{{ das28 ?? "—" }}</span
        ><span class="detail-desc">{{ das_severity.tag }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="das-actions">
      <button class="btn-view" @click="das_showResults = !das_showResults">
        {{ das_showResults ? "收起明細" : "查看評估明細" }}
      </button>
      <button class="btn-copy" :disabled="!das_isComplete" @click="das_copyMarkdown">
        {{ das_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="das_reset">重置</button>
    </div>
    <p v-if="!das_isComplete" class="progress-hint">
      請輸入 {{ labMode }} 及 GH 以計算 DAS28 分數
    </p>
  </div>

  <div v-show="activeTab === 'cdai'" class="cdai">
    <!-- ── Header ────────────────────────────────────────────────── -->
    <div class="cdai-header">
      <div class="header-title">
        <h2 class="title">CDAI 臨床疾病活動指數</h2>
        <p class="subtitle">
          Clinical Disease Activity Index · 無需實驗室檢查，門診即時計算
        </p>
      </div>
      <div class="score-badge" :class="cdai_severity.color">
        <span class="score-number">{{ cdai ?? "—" }}</span>
        <span class="score-label">{{ cdai_severity.tag }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="cdai_severity.color"
          :style="{
            width:
              cdai !== null ? Math.min((cdai / 76) * 100, 100) + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-g">2.8</span>
        <span class="tick-y">10</span>
        <span class="tick-o">22</span>
        <span>76</span>
      </div>
    </div>

    <!-- ── Risk strip ─────────────────────────────────────────────── -->
    <div class="risk-strip">
      <div
        class="risk-pill"
        :class="{ 'risk-active': cdai !== null && cdai <= 2.8 }"
      >
        <span class="risk-score">≤ 2.8</span>
        <span class="risk-rate" style="color: #22c55e">緩解期</span>
        <span class="risk-tag">Remission</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': cdai !== null && cdai > 2.8 && cdai <= 10 }"
      >
        <span class="risk-score">2.8–10</span>
        <span class="risk-rate" style="color: #f59e0b">低活動度</span>
        <span class="risk-tag">Low Activity</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': cdai !== null && cdai > 10 && cdai <= 22 }"
      >
        <span class="risk-score">10–22</span>
        <span class="risk-rate" style="color: #f97316">中活動度</span>
        <span class="risk-tag">Moderate</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': cdai !== null && cdai > 22 }"
      >
        <span class="risk-score">&gt; 22</span>
        <span class="risk-rate" style="color: #ef4444">高活動度</span>
        <span class="risk-tag">High Activity</span>
      </div>
    </div>

    <!-- ── Advantage note ─────────────────────────────────────────── -->
    <div class="adv-bar">
      <span class="adv-icon">✓</span>
      <span
        >CDAI
        <strong>不需血液檢查</strong
        >，四個項目全部為臨床評估，可在診間立即計算，是 DAS28
        的理想替代方案。</span
      >
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         STEP 1 — 關節評估
    ══════════════════════════════════════════════════════════════ -->
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">1</div>
        <div class="step-info">
          <span class="step-title">關節評估（28 個關節）</span>
          <span class="step-sub">點擊身體圖上的白色圓點標記關節狀態</span>
        </div>
        <div class="step-counts">
          <div class="sc-item tender-sc">
            <span class="sc-dot"></span>
            <span class="sc-n">{{ cdai_tjc }}</span>
            <span class="sc-lbl">觸痛</span>
          </div>
          <div class="sc-item swollen-sc">
            <span class="sc-dot2"></span>
            <span class="sc-n">{{ cdai_sjc }}</span>
            <span class="sc-lbl">腫脹</span>
          </div>
        </div>
      </div>

      <!-- Mode toggle -->
      <div class="mode-row">
        <button
          class="mode-btn"
          :class="cdai_mode === 'tender' ? 'mode-btn-tender' : 'mode-btn-off'"
          @click="cdai_mode = 'tender'"
        >
          <span class="mbdot" style="background: #ef4444"></span>
          觸痛（TJC）· {{ cdai_tjc }} 個
        </button>
        <button
          class="mode-btn"
          :class="cdai_mode === 'swollen' ? 'mode-btn-swollen' : 'mode-btn-off'"
          @click="cdai_mode = 'swollen'"
        >
          <span class="mbdot" style="background: #3b82f6"></span>
          腫脹（SJC）· {{ cdai_sjc }} 個
        </button>
      </div>

      <!-- SVG body diagram -->
      <div class="diagram-wrap">
        <svg
          viewBox="0 0 329.79 200"
          xmlns="http://www.w3.org/2000/svg"
          class="body-svg"
        >
          <!-- body -->
          <path
            fill-rule="evenodd"
            d="M221.16,105.56c-.47-.54-.91-1.08-1.39-1.62-.64-.71-.98-1.49-1.24-2.3-.33-1.01-.68-2.01-1.03-3.02-.28-.83-.87-1.53-1.72-2.17-1.19-.91-2.23-1.91-3.3-2.89-.21-.19-.32-.44-.37-.67-.1-.48-.1-.97-.17-1.45-.19-1.28-.45-2.57-.59-3.85-.23-2.17-.37-4.34-.57-6.51-.16-1.76-.31-3.52-.54-5.27-.36-2.75-1.17-5.44-2.76-8.01-.11-.18-.13-.41-.11-.62.06-.51.22-1.02.26-1.54.12-1.6.04-3.2-.3-4.78-.74-3.48-2.11-6.92-3.68-10.27-.13-.3-.23-.62-.22-.93.03-.5.19-.99.25-1.49.06-.54.01-1.09.12-1.63.24-1.22.18-2.43-.14-3.63-.51-1.96-1.81-4.1-3.52-6.05-1.65-1.88-3.77-2.95-6.12-3.98-1.1-.48-2.26-.82-3.52-1.05-1.29-.24-2.64-.24-3.9-.62-.54-.16-1.13-.26-1.66-.44-2.21-.78-4.38-1.62-6.6-2.39-1.62-.56-3.28-1.04-4.95-1.52-.58-.17-.64-.13-.7-.53-.32-2.28.39-4.68.39-4.76,0-.01-.01-.02-.01-.04.03-.03.06-.05.09-.08.47-.5.82-1.03.95-1.63.09-.42.18-.83.27-1.25.7.07,1.38.03,1.73-.31.26-.25.34-.54.56-.81.22-.29.6-.51.9-.76.64-.51.79-1.24.8-1.93,0-.62.17-2.08-1.04-2.24-.26-.03-.61.11-.92.28,0,0,0-.02,0-.03.12-.61.1-1.23.32-1.84.78-2.17.29-4.32-1.12-6.13-1.83-2.33-5.22-4.09-9.45-4.61-10.09-1.23-18.52,3.6-17.28,10.63.11.61.42,1.2.68,1.79.04.07.09.15.13.22-.33-.19-.71-.35-.99-.32-1.21.16-1.05,1.63-1.04,2.24,0,.69.16,1.41.8,1.93.3.24.68.47.9.76.21.28.3.56.56.81.42.41,1.34.38,2.17.25.06.21.09.42.11.63.06.73.31,1.42.89,2.04.25.26.52.52.78.78.15,1.15.48,3.49.56,3.97.11.63-.3.83-1.2,1.12-.08.02-.17.05-.25.08-1.48.49-2.98.96-4.43,1.5-1.99.73-3.95,1.51-5.93,2.28-1,.39-2.02.75-3.13.88-.47.05-.95.09-1.4.18-1,.21-2.08.32-2.97.67-3.01,1.19-5.67,2.35-7.67,4.78-2.37,2.88-4.13,6.19-3.42,9.52.02.09,0,.18,0,.27-.08.6.07,1.18.23,1.76.17.58.25,1.18-.02,1.76-1.43,3.02-2.69,6.1-3.48,9.23-.62,2.46-.9,4.95-.33,7.44.07.3,0,.56-.17.84-.81,1.34-1.45,2.72-1.88,4.13-.83,2.74-1.12,5.51-1.33,8.29-.1,1.28-.14,2.55-.26,3.83-.15,1.58-.35,3.15-.55,4.73-.13,1.03-.35,2.06-.41,3.09-.04.8-.29,1.51-1.07,2.15-1.05.85-2.03,1.75-3.08,2.6-.44.36-.86.71-1.03,1.16-.46,1.22-.92,2.44-1.35,3.67-.24.68-.44,1.37-.95,1.99-.55.68-1.13,1.35-1.71,2.02-.35.4-.18.71.5.81,1.05.15,2.08.16,2.94-.36.53-.32,1.02-.68,1.52-1.03.16-.11.29-.25.43-.38.04.01.09.03.13.04-.02.16-.03.32-.06.48-.2,1.24-.43,2.47-.62,3.71-.16,1.07-.28,2.15-.39,3.23-.05.42-.03.85-.02,1.27,0,.2.2.34.47.4.26.06.4-.06.57-.17,1-.63,1.48-1.44,1.81-2.3.59-1.56,1.13-3.13,1.7-4.69.04-.1.14-.19.2-.28.14.11.17.19.17.27-.02.4-.05.79-.08,1.19-.07.99-.15,1.97-.22,2.96-.09,1.2-.11,2.4.14,3.59.17.05.32.07.45.12.37.16.7.11.96-.1.17-.13.3-.3.38-.46.63-1.29.87-2.64,1.21-3.97.19-.75.32-1.5.47-2.25.07.12.11.24.11.35.02,1.32,0,2.64.05,3.97.01.47.11.93.21,1.4.06.3.35.45.76.49.29.03.7-.15.84-.39.08-.12.1-.26.14-.39.15-.63.28-1.27.44-2.01.28.46.49.83.71,1.19.32.5.32.5,1.14.42.08,0,.17-.01.31-.02.07-.24.2-.48.21-.71.02-.65-.03-1.31-.03-1.96-.02-1.57-.27-3.14.3-4.71.33-.89.26-1.84.36-2.76.03-.3-.01-.61.03-.91.17-1.21.29-2.42.22-3.64-.07-1.16-.2-2.32-.73-3.42-.2-.41-.17-.75.04-1.13.77-1.41,1.61-2.81,2.28-4.24,1.58-3.39,3.11-6.8,4.63-10.2.95-2.14,1.56-4.31,1.44-6.56-.03-.57.1-1.15.12-1.73.03-.7.05-1.4.02-2.09-.02-.42.07-.8.39-1.18.93-1.1,1.62-2.27,2.27-3.46.68-1.26,1.22-2.54,1.67-3.85.05-.16.07-.35.33-.49.33.5.64.97.94,1.44.06.09.05.21.07.31.28,1.81.56,3.63.84,5.44.16,1.01.42,2.02.5,3.03.1,1.15.04,2.31.07,3.47.04,1.43.09,2.86.19,4.28.04.56.25,1.11.41,1.66.12.41.2.79-.02,1.21-.22.41-.38.85-.51,1.27-.58,1.82-1.02,3.65-.36,5.51.06.19.05.4,0,.59-.31,1.1-.67,2.21-.97,3.31-1,3.59-2.02,7.2-2.94,10.8-.46,1.78-.75,3.58-1.02,5.38-.36,2.45-.51,4.92-.43,7.38.05,1.52.14,3.04.29,4.56.08.81.38,1.62.5,2.43.35,2.36,1.01,4.69,1.31,7.05.2,1.58.3,3.15-.1,4.72-.56,2.15-.75,4.32-.63,6.49.03.46-.06.89-.3,1.33-1.04,1.93-1.59,3.95-1.87,5.96-1.07,7.63-.79,15.23-.02,22.94,0,0,.36,5.99.36,7.35s-.62,3.32-1.55,4.6c-2.62,3.64-7.13,6.98-11,10.2-2.01,1.68-2.31,1.42-3.3,1.95-.92.49-1.05.75-1.57,1.31-.49.53-.21.92-.21.92-.59,1.08.52,1.22.52,1.22.71.88,1.9.6,1.9.6,1.66,1.12,2.65.22,2.65.22,1.89,1.48,3.85,1.16,6.1-.16,2.25-1.32,2.04-.76,3.26-1.08,5.24-1.38,5.49-4.87,10.01-6.59,4.99-1.9,6.27-3.95,5.68-5.27-.59-1.32-.95-3.2-.95-3.2.53-.24.71-1,.41-1.75-.95-2.43-.59-2.72.14-7.73,1.09-4.57,2.01-9.75,5.22-13.7,1.15-1.41,1.9-3.05,2.18-4.72.2-1.24.19-2.49.14-3.73-.07-1.54-.32-3.06-.65-4.58-.24-1.13-.48-2.26-.73-3.38-.05-.25,0-.47.22-.69.63-.62,1.03-1.32,1.32-2.04.57-1.41.9-2.85.92-4.32,0-.79.04-1.58.14-2.37.07-.6.1-1.21.54-1.77,1.89-2.44,3.4-4.99,4.57-7.64,1.13-2.55,1.97-5.15,2.84-7.74.73-2.17,1.46-4.35,2.19-6.52.05.21.09.43.16.64.23.65.48,1.3.72,1.95.8,2.18,1.63,4.37,2.39,6.55,1.54,4.4,3.71,8.74,6.92,12.73,0,0-.01,0-.03,0,.1.13.19.27.26.4.03.08.06.15.07.22.24,1.45.44,2.43.47,2.86h.01c0,.22.02.45.02.68.01,1.09.2,2.56.92,4.32.29.72.7,1.41,1.32,2.04.17.17.8.9-.11,4.52-.38,1.51-.43,3.05-.42,4.59,0,1.25.06,2.49.33,3.73.36,1.66,1.21,3.28,2.41,4.66,3.3,3.79,3.99,8.95,5.23,13.39.98,5,1.19,5.08.36,7.52-.26.77.17,1.71.71,1.93,0,0-.25,1.25-.54,2.61-.5,2.42.07,3.77,5.32,5.85,4.54,1.8,4.68,5.33,10.1,6.61,1.23.29,1.16-.14,3.31,1.25,2.26,1.46,4.12,1.44,5.94-.08,0,0,1.09.77,2.6-.2,0,0,1.41.22,1.92-.63,0,0,1.3-.33.39-1.19,0,0,.9-.35-1.11-1.94-.57-.45-1.56-.27-3.64-2.11-2.98-2.63-5.92-5.31-8.75-8-1.32-1.26-2.71-2.3-3.26-3.73-.55-1.42-.81-1.6-.85-2.94-.09-3.46.14-7.04.27-10.57-.06-6.71.06-13.33-.95-19.99-.21-1.39-1.73-5.16-2-5.62-.34-.71-.65-1.44-.63-1.68.12-2.17-.06-4.35-.62-6.49-.4-1.53-.53-3.24-.37-4.78.08-.75.14-1.51.24-2.27.11-.88.32-1.75.47-2.62.19-1.01.37-2.02.53-3.03.15-.95.36-1.9.4-2.86.07-1.5.03-3.01.02-4.51-.02-2.51-.29-5.01-.81-7.5-.44-2.09-.9-4.18-1.46-6.26-.59-2.15-1.31-4.29-1.99-6.43-.63-1.98-1.29-3.95-1.91-5.92-.05-.16-.05-.34,0-.49.37-1.24.31-2.48-.03-3.72-.26-.96-.62-1.9-.97-2.84-.14-.39-.17-.77-.07-1.17.13-.51.3-1.02.32-1.54.04-1.08,0-2.16-.01-3.24-.02-.9-.11-1.8-.06-2.69.07-1.38.19-2.76.35-4.14.24-2.09.53-4.18.81-6.27.04-.29.68-1.23.99-1.47.06.14.12.27.17.4.88,2.5,2.12,4.9,3.95,7.16.19.24.28.47.26.74-.03.39-.07.79-.05,1.18.05,1,.22,2.01.18,3-.07,2.08.44,4.09,1.29,6.07.63,1.46,1.32,2.9,1.97,4.36,1.17,2.62,2.2,5.27,3.66,7.83.54.95,1.03,1.92,1.56,2.87.14.25.17.48,0,.74-.17.26-.26.55-.34.83-.41,1.47-.59,2.95-.43,4.44.08.74.19,1.49.21,2.23.05,1.46.05,2.92.7,4.33.02.06.03.12.03.18,0,1.12,0,2.25-.02,3.38,0,.7-.09,1.4-.08,2.09,0,.26.13.53.2.77.24.02.39.04.54.05.55.06.58.05.82-.29.17-.25.33-.5.48-.75.09-.16.17-.32.25-.47.25.66.38,1.29.53,1.92.03.12.05.24.12.35.14.23.56.43.82.41.38-.03.73-.23.8-.52.1-.42.21-.84.22-1.26.03-1.35.02-2.71.03-4.06,0-.12.04-.24.08-.42.28,1.23.52,2.39.83,3.54.25.93.58,1.84.9,2.76.21.58.71.72,1.49.47.1-.03.2-.05.32-.08.47-2.67-.21-5.3-.14-8.01.31.13.32.28.37.42.22.65.43,1.31.67,1.95.29.77.66,1.52.9,2.29.32.98.79,1.89,1.88,2.62.16.11.29.25.56.19.28-.06.46-.2.5-.4.02-.07.02-.15.01-.23-.11-1.21-.18-2.43-.34-3.64-.23-1.66-.52-3.32-.79-5.01.2.17.36.33.54.47.32.26.63.52.98.75.96.65,2.11.89,3.46.69.69-.1.91-.43.56-.83Z"
            fill="#F2C88D"
          />
          <!-- right hand -->
          <path
            d="M38.14,48.44h0c-3.62,0-6.54,2.95-6.54,6.6v48.67h0c-.14,4.55.43,5.63-1.76,5.58-2.31-.05-4.37-1.46-5.52-3.49-3.54-6.23-7.68-9.98-10.87-12.16-2.85-1.94-6.77-3.4-10.21-3.41-3.96-.02-3.27,5.36-3.03,5.8.93,1.73,1.94,3.39,3.45,4.63,2.84,2.34,5.08,5.87,6.62,8.8,1.32,2.51,16.66,26.59,19.19,30.71,6.02,10.87,18.57,18.36,33.11,18.36,20.4,0,34.85-6.28,36.67-32.84v-59.65c0-3.04-2.44-5.5-5.46-5.5h-.02c-3.01,0-5.45,2.46-5.45,5.5v27.48c0,1.82-1.46,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-43.97c0-3.04-2.44-5.49-5.45-5.49h0c-3.01,0-5.45,2.46-5.45,5.49v39.58c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-49.47c0-3.64-2.93-6.6-6.54-6.6h0c-3.62,0-6.54,2.95-6.54,6.6v49.47c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-34.08c0-3.64-2.93-6.6-6.55-6.6Z"
            fill="#F2C88D"
          />
          <!-- left hand -->
          <path
            d="M285.1,56.47v34.08c0,1.82-1.47,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-49.47c0-3.64-2.93-6.6-6.55-6.6h0c-3.61,0-6.54,2.95-6.54,6.6v49.47c0,1.82-1.47,3.3-3.27,3.3h0c-1.8,0-3.27-1.48-3.27-3.3v-39.57c0-3.04-2.44-5.5-5.45-5.5h0c-3.01,0-5.45,2.46-5.45,5.5v43.97c0,1.82-1.46,3.3-3.27,3.3h0c-1.81,0-3.27-1.48-3.27-3.3v-27.48c0-3.04-2.44-5.5-5.46-5.5h-.02c-3.01,0-5.45,2.46-5.45,5.5v59.64c1.82,26.56,16.27,32.84,36.67,32.84,14.54,0,27.09-7.49,33.11-18.36,2.53-4.12,17.88-28.2,19.2-30.71,1.54-2.93,3.79-6.46,6.62-8.8,1.51-1.24,2.52-2.9,3.45-4.63.24-.44.93-5.82-3.03-5.8-3.44.01-7.36,1.47-10.21,3.41-3.19,2.17-7.34,5.93-10.87,12.16-1.15,2.02-3.21,3.44-5.52,3.49-2.18.05-1.62-1.03-1.76-5.58h0v-48.67c0-3.64-2.93-6.6-6.54-6.6h0c-3.62,0-6.55,2.95-6.55,6.59Z"
            fill="#F2C88D"
          />
          <!-- joint ellipses -->
          <ellipse
            v-for="j in cdai_joints"
            :key="j.key"
            class="joint-ellipse"
            :cx="E[j.key].cx"
            :cy="E[j.key].cy"
            :rx="E[j.key].rx"
            :ry="E[j.key].ry"
            :fill="cdai_hoverFill(j.key) ?? jFill(j.key)"
            :stroke="cdai_hoverStroke(j.key) ?? jStroke(j.key)"
            stroke-miterlimit="10"
            :stroke-width="cdai_hoveredKey === j.key ? 2 : 3"
            @mouseenter="cdai_hoveredKey = j.key"
            @mouseleave="cdai_hoveredKey = null"
            @click="cdai_clickJoint(j.key)"
          />
          <text
            fill="#f33"
            font-family="'Noto Sans TC',sans-serif"
            font-size="17"
            font-weight="900"
            transform="translate(57.67 147.97)"
          >
            R
          </text>
          <text
            fill="#03f"
            font-family="'Noto Sans TC',sans-serif"
            font-size="17"
            font-weight="900"
            transform="translate(259.23 147.97)"
          >
            L
          </text>
        </svg>

        <!-- Legend -->
        <div class="legend">
          <div class="leg-row">
            <span
              class="leg-dot"
              style="background: #ffffff; border: 2px solid #cccccc"
            ></span
            >未標記
          </div>
          <div class="leg-row">
            <span class="leg-dot" style="background: #ef4444"></span>觸痛
          </div>
          <div class="leg-row">
            <span class="leg-dot" style="background: #3b82f6"></span>腫脹
          </div>
          <div class="leg-row">
            <span class="leg-dot" style="background: #7c3aed"></span>兩者
          </div>
        </div>
      </div>

      <!-- TJC / SJC summary bars -->
      <div class="joint-summary">
        <div class="js-row">
          <span class="js-label tender-label">觸痛 TJC</span>
          <div class="js-bar-wrap">
            <div class="js-bar">
              <div
                class="js-fill tender-fill"
                :style="{ width: (cdai_tjc / 28) * 100 + '%' }"
              />
            </div>
          </div>
          <span class="js-count tender-count"
            >{{ cdai_tjc }}<span class="js-denom">/28</span></span
          >
        </div>
        <div class="js-row">
          <span class="js-label swollen-label">腫脹 SJC</span>
          <div class="js-bar-wrap">
            <div class="js-bar">
              <div
                class="js-fill swollen-fill"
                :style="{ width: (cdai_sjc / 28) * 100 + '%' }"
              />
            </div>
          </div>
          <span class="js-count swollen-count"
            >{{ cdai_sjc }}<span class="js-denom">/28</span></span
          >
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         STEP 2 — 整體評估 VAS
    ══════════════════════════════════════════════════════════════ -->
    <div class="step-card">
      <div class="step-header">
        <div class="step-num">2</div>
        <div class="step-info">
          <span class="step-title">整體評估（VAS 0–10）</span>
          <span class="step-sub">患者與醫師各自評估整體疾病活動度</span>
        </div>
      </div>

      <!-- PGA -->
      <div class="vas-block">
        <div class="vas-top">
          <div class="vas-labels">
            <span class="vas-name"
              >患者整體評估 <span class="vas-abbr">PGA</span></span
            >
            <span class="vas-desc">患者自評：過去一週關節炎整體活動度</span>
          </div>
          <div class="vas-input-box" :class="{ 'vib-filled': pgaInput !== '' }">
            <input
              v-model="pgaInput"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0–10"
              class="vas-num"
            />
          </div>
        </div>
        <div class="vas-slider-row">
          <span class="vas-anchor-l">0<br /><small>無</small></span>
          <div class="vas-track">
            <div
              class="pga-fill-bar"
              :style="{ width: pga !== null ? (pga / 10) * 100 + '%' : '0%' }"
            />
            <div
              class="vas-thumb pga-thumb"
              v-if="pga !== null"
              :style="{ left: (pga / 10) * 100 + '%' }"
            />
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              :value="pga ?? 0"
              @input="
                cdai_setVas(
                  'pga',
                  parseFloat(($event.target as HTMLInputElement).value),
                )
              "
              class="vas-range"
            />
          </div>
          <span class="vas-anchor-r">10<br /><small>極重</small></span>
        </div>
      </div>

      <div class="vas-divider" />

      <!-- EGA -->
      <div class="vas-block">
        <div class="vas-top">
          <div class="vas-labels">
            <span class="vas-name"
              >醫師整體評估 <span class="vas-abbr">EGA</span></span
            >
            <span class="vas-desc">醫師評估：患者整體疾病活動度</span>
          </div>
          <div class="vas-input-box" :class="{ 'vib-filled': egaInput !== '' }">
            <input
              v-model="egaInput"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0–10"
              class="vas-num"
            />
          </div>
        </div>
        <div class="vas-slider-row">
          <span class="vas-anchor-l">0<br /><small>緩解</small></span>
          <div class="vas-track">
            <div
              class="ega-fill-bar"
              :style="{ width: ega !== null ? (ega / 10) * 100 + '%' : '0%' }"
            />
            <div
              class="vas-thumb ega-thumb"
              v-if="ega !== null"
              :style="{ left: (ega / 10) * 100 + '%' }"
            />
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              :value="ega ?? 0"
              @input="
                cdai_setVas(
                  'ega',
                  parseFloat(($event.target as HTMLInputElement).value),
                )
              "
              class="vas-range"
            />
          </div>
          <span class="vas-anchor-r">10<br /><small>極重</small></span>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════
         Formula display
    ══════════════════════════════════════════════════════════════ -->
    <div class="formula-card">
      <div class="formula-label">CDAI = TJC + SJC + PGA + EGA</div>
      <div class="formula-parts">
        <div class="fp" :class="{ 'fp-on': cdai_tjc > 0 }">
          <span class="fp-n">{{ cdai_tjc }}</span
          ><span class="fp-l">TJC</span>
        </div>
        <span class="fp-op">+</span>
        <div class="fp" :class="{ 'fp-on': cdai_sjc > 0 }">
          <span class="fp-n">{{ cdai_sjc }}</span
          ><span class="fp-l">SJC</span>
        </div>
        <span class="fp-op">+</span>
        <div class="fp" :class="{ 'fp-on': pga !== null }">
          <span class="fp-n">{{ pga ?? "?" }}</span
          ><span class="fp-l">PGA</span>
        </div>
        <span class="fp-op">+</span>
        <div class="fp" :class="{ 'fp-on': ega !== null }">
          <span class="fp-n">{{ ega ?? "?" }}</span
          ><span class="fp-l">EGA</span>
        </div>
        <span class="fp-op">=</span>
        <div class="fp fp-result" :class="cdai_severity.color">
          <span class="fp-n">{{ cdai ?? "—" }}</span
          ><span class="fp-l">CDAI</span>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────────── -->
    <div class="result-card" :class="cdai_severity.color">
      <div class="rc-left">
        <span class="rc-score">{{ cdai ?? "—" }}</span>
        <span class="rc-denom">/ 76</span>
      </div>
      <div class="rc-right">
        <span class="rc-level">{{ cdai_severity.level }}</span>
        <span class="rc-advice">{{ cdai_severity.advice }}</span>
        <div class="rc-pills" v-if="cdai_isComplete">
          <span class="rc-pill">TJC {{ cdai_tjc }}</span>
          <span class="rc-pill">SJC {{ cdai_sjc }}</span>
          <span class="rc-pill">PGA {{ pga }}</span>
          <span class="rc-pill">EGA {{ ega }}</span>
          <span class="rc-pill approx-pill">≈ DAS28 {{ cdai_das28Approx }}</span>
        </div>
      </div>
    </div>

    <!-- ── Detail ─────────────────────────────────────────────────── -->
    <div v-if="cdai_showResults && cdai_isComplete" class="detail-card">
      <div class="dc-header">計算明細</div>
      <div class="dc-row">
        <span class="dc-d">觸痛關節數（TJC28）</span
        ><span class="dc-v brand">{{ cdai_tjc }}</span
        ><span class="dc-u">個</span>
      </div>
      <div class="dc-row">
        <span class="dc-d">腫脹關節數（SJC28）</span
        ><span class="dc-v brand">{{ cdai_sjc }}</span
        ><span class="dc-u">個</span>
      </div>
      <div class="dc-row">
        <span class="dc-d">患者整體評估（PGA）</span
        ><span class="dc-v brand">{{ pga }}</span
        ><span class="dc-u"></span>
      </div>
      <div class="dc-row">
        <span class="dc-d">醫師整體評估（EGA）</span
        ><span class="dc-v brand">{{ ega }}</span
        ><span class="dc-u"></span>
      </div>
      <div class="dc-row dc-total">
        <span class="dc-d">CDAI 總分</span
        ><span class="dc-v brand">{{ cdai }}</span
        ><span class="dc-u">{{ cdai_severity.tag }}</span>
      </div>
      <div class="dc-row">
        <span class="dc-d">DAS28 近似值（換算參考）</span
        ><span class="dc-v brand">≈ {{ cdai_das28Approx }}</span
        ><span class="dc-u"></span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────────── -->
    <div class="actions">
      <button
        class="btn-primary"
        @click="cdai_showResults = !cdai_showResults"
        :disabled="!cdai_isComplete"
      >
        {{ cdai_showResults ? "收起明細" : "查看計算明細" }}
      </button>
      <button class="btn-outline" @click="cdai_copyMarkdown" :disabled="!cdai_isComplete">
        {{ cdai_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-ghost" @click="cdai_reset">重置</button>
    </div>
    <p v-if="!cdai_isComplete" class="hint-text">請輸入 PGA 及 EGA 以完成計算</p>
  </div>
  </div>
</template>

<style scoped>
.raassess {
  max-width: 820px;
  margin: 0 auto;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ RAPID3 快速評估（Routine Assessment）══════════════ */

.r3 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.r3 .r3-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.r3 .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.r3 .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.r3 .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.r3 .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.r3 .score-badge.filling {
  color: var(--vp-c-text-3);
}
.r3 .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.r3 .severity-bar-wrap {
  margin-bottom: 1rem;
}
.r3 .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.r3 .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.r3 .severity-fill.filling {
  background: var(--vp-c-divider);
}
.r3 .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.r3 .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.r3 .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.r3 .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.r3 .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.r3 .tick-g {
  color: #22c55e;
  font-weight: 700;
}
.r3 .tick-y {
  color: #f59e0b;
  font-weight: 700;
}
.r3 .tick-o {
  color: #f97316;
  font-weight: 700;
}
/* ── Risk strip ────────────────────────────────────────────────── */
.r3 .risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.r3 .risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.r3 .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.r3 .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.r3 .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.r3 .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.r3 .normal-risk {
  color: #22c55e;
}
.r3 .mild-risk {
  color: #f59e0b;
}
.r3 .moderate-risk {
  color: #f97316;
}
.r3 .severe-risk {
  color: #ef4444;
}
/* ── Sub-scores ────────────────────────────────────────────────── */
.r3 .sub-scores {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.r3 .sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.r3 .sub-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.r3 .sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}
.r3 .sc-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.r3 .sc-pill .sub-val {
  color: #14b8a6;
}
.r3 .mb-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.r3 .mb-pill .sub-val {
  color: #6366f1;
}
.r3 .ac-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.r3 .ac-pill .sub-val {
  color: #f97316;
}
.r3 .mdhaq-pill {
  border-color: rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.3);
}
.r3 .mdhaq-pill .sub-val {
  color: var(--vp-c-brand-1);
}
/* ── Intro ─────────────────────────────────────────────────────── */
.r3 .intro-bar {
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
.r3 .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
/* ── Groups ────────────────────────────────────────────────────── */
.r3 .r3-group {
  margin-bottom: 1.75rem;
}
.r3 .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.r3 .sc-header {
  border-left-color: #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.r3 .mb-header {
  border-left-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.r3 .ac-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.r3 .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.r3 .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.r3 .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.r3 .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.r3 .sc-pill.group-score-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
  background: rgba(20, 184, 166, 0.06);
}
.r3 .mb-pill.group-score-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.06);
}
.r3 .ac-pill.group-score-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
/* ── Items ─────────────────────────────────────────────────────── */
.r3 .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.r3 .r3-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.r3 .r3-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.r3 .r3-item.answered {
  border-color: rgba(20, 184, 166, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.r3 .r3-item.high {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.r3 .r3-item.active.sc-active {
  border-color: #14b8a6;
}
.r3 .r3-item.active.mb-active {
  border-color: #6366f1;
}
.r3 .r3-item.active.ac-active {
  border-color: #f97316;
}
.r3 .r3-item.flagged {
  border-color: #ef4444 !important;
}
.r3 .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.r3 .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.r3 .sc-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.r3 .mb-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.r3 .ac-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.r3 .r3-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}
.r3 .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.r3 .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.r3 .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.r3 .item-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.r3 .item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.r3 .score-null {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.r3 .score-zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.r3 .score-flagged {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
/* ── Option row — 4 columns ─────────────────────────────────────── */
.r3 .option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.r3 .opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.15rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 4px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.r3 .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.r3 .opt-pill input[type="radio"] {
  display: none;
}
/* Score-specific colors — s0 through s3 */
.r3 .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.r3 .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.r3 .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.r3 .opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.r3 .opt-pill.s1:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.r3 .opt-pill.s1.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.r3 .opt-pill.s2 {
  border-color: rgba(249, 115, 22, 0.15);
}
.r3 .opt-pill.s2:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.r3 .opt-pill.s2.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.r3 .opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.r3 .opt-pill.s3:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.r3 .opt-pill.s3.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.r3 .opt-num {
  font-size: 0.95rem;
  font-weight: 800;
  transition: color 0.2s;
  line-height: 1;
}
.r3 .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.r3 .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.r3 .opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.r3 .opt-pill.s1.active .opt-num {
  color: #eab308;
}
.r3 .opt-pill.s2 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.r3 .opt-pill.s2.active .opt-num {
  color: #f97316;
}
.r3 .opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.r3 .opt-pill.s3.active .opt-num {
  color: #ef4444;
}
.r3 .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.r3 .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.r3 .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.r3 .opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.r3 .opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.r3 .opt-pill.s2 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.r3 .opt-pill.s2.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.r3 .opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.r3 .opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
/* ── MDHAQ footer ──────────────────────────────────────────────── */
.r3 .mdhaq-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
.r3 .mf-label {
  color: var(--vp-c-text-3);
}
.r3 .mf-raw {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.r3 .mf-arrow {
  color: var(--vp-c-text-3);
}
.r3 .mf-score {
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.r3 .mf-pending {
  font-style: italic;
  color: var(--vp-c-text-3);
}
/* ── VAS sections ──────────────────────────────────────────────── */
.r3 .vas-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.r3 .vas-section:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.r3 .vas-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 1rem;
  flex-wrap: wrap;
}
.r3 .vas-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}
.r3 .vas-part-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.r3 .pain-num {
  background: #ef4444;
}
.r3 .gh-num {
  background: #6366f1;
}
.r3 .vas-part-title {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.r3 .vas-abbr {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-left: 4px;
}
.r3 .vas-part-sub {
  display: block;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}
.r3 .vas-score-box {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0.35rem 0.6rem;
  min-width: 66px;
  text-align: center;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.r3 .vas-score-box:focus-within {
  border-color: var(--vp-c-brand-1);
}
.r3 .vas-score-box.vsb-filled {
  border-color: #22c55e;
}
.r3 .vas-score-input {
  width: 48px;
  border: none;
  background: transparent;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.r3 .vas-score-input::-webkit-outer-spin-button,
.r3 .vas-score-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.r3 .vas-score-input::placeholder {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.r3 .vas-slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
}
.r3 .vas-anchor-l,
.r3 .vas-anchor-r {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  text-align: center;
  line-height: 1.3;
  flex-shrink: 0;
  width: 28px;
}
.r3 .vas-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.r3 .pain-fill,
.r3 .gh-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.r3 .pain-fill {
  background: #ef4444;
}
.r3 .gh-fill {
  background: #6366f1;
}
.r3 .vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.2s;
}
.r3 .pain-thumb {
  background: #ef4444;
}
.r3 .gh-thumb {
  background: #6366f1;
}
.r3 .vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
/* ── Result card ───────────────────────────────────────────────── */
.r3 .r3-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .r3-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .r3-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .r3-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .r3-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3 .r3-result.filling {
  border-color: var(--vp-c-divider);
}
.r3 .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.r3 .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.r3 .r3-result.normal .result-number {
  color: #22c55e;
}
.r3 .r3-result.mild .result-number {
  color: #f59e0b;
}
.r3 .r3-result.moderate .result-number {
  color: #f97316;
}
.r3 .r3-result.severe .result-number {
  color: #ef4444;
}
.r3 .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.r3 .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.r3 .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.r3 .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.r3 .result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.r3 .breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.r3 .sc-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.r3 .mb-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.r3 .ac-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.r3 .approx-pill {
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
/* ── Results detail ────────────────────────────────────────────── */
.r3 .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.r3 .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.r3 .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.r3 .sc-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.r3 .mb-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.r3 .ac-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.r3 .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.r3 .detail-row:last-child {
  border-bottom: none;
}
.r3 .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.r3 .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.r3 .detail-domain {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}
.r3 .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.r3 .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.r3 .detail-score.flagged {
  color: #ef4444;
}
.r3 .detail-score.zero {
  color: #22c55e;
}
.r3 .detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}
/* ── Actions ───────────────────────────────────────────────────── */
.r3 .r3-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.r3 .btn-view,
.r3 .btn-copy,
.r3 .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.r3 .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.r3 .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.r3 .btn-view:active {
  transform: translateY(0);
}
.r3 .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.r3 .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.r3 .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.r3 .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.r3 .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.r3 .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.r3 .r3-header {
    flex-direction: column;
  }
.r3 .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.r3 .score-number {
    font-size: 1.5rem;
  }
.r3 .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
.r3 .r3-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ DAS28 疾病活動（Disease Activity Score）══════════════ */

.das {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.das .das-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.das .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.das .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.das .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.das .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.das .score-badge.filling {
  color: var(--vp-c-text-3);
}
.das .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .severity-bar-wrap {
  margin-bottom: 1rem;
}
.das .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.das .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.das .severity-fill.filling {
  background: var(--vp-c-divider);
}
.das .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.das .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.das .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.das .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.das .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.das .tick-threshold {
  color: #22c55e;
  font-weight: 700;
}
.das .risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.das .risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.das .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.das .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.das .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.das .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.das .normal-risk {
  color: #22c55e;
}
.das .mild-risk {
  color: #f59e0b;
}
.das .moderate-risk {
  color: #f97316;
}
.das .severe-risk {
  color: #ef4444;
}
/* Mode toggle */
.das .mode-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.das .label-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.das .mode-toggle {
  display: flex;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}
.das .btn-select {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  font-variant-numeric: tabular-nums;
}
.das .btn-select {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.das .btn-select:hover {
  background: var(--vp-c-bg-mute);
}
.das .mode-tender {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.08) !important;
}
.das .mode-swollen {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  background: rgba(59, 130, 246, 0.08) !important;
}
.das .dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.das .t-dot {
  background: #ef4444;
}
.das .s-dot {
  background: #3b82f6;
}
/* SVG */
.das .svg-wrap {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.das .svg-wrap:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.das .body-svg {
  width: 100%;
  height: auto;
  display: block;
}
.das .joint-ellipse {
  transition: all 0.2s ease;
  cursor: pointer;
}
.das .legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.4rem 0.5rem 0.2rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 2px;
}
.das .legend-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.das .leg-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
/* Counts */
.das .counts-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.das .count-chip {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
}
.das .tender-chip {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.07);
}
.das .swollen-chip {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.07);
}
/* Lab inputs */
.das .lab-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.das .lab-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.das .input-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.das .lab-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0 0.75rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.das .lab-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.das .lab-wrap.filled {
  border-color: #22c55e;
}
.das .lab-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.6rem 0;
  outline: none;
  font-family: inherit;
  width: 0;
  -moz-appearance: textfield;
}
.das .lab-input::-webkit-outer-spin-button,
.das .lab-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.das .lab-input::placeholder {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.das .unit-text {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  padding-left: 4px;
  white-space: nowrap;
}
/* Formula */
.das .formula-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.25s;
}
.das .formula-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.das .calc-title {
  padding: 0.45rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.das .calc-eq {
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.8;
  background: var(--vp-c-bg-soft);
}
.das .formula-ans {
  font-size: 1.4rem;
  font-weight: 800;
  margin-left: 0.5rem;
}
.das .formula-ans.normal {
  color: #22c55e;
}
.das .formula-ans.mild {
  color: #f59e0b;
}
.das .formula-ans.moderate {
  color: #f97316;
}
.das .formula-ans.severe {
  color: #ef4444;
}
.das .formula-ans.filling {
  color: var(--vp-c-text-3);
}
/* Result card */
.das .das-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .das-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .das-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .das-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .das-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das .das-result.filling {
  border-color: var(--vp-c-divider);
}
.das .result-left {
  flex-shrink: 0;
}
.das .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.das .das-result.normal .result-number {
  color: #22c55e;
}
.das .das-result.mild .result-number {
  color: #f59e0b;
}
.das .das-result.moderate .result-number {
  color: #f97316;
}
.das .das-result.severe .result-number {
  color: #ef4444;
}
.das .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.das .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.das .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.das .result-sub {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.das .sub-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
/* Results detail */
.das .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.das .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.das .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.das .detail-row:last-child {
  border-bottom: none;
}
.das .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.das .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.das .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.das .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.das .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}
/* Actions */
.das .das-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.das .btn-view,
.das .btn-copy,
.das .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.das .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.das .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.das .btn-view:active {
  transform: translateY(0);
}
.das .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.das .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.das .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.das .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.das .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.das .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.das .das-header {
    flex-direction: column;
  }
.das .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.das .score-number {
    font-size: 1.5rem;
  }
.das .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
.das .lab-section {
    grid-template-columns: 1fr;
  }
.das .das-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ── Lab mode toggle ───────────────────────────────────────────── */
.das .lab-mode-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}
.das .label-text {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.das .lab-mode-toggle {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.das .btn-select {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 7px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.das .btn-select:hover {
  background: var(--vp-c-bg-mute);
}
.das .lm-active-esr {
  border-color: #14b8a6 !important;
  color: #14b8a6 !important;
  background: rgba(20, 184, 166, 0.08) !important;
}
.das .lm-active-crp {
  border-color: #8b5cf6 !important;
  color: #8b5cf6 !important;
  background: rgba(139, 92, 246, 0.08) !important;
}
.das .lm-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.das .esr-dot {
  background: #14b8a6;
}
.das .crp-dot {
  background: #8b5cf6;
}
/* Lab version tag */
.das .lab-version-tag {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  vertical-align: middle;
}
.das .esr-tag {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}
.das .crp-tag {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}
.das .hint-text {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
  font-style: italic;
}
/* Formula title row with version pill */
.das .calc-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border-bottom: 1px solid var(--vp-c-divider);
}
.das .calc-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex: 1;
}
.das .formula-version-pill {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
}
.das .esr-pill {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.das .crp-pill {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}
/* ══════════════ CDAI 臨床活動（Clinical Disease Activity）══════════════ */

.cdai {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.cdai .cdai-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.cdai .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cdai .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.cdai .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cdai .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.cdai .score-badge.filling {
  color: var(--vp-c-text-3);
}
.cdai .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.cdai .severity-bar-wrap {
  margin-bottom: 1rem;
}
.cdai .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cdai .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cdai .severity-fill.filling {
  background: var(--vp-c-divider);
}
.cdai .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cdai .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cdai .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cdai .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cdai .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.cdai .tick-g {
  color: #22c55e;
  font-weight: 700;
}
.cdai .tick-y {
  color: #f59e0b;
  font-weight: 700;
}
.cdai .tick-o {
  color: #f97316;
  font-weight: 700;
}
/* ── Risk strip ────────────────────────────────────────────────── */
.cdai .risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.cdai .risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.cdai .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.cdai .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cdai .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.cdai .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
/* ── Advantage bar ─────────────────────────────────────────────── */
.cdai .adv-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 10px;
  margin-bottom: 1.25rem;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.3);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cdai .adv-icon {
  color: #22c55e;
  font-weight: 700;
  flex-shrink: 0;
}
/* ── Step cards ────────────────────────────────────────────────── */
.cdai .step-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cdai .step-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.cdai .step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.cdai .step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.cdai .step-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}
.cdai .step-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cdai .step-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
/* live joint counts in header */
.cdai .step-counts {
  display: flex;
  gap: 0.6rem;
  margin-left: auto;
}
.cdai .sc-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  font-weight: 700;
}
.cdai .sc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}
.cdai .sc-dot2 {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}
.cdai .sc-n {
  font-size: 1rem;
  font-weight: 800;
}
.cdai .sc-lbl {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.cdai .tender-sc .sc-n {
  color: #ef4444;
}
.cdai .swollen-sc .sc-n {
  color: #3b82f6;
}
/* ── Mode toggle ───────────────────────────────────────────────── */
.cdai .mode-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}
.cdai .mode-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 6px 16px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.cdai .mode-btn:hover {
  background: var(--vp-c-bg-mute);
}
.cdai .mode-btn-tender {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
}
.cdai .mode-btn-swollen {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.08);
}
.cdai .mode-btn-off {
  border-color: var(--vp-c-divider);
}
.cdai .mbdot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.cdai .mode-legend {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}
.cdai .leg-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cdai .leg-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
/* ── SVG diagram ───────────────────────────────────────────────── */
.cdai .diagram-wrap {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.cdai .body-svg {
  width: 100%;
  height: auto;
  display: block;
}
.cdai .joint-ellipse {
  transition: all 0.2s ease;
  cursor: pointer;
}
.cdai .legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.4rem 0.5rem 0.2rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 2px;
}
.cdai .leg-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.cdai .leg-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}
/* ── Joint summary bars ────────────────────────────────────────── */
.cdai .joint-summary {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.cdai .js-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.cdai .js-label {
  font-size: 0.72rem;
  font-weight: 700;
  width: 52px;
  flex-shrink: 0;
}
.cdai .tender-label {
  color: #ef4444;
}
.cdai .swollen-label {
  color: #3b82f6;
}
.cdai .js-bar-wrap {
  flex: 1;
}
.cdai .js-bar {
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: hidden;
}
.cdai .js-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}
.cdai .tender-fill {
  background: #ef4444;
}
.cdai .swollen-fill {
  background: #3b82f6;
}
.cdai .js-count {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 36px;
  text-align: right;
}
.cdai .tender-count {
  color: #ef4444;
}
.cdai .swollen-count {
  color: #3b82f6;
}
.cdai .js-denom {
  font-size: 0.62rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
/* ── VAS blocks ────────────────────────────────────────────────── */
.cdai .vas-block {
  padding: 0.85rem 1rem;
}
.cdai .vas-divider {
  border-top: 1px solid var(--vp-c-divider);
}
.cdai .vas-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.7rem;
}
.cdai .vas-labels {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.cdai .vas-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cdai .vas-abbr {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-left: 4px;
}
.cdai .vas-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.cdai .vas-input-box {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0.35rem 0.6rem;
  min-width: 66px;
  text-align: center;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cdai .vas-input-box:focus-within {
  border-color: var(--vp-c-brand-1);
}
.cdai .vas-input-box.vib-filled {
  border-color: #22c55e;
}
.cdai .vas-num {
  width: 48px;
  border: none;
  background: transparent;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.cdai .vas-num::-webkit-outer-spin-button,
.cdai .vas-num::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.cdai .vas-num::placeholder {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.cdai .vas-slider-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.cdai .vas-anchor-l,
.cdai .vas-anchor-r {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  text-align: center;
  line-height: 1.3;
  flex-shrink: 0;
  width: 28px;
}
.cdai .vas-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.cdai .pga-fill-bar,
.cdai .ega-fill-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.cdai .pga-fill-bar {
  background: #6366f1;
}
.cdai .ega-fill-bar {
  background: #14b8a6;
}
.cdai .vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.2s;
}
.cdai .pga-thumb {
  background: #6366f1;
}
.cdai .ega-thumb {
  background: #14b8a6;
}
.cdai .vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
/* ── Formula card ──────────────────────────────────────────────── */
.cdai .formula-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.25s;
}
.cdai .formula-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.cdai .formula-label {
  padding: 0.5rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border-bottom: 1px solid var(--vp-c-divider);
}
.cdai .formula-parts {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  flex-wrap: wrap;
}
.cdai .fp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  min-width: 52px;
  transition: all 0.2s;
}
.cdai .fp.fp-on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.cdai .fp-n {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.cdai .fp-l {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.cdai .fp-op {
  font-size: 1.2rem;
  font-weight: 300;
  color: var(--vp-c-text-3);
}
.cdai .fp-result {
  min-width: 60px;
}
.cdai .fp-result.normal {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.07);
}
.cdai .fp-result.mild {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.cdai .fp-result.moderate {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.cdai .fp-result.severe {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.cdai .fp-result.normal .fp-n {
  color: #22c55e;
}
.cdai .fp-result.mild .fp-n {
  color: #f59e0b;
}
.cdai .fp-result.moderate .fp-n {
  color: #f97316;
}
.cdai .fp-result.severe .fp-n {
  color: #ef4444;
}
/* ── Result card ───────────────────────────────────────────────── */
.cdai .result-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .result-card.filling {
  border-color: var(--vp-c-divider);
}
.cdai .result-card.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .result-card.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .result-card.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .result-card.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdai .rc-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.cdai .rc-score {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cdai .result-card.normal .rc-score {
  color: #22c55e;
}
.cdai .result-card.mild .rc-score {
  color: #f59e0b;
}
.cdai .result-card.moderate .rc-score {
  color: #f97316;
}
.cdai .result-card.severe .rc-score {
  color: #ef4444;
}
.cdai .rc-denom {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.cdai .rc-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.cdai .rc-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cdai .rc-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cdai .rc-pills {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.cdai .rc-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.cdai .approx-pill {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.3);
  color: #6366f1;
}
/* ── Detail card ───────────────────────────────────────────────── */
.cdai .detail-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cdai .dc-header {
  padding: 0.45rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cdai .dc-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cdai .dc-row:last-child {
  border-bottom: none;
}
.cdai .dc-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.cdai .dc-d {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.cdai .dc-v {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.cdai .dc-v.brand {
  color: var(--vp-c-brand-1);
}
.cdai .dc-u {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
}
/* ── Actions ───────────────────────────────────────────────────── */
.cdai .actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cdai .btn-primary,
.cdai .btn-outline,
.cdai .btn-ghost {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cdai .btn-primary {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cdai .btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cdai .btn-primary:active:not(:disabled) {
  transform: translateY(0);
}
.cdai .btn-primary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cdai .btn-outline {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cdai .btn-outline:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cdai .btn-outline:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cdai .btn-ghost {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cdai .btn-ghost:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cdai .hint-text {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.cdai .cdai-header {
    flex-direction: column;
  }
.cdai .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.cdai .score-number {
    font-size: 1.5rem;
  }
.cdai .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
.cdai .result-card {
    flex-direction: column;
    gap: 0.75rem;
  }
.cdai .formula-parts {
    gap: 0.3rem;
  }
.cdai .fp {
    min-width: 44px;
    padding: 0.4rem 0.5rem;
  }
.cdai .fp-n {
    font-size: 1rem;
  }
.cdai .step-counts {
    display: none;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.raassess .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* fixed size so the card doesn't expand when the result appears */
  width: 128px;
  height: 104px;
  min-width: 128px;
  min-height: 104px;
  flex-shrink: 0;
  padding: 0.4rem 0.5rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.raassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.raassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.raassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.raassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.raassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.raassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.raassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.raassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.raassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .raassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

/* ══════════════ Shared UI unification（三工具統一）══════════════ */

/* Joint-mode toggle — DAS28 and CDAI identical segmented style */
.raassess .mode-toggle,
.raassess .mode-row {
  display: flex;
  gap: 0.4rem;
}
.raassess .mode-btn {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 0.4rem !important;
  flex: 1 !important;
  min-width: 0 !important;
  padding: 8px 16px !important;
  border-radius: 8px !important;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease !important;
}
.raassess .dot,
.raassess .mbdot {
  width: 10px !important;
  height: 10px !important;
  border-radius: 50%;
  flex-shrink: 0;
}
.raassess .mode-btn:hover {
  background: var(--vp-c-bg-mute);
}
.raassess .mode-btn.mode-btn-tender {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.08) !important;
}
.raassess .mode-btn.mode-btn-swollen {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  background: rgba(59, 130, 246, 0.08) !important;
}
.raassess .mode-btn.mode-btn-off {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

/* Formula display — larger, values emphasized */
.raassess .formula-title {
  font-size: 0.85rem !important;
  font-weight: 700 !important;
}
.raassess .formula-eq {
  font-size: 0.92rem !important;
  line-height: 1.8 !important;
}
.raassess .formula-eq b {
  color: var(--vp-c-brand-1);
  font-size: 1rem;
}
.raassess .formula-ans {
  font-size: 1.05rem !important;
  font-weight: 800 !important;
}

/* RAPID3 option pills — bright colors (dysphagia/dysphonia style) */
.raassess .r3 .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.raassess .r3 .opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.raassess .r3 .opt-pill.s2 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.raassess .r3 .opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.raassess .r3 .opt-desc {
  font-size: 0.78rem !important;
  line-height: 1.3;
}
.raassess .r3 .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.raassess .r3 .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.raassess .r3 .opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.raassess .r3 .opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.raassess .r3 .opt-pill.s2 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.raassess .r3 .opt-pill.s2.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}
.raassess .r3 .opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.raassess .r3 .opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* VAS sections — larger anchors, numbers, hints */
.raassess .vas-anchor-l,
.raassess .vas-anchor-r {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-2) !important;
}
.raassess .vas-anchor-l small,
.raassess .vas-anchor-r small {
  font-size: 0.78rem !important;
}
.raassess .vas-num {
  font-size: 0.92rem !important;
  font-weight: 700 !important;
}
.raassess .vas-part-sub {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
}
.raassess .vas-score-input {
  font-size: 1.1rem !important;
  font-weight: 800 !important;
}
.raassess .num-hint {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
}

/* Joint count chips — cdai-style shared by DAS28 and CDAI panels */
.raassess .counts-row {
  display: flex;
  gap: 1.25rem;
  align-items: center;
}
.raassess .sc-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
}
.raassess .sc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
}
.raassess .sc-dot2 {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}
.raassess .sc-n {
  font-size: 1.05rem !important;
  font-weight: 800 !important;
}
.raassess .tender-sc .sc-n {
  color: #ef4444;
}
.raassess .swollen-sc .sc-n {
  color: #3b82f6;
}
.raassess .sc-lbl {
  font-size: 0.75rem !important;
  color: var(--vp-c-text-2) !important;
}

/* Joint legend — identical row style in both panels */
.raassess .legend,
.raassess .mode-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}
.raassess .legend-row,
.raassess .leg-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem !important;
  color: var(--vp-c-text-2) !important;
}

/* ══ DAS28 lab section redesign（發炎指標・輸入卡・公式卡）══ */

/* 發炎指標 selector bar */
.raassess .lab-mode-row {
  display: flex !important;
  align-items: center !important;
  gap: 0.75rem !important;
  flex-wrap: wrap;
  padding: 0.6rem 0.85rem !important;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  margin-bottom: 0.85rem !important;
}
.raassess .lab-mode-label {
  font-size: 0.88rem !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1) !important;
}
.raassess .lab-mode-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 7px 18px !important;
  border-radius: 999px !important;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.85rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-2);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.raassess .lab-mode-btn:hover {
  border-color: var(--vp-c-text-3);
}
.raassess .lab-mode-btn.lm-active-esr {
  border-color: #f59e0b !important;
  color: #d97706 !important;
  background: rgba(245, 158, 11, 0.1) !important;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.15);
}
.raassess .lab-mode-btn.lm-active-crp {
  border-color: #8b5cf6 !important;
  color: #7c3aed !important;
  background: rgba(139, 92, 246, 0.1) !important;
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.15);
}
.raassess .lm-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Lab input cards — color-coded left borders */
.raassess .lab-section {
  gap: 0.85rem !important;
}
.raassess .lab-group {
  padding: 0.85rem 1rem !important;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left-width: 4px;
  background: var(--vp-c-bg-soft);
}
.raassess .lab-group:has(.esr-tag) {
  border-left-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.05), transparent);
}
.raassess .lab-group:has(.crp-tag) {
  border-left-color: #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent);
}
.raassess .lab-group:last-child {
  border-left-color: var(--vp-c-brand-1);
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), transparent);
}
.raassess .lab-label {
  font-size: 0.88rem !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1) !important;
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem !important;
}
.raassess .lab-version-tag {
  font-size: 0.7rem !important;
  font-weight: 800 !important;
  padding: 2px 9px !important;
  border-radius: 999px;
}
.raassess .esr-tag {
  color: #d97706 !important;
  background: rgba(245, 158, 11, 0.12) !important;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.raassess .crp-tag {
  color: #7c3aed !important;
  background: rgba(139, 92, 246, 0.12) !important;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.raassess .lab-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  padding: 2px 10px 2px 2px;
}
.raassess .lab-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px
    color-mix(in srgb, var(--vp-c-brand-1) 15%, transparent);
}
.raassess .lab-wrap.filled {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, transparent);
}
.raassess .lab-input {
  font-size: 1.1rem !important;
  font-weight: 800 !important;
  color: var(--vp-c-text-1) !important;
  padding: 8px 10px !important;
  border: none !important;
  background: transparent !important;
  flex: 1;
  min-width: 0;
}
.raassess .lab-unit {
  font-size: 0.76rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-2) !important;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  padding: 3px 10px;
  white-space: nowrap;
  flex-shrink: 0;
}
.raassess .lab-hint-text {
  font-size: 0.78rem !important;
  color: var(--vp-c-text-2) !important;
  margin-top: 0.45rem !important;
  padding-left: 2px;
}

/* Formula card — accented, mono equation, emphasized values */
.raassess .formula-card {
  border: 1px solid var(--vp-c-divider) !important;
  border-left: 4px solid var(--vp-c-brand-1) !important;
  border-radius: 10px !important;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--vp-c-brand-1) 5%, transparent),
    var(--vp-c-bg-soft)
  ) !important;
  padding: 0.85rem 1rem !important;
}
.raassess .formula-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}
.raassess .formula-title {
  font-family: var(--vp-font-family-mono) !important;
  font-size: 0.82rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-2) !important;
}
.raassess .formula-version-pill {
  font-size: 0.72rem !important;
  font-weight: 800 !important;
  padding: 2px 10px !important;
  border-radius: 999px;
}
.raassess .formula-version-pill.esr-pill {
  color: #d97706 !important;
  background: rgba(245, 158, 11, 0.12) !important;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.raassess .formula-version-pill.crp-pill {
  color: #7c3aed !important;
  background: rgba(139, 92, 246, 0.12) !important;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.raassess .formula-eq {
  font-family: var(--vp-font-family-mono) !important;
  font-size: 0.95rem !important;
  line-height: 2 !important;
  color: var(--vp-c-text-1) !important;
}
.raassess .formula-eq b {
  color: var(--vp-c-brand-1) !important;
  font-size: 1.02rem !important;
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  border-radius: 5px;
  padding: 0 5px;
}
.raassess .formula-ans {
  display: inline-block;
  font-size: 1.15rem !important;
  font-weight: 800 !important;
  margin-left: 4px;
}

/* ══ 關節評估 step-card（DAS28 與 CDAI 同款）══ */
.raassess .step-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
}
.raassess .step-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border-bottom: 1px solid var(--vp-c-divider);
}
.raassess .step-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.raassess .step-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}
.raassess .step-title {
  font-size: 0.88rem !important;
  font-weight: 700 !important;
  color: var(--vp-c-text-1) !important;
}
.raassess .step-sub {
  font-size: 0.78rem !important;
  color: var(--vp-c-text-2) !important;
}
.raassess .step-counts {
  display: flex;
  gap: 0.6rem;
  margin-left: auto;
}
.raassess .mode-row {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.raassess .diagram-wrap {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.raassess .body-svg {
  width: 100%;
  height: auto;
  display: block;
}
.raassess .joint-summary {
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.raassess .js-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.raassess .js-label {
  font-size: 0.78rem !important;
  font-weight: 700 !important;
  width: 60px;
  flex-shrink: 0;
}
.raassess .tender-label {
  color: #ef4444;
}
.raassess .swollen-label {
  color: #3b82f6;
}
.raassess .js-bar-wrap {
  flex: 1;
}
.raassess .js-bar {
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: hidden;
}
.raassess .js-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.3s;
}
.raassess .tender-fill {
  background: #ef4444;
}
.raassess .swollen-fill {
  background: #3b82f6;
}
.raassess .js-count {
  font-size: 0.9rem !important;
  font-weight: 800 !important;
  flex-shrink: 0;
  width: 44px;
  text-align: right;
}
.raassess .tender-count {
  color: #ef4444;
}
.raassess .swollen-count {
  color: #3b82f6;
}
.raassess .js-denom {
  font-size: 0.72rem !important;
  font-weight: 400 !important;
  color: var(--vp-c-text-3) !important;
}
.raassess .legend {
  padding: 0.4rem 0.5rem 0.2rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 2px;
}
</style>
