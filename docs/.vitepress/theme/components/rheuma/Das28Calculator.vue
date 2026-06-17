<script setup lang="ts">
import { ref, computed } from "vue";

// ── All 28 joints mapped to SVG ellipse IDs ───────────────────────
const joints = [
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
const tender = ref<Record<string, boolean>>(
  Object.fromEntries(joints.map((j) => [j.key, false])),
);
const swollen = ref<Record<string, boolean>>(
  Object.fromEntries(joints.map((j) => [j.key, false])),
);
const mode = ref<"tender" | "swollen">("tender");
const hoveredKey = ref<string | null>(null);
const labMode = ref<"ESR" | "CRP">("ESR"); // which inflammatory marker
const esrInput = ref("");
const crpInput = ref("");
const ghInput = ref("");
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const tjc = computed(() => Object.values(tender.value).filter(Boolean).length);
const sjc = computed(() => Object.values(swollen.value).filter(Boolean).length);

const esr = computed(() => {
  const v = parseFloat(esrInput.value);
  return isNaN(v) || v <= 0 ? null : v;
});
const crp = computed(() => {
  const v = parseFloat(crpInput.value);
  return isNaN(v) || v < 0 ? null : v;
});
const gh = computed(() => {
  const v = parseFloat(ghInput.value);
  return isNaN(v) || v < 0 || v > 100 ? null : v;
});

// whichever marker the user chose must be filled
const markerOk = computed(() =>
  labMode.value === "ESR" ? esr.value !== null : crp.value !== null,
);
const isComplete = computed(() => markerOk.value && gh.value !== null);

const das28 = computed(() => {
  if (!isComplete.value) return null;

  if (labMode.value === "ESR") {
    // DAS28-ESR = 0.56√TJC + 0.28√SJC + 0.70×ln(ESR) + 0.014×GH
    const val =
      0.56 * Math.sqrt(tjc.value) +
      0.28 * Math.sqrt(sjc.value) +
      0.7 * Math.log(esr.value!) +
      0.014 * gh.value!;
    return Math.round(val * 100) / 100;
  } else {
    // DAS28-CRP = 0.56√TJC + 0.28√SJC + 0.36×ln(CRP+1) + 0.014×GH + 0.96
    const val =
      0.56 * Math.sqrt(tjc.value) +
      0.28 * Math.sqrt(sjc.value) +
      0.36 * Math.log(crp.value! + 1) +
      0.014 * gh.value! +
      0.96;
    return Math.round(val * 100) / 100;
  }
});

const severity = computed(() => {
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
  const t = tender.value[key],
    s = swollen.value[key];
  if (t && s) return "both";
  if (t) return "tender";
  if (s) return "swollen";
  return "none";
}

function clickJoint(key: string) {
  if (mode.value === "tender") tender.value[key] = !tender.value[key];
  else swollen.value[key] = !swollen.value[key];
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

function hoverFill(key: string): string | null {
  if (hoveredKey.value !== key) return null;
  const s = state(key);
  const m = mode.value;
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
function hoverStroke(key: string): string | null {
  if (hoveredKey.value !== key) return null;
  const s = state(key);
  const m = mode.value;
  if (s === "none") return m === "tender" ? "#ef4444" : "#3b82f6";
  if (
    (s === "tender" && m === "swollen") ||
    (s === "swollen" && m === "tender")
  )
    return "#7c3aed";
  return null;
}

function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const tList =
    joints
      .filter((j) => tender.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  const sList =
    joints
      .filter((j) => swollen.value[j.key])
      .map((j) => j.label)
      .join("、") || "無";
  const sv = severity.value;
  const labLine =
    labMode.value === "ESR"
      ? `- **ESR**：${esrInput.value} mm/hour`
      : `- **CRP**：${crpInput.value} mg/L`;
  const formulaLine =
    labMode.value === "ESR"
      ? `DAS28-ESR = 0.56 × √${tjc.value} + 0.28 × √${sjc.value} + 0.70 × ln(${esrInput.value}) + 0.014 × ${ghInput.value}`
      : `DAS28-CRP = 0.56 × √${tjc.value} + 0.28 × √${sjc.value} + 0.36 × ln(${crpInput.value}+1) + 0.014 × ${ghInput.value} + 0.96`;

  return `# DAS28 類風濕性關節炎疾病活動指數評估結果\n\n## 評估日期：${date}\n\n## 關節評估\n\n- **觸痛關節數（TJC28）**：${tjc.value} 個\n  - 觸痛關節：${tList}\n- **腫脹關節數（SJC28）**：${sjc.value} 個\n  - 腫脹關節：${sList}\n\n## 實驗室及整體評估\n\n${labLine}\n- **GH 整體健康狀態**：${ghInput.value} 分（0–100）\n\n## 計算結果\n\n${formulaLine}\n\n**DAS28 分數：${das28.value}**（版本：DAS28-${labMode.value}）\n\n- **疾病活動度**：${sv.level}\n- **臨床建議**：${sv.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  joints.forEach((j) => {
    tender.value[j.key] = false;
    swollen.value[j.key] = false;
  });
  esrInput.value = "";
  crpInput.value = "";
  ghInput.value = "";
  showResults.value = false;
}
</script>

<template>
  <div class="das">
    <!-- Header -->
    <div class="das-header">
      <div class="header-title">
        <h2 class="title">DAS28 疾病活動指數</h2>
        <p class="subtitle">
          Disease Activity Score 28 · 類風濕性關節炎活動度評估
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ das28 ?? "—" }}</span>
        <span class="score-label">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
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

    <!-- Mode toggle -->
    <div class="mode-wrap">
      <span class="mode-label">點擊關節模式：</span>
      <div class="mode-toggle">
        <button
          class="mode-btn"
          :class="{ 'mode-tender': mode === 'tender' }"
          @click="mode = 'tender'"
        >
          <span class="dot t-dot"></span>觸痛（TJC）· {{ tjc }} 個
        </button>
        <button
          class="mode-btn"
          :class="{ 'mode-swollen': mode === 'swollen' }"
          @click="mode = 'swollen'"
        >
          <span class="dot s-dot"></span>腫脹（SJC）· {{ sjc }} 個
        </button>
      </div>
    </div>

    <!-- SVG Body diagram -->
    <div class="svg-wrap">
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
          v-for="j in joints"
          :key="j.key"
          class="joint-ellipse"
          :cx="ellipses[j.key].cx"
          :cy="ellipses[j.key].cy"
          :rx="ellipses[j.key].rx"
          :ry="ellipses[j.key].ry"
          :fill="hoverFill(j.key) ?? jointFill(j.key)"
          :stroke="hoverStroke(j.key) ?? jointStroke(j.key)"
          stroke-miterlimit="10"
          :stroke-width="hoveredKey === j.key ? 2 : 3"
          @mouseenter="hoveredKey = j.key"
          @mouseleave="hoveredKey = null"
          @click="clickJoint(j.key)"
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

    <!-- Joint counts summary -->
    <div class="counts-row">
      <span class="count-chip tender-chip">觸痛 TJC：{{ tjc }} / 28</span>
      <span class="count-chip swollen-chip">腫脹 SJC：{{ sjc }} / 28</span>
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
        <div class="lab-wrap" :class="{ filled: ghInput !== '' }">
          <input
            v-model="ghInput"
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
        = 0.56 × √<b>{{ tjc }}</b> + 0.28 × √<b>{{ sjc }}</b> + 0.70 × ln(<b>{{
          esrInput || "?"
        }}</b
        >) + 0.014 × <b>{{ ghInput || "?" }}</b>
        <span class="formula-ans" :class="severity.color">
          = {{ das28 ?? "—" }}</span
        >
      </div>
      <div class="formula-eq" v-else>
        = 0.56 × √<b>{{ tjc }}</b> + 0.28 × √<b>{{ sjc }}</b> + 0.36 × ln(<b>{{
          crpInput !== "" ? crpInput + "+1" : "?"
        }}</b
        >) + 0.014 × <b>{{ ghInput || "?" }}</b> + 0.96
        <span class="formula-ans" :class="severity.color">
          = {{ das28 ?? "—" }}</span
        >
      </div>
    </div>

    <!-- Result card -->
    <div class="das-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ das28 ?? "—" }}</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-sub">
          <span class="sub-pill">TJC：{{ tjc }}</span>
          <span class="sub-pill">SJC：{{ sjc }}</span>
          <span class="sub-pill" v-if="esr">ESR：{{ esr }}</span>
          <span class="sub-pill" v-if="gh !== null">GH：{{ gh }}</span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-domain">觸痛關節數（TJC28）</span
        ><span class="detail-score brand">{{ tjc }}</span
        ><span class="detail-desc">個</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">腫脹關節數（SJC28）</span
        ><span class="detail-score brand">{{ sjc }}</span
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
        ><span class="detail-score brand">{{ ghInput || "—" }}</span
        ><span class="detail-desc">分</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">DAS28 分數</span
        ><span class="detail-score brand">{{ das28 ?? "—" }}</span
        ><span class="detail-desc">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="das-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估明細" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請輸入 {{ labMode }} 及 GH 以計算 DAS28 分數
    </p>
  </div>
</template>

<style scoped>
.das {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

.das-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.score-badge {
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
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.severity-bar-wrap {
  margin-bottom: 1rem;
}
.severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #22c55e;
  font-weight: 700;
}

.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.risk-pill {
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
.risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.normal-risk {
  color: #22c55e;
}
.mild-risk {
  color: #f59e0b;
}
.moderate-risk {
  color: #f97316;
}
.severe-risk {
  color: #ef4444;
}

/* Mode toggle */
.mode-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.mode-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.mode-toggle {
  display: flex;
  gap: 0.4rem;
  flex: 1;
  min-width: 0;
}
.mode-btn {
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
.mode-btn {
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
.mode-btn:hover {
  background: var(--vp-c-bg-mute);
}
.mode-tender {
  border-color: #ef4444 !important;
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.08) !important;
}
.mode-swollen {
  border-color: #3b82f6 !important;
  color: #3b82f6 !important;
  background: rgba(59, 130, 246, 0.08) !important;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.t-dot {
  background: #ef4444;
}
.s-dot {
  background: #3b82f6;
}

/* SVG */
.svg-wrap {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  padding: 0.5rem;
  margin-bottom: 0.75rem;
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.svg-wrap:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.body-svg {
  width: 100%;
  height: auto;
  display: block;
}
.joint-ellipse {
  transition: all 0.2s ease;
  cursor: pointer;
}

.legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 0.4rem 0.5rem 0.2rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 2px;
}
.leg-row {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.leg-dot {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  flex-shrink: 0;
  display: inline-block;
}

/* Counts */
.counts-row {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.count-chip {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
}
.tender-chip {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.07);
}
.swollen-chip {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.07);
}

/* Lab inputs */
.lab-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.lab-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.lab-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lab-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0 0.75rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.lab-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.lab-wrap.filled {
  border-color: #22c55e;
}
.lab-input {
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
.lab-input::-webkit-outer-spin-button,
.lab-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.lab-input::placeholder {
  font-size: 0.9rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.lab-unit {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  padding-left: 4px;
  white-space: nowrap;
}

/* Formula */
.formula-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  transition: all 0.25s;
}
.formula-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.formula-title {
  padding: 0.45rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.formula-eq {
  padding: 0.85rem 1rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.8;
  background: var(--vp-c-bg-soft);
}
.formula-ans {
  font-size: 1.4rem;
  font-weight: 800;
  margin-left: 0.5rem;
}
.formula-ans.normal {
  color: #22c55e;
}
.formula-ans.mild {
  color: #f59e0b;
}
.formula-ans.moderate {
  color: #f97316;
}
.formula-ans.severe {
  color: #ef4444;
}
.formula-ans.filling {
  color: var(--vp-c-text-3);
}

/* Result card */
.das-result {
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
.das-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.das-result.filling {
  border-color: var(--vp-c-divider);
}
.result-left {
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.das-result.normal .result-number {
  color: #22c55e;
}
.das-result.mild .result-number {
  color: #f59e0b;
}
.das-result.moderate .result-number {
  color: #f97316;
}
.das-result.severe .result-number {
  color: #ef4444;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

/* Results detail */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}

/* Actions */
.das-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
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
.btn-view:active {
  transform: translateY(0);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .das-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .lab-section {
    grid-template-columns: 1fr;
  }
  .das-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}

/* ── Lab mode toggle ───────────────────────────────────────────── */
.lab-mode-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  flex-wrap: wrap;
}
.lab-mode-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}
.lab-mode-toggle {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.lab-mode-btn {
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
.lab-mode-btn:hover {
  background: var(--vp-c-bg-mute);
}
.lm-active-esr {
  border-color: #14b8a6 !important;
  color: #14b8a6 !important;
  background: rgba(20, 184, 166, 0.08) !important;
}
.lm-active-crp {
  border-color: #8b5cf6 !important;
  color: #8b5cf6 !important;
  background: rgba(139, 92, 246, 0.08) !important;
}

.lm-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.esr-dot {
  background: #14b8a6;
}
.crp-dot {
  background: #8b5cf6;
}

/* Lab version tag */
.lab-version-tag {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  margin-left: 6px;
  vertical-align: middle;
}
.esr-tag {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
}
.crp-tag {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.lab-hint-text {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
  font-style: italic;
}

/* Formula title row with version pill */
.formula-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border-bottom: 1px solid var(--vp-c-divider);
}
.formula-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex: 1;
}
.formula-version-pill {
  flex-shrink: 0;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
}
.esr-pill {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.crp-pill {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}
</style>
