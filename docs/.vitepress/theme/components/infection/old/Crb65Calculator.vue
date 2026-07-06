<script setup lang="ts">
import { ref, computed } from "vue";

// ── CRB-65 Items ──────────────────────────────────────────────────
// Lim 2003 — 4 criteria, each scored 0 or 1, total 0–4
// C = Confusion, R = Respiratory rate, B = Blood pressure, 65 = Age ≥ 65
const criteria = [
  {
    key: "confusion",
    code: "C",
    name: "意識混亂",
    sub: "Confusion",
    desc: "新發生的定向障礙（時間、地點、人物）",
    detail:
      "新出現的意識障礙，包括對時間、地點或人物的定向力喪失。不包括慢性認知症造成的基礎混亂。",
    hint: "急性發作的意識狀態改變（排除基礎失智症）",
  },
  {
    key: "resp",
    code: "R",
    name: "呼吸急促",
    sub: "Respiratory Rate ≥ 30 /min",
    desc: "呼吸速率 ≥ 30 次 / 分鐘",
    detail: "靜息狀態下呼吸頻率達到或超過 30 次/分，反映肺部通氣功能顯著受損。",
    hint: "靜息狀態下測量呼吸頻率",
  },
  {
    key: "bp",
    code: "B",
    name: "低血壓",
    sub: "Blood Pressure: SBP < 90 or DBP ≤ 60 mmHg",
    desc: "收縮壓 < 90 mmHg 或舒張壓 ≤ 60 mmHg",
    detail:
      "任一條件成立即計分：收縮壓低於 90 mmHg，或舒張壓低於或等於 60 mmHg，提示循環功能受損。",
    hint: "以就診時測量值為準",
  },
  {
    key: "age",
    code: "65",
    name: "年齡 ≥ 65 歲",
    sub: "Age ≥ 65 years",
    desc: "患者年齡達 65 歲或以上",
    detail: "年齡是肺炎嚴重度的獨立預測因子，65 歲以上患者死亡風險顯著增加。",
    hint: "依據患者實際年齡",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, boolean>>({
  confusion: false,
  resp: false,
  bp: false,
  age: false,
});

const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const totalScore = computed(
  () => Object.values(selections.value).filter(Boolean).length,
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0)
    return {
      level: "低風險",
      color: "normal",
      mortality: "< 1%",
      advice: "可考慮門診治療，密切追蹤",
      management: "口服抗生素、門診追蹤，若無改善 24–48 小時內重新評估",
      tag: "門診治療",
    };
  if (s <= 1)
    return {
      level: "低至中風險",
      color: "mild",
      mortality: "1–3%",
      advice: "考慮短期住院觀察或密切門診追蹤",
      management: "依臨床判斷考慮住院，口服或靜脈抗生素，每日評估",
      tag: "考慮住院",
    };
  if (s <= 2)
    return {
      level: "中至高風險",
      color: "moderate",
      mortality: "3–15%",
      advice: "建議住院治療",
      management: "住院治療，靜脈抗生素，監測生命徵象，評估 ICU 需求",
      tag: "建議住院",
    };
  return {
    level: "高風險",
    color: "severe",
    mortality: "> 15%",
    advice: "建議緊急住院，評估加護病房",
    management: "緊急住院，考慮 ICU，積極支持治療，評估機械通氣需求",
    tag: "緊急住院 / ICU",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const lines = criteria
    .map(
      (c) =>
        `- **${c.name}**（${c.sub}）：${selections.value[c.key] ? "是（+1）" : "否（0）"}`,
    )
    .join("\n");

  return `# CRB-65 肺炎嚴重度評估結果

## 評估日期：${date}

## 評估項目

${lines}

---

- **CRB-65 總分**：${totalScore.value} / 4
- **風險等級**：${sv.level}
- **預估死亡率**：${sv.mortality}
- **建議處置**：${sv.advice}
- **治療建議**：${sv.management}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  criteria.forEach((c) => {
    selections.value[c.key] = false;
  });
  showResults.value = false;
}

function toggle(key: string) {
  selections.value[key] = !selections.value[key];
}
</script>

<template>
  <div class="crb">
    <!-- Header -->
    <div class="crb-header">
      <div class="header-title">
        <h2 class="title">CRB-65 肺炎嚴重度評估</h2>
        <p class="subtitle">
          Community-Acquired Pneumonia Severity · 社區型肺炎住院決策工具
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: (totalScore / 4) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-threshold">1</span>
        <span>2</span>
        <span>3</span>
        <span>4</span>
      </div>
    </div>

    <!-- Mortality summary pills -->
    <div class="mortality-strip">
      <div class="mort-pill" :class="{ active: totalScore === 0 }">
        <span class="mort-score">0 分</span>
        <span class="mort-rate normal-mort">死亡率 &lt; 1%</span>
        <span class="mort-tag">門診</span>
      </div>
      <div class="mort-pill" :class="{ active: totalScore === 1 }">
        <span class="mort-score">1 分</span>
        <span class="mort-rate mild-mort">死亡率 1–3%</span>
        <span class="mort-tag">考慮住院</span>
      </div>
      <div class="mort-pill" :class="{ active: totalScore === 2 }">
        <span class="mort-score">2 分</span>
        <span class="mort-rate moderate-mort">死亡率 3–15%</span>
        <span class="mort-tag">建議住院</span>
      </div>
      <div class="mort-pill" :class="{ active: totalScore >= 3 }">
        <span class="mort-score">3–4 分</span>
        <span class="mort-rate severe-mort">死亡率 &gt; 15%</span>
        <span class="mort-tag">緊急住院</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據患者就診時的臨床狀態評估以下 4 項指標，每項符合計
        <strong>1 分</strong>，總分 0–4 分。CRB-65
        適用於<strong>基層診所及急診</strong>快速評估社區型肺炎嚴重度。</span
      >
    </div>

    <!-- 4 criteria cards -->
    <div class="criteria-list">
      <div
        v-for="c in criteria"
        :key="c.key"
        class="criteria-card"
        :class="{ selected: selections[c.key] }"
        @click="toggle(c.key)"
      >
        <div
          class="criteria-code"
          :class="{ 'code-active': selections[c.key] }"
        >
          {{ c.code }}
        </div>
        <div class="criteria-content">
          <div class="criteria-name">{{ c.name }}</div>
          <div class="criteria-sub">{{ c.sub }}</div>
          <div class="criteria-desc">{{ c.desc }}</div>
          <div class="criteria-detail">{{ c.detail }}</div>
          <div class="criteria-hint">{{ c.hint }}</div>
        </div>
        <div class="criteria-toggle">
          <div class="toggle-box" :class="{ 'toggle-on': selections[c.key] }">
            <svg
              v-if="selections[c.key]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3.5"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span class="toggle-score" :class="{ 'score-on': selections[c.key] }">
            {{ selections[c.key] ? "+1" : "0" }}
          </span>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="crb-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 4</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ severity.level }}</span>
          <span class="result-mortality"
            >預估死亡率：{{ severity.mortality }}</span
          >
        </div>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-management">{{ severity.management }}</span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="c in criteria" :key="c.key" class="detail-row">
        <span class="detail-code">{{ c.code }}</span>
        <span class="detail-domain">{{ c.name }}</span>
        <span class="detail-score" :class="{ positive: selections[c.key] }">
          {{ selections[c.key] ? "+1" : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[c.key] ? "符合" : "不符合"
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-code">∑</span>
        <span class="detail-domain">CRB-65 總分</span>
        <span class="detail-score positive">{{ totalScore }}</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="crb-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.crb {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.crb-header {
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
  min-width: 90px;
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
  white-space: nowrap;
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
  margin-bottom: 1rem;
}
.severity-bar {
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
  color: #f59e0b;
  font-weight: 700;
}

/* ── Mortality strip ───────────────────────────────────────────── */
.mortality-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.mort-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mort-pill.active {
  border-color: var(--vp-c-brand-1);
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-soft),
    var(--vp-c-bg-soft)
  );
  box-shadow:
    0 0 0 1px rgba(99, 102, 241, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.mort-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mort-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.mort-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.normal-mort {
  color: #22c55e;
}
.mild-mort {
  color: #f59e0b;
}
.moderate-mort {
  color: #f97316;
}
.severe-mort {
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

/* ── Criteria cards ────────────────────────────────────────────── */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}

.criteria-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.9rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
}
.criteria-card:hover {
  background: var(--vp-c-bg-mute);
}
.criteria-card.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.criteria-code {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  color: var(--vp-c-text-3);
  letter-spacing: -0.03em;
  transition: all 0.2s;
  margin-top: 2px;
}
.criteria-code.code-active {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}

.criteria-content {
  flex: 1;
  min-width: 0;
}
.criteria-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.criteria-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}
.criteria-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  margin-bottom: 4px;
}
.criteria-detail {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 4px;
}
.criteria-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.criteria-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-top: 2px;
}
.toggle-box {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.toggle-box svg {
  width: 13px;
  height: 13px;
  color: #fff;
}
.toggle-on {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.toggle-score {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.score-on {
  color: var(--vp-c-brand-1);
}

/* ── Result card ───────────────────────────────────────────────── */
.crb-result {
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
.crb-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.crb-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.crb-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.crb-result.severe {
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
.crb-result.normal .result-number {
  color: #22c55e;
}
.crb-result.mild .result-number {
  color: #f59e0b;
}
.crb-result.moderate .result-number {
  color: #f97316;
}
.crb-result.severe .result-number {
  color: #ef4444;
}
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-mortality {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.result-management {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
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

.detail-code {
  font-size: 0.72rem;
  font-weight: 900;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
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
  color: var(--vp-c-text-3);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.crb-actions {
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

@media (max-width: 640px) {
  .crb-header {
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
  .mortality-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .crb-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .criteria-card {
    flex-wrap: wrap;
  }
}
</style>
