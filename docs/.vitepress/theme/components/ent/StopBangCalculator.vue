<script setup lang="ts">
import { ref, computed } from "vue";

// ── STOP-BANG Items ───────────────────────────────────────────────
// Chung 2008 — 8 binary items for OSA screening
// S = Snoring, T = Tired, O = Observed, P = Pressure
// B = BMI, A = Age, N = Neck, G = Gender
const items = [
  {
    key: "snoring",
    letter: "S",
    name: "打鼾",
    sub: "Snoring",
    question: "您打鼾的聲音很大嗎？",
    detail: "聲音響到可從關著的門外聽到，或大到讓床伴受到困擾",
    hint: "由床伴或家人確認更為準確",
    color: "stop",
  },
  {
    key: "tired",
    letter: "T",
    name: "疲倦",
    sub: "Tired",
    question: "您白天是否常常感到疲倦、疲乏或昏昏欲睡？",
    detail:
      "即使夜間睡眠時數足夠，仍感到日間過度嗜睡（Excessive Daytime Sleepiness）",
    hint: "參考 Epworth 嗜睡量表評估日間嗜睡程度",
    color: "stop",
  },
  {
    key: "observed",
    letter: "O",
    name: "被觀察到呼吸中止",
    sub: "Observed Apnea",
    question: "有人觀察到您睡眠中停止呼吸嗎？",
    detail: "床伴、家人或室友曾觀察到您在睡眠中有呼吸暫停的情況",
    hint: "需由他人（通常為床伴）提供資訊",
    color: "stop",
  },
  {
    key: "pressure",
    letter: "P",
    name: "高血壓",
    sub: "Pressure (High Blood Pressure)",
    question: "您有高血壓病史，或目前正在接受高血壓治療嗎？",
    detail: "包含已診斷高血壓並服藥治療，或未治療但已知有高血壓",
    hint: "高血壓與 OSA 雙向相關，互為危險因子",
    color: "stop",
  },
  {
    key: "bmi",
    letter: "B",
    name: "BMI > 35",
    sub: "BMI > 35 kg/m²",
    question: "您的身體質量指數（BMI）是否超過 35 kg/m²？",
    detail:
      "BMI = 體重（kg）÷ 身高（m）²。BMI > 35 為第二級肥胖，OSA 風險顯著增加",
    hint: "BMI = 體重(kg) ÷ 身高(m)²，可自行計算",
    color: "bang",
  },
  {
    key: "age",
    letter: "A",
    name: "年齡 > 50 歲",
    sub: "Age > 50 years",
    question: "您的年齡是否超過 50 歲？",
    detail: "隨年齡增長，上呼吸道肌肉張力降低，OSA 發生率顯著上升",
    hint: "50 歲以上 OSA 患病率約為年輕族群的 2–3 倍",
    color: "bang",
  },
  {
    key: "neck",
    letter: "N",
    name: "頸圍 > 40 cm",
    sub: "Neck Circumference > 40 cm",
    question: "您的頸圍是否超過 40 公分？",
    detail:
      "頸圍測量位置：甲狀軟骨下緣（喉結下方）水平繞頸一圈。頸部脂肪堆積壓迫上呼吸道是 OSA 重要機制",
    hint: "男性正常頸圍 ≤ 38 cm，女性 ≤ 35 cm；> 40 cm 為高風險",
    color: "bang",
  },
  {
    key: "gender",
    letter: "G",
    name: "男性",
    sub: "Gender (Male)",
    question: "您的性別是男性嗎？",
    detail:
      "男性罹患 OSA 的風險是女性的 2–3 倍，主要因脂肪分布模式、氣道解剖及荷爾蒙差異",
    hint: "女性在停經後 OSA 風險顯著上升，接近男性水準",
    color: "bang",
  },
];

const stopItems = items.filter((i) => i.color === "stop");
const bangItems = items.filter((i) => i.color === "bang");

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, boolean>>(
  Object.fromEntries(items.map((i) => [i.key, false])),
);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const totalScore = computed(
  () => Object.values(selections.value).filter(Boolean).length,
);

const stopScore = computed(
  () => stopItems.filter((i) => selections.value[i.key]).length,
);
const bangScore = computed(
  () => bangItems.filter((i) => selections.value[i.key]).length,
);

// High-risk criteria per Chung 2012 for surgical patients
// High risk OSA: score ≥ 3
// Very high risk: score ≥ 5, OR score ≥ 2 + male, OR score ≥ 2 + BMI > 35, OR score ≥ 2 + neck > 40
const isHighRiskCriteria = computed(() => {
  const s = totalScore.value;
  const male = selections.value["gender"];
  const bmi = selections.value["bmi"];
  const neck = selections.value["neck"];
  return s >= 5 || (s >= 2 && male) || (s >= 2 && bmi) || (s >= 2 && neck);
});

const severity = computed(() => {
  const s = totalScore.value;
  if (s <= 2)
    return {
      level: "低風險",
      color: "normal",
      probability: "低度 OSA 可能性",
      advice: "低風險，通常不需進一步睡眠評估",
      management: "衛教睡眠衛生，若有明顯症狀可考慮進一步評估",
      tag: "低風險",
      ahi: "AHI ≥ 5 機率：約 17%",
    };
  if (s <= 4)
    return {
      level: "中等風險",
      color: "moderate",
      probability: "中度 OSA 可能性",
      advice: "中等風險，建議就醫評估，考慮多道睡眠生理檢查（PSG）",
      management: "轉介睡眠醫學評估，考慮居家睡眠呼吸監測（HSAT）或 PSG",
      tag: "建議評估",
      ahi: "AHI ≥ 5 機率：約 50%",
    };
  return {
    level: "高風險",
    color: "severe",
    probability: "高度 OSA 可能性",
    advice: "高風險，強烈建議睡眠專科評估及多道睡眠生理檢查",
    management: "優先安排 PSG 或 HSAT，確診後評估 CPAP 或其他治療",
    tag: "高風險",
    ahi: "AHI ≥ 5 機率：> 70%",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function toggle(key: string) {
  selections.value[key] = !selections.value[key];
}

function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const lines = items
    .map(
      (i) =>
        `- **${i.letter} — ${i.name}**（${i.sub}）：${selections.value[i.key] ? "是（+1）" : "否（0）"}`,
    )
    .join("\n");

  return `# STOP-BANG 睡眠呼吸中止症篩查結果

## 評估日期：${date}

## 評估項目

${lines}

---

- **STOP-BANG 總分**：${totalScore.value} / 8
- **STOP 分組**：${stopScore.value} / 4
- **BANG 分組**：${bangScore.value} / 4
- **風險等級**：${sv.level}（${sv.probability}）
- **${sv.ahi}**
- **高風險進階標準（Chung 2012）**：${isHighRiskCriteria.value ? "符合高風險條件" : "不符合高風險條件"}
- **建議處置**：${sv.advice}
- **治療建議**：${sv.management}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((i) => {
    selections.value[i.key] = false;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="sb">
    <!-- Header -->
    <div class="sb-header">
      <div class="header-title">
        <h2 class="title">STOP-BANG 量表</h2>
        <p class="subtitle">
          Obstructive Sleep Apnea Screening · 阻塞性睡眠呼吸中止症篩查工具
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
          :style="{ width: (totalScore / 8) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span>1</span>
        <span class="tick-threshold">3</span>
        <span>5</span>
        <span>8</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div class="risk-pill" :class="{ 'risk-active': totalScore <= 2 }">
        <span class="risk-score">0–2 分</span>
        <span class="risk-rate normal-risk">AHI ≥ 5：約 17%</span>
        <span class="risk-tag">低風險</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': totalScore >= 3 && totalScore <= 4 }"
      >
        <span class="risk-score">3–4 分</span>
        <span class="risk-rate moderate-risk">AHI ≥ 5：約 50%</span>
        <span class="risk-tag">中等風險</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': totalScore >= 5 }">
        <span class="risk-score">5–8 分</span>
        <span class="risk-rate severe-risk">AHI ≥ 5：> 70%</span>
        <span class="risk-tag">高風險</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': isHighRiskCriteria }">
        <span class="risk-score">進階高風險</span>
        <span class="risk-rate severe-risk">Chung 2012</span>
        <span class="risk-tag">{{
          isHighRiskCriteria ? "符合" : "不符合"
        }}</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據過去一個月的狀況回答以下 8 個是 / 否問題。每個「是」計
        <strong>1 分</strong>，總分 0–8 分。STOP-BANG 為廣泛使用的 OSA
        術前篩查工具，亦適用於一般門診篩查。</span
      >
    </div>

    <!-- STOP group -->
    <div class="sb-group">
      <div class="group-header stop-header stop-gradient">
        <div class="group-label-block">
          <span class="group-label">STOP</span>
          <span class="group-sub">症狀評估 · 4 項</span>
        </div>
        <div class="group-score-pill stop-pill">{{ stopScore }} / 4</div>
      </div>
      <div class="item-list">
        <div
          v-for="item in stopItems"
          :key="item.key"
          class="sb-item"
          :class="{ selected: selections[item.key] }"
          @click="toggle(item.key)"
        >
          <div class="item-letter stop-letter">{{ item.letter }}</div>
          <div class="item-content">
            <div class="item-question">{{ item.question }}</div>
            <div class="item-name">{{ item.name }}（{{ item.sub }}）</div>
            <div class="item-detail">{{ item.detail }}</div>
            <div class="item-hint">{{ item.hint }}</div>
          </div>
          <div class="item-toggle">
            <div
              class="toggle-box"
              :class="{
                'toggle-on': selections[item.key],
                'stop-on': selections[item.key],
              }"
            >
              <svg
                v-if="selections[item.key]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span
              class="toggle-score"
              :class="{ 'score-on': selections[item.key] }"
            >
              {{ selections[item.key] ? "+1" : "0" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- BANG group -->
    <div class="sb-group">
      <div class="group-header bang-header bang-gradient">
        <div class="group-label-block">
          <span class="group-label">BANG</span>
          <span class="group-sub">解剖與人口學特徵 · 4 項</span>
        </div>
        <div class="group-score-pill bang-pill">{{ bangScore }} / 4</div>
      </div>
      <div class="item-list">
        <div
          v-for="item in bangItems"
          :key="item.key"
          class="sb-item"
          :class="{ selected: selections[item.key] }"
          @click="toggle(item.key)"
        >
          <div class="item-letter bang-letter">{{ item.letter }}</div>
          <div class="item-content">
            <div class="item-question">{{ item.question }}</div>
            <div class="item-name">{{ item.name }}（{{ item.sub }}）</div>
            <div class="item-detail">{{ item.detail }}</div>
            <div class="item-hint">{{ item.hint }}</div>
          </div>
          <div class="item-toggle">
            <div
              class="toggle-box"
              :class="{
                'toggle-on': selections[item.key],
                'bang-on': selections[item.key],
              }"
            >
              <svg
                v-if="selections[item.key]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span
              class="toggle-score"
              :class="{ 'score-on': selections[item.key] }"
            >
              {{ selections[item.key] ? "+1" : "0" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="sb-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 8</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ severity.level }}</span>
        </div>
        <span class="result-ahi">{{ severity.ahi }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-sub-scores">
          <span class="sub-pill-sm stop-sm">STOP：{{ stopScore }} / 4</span>
          <span class="sub-pill-sm bang-sm">BANG：{{ bangScore }} / 4</span>
          <span v-if="isHighRiskCriteria" class="sub-pill-sm high-sm"
            >⚠ 進階高風險</span
          >
        </div>
      </div>
    </div>

    <!-- High-risk criteria note -->
    <div class="high-risk-note" :class="{ 'high-active': isHighRiskCriteria }">
      <span class="note-icon">{{ isHighRiskCriteria ? "⚠" : "ℹ" }}</span>
      <div>
        <strong>Chung 2012 進階高風險標準：</strong>
        符合以下任一項視為高風險：總分 ≥ 5、或總分 ≥ 2 且為男性、或總分 ≥ 2 且
        BMI &gt; 35、或總分 ≥ 2 且頸圍 &gt; 40 cm。 目前：<strong>{{
          isHighRiskCriteria ? "符合高風險條件" : "不符合高風險條件"
        }}</strong
        >。
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-section-title stop-section">STOP — 症狀評估</div>
      <div v-for="item in stopItems" :key="item.key" class="detail-row">
        <span class="detail-letter stop-letter-sm">{{ item.letter }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span class="detail-score" :class="{ positive: selections[item.key] }">
          {{ selections[item.key] ? "+1" : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[item.key] ? "是" : "否"
        }}</span>
      </div>
      <div class="detail-section-title bang-section">BANG — 解剖與人口學</div>
      <div v-for="item in bangItems" :key="item.key" class="detail-row">
        <span class="detail-letter bang-letter-sm">{{ item.letter }}</span>
        <span class="detail-domain">{{ item.name }}</span>
        <span class="detail-score" :class="{ positive: selections[item.key] }">
          {{ selections[item.key] ? "+1" : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[item.key] ? "是" : "否"
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-letter brand-sm">∑</span>
        <span class="detail-domain">STOP-BANG 總分</span>
        <span class="detail-score positive">{{ totalScore }} / 8</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
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
</template>

<style scoped>
.sb {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
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
  min-width: 80px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
}
.score-number {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
}

.score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
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
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.06);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #16a34a);
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
  color: #f97316;
  font-weight: 700;
}

/* ── Risk strip ────────────────────────────────────────────────── */
.risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.normal-risk {
  color: #22c55e;
}
.moderate-risk {
  color: #f97316;
}
.severe-risk {
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

/* ── Groups ────────────────────────────────────────────────────── */
.sb-group {
  margin-bottom: 1.5rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.stop-header {
  border-left: 4px solid #6366f1;
}
.stop-header.stop-gradient {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
}
.bang-header {
  border-left: 4px solid #f97316;
}
.bang-header.bang-gradient {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 1rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  letter-spacing: 0.05em;
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.stop-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
}
.bang-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}

/* ── Items ─────────────────────────────────────────────────────── */
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
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}

.item-letter {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 900;
  margin-top: 2px;
}
.stop-letter {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.bang-letter {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
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
.item-name {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}
.item-detail {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 3px;
}
.item-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

.item-toggle {
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
.stop-on {
  background: #6366f1;
  border-color: #6366f1;
}
.bang-on {
  background: #f97316;
  border-color: #f97316;
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
.sb-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
}
.sb-result.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
}
.sb-result.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
}
.sb-result.severe {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent);
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
.stop-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.bang-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.high-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* ── High risk note ────────────────────────────────────────────── */
.high-risk-note {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  transition: all 0.3s;
}
.high-risk-note.high-active {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.note-icon {
  flex-shrink: 0;
  font-size: 1rem;
}

/* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
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
.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.stop-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.bang-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: var(--vp-c-bg-mute);
}

.detail-letter {
  font-size: 0.72rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 20px;
}
.stop-letter-sm {
  color: #6366f1;
}
.bang-letter-sm {
  color: #f97316;
}
.brand-sm {
  color: var(--vp-c-brand-1);
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
  .sb-header {
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
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .sb-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
