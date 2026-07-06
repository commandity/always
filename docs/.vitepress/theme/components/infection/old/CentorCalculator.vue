<script setup lang="ts">
import { ref, computed } from "vue";

// ── Centor / McIsaac Criteria ─────────────────────────────────────
// Original Centor 1981 (4 criteria) + McIsaac 1998 age modifier
// Score range: -1 to +5
const criteria = [
  {
    key: "exudate",
    name: "扁桃體滲出物或腫脹",
    sub: "Tonsillar Exudate or Swelling",
    desc: "扁桃體上可見白色或黃色膿性分泌物，或扁桃體明顯腫脹",
    hint: "需在良好光線及壓舌板輔助下檢查",
    points: 1,
    type: "binary",
  },
  {
    key: "lymph",
    name: "前頸淋巴結腫大且壓痛",
    sub: "Tender Anterior Cervical Lymphadenopathy",
    desc: "頸前淋巴結（胸鎖乳突肌前方）可觸及腫大且按壓有疼痛感",
    hint: "需雙手觸診比較，壓痛是重要條件",
    points: 1,
    type: "binary",
  },
  {
    key: "fever",
    name: "發燒（體溫 > 38°C）",
    sub: "Temperature > 38°C (100.4°F)",
    desc: "就診時體溫超過 38°C，或病史中有發燒紀錄",
    hint: "以就診時測量或近期病史為準",
    points: 1,
    type: "binary",
  },
  {
    key: "cough",
    name: "無咳嗽",
    sub: "Absence of Cough",
    desc: "患者目前無咳嗽症狀（咳嗽的出現反而提示病毒性病因）",
    hint: "咳嗽的存在使化膿性鏈球菌感染可能性降低",
    points: 1,
    type: "binary",
  },
];

// Age modifier (McIsaac 1998)
const ageCriteria = [
  { key: "age3_14", label: "3–14 歲", sub: "Age 3–14 years", points: 1 },
  { key: "age15_44", label: "15–44 歲", sub: "Age 15–44 years", points: 0 },
  { key: "age45p", label: "≥ 45 歲", sub: "Age ≥ 45 years", points: -1 },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, boolean>>({
  exudate: false,
  lymph: false,
  fever: false,
  cough: false,
});
const selectedAge = ref<string | null>(null);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const clinicalScore = computed(() =>
  criteria.reduce((sum, c) => sum + (selections.value[c.key] ? 1 : 0), 0),
);

const agePoints = computed(() => {
  if (selectedAge.value === "age3_14") return 1;
  if (selectedAge.value === "age15_44") return 0;
  if (selectedAge.value === "age45p") return -1;
  return null;
});

const totalScore = computed(() =>
  agePoints.value !== null
    ? clinicalScore.value + agePoints.value
    : clinicalScore.value,
);

const isComplete = computed(() => selectedAge.value !== null);

// GAS probability and management per score
const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "尚未完成",
      color: "filling",
      probability: "—",
      advice: "請選擇年齡以完成評估",
      management: "",
      tag: "—",
    };
  if (s <= 0)
    return {
      level: "極低風險",
      color: "normal",
      probability: "1–2.5%",
      advice: "不建議咽喉拭子培養或抗生素治療",
      management:
        "症狀治療，無需抗生素。建議充分休息、補充水分、必要時使用退燒藥或止痛漱口水。",
      tag: "無需抗生素",
    };
  if (s === 1)
    return {
      level: "低風險",
      color: "normal",
      probability: "5–10%",
      advice: "不建議常規培養或抗生素，症狀治療為主",
      management:
        "症狀治療。若症狀持續加重或超過 3–5 天未改善，重新評估並考慮培養。",
      tag: "症狀治療",
    };
  if (s === 2)
    return {
      level: "中等風險",
      color: "mild",
      probability: "11–17%",
      advice: "考慮快速抗原檢測（RADT）或咽喉培養",
      management:
        "進行快速抗原檢測（RADT）。陽性者給予抗生素；陰性者考慮培養確認，或依臨床判斷決定。",
      tag: "建議 RADT",
    };
  if (s === 3)
    return {
      level: "中高風險",
      color: "moderate",
      probability: "28–35%",
      advice: "建議 RADT 或咽喉培養，陽性者給予抗生素",
      management:
        "快速抗原檢測或咽喉培養。陽性者給予 Penicillin V 或 Amoxicillin 10 天療程。",
      tag: "建議培養或治療",
    };
  return {
    level: "高風險",
    color: "severe",
    probability: "51–53%",
    advice: "強烈考慮抗生素治療，可考慮不等待培養結果",
    management:
      "考慮直接給予抗生素（Penicillin V 或 Amoxicillin），或先行 RADT 後立即治療陽性者。",
    tag: "積極治療",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function toggleCriteria(key: string) {
  selections.value[key] = !selections.value[key];
}

function selectAge(key: string) {
  selectedAge.value = key;
}

function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const ageLabel =
    ageCriteria.find((a) => a.key === selectedAge.value)?.label ?? "未選擇";

  const clines = criteria
    .map(
      (c) =>
        `- **${c.name}**（${c.sub}）：${selections.value[c.key] ? `是（+1）` : `否（0）`}`,
    )
    .join("\n");

  return `# Centor Score（McIsaac 修正版）評估結果

## 評估日期：${date}

## 評估項目

${clines}
- **年齡**：${ageLabel}（${agePoints.value !== null && agePoints.value > 0 ? "+" : ""}${agePoints.value ?? "—"}）

---

- **臨床分數**：${clinicalScore.value} 分
- **年齡調整**：${agePoints.value !== null ? (agePoints.value >= 0 ? "+" : "") + agePoints.value : "—"}
- **Centor 總分**：${totalScore.value} 分
- **GAS 感染機率**：${sv.probability}
- **風險等級**：${sv.level}
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
  selectedAge.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="centor">
    <!-- Header -->
    <div class="centor-header">
      <div class="header-title">
        <h2 class="title">Centor Score（McIsaac 修正版）</h2>
        <p class="subtitle">A 群鏈球菌咽喉炎風險評估 · 抗生素使用決策工具</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{
          isComplete ? totalScore : clinicalScore
        }}</span>
        <span class="score-label">{{
          isComplete ? severity.tag : "請選年齡"
        }}</span>
      </div>
    </div>

    <!-- Severity bar: range -1 to 5, offset by 1 for display -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{
            width:
              Math.max(0, Math.min(((totalScore + 1) / 6) * 100, 100)) + '%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span>−1</span>
        <span>0</span>
        <span class="tick-threshold">2</span>
        <span>3</span>
        <span>4–5</span>
      </div>
    </div>

    <!-- GAS probability strip -->
    <div class="prob-strip">
      <div
        class="prob-pill"
        :class="{ 'prob-active': isComplete && totalScore <= 1 }"
      >
        <span class="prob-score">≤ 1 分</span>
        <span class="prob-rate normal-prob">GAS 1–10%</span>
        <span class="prob-tag">無需抗生素</span>
      </div>
      <div
        class="prob-pill"
        :class="{ 'prob-active': isComplete && totalScore === 2 }"
      >
        <span class="prob-score">2 分</span>
        <span class="prob-rate mild-prob">GAS 11–17%</span>
        <span class="prob-tag">建議 RADT</span>
      </div>
      <div
        class="prob-pill"
        :class="{ 'prob-active': isComplete && totalScore === 3 }"
      >
        <span class="prob-score">3 分</span>
        <span class="prob-rate moderate-prob">GAS 28–35%</span>
        <span class="prob-tag">培養 / 治療</span>
      </div>
      <div
        class="prob-pill"
        :class="{ 'prob-active': isComplete && totalScore >= 4 }"
      >
        <span class="prob-score">4–5 分</span>
        <span class="prob-rate severe-prob">GAS 51–53%</span>
        <span class="prob-tag">積極治療</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請評估以下 4 項臨床指標並選擇患者年齡。每項臨床指標符合計
        <strong>+1 分</strong>，年齡依組別加減分，總分 −1 至 +5 分，用於預測 A
        群鏈球菌（GAS）感染機率。</span
      >
    </div>

    <!-- Clinical criteria -->
    <div class="section-title">臨床指標（4 項）</div>
    <div class="criteria-list">
      <div
        v-for="c in criteria"
        :key="c.key"
        class="criteria-card"
        :class="{ selected: selections[c.key] }"
        @click="toggleCriteria(c.key)"
      >
        <div class="criteria-content">
          <div class="criteria-name">{{ c.name }}</div>
          <div class="criteria-sub">{{ c.sub }}</div>
          <div class="criteria-desc">{{ c.desc }}</div>
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

    <!-- Age modifier -->
    <div class="section-title">年齡調整（McIsaac 修正）</div>
    <div class="age-grid">
      <div
        v-for="age in ageCriteria"
        :key="age.key"
        class="age-card"
        :class="{
          'age-selected': selectedAge === age.key,
          'age-positive': selectedAge === age.key && age.points > 0,
          'age-negative': selectedAge === age.key && age.points < 0,
        }"
        @click="selectAge(age.key)"
      >
        <span class="age-label">{{ age.label }}</span>
        <span class="age-sub">{{ age.sub }}</span>
        <span
          class="age-pts"
          :class="{
            'pts-positive': age.points > 0,
            'pts-zero': age.points === 0,
            'pts-negative': age.points < 0,
          }"
        >
          {{ age.points > 0 ? "+" : "" }}{{ age.points }}
        </span>
        <div class="age-radio">
          <div
            class="radio-circle"
            :class="{ checked: selectedAge === age.key }"
          >
            <span v-if="selectedAge === age.key" class="radio-dot" />
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="centor-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">分</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ severity.level }}</span>
          <span class="result-prob" v-if="isComplete"
            >GAS 機率：{{ severity.probability }}</span
          >
        </div>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-management" v-if="severity.management">{{
          severity.management
        }}</span>
      </div>
    </div>

    <!-- Score breakdown -->
    <div class="score-breakdown">
      <div class="breakdown-row">
        <span class="bd-label">臨床分數</span>
        <span class="bd-val">{{ clinicalScore }}</span>
      </div>
      <div class="breakdown-row">
        <span class="bd-label">年齡調整</span>
        <span
          class="bd-val"
          :class="{ 'bd-neg': agePoints !== null && agePoints < 0 }"
        >
          {{
            agePoints !== null ? (agePoints >= 0 ? "+" : "") + agePoints : "—"
          }}
        </span>
      </div>
      <div class="breakdown-row total-bd">
        <span class="bd-label">Centor 總分</span>
        <span class="bd-val brand">{{ isComplete ? totalScore : "—" }}</span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="c in criteria" :key="c.key" class="detail-row">
        <span class="detail-domain">{{ c.name }}</span>
        <span class="detail-score" :class="{ positive: selections[c.key] }">
          {{ selections[c.key] ? "+1" : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[c.key] ? "符合" : "不符合"
        }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain"
          >年齡（{{
            ageCriteria.find((a) => a.key === selectedAge)?.label ?? "未選擇"
          }}）</span
        >
        <span
          class="detail-score"
          :class="{
            positive: agePoints !== null && agePoints > 0,
            negative: agePoints !== null && agePoints < 0,
          }"
        >
          {{
            agePoints !== null ? (agePoints >= 0 ? "+" : "") + agePoints : "—"
          }}
        </span>
        <span class="detail-desc">年齡調整</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-domain">Centor 總分</span>
        <span class="detail-score positive">{{
          isComplete ? totalScore : "—"
        }}</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="centor-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      請選擇年齡以完成評估並啟用複製功能
    </p>
  </div>
</template>

<style scoped>
.centor {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.centor-header {
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
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
  white-space: nowrap;
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

/* ── Probability strip ─────────────────────────────────────────── */
.prob-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.prob-pill {
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
.prob-pill.prob-active {
  border-color: var(--vp-c-brand-1);
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-soft),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.08);
}
.prob-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.prob-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.prob-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}

.normal-prob {
  color: #22c55e;
}
.mild-prob {
  color: #f59e0b;
}
.moderate-prob {
  color: #f97316;
}
.severe-prob {
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
  margin-bottom: 1.25rem;
  line-height: 1.6;
}
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Section title ─────────────────────────────────────────────── */
.section-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.07em;
  margin-bottom: 0.5rem;
  padding-left: 2px;
}

/* ── Criteria cards ────────────────────────────────────────────── */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.criteria-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s,
    box-shadow 0.2s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.criteria-card:hover {
  background: var(--vp-c-bg-mute);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.criteria-card.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.criteria-content {
  flex: 1;
}
.criteria-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.criteria-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-bottom: 4px;
}
.criteria-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 3px;
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

/* ── Age grid ──────────────────────────────────────────────────── */
.age-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.age-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 0.85rem 0.5rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  text-align: center;
  user-select: none;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.age-card:hover {
  background: var(--vp-c-bg-mute);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.age-selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.age-positive {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.age-negative {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.age-label {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.age-sub {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.age-pts {
  font-size: 1.2rem;
  font-weight: 800;
  line-height: 1;
  margin: 4px 0 2px;
}
.pts-positive {
  color: #22c55e;
}
.pts-zero {
  color: var(--vp-c-text-3);
}
.pts-negative {
  color: #f97316;
}

.age-radio {
  position: absolute;
  top: 8px;
  right: 8px;
}
.radio-circle {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.radio-circle.checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.radio-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff;
}

/* ── Result card ───────────────────────────────────────────────── */
.centor-result {
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
  height: 140px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.centor-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.centor-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.centor-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.centor-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.centor-result.filling {
  border-color: var(--vp-c-divider);
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
.centor-result.normal .result-number {
  color: #22c55e;
}
.centor-result.mild .result-number {
  color: #f59e0b;
}
.centor-result.moderate .result-number {
  color: #f97316;
}
.centor-result.severe .result-number {
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
.result-prob {
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
  line-height: 1.55;
}

/* ── Score breakdown ───────────────────────────────────────────── */
.score-breakdown {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.breakdown-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
}
.breakdown-row:last-child {
  border-bottom: none;
}
.total-bd {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.bd-label {
  color: var(--vp-c-text-2);
  font-weight: 600;
}
.bd-val {
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.bd-val.brand {
  color: var(--vp-c-brand-1);
}
.bd-val.bd-neg {
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
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
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
.detail-score.negative {
  color: #f97316;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.centor-actions {
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

.progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .centor-header {
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
  .prob-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .centor-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
