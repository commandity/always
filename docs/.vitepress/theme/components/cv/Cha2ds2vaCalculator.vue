<script setup lang="ts">
import { ref, computed } from "vue";

// ── CHA₂DS₂-VA Items ──────────────────────────────────────────────
// Updated 2024 ESC Guidelines — removed sex (female) as independent
// risk factor; now CHA₂DS₂-VA (not VASc)
// C = CHF, H = Hypertension, A₂ = Age ≥ 75, D = Diabetes,
// S₂ = Stroke/TIA, V = Vascular disease, A = Age 65–74
const criteria = [
  {
    key: "chf",
    letter: "C",
    name: "充血性心臟衰竭",
    sub: "Congestive Heart Failure",
    desc: "近期有心衰竭症狀，或左心室收縮功能減退（EF ≤ 40%）的客觀證據",
    hint: "包含心臟超音波確認的收縮性或舒張性心衰竭",
    points: 1,
    badge: "+1",
    color: "c-item",
  },
  {
    key: "hypertension",
    letter: "H",
    name: "高血壓",
    sub: "Hypertension",
    desc: "靜息血壓 > 140/90 mmHg（至少兩次測量），或目前正在接受降壓藥物治療",
    hint: "包含控制良好的高血壓（正在服藥）",
    points: 1,
    badge: "+1",
    color: "h-item",
  },
  {
    key: "age75",
    letter: "A₂",
    name: "年齡 ≥ 75 歲",
    sub: "Age ≥ 75 years",
    desc: "患者年齡達 75 歲或以上（高齡為最強的中風危險因子之一）",
    hint: "注意：此項計 2 分（A₂），與 65–74 歲分開計算",
    points: 2,
    badge: "+2",
    color: "a2-item",
  },
  {
    key: "diabetes",
    letter: "D",
    name: "糖尿病",
    sub: "Diabetes Mellitus",
    desc: "空腹血糖 > 125 mg/dL（7 mmol/L），或目前正在接受口服降糖藥 / 胰島素治療",
    hint: "糖尿病前期不計分",
    points: 1,
    badge: "+1",
    color: "d-item",
  },
  {
    key: "stroke",
    letter: "S₂",
    name: "中風 / TIA / 血栓栓塞病史",
    sub: "Stroke / TIA / Thromboembolism History",
    desc: "曾有缺血性中風、短暫性腦缺血發作（TIA）或周邊動脈栓塞病史",
    hint: "此項計 2 分（S₂），為最重要的中風風險預測因子",
    points: 2,
    badge: "+2",
    color: "s2-item",
  },
  {
    key: "vascular",
    letter: "V",
    name: "血管疾病",
    sub: "Vascular Disease",
    desc: "確診冠狀動脈疾病（CAD）、周邊動脈疾病（PAD）、主動脈斑塊，或過去有心肌梗塞病史",
    hint: "僅動脈粥樣硬化相關疾病；單純靜脈血栓不計",
    points: 1,
    badge: "+1",
    color: "v-item",
  },
  {
    key: "age65",
    letter: "A",
    name: "年齡 65–74 歲",
    sub: "Age 65–74 years",
    desc: "患者年齡介於 65 至 74 歲（若年齡 ≥ 75 歲，請勾選上方 A₂ 項目，不重複計分）",
    hint: "65–74 歲計 +1，75 歲以上計 +2（A₂），兩者不重複",
    points: 1,
    badge: "+1",
    color: "a-item",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, boolean>>(
  Object.fromEntries(criteria.map((c) => [c.key, false])),
);
const showResults = ref(false);
const copied = ref(false);

// Mutual exclusion: age groups
function toggle(key: string) {
  if (key === "age75" && !selections.value["age75"]) {
    selections.value["age65"] = false;
  }
  if (key === "age65" && !selections.value["age65"]) {
    selections.value["age75"] = false;
  }
  selections.value[key] = !selections.value[key];
}

// ── Computed ──────────────────────────────────────────────────────
const totalScore = computed(() =>
  criteria.reduce(
    (sum, c) => sum + (selections.value[c.key] ? c.points : 0),
    0,
  ),
);

// 2024 ESC Guidelines annual stroke risk estimates (CHA₂DS₂-VA)
const strokeRisk = computed(() => {
  const riskTable: Record<number, string> = {
    0: "0%",
    1: "0.7%",
    2: "1.6%",
    3: "3.2%",
    4: "5.7%",
    5: "9.4%",
    6: "13.6%",
    7: "17.4%",
    8: "21.5%",
    9: "22.4%",
  };
  const s = Math.min(totalScore.value, 9);
  return riskTable[s] ?? "> 22%";
});

const severity = computed(() => {
  const s = totalScore.value;
  if (s === 0)
    return {
      level: "低風險",
      color: "normal",
      advice: "不建議常規抗凝血治療",
      management: "定期追蹤，每年重新評估 CHA₂DS₂-VA 分數",
      tag: "無需抗凝",
      anticoag: false,
    };
  if (s === 1)
    return {
      level: "低至中風險",
      color: "mild",
      advice: "個別化評估，考慮抗凝血治療",
      management:
        "依患者出血風險（HAS-BLED）、偏好及合併症決定是否開始抗凝治療",
      tag: "考慮抗凝",
      anticoag: null,
    };
  return {
    level: "中至高風險",
    color: s <= 3 ? "moderate" : "severe",
    advice: "建議口服抗凝血藥物（OAC）治療",
    management:
      "優先使用非維他命 K 口服抗凝藥（NOAC：Apixaban、Rivaroxaban、Dabigatran、Edoxaban），除非有 NOAC 禁忌才使用 Warfarin",
    tag: "建議抗凝",
    anticoag: true,
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
        `- **${c.letter} — ${c.name}**（${c.sub}）：${selections.value[c.key] ? `是（${c.badge}）` : `否（0）`}`,
    )
    .join("\n");

  return `# CHA₂DS₂-VA 心房顫動中風風險評估結果

## 評估日期：${date}

## 評估項目

${lines}

---

- **CHA₂DS₂-VA 總分**：${totalScore.value} 分
- **預估年中風風險**：${strokeRisk.value}
- **風險等級**：${sv.level}
- **抗凝血建議**：${sv.advice}
- **治療建議**：${sv.management}

> 依據 2024 ESC 心房顫動指引`;
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
</script>

<template>
  <div class="cha">
    <!-- Header -->
    <div class="cha-header">
      <div class="header-title">
        <h2 class="title">CHA₂DS₂-VA 評分</h2>
        <p class="subtitle">
          Atrial Fibrillation Stroke Risk · 心房顫動中風風險評估（2024 ESC
          指引）
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar — max meaningful is 9 -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 9) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-threshold">1</span>
        <span>2</span>
        <span>4</span>
        <span>6</span>
        <span>9</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div class="risk-pill" :class="{ 'risk-active': totalScore === 0 }">
        <span class="risk-score">0 分</span>
        <span class="risk-rate normal-risk">年中風率：0%</span>
        <span class="risk-tag">無需抗凝</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': totalScore === 1 }">
        <span class="risk-score">1 分</span>
        <span class="risk-rate mild-risk">年中風率：0.7%</span>
        <span class="risk-tag">考慮抗凝</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': totalScore >= 2 && totalScore <= 4 }"
      >
        <span class="risk-score">2–4 分</span>
        <span class="risk-rate moderate-risk">年中風率：1.6–5.7%</span>
        <span class="risk-tag">建議抗凝</span>
      </div>
      <div class="risk-pill" :class="{ 'risk-active': totalScore >= 5 }">
        <span class="risk-score">≥ 5 分</span>
        <span class="risk-rate severe-risk">年中風率：> 9%</span>
        <span class="risk-tag">積極抗凝</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請評估患者的以下臨床因子。<strong>A₂</strong>（≥ 75 歲）與
        <strong>S₂</strong>（中風史）各計 <strong>2 分</strong>，其餘各計
        <strong>1 分</strong>，總分最高 <strong>9 分</strong>。年齡分組 A₂ 與 A
        不重複計分，請擇一勾選。</span
      >
    </div>

    <!-- ── Criteria group ──────────────────────────────────────── -->
    <div class="cha-group">
      <div class="group-header-bar criteria-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">CHA₂DS₂-VA 評估因子</span>
        <span class="group-sub-text">點擊勾選符合項目</span>
        <span
          class="group-score-tally"
          :class="
            totalScore === 0
              ? 'tally-ok'
              : totalScore >= 5
                ? 'tally-abn'
                : 'tally-mid'
          "
        >
          {{ totalScore }} / 9
        </span>
      </div>
      <div class="criteria-list">
        <div
          v-for="c in criteria"
          :key="c.key"
          class="criteria-card"
          :class="{
            selected: selections[c.key],
            [c.color]: true,
            'age-conflict':
              (c.key === 'age65' && selections['age75']) ||
              (c.key === 'age75' && selections['age65']),
          }"
          @click="toggle(c.key)"
        >
          <!-- Left: letter badge -->
          <div class="criteria-badge" :class="c.color + '-badge'">
            <span class="badge-letter">{{ c.letter }}</span>
            <span
              class="badge-pts"
              :class="c.points === 2 ? 'pts-two' : 'pts-one'"
              >{{ c.badge }}</span
            >
          </div>

          <!-- Middle: content -->
          <div class="criteria-content">
            <div class="criteria-name">{{ c.name }}</div>
            <div class="criteria-sub">{{ c.sub }}</div>
            <div class="criteria-desc">{{ c.desc }}</div>
            <div class="criteria-hint">{{ c.hint }}</div>
          </div>

          <!-- Right: toggle -->
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
            <span
              class="toggle-score"
              :class="{ 'score-on': selections[c.key] }"
            >
              {{ selections[c.key] ? c.badge : "0" }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="cha-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 9</span>
      </div>
      <div class="result-right">
        <div class="result-top">
          <span class="result-level">{{ severity.level }}</span>
          <span class="result-risk">年中風率：{{ strokeRisk }}</span>
        </div>
        <span class="result-advice">{{ severity.advice }}</span>
        <span class="result-management">{{ severity.management }}</span>
      </div>
    </div>

    <!-- Anticoag recommendation bar -->
    <div
      class="anticoag-bar"
      :class="{
        'ac-yes': severity.anticoag === true,
        'ac-maybe': severity.anticoag === null,
        'ac-no': severity.anticoag === false,
      }"
    >
      <span class="ac-icon">
        {{
          severity.anticoag === true
            ? "✓"
            : severity.anticoag === null
              ? "△"
              : "○"
        }}
      </span>
      <div class="ac-text">
        <strong>抗凝血治療建議（2024 ESC）：</strong>
        <span v-if="severity.anticoag === true">
          CHA₂DS₂-VA ≥ 2，<strong>建議使用口服抗凝藥（OAC）</strong>。優先選用
          NOAC（Apixaban、Rivaroxaban、Dabigatran 或 Edoxaban）。
        </span>
        <span v-else-if="severity.anticoag === null">
          CHA₂DS₂-VA =
          1，需<strong>個別化評估</strong>出血風險（HAS-BLED）、患者偏好及合併症後決定。
        </span>
        <span v-else>
          CHA₂DS₂-VA =
          0，<strong>通常不建議常規抗凝治療</strong>，定期追蹤並每年重新評估。
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="c in criteria" :key="c.key" class="detail-row">
        <span class="detail-letter" :class="c.color + '-letter'">{{
          c.letter
        }}</span>
        <span class="detail-domain">{{ c.name }}</span>
        <span class="detail-score" :class="{ positive: selections[c.key] }">
          {{ selections[c.key] ? c.badge : "0" }}
        </span>
        <span class="detail-desc">{{
          selections[c.key] ? "符合" : "不符合"
        }}</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-letter brand-ltr">∑</span>
        <span class="detail-domain">CHA₂DS₂-VA 總分</span>
        <span class="detail-score positive">{{ totalScore }}</span>
        <span class="detail-desc">{{ strokeRisk }} / 年</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="cha-actions">
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
.cha {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.cha-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
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
  overflow-wrap: break-word;
  word-break: break-word;
}

.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 110px;
  flex-shrink: 0;
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
  font-size: 0.68rem;
  font-weight: 700;
  margin-top: 2px;
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
.mild-risk {
  color: #f59e0b;
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

/* ── Group header ─────────────────────────────────────────────────── */
.cha-group {
  margin-bottom: 1.25rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
  margin-bottom: 0.6rem;
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
}
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}

/* ── Criteria cards ────────────────────────────────────────────── */
.criteria-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.criteria-card {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.criteria-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.criteria-card.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.criteria-card.age-conflict {
  opacity: 0.45;
  pointer-events: none;
}

/* Colour accents per criterion */
.c-item.selected {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.07);
}
.h-item.selected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.a2-item.selected {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.07);
}
.d-item.selected {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.s2-item.selected {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.09);
}
.v-item.selected {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.a-item.selected {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.07);
}

/* Badge */
.criteria-badge {
  flex-shrink: 0;
  width: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 4px;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.2s;
  margin-top: 1px;
}
.badge-letter {
  font-size: 0.82rem;
  font-weight: 900;
  color: var(--vp-c-text-2);
  letter-spacing: -0.02em;
}
.badge-pts {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.pts-two {
  color: #ef4444 !important;
}
.pts-one {
  color: var(--vp-c-brand-1);
}

/* Active badge colours */
.c-item-badge {
} /* handled by selected above */
.selected .criteria-badge {
  border-color: var(--vp-c-brand-1);
}
.c-item.selected .criteria-badge {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.h-item.selected .criteria-badge {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.a2-item.selected .criteria-badge {
  border-color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}
.d-item.selected .criteria-badge {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.s2-item.selected .criteria-badge {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.14);
}
.v-item.selected .criteria-badge {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.a-item.selected .criteria-badge {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}

.criteria-content {
  flex: 1;
  min-width: 0;
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

/* ── Result card ───────────────────────────────────────────────── */
.cha-result {
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
.cha-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cha-result.severe {
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
.cha-result.normal .result-number {
  color: #22c55e;
}
.cha-result.mild .result-number {
  color: #f59e0b;
}
.cha-result.moderate .result-number {
  color: #f97316;
}
.cha-result.severe .result-number {
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
.result-risk {
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

/* ── Anticoag bar ──────────────────────────────────────────────── */
.anticoag-bar {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.ac-yes {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}
.ac-maybe {
  border-color: rgba(245, 158, 11, 0.4);
  background: rgba(245, 158, 11, 0.05);
}
.ac-no {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
.ac-icon {
  font-size: 1.1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.ac-yes .ac-icon {
  color: #ef4444;
}
.ac-maybe .ac-icon {
  color: #f59e0b;
}
.ac-no .ac-icon {
  color: #22c55e;
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

.detail-letter {
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 28px;
  color: var(--vp-c-text-3);
}
.brand-ltr {
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
  width: 60px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.cha-actions {
  display: flex;
  gap: 8px;
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active {
  transform: translateY(0);
}
.btn-view:disabled {
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

@media (max-width: 640px) {
  .cha-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .cha-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
