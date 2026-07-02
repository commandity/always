<script setup lang="ts">
import { ref, computed } from "vue";

// ── RFS Items ─────────────────────────────────────────────────────
// Belafsky 2001 — 8 findings, each scored by examiner via laryngoscopy
const items = [
  {
    key: "subglottic",
    name: "聲門下水腫",
    sub: "Subglottic Edema",
    hint: "假聲帶下方假性聲門下突出（偽裂）",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
  {
    key: "ventricular",
    name: "喉室消失",
    sub: "Ventricular Obliteration",
    hint: "喉室（laryngeal ventricle）因水腫而消失",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "部分消失" },
      { value: 4, desc: "完全消失" },
    ],
  },
  {
    key: "erythema",
    name: "紅斑／充血",
    sub: "Erythema / Hyperemia",
    hint: "杓狀軟骨或整個喉部的紅斑充血",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "僅杓狀軟骨" },
      { value: 4, desc: "瀰漫性紅斑" },
    ],
  },
  {
    key: "vocal_fold",
    name: "聲帶水腫",
    sub: "Vocal Fold Edema",
    hint: "聲帶本身的水腫程度",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "息肉樣變性" },
    ],
  },
  {
    key: "diffuse",
    name: "瀰漫性喉部水腫",
    sub: "Diffuse Laryngeal Edema",
    hint: "整個喉部黏膜廣泛水腫",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "阻塞性水腫" },
    ],
  },
  {
    key: "posterior",
    name: "後壁增生肥厚",
    sub: "Posterior Commissure Hypertrophy",
    hint: "後聯合黏膜增生肥厚的程度",
    scores: [
      { value: 0, desc: "無" },
      { value: 1, desc: "輕度" },
      { value: 2, desc: "中度" },
      { value: 3, desc: "重度" },
      { value: 4, desc: "阻塞性肥厚" },
    ],
  },
  {
    key: "granuloma",
    name: "肉芽腫或肉芽組織",
    sub: "Granuloma / Granulation Tissue",
    hint: "杓狀軟骨處或後聯合的肉芽腫",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
  {
    key: "mucus",
    name: "喉部黏液附著",
    sub: "Thick Endolaryngeal Mucus",
    hint: "喉部黏稠黏液附著或聲帶間黏液絲",
    scores: [
      { value: 0, desc: "無" },
      { value: 2, desc: "有" },
    ],
  },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>(
  Object.fromEntries(items.map((item) => [item.key, -1])),
);

const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => items.filter((item) => selections.value[item.key] >= 0).length,
);

const isComplete = computed(() => answeredCount.value === 8);

const totalScore = computed(() =>
  items.reduce((sum, item) => {
    const v = selections.value[item.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

// RFS > 7 = abnormal (Belafsky 2001); > 8 per stricter cut-off used clinically
const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/8 項`,
    };
  if (s <= 7)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "RFS ≤ 7，喉部檢查所見在正常範圍內",
    };
  if (s <= 11)
    return {
      level: "輕度 LPR",
      color: "mild",
      advice: "RFS 8–11，建議配合 RSI 問卷及試驗性 PPI 治療",
    };
  if (s <= 17)
    return {
      level: "中度 LPR",
      color: "moderate",
      advice: "RFS 12–17，建議積極 PPI 治療，考慮 24 小時 pH 監測",
    };
  return {
    level: "重度 LPR",
    color: "severe",
    advice: "RFS ≥ 18，重度喉咽逆流，建議積極治療及密切追蹤",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const lines = items
    .map((item, i) => {
      const v = selections.value[item.key];
      const opt = item.scores.find((o) => o.value === v);
      return `- **Q${i + 1} ${item.name}**（${item.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");

  return `# RFS 逆流表現評分評估結果\n\n## 各項評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **RFS 總分**：${totalScore.value} / 26\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n\n> 正常切截值：RFS ≤ 7（Belafsky 2001）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((item) => {
    selections.value[item.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="rfs">
    <!-- Header -->
    <div class="rfs-header">
      <div class="header-title">
        <h2 class="title">RFS 逆流表現評分</h2>
        <p class="subtitle">
          Reflux Finding Score · 喉咽逆流（LPR）喉鏡所見評估
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/8`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 26) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-threshold">7</span>
        <span>11</span>
        <span>17</span>
        <span>26</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >由耳鼻喉科醫師透過喉鏡檢查評分。共 8 項喉部所見，總分 0–26 分。<strong
          >RFS &gt; 7</strong
        >
        為異常，提示可能有喉咽逆流（LPR）。建議與 RSI 問卷合併判讀。</span
      >
    </div>

    <!-- Items -->
    <div class="rfs-group">
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">喉鏡所見評估</span>
          <span class="group-sub">Laryngoscopic Findings · 8 項</span>
        </div>
        <div class="group-score-pill">{{ answeredCount }}/8 項</div>
      </div>

      <div class="item-list">
        <div
          v-for="(item, idx) in items"
          :key="item.key"
          class="rfs-item"
          :class="{
            answered: selections[item.key] >= 0,
            high: selections[item.key] >= 3,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">F{{ idx + 1 }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.sub }}</span>
              <span class="item-hint">{{ item.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[item.key] === 0,
                unanswered: selections[item.key] < 0,
                high: selections[item.key] >= 3,
              }"
            >
              {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
            </span>
          </div>

          <!-- Dynamic option columns -->
          <div
            class="option-row"
            :style="{
              gridTemplateColumns: `repeat(${item.scores.length}, 1fr)`,
            }"
          >
            <label
              v-for="opt in item.scores"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[item.key] === opt.value,
                high: opt.value >= 3 && selections[item.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="opt.value"
                v-model="selections[item.key]"
              />
              <span class="opt-num">{{ opt.value }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="rfs-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 26</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-threshold" v-if="isComplete">
          {{
            totalScore > 7
              ? "⚠ RFS > 7，建議就醫評估 LPR"
              : "✓ RFS ≤ 7，在正常範圍內"
          }}
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(item, idx) in items" :key="item.key" class="detail-row">
        <span class="detail-qnum">F{{ idx + 1 }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span
          class="detail-score"
          :class="{
            zero: selections[item.key] === 0,
            high: selections[item.key] >= 3,
            brand: selections[item.key] > 0 && selections[item.key] < 3,
          }"
        >
          {{ selections[item.key] >= 0 ? selections[item.key] : "—" }}
        </span>
        <span class="detail-desc">
          {{
            selections[item.key] >= 0
              ? item.scores.find((o) => o.value === selections[item.key])?.desc
              : "未填"
          }}
        </span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">RFS 總分</span>
        <span class="detail-score brand">{{ totalScore }} / 26</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="rfs-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/8 項，尚餘 {{ 8 - answeredCount }} 項
    </p>
  </div>
</template>

<style scoped>
.rfs {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.rfs-header {
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

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}

.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #f59e0b;
  font-weight: 700;
  position: relative;
}
.tick-threshold::after {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: #f59e0b;
  border-radius: 1px;
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
.rfs-group {
  margin-bottom: 1.25rem;
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
    #fef9e7,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rfs-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.rfs-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.rfs-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.rfs-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  );
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #6366f1);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.rfs-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.item-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.item-hint {
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
  font-style: italic;
  opacity: 0.9;
}

.item-score {
  font-size: 1.25rem;
  font-weight: 900;
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
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option row — dynamic columns ─────────────────────────────── */
.option-row {
  display: grid;
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

/* Score-specific colors */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
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
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
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
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
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
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s3.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s4.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-num {
  font-size: 1.15rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #f97316;
}
.opt-pill.s4 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.opt-pill.s4.active .opt-num {
  color: #ef4444;
}

.opt-desc {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.opt-pill.s2 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.opt-pill.s3 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}
.opt-pill.s4 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* ── Result card ───────────────────────────────────────────────── */
.rfs-result {
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
.rfs-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rfs-result.severe {
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
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.rfs-result.normal .result-number {
  color: #22c55e;
}
.rfs-result.mild .result-number {
  color: #f59e0b;
}
.rfs-result.moderate .result-number {
  color: #f97316;
}
.rfs-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.result-level {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}
.result-threshold {
  font-size: 0.85rem;
  font-weight: 700;
}
.rfs-result.normal .result-threshold {
  color: #22c55e;
}
.rfs-result.mild .result-threshold,
.rfs-result.moderate .result-threshold,
.rfs-result.severe .result-threshold {
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
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
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
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
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
  width: 32px;
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
.rfs-actions {
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
  .rfs-header {
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
  .rfs-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
