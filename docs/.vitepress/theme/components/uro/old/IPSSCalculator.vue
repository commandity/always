<script setup lang="ts">
import { ref, computed } from "vue";

// ── IPSS — International Prostate Symptom Score ───────────────────
// Barry MJ et al. J Urol 1992;148:1549-1557. Public domain.
// 7 symptom questions (Q1-Q7), each scored 0-5
// + 1 quality-of-life question (Q8), scored 0-6, NOT added to IPSS
// Total IPSS: 0-35
// 0-7  = Mild    8-19 = Moderate    20-35 = Severe
// Q8 QoL: 0=Delighted → 6=Terrible

const questions = [
  {
    key: "q1",
    domain: "storage",
    shortLabel: "排尿不盡感",
    zh: "過去一個月，您是否有排尿後仍有膀胱未排空感覺？",
    en: "Incomplete emptying: Over the past month, how often have you had the sensation of not emptying your bladder completely after urinating?",
  },
  {
    key: "q2",
    domain: "storage",
    shortLabel: "頻尿",
    zh: "過去一個月，您是否在排尿後 2 小時內又需再次排尿？",
    en: "Frequency: Over the past month, how often have you had to urinate again less than two hours after you finished urinating?",
  },
  {
    key: "q3",
    domain: "voiding",
    shortLabel: "間歇性排尿",
    zh: "過去一個月，您是否有排尿時，尿流斷斷續續的情形？",
    en: "Intermittency: Over the past month, how often have you found you stopped and started again several times when urinating?",
  },
  {
    key: "q4",
    domain: "storage",
    shortLabel: "尿急感",
    zh: "過去一個月，您是否有難以延遲排尿的情形？",
    en: "Urgency: Over the past month, how difficult have you found it to postpone urination?",
  },
  {
    key: "q5",
    domain: "voiding",
    shortLabel: "尿流無力",
    zh: "過去一個月，您是否有排尿時尿流無力的情形？",
    en: "Weak stream: Over the past month, how often have you had a weak urinary stream?",
  },
  {
    key: "q6",
    domain: "voiding",
    shortLabel: "排尿費力",
    zh: "過去一個月，您是否有需要用力才能開始排尿的情形？",
    en: "Straining: Over the past month, how often have you had to push or strain to begin urination?",
  },
  {
    key: "q7",
    domain: "storage",
    shortLabel: "夜尿次數",
    zh: "過去一個月，您夜間從睡覺到早上起床，通常需要起床排尿幾次？",
    en: "Nocturia: Over the past month, how many times did you most typically get up to urinate from the time you went to bed until the time you got up in the morning?",
    isNocturia: true,
  },
];

// Frequency labels (Q1-Q6)
const freqLabels = [
  { val: 0, zh: "完全沒有", en: "Not at all" },
  { val: 1, zh: "少於 1/5 次", en: "< 1 time in 5" },
  { val: 2, zh: "少於一半次數", en: "< Half the time" },
  { val: 3, zh: "約一半次數", en: "About half the time" },
  { val: 4, zh: "超過一半次數", en: "> Half the time" },
  { val: 5, zh: "幾乎每次", en: "Almost always" },
];

// Nocturia labels (Q7)
const nocturiaLabels = [
  { val: 0, zh: "0 次（不需起床）", en: "None" },
  { val: 1, zh: "1 次", en: "1 time" },
  { val: 2, zh: "2 次", en: "2 times" },
  { val: 3, zh: "3 次", en: "3 times" },
  { val: 4, zh: "4 次", en: "4 times" },
  { val: 5, zh: "5 次以上", en: "5 or more times" },
];

// QoL labels (Q8)
const qolLabels = [
  { val: 0, zh: "非常滿意", en: "Delighted" },
  { val: 1, zh: "滿意", en: "Pleased" },
  { val: 2, zh: "大致滿意", en: "Mostly satisfied" },
  { val: 3, zh: "好壞各半", en: "Mixed" },
  { val: 4, zh: "不滿意", en: "Mostly dissatisfied" },
  { val: 5, zh: "難過", en: "Unhappy" },
  { val: 6, zh: "非常難過", en: "Terrible" },
];

const selections = ref<Record<string, number | null>>(
  Object.fromEntries(questions.map((q) => [q.key, null])),
);
const qolScore = ref<number | null>(null);
const copied = ref(false);
const showResults = ref(false);

const answeredCount = computed(
  () => questions.filter((q) => selections.value[q.key] !== null).length,
);
const isComplete = computed(() => answeredCount.value === 7);

const totalScore = computed(() =>
  isComplete.value
    ? questions.reduce((s, q) => s + (selections.value[q.key] ?? 0), 0)
    : null,
);

const storageDomain = computed(() =>
  ["q1", "q2", "q4", "q7"]
    .filter((k) => selections.value[k] !== null)
    .reduce((s, k) => s + (selections.value[k] ?? 0), 0),
);
const voidingDomain = computed(() =>
  ["q3", "q5", "q6"]
    .filter((k) => selections.value[k] !== null)
    .reduce((s, k) => s + (selections.value[k] ?? 0), 0),
);

const severity = computed(() => {
  const s = totalScore.value;
  if (s === null)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  if (s <= 7)
    return {
      level: "輕度（Mild）",
      color: "normal",
      advice:
        "IPSS 0–7：輕度下泌尿道症狀，可採觀察等待（Watchful waiting）或生活調整。",
      screen: false,
    };
  if (s <= 19)
    return {
      level: "中度（Moderate）",
      color: "moderate",
      advice:
        "IPSS 8–19：中度症狀，建議藥物治療（α 阻斷劑或 5α 還原酶抑制劑），評估影像及尿流動力學檢查。",
      screen: true,
    };
  return {
    level: "重度（Severe）",
    color: "critical",
    advice:
      "IPSS 20–35：重度症狀，建議泌尿科轉介，評估手術治療（TURP 或微創手術）指標。",
    screen: true,
  };
});

const barPct = computed(() =>
  totalScore.value !== null ? (totalScore.value / 35) * 100 : 0,
);

const qolSeverity = computed(() => {
  if (qolScore.value === null) return "";
  if (qolScore.value <= 1) return "可接受（Acceptable）";
  if (qolScore.value <= 3) return "尚可（Tolerable）";
  return "困擾（Bothersome）";
});

function generateMarkdown(): string {
  const rows = questions
    .map((q) => {
      const v = selections.value[q.key];
      return `- **Q${q.key.slice(1)}. ${q.shortLabel}**：${v !== null ? v + " 分" : "未填"}`;
    })
    .join("\n");
  return (
    `# IPSS 國際攝護腺症狀評分表\n\n` +
    `## 各題作答\n\n${rows}\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **IPSS 總分**：${totalScore.value ?? "未完成"} / 35\n` +
    `- **症狀嚴重度**：${severity.value.level}\n` +
    `- **儲尿症狀小計（Q1,Q2,Q4,Q7）**：${storageDomain.value} 分\n` +
    `- **排尿症狀小計（Q3,Q5,Q6）**：${voidingDomain.value} 分\n` +
    (qolScore.value !== null
      ? `- **生活品質評分（Q8）**：${qolScore.value} 分（${qolSeverity.value}）\n`
      : "") +
    `\n**臨床建議**：${severity.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  questions.forEach((q) => {
    selections.value[q.key] = null;
  });
  qolScore.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="ipss">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="ipss-header">
      <div class="header-title">
        <h2 class="title">IPSS 國際攝護腺症狀評分表</h2>
        <p class="subtitle">
          International Prostate Symptom Score · Barry 1992 · 7 題症狀 + 1
          題生活品質（Q8 不計入總分）
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="badge-label">IPSS</span>
        <span class="score-number">{{ totalScore ?? "—" }}</span>
        <span
          class="score-unit"
          :style="{ opacity: totalScore !== null ? 1 : 0 }"
          >/ 35</span
        >
        <span class="score-label">{{
          isComplete ? severity.level.split("（")[0] : `${answeredCount}/7 題`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ────────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs tick-yellow" style="left: 22.9%">8 ▾</span>
        <span class="tick-abs tick-red" style="left: 57.1%">20 ▾</span>
        <span class="tick-abs tick-red" style="left: 100%">35</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs" style="left: 0%">輕度</span>
        <span class="label-abs tick-yellow" style="left: 22.9%">中度</span>
        <span class="label-abs tick-red" style="left: 57.1%">重度</span>
        <span class="tick-abs tick-red" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Q1–Q7 symptom questions ────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar">
        <span class="group-icon">🔍</span>
        <span class="group-label-text">症狀評估（Q1–Q7）</span>
        <span class="group-sub-text"
          >依過去一個月的症狀頻率作答 · 每題 0–5 分</span
        >
        <span
          class="group-score-tally"
          :class="isComplete ? 'tally-scored' : 'tally-nd'"
        >
          {{ isComplete ? totalScore + " / 35" : answeredCount + "/7 題" }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="(q, idx) in questions"
          :key="q.key"
          class="ipss-item"
          :class="
            selections[q.key] !== null
              ? selections[q.key]! >= 4
                ? 'item-high'
                : selections[q.key]! >= 2
                  ? 'item-mid'
                  : 'item-low'
              : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span
                class="item-qnum"
                :class="q.domain === 'storage' ? 'q-storage' : 'q-voiding'"
                >Q{{ idx + 1 }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.zh }}</span>
              <span class="item-sub">{{ q.en }}</span>
            </div>
            <span
              class="item-val"
              :class="
                selections[q.key] !== null
                  ? selections[q.key]! >= 4
                    ? 'val-high'
                    : selections[q.key]! >= 2
                      ? 'val-mid'
                      : 'val-low'
                  : 'val-nd'
              "
            >
              {{ selections[q.key] !== null ? selections[q.key] : "—" }}
            </span>
          </div>
          <div class="option-row">
            <button
              v-for="opt in q.isNocturia ? nocturiaLabels : freqLabels"
              :key="opt.val"
              class="opt-pill"
              :class="[
                's' + opt.val,
                { active: selections[q.key] === opt.val },
              ]"
              @click="selections[q.key] = opt.val"
            >
              <span class="opt-num">{{ opt.val }}</span>
              <span class="opt-desc">{{ opt.zh }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Q8 Quality of Life ─────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar qol-bar">
        <span class="group-icon">❤️</span>
        <span class="group-label-text">生活品質評估（Q8）</span>
        <span class="group-sub-text"
          >此題不計入 IPSS 總分，但為重要的治療決策依據</span
        >
        <span
          class="group-score-tally"
          :class="qolScore !== null ? 'tally-qol' : 'tally-nd'"
        >
          {{ qolScore !== null ? qolScore + " / 6" : "—" }}
        </span>
      </div>
      <div class="ipss-item" :class="qolScore !== null ? 'item-mid' : ''">
        <div class="item-header">
          <div class="item-meta-row">
            <span class="item-qnum q-qol">Q8</span>
          </div>
          <div class="item-name-block">
            <span class="item-name"
              >如果您必須在餘生中，都保持現在的泌尿狀況，您的感受如何？</span
            >
            <span class="item-sub"
              >If you were to spend the rest of your life with your urinary
              condition just the way it is now, how would you feel about
              that?</span
            >
          </div>
          <span
            class="item-val"
            :class="
              qolScore !== null
                ? qolScore >= 4
                  ? 'val-high'
                  : qolScore >= 2
                    ? 'val-mid'
                    : 'val-low'
                : 'val-nd'
            "
          >
            {{ qolScore !== null ? qolScore : "—" }}
          </span>
        </div>
        <div class="option-row qol-row">
          <button
            v-for="opt in qolLabels"
            :key="opt.val"
            class="opt-pill"
            :class="['s' + opt.val, { active: qolScore === opt.val }]"
            @click="qolScore = opt.val"
          >
            <span class="opt-num">{{ opt.val }}</span>
            <span class="opt-desc">{{ opt.zh }}</span>
          </button>
        </div>
        <div v-if="qolScore !== null" class="qol-note">
          Q8 = {{ qolScore }} 分 → {{ qolSeverity }}
          <template v-if="qolScore >= 4"
            >（症狀明顯困擾，強烈建議積極介入治療）</template
          >
        </div>
      </div>
    </div>

    <!-- ── Sub-score summary ──────────────────────────────────── -->
    <div v-if="answeredCount > 0" class="sub-score-row">
      <div
        class="sub-score-card"
        :class="
          storageDomain >= 8
            ? 'ss-high'
            : storageDomain >= 4
              ? 'ss-mid'
              : 'ss-low'
        "
      >
        <span class="ss-label">💧 儲尿症狀</span>
        <div class="ss-score-row">
          <span class="ss-val">{{ storageDomain }}</span>
          <span class="ss-max">/ 20</span>
        </div>
        <span class="ss-note">Q1,Q2,Q4,Q7</span>
      </div>
      <div
        class="sub-score-card"
        :class="
          voidingDomain >= 6
            ? 'ss-high'
            : voidingDomain >= 3
              ? 'ss-mid'
              : 'ss-low'
        "
      >
        <span class="ss-label">🌊 排尿症狀</span>
        <div class="ss-score-row">
          <span class="ss-val">{{ voidingDomain }}</span>
          <span class="ss-max">/ 15</span>
        </div>
        <span class="ss-note">Q3,Q5,Q6</span>
      </div>
      <div class="sub-score-card ss-total" :class="severity.color">
        <span class="ss-label">總分</span>
        <div class="ss-score-row">
          <span class="ss-val">{{ totalScore ?? "—" }}</span>
          <span class="ss-max">/ 35</span>
        </div>
        <span class="ss-note">{{
          totalScore !== null ? severity.level.split("（")[0] : ""
        }}</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="ipss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore ?? "—" }}</span>
        <span class="result-max">/ 35</span>
      </div>
      <div class="result-right">
        <span class="result-ver">IPSS</span>
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(q, idx) in questions" :key="q.key" class="detail-row">
        <span class="detail-qnum">Q{{ idx + 1 }}</span>
        <span class="detail-domain">{{ q.shortLabel }}</span>
        <span
          class="detail-score"
          :class="
            (selections[q.key] ?? 0) >= 4
              ? 'ds-high'
              : (selections[q.key] ?? 0) >= 2
                ? 'ds-mid'
                : 'ds-low'
          "
          >{{ selections[q.key] }}</span
        >
        <span class="detail-desc">{{
          q.domain === "storage" ? "儲尿" : "排尿"
        }}</span>
      </div>
      <div v-if="qolScore !== null" class="detail-row">
        <span class="detail-qnum">Q8</span>
        <span class="detail-domain">生活品質（不計入總分）</span>
        <span class="detail-score ds-mid">{{ qolScore }}</span>
        <span class="detail-desc">{{ qolSeverity }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">IPSS 總分</span>
        <span class="detail-score detail-score-brand">{{ totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 35</span>
          <span class="detail-desc-label">{{ severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Alert ──────────────────────────────────────────────── -->
    <div
      v-if="isComplete && severity.screen"
      class="ipss-alert"
      :class="`alert-${severity.color}`"
    >
      <span class="alert-icon">⚠</span>
      <span
        ><strong>IPSS {{ totalScore }} 分（{{ severity.level }}）：</strong
        >{{ severity.advice }}</span
      >
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >IPSS 為症狀評估工具，不能取代泌尿科完整評估，亦不能診斷 BPH。Q8
        生活品質評分是治療決策的重要依據，即使 IPSS 分數偏低，若 Q8 ≥ 4
        仍建議積極介入。IPSS 與尿流速、殘尿量及攝護腺體積相關性有限。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="ipss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/7 題，尚餘 {{ 7 - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.ipss {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.ipss-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
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
  line-height: 1.6;
}

/* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-label {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
}
.score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
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

/* ── Severity bar ────────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.severity-bar {
  position: relative;
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
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  height: 13px;
  margin-top: 0;
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
.tick-yellow {
  color: #f97316;
  font-weight: 700;
}
.tick-red {
  color: #ef4444;
  font-weight: 700;
}

/* ── Alert ───────────────────────────────────────────────────────── */
.ipss-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}

/* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #dc2626;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.q-bar {
  border-left: 4px solid #3b82f6;
}
.qol-bar {
  border-left: 4px solid #e879f9;
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
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 60px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.tally-scored {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
.tally-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
  border-color: rgba(232, 121, 249, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── Item cards ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.ipss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ipss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.ipss-item.item-low {
  border-color: #22c55e;
}
.ipss-item.item-mid {
  border-color: #f97316;
}
.ipss-item.item-high {
  border-color: #ef4444;
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
  padding: 1px 7px;
  border-radius: 999px;
  white-space: nowrap;
}
.q-storage {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.q-voiding {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-qol {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
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
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.item-val {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
}
.val-low {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.val-mid {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}
.val-high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.val-nd {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}

/* ── Option buttons — pill grid ─────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.qol-row {
  grid-template-columns: repeat(7, 1fr);
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
  font-family: inherit;
  font-size: 0.72rem;
  font-weight: 600;
  line-height: 1.3;
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

/* s0 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active) {
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
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

/* s1 */
.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active) {
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
.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}

/* s2 */
.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active) {
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

/* s3 */
.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active) {
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

/* s4 */
.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

/* s5 */
.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s5.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s5.active .opt-num {
  color: #ef4444;
}
.opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* s6 for QoL */
.opt-pill.s6 {
  border-color: rgba(220, 38, 38, 0.15);
}
.opt-pill.s6:hover:not(.active) {
  border-color: rgba(220, 38, 38, 0.35);
  background: rgba(220, 38, 38, 0.04);
}
.opt-pill.s6.active {
  border-color: #dc2626;
  background: linear-gradient(
    180deg,
    rgba(220, 38, 38, 0.12),
    rgba(220, 38, 38, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.08);
}
.opt-pill.s6 .opt-num {
  color: rgba(220, 38, 38, 0.5);
}
.opt-pill.s6.active .opt-num {
  color: #dc2626;
}
.opt-pill.s6 .opt-desc {
  color: rgba(220, 38, 38, 0.4);
}
.opt-pill.s6.active .opt-desc {
  color: rgba(220, 38, 38, 0.7);
}

/* ── QoL note ────────────────────────────────────────────────────── */
.qol-note {
  padding: 0.4rem 0.9rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  background: rgba(232, 121, 249, 0.06);
  border-top: 1px solid var(--vp-c-divider);
}

/* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.55rem 0.6rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 80px;
  flex: 1;
  max-width: 130px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.ss-score-row {
  display: flex;
  align-items: baseline;
  gap: 3px;
}
.sub-score-card.ss-low {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.1),
    rgba(34, 197, 94, 0.03)
  );
  border-color: rgba(34, 197, 94, 0.35);
}
.sub-score-card.ss-mid {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.1),
    rgba(249, 115, 22, 0.03)
  );
  border-color: rgba(249, 115, 22, 0.35);
}
.sub-score-card.ss-high {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.1),
    rgba(239, 68, 68, 0.03)
  );
  border-color: rgba(239, 68, 68, 0.35);
}
.ss-total {
  max-width: 120px;
  min-width: 90px;
}
.sub-score-card.normal {
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.14),
    rgba(34, 197, 94, 0.04)
  );
  border-color: rgba(34, 197, 94, 0.4);
}
.sub-score-card.moderate {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.14),
    rgba(249, 115, 22, 0.04)
  );
  border-color: rgba(249, 115, 22, 0.4);
}
.sub-score-card.critical {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.14),
    rgba(239, 68, 68, 0.04)
  );
  border-color: rgba(239, 68, 68, 0.4);
}
.ss-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.ss-max {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.ss-note {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}

.sub-score-card.ss-low .ss-val {
  color: #22c55e;
}
.sub-score-card.ss-mid .ss-val {
  color: #f97316;
}
.sub-score-card.ss-high .ss-val {
  color: #ef4444;
}
.ss-total .ss-val {
  font-size: 1.8rem;
}
.sub-score-card.normal .ss-val {
  color: #22c55e;
}
.sub-score-card.moderate .ss-val {
  color: #f97316;
}
.sub-score-card.critical .ss-val {
  color: #ef4444;
}

/* ── Result card ─────────────────────────────────────────────────── */
.ipss-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  height: 130px;
  box-sizing: border-box;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ipss-result.critical {
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
.ipss-result.normal .result-number {
  color: #22c55e;
}
.ipss-result.moderate .result-number {
  color: #f97316;
}
.ipss-result.critical .result-number {
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
.result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
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

/* ── Results detail ──────────────────────────────────────────────── */
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
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.ds-low {
  color: #22c55e;
}
.ds-mid {
  color: #f97316;
}
.ds-high {
  color: #ef4444;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
  flex-shrink: 0;
}
.detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}

/* ── Warn box ────────────────────────────────────────────────────── */
.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}

/* ── Actions ─────────────────────────────────────────────────────── */
.ipss-actions {
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
  .ipss-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .ipss-result {
    flex-direction: column;
    gap: 0.75rem;
    height: auto;
  }
  .option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .sub-score-row {
    gap: 0.3rem;
  }
}
</style>
