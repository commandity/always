<script setup lang="ts">
import { ref, computed } from "vue";

// ── DHI Questions ─────────────────────────────────────────────────
// Jacobson 1991 — 25 items, 3 domains (F/E/P), each scored 4/2/0
// F = Functional, E = Emotional, P = Physical
const questions = [
  {
    key: "p1",
    domain: "P",
    name: "抬頭向上看時，您的頭暈問題是否加劇？",
    sub: "Does looking up increase your problem?",
    hint: "頭部向上仰視（如取高處物品）時誘發的症狀",
  },
  {
    key: "e2",
    domain: "E",
    name: "您是否因為頭暈感到沮喪？",
    sub: "Do you feel frustrated because of your problem?",
    hint: "頭暈對情緒造成的挫折感與沮喪",
  },
  {
    key: "f3",
    domain: "F",
    name: "您是否因為頭暈而限制商務或休閒旅行？",
    sub: "Do you restrict your travel for business or recreation because of your problem?",
    hint: "頭暈是否影響出差或休閒旅遊的意願",
  },
  {
    key: "p4",
    domain: "P",
    name: "走過超市的走道時，您的頭暈問題是否加劇？",
    sub: "Do you have difficulty walking down the aisle of a supermarket?",
    hint: "在視覺複雜環境（貨架通道）行走時的不適",
  },
  {
    key: "f5",
    domain: "F",
    name: "您因頭暈而在起床或上床時有困難嗎？",
    sub: "Do you have difficulty getting into or out of bed because of your problem?",
    hint: "改變躺臥至站立姿勢時誘發的頭暈",
  },
  {
    key: "f6",
    domain: "F",
    name: "您是否因頭暈而大幅限制社交活動？",
    sub: "Do you restrict your participation in social activities because of your problem?",
    hint: "頭暈對社交聚會、外出活動的限制程度",
  },
  {
    key: "f7",
    domain: "F",
    name: "您是否因頭暈而在閱讀上有困難？",
    sub: "Do you have difficulty reading because of your problem?",
    hint: "閱讀時眼球追蹤動作引起的不適",
  },
  {
    key: "p8",
    domain: "P",
    name: "進行更費力的活動（如運動、跳舞）時，您的頭暈是否加劇？",
    sub: "Do more ambitious activities like sports, dancing, or household chores increase your problem?",
    hint: "激烈活動或家務勞動時誘發的症狀",
  },
  {
    key: "e9",
    domain: "E",
    name: "您是否害怕獨自外出？",
    sub: "Are you afraid to leave your home without having someone accompany you?",
    hint: "對獨自外出的恐懼感，擔心頭暈突然發作",
  },
  {
    key: "e10",
    domain: "E",
    name: "您是否因頭暈而在他人面前感到尷尬？",
    sub: "Have you been embarrassed in front of others because of your problem?",
    hint: "頭暈發作時在社交場合造成的難堪",
  },
  {
    key: "p11",
    domain: "P",
    name: "快速移動頭部時，您的症狀是否加劇？",
    sub: "Do quick movements of your head increase your problem?",
    hint: "頭部快速轉動（搖頭、轉頭）引起的症狀",
  },
  {
    key: "f12",
    domain: "F",
    name: "您是否因頭暈而避免在高處活動？",
    sub: "Do you avoid heights because of your problem?",
    hint: "高處活動（如爬梯、陽台）引起的不適或恐懼",
  },
  {
    key: "p13",
    domain: "P",
    name: "在床上翻身時，您的頭暈是否加劇？",
    sub: "Does turning over in bed increase your problem?",
    hint: "睡眠時翻身姿勢改變誘發的頭暈（常見於 BPPV）",
  },
  {
    key: "f14",
    domain: "F",
    name: "您是否因頭暈而使家務或庭院工作變得困難？",
    sub: "Is it difficult for you to do strenuous housework or yard work because of your problem?",
    hint: "費力的家務或戶外庭院工作時誘發的症狀",
  },
  {
    key: "e15",
    domain: "E",
    name: "您是否害怕別人認為您是酒醉或精神異常？",
    sub: "Are you afraid that people may think you are intoxicated?",
    hint: "對外界誤解的擔憂（步態不穩被誤認為醉酒）",
  },
  {
    key: "f16",
    domain: "F",
    name: "您是否因頭暈而使散步困難？",
    sub: "Is it difficult for you to go for a walk by yourself because of your problem?",
    hint: "獨自散步時對頭暈發作的顧慮與困難",
  },
  {
    key: "p17",
    domain: "P",
    name: "在人行道上走路時，您的頭暈是否加劇？",
    sub: "Does walking down a sidewalk increase your problem?",
    hint: "一般步行（包括不平整路面）時誘發的不適",
  },
  {
    key: "e18",
    domain: "E",
    name: "您是否因頭暈而難以集中注意力？",
    sub: "Is it difficult for you to concentrate because of your problem?",
    hint: "頭暈對專注力與認知功能的干擾",
  },
  {
    key: "f19",
    domain: "F",
    name: "您是否因頭暈而難以在黑暗中於室內行走？",
    sub: "Is it difficult for you to walk around your house in the dark because of your problem?",
    hint: "缺乏視覺輔助（黑暗中）時平衡困難加劇",
  },
  {
    key: "e20",
    domain: "E",
    name: "您是否害怕獨自一人在家？",
    sub: "Are you afraid to stay home alone because of your problem?",
    hint: "對獨處時頭暈發作無人協助的恐懼",
  },
  {
    key: "f21",
    domain: "F",
    name: "您是否因頭暈而感覺殘障？",
    sub: "Do you feel handicapped because of your problem?",
    hint: "頭暈對整體生活功能造成的障礙感",
  },
  {
    key: "e22",
    domain: "E",
    name: "頭暈問題是否讓您感到憂鬱？",
    sub: "Has your problem placed stress on your relationships with members of your family or friends?",
    hint: "頭暈對家庭關係與友誼造成的壓力",
  },
  {
    key: "e23",
    domain: "E",
    name: "頭暈問題是否使您感到焦慮？",
    sub: "Has your problem caused you to feel depressed?",
    hint: "頭暈引起的情緒低落與憂鬱感",
  },
  {
    key: "f24",
    domain: "F",
    name: "您是否因頭暈而影響家庭或工作職責？",
    sub: "Does your problem interfere with your job or household responsibilities?",
    hint: "頭暈對職業表現與家庭責任的干擾程度",
  },
  {
    key: "p25",
    domain: "P",
    name: "彎腰時，您的頭暈問題是否加劇？",
    sub: "Does bending over increase your problem?",
    hint: "身體前屈（如撿物）時誘發的頭暈症狀",
  },
];

const domainDefs = {
  F: { name: "功能面向", sub: "Functional", color: "func", items: 9, max: 36 },
  E: { name: "情緒面向", sub: "Emotional", color: "emo", items: 9, max: 36 },
  P: { name: "身體面向", sub: "Physical", color: "phys", items: 7, max: 28 },
};

const scoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 4, label: "4", desc: "總是" },
];

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

const isComplete = computed(() => answeredCount.value === 25);

function domainScore(d: "F" | "E" | "P") {
  return questions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(selections.value[q.key], 0), 0);
}

const scoreF = computed(() => domainScore("F"));
const scoreE = computed(() => domainScore("E"));
const scoreP = computed(() => domainScore("P"));

const totalScore = computed(() => scoreF.value + scoreE.value + scoreP.value);

// DHI: 0–100; ≤ 16 mild; 17–34 mild-moderate warning; ≥ 60 severe
const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/25 題`,
    };
  if (s <= 16)
    return {
      level: "輕微障礙",
      color: "normal",
      advice: "DHI ≤ 16，頭暈對日常生活影響輕微或無顯著障礙",
    };
  if (s <= 34)
    return {
      level: "輕至中度障礙",
      color: "mild",
      advice: "DHI 17–34，頭暈造成輕至中度障礙，建議就醫評估",
    };
  if (s <= 60)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "DHI 35–60，中度前庭功能障礙，建議積極評估及前庭復健",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "DHI > 60，嚴重頭暈障礙，強烈建議完整前庭評估及復健治療",
  };
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const sections = (["F", "E", "P"] as const)
    .map((d) => {
      const def = domainDefs[d];
      const lines = questions
        .filter((q) => q.domain === d)
        .map((q, i) => {
          const v = selections.value[q.key];
          const opt = scoreOptions.find((o) => o.value === v);
          return `  - **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
        })
        .join("\n");
      const ds =
        d === "F" ? scoreF.value : d === "E" ? scoreE.value : scoreP.value;
      return `### ${def.name}（${ds} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# DHI 頭暈障礙量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **DHI 總分**：${totalScore.value} / 100\n- **功能面向（F）**：${scoreF.value} / 36\n- **情緒面向（E）**：${scoreE.value} / 36\n- **身體面向（P）**：${scoreP.value} / 28\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n\n> 正常切截值：DHI ≤ 16`;
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

// Q-number across all questions
const qIndex = (() => {
  const map: Record<string, number> = {};
  questions.forEach((q, i) => {
    map[q.key] = i + 1;
  });
  return map;
})();
</script>

<template>
  <div class="dhi">
    <!-- Header -->
    <div class="dhi-header">
      <div class="header-title">
        <h2 class="title">DHI 頭暈障礙量表</h2>
        <p class="subtitle">
          Dizziness Handicap Inventory · 頭暈對日常生活影響評估
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level : `${answeredCount}/25`
        }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: Math.min(totalScore, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-threshold">16</span>
        <span>34</span>
        <span>60</span>
        <span>100</span>
      </div>
    </div>

    <!-- Domain sub-scores -->
    <div class="sub-scores">
      <div class="sub-pill func-pill">
        <span class="sub-label">功能（F）</span>
        <span class="sub-val">{{ scoreF }} / 36</span>
      </div>
      <div class="sub-pill emo-pill">
        <span class="sub-label">情緒（E）</span>
        <span class="sub-val">{{ scoreE }} / 36</span>
      </div>
      <div class="sub-pill phys-pill">
        <span class="sub-label">身體（P）</span>
        <span class="sub-val">{{ scoreP }} / 28</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據頭暈問題對日常生活的影響作答。每題三個選項：<strong>總是（4分）、有時（2分）、從不（0分）</strong>，共
        25 題，總分 0–100 分。<strong>DHI &gt; 16</strong>
        提示頭暈造成顯著障礙。</span
      >
    </div>

    <!-- Three domain groups -->
    <div
      v-for="domainKey in ['F', 'E', 'P'] as const"
      :key="domainKey"
      class="dhi-group"
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
          {{ domainKey === "F" ? scoreF : domainKey === "E" ? scoreE : scoreP }}
          / {{ domainDefs[domainKey].max }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => q.domain === domainKey)"
          :key="q.key"
          class="dhi-item"
          :class="{
            answered: selections[q.key] >= 0,
            high: selections[q.key] === 4,
            [domainDefs[domainKey].color]: selections[q.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span
                class="item-qnum"
                :class="domainDefs[domainKey].color + '-qnum'"
              >
                Q{{ qIndex[q.key] }}
              </span>
              <span
                class="domain-tag"
                :class="domainDefs[domainKey].color + '-tag'"
              >
                {{ domainKey }}
              </span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.name }}</span>
              <span class="item-sub">{{ q.sub }}</span>
              <span class="item-hint">{{ q.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[q.key] === 0,
                unanswered: selections[q.key] < 0,
                high: selections[q.key] === 4,
              }"
            >
              {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
            </span>
          </div>

          <!-- 3 options: 4 / 2 / 0 -->
          <div class="option-row">
            <label
              v-for="opt in scoreOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[q.key] === opt.value,
                high: opt.value === 4 && selections[q.key] === 4,
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
    <div class="dhi-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 100</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill func-pill-sm">F：{{ scoreF }}</span>
          <span class="breakdown-pill emo-pill-sm">E：{{ scoreE }}</span>
          <span class="breakdown-pill phys-pill-sm">P：{{ scoreP }}</span>
        </div>
        <span class="result-threshold" v-if="isComplete">
          {{
            totalScore > 16
              ? "⚠ DHI > 16，建議就醫評估前庭功能"
              : "✓ DHI ≤ 16，在正常範圍內"
          }}
        </span>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domainKey in ['F', 'E', 'P'] as const" :key="domainKey">
        <div
          class="detail-section-title"
          :class="domainDefs[domainKey].color + '-section'"
        >
          {{ domainDefs[domainKey].name }}（{{
            domainKey === "F" ? scoreF : domainKey === "E" ? scoreE : scoreP
          }}
          / {{ domainDefs[domainKey].max }} 分）
        </div>
        <div
          v-for="q in questions.filter((q) => q.domain === domainKey)"
          :key="q.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ qIndex[q.key] }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[q.key] === 0,
              high: selections[q.key] === 4,
              brand: selections[q.key] === 2,
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
    <div class="dhi-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/25 題，尚餘 {{ 25 - answeredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.dhi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.dhi-header {
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
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
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
}
.score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.severe {
  border-color: #f97316;
  color: #f97316;
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
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.severity-fill.filling {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
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
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
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

.func-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.func-pill .sub-val {
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
.dhi-group {
  margin-bottom: 1.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.75rem 0.55rem 1rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header.func-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
  border-left: 4px solid #6366f1;
}
.group-header.emo-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border-left: 4px solid #14b8a6;
}
.group-header.phys-header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
  border-left: 4px solid #f97316;
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
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.group-score-pill.func-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
}
.group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
}
.group-score-pill.phys-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.dhi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.dhi-item.answered.func {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.answered.emo {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.answered.phys {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.dhi-item.high {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  border-color: #ef4444 !important;
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
  gap: 4px;
}

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.item-qnum.func-qnum {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.item-qnum.emo-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.item-qnum.phys-qnum {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}

.domain-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.domain-tag.func-tag {
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
  line-height: 1.4;
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}

.item-score {
  font-size: 1rem;
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
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Option row — 3 columns ────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 0.2rem;
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

/* s0 */
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

/* s2 */
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

/* s4 */
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

.opt-pill input[type="radio"] {
  display: none;
}

.opt-num {
  font-size: 1.05rem;
  font-weight: 900;
  transition: color 0.2s;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

/* ── Result card ───────────────────────────────────────────────── */
.dhi-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: border-color 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.dhi-result.normal {
  background: linear-gradient(135deg, rgba(34, 197, 54, 0.06), transparent);
  border-color: #22c55e;
}
.dhi-result.mild {
  background: linear-gradient(135deg, rgba(132, 204, 22, 0.06), transparent);
  border-color: #84cc16;
}
.dhi-result.moderate {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
  border-color: #f59e0b;
}
.dhi-result.severe {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
  border-color: #f97316;
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
.dhi-result.normal .result-number {
  color: #22c55e;
}
.dhi-result.mild .result-number {
  color: #84cc16;
}
.dhi-result.moderate .result-number {
  color: #f59e0b;
}
.dhi-result.severe .result-number {
  color: #f97316;
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
.func-pill-sm {
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

.result-threshold {
  font-size: 0.78rem;
  font-weight: 600;
}
.dhi-result.normal .result-threshold {
  color: #22c55e;
}
.dhi-result.mild .result-threshold,
.dhi-result.moderate .result-threshold,
.dhi-result.severe .result-threshold {
  color: #f97316;
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
.func-section {
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
}
.detail-row:last-child {
  border-bottom: none;
}

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
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
  width: 52px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.dhi-actions {
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
  .dhi-header {
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
  .dhi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 40px;
  }
}
</style>
