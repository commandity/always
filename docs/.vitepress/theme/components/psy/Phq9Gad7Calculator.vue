<script setup lang="ts">
import { ref, computed } from "vue";

const options = [
  { value: 0, label: "完全沒有" },
  { value: 1, label: "幾天" },
  { value: 2, label: "一半以上的天數" },
  { value: 3, label: "幾乎每天" },
];

const phqQuestions = [
  "做事時提不起勁或沒有樂趣",
  "感到心情低落、沮喪或絕望",
  "入睡困難、睡不安穩或睡眠過多",
  "覺得疲累或沒有活力",
  "食慾不振或吃太多",
  "覺得自己很糟，或覺得自己失敗、讓自己或家人失望",
  "對事物專注有困難，例如閱讀報紙或看電視時",
  "動作或說話速度緩慢到別人已經察覺；或正好相反——煩躁或坐立不安",
  "有不如死掉或用某種方式傷害自己的念頭",
];
const gadQuestions = [
  "感到緊張、焦慮或煩躁",
  "不能停止或無法控制擔憂",
  "對各種事情擔憂過多",
  "很難放鬆",
  "坐立難安，以致於無法安靜坐著",
  "容易心煩或易怒",
  "感到害怕，好像即將有可怕的事情發生",
];

const activeTab = ref<"phq" | "gad">("phq");
const phq = ref<(number | null)[]>(Array(9).fill(null));
const gad = ref<(number | null)[]>(Array(7).fill(null));
const showResults = ref(false);
const copied = ref(false);

const phqAnswered = computed(() => phq.value.filter((v) => v !== null).length);
const gadAnswered = computed(() => gad.value.filter((v) => v !== null).length);
const phqDone = computed(() => phqAnswered.value === 9);
const gadDone = computed(() => gadAnswered.value === 7);
const phqTotal = computed(() => phq.value.reduce((s, v) => s + (v ?? 0), 0));
const gadTotal = computed(() => gad.value.reduce((s, v) => s + (v ?? 0), 0));
const suicideFlag = computed(() => (phq.value[8] ?? 0) > 0);

const phqSeverity = computed(() => {
  const s = phqTotal.value;
  if (!phqDone.value)
    return { level: "填寫中", tag: "—", color: "filling", advice: "" };
  if (s <= 4)
    return { level: "無 / 極輕微", tag: "正常", color: "normal", advice: "目前無明顯憂鬱症狀，維持規律作息與社會連結。" };
  if (s <= 9)
    return { level: "輕度憂鬱", tag: "輕度", color: "mild", advice: "建議持續自我觀察與生活調適；症狀持續可尋求諮詢。" };
  if (s <= 14)
    return { level: "中度憂鬱", tag: "中度", color: "moderate", advice: "建議尋求專業諮詢，考慮心理治療或藥物治療。" };
  if (s <= 19)
    return { level: "中重度憂鬱", tag: "中重度", color: "high", advice: "建議積極就醫評估，多數需要藥物合併心理治療。" };
  return { level: "重度憂鬱", tag: "重度", color: "critical", advice: "請盡速尋求精神科協助，積極治療與安全評估。" };
});
const gadSeverity = computed(() => {
  const s = gadTotal.value;
  if (!gadDone.value)
    return { level: "填寫中", tag: "—", color: "filling", advice: "" };
  if (s <= 4)
    return { level: "無 / 極輕微", tag: "正常", color: "normal", advice: "目前無明顯焦慮症狀，維持放鬆與規律作息。" };
  if (s <= 9)
    return { level: "輕度焦慮", tag: "輕度", color: "mild", advice: "建議適當放鬆與舒壓；症狀持續可尋求諮詢。" };
  if (s <= 14)
    return { level: "中度焦慮", tag: "中度", color: "moderate", advice: "建議尋求專業諮詢，評估心理治療或藥物治療。" };
  return { level: "重度焦慮", tag: "重度", color: "critical", advice: "建議積極就醫評估，多數需要進一步治療。" };
});

const cur = computed(() =>
  activeTab.value === "phq"
    ? {
        questions: phqQuestions,
        answers: phq.value,
        total: phqTotal.value,
        max: 27,
        done: phqDone.value,
        answered: phqAnswered.value,
        n: 9,
        sev: phqSeverity.value,
        name: "PHQ-9",
        ticks: [0, 5, 10, 15, 20, 27],
      }
    : {
        questions: gadQuestions,
        answers: gad.value,
        total: gadTotal.value,
        max: 21,
        done: gadDone.value,
        answered: gadAnswered.value,
        n: 7,
        sev: gadSeverity.value,
        name: "GAD-7",
        ticks: [0, 5, 10, 15, 21],
      },
);
function pick(i: number, v: number) {
  (activeTab.value === "phq" ? phq : gad).value[i] = v;
}

function reset() {
  if (activeTab.value === "phq") phq.value = Array(9).fill(null);
  else gad.value = Array(7).fill(null);
  showResults.value = false;
}
function generateMarkdown() {
  const c = cur.value;
  const lines = c.questions
    .map((q, i) => `  ${i + 1}. ${q}：${c.answers[i] ?? "—"}`)
    .join("\n");
  return `# ${c.name} 自我評估結果\n\n## 各題評分\n\n${lines}\n\n## 摘要\n\n- **總分**：${c.total} / ${c.max}\n- **分層**：${c.sev.level}\n- **建議**：${c.sev.advice}${activeTab.value === "phq" && suicideFlag.value ? "\n- ⚠️ 第 9 題（自傷念頭）> 0，須立即安全評估。" : ""}`;
}
async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="moodassess">
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'phq' }"
        @click="activeTab = 'phq'; showResults = false"
      >
        <span class="tab-label">PHQ-9 憂鬱</span>
        <span class="tab-sub">Patient Health Questionnaire</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'gad' }"
        @click="activeTab = 'gad'; showResults = false"
      >
        <span class="tab-label">GAD-7 焦慮</span>
        <span class="tab-sub">Generalized Anxiety Disorder</span>
      </button>
    </div>

    <div class="mood">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">{{ cur.name }} 自我評估</h2>
          <p class="subtitle">
            過去兩週的困擾程度 · 共 {{ cur.n }} 題（每題 0–3）
          </p>
        </div>
        <div class="score-badge" :class="cur.sev.color">
          <span class="badge-top">{{ cur.name }}</span>
          <span class="score-number">{{ cur.done ? cur.total : "—" }}</span>
          <span class="score-label">{{ cur.sev.tag }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="cur.sev.color"
            :style="{ width: (cur.total / cur.max) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span
            v-for="(t, i) in cur.ticks"
            :key="i"
            :class="i === 0 ? 'tk-normal' : i >= cur.ticks.length - 2 ? 'tk-severe' : ''"
            >{{ t }}</span
          >
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >在過去<strong>兩週</strong>內，有多少時候您受到以下問題的困擾？請依實際狀況於每題 0–3
          之間作答。本量表為篩檢工具，分數僅供參考。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header mood-group-header">
          <div class="group-label-block">
            <span class="group-label">{{ cur.name }} 問卷</span>
            <span class="group-sub">{{ cur.n }} 題 · 每題 0–3</span>
          </div>
          <div class="group-score-pill">{{ cur.answered }} / {{ cur.n }} 題</div>
        </div>
        <div class="item-list">
          <div
            v-for="(q, i) in cur.questions"
            :key="i"
            class="mood-item"
            :class="{ answered: cur.answers[i] !== null }"
          >
            <div class="item-header">
              <div class="item-name-block">
                <span class="item-name"
                  ><span class="item-qnum">Q{{ i + 1 }}</span
                  >{{ q }}</span
                >
              </div>
              <span
                class="item-score"
                :class="{ unanswered: cur.answers[i] === null }"
                >{{ cur.answers[i] !== null ? cur.answers[i] : "—" }}</span
              >
            </div>
            <div class="sec-options">
              <div
                v-for="opt in options"
                :key="opt.value"
                class="sec-opt"
                :class="{ 'opt-selected': cur.answers[i] === opt.value }"
                @click="pick(i, opt.value)"
              >
                <div
                  class="opt-radio"
                  :class="{ selected: cur.answers[i] === opt.value }"
                >
                  <div class="opt-dot" v-if="cur.answers[i] === opt.value" />
                </div>
                <div class="opt-content">
                  <span class="opt-score-badge">{{ opt.value }}</span>
                  <span class="opt-text">{{ opt.label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="activeTab === 'phq' && suicideFlag"
        class="risk-alert"
      >
        <span class="risk-icon">⚠️</span>
        <span
          >第 9 題（自傷 / 輕生念頭）> 0：請立即進行安全評估並尋求協助。安心專線
          <strong>1925</strong>、生命線 <strong>1995</strong>。</span
        >
      </div>

      <div class="sb-result" :class="cur.sev.color">
        <div class="result-left">
          <span class="result-number">{{ cur.done ? cur.total : "—" }}</span>
          <span class="result-max">/ {{ cur.max }}</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ cur.sev.level }}</span>
          <span v-if="cur.sev.advice" class="result-advice">{{ cur.sev.advice }}</span>
          <span v-else class="result-advice">請完成全部 {{ cur.n }} 題以判讀分層。</span>
        </div>
      </div>

      <div v-if="showResults && cur.done" class="results-detail">
        <div class="results-header">各題明細</div>
        <div
          v-for="(q, i) in cur.questions"
          :key="i"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ i + 1 }}</span>
          <span class="detail-domain">{{ q }}</span>
          <span class="detail-score">{{ cur.answers[i] }}</span>
        </div>
      </div>

      <div class="sb-actions">
        <button
          class="btn-view"
          :disabled="!cur.done"
          @click="showResults = !showResults"
        >
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" :disabled="!cur.done" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.moodassess {
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
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}
.mood {
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
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin: 0;
}
/* ── Score badge — enlarged + rearranged, fixed size ── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 134px;
  min-width: 134px;
  height: 108px;
  padding: 0.45rem 0.9rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.3s,
    color 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-top {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.score-number {
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.05;
}
.score-label {
  font-size: 0.74rem;
  font-weight: 700;
  margin-top: 5px;
  padding: 1px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
}
.score-badge.filling {
  color: var(--vp-c-text-3);
}
.score-badge.filling .score-label {
  background: var(--vp-c-bg-mute);
}
.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.mild {
  border-color: #eab308;
  color: #a16207;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.high {
  border-color: #f43f5e;
  color: #f43f5e;
}
.score-badge.critical {
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
.severity-fill.filling {
  background: var(--vp-c-text-3);
}
.severity-fill.normal {
  background: #22c55e;
}
.severity-fill.mild {
  background: #eab308;
}
.severity-fill.moderate {
  background: #f97316;
}
.severity-fill.high {
  background: #f43f5e;
}
.severity-fill.critical {
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
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.mood-group-header {
  border-left: 4px solid var(--vp-c-brand-1);
}
.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.92rem;
  font-weight: 700;
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
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  padding: 3px 12px;
  border-radius: 999px;
  white-space: nowrap;
}
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.mood-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mood-item.answered {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, var(--vp-c-divider));
}
.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
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
  line-height: 1.45;
}
.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  border-radius: 6px;
  padding: 2px 7px;
  margin-right: 0.5rem;
}
.item-score {
  font-size: 1rem;
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
  color: var(--vp-c-brand-1);
  transition: all 0.25s;
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
/* ── risk alert ── */
.risk-alert {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.8rem 1.1rem;
  border-radius: 12px;
  background: color-mix(in srgb, #ef4444 8%, var(--vp-c-bg));
  border: 1.5px solid #ef4444;
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  line-height: 1.5;
  margin-bottom: 1rem;
}
.risk-icon {
  flex-shrink: 0;
  font-size: 1.1rem;
}
/* ── result ── */
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
  border-color: #eab308;
}
.sb-result.moderate {
  border-color: #f97316;
}
.sb-result.high {
  border-color: #f43f5e;
}
.sb-result.critical {
  border-color: #ef4444;
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
  min-width: 92px;
  justify-content: center;
}
.result-number {
  font-size: 3.2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.sb-result.normal .result-number {
  color: #22c55e;
}
.sb-result.mild .result-number {
  color: #a16207;
}
.sb-result.moderate .result-number {
  color: #f97316;
}
.sb-result.high .result-number {
  color: #f43f5e;
}
.sb-result.critical .result-number {
  color: #ef4444;
}
.result-max {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-level {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── detail ── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
}
.detail-row:first-of-type {
  border-top: none;
}
.detail-qnum {
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  min-width: 30px;
}
.detail-domain {
  flex: 1;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  min-width: 24px;
  text-align: right;
}
/* ── actions ── */
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
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
.btn-view:disabled,
.btn-copy:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
