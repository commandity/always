<script setup lang="ts">
import { ref, computed } from "vue";

// Oswestry Disability Index (ODI) Version 1
// 10 sections × 0–5 scale = max 50 points
// ODI% = (total / (5 × answered sections)) × 100
// Fairbank & Pynsent 2000

const sections = [
  {
    key: "s01",
    title: "疼痛強度",
    en: "Pain Intensity",
    options: [
      "我目前沒有疼痛",
      "疼痛非常輕微",
      "疼痛中等程度",
      "疼痛相當嚴重",
      "疼痛非常嚴重",
      "疼痛是我能想像的最糟糕程度",
    ],
  },
  {
    key: "s02",
    title: "個人照護（洗漱、穿衣等）",
    en: "Personal Care",
    options: [
      "我可以正常照顧自己而不會引起額外的疼痛",
      "我可以正常照顧自己，但這很痛",
      "自我照護是痛苦的，我動作緩慢且小心",
      "我需要一些幫助，但可以完成大部分個人照護",
      "我每天都需要幫助照顧自己",
      "我無法自己穿衣，洗漱困難，只能臥床",
    ],
  },
  {
    key: "s03",
    title: "提重物",
    en: "Lifting",
    options: [
      "我可以毫無疼痛地提起重物",
      "我可以提起重物，但會引起額外疼痛",
      "疼痛使我無法從地板上提起重物，但可以提放置在適當位置的重物",
      "疼痛使我無法提起重物，但可以提起輕至中等重量的物品",
      "我只能提起非常輕的物品",
      "我完全無法提起或攜帶任何東西",
    ],
  },
  {
    key: "s04",
    title: "步行",
    en: "Walking",
    options: [
      "疼痛不會阻止我步行任何距離",
      "疼痛使我無法步行超過 1.6 公里",
      "疼痛使我無法步行超過 0.8 公里",
      "疼痛使我無法步行超過 0.4 公里",
      "我只能用柺杖或助行器步行",
      "我大部分時間臥床，且必須爬行去廁所",
    ],
  },
  {
    key: "s05",
    title: "坐",
    en: "Sitting",
    options: [
      "我可以坐在任何椅子上，想坐多久就坐多久",
      "我只能坐在我最喜歡的椅子上，想坐多久就坐多久",
      "疼痛使我無法連續坐超過 1 小時",
      "疼痛使我無法連續坐超過 30 分鐘",
      "疼痛使我無法連續坐超過 10 分鐘",
      "疼痛使我完全無法坐下",
    ],
  },
  {
    key: "s06",
    title: "站立",
    en: "Standing",
    options: [
      "我可以毫無額外疼痛地站立，想站多久就站多久",
      "我可以站立，想站多久就站多久，但這會引起額外疼痛",
      "疼痛使我無法連續站超過 1 小時",
      "疼痛使我無法連續站超過 30 分鐘",
      "疼痛使我無法連續站超過 10 分鐘",
      "疼痛使我完全無法站立",
    ],
  },
  {
    key: "s07",
    title: "睡眠",
    en: "Sleeping",
    options: [
      "我的睡眠從不因疼痛而受干擾",
      "我的睡眠偶爾因疼痛而受干擾（少於一半時間）",
      "我的睡眠有時因疼痛而受干擾（超過一半時間）",
      "因為疼痛，我的睡眠嚴重受干擾（超過三分之二時間）",
      "因為疼痛，我的睡眠幾乎完全被干擾",
      "疼痛完全阻止我入睡",
    ],
  },
  {
    key: "s08",
    title: "性生活（如適用）",
    en: "Sex Life (if applicable)",
    options: [
      "我的性生活正常，不會引起任何額外疼痛",
      "我的性生活正常，但會引起一些額外疼痛",
      "我的性生活幾乎正常，但非常疼痛",
      "我的性生活因疼痛而嚴重受限",
      "因為疼痛，我幾乎沒有性生活",
      "疼痛使我完全沒有性生活",
    ],
  },
  {
    key: "s09",
    title: "社交生活",
    en: "Social Life",
    options: [
      "我的社交生活正常，不會引起任何額外疼痛",
      "我的社交生活正常，但會加重我的疼痛程度",
      "疼痛對我的社交生活沒有顯著影響，除了限制較費力的興趣",
      "疼痛已限制我的社交生活，我不太出門",
      "疼痛已將我的社交生活限制在家中",
      "因為疼痛，我完全沒有社交生活",
    ],
  },
  {
    key: "s10",
    title: "旅行",
    en: "Travelling",
    options: [
      "我可以毫無疼痛地到任何地方旅行",
      "我可以到任何地方旅行，但這會引起額外疼痛",
      "疼痛雖嚴重，但可以進行兩小時以上的旅行",
      "因為疼痛，旅行限制在一小時以內",
      "因為疼痛，旅行限制在必要的短途行程，最多 30 分鐘",
      "疼痛使我無法旅行，除非去看醫生/接受治療",
    ],
  },
];

const answers = ref<Record<string, number | null>>(
  Object.fromEntries(sections.map((s) => [s.key, null])),
);
const copied = ref(false);
const showResults = ref(false);

const answeredCount = computed(
  () => sections.filter((s) => answers.value[s.key] !== null).length,
);
const isComplete = computed(() => answeredCount.value === 10);

const rawTotal = computed(() =>
  sections.reduce((sum, s) => sum + (answers.value[s.key] ?? 0), 0),
);

const odiPct = computed(() => {
  if (answeredCount.value === 0) return null;
  return Math.round((rawTotal.value / (5 * answeredCount.value)) * 100);
});

const severity = computed(() => {
  const p = odiPct.value;
  if (p === null) return { label: "—", color: "filling", detail: "", mgmt: "" };
  if (p <= 20)
    return {
      label: "輕度障礙（Minimal）",
      color: "normal",
      detail: "0–20%：患者可應對大多數日常活動",
      mgmt: "建議：姿勢衛教、運動訓練、自我管理",
    };
  if (p <= 40)
    return {
      label: "中度障礙（Moderate）",
      color: "mild",
      detail: "21–40%：疼痛與功能障礙導致日常活動困難",
      mgmt: "建議：物理治療、疼痛管理、工作場所評估",
    };
  if (p <= 60)
    return {
      label: "重度障礙（Severe）",
      color: "moderate",
      detail: "41–60%：疼痛嚴重影響生活各方面，需積極治療",
      mgmt: "建議：多學科介入、詳細影像學評估、專科轉介",
    };
  if (p <= 80)
    return {
      label: "極重度障礙（Crippling）",
      color: "severe",
      detail: "61–80%：對日常生活有廣泛影響，需評估手術指徵",
      mgmt: "建議：脊椎外科評估、手術評估",
    };
  return {
    label: "臥床不起（Bed-Bound）",
    color: "severe",
    detail: "81–100%：患者臥床，需進一步評估，部分可能誇大症狀",
    mgmt: "建議：住院評估、心理評估、排除非器質性因素",
  };
});

// q-number label for detail table
function qLabel(idx: number) {
  return `S${(idx + 1).toString().padStart(2, "0")}`;
}

function generateMarkdown() {
  const lines = sections.map((s, i) => {
    const v = answers.value[s.key];
    const opt = v !== null ? s.options[v] : "未作答";
    return `  S${(i + 1).toString().padStart(2, "0")} ${s.title}：${v !== null ? v + "/5" : "—"} — ${opt}`;
  });
  return (
    `# Oswestry 失能指數（ODI）\n\n` +
    `## 各項評分\n\n${lines.join("\n")}\n\n` +
    `## 結果\n\n` +
    `- 原始分：${rawTotal.value} / ${5 * answeredCount.value}\n` +
    `- **ODI = ${odiPct.value ?? "—"}%**\n` +
    `- 障礙程度：${severity.value.label}\n` +
    `- ${severity.value.detail}\n` +
    `- ${severity.value.mgmt}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  sections.forEach((s) => (answers.value[s.key] = null));
  showResults.value = false;
}
</script>

<template>
  <div class="odi">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="odi-header">
      <div class="header-title">
        <h2 class="title">Oswestry 失能指數</h2>
        <p class="subtitle">
          Oswestry Disability Index (ODI) Version 1 · Fairbank & Pynsent 2000 ·
          10 項評估
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="sb-val">{{ odiPct ?? "—" }}</span>
        <span class="sb-pct" v-if="odiPct !== null">%</span>
        <span class="sb-label">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="odi-bar-wrap">
      <div class="odi-bar">
        <div
          class="odi-bar-fill"
          :class="severity.color"
          :style="{ width: odiPct !== null ? odiPct + '%' : '0%' }"
        />
      </div>
      <div class="odi-ticks">
        <span>0%</span>
        <span class="t-g">20%</span>
        <span class="t-y">40%</span>
        <span class="t-o">60%</span>
        <span class="t-r">80%</span>
        <span>100%</span>
      </div>
    </div>

    <!-- ── Completion counter ─────────────────────────────────── -->
    <div class="progress-row">
      <span class="pr-label">已完成：{{ answeredCount }} / 10 項</span>
      <div class="pr-bar">
        <div
          class="pr-fill"
          :style="{ width: (answeredCount / 10) * 100 + '%' }"
        />
      </div>
      <span class="pr-pct">{{ Math.round((answeredCount / 10) * 100) }}%</span>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="instruction">
      每一項目請選擇<strong>最能描述您今天狀況</strong>的選項（選 1
      個）。所有項目均可作答（S8 性生活如不適用可跳過）。
    </div>

    <!-- ── Sections ───────────────────────────────────────────── -->
    <div class="odi-sections">
      <div
        v-for="(sec, secIdx) in sections"
        :key="sec.key"
        class="odi-section"
        :class="{ 'sec-answered': answers[sec.key] !== null }"
      >
        <div class="sec-header">
          <div class="sec-title-row">
            <span class="sec-qnum">{{ qLabel(secIdx) }}</span>
            <span class="sec-title">{{ sec.title }}</span>
            <span class="sec-en">{{ sec.en }}</span>
          </div>
          <span class="sec-score" v-if="answers[sec.key] !== null">
            {{ answers[sec.key] }} / 5
          </span>
        </div>

        <div class="sec-options">
          <label
            v-for="(opt, idx) in sec.options"
            :key="idx"
            class="sec-opt"
            :class="{ 'opt-selected': answers[sec.key] === idx }"
          >
            <input
              type="radio"
              :name="sec.key"
              :value="idx"
              v-model="answers[sec.key]"
            />
            <div
              class="opt-radio"
              :class="{ selected: answers[sec.key] === idx }"
            >
              <div class="opt-dot" v-if="answers[sec.key] === idx" />
            </div>
            <div class="opt-content">
              <span class="opt-score-badge">{{ idx }}</span>
              <span class="opt-text">{{ opt }}</span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="odi-result" :class="severity.color">
      <div class="or-left">
        <span class="or-n">{{ odiPct ?? "—" }}</span>
        <span class="or-u" v-if="odiPct !== null">%</span>
      </div>
      <div class="or-right">
        <span class="or-level">{{ severity.label }}</span>
        <span class="or-detail">{{ severity.detail }}</span>
        <span class="or-mgmt">{{ severity.mgmt }}</span>
      </div>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>ODI%</span><span>障礙程度</span><span>建議</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': odiPct !== null && odiPct <= 20 }"
      >
        <span class="rt-s normal-t">0–20%</span><span>輕度</span
        ><span class="rt-sm">自我管理</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': odiPct !== null && odiPct > 20 && odiPct <= 40 }"
      >
        <span class="rt-s mild-t">21–40%</span><span>中度</span
        ><span class="rt-sm">物理治療</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': odiPct !== null && odiPct > 40 && odiPct <= 60 }"
      >
        <span class="rt-s moderate-t">41–60%</span><span>重度</span
        ><span class="rt-sm">積極介入</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': odiPct !== null && odiPct > 60 && odiPct <= 80 }"
      >
        <span class="rt-s severe-t">61–80%</span><span>極重度</span
        ><span class="rt-sm">外科評估</span>
      </div>
      <div
        class="rt-row"
        :class="{ 'rt-active': odiPct !== null && odiPct > 80 }"
      >
        <span class="rt-s severe-t">81–100%</span><span>臥床</span
        ><span class="rt-sm">住院評估</span>
      </div>
    </div>

    <!-- ── Results detail (NIHSS pattern) ────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(sec, idx) in sections" :key="sec.key" class="detail-row">
        <span class="detail-qnum">{{ qLabel(idx) }}</span>
        <span class="detail-domain">{{ sec.title }}</span>
        <span
          class="detail-score"
          :class="
            answers[sec.key] !== null && answers[sec.key]! > 0
              ? 'score-marked'
              : answers[sec.key] === 0
                ? 'score-zero'
                : 'score-empty'
          "
        >
          {{ answers[sec.key] !== null ? answers[sec.key] + " / 5" : "—" }}
        </span>
        <span class="detail-desc">
          {{
            answers[sec.key] !== null
              ? sec.options[answers[sec.key]!].slice(0, 18) +
                (sec.options[answers[sec.key]!].length > 18 ? "…" : "")
              : "未作答"
          }}
        </span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">ODI 總分</span>
        <span class="detail-score brand">{{ odiPct ?? "—" }}%</span>
        <span class="detail-desc">{{ severity.label.split("（")[0] }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="odi-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button
        class="btn-copy"
        :disabled="answeredCount === 0"
        @click="copyMarkdown"
      >
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p class="progress-hint" v-if="!isComplete">
      已完成 {{ answeredCount }} / 10 項（S8
      性生活可跳過，將以可用項目計算百分比）
    </p>
  </div>
</template>

<style scoped>
.odi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.odi-header {
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
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  align-self: flex-start;
}
.sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.sb-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: inherit;
}
.sb-label {
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;
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

/* ── Progress bar ──────────────────────────────────────────────── */
.odi-bar-wrap {
  margin-bottom: 2rem;
}
.odi-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.odi-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.odi-bar-fill.filling {
  background: var(--vp-c-divider);
}
.odi-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.odi-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.odi-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.odi-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.odi-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.t-g {
  color: #22c55e;
  font-weight: 700;
}
.t-y {
  color: #f59e0b;
  font-weight: 700;
}
.t-o {
  color: #f97316;
  font-weight: 700;
}
.t-r {
  color: #ef4444;
  font-weight: 700;
}

/* ── Completion row ────────────────────────────────────────────── */
.progress-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.pr-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  flex-shrink: 0;
}
.pr-bar {
  flex: 1;
  height: 4px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: hidden;
}
.pr-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 999px;
  transition: width 0.3s;
}
.pr-pct {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 30px;
  text-align: right;
}

/* ── Instruction ───────────────────────────────────────────────── */
.instruction {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #3b82f6;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}

/* ── Sections ──────────────────────────────────────────────────── */
.odi-sections {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.odi-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.odi-section:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.odi-section.sec-answered {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}

.sec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.5rem;
}
.sec-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  flex-wrap: wrap;
}
.sec-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
  flex-shrink: 0;
}
.sec-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.sec-en {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.sec-score {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.sec-options {
  display: flex;
  flex-direction: column;
}
.sec-opt {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}
.sec-opt:last-child {
  border-bottom: none;
}
.sec-opt:hover {
  background: var(--vp-c-bg-mute);
}
.sec-opt.opt-selected {
  background: var(--vp-c-brand-soft);
}
.sec-opt input[type="radio"] {
  display: none;
}

.opt-radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.12s;
}
.opt-radio.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}
.opt-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}

.opt-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.opt-score-badge {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0 5px;
  flex-shrink: 0;
}
.sec-opt.opt-selected .opt-score-badge {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
}
.opt-text {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.45;
}
.sec-opt.opt-selected .opt-text {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* ── Result card ───────────────────────────────────────────────── */
.odi-result {
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
.odi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.or-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.or-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.odi-result.normal .or-n {
  color: #22c55e;
}
.odi-result.mild .or-n {
  color: #f59e0b;
}
.odi-result.moderate .or-n {
  color: #f97316;
}
.odi-result.severe .or-n {
  color: #ef4444;
}
.or-u {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.or-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.or-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.or-detail {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.or-mgmt {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}

/* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.severe-t {
  color: #ef4444;
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  text-align: left;
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
  width: 36px;
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
.detail-score.score-marked {
  color: var(--vp-c-brand-1);
}
.detail-score.score-zero {
  color: #22c55e;
}
.detail-score.score-empty {
  color: var(--vp-c-text-3);
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 120px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Actions ───────────────────────────────────────────────────── */
.odi-actions {
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
  .odi-header {
    flex-direction: column;
  }
  .odi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    display: none;
  }
}
</style>
