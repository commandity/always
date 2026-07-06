<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"odi" | "rm">("odi");

// ══════════════ Oswestry 失能指數（ODI · Disability Index）══════════════

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
const odi_copied = ref(false);
const odi_showResults = ref(false);

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

const odi_severity = computed(() => {
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

function odi_generateMarkdown() {
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
    `- 障礙程度：${odi_severity.value.label}\n` +
    `- ${odi_severity.value.detail}\n` +
    `- ${odi_severity.value.mgmt}`
  );
}

async function odi_copyMarkdown() {
  await navigator.clipboard.writeText(odi_generateMarkdown());
  odi_copied.value = true;
  setTimeout(() => (odi_copied.value = false), 2000);
}

function odi_reset() {
  sections.forEach((s) => (answers.value[s.key] = null));
  odi_showResults.value = false;
}

// ══════════════ Roland-Morris 問卷（RMDQ · Disability Questionnaire）══════════════

// Roland-Morris Disability Questionnaire (RMDQ)
// 24 items — each checked (1) or unchecked (0)
// Score = number of checked items (0–24)

const items = [
  {
    key: "q01",
    text: "我因為背痛而整天待在家裡",
    en: "I stay at home most of the time because of my back",
  },
  {
    key: "q02",
    text: "我因為背痛而改變體位以舒緩不適",
    en: "I change position frequently to make my back more comfortable",
  },
  {
    key: "q03",
    text: "我因為背痛而比平常走得更慢",
    en: "I walk more slowly than usual because of my back",
  },
  {
    key: "q04",
    text: "我因為背痛而無法做任何平常在家做的事",
    en: "Because of my back, I am not doing any of the jobs that I usually do around the house",
  },
  {
    key: "q05",
    text: "我因為背痛而需要扶著欄桿上樓梯",
    en: "Because of my back, I use a handrail to get upstairs",
  },
  {
    key: "q06",
    text: "我因為背痛而需要頻繁躺下休息",
    en: "Because of my back, I lie down to rest more often",
  },
  {
    key: "q07",
    text: "我因為背痛而必須扶東西才能從椅子站起來",
    en: "Because of my back, I have to hold onto something to get out of an easy chair",
  },
  {
    key: "q08",
    text: "我因為背痛而需要他人協助穿衣",
    en: "Because of my back, I try to get other people to do things for me",
  },
  {
    key: "q09",
    text: "我因為背痛而比平常穿衣更慢",
    en: "I get dressed more slowly than usual because of my back",
  },
  {
    key: "q10",
    text: "我因為背痛而只能站立很短的時間",
    en: "I only stand up for short periods of time because of my back",
  },
  {
    key: "q11",
    text: "我因為背痛而盡量不彎腰或下跪",
    en: "Because of my back, I try not to bend or kneel down",
  },
  {
    key: "q12",
    text: "我因為背痛而很難從椅子起身",
    en: "I find it difficult to get out of a chair because of my back",
  },
  {
    key: "q13",
    text: "我的背部大部分時間都感到疼痛",
    en: "My back is painful almost all the time",
  },
  {
    key: "q14",
    text: "我因為背痛而很難翻身",
    en: "I find it difficult to turn over in bed because of my back",
  },
  {
    key: "q15",
    text: "我因為背痛而食慾不振",
    en: "I have a poor appetite because of my back pain",
  },
  {
    key: "q16",
    text: "我因為背痛而很難穿上襪子或絲襪",
    en: "I have trouble putting on my socks (or stockings) because of the pain in my back",
  },
  {
    key: "q17",
    text: "我因為背痛而只能走很短的距離",
    en: "I only walk short distances because of my back",
  },
  {
    key: "q18",
    text: "我的睡眠品質因為背痛而下降",
    en: "I sleep less well because of my back",
  },
  {
    key: "q19",
    text: "我因為背痛而需要他人協助穿鞋",
    en: "Because of my back pain, I get dressed with help from someone else",
  },
  {
    key: "q20",
    text: "我因為背痛而大部分時間坐著",
    en: "I sit down for most of the day because of my back",
  },
  {
    key: "q21",
    text: "我因為背痛而避免做繁重的家務",
    en: "I avoid heavy jobs around the house because of my back",
  },
  {
    key: "q22",
    text: "我因為背痛而比平常更容易發脾氣或情緒不穩",
    en: "Because of my back pain, I am more irritable and bad tempered with people than usual",
  },
  {
    key: "q23",
    text: "我因為背痛而比平常更緩慢地爬樓梯",
    en: "Because of my back, I go upstairs more slowly than usual",
  },
  {
    key: "q24",
    text: "我因為背痛而大部分時間臥床",
    en: "I stay in bed most of the time because of my back",
  },
];

const checked = ref<Record<string, boolean>>(
  Object.fromEntries(items.map((i) => [i.key, false])),
);
const rm_copied = ref(false);
const rm_showResults = ref(false);

const score = computed(() => items.filter((i) => checked.value[i.key]).length);

const rm_severity = computed(() => {
  const s = score.value;
  if (s <= 4)
    return {
      label: "輕度障礙",
      color: "normal",
      detail: "功能影響輕微，大多數活動可正常進行",
    };
  if (s <= 8)
    return {
      label: "中度障礙",
      color: "mild",
      detail: "日常活動中等程度受限，建議積極復健",
    };
  if (s <= 14)
    return {
      label: "中重度障礙",
      color: "moderate",
      detail: "顯著功能障礙，影響多項日常活動",
    };
  return {
    label: "重度障礙",
    color: "severe",
    detail: "嚴重功能障礙，需積極多學科介入",
  };
});

function toggleAll(val: boolean) {
  items.forEach((i) => (checked.value[i.key] = val));
}

function rm_generateMarkdown() {
  const checkedItems = items
    .filter((i) => checked.value[i.key])
    .map((i) => `  ✓ ${i.text}`);
  const uncheckedItems = items
    .filter((i) => !checked.value[i.key])
    .map((i) => `  ✗ ${i.text}`);
  return (
    `# Roland-Morris 失能問卷\n\n` +
    `## 選中項目（${score.value} / 24）\n\n${checkedItems.join("\n") || "  無"}\n\n` +
    `## 未選項目\n\n${uncheckedItems.join("\n")}\n\n` +
    `## 結果\n\n` +
    `- **得分 = ${score.value} / 24**\n` +
    `- 障礙程度：${rm_severity.value.label}\n` +
    `- ${rm_severity.value.detail}`
  );
}

async function rm_copyMarkdown() {
  await navigator.clipboard.writeText(rm_generateMarkdown());
  rm_copied.value = true;
  setTimeout(() => (rm_copied.value = false), 2000);
}

function rm_reset() {
  items.forEach((i) => (checked.value[i.key] = false));
  rm_showResults.value = false;
}
</script>

<template>
  <div class="disability">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'odi' }"
        @click="activeTab = 'odi'"
      >
        <span class="tab-label">Oswestry 失能指數</span>
        <span class="tab-sub">ODI · Disability Index</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'rm' }"
        @click="activeTab = 'rm'"
      >
        <span class="tab-label">Roland-Morris 問卷</span>
        <span class="tab-sub">RMDQ · Disability Questionnaire</span>
      </button>
    </div>

  <div v-show="activeTab === 'odi'" class="odi">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="odi-header">
      <div class="header-title">
        <h2 class="title">Oswestry 失能指數</h2>
        <p class="subtitle">
          Oswestry Disability Index (ODI) Version 1 · Fairbank & Pynsent 2000 ·
          10 項評估
        </p>
      </div>
      <div class="score-badge" :class="odi_severity.color">
        <span class="sb-val">{{ odiPct ?? "—" }}</span>
        <span class="sb-pct" v-if="odiPct !== null">%</span>
        <span class="sb-label">{{ odi_severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="odi-bar-wrap">
      <div class="odi-bar">
        <div
          class="odi-bar-fill"
          :class="odi_severity.color"
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
    <div class="odi-result" :class="odi_severity.color">
      <div class="or-left">
        <span class="or-n">{{ odiPct ?? "—" }}</span>
        <span class="or-u" v-if="odiPct !== null">%</span>
      </div>
      <div class="or-right">
        <span class="or-level">{{ odi_severity.label }}</span>
        <span class="or-detail">{{ odi_severity.detail }}</span>
        <span class="or-mgmt">{{ odi_severity.mgmt }}</span>
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
    <div v-if="odi_showResults" class="results-detail">
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
        <span class="detail-desc">{{ odi_severity.label.split("（")[0] }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="odi-actions">
      <button class="btn-view" @click="odi_showResults = !odi_showResults">
        {{ odi_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button
        class="btn-copy"
        :disabled="answeredCount === 0"
        @click="odi_copyMarkdown"
      >
        {{ odi_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="odi_reset">重置</button>
    </div>
    <p class="progress-hint" v-if="!isComplete">
      已完成 {{ answeredCount }} / 10 項（S8
      性生活可跳過，將以可用項目計算百分比）
    </p>
  </div>

  <div v-show="activeTab === 'rm'" class="rm">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="rm-header">
      <div class="header-title">
        <h2 class="title">Roland-Morris 失能問卷</h2>
        <p class="subtitle">
          Roland-Morris Disability Questionnaire · 腰痛功能障礙評估 · 24 題
        </p>
      </div>
      <div class="score-badge" :class="rm_severity.color">
        <span class="sb-val">{{ score }}</span>
        <span class="sb-max">/ 24</span>
        <span class="sb-label">{{ rm_severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="rm-bar-wrap">
      <div class="rm-bar">
        <div
          class="rm-bar-fill"
          :class="rm_severity.color"
          :style="{ width: (score / 24) * 100 + '%' }"
        />
      </div>
      <div class="rm-ticks">
        <span>0</span>
        <span class="t-g">4</span>
        <span class="t-y">8</span>
        <span class="t-o">14</span>
        <span>24</span>
      </div>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="instruction">
      <span class="inst-icon">📋</span>
      <span
        >請根據<strong>今天</strong>的身體狀況，勾選所有描述符合您情況的項目。每勾選一項得
        1 分，分數越高代表障礙越嚴重。</span
      >
    </div>

    <!-- ── Quick actions ──────────────────────────────────────── -->
    <div class="quick-row">
      <span class="q-label">快速操作：</span>
      <button class="q-btn" @click="toggleAll(true)">全選</button>
      <button class="q-btn" @click="toggleAll(false)">全清</button>
      <span class="q-checked">已勾選：{{ score }} 項</span>
    </div>

    <!-- ── Checklist ──────────────────────────────────────────── -->
    <div class="rm-list">
      <label
        v-for="(item, idx) in items"
        :key="item.key"
        class="rm-item"
        :class="{ 'rm-checked': checked[item.key] }"
      >
        <input
          type="checkbox"
          v-model="checked[item.key]"
          class="rm-checkbox"
        />
        <div class="rm-check-box" :class="{ checked: checked[item.key] }">
          <svg
            v-if="checked[item.key]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3.5"
            class="check-svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="rm-item-content">
          <span class="rm-num">{{
            (idx + 1).toString().padStart(2, "0")
          }}</span>
          <span class="rm-text">{{ item.text }}</span>
        </div>
      </label>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="rm-result" :class="rm_severity.color">
      <div class="rr-left">
        <span class="rr-n">{{ score }}</span>
        <span class="rr-u">/ 24</span>
      </div>
      <div class="rr-right">
        <span class="rr-level">{{ rm_severity.label }}</span>
        <span class="rr-detail">{{ rm_severity.detail }}</span>
      </div>
    </div>

    <!-- ── Reference table ───────────────────────────────────── -->
    <div class="ref-table">
      <div class="rt-row rt-header">
        <span>分數</span><span>障礙程度</span><span>建議</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score <= 4 }">
        <span class="rt-s normal-t">0–4</span><span>輕度</span
        ><span class="rt-sm">自我管理、運動</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 5 && score <= 8 }">
        <span class="rt-s mild-t">5–8</span><span>中度</span
        ><span class="rt-sm">物理治療</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 9 && score <= 14 }">
        <span class="rt-s moderate-t">9–14</span><span>中重度</span
        ><span class="rt-sm">多學科介入</span>
      </div>
      <div class="rt-row" :class="{ 'rt-active': score >= 15 }">
        <span class="rt-s severe-t">15–24</span><span>重度</span
        ><span class="rt-sm">積極多學科治療</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="rm_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="(item, idx) in items" :key="item.key" class="detail-row">
        <span class="detail-qnum">{{
          (idx + 1).toString().padStart(2, "0")
        }}</span>
        <span class="detail-domain">{{ item.text }}</span>
        <span
          class="detail-score"
          :class="checked[item.key] ? 'score-yes' : 'score-no'"
        >
          {{ checked[item.key] ? "✓ 是" : "✗ 否" }}
        </span>
        <span class="detail-desc">{{
          checked[item.key] ? "1 分" : "0 分"
        }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">總得分</span>
        <span class="detail-score brand">{{ score }}</span>
        <span class="detail-desc">{{ rm_severity.label }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="actions">
      <button class="btn-view" @click="rm_showResults = !rm_showResults">
        {{ rm_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="rm_copyMarkdown">
        {{ rm_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="rm_reset">重置</button>
    </div>
  </div>
  </div>
</template>

<style scoped>
.disability {
  max-width: 820px;
  margin: 0 auto;
}

.tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: wrap;
}

.tab-btn {
  flex: 1;
  min-width: 140px;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ Oswestry 失能指數（ODI · Disability Index）══════════════ */

.odi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.odi /* ── Header ────────────────────────────────────────────────────── */
.odi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.odi .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.odi .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.odi .score-badge {
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
.odi .sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.odi .sb-pct {
  font-size: 0.75rem;
  font-weight: 600;
  color: inherit;
}
.odi .sb-label {
  font-size: 0.72rem;
  font-weight: 700;
  line-height: 1.3;
}
.odi .score-badge.filling {
  color: var(--vp-c-text-3);
}
.odi .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi /* ── Progress bar ──────────────────────────────────────────────── */
.odi-bar-wrap {
  margin-bottom: 2rem;
}
.odi .odi-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.odi .odi-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.odi .odi-bar-fill.filling {
  background: var(--vp-c-divider);
}
.odi .odi-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.odi .odi-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.odi .odi-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.odi .odi-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.odi .odi-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.odi .t-g {
  color: #22c55e;
  font-weight: 700;
}
.odi .t-y {
  color: #f59e0b;
  font-weight: 700;
}
.odi .t-o {
  color: #f97316;
  font-weight: 700;
}
.odi .t-r {
  color: #ef4444;
  font-weight: 700;
}
.odi /* ── Completion row ────────────────────────────────────────────── */
.progress-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.odi .pr-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  flex-shrink: 0;
}
.odi .pr-bar {
  flex: 1;
  height: 4px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: hidden;
}
.odi .pr-fill {
  height: 100%;
  background: var(--vp-c-brand-1);
  border-radius: 999px;
  transition: width 0.3s;
}
.odi .pr-pct {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 30px;
  text-align: right;
}
.odi /* ── Instruction ───────────────────────────────────────────────── */
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
.odi /* ── Sections ──────────────────────────────────────────────────── */
.odi-sections {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
}
.odi .odi-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.odi .odi-section:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.odi .odi-section.sec-answered {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.odi .sec-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.5rem;
}
.odi .sec-title-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  flex-wrap: wrap;
}
.odi .sec-qnum {
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
.odi .sec-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.odi .sec-en {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.odi .sec-score {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.odi .sec-options {
  display: flex;
  flex-direction: column;
}
.odi .sec-opt {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  transition: background 0.12s;
  user-select: none;
}
.odi .sec-opt:last-child {
  border-bottom: none;
}
.odi .sec-opt:hover {
  background: var(--vp-c-bg-mute);
}
.odi .sec-opt.opt-selected {
  background: var(--vp-c-brand-soft);
}
.odi .sec-opt input[type="radio"] {
  display: none;
}
.odi .opt-radio {
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
.odi .opt-radio.selected {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
}
.odi .opt-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
}
.odi .opt-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.odi .opt-score-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border: 1.5px solid var(--vp-c-divider);
  flex-shrink: 0;
  transition:
    background 0.15s,
    border-color 0.15s,
    color 0.15s;
}
.odi .sec-opt.opt-selected .opt-score-badge {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  color: #fff;
  box-shadow: 0 1px 4px color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.odi .opt-text {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.45;
}
.odi .sec-opt.opt-selected .opt-text {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.odi /* ── Result card ───────────────────────────────────────────────── */
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
.odi .odi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .odi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .odi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .odi-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.odi .or-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.odi .or-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.odi .odi-result.normal .or-n {
  color: #22c55e;
}
.odi .odi-result.mild .or-n {
  color: #f59e0b;
}
.odi .odi-result.moderate .or-n {
  color: #f97316;
}
.odi .odi-result.severe .or-n {
  color: #ef4444;
}
.odi .or-u {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.odi .or-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.odi .or-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.odi .or-detail {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.odi .or-mgmt {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}
.odi /* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.odi .rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.odi .rt-row:last-child {
  border-bottom: none;
}
.odi .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.odi .rt-active {
  background: var(--vp-c-brand-soft);
}
.odi .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.odi .normal-t {
  color: #22c55e;
}
.odi .mild-t {
  color: #f59e0b;
}
.odi .moderate-t {
  color: #f97316;
}
.odi .severe-t {
  color: #ef4444;
}
.odi .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: left;
}
.odi /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.odi .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.odi .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.odi .detail-row:last-child {
  border-bottom: none;
}
.odi .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.odi .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
}
.odi .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.odi .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.odi .detail-score.score-marked {
  color: var(--vp-c-brand-1);
}
.odi .detail-score.score-zero {
  color: #22c55e;
}
.odi .detail-score.score-empty {
  color: var(--vp-c-text-3);
}
.odi .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.odi .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 120px;
  text-align: left;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.odi /* ── Actions ───────────────────────────────────────────────────── */
.odi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.odi .btn-view,
.odi .btn-copy,
.odi .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.odi .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.odi .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.odi .btn-view:active {
  transform: translateY(0);
}
.odi .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.odi .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.odi .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.odi .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.odi .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.odi .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.odi .odi-header {
    flex-direction: column;
  }
.odi .odi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.odi .detail-desc {
    display: none;
  }
}
/* ══════════════ Roland-Morris 問卷（RMDQ · Disability Questionnaire）══════════════ */

.rm {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.rm /* ── Header ────────────────────────────────────────────────────── */
.rm-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.rm .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.rm .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.rm .score-badge {
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
.rm .sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.rm .sb-max {
  display: none;
}
.rm .sb-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.rm .score-badge.filling {
  color: var(--vp-c-text-3);
}
.rm .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm /* ── Progress bar ──────────────────────────────────────────────── */
.rm-bar-wrap {
  margin-bottom: 2.5rem;
}
.rm .rm-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.rm .rm-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.rm .rm-bar-fill.filling {
  background: var(--vp-c-divider);
}
.rm .rm-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.rm .rm-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.rm .rm-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.rm .rm-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.rm .rm-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.rm .t-g {
  color: #22c55e;
  font-weight: 700;
}
.rm .t-y {
  color: #f59e0b;
  font-weight: 700;
}
.rm .t-o {
  color: #f97316;
  font-weight: 700;
}
.rm /* ── Instruction ───────────────────────────────────────────────── */
.instruction {
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
.rm .inst-icon {
  flex-shrink: 0;
}
.rm /* ── Quick row ─────────────────────────────────────────────────── */
.quick-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.rm .q-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.rm .q-btn {
  padding: 3px 12px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.rm .q-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.rm .q-checked {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  margin-left: auto;
}
.rm /* ── Checklist ─────────────────────────────────────────────────── */
.rm-list {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  margin-bottom: 1.25rem;
}
.rm .rm-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.6rem 0.85rem;
  border-radius: 9px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}
.rm .rm-item:hover {
  background: var(--vp-c-bg-mute);
}
.rm .rm-item.rm-checked {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .rm-checkbox {
  display: none;
}
.rm .rm-check-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.rm .rm-check-box.checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
.rm .check-svg {
  width: 12px;
  height: 12px;
  color: #fff;
}
.rm .rm-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}
.rm .rm-num {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.rm .rm-text {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.rm .rm-item.rm-checked .rm-text {
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
.rm /* ── Result card ───────────────────────────────────────────────── */
.rm-result {
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
.rm .rm-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .rm-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .rm-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .rm-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.rm .rr-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.rm .rr-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.rm .rm-result.normal .rr-n {
  color: #22c55e;
}
.rm .rm-result.mild .rr-n {
  color: #f59e0b;
}
.rm .rm-result.moderate .rr-n {
  color: #f97316;
}
.rm .rm-result.severe .rr-n {
  color: #ef4444;
}
.rm .rr-u {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.rm .rr-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.rm .rr-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.rm .rr-detail {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.rm /* ── Reference table ───────────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rm .rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.rm .rt-row:last-child {
  border-bottom: none;
}
.rm .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.rm .rt-active {
  background: var(--vp-c-brand-soft);
}
.rm .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.rm .normal-t {
  color: #22c55e;
}
.rm .mild-t {
  color: #f59e0b;
}
.rm .moderate-t {
  color: #f97316;
}
.rm .severe-t {
  color: #ef4444;
}
.rm .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.rm /* ── Results detail (NIHSS pattern) ───────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rm .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.rm .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.rm .detail-row:last-child {
  border-bottom: none;
}
.rm .detail-total {
  background: var(--vp-c-bg-mute);
}
.rm .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
}
.rm .detail-domain {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  flex: 1;
}
.rm .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.rm .detail-score.score-yes {
  color: #22c55e;
}
.rm .detail-score.score-no {
  color: var(--vp-c-text-3);
}
.rm .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.rm .detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 64px;
  text-align: left;
}
.rm /* ── Actions ───────────────────────────────────────────────────── */
.actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.rm .btn-view,
.rm .btn-copy,
.rm .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.rm .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.rm .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.rm .btn-view:active {
  transform: translateY(0);
}
.rm .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.rm .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.rm .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.rm .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.rm .rm-header {
    flex-direction: column;
  }
.rm .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.rm .sb-val {
    font-size: 1.5rem;
  }
.rm .rm-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.disability .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* fixed size so the card doesn't expand when the result appears */
  width: 128px;
  height: 104px;
  min-width: 128px;
  min-height: 104px;
  flex-shrink: 0;
  padding: 0.4rem 0.5rem;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.disability .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.disability .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.disability .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.disability .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.disability .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.disability .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.disability .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.disability .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.disability .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .disability .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}


/* ══ ODI/RM 加強：徽章排版與題目可讀性 ══ */

/* 分數與 % 同列，等級標籤換行置中 */
.disability .score-badge {
  flex-direction: row !important;
  flex-wrap: wrap !important;
  align-items: baseline !important;
  align-content: center !important;
  justify-content: center !important;
  column-gap: 3px;
}
.disability .sb-val {
  font-size: 1.7rem !important;
  font-weight: 800 !important;
  line-height: 1 !important;
}
.disability .sb-pct,
.disability .sb-max {
  font-size: 0.9rem !important;
  font-weight: 700 !important;
  opacity: 0.85;
}
.disability .sb-label {
  flex-basis: 100% !important;
  text-align: center !important;
  font-size: 0.68rem !important;
  font-weight: 600 !important;
  line-height: 1.25 !important;
  margin-top: 4px;
  word-break: break-word;
}

/* 題目與選項字級／對比 */
.disability .sec-title {
  font-size: 0.95rem !important;
  font-weight: 700 !important;
}
.disability .opt-text {
  font-size: 0.88rem !important;
  color: var(--vp-c-text-1) !important;
}
.disability .rm-text {
  font-size: 0.9rem !important;
  font-weight: 500 !important;
}
</style>
