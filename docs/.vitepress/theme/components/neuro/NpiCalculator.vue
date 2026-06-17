<script setup lang="ts">
import { ref, computed } from "vue";

const domains = [
  { key: "delusions", name: "妄想", sub: "Delusions" },
  { key: "hallucinations", name: "幻覺", sub: "Hallucinations" },
  { key: "agitation", name: "激動 / 攻擊行為", sub: "Agitation / Aggression" },
  { key: "depression", name: "憂鬱 / 情緒不佳", sub: "Depression / Dysphoria" },
  { key: "anxiety", name: "焦慮", sub: "Anxiety" },
  { key: "euphoria", name: "怡然自得 / 欣快感", sub: "Elation / Euphoria" },
  { key: "apathy", name: "冷漠 / 毫不在意", sub: "Apathy / Indifference" },
  { key: "disinhibition", name: "言行失控", sub: "Disinhibition" },
  {
    key: "irritability",
    name: "暴躁易怒 / 情緒易變",
    sub: "Irritability / Lability",
  },
  {
    key: "aberrant_motor",
    name: "異常動作（重複性動作）",
    sub: "Aberrant Motor Behavior",
  },
];

const frequencyOptions = [
  { value: 1, label: "偶爾", desc: "每週少於一次" },
  { value: 2, label: "時常", desc: "每週約一次" },
  { value: 3, label: "經常", desc: "每週數次" },
  { value: 4, label: "常常", desc: "每天或持續出現" },
];

const severityOptions = [
  { value: 1, label: "輕", desc: "輕微，幾乎不造成困擾" },
  { value: 2, label: "中", desc: "中度，對患者有顯著影響" },
  { value: 3, label: "重", desc: "嚴重，明顯影響日常生活" },
];

type DomainState = {
  present: boolean | null;
  frequency: number | null;
  severity: number | null;
};

const selections = ref<Record<string, DomainState>>(
  Object.fromEntries(
    domains.map((d) => [
      d.key,
      { present: null, frequency: null, severity: null },
    ]),
  ),
);

const showResults = ref(false);
const copied = ref(false);

function domainScore(key: string): number {
  const s = selections.value[key];
  if (!s.present || s.frequency === null || s.severity === null) return 0;
  return s.frequency * s.severity;
}

const totalScore = computed(() =>
  domains.reduce((sum, d) => sum + domainScore(d.key), 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0) return { level: "無症狀", color: "normal" };
  if (s <= 12) return { level: "輕度", color: "mild" };
  if (s <= 36) return { level: "中度", color: "moderate" };
  return { level: "重度", color: "severe" };
});

function togglePresent(key: string, value: boolean) {
  const s = selections.value[key];
  s.present = value;
  if (!value) {
    s.frequency = null;
    s.severity = null;
  }
}

function generateMarkdown() {
  const lines = domains.map((d) => {
    const s = selections.value[d.key];
    if (s.present === null) return `- **${d.name}**：未評估`;
    if (!s.present) return `- **${d.name}**：無`;
    const freq = frequencyOptions.find((f) => f.value === s.frequency);
    const sev = severityOptions.find((sv) => sv.value === s.severity);
    const score = domainScore(d.key);
    return `- **${d.name}**：有（頻率 ${s.frequency ?? "-"}×嚴重性 ${s.severity ?? "-"} = ${score} 分）— 頻率：${freq?.label ?? "-"}，嚴重性：${sev?.label ?? "-"}`;
  });
  return `# NPI 神經精神症狀量表評估結果\n\n${lines.join("\n")}\n\n## 總分：${totalScore.value}（${severity.value.level}）`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  domains.forEach((d) => {
    selections.value[d.key] = {
      present: null,
      frequency: null,
      severity: null,
    };
  });
  showResults.value = false;
}
</script>

<template>
  <div class="npi">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="npi-header">
      <div class="header-title">
        <h2 class="title">NPI 神經精神症狀量表</h2>
        <p class="subtitle">Neuropsychiatric Inventory · 失智症行為症狀評估</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 120) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-normal" style="left: 0%">0</span>
        <span class="tick-abs t-mild" style="left: 10%">12</span>
        <span class="tick-abs t-moderate" style="left: 30%">36</span>
        <span class="tick-abs t-severe" style="left: 100%">120</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-normal" style="left: 0%">無症狀</span>
        <span class="label-abs lbl-mild" style="left: 10%">輕度</span>
        <span class="label-abs lbl-moderate" style="left: 30%">中度</span>
        <span class="label-abs lbl-severe" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        每個項目先判斷有無症狀，若有則評估 <strong>頻率</strong>（1–4）與
        <strong>嚴重性</strong>（1–3）。該項得分 = 頻率 × 嚴重性。
      </span>
    </div>

    <!-- ── Group ──────────────────────────────────────────────── -->
    <div class="npi-group">
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">神經精神症狀領域</span>
          <span class="group-sub">Neuropsychiatric Domains · 10 項</span>
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="domain in domains"
          :key="domain.key"
          class="npi-item"
          :class="{
            answered: selections[domain.key].present !== null,
            absent: selections[domain.key].present === false,
          }"
        >
          <!-- ── Item header ─────────────────────── -->
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ domain.name }}</span>
              <span class="item-sub">{{ domain.sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[domain.key].present === false,
                high: domainScore(domain.key) > 0,
                unanswered: selections[domain.key].present === null,
              }"
            >
              {{
                selections[domain.key].present === false
                  ? "無"
                  : domainScore(domain.key) > 0
                    ? "+" + domainScore(domain.key)
                    : "—"
              }}
            </span>
          </div>

          <!-- ── Presence pills ──────────────────── -->
          <div class="option-row two-col">
            <label
              class="opt-pill s-yes"
              :class="{ active: selections[domain.key].present === true }"
            >
              <input
                type="radio"
                :name="domain.key + '_p'"
                :value="true"
                @click="togglePresent(domain.key, true)"
              />
              <span class="opt-num">有</span>
              <span class="opt-desc">症狀存在</span>
            </label>
            <label
              class="opt-pill s-no"
              :class="{ active: selections[domain.key].present === false }"
            >
              <input
                type="radio"
                :name="domain.key + '_p'"
                :value="false"
                @click="togglePresent(domain.key, false)"
              />
              <span class="opt-num">無</span>
              <span class="opt-desc">無此症狀</span>
            </label>
          </div>

          <!-- ── Frequency & severity ────────────── -->
          <div
            v-if="selections[domain.key].present === true"
            class="sub-options"
          >
            <div class="sub-section">
              <div class="sub-label">頻率 Frequency</div>
              <div class="option-row four-col">
                <label
                  v-for="opt in frequencyOptions"
                  :key="opt.value"
                  class="opt-pill"
                  :class="{
                    active: selections[domain.key].frequency === opt.value,
                    ['s' + opt.value]: true,
                  }"
                >
                  <input
                    type="radio"
                    :name="`${domain.key}_freq`"
                    :value="opt.value"
                    v-model="selections[domain.key].frequency"
                  />
                  <span class="opt-num">{{ opt.value }}</span>
                  <span class="opt-desc">{{ opt.label }}</span>
                </label>
              </div>
            </div>
            <div class="sub-section">
              <div class="sub-label">嚴重性 Severity</div>
              <div class="option-row three-col">
                <label
                  v-for="opt in severityOptions"
                  :key="opt.value"
                  class="opt-pill"
                  :class="{
                    active: selections[domain.key].severity === opt.value,
                    ['s' + opt.value]: true,
                  }"
                >
                  <input
                    type="radio"
                    :name="`${domain.key}_sev`"
                    :value="opt.value"
                    v-model="selections[domain.key].severity"
                  />
                  <span class="opt-num">{{ opt.label }}</span>
                  <span class="opt-desc">{{ opt.desc }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="npi-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 120</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">
          <template v-if="totalScore === 0">尚無評分項目或全部無症狀</template>
          <template v-else-if="totalScore <= 12"
            >輕度神經精神症狀，持續觀察</template
          >
          <template v-else-if="totalScore <= 36"
            >中度症狀，建議評估藥物或非藥物介入</template
          >
          <template v-else>重度症狀，建議積極治療與照護計劃</template>
        </span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domain in domains" :key="domain.key" class="detail-row">
        <span class="detail-domain">{{ domain.name }}</span>
        <span class="detail-score">
          <template v-if="selections[domain.key].present === null">—</template>
          <template v-else-if="!selections[domain.key].present">無</template>
          <template v-else>{{ domainScore(domain.key) }}</template>
        </span>
        <span class="detail-desc">
          <template v-if="selections[domain.key].present === true">
            頻率 {{ selections[domain.key].frequency ?? "-" }} × 嚴重性
            {{ selections[domain.key].severity ?? "-" }}
          </template>
        </span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="npi-actions">
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
.npi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.npi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.header-title {
  flex: 1;
  min-width: 0;
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
  margin-top: 0;
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
.lbl-normal {
  color: #22c55e;
}
.lbl-mild {
  color: #f59e0b;
}
.lbl-moderate {
  color: #f97316;
}
.lbl-severe {
  color: #ef4444;
}
.t-normal {
  color: #22c55e;
}
.t-mild {
  color: #f59e0b;
}
.t-moderate {
  color: #f97316;
}
.t-severe {
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
.npi-group {
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
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
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

/* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.npi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.npi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.npi-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.npi-item.absent {
  border-color: var(--vp-c-divider);
  opacity: 0.6;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
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
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
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
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: var(--vp-c-brand-1);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.08);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.option-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.option-row.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}
.option-row.four-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
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
.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}

/* Presence: yes (green) */
.opt-pill.s-yes {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s-yes:hover:not(.active),
.opt-pill.s-yes:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s-yes.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.opt-pill.s-yes .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s-yes.active .opt-num {
  color: #22c55e;
}
.opt-pill.s-yes .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s-yes.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* Presence: no (gray) */
.opt-pill.s-no {
  border-color: rgba(156, 163, 175, 0.15);
}
.opt-pill.s-no:hover:not(.active),
.opt-pill.s-no:focus-within {
  border-color: rgba(156, 163, 175, 0.35);
  background: rgba(156, 163, 175, 0.04);
}
.opt-pill.s-no.active {
  border-color: #9ca3af;
  background: linear-gradient(
    180deg,
    rgba(156, 163, 175, 0.12),
    rgba(156, 163, 175, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.08);
}
.opt-pill.s-no .opt-num {
  color: rgba(156, 163, 175, 0.5);
}
.opt-pill.s-no.active .opt-num {
  color: #9ca3af;
}
.opt-pill.s-no .opt-desc {
  color: rgba(156, 163, 175, 0.4);
}
.opt-pill.s-no.active .opt-desc {
  color: rgba(156, 163, 175, 0.7);
}

/* Frequency/severity: s1 (green) */
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
.opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* s2 (amber) */
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
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

/* s3 (orange) */
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
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

/* s4 (red) */
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
.opt-pill.s4 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #ef4444;
}
.opt-pill.s4 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Sub options (frequency & severity) ────────────────────────── */
.sub-options {
  display: flex;
  flex-direction: column;
}
.sub-section {
  border-bottom: 1px solid var(--vp-c-divider);
}
.sub-section:last-child {
  border-bottom: none;
}
.sub-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  padding: 0.4rem 0.9rem 0;
  letter-spacing: 0.04em;
}

/* ── Result card ───────────────────────────────────────────────── */
.npi-result {
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
.npi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi-result.severe {
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
.npi-result.normal .result-number {
  color: #22c55e;
}
.npi-result.mild .result-number {
  color: #f59e0b;
}
.npi-result.moderate .result-number {
  color: #f97316;
}
.npi-result.severe .result-number {
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
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 120px;
  text-align: right;
}

/* ── Actions ───────────────────────────────────────────────────── */
.npi-actions {
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
  .npi-header {
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
  .npi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row.four-col {
    grid-template-columns: repeat(2, 1fr);
  }
  .option-row.three-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
