<script setup lang="ts">
import { ref, computed } from "vue";

const phq9Questions = [
  "做事時提不起勁或沒有樂趣",
  "感到心情低落、沮喪或絕望",
  "入睡困難、睡不安穩或睡眠過多",
  "覺得疲累或沒有活力",
  "食慾不振或吃太多",
  "覺得自己很糟，或覺得自己失敗、讓自己或家人失望",
  "對事物專注有困難，例如閱讀報紙或看電視時",
  "動作或說話速度緩慢到別人已經察覺；或正好相反——煩躁或坐立不安、動來動去",
  "有不如死掉或用某種方式傷害自己的念頭",
];

const gad7Questions = [
  "感到緊張、焦慮或煩躁",
  "不能停止或無法控制擔憂",
  "對各種事情擔憂過多",
  "很難放鬆",
  "坐立難安，以致於無法安靜坐著",
  "容易心煩或易怒",
  "感到害怕，好像即將有可怕的事情發生",
];

const options = [
  { value: 0, label: "完全沒有" },
  { value: 1, label: "幾天" },
  { value: 2, label: "一半以上的天數" },
  { value: 3, label: "幾乎每天" },
];

const phq9 = ref<(number | null)[]>(Array(9).fill(null));
const gad7 = ref<(number | null)[]>(Array(7).fill(null));
const showResults = ref(false);
const copied = ref(false);

function generateMarkdown() {
  const phq9Lines = phq9Questions.map((q, i) => {
    const v = phq9.value[i];
    const opt = options.find((o) => o.value === v);
    return `- **Q${i + 1}** ${q}：${v !== null ? v + "（" + (opt?.label ?? "") + "）" : "未填"}`;
  });
  const gad7Lines = gad7Questions.map((q, i) => {
    const v = gad7.value[i];
    const opt = options.find((o) => o.value === v);
    return `- **Q${i + 1}** ${q}：${v !== null ? v + "（" + (opt?.label ?? "") + "）" : "未填"}`;
  });
  return `# PHQ-9 & GAD-7 評估結果\n\n## PHQ-9 病人健康問卷\n${phq9Lines.join("\n")}\n\n**PHQ-9 總分：${phq9Total.value} / 27（${phq9Severity.value.level}）**\n${phq9Severity.value.advice}\n\n## GAD-7 廣泛性焦慮症量表\n${gad7Lines.join("\n")}\n\n**GAD-7 總分：${gad7Total.value} / 21（${gad7Severity.value.level}）**\n${gad7Severity.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

const phq9Total = computed(() => phq9.value.reduce((s, v) => s + (v ?? 0), 0));
const gad7Total = computed(() => gad7.value.reduce((s, v) => s + (v ?? 0), 0));

const isComplete = computed(
  () => !phq9.value.includes(null) && !gad7.value.includes(null),
);
const hasRisk = computed(() => (phq9.value[8] ?? 0) > 0);

const phq9Progress = computed(
  () => phq9.value.filter((v) => v !== null).length,
);
const gad7Progress = computed(
  () => gad7.value.filter((v) => v !== null).length,
);

const sevOrder = ["none", "mild", "mod", "severe", "crit"];
const totalColor = computed(() => {
  const pi = sevOrder.indexOf(phq9Severity.value.color);
  const gi = sevOrder.indexOf(gad7Severity.value.color);
  return sevOrder[Math.max(pi, gi)];
});
const sevLabel = computed(() =>
  [phq9Severity.value.level, gad7Severity.value.level].join(" / "),
);
const phq9Color = computed(() => phq9Severity.value.color);
const gad7Color = computed(() => gad7Severity.value.color);

const phq9Severity = computed(() => {
  const s = phq9Total.value;
  if (s <= 4)
    return { level: "無憂鬱傾向", color: "none", advice: "目前無明顯憂鬱症狀" };
  if (s <= 9)
    return {
      level: "輕度憂鬱",
      color: "mild",
      advice: "建議持續自我觀察與調適",
    };
  if (s <= 14)
    return { level: "中度憂鬱", color: "mod", advice: "建議尋求專業諮詢" };
  if (s <= 19)
    return { level: "中重度憂鬱", color: "severe", advice: "建議積極就醫評估" };
  return { level: "重度憂鬱", color: "crit", advice: "請盡速尋求精神科協助" };
});

const gad7Severity = computed(() => {
  const s = gad7Total.value;
  if (s <= 4)
    return { level: "無焦慮傾向", color: "none", advice: "目前無明顯焦慮症狀" };
  if (s <= 9)
    return { level: "輕度焦慮", color: "mild", advice: "建議適當放鬆與舒壓" };
  if (s <= 14)
    return { level: "中度焦慮", color: "mod", advice: "建議尋求專業諮詢" };
  return { level: "重度焦慮", color: "crit", advice: "建議積極就醫評估" };
});

function reset() {
  phq9.value = Array(9).fill(null);
  gad7.value = Array(7).fill(null);
  showResults.value = false;
}
</script>

<template>
  <div class="calc">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="calc-header">
      <div class="header-title">
        <h2 class="title">PHQ-9 & GAD-7 評估</h2>
        <p class="subtitle">憂鬱與焦慮篩檢問卷 · 過去兩個星期</p>
      </div>
      <div class="score-badge" :class="totalColor">
        <span class="score-number">{{ phq9Total + gad7Total }}</span>
        <span class="score-label">{{ sevLabel }}</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >在過去的<strong>兩個星期</strong>中，您有多少時間受到以下問題的困擾？</span
      >
    </div>

    <!-- ── PHQ-9 ─────────────────────────────────────────────── -->
    <div class="psy-group">
      <div class="group-header-bar phq-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">PHQ-9 病人健康問卷</span>
        <span class="group-sub-text">憂鬱篩檢 · 9 題</span>
        <span
          class="group-score-tally"
          :class="
            phq9Total <= 4
              ? 'tally-ok'
              : phq9Total <= 14
                ? 'tally-mid'
                : 'tally-abn'
          "
        >
          {{ phq9Progress }}/9
        </span>
      </div>
      <div class="item-list">
        <div
          v-for="(q, i) in phq9Questions"
          :key="'phq-' + i"
          class="psy-item"
          :class="{
            answered: phq9[i] !== null,
            high: phq9[i] !== null && phq9[i]! >= 2,
            risk: i === 8 && phq9[i] !== null && phq9[i]! > 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q{{ i + 1 }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                unanswered: phq9[i] === null,
                zero: phq9[i] === 0,
                high: phq9[i] !== null && phq9[i]! >= 2,
              }"
            >
              {{ phq9[i] !== null ? phq9[i] : "—" }}
            </span>
          </div>
          <div class="option-row">
            <label
              v-for="opt in options"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: phq9[i] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="'phq-' + i"
                :value="opt.value"
                v-model="phq9[i]"
              />
              <span class="opt-num">{{ opt.value }}</span>
              <span class="opt-desc">{{ opt.label }}</span>
            </label>
          </div>
          <div v-if="i === 8" class="risk-note">
            ⚠ 此題涉及自我傷害念頭，若有此想法請立即聯繫專業人員
          </div>
        </div>
      </div>
    </div>

    <!-- PHQ-9 result -->
    <div class="psy-result" :class="phq9Color">
      <div class="result-left">
        <span class="result-number">{{ phq9Total }}</span>
        <span class="result-max">/ 27</span>
      </div>
      <div class="result-right">
        <span class="result-level">PHQ-9：{{ phq9Severity.level }}</span>
        <span class="result-advice">{{ phq9Severity.advice }}</span>
      </div>
    </div>

    <!-- ── GAD-7 ─────────────────────────────────────────────── -->
    <div class="psy-group" style="margin-top: 1.5rem">
      <div class="group-header-bar gad-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">GAD-7 廣泛性焦慮症量表</span>
        <span class="group-sub-text">焦慮篩檢 · 7 題</span>
        <span
          class="group-score-tally"
          :class="
            gad7Total <= 4
              ? 'tally-ok'
              : gad7Total <= 14
                ? 'tally-mid'
                : 'tally-abn'
          "
        >
          {{ gad7Progress }}/7
        </span>
      </div>
      <div class="item-list">
        <div
          v-for="(q, i) in gad7Questions"
          :key="'gad-' + i"
          class="psy-item"
          :class="{
            answered: gad7[i] !== null,
            high: gad7[i] !== null && gad7[i]! >= 2,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q{{ i + 1 }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                unanswered: gad7[i] === null,
                zero: gad7[i] === 0,
                high: gad7[i] !== null && gad7[i]! >= 2,
              }"
            >
              {{ gad7[i] !== null ? gad7[i] : "—" }}
            </span>
          </div>
          <div class="option-row">
            <label
              v-for="opt in options"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: gad7[i] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="'gad-' + i"
                :value="opt.value"
                v-model="gad7[i]"
              />
              <span class="opt-num">{{ opt.value }}</span>
              <span class="opt-desc">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- GAD-7 result -->
    <div class="psy-result" :class="gad7Color">
      <div class="result-left">
        <span class="result-number">{{ gad7Total }}</span>
        <span class="result-max">/ 21</span>
      </div>
      <div class="result-right">
        <span class="result-level">GAD-7：{{ gad7Severity.level }}</span>
        <span class="result-advice">{{ gad7Severity.advice }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="actions">
      <button
        class="btn-submit"
        :disabled="!isComplete"
        @click="showResults = true"
      >
        查看評估結果
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重新填寫</button>
    </div>
    <p v-if="!isComplete" class="incomplete-hint">
      請完成所有題目以查看結果（PHQ-9：{{ phq9Progress }}/9，GAD-7：{{
        gad7Progress
      }}/7）
    </p>

    <!-- ── Results ────────────────────────────────────────────── -->
    <div v-if="showResults" class="results">
      <div class="results-header">評估報告</div>

      <div class="results-grid">
        <!-- PHQ-9 result -->
        <div class="result-card" :class="phq9Severity.color">
          <div class="result-label phq-label">PHQ-9 憂鬱程度</div>
          <div class="result-score-row">
            <span class="result-num">{{ phq9Total }}</span>
            <span class="result-max">/ 27 分</span>
          </div>
          <div class="result-badge" :class="phq9Severity.color + '-badge'">
            {{ phq9Severity.level }}
          </div>
          <p class="result-desc">
            PHQ-9 ≥ 10 達臨床憂鬱症閾值，≥ 5
            建議持續觀察。分數越高代表憂鬱症狀越嚴重。
          </p>
        </div>

        <!-- GAD-7 result -->
        <div class="result-card" :class="gad7Severity.color">
          <div class="result-label gad-label">GAD-7 焦慮程度</div>
          <div class="result-score-row">
            <span class="result-num">{{ gad7Total }}</span>
            <span class="result-max">/ 21 分</span>
          </div>
          <div class="result-badge" :class="gad7Severity.color + '-badge'">
            {{ gad7Severity.level }}
          </div>
          <p class="result-desc">
            GAD-7 ≥ 10
            達臨床焦慮症閾值。分數越高代表焦慮症狀對日常生活的影響越大。
          </p>
        </div>
      </div>

      <!-- Risk alert -->
      <div v-if="hasRisk" class="risk-alert">
        <div class="risk-icon">⚠</div>
        <div>
          <div class="risk-title">請注意——您填答了有自我傷害念頭的選項</div>
          <p class="risk-body">
            您不需要獨自面對這些感受。請立即聯繫以下資源：
          </p>
          <div class="hotlines">
            <span>📞 安心專線：<strong>1925</strong></span>
            <span>📞 生命線：<strong>1995</strong></span>
            <span>📞 張老師：<strong>1980</strong></span>
          </div>
        </div>
      </div>

      <div class="results-footer">
        本測驗結果僅供初步篩檢參考，不具診斷效力。如有需要請諮詢身心科醫師或心理師以獲得完整評估。
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.calc-header {
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

.score-badge.none {
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
.score-badge.mod {
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
.score-badge.crit {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
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
.psy-group {
  margin-bottom: 1.5rem;
}

.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.phq-bar {
  background: linear-gradient(
    135deg,
    rgba(79, 70, 229, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left-color: #4f46e5;
}
.gad-bar {
  background: linear-gradient(
    135deg,
    rgba(13, 148, 136, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left-color: #0d9488;
}

.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  display: none;
}
.group-score-tally {
  margin-left: auto;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.tally-ok {
  border: 1px solid rgba(34, 197, 94, 0.25);
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.tally-mid {
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.tally-abn {
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.psy-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.psy-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.psy-item.answered {
  border-color: rgba(79, 70, 229, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.psy-item.high {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.psy-item.risk {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
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
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(79, 70, 229, 0.2);
}
.gad-bar + .item-list .item-qnum {
  background: linear-gradient(135deg, #0d9488, #0f766e);
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.2);
}
.psy-item.high .item-qnum {
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

/* s0 — green */
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

/* s1 — lime */
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
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

/* s2 — amber */
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

/* s3 — orange */
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

/* ── opt-num ──────────────────────────────────────────────────── */
.opt-num {
  font-size: 1.05rem;
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
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}

/* ── opt-desc ─────────────────────────────────────────────────── */
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
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

.risk-note {
  padding: 0.4rem 0.9rem;
  font-size: 0.72rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
  border-top: 1px solid rgba(239, 68, 68, 0.15);
}

/* ── Result card ──────────────────────────────────────────────── */
.psy-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.psy-result.none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.psy-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.psy-result.mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.psy-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.psy-result.crit {
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
.psy-result.none .result-number {
  color: #22c55e;
}
.psy-result.mild .result-number {
  color: #84cc16;
}
.psy-result.mod .result-number {
  color: #f59e0b;
}
.psy-result.severe .result-number {
  color: #f97316;
}
.psy-result.crit .result-number {
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

/* ── Actions ───────────────────────────────────────────────────── */
.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 1.5rem 0 0.5rem;
}

.btn-submit,
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

.btn-submit {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}
.btn-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

.incomplete-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

/* ── Results ───────────────────────────────────────────────────── */
.results {
  margin-top: 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
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

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: var(--vp-c-divider);
}

.result-card {
  padding: 1.25rem;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.result-label {
  font-size: 0.78rem;
  font-weight: 700;
}
.phq-label {
  color: #4f46e5;
}
.gad-label {
  color: #0d9488;
}

.result-score-row {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.result-num {
  font-size: 3rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.result-card .result-max {
  font-size: 0.9rem;
}

.result-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  align-self: flex-start;
}
.none-badge {
  background: #dcfce7;
  color: #15803d;
}
.mild-badge {
  background: #fef9c3;
  color: #854d0e;
}
.mod-badge {
  background: #ffedd5;
  color: #9a3412;
}
.severe-badge {
  background: #fee2e2;
  color: #991b1b;
}
.crit-badge {
  background: #fee2e2;
  color: #7f1d1d;
}

.result-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin: 0;
}

/* ── Risk alert ────────────────────────────────────────────────── */
.risk-alert {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  background: rgba(239, 68, 68, 0.05);
  border-top: 1px solid rgba(239, 68, 68, 0.2);
  border-bottom: 1px solid rgba(239, 68, 68, 0.2);
}
.risk-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  color: #ef4444;
}
.risk-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #991b1b;
  margin-bottom: 0.3rem;
}
.risk-body {
  font-size: 0.82rem;
  color: #7f1d1d;
  margin: 0 0 0.75rem;
}
.hotlines {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.82rem;
  color: #991b1b;
}

.results-footer {
  padding: 0.85rem 1.25rem;
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
  text-align: center;
}

/* ── Mobile ────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .calc-header {
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
  .psy-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row {
    grid-template-columns: repeat(2, 1fr);
  }
  .opt-pill:nth-child(2) ~ .opt-pill {
    border-top: 1px solid var(--vp-c-divider);
  }
  .results-grid {
    grid-template-columns: 1fr;
  }
  .result-card:first-child {
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
</style>
