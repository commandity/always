<script setup lang="ts">
import { ref, computed } from "vue";

const items = [
  {
    key: "pa1",
    sub: "PA",
    name: "打人（包括打自己）",
    en: "Hitting",
    hint: "用手或手臂打人或打自己",
  },
  {
    key: "pa2",
    sub: "PA",
    name: "踢人",
    en: "Kicking",
    hint: "用腳踢人或踢物品",
  },
  {
    key: "pa3",
    sub: "PA",
    name: "抓住他人",
    en: "Grabbing onto people",
    hint: "抓取、緊握他人",
  },
  { key: "pa4", sub: "PA", name: "推人", en: "Pushing", hint: "推擠他人" },
  {
    key: "pa5",
    sub: "PA",
    name: "投擲物品",
    en: "Throwing things",
    hint: "丟擲物品",
  },
  { key: "pa6", sub: "PA", name: "咬人", en: "Biting", hint: "咬人或動物" },
  {
    key: "pa7",
    sub: "PA",
    name: "抓撓他人",
    en: "Scratching",
    hint: "用指甲抓撓他人",
  },
  {
    key: "pa8",
    sub: "PA",
    name: "吐口水",
    en: "Spitting",
    hint: "對人或物品吐口水",
  },
  {
    key: "pa9",
    sub: "PA",
    name: "傷害自己或他人",
    en: "Hurting self or others",
    hint: "任何傷害自己或他人的行為",
  },
  {
    key: "pa10",
    sub: "PA",
    name: "撕毀物品或破壞財產",
    en: "Tearing things / property destruction",
    hint: "撕破紙張、衣物或破壞物品",
  },
  {
    key: "pa11",
    sub: "PA",
    name: "做出不恰當的身體性接觸",
    en: "Making inappropriate sexual advances",
    hint: "不適當的性相關身體接觸",
  },
  {
    key: "pna12",
    sub: "PNA",
    name: "來回踱步或漫無目的遊蕩",
    en: "Pacing, aimless wandering",
    hint: "無目的地來回走動",
  },
  {
    key: "pna13",
    sub: "PNA",
    name: "穿著不當或脫衣",
    en: "Inappropriate dressing/undressing",
    hint: "在不適當的場合穿衣或脫衣",
  },
  {
    key: "pna14",
    sub: "PNA",
    name: "試圖前往不同地方",
    en: "Trying to get to a different place",
    hint: "嘗試走出房間、病房或離開機構",
  },
  {
    key: "pna15",
    sub: "PNA",
    name: "故意跌倒",
    en: "Intentional falling",
    hint: "故意讓自己跌倒",
  },
  {
    key: "pna16",
    sub: "PNA",
    name: "食用或飲用不當物質",
    en: "Eating/drinking inappropriate substances",
    hint: "吃或喝不應食用的東西",
  },
  {
    key: "pna17",
    sub: "PNA",
    name: "不當處理物品",
    en: "Handling things inappropriately",
    hint: "翻弄、移動或操作不應碰觸的物品",
  },
  {
    key: "pna18",
    sub: "PNA",
    name: "藏匿物品",
    en: "Hiding things",
    hint: "把物品藏在不尋常的地方",
  },
  {
    key: "pna19",
    sub: "PNA",
    name: "囤積物品",
    en: "Hoarding things",
    hint: "過度積存物品",
  },
  {
    key: "pna20",
    sub: "PNA",
    name: "做出重複性的舉動",
    en: "Repetitious mannerisms",
    hint: "反覆做同樣的動作（如摸衣服、敲桌）",
  },
  {
    key: "pna21",
    sub: "PNA",
    name: "普遍性煩躁不安",
    en: "General restlessness",
    hint: "無法靜止、持續不安",
  },
  {
    key: "v22",
    sub: "V",
    name: "尖叫",
    en: "Screaming",
    hint: "大聲尖叫或哭喊",
  },
  {
    key: "v23",
    sub: "V",
    name: "做出言語上的性挑逗",
    en: "Making verbal sexual advances",
    hint: "語言上的不適當性暗示",
  },
  {
    key: "v24",
    sub: "V",
    name: "咒罵或言語攻擊",
    en: "Cursing or verbal aggression",
    hint: "咒罵、辱罵或語言威脅",
  },
  {
    key: "v25",
    sub: "V",
    name: "重複句子或問題",
    en: "Repetitive sentences / questions",
    hint: "不斷重複相同句子或問題",
  },
  {
    key: "v26",
    sub: "V",
    name: "發出奇怪的聲音",
    en: "Strange noises",
    hint: "怪異的笑聲、哭聲或叫聲",
  },
  {
    key: "v27",
    sub: "V",
    name: "抱怨",
    en: "Complaining",
    hint: "持續抱怨身體或環境",
  },
  {
    key: "v28",
    sub: "V",
    name: "消極態度",
    en: "Negativism",
    hint: "拒絕合作、反對一切要求",
  },
  {
    key: "v29",
    sub: "V",
    name: "持續無理由地要求關注或幫助",
    en: "Constant unwarranted requests for attention/help",
    hint: "不斷呼喚、要求照顧者注意",
  },
];

const freqOptions = [
  { value: 1, label: "1", desc: "從未" },
  { value: 2, label: "2", desc: "少於每週一次" },
  { value: 3, label: "3", desc: "每週一至兩次" },
  { value: 4, label: "4", desc: "每週數次" },
  { value: 5, label: "5", desc: "每天一至兩次" },
  { value: 6, label: "6", desc: "每天數次" },
  { value: 7, label: "7", desc: "每小時數次" },
];

const selections = ref<Record<string, number>>(
  Object.fromEntries(items.map((item) => [item.key, 1])),
);
const showResults = ref(false);
const copied = ref(false);

const answeredCount = computed(
  () => items.filter((item) => selections.value[item.key] > 1).length,
);

function subscaleScore(s: "PA" | "PNA" | "V") {
  return items
    .filter((i) => i.sub === s)
    .reduce((sum, i) => sum + selections.value[i.key], 0);
}

const scorePA = computed(() => subscaleScore("PA"));
const scorePNA = computed(() => subscaleScore("PNA"));
const scoreV = computed(() => subscaleScore("V"));

const totalScore = computed(
  () => scorePA.value + scorePNA.value + scoreV.value,
);

const hasSignificantItem = computed(() =>
  items.some((i) => selections.value[i.key] >= 4),
);

const severity = computed(() => {
  const s = totalScore.value;
  const adjusted = s - 29;
  if (adjusted <= 0)
    return {
      level: "基準（無激動）",
      color: "normal",
      advice: "所有行為頻率均為從未，目前無激動行為",
    };
  if (adjusted <= 20)
    return {
      level: "輕度激動",
      color: "mild",
      advice: "偶發性激動行為，建議監測並調整照護策略",
    };
  if (adjusted <= 50)
    return {
      level: "中度激動",
      color: "moderate",
      advice: "中度激動，建議非藥物干預並評估誘因",
    };
  return {
    level: "重度激動",
    color: "severe",
    advice: "重度激動，建議積極評估病因並考慮藥物介入",
  };
});

const qIndex = (() => {
  const map: Record<string, number> = {};
  items.forEach((item, i) => {
    map[item.key] = i + 1;
  });
  return map;
})();

const subscaleDefs = {
  PA: {
    name: "身體攻擊性",
    sub: "Physical Aggressive",
    color: "pa",
    items: 11,
  },
  PNA: {
    name: "身體非攻擊性",
    sub: "Physical Non-Aggressive",
    color: "pna",
    items: 10,
  },
  V: { name: "語言激動", sub: "Verbal Agitation", color: "vb", items: 8 },
};

const subscaleOrder = ["PA", "PNA", "V"] as const;

function subscaleScoreFn(sk: "PA" | "PNA" | "V") {
  return sk === "PA"
    ? scorePA.value
    : sk === "PNA"
      ? scorePNA.value
      : scoreV.value;
}

function generateMarkdown() {
  const sections = subscaleOrder
    .map((sk) => {
      const def = subscaleDefs[sk];
      const sc = subscaleScoreFn(sk);
      const lines = items
        .filter((i) => i.sub === sk)
        .map((i) => {
          const v = selections.value[i.key];
          const opt = freqOptions.find((o) => o.value === v);
          return `  - **Q${qIndex[i.key]} ${i.name}**：${v}（${opt?.desc}）`;
        })
        .join("\n");
      return `### ${def.name}（${sc} 分，基準 ${def.items} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# CMAI 柯恩-曼斯菲爾德激動量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **CMAI 總分**：${totalScore.value} / 203（基準值 29 分）\n- **身體攻擊性**：${scorePA.value} 分\n- **身體非攻擊性**：${scorePNA.value} 分\n- **語言激動**：${scoreV.value} 分\n- **激動程度**：${severity.value.level}\n- **臨床建議**：${severity.value.advice}\n- **顯著激動項目（≥ 4 分）**：${hasSignificantItem.value ? "有" : "無"}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((item) => {
    selections.value[item.key] = 1;
  });
  showResults.value = false;
}
</script>

<template>
  <div class="cmai">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cmai-header">
      <div class="header-title">
        <h2 class="title">CMAI 激動情緒行為量表</h2>
        <p class="subtitle">
          Cohen-Mansfield Agitation Inventory · 過去兩週行為頻率評估
        </p>
      </div>
      <div class="score-badge" :class="'sb-' + severity.color">
        <span class="score-number">{{ totalScore }}</span>
        <span class="score-label">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="'sf-' + severity.color"
          :style="{
            width: Math.min(((totalScore - 29) / (203 - 29)) * 100, 100) + '%',
          }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">29</span>
        <span class="tick-abs t-mid" style="left: 16.1%">49</span>
        <span class="tick-abs t-mid" style="left: 40.2%">79</span>
        <span class="tick-abs t-high" style="left: 100%">203</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-low" style="left: 0%">無激動</span>
        <span class="label-abs lbl-mid" style="left: 16.1%">輕度</span>
        <span class="label-abs lbl-mid" style="left: 40.2%">中度</span>
        <span class="label-abs lbl-high" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >由照護者依據患者<strong>過去兩週</strong>的行為頻率評分。每題 1–7
        分（1=從未，7=每小時數次），共 29 題，總分 29–203 分。基準值 29
        分代表無激動行為。</span
      >
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="sk in subscaleOrder" :key="sk" class="cmai-group">
      <div class="group-header" :class="subscaleDefs[sk].color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ subscaleDefs[sk].name }}</span>
          <span class="group-sub"
            >{{ subscaleDefs[sk].sub }} · {{ subscaleDefs[sk].items }} 題</span
          >
        </div>
        <span
          class="group-score-pill"
          :class="subscaleDefs[sk].color + '-pill'"
        >
          {{ subscaleScoreFn(sk) }} 分
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="item in items.filter((i) => i.sub === sk)"
          :key="item.key"
          class="cmai-item"
          :class="{
            answered: selections[item.key] > 1,
            flagged: selections[item.key] >= 4,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="subscaleDefs[sk].color + '-qnum'">
                Q{{ qIndex[item.key] }}
              </span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.en }}</span>
              <span class="item-hint">{{ item.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                zero: selections[item.key] === 1,
                high: selections[item.key] >= 4,
              }"
            >
              {{ selections[item.key] }}
            </span>
          </div>

          <div class="option-row">
            <label
              v-for="opt in freqOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: selections[item.key] === opt.value,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="opt.value"
                v-model="selections[item.key]"
              />
              <span class="opt-num">{{ opt.label }}</span>
              <span class="opt-desc">{{ opt.desc }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cmai-result" :class="'res-' + severity.color">
      <div class="result-left">
        <span class="result-number">{{ totalScore }}</span>
        <span class="result-max">/ 203</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill pa-pill-sm">PA：{{ scorePA }}</span>
          <span class="breakdown-pill pna-pill-sm">PNA：{{ scorePNA }}</span>
          <span class="breakdown-pill vb-pill-sm">V：{{ scoreV }}</span>
        </div>
        <span v-if="hasSignificantItem" class="result-flag"
          >⚠ 有行為評分 ≥ 4，提示顯著激動</span
        >
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="sk in subscaleOrder" :key="sk">
        <div
          class="detail-section-title"
          :class="subscaleDefs[sk].color + '-section'"
        >
          {{ subscaleDefs[sk].name }}（{{ subscaleScoreFn(sk) }} 分）
        </div>
        <div
          v-for="item in items.filter((i) => i.sub === sk)"
          :key="item.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ qIndex[item.key] }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: selections[item.key] === 1,
              high: selections[item.key] >= 4,
              brand: selections[item.key] > 1 && selections[item.key] < 4,
            }"
          >
            {{ selections[item.key] }}
          </span>
          <span class="detail-desc">
            {{
              freqOptions.find((o) => o.value === selections[item.key])?.desc
            }}
          </span>
        </div>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">CMAI 總分（基準 29）</span>
        <span class="detail-score brand">{{ totalScore }} / 203</span>
        <span class="detail-desc">{{ severity.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cmai-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="answeredCount > 0" class="progress-hint">
      {{ answeredCount }} 個項目評分 > 1（從未）
    </p>
  </div>
</template>

<style scoped>
.cmai {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.cmai-header {
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
  letter-spacing: 0.02em;
  text-align: center;
}
.sb-normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
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
.sf-normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.sf-mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.sf-moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.sf-severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
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
.lbl-low {
  color: #22c55e;
}
.lbl-mid {
  color: #f59e0b;
}
.lbl-high {
  color: #ef4444;
}
.t-mid {
  color: #f59e0b;
  font-weight: 700;
}
.t-high {
  color: #ef4444;
  font-weight: 700;
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
.cmai-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.pa-header {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.pna-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.vb-header {
  border-left-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
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
  border: 1px solid rgba(99, 102, 241, 0.25);
  color: var(--vp-c-brand-1);
  background: rgba(99, 102, 241, 0.06);
  white-space: nowrap;
  flex-shrink: 0;
}
.pa-pill.group-score-pill {
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.pna-pill.group-score-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.vb-pill.group-score-pill {
  border-color: rgba(99, 102, 241, 0.25);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cmai-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cmai-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cmai-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.cmai-item.flagged {
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
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
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.pa-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.pna-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.vb-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
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
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  font-style: italic;
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
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

/* ── Option row — 7 columns (1–7) ──────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.1rem;
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
.opt-num {
  font-size: 0.9rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}

/* Score-specific colors — s1 through s7 */
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s1.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s2.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s3.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s4.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s5 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s5:hover:not(.active),
.opt-pill.s5:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s5.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-pill.s6 {
  border-color: rgba(234, 88, 12, 0.15);
}
.opt-pill.s6:hover:not(.active),
.opt-pill.s6:focus-within {
  border-color: rgba(234, 88, 12, 0.35);
  background: rgba(234, 88, 12, 0.04);
}
.opt-pill.s6.active {
  border-color: #ea580c;
  background: linear-gradient(
    180deg,
    rgba(234, 88, 12, 0.12),
    rgba(234, 88, 12, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 88, 12, 0.08);
}

.opt-pill.s7 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s7:hover:not(.active),
.opt-pill.s7:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s7.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}

.opt-pill.s2 .opt-num {
  color: rgba(132, 204, 22, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-desc {
  color: rgba(132, 204, 22, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}

.opt-pill.s3 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}

.opt-pill.s4 .opt-num {
  color: rgba(245, 158, 11, 0.5);
}
.opt-pill.s4.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s4 .opt-desc {
  color: rgba(245, 158, 11, 0.4);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}

.opt-pill.s5 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s5.active .opt-num {
  color: #f97316;
}
.opt-pill.s5 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}

.opt-pill.s6 .opt-num {
  color: rgba(234, 88, 12, 0.5);
}
.opt-pill.s6.active .opt-num {
  color: #ea580c;
}
.opt-pill.s6 .opt-desc {
  color: rgba(234, 88, 12, 0.4);
}
.opt-pill.s6.active .opt-desc {
  color: rgba(234, 88, 12, 0.7);
}

.opt-pill.s7 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s7.active .opt-num {
  color: #ef4444;
}
.opt-pill.s7 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s7.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── Result card ───────────────────────────────────────────────── */
.cmai-result {
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
.res-normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-severe {
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
.res-normal .result-number {
  color: #22c55e;
}
.res-mild .result-number {
  color: #f59e0b;
}
.res-moderate .result-number {
  color: #f97316;
}
.res-severe .result-number {
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
.result-flag {
  font-size: 0.78rem;
  font-weight: 600;
  color: #ef4444;
}
.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.pa-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.pna-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.vb-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
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
.detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.pa-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.pna-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.vb-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
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
  width: 32px;
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
  width: 52px;
  text-align: right;
}
.detail-score.zero {
  color: var(--vp-c-text-3);
}
.detail-score.high {
  color: #ef4444;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.cmai-actions {
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
  .cmai-header {
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
  .cmai-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .opt-desc {
    display: none;
  }
  .severity-labels-abs {
    display: none;
  }
  .detail-desc {
    width: 52px;
  }
  .option-row {
    grid-template-columns: repeat(4, 1fr);
  }
  .opt-pill:nth-child(4) {
    border-right: none;
  }
  .opt-pill:nth-child(4) ~ .opt-pill {
    border-top: 1px solid var(--vp-c-divider);
  }
}
</style>
