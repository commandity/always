<script setup lang="ts">
import { ref, computed } from "vue";

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"etdq7">("etdq7");

// ── ETDQ-7 Questions ──────────────────────────────────────────────
const etdqQuestions = [
  {
    key: "q1",
    name: "耳朵有壓迫或悶塞感",
    sub: "Pressure in the ear(s)",
    hint: "感覺耳朵被堵住或有壓力",
  },
  {
    key: "q2",
    name: "耳朵有疼痛感",
    sub: "Pain in the ear(s)",
    hint: "耳朵疼痛或不適",
  },
  {
    key: "q3",
    name: "耳朵有悶鳴聲或嗡嗡聲（耳鳴）",
    sub: "Roaring, buzzing, hissing in the ear(s)",
    hint: "耳鳴或異常聲音",
  },
  {
    key: "q4",
    name: "感覺耳朵裡有液體或耳鳴聲音變化",
    sub: "Sensation of fluid or crackling in the ear(s)",
    hint: "耳內積液感或啪啪聲",
  },
  {
    key: "q5",
    name: "您的耳朵症狀在吞嚥或打哈欠後有改善",
    sub: "Symptoms improve with swallowing or yawning",
    hint: "吞嚥或打哈欠能暫時緩解耳朵不適",
  },
  {
    key: "q6",
    name: "感冒、鼻竇炎或過敏時耳朵症狀加重",
    sub: "Symptoms with upper respiratory infection, sinusitis, or allergy",
    hint: "上呼吸道感染或過敏會使耳朵症狀更嚴重",
  },
  {
    key: "q7",
    name: "搭飛機、上山或下潛水時耳朵有明顯不適",
    sub: "Ear symptoms with altitude changes (airplane, mountain, diving)",
    hint: "氣壓變化時耳朵特別不舒服",
  },
];

const etdqScoreOptions = [
  { value: 1, label: "1", desc: "沒有問題" },
  { value: 2, label: "2", desc: "極輕微" },
  { value: 3, label: "3", desc: "輕度" },
  { value: 4, label: "4", desc: "中度" },
  { value: 5, label: "5", desc: "重度" },
  { value: 6, label: "6", desc: "最嚴重" },
  { value: 7, label: "7", desc: "極嚴重" },
];

// ── ETDQ-7 State ──────────────────────────────────────────────────
const etdqSelections = ref<Record<string, number>>(
  Object.fromEntries(etdqQuestions.map((q) => [q.key, -1])),
);
const etdqShowResults = ref(false);
const etdqCopied = ref(false);

const etdqAnsweredCount = computed(
  () => etdqQuestions.filter((q) => etdqSelections.value[q.key] >= 0).length,
);
const etdqIsComplete = computed(() => etdqAnsweredCount.value === 7);

const etdqTotalScore = computed(() =>
  etdqQuestions.reduce((sum, q) => {
    const v = etdqSelections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const etdqMeanScore = computed(() => {
  if (etdqAnsweredCount.value === 0) return 0;
  return Math.round((etdqTotalScore.value / etdqAnsweredCount.value) * 10) / 10;
});

// ETDQ-7 uses mean score per item; threshold ≥ 14.5 total (≥ 2.1/item average)
const etdqSeverity = computed(() => {
  if (!etdqIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${etdqAnsweredCount.value}/7 題`,
    };
  const avg = etdqMeanScore.value;
  if (avg < 2.1)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "耳咽管功能正常，無顯著功能障礙",
    };
  if (avg < 3.0)
    return {
      level: "輕度功能障礙",
      color: "mild",
      advice: "輕度耳咽管功能障礙，建議追蹤觀察",
    };
  if (avg < 4.5)
    return {
      level: "中度功能障礙",
      color: "moderate",
      advice: "中度功能障礙，建議耳鼻喉科評估",
    };
  return {
    level: "重度功能障礙",
    color: "severe",
    advice: "重度耳咽管功能障礙，建議積極治療或手術評估",
  };
});

function etdqGenerateMarkdown() {
  const lines = etdqQuestions
    .map((q) => {
      const v = etdqSelections.value[q.key];
      const opt = etdqScoreOptions.find((o) => o.value === v);
      return `- **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");

  return `# ETDQ-7 耳咽管功能障礙問卷評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **各題總分**：${etdqTotalScore.value} / 49\n- **平均分數**：${etdqMeanScore.value} / 7\n- **嚴重程度**：${etdqSeverity.value.level}\n- **臨床建議**：${etdqSeverity.value.advice}\n\n> 切截值：總分 ≥ 14.5（平均 ≥ 2.1）高度提示耳咽管功能障礙`;
}

async function etdqCopyMarkdown() {
  await navigator.clipboard.writeText(etdqGenerateMarkdown());
  etdqCopied.value = true;
  setTimeout(() => (etdqCopied.value = false), 2000);
}

function etdqReset() {
  etdqQuestions.forEach((q) => {
    etdqSelections.value[q.key] = -1;
  });
  etdqShowResults.value = false;
}
</script>

<template>
  <div class="etfn">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'etdq7' }"
        @click="activeTab = 'etdq7'"
      >
        <span class="tab-label">ETDQ-7 耳咽管功能障礙問卷</span>
        <span class="tab-sub">Eustachian Tube Dysfunction Questionnaire</span>
      </button>
    </div>

    <!-- ═══════════════════ ETDQ-7 Panel ═══════════════════ -->
    <div v-show="activeTab === 'etdq7'" class="etdq">
      <div class="etdq-header">
        <div class="header-title">
          <h2 class="title">ETDQ-7 耳咽管功能障礙問卷</h2>
          <p class="subtitle">
            Eustachian Tube Dysfunction Questionnaire · 7 題版本
          </p>
        </div>
        <div class="score-badge" :class="etdqSeverity.color">
          <span class="score-number">{{
            etdqIsComplete ? etdqMeanScore : "—"
          }}</span>
          <span class="score-label">{{
            etdqIsComplete ? etdqSeverity.level : `${etdqAnsweredCount}/7`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="etdqSeverity.color"
            :style="{
              width: etdqIsComplete
                ? Math.min(((etdqMeanScore - 1) / 6) * 100, 100) + '%'
                : '0%',
            }"
          />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs green" style="left: 0%">1</span>
          <span class="tick-abs threshold" style="left: 18.33%">2.1</span>
          <span class="tick-abs mild" style="left: 33.33%">3</span>
          <span class="tick-abs moderate" style="left: 58.33%">4.5</span>
          <span class="tick-abs severe" style="left: 100%">7</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs green" style="left: 9.17%">正常</span>
          <span class="label-abs mild" style="left: 25%">輕度</span>
          <span class="label-abs moderate" style="left: 46%">中度</span>
          <span class="label-abs severe" style="left: 79%">重度</span>
        </div>
      </div>

      <div class="sub-scores">
        <div class="sub-pill">
          <span class="sub-label">各題總分</span>
          <span class="sub-val">{{ etdqTotalScore }} / 49</span>
        </div>
        <div class="sub-pill">
          <span class="sub-label">平均分數</span>
          <span class="sub-val" :class="etdqSeverity.color"
            >{{ etdqIsComplete ? etdqMeanScore : "—" }} / 7</span
          >
        </div>
        <div class="sub-pill">
          <span class="sub-label">臨床門檻</span>
          <span class="sub-val threshold">平均 ≥ 2.1</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據您<strong>過去一個月</strong>耳朵症狀的嚴重程度評分。每題
          1（沒有問題）至 7（極嚴重），共 7 題。平均分數 ≥ 2.1
          建議就醫評估耳咽管功能。</span
        >
      </div>

      <div class="etdq-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">耳咽管症狀評估</span>
            <span class="group-sub">Eustachian Tube Symptoms · 7 題</span>
          </div>
          <div class="group-score-pill">{{ etdqAnsweredCount }}/7 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in etdqQuestions"
            :key="q.key"
            class="etdq-item"
            :class="{
              answered: etdqSelections[q.key] >= 0,
              high: etdqSelections[q.key] >= 5,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
                <span class="item-hint">{{ q.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  low: etdqSelections[q.key] === 1,
                  unanswered: etdqSelections[q.key] < 0,
                  high: etdqSelections[q.key] >= 5,
                }"
              >
                {{ etdqSelections[q.key] >= 0 ? etdqSelections[q.key] : "—" }}
              </span>
            </div>

            <div class="option-row">
              <label
                v-for="opt in etdqScoreOptions"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: etdqSelections[q.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'etdq-' + q.key"
                  :value="opt.value"
                  v-model="etdqSelections[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="etdq-result" :class="etdqSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            etdqIsComplete ? etdqMeanScore : "—"
          }}</span>
          <span class="result-max">/ 7</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ etdqSeverity.level }}</span>
          <span class="result-advice">{{ etdqSeverity.advice }}</span>
          <span class="result-total">各題總分：{{ etdqTotalScore }} / 49</span>
        </div>
      </div>

      <div v-if="etdqShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in etdqQuestions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              low: etdqSelections[q.key] === 1,
              high: etdqSelections[q.key] >= 5,
              brand: etdqSelections[q.key] > 1 && etdqSelections[q.key] < 5,
            }"
          >
            {{ etdqSelections[q.key] >= 0 ? etdqSelections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              etdqSelections[q.key] >= 0
                ? etdqScoreOptions.find(
                    (o) => o.value === etdqSelections[q.key],
                  )?.desc
                : "未填"
            }}
          </span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">平均分數</span>
          <span class="detail-score brand">{{ etdqMeanScore }} / 7</span>
          <span class="detail-desc">{{ etdqSeverity.level }}</span>
        </div>
      </div>

      <div class="etdq-actions">
        <button class="btn-view" @click="etdqShowResults = !etdqShowResults">
          {{ etdqShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="etdqCopyMarkdown">
          {{ etdqCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="etdqReset">重置</button>
      </div>
      <p v-if="!etdqIsComplete" class="progress-hint">
        已完成 {{ etdqAnsweredCount }}/7 題，尚餘
        {{ 7 - etdqAnsweredCount }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   ET Function Layout & Tab Bar
   ================================================================== */
.etfn {
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
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ==================================================================
   ETDQ-7 panel
   ================================================================== */
.etdq {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.etdq-header {
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

/* ── Score badge ───────────────────────────────────────────────── */
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
}
.score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.severe {
  border-color: #f97316;
  color: #f97316;
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
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
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
  font-size: 0.65rem;
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
.tick-abs.threshold {
  color: #84cc16;
}
.tick-abs.mild,
.label-abs.mild {
  color: #84cc16;
}
.tick-abs.moderate,
.label-abs.moderate {
  color: #f59e0b;
}
.tick-abs.severe,
.label-abs.severe {
  color: #f97316;
}

/* ── Sub scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.sub-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.sub-val {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sub-val.normal {
  color: #22c55e;
}
.sub-val.mild {
  color: #84cc16;
}
.sub-val.moderate {
  color: #f59e0b;
}
.sub-val.severe {
  color: #f97316;
}
.sub-val.threshold {
  color: var(--vp-c-brand-1);
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
.etdq-group {
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
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
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
  border: 1px solid rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.etdq-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.etdq-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.etdq-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.etdq-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.04),
    transparent
  ) !important;
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
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.etdq-item.high .item-qnum {
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
.item-score.low {
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

/* ── Option row — 7 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 2px;
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
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s1.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s2.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s3.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s4.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s5,
.opt-pill.s6,
.opt-pill.s7 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:hover:not(.active),
.opt-pill.s6:hover:not(.active),
.opt-pill.s7:hover:not(.active),
.opt-pill.s5:focus-within,
.opt-pill.s6:focus-within,
.opt-pill.s7:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s5.active,
.opt-pill.s6.active,
.opt-pill.s7.active {
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
.opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.opt-pill.s2 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #84cc16;
}
.opt-pill.s3 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #eab308;
}
.opt-pill.s4 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s4.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s5 .opt-num,
.opt-pill.s6 .opt-num,
.opt-pill.s7 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.opt-pill.s5.active .opt-num,
.opt-pill.s6.active .opt-num,
.opt-pill.s7.active .opt-num {
  color: #ef4444;
}

.opt-desc {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.opt-pill.s2 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.opt-pill.s3 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.opt-pill.s4 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.opt-pill.s5 .opt-desc,
.opt-pill.s6 .opt-desc,
.opt-pill.s7 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.opt-pill.s5.active .opt-desc,
.opt-pill.s6.active .opt-desc,
.opt-pill.s7.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* ── Result card ───────────────────────────────────────────────── */
.etdq-result {
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
.etdq-result.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
}
.etdq-result.mild {
  border-color: #84cc16;
  background: linear-gradient(135deg, rgba(132, 204, 22, 0.06), transparent);
}
.etdq-result.moderate {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
}
.etdq-result.severe {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
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
.etdq-result.normal .result-number {
  color: #22c55e;
}
.etdq-result.mild .result-number {
  color: #84cc16;
}
.etdq-result.moderate .result-number {
  color: #f59e0b;
}
.etdq-result.severe .result-number {
  color: #f97316;
}

.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.result-total {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
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
  font-size: 0.8rem;
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
.detail-score.low {
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
  width: 52px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.etdq-actions {
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
  .etdq-header {
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
  .etdq-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .opt-desc {
    display: none;
  }
  .detail-desc {
    width: 40px;
  }
}
</style>
