<script setup lang="ts">
import { ref, computed } from "vue";

// ── RAPID3: Routine Assessment of Patient Index Data 3 ────────────
// Pincus 2008 — patient-reported outcome, no lab / no joint exam
// Part 1: MDHAQ 10 items × 0/1/2/3 → raw 0–30 → ÷3 → 0–10
// Part 2: Pain VAS 0–10
// Part 3: Global Health VAS 0–10
// RAPID3 = MDHAQ_scaled + Pain + GH → 0–30

// ── MDHAQ items (3 functional domains) ───────────────────────────
const items = [
  // ── 自我照顧（Self-Care） ─────────────────────────────────────
  {
    key: "q1",
    sub: "SC",
    name: "穿衣，包括鞋帶和鈕扣",
    en: "Dressing, including shoelaces and buttons",
    hint: "包含所有衣物穿脫，如拉鍊、扣鈕扣、綁鞋帶",
  },
  {
    key: "q2",
    sub: "SC",
    name: "起床和下床",
    en: "Getting in and out of bed",
    hint: "從床上起身或躺下的動作",
  },
  {
    key: "q3",
    sub: "SC",
    name: "將滿杯水舉到嘴邊",
    en: "Lifting a full cup or glass to your mouth",
    hint: "用手舉起裝滿水的杯子並喝水",
  },
  {
    key: "q5",
    sub: "SC",
    name: "清洗和擦乾全身",
    en: "Washing and drying your entire body",
    hint: "包含洗澡、淋浴及擦乾身體各部位",
  },
  {
    key: "q7",
    sub: "SC",
    name: "開關水龍頭",
    en: "Turning faucets on and off",
    hint: "旋轉或扳動水龍頭開關",
  },
  // ── 行動能力（Mobility） ──────────────────────────────────────
  {
    key: "q4",
    sub: "MB",
    name: "在平地上走路",
    en: "Walking on flat ground",
    hint: "在平坦地面上行走，不計算樓梯",
  },
  {
    key: "q6",
    sub: "MB",
    name: "彎腰從地板撿起衣物",
    en: "Bending down to pick up clothing from the floor",
    hint: "彎腰或蹲下從地上撿拾物品",
  },
  {
    key: "q8",
    sub: "MB",
    name: "上下車",
    en: "Getting in and out of a car",
    hint: "進出汽車的動作，包含推開車門",
  },
  // ── 生活參與（Activities） ────────────────────────────────────
  {
    key: "q9",
    sub: "AC",
    name: "步行兩英里或三公里",
    en: "Walk 2 miles or 3 km (if you wish)",
    hint: "持續步行較長距離的能力（如果您願意的話）",
  },
  {
    key: "q10",
    sub: "AC",
    name: "參加您喜歡的娛樂活動和運動",
    en: "Participate in sports and recreation (if you wish)",
    hint: "參與您有興趣的休閒活動或運動（如果您願意的話）",
  },
];

const domainDefs = {
  SC: { name: "自我照顧", sub: "Self-Care · 5 題", color: "sc", items: 5 },
  MB: { name: "行動能力", sub: "Mobility · 3 題", color: "mb", items: 3 },
  AC: { name: "生活參與", sub: "Activities · 2 題", color: "ac", items: 2 },
};

const diffOptions = [
  { value: 0, label: "沒有困難", desc: "No difficulty" },
  { value: 1, label: "有些困難", desc: "Some difficulty" },
  { value: 2, label: "很大困難", desc: "Much difficulty" },
  { value: 3, label: "無法進行", desc: "Unable to do" },
];

// ── State ─────────────────────────────────────────────────────────
const answers = ref<Record<string, number | null>>(
  Object.fromEntries(items.map((q) => [q.key, null])),
);
const painInput = ref("");
const ghInput = ref("");
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => items.filter((q) => answers.value[q.key] !== null).length,
);
const allAnswered = computed(() => answeredCount.value === 10);

const mdhaqRaw = computed(() => {
  if (!allAnswered.value) return null;
  return items.reduce((sum, q) => sum + (answers.value[q.key] ?? 0), 0);
});
const mdhaqScore = computed(() =>
  mdhaqRaw.value !== null ? Math.round((mdhaqRaw.value / 3) * 10) / 10 : null,
);

const pain = computed(() => {
  const v = parseFloat(painInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const gh = computed(() => {
  const v = parseFloat(ghInput.value);
  return isNaN(v) ? null : Math.min(10, Math.max(0, v));
});
const isComplete = computed(
  () => allAnswered.value && pain.value !== null && gh.value !== null,
);

// RAPID3 = MDHAQ_scaled (0–10) + Pain (0–10) + GH (0–10)
const rapid3 = computed(() => {
  if (!isComplete.value) return null;
  return Math.round((mdhaqScore.value! + pain.value! + gh.value!) * 10) / 10;
});

// DAS28 ≈ 0.302 × RAPID3 + 1.671  (Pincus 2011)
const das28Approx = computed(() =>
  rapid3.value !== null
    ? Math.round((0.302 * rapid3.value + 1.671) * 100) / 100
    : null,
);

// ── Severity ───────────────────────────────────────────────────────
const severity = computed(() => {
  const r = rapid3.value;
  if (r === null)
    return {
      level: "待完成",
      color: "filling",
      tag: "—",
      advice: "請完成所有題目以計算 RAPID3",
    };
  if (r <= 3)
    return {
      level: "接近緩解（Near Remission）",
      color: "normal",
      tag: "近緩解",
      advice: "疾病活動性很低，症狀控制良好，維持現有治療方案並定期監測",
    };
  if (r <= 6)
    return {
      level: "輕度嚴重度（Low Severity）",
      color: "mild",
      tag: "輕度",
      advice: "輕度疾病活動性，需要持續監測，目標達到近緩解",
    };
  if (r <= 12)
    return {
      level: "中度嚴重度（Moderate）",
      color: "moderate",
      tag: "中度",
      advice: "中度疾病活動性，可能需要調整治療，建議與醫師討論",
    };
  return {
    level: "高度嚴重度（High Severity）",
    color: "severe",
    tag: "高度",
    advice: "高度疾病活動性，需要積極治療，請盡快回診調整方案",
  };
});

// ── Helpers ───────────────────────────────────────────────────────
function domainScore(d: "SC" | "MB" | "AC") {
  return items
    .filter((q) => q.sub === d)
    .reduce((sum, q) => sum + (answers.value[q.key] ?? 0), 0);
}
const scoreSC = computed(() => domainScore("SC"));
const scoreMB = computed(() => domainScore("MB"));
const scoreAC = computed(() => domainScore("AC"));

function setVas(target: "pain" | "gh", val: number) {
  if (target === "pain") painInput.value = val.toString();
  else ghInput.value = val.toString();
}

// ── Markdown ───────────────────────────────────────────────────────
function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const qLines = items
    .map((q) => {
      const v = answers.value[q.key];
      const opt = diffOptions.find((o) => o.value === v);
      return `  - ${q.name}：${opt?.label ?? "未作答"}（${v ?? "—"}）`;
    })
    .join("\n");
  return `# RAPID3 快速評估指數評估結果\n\n## 評估日期：${date}\n\n## 第一部分：身體功能評估（MDHAQ）\n\n${qLines}\n\n- **MDHAQ 原始分**：${mdhaqRaw.value} / 30\n- **MDHAQ 換算分**：${mdhaqScore.value} / 10（÷3）\n\n## 第二部分 & 第三部分\n\n- **疼痛程度（Pain）**：${pain.value} / 10\n- **整體健康狀態（GH）**：${gh.value} / 10\n\n## 計算結果\n\nRAPID3 = ${mdhaqScore.value} + ${pain.value} + ${gh.value} = **${rapid3.value} / 30**\n\n- **疾病活動度**：${sv.level}\n- **臨床建議**：${sv.advice}\n- **DAS28 近似值**：≈ ${das28Approx.value}\n\n> 切截值：≤ 3 接近緩解 / ≤ 6 輕度 / ≤ 12 中度 / > 12 高度`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  items.forEach((q) => {
    answers.value[q.key] = null;
  });
  painInput.value = "";
  ghInput.value = "";
  showResults.value = false;
}

const domainOrder = ["SC", "MB", "AC"] as const;
const qIndex = (() => {
  const map: Record<string, number> = {};
  // original question numbers
  const nums: Record<string, number> = {
    q1: 1,
    q2: 2,
    q3: 3,
    q4: 4,
    q5: 5,
    q6: 6,
    q7: 7,
    q8: 8,
    q9: 9,
    q10: 10,
  };
  items.forEach((q) => {
    map[q.key] = nums[q.key];
  });
  return map;
})();
</script>

<template>
  <div class="r3">
    <!-- Header -->
    <div class="r3-header">
      <div class="header-title">
        <h2 class="title">RAPID3 快速評估指數</h2>
        <p class="subtitle">
          Routine Assessment of Patient Index Data 3 · 患者自填 ·
          無需關節檢查或實驗室 · 約 3 分鐘
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ rapid3 ?? "—" }}</span>
        <span class="score-label">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Severity bar -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{
            width:
              rapid3 !== null ? Math.min((rapid3 / 30) * 100, 100) + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span>0</span>
        <span class="tick-g">3</span>
        <span class="tick-y">6</span>
        <span class="tick-o">12</span>
        <span>30</span>
      </div>
    </div>

    <!-- Risk strip -->
    <div class="risk-strip">
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 <= 3 }"
      >
        <span class="risk-score">≤ 3</span>
        <span class="risk-rate normal-risk">接近緩解</span>
        <span class="risk-tag">Near Remission</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 > 3 && rapid3 <= 6 }"
      >
        <span class="risk-score">3.1–6</span>
        <span class="risk-rate mild-risk">輕度</span>
        <span class="risk-tag">Low Severity</span>
      </div>
      <div
        class="risk-pill"
        :class="{
          'risk-active': rapid3 !== null && rapid3 > 6 && rapid3 <= 12,
        }"
      >
        <span class="risk-score">6.1–12</span>
        <span class="risk-rate moderate-risk">中度</span>
        <span class="risk-tag">Moderate</span>
      </div>
      <div
        class="risk-pill"
        :class="{ 'risk-active': rapid3 !== null && rapid3 > 12 }"
      >
        <span class="risk-score">&gt; 12</span>
        <span class="risk-rate severe-risk">高度</span>
        <span class="risk-tag">High Severity</span>
      </div>
    </div>

    <!-- Sub-scores -->
    <div class="sub-scores">
      <div class="sub-pill sc-pill">
        <span class="sub-label">自我照顧（SC）</span>
        <span class="sub-val">{{ scoreSC }}</span>
      </div>
      <div class="sub-pill mb-pill">
        <span class="sub-label">行動能力（MB）</span>
        <span class="sub-val">{{ scoreMB }}</span>
      </div>
      <div class="sub-pill ac-pill">
        <span class="sub-label">生活參與（AC）</span>
        <span class="sub-val">{{ scoreAC }}</span>
      </div>
      <div class="sub-pill mdhaq-pill">
        <span class="sub-label">MDHAQ 換算（÷3）</span>
        <span class="sub-val">{{ mdhaqScore ?? "—" }}</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請根據您<strong>過去一週</strong>的情況填寫以下問題。第一部分共 10
        題，每題選一個選項；第二、三部分為數字評分（0–10）。完全由患者自行填寫，不需要醫師進行關節檢查。</span
      >
    </div>

    <!-- ── PART 1: MDHAQ groups ─────────────────────────────────── -->
    <div v-for="dk in domainOrder" :key="dk" class="r3-group">
      <div class="group-header" :class="domainDefs[dk].color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ domainDefs[dk].name }}</span>
          <span class="group-sub">{{ domainDefs[dk].sub }}</span>
        </div>
        <div class="group-score-pill" :class="domainDefs[dk].color + '-pill'">
          {{ dk === "SC" ? scoreSC : dk === "MB" ? scoreMB : scoreAC }} 分
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="item in items.filter((q) => q.sub === dk)"
          :key="item.key"
          class="r3-item"
          :class="{
            active: answers[item.key] !== null && answers[item.key]! > 0,
            flagged: answers[item.key] !== null && answers[item.key]! >= 2,
            answered: answers[item.key] !== null,
            high: answers[item.key] !== null && answers[item.key]! >= 2,
            [domainDefs[dk].color + '-active']:
              answers[item.key] !== null && answers[item.key]! > 0,
          }"
        >
          <div class="item-header">
            <span class="item-qnum" :class="domainDefs[dk].color + '-qnum'">
              Q{{ qIndex[item.key] }}
            </span>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.en }}</span>
              <span class="item-hint">{{ item.hint }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                'score-null': answers[item.key] === null,
                'score-zero': answers[item.key] === 0,
                'score-flagged':
                  answers[item.key] !== null && answers[item.key]! >= 2,
              }"
            >
              {{ answers[item.key] !== null ? answers[item.key] : "—" }}
            </span>
          </div>

          <!-- 4-column option row -->
          <div class="option-row">
            <label
              v-for="opt in diffOptions"
              :key="opt.value"
              class="opt-pill"
              :class="{
                active: answers[item.key] === opt.value,
                flagged: answers[item.key] === opt.value && opt.value >= 2,
                [domainDefs[dk].color + '-opt']:
                  answers[item.key] === opt.value && opt.value > 0,
                ['s' + opt.value]: true,
              }"
            >
              <input
                type="radio"
                :name="item.key"
                :value="opt.value"
                v-model="answers[item.key]"
              />
              <span class="opt-num">{{ opt.value }}</span>
              <span class="opt-desc">{{ opt.label }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <!-- MDHAQ footer -->
    <div class="mdhaq-footer" v-if="allAnswered">
      <span class="mf-label">MDHAQ 原始分：</span>
      <span class="mf-raw">{{ mdhaqRaw }} / 30</span>
      <span class="mf-arrow">→ 換算（÷3）→</span>
      <span class="mf-score">{{ mdhaqScore }} / 10</span>
    </div>
    <div class="mdhaq-footer mf-pending" v-else>
      <span class="intro-dot">◉</span> 第一部分尚有
      {{ 10 - answeredCount }} 題未作答
    </div>

    <!-- ── PART 2: Pain VAS ─────────────────────────────────────── -->
    <div class="vas-section">
      <div class="vas-section-header">
        <div class="vas-header-left">
          <span class="vas-part-num pain-num">2</span>
          <div>
            <span class="vas-part-title"
              >疼痛程度 <span class="vas-abbr">Pain</span></span
            >
            <span class="vas-part-sub"
              >請評估過去一週因關節炎引起的疼痛 · 0 = 無痛，10 = 最嚴重</span
            >
          </div>
        </div>
        <div class="vas-score-box" :class="{ 'vsb-filled': painInput !== '' }">
          <input
            v-model="painInput"
            type="number"
            min="0"
            max="10"
            step="0.5"
            placeholder="0–10"
            class="vas-score-input"
          />
        </div>
      </div>
      <div class="vas-slider-wrap">
        <span class="vas-anchor-l">0<br /><small>無痛</small></span>
        <div class="vas-track">
          <div
            class="pain-fill"
            :style="{ width: pain !== null ? (pain / 10) * 100 + '%' : '0%' }"
          />
          <div
            class="vas-thumb pain-thumb"
            v-if="pain !== null"
            :style="{ left: (pain / 10) * 100 + '%' }"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            :value="pain ?? 0"
            @input="
              setVas(
                'pain',
                parseFloat(($event.target as HTMLInputElement).value),
              )
            "
            class="vas-range"
          />
        </div>
        <span class="vas-anchor-r">10<br /><small>極痛</small></span>
      </div>
    </div>

    <!-- ── PART 3: GH VAS ──────────────────────────────────────── -->
    <div class="vas-section">
      <div class="vas-section-header">
        <div class="vas-header-left">
          <span class="vas-part-num gh-num">3</span>
          <div>
            <span class="vas-part-title"
              >整體健康狀態 <span class="vas-abbr">GH</span></span
            >
            <span class="vas-part-sub"
              >考慮過去一週疾病、身體、情緒和社交各方面 · 0 = 非常好，10 =
              非常差</span
            >
          </div>
        </div>
        <div class="vas-score-box" :class="{ 'vsb-filled': ghInput !== '' }">
          <input
            v-model="ghInput"
            type="number"
            min="0"
            max="10"
            step="0.5"
            placeholder="0–10"
            class="vas-score-input"
          />
        </div>
      </div>
      <div class="vas-slider-wrap">
        <span class="vas-anchor-l">0<br /><small>很好</small></span>
        <div class="vas-track">
          <div
            class="gh-fill"
            :style="{ width: gh !== null ? (gh / 10) * 100 + '%' : '0%' }"
          />
          <div
            class="vas-thumb gh-thumb"
            v-if="gh !== null"
            :style="{ left: (gh / 10) * 100 + '%' }"
          />
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            :value="gh ?? 0"
            @input="
              setVas(
                'gh',
                parseFloat(($event.target as HTMLInputElement).value),
              )
            "
            class="vas-range"
          />
        </div>
        <span class="vas-anchor-r">10<br /><small>很差</small></span>
      </div>
    </div>

    <!-- Result card -->
    <div class="r3-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ rapid3 ?? "—" }}</span>
        <span class="result-max">/ 30</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
        <div class="result-breakdown">
          <span class="breakdown-pill sc-pill-sm"
            >MDHAQ：{{ mdhaqScore ?? "—" }}</span
          >
          <span class="breakdown-pill mb-pill-sm">疼痛：{{ pain ?? "—" }}</span>
          <span class="breakdown-pill ac-pill-sm">整體：{{ gh ?? "—" }}</span>
          <span class="breakdown-pill approx-pill" v-if="das28Approx"
            >≈ DAS28 {{ das28Approx }}</span
          >
        </div>
      </div>
    </div>

    <!-- Results detail -->
    <div v-if="showResults" class="results-detail">
      <div class="results-header">評估明細</div>

      <div v-for="dk in domainOrder" :key="dk">
        <div
          class="detail-section-title"
          :class="domainDefs[dk].color + '-section'"
        >
          {{ domainDefs[dk].name }}（{{
            dk === "SC" ? scoreSC : dk === "MB" ? scoreMB : scoreAC
          }}
          分）
        </div>
        <div
          v-for="item in items.filter((q) => q.sub === dk)"
          :key="item.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ qIndex[item.key] }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              brand: answers[item.key] !== null && answers[item.key]! > 0,
              flagged: answers[item.key] !== null && answers[item.key]! >= 2,
              zero: answers[item.key] === 0,
            }"
          >
            {{ answers[item.key] !== null ? answers[item.key] : "—" }}
          </span>
          <span class="detail-desc">{{
            diffOptions.find((o) => o.value === answers[item.key])?.label ?? "—"
          }}</span>
        </div>
      </div>

      <div
        class="detail-section-title"
        style="color: #6366f1; background: rgba(99, 102, 241, 0.05)"
      >
        VAS 評估
      </div>
      <div class="detail-row">
        <span class="detail-qnum">P2</span>
        <span class="detail-domain">疼痛程度（Pain）</span>
        <span class="detail-score brand">{{ pain ?? "—" }}</span>
        <span class="detail-desc">/ 10</span>
      </div>
      <div class="detail-row">
        <span class="detail-qnum">P3</span>
        <span class="detail-domain">整體健康狀態（GH）</span>
        <span class="detail-score brand">{{ gh ?? "—" }}</span>
        <span class="detail-desc">/ 10</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">RAPID3 總分</span>
        <span class="detail-score brand">{{ rapid3 ?? "—" }}</span>
        <span class="detail-desc">{{ severity.tag }}</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="r3-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p class="progress-hint" v-if="answeredCount > 0 && !isComplete">
      {{
        allAnswered
          ? "請完成疼痛及整體健康評估"
          : `第一部分已完成 ${answeredCount} / 10 題`
      }}
    </p>
  </div>
</template>

<style scoped>
.r3 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.r3-header {
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
  letter-spacing: 0.02em;
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
  margin-bottom: 1rem;
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
.tick-g {
  color: #22c55e;
  font-weight: 700;
}
.tick-y {
  color: #f59e0b;
  font-weight: 700;
}
.tick-o {
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

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.5rem;
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
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}
.sc-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.sc-pill .sub-val {
  color: #14b8a6;
}
.mb-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.mb-pill .sub-val {
  color: #6366f1;
}
.ac-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.ac-pill .sub-val {
  color: #f97316;
}
.mdhaq-pill {
  border-color: rgba(var(--vp-c-brand-rgb, 100, 108, 255), 0.3);
}
.mdhaq-pill .sub-val {
  color: var(--vp-c-brand-1);
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
.r3-group {
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
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.sc-header {
  border-left-color: #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.mb-header {
  border-left-color: #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.ac-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
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
.sc-pill.group-score-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
  background: rgba(20, 184, 166, 0.06);
}
.mb-pill.group-score-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.06);
}
.ac-pill.group-score-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Items ─────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.r3-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.r3-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.r3-item.answered {
  border-color: rgba(20, 184, 166, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.r3-item.high {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.r3-item.active.sc-active {
  border-color: #14b8a6;
}
.r3-item.active.mb-active {
  border-color: #6366f1;
}
.r3-item.active.ac-active {
  border-color: #f97316;
}
.r3-item.flagged {
  border-color: #ef4444 !important;
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.sc-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.mb-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.ac-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.r3-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
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
.item-hint {
  font-size: 0.7rem;
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
.score-null {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.score-zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.score-flagged {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}

/* ── Option row — 4 columns ─────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
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
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}

/* Score-specific colors — s0 through s3 */
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
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s1:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s1.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s2:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s2.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s3:hover:not(.active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s3.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-num {
  font-size: 0.95rem;
  font-weight: 800;
  transition: color 0.2s;
  line-height: 1;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.5);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.5);
}
.opt-pill.s1.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-num {
  color: rgba(249, 115, 22, 0.5);
}
.opt-pill.s2.active .opt-num {
  color: #f97316;
}
.opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.5);
}
.opt-pill.s3.active .opt-num {
  color: #ef4444;
}

.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.4);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.4);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2 .opt-desc {
  color: rgba(249, 115, 22, 0.4);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.4);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}

/* ── MDHAQ footer ──────────────────────────────────────────────── */
.mdhaq-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.6rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1.5rem;
}
.mf-label {
  color: var(--vp-c-text-3);
}
.mf-raw {
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mf-arrow {
  color: var(--vp-c-text-3);
}
.mf-score {
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.mf-pending {
  font-style: italic;
  color: var(--vp-c-text-3);
}

/* ── VAS sections ──────────────────────────────────────────────── */
.vas-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.vas-section:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.vas-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 1rem;
  flex-wrap: wrap;
}
.vas-header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.vas-part-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.82rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.pain-num {
  background: #ef4444;
}
.gh-num {
  background: #6366f1;
}

.vas-part-title {
  display: block;
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vas-abbr {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-left: 4px;
}
.vas-part-sub {
  display: block;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  margin-top: 2px;
}

.vas-score-box {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  padding: 0.35rem 0.6rem;
  min-width: 66px;
  text-align: center;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.vas-score-box:focus-within {
  border-color: var(--vp-c-brand-1);
}
.vas-score-box.vsb-filled {
  border-color: #22c55e;
}
.vas-score-input {
  width: 48px;
  border: none;
  background: transparent;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.vas-score-input::-webkit-outer-spin-button,
.vas-score-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.vas-score-input::placeholder {
  font-size: 0.82rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.vas-slider-wrap {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
}
.vas-anchor-l,
.vas-anchor-r {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  text-align: center;
  line-height: 1.3;
  flex-shrink: 0;
  width: 28px;
}

.vas-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.pain-fill,
.gh-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.pain-fill {
  background: #ef4444;
}
.gh-fill {
  background: #6366f1;
}

.vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.2s;
}
.pain-thumb {
  background: #ef4444;
}
.gh-thumb {
  background: #6366f1;
}
.vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}

/* ── Result card ───────────────────────────────────────────────── */
.r3-result {
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
.r3-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.r3-result.filling {
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
.r3-result.normal .result-number {
  color: #22c55e;
}
.r3-result.mild .result-number {
  color: #f59e0b;
}
.r3-result.moderate .result-number {
  color: #f97316;
}
.r3-result.severe .result-number {
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
.sc-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.mb-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.ac-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.approx-pill {
  background: rgba(99, 102, 241, 0.08);
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
.sc-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.mb-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.ac-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.9rem;
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
  font-size: 0.78rem;
  font-weight: 600;
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
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-score.flagged {
  color: #ef4444;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.r3-actions {
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
  .r3-header {
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
  .r3-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
