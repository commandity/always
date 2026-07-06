<script setup lang="ts">
import { ref, computed } from "vue";

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"ens6q">("ens6q");

// ── ENS6Q — Empty Nose Syndrome 6-Item Questionnaire ─────────────
// Velasquez et al., Int Forum Allergy Rhinol. 2017;7(1):64–71. PMID: 27557473
//
// 6 items, each scored 0–5 (0 = no symptom, 5 = severe)
// Total score range: 0–30
// Cut-off ≥ 11 (some refs ≥ 10.5) suggests possible ENS
// MCID = 7 points (Tam et al., Laryngoscope 2018)

const ensQuestions = [
  {
    key: "q1",
    name: "鼻腔乾燥感",
    sub: "Nasal dryness",
    detail: "鼻腔內乾燥、缺乏濕潤感",
  },
  {
    key: "q2",
    name: "缺乏氣流通過鼻腔的感覺",
    sub: "Lack of air sensation going through the nasal cavities",
    detail: "吸氣時感受不到空氣流過鼻腔",
  },
  {
    key: "q3",
    name: "鼻腔窒息感或呼吸困難",
    sub: "Nasal suffocation or difficulty breathing through nose",
    detail: "有窒息感，即便鼻腔通暢也感到無法順暢呼吸",
  },
  {
    key: "q4",
    name: "鼻腔感覺過度寬敞或空洞",
    sub: "Nose feeling too open or wide",
    detail: "鼻腔感覺異常寬大、空曠（矛盾性鼻阻塞的核心症狀）",
  },
  {
    key: "q5",
    name: "鼻腔結痂",
    sub: "Nasal crusting",
    detail: "鼻腔內形成乾燥結痂，影響通暢感",
  },
  {
    key: "q6",
    name: "鼻腔灼熱感",
    sub: "Nasal burning sensation",
    detail: "鼻腔黏膜有灼熱或刺痛感",
  },
];

const ensScoreOptions = [
  { value: 0, label: "0", desc: "無症狀" },
  { value: 1, label: "1", desc: "極輕微" },
  { value: 2, label: "2", desc: "輕度" },
  { value: 3, label: "3", desc: "中度" },
  { value: 4, label: "4", desc: "重度" },
  { value: 5, label: "5", desc: "極嚴重" },
];

// ── ENS6Q State ───────────────────────────────────────────────────
const ensSelections = ref<Record<string, number>>(
  Object.fromEntries(ensQuestions.map((q) => [q.key, -1])),
);
const ensShowResults = ref(false);
const ensCopied = ref(false);

const ensTotalScore = computed(() =>
  ensQuestions.reduce((sum, q) => {
    const v = ensSelections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const ensAnsweredCount = computed(
  () => ensQuestions.filter((q) => ensSelections.value[q.key] >= 0).length,
);

const ensIsComplete = computed(() => ensAnsweredCount.value === 6);

const ensSeverity = computed(() => {
  const s = ensTotalScore.value;
  if (!ensIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${ensAnsweredCount.value}/6 題`,
      ens: false,
    };
  if (s < 11)
    return {
      level: "低度疑似 ENS",
      color: "normal",
      advice: "總分 < 11：目前症狀不符合 ENS 篩查陽性標準，建議觀察追蹤",
      ens: false,
    };
  if (s <= 17)
    return {
      level: "中度疑似 ENS",
      color: "moderate",
      advice:
        "總分 11–17：符合 ENS 疑似陽性標準，建議安排棉花測試及耳鼻喉科評估",
      ens: true,
    };
  if (s <= 23)
    return {
      level: "重度疑似 ENS",
      color: "severe",
      advice:
        "總分 18–23：重度 ENS 症狀，強烈建議鼻腔內視鏡、影像學及棉花測試確認診斷",
      ens: true,
    };
  return {
    level: "極重度疑似 ENS",
    color: "critical",
    advice:
      "總分 ≥ 24：極重度 ENS 症狀，需積極評估手術（黏膜下植入物）或其他介入治療",
    ens: true,
  };
});

function ensGenerateMarkdown() {
  const lines = ensQuestions
    .map((q) => {
      const v = ensSelections.value[q.key];
      const opt = ensScoreOptions.find((o) => o.value === v);
      return `- **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");

  return (
    `# ENS6Q 空鼻症評估結果\n\n` +
    `## 各題評分\n\n${lines}\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **ENS6Q 總分**：${ensTotalScore.value} / 30\n` +
    `- **嚴重程度**：${ensSeverity.value.level}\n` +
    `- **ENS 疑似陽性**：${ensSeverity.value.ens ? "是（≥ 11 分）" : "否（< 11 分）"}\n` +
    `- **臨床建議**：${ensSeverity.value.advice}`
  );
}

async function ensCopyMarkdown() {
  await navigator.clipboard.writeText(ensGenerateMarkdown());
  ensCopied.value = true;
  setTimeout(() => (ensCopied.value = false), 2000);
}

function ensReset() {
  ensQuestions.forEach((q) => {
    ensSelections.value[q.key] = -1;
  });
  ensShowResults.value = false;
}
</script>

<template>
  <div class="emptynose">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ens6q' }"
        @click="activeTab = 'ens6q'"
      >
        <span class="tab-label">ENS6Q 空鼻症症狀評估</span>
        <span class="tab-sub">Empty Nose Syndrome 6-Item Questionnaire</span>
      </button>
    </div>

    <!-- ═══════════════════ ENS6Q Panel ═══════════════════ -->
    <div v-show="activeTab === 'ens6q'" class="ens">
      <div class="ens-header">
        <div class="header-title">
          <h2 class="title">ENS6Q 空鼻症評估</h2>
          <p class="subtitle">
            Empty Nose Syndrome 6-Item Questionnaire · 切除後鼻腔症狀篩查
          </p>
        </div>
        <div class="score-badge" :class="ensSeverity.color">
          <span class="score-number">{{
            ensIsComplete ? ensTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            ensIsComplete ? ensSeverity.level : `${ensAnsweredCount}/6`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="ensSeverity.color"
            :style="{ width: (ensTotalScore / 30) * 100 + '%' }"
          />
          <!-- Cut-off marker at exactly 11/30 = 36.67% -->
          <div class="bar-cutoff-line" style="left: 36.67%" />
        </div>
        <div class="severity-ticks-abs">
          <span class="tick-abs tk-normal" style="left: 0%">0</span>
          <span class="tick-abs tick-cutoff" style="left: 36.67%">11 ▾</span>
          <span class="tick-abs tk-moderate" style="left: 60%">18</span>
          <span class="tick-abs tk-severe" style="left: 80%">24</span>
          <span class="tick-abs tk-critical" style="left: 100%">30</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs tk-normal" style="left: 0%">低疑似</span>
          <span class="label-abs tick-cutoff" style="left: 36.67%"
            >陽性門檻</span
          >
          <span class="label-abs tk-moderate" style="left: 60%">中度</span>
          <span class="label-abs tk-severe" style="left: 80%">重度</span>
          <span class="label-abs tk-critical" style="left: 100%">極重</span>
        </div>
      </div>

      <div v-if="ensIsComplete && ensSeverity.ens" class="ens-alert">
        <span class="alert-icon">⚠</span>
        <span>
          <strong>ENS6Q ≥ 11（陽性篩查）：</strong>
          總分
          {{ ensTotalScore }} 分，符合空鼻症疑似診斷標準。建議安排棉花測試（Cotton
          Test）、鼻腔內視鏡及鼻竇 CT 確認診斷。
        </span>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span>
          請依據<strong>目前</strong>您的鼻腔症狀嚴重程度評分。每題
          0（無症狀）至 5（極嚴重），共 6 題，總分 0–30 分。
          <strong>≥ 11 分</strong>提示可能為空鼻症。
        </span>
      </div>

      <div class="ens-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">空鼻症核心症狀</span>
            <span class="group-sub"
              >ENS Core Symptoms · 6 題 · 每題 0–5 分</span
            >
          </div>
          <div class="group-score-pill">{{ ensAnsweredCount }}/6 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in ensQuestions"
            :key="q.key"
            class="ens-item"
            :class="{
              answered: ensSelections[q.key] >= 0,
              high: ensSelections[q.key] >= 4,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
                <span class="item-detail">{{ q.detail }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: ensSelections[q.key] === 0,
                  unanswered: ensSelections[q.key] < 0,
                  high: ensSelections[q.key] >= 4,
                }"
              >
                {{ ensSelections[q.key] >= 0 ? ensSelections[q.key] : "—" }}
              </span>
            </div>

            <div class="sec-options">
                <label
                  v-for="opt in ensScoreOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{ 'opt-selected': ensSelections[q.key] === opt.value }"
                >
                  <input
                    type="radio"
                    :name="'ens-' + q.key"
                    :value="opt.value"
                    v-model="ensSelections[q.key]"
                  />
                  <div
                    class="opt-radio"
                    :class="{ selected: ensSelections[q.key] === opt.value }"
                  >
                    <div class="opt-dot" v-if="ensSelections[q.key] === opt.value" />
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

      <div class="ens-result" :class="ensSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            ensIsComplete ? ensTotalScore : "—"
          }}</span>
          <span class="result-max">/ 30</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ ensSeverity.level }}</span>
          <span class="result-advice">{{ ensSeverity.advice }}</span>
          <span class="result-calc" v-if="ensIsComplete">
            ENS 疑似陽性門檻 ≥ 11 分 ·
            {{
              ensSeverity.ens
                ? `本次 ${ensTotalScore} 分（陽性）`
                : `本次 ${ensTotalScore} 分（陰性）`
            }}
          </span>
        </div>
      </div>

      <div v-if="ensShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in ensQuestions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: ensSelections[q.key] === 0,
              high: ensSelections[q.key] >= 4,
              brand: ensSelections[q.key] > 0 && ensSelections[q.key] < 4,
            }"
          >
            {{ ensSelections[q.key] >= 0 ? ensSelections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              ensSelections[q.key] >= 0
                ? ensScoreOptions.find(
                    (o) => o.value === ensSelections[q.key],
                  )?.desc
                : "未填"
            }}
          </span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">ENS6Q 總分</span>
          <span class="detail-score brand">{{ ensTotalScore }} / 30</span>
          <span class="detail-desc">{{ ensSeverity.level }}</span>
        </div>
      </div>

      <div class="ens-actions">
        <button class="btn-view" @click="ensShowResults = !ensShowResults">
          {{ ensShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="ensCopyMarkdown">
          {{ ensCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="ensReset">重置</button>
      </div>
      <p v-if="!ensIsComplete" class="progress-hint">
        已完成 {{ ensAnsweredCount }}/6 題，尚餘
        {{ 6 - ensAnsweredCount }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Empty Nose Layout & Tab Bar
   ================================================================== */
.emptynose {
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
   ENS6Q panel
   ================================================================== */
.ens {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.ens-header {
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
  margin-bottom: 2.5rem;
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
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

/* ENS cut-off marker at 11/30 */
.bar-cutoff-line {
  position: absolute;
  top: -3px;
  width: 2px;
  height: 14px;
  background: rgba(239, 68, 68, 0.75);
  transform: translateX(-50%);
  border-radius: 1px;
}

/* Absolutely-positioned tick rows — each span sits at true % of max */
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
.tick-cutoff {
  color: #ef4444;
  font-weight: 700;
}

.tick-abs.tk-normal,
.label-abs.tk-normal {
  color: #22c55e;
  font-weight: 700;
}
.tick-abs.tk-moderate,
.label-abs.tk-moderate {
  color: #f59e0b;
  font-weight: 700;
}
.tick-abs.tk-severe,
.label-abs.tk-severe {
  color: #f97316;
  font-weight: 700;
}
.tick-abs.tk-critical,
.label-abs.tk-critical {
  color: #ef4444;
  font-weight: 700;
}

/* ── ENS positive alert ────────────────────────────────────────── */
.ens-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
  font-size: 0.95rem;
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
.ens-group {
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
  border-left: 4px solid #a855f7;
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
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
  border: 1px solid rgba(168, 85, 247, 0.25);
  color: #a855f7;
  background: rgba(168, 85, 247, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ens-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ens-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ens-item.answered {
  border-color: rgba(168, 85, 247, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.ens-item.high {
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
  background: linear-gradient(135deg, #a855f7, #7c3aed);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.2);
}
.ens-item.high .item-qnum {
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
.item-detail {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
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

/* ── Option row — 6 columns (0–5) ─────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
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

/* Score-specific colors — s0 through s5 */
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

.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:hover:not(.active),
.opt-pill.s5:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s5.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-num {
  font-size: 1rem;
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
.opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.opt-pill.s5.active .opt-num {
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
.opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* ── Result card ───────────────────────────────────────────────── */
.ens-result {
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
.ens-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ens-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ens-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ens-result.critical {
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
.ens-result.normal .result-number {
  color: #22c55e;
}
.ens-result.moderate .result-number {
  color: #f59e0b;
}
.ens-result.severe .result-number {
  color: #f97316;
}
.ens-result.critical .result-number {
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
.ens-actions {
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
  .ens-header {
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
  .ens-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
