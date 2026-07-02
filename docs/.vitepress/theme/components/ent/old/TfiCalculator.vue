<script setup lang="ts">
import { ref, computed } from "vue";

// ── TFI Questions ─────────────────────────────────────────────────
// Meikle 2012 — 25 items, 8 subscales, each scored 0–10
// Subscales: Intrusive(I) / Sense of Control(C) / Cognitive(G) /
//            Sleep(S) / Auditory(A) / Relaxation(R) / Quality of Life(Q) / Emotional(E)
const questions = [
  {
    key: "i1",
    sub: "I",
    name: "過去一週，耳鳴出現的時間有多少比例？",
    sub_en:
      "Over the past week, what percentage of your time awake were you aware of your tinnitus?",
    hint: "評估耳鳴的出現頻率（0% = 完全沒有，100% = 一直出現）",
    anchor_lo: "0% 沒有",
    anchor_hi: "100% 一直",
  },
  {
    key: "i2",
    sub: "I",
    name: "過去一週，耳鳴有多嚴重或難以忍受？",
    sub_en: "How strong or loud was your tinnitus?",
    hint: "評估耳鳴的主觀強度與難受程度",
    anchor_lo: "完全無法察覺",
    anchor_hi: "極度嚴重",
  },
  {
    key: "i3",
    sub: "I",
    name: "過去一週，您有多難以忽視耳鳴？",
    sub_en: "How easy was it to ignore your tinnitus?",
    hint: "評估您能從耳鳴中轉移注意力的困難程度（反向題）",
    anchor_lo: "極容易忽視",
    anchor_hi: "完全無法忽視",
  },
  {
    key: "c4",
    sub: "C",
    name: "過去一週，您覺得自己能控制耳鳴嗎？",
    sub_en: "Did you feel in control in regard to your tinnitus?",
    hint: "對耳鳴的自我掌控感（反向題）",
    anchor_lo: "完全能控制",
    anchor_hi: "完全無法控制",
  },
  {
    key: "c5",
    sub: "C",
    name: "過去一週，您對耳鳴感到不堪其擾而無計可施的程度？",
    sub_en: "How overwhelmed by your tinnitus did you feel?",
    hint: "被耳鳴壓倒的無力感",
    anchor_lo: "完全不覺得",
    anchor_hi: "極度不堪其擾",
  },
  {
    key: "c6",
    sub: "C",
    name: "過去一週，您有多麼努力嘗試應對耳鳴？",
    sub_en: "How much did you struggle against your tinnitus?",
    hint: "對抗耳鳴所需耗費的心力（反向題）",
    anchor_lo: "完全不需費力",
    anchor_hi: "極度努力掙扎",
  },
  {
    key: "g7",
    sub: "G",
    name: "過去一週，耳鳴使您難以集中注意力的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to concentrate?",
    hint: "耳鳴對注意力集中的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "完全無法集中",
  },
  {
    key: "g8",
    sub: "G",
    name: "過去一週，耳鳴使您思維清晰困難的程度？",
    sub_en:
      "How much difficulty did you have thinking clearly because of your tinnitus?",
    hint: "耳鳴對清晰思考的影響",
    anchor_lo: "完全沒有困難",
    anchor_hi: "極度困難",
  },
  {
    key: "g9",
    sub: "G",
    name: "過去一週，耳鳴使您無法忘記它的程度？",
    sub_en: "How hard was it to put your tinnitus out of your mind?",
    hint: "無法從心理上排除耳鳴",
    anchor_lo: "極容易忘記",
    anchor_hi: "完全無法忘記",
  },
  {
    key: "s10",
    sub: "S",
    name: "過去一週，耳鳴使您入睡困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to fall asleep?",
    hint: "耳鳴對睡眠入眠的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "s11",
    sub: "S",
    name: "過去一週，耳鳴使您夜間再次入睡困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to get back to sleep after waking up in the middle of the night?",
    hint: "耳鳴對半夜醒來後再入睡的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "s12",
    sub: "S",
    name: "過去一週，耳鳴使您睡眠時數不足的程度？",
    sub_en:
      "How much did your tinnitus contribute to difficulty getting enough sleep?",
    hint: "耳鳴對整體睡眠充足性的影響",
    anchor_lo: "完全沒影響",
    anchor_hi: "嚴重影響",
  },
  {
    key: "a13",
    sub: "A",
    name: "過去一週，耳鳴使您在嘈雜環境中聆聽困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to hear clearly in a noisy situation?",
    hint: "耳鳴加重噪音環境下的聆聽困難",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "a14",
    sub: "A",
    name: "過去一週，耳鳴使您聆聽音樂、收音機或電視困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to follow a conversation in a quiet room?",
    hint: "耳鳴對欣賞聲音媒體的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "a15",
    sub: "A",
    name: "過去一週，耳鳴使您理解別人說話困難的程度？",
    sub_en:
      "How much did your tinnitus make it difficult to understand what people were saying?",
    hint: "耳鳴對語音理解的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "r16",
    sub: "R",
    name: "過去一週，耳鳴使您放鬆困難的程度？",
    sub_en: "How much did your tinnitus interfere with your ability to relax?",
    hint: "耳鳴對放鬆休息的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "r17",
    sub: "R",
    name: "過去一週，耳鳴使您難以在安靜環境中感到舒適的程度？",
    sub_en:
      "How much did your tinnitus make it difficult to feel peaceful and calm?",
    hint: "安靜時耳鳴更顯突出，難以平靜",
    anchor_lo: "完全不困難",
    anchor_hi: "極度困難",
  },
  {
    key: "r18",
    sub: "R",
    name: "過去一週，耳鳴使您在休息或放假時無法享受寧靜的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to rest or recuperate from daily life activities?",
    hint: "耳鳴妨礙休憩與恢復精力",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q19",
    sub: "Q",
    name: "過去一週，耳鳴干擾您與家人或朋友相處的程度？",
    sub_en:
      "How much did your tinnitus interfere with your enjoyment of social activities with family and friends?",
    hint: "耳鳴對家庭與社交活動的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q20",
    sub: "Q",
    name: "過去一週，耳鳴干擾您從事嗜好或休閒活動的程度？",
    sub_en:
      "How much did your tinnitus interfere with your enjoyment of hobbies and recreational activities?",
    hint: "耳鳴對個人興趣與娛樂活動的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q21",
    sub: "Q",
    name: "過去一週，耳鳴干擾您完成工作或家庭職責的程度？",
    sub_en:
      "How much did your tinnitus interfere with your performance of occupational or home responsibilities?",
    hint: "耳鳴對職業表現與家庭責任的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "e22",
    sub: "E",
    name: "過去一週，您因耳鳴感到焦慮的程度？",
    sub_en: "How much did your tinnitus cause you to feel anxious?",
    hint: "耳鳴引起的焦慮情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度焦慮",
  },
  {
    key: "e23",
    sub: "E",
    name: "過去一週，您因耳鳴感到煩躁或沮喪的程度？",
    sub_en:
      "How much did your tinnitus cause you to feel irritated or agitated?",
    hint: "耳鳴引起的煩躁與激動情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度煩躁",
  },
  {
    key: "e24",
    sub: "E",
    name: "過去一週，您因耳鳴感到憂鬱的程度？",
    sub_en: "How much did your tinnitus cause you to feel depressed?",
    hint: "耳鳴引起的憂鬱情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度憂鬱",
  },
  {
    key: "e25",
    sub: "E",
    name: "過去一週，您覺得耳鳴對您生活的整體影響有多嚴重？",
    sub_en: "Overall, how much did your tinnitus affect your life?",
    hint: "耳鳴對整體生活品質的全面影響",
    anchor_lo: "完全沒有影響",
    anchor_hi: "極度嚴重影響",
  },
];

const subscaleDefs = {
  I: { name: "侵擾性", sub: "Intrusive", color: "intr", items: 3, max: 30 },
  C: {
    name: "控制感",
    sub: "Sense of Control",
    color: "ctrl",
    items: 3,
    max: 30,
  },
  G: { name: "認知影響", sub: "Cognitive", color: "cogn", items: 3, max: 30 },
  S: { name: "睡眠影響", sub: "Sleep", color: "slp", items: 3, max: 30 },
  A: { name: "聽覺影響", sub: "Auditory", color: "aud", items: 3, max: 30 },
  R: { name: "放鬆影響", sub: "Relaxation", color: "relx", items: 3, max: 30 },
  Q: {
    name: "生活品質",
    sub: "Quality of Life",
    color: "qol",
    items: 3,
    max: 30,
  },
  E: { name: "情緒影響", sub: "Emotional", color: "emot", items: 4, max: 40 },
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
const isComplete = computed(() => answeredCount.value === 25);

function subscaleScore(s: string) {
  return questions
    .filter((q) => q.sub === s)
    .reduce((sum, q) => sum + Math.max(selections.value[q.key], 0), 0);
}

const scores = computed(() => {
  const result: Record<string, number> = {};
  Object.keys(subscaleDefs).forEach((k) => {
    result[k] = subscaleScore(k);
  });
  return result;
});

// TFI total = mean of all items × 10 (0–100 scale)
const totalScore = computed(() => {
  if (answeredCount.value === 0) return 0;
  const sum = questions.reduce(
    (s, q) => s + Math.max(selections.value[q.key], 0),
    0,
  );
  return Math.round((sum / 25) * 10);
});

// TFI: < 25 mild; 25–50 moderate; > 50 severe (Meikle 2012)
const severity = computed(() => {
  const s = totalScore.value;
  if (!isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/25 題`,
    };
  if (s < 25)
    return {
      level: "輕微影響",
      color: "normal",
      advice: "TFI < 25，耳鳴對生活影響輕微，通常不需積極治療",
    };
  if (s < 50)
    return {
      level: "中度影響",
      color: "mild",
      advice: "TFI 25–49，建議就醫評估，考慮聲音治療或諮商",
    };
  if (s < 75)
    return {
      level: "重大影響",
      color: "moderate",
      advice: "TFI 50–74，耳鳴造成顯著障礙，建議積極治療",
    };
  return {
    level: "嚴重影響",
    color: "severe",
    advice: "TFI ≥ 75，嚴重障礙，強烈建議多學科耳鳴治療計劃",
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
  const subscaleOrder = ["I", "C", "G", "S", "A", "R", "Q", "E"] as const;
  const sections = subscaleOrder
    .map((sk) => {
      const def = subscaleDefs[sk];
      const sc = scores.value[sk];
      const lines = questions
        .filter((q) => q.sub === sk)
        .map((q) => {
          const v = selections.value[q.key];
          return `  - **Q${qIndex[q.key]} ${q.name}**：${v >= 0 ? v : "未填"}`;
        })
        .join("\n");
      return `### ${def.name}（${sc} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# TFI 耳鳴功能指數評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **TFI 總分**：${totalScore.value} / 100\n- **嚴重程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n\n> 切截值：TFI < 25 輕微 / 25–49 中度 / 50–74 重大 / ≥ 75 嚴重`;
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

const subscaleOrder = ["I", "C", "G", "S", "A", "R", "Q", "E"] as const;
</script>

<template>
  <div class="tfi">
    <!-- Header -->
    <div class="tfi-header">
      <div class="header-title">
        <h2 class="title">TFI 耳鳴功能指數</h2>
        <p class="subtitle">
          Tinnitus Functional Index · 耳鳴對生活功能影響評估
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
        <span class="tick-threshold">25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
    </div>

    <!-- Subscale sub-scores -->
    <div class="sub-scores">
      <div
        v-for="sk in subscaleOrder"
        :key="sk"
        class="sub-pill"
        :class="subscaleDefs[sk].color + '-pill'"
      >
        <span class="sub-label">{{ subscaleDefs[sk].name }}</span>
        <span class="sub-val">{{ scores[sk] }}</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請依據<strong>過去一週</strong>耳鳴對您生活的影響程度評分。每題 0–10
        分（0 = 完全沒有影響，10 = 影響最嚴重），共 25 題，涵蓋 8 個面向。</span
      >
    </div>

    <!-- Eight subscale groups -->
    <div v-for="sk in subscaleOrder" :key="sk" class="tfi-group">
      <div class="group-header" :class="subscaleDefs[sk].color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ subscaleDefs[sk].name }}</span>
          <span class="group-sub"
            >{{ subscaleDefs[sk].sub }} · {{ subscaleDefs[sk].items }} 題</span
          >
        </div>
        <div class="group-score-pill" :class="subscaleDefs[sk].color + '-pill'">
          {{ scores[sk] }} / {{ subscaleDefs[sk].max }}
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="q in questions.filter((q) => q.sub === sk)"
          :key="q.key"
          class="tfi-item"
          :class="{
            answered: selections[q.key] >= 0,
            high: selections[q.key] >= 8,
            [subscaleDefs[sk].color]: selections[q.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="subscaleDefs[sk].color + '-qnum'">
                Q{{ qIndex[q.key] }}
              </span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.name }}</span>
              <span class="item-sub">{{ q.sub_en }}</span>
              <span class="item-hint">{{ q.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[q.key] === 0,
                unanswered: selections[q.key] < 0,
                high: selections[q.key] >= 8,
              }"
            >
              {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
            </span>
          </div>

          <!-- Anchor labels -->
          <div class="anchor-row">
            <span class="anchor-lo">{{ q.anchor_lo }}</span>
            <span class="anchor-hi">{{ q.anchor_hi }}</span>
          </div>

          <!-- 0–10 slider-style option row -->
          <div class="option-row-11">
            <label
              v-for="n in 11"
              :key="n - 1"
              class="opt-cell"
              :class="{
                active: selections[q.key] === n - 1,
                high: n - 1 >= 8 && selections[q.key] === n - 1,
                ['s' + (n - 1)]: true,
              }"
            >
              <input
                type="radio"
                :name="q.key"
                :value="n - 1"
                v-model="selections[q.key]"
              />
              <span class="opt-num-sm">{{ n - 1 }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div class="tfi-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max">/ 100</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span
            v-for="sk in subscaleOrder"
            :key="sk"
            class="breakdown-pill"
            :class="subscaleDefs[sk].color + '-pill-sm'"
          >
            {{ subscaleDefs[sk].name.slice(0, 2) }}：{{ scores[sk] }}
          </span>
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="sk in subscaleOrder" :key="sk">
        <div
          class="detail-section-title"
          :class="subscaleDefs[sk].color + '-section'"
        >
          {{ subscaleDefs[sk].name }}（{{ scores[sk] }} /
          {{ subscaleDefs[sk].max }} 分）
        </div>
        <div
          v-for="q in questions.filter((q) => q.sub === sk)"
          :key="q.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ qIndex[q.key] }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[q.key] === 0,
              high: selections[q.key] >= 8,
              brand: selections[q.key] > 0 && selections[q.key] < 8,
            }"
          >
            {{ selections[q.key] >= 0 ? selections[q.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              selections[q.key] === 0
                ? "沒有"
                : selections[q.key] <= 3
                  ? "輕微"
                  : selections[q.key] <= 6
                    ? "中度"
                    : "嚴重"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="tfi-actions">
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
.tfi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.tfi-header {
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
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
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
  border-color: #f59e0b;
  color: #f59e0b;
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
  margin-bottom: 0.75rem;
}
.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
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
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #eab308);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ef4444);
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
  color: #f59e0b;
  font-weight: 700;
}

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.sub-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 3px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.sub-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.sub-val {
  font-size: 0.78rem;
  font-weight: 800;
}

/* Subscale colours */
.intr-pill {
  border-color: rgba(139, 92, 246, 0.3);
}
.intr-pill .sub-val {
  color: #8b5cf6;
}
.ctrl-pill {
  border-color: rgba(59, 130, 246, 0.3);
}
.ctrl-pill .sub-val {
  color: #3b82f6;
}
.cogn-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.cogn-pill .sub-val {
  color: #14b8a6;
}
.slp-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.slp-pill .sub-val {
  color: #6366f1;
}
.aud-pill {
  border-color: rgba(245, 158, 11, 0.3);
}
.aud-pill .sub-val {
  color: #f59e0b;
}
.relx-pill {
  border-color: rgba(34, 197, 94, 0.3);
}
.relx-pill .sub-val {
  color: #22c55e;
}
.qol-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.qol-pill .sub-val {
  color: #f97316;
}
.emot-pill {
  border-color: rgba(239, 68, 68, 0.3);
}
.emot-pill .sub-val {
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
.tfi-group {
  margin-bottom: 1.75rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.55rem 0.75rem 0.55rem 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.group-header.intr-header {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), transparent);
}
.group-header.ctrl-header {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent);
}
.group-header.cogn-header {
  border-left: 4px solid #14b8a6;
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
}
.group-header.slp-header {
  border-left: 4px solid #6366f1;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
}
.group-header.aud-header {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent);
}
.group-header.relx-header {
  border-left: 4px solid #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), transparent);
}
.group-header.qol-header {
  border-left: 4px solid #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
}
.group-header.emot-header {
  border-left: 4px solid #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent);
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
.group-score-pill.intr-pill {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.3);
}
.group-score-pill.ctrl-pill {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.3);
}
.group-score-pill.cogn-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
}
.group-score-pill.slp-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
}
.group-score-pill.aud-pill {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}
.group-score-pill.relx-pill {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}
.group-score-pill.qol-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}
.group-score-pill.emot-pill {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tfi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.tfi-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.tfi-item.answered.intr {
  border-color: #8b5cf6;
}
.tfi-item.answered.ctrl {
  border-color: #3b82f6;
}
.tfi-item.answered.cogn {
  border-color: #14b8a6;
}
.tfi-item.answered.slp {
  border-color: #6366f1;
}
.tfi-item.answered.aud {
  border-color: #f59e0b;
}
.tfi-item.answered.relx {
  border-color: #22c55e;
}
.tfi-item.answered.qol {
  border-color: #f97316;
}
.tfi-item.answered.emot {
  border-color: #ef4444;
}
.tfi-item.high {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.04),
    transparent
  ) !important;
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
}

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.item-qnum.intr-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.item-qnum.ctrl-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.item-qnum.cogn-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.item-qnum.slp-qnum {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.item-qnum.aud-qnum {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.item-qnum.relx-qnum {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.item-qnum.qol-qnum {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.item-qnum.emot-qnum {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
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

/* ── Anchor row ────────────────────────────────────────────────── */
.anchor-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.9rem 0;
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  opacity: 0.7;
}

/* ── Option row — 11 cells (0–10) ──────────────────────────────── */
.option-row-11 {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.opt-cell:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-cell input[type="radio"] {
  display: none;
}
/* Score color progression — per-score classes (always applied) */
.opt-cell.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-cell.s0:hover:not(.active),
.opt-cell.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-cell.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.opt-cell.s0 .opt-num-sm {
  color: rgba(34, 197, 94, 0.5);
}
.opt-cell.s0.active .opt-num-sm {
  color: #22c55e;
}

.opt-cell.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-cell.s1:hover:not(.active),
.opt-cell.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-cell.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.opt-cell.s1 .opt-num-sm {
  color: rgba(132, 204, 22, 0.5);
}
.opt-cell.s1.active .opt-num-sm {
  color: #84cc16;
}

.opt-cell.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-cell.s2:hover:not(.active),
.opt-cell.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-cell.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.opt-cell.s2 .opt-num-sm {
  color: rgba(234, 179, 8, 0.5);
}
.opt-cell.s2.active .opt-num-sm {
  color: #eab308;
}

.opt-cell.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-cell.s3:hover:not(.active),
.opt-cell.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-cell.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.opt-cell.s3 .opt-num-sm {
  color: rgba(245, 158, 11, 0.5);
}
.opt-cell.s3.active .opt-num-sm {
  color: #f59e0b;
}

.opt-cell.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-cell.s4:hover:not(.active),
.opt-cell.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-cell.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.opt-cell.s4 .opt-num-sm {
  color: rgba(249, 115, 22, 0.5);
}
.opt-cell.s4.active .opt-num-sm {
  color: #f97316;
}

.opt-cell.s5,
.opt-cell.s6,
.opt-cell.s7,
.opt-cell.s8,
.opt-cell.s9,
.opt-cell.s10 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-cell.s5:hover:not(.active),
.opt-cell.s6:hover:not(.active),
.opt-cell.s7:hover:not(.active),
.opt-cell.s8:hover:not(.active),
.opt-cell.s9:hover:not(.active),
.opt-cell.s10:hover:not(.active),
.opt-cell.s5:focus-within,
.opt-cell.s6:focus-within,
.opt-cell.s7:focus-within,
.opt-cell.s8:focus-within,
.opt-cell.s9:focus-within,
.opt-cell.s10:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-cell.s5.active,
.opt-cell.s6.active,
.opt-cell.s7.active,
.opt-cell.s8.active,
.opt-cell.s9.active,
.opt-cell.s10.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-cell.s5 .opt-num-sm,
.opt-cell.s6 .opt-num-sm,
.opt-cell.s7 .opt-num-sm,
.opt-cell.s8 .opt-num-sm,
.opt-cell.s9 .opt-num-sm,
.opt-cell.s10 .opt-num-sm {
  color: rgba(239, 68, 68, 0.5);
}
.opt-cell.s5.active .opt-num-sm,
.opt-cell.s6.active .opt-num-sm,
.opt-cell.s7.active .opt-num-sm,
.opt-cell.s8.active .opt-num-sm,
.opt-cell.s9.active .opt-num-sm,
.opt-cell.s10.active .opt-num-sm {
  color: #ef4444;
}

.opt-num-sm {
  font-size: 0.78rem;
  font-weight: 900;
  transition: color 0.2s;
}

/* ── Result card ───────────────────────────────────────────────── */
.tfi-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition:
    border-color 0.3s,
    box-shadow 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.tfi-result.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), transparent);
}
.tfi-result.mild {
  border-color: #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06), transparent);
}
.tfi-result.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.06), transparent);
}
.tfi-result.severe {
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
.tfi-result.normal .result-number {
  color: #22c55e;
}
.tfi-result.mild .result-number {
  color: #f59e0b;
}
.tfi-result.moderate .result-number {
  color: #f97316;
}
.tfi-result.severe .result-number {
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
  gap: 4px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.breakdown-pill {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.intr-pill-sm {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.ctrl-pill-sm {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.cogn-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.slp-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.aud-pill-sm {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.relx-pill-sm {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.qol-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.emot-pill-sm {
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
.intr-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.ctrl-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.cogn-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.slp-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.aud-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.relx-section {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.qol-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.emot-section {
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
.tfi-actions {
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
  .tfi-header {
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
  .tfi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .option-row-11 {
    grid-template-columns: repeat(11, 1fr);
  }
  .opt-num-sm {
    font-size: 0.65rem;
  }
  .detail-desc {
    width: 36px;
  }
}
</style>
