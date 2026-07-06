<script setup lang="ts">
import { ref, computed } from "vue";

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"nose">("nose");

// ── NOSE Questions ────────────────────────────────────────────────
const noseQuestions = [
  {
    key: "q1",
    name: "鼻塞或鼻腔充血感",
    sub: "Nasal congestion or stuffiness",
  },
  {
    key: "q2",
    name: "鼻腔阻塞感",
    sub: "Nasal blockage or obstruction",
  },
  {
    key: "q3",
    name: "無法用鼻子呼吸",
    sub: "Unable to breathe through the nose",
  },
  {
    key: "q4",
    name: "睡眠困擾",
    sub: "Trouble sleeping",
  },
  {
    key: "q5",
    name: "運動或用力時無法獲得足夠空氣",
    sub: "Unable to get enough air through nose during exercise or exertion",
  },
];

const noseScoreOptions = [
  { value: 0, label: "0", desc: "不是問題" },
  { value: 1, label: "1", desc: "極輕微" },
  { value: 2, label: "2", desc: "輕度" },
  { value: 3, label: "3", desc: "中度" },
  { value: 4, label: "4", desc: "嚴重" },
];

// ── NOSE State ────────────────────────────────────────────────────
const noseSelections = ref<Record<string, number>>(
  Object.fromEntries(noseQuestions.map((q) => [q.key, -1])),
);
const noseShowResults = ref(false);
const noseCopied = ref(false);

const noseRawScore = computed(() =>
  noseQuestions.reduce((sum, q) => {
    const v = noseSelections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

// NOSE score = raw × 5
const noseScore = computed(() => noseRawScore.value * 5);

const noseAnsweredCount = computed(
  () => noseQuestions.filter((q) => noseSelections.value[q.key] >= 0).length,
);

const noseIsComplete = computed(() => noseAnsweredCount.value === 5);

const noseSeverity = computed(() => {
  const s = noseScore.value;
  if (!noseIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${noseAnsweredCount.value}/5 題`,
    };
  if (s === 0)
    return { level: "無阻塞", color: "normal", advice: "無鼻腔阻塞症狀" };
  if (s <= 25)
    return {
      level: "輕度阻塞",
      color: "mild",
      advice: "輕度鼻腔阻塞，建議觀察或保守治療",
    };
  if (s <= 50)
    return {
      level: "中度阻塞",
      color: "moderate",
      advice: "中度阻塞，建議就醫評估治療選項",
    };
  if (s <= 75)
    return {
      level: "重度阻塞",
      color: "severe",
      advice: "重度阻塞，明顯影響生活品質，建議積極治療",
    };
  return {
    level: "極重度阻塞",
    color: "critical",
    advice: "極重度阻塞，強烈建議手術評估（鼻中隔矯正、鼻甲縮小術等）",
  };
});

function noseGenerateMarkdown() {
  const lines = noseQuestions
    .map((q) => {
      const v = noseSelections.value[q.key];
      const opt = noseScoreOptions.find((o) => o.value === v);
      return `- **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");

  return `# NOSE 鼻腔阻塞症狀評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **原始分數**：${noseRawScore.value} / 20\n- **NOSE 分數**（× 5）：${noseScore.value} / 100\n- **嚴重程度**：${noseSeverity.value.level}\n- **臨床建議**：${noseSeverity.value.advice}`;
}

async function noseCopyMarkdown() {
  await navigator.clipboard.writeText(noseGenerateMarkdown());
  noseCopied.value = true;
  setTimeout(() => (noseCopied.value = false), 2000);
}

function noseReset() {
  noseQuestions.forEach((q) => {
    noseSelections.value[q.key] = -1;
  });
  noseShowResults.value = false;
}
</script>

<template>
  <div class="nasalobs">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'nose' }"
        @click="activeTab = 'nose'"
      >
        <span class="tab-label">NOSE 鼻腔阻塞症狀評估</span>
        <span class="tab-sub">Nasal Obstruction Symptom Evaluation</span>
      </button>
    </div>

    <!-- ═══════════════════ NOSE Panel ═══════════════════ -->
    <div v-show="activeTab === 'nose'" class="nose">
      <div class="nose-header">
        <div class="header-title">
          <h2 class="title">NOSE 鼻腔阻塞症狀評估</h2>
          <p class="subtitle">
            Nasal Obstruction Symptom Evaluation · 過去一個月的鼻腔症狀
          </p>
        </div>
        <div class="score-badge" :class="noseSeverity.color">
          <span class="score-number">{{
            noseIsComplete ? noseScore : "—"
          }}</span>
          <span class="score-label">{{
            noseIsComplete ? noseSeverity.level : `${noseAnsweredCount}/5`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="noseSeverity.color"
            :style="{ width: (noseScore / 100) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span>
          <span class="tk-mild">25</span>
          <span class="tk-moderate">50</span>
          <span class="tk-severe">75</span>
          <span class="tk-critical">100</span>
        </div>
        <div class="severity-labels">
          <span class="tk-normal">無</span>
          <span class="tk-mild">輕度</span>
          <span class="tk-moderate">中度</span>
          <span class="tk-severe">重度</span>
          <span class="tk-critical">極重</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據<strong>過去一個月</strong>您的鼻腔症狀嚴重程度評分。每題
          0（不是問題）至 4（嚴重），共 5 題，總分乘以 5 得 0–100 分。</span
        >
      </div>

      <div class="nose-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">鼻腔阻塞症狀</span>
            <span class="group-sub">Nasal Obstruction Symptoms · 5 題</span>
          </div>
          <div class="group-score-pill">{{ noseAnsweredCount }}/5 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in noseQuestions"
            :key="q.key"
            class="nose-item"
            :class="{
              answered: noseSelections[q.key] >= 0,
              high: noseSelections[q.key] >= 3,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: noseSelections[q.key] === 0,
                  unanswered: noseSelections[q.key] < 0,
                  high: noseSelections[q.key] >= 3,
                }"
              >
                {{ noseSelections[q.key] >= 0 ? noseSelections[q.key] : "—" }}
              </span>
            </div>

            <div class="sec-options">
                <label
                  v-for="opt in noseScoreOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{ 'opt-selected': noseSelections[q.key] === opt.value }"
                >
                  <input
                    type="radio"
                    :name="'nose-' + q.key"
                    :value="opt.value"
                    v-model="noseSelections[q.key]"
                  />
                  <div
                    class="opt-radio"
                    :class="{ selected: noseSelections[q.key] === opt.value }"
                  >
                    <div class="opt-dot" v-if="noseSelections[q.key] === opt.value" />
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

      <div class="nose-result" :class="noseSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            noseIsComplete ? noseScore : "—"
          }}</span>
          <span class="result-max">/ 100</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ noseSeverity.level }}</span>
          <span class="result-advice">{{ noseSeverity.advice }}</span>
          <span class="result-calc" v-if="noseIsComplete">
            原始分數 {{ noseRawScore }}/20 × 5 = {{ noseScore }}
          </span>
        </div>
      </div>

      <div v-if="noseShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in noseQuestions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: noseSelections[q.key] === 0,
              high: noseSelections[q.key] >= 3,
              brand: noseSelections[q.key] > 0 && noseSelections[q.key] < 3,
            }"
          >
            {{ noseSelections[q.key] >= 0 ? noseSelections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              noseSelections[q.key] >= 0
                ? noseScoreOptions.find(
                    (o) => o.value === noseSelections[q.key],
                  )?.desc
                : "未填"
            }}
          </span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">原始分數</span>
          <span class="detail-score brand">{{ noseRawScore }} / 20</span>
          <span class="detail-desc">各題加總</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">NOSE 總分</span>
          <span class="detail-score brand">{{ noseScore }} / 100</span>
          <span class="detail-desc">原始分數 × 5</span>
        </div>
      </div>

      <div class="nose-actions">
        <button class="btn-view" @click="noseShowResults = !noseShowResults">
          {{ noseShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="noseCopyMarkdown">
          {{ noseCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="noseReset">重置</button>
      </div>
      <p v-if="!noseIsComplete" class="progress-hint">
        已完成 {{ noseAnsweredCount }}/5 題，尚餘
        {{ 5 - noseAnsweredCount }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Nasal Obstruction Layout & Tab Bar
   ================================================================== */
.nasalobs {
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
   NOSE panel
   ================================================================== */
.nose {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.nose-header {
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
  font-size: 0.72rem;
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
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.critical {
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
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.severity-ticks,
.severity-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.severity-labels {
  margin-top: 1px;
}

.severity-ticks .tk-normal,
.severity-labels .tk-normal {
  color: #22c55e;
  font-weight: 700;
}
.severity-ticks .tk-mild,
.severity-labels .tk-mild {
  color: #84cc16;
  font-weight: 700;
}
.severity-ticks .tk-moderate,
.severity-labels .tk-moderate {
  color: #f59e0b;
  font-weight: 700;
}
.severity-ticks .tk-severe,
.severity-labels .tk-severe {
  color: #f97316;
  font-weight: 700;
}
.severity-ticks .tk-critical,
.severity-labels .tk-critical {
  color: #ef4444;
  font-weight: 700;
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
.nose-group {
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
  border-left: 4px solid #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
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
  gap: 0.5rem;
}

.nose-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nose-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.nose-item.answered {
  border-color: rgba(245, 158, 11, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.nose-item.high {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
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
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.nose-item.high .item-qnum {
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
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
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

/* ── Option row — 5 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.15rem;
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

/* Score-specific colors — s0 through s4 */
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
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-num {
  font-size: 1.05rem;
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
  color: rgba(132, 204, 22, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
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
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

/* ── Result card ───────────────────────────────────────────────── */
.nose-result {
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
.nose-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nose-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nose-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nose-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nose-result.critical {
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
.nose-result.normal .result-number {
  color: #22c55e;
}
.nose-result.mild .result-number {
  color: #84cc16;
}
.nose-result.moderate .result-number {
  color: #f59e0b;
}
.nose-result.severe .result-number {
  color: #f97316;
}
.nose-result.critical .result-number {
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
.result-calc {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
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
  width: 60px;
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
  width: 72px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.nose-actions {
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
  .nose-header {
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
  .nose-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .opt-desc {
    display: none;
  }
}
</style>
