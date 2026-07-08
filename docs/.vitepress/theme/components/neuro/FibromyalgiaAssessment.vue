<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"wpi" | "fm">("wpi");

// ══════════════ WPI 廣泛疼痛指數（Widespread Pain Index）══════════════

// ── WPI Pain Areas ────────────────────────────────────────────────
// Wolfe 2010 ACR — 19 body regions, each checked = 1 point
const regions = [
  {
    group: "左側",
    sub: "Left Side",
    color: "left",
    areas: [
      { key: "l_shoulder", name: "肩胛帶", sub: "Shoulder girdle" },
      { key: "l_upper_arm", name: "上臂", sub: "Upper arm" },
      { key: "l_lower_arm", name: "前臂", sub: "Lower arm" },
      { key: "l_hip", name: "髖部／臀部", sub: "Hip / Buttock" },
      { key: "l_jaw", name: "顎部", sub: "Jaw" },
      { key: "l_thigh", name: "大腿", sub: "Thigh" },
      { key: "l_calf", name: "小腿", sub: "Calf" },
    ],
  },
  {
    group: "右側",
    sub: "Right Side",
    color: "right",
    areas: [
      { key: "r_shoulder", name: "肩胛帶", sub: "Shoulder girdle" },
      { key: "r_upper_arm", name: "上臂", sub: "Upper arm" },
      { key: "r_lower_arm", name: "前臂", sub: "Lower arm" },
      { key: "r_hip", name: "髖部／臀部", sub: "Hip / Buttock" },
      { key: "r_jaw", name: "顎部", sub: "Jaw" },
      { key: "r_thigh", name: "大腿", sub: "Thigh" },
      { key: "r_calf", name: "小腿", sub: "Calf" },
    ],
  },
  {
    group: "軀幹",
    sub: "Axial",
    color: "axial",
    areas: [
      { key: "neck", name: "頸部", sub: "Neck" },
      { key: "chest", name: "胸部", sub: "Chest" },
      { key: "abdomen", name: "腹部", sub: "Abdomen" },
      { key: "upper_back", name: "上背", sub: "Upper back" },
      { key: "lower_back", name: "下背", sub: "Lower back" },
    ],
  },
];

const allAreas = regions.flatMap((r) => r.areas);

// ── SVG body diagram — coordinates from wpi-body.svg ──────────────
const svgMap: Record<string, { cx: number; cy: number }> = {
  r_shoulder: { cx: 64.22, cy: 70.29 },
  l_shoulder: { cx: 117.78, cy: 70.29 },
  r_upper_arm: { cx: 31.54, cy: 139.14 },
  l_upper_arm: { cx: 150.8, cy: 139.14 },
  r_lower_arm: { cx: 18.53, cy: 200.17 },
  l_lower_arm: { cx: 162.6, cy: 200.03 },
  chest: { cx: 91.53, cy: 140.37 },
  abdomen: { cx: 90.9, cy: 210.52 },
  r_jaw: { cx: 75.11, cy: 44.09 },
  l_jaw: { cx: 105.35, cy: 44.09 },
  neck: { cx: 90.9, cy: 59.65 },
  upper_back: { cx: 324.3, cy: 103.04 },
  lower_back: { cx: 324.3, cy: 202.74 },
  l_hip: { cx: 289.66, cy: 252.32 },
  r_hip: { cx: 359.03, cy: 252.32 },
  l_thigh: { cx: 299.61, cy: 309 },
  r_thigh: { cx: 349.61, cy: 309 },
  r_calf: { cx: 59.4, cy: 396.07 },
  l_calf: { cx: 123.07, cy: 396.07 },
};

function areaRegion(key: string): string {
  for (const r of regions)
    if (r.areas.some((a) => a.key === key)) return r.color;
  return "unset";
}

// ── State ─────────────────────────────────────────────────────────
const checked = ref<Record<string, boolean>>(
  Object.fromEntries(allAreas.map((a) => [a.key, false])),
);
const wpi_showResults = ref(false);
const wpi_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const wpiScore = computed(
  () => Object.values(checked.value).filter(Boolean).length,
);

const checkedAreas = computed(() =>
  allAreas.filter((a) => checked.value[a.key]),
);

function groupScore(color: string) {
  const region = regions.find((r) => r.color === color);
  if (!region) return 0;
  return region.areas.filter((a) => checked.value[a.key]).length;
}

// For combined ACR diagnosis with SS
const wpi_severity = computed(() => {
  const s = wpiScore.value;
  if (s === 0)
    return {
      level: "未選擇",
      color: "unset",
      advice: "請勾選過去一週內有疼痛的身體部位",
    };
  if (s <= 2)
    return {
      level: "局部疼痛",
      color: "normal",
      advice: "WPI 1–2，疼痛分布局限，不符合纖維肌痛廣泛性標準",
    };
  if (s <= 6)
    return {
      level: "中等廣泛",
      color: "mild",
      advice: "WPI 3–6，需配合 SS ≥ 9 才符合纖維肌痛診斷標準",
    };
  return {
    level: "廣泛疼痛",
    color: "moderate",
    advice: "WPI ≥ 7，配合 SS ≥ 5 符合 2010 ACR 纖維肌痛診斷標準",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function wpi_generateMarkdown() {
  const leftAreas = regions[0].areas
    .filter((a) => checked.value[a.key])
    .map((a) => a.name);
  const rightAreas = regions[1].areas
    .filter((a) => checked.value[a.key])
    .map((a) => a.name);
  const axialAreas = regions[2].areas
    .filter((a) => checked.value[a.key])
    .map((a) => a.name);

  return `# WPI 廣泛疼痛指數評估結果

## 疼痛部位（共 ${wpiScore.value} 處）

- **左側**（${groupScore("left")} 處）：${leftAreas.length ? leftAreas.join("、") : "無"}
- **右側**（${groupScore("right")} 處）：${rightAreas.length ? rightAreas.join("、") : "無"}
- **軀幹**（${groupScore("axial")} 處）：${axialAreas.length ? axialAreas.join("、") : "無"}

---

- **WPI 總分**：${wpiScore.value} / 19
- **評估結果**：${wpi_severity.value.level}
- **臨床建議**：${wpi_severity.value.advice}

> 纖維肌痛診斷：WPI ≥ 7 且 SS ≥ 5，或 WPI 3–6 且 SS ≥ 9（需配合 SS 量表評估）`;
}

async function wpi_copyMarkdown() {
  await navigator.clipboard.writeText(wpi_generateMarkdown());
  wpi_copied.value = true;
  setTimeout(() => (wpi_copied.value = false), 2000);
}

function wpi_reset() {
  allAreas.forEach((a) => {
    checked.value[a.key] = false;
  });
  wpi_showResults.value = false;
}

// ══════════════ SS 症狀嚴重度（Symptom Severity Scale）══════════════

// ── SS Scale Items ────────────────────────────────────────────────
// Wolfe 2010 ACR Criteria — Symptom Severity (SS) Scale
// 3 core symptoms (0–3 each) + somatic symptoms (0–3) = 0–12 total
const coreSymptoms = [
  {
    key: "fatigue",
    name: "疲倦感",
    sub: "Fatigue",
    hint: "過去一週內，疲倦的嚴重程度",
  },
  {
    key: "waking",
    name: "醒來時仍感疲憊",
    sub: "Waking Unrefreshed",
    hint: "早晨起床後仍感到精神不振、未恢復",
  },
  {
    key: "cognitive",
    name: "認知功能問題",
    sub: "Cognitive Symptoms",
    hint: "記憶力、專注力、思考清晰度的困難（腦霧）",
  },
];

const coreOptions = [
  { value: 0, label: "0", desc: "沒有問題" },
  { value: 1, label: "1", desc: "輕微" },
  { value: 2, label: "2", desc: "中度" },
  { value: 3, label: "3", desc: "嚴重" },
];

const somaticOptions = [
  { value: 0, label: "0", desc: "沒有症狀" },
  { value: 1, label: "1", desc: "少數症狀" },
  { value: 2, label: "2", desc: "相當數量" },
  { value: 3, label: "3", desc: "很多症狀" },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>({
  fatigue: -1,
  waking: -1,
  cognitive: -1,
  somatic: -1,
});

const fm_showResults = ref(false);
const fm_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => Object.values(selections.value).filter((v) => v >= 0).length,
);
const isComplete = computed(() => answeredCount.value === 4);

const totalScore = computed(() =>
  Object.values(selections.value).reduce((sum, v) => sum + Math.max(v, 0), 0),
);

const fm_severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/4 項`,
    };
  if (s <= 3)
    return {
      level: "輕微",
      color: "normal",
      advice: "SS ≤ 3，症狀程度輕微，可觀察追蹤",
    };
  if (s <= 6)
    return {
      level: "中等",
      color: "mild",
      advice: "SS 4–6，中等程度症狀，建議就醫評估",
    };
  if (s <= 9)
    return {
      level: "較重",
      color: "moderate",
      advice: "SS 7–9，症狀程度較重，建議積極治療",
    };
  return {
    level: "嚴重",
    color: "severe",
    advice: "SS 10–12，症狀嚴重，建議風濕科或疼痛科完整評估",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function fm_generateMarkdown() {
  const getDesc = (key: string, v: number) => {
    if (key === "somatic")
      return somaticOptions.find((o) => o.value === v)?.desc ?? "";
    return coreOptions.find((o) => o.value === v)?.desc ?? "";
  };
  const lines = [
    ...coreSymptoms.map((s) => {
      const v = selections.value[s.key];
      return `- **${s.name}**（${s.sub}）：${v >= 0 ? `${v} — ${getDesc(s.key, v)}` : "未填"}`;
    }),
    `- **整體身體症狀**（Somatic Symptoms）：${selections.value.somatic >= 0 ? `${selections.value.somatic} — ${getDesc("somatic", selections.value.somatic)}` : "未填"}`,
  ].join("\n");

  return `# 纖維肌痛症狀嚴重度（SS）評估結果\n\n${lines}\n\n---\n\n- **SS 總分**：${totalScore.value} / 12\n- **嚴重程度**：${fm_severity.value.level}\n- **臨床建議**：${fm_severity.value.advice}\n\n> SS ≥ 5 配合 WPI ≥ 7，或 WPI 3–6 配合 SS ≥ 9，符合 2010 ACR 纖維肌痛診斷標準。`;
}

async function fm_copyMarkdown() {
  await navigator.clipboard.writeText(fm_generateMarkdown());
  fm_copied.value = true;
  setTimeout(() => (fm_copied.value = false), 2000);
}

function fm_reset() {
  selections.value = { fatigue: -1, waking: -1, cognitive: -1, somatic: -1 };
  fm_showResults.value = false;
}
</script>

<template>
  <div class="fibro">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'wpi' }"
        @click="activeTab = 'wpi'"
      >
        <span class="tab-label">WPI 廣泛疼痛指數</span>
        <span class="tab-sub">Widespread Pain Index</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'fm' }"
        @click="activeTab = 'fm'"
      >
        <span class="tab-label">SS 症狀嚴重度</span>
        <span class="tab-sub">Symptom Severity Scale</span>
      </button>
    </div>

  <div v-show="activeTab === 'wpi'" class="wpi">
    <!-- Header -->
    <div class="wpi-header">
      <div class="header-title">
        <h2 class="title">WPI 廣泛疼痛指數</h2>
        <p class="subtitle">
          Widespread Pain Index · 纖維肌痛 2010 ACR 診斷標準之一
        </p>
      </div>
      <div class="score-badge" :class="wpi_severity.color">
        <span class="score-number">{{ wpiScore }}</span>
        <span class="score-label">/ 19 部位</span>
      </div>
    </div>

    <!-- Progress bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="wpi_severity.color"
          :style="{ width: Math.min((wpiScore / 19) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs yellow" style="left: 15.79%">3</span>
        <span class="tick-abs orange" style="left: 36.84%">7</span>
        <span class="tick-abs orange" style="left: 68.42%">13</span>
        <span class="tick-abs orange" style="left: 100%">19</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs yellow" style="left: 15.79%">局部疼痛</span>
        <span class="label-abs orange" style="left: 36.84%">中等廣泛</span>
        <span class="label-abs orange" style="left: 100%">廣泛疼痛</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請勾選<strong>過去一週內</strong>曾感到疼痛的身體部位。共 19
        個部位，每個部位計 1 分，總分 0–19 分。<strong>WPI ≥ 7</strong>（配合 SS
        ≥ 5）符合纖維肌痛診斷標準。</span
      >
    </div>

    <!-- SVG body diagram -->
    <div class="svg-section">
      <svg
        viewBox="0 0 415.19 494.43"
        xmlns="http://www.w3.org/2000/svg"
        class="body-svg"
      >
        <g id="_圖層_1-2" data-name="圖層 1" fill="#de8c6c">
          <rect
            x="292.98"
            y="262.69"
            width="28.73"
            height="8.78"
            transform="translate(35.03 -35.64) rotate(7.04)"
          />
          <rect
            x="326.72"
            y="263.41"
            width="28.73"
            height="8.78"
            transform="translate(-36.75 54.97) rotate(-8.74)"
          />
          <g id="Back">
            <text
              class="body-label body-label-left"
              x="285"
              y="28"
              text-anchor="middle"
            >
              左
            </text>
            <text
              class="body-label body-label-right"
              x="365"
              y="28"
              text-anchor="middle"
            >
              右
            </text>
            <ellipse cx="324.3" cy="241.38" rx="7.95" ry="24.62" />
            <ellipse cx="325.51" cy="137.91" rx="40.32" ry="56.59" />
            <path
              fill="#f0aa87"
              d="M415.15,267.22l-4.05-59.43c-2.33-34.24-15.23-58.35-16.88-88.04-.44-7.89-1.17-15.31-2.96-23.05-3.91-16.89-20.01-12.18-40.33-26.81-3.24-2.33-9.33-3.87-10.5-8.35-1.27-4.89.35-12.25,2.74-16.76l4.98-4.71c1.61-3.14-.72-6.27-.61-8.85.39-8.98,1.63-18.44-5.92-25.14-7.86-6.99-20.68-7.8-30.27-2.92-8.54,4.34-12.25,14.72-10.15,23.62.81,3.47-.09,5.02-1.18,7.79-1.74,4.43,2.71,7.48,5.03,10.46,2.99,3.85,4.72,11.28,3.37,15.94-1.27,4.44-6.45,6.21-9.79,8.29-10.04,6.25-20.13,10.89-31.11,14.92-4.31,1.59-7.54,4.79-8.99,9.13-5.13,15.43-2.65,37.09-10.77,63.22-5.97,19.22-9.34,38.15-10.75,58.2l-3.55,50.55c-.79,11.22,6.83,20.55,18.14,21.21,1,.06,1.79-.27,2.11-.7.54-.75.27-2.19-1.08-2.5-6.65-1.51-11.15-7.87-9.74-14.59.23-1.1,1.62-1.83,2.25-1.78.74.05,1.83.83,1.97,1.97l.99,8.05c.14,1.16.64,1.9,1.08,2.38.53.58,3.17-.11,3.15-1.46-.13-7.63,1.6-16.3-.61-23.78-2.08-7.05-3.11-12.68-.17-19.82l8.72-21.2c4.61-11.2,5.24-23.29,7.98-34.97l4.6-19.65c1.84-7.88,2.02-15.5,4.88-23.41l4.55,34.28,2.86,25.95c.68,6.08-.01,12.04-.8,18.11l-5.06,38.99c-6.13,47.26,5.1,84.2-.75,116.13-2.71,14.79-2.55,28.54,1.66,43.17,7.33,25.47,14.43,49.44.77,72.93-1.57,2.72-.89,7.34,1.99,8.28,5.78,1.88,11.71,1.45,17.64,1.46,11.2.01,8.07-14.54,7.3-25.99-1.14-16.9-6.65-34.11-4.64-43.61,2.98-14.07,4.93-27.85,4.31-42.39-.36-8.33.59-15.87,2.22-24.06,4.36-21.97,8.75-43.43,9.89-65.87l2.14-23.22c-7.61.74-16.66,2.35-20.71-4.06,7.67,2.95,14.29,3.01,21.14,2.06.86.05,2.69.48,3.66-.46,7.7,1.74,14.96,1.33,23.03-2.53-5.39,7.9-14.04,5.45-22.49,5.24,2.06,11.39,2.31,22.84,3.41,34.91,1.7,18.62,5.42,36.42,9.09,54.69,4.37,21.81.28,38.48,4.86,57.13,2.1,8.54,2.56,16.46.82,25.25-3.11,15.67-5.13,31.57-3.63,47.58.48,5.13,18.54,6.52,24.24,3.77,2.99-1.44,2.91-6.55,1.44-9.43-19.75-38.6,11.24-71.21,4.7-106.89-6.63-36.23.94-61.47.2-94.13-.45-19.83-2.96-38.69-5.59-58.23-1.38-10.3-3.31-20.39-2.05-30.8l7.04-58.12c.93,4.2,2.68,8.01,2.9,11.87.56,9.3,4.13,17.43,5.44,26.55,3.07,21.34,8.86,41.22,18.13,60.5,3.43,7.12,1.2,13.89-.34,20.52-1.93,8.34-.67,17-.27,25.71,4.93-2.55,3.94-11.6,5.82-13.43.52-.51,2.67-.61,2.97.33,2.04,6.39-.84,13.34-7.25,15.7-.62.23-2.51.1-2.79.78-.22.54.58,2.46,1.61,2.46,9.74-.04,18.67-8.58,17.96-18.94ZM300.11,265.33l-.5-.5.5-.5.5.5-.5.5ZM304.43,132.04c-.73,3.24-3.57,5.27-5.41,6.31-2.87,1.62-6.39,1.37-8.35-.47l-.73-.69c.4.23.77-.15.52-.55l.67.64c5.56,2.04,10.17-2.16,11.64-8.08,2.12-8.52.12-16.9.14-26.16,3.57,9.1,3.65,19.53,1.52,29ZM323.71,131.42c0-2.16.65-4.65,1.82-6.21l-.04,59.19c-1.51-2.02-1.05-4.33-1.86-6.78l.08-46.2ZM324.79,231.53c.15,11.02,1.47,21.65-.67,32.95-1.68-11.19-1.28-22.33-.23-33.86-1.82-1.61-3.26-2.24-4.39-4.49,3.84,1.33,6.43.53,10.27.35-1.38,1.14-5.01,2.69-4.98,5.05ZM350.11,264.33l-.5-.5.5-.5.5.5-.5.5ZM349.46,138.12c-9.23-5.07-7.68-25.09-3.23-36.18-1.06,12.58-3.65,29.66,4.68,35.09,1.91,1.24,5.14-.15,8.12-.57-2.41,4.18-6.56,3.31-9.57,1.66Z"
            />
            <path
              d="M326.44,269.44l-.55-2.72c7.7,1.75,14.96,1.33,23.03-2.52-5.39,7.9-14.03,5.45-22.48,5.24Z"
            />
            <path
              d="M322.24,267.19c-.03.9-.38,1.49-.43,2-7.61.74-16.66,2.35-20.71-4.06,7.67,2.95,14.29,3.02,21.14,2.07Z"
            />
            <path
              d="M323.63,177.61l.08-46.2c0-2.15.65-4.65,1.82-6.21l-.04,59.19c-1.51-2.02-1.04-4.33-1.86-6.78Z"
            />
            <path
              d="M359.03,136.45c-2.41,4.18-6.56,3.31-9.57,1.66-9.23-5.06-7.67-25.09-3.23-36.17-1.06,12.57-3.65,29.65,4.68,35.08,1.91,1.24,5.13-.14,8.12-.57Z"
            />
            <path
              d="M324.79,231.52c.15,11.02,1.47,21.66-.67,32.95-1.68-11.19-1.28-22.33-.22-33.86-1.82-1.61-3.26-2.24-4.39-4.49,3.84,1.33,6.43.53,10.27.36-1.39,1.14-5.02,2.68-4.98,5.05Z"
            />
            <path
              d="M304.43,132.04c-.73,3.24-3.57,5.27-5.41,6.31-2.87,1.62-6.39,1.37-8.35-.47l-.73-.69c.4.23.77-.15.52-.55l.67.64c5.56,2.04,10.17-2.16,11.64-8.08,2.12-8.52.12-16.9.14-26.16,3.57,9.1,3.65,19.53,1.52,29Z"
            />
            <rect
              x="349.76"
              y="263.47"
              width=".71"
              height=".71"
              transform="translate(-84.01 324.84) rotate(-45)"
            />
            <rect
              x="299.76"
              y="264.47"
              width=".71"
              height=".71"
              transform="translate(-99.36 289.78) rotate(-45)"
            />
          </g>
          <g id="Front">
            <text
              class="body-label body-label-right"
              x="50"
              y="28"
              text-anchor="middle"
            >
              右
            </text>
            <text
              class="body-label body-label-left"
              x="130"
              y="28"
              text-anchor="middle"
            >
              左
            </text>
            <ellipse cx="90.9" cy="254.23" rx="19.5" ry="12.85" />
            <path
              d="M32.85,175.01l-.53-.99c-5.24-2.73-10.09-3.41-16.54-5.43,6.24-5.72,12.89-2.18,17.18,3.72.31.45.89.84,1.19.9,1.43,1.87-.49,3.5-1.3,1.8Z"
            />
            <path
              d="M169.14,168.27l-21.21,5.37c3.14-7.17,12.99-9.84,21.21-5.37Z"
            />
            <path
              d="M86.61,139.53c-10.65,9.29-25.72,5.86-36.43-.6l-1.81-1.62c-1.52-.68-.98-2.51.52-2.49.96,1.44,2.03,2.03,2.61,2.25,8.06,2.93,23.07,3.73,35.11,2.47Z"
            />
            <path
              d="M135.72,135.15c-14.38,13.9-36.11,13.47-49.11,1.49,17.35,5.68,32.12,2.17,49.11-1.49Z"
            />
            <path
              d="M131.6,104.83c-29.75,3.75-54.43-27.87-77.36-6.79,9.95-44.33,51.65-18.88,77.36,6.79Z"
            />
            <path
              d="M149.84,102.73c-29.75,3.75-54.43-27.87-77.36-6.79,9.95-44.33,51.65-18.88,77.36,6.79Z"
            />
            <path
              fill="#f0aa87"
              d="M181.77,266.26l-3.57-51.5c-1.2-17.33-3.65-33.73-8.58-50.45-4.47-15.19-8.05-30.02-8.95-45.94-.42-7.58-1.34-14.74-3.08-21.99-1.63-6.77-6.33-11.88-13.18-13.88-10.38-3.02-19.58-7.13-28.49-13.58-2.92-2.11-8.26-3.57-9.01-7.86-.88-5.01.27-12.16,2.93-16.55,1.61-2.1,4.4-2.62,5.25-5.48.81-2.77-.33-4.99-1.65-7.72,2.51-10.22,1.21-21.57-8.42-27.51-8.92-5.5-21.98-5.02-30.44,1.41-6.72,5.11-8.08,14.19-6.69,21.93.58,3.23.1,4.86-1.09,7.44-2.1,4.56,2.65,7.55,4.96,10.41,2.85,3.52,3.25,9.04,3.77,13.19.57,4.46-2.59,6.52-5.68,8.37-11.76,7.08-23.19,13.49-36.21,17.78-11.21,3.68-11.92,23.7-12.83,37.99-1.73,27.03-14.4,51.13-16.84,87.13L.04,267.15c-1.11,16.46,20.61,22.71,20.76,17.69.07-2.26-7.38-1.41-10.49-7.75-1.48-3.04-2.27-7.33-.06-9.88.76-.88,2.57-.4,2.86.23,2.25,4.93-.42,10.33,5.19,12.46.68-9.2,1.94-18.44-.38-27.13-1.81-6.77-2.57-13.57.85-20.44,8.89-17.87,13.83-36.55,16.58-56.4,1.16-8.41,4.71-16.01,5.4-24.56.45-5.73,2.11-10.91,3.6-16.24l6.95,58.15c2.44,20.37-10.01,65.49-7.58,102.02l2.86,43.01c.72,10.89.14,21.38-1.92,32.07-2.75,14.24-1.94,27.92,2,41.92,7.28,25.91,14.89,48.58.34,73.44-.8,1.37-.4,4.36.19,5.43,1.84,3.34,13.23,3.7,21.15,2.91,10.41-1.03,6.6-15.86,5.99-25.48-.5-7.99-1.25-15.19-2.86-23.09-1.36-6.7-3.04-14.21-1.56-21.07,2.66-12.45,4.46-24.27,4.15-37.14-.16-6.64-.41-13.26.78-19.89,3.82-21.2,8.41-41.58,10.57-63.06,1.23-12.19,1.39-23.77,3.58-35.66.2-1.09,1.65-1.47,2.05-1.52-1.07-.65-3.09-.92-4.05-2.16-2.72-3.47-4.97-7.15-5.24-11.92l5.95,9.22c1.22,1.88,4.34,3.38,6.13,1.3,3.95-4.59,5.03-10.21,7.37-15.46.07,7.47-3.25,16.8-9.22,19.17,2.76,10.57,3.1,21.46,4.01,32.83,1.53,19.3,5.23,37.78,9.07,56.73,1.87,9.24,3.05,17.99,2.6,27.45-.66,13.92,1.39,26.97,4.33,40.43,2.1,9.58-3.92,26.59-4.65,45.57l-.62,16c-.13,3.31,2.49,6.64,6.07,6.84l14.61.79c2.66.14,5.16-1.3,6.13-3.23.7-1.41,1.09-4.47.11-6.39-20.03-39.2,9.31-69.14,4.57-105.81-1.47-11.44-4.03-22.56-3.27-34.21l2.31-35.27c1.72-26.21-.11-51.58-3.7-77.66-1.81-13.19-4.53-25.76-2.9-39.11l6.67-54.83c3.44,6.85,3.19,13.59,4.78,20.35l4.76,20.3c2.31,19.19,7.95,37.28,16.27,54.5,3.75,7.77,2.33,14.63.24,22.34-2,7.36-.18,15.58-.55,22.99-.06,1.12,1.76,1.7,2.22,1.36,3.38-2.49,1.87-10.24,5.61-13.52,3.03,3.66,2,8.15.14,12.03-1.58,3.29-5.09,4.62-9.87,6.83,8.16,5.28,21.69-6.18,20.85-18.37ZM30.29,172.03l-.31-.48c-3.41-1.44-6.65-1.91-10.91-3.06,4.47-2.47,8.8-.61,11.42,2.28.19.22.56.42.76.46.88.92-.49,1.62-.96.8ZM56.95,141.19l-.9-.81c-.76-.34-.49-1.25.26-1.24.48.72,1.01,1.01,1.3,1.12,4.02,1.46,11.5,1.86,17.5,1.23-5.31,4.63-12.82,2.92-18.16-.3ZM86.6,80.83l-.51.52-.04.04c-2.37-1.43-5.13-1.41-8.14-.98-.07,0-.13.02-.2.03-4.14.62-8.74,1.97-13.41,1.41-.03,0-.05-.01-.08-.01,8.03-3.4,21.68-5.93,22.39-1.02h-.01ZM94.74,81.08c2.97-5.44,15.38-2.32,23.04.83-8.86.46-16.21-3.42-23.04-.83ZM105.35,140.65c7.22,2.37,13.37.9,20.44-.62-5.99,5.79-15.03,5.61-20.44.62ZM150.8,171.35c1.68-3.83,6.95-5.26,11.35-2.87l-11.35,2.87Z"
            />
            <path
              d="M91.98,267.31c-.32.13-.61.06-.94-.14-1.07-.65-3.09-.93-4.05-2.16-2.71-3.47-4.97-7.15-5.24-11.92l5.95,9.21c1.22,1.88,4.34,3.39,6.13,1.31,3.95-4.6,5.03-10.21,7.38-15.47.07,7.47-3.25,16.8-9.22,19.17Z"
            />
            <path
              d="M86.12,81.36c-5.68-3.43-13.72,1.54-21.9.52,8.03-3.4,21.68-5.93,22.39-1.02l-.49.5Z"
            />
          </g>
          <ellipse
            v-for="a in allAreas"
            :key="a.key"
            :cx="svgMap[a.key].cx"
            :cy="svgMap[a.key].cy"
            rx="7.74"
            ry="7.78"
            :class="[
              'cls-1',
              checked[a.key] ? 'ell-chk-' + areaRegion(a.key) : '',
            ]"
            style="cursor: pointer"
            @click="checked[a.key] = !checked[a.key]"
          />
        </g>
      </svg>

      <!-- Legend -->
      <div class="wpi-legend">
        <span class="leg-item"
          ><span class="leg-dot" style="background: #3b82f6"></span>左側</span
        >
        <span class="leg-item"
          ><span class="leg-dot" style="background: #ef4444"></span>右側</span
        >
        <span class="leg-item"
          ><span class="leg-dot" style="background: #8b5cf6"></span>軀幹</span
        >
        <span class="leg-item"
          ><span
            class="leg-dot"
            style="background: #fff; border: 2px solid #ccc"
          ></span
          >無疼痛</span
        >
      </div>

      <!-- Click counts -->
      <div class="wpi-counts">
        <span class="count-chip cl-left">左側 {{ groupScore("left") }}/7</span>
        <span class="count-chip cl-right"
          >右側 {{ groupScore("right") }}/7</span
        >
        <span class="count-chip cl-axial"
          >軀幹 {{ groupScore("axial") }}/5</span
        >
      </div>
    </div>

    <!-- Result card -->
    <div class="wpi-result" :class="wpi_severity.color">
      <div class="result-left">
        <span class="result-number">{{ wpiScore }}</span>
        <span class="result-max">/ 19</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ wpi_severity.level }}</span>
        <span class="result-advice">{{ wpi_severity.advice }}</span>
        <span class="result-areas">
          {{
            wpiScore > 0
              ? `已選：${checkedAreas.map((a) => a.name).join("、")}`
              : ""
          }}
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="wpi_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="region in regions" :key="region.group">
        <div class="detail-section-title" :class="region.color + '-section'">
          {{ region.group }}（{{ groupScore(region.color) }} /
          {{ region.areas.length }} 處）
        </div>
        <div v-for="area in region.areas" :key="area.key" class="detail-row">
          <span class="detail-domain">{{ area.name }}</span>
          <span
            class="detail-score"
            :class="checked[area.key] ? 'checked-color' : 'zero'"
          >
            {{ checked[area.key] ? "✓" : "—" }}
          </span>
          <span class="detail-desc">{{
            checked[area.key] ? "有疼痛" : "無疼痛"
          }}</span>
        </div>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">WPI 總分</span>
        <span class="detail-score brand">{{ wpiScore }} / 19</span>
        <span class="detail-desc">{{ wpi_severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="wpi-actions">
      <button class="btn-view" @click="wpi_showResults = !wpi_showResults">
        {{ wpi_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="wpi_copyMarkdown">
        {{ wpi_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="wpi_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'fm'" class="fm">
    <!-- Header -->
    <div class="fm-header">
      <div class="header-title">
        <h2 class="title">SS 症狀嚴重度量表</h2>
        <p class="subtitle">
          Symptom Severity Scale · 纖維肌痛症 2010 ACR 診斷標準之一
        </p>
      </div>
      <div class="score-badge" :class="fm_severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? fm_severity.level : `${answeredCount}/4`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="fm_severity.color"
          :style="{ width: Math.min((totalScore / 12) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs green" style="left: 25%">3</span>
        <span class="tick-abs yellow" style="left: 50%">6</span>
        <span class="tick-abs orange" style="left: 75%">9</span>
        <span class="tick-abs red" style="left: 100%">12</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%"></span>
        <span class="label-abs green" style="left: 25%">輕微</span>
        <span class="label-abs yellow" style="left: 50%">中等</span>
        <span class="label-abs orange" style="left: 75%">較重</span>
        <span class="label-abs red" style="left: 100%">嚴重</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據<strong>過去一週</strong>的症狀嚴重程度評分。前 3 項各 0–3 分，第
        4 項（整體身體症狀）0–3 分，總分 0–12 分。<strong>SS ≥ 5</strong>
        為纖維肌痛診斷標準之一。</span
      >
    </div>

    <!-- Core symptoms group -->
    <div class="fm-group">
      <div class="group-header core-header">
        <div class="group-label-block">
          <span class="group-label">核心症狀</span>
          <span class="group-sub">Core Symptoms · 3 項，各 0–3 分</span>
        </div>
        <div class="group-score-pill core-pill">
          {{
            coreSymptoms.reduce((s, c) => s + Math.max(selections[c.key], 0), 0)
          }}
          / 9
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="(sym, si) in coreSymptoms"
          :key="sym.key"
          class="fm-item"
          :class="{
            answered: selections[sym.key] >= 0,
            high: selections[sym.key] >= 3,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q{{ si + 1 }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ sym.name }}</span>
              <span class="item-sub">{{ sym.sub }}</span>
              <span class="item-hint">{{ sym.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[sym.key] === 0,
                unanswered: selections[sym.key] < 0,
                high: selections[sym.key] >= 3,
              }"
            >
              {{ selections[sym.key] >= 0 ? selections[sym.key] : "—" }}
            </span>
          </div>
          <div class="sec-options">
                <label
                  v-for="opt in coreOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{ 'opt-selected': selections[sym.key] === opt.value }"
                >
                  <input
                    type="radio"
                    :name="sym.key"
                    :value="opt.value"
                    v-model="selections[sym.key]"
                  />
                  <div
                    class="opt-radio"
                    :class="{ selected: selections[sym.key] === opt.value }"
                  >
                    <div class="opt-dot" v-if="selections[sym.key] === opt.value" />
                  </div>
                  <div class="opt-content">
                    <span class="opt-score-badge">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.desc }}</span>
                  </div>
                </label>
              </div>
        </div>
      </div>
    </div>

    <!-- Somatic symptoms group -->
    <div class="fm-group">
      <div class="group-header somatic-header">
        <div class="group-label-block">
          <span class="group-label">整體身體症狀</span>
          <span class="group-sub">Somatic Symptoms · 1 項，0–3 分</span>
        </div>
        <div class="group-score-pill somatic-pill">
          {{ Math.max(selections["somatic"], 0) }} / 3
        </div>
      </div>

      <div class="item-list">
        <div
          class="fm-item"
          :class="{
            answered: selections['somatic'] >= 0,
            high: selections['somatic'] >= 3,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q4</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">整體身體症狀評估</span>
              <span class="item-sub">Somatic Symptoms Overall</span>
              <span class="item-hint"
                >包括肌肉疼痛、腸躁症、頭痛、麻木感、頭暈等身體症狀的整體數量</span
              >
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections['somatic'] === 0,
                unanswered: selections['somatic'] < 0,
                high: selections['somatic'] >= 3,
              }"
            >
              {{ selections["somatic"] >= 0 ? selections["somatic"] : "—" }}
            </span>
          </div>
          <div class="sec-options">
            <label
              v-for="opt in somaticOptions"
              :key="opt.value"
              class="sec-opt"
              :class="{ 'opt-selected': selections['somatic'] === opt.value }"
            >
              <input
                type="radio"
                name="somatic"
                :value="opt.value"
                v-model="selections['somatic']"
              />
              <div
                class="opt-radio"
                :class="{ selected: selections['somatic'] === opt.value }"
              >
                <div
                  class="opt-dot"
                  v-if="selections['somatic'] === opt.value"
                />
              </div>
              <div class="opt-content">
                <span class="opt-score-badge">{{ opt.label }}</span>
                <span class="opt-text">{{ opt.desc }}</span>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="fm-result" :class="fm_severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 12</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ fm_severity.level }}</span>
        <span class="result-advice">{{ fm_severity.advice }}</span>
        <span class="result-threshold" v-if="isComplete">
          {{
            totalScore >= 5
              ? "⚠ SS ≥ 5，符合纖維肌痛診斷標準之一"
              : "✓ SS < 5，尚未達診斷門檻"
          }}
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="fm_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="sym in coreSymptoms" :key="sym.key" class="detail-row">
        <span class="detail-domain">{{ sym.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[sym.key] === 0,
            high: selections[sym.key] >= 3,
            brand: selections[sym.key] > 0 && selections[sym.key] < 3,
          }"
        >
          {{ selections[sym.key] >= 0 ? selections[sym.key] : "—" }}
        </span>
        <span class="detail-desc">
          {{
            selections[sym.key] >= 0
              ? coreOptions.find((o) => o.value === selections[sym.key])?.desc
              : "未填"
          }}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">整體身體症狀</span>
        <span
          class="detail-score"
          :class="{
            zero: selections['somatic'] === 0,
            high: selections['somatic'] >= 3,
            brand: selections['somatic'] > 0 && selections['somatic'] < 3,
          }"
        >
          {{ selections["somatic"] >= 0 ? selections["somatic"] : "—" }}
        </span>
        <span class="detail-desc">
          {{
            selections["somatic"] >= 0
              ? somaticOptions.find((o) => o.value === selections["somatic"])
                  ?.desc
              : "未填"
          }}
        </span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">SS 總分</span>
        <span class="detail-score brand">{{ totalScore }} / 12</span>
        <span class="detail-desc">{{ fm_severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="fm-actions">
      <button class="btn-view" @click="fm_showResults = !fm_showResults">
        {{ fm_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="fm_copyMarkdown">
        {{ fm_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="fm_reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/4 項，尚餘 {{ 4 - answeredCount }} 項
    </p>
  </div>
  </div>
</template>

<style scoped>
.fibro {
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

/* ══════════════ WPI 廣泛疼痛指數（Widespread Pain Index）══════════════ */

.wpi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.wpi /* ── Header ────────────────────────────────────────────────────── */
.wpi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.wpi .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.wpi .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.wpi .score-badge {
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
.wpi .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.wpi .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
}
.wpi .score-badge.unset {
  color: var(--vp-c-text-3);
}
.wpi .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}
.wpi .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.wpi .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.wpi .severity-fill.unset {
  background: var(--vp-c-divider);
}
.wpi .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.wpi .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.wpi .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.wpi .severity-ticks-abs,
.wpi .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.wpi .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.wpi .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.wpi .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.wpi .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.wpi .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.wpi .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.wpi .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.wpi .tick-abs.yellow,
.wpi .label-abs.yellow {
  color: #f59e0b;
}
.wpi .tick-abs.orange,
.wpi .label-abs.orange {
  color: #f97316;
}
.wpi /* ── Intro ─────────────────────────────────────────────────────── */
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
.wpi .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.wpi /* ── Group ─────────────────────────────────────────────────────── */
.wpi-group {
  margin-bottom: 1.5rem;
}
.wpi .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.wpi .left-header {
  border-left-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.wpi .right-header {
  border-left-color: #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.wpi .axial-header {
  border-left-color: #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.wpi .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.wpi .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.wpi .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.wpi .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.wpi .left-pill {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.06);
}
.wpi .right-pill {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.wpi .axial-pill {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.25);
  background: rgba(139, 92, 246, 0.06);
}
.wpi /* ── SVG body diagram ──────────────────────────────────────────── */
.svg-section {
  margin-bottom: 1.5rem;
}
.wpi .body-svg {
  width: 100%;
  max-height: 520px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  forced-color-adjust: none;
  color-scheme: light;
}
.wpi /* Clickable ellipses */
.cls-1 {
  fill: rgba(255, 255, 255, 0.55);
  stroke: rgba(0, 0, 0, 0.15);
  stroke-width: 1.5;
  transition: all 0.2s ease;
}
.wpi .cls-1:hover {
  fill: rgba(59, 130, 246, 0.18);
  stroke: #3b82f6;
  stroke-width: 2;
}
.wpi .ell-chk-left {
  fill: rgba(59, 130, 246, 0.45) !important;
  stroke: #3b82f6 !important;
  stroke-width: 2.5 !important;
}
.wpi .ell-chk-right {
  fill: rgba(239, 68, 68, 0.45) !important;
  stroke: #ef4444 !important;
  stroke-width: 2.5 !important;
}
.wpi .ell-chk-axial {
  fill: rgba(139, 92, 246, 0.45) !important;
  stroke: #8b5cf6 !important;
  stroke-width: 2.5 !important;
}
.wpi .body-label {
  font-size: 11px;
  font-weight: 700;
  font-family: "Noto Sans TC", sans-serif;
  pointer-events: none;
  user-select: none;
}
.wpi .body-label-left {
  fill: #3b82f6;
}
.wpi .body-label-right {
  fill: #ef4444;
}
.wpi /* Legend */
.wpi-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.6rem;
}
.wpi .leg-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.wpi .leg-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.wpi /* Click counts */
.wpi-counts {
  display: flex;
  gap: 0.6rem;
  margin-top: 0.6rem;
  flex-wrap: wrap;
}
.wpi .count-chip {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
}
.wpi .cl-left {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.06);
}
.wpi .cl-right {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.wpi .cl-axial {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.25);
  background: rgba(139, 92, 246, 0.06);
}
.wpi /* ── Result card ───────────────────────────────────────────────── */
.wpi-result {
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
  min-height: 140px;
}
.wpi .wpi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi .wpi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi .wpi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.wpi .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  min-width: 100px;
  justify-content: center;
}
.wpi .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
  font-variant-numeric: tabular-nums;
}
.wpi .wpi-result.normal .result-number {
  color: #22c55e;
}
.wpi .wpi-result.mild .result-number {
  color: #f59e0b;
}
.wpi .wpi-result.moderate .result-number {
  color: #f97316;
}
.wpi .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.wpi .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.wpi .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.wpi .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.wpi .result-areas {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
  display: block;
  min-height: 1.125rem;
}
.wpi /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.wpi .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.wpi .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.wpi .left-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.wpi .right-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.wpi .axial-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.wpi .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.wpi .detail-row:last-child {
  border-bottom: none;
}
.wpi .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.wpi .detail-domain {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}
.wpi .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.wpi .detail-score.checked-color {
  color: var(--vp-c-brand-1);
}
.wpi .detail-score.zero {
  color: var(--vp-c-text-3);
}
.wpi .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.wpi .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
  text-align: left;
}
.wpi /* ── Actions ───────────────────────────────────────────────────── */
.wpi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.wpi .btn-view,
.wpi .btn-copy,
.wpi .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.wpi .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.wpi .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.wpi .btn-view:active {
  transform: translateY(0);
}
.wpi .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.wpi .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.wpi .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.wpi .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.wpi .wpi-header {
    flex-direction: column;
  }
.wpi .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.wpi .score-number {
    font-size: 1.5rem;
  }
.wpi .wpi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.wpi .severity-labels-abs {
    display: none;
  }
}
/* ══════════════ SS 症狀嚴重度（Symptom Severity Scale）══════════════ */

.fm {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.fm /* ── Header ────────────────────────────────────────────────────── */
.fm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.fm .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.fm .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.fm .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 110px;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
}
.fm .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.fm .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.fm .score-badge.filling {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.fm .score-badge.normal {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.fm .score-badge.mild {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.06);
}
.fm .score-badge.moderate {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.fm .score-badge.severe {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.fm /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}
.fm .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.fm .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.fm .severity-fill.filling {
  background: var(--vp-c-divider);
}
.fm .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.fm .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.fm .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.fm .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.fm .severity-ticks-abs,
.fm .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.fm .severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}
.fm .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.fm .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.fm .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.fm .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.fm .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.fm .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.fm .tick-abs.green,
.fm .label-abs.green {
  color: #22c55e;
}
.fm .tick-abs.yellow,
.fm .label-abs.yellow {
  color: #f59e0b;
}
.fm .tick-abs.orange,
.fm .label-abs.orange {
  color: #f97316;
}
.fm .tick-abs.red,
.fm .label-abs.red {
  color: #ef4444;
}
.fm /* ── Intro ─────────────────────────────────────────────────────── */
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
.fm .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.fm /* ── Group ─────────────────────────────────────────────────────── */
.fm-group {
  margin-bottom: 1.75rem;
}
.fm .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.fm .core-header {
  border-left-color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.fm .somatic-header {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.fm .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fm .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.fm .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.fm .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.fm .core-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.fm .somatic-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}
.fm /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.fm .fm-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.fm .fm-item.answered {
  border-color: var(--vp-c-brand-1);
}
.fm .fm-item.high {
  border-color: #f97316;
}
.fm .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.fm .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
}
.fm .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.25);
}
.fm .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.fm .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.fm .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.fm .item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.fm .item-score {
  font-size: 1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
}
.fm .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.fm .item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.fm .item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.fm /* ── Option row — 4 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.fm .opt-pill {
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
.fm .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.fm .opt-pill input[type="radio"] {
  display: none;
}
.fm /* Score-specific colors — s0 through s3 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.fm .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.fm .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.fm .opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.fm .opt-pill.s1:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.fm .opt-pill.s1.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.fm .opt-pill.s2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.fm .opt-pill.s2:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.fm .opt-pill.s2.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.fm .opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.fm .opt-pill.s3:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.fm .opt-pill.s3.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.fm .opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.fm .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.fm .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.fm .opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.fm .opt-pill.s1.active .opt-num {
  color: #eab308;
}
.fm .opt-pill.s2 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.fm .opt-pill.s2.active .opt-num {
  color: #f59e0b;
}
.fm .opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.fm .opt-pill.s3.active .opt-num {
  color: #ef4444;
}
.fm .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.fm .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.fm .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.fm .opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.fm .opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.fm .opt-pill.s2 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.fm .opt-pill.s2.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.fm .opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.fm .opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}
.fm /* ── Result card ───────────────────────────────────────────────── */
.fm-result {
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
.fm .fm-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm .fm-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm .fm-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm .fm-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.fm .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fm .fm-result.normal .result-number {
  color: #22c55e;
}
.fm .fm-result.mild .result-number {
  color: #f59e0b;
}
.fm .fm-result.moderate .result-number {
  color: #f97316;
}
.fm .fm-result.severe .result-number {
  color: #ef4444;
}
.fm .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.fm .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.fm .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.fm .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.fm .result-threshold {
  font-size: 0.78rem;
  font-weight: 600;
}
.fm .fm-result.normal .result-threshold {
  color: #22c55e;
}
.fm .fm-result.mild .result-threshold,
.fm .fm-result.moderate .result-threshold,
.fm .fm-result.severe .result-threshold {
  color: #f97316;
}
.fm /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.fm .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.fm .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.fm .detail-row:last-child {
  border-bottom: none;
}
.fm .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.fm .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.fm .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.fm .detail-score.zero {
  color: #22c55e;
}
.fm .detail-score.high {
  color: #f97316;
}
.fm .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.fm .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}
.fm /* ── Actions ───────────────────────────────────────────────────── */
.fm-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.fm .btn-view,
.fm .btn-copy,
.fm .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.fm .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.fm .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.fm .btn-view:active {
  transform: translateY(0);
}
.fm .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.fm .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.fm .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.fm .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.fm .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.fm .fm-header {
    flex-direction: column;
  }
.fm .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.fm .score-number {
    font-size: 1.5rem;
  }
.fm .fm-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.fm .detail-desc {
    width: 48px;
  }
.fm .severity-labels-abs {
    display: none;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.fibro .score-badge {
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
.fibro .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.fibro .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.fibro .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.fibro .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.fibro .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.fibro .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.fibro .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.fibro .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
}
.fibro .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
}
@media (max-width: 640px) {
  .fibro .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

</style>
