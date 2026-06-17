<script setup lang="ts">
import { ref, computed } from "vue";

// ── VoiSS 30 items — three domains ───────────────────────────────
// Domain I = Impairment (15 items)
// Domain E = Emotional (8 items)
// Domain P = Physical symptoms (7 items)
const questions = [
  // ── Impairment (L = Limitation) ──────────────────────────────
  { key: "i1", domain: "I", name: "我的聲音變了", sub: "My voice has changed" },
  {
    key: "i2",
    domain: "I",
    name: "我的聲音時好時壞",
    sub: "My voice varies a great deal",
  },
  {
    key: "i3",
    domain: "I",
    name: "說話對我來說感覺很費力",
    sub: "Speaking is an effort",
  },
  {
    key: "i4",
    domain: "I",
    name: "在嘈雜環境中別人聽不到我說話",
    sub: "People cannot hear me in noisy places",
  },
  {
    key: "i5",
    domain: "I",
    name: "我不得不重複說一遍才能被理解",
    sub: "I have to repeat myself to be understood",
  },
  {
    key: "i6",
    domain: "I",
    name: "人們要求我重複說一遍",
    sub: "People ask me to repeat myself",
  },
  {
    key: "i7",
    domain: "I",
    name: "我避免使用電話",
    sub: "I avoid using the telephone",
  },
  {
    key: "i8",
    domain: "I",
    name: "我的聲音在一天結束時比早晨更差",
    sub: "My voice is worse at the end of the day",
  },
  {
    key: "i9",
    domain: "I",
    name: "說話時我的聲音會斷掉",
    sub: "My voice cuts out when speaking",
  },
  {
    key: "i10",
    domain: "I",
    name: "我發現大聲說話很困難",
    sub: "I find it hard to speak loudly",
  },
  {
    key: "i11",
    domain: "I",
    name: "我的聲音聽起來嘶啞",
    sub: "My voice sounds hoarse",
  },
  {
    key: "i12",
    domain: "I",
    name: "我的聲音聽起來粗糙或刺耳",
    sub: "My voice sounds rough or harsh",
  },
  {
    key: "i13",
    domain: "I",
    name: "我的聲音比以前弱",
    sub: "My voice is weaker than it used to be",
  },
  {
    key: "i14",
    domain: "I",
    name: "我的聲音在一段時間說話後就變差",
    sub: "My voice gets worse after using it for a while",
  },
  {
    key: "i15",
    domain: "I",
    name: "說話後我的聲音會疲勞",
    sub: "My voice tires after speaking",
  },
  // ── Emotional ─────────────────────────────────────────────────
  { key: "e1", domain: "E", name: "我感到沮喪", sub: "I feel depressed" },
  { key: "e2", domain: "E", name: "我感到焦慮", sub: "I feel anxious" },
  {
    key: "e3",
    domain: "E",
    name: "我的嗓音問題讓我感到不安",
    sub: "I am troubled by my voice problem",
  },
  {
    key: "e4",
    domain: "E",
    name: "我因嗓音問題感到窘迫",
    sub: "I feel embarrassed about my voice problem",
  },
  {
    key: "e5",
    domain: "E",
    name: "我對嗓音問題感到沮喪",
    sub: "I feel frustrated about my voice problem",
  },
  {
    key: "e6",
    domain: "E",
    name: "嗓音問題讓我感到無能為力",
    sub: "My voice problem makes me feel helpless",
  },
  {
    key: "e7",
    domain: "E",
    name: "我因嗓音問題減少社交活動",
    sub: "I socialise less because of my voice problem",
  },
  {
    key: "e8",
    domain: "E",
    name: "我因嗓音問題在公共場合感到不安",
    sub: "I feel self-conscious in public because of my voice",
  },
  // ── Physical symptoms ─────────────────────────────────────────
  {
    key: "p1",
    domain: "P",
    name: "我感覺喉嚨有黏液或痰",
    sub: "I have mucus or phlegm on my throat",
  },
  {
    key: "p2",
    domain: "P",
    name: "我需要清嗓子",
    sub: "I need to clear my throat",
  },
  {
    key: "p3",
    domain: "P",
    name: "說話時或說話後我的喉嚨會痛",
    sub: "I have a sore throat when speaking or after speaking",
  },
  {
    key: "p4",
    domain: "P",
    name: "說話時或說話後喉嚨有刺激感",
    sub: "I have an irritation in my throat when speaking",
  },
  {
    key: "p5",
    domain: "P",
    name: "我感覺喉嚨有異物感（如梅核氣）",
    sub: "I have a sensation of something in my throat",
  },
  {
    key: "p6",
    domain: "P",
    name: "我感覺聲音從喉嚨很深處發出",
    sub: "I feel my voice comes from deep in my throat",
  },
  {
    key: "p7",
    domain: "P",
    name: "我的喉嚨感到緊繃",
    sub: "My throat feels tight",
  },
];

const scoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 1, label: "1", desc: "幾乎不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 3, label: "3", desc: "經常" },
  { value: 4, label: "4", desc: "總是" },
];

const domainDefs = {
  I: {
    name: "功能限制",
    sub: "Impairment / Limitation",
    items: 15,
    max: 60,
    color: "impair",
  },
  E: {
    name: "情緒影響",
    sub: "Emotional Impact",
    items: 8,
    max: 32,
    color: "emo",
  },
  P: {
    name: "身體症狀",
    sub: "Physical Symptoms",
    items: 7,
    max: 28,
    color: "phys",
  },
};

// ── State ─────────────────────────────────────────────────────────
const selections = ref<Record<string, number>>(
  Object.fromEntries(questions.map((q) => [q.key, -1])),
);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => questions.filter((q) => selections.value[q.key] >= 0).length,
);
const isComplete = computed(() => answeredCount.value === 30);

function domainScore(d: "I" | "E" | "P") {
  return questions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(selections.value[q.key], 0), 0);
}

const scoreI = computed(() => domainScore("I"));
const scoreE = computed(() => domainScore("E"));
const scoreP = computed(() => domainScore("P"));

const totalScore = computed(() => scoreI.value + scoreE.value + scoreP.value);

const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/30 題`,
    };
  if (s < 15)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "嗓音症狀在正常範圍內，無顯著障礙",
    };
  if (s < 30)
    return {
      level: "輕度障礙",
      color: "mild",
      advice: "輕度嗓音症狀，建議嗓音衛教與追蹤",
    };
  if (s < 50)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "中度嗓音障礙，建議就醫評估並考慮嗓音治療",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "重度嗓音障礙，強烈建議喉科評估與積極治療",
  };
});

function generateMarkdown() {
  const sections = (["I", "E", "P"] as const)
    .map((d) => {
      const def = domainDefs[d];
      const lines = questions
        .filter((q) => q.domain === d)
        .map((q) => {
          const v = selections.value[q.key];
          const opt = scoreOptions.find((o) => o.value === v);
          return `  - ${q.name}：${v >= 0 ? `${v}（${opt?.desc}）` : "未填"}`;
        })
        .join("\n");
      return `### ${def.name}（${d === "I" ? scoreI.value : d === "E" ? scoreE.value : scoreP.value} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# VoiSS 嗓音症狀量表評估結果\n\n${sections}\n\n---\n\n## 總分：${totalScore.value} / 120（${severity.value.level}）\n- 功能限制（I）：${scoreI.value} / 60\n- 情緒影響（E）：${scoreE.value} / 32\n- 身體症狀（P）：${scoreP.value} / 28\n\n${severity.value.advice}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  questions.forEach((q) => {
    selections.value[q.key] = -1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="voiss">
    <!-- Header -->
    <div class="voiss-header">
      <div class="header-title">
        <h2 class="title">VoiSS 嗓音症狀量表</h2>
        <p class="subtitle">Voice Symptom Scale · 過去一週嗓音症狀評估</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/30`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min((totalScore / 120) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span><span>15</span><span>30</span><span>50</span
        ><span>120</span>
      </div>
    </div>

    <!-- Domain sub-scores -->
    <div class="sub-scores">
      <div class="sub-pill impair-pill">
        <span class="sub-label">功能限制（I）</span>
        <span class="sub-val">{{ scoreI }} / 60</span>
      </div>
      <div class="sub-pill emo-pill">
        <span class="sub-label">情緒影響（E）</span>
        <span class="sub-val">{{ scoreE }} / 32</span>
      </div>
      <div class="sub-pill phys-pill">
        <span class="sub-label">身體症狀（P）</span>
        <span class="sub-val">{{ scoreP }} / 28</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據<strong>過去一週</strong>嗓音問題對您的影響頻率作答。每題
        0（從不）至 4（總是），共 30 題，總分 0–120 分。</span
      >
    </div>

    <!-- Three domain groups -->
    <div
      v-for="domainKey in ['I', 'E', 'P'] as const"
      :key="domainKey"
      class="voiss-group"
    >
      <div
        class="group-header"
        :class="domainDefs[domainKey].color + '-header'"
      >
        <div class="group-label-block">
          <span class="group-label">{{ domainDefs[domainKey].name }}</span>
          <span class="group-sub"
            >{{ domainDefs[domainKey].sub }} ·
            {{ domainDefs[domainKey].items }} 題</span
          >
        </div>
        <div
          class="group-score-pill"
          :class="domainDefs[domainKey].color + '-pill'"
        >
          {{ domainKey === "I" ? scoreI : domainKey === "E" ? scoreE : scoreP }}
          / {{ domainDefs[domainKey].max }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => q.domain === domainKey)"
          :key="q.key"
          class="voiss-item"
          :class="{
            answered: selections[q.key] >= 0,
            high: selections[q.key] >= 3,
            [domainDefs[domainKey].color]: selections[q.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span
                class="item-qnum"
                :class="domainDefs[domainKey].color + '-qnum'"
                >Q{{ questions.indexOf(q) + 1 }}</span
              >
              <span
                class="domain-tag"
                :class="domainDefs[domainKey].color + '-tag'"
                >{{ domainKey }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.name }}</span>
              <span class="item-sub">{{ q.sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[q.key] === 0,
                unanswered: selections[q.key] < 0,
                high: selections[q.key] >= 3,
              }"
            >
              {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="opt in scoreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[q.key] === opt.value,
                high: opt.value >= 3 && selections[q.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="q.key"
                :value="opt.value"
                v-model="selections[q.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="voiss-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 120</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill impair-pill-sm">I：{{ scoreI }}</span>
          <span class="breakdown-pill emo-pill-sm">E：{{ scoreE }}</span>
          <span class="breakdown-pill phys-pill-sm">P：{{ scoreP }}</span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domainKey in ['I', 'E', 'P'] as const" :key="domainKey">
        <div
          class="detail-section-title"
          :class="domainDefs[domainKey].color + '-section'"
        >
          {{ domainDefs[domainKey].name }}（{{
            domainKey === "I" ? scoreI : domainKey === "E" ? scoreE : scoreP
          }}
          / {{ domainDefs[domainKey].max }} 分）
        </div>
        <div
          v-for="q in questions.filter((q) => q.domain === domainKey)"
          :key="q.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ questions.indexOf(q) + 1 }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[q.key] === 0,
              high: selections[q.key] >= 3,
              brand: selections[q.key] > 0 && selections[q.key] < 3,
            }"
          >
            {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              selections[q.key] >= 0
                ? scoreOptions.find((o) => o.value === selections[q.key])?.desc
                : "未填"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="voiss-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/30 題，尚餘 {{ 30 - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.voiss {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.voiss-header {
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
  margin-bottom: 0.75rem;
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
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #d97706);
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

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 5px 14px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.sub-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}

.impair-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.impair-pill .sub-val {
  color: #6366f1;
}
.emo-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.emo-pill .sub-val {
  color: #14b8a6;
}
.phys-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.phys-pill .sub-val {
  color: #f97316;
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
.voiss-group {
  margin-bottom: 1.75rem;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header.impair-header {
  background: linear-gradient(
    135deg,
    #eef2ff,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.emo-header {
  background: linear-gradient(
    135deg,
    #ecfdf5,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.group-header.phys-header {
  background: linear-gradient(
    135deg,
    #fff7ed,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
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
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.group-score-pill.impair-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}
.group-score-pill.phys-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.voiss-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.voiss-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.voiss-item.answered.impair {
  border-color: rgba(99, 102, 241, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(99, 102, 241, 0.03)
  );
}
.voiss-item.answered.emo {
  border-color: rgba(20, 184, 166, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(20, 184, 166, 0.03)
  );
}
.voiss-item.answered.phys {
  border-color: rgba(249, 115, 22, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.03)
  );
}
.voiss-item.high {
  border-color: rgba(239, 68, 68, 0.25) !important;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(239, 68, 68, 0.04)
  ) !important;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
}
.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
}

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.item-qnum.impair-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.item-qnum.emo-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.item-qnum.phys-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.voiss-item.high .item-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}

.domain-tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 4px;
}
.domain-tag.impair-tag {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.domain-tag.emo-tag {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.domain-tag.phys-tag {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}

.item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.item-sub {
  font-size: 0.68rem;
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
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
  padding: 0.55rem 0.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 3px;
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

/* Score-specific colors */
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

.opt-num {
  font-size: 1rem;
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
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.2;
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
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.voiss-result {
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
.voiss-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.severe {
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
.voiss-result.normal .result-number {
  color: #22c55e;
}
.voiss-result.mild .result-number {
  color: #f59e0b;
}
.voiss-result.moderate .result-number {
  color: #f97316;
}
.voiss-result.severe .result-number {
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
.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.impair-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.emo-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.phys-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
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
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
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
.impair-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.phys-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
}
.detail-row:last-child {
  border-bottom: none;
}
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #ef4444;
}
.detail-score.brand {
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
.voiss-actions {
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
  .voiss-header {
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
  .voiss-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
