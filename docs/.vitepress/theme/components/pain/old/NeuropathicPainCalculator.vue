<script setup lang="ts">
import { ref, computed } from "vue";

// Neuropathic Pain Scale (NPS) — Galer & Jensen 1997
// 10 items, each rated 0–10 (0 = absent, 10 = most intense imaginable)
// Total 0–100

const items = [
  {
    key: "q1",
    num: 1,
    group: "global",
    text: "疼痛強度（Pain Intensity）",
    desc: "請評估您現在的疼痛有多強烈",
    anchorL: "無疼痛",
    anchorR: "最劇烈",
    color: "#ef4444",
  },
  {
    key: "q2",
    num: 2,
    group: "global",
    text: "疼痛的不愉快程度（Pain Unpleasantness）",
    desc: "請評估您的疼痛令您感到多不愉快或多困擾",
    anchorL: "不困擾",
    anchorR: "極度困擾",
    color: "#ef4444",
  },
  {
    key: "q3",
    num: 3,
    group: "quality",
    text: "銳痛感（Sharp Pain）",
    desc: "請評估您疼痛中「刺痛、針刺感」的程度",
    anchorL: "無刺痛",
    anchorR: "極度刺痛",
    color: "#8b5cf6",
  },
  {
    key: "q4",
    num: 4,
    group: "quality",
    text: "熱燒灼感（Hot Pain）",
    desc: "請評估您疼痛中「熱燙、燒灼感」的程度",
    anchorL: "無燒灼",
    anchorR: "極度燒灼",
    color: "#f97316",
  },
  {
    key: "q5",
    num: 5,
    group: "quality",
    text: "冷痛感（Cold Pain）",
    desc: "請評估您疼痛中「冰冷、凍傷感」的程度",
    anchorL: "無冷痛",
    anchorR: "極度冷痛",
    color: "#3b82f6",
  },
  {
    key: "q6",
    num: 6,
    group: "quality",
    text: "敏感度（Sensitive to Touch）",
    desc: "請評估皮膚對輕觸的敏感或疼痛程度",
    anchorL: "無敏感",
    anchorR: "極度敏感",
    color: "#8b5cf6",
  },
  {
    key: "q7",
    num: 7,
    group: "quality",
    text: "搔癢感（Itchy Pain）",
    desc: "請評估您疼痛中「搔癢感」的程度",
    anchorL: "無搔癢",
    anchorR: "極度搔癢",
    color: "#14b8a6",
  },
  {
    key: "q8",
    num: 8,
    group: "temporal",
    text: "時間特性：持續性（Temporal – Unrelenting）",
    desc: "請評估您的疼痛持續不斷的程度",
    anchorL: "非持續",
    anchorR: "完全持續",
    color: "#ef4444",
  },
  {
    key: "q9",
    num: 9,
    group: "temporal",
    text: "時間特性：陣發性（Temporal – Breakthrough）",
    desc: "請評估疼痛突然陣發（突破痛）的嚴重程度",
    anchorL: "無陣發",
    anchorR: "極重陣發",
    color: "#f97316",
  },
  {
    key: "q10",
    num: 10,
    group: "spatial",
    text: "空間特性：深層或表淺（Deep / Surface Pain）",
    desc: "請評估您的疼痛位於深層還是表淺（10 = 完全深層）",
    anchorL: "完全表淺",
    anchorR: "完全深層",
    color: "#14b8a6",
  },
];

const groups = [
  {
    id: "global",
    label: "全局評估",
    sub: "Global Assessment",
    color: "#ef4444",
    keys: ["q1", "q2"],
    max: 20,
  },
  {
    id: "quality",
    label: "疼痛性質",
    sub: "Pain Quality",
    color: "#8b5cf6",
    keys: ["q3", "q4", "q5", "q6", "q7"],
    max: 50,
  },
  {
    id: "temporal",
    label: "時間特性",
    sub: "Temporal Characteristics",
    color: "#f97316",
    keys: ["q8", "q9"],
    max: 20,
  },
  {
    id: "spatial",
    label: "空間特性",
    sub: "Spatial Characteristics",
    color: "#14b8a6",
    keys: ["q10"],
    max: 10,
  },
];

const scores = ref<Record<string, number | null>>(
  Object.fromEntries(items.map((q) => [q.key, null])),
);
const copied = ref(false);
const showResults = ref(false);

const answeredCount = computed(
  () => items.filter((q) => scores.value[q.key] !== null).length,
);
const isComplete = computed(() => answeredCount.value === 10);

const total = computed(() => {
  if (!isComplete.value) return null;
  return items.reduce((sum, q) => sum + (scores.value[q.key] ?? 0), 0);
});

function groupScore(keys: string[]) {
  return keys.reduce((s, k) => s + (scores.value[k] ?? 0), 0);
}

const severity = computed(() => {
  const t = total.value;
  if (t === null) return { label: "—", color: "filling" };
  if (t <= 20) return { label: "輕度神經性疼痛", color: "normal" };
  if (t <= 40) return { label: "中度神經性疼痛", color: "mild" };
  if (t <= 60) return { label: "中重度神經性疼痛", color: "moderate" };
  return { label: "重度神經性疼痛", color: "severe" };
});

function setScore(key: string, val: number) {
  scores.value[key] = Math.round(val * 10) / 10;
}

function generateMarkdown() {
  const lines = items.map(
    (q) =>
      `  Q${q.num.toString().padStart(2, "0")} ${q.text}：${scores.value[q.key] ?? "—"} / 10`,
  );
  return (
    `# 神經性疼痛量表（NPS）\n\n` +
    `## 各項評分\n\n${lines.join("\n")}\n\n` +
    `## 分組分數\n\n` +
    groups
      .map((g) => `- ${g.label}：${groupScore(g.keys)} / ${g.max}`)
      .join("\n") +
    `\n\n## 結果\n\n` +
    `- **NPS 總分 = ${total.value ?? "—"} / 100**\n` +
    `- 嚴重程度：${severity.value.label}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((q) => (scores.value[q.key] = null));
  showResults.value = false;
}
</script>

<template>
  <div class="nps">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="nps-header">
      <div class="header-title">
        <h2 class="title">Neuropathic Pain Scale 神經性疼痛量表</h2>
        <p class="subtitle">
          NPS · Galer & Jensen 1997 · 10 項感覺特性評估 · 0–100 分
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="sb-val">{{ total ?? "—" }}</span>
        <span class="sb-max">/ 100</span>
        <span class="sb-tag">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="nps-bar-wrap">
      <div class="nps-bar">
        <div
          class="nps-bar-fill"
          :class="severity.color"
          :style="{ width: total !== null ? total + '%' : '0%' }"
        />
      </div>
      <div class="nps-ticks">
        <span>0</span>
        <span class="t-g">20</span>
        <span class="t-y">40</span>
        <span class="t-o">60</span>
        <span>100</span>
      </div>
    </div>

    <!-- ── Group sub-scores ───────────────────────────────────── -->
    <div class="sub-scores">
      <div
        v-for="g in groups"
        :key="g.id"
        class="ss-pill"
        :style="{ borderColor: g.color + '40' }"
      >
        <span class="ss-l">{{ g.label }}</span>
        <span class="ss-v" :style="{ color: g.color }">{{
          groupScore(g.keys)
        }}</span>
        <span class="ss-u">/ {{ g.max }}</span>
      </div>
      <div class="ss-pill">
        <span class="ss-l">完成度</span>
        <span class="ss-v" style="color: var(--vp-c-brand-1)">{{
          answeredCount
        }}</span>
        <span class="ss-u">/ 10</span>
      </div>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="instruction">
      請針對每個疼痛特性，使用滑桿或直接輸入數字評分（0–10）。
      <strong>0 = 完全無此特性，10 = 最嚴重</strong>。
    </div>

    <!-- ── Items ──────────────────────────────────────────────── -->
    <div class="nps-items">
      <div
        v-for="item in items"
        :key="item.key"
        class="nps-item"
        :class="{ answered: scores[item.key] !== null }"
        :style="{ '--item-color': item.color }"
      >
        <div class="ni-header">
          <span class="ni-num" :style="{ background: item.color }">{{
            item.num
          }}</span>
          <div class="ni-text-wrap">
            <span class="ni-title">{{ item.text }}</span>
            <span class="ni-desc">{{ item.desc }}</span>
          </div>
          <div
            class="ni-score-box"
            :class="{ filled: scores[item.key] !== null }"
          >
            <input
              v-model.number="scores[item.key]"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0–10"
              class="ni-input"
            />
          </div>
        </div>

        <div class="ni-slider-row">
          <span class="ni-anchor-l">{{ item.anchorL }}</span>
          <div class="ni-track">
            <div
              class="ni-fill"
              :style="{
                width:
                  scores[item.key] !== null
                    ? (scores[item.key]! / 10) * 100 + '%'
                    : '0%',
                background: item.color,
              }"
            />
            <div
              class="ni-thumb"
              v-if="scores[item.key] !== null"
              :style="{
                left: (scores[item.key]! / 10) * 100 + '%',
                background: item.color,
              }"
            />
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              :value="scores[item.key] ?? 0"
              @input="
                setScore(
                  item.key,
                  parseFloat(($event.target as HTMLInputElement).value),
                )
              "
              class="ni-range"
            />
          </div>
          <span class="ni-anchor-r">{{ item.anchorR }}</span>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nps-result" :class="severity.color">
      <div class="nr-left">
        <span class="nr-n">{{ total ?? "—" }}</span>
        <span class="nr-u">/ 100</span>
      </div>
      <div class="nr-right">
        <span class="nr-level">{{ severity.label }}</span>
        <div class="nr-profiles" v-if="isComplete">
          <span
            v-if="(scores['q4'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(249, 115, 22, 0.1); color: #f97316"
            >燒灼痛 ↑</span
          >
          <span
            v-if="(scores['q3'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6"
            >刺痛 ↑</span
          >
          <span
            v-if="(scores['q5'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(59, 130, 246, 0.1); color: #3b82f6"
            >冷痛 ↑</span
          >
          <span
            v-if="(scores['q6'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6"
            >觸覺敏感 ↑</span
          >
          <span
            v-if="(scores['q9'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(249, 115, 22, 0.1); color: #f97316"
            >陣發痛 ↑</span
          >
        </div>
      </div>
    </div>

    <!-- ── Results detail (NIHSS pattern) ────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in items" :key="item.key" class="detail-row">
        <span class="detail-qnum"
          >Q{{ item.num.toString().padStart(2, "0") }}</span
        >
        <span class="detail-domain">{{ item.text }}</span>
        <span
          class="detail-score"
          :class="
            scores[item.key] !== null && scores[item.key]! > 0
              ? 'score-marked'
              : scores[item.key] === 0
                ? 'score-zero'
                : 'score-empty'
          "
          :style="
            scores[item.key] !== null && scores[item.key]! > 0
              ? { color: item.color }
              : {}
          "
        >
          {{ scores[item.key] !== null ? scores[item.key] + " / 10" : "—" }}
        </span>
        <span class="detail-desc">
          {{
            scores[item.key] !== null
              ? scores[item.key]! <= 2
                ? "輕微"
                : scores[item.key]! <= 5
                  ? "中度"
                  : "嚴重"
              : "未評估"
          }}
        </span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">NPS 總分</span>
        <span class="detail-score brand">{{ total ?? "—" }} / 100</span>
        <span class="detail-desc">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nps-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }} / 10 項
    </p>
  </div>
</template>

<style scoped>
.nps {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.nps-header {
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
.sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.sb-max {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  line-height: 1;
}
.sb-tag {
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

/* ── Progress bar ──────────────────────────────────────────────── */
.nps-bar-wrap {
  margin-bottom: 2rem;
}
.nps-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.nps-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.nps-bar-fill.filling {
  background: var(--vp-c-divider);
}
.nps-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.nps-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.nps-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.nps-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.nps-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.t-g {
  color: #22c55e;
  font-weight: 700;
}
.t-y {
  color: #f59e0b;
  font-weight: 700;
}
.t-o {
  color: #f97316;
  font-weight: 700;
}

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.ss-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ss-l {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.ss-v {
  font-size: 0.88rem;
  font-weight: 800;
}
.ss-u {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}

/* ── Instruction ───────────────────────────────────────────────── */
.instruction {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #06b6d4;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

/* ── Items ─────────────────────────────────────────────────────── */
.nps-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.nps-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nps-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.nps-item.answered {
  border-color: var(--item-color, rgba(99, 102, 241, 0.3));
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}

.ni-header {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ni-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.ni-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ni-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ni-desc {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.ni-score-box {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  padding: 2px 8px;
  min-width: 60px;
  text-align: center;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.ni-score-box.filled {
  border-color: var(--item-color, #22c55e);
}
.ni-input {
  width: 44px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  text-align: center;
  -moz-appearance: textfield;
}
.ni-input::-webkit-outer-spin-button,
.ni-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.ni-input::placeholder {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.ni-slider-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
}
.ni-anchor-l,
.ni-anchor-r {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 44px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ni-anchor-r {
  text-align: right;
}
.ni-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.ni-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.ni-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.15s;
}
.ni-range {
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
.nps-result {
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
.nps-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nr-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.nr-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.nps-result.normal .nr-n {
  color: #22c55e;
}
.nps-result.mild .nr-n {
  color: #f59e0b;
}
.nps-result.moderate .nr-n {
  color: #f97316;
}
.nps-result.severe .nr-n {
  color: #ef4444;
}
.nr-u {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.nr-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.nr-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nr-profiles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.np-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
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
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
}
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 72px;
  text-align: right;
}
.detail-score.score-marked {
  color: var(--vp-c-brand-1);
}
.detail-score.score-zero {
  color: #22c55e;
}
.detail-score.score-empty {
  color: var(--vp-c-text-3);
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
.nps-actions {
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
  .nps-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .nps-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .ni-anchor-l,
  .ni-anchor-r {
    width: 32px;
    font-size: 0.56rem;
  }
  .detail-desc {
    display: none;
  }
}
</style>
