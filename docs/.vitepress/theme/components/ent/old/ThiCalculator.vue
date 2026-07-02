<script setup lang="ts">
import { ref, computed } from "vue";

// ── THI Questions ─────────────────────────────────────────────────
// Newman 1996 — 25 items, 3 domains (F/E/C), scored Yes(4)/Sometimes(2)/No(0)
const questions = [
  {
    key: "f1",
    domain: "F",
    name: "因為耳鳴，您在集中注意力上有困難嗎？",
    sub: "Because of your tinnitus, is it difficult for you to concentrate?",
    hint: "耳鳴聲是否干擾您的專注與思考能力",
  },
  {
    key: "f2",
    domain: "F",
    name: "耳鳴的聲音是否使您難以聽清楚別人說話？",
    sub: "Does the loudness of your tinnitus make it difficult for you to hear people?",
    hint: "耳鳴對語音辨識與溝通的干擾",
  },
  {
    key: "e3",
    domain: "E",
    name: "耳鳴是否讓您感到憤怒？",
    sub: "Does your tinnitus make you angry?",
    hint: "耳鳴引起的情緒反應——憤怒與煩躁感",
  },
  {
    key: "f4",
    domain: "F",
    name: "耳鳴是否讓您感到困惑？",
    sub: "Does your tinnitus make you feel confused?",
    hint: "耳鳴對認知清晰度的影響",
  },
  {
    key: "c5",
    domain: "C",
    name: "因為耳鳴，您是否感到絕望？",
    sub: "Because of your tinnitus, do you feel desperate?",
    hint: "對耳鳴無法改善的無望感",
  },
  {
    key: "e6",
    domain: "E",
    name: "您是否常抱怨耳鳴？",
    sub: "Do you complain a great deal about your tinnitus?",
    hint: "耳鳴對日常情緒表達的影響",
  },
  {
    key: "f7",
    domain: "F",
    name: "因為耳鳴，您在夜間入睡上有困難嗎？",
    sub: "Because of your tinnitus, do you have trouble falling asleep at night?",
    hint: "耳鳴對睡眠入眠的干擾",
  },
  {
    key: "c8",
    domain: "C",
    name: "您是否感到無法擺脫耳鳴？",
    sub: "Do you feel as though you cannot escape your tinnitus?",
    hint: "對耳鳴的無力感與逃脫感",
  },
  {
    key: "f9",
    domain: "F",
    name: "耳鳴是否影響您享受社交活動（如外出聚餐或活動）？",
    sub: "Does your tinnitus interfere with your ability to enjoy social activities?",
    hint: "耳鳴對社交參與的影響",
  },
  {
    key: "e10",
    domain: "E",
    name: "因為耳鳴，您是否感到沮喪？",
    sub: "Because of your tinnitus, do you feel frustrated?",
    hint: "耳鳴帶來的挫折與沮喪情緒",
  },
  {
    key: "c11",
    domain: "C",
    name: "因為耳鳴，您是否認為自己患有嚴重疾病？",
    sub: "Because of your tinnitus, do you feel that you have a terrible disease?",
    hint: "對耳鳴的災難化認知（Catastrophizing）",
  },
  {
    key: "f12",
    domain: "F",
    name: "耳鳴是否使您享受生活的樂趣變得困難？",
    sub: "Does your tinnitus make it difficult for you to enjoy life?",
    hint: "耳鳴對整體生活品質與享樂能力的影響",
  },
  {
    key: "f13",
    domain: "F",
    name: "耳鳴是否影響您的工作或家務表現？",
    sub: "Does your tinnitus interfere with your job or household duties?",
    hint: "耳鳴對職業功能與家庭責任的干擾",
  },
  {
    key: "e14",
    domain: "E",
    name: "因為耳鳴，您是否常常感到煩躁？",
    sub: "Because of your tinnitus, do you find that you are often irritable?",
    hint: "耳鳴引起的持續性煩躁情緒",
  },
  {
    key: "f15",
    domain: "F",
    name: "因為耳鳴，您在閱讀上是否有困難？",
    sub: "Because of your tinnitus, is it difficult for you to read?",
    hint: "耳鳴對閱讀專注力的干擾",
  },
  {
    key: "e16",
    domain: "E",
    name: "耳鳴是否讓您感到心情低落？",
    sub: "Does your tinnitus make you upset?",
    hint: "耳鳴引起的情緒低落與不悅感",
  },
  {
    key: "e17",
    domain: "E",
    name: "您是否覺得耳鳴給您的家庭關係或夫妻關係帶來了壓力？",
    sub: "Do you feel that your tinnitus problem has placed stress on your relationships with members of your family and friends?",
    hint: "耳鳴對家庭關係與人際互動的影響",
  },
  {
    key: "f18",
    domain: "F",
    name: "您是否難以將注意力從耳鳴轉移到其他事物上？",
    sub: "Do you find it difficult to focus your attention away from your tinnitus and on to other things?",
    hint: "注意力控制困難——無法忽視耳鳴",
  },
  {
    key: "c19",
    domain: "C",
    name: "您是否感到無法控制耳鳴？",
    sub: "Do you feel that you have no control over your tinnitus?",
    hint: "對耳鳴的控制感喪失",
  },
  {
    key: "f20",
    domain: "F",
    name: "因為耳鳴，您是否常感到疲勞？",
    sub: "Because of your tinnitus, do you often feel tired?",
    hint: "耳鳴導致的認知疲勞與身體疲憊感",
  },
  {
    key: "e21",
    domain: "E",
    name: "因為耳鳴，您是否感到憂鬱？",
    sub: "Because of your tinnitus, do you feel depressed?",
    hint: "耳鳴引起的情緒憂鬱症狀",
  },
  {
    key: "e22",
    domain: "E",
    name: "耳鳴是否使您感到焦慮？",
    sub: "Does your tinnitus make you feel anxious?",
    hint: "耳鳴引發的焦慮情緒",
  },
  {
    key: "c23",
    domain: "C",
    name: "您是否覺得無法再忍受耳鳴？",
    sub: "Do you feel that you can no longer cope with your tinnitus?",
    hint: "對耳鳴忍受能力的極限感",
  },
  {
    key: "f24",
    domain: "F",
    name: "耳鳴是否在您有壓力時加劇？",
    sub: "Does your tinnitus get worse when you are under stress?",
    hint: "壓力與耳鳴嚴重度的交互關係",
  },
  {
    key: "e25",
    domain: "E",
    name: "耳鳴是否讓您感到不安全？",
    sub: "Does your tinnitus make you feel insecure?",
    hint: "耳鳴對安全感與自信的影響",
  },
];

const domainDefs = {
  F: { name: "功能面向", sub: "Functional", color: "func", items: 11, max: 44 },
  E: { name: "情緒面向", sub: "Emotional", color: "emo", items: 9, max: 36 },
  C: {
    name: "災難化面向",
    sub: "Catastrophic",
    color: "cat",
    items: 5,
    max: 20,
  },
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

function domainScore(d: "F" | "E" | "C") {
  return questions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(selections.value[q.key], 0), 0);
}

const scoreF = computed(() => domainScore("F"));
const scoreE = computed(() => domainScore("E"));
const scoreC = computed(() => domainScore("C"));
const totalScore = computed(() => scoreF.value + scoreE.value + scoreC.value);

// Newman 1996 grading
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
      level: "輕微障礙（一級）",
      color: "normal",
      advice: "THI ≤ 16，耳鳴對生活影響輕微，建議衛教及聽覺追蹤",
    };
  if (s <= 36)
    return {
      level: "輕度障礙（二級）",
      color: "mild",
      advice: "THI 18–36，輕度障礙，建議就醫評估並考慮聲音治療",
    };
  if (s <= 56)
    return {
      level: "中度障礙（三級）",
      color: "moderate",
      advice: "THI 38–56，中度障礙，建議聲音治療合併諮商",
    };
  if (s <= 76)
    return {
      level: "重度障礙（四級）",
      color: "severe",
      advice: "THI 58–76，重度障礙，建議積極耳鳴再訓練治療（TRT）",
    };
  return {
    level: "極重度障礙（五級）",
    color: "critical",
    advice: "THI 78–100，極重度，強烈建議完整多學科評估與治療",
  };
});

// ── Functions ─────────────────────────────────────────────────────
const qIndex = (() => {
  const map: Record<string, number> = {};
  questions.forEach((q, i) => {
    map[q.key] = i + 1;
  });
  return map;
})();

function generateMarkdown() {
  const sections = (["F", "E", "C"] as const)
    .map((d) => {
      const def = domainDefs[d];
      const ds =
        d === "F" ? scoreF.value : d === "E" ? scoreE.value : scoreC.value;
      const lines = questions
        .filter((q) => q.domain === d)
        .map((q) => {
          const v = selections.value[q.key];
          const opt = scoreOptions.find((o) => o.value === v);
          return `  - **Q${qIndex[q.key]} ${q.name}**：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
        })
        .join("\n");
      return `### ${def.name}（${ds} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# THI 耳鳴障礙量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **THI 總分**：${totalScore.value} / 100\n- **功能面向（F）**：${scoreF.value} / 44\n- **情緒面向（E）**：${scoreE.value} / 36\n- **災難化面向（C）**：${scoreC.value} / 20\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n\n> 正常切截值：THI ≤ 16（Grade 1）`;
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
  <div class="thi">
    <!-- Header -->
    <div class="thi-header">
      <div class="header-title">
        <h2 class="title">THI 耳鳴障礙量表</h2>
        <p class="subtitle">
          Tinnitus Handicap Inventory · 耳鳴對日常生活影響評估
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete ? severity.level.split("（")[0] : `${answeredCount}/25`
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
        <span>36</span>
        <span>56</span>
        <span>76</span>
        <span>100</span>
      </div>
    </div>

    <!-- Domain sub-scores -->
    <div class="sub-scores">
      <div class="sub-pill func-pill">
        <span class="sub-label">功能（F）</span>
        <span class="sub-val">{{ scoreF }} / 44</span>
      </div>
      <div class="sub-pill emo-pill">
        <span class="sub-label">情緒（E）</span>
        <span class="sub-val">{{ scoreE }} / 36</span>
      </div>
      <div class="sub-pill cat-pill">
        <span class="sub-label">災難化（C）</span>
        <span class="sub-val">{{ scoreC }} / 20</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據耳鳴對您日常生活的影響作答。每題三個選項：<strong>從不（0分）、有時（2分）、總是（4分）</strong>，共
        25 題，總分 0–100 分。分數越高，耳鳴障礙程度越嚴重。</span
      >
    </div>

    <!-- Three domain groups -->
    <div
      v-for="domainKey in ['F', 'E', 'C'] as const"
      :key="domainKey"
      class="thi-group"
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
          {{ domainKey === "F" ? scoreF : domainKey === "E" ? scoreE : scoreC }}
          / {{ domainDefs[domainKey].max }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => q.domain === domainKey)"
          :key="q.key"
          class="thi-item"
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
    <div class="thi-result" :class="severity.color">
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
          <span class="breakdown-pill cat-pill-sm">C：{{ scoreC }}</span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domainKey in ['F', 'E', 'C'] as const" :key="domainKey">
        <div
          class="detail-section-title"
          :class="domainDefs[domainKey].color + '-section'"
        >
          {{ domainDefs[domainKey].name }}（{{
            domainKey === "F" ? scoreF : domainKey === "E" ? scoreE : scoreC
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
    <div class="thi-actions">
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
.thi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.thi-header {
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
.score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
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
.severity-fill.critical {
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
  color: #84cc16;
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
.cat-pill {
  border-color: rgba(239, 68, 68, 0.3);
}
.cat-pill .sub-val {
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
.thi-group {
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
.group-header.cat-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent);
  border-left: 4px solid #ef4444;
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
.group-score-pill.cat-pill {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.thi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.thi-item.answered.func {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.thi-item.answered.emo {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.thi-item.answered.cat {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.thi-item.high {
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
.item-qnum.cat-qnum {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
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
.domain-tag.cat-tag {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
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

/* s2 — yellow */
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

/* s4 — orange */
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
.thi-result {
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
.thi-result.normal {
  background: linear-gradient(135deg, rgba(34, 197, 54, 0.06), transparent);
  border-color: #22c55e;
}
.thi-result.mild {
  background: linear-gradient(135deg, rgba(132, 204, 22, 0.06), transparent);
  border-color: #84cc16;
}
.thi-result.moderate {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
  border-color: #f59e0b;
}
.thi-result.severe {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
  border-color: #f97316;
}
.thi-result.critical {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06), transparent);
  border-color: #ef4444;
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
.thi-result.normal .result-number {
  color: #22c55e;
}
.thi-result.mild .result-number {
  color: #84cc16;
}
.thi-result.moderate .result-number {
  color: #f59e0b;
}
.thi-result.severe .result-number {
  color: #f97316;
}
.thi-result.critical .result-number {
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
.cat-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
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
.cat-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
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
.thi-actions {
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
  .thi-header {
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
  .thi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 40px;
  }
}
</style>
