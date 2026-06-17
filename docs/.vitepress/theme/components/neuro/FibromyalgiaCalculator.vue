<script setup lang="ts">
import { ref, computed } from "vue";

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

const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => Object.values(selections.value).filter((v) => v >= 0).length,
);
const isComplete = computed(() => answeredCount.value === 4);

const totalScore = computed(() =>
  Object.values(selections.value).reduce((sum, v) => sum + Math.max(v, 0), 0),
);

const severity = computed(() => {
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
function generateMarkdown() {
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

  return `# 纖維肌痛症狀嚴重度（SS）評估結果\n\n${lines}\n\n---\n\n- **SS 總分**：${totalScore.value} / 12\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n\n> SS ≥ 5 配合 WPI ≥ 7，或 WPI 3–6 配合 SS ≥ 9，符合 2010 ACR 纖維肌痛診斷標準。`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  selections.value = { fatigue: -1, waking: -1, cognitive: -1, somatic: -1 };
  showResults.value = false;
}
</script>

<template>
  <div class="fm">
    <!-- Header -->
    <div class="fm-header">
      <div class="header-title">
        <h2 class="title">SS 症狀嚴重度量表</h2>
        <p class="subtitle">
          Symptom Severity Scale · 纖維肌痛症 2010 ACR 診斷標準之一
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/4`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
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
          v-for="sym in coreSymptoms"
          :key="sym.key"
          class="fm-item"
          :class="{
            answered: selections[sym.key] >= 0,
            high: selections[sym.key] >= 3,
          }"
        >
          <div class="item-header">
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
          <div class="option-row">
            <label
              v-for="opt in coreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[sym.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="sym.key"
                :value="opt.value"
                v-model="selections[sym.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
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
          <div class="option-row">
            <label
              v-for="opt in somaticOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections['somatic'] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                name="somatic"
                :value="opt.value"
                v-model="selections['somatic']"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="fm-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 12</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
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
    <div v-if="showResults" class="results-detail">
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
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="fm-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/4 項，尚餘 {{ 4 - answeredCount }} 項
    </p>
  </div>
</template>

<style scoped>
.fm {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.fm-header {
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
  width: 110px;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
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
  background: transparent;
  border-color: var(--vp-c-divider);
}
.score-badge.normal {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.score-badge.mild {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.06);
}
.score-badge.moderate {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.score-badge.severe {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2rem;
}
.severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
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

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0px;
  height: 13px;
}

.tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  font-weight: 700;
}
.tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}

.tick-abs.green,
.label-abs.green {
  color: #22c55e;
}
.tick-abs.yellow,
.label-abs.yellow {
  color: #f59e0b;
}
.tick-abs.orange,
.label-abs.orange {
  color: #f97316;
}
.tick-abs.red,
.label-abs.red {
  color: #ef4444;
}

/* ── Intro ─────────────────────────────────────────────────────── */
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

/* ── Group ─────────────────────────────────────────────────────── */
.fm-group {
  margin-bottom: 1.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.core-header {
  border-left-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.somatic-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.core-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.somatic-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fm-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.fm-item.answered {
  border-color: var(--vp-c-brand-1);
}
.fm-item.high {
  border-color: #f97316;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.item-score {
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
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Option row — 4 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.opt-pill {
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
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}

/* Score-specific colors — s0 through s3 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s1:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s1.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s2:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s2.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s3:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s3.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #ef4444;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
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
.fm-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fm-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fm-result.normal .result-number {
  color: #22c55e;
}
.fm-result.mild .result-number {
  color: #f59e0b;
}
.fm-result.moderate .result-number {
  color: #f97316;
}
.fm-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-threshold {
  font-size: 0.78rem;
  font-weight: 600;
}
.fm-result.normal .result-threshold {
  color: #22c55e;
}
.fm-result.mild .result-threshold,
.fm-result.moderate .result-threshold,
.fm-result.severe .result-threshold {
  color: #f97316;
}

/* ── Results detail ────────────────────────────────────────────── */
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
  padding: 0.5rem 0.9rem;
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
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
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

/* ── Actions ───────────────────────────────────────────────────── */
.fm-actions {
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

.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .fm-header {
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
  .fm-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
  .severity-labels-abs {
    display: none;
  }
}
</style>
