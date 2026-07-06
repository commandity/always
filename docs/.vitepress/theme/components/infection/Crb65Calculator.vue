<script setup lang="ts">
import { ref, computed } from "vue";

// CRB-65 — Lim 2003. 4 criteria, each 0 or 1, total 0–4.
const criteria = [
  {
    key: "confusion",
    letter: "C",
    name: "意識混亂",
    sub: "Confusion",
    detail: "新發生的定向障礙（時間、地點、人物）",
    hint: "急性發作的意識狀態改變（排除基礎失智症）",
  },
  {
    key: "resp",
    letter: "R",
    name: "呼吸急促",
    sub: "Respiratory rate ≥ 30",
    detail: "呼吸速率 ≥ 30 次 / 分鐘",
    hint: "靜息狀態下測量呼吸頻率",
  },
  {
    key: "bp",
    letter: "B",
    name: "低血壓",
    sub: "Blood pressure low",
    detail: "收縮壓 < 90 mmHg 或舒張壓 ≤ 60 mmHg",
    hint: "以就診時測量值為準",
  },
  {
    key: "age",
    letter: "65",
    name: "年齡 ≥ 65 歲",
    sub: "Age ≥ 65 years",
    detail: "患者年齡達 65 歲或以上",
    hint: "依據患者實際年齡",
  },
];

const activeTab = ref<"crb65">("crb65");
const selections = ref<Record<string, boolean>>(
  Object.fromEntries(criteria.map((c) => [c.key, false])),
);
const showResults = ref(false);
const copied = ref(false);

const totalScore = computed(
  () => Object.values(selections.value).filter(Boolean).length,
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0)
    return {
      level: "低風險",
      color: "normal",
      tag: "門診治療",
      mortality: "< 1%",
      advice: "30 天死亡率低，可考慮門診治療並密切追蹤。",
    };
  if (s === 1)
    return {
      level: "低至中風險",
      color: "mild",
      tag: "考慮住院",
      mortality: "1–3%",
      advice: "考慮短期住院觀察或密切門診追蹤，依臨床判斷。",
    };
  if (s === 2)
    return {
      level: "中至高風險",
      color: "moderate",
      tag: "建議住院",
      mortality: "3–15%",
      advice: "死亡率上升，建議住院治療與監測。",
    };
  return {
    level: "高風險",
    color: "severe",
    tag: "緊急住院 / ICU",
    mortality: "> 15%",
    advice: "死亡風險高，建議緊急住院，評估加護病房照護。",
  };
});

function toggle(key: string) {
  selections.value[key] = !selections.value[key];
}
function reset() {
  criteria.forEach((c) => (selections.value[c.key] = false));
  showResults.value = false;
}
function generateMarkdown() {
  const lines = criteria
    .map(
      (c) =>
        `- **${c.letter} — ${c.name}**（${c.sub}）：${selections.value[c.key] ? "是（+1）" : "否（0）"}`,
    )
    .join("\n");
  return `# CRB-65 肺炎嚴重度評估結果\n\n## 評估項目\n\n${lines}\n\n---\n\n## 摘要\n\n- **CRB-65 總分**：${totalScore.value} / 4\n- **風險等級**：${severity.value.level}\n- **30 天死亡率參考**：${severity.value.mortality}\n- **建議處置**：${severity.value.advice}`;
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="crb65assess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'crb65' }"
        @click="activeTab = 'crb65'"
      >
        <span class="tab-label">CRB-65 肺炎嚴重度評估</span>
        <span class="tab-sub">CRB-65 Severity Score</span>
      </button>
    </div>

    <div v-show="activeTab === 'crb65'" class="crb65">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">CRB-65 評分</h2>
          <p class="subtitle">
            Community-acquired Pneumonia Severity · 社區型肺炎嚴重度分層（Lim
            2003）
          </p>
        </div>
        <div class="score-badge" :class="severity.color">
          <span class="score-number">{{ totalScore }}</span>
          <span class="score-label">{{ severity.tag }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="severity.color"
            :style="{ width: (totalScore / 4) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span><span class="tk-mild">1</span
          ><span class="tk-moderate">2</span><span class="tk-severe">3</span
          ><span class="tk-severe">4</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >勾選符合的臨床項目，每項 <strong>+1</strong>，總分
          0–4。CRB-65 不需檢驗數據，適合門急診快速分層社區型肺炎的死亡風險與住院決策。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header crb-group-header">
          <div class="group-label-block">
            <span class="group-label">CRB-65 臨床項目</span>
            <span class="group-sub">Confusion · RR · BP · Age · 4 項</span>
          </div>
          <div class="group-score-pill crb-pill">{{ totalScore }} / 4</div>
        </div>
        <div class="item-list">
          <div
            v-for="c in criteria"
            :key="c.key"
            class="sb-item"
            :class="{ selected: selections[c.key] }"
            @click="toggle(c.key)"
          >
            <div class="item-letter">{{ c.letter }}</div>
            <div class="item-content">
              <div class="item-question">{{ c.name }}</div>
              <div class="item-name">{{ c.sub }}</div>
              <div class="item-detail">{{ c.detail }}</div>
              <div class="item-hint">{{ c.hint }}</div>
            </div>
            <div class="item-toggle">
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
              <span class="toggle-score" :class="{ 'score-on': selections[c.key] }">{{
                selections[c.key] ? "+1" : "0"
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sb-result" :class="severity.color">
        <div class="result-left">
          <span class="result-number">{{ totalScore }}</span>
          <span class="result-max">/ 4</span>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ severity.level }}</span>
          </div>
          <span class="result-ahi">30 天死亡率參考：{{ severity.mortality }}</span>
          <span class="result-advice">{{ severity.advice }}</span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm crb-sm">{{ severity.tag }}</span>
          </div>
        </div>
      </div>

      <div v-if="showResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="c in criteria" :key="c.key" class="detail-row">
          <span class="detail-letter">{{ c.letter }}</span>
          <span class="detail-domain">{{ c.name }}</span>
          <span class="detail-score" :class="{ positive: selections[c.key] }">{{
            selections[c.key] ? "+1" : "0"
          }}</span>
          <span class="detail-desc">{{ selections[c.key] ? "是" : "否" }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-letter brand-sm">∑</span>
          <span class="detail-domain">CRB-65 總分</span>
          <span class="detail-score positive">{{ totalScore }} / 4</span>
          <span class="detail-desc">{{ severity.level }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button class="btn-view" @click="showResults = !showResults">
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crb65assess {
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
}
.tab-btn {
  flex: 1;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
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
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}
.crb65 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.sb-header {
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
  min-width: 88px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
}
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
.severity-fill.normal {
  background: #22c55e;
}
.severity-fill.mild {
  background: #f59e0b;
}
.severity-fill.moderate {
  background: #f97316;
}
.severity-fill.severe {
  background: #ef4444;
}
.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
  font-weight: 700;
}
.severity-ticks .tk-normal {
  color: #22c55e;
}
.severity-ticks .tk-mild {
  color: #f59e0b;
}
.severity-ticks .tk-moderate {
  color: #f97316;
}
.severity-ticks .tk-severe {
  color: #ef4444;
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
.sb-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.crb-group-header {
  border-left: 4px solid var(--vp-c-brand-1);
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
  white-space: nowrap;
  flex-shrink: 0;
}
.crb-pill {
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.sb-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
}
.sb-item:hover {
  background: var(--vp-c-bg-mute);
}
.sb-item.selected {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, var(--vp-c-bg));
}
.item-letter {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 900;
  margin-top: 2px;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
}
.item-content {
  flex: 1;
  min-width: 0;
}
.item-question {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 3px;
  line-height: 1.4;
}
.sb-item .item-name {
  font-size: 0.76rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-3) !important;
  font-style: italic;
  margin-bottom: 4px;
}
.sb-item .item-detail {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
  line-height: 1.5;
  margin-bottom: 3px;
}
.sb-item .item-hint {
  font-size: 0.72rem !important;
  color: var(--vp-c-text-3) !important;
  line-height: 1.5;
}
.item-toggle {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding-top: 2px;
}
.toggle-box {
  width: 24px;
  height: 24px;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.toggle-box svg {
  width: 14px;
  height: 14px;
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
.sb-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-result.normal {
  border-color: #22c55e;
}
.sb-result.mild {
  border-color: #f59e0b;
}
.sb-result.moderate {
  border-color: #f97316;
}
.sb-result.severe {
  border-color: #ef4444;
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
.sb-result.normal .result-number {
  color: #22c55e;
}
.sb-result.mild .result-number {
  color: #f59e0b;
}
.sb-result.moderate .result-number {
  color: #f97316;
}
.sb-result.severe .result-number {
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
  gap: 0.5rem;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-ahi {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill-sm {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.crb-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
}
.detail-row:first-child {
  border-top: none;
}
.detail-letter {
  flex-shrink: 0;
  width: 26px;
  text-align: center;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-score.positive {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  min-width: 40px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}
.sb-actions {
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
  background: var(--vp-c-brand-1);
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
@media (max-width: 640px) {
  .tab-label {
    font-size: 0.9rem;
  }
  .result-number {
    font-size: 2.6rem;
  }
}
</style>
