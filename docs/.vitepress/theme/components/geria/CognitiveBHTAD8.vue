<script setup lang="ts">
import { ref, computed } from "vue";

// ── CognitiveBHT & AD8 — ICOPE 認知功能複評工具 ─────────────────
// BHT (Blessed Orientation-Memory-Concentration Test): Blessed et al., 1968
// 6 題，每題加權計分，總分 0–28，> 10 分提示認知異常
// AD8: Galvin et al., Neurology 2005;65:559–564. Public domain (Washington University)
// 8 題，回答「是，有改變」= 1 分；總分 ≥ 2 建議進一步評估

type Method = "BHT" | "AD8";
const method = ref<Method>("BHT");

// ── BHT 6 題（加權分） ────────────────────────────────────────────
const bhtItems = [
  {
    key: "b1",
    weight: 4,
    question: "現在是幾年？",
    en: "What year is it now?",
    hint: "請長者說出今年年份（民國或西元均可）",
    type: "binary",
  },
  {
    key: "b2",
    weight: 3,
    question: "現在是幾月？",
    en: "What month is it now?",
    hint: "請長者說出目前月份（差一個月內算正確）",
    type: "binary",
  },
  {
    key: "b3",
    weight: 3,
    question: "不看時鐘，現在大約是幾點？",
    en: "What time is it now (without looking at a clock)?",
    hint: "誤差在一小時內算正確",
    type: "binary",
  },
  {
    key: "b4",
    weight: 2,
    question: "倒數計算：從 20 倒數到 1（20, 19, 18…）",
    en: "Count backwards from 20 to 1",
    hint: "錯誤次數（含跳過、停頓超過 10 秒）",
    type: "count",
    max: 5,
    label: "錯誤次數（0–5）",
  },
  {
    key: "b5",
    weight: 2,
    question: "倒念月份：從 12 月倒念到 1 月",
    en: "Recite the months of the year in reverse order",
    hint: "錯誤次數（含跳過、停頓超過 10 秒）",
    type: "count",
    max: 5,
    label: "錯誤次數（0–5）",
  },
  {
    key: "b6",
    weight: 2,
    question: "重複記憶詞：請長者重複「約翰・布朗、42、高雄」，五分鐘後再問",
    en: 'Repeat "John Brown, 42, West Street" — recall after 5 min',
    hint: "每項記不起來算 1 個錯誤（姓名算 1、數字算 1、地名算 1）",
    type: "count",
    max: 3,
    label: "無法回憶項數（0–3）",
  },
];

const bhtAnswers = ref<Record<string, number>>(
  Object.fromEntries(bhtItems.map((q) => [q.key, -1])),
);

const bhtDone = computed(() =>
  bhtItems.every((q) => bhtAnswers.value[q.key] !== -1),
);

const bhtScore = computed(() => {
  if (!bhtDone.value) return null;
  return bhtItems.reduce((sum, q) => {
    const ans = bhtAnswers.value[q.key];
    if (ans <= 0) return sum;
    if (q.type === "binary") return sum + q.weight;
    return sum + q.weight * ans;
  }, 0);
});

const bhtSeverity = computed(() => {
  const s = bhtScore.value;
  if (s === null)
    return {
      level: "填寫中",
      color: "filling",
      advice: "完成所有題目後顯示評估建議",
    };
  if (s <= 4)
    return {
      level: "認知功能正常",
      color: "normal",
      advice: "BHT ≤ 4：認知功能在正常範圍，建議 6–12 個月後定期追蹤。",
    };
  if (s <= 9)
    return {
      level: "輕度認知障礙（疑似）",
      color: "mild",
      advice:
        "BHT 5–9：輕度認知障礙疑似，建議進一步使用 MoCA 或 MMSE 進行詳細評估。",
    };
  if (s <= 16)
    return {
      level: "中度認知障礙",
      color: "moderate",
      advice: "BHT 10–16：中度認知障礙，建議轉介神經內科或老年醫學科評估。",
    };
  return {
    level: "重度認知障礙",
    color: "critical",
    advice:
      "BHT ≥ 17：重度認知障礙，需立即安排完整神經認知評估及失智症排除診斷。",
  };
});

const bhtAnsweredCount = computed(
  () => bhtItems.filter((q) => bhtAnswers.value[q.key] !== -1).length,
);

// ── AD8 8 題 ───────────────────────────────────────────────────────
type AD8Ans = null | "yes" | "no" | "dk";

const ad8Items = [
  {
    key: "a1",
    question: "判斷力出現問題（如：做決定有困難、壞帳務決策、思考判斷困難）",
    en: "Problems with judgment (e.g., difficulty making decisions, bad financial decisions)",
  },
  {
    key: "a2",
    question: "對活動和嗜好的興趣降低",
    en: "Reduced interest in hobbies/activities",
  },
  {
    key: "a3",
    question: "一直重複同樣的事（同樣的問題、故事或話題）",
    en: "Repeats the same thing over and over (questions, stories, or statements)",
  },
  {
    key: "a4",
    question:
      "學習使用工具、設備、器具有困難（如：電視遙控器、微波爐、熱水瓶等）",
    en: "Trouble learning how to use a tool, appliance, or gadget",
  },
  {
    key: "a5",
    question: "忘記正確的年月日或是哪一年",
    en: "Forgets correct month or year",
  },
  {
    key: "a6",
    question: "處理複雜的財務事務有困難（如：繳費、財務、結帳）",
    en: "Trouble handling complicated financial affairs (e.g., paying bills, balancing checkbook)",
  },
  {
    key: "a7",
    question: "記住約定的事情有困難",
    en: "Difficulty remembering appointments",
  },
  {
    key: "a8",
    question: "每天都出現思考和記憶方面的問題",
    en: "Daily problems with thinking and/or memory",
  },
];

const ad8Answers = ref<Record<string, AD8Ans>>(
  Object.fromEntries(ad8Items.map((q) => [q.key, null])),
);

const ad8Score = computed(() =>
  ad8Items.reduce(
    (sum, q) => sum + (ad8Answers.value[q.key] === "yes" ? 1 : 0),
    0,
  ),
);

const ad8AnsweredCount = computed(
  () => ad8Items.filter((q) => ad8Answers.value[q.key] !== null).length,
);

const ad8Done = computed(() =>
  ad8Items.every((q) => ad8Answers.value[q.key] !== null),
);

const ad8Severity = computed(() => {
  const s = ad8Score.value;
  if (!ad8Done.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: "完成所有題目後顯示評估建議",
    };
  if (s <= 1)
    return {
      level: "認知功能正常（或未觀察到改變）",
      color: "normal",
      advice:
        "AD8 ≤ 1：未觀察到明顯認知改變。建議 6–12 個月後再次評估，或長者有症狀時提早複評。",
    };
  if (s <= 3)
    return {
      level: "疑似認知障礙（輕度）",
      color: "mild",
      advice:
        "AD8 2–3：觀察到部分認知改變，建議安排 MoCA 或 MMSE 進一步評估，並追蹤 3–6 個月。",
    };
  return {
    level: "疑似失智症（建議完整評估）",
    color: "critical",
    advice:
      "AD8 ≥ 4：多項認知功能改變，強烈建議轉介神經內科、精神科或老年醫學科進行完整失智症評估。",
  };
});

// ── Shared ────────────────────────────────────────────────────────
const copied = ref(false);
const showResults = ref(false);

function generateMarkdown() {
  if (method.value === "BHT") {
    const rows = bhtItems
      .map((q) => {
        const ans = bhtAnswers.value[q.key];
        const score =
          ans === -1
            ? "未填"
            : q.type === "binary"
              ? ans === 0
                ? "0（正確）"
                : `${q.weight}（錯誤）`
              : `${q.weight * ans}（${ans} 個錯誤 × ${q.weight}）`;
        return `- **${q.question}**（${q.en}）：${score}`;
      })
      .join("\n");
    return `# BHT 認知功能評估結果\n\n## 各題作答\n\n${rows}\n\n---\n\n## 計算結果\n\n- **BHT 總分**：${bhtScore.value ?? "未完成"} / 28\n- **嚴重程度**：${bhtSeverity.value.level}\n- **臨床建議**：${bhtSeverity.value.advice}`;
  } else {
    const rows = ad8Items
      .map((q) => {
        const ans = ad8Answers.value[q.key];
        const label =
          ans === "yes"
            ? "是，有改變（1 分）"
            : ans === "no"
              ? "否，沒有改變（0 分）"
              : "不知道（不計分）";
        return `- **${q.question}**（${q.en}）：${label}`;
      })
      .join("\n");
    return `# AD8 認知功能評估結果（家屬填答）\n\n## 各題作答\n\n${rows}\n\n---\n\n## 計算結果\n\n- **AD8 總分**：${ad8Score.value} / 8\n- **嚴重程度**：${ad8Severity.value.level}\n- **臨床建議**：${ad8Severity.value.advice}`;
  }
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  bhtItems.forEach((q) => {
    bhtAnswers.value[q.key] = -1;
  });
  ad8Items.forEach((q) => {
    ad8Answers.value[q.key] = null;
  });
  showResults.value = false;
}

function switchMethod(m: Method) {
  method.value = m;
  showResults.value = false;
}

const currentScore = computed(() =>
  method.value === "BHT" ? bhtScore.value : ad8Score.value,
);
const currentSeverity = computed(() =>
  method.value === "BHT" ? bhtSeverity.value : ad8Severity.value,
);
const currentDone = computed(() =>
  method.value === "BHT" ? bhtDone.value : ad8Done.value,
);
const currentAnsweredCount = computed(() =>
  method.value === "BHT" ? bhtAnsweredCount.value : ad8AnsweredCount.value,
);
const currentTotal = computed(() => (method.value === "BHT" ? 28 : 8));

const barPct = computed(() => {
  if (!currentDone.value || currentScore.value === null) return 0;
  return (currentScore.value / currentTotal.value) * 100;
});
</script>

<template>
  <div class="cog">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cog-header">
      <div class="header-title">
        <h2 class="title">BHT &amp; AD8 認知功能複評工具</h2>
        <p class="subtitle">
          ICOPE 認知功能異常複評 · Blessed Orientation-Memory-Concentration Test
          &amp; AD8
        </p>
        <p class="subtitle-hint">
          <span class="hint-tag">💡 若家屬回答，請使用 AD8</span>
        </p>
      </div>
      <div class="score-badge" :class="currentSeverity.color">
        <span class="badge-ver">{{ method }}</span>
        <span class="score-number">{{ currentDone ? currentScore : "—" }}</span>
        <span class="score-label">{{
          currentDone
            ? currentSeverity.level.length > 10
              ? currentSeverity.level.substring(0, 10) + "…"
              : currentSeverity.level
            : `${currentAnsweredCount}/${method === "BHT" ? bhtItems.length : 8}`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="currentSeverity.color"
          :style="{ width: barPct + '%' }"
        />
      </div>
      <template v-if="method === 'BHT'">
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 17.9%">5 ▾</span>
          <span class="tick-abs tick-orange" style="left: 35.7%">10 ▾</span>
          <span class="tick-abs tick-red" style="left: 60.7%">17 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">28</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 17.9%">輕度</span>
          <span class="label-abs tick-orange" style="left: 35.7%">中度</span>
          <span class="label-abs tick-red" style="left: 60.7%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 25%">2 ▾</span>
          <span class="tick-abs tick-orange" style="left: 50%">4 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">8</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 25%">輕度疑似</span>
          <span class="label-abs tick-orange" style="left: 50%"
            >中度建議完整評估</span
          >
          <span class="label-abs tick-red" style="left: 100%"
            >重度建議完整評估</span
          >
        </div>
      </template>
    </div>

    <!-- ── ICOPE 異常提示 ──────────────────────────────────────── -->
    <div class="icope-notice">
      <span class="notice-icon">📋</span>
      <span>
        本工具用於
        <strong>ICOPE 認知功能初評異常</strong
        >後的複評。初評任一認知題（記憶力或定向力）答案為「否」，即應選用此工具進行確認。
        <span class="notice-sep">·</span>
        <strong class="ad8-hint"
          >若由家屬或主要照顧者填答，請切換至 AD8 量表。</strong
        >
      </span>
    </div>

    <!-- ── Version tab selector ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">版本選擇</span>
        <span class="group-sub-text">長者本人 → BHT　家屬 / 照顧者 → AD8</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': method === 'BHT' }"
          @click="switchMethod('BHT')"
        >
          <span class="tab-title">BHT</span>
          <span class="tab-sub">6 題 · 由長者本人作答 · 3–5 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-ad8': method === 'AD8' }"
          @click="switchMethod('AD8')"
        >
          <span class="tab-title ad8-title">AD8</span>
          <span class="tab-sub"
            >8 題 · 由<strong>家屬/照顧者</strong>回答 · 2–4 分鐘</span
          >
        </button>
      </div>
      <div class="method-note" :class="`note-${method.toLowerCase()}`">
        <template v-if="method === 'BHT'">
          <strong>BHT（Blessed 定向記憶集中測驗）：</strong>由 Blessed
          等人（1968）研發，評估定向力、計算力與短期記憶。採加權計分（總分
          0–28）， ≤ 4 為正常，≥ 10
          提示認知異常，需轉介進一步評估。適合長者本人作答，MMSE ≥ 15 者適用。
        </template>
        <template v-else>
          <strong>AD8（8-item Informant Interview）：</strong>由 Galvin
          等人（2005，華盛頓大學）研發，<strong>由家屬或主要照顧者</strong>回答，評估過去數年間認知功能的改變。≥
          2 分提示可能有認知障礙，敏感性 84%、特異性
          86%。特別適合長者本人認知不足以自行作答時使用。
        </template>
      </div>
    </div>

    <!-- ══ BHT 題目 ══ -->
    <template v-if="method === 'BHT'">
      <div class="nihss-group">
        <div class="group-header-bar bht-bar">
          <span class="group-icon">🧠</span>
          <span class="group-label-text">BHT 題目</span>
          <span class="group-sub-text"
            >定向力 + 計算力 + 短期記憶（加權計分）</span
          >
          <span class="group-score-tally bht-tally">
            {{ bhtAnsweredCount }}/{{ bhtItems.length }} 題 ·
            {{ bhtDone ? bhtScore + " 分" : "—" }}
          </span>
        </div>
        <div class="item-list">
          <div
            v-for="(q, idx) in bhtItems"
            :key="q.key"
            class="cog-item"
            :class="{
              answered: bhtAnswers[q.key] !== -1,
              item_ok: bhtAnswers[q.key] === 0,
              item_err: bhtAnswers[q.key] > 0 && bhtAnswers[q.key] !== -1,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum bht-q">B{{ idx + 1 }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.question }}</span>
                <span class="item-sub">{{ q.en }} · {{ q.hint }}</span>
              </div>
              <div class="item-weight-badge">
                <span class="weight-val">×{{ q.weight }}</span>
                <span class="weight-label">加權</span>
              </div>
              <span
                class="item-score"
                :class="{
                  'score-ok': bhtAnswers[q.key] === 0,
                  'score-err': bhtAnswers[q.key] > 0,
                  'score-nd': bhtAnswers[q.key] === -1,
                }"
              >
                {{
                  bhtAnswers[q.key] === -1
                    ? "—"
                    : q.type === "binary"
                      ? bhtAnswers[q.key] === 0
                        ? "0"
                        : q.weight
                      : q.weight * bhtAnswers[q.key]
                }}
              </span>
            </div>
            <div v-if="q.type === 'binary'" class="yn-row">
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': bhtAnswers[q.key] === 0 }"
                @click="bhtAnswers[q.key] = 0"
              >
                ✓ 正確（0 分）
              </button>
              <button
                class="btn-yn btn-yn-abn"
                :class="{ 'yn-abn-active': bhtAnswers[q.key] === 1 }"
                @click="bhtAnswers[q.key] = 1"
              >
                ✗ 錯誤（{{ q.weight }} 分）
              </button>
            </div>
            <div v-else class="count-row">
              <span class="count-label">{{ q.label }}：</span>
              <div class="count-btns">
                <button
                  v-for="n in (q.max ?? 3) + 1"
                  :key="n - 1"
                  class="count-btn"
                  :class="{
                    'count-ok': n - 1 === 0 && bhtAnswers[q.key] === 0,
                    'count-err': n - 1 > 0 && bhtAnswers[q.key] === n - 1,
                    'count-active': bhtAnswers[q.key] === n - 1,
                  }"
                  @click="bhtAnswers[q.key] = n - 1"
                >
                  {{ n - 1 }}
                </button>
              </div>
              <span class="count-score-hint" v-if="bhtAnswers[q.key] > 0">
                → {{ q.weight }} × {{ bhtAnswers[q.key] }} =
                <strong>{{ q.weight * bhtAnswers[q.key] }} 分</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ AD8 題目 ══ -->
    <template v-else>
      <div class="nihss-group">
        <div class="group-header-bar ad8-bar">
          <span class="group-icon">👥</span>
          <span class="group-label-text">AD8 題目（家屬 / 照顧者填答）</span>
          <span class="group-sub-text">比較過去數年間的認知功能改變</span>
          <span class="group-score-tally ad8-tally">
            {{ ad8AnsweredCount }}/8 題 · {{ ad8Done ? ad8Score + " 分" : "—" }}
          </span>
        </div>
        <div class="ad8-family-notice">
          <span>👨‍👩‍👧</span>
          <span
            >以下問題請<strong>家屬或主要照顧者</strong>依據長者<strong>過去數年</strong>的認知功能改變情況回答。請對比長者<em>過去的狀況</em>，判斷目前是否有改變。</span
          >
        </div>
        <div class="item-list">
          <div
            v-for="(q, idx) in ad8Items"
            :key="q.key"
            class="cog-item"
            :class="{
              answered: ad8Answers[q.key] !== null,
              item_ok: ad8Answers[q.key] === 'no',
              item_err: ad8Answers[q.key] === 'yes',
              item_dk: ad8Answers[q.key] === 'dk',
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum ad8-q">A{{ idx + 1 }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.question }}</span>
                <span class="item-sub">{{ q.en }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  'score-ok': ad8Answers[q.key] === 'no',
                  'score-err': ad8Answers[q.key] === 'yes',
                  'score-nd':
                    ad8Answers[q.key] === null || ad8Answers[q.key] === 'dk',
                }"
              >
                {{
                  ad8Answers[q.key] === null
                    ? "—"
                    : ad8Answers[q.key] === "yes"
                      ? "1"
                      : ad8Answers[q.key] === "dk"
                        ? "?"
                        : "0"
                }}
              </span>
            </div>
            <div class="yn-row yn-row-3">
              <button
                class="btn-yn btn-yn-abn"
                :class="{ 'yn-abn-active': ad8Answers[q.key] === 'yes' }"
                @click="ad8Answers[q.key] = 'yes'"
              >
                是，有改變（1 分）
              </button>
              <button
                class="btn-yn btn-yn-ok"
                :class="{ 'yn-ok-active': ad8Answers[q.key] === 'no' }"
                @click="ad8Answers[q.key] = 'no'"
              >
                否，沒有改變（0 分）
              </button>
              <button
                class="btn-yn btn-yn-dk"
                :class="{ 'yn-dk-active': ad8Answers[q.key] === 'dk' }"
                @click="ad8Answers[q.key] = 'dk'"
              >
                不知道（不計分）
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cog-result" :class="currentSeverity.color">
      <div class="result-left">
        <span class="result-number">{{
          currentDone ? currentScore : "—"
        }}</span>
        <span class="result-max">/ {{ currentTotal }}</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ currentSeverity.level }}</span>
        <span class="result-advice">{{ currentSeverity.advice }}</span>
        <span class="result-calc" v-if="currentDone">{{
          method === "BHT"
            ? "加權計分（錯誤次數 × 加權值）"
            : "是=1分，否/不知道=0分"
        }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && currentDone" class="results-detail">
      <div class="results-header">評估明細</div>
      <template v-if="method === 'BHT'">
        <div v-for="(q, idx) in bhtItems" :key="q.key" class="detail-row">
          <span class="detail-qnum">B{{ idx + 1 }}</span>
          <span class="detail-domain">{{ q.question }}</span>
          <span
            class="detail-score"
            :class="{
              'ds-abn': bhtAnswers[q.key] > 0,
              'ds-ok': bhtAnswers[q.key] === 0,
            }"
          >
            {{
              bhtAnswers[q.key] === -1
                ? "—"
                : q.type === "binary"
                  ? bhtAnswers[q.key] === 0
                    ? "0"
                    : q.weight
                  : q.weight * bhtAnswers[q.key]
            }}
          </span>
          <span class="detail-desc">分</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">BHT 加權總分</span>
          <span class="detail-score detail-score-brand">{{ bhtScore }}</span>
          <div class="detail-desc detail-desc-block">
            <span class="detail-desc-unit">/ 28</span>
            <span class="detail-desc-label">{{ bhtSeverity.level }}</span>
          </div>
        </div>
      </template>
      <template v-else>
        <div v-for="(q, idx) in ad8Items" :key="q.key" class="detail-row">
          <span class="detail-qnum">A{{ idx + 1 }}</span>
          <span class="detail-domain">{{ q.question }}</span>
          <span
            class="detail-score"
            :class="{
              'ds-abn': ad8Answers[q.key] === 'yes',
              'ds-ok': ad8Answers[q.key] === 'no',
            }"
          >
            {{
              ad8Answers[q.key] === "yes"
                ? "1"
                : ad8Answers[q.key] === "no"
                  ? "0"
                  : "?"
            }}
          </span>
          <span class="detail-desc">{{
            ad8Answers[q.key] === "yes"
              ? "有改變"
              : ad8Answers[q.key] === "no"
                ? "無改變"
                : "不知道"
          }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">AD8 總分</span>
          <span class="detail-score detail-score-brand">{{ ad8Score }}</span>
          <div class="detail-desc detail-desc-block">
            <span class="detail-desc-unit">/ 8</span>
            <span class="detail-desc-label">{{ ad8Severity.level }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- ── Alert ──────────────────────────────────────────────── -->
    <div
      v-if="currentDone && currentSeverity.color !== 'normal'"
      class="cog-alert"
      :class="`alert-${currentSeverity.color}`"
    >
      <span class="alert-icon">⚠</span>
      <span
        ><strong
          >{{ method }} 陽性篩查（總分 {{ currentScore }}/{{
            currentTotal
          }}）：</strong
        >{{ currentSeverity.advice }}</span
      >
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >BHT 及 AD8
        均為認知篩查工具，陽性結果需轉介神經內科、精神科或老年醫學科進行
        MMSE、MoCA 等標準化測試及完整失智症鑑別診斷。嚴重認知障礙（MMSE &lt;
        10）者可能影響 BHT 作答可信度，建議改用 AD8 由家屬回答。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="ens-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!currentDone" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!currentDone" class="progress-hint">
      已完成 {{ currentAnsweredCount }}/{{
        method === "BHT" ? bhtItems.length : 8
      }}
      題，尚餘
      {{ (method === "BHT" ? bhtItems.length : 8) - currentAnsweredCount }} 題
    </p>
  </div>
</template>

<style scoped>
.cog {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.cog-header {
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
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.subtitle-hint {
  margin: 0.25rem 0 0;
}
.hint-tag {
  display: inline-block;
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  white-space: nowrap;
}

/* ── Score badge — FIXED: flex-shrink:0 + min-height prevents squeeze/grow ── */
.score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.badge-ver {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
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
  color: #f59e0b;
  font-weight: 700;
}
.tick-orange {
  color: #f97316;
  font-weight: 700;
}
.tick-red {
  color: #ef4444;
  font-weight: 700;
}

/* ── Alert ───────────────────────────────────────────────────────── */
.cog-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.alert-mild {
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.35);
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

/* ── ICOPE notice ────────────────────────────────────────────────── */
.icope-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: rgba(99, 102, 241, 0.05);
  border: 1px solid rgba(99, 102, 241, 0.25);
  border-left: 3px solid #7c3aed;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.notice-icon {
  flex-shrink: 0;
}
.notice-sep {
  margin: 0 6px;
  color: var(--vp-c-text-3);
}
.ad8-hint {
  color: #6366f1;
}

/* ── Groups ──────────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.04),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #38bdf8;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.04);
}
.tab-bar {
  border-left: 3px solid #6366f1;
}
.bht-bar {
  border-left: 3px solid #0ea5e9;
}
.ad8-bar {
  border-left: 3px solid #a855f7;
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
}
.bht-tally {
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
}
.ad8-tally {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}

/* ── Tab toggle ──────────────────────────────────────────────────── */
.tab-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.tab-btn.tab-active {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.06);
}
.tab-btn.tab-active-ad8 {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.06);
}
.tab-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tab-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.tab-btn.tab-active .tab-title {
  color: #0ea5e9;
}
.tab-btn.tab-active-ad8 .tab-title {
  color: #a855f7;
}
.ad8-title {
  color: var(--vp-c-text-1);
}
.tab-btn.tab-active-ad8 .ad8-title {
  color: #a855f7;
}

/* ── Method note ─────────────────────────────────────────────────── */
.method-note {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
}
.note-bht {
  background: rgba(14, 165, 233, 0.04);
  border-color: rgba(14, 165, 233, 0.25);
}
.note-ad8 {
  background: rgba(168, 85, 247, 0.04);
  border-color: rgba(168, 85, 247, 0.25);
}

/* ── AD8 family notice ───────────────────────────────────────────── */
.ad8-family-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: rgba(168, 85, 247, 0.06);
  border: 1px solid rgba(168, 85, 247, 0.3);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 0.75rem;
}

/* ── Item list ───────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cog-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cog-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cog-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.cog-item.item_ok {
  border-color: #22c55e;
}
.cog-item.item_err {
  border-color: #f97316;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.cog-item.item_dk {
  border-color: var(--vp-c-divider);
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
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.bht-q {
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
}
.ad8-q {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
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
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.item-weight-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
}
.weight-val {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0ea5e9;
  line-height: 1;
}
.weight-label {
  font-size: 0.55rem;
  color: #0ea5e9;
  opacity: 0.7;
}
.item-score {
  font-size: 1rem;
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
.score-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.score-err {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.score-nd {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Yes / No buttons ────────────────────────────────────────────── */
.yn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.yn-row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.btn-yn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}
.btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.btn-yn-ok.yn-ok-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.btn-yn-abn.yn-abn-active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.btn-yn-dk.yn-dk-active {
  border-color: #9ca3af;
  background: linear-gradient(
    180deg,
    rgba(156, 163, 175, 0.12),
    rgba(156, 163, 175, 0.06)
  );
  color: var(--vp-c-text-2);
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.08);
}

/* ── Count row ───────────────────────────────────────────────────── */
.count-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
  flex-wrap: wrap;
  border-top: 1px solid var(--vp-c-divider);
}
.count-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.count-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.count-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.count-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.count-btn.count-active.count-ok {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.count-btn.count-active.count-err {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.count-score-hint {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}

/* ── Result card — FIXED: stationary size ───────────────────────── */
.cog-result {
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
  min-height: 96px;
  box-sizing: border-box;
}
.cog-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  min-width: 130px;
}

.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cog-result.normal .result-number {
  color: #22c55e;
}
.cog-result.mild .result-number {
  color: #f59e0b;
}
.cog-result.moderate .result-number {
  color: #f97316;
}
.cog-result.critical .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
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
.result-calc {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}

/* ── Results detail ──────────────────────────────────────────────── */
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
  background: var(--vp-c-bg-mute);
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
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
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-score.ds-abn {
  color: #f97316;
}
.detail-score.ds-ok {
  color: #22c55e;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
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

/* ── Warning box ─────────────────────────────────────────────────── */
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
.ens-actions {
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
  .cog-header {
    flex-wrap: wrap;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .cog-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .yn-row-3 {
    grid-template-columns: 1fr;
  }
}
</style>
