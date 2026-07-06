<script setup lang="ts">
import { ref, computed, type Ref } from "vue";

const activeTab = ref<"icope" | "cog" | "sppb" | "mna" | "gds" | "vis">("icope");

// ── Drag-to-scroll for the wrapper tab bar (mouse) ────────────────
const tabBarEl = ref<HTMLElement | null>(null);
let tabDragDown = false;
let tabDragging = false;
let tabDragStartX = 0;
let tabDragScroll = 0;
function tabBarPointerDown(e: PointerEvent) {
  if (e.pointerType !== "mouse" || !tabBarEl.value) return;
  tabDragDown = true; tabDragging = false;
  tabDragStartX = e.clientX; tabDragScroll = tabBarEl.value.scrollLeft;
}
function tabBarPointerMove(e: PointerEvent) {
  const el = tabBarEl.value;
  if (!el || !tabDragDown) return;
  const dx = e.clientX - tabDragStartX;
  if (!tabDragging && Math.abs(dx) > 4) { tabDragging = true; el.setPointerCapture(e.pointerId); }
  if (tabDragging) el.scrollLeft = tabDragScroll - dx;
}
function tabBarPointerUp(e: PointerEvent) {
  tabDragDown = false;
  if (tabDragging && tabBarEl.value?.hasPointerCapture(e.pointerId)) tabBarEl.value.releasePointerCapture(e.pointerId);
  tabDragging = false;
}

// ══════════════ WHO ICOPE 功能篩查（Integrated Care for Older People）══════════════

type Ans = null | "Y" | "N";

const cog1 = ref<Ans>(null);
const cog2 = ref<Ans>(null);
const cog3 = ref<Ans>(null);
const mob1 = ref<Ans>(null);
const nut1 = ref<Ans>(null);
const nut2 = ref<Ans>(null);
const vis1 = ref<Ans>(null);
const hear1 = ref<Ans>(null);
const dep1 = ref<Ans>(null);
const dep2 = ref<Ans>(null);
const med1 = ref<Ans>(null);
const med2 = ref<Ans>(null);
const med3 = ref<Ans>(null);
const soc1 = ref<Ans>(null);
const soc2 = ref<Ans>(null);
const soc3 = ref<Ans>(null);

const icope_showResults = ref(false);
const icope_copied = ref(false);

const cogAbn = computed(
  () => cog1.value === "N" || cog2.value === "N" || cog3.value === "N",
);
const mobAbn = computed(() => mob1.value === "N");
const nutAbn = computed(() => nut1.value === "N" || nut2.value === "N");
const visAbn = computed(() => vis1.value === "N");
const hearAbn = computed(() => hear1.value === "N");
const depAbn = computed(() => dep1.value === "N" || dep2.value === "N");

const anyAbn = computed(
  () =>
    cogAbn.value ||
    mobAbn.value ||
    nutAbn.value ||
    visAbn.value ||
    hearAbn.value ||
    depAbn.value,
);

const cogDone = computed(
  () => cog1.value !== null && cog2.value !== null && cog3.value !== null,
);
const mobDone = computed(() => mob1.value !== null);
const nutDone = computed(() => nut1.value !== null && nut2.value !== null);
const visDone = computed(() => vis1.value !== null);
const hearDone = computed(() => hear1.value !== null);
const depDone = computed(() => dep1.value !== null && dep2.value !== null);

const primaryDone = computed(
  () =>
    cogDone.value &&
    mobDone.value &&
    nutDone.value &&
    visDone.value &&
    hearDone.value &&
    depDone.value,
);

const medDone = computed(
  () => [med1.value, med2.value, med3.value].filter((v) => v !== null).length,
);
const socDone = computed(
  () => [soc1.value, soc2.value, soc3.value].filter((v) => v !== null).length,
);

const icope_isComplete = computed(() => {
  if (!primaryDone.value) return false;
  if (!anyAbn.value) return true;
  return medDone.value === 3 && socDone.value === 3;
});

const abnDomains = computed(() => {
  const d: string[] = [];
  if (cogAbn.value) d.push("認知功能");
  if (mobAbn.value) d.push("行動功能");
  if (nutAbn.value) d.push("營養不良");
  if (visAbn.value) d.push("視力障礙");
  if (hearAbn.value) d.push("聽力障礙");
  if (depAbn.value) d.push("憂鬱症狀");
  return d;
});
const abnCount = computed(() => abnDomains.value.length);

const reviewTools: Record<string, { tool: string; detail: string }> = {
  認知功能: {
    tool: "BHT 或 AD8 量表",
    detail:
      "選用 BHT（Blessed 定向記憶集中測驗）或 AD8（8 題版，由家屬回答）進行認知功能複評。",
  },
  行動功能: {
    tool: "SPPB 量表",
    detail:
      "簡易體能狀況量表：平衡測試、4 公尺步行速度、5 次椅子起身，評估下肢功能與跌倒風險。",
  },
  營養不良: {
    tool: "MNA-SF 量表",
    detail:
      "迷你營養評估簡式版（6 題）：< 12 分為有營養風險，需轉介營養師評估。",
  },
  視力障礙: {
    tool: "眼科轉介 / WHO 視力量表",
    detail:
      "自述有困難 → 轉介眼科；無主訴但懷疑 → 進行 WHO Tumbling E 視力量表測試。",
  },
  聽力障礙: {
    tool: "醫療院所聽力檢測",
    detail: "轉介醫療院所進行純音聽力測試（35 dB 以下為通過標準）。",
  },
  憂鬱症狀: {
    tool: "GDS-15 量表",
    detail:
      "老年抑鬱量表 15 題版：≥ 5 分提示輕度抑鬱，≥ 11 分為重度，建議轉介精神科或心理師。",
  },
};
const domainColors: Record<string, string> = {
  認知功能: "#6366f1",
  行動功能: "#f97316",
  營養不良: "#22c55e",
  視力障礙: "#06b6d4",
  聽力障礙: "#f59e0b",
  憂鬱症狀: "#e879f9",
};

function genMarkdown() {
  const s = (v: Ans) =>
    v === null ? "未填" : v === "Y" ? "✅ 正常" : "⚠️ 異常";
  let o = `# WHO ICOPE 長者功能篩查結果\n\n## 初評結果\n\n`;
  o += `| 評估域 | 結果 |\n|--------|------|\n`;
  o += `| 認知功能 | ${cogDone.value ? (cogAbn.value ? "⚠️ 異常" : "✅ 正常") : "未完成"} |\n`;
  o += `| 行動功能 | ${s(mob1.value)} |\n`;
  o += `| 營養不良 | ${nutDone.value ? (nutAbn.value ? "⚠️ 異常" : "✅ 正常") : "未完成"} |\n`;
  o += `| 視力障礙 | ${s(vis1.value === "N" ? "N" : vis1.value === "Y" ? "Y" : null)} |\n`;
  o += `| 聽力障礙 | ${s(hear1.value)} |\n`;
  o += `| 憂鬱症狀 | ${depDone.value ? (depAbn.value ? "⚠️ 異常" : "✅ 正常") : "未完成"} |\n\n`;
  if (abnCount.value > 0) {
    o += `**異常項目（${abnCount.value} 項）：** ${abnDomains.value.join("、")}\n\n`;
    o += `## 建議複評工具\n\n`;
    abnDomains.value.forEach((d) => {
      o += `- **${d}** → ${reviewTools[d].tool}\n`;
    });
    o += `\n`;
  } else {
    o += `**所有初評項目正常。** 建議 6–12 個月後定期再次篩查。\n\n`;
  }
  if (anyAbn.value) {
    o += `## 用藥評估\n\n`;
    o += `- 每日用藥 ≥ 10 種：${med1.value === "N" ? "是（建議納入藥事照護計畫）" : "否"}\n`;
    o += `- 含止痛藥/助眠藥：${med2.value === "N" ? "是" : "否"}\n`;
    o += `- 藥物副作用症狀：${med3.value === "N" ? "是（建議提供用藥衛教）" : "否"}\n\n`;
    o += `## 社會照護評估\n\n`;
    o += `- ADL 困難：${soc1.value === "N" ? "是（建議轉介長照管理中心）" : "否"}\n`;
    o += `- 居住/財務困難：${soc2.value === "N" ? "是（建議轉介社工師）" : "否"}\n`;
    o += `- 孤獨/缺乏社交：${soc3.value === "N" ? "是（建議轉介社區據點）" : "否"}\n`;
  }
  return o;
}

async function icope_copyOutput() {
  await navigator.clipboard.writeText(genMarkdown());
  icope_copied.value = true;
  setTimeout(() => (icope_copied.value = false), 2000);
}

function icope_reset() {
  cog1.value = null;
  cog2.value = null;
  cog3.value = null;
  mob1.value = null;
  nut1.value = null;
  nut2.value = null;
  vis1.value = null;
  hear1.value = null;
  dep1.value = null;
  dep2.value = null;
  med1.value = null;
  med2.value = null;
  med3.value = null;
  soc1.value = null;
  soc2.value = null;
  soc3.value = null;
  icope_showResults.value = false;
}

// ══════════════ BHT・AD8 認知複評（Cognitive Assessment）══════════════

// ── CognitiveBHT & AD8 — ICOPE 認知功能複評工具 ─────────────────
// BHT (Blessed Orientation-Memory-Concentration Test): Blessed et al., 1968
// 6 題，每題加權計分，總分 0–28，> 10 分提示認知異常
// AD8: Galvin et al., Neurology 2005;65:559–564. Public domain (Washington University)
// 8 題，回答「是，有改變」= 1 分；總分 ≥ 2 建議進一步評估

type cog_Method = "BHT" | "AD8" | "TDS";
const cog_method = ref<cog_Method>("BHT");

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

// ── TDS 腦力健診篩檢工具 ──────────────────────────────────────────────
// Taiwan's TDS (腦力健診) cognitive screening tool
// 4 domains: Orientation (4pts) + Registration (5pts) + Fluency (2pts) + Recall (5pts) = 16
const tdsPerson = ref({
  name: "",
  gender: "" as "" | "M" | "F",
  testY: "",
  testM: "",
  testD: "",
  birthY: "",
  birthM: "",
  birthD: "",
});

const tdsBasicIssues = ref({
  selfMemory: false,
  familyMemory: false,
  examinerMemory: false,
});

const tdsRiskFactors = ref({
  edu: "",
  bmi: "",
  stroke: false,
  dm: false,
  dmMeds: false,
  htn: false,
  htnMeds: false,
  chol: false,
  cholMeds: false,
  headInjury: false,
  forgetMeds: false,
  antidepressants: false,
  source: "" as "" | "self" | "family",
});

// Orientation: year, month, day, weekday
const tdsOrientation = ref<Record<string, boolean | null>>({
  year: null,
  month: null,
  day: null,
  weekday: null,
});

// Registration: 5 words (牙齒、毛線、教堂、菊花、紅色)
const tdsWords = ["牙齒", "毛線", "教堂", "菊花", "紅色"];
const tdsRegistration = ref<number>(-1); // 0-5 correct on first attempt

// Fluency: count of 4-legged animals named in 1 min
const tdsFluency = ref<number>(-1); // count

// Recall: 5 words recall
const tdsRecall = ref<number>(-1); // 0-5 correct

const tdsOrientationScore = computed(() => {
  const vals = Object.values(tdsOrientation.value);
  if (vals.some((v) => v === null)) return null;
  return vals.filter(Boolean).length;
});

const tdsRegistrationScore = computed(() => tdsRegistration.value);
const tdsFluencyScore = computed(() => {
  const c = tdsFluency.value;
  if (c < 0) return null;
  if (c >= 9) return 2;
  if (c >= 5) return 1;
  return 0;
});
const tdsRecallScore = computed(() => tdsRecall.value);

const tdsTotal = computed(() => {
  const o = tdsOrientationScore.value;
  const r = tdsRegistrationScore.value;
  const f = tdsFluencyScore.value;
  const rec = tdsRecallScore.value;
  if (o === null || r < 0 || f === null || rec < 0) return null;
  return o + r + f + rec;
});

const tdsDone = computed(() => {
  const orientDone = Object.values(tdsOrientation.value).every(
    (v) => v !== null,
  );
  return (
    orientDone &&
    tdsRegistration.value >= 0 &&
    tdsFluency.value >= 0 &&
    tdsRecall.value >= 0
  );
});

const tdsAnsweredCount = computed(() => {
  let n = 0;
  Object.values(tdsOrientation.value).forEach((v) => {
    if (v !== null) n++;
  });
  if (tdsRegistration.value >= 0) n++;
  if (tdsFluency.value >= 0) n++;
  if (tdsRecall.value >= 0) n++;
  return n;
});

const tdsSeverity = computed(() => {
  const s = tdsTotal.value;
  if (s === null)
    return {
      level: "填寫中",
      color: "filling",
      advice: "完成所有題目後顯示評估建議",
    };
  if (s >= 13)
    return {
      level: "認知功能正常",
      color: "normal",
      advice: `TDS ≥ 13（${s}/16）：認知功能在正常範圍，建議定期追蹤。`,
    };
  if (s >= 10)
    return {
      level: "輕度認知障礙（疑似）",
      color: "mild",
      advice: `TDS 10–12（${s}/16）：輕度認知障礙疑似，建議進一步使用 MoCA 或 MMSE 進行詳細評估。`,
    };
  if (s >= 7)
    return {
      level: "中度認知障礙",
      color: "moderate",
      advice: `TDS 7–9（${s}/16）：中度認知障礙，建議轉介神經內科或老年醫學科評估。`,
    };
  return {
    level: "重度認知障礙",
    color: "critical",
    advice: `TDS ≤ 6（${s}/16）：重度認知障礙，需立即安排完整神經認知評估及失智症排除診斷。`,
  };
});

// ── Shared ────────────────────────────────────────────────────────
const cog_copied = ref(false);
const cog_showResults = ref(false);

function cog_generateMarkdown() {
  if (cog_method.value === "BHT") {
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
  } else if (cog_method.value === "AD8") {
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
  } else {
    const p = tdsPerson.value;
    const bi = tdsBasicIssues.value;
    const rf = tdsRiskFactors.value;
    const orientLabels: Record<string, string> = {
      year: "今年是哪一年",
      month: "現在是幾月",
      day: "今天是幾號",
      weekday: "今天是星期幾",
    };
    const orientRows = Object.entries(tdsOrientation.value)
      .map(
        ([k, v]) =>
          `- **${orientLabels[k] ?? k}**：${v === null ? "未填" : v ? "正確（1）" : "錯誤（0）"}`,
      )
      .join("\n");
    const regLabel =
      tdsRegistration.value < 0 ? "未填" : `${tdsRegistration.value} / 5`;
    const fluRaw = tdsFluency.value < 0 ? "未填" : `${tdsFluency.value} 個`;
    const fluScore =
      tdsFluencyScore.value === null ? "—" : `${tdsFluencyScore.value} 分`;
    const recLabel = tdsRecall.value < 0 ? "未填" : `${tdsRecall.value} / 5`;
    return `# TDS 腦力健診篩檢結果\n\n## 基本資料\n\n- **姓名**：${p.name || "—"}\n- **性別**：${p.gender === "M" ? "男" : p.gender === "F" ? "女" : "—"}\n- **施測日期**：${p.testY || "—"} / ${p.testM || "—"} / ${p.testD || "—"}\n- **出生日期**：${p.birthY || "—"} / ${p.birthM || "—"} / ${p.birthD || "—"}\n\n## 基本問題\n\n- 自覺記憶力減退：${bi.selfMemory ? "有" : "無"}\n- 親友覺得記憶力減退：${bi.familyMemory ? "有" : "無"}\n- 施測者認為有記憶力障礙：${bi.examinerMemory ? "有" : "無"}\n\n## 危險因子\n\n- 教育年數：${rf.edu || "—"}\n- BMI：${rf.bmi || "—"}\n- 中風病史：${rf.stroke ? "有" : "無"}\n- 糖尿病：${rf.dm ? `有（藥物治療：${rf.dmMeds ? "有" : "無"}）` : "無"}\n- 高血壓：${rf.htn ? `有（藥物治療：${rf.htnMeds ? "有" : "無"}）` : "無"}\n- 高膽固醇：${rf.chol ? `有（藥物治療：${rf.cholMeds ? "有" : "無"}）` : "無"}\n- 頭部外傷昏迷：${rf.headInjury ? "有" : "無"}\n- 時常忘記服藥：${rf.forgetMeds ? "有" : "無"}\n- 抗憂鬱藥物或情緒低落：${rf.antidepressants ? "有" : "無"}\n\n## 各項得分\n\n### 定向力（/4）\n${orientRows}\n\n### 訊息登錄（/5）\n- 正確：${regLabel}\n\n### 思考流暢（/2）\n- 動物數：${fluRaw} → ${fluScore}\n\n### 訊息回憶（/5）\n- 正確：${recLabel}\n\n---\n\n## 計算結果\n\n- **TDS 總分**：${tdsTotal.value ?? "未完成"} / 16\n- **嚴重程度**：${tdsSeverity.value.level}\n- **臨床建議**：${tdsSeverity.value.advice}`;
  }
}

async function cog_copyMarkdown() {
  await navigator.clipboard.writeText(cog_generateMarkdown());
  cog_copied.value = true;
  setTimeout(() => (cog_copied.value = false), 2000);
}

function cog_reset() {
  bhtItems.forEach((q) => {
    bhtAnswers.value[q.key] = -1;
  });
  ad8Items.forEach((q) => {
    ad8Answers.value[q.key] = null;
  });
  tdsPerson.value = {
    name: "",
    gender: "",
    testY: "",
    testM: "",
    testD: "",
    birthY: "",
    birthM: "",
    birthD: "",
  };
  tdsBasicIssues.value = {
    selfMemory: false,
    familyMemory: false,
    examinerMemory: false,
  };
  tdsRiskFactors.value = {
    edu: "",
    bmi: "",
    stroke: false,
    dm: false,
    dmMeds: false,
    htn: false,
    htnMeds: false,
    chol: false,
    cholMeds: false,
    headInjury: false,
    forgetMeds: false,
    antidepressants: false,
    source: "",
  };
  tdsOrientation.value = { year: null, month: null, day: null, weekday: null };
  tdsRegistration.value = -1;
  tdsFluency.value = -1;
  tdsRecall.value = -1;
  cog_showResults.value = false;
}

function cog_switchMethod(m: cog_Method) {
  cog_method.value = m;
  cog_showResults.value = false;
}

const currentScore = computed(() =>
  cog_method.value === "BHT"
    ? bhtScore.value
    : cog_method.value === "AD8"
      ? ad8Score.value
      : tdsTotal.value,
);
const currentSeverity = computed(() =>
  cog_method.value === "BHT"
    ? bhtSeverity.value
    : cog_method.value === "AD8"
      ? ad8Severity.value
      : tdsSeverity.value,
);
const currentDone = computed(() =>
  cog_method.value === "BHT"
    ? bhtDone.value
    : cog_method.value === "AD8"
      ? ad8Done.value
      : tdsDone.value,
);
const currentAnsweredCount = computed(() =>
  cog_method.value === "BHT"
    ? bhtAnsweredCount.value
    : cog_method.value === "AD8"
      ? ad8AnsweredCount.value
      : tdsAnsweredCount.value,
);
const currentTotal = computed(() =>
  cog_method.value === "BHT" ? 28 : cog_method.value === "AD8" ? 8 : 16,
);

const cog_barPct = computed(() => {
  if (!currentDone.value || currentScore.value === null) return 0;
  return (currentScore.value / currentTotal.value) * 100;
});

// ══════════════ SPPB 行動功能（Short Physical Performance Battery）══════════════

// ── SPPB — Short Physical Performance Battery ─────────────────────
// Guralnik JM et al., JAMA 1994;272:1341-7.
// Health Promotion Administration, MOHW Taiwan — ICOPE 行動功能複評
//
// Three sub-tests, each scored 0–4, maximum total = 12
//
// 1. Balance Test (平衡測試)
//    Side-by-side: ≥10s = 1pt, <10s = 0pt
//    Semi-tandem:  ≥10s = 1pt, <10s = 0pt (only if side-by-side passed)
//    Tandem:       ≥10s = 2pt, 3–9.99s = 1pt, <3s = 0pt (only if semi-tandem passed)
//    Max = 4pt
//
// 2. Gait Speed — 4m preferred (若空間不足可用3m)
//    4m: <4.82s=4, 4.82-6.20s=3, 6.21-8.70s=2, >8.70s=1, cannot=0
//    3m: <3.62s=4, 3.62-4.65s=3, 4.66-6.52s=2, >6.52s=1, cannot=0
//
// 3. Chair Stand × 5
//    <11.19s=4, 11.2-13.69s=3, 13.7-16.69s=2, 16.7-59.9s=1, ≥60s or cannot=0
//
// Total: 10-12 = 行動能力正常, 0-9 = 行動能力障礙

// Live link to ICOPE's mobility-abnormal flag (same component)
const icopeMobAbn = mobAbn;

// ── State ─────────────────────────────────────────────────────────
// Balance
const sideBySideTime = ref<number | null>(null); // seconds, null = not done
const semiTandemTime = ref<number | null>(null);
const tandemTime = ref<number | null>(null);
const balanceSkipped = ref(false); // if side-by-side < 10s, skip rest

// Gait
type GaitDist = "4m" | "3m";
const gaitDist = ref<GaitDist>("4m");
const gaitTime = ref<number | null>(null);
const gaitCannot = ref(false);

// Chair stand
const chairTime = ref<number | null>(null);
const chairCannot = ref(false);

const sppb_copied = ref(false);
const sppb_showResults = ref(false);

// ── Input handlers ────────────────────────────────────────────────
function handleInput(r: Ref<number | null>) {
  return (e: Event) => {
    const v = +(e.target as HTMLInputElement).value;
    r.value = v > 0 ? v : null;
  };
}
const setSideBySide = handleInput(sideBySideTime);
const setSemiTandem = handleInput(semiTandemTime);
const setTandem = handleInput(tandemTime);
const setGait = handleInput(gaitTime);
const setChair = handleInput(chairTime);

// ── Template refs (for ENTER key navigation) ────────────────────
const sideInput = ref<HTMLInputElement>();
const semiInput = ref<HTMLInputElement>();
const tandemInput = ref<HTMLInputElement>();
const gaitInput = ref<HTMLInputElement>();
const chairInput = ref<HTMLInputElement>();
function j(el?: HTMLInputElement) {
  el?.focus();
}

// ── Balance scoring ───────────────────────────────────────────────
// Side-by-side: ≥10s required to proceed
const sideScore = computed((): number | null => {
  if (sideBySideTime.value === null) return null;
  return sideBySideTime.value >= 10 ? 1 : 0;
});

// Whether semi-tandem is required (side-by-side passed)
const sidePass = computed(() => sideScore.value === 1);

const semiScore = computed((): number | null => {
  if (!sidePass.value) return 0; // skipped = 0
  if (semiTandemTime.value === null) return null;
  return semiTandemTime.value >= 10 ? 1 : 0;
});

const semiPass = computed(() => sidePass.value && semiScore.value === 1);

const tandemScore = computed((): number | null => {
  if (!semiPass.value) return 0; // skipped = 0
  if (tandemTime.value === null) return null;
  const t = tandemTime.value;
  if (t >= 10) return 2;
  if (t >= 3) return 1;
  return 0;
});

const balanceScore = computed((): number | null => {
  if (sideScore.value === null) return null;
  if (!sidePass.value) return 0;
  if (semiScore.value === null) return null;
  if (!semiPass.value) return sideScore.value; // 1 point for side-by-side only
  if (tandemScore.value === null) return null;
  return sideScore.value + semiScore.value + tandemScore.value - 1;
  // breakdown: sbs=1, semi=1, tandem 0/1/2 → total 0..4 from slide scoring
  // slide: A=1, B=1, C=0→0/C=3-9.99→1/C=10→2 → max 4
  // so total = 0 (sbs<10), 1 (sbs ok, semi fail), 2 (semi ok, tandem fail),
  //            3 (tandem 3-9.99), 4 (tandem ≥10)
});

// Recalculate as step-based (matches slide exactly)
const balanceScoreCalc = computed((): number | null => {
  if (sideScore.value === null) return null;
  if (sideScore.value === 0) return 0; // A failed
  if (semiScore.value === null) return null;
  if (semiScore.value === 0) return 1; // A pass, B fail = 1
  if (tandemScore.value === null) return null;
  // A pass, B pass, C determines final
  // tandem 0→2, 1→3, 2→4
  return tandemScore.value + 2;
});

// ── Gait scoring ──────────────────────────────────────────────────
const gaitScore = computed((): number | null => {
  if (gaitCannot.value) return 0;
  if (gaitTime.value === null) return null;
  const t = gaitTime.value;
  if (gaitDist.value === "4m") {
    if (t < 4.82) return 4;
    if (t <= 6.2) return 3;
    if (t <= 8.7) return 2;
    return 1;
  } else {
    if (t < 3.62) return 4;
    if (t <= 4.65) return 3;
    if (t <= 6.52) return 2;
    return 1;
  }
});

// ── Chair stand scoring ───────────────────────────────────────────
const chairScore = computed((): number | null => {
  if (chairCannot.value) return 0;
  if (chairTime.value === null) return null;
  const t = chairTime.value;
  if (t < 11.2) return 4;
  if (t <= 13.69) return 3;
  if (t <= 16.69) return 2;
  if (t < 60) return 1;
  return 0;
});

// ── Completeness ──────────────────────────────────────────────────
const balanceDone = computed(() => balanceScoreCalc.value !== null);
const gaitDone = computed(() => gaitScore.value !== null);
const chairDone = computed(() => chairScore.value !== null);
const sppb_isComplete = computed(
  () => balanceDone.value && gaitDone.value && chairDone.value,
);

// ── Total ─────────────────────────────────────────────────────────
const sppb_totalScore = computed((): number | null => {
  if (!sppb_isComplete.value) return null;
  return (
    (balanceScoreCalc.value ?? 0) +
    (gaitScore.value ?? 0) +
    (chairScore.value ?? 0)
  );
});

// ── Interpretation ────────────────────────────────────────────────
const result = computed(() => {
  const s = sppb_totalScore.value;
  if (s === null)
    return { level: "填寫中", color: "filling", advice: "", action: "" };
  if (s >= 10)
    return {
      level: "行動能力正常（10–12 分）",
      color: "normal",
      advice: `SPPB 總分 ${s}/12，行動能力在正常範圍。建議維持規律身體活動，每 6–12 個月定期追蹤。`,
      action: "繼續維持規律有氧及阻力訓練；預防跌倒衛教；定期追蹤。",
    };
  return {
    level: "行動能力障礙（0–9 分）",
    color: "critical",
    advice: `SPPB 總分 ${s}/12，行動能力障礙。建議轉介物理治療師或老年醫學科進行完整評估與運動介入。`,
    action:
      "轉介物理治療；評估跌倒風險；肌少症排除（握力、肌肉量）；評估長照需求；必要時調整用藥。",
  };
});

// ── Helpers ───────────────────────────────────────────────────────
function scoreClass(s: number | null): string {
  if (s === null) return "val-nd";
  if (s >= 3) return "val-ok";
  if (s >= 2) return "val-mid";
  return "val-abn";
}

function barWidth(s: number | null, max: number): string {
  if (s === null) return "0%";
  return ((s / max) * 100).toFixed(1) + "%";
}

// ── Markdown export ───────────────────────────────────────────────
function sppb_generateMarkdown(): string {
  return [
    "# SPPB 簡易身體表現功能量表評估結果",
    "",
    "## 各分項得分",
    `- **1. 平衡測試**：${balanceScoreCalc.value ?? "—"} / 4 分`,
    `  - 並排站立：${sideBySideTime.value !== null ? sideBySideTime.value + "秒" : "—"}`,
    `  - 半前後站立：${semiTandemTime.value !== null ? semiTandemTime.value + "秒" : sidePass.value ? "—" : "（跳過）"}`,
    `  - 前後站立：${tandemTime.value !== null ? tandemTime.value + "秒" : semiPass.value ? "—" : "（跳過）"}`,
    `- **2. 步行速度測試**（${gaitDist.value}）：${gaitScore.value ?? "—"} / 4 分（${gaitCannot.value ? "無法完成" : (gaitTime.value ?? "—") + "秒"}）`,
    `- **3. 椅子起站測試**：${chairScore.value ?? "—"} / 4 分（${chairCannot.value ? "無法完成" : (chairTime.value ?? "—") + "秒"}）`,
    "",
    `## 總分：${sppb_totalScore.value ?? "—"} / 12`,
    "",
    `## 臨床判讀`,
    `**${result.value.level}**`,
    "",
    result.value.advice,
    "",
    `**建議：** ${result.value.action}`,
    "",
    "*Reference: Guralnik JM et al. JAMA 1994;272:1341-7 · 衛生福利部國民健康署 ICOPE 行動功能複評*",
  ].join("\n");
}

async function sppb_copyOutput() {
  await navigator.clipboard.writeText(sppb_generateMarkdown());
  sppb_copied.value = true;
  setTimeout(() => (sppb_copied.value = false), 2000);
}

function sppb_reset() {
  sideBySideTime.value = null;
  semiTandemTime.value = null;
  tandemTime.value = null;
  balanceSkipped.value = false;
  gaitTime.value = null;
  gaitCannot.value = false;
  gaitDist.value = "4m";
  chairTime.value = null;
  chairCannot.value = false;
  sppb_showResults.value = false;
}

// SVG inline content (balance foot illustrations)
const svgSideBySide = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60.4 54.74"><g><path fill="currentColor" d="M18.71,34.42c-4.43,1.77-10.14,1.64-14.36.79C.54,34.45-4.28,12.41,7.07,2.37c3.92-3.47,10.74-2.7,14.58-.41,6.95,4.14,8.24,20.05.59,25.73l-3.53,6.73Z"/><path fill="currentColor" d="M18.98,39.86c4.56,1.57,2.45,11.45-1.87,13.59-4.72,2.35-11.43,1.83-13.74-4.44-1-2.72-.19-6.48-.03-9.67,4.63.65,10-1.42,15.64.52Z"/><path fill="currentColor" d="M41.59,34.99c-1.49-2.75-2.49-7.01-5.08-8.99-5.48-4.2-5.51-21.99,4.6-25.21,6.04-1.93,12.24,0,15.63,6.03,4.77,8.46,4.59,18.98,1.16,28.45-5.02.38-10.95.96-16.31-.27Z"/><path fill="currentColor" d="M56.68,39.05c.61,3.73.85,6.75-.16,9.84-1.97,6-8.89,6.82-13.9,4.15-4.21-2.25-5.8-11.65-1.16-14.15l15.23.17Z"/></g></svg>`;
const svgSemiTandem = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50.02 81.79"><path fill="currentColor" d="M18.71,61.47c-4.43,1.77-10.14,1.64-14.36.79-3.81-.76-8.63-22.8,2.72-32.85,3.92-3.47,10.74-2.7,14.58-.41,6.95,4.14,8.24,20.05.59,25.73l-3.53,6.73h0Z"/><path fill="currentColor" d="M18.98,66.91c4.56,1.57,2.45,11.45-1.87,13.59-4.72,2.35-11.43,1.83-13.74-4.44-1-2.72-.19-6.48-.03-9.67,4.63.65,10-1.42,15.64.52Z"/><path fill="currentColor" d="M31.2,34.92c-1.49-2.75-2.49-7.01-5.08-8.99-5.48-4.2-5.51-21.99,4.6-25.21,6.04-1.93,12.24,0,15.63,6.03,4.77,8.46,4.59,18.98,1.16,28.45-5.02.38-10.95.96-16.31-.27h0Z"/><path fill="currentColor" d="M46.29,38.98c.61,3.73.85,6.75-.16,9.84-1.97,6-8.89,6.82-13.9,4.15-4.21-2.25-5.8-11.65-1.16-14.15l15.23.17h-.01Z"/></svg>`;
const svgTandem = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.02 113.07"><path fill="currentColor" d="M20.29,92.75c-4.43,1.77-10.14,1.64-14.36.79-3.81-.76-8.63-22.8,2.72-32.85,3.92-3.47,10.74-2.7,14.58-.41,6.95,4.14,8.24,20.05.59,25.73l-3.53,6.73Z"/><path fill="currentColor" d="M20.56,98.19c4.56,1.57,2.45,11.45-1.87,13.59-4.72,2.35-11.43,1.83-13.74-4.44-1-2.72-.19-6.48-.03-9.67,4.63.65,10-1.42,15.64.52Z"/><path fill="currentColor" d="M8.76,34.92c-1.49-2.75-2.49-7.01-5.08-8.99C-1.81,21.73-1.84,3.95,8.27.72c6.04-1.93,12.24,0,15.63,6.03,4.77,8.46,4.59,18.98,1.16,28.45-5.02.38-10.95.96-16.31-.27Z"/><path fill="currentColor" d="M23.85,38.98c.61,3.73.85,6.75-.16,9.84-1.97,6-8.89,6.82-13.9,4.15-4.21-2.25-5.8-11.65-1.16-14.15l15.23.17Z"/></svg>`;
// ── Badge bottom label ───────────────────────────────────────────
const scoreBotLabel = computed(() => {
  if (sppb_totalScore.value !== null)
    return sppb_totalScore.value >= 10 ? "正常" : "障礙";
  if (balanceDone.value && gaitDone.value) return "1/3";
  return "填寫中";
});

// ── Scoring table data (moved out of template to avoid bare < in attrs) ───
const gait4mRows = [
  { s: 4, t: "< 4.82 秒", d: "最快" },
  { s: 3, t: "4.82–6.20 秒", d: "良好" },
  { s: 2, t: "6.21–8.70 秒", d: "尚可" },
  { s: 1, t: "> 8.70 秒", d: "偏慢" },
  { s: 0, t: "無法完成", d: "障礙" },
];
const gait3mRows = [
  { s: 4, t: "< 3.62 秒", d: "最快" },
  { s: 3, t: "3.62–4.65 秒", d: "良好" },
  { s: 2, t: "4.66–6.52 秒", d: "尚可" },
  { s: 1, t: "> 6.52 秒", d: "偏慢" },
  { s: 0, t: "無法完成", d: "障礙" },
];
const chairRows = [
  { s: 4, t: "< 11.20 秒", d: "優秀" },
  { s: 3, t: "11.20–13.69 秒", d: "良好" },
  { s: 2, t: "13.70–16.69 秒", d: "尚可" },
  { s: 1, t: "16.70–59.99 秒", d: "偏慢" },
  { s: 0, t: "≥ 60 秒或無法完成", d: "障礙" },
];

// ── Inline SVG illustrations (moved out of template — Vue HTML parser
//    cannot handle SVG <text>, <line> etc as raw template elements) ──
const svgGaitTrack = `<svg class="illus-svg" aria-label="步行速度測試場地設置" role="img"
  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 560 120">
  <!-- Ground line (full width) -->
  <rect x="0" y="85" width="560" height="3" fill="#e5e7eb" rx="1"/>
  <g transform="translate(31,0)">
    <!-- Buffer zone left -->
    <rect x="10" y="55" width="80" height="35" rx="3" fill="rgba(250,204,21,0.25)" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="50" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e">緩衝線</text>
    <text x="50" y="79" text-anchor="middle" font-size="9" fill="#92400e">50cm</text>
    <!-- Start line -->
    <rect x="90" y="50" width="6" height="40" rx="2" fill="#ef4444"/>
    <text x="93" y="44" text-anchor="middle" font-size="10" font-weight="800" fill="#dc2626">起點</text>
    <!-- Measurement zone -->
    <rect x="96" y="60" width="288" height="20" rx="2" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1.5" stroke-dasharray="6,3"/>
    <!-- 4m/3m label -->
    <text x="240" y="54" text-anchor="middle" font-size="13" font-weight="800" fill="#1d4ed8">4公尺或3公尺</text>
    <!-- Arrow -->
    <line x1="100" y1="90" x2="380" y2="90" stroke="#3b82f6" stroke-width="2" marker-end="url(#sppb-arr)"/>
    <defs>
      <marker id="sppb-arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L0,6 L8,3 z" fill="#3b82f6"/>
      </marker>
    </defs>
    <!-- End line -->
    <rect x="384" y="50" width="6" height="40" rx="2" fill="#ef4444"/>
    <text x="387" y="44" text-anchor="middle" font-size="10" font-weight="800" fill="#dc2626">終點</text>
    <!-- Buffer zone right -->
    <rect x="390" y="55" width="80" height="35" rx="3" fill="rgba(250,204,21,0.25)" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="430" y="48" text-anchor="middle" font-size="10" font-weight="700" fill="#92400e">緩衝線</text>
    <text x="430" y="79" text-anchor="middle" font-size="9" fill="#92400e">50cm</text>
    <!-- Timer label -->
    <text x="240" y="112" text-anchor="middle" font-size="10" fill="#6b7280">計時：跨越起點標線開始 → 終點標線停止（非緩衝線）</text>
    <!-- Walker icon simplified -->
    <circle cx="480" cy="62" r="7" fill="#374151"/>
    <line x1="480" y1="69" x2="480" y2="82" stroke="#374151" stroke-width="2.5"/>
    <line x1="480" y1="73" x2="472" y2="80" stroke="#374151" stroke-width="2"/>
    <line x1="480" y1="73" x2="488" y2="80" stroke="#374151" stroke-width="2"/>
    <line x1="480" y1="82" x2="475" y2="93" stroke="#374151" stroke-width="2.5"/>
    <line x1="480" y1="82" x2="485" y2="93" stroke="#374151" stroke-width="2.5"/>
    <!-- Arrow from walker toward end -->
    <line x1="470" y1="75" x2="445" y2="75" stroke="#374151" stroke-width="1.5" stroke-dasharray="3,2"/>
  </g>
</svg>`;
const svgSTS = `<svg class="illus-svg" aria-label="椅子起站測試示意圖" role="img" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 348 290.16">
  <defs>
    <style>
      .cls-1 { fill: #010500; }
      .cls-2 { fill: #157c3e; }
      .cls-3, .cls-4 { fill: #167d3e; }
      .cls-5 { fill: #071a01; }
      .cls-6 { fill: #e7e7e9; }
      .cls-7 { fill: #005626; }
      .cls-8 { fill: #c6c7ca; }
      .cls-9 { fill: #061901; }
      .cls-10 { fill: #000300; }
      .cls-11, .cls-12, .cls-13, .cls-14 { fill: none; }
      .cls-12 { stroke: #167d3e; stroke-miterlimit: 8; stroke-width: 2px; }
      .cls-15 { fill: #757f16; }
      .cls-16 { fill: #051801; }
      .cls-17 { fill: #f9f9f9; }
      .cls-18 { clip-path: url(#clippath-1); }
      .cls-19 { fill: #d4de35; }
      .cls-20 { fill: #cacbcd; }
      .cls-21 { fill: #d1db34; }
      .cls-22 { fill: #f1f1f1; }
      .cls-23 { fill: #005526; }
      .cls-24 { clip-path: url(#clippath-3); }
      .cls-25 { fill: #c9cacc; }
      .cls-26 { fill: #081b01; }
      .cls-13, .cls-14 { clip-rule: evenodd; }
      .cls-27 { fill: #d2dc34; }
      .cls-28 { fill: #157d3e; }
      .cls-29 { fill: #cbccce; }
      .cls-30 { fill: #221e1f; }
      .cls-31 { fill: #929497; }
      .cls-32 { clip-path: url(#clippath-2); }
      .cls-4 { fill-rule: evenodd; }
      .cls-33 { fill: #081a01; }
      .cls-34 { fill: #000200; }
      .cls-35 { fill: #f8f8f8; }
      .cls-36 { fill: #051800; }
      .cls-37 { fill: #c8c9cb; }
      .cls-14 { clip-path: url(#clippath); }
    </style>
    <clipPath id="clippath"><polygon class="cls-13" points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"/></clipPath>
    <clipPath id="clippath-1"><polygon class="cls-14" points="0 0 348 0 348 290.16 0 290.16 0 0 0 0"/></clipPath>
    <clipPath id="clippath-2"><polygon class="cls-11" points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"/></clipPath>
    <clipPath id="clippath-3"><polygon class="cls-13" points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"/></clipPath>
  </defs>
  <g id="_圖層_1-2" data-name="圖層 1">
    <g class="cls-18">
      <g class="cls-32">
        <polygon class="cls-28" points="123.53 230.89 183.51 230.89 183.51 233.24 123.53 233.24 123.53 230.89 123.53 230.89"/>
        <polygon class="cls-28" points=".77 230.89 60.8 230.89 60.8 233.24 .77 233.24 .77 230.89 .77 230.89"/>
        <path class="cls-30" d="M324.31,269.34c4.98,5.61,11.6,9.2,19.03,8.94,1.44-.05,2.64.37,3.41,1.14.91.91,1.26,2.21.98,3.61-1.13,5.64-9.15,7.21-15.19,6.95l-11.78-.52c-5.91-.26-15.63,1.04-14.62-3.64l2.58-12.04c.33-1.53.9-2.64,2.16-3.55.81-17.11-7.91-36.97.48-51.64-4.12-11.78-4.93-26.1-4.45-38.52-3.33-3.88-5.97-8.02-6.81-13.11-.55-3.33-.25-7.35,1.65-10.05l5.65-7.98c1.98-2.81,2.9-5.61,2.43-9.1l-3.23-23.47-1.61-15.52c-.31-3.05,2.38-5.31,5.06-6.68.31-5.03-.24-10.04-2.34-14.6l-5.27-8.78c-3.74-6.22,2.68-16.8,12.08-19.4,6-1.66,12.41-.33,17.42,2.94,3.65,2.38,4.53,6.07,3.23,10.01-2.34,7.06,5.67,9.24.39,11.88.26,1.72-.5,3.25-1,4.89-.37,1.18.24,2.62-.85,3.69-.63.63-1.68,1.48-3.09,1.35l-4.13-.39c-.67,2.84-.67,5.48-.23,8.01,2.01-1.08,4.9-1.12,6.45.28,2.85,2.58,3.62,6.4,4.77,9.82l3.91,7.38c2.73,5.14,5.56,15.01,2.64,16.75-1.03.62-2.21.49-3.68-.24-.24,4.41-1.09,8.9-4.21,8.61-.98-.09-1.69-.8-2.67-1.56l.41,12.49-.15,13.47c-.85,5.06-1.56,9.53-.87,14.72l.66,16.86c.39,9.87-1.58,19.12-4.36,28.5l-.91,10.39-2.07,17.6-1.01,5.59-.84,14.9h0Z"/>
        <path class="cls-31" d="M316.42,68.95c-3.41,1.32,6.96,10.83-4.19,18.28-.58-3.45-.94-6.41-2.55-9.1l-5.11-8.48c-3.02-5.01,2.93-13.92,10.81-16.01,8.01-2.12,18.99,2.24,17.97,8.29-.37,2.19-1.53,4.04-3.95,4.82l-5.94,1.92c-2.09.67-2.76,2.25-2.21,4.55l-2.75-3.85c-.43-.61-1.45-.63-2.07-.39h0Z"/>
        <path class="cls-17" d="M308.5,104.93c-1.86-2.88-1.32-6.17,1.47-7.92,2.79-1.75,6.39-1.19,8.8,1.19,4.17,4.11,7.48,8.86,10.66,13.72-.58,5.52-.35,15.05,1.95,15.27s-.04-3.9.15-9.95l.41-13.55-2.39-7.96c1.56-.4,2.07.71,2.65,1.62,1.72,2.74,2.21,5.47,2.78,8.63l2.56,14.2c.85,4.74.88,9.46-.94,13.96l-8.76-7.98c-4.66-4.25-8.36-9.19-11.73-14.5-3.02-1.77-5.7-3.72-7.63-6.73h.01Z"/>
        <path class="cls-17" d="M323.96,94.6l-2.62,2.78c-2.46-2.78-5.43-4.02-8.86-3.67v-3.65c5.86-4.03,8.66-8.11,7.05-15.02,1.26.52,2.22.55,3,.07,2.13-1.29-.22-3.85,2.67-4.64,2.58-.7,4.87-1.25,7.23-2.59-.03,2.43.99,4.06,2.48,5.95-.81.38-1.62.7-2.04,1.35-.4.59.26,1.92.04,2.59-.61,1.83-.92,3.23-1.07,5.16-.17,2.26-6.27-1.23-7.42,1.77-1.15,3.01-1,6.44-.47,9.91h.01Z"/>
        <path class="cls-17" d="M320.03,274.77l-6.72-1.71-.99-17.45c3.59.69,6.86.78,10.24-.19l-.58,13.89c-.07,1.86-1.1,3.42-1.95,5.47h0Z"/>
        <path class="cls-20" d="M338.29,110.61c3.6,5.76,6.51,17.56,2.93,15.03-.6-.42-.71-1.38-.85-2.25l-2.07-12.78h0Z"/>
        <path class="cls-33" d="M323.44,101.27c5.47,1.73,8.34,4.45,6.96,9.48l-6.96-9.48h0Z"/>
        <path class="cls-25" d="M329.11,102.68c-1.71-1.14-4.25-2.02-5.52-3.78-.1-1.45,2.57-2.61,3.79-1.93l1.73,5.72h0Z"/>
        <path class="cls-37" d="M314.37,113.6c1.36.97,1.98,2.71,2.76,4.22-3.97-.49-6.05-3.86-6.99-7.21l4.23,2.99h0Z"/>
        <path class="cls-10" d="M331.66,166.1c-.36,1.59-.14,3.92-.01,5.63,1.39,18.41,1.94,30.65-3.47,48.71l-.77,9.08-2.85,23.04c-2.19,3.25-9.97,3.38-13.76,1.02l-1.97-14.58c-.84-6.22.2-14.94,3.63-20.35-2.41-6.1-3.55-12.24-4.04-18.7l-.39-5.23c-.37-5.06-.76-9.85-.01-14.82-3.44-3.74-5.85-8-6.97-12.83-.61-2.67-.1-4.98.75-7.35,2.88-.21,5.79.4,8.72,1.83l10.13,3.78c3.66,1.71,6.99,1.86,9.99.46l1.01.32h0Z"/>
        <path class="cls-2" d="M323.33,252.39c-3.75,1.82-7.66,1.88-11.31.43-1.71-11.59-4.26-24.15,1.98-34.03-4.65-12.17-5.2-26.71-4.66-39.49-4.3-4.85-8.54-11.64-6.6-17.69,3.63.53,6.58,1.83,9.79,2.91l11.58,3.93c1.84.63,3.71.6,5.96-.06l1.16,23.54c-.08,9.75-1.25,18.97-4.49,28.14l-3.39,32.34h0Z"/>
        <path class="cls-36" d="M331.66,166.1c-3.08,3.41-10.03.66-15.51-1.47-4.78-1.86-9.39-3.48-14.33-4.92.46-1.27.7-2.33,1.57-3.53l5.68-7.89c1.84-2.57,2.29-5.39,1.86-8.54l-2.82-20.59-1.84-15.61c.56,1.16,1.74,2.32,1.95,3.61,1.11,6.99,4.04,12.97,11.2,11.46,3.9,4.98,8.12,9.3,12.91,13.54l.37,11.87.39,11.24c.13,3.83-.58,7.17-1.41,10.83v-.02Z"/>
        <path class="cls-19" d="M330.93,163.45c-1.24,5.52-8.57,2.25-15.23-.28-4.18-1.58-8.05-3.16-12.56-3.95l6.17-8.86c2.35-3.37,3.33-6.99,2.76-11.2l-3.43-25.4c2.08,4,5.54,7.05,10.35,6.19,3.74,4.52,7.43,8.69,12.06,12.55l.49,14.8c.18,5.5.55,10.84-.63,16.15h0Z"/>
        <path class="cls-34" d="M309.81,288.07c-.84-.04-2.26-.22-2.69-.97.43-5.35,1.72-10.58,3.52-15.81,1.49.73,1.57,1.83,2.27,2.72l6.99,1.77c1.53.39,1.79-4.03,3.69-5.66,4.79,5.25,10.81,8.82,17.87,9.17,1.5.07,3.68-.49,4.65.99,1.66,2.55-.22,5.65-2.93,6.85-5.13,2.26-10.68,1.85-16.26,1.62l-17.11-.7h0Z"/>
        <path class="cls-23" d="M320.56,287.06c-4.28-.24-8.22.22-12.09-.56l2.64-12.42c1.21,1.38,2.43,1.62,4.05,1.96,1.8.37,4.12,1.69,5.92.72,1.56-.84,1.82-3,2.62-4.62,5.34,5.63,12.35,8.84,20.1,8.48,1.03-.04,1.88.89,1.68,1.74-1.18,4.97-9.34,5.55-15.31,5.22l-9.61-.53h0Z"/>
        <path class="cls-30" d="M89.39,247.91l-1.2,20.54c5.18,5.18,11.78,8.76,19.22,8.39,1.65-.08,2.98-.26,4.16.88.91.88,1.39,2.27,1.07,3.86-1.26,6.17-8.86,6.76-14.72,7.41l-11.79-.09-12.85.13c-1.86.02-2.66-1.62-2.49-3.18.54-4.94,1.49-9.52,2.59-14.3,1.44-1.14,1.45-2.77,1.12-4.54l-3.69-24.38c-.76-5.06-.84-9.97.13-15.22l-24.09,2.04-4.29.37h-13.9c-9.77,0-16.96-7.01-18.28-16.62-.53-3.9.15-7.84,2.33-11.26,1.89-2.98,3.21-6.25,4.5-9.55,1.27-3.25,1.43-6.43.93-9.91l-3.41-23.83c-.59-4.15-1.15-8.09-1.24-12.32-.07-3.25,2.04-5.92,5.03-7.19.47-5.31-.22-10.62-2.65-15.39l-4.66-7.59c-4.22-6.87,2.58-17.53,12.14-20,5.88-1.52,12.14-.21,17.03,2.96,3.74,2.43,4.61,6.19,3.29,10.23-2.3,7,5.64,8.87.48,11.81-.02,1.55-.42,3.1-1.02,4.65-.47,1.23.18,2.9-1,3.91-.96.82-2.16,1.52-3.82,1.26l-3.29-.5c-.66,2.58-.58,5.12.07,7.98,1.8-.73,4.54-.98,6.05.38,2.84,2.55,3.69,6.38,4.78,9.81l3.41,6.43c2.92,5.49,6.66,15.46,2.53,18.88l-2.96-1.23c.06,5.23-2.76,10.11-4.23,9.01l-3.26-2.44-.25,4.62c.47,6.17.46,12.16-.5,18.17,2.6.71,4.98.44,7.47.73l7.6.86,24.28,3.34c5.85.81,9.68,4.92,10.67,10.59.67,3.8.12,7.48-.11,11.33l-.82,13.84-.4,5.11h.01Z"/>
        <path class="cls-35" d="M84.33,274.17c-2.41-.16-4.68-.72-7.01-1.47-.39-4.59-.6-8.72-1.47-13.23,3.78.39,7.11.31,10.44-.76l-.49,11.12-1.47,4.33h0Z"/>
        <path class="cls-34" d="M86.32,287.98l-12.24.19c-.77.01-2.38-.48-2.3-1.37.49-5.44,1.41-10.56,2.91-15.76,1.47.86,1.67,1.9,2.49,2.81l7.37,1.54c1.98-2.27,2.09-5.94,2.91-5.9.94.06,8.16,9.44,21.85,8.35,1.67-.13,2.6,1.89,2.39,3.23-.91,5.78-8.14,6.22-13.81,6.98l-11.58-.07h0Z"/>
        <path class="cls-7" d="M80.87,286.91c-2.75.25-5.17.08-7.67-.28.16-4.41,1.23-8.39,2.04-12.64,2.52,1.94,8.67,3.02,10.03,2.36,1.62-.78,1.85-2.9,2.58-4.89,5.91,5.38,13.09,8.39,20.99,7.59,1.08-.11,1.7,1.24,1.49,2.06-1.97,7.63-19.21,4.85-29.45,5.8h0Z"/>
        <path class="cls-1" d="M88.32,249.73l-.77,6.96c-3.98,2.18-8.66,2.57-13.21,1.09l-2.58-14.68c-1-5.69-.88-11.21.46-16.89-2.16.64-4.02.4-6.08.59l-22.73,2.03-14.69.02c-9.31.01-16.27-6.75-17.42-16.06-.42-3.36.27-7.17,2.16-10.05,2.37-3.61,3.92-7.52,5.36-11.57.91-2.57.86-5.09.49-7.77l-3.49-24.79-.97-9.55c2.98,2.49,1.5,7.03,5.02,11.56,2,2.57,4.87,3.79,8.15,2.96,3.81,4.92,7.88,9.04,12.54,13.23-.96,8.81.69,17.76-1.21,26.36l7.51.55,16.28,1.98,17.65,2.54c4.91.71,8.03,4.68,8.95,9.38.73,3.67.16,7.21-.05,10.9l-.5,8.93c-.13,2.28-.27,4.34-.44,6.61l-.43,5.67h0Z"/>
        <path class="cls-28" d="M75.67,257.01c-2-10.68-4.8-21.89-1.49-32.23l-26.39,2.28c-6.81.59-13.33.97-20,.33-7.27-.69-12.8-5.24-14.58-12.28-.94-3.69-.8-7.32.99-11,13.45-.04,26.77-.05,40.25,1.8l24.78,3.39c5.61.76,9.37,5.05,9.35,10.86-.04,12.06-1.27,23.89-2.16,35.94-3.53,1.41-6.74,1.48-10.74.91h0Z"/>
        <path class="cls-19" d="M38.35,202.16l-22.67-.46c3.55-7.08,6.11-12.37,4.69-20.48l-3.11-22.37c2.16,3.95,5.59,6.85,10.26,5.93,3.61,4.32,7.11,8.3,11.56,12.05.36,8.31.55,16.46-.72,25.32h0Z"/>
        <path class="cls-31" d="M25.16,113.76c-3.81,1.43,6.81,10.7-4.32,18.26-.67-3.22-1-6.34-2.69-9.13l-5.11-8.47c-2.91-4.82,2.89-13.77,10.76-15.88s18.55,2.15,18.13,7.57c-.19,2.39-1.32,4.57-3.74,5.37l-6.31,2.08c-1.68.55-2.43,1.84-2.49,3.9l-2.22-3.1c-.49-.69-1.46-.79-2-.59h0Z"/>
        <path class="cls-17" d="M24.55,156.83c-1.26-1.5-12.68-8.09-7.38-13.83,2.58-2.79,6.92-2.87,9.77-.2,4.35,4.08,7.64,8.9,10.98,13.88-.58,5.62-.28,15.46,2.02,15.37,2.42-.1-.24-4.01.04-10.59l.55-12.67-2.52-8.38c3.92.64,4.76,6.5,5.51,10.68l2.64,14.63c.85,4.74.88,9.55-1.53,13.94-1.1-1.62-1.92-2.57-3.04-3.66l-7.14-6.91c-3.87-3.75-6.5-8.2-9.9-12.24h0Z"/>
        <path class="cls-17" d="M32.47,130.87c-.56,2.94-.18,5.62.36,8.57-1.1.85-2.13,1.54-2.9,2.91-2.44-2.88-5.36-4.05-8.83-3.84-.2-1.08-.53-3.3.29-3.85,5.2-3.21,8.45-8.45,6.66-14.69,1.27.38,2.4.61,3.44-.33.67-.59.99-2.01.37-3.28,2.43-1.68,5.88-1.65,9.04-3.61.06,2.36,1.03,4,2.51,5.9-.94.52-1.67.85-2.01,1.44-.28.5.16,1.58-.01,2.21-.55,2.01-1.04,3.81-.83,5.95-3.5,1.1-7.23-1.94-8.09,2.61h0Z"/>
        <path class="cls-22" d="M46.9,155.66c3.87,6.1,6.19,17.82,2.87,14.78-.5-.46-.83-.93-.84-1.79-.04-4.45-1.64-8.41-2.03-12.99h0Z"/>
        <path class="cls-36" d="M36.5,147.76c1.59.79,3.93,4.93,2.13,7.49l-7.67-10.23,5.54,2.75h0Z"/>
        <path class="cls-20" d="M22.6,158.18c1.55,1.13,2.27,3.03,3.13,4.51-3.9-.55-6.17-3.73-7.05-7.36l3.92,2.85h0Z"/>
        <path class="cls-25" d="M37.4,146.82l-5.54-2.9c.66-1.68,2.16-2.57,4.07-2.09.55,1.56,1.21,2.74,1.47,5h0Z"/>
        <path class="cls-3" d="M164.1,55.75c0,30.38-24.64,55-55.05,55s-55.05-24.63-55.05-55S78.65.75,109.05.75s55.05,24.63,55.05,55h0Z"/>
        <path class="cls-6" d="M128.62,103.6c-.33.04-.58.05-.61-.02-.94-2.48-3.12-9.16-2.67-11.43.26-1.29.81-1.07,2.01-.52,10.07,5.76,15.36,7.28,13.32-6.4-1.25-6.01-3.01-11.88-5.28-17.62-1.35-8.89-3.29-16.23-13.84-15.1-8.28-1.1-8.35-4.19-3.55-10.15.93-1.81,2.03-3.5,3.29-5.09.34-1.04.45-2.12.34-3.25,4.25-7.47,2.58-21.23-8.36-19.32-4.82-3.3-11.95-4.62-16.07.33-6.62,7.96-1.81,22.09,3.9,29.41,4.13,4.83,1.13,7.43-4.18,7.92-5.37-.91-10.89,1.47-12.41,7-1.33,6.51-3.17,12.87-5.53,19.09-1.91,6.79-5.41,22.15,6.48,15.56l5.38-2.8,1.48.22c.4.95-2.25,10.56-2.91,12.3-.08.22-.34.38-.64.52-23.25-9.75-36.39-34.58-31.2-59.36C62.57,21.04,83.71,3.55,108.17,3.16c24.77-.4,46.56,16.68,52.11,40.65,5.69,24.56-6.71,49.51-29.74,59.95-.87.4-1.4.43-1.92-.16h0Z"/>
        <path class="cls-19" d="M126.71,105.29c-11.53,4.11-24.31,4.14-35.77-.19l-.34-1.1c2.31-9.55,3.47-14.33,3.47-14.33l14.89-10.63c5.11,3.59,10.18,7.32,15.2,11.16.05,5.01,1.06,9.88,3.01,14.62l-.46.46h0Z"/>
        <path class="cls-30" d="M128.62,103.6c.1.31.09.86-.22.94l-.67.15c-.33.03-.59.04-.62-.04-1.74-4.58-3.22-9.64-2.96-14.57-4.43-3.49-9.64-7.48-14.29-10.59-.28-.19-.65-.24-.98-.24l-14.87,10.46s-1.15,4.68-3.43,14.03l-.94.88-.88-.34c.95-4.11,2.36-7.92,3.08-12.52-5.85,3.02-13.17,7.79-15,2.49-2.38-6.89,1.49-17.3,4.24-24.91,1.09-3.04,1.7-5.96,2.24-9.04,1.09-6.25,6.78-9.76,12.83-8.91,1.67.23,3.92-.51,5.21-1.21.68-.52.89-3.01.25-3.62-1.8-1.69-2.7-4.45-4.13-6.17-1.51-1.83-1.83-3-2.54-5.17-1.89-5.78-2.82-11.87-.36-17.65,1.36-3.19,3.79-5.65,7.26-6.47,4.16-.73,8.28.27,11.61,2.75,4.36-1.16,8.26,1.22,10.06,5.29,2.1,4.83,1.42,10.3-.99,15.08.29,2.42-.41,4.68-2.5,5.98-1.5,4.88-5.49,5.99-3.92,9.76,2.57,1.44,5.3,1.79,8.32,1.68,5.02-.16,9.31,3.34,10.26,8.38.64,3.36,1.2,6.49,2.43,9.77,2.75,7.32,6.22,17.19,4.31,24.1-.42,1.5-1.68,3.28-3.41,3.01-4.46-.7-8.29-2.82-12.11-5.01-.12,2.42.36,4.57,1.09,6.79l1.63,4.93h-.01Z"/>
        <path class="cls-9" d="M127.73,104.68l-1.03.61-1.94-5.81c-1.13-2.92-1.38-5.79-1.15-9.05l-14.55-10.77c-4.95,3.62-9.4,7.04-14.47,10.38-.79,5.23-2.24,10.11-3.66,15.08l-1.29-.49c1.58-4.95,2.91-9.94,3.77-15.21l15.75-11.2c5.26,4.04,10.1,7.96,15.51,11.49l.31,5.79,2.73,9.21h0Z"/>
        <path class="cls-17" d="M113.96,63.88l9.86-5.27c1.06.1,3,1.63,2.81,2.61-1.59,2.83-3.19,6.08-5.84,7.78l-10.36,6.63c-9.02,5.77-18.7,15.79-30.73,18.71-1.72-2.91-1.36-6.16-.78-9.39,1.52-8.48,5.32-15.22,6.78-24.23.7-4.35,4.8-7.51,9.11-7,.52.06.53,1.89.05,2.11-2.01.93-4.3,2.04-5.24,4.22-1.18,2.72,3.22,6.02,2.61,7.22-1.63,3.23-2.36,6.37-1.58,10.06l-3.3,2.93c-.53.47-.63,1.32-.32,1.77.43.65,1.47.61,2.07-.02,4.19-4.37,9.72-6.28,15.33-8.11,8.89-2.91,7.87-9.13,9.53-10.02h0Z"/>
        <path class="cls-17" d="M123.86,79.01c4.75,1.86,6.81,4.99,7.87,3.61.5-.65.36-1.45-.37-1.97l-3.73-2.66c1.15-3.85.49-7.52-1.69-10.95l2.52-3.94c.68-1.07,1.03-2.58.22-3.7-2.38-3.31-5.8-3.78-5.56-3.35-.25-.45-.25-1.11-.12-1.96,4.07-.81,8.51,1.8,9.31,6.39.65,3.71,1.46,7.18,2.79,10.82,2.55,7,6.37,17.24,3.43,23.12-9.94-1.62-19.02-10.28-27.4-16.28l3.95-2.57,8.79,3.43h0Z"/>
        <path class="cls-31" d="M116.37,28.75l-2.86-7.66c-3.45,6.71-8.79,11.69-15.81,13.72-2.64-5.34-3.02-11.14-.88-16.41,1.72-4.22,5.84-6.03,10.19-4.93,2.1.53,4.05,1.25,5.69,3.02,3.16-1.33,6.26-.37,8.03,2.58,2.6,4.32,2.07,9.81-.65,14.35-1.92-.85-2.94-2.63-3.71-4.68h0Z"/>
        <path class="cls-17" d="M113.83,45.21c-2.99,2.54-6.96,2.58-9.96-.03-3.33-2.9-3.2-5.9-5.68-7.98,6.17-1.88,11.1-5.51,14.76-10.65,1.64,4.35,3.21,8.78,7.22,9.22.17,1.62-1.53,1.89-1.86,2.57-1.29,2.64-2.28,5-4.48,6.86h0Z"/>
        <path class="cls-17" d="M114.98,60.43c-4.56,1.57-4.04,6.43-6.84,4.3-.52-.4-.63-1.78-1.36-2.23l-7.04-4.26c-1.39-.84-1.43-3.22-1.64-4.65,2.29-.37,4.21-.85,5.91-2.15l.25-3.14c2.92,1.59,6.25,1.59,9.22.02-.46,4.17,2.64,4.4,6.93,5.62-.7,3.34-2.47,5.46-5.44,6.49h0Z"/>
        <path class="cls-17" d="M102.66,71.99c-4.93-1.51-8.3-5.91-10.74-10.76-.16-.97,1.84-2.51,2.9-2.59l9.65,5.24c1.87,1.02,2.3,3.91,2.95,5.82-1.53.85-2.73,1.85-4.75,2.27h0Z"/>
        <path class="cls-5" d="M115.13,74.27l6.6-4.27,2.89-3.13c2.52,3.76,3.34,7.89,1.49,11.83-3.41-1.72-6.95-2.73-10.98-4.42h0Z"/>
        <path class="cls-27" d="M125.32,76.97l-7.72-3.04c2.3-1.53,4.65-2.3,6.55-4.76,1.5,2.06,2.18,4.52,1.16,7.8h0Z"/>
        <path class="cls-26" d="M101.86,73.43c-3.59,1.31-6.82,2.38-9.83,4.44-1.42-3.94-.31-7.62,1.74-11.15,1.24,1.29,1.84,2.42,2.96,3.46l5.12,3.24h0Z"/>
        <path class="cls-21" d="M98.99,72.94l-6.09,3.1c-.67-2.62.05-4.71,1.3-7.01,1.34,1.92,2.51,2.57,4.78,3.92h0Z"/>
        <path class="cls-30" d="M210.32,268.52c10.26,10.82,21.14,7.32,23.1,9.03.67.58,1.45,1.71,1.36,3.13-.43,6.73-8.03,7.43-13.58,8.07l-3.77.43-9.13-.26-12.86.15c-1.74.02-2.88-1.58-2.61-3.25.77-4.82,1.21-9.68,2.86-14.21.49-1.35,1.37-1.89,1.06-3.67l-2.17-12.35c-1.81-10.32-4.63-23.39,1.89-31.77l-23.58-12.72c-4.82-2.6-9.15-5.31-13.47-8.66-4.32-3.34-7.39-7.77-7.29-13.34.14-7.69,4.89-14.01,11.21-17.87l5.34-4.99c2.74-2.56,4.43-5.55,5.52-9.13l7.19-23.71,3.34-9.85c1.22-3.61,4.31-5.69,8.28-5.66,2.4-4.47,4.07-9.16,4.07-14.27l-1.04-9.99c-.81-7.82,10.61-14.93,20.67-12.26,5.56,1.47,10.26,5.03,13.09,9.77,2.29,3.84,1.27,7.56-1.52,10.58-4.92,5.31,1.17,10.3-4.36,10.76-.86,1.55-1.88,2.71-3.11,3.91-.91.88-1.17,2.59-2.12,2.92-1.53.53-2.82.61-4.14-.18l-3.13-1.86c-1.66,2.05-2.48,4.49-3.11,6.94,2.05.46,4.39,1.23,5.18,3.02,1.55,3.51.67,7.46.22,11.11l.4,7.52c.32,6.04-.62,16.17-5.55,17.79l-2.3-2.39c-1.92,3.53-5.39,7.68-7.49,6.43-1.12-.67-.98-2.54-2.05-3.73l-6.83,14.49-4.09,6.53c8.95,6.6,17,13.86,23.89,22.59,3.53,4.48,6.3,9.9,5.62,15.73-.58,4.89-1.28,9.52-1.91,14.4l-1.3,9.94c-.91,7.02-1.63,13.64-1.77,20.85h.02Z"/>
        <path class="cls-31" d="M212.07,103.36c-.88-2.57-.35-5.44-2.43-5.54-3.16-.16-.63,6.15-4.17,10.8-1.74,2.27-4.41,3.47-7.49,3.91,1.66-5.2,1.82-10.2.72-15.54-.76-3.67-.3-7.29,2.76-9.85,8.37-7.01,19.99-4.26,26.06,4.89,1.47,2.22,1.5,4.64.16,6.57-1.35,1.93-3.38,2.9-6.09,2.6l-6.42-.69c-1.69,0-2.72.92-3.11,2.84h0Z"/>
        <path class="cls-17" d="M209.93,127.63c1.17-.03,1.54.93,1.72,1.87.65,3.43-.2,6.32-1.06,9.57l-3.63,13.77c-1.25,4.73-3.23,9.18-6.87,12.51-3.59-7.52-6.15-14.9-8.04-22.75-.5-2.07-.23-4.45-1.18-6.33-1.53-3.04-3.55-5.69-3.86-9.19-.22-2.38.46-4.88,2.72-6.01,3.35-1.68,7.6-.09,9.1,3.49,2.33,5.57,3.39,11.39,4.28,17.28-2.38,4.23-6.47,12.91-5.06,14.74.44.58,1.69.44,1.92-.4l1.53-5.52c1.96-5.06,4.96-9.43,7.2-14.35,1.21-2.66.71-5.89,1.24-8.68h0Z"/>
        <path class="cls-17" d="M211.54,114.8c-2.8.04-4.6,5.54-5.91,9.46-1.41.28-2.57.64-3.7,1.48-1.02-3.4-2.93-5.84-6.25-7.2.11-1.04.69-2.94,1.67-3.35,6.69-1.17,11.27-4.14,12.26-10.63,1,1.07,2.07,1.54,3.11,1.26,1.15-.31,1.61-1.3,2.06-2.54.49-1.33,5.2.64,9.53.28-.79,2.17-.7,4.17-.15,6.52-2.56-.64-2.75,1.02-3.61,2.34-1.06,1.59-2.11,2.92-3.07,4.56s-4.03-2.21-5.95-2.18h0Z"/>
        <path class="cls-29" d="M209.34,160.42c-.79.13-1.41-.81-1.62-1.32-.3-.72.31-1.36.53-2.13l3.34-12.06c.52,5.14,0,10.65-2.25,15.52h0Z"/>
        <path class="cls-8" d="M188.8,137.49l.73,4.81c-3.17-1.81-4.01-5.42-3.42-9.46l2.69,4.65h0Z"/>
        <path class="cls-29" d="M206.85,133.18c-1.05-1.77-3.08-3.26-3.38-5.22-.04-1.41,3.71-1.5,3.92.03.25,1.9-.23,3.66-.53,5.19h0Z"/>
        <path class="cls-34" d="M195.69,288.11c-.68,0-1.24-.34-1.46-.52-.32-.25-.54-1.14-.42-1.76l2.87-14.7c1.54.61,1.74,1.86,2.64,2.74l7.2,1.56c2.01-1.71,1.53-4.68,3.2-6.01,5.92,6.02,13.5,9.02,21.82,8.43,1.54-.11,2.46,1.95,2.27,3.24-1.03,6.86-13.73,7.63-21.25,6.85l-4.99.19h-11.86s0-.01,0-.01h0Z"/>
        <path class="cls-7" d="M203.05,286.89c-2.86.04-5.44.17-7.83-.34l2.13-12.5c1.49,1.41,2.96,1.48,4.72,1.8,1.62.28,3.71,1.32,5.3.45,1.59-.87,1.76-2.94,2.61-4.79,5.78,5.34,12.98,8.35,20.73,7.49.61-.07,1.3.44,1.47.76.21.37.28,1.12.07,1.71-1.66,4.71-9.63,5.12-15.34,5.21l-13.88.22h.01Z"/>
        <path class="cls-36" d="M205.5,133.4c1.33,2.74.96,5.8-1.18,7.99l-2.5-12.49,3.67,4.5h0Z"/>
        <path class="cls-15" d="M204.99,137.88c-.63-1.65-.94-2.96-1.14-4.76,1.35,1.25,1.58,2.96,1.14,4.76h0Z"/>
        <path class="cls-35" d="M206.45,274.11c-2.33.04-4.66-.7-6.96-1.37l-.7-7.45c3.32.46,6.12.31,9.26-1.14,0,3.45.07,6.4-1.6,9.97h0Z"/>
        <path class="cls-34" d="M164.24,172.09l.83-.46c6.51,4.14,12.98,8.37,19.42,12.67l-.04,1.09c9.44,6.19,17.57,14.2,24.71,23.2,3.6,4.54,6.06,10.26,5.16,15.97-.43,2.75-1.08,4.91-1.33,7.77l-.45,5.03-3.34,24.34c-1.83,2.96-8.36,3.77-11.87,1.83l-3.36-17.6c-1.36-7.14-1.03-17.56,4.19-22.39l-19.68-10.56c-6.36-3.41-12.32-6.72-18.09-11.06-3.92-2.96-7.25-7.16-7.28-12.38-.05-7.54,4.81-14.31,11.14-17.46h0Z"/>
        <path class="cls-28" d="M198.68,262.89l-2.73-12.39c-1.24-9.67-3.37-20.52,4.43-27.25l-24.55-13.26c-5.41-2.92-10.41-5.96-15.21-9.65-5.36-4.12-7.71-10.35-5.05-16.72,1.75-4.2,4.63-7.67,8.55-9.94l21.55,14.26c7.75,5.13,23.02,19.79,26.21,28.06,1.54,4,1.65,8.03.12,11.87l-2.9,23.94c-.37,3-.16,6.64-1.38,9.28-1.83,2.46-5.94,2.26-9.05,1.79h0Z"/>
        <path class="cls-16" d="M184.45,185.38l-20.21-13.29c3.02-2.72,5.94-5.45,8.49-8.86l2.65-6.32,6.98-23.04,3.35-9.69c.94,5.4-2.16,9.6-.41,14.79.91,2.73,2.88,4.58,5.82,5.07,1.37,5.93,3.29,11.3,5.75,17.12l-4.34,9.18c-2.49,5.27-4.76,10.46-8.09,15.04h.01Z"/>
        <path class="cls-19" d="M183.75,183.68l-17.65-11.63c5.14-4.45,8.41-7.91,10.3-14.14l7.05-23c.14,4.95,2.28,8.92,6.84,10.19,1.36,5.64,3.05,10.6,5.27,15.85l-5.5,11.56c-1.82,3.82-3.4,7.51-6.32,11.13h0Z"/>
      </g>
    </g>
    <g class="cls-24">
      <line class="cls-12" x1="59.94" y1="152.25" x2="81.33" y2="117.25"/>
      <polygon class="cls-4" points="83.37 119.66 83.94 112.98 78.25 116.54 83.37 119.66 83.37 119.66"/>
    </g>
  </g>
</svg>`;

// ══════════════ MNA-SF 營養複評（Mini Nutritional Assessment）══════════════

// ── MNA-SF — Mini Nutritional Assessment Short-Form ──────────────
// Guigoz Y et al., J Nutr Health Aging 2006;10:466-485.
// Rubenstein LZ et al., J Nutr Health Aging 2001;5:194-8.
// © Nestlé, 1994. Revision 2009. Public domain for clinical use.
//
// 6 items: A(0-3) B(0-3) C(0-2) D(0-2) E(0-2) F1(0-3)/F2(0-3)
// Maximum: 14 points
// 12-14: Normal nutritional status
//  8-11: At risk of malnutrition
//  0-7:  Malnourished

// ── Props ─────────────────────────────────────────────────────────
// Live link to ICOPE's nutrition-abnormal flag (same component)
const icopeNutAbn = nutAbn;

// ── Question answers ──────────────────────────────────────────────
// null = unanswered
const qA = ref<number | null>(null); // food intake decline  0-3
const qB = ref<number | null>(null); // weight loss          0-3
const qC = ref<number | null>(null); // mobility             0-2
const qD = ref<number | null>(null); // psychological stress 0-2 (0=yes,2=no)
const qE = ref<number | null>(null); // neuropsychological   0-2
const qF1 = ref<number | null>(null); // BMI                  0-3
const qF2 = ref<number | null>(null); // calf circumference   0-1 (fallback)

// Whether to use F2 instead of F1
const useF2 = ref(false);

const mna_copied = ref(false);
const mna_showResults = ref(false);

// ── Scoring ───────────────────────────────────────────────────────
const fScore = computed(() => {
  if (useF2.value) return qF2.value;
  return qF1.value;
});

const mna_totalScore = computed((): number | null => {
  if (
    qA.value === null ||
    qB.value === null ||
    qC.value === null ||
    qD.value === null ||
    qE.value === null ||
    fScore.value === null
  )
    return null;
  return qA.value + qB.value + qC.value + qD.value + qE.value + fScore.value;
});

const mna_isComplete = computed(() => mna_totalScore.value !== null);

const mna_answeredCount = computed(
  () =>
    [qA.value, qB.value, qC.value, qD.value, qE.value, fScore.value].filter(
      (v) => v !== null,
    ).length,
);

// ── Interpretation ────────────────────────────────────────────────
const mna_severity = computed(() => {
  const s = mna_totalScore.value;
  if (s === null)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${mna_answeredCount.value}/6 題`,
      screen: false,
    };
  if (s >= 12)
    return {
      level: "正常營養狀況",
      color: "normal",
      advice:
        "MNA-SF 12–14 分：目前無營養不良風險，建議維持均衡飲食並定期追蹤。",
      screen: false,
    };
  if (s >= 8)
    return {
      level: "有營養不良的風險",
      color: "mild",
      advice:
        "MNA-SF 8–11 分：有營養不良風險，建議轉介營養師進行完整 MNA 評估及飲食介入。",
      screen: true,
    };
  return {
    level: "營養不良",
    color: "critical",
    advice:
      "MNA-SF 0–7 分：確認營養不良，需立即轉介老年醫學科或營養師進行完整評估與積極介入。",
    screen: true,
  };
});

const mna_barPct = computed(() =>
  mna_isComplete.value ? ((mna_totalScore.value ?? 0) / 14) * 100 : 0,
);

// ── Sub-score label helper ────────────────────────────────────────
function sl(v: number | null): string {
  return v === null ? "—" : String(v);
}

// ── Markdown export ───────────────────────────────────────────────
function mna_generateMarkdown(): string {
  const aLabel = [
    "食量嚴重減少 (0分)",
    "食量中度減少 (1分)",
    "食量沒有改變 (2分)",
    "食量增加 (3分)",
  ];
  const bLabel = [
    "體重下降>3kg (0分)",
    "不知道 (1分)",
    "體重下降1-3kg (2分)",
    "體重沒有下降 (3分)",
  ];
  const cLabel = [
    "需長期臥床或坐輪椅 (0分)",
    "可以下床或離開輪椅但不能外出 (1分)",
    "可以外出 (2分)",
  ];
  const dLabel = ["有 (0分)", "沒有 (2分)"];
  const eLabel = [
    "嚴重癡呆或抑鬱 (0分)",
    "輕度癡呆 (1分)",
    "沒有精神心理問題 (2分)",
  ];
  const f1Label = [
    "BMI<19 (0分)",
    "BMI 19至<21 (1分)",
    "BMI 21至<23 (2分)",
    "BMI≥23 (3分)",
  ];
  const f2Label = ["小腿圍<31cm (0分)", "小腿圍≥31cm (3分)"];

  return (
    `# MNA-SF 迷你營養評估簡式版結果\n\n` +
    `## 各題作答\n\n` +
    `- **A. 食量變化**：${qA.value !== null ? aLabel[qA.value] : "未填"}\n` +
    `- **B. 體重下降**：${qB.value !== null ? bLabel[qB.value] : "未填"}\n` +
    `- **C. 活動能力**：${qC.value !== null ? cLabel[qC.value] : "未填"}\n` +
    `- **D. 心理創傷或急性疾病**：${qD.value !== null ? dLabel[qD.value === 0 ? 0 : 1] : "未填"}\n` +
    `- **E. 精神心理問題**：${qE.value !== null ? eLabel[qE.value] : "未填"}\n` +
    (useF2.value
      ? `- **F2. 小腿圍**：${qF2.value !== null ? f2Label[qF2.value === 0 ? 0 : 1] : "未填"}\n`
      : `- **F1. BMI**：${qF1.value !== null ? f1Label[qF1.value] : "未填"}\n`) +
    `\n---\n\n` +
    `## 計算結果\n\n` +
    `- **MNA-SF 總分**：${mna_totalScore.value ?? "未完成"} / 14\n` +
    `- **營養狀況**：${mna_severity.value.level}\n` +
    `- **臨床建議**：${mna_severity.value.advice}`
  );
}

async function mna_copyMarkdown() {
  await navigator.clipboard.writeText(mna_generateMarkdown());
  mna_copied.value = true;
  setTimeout(() => (mna_copied.value = false), 2000);
}

function mna_reset() {
  qA.value = null;
  qB.value = null;
  qC.value = null;
  qD.value = null;
  qE.value = null;
  qF1.value = null;
  qF2.value = null;
  useF2.value = false;
  mna_showResults.value = false;
}

// ══════════════ GDS 老年抑鬱（Geriatric Depression Scale）══════════════

// ── GDS — Unified Calculator (4 / 15 / 30 item) ─────────────────
// GDS-30: Yesavage et al., J Psychiatr Res 1983;17:37–49.  Public domain.
// GDS-15: Sheikh & Yesavage, Clin Gerontol 1986;5:165–173.
// GDS-4:  D'Ath et al., Age Ageing 1994;23:360–364.
//
// YES/NO format. Score 1 for the depressive answer per question.

const questions30 = [
  {
    key: "q1",
    text: "您對目前的生活基本上感到滿意嗎？",
    en: "Are you basically satisfied with your life?",
    depressiveAnswer: "no",
  },
  {
    key: "q2",
    text: "您是否已放棄許多原有的活動和興趣？",
    en: "Have you dropped many of your activities and interests?",
    depressiveAnswer: "yes",
  },
  {
    key: "q3",
    text: "您是否覺得生活空虛？",
    en: "Do you feel that your life is empty?",
    depressiveAnswer: "yes",
  },
  {
    key: "q4",
    text: "您是否經常感到無聊？",
    en: "Do you often get bored?",
    depressiveAnswer: "yes",
  },
  {
    key: "q5",
    text: "您對未來是否有希望？",
    en: "Are you hopeful about the future?",
    depressiveAnswer: "no",
  },
  {
    key: "q6",
    text: "您是否因腦中揮之不去的念頭而感到困擾？",
    en: "Are you bothered by thoughts you can't get out of your head?",
    depressiveAnswer: "yes",
  },
  {
    key: "q7",
    text: "您大部分時間情緒是否良好？",
    en: "Are you in good spirits most of the time?",
    depressiveAnswer: "no",
  },
  {
    key: "q8",
    text: "您是否害怕有不好的事情即將發生？",
    en: "Are you afraid that something bad is going to happen to you?",
    depressiveAnswer: "yes",
  },
  {
    key: "q9",
    text: "您是否大部分時間感到快樂？",
    en: "Do you feel happy most of the time?",
    depressiveAnswer: "no",
  },
  {
    key: "q10",
    text: "您是否常常感到無助？",
    en: "Do you often feel helpless?",
    depressiveAnswer: "yes",
  },
  {
    key: "q11",
    text: "您是否經常感到坐立難安、靜不下來？",
    en: "Do you often get restless and fidgety?",
    depressiveAnswer: "yes",
  },
  {
    key: "q12",
    text: "您是否寧願待在家中，不願外出或做新的事？",
    en: "Do you prefer to stay at home rather than going out and doing things?",
    depressiveAnswer: "yes",
  },
  {
    key: "q13",
    text: "您是否經常擔心未來？",
    en: "Do you frequently worry about the future?",
    depressiveAnswer: "yes",
  },
  {
    key: "q14",
    text: "您是否覺得自己的記憶比一般人差？",
    en: "Do you feel you have more problems with memory than most?",
    depressiveAnswer: "yes",
  },
  {
    key: "q15",
    text: "您是否覺得現在還能活著是件很棒的事？",
    en: "Do you think it is wonderful to be alive now?",
    depressiveAnswer: "no",
  },
  {
    key: "q16",
    text: "您是否常常感到沮喪和憂鬱？",
    en: "Do you feel downhearted and blue?",
    depressiveAnswer: "yes",
  },
  {
    key: "q17",
    text: "您是否覺得現在的自己毫無價值？",
    en: "Do you feel pretty worthless the way you are now?",
    depressiveAnswer: "yes",
  },
  {
    key: "q18",
    text: "您是否對過去的事感到懊悔？",
    en: "Do you worry a lot about the past?",
    depressiveAnswer: "yes",
  },
  {
    key: "q19",
    text: "您是否覺得生活令人興奮充實？",
    en: "Do you find life very exciting?",
    depressiveAnswer: "no",
  },
  {
    key: "q20",
    text: "您是否覺得開始新計畫很困難？",
    en: "Is it hard for you to get started on new projects?",
    depressiveAnswer: "yes",
  },
  {
    key: "q21",
    text: "您是否精力充沛？",
    en: "Do you feel full of energy?",
    depressiveAnswer: "no",
  },
  {
    key: "q22",
    text: "您是否覺得自己的處境沒有希望？",
    en: "Do you feel that your situation is hopeless?",
    depressiveAnswer: "yes",
  },
  {
    key: "q23",
    text: "您是否覺得大多數人的狀況比您好？",
    en: "Do you think that most people are better off than you are?",
    depressiveAnswer: "yes",
  },
  {
    key: "q24",
    text: "您是否常常為一點小事就感到心煩？",
    en: "Do you frequently get upset over little things?",
    depressiveAnswer: "yes",
  },
  {
    key: "q25",
    text: "您是否常常想哭？",
    en: "Do you frequently feel like crying?",
    depressiveAnswer: "yes",
  },
  {
    key: "q26",
    text: "您是否難以集中注意力？",
    en: "Do you have trouble concentrating?",
    depressiveAnswer: "yes",
  },
  {
    key: "q27",
    text: "您是否享受早上起床的感覺？",
    en: "Do you enjoy getting up in the morning?",
    depressiveAnswer: "no",
  },
  {
    key: "q28",
    text: "您是否寧願避開社交場合？",
    en: "Do you prefer to avoid social occasions?",
    depressiveAnswer: "yes",
  },
  {
    key: "q29",
    text: "您做決定是否容易？",
    en: "Is it easy for you to make decisions?",
    depressiveAnswer: "no",
  },
  {
    key: "q30",
    text: "您的思緒是否像以前一樣清晰？",
    en: "Is your mind as clear as it used to be?",
    depressiveAnswer: "no",
  },
];

const gds15Keys = [
  "q1",
  "q2",
  "q3",
  "q4",
  "q7",
  "q8",
  "q9",
  "q10",
  "q12",
  "q14",
  "q15",
  "q17",
  "q21",
  "q22",
  "q23",
];
const gds4Keys = ["q1", "q2", "q3", "q4"];

// ── Props ────────────────────────────────────────────────────────
// Pass `icope-dep-abn` from a parent/page to light up the ICOPE hint pill.
// Live link to ICOPE's depression-abnormal flag (same component)
const icopeDepAbn = depAbn;

// ── State ────────────────────────────────────────────────────────
type gds_Method = "4" | "15" | "30";
const gds_method = ref<gds_Method>("15");
const selections = ref<Record<string, "yes" | "no" | null>>(
  Object.fromEntries(questions30.map((q) => [q.key, null])),
);
const gds_copied = ref(false);
const gds_showResults = ref(false);

// ── Active question set ──────────────────────────────────────────
const activeKeys = computed(() =>
  gds_method.value === "4"
    ? gds4Keys
    : gds_method.value === "15"
      ? gds15Keys
      : questions30.map((q) => q.key),
);

const activeQuestions = computed(() =>
  activeKeys.value.map((k, i) => ({
    ...questions30.find((q) => q.key === k)!,
    qNum: i + 1,
  })),
);

const maxScore = computed(() => parseInt(gds_method.value));

// ── Scoring ──────────────────────────────────────────────────────
const gds_totalScore = computed(() =>
  activeKeys.value.reduce((sum, k) => {
    const q = questions30.find((q) => q.key === k)!;
    const ans = selections.value[k];
    if (ans === null) return sum;
    return sum + (ans === q.depressiveAnswer ? 1 : 0);
  }, 0),
);

const gds_answeredCount = computed(
  () => activeKeys.value.filter((k) => selections.value[k] !== null).length,
);

const gds_isComplete = computed(
  () => gds_answeredCount.value === activeKeys.value.length,
);

// ── Interpretation ───────────────────────────────────────────────
const gds_severity = computed(() => {
  const s = gds_totalScore.value;
  const m = gds_method.value;

  if (!gds_isComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${gds_answeredCount.value}/${maxScore.value} 題`,
      screen: false,
    };

  if (m === "4") {
    if (s <= 1)
      return {
        level: "無抑鬱跡象",
        color: "normal",
        advice: "GDS-4 ≤ 1：目前無明顯抑鬱跡象",
        screen: false,
      };
    return {
      level: "疑似抑鬱（建議進一步評估）",
      color: "moderate",
      advice:
        "GDS-4 ≥ 2：疑似有抑鬱症狀，建議使用 GDS-15 或 GDS-30 進行進一步評估",
      screen: true,
    };
  }

  if (m === "15") {
    if (s <= 4)
      return {
        level: "正常（無抑鬱）",
        color: "normal",
        advice: "GDS-15 ≤ 4：無明顯抑鬱症狀",
        screen: false,
      };
    if (s <= 8)
      return {
        level: "輕度抑鬱",
        color: "mild",
        advice: "GDS-15 5–8：輕度抑鬱，建議進一步臨床訪談及追蹤觀察",
        screen: true,
      };
    if (s <= 11)
      return {
        level: "中度抑鬱",
        color: "moderate",
        advice: "GDS-15 9–11：中度抑鬱，建議轉介心理衛生專業人員評估",
        screen: true,
      };
    return {
      level: "重度抑鬱",
      color: "critical",
      advice:
        "GDS-15 12–15：重度抑鬱，需立即進行完整精神科評估，並評估自傷風險",
      screen: true,
    };
  }

  if (s <= 9)
    return {
      level: "正常（無抑鬱）",
      color: "normal",
      advice: "GDS-30 ≤ 9：無明顯抑鬱症狀",
      screen: false,
    };
  if (s <= 19)
    return {
      level: "輕中度抑鬱",
      color: "moderate",
      advice: "GDS-30 10–19：輕至中度抑鬱，建議轉介心理衛生專業人員評估",
      screen: true,
    };
  return {
    level: "重度抑鬱",
    color: "critical",
    advice: "GDS-30 20–30：重度抑鬱，需立即進行完整精神科評估及安全性評估",
    screen: true,
  };
});

const gds_barPct = computed(() =>
  gds_isComplete.value ? (gds_totalScore.value / maxScore.value) * 100 : 0,
);

// ── Markdown output ──────────────────────────────────────────────
function gds_generateMarkdown() {
  const versionLabel = `GDS-${gds_method.value}`;
  const lines = activeQuestions.value
    .map((q) => {
      const ans = selections.value[q.key];
      const isDepressive = ans === q.depressiveAnswer;
      return `- **Q${q.qNum}. ${q.text}**（${q.en}）：${ans === "yes" ? "是 Yes" : ans === "no" ? "否 No" : "未填"} ${isDepressive && ans !== null ? "✓" : ""}`;
    })
    .join("\n");

  return (
    `# ${versionLabel} 老年抑鬱量表評估結果\n\n` +
    `## 各題作答\n\n${lines}\n\n` +
    `---\n\n` +
    `## 計算結果\n\n` +
    `- **${versionLabel} 總分**：${gds_totalScore.value} / ${maxScore.value}\n` +
    `- **嚴重程度**：${gds_severity.value.level}\n` +
    `- **臨床建議**：${gds_severity.value.advice}`
  );
}

async function gds_copyMarkdown() {
  await navigator.clipboard.writeText(gds_generateMarkdown());
  gds_copied.value = true;
  setTimeout(() => (gds_copied.value = false), 2000);
}

function gds_reset() {
  questions30.forEach((q) => {
    selections.value[q.key] = null;
  });
  gds_showResults.value = false;
}

function gds_switchMethod(m: gds_Method) {
  gds_method.value = m;
  gds_reset();
}

// ══════════════ WHO 近距離視力（Near Vision Test）══════════════

// ── WHO 近距離視力測試卡 ─────────────────────────────────────────
// WHO Simple Vision Chart — Tumbling E Near Card
// Testing distance: 40 cm · 4 rows × 4 optotypes = 16 symbols
// TWO independent answer sets: Right Eye (OD) / Left Eye (OS)
// Pass criterion: Row 2 (6/18) ≥ 3/4 correct

type Dir = "up" | "down" | "left" | "right";
type RowAns = (Dir | null)[];
type Eye = "right" | "left";

interface Row {
  snellen: string;
  sizeMm: number;
  dirs: Dir[];
  isThreshold: boolean;
}

const rows: Row[] = [
  {
    snellen: "6/36",
    sizeMm: 9.89,
    dirs: ["right", "down", "left", "up"],
    isThreshold: false,
  },
  {
    snellen: "6/18",
    sizeMm: 4.96,
    dirs: ["up", "right", "down", "left"],
    isThreshold: true,
  },
  {
    snellen: "6/12",
    sizeMm: 3.3,
    dirs: ["left", "up", "right", "down"],
    isThreshold: false,
  },
  {
    snellen: "6/6",
    sizeMm: 1.65,
    dirs: ["down", "left", "up", "right"],
    isThreshold: false,
  },
];

// ── Embedded SVG path data (physical mm viewBox from uploaded files) ──
const svgInner: Record<string, string> = {
  "6/36-right": `<g><rect width="9.89" height="1.98"/><rect y="3.96" width="9.89" height="1.98"/><rect y="7.91" width="9.89" height="1.98"/><rect y="1.98" width="1.98" height="1.98"/><rect y="5.94" width="1.98" height="1.98"/></g>`,
  "6/36-left": `<g><rect y="7.91" width="9.89" height="1.98"/><rect y="3.96" width="9.89" height="1.98"/><rect width="9.89" height="1.98"/><rect x="7.91" y="5.94" width="1.98" height="1.98"/><rect x="7.91" y="1.98" width="1.98" height="1.98"/></g>`,
  "6/36-up": `<g><rect width="1.98" height="9.89"/><rect x="3.96" width="1.98" height="9.89"/><rect x="7.91" width="1.98" height="9.89"/><rect x="1.98" y="7.91" width="1.98" height="1.98"/><rect x="5.94" y="7.91" width="1.98" height="1.98"/></g>`,
  "6/36-down": `<g><rect x="7.91" width="1.98" height="9.89"/><rect x="3.96" width="1.98" height="9.89"/><rect width="1.98" height="9.89"/><rect x="5.94" width="1.98" height="1.98"/><rect x="1.98" width="1.98" height="1.98"/></g>`,
  "6/18-right": `<g><rect width="4.96" height=".99"/><rect y="1.98" width="4.96" height=".99"/><rect y="3.97" width="4.96" height=".99"/><rect y=".99" width=".99" height=".99"/><rect y="2.98" width=".99" height=".99"/></g>`,
  "6/18-left": `<g><rect y="3.97" width="4.96" height=".99"/><rect y="1.98" width="4.96" height=".99"/><rect width="4.96" height=".99"/><rect x="3.97" y="2.98" width=".99" height=".99"/><rect x="3.97" y=".99" width=".99" height=".99"/></g>`,
  "6/18-up": `<g><rect width=".99" height="4.96"/><rect x="1.98" width=".99" height="4.96"/><rect x="3.97" width=".99" height="4.96"/><rect x=".99" y="3.97" width=".99" height=".99"/><rect x="2.98" y="3.97" width=".99" height=".99"/></g>`,
  "6/18-down": `<g><rect x="3.97" width=".99" height="4.96"/><rect x="1.98" width=".99" height="4.96"/><rect width=".99" height="4.96"/><rect x="2.98" width=".99" height=".99"/><rect x=".99" width=".99" height=".99"/></g>`,
  "6/12-right": `<g><rect width="3.3" height=".66"/><rect y="1.32" width="3.3" height=".66"/><rect y="2.64" width="3.3" height=".66"/><rect y=".66" width=".66" height=".66"/><rect y="1.98" width=".66" height=".66"/></g>`,
  "6/12-left": `<g><rect y="2.64" width="3.3" height=".66"/><rect y="1.32" width="3.3" height=".66"/><rect width="3.3" height=".66"/><rect x="2.64" y="1.98" width=".66" height=".66"/><rect x="2.64" y=".66" width=".66" height=".66"/></g>`,
  "6/12-up": `<g><rect width=".66" height="3.3"/><rect x="1.32" width=".66" height="3.3"/><rect x="2.64" width=".66" height="3.3"/><rect x=".66" y="2.64" width=".66" height=".66"/><rect x="1.98" y="2.64" width=".66" height=".66"/></g>`,
  "6/12-down": `<g><rect x="2.64" width=".66" height="3.3"/><rect x="1.32" width=".66" height="3.3"/><rect width=".66" height="3.3"/><rect x="1.98" width=".66" height=".66"/><rect x=".66" width=".66" height=".66"/></g>`,
  "6/6-right": `<g><rect width="1.65" height=".33"/><rect y=".66" width="1.65" height=".33"/><rect y="1.32" width="1.65" height=".33"/><rect y=".33" width=".33" height=".33"/><rect y=".99" width=".33" height=".33"/></g>`,
  "6/6-left": `<g><rect y="1.32" width="1.65" height=".33"/><rect y=".66" width="1.65" height=".33"/><rect width="1.65" height=".33"/><rect x="1.32" y=".99" width=".33" height=".33"/><rect x="1.32" y=".33" width=".33" height=".33"/></g>`,
  "6/6-up": `<g><rect width=".33" height="1.65"/><rect x=".66" width=".33" height="1.65"/><rect x="1.32" width=".33" height="1.65"/><rect x=".33" y="1.32" width=".33" height=".33"/><rect x=".99" y="1.32" width=".33" height=".33"/></g>`,
  "6/6-down": `<g><rect x="1.32" width=".33" height="1.65"/><rect x=".66" width=".33" height="1.65"/><rect width=".33" height="1.65"/><rect x=".99" width=".33" height=".33"/><rect x=".33" width=".33" height=".33"/></g>`,
};

function getSvgInner(snellen: string, dir: Dir): string {
  return svgInner[`${snellen}-${dir}`] ?? "";
}

// ── Eye tab state ─────────────────────────────────────────────────
const activeEye = ref<Eye>("right");

// Independent answer arrays — one per eye
const answersOD = ref<RowAns[]>(rows.map(() => [null, null, null, null]));
const answersOS = ref<RowAns[]>(rows.map(() => [null, null, null, null]));

// Proxy: reads/writes the active eye's array
const currentAnswers = computed(() =>
  activeEye.value === "right" ? answersOD.value : answersOS.value,
);

function setAnswer(ri: number, ci: number, dir: Dir) {
  if (activeEye.value === "right") answersOD.value[ri][ci] = dir;
  else answersOS.value[ri][ci] = dir;
}

function switchEye(eye: Eye) {
  activeEye.value = eye;
  vis_showResults.value = false;
}

// ── Per-eye stat helpers ──────────────────────────────────────────
function calcRowStats(ans: RowAns[]) {
  return rows.map((row, ri) => {
    const a = ans[ri];
    const answered = a.filter((v) => v !== null).length;
    const correct = a.filter((v, ci) => v === row.dirs[ci]).length;
    return { answered, correct, done: answered === 4 };
  });
}

function calcSymStatus(ans: RowAns[]) {
  return rows.map((row, ri) =>
    row.dirs.map((dir, ci) => {
      const v = ans[ri][ci];
      return v === null ? "unanswered" : v === dir ? "correct" : "wrong";
    }),
  );
}

function calcSeverity(stats: ReturnType<typeof calcRowStats>) {
  const done = stats.every((s) => s.done);
  if (!done)
    return { level: "填寫中", color: "filling", advice: "", screen: false };
  const c18 = stats[1].correct;
  const c12 = stats[2].correct;
  const c6 = stats[3].correct;
  if (c18 < 3)
    return {
      level: "視力受損（6/18 未通過）",
      color: "critical",
      advice:
        "6/18 行辨識 < 3/4，依 WHO 標準建議視為近距視力受損，請轉介眼科（屈光、白內障、青光眼及視網膜篩查）。",
      screen: true,
    };
  if (c12 < 3)
    return {
      level: "輕度視力障礙（6/12 未通過）",
      color: "moderate",
      advice: "6/18 通過但 6/12 未通過，建議轉介眼科評估，考慮老花眼鏡。",
      screen: true,
    };
  if (c6 < 3)
    return {
      level: "視力尚可（6/6 未通過）",
      color: "mild",
      advice:
        "6/18、6/12 均通過，但 6/6 未達標。近距視力可接受，建議 6–12 個月後追蹤。",
      screen: false,
    };
  return {
    level: "視力正常（6/6 通過）",
    color: "normal",
    advice: "所有列均通過，近距視力良好。建議每 6–12 個月定期追蹤。",
    screen: false,
  };
}

// ── Active-eye computed ───────────────────────────────────────────
const rowStats = computed(() => calcRowStats(currentAnswers.value));
const symStatus = computed(() => calcSymStatus(currentAnswers.value));
const vis_severity = computed(() => calcSeverity(rowStats.value));
const row18 = computed(() => rowStats.value[1]);
const pass18 = computed(() =>
  row18.value.done ? row18.value.correct >= 3 : null,
);
const vis_isComplete = computed(() => rowStats.value.every((s) => s.done));
const answeredTotal = computed(
  () => currentAnswers.value.flat().filter((a) => a !== null).length,
);
const vis_barPct = computed(() =>
  row18.value.done
    ? (row18.value.correct / 4) * 100
    : (answeredTotal.value / 16) * 25,
);

// ── Both-eye summaries (for header strip) ─────────────────────────
const statsOD = computed(() => calcRowStats(answersOD.value));
const statsOS = computed(() => calcRowStats(answersOS.value));
const severityOD = computed(() => calcSeverity(statsOD.value));
const severityOS = computed(() => calcSeverity(statsOS.value));
const row18OD = computed(() => statsOD.value[1]);
const row18OS = computed(() => statsOS.value[1]);
const doneOD = computed(() => statsOD.value.every((s) => s.done));
const doneOS = computed(() => statsOS.value.every((s) => s.done));
const bothDone = computed(() => doneOD.value && doneOS.value);

const alertCombined = computed(() => {
  if (bothDone.value) {
    const od = severityOD.value.screen;
    const os = severityOS.value.screen;
    if (!od && !os) return null;
    const level = [
      od ? severityOD.value.level : null,
      os ? severityOS.value.level : null,
    ]
      .filter(Boolean)
      .join("；");
    const adv =
      od && os
        ? `${severityOD.value.advice} 左眼亦同，需雙眼評估。`
        : od
          ? severityOD.value.advice
          : severityOS.value.advice;
    const worst =
      od && os
        ? "critical"
        : od
          ? severityOD.value.color
          : severityOS.value.color;
    return { level, advice: adv, color: worst };
  }
  if (vis_isComplete.value && vis_severity.value.screen)
    return {
      level: vis_severity.value.level,
      advice: vis_severity.value.advice,
      color: vis_severity.value.color,
    };
  return null;
});

// ── Direction helpers ─────────────────────────────────────────────
const dirArrow: Record<Dir, string> = {
  up: "↑",
  down: "↓",
  left: "←",
  right: "→",
};
const dirZh: Record<Dir, string> = {
  up: "↑ 上",
  down: "↓ 下",
  left: "← 左",
  right: "→ 右",
};
const allDirs: Dir[] = ["up", "down", "left", "right"];

// ── Markdown export ───────────────────────────────────────────────
const vis_copied = ref(false);
const vis_showResults = ref(false);

function eyeLines(ans: RowAns[], stats: ReturnType<typeof calcRowStats>) {
  return rows
    .map((row, ri) => {
      const s = stats[ri];
      const detail = row.dirs
        .map((d, ci) => {
          const a = ans[ri][ci];
          return !a
            ? `(${ci + 1})未填`
            : a === d
              ? `(${ci + 1})✓`
              : `(${ci + 1})✗答${dirArrow[a]}`;
        })
        .join(" ");
      return `- **${row.snellen}**${row.isThreshold ? "【臨界值】" : ""}：${s.correct}/4 正確 ${detail}`;
    })
    .join("\n");
}

function vis_generateMarkdown(): string {
  const svOD = severityOD.value;
  const svOS = severityOS.value;
  const r18od = row18OD.value;
  const r18os = row18OS.value;
  return (
    `# WHO 近距離視力測試結果（測試距離 40 cm）\n\n` +
    `## 右眼（OD）\n\n` +
    eyeLines(answersOD.value, statsOD.value) +
    "\n\n" +
    `- 6/18 臨界行：${r18od.correct}/4 → ${doneOD.value ? (r18od.correct >= 3 ? "✅ 通過" : "⚠️ 未通過") : "未完成"}\n` +
    `- 判讀：${svOD.level}\n\n` +
    `## 左眼（OS）\n\n` +
    eyeLines(answersOS.value, statsOS.value) +
    "\n\n" +
    `- 6/18 臨界行：${r18os.correct}/4 → ${doneOS.value ? (r18os.correct >= 3 ? "✅ 通過" : "⚠️ 未通過") : "未完成"}\n` +
    `- 判讀：${svOS.level}\n\n---\n\n` +
    `## 雙眼摘要\n\n` +
    `| 眼別 | 6/36 | 6/18（臨界）| 6/12 | 6/6 | 判讀 |\n` +
    `|------|------|------------|------|-----|------|\n` +
    `| 右眼 OD | ${statsOD.value[0].correct}/4 | **${r18od.correct}/4** | ${statsOD.value[2].correct}/4 | ${statsOD.value[3].correct}/4 | ${svOD.level} |\n` +
    `| 左眼 OS | ${statsOS.value[0].correct}/4 | **${r18os.correct}/4** | ${statsOS.value[2].correct}/4 | ${statsOS.value[3].correct}/4 | ${svOS.level} |`
  );
}

async function vis_copyOutput() {
  await navigator.clipboard.writeText(vis_generateMarkdown());
  vis_copied.value = true;
  setTimeout(() => (vis_copied.value = false), 2000);
}

function resetCurrentEye() {
  if (activeEye.value === "right")
    answersOD.value = rows.map(() => [null, null, null, null]);
  else answersOS.value = rows.map(() => [null, null, null, null]);
  vis_showResults.value = false;
}

function resetAll() {
  answersOD.value = rows.map(() => [null, null, null, null]);
  answersOS.value = rows.map(() => [null, null, null, null]);
  vis_showResults.value = false;
}
</script>

<template>
  <div class="geriassess">
    <!-- Tab bar -->
    <div
      class="tab-bar"
      ref="tabBarEl"
      @pointerdown="tabBarPointerDown"
      @pointermove="tabBarPointerMove"
      @pointerup="tabBarPointerUp"
      @pointercancel="tabBarPointerUp"
    >
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'icope' }"
        @click="activeTab = 'icope'"
      >
        <span class="tab-label">WHO ICOPE 功能篩查</span>
        <span class="tab-sub">Integrated Care for Older People</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cog' }"
        @click="activeTab = 'cog'"
      >
        <span class="tab-label">BHT・AD8 認知複評</span>
        <span class="tab-sub">Cognitive Assessment</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'sppb' }"
        @click="activeTab = 'sppb'"
      >
        <span class="tab-label">SPPB 行動功能</span>
        <span class="tab-sub">Short Physical Performance Battery</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'mna' }"
        @click="activeTab = 'mna'"
      >
        <span class="tab-label">MNA-SF 營養複評</span>
        <span class="tab-sub">Mini Nutritional Assessment</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'gds' }"
        @click="activeTab = 'gds'"
      >
        <span class="tab-label">GDS 老年抑鬱</span>
        <span class="tab-sub">Geriatric Depression Scale</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'vis' }"
        @click="activeTab = 'vis'"
      >
        <span class="tab-label">WHO 近距離視力</span>
        <span class="tab-sub">Near Vision Test</span>
      </button>
    </div>

  <div v-show="activeTab === 'icope'" class="icope">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="icope-header">
      <div class="header-title">
        <h2 class="title">WHO ICOPE 長者功能篩查</h2>
        <p class="subtitle">
          Integrated Care for Older People · 112 年國健署長者功能評估初評量表 ·
          6 大功能域 ＋ 用藥 ＋ 社會照護
        </p>
      </div>
      <div
        class="score-badge"
        :class="
          !primaryDone
            ? 'badge-pending'
            : abnCount === 0
              ? 'badge-normal'
              : abnCount <= 2
                ? 'badge-moderate'
                : 'badge-critical'
        "
      >
        <span class="badge-top">初評異常</span>
        <span class="badge-num">{{ primaryDone ? abnCount : "—" }}</span>
        <span class="badge-bot">{{
          primaryDone ? (abnCount === 0 ? "全部正常" : "項異常") : "填寫中"
        }}</span>
      </div>
    </div>

    <!-- ── 認知功能 ── -->
    <div class="nihss-group">
      <div class="group-header-bar cog-bar">
        <span class="group-icon">🧠</span>
        <span class="group-label-text">認知功能 Cognitive Decline</span>
        <span class="group-sub-text">記憶力 + 定向力（時間 / 地點）</span>
        <span
          class="group-score-tally"
          :class="cogDone ? (cogAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ cogDone ? (cogAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="cog1 !== null ? (cog1 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum cog-q">記憶</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >記憶力：說出 3 項物品（鉛筆、汽車、書）</span
              >
              <span class="item-sub"
                >請長者重複，第三題後再詢問一次。長者能否正確回憶全部 3
                項？</span
              >
            </div>
            <div class="yn-row">
            <button
              class="yn-btn"
              :class="{ 'yn-green': cog1 === 'Y' }"
              @click="cog1 = 'Y'"
            >
              正常
            </button>
            <button
              class="yn-btn"
              :class="{ 'yn-red': cog1 === 'N' }"
              @click="cog1 = 'N'"
            >
              異常
            </button>
          </div>
          </div>
        </div>

        <div
          class="icope-item"
          :class="cog2 !== null ? (cog2 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum cog-q">時間</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >定向力：詢問「今天的日期？」（含年月日）</span
              >
              <span class="item-sub">答錯或不知道視為異常。</span>
            </div>
            <div class="yn-row">
            <button
              class="yn-btn"
              :class="{ 'yn-green': cog2 === 'Y' }"
              @click="cog2 = 'Y'"
            >
              正常
            </button>
            <button
              class="yn-btn"
              :class="{ 'yn-red': cog2 === 'N' }"
              @click="cog2 = 'N'"
            >
              異常
            </button>
          </div>
          </div>
        </div>

        <div
          class="icope-item"
          :class="cog3 !== null ? (cog3 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum cog-q">地點</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">定向力：詢問「您現在在哪裡？」</span>
              <span class="item-sub"
                >無法正確說出目前所在地點（家中、診所、醫院等）視為異常。</span
              >
            </div>
            <div class="yn-row">
            <button
              class="yn-btn"
              :class="{ 'yn-green': cog3 === 'Y' }"
              @click="cog3 = 'Y'"
            >
              正常
            </button>
            <button
              class="yn-btn"
              :class="{ 'yn-red': cog3 === 'N' }"
              @click="cog3 = 'N'"
            >
              異常
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 行動功能 ── -->
    <div class="nihss-group">
      <div class="group-header-bar mob-bar">
        <span class="group-icon">🦵</span>
        <span class="group-label-text">行動功能 Limited Mobility</span>
        <span class="group-sub-text">椅子起身測試（5 次 / 12 秒）</span>
        <span
          class="group-score-tally"
          :class="mobDone ? (mobAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ mobDone ? (mobAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="mob1 !== null ? (mob1 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum mob-q">起身</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >椅子起身測試：雙手抱胸，連續起立坐下五次，是否在 12
                秒內完成？</span
              >
              <span class="item-sub"
                >計時從長者開始起身算起。不可用手臂撐扶椅背。超過 12
                秒或無法完成視為異常。</span
              >
            </div>
            <span
              class="item-score"
              :class="
                mob1 === 'N' ? 'val-abn' : mob1 === 'Y' ? 'val-ok' : 'val-nd'
              "
            >
              {{ mob1 === null ? "—" : mob1 === "Y" ? "通過" : "異常" }}
            </span>
          </div>

          <!-- ✦ 椅子起身示意圖 ✦ -->
          <div class="mob-illustration">
            <div class="mob-illus-inner">
              <div class="mob-illus-badge">
                <span class="mob-illus-icon">⏱</span>
                <span>5 次 ／ <strong>≤ 12 秒</strong></span>
              </div>
              <svg
                class="mob-illus-svg"
                aria-label="椅子起身測試示意圖"
                role="img"
                id="sts-root"
                data-name="圖層 2"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                viewBox="0 0 348 290.16"
              >
                <defs>
                  <clipPath id="sts-clippath">
                    <polygon
                      class="sts-13"
                      points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"
                    />
                  </clipPath>
                  <clipPath id="sts-clippath-1">
                    <polygon
                      class="sts-14"
                      points="0 0 348 0 348 290.16 0 290.16 0 0 0 0"
                    />
                  </clipPath>
                  <clipPath id="sts-clippath-2">
                    <polygon
                      class="sts-11"
                      points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"
                    />
                  </clipPath>
                  <clipPath id="sts-clippath-3">
                    <polygon
                      class="sts-13"
                      points="0 290.16 348 290.16 348 0 0 0 0 290.16 0 290.16"
                    />
                  </clipPath>
                </defs>
                <g id="sts-layer1" data-name="圖層 1">
                  <g class="sts-18">
                    <g class="sts-32">
                      <polygon
                        class="sts-28"
                        points="123.53 230.89 183.51 230.89 183.51 233.24 123.53 233.24 123.53 230.89 123.53 230.89"
                      />
                      <polygon
                        class="sts-28"
                        points=".77 230.89 60.8 230.89 60.8 233.24 .77 233.24 .77 230.89 .77 230.89"
                      />
                      <path
                        class="sts-30"
                        d="M324.31,269.34c4.98,5.61,11.6,9.2,19.03,8.94,1.44-.05,2.64.37,3.41,1.14.91.91,1.26,2.21.98,3.61-1.13,5.64-9.15,7.21-15.19,6.95l-11.78-.52c-5.91-.26-15.63,1.04-14.62-3.64l2.58-12.04c.33-1.53.9-2.64,2.16-3.55.81-17.11-7.91-36.97.48-51.64-4.12-11.78-4.93-26.1-4.45-38.52-3.33-3.88-5.97-8.02-6.81-13.11-.55-3.33-.25-7.35,1.65-10.05l5.65-7.98c1.98-2.81,2.9-5.61,2.43-9.1l-3.23-23.47-1.61-15.52c-.31-3.05,2.38-5.31,5.06-6.68.31-5.03-.24-10.04-2.34-14.6l-5.27-8.78c-3.74-6.22,2.68-16.8,12.08-19.4,6-1.66,12.41-.33,17.42,2.94,3.65,2.38,4.53,6.07,3.23,10.01-2.34,7.06,5.67,9.24.39,11.88.26,1.72-.5,3.25-1,4.89-.37,1.18.24,2.62-.85,3.69-.63.63-1.68,1.48-3.09,1.35l-4.13-.39c-.67,2.84-.67,5.48-.23,8.01,2.01-1.08,4.9-1.12,6.45.28,2.85,2.58,3.62,6.4,4.77,9.82l3.91,7.38c2.73,5.14,5.56,15.01,2.64,16.75-1.03.62-2.21.49-3.68-.24-.24,4.41-1.09,8.9-4.21,8.61-.98-.09-1.69-.8-2.67-1.56l.41,12.49-.15,13.47c-.85,5.06-1.56,9.53-.87,14.72l.66,16.86c.39,9.87-1.58,19.12-4.36,28.5l-.91,10.39-2.07,17.6-1.01,5.59-.84,14.9h0Z"
                      />
                      <path
                        class="sts-31"
                        d="M316.42,68.95c-3.41,1.32,6.96,10.83-4.19,18.28-.58-3.45-.94-6.41-2.55-9.1l-5.11-8.48c-3.02-5.01,2.93-13.92,10.81-16.01,8.01-2.12,18.99,2.24,17.97,8.29-.37,2.19-1.53,4.04-3.95,4.82l-5.94,1.92c-2.09.67-2.76,2.25-2.21,4.55l-2.75-3.85c-.43-.61-1.45-.63-2.07-.39h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M308.5,104.93c-1.86-2.88-1.32-6.17,1.47-7.92,2.79-1.75,6.39-1.19,8.8,1.19,4.17,4.11,7.48,8.86,10.66,13.72-.58,5.52-.35,15.05,1.95,15.27s-.04-3.9.15-9.95l.41-13.55-2.39-7.96c1.56-.4,2.07.71,2.65,1.62,1.72,2.74,2.21,5.47,2.78,8.63l2.56,14.2c.85,4.74.88,9.46-.94,13.96l-8.76-7.98c-4.66-4.25-8.36-9.19-11.73-14.5-3.02-1.77-5.7-3.72-7.63-6.73h.01Z"
                      />
                      <path
                        class="sts-17"
                        d="M323.96,94.6l-2.62,2.78c-2.46-2.78-5.43-4.02-8.86-3.67v-3.65c5.86-4.03,8.66-8.11,7.05-15.02,1.26.52,2.22.55,3,.07,2.13-1.29-.22-3.85,2.67-4.64,2.58-.7,4.87-1.25,7.23-2.59-.03,2.43.99,4.06,2.48,5.95-.81.38-1.62.7-2.04,1.35-.4.59.26,1.92.04,2.59-.61,1.83-.92,3.23-1.07,5.16-.17,2.26-6.27-1.23-7.42,1.77-1.15,3.01-1,6.44-.47,9.91h.01Z"
                      />
                      <path
                        class="sts-17"
                        d="M320.03,274.77l-6.72-1.71-.99-17.45c3.59.69,6.86.78,10.24-.19l-.58,13.89c-.07,1.86-1.1,3.42-1.95,5.47h0Z"
                      />
                      <path
                        class="sts-20"
                        d="M338.29,110.61c3.6,5.76,6.51,17.56,2.93,15.03-.6-.42-.71-1.38-.85-2.25l-2.07-12.78h0Z"
                      />
                      <path
                        class="sts-33"
                        d="M323.44,101.27c5.47,1.73,8.34,4.45,6.96,9.48l-6.96-9.48h0Z"
                      />
                      <path
                        class="sts-25"
                        d="M329.11,102.68c-1.71-1.14-4.25-2.02-5.52-3.78-.1-1.45,2.57-2.61,3.79-1.93l1.73,5.72h0Z"
                      />
                      <path
                        class="sts-37"
                        d="M314.37,113.6c1.36.97,1.98,2.71,2.76,4.22-3.97-.49-6.05-3.86-6.99-7.21l4.23,2.99h0Z"
                      />
                      <path
                        class="sts-10"
                        d="M331.66,166.1c-.36,1.59-.14,3.92-.01,5.63,1.39,18.41,1.94,30.65-3.47,48.71l-.77,9.08-2.85,23.04c-2.19,3.25-9.97,3.38-13.76,1.02l-1.97-14.58c-.84-6.22.2-14.94,3.63-20.35-2.41-6.1-3.55-12.24-4.04-18.7l-.39-5.23c-.37-5.06-.76-9.85-.01-14.82-3.44-3.74-5.85-8-6.97-12.83-.61-2.67-.1-4.98.75-7.35,2.88-.21,5.79.4,8.72,1.83l10.13,3.78c3.66,1.71,6.99,1.86,9.99.46l1.01.32h0Z"
                      />
                      <path
                        class="sts-2"
                        d="M323.33,252.39c-3.75,1.82-7.66,1.88-11.31.43-1.71-11.59-4.26-24.15,1.98-34.03-4.65-12.17-5.2-26.71-4.66-39.49-4.3-4.85-8.54-11.64-6.6-17.69,3.63.53,6.58,1.83,9.79,2.91l11.58,3.93c1.84.63,3.71.6,5.96-.06l1.16,23.54c-.08,9.75-1.25,18.97-4.49,28.14l-3.39,32.34h0Z"
                      />
                      <path
                        class="sts-36"
                        d="M331.66,166.1c-3.08,3.41-10.03.66-15.51-1.47-4.78-1.86-9.39-3.48-14.33-4.92.46-1.27.7-2.33,1.57-3.53l5.68-7.89c1.84-2.57,2.29-5.39,1.86-8.54l-2.82-20.59-1.84-15.61c.56,1.16,1.74,2.32,1.95,3.61,1.11,6.99,4.04,12.97,11.2,11.46,3.9,4.98,8.12,9.3,12.91,13.54l.37,11.87.39,11.24c.13,3.83-.58,7.17-1.41,10.83v-.02Z"
                      />
                      <path
                        class="sts-19"
                        d="M330.93,163.45c-1.24,5.52-8.57,2.25-15.23-.28-4.18-1.58-8.05-3.16-12.56-3.95l6.17-8.86c2.35-3.37,3.33-6.99,2.76-11.2l-3.43-25.4c2.08,4,5.54,7.05,10.35,6.19,3.74,4.52,7.43,8.69,12.06,12.55l.49,14.8c.18,5.5.55,10.84-.63,16.15h0Z"
                      />
                      <path
                        class="sts-34"
                        d="M309.81,288.07c-.84-.04-2.26-.22-2.69-.97.43-5.35,1.72-10.58,3.52-15.81,1.49.73,1.57,1.83,2.27,2.72l6.99,1.77c1.53.39,1.79-4.03,3.69-5.66,4.79,5.25,10.81,8.82,17.87,9.17,1.5.07,3.68-.49,4.65.99,1.66,2.55-.22,5.65-2.93,6.85-5.13,2.26-10.68,1.85-16.26,1.62l-17.11-.7h0Z"
                      />
                      <path
                        class="sts-23"
                        d="M320.56,287.06c-4.28-.24-8.22.22-12.09-.56l2.64-12.42c1.21,1.38,2.43,1.62,4.05,1.96,1.8.37,4.12,1.69,5.92.72,1.56-.84,1.82-3,2.62-4.62,5.34,5.63,12.35,8.84,20.1,8.48,1.03-.04,1.88.89,1.68,1.74-1.18,4.97-9.34,5.55-15.31,5.22l-9.61-.53h0Z"
                      />
                      <path
                        class="sts-30"
                        d="M89.39,247.91l-1.2,20.54c5.18,5.18,11.78,8.76,19.22,8.39,1.65-.08,2.98-.26,4.16.88.91.88,1.39,2.27,1.07,3.86-1.26,6.17-8.86,6.76-14.72,7.41l-11.79-.09-12.85.13c-1.86.02-2.66-1.62-2.49-3.18.54-4.94,1.49-9.52,2.59-14.3,1.44-1.14,1.45-2.77,1.12-4.54l-3.69-24.38c-.76-5.06-.84-9.97.13-15.22l-24.09,2.04-4.29.37h-13.9c-9.77,0-16.96-7.01-18.28-16.62-.53-3.9.15-7.84,2.33-11.26,1.89-2.98,3.21-6.25,4.5-9.55,1.27-3.25,1.43-6.43.93-9.91l-3.41-23.83c-.59-4.15-1.15-8.09-1.24-12.32-.07-3.25,2.04-5.92,5.03-7.19.47-5.31-.22-10.62-2.65-15.39l-4.66-7.59c-4.22-6.87,2.58-17.53,12.14-20,5.88-1.52,12.14-.21,17.03,2.96,3.74,2.43,4.61,6.19,3.29,10.23-2.3,7,5.64,8.87.48,11.81-.02,1.55-.42,3.1-1.02,4.65-.47,1.23.18,2.9-1,3.91-.96.82-2.16,1.52-3.82,1.26l-3.29-.5c-.66,2.58-.58,5.12.07,7.98,1.8-.73,4.54-.98,6.05.38,2.84,2.55,3.69,6.38,4.78,9.81l3.41,6.43c2.92,5.49,6.66,15.46,2.53,18.88l-2.96-1.23c.06,5.23-2.76,10.11-4.23,9.01l-3.26-2.44-.25,4.62c.47,6.17.46,12.16-.5,18.17,2.6.71,4.98.44,7.47.73l7.6.86,24.28,3.34c5.85.81,9.68,4.92,10.67,10.59.67,3.8.12,7.48-.11,11.33l-.82,13.84-.4,5.11h.01Z"
                      />
                      <path
                        class="sts-35"
                        d="M84.33,274.17c-2.41-.16-4.68-.72-7.01-1.47-.39-4.59-.6-8.72-1.47-13.23,3.78.39,7.11.31,10.44-.76l-.49,11.12-1.47,4.33h0Z"
                      />
                      <path
                        class="sts-34"
                        d="M86.32,287.98l-12.24.19c-.77.01-2.38-.48-2.3-1.37.49-5.44,1.41-10.56,2.91-15.76,1.47.86,1.67,1.9,2.49,2.81l7.37,1.54c1.98-2.27,2.09-5.94,2.91-5.9.94.06,8.16,9.44,21.85,8.35,1.67-.13,2.6,1.89,2.39,3.23-.91,5.78-8.14,6.22-13.81,6.98l-11.58-.07h0Z"
                      />
                      <path
                        class="sts-7"
                        d="M80.87,286.91c-2.75.25-5.17.08-7.67-.28.16-4.41,1.23-8.39,2.04-12.64,2.52,1.94,8.67,3.02,10.03,2.36,1.62-.78,1.85-2.9,2.58-4.89,5.91,5.38,13.09,8.39,20.99,7.59,1.08-.11,1.7,1.24,1.49,2.06-1.97,7.63-19.21,4.85-29.45,5.8h0Z"
                      />
                      <path
                        class="sts-1"
                        d="M88.32,249.73l-.77,6.96c-3.98,2.18-8.66,2.57-13.21,1.09l-2.58-14.68c-1-5.69-.88-11.21.46-16.89-2.16.64-4.02.4-6.08.59l-22.73,2.03-14.69.02c-9.31.01-16.27-6.75-17.42-16.06-.42-3.36.27-7.17,2.16-10.05,2.37-3.61,3.92-7.52,5.36-11.57.91-2.57.86-5.09.49-7.77l-3.49-24.79-.97-9.55c2.98,2.49,1.5,7.03,5.02,11.56,2,2.57,4.87,3.79,8.15,2.96,3.81,4.92,7.88,9.04,12.54,13.23-.96,8.81.69,17.76-1.21,26.36l7.51.55,16.28,1.98,17.65,2.54c4.91.71,8.03,4.68,8.95,9.38.73,3.67.16,7.21-.05,10.9l-.5,8.93c-.13,2.28-.27,4.34-.44,6.61l-.43,5.67h0Z"
                      />
                      <path
                        class="sts-28"
                        d="M75.67,257.01c-2-10.68-4.8-21.89-1.49-32.23l-26.39,2.28c-6.81.59-13.33.97-20,.33-7.27-.69-12.8-5.24-14.58-12.28-.94-3.69-.8-7.32.99-11,13.45-.04,26.77-.05,40.25,1.8l24.78,3.39c5.61.76,9.37,5.05,9.35,10.86-.04,12.06-1.27,23.89-2.16,35.94-3.53,1.41-6.74,1.48-10.74.91h0Z"
                      />
                      <path
                        class="sts-19"
                        d="M38.35,202.16l-22.67-.46c3.55-7.08,6.11-12.37,4.69-20.48l-3.11-22.37c2.16,3.95,5.59,6.85,10.26,5.93,3.61,4.32,7.11,8.3,11.56,12.05.36,8.31.55,16.46-.72,25.32h0Z"
                      />
                      <path
                        class="sts-31"
                        d="M25.16,113.76c-3.81,1.43,6.81,10.7-4.32,18.26-.67-3.22-1-6.34-2.69-9.13l-5.11-8.47c-2.91-4.82,2.89-13.77,10.76-15.88s18.55,2.15,18.13,7.57c-.19,2.39-1.32,4.57-3.74,5.37l-6.31,2.08c-1.68.55-2.43,1.84-2.49,3.9l-2.22-3.1c-.49-.69-1.46-.79-2-.59h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M24.55,156.83c-1.26-1.5-12.68-8.09-7.38-13.83,2.58-2.79,6.92-2.87,9.77-.2,4.35,4.08,7.64,8.9,10.98,13.88-.58,5.62-.28,15.46,2.02,15.37,2.42-.1-.24-4.01.04-10.59l.55-12.67-2.52-8.38c3.92.64,4.76,6.5,5.51,10.68l2.64,14.63c.85,4.74.88,9.55-1.53,13.94-1.1-1.62-1.92-2.57-3.04-3.66l-7.14-6.91c-3.87-3.75-6.5-8.2-9.9-12.24h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M32.47,130.87c-.56,2.94-.18,5.62.36,8.57-1.1.85-2.13,1.54-2.9,2.91-2.44-2.88-5.36-4.05-8.83-3.84-.2-1.08-.53-3.3.29-3.85,5.2-3.21,8.45-8.45,6.66-14.69,1.27.38,2.4.61,3.44-.33.67-.59.99-2.01.37-3.28,2.43-1.68,5.88-1.65,9.04-3.61.06,2.36,1.03,4,2.51,5.9-.94.52-1.67.85-2.01,1.44-.28.5.16,1.58-.01,2.21-.55,2.01-1.04,3.81-.83,5.95-3.5,1.1-7.23-1.94-8.09,2.61h0Z"
                      />
                      <path
                        class="sts-22"
                        d="M46.9,155.66c3.87,6.1,6.19,17.82,2.87,14.78-.5-.46-.83-.93-.84-1.79-.04-4.45-1.64-8.41-2.03-12.99h0Z"
                      />
                      <path
                        class="sts-36"
                        d="M36.5,147.76c1.59.79,3.93,4.93,2.13,7.49l-7.67-10.23,5.54,2.75h0Z"
                      />
                      <path
                        class="sts-20"
                        d="M22.6,158.18c1.55,1.13,2.27,3.03,3.13,4.51-3.9-.55-6.17-3.73-7.05-7.36l3.92,2.85h0Z"
                      />
                      <path
                        class="sts-25"
                        d="M37.4,146.82l-5.54-2.9c.66-1.68,2.16-2.57,4.07-2.09.55,1.56,1.21,2.74,1.47,5h0Z"
                      />
                      <path
                        class="sts-3"
                        d="M164.1,55.75c0,30.38-24.64,55-55.05,55s-55.05-24.63-55.05-55S78.65.75,109.05.75s55.05,24.63,55.05,55h0Z"
                      />
                      <path
                        class="sts-6"
                        d="M128.62,103.6c-.33.04-.58.05-.61-.02-.94-2.48-3.12-9.16-2.67-11.43.26-1.29.81-1.07,2.01-.52,10.07,5.76,15.36,7.28,13.32-6.4-1.25-6.01-3.01-11.88-5.28-17.62-1.35-8.89-3.29-16.23-13.84-15.1-8.28-1.1-8.35-4.19-3.55-10.15.93-1.81,2.03-3.5,3.29-5.09.34-1.04.45-2.12.34-3.25,4.25-7.47,2.58-21.23-8.36-19.32-4.82-3.3-11.95-4.62-16.07.33-6.62,7.96-1.81,22.09,3.9,29.41,4.13,4.83,1.13,7.43-4.18,7.92-5.37-.91-10.89,1.47-12.41,7-1.33,6.51-3.17,12.87-5.53,19.09-1.91,6.79-5.41,22.15,6.48,15.56l5.38-2.8,1.48.22c.4.95-2.25,10.56-2.91,12.3-.08.22-.34.38-.64.52-23.25-9.75-36.39-34.58-31.2-59.36C62.57,21.04,83.71,3.55,108.17,3.16c24.77-.4,46.56,16.68,52.11,40.65,5.69,24.56-6.71,49.51-29.74,59.95-.87.4-1.4.43-1.92-.16h0Z"
                      />
                      <path
                        class="sts-19"
                        d="M126.71,105.29c-11.53,4.11-24.31,4.14-35.77-.19l-.34-1.1c2.31-9.55,3.47-14.33,3.47-14.33l14.89-10.63c5.11,3.59,10.18,7.32,15.2,11.16.05,5.01,1.06,9.88,3.01,14.62l-.46.46h0Z"
                      />
                      <path
                        class="sts-30"
                        d="M128.62,103.6c.1.31.09.86-.22.94l-.67.15c-.33.03-.59.04-.62-.04-1.74-4.58-3.22-9.64-2.96-14.57-4.43-3.49-9.64-7.48-14.29-10.59-.28-.19-.65-.24-.98-.24l-14.87,10.46s-1.15,4.68-3.43,14.03l-.94.88-.88-.34c.95-4.11,2.36-7.92,3.08-12.52-5.85,3.02-13.17,7.79-15,2.49-2.38-6.89,1.49-17.3,4.24-24.91,1.09-3.04,1.7-5.96,2.24-9.04,1.09-6.25,6.78-9.76,12.83-8.91,1.67.23,3.92-.51,5.21-1.21.68-.52.89-3.01.25-3.62-1.8-1.69-2.7-4.45-4.13-6.17-1.51-1.83-1.83-3-2.54-5.17-1.89-5.78-2.82-11.87-.36-17.65,1.36-3.19,3.79-5.65,7.26-6.47,4.16-.73,8.28.27,11.61,2.75,4.36-1.16,8.26,1.22,10.06,5.29,2.1,4.83,1.42,10.3-.99,15.08.29,2.42-.41,4.68-2.5,5.98-1.5,4.88-5.49,5.99-3.92,9.76,2.57,1.44,5.3,1.79,8.32,1.68,5.02-.16,9.31,3.34,10.26,8.38.64,3.36,1.2,6.49,2.43,9.77,2.75,7.32,6.22,17.19,4.31,24.1-.42,1.5-1.68,3.28-3.41,3.01-4.46-.7-8.29-2.82-12.11-5.01-.12,2.42.36,4.57,1.09,6.79l1.63,4.93h-.01Z"
                      />
                      <path
                        class="sts-9"
                        d="M127.73,104.68l-1.03.61-1.94-5.81c-1.13-2.92-1.38-5.79-1.15-9.05l-14.55-10.77c-4.95,3.62-9.4,7.04-14.47,10.38-.79,5.23-2.24,10.11-3.66,15.08l-1.29-.49c1.58-4.95,2.91-9.94,3.77-15.21l15.75-11.2c5.26,4.04,10.1,7.96,15.51,11.49l.31,5.79,2.73,9.21h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M113.96,63.88l9.86-5.27c1.06.1,3,1.63,2.81,2.61-1.59,2.83-3.19,6.08-5.84,7.78l-10.36,6.63c-9.02,5.77-18.7,15.79-30.73,18.71-1.72-2.91-1.36-6.16-.78-9.39,1.52-8.48,5.32-15.22,6.78-24.23.7-4.35,4.8-7.51,9.11-7,.52.06.53,1.89.05,2.11-2.01.93-4.3,2.04-5.24,4.22-1.18,2.72,3.22,6.02,2.61,7.22-1.63,3.23-2.36,6.37-1.58,10.06l-3.3,2.93c-.53.47-.63,1.32-.32,1.77.43.65,1.47.61,2.07-.02,4.19-4.37,9.72-6.28,15.33-8.11,8.89-2.91,7.87-9.13,9.53-10.02h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M123.86,79.01c4.75,1.86,6.81,4.99,7.87,3.61.5-.65.36-1.45-.37-1.97l-3.73-2.66c1.15-3.85.49-7.52-1.69-10.95l2.52-3.94c.68-1.07,1.03-2.58.22-3.7-2.38-3.31-5.8-3.78-5.56-3.35-.25-.45-.25-1.11-.12-1.96,4.07-.81,8.51,1.8,9.31,6.39.65,3.71,1.46,7.18,2.79,10.82,2.55,7,6.37,17.24,3.43,23.12-9.94-1.62-19.02-10.28-27.4-16.28l3.95-2.57,8.79,3.43h0Z"
                      />
                      <path
                        class="sts-31"
                        d="M116.37,28.75l-2.86-7.66c-3.45,6.71-8.79,11.69-15.81,13.72-2.64-5.34-3.02-11.14-.88-16.41,1.72-4.22,5.84-6.03,10.19-4.93,2.1.53,4.05,1.25,5.69,3.02,3.16-1.33,6.26-.37,8.03,2.58,2.6,4.32,2.07,9.81-.65,14.35-1.92-.85-2.94-2.63-3.71-4.68h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M113.83,45.21c-2.99,2.54-6.96,2.58-9.96-.03-3.33-2.9-3.2-5.9-5.68-7.98,6.17-1.88,11.1-5.51,14.76-10.65,1.64,4.35,3.21,8.78,7.22,9.22.17,1.62-1.53,1.89-1.86,2.57-1.29,2.64-2.28,5-4.48,6.86h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M114.98,60.43c-4.56,1.57-4.04,6.43-6.84,4.3-.52-.4-.63-1.78-1.36-2.23l-7.04-4.26c-1.39-.84-1.43-3.22-1.64-4.65,2.29-.37,4.21-.85,5.91-2.15l.25-3.14c2.92,1.59,6.25,1.59,9.22.02-.46,4.17,2.64,4.4,6.93,5.62-.7,3.34-2.47,5.46-5.44,6.49h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M102.66,71.99c-4.93-1.51-8.3-5.91-10.74-10.76-.16-.97,1.84-2.51,2.9-2.59l9.65,5.24c1.87,1.02,2.3,3.91,2.95,5.82-1.53.85-2.73,1.85-4.75,2.27h0Z"
                      />
                      <path
                        class="sts-5"
                        d="M115.13,74.27l6.6-4.27,2.89-3.13c2.52,3.76,3.34,7.89,1.49,11.83-3.41-1.72-6.95-2.73-10.98-4.42h0Z"
                      />
                      <path
                        class="sts-27"
                        d="M125.32,76.97l-7.72-3.04c2.3-1.53,4.65-2.3,6.55-4.76,1.5,2.06,2.18,4.52,1.16,7.8h0Z"
                      />
                      <path
                        class="sts-26"
                        d="M101.86,73.43c-3.59,1.31-6.82,2.38-9.83,4.44-1.42-3.94-.31-7.62,1.74-11.15,1.24,1.29,1.84,2.42,2.96,3.46l5.12,3.24h0Z"
                      />
                      <path
                        class="sts-21"
                        d="M98.99,72.94l-6.09,3.1c-.67-2.62.05-4.71,1.3-7.01,1.34,1.92,2.51,2.57,4.78,3.92h0Z"
                      />
                      <path
                        class="sts-30"
                        d="M210.32,268.52c10.26,10.82,21.14,7.32,23.1,9.03.67.58,1.45,1.71,1.36,3.13-.43,6.73-8.03,7.43-13.58,8.07l-3.77.43-9.13-.26-12.86.15c-1.74.02-2.88-1.58-2.61-3.25.77-4.82,1.21-9.68,2.86-14.21.49-1.35,1.37-1.89,1.06-3.67l-2.17-12.35c-1.81-10.32-4.63-23.39,1.89-31.77l-23.58-12.72c-4.82-2.6-9.15-5.31-13.47-8.66-4.32-3.34-7.39-7.77-7.29-13.34.14-7.69,4.89-14.01,11.21-17.87l5.34-4.99c2.74-2.56,4.43-5.55,5.52-9.13l7.19-23.71,3.34-9.85c1.22-3.61,4.31-5.69,8.28-5.66,2.4-4.47,4.07-9.16,4.07-14.27l-1.04-9.99c-.81-7.82,10.61-14.93,20.67-12.26,5.56,1.47,10.26,5.03,13.09,9.77,2.29,3.84,1.27,7.56-1.52,10.58-4.92,5.31,1.17,10.3-4.36,10.76-.86,1.55-1.88,2.71-3.11,3.91-.91.88-1.17,2.59-2.12,2.92-1.53.53-2.82.61-4.14-.18l-3.13-1.86c-1.66,2.05-2.48,4.49-3.11,6.94,2.05.46,4.39,1.23,5.18,3.02,1.55,3.51.67,7.46.22,11.11l.4,7.52c.32,6.04-.62,16.17-5.55,17.79l-2.3-2.39c-1.92,3.53-5.39,7.68-7.49,6.43-1.12-.67-.98-2.54-2.05-3.73l-6.83,14.49-4.09,6.53c8.95,6.6,17,13.86,23.89,22.59,3.53,4.48,6.3,9.9,5.62,15.73-.58,4.89-1.28,9.52-1.91,14.4l-1.3,9.94c-.91,7.02-1.63,13.64-1.77,20.85h.02Z"
                      />
                      <path
                        class="sts-31"
                        d="M212.07,103.36c-.88-2.57-.35-5.44-2.43-5.54-3.16-.16-.63,6.15-4.17,10.8-1.74,2.27-4.41,3.47-7.49,3.91,1.66-5.2,1.82-10.2.72-15.54-.76-3.67-.3-7.29,2.76-9.85,8.37-7.01,19.99-4.26,26.06,4.89,1.47,2.22,1.5,4.64.16,6.57-1.35,1.93-3.38,2.9-6.09,2.6l-6.42-.69c-1.69,0-2.72.92-3.11,2.84h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M209.93,127.63c1.17-.03,1.54.93,1.72,1.87.65,3.43-.2,6.32-1.06,9.57l-3.63,13.77c-1.25,4.73-3.23,9.18-6.87,12.51-3.59-7.52-6.15-14.9-8.04-22.75-.5-2.07-.23-4.45-1.18-6.33-1.53-3.04-3.55-5.69-3.86-9.19-.22-2.38.46-4.88,2.72-6.01,3.35-1.68,7.6-.09,9.1,3.49,2.33,5.57,3.39,11.39,4.28,17.28-2.38,4.23-6.47,12.91-5.06,14.74.44.58,1.69.44,1.92-.4l1.53-5.52c1.96-5.06,4.96-9.43,7.2-14.35,1.21-2.66.71-5.89,1.24-8.68h0Z"
                      />
                      <path
                        class="sts-17"
                        d="M211.54,114.8c-2.8.04-4.6,5.54-5.91,9.46-1.41.28-2.57.64-3.7,1.48-1.02-3.4-2.93-5.84-6.25-7.2.11-1.04.69-2.94,1.67-3.35,6.69-1.17,11.27-4.14,12.26-10.63,1,1.07,2.07,1.54,3.11,1.26,1.15-.31,1.61-1.3,2.06-2.54.49-1.33,5.2.64,9.53.28-.79,2.17-.7,4.17-.15,6.52-2.56-.64-2.75,1.02-3.61,2.34-1.06,1.59-2.11,2.92-3.07,4.56s-4.03-2.21-5.95-2.18h0Z"
                      />
                      <path
                        class="sts-29"
                        d="M209.34,160.42c-.79.13-1.41-.81-1.62-1.32-.3-.72.31-1.36.53-2.13l3.34-12.06c.52,5.14,0,10.65-2.25,15.52h0Z"
                      />
                      <path
                        class="sts-8"
                        d="M188.8,137.49l.73,4.81c-3.17-1.81-4.01-5.42-3.42-9.46l2.69,4.65h0Z"
                      />
                      <path
                        class="sts-29"
                        d="M206.85,133.18c-1.05-1.77-3.08-3.26-3.38-5.22-.04-1.41,3.71-1.5,3.92.03.25,1.9-.23,3.66-.53,5.19h0Z"
                      />
                      <path
                        class="sts-34"
                        d="M195.69,288.11c-.68,0-1.24-.34-1.46-.52-.32-.25-.54-1.14-.42-1.76l2.87-14.7c1.54.61,1.74,1.86,2.64,2.74l7.2,1.56c2.01-1.71,1.53-4.68,3.2-6.01,5.92,6.02,13.5,9.02,21.82,8.43,1.54-.11,2.46,1.95,2.27,3.24-1.03,6.86-13.73,7.63-21.25,6.85l-4.99.19h-11.86s0-.01,0-.01h0Z"
                      />
                      <path
                        class="sts-7"
                        d="M203.05,286.89c-2.86.04-5.44.17-7.83-.34l2.13-12.5c1.49,1.41,2.96,1.48,4.72,1.8,1.62.28,3.71,1.32,5.3.45,1.59-.87,1.76-2.94,2.61-4.79,5.78,5.34,12.98,8.35,20.73,7.49.61-.07,1.3.44,1.47.76.21.37.28,1.12.07,1.71-1.66,4.71-9.63,5.12-15.34,5.21l-13.88.22h.01Z"
                      />
                      <path
                        class="sts-36"
                        d="M205.5,133.4c1.33,2.74.96,5.8-1.18,7.99l-2.5-12.49,3.67,4.5h0Z"
                      />
                      <path
                        class="sts-15"
                        d="M204.99,137.88c-.63-1.65-.94-2.96-1.14-4.76,1.35,1.25,1.58,2.96,1.14,4.76h0Z"
                      />
                      <path
                        class="sts-35"
                        d="M206.45,274.11c-2.33.04-4.66-.7-6.96-1.37l-.7-7.45c3.32.46,6.12.31,9.26-1.14,0,3.45.07,6.4-1.6,9.97h0Z"
                      />
                      <path
                        class="sts-34"
                        d="M164.24,172.09l.83-.46c6.51,4.14,12.98,8.37,19.42,12.67l-.04,1.09c9.44,6.19,17.57,14.2,24.71,23.2,3.6,4.54,6.06,10.26,5.16,15.97-.43,2.75-1.08,4.91-1.33,7.77l-.45,5.03-3.34,24.34c-1.83,2.96-8.36,3.77-11.87,1.83l-3.36-17.6c-1.36-7.14-1.03-17.56,4.19-22.39l-19.68-10.56c-6.36-3.41-12.32-6.72-18.09-11.06-3.92-2.96-7.25-7.16-7.28-12.38-.05-7.54,4.81-14.31,11.14-17.46h0Z"
                      />
                      <path
                        class="sts-28"
                        d="M198.68,262.89l-2.73-12.39c-1.24-9.67-3.37-20.52,4.43-27.25l-24.55-13.26c-5.41-2.92-10.41-5.96-15.21-9.65-5.36-4.12-7.71-10.35-5.05-16.72,1.75-4.2,4.63-7.67,8.55-9.94l21.55,14.26c7.75,5.13,23.02,19.79,26.21,28.06,1.54,4,1.65,8.03.12,11.87l-2.9,23.94c-.37,3-.16,6.64-1.38,9.28-1.83,2.46-5.94,2.26-9.05,1.79h0Z"
                      />
                      <path
                        class="sts-16"
                        d="M184.45,185.38l-20.21-13.29c3.02-2.72,5.94-5.45,8.49-8.86l2.65-6.32,6.98-23.04,3.35-9.69c.94,5.4-2.16,9.6-.41,14.79.91,2.73,2.88,4.58,5.82,5.07,1.37,5.93,3.29,11.3,5.75,17.12l-4.34,9.18c-2.49,5.27-4.76,10.46-8.09,15.04h.01Z"
                      />
                      <path
                        class="sts-19"
                        d="M183.75,183.68l-17.65-11.63c5.14-4.45,8.41-7.91,10.3-14.1l7.05-23c.14,4.95,2.28,8.92,6.84,10.19,1.36,5.64,3.05,10.6,5.27,15.85l-5.5,11.56c-1.82,3.82-3.4,7.51-6.32,11.13h0Z"
                      />
                    </g>
                  </g>
                  <g class="sts-24">
                    <line
                      class="sts-12"
                      x1="59.94"
                      y1="152.25"
                      x2="81.33"
                      y2="117.25"
                    />
                    <polygon
                      class="sts-4"
                      points="83.37 119.66 83.94 112.98 78.25 116.54 83.37 119.66 83.37 119.66"
                    />
                  </g>
                </g>
              </svg>
              <p class="mob-illus-caption">
                雙手抱胸，從椅上完全站起後再坐下，連續進行五次，超過 12
                秒或無法完成視為異常
              </p>
            </div>
          </div>

          <div class="yn-row">
            <button
              class="yn-btn"
              :class="{ 'yn-green': mob1 === 'Y' }"
              @click="mob1 = 'Y'"
            >
              12 秒內完成（正常）
            </button>
            <button
              class="yn-btn"
              :class="{ 'yn-red': mob1 === 'N' }"
              @click="mob1 = 'N'"
            >
              超過 12 秒或無法完成（異常）
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 營養不良 ── -->
    <div class="nihss-group">
      <div class="group-header-bar nut-bar">
        <span class="group-icon">🥗</span>
        <span class="group-label-text">營養不良 Malnutrition</span>
        <span class="group-sub-text"
          >體重下降 + 食慾不振（回答「是」為異常）</span
        >
        <span
          class="group-score-tally"
          :class="nutDone ? (nutAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ nutDone ? (nutAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="nut1 !== null ? (nut1 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum nut-q">體重</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去三個月，您的體重是否在無意中減輕了 3 公斤以上？</span
              >
              <span class="item-sub"
                >非刻意節食或運動，而是不知不覺地體重減輕。</span
              >
            </div>
            <div class="yn-row">
            <button
                class="yn-btn"
                :class="{ 'yn-green': nut1 === 'Y' }"
                @click="nut1 = 'Y'"
              >
                正常
              </button>
            <button
                class="yn-btn"
                :class="{ 'yn-red': nut1 === 'N' }"
                @click="nut1 = 'N'"
              >
                異常
              </button>
          </div>
          </div>
        </div>

        <div
          class="icope-item"
          :class="nut2 !== null ? (nut2 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum nut-q">食慾</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">過去三個月，您是否曾經食慾不振？</span>
              <span class="item-sub"
                >不想吃東西、食量明顯減少或對飲食失去興趣。</span
              >
            </div>
            <div class="yn-row">
            <button
                class="yn-btn"
                :class="{ 'yn-green': nut2 === 'Y' }"
                @click="nut2 = 'Y'"
              >
                正常
              </button>
            <button
                class="yn-btn"
                :class="{ 'yn-red': nut2 === 'N' }"
                @click="nut2 = 'N'"
              >
                異常
              </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 視力障礙 ── -->
    <div class="nihss-group">
      <div class="group-header-bar vis-bar">
        <span class="group-icon">👁️</span>
        <span class="group-label-text">視力障礙 Visual Impairment</span>
        <span class="group-sub-text"
          >看遠、看近、閱讀困難（回答「是」為異常）</span
        >
        <span
          class="group-score-tally"
          :class="visDone ? (visAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ visDone ? (visAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="vis1 !== null ? (vis1 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum vis-q">視力</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >您的眼睛看遠、看近或閱讀是否有困難？</span
              >
              <span class="item-sub"
                >包括看遠物模糊、閱讀困難、有眼疾或正在治療（如糖尿病、高血壓引起的視網膜病變）。</span
              >
            </div>
            <div class="yn-row">
            <button
                class="yn-btn"
                :class="{ 'yn-green': vis1 === 'Y' }"
                @click="vis1 = 'Y'"
              >
                正常
              </button>
            <button
                class="yn-btn"
                :class="{ 'yn-red': vis1 === 'N' }"
                @click="vis1 = 'N'"
              >
                異常
              </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 聽力障礙 ── -->
    <div class="nihss-group">
      <div class="group-header-bar hear-bar">
        <span class="group-icon">👂</span>
        <span class="group-label-text">聽力障礙 Hearing Loss</span>
        <span class="group-sub-text">氣音測試：輕聲唸「6、1、9」</span>
        <span
          class="group-score-tally"
          :class="hearDone ? (hearAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ hearDone ? (hearAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="
            hear1 !== null ? (hear1 === 'N' ? 'item-abn' : 'item-ok') : ''
          "
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum hear-q">氣音</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >氣音測試：施測者遮住口部，以氣音輕聲說「6、1、9」，長者能否正確跟著唸？</span
              >
              <span class="item-sub"
                >未能清楚聽到並正確重複三個數字，視為未通過（異常）。</span
              >
            </div>
            <div class="yn-row">
            <button
              class="yn-btn"
              :class="{ 'yn-green': hear1 === 'Y' }"
              @click="hear1 = 'Y'"
            >
              正常
            </button>
            <button
              class="yn-btn"
              :class="{ 'yn-red': hear1 === 'N' }"
              @click="hear1 = 'N'"
            >
              異常
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 憂鬱症狀 ── -->
    <div class="nihss-group">
      <div class="group-header-bar dep-bar">
        <span class="group-icon">💙</span>
        <span class="group-label-text">憂鬱症狀 Depressive Symptoms</span>
        <span class="group-sub-text"
          >PHQ-2 核心兩題（過去兩週）— 回答「是」為異常</span
        >
        <span
          class="group-score-tally"
          :class="depDone ? (depAbn ? 'tally-abn' : 'tally-ok') : 'tally-nd'"
        >
          {{ depDone ? (depAbn ? "⚠ 異常" : "✓ 正常") : "—" }}
        </span>
      </div>
      <div class="item-list">
        <div
          class="icope-item"
          :class="dep1 !== null ? (dep1 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum dep-q">情緒</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去兩週，您是否常感到厭煩，或沒有希望？</span
              >
              <span class="item-sub">感到情緒低落、憂鬱或對未來失去希望。</span>
            </div>
            <div class="yn-row">
            <button
                class="yn-btn"
                :class="{ 'yn-green': dep1 === 'Y' }"
                @click="dep1 = 'Y'"
              >
                正常
              </button>
            <button
                class="yn-btn"
                :class="{ 'yn-red': dep1 === 'N' }"
                @click="dep1 = 'N'"
              >
                異常
              </button>
          </div>
          </div>
        </div>

        <div
          class="icope-item"
          :class="dep2 !== null ? (dep2 === 'N' ? 'item-abn' : 'item-ok') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum dep-q">興趣</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去兩週，是否減少很多的活動和興趣的事？</span
              >
              <span class="item-sub"
                >對以前喜歡的事物失去興趣，活動參與明顯減少。</span
              >
            </div>
            <div class="yn-row">
            <button
                class="yn-btn"
                :class="{ 'yn-green': dep2 === 'Y' }"
                @click="dep2 = 'Y'"
              >
                正常
              </button>
            <button
                class="yn-btn"
                :class="{ 'yn-red': dep2 === 'N' }"
                @click="dep2 = 'N'"
              >
                異常
              </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 初評有異常 → 用藥 + 社會評估 ── -->
    <template v-if="primaryDone && anyAbn">
      <div class="abn-notice">
        ⚠ 初評發現 <strong>{{ abnCount }} 項異常</strong>（{{
          abnDomains.join("、")
        }}），請繼續完成「用藥評估」及「社會照護評估」。
      </div>

      <!-- ── 用藥評估 ── -->
      <div class="nihss-group">
        <div class="group-header-bar med-bar">
          <span class="group-icon">💊</span>
          <span class="group-label-text">用藥評估</span>
          <span class="group-sub-text">任一初評異常時進行</span>
          <span class="group-score-tally med-tally">{{ medDone }}/3 題</span>
        </div>
        <div class="item-list">
          <div
            class="icope-item"
            :class="
              med1 !== null ? (med1 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum med-q">藥數</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >您每天使用的藥物是否 10 種（含）以上？</span
                >
                <span class="item-sub"
                  >包括中藥（算 1 種）、西藥、保健食品等。答「是」→
                  建議納入藥事照護計畫。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': med1 === 'Y' }"
                @click="med1 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': med1 === 'N' }"
                @click="med1 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>

          <div
            class="icope-item"
            :class="
              med2 !== null ? (med2 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum med-q">藥種</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >您服用的藥品中是否包含止痛藥、幫助睡眠的藥物等？</span
                >
                <span class="item-sub"
                  >非處方止痛藥（如
                  Ibuprofen、Acetaminophen）、安眠藥或鎮靜劑。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': med2 === 'Y' }"
                @click="med2 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': med2 === 'N' }"
                @click="med2 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>

          <div
            class="icope-item"
            :class="
              med3 !== null ? (med3 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum med-q">副作用</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >您是否因服藥而發生平衡感改變、嗜睡、眩暈、低血壓或口乾舌燥等症狀？</span
                >
                <span class="item-sub"
                  >任一答「是」→ 依長者狀況提供適當用藥衛教。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': med3 === 'Y' }"
                @click="med3 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': med3 === 'N' }"
                @click="med3 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- ── 社會照護評估 ── -->
      <div class="nihss-group">
        <div class="group-header-bar soc-bar">
          <span class="group-icon">🤝</span>
          <span class="group-label-text">社會照護與支持評估</span>
          <span class="group-sub-text">日常功能 + 居住財務 + 社交孤立</span>
          <span class="group-score-tally soc-tally">{{ socDone }}/3 題</span>
        </div>
        <div class="item-list">
          <div
            class="icope-item"
            :class="
              soc1 !== null ? (soc1 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum soc-q">ADL</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >個案是否有以下任一情形：在屋內行動、上廁所、穿衣、洗澡沐浴、保持個人整潔、進食有困難？</span
                >
                <span class="item-sub"
                  >答「是」→ 轉介長期照顧管理中心進一步評估長照需求。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': soc1 === 'Y' }"
                @click="soc1 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': soc1 === 'N' }"
                @click="soc1 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>

          <div
            class="icope-item"
            :class="
              soc2 !== null ? (soc2 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum soc-q">資源</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >個案是否有居住地點困難或財務困難？</span
                >
                <span class="item-sub"
                  >答「是」→ 轉介社工師或社福資源協助。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': soc2 === 'Y' }"
                @click="soc2 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': soc2 === 'N' }"
                @click="soc2 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>

          <div
            class="icope-item"
            :class="
              soc3 !== null ? (soc3 === 'N' ? 'item-abn' : 'item-ok') : ''
            "
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum soc-q">社交</span>
              </div>
              <div class="item-name-block">
                <span class="item-name"
                  >個案是否感覺孤獨，或平時沒有一定的社交活動（興趣、工作、志工等）？</span
                >
                <span class="item-sub"
                  >答「是」→ 轉介社區據點，促進社會參與。</span
                >
              </div>
              <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-green': soc3 === 'Y' }"
                @click="soc3 = 'Y'"
              >
                正常
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-red': soc3 === 'N' }"
                @click="soc3 = 'N'"
              >
                異常
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ── 結果卡 ── -->
    <div
      v-if="primaryDone"
      class="result-card"
      :class="abnCount === 0 ? 'res-normal' : 'res-abn'"
    >
      <div class="res-left">
        <span class="res-num" :class="abnCount === 0 ? 'rn-ok' : 'rn-abn'">{{
          abnCount
        }}</span>
        <span class="res-max">/ 6</span>
      </div>
      <div class="res-right">
        <span class="res-title">{{
          abnCount === 0 ? "初評全部正常" : `初評異常：${abnDomains.join("、")}`
        }}</span>
        <span class="res-desc" v-if="abnCount === 0"
          >6 大功能域初評均無異常。建議每 6–12 個月定期追蹤。</span
        >
        <span class="res-desc" v-else
          >請依下方複評工具進行確認，並已完成用藥及社會照護評估。</span
        >
      </div>
    </div>

    <!-- ── 複評工具卡 ── -->
    <div v-if="primaryDone && abnCount > 0" class="review-section">
      <div class="review-top">
        <span class="review-title">📋 建議複評工具（{{ abnCount }} 項）</span>
        <span class="review-sub"
          >依 112 年國健署 ICOPE 長者功能評估複評工具</span
        >
      </div>
      <div class="review-list">
        <div
          v-for="d in abnDomains"
          :key="d"
          class="review-card"
          :style="{ borderLeftColor: domainColors[d] }"
        >
          <div class="rc-left">
            <span class="rc-domain" :style="{ color: domainColors[d] }">{{
              d
            }}</span>
            <span class="rc-tool">{{ reviewTools[d].tool }}</span>
          </div>
          <div class="rc-detail">{{ reviewTools[d].detail }}</div>
        </div>
      </div>
    </div>

    <!-- ── 用藥/社會照護建議摘要 ── -->
    <div v-if="icope_isComplete && anyAbn" class="care-wrap">
      <div
        v-if="med1 === 'N' || med2 === 'N' || med3 === 'N'"
        class="care-card care-med"
      >
        <div class="care-head">💊 用藥照護建議</div>
        <ul class="care-list">
          <li v-if="med1 === 'N'">
            每日用藥 ≥ 10 種 → <strong>建議收案加入藥事照護計畫</strong>
          </li>
          <li v-if="med2 === 'N' || med3 === 'N'">
            含止痛/助眠藥或有藥物副作用 →
            <strong>依長者狀況提供適當用藥衛教</strong>
          </li>
        </ul>
      </div>
      <div
        v-if="soc1 === 'N' || soc2 === 'N' || soc3 === 'N'"
        class="care-card care-soc"
      >
        <div class="care-head">🤝 社會照護建議</div>
        <ul class="care-list">
          <li v-if="soc1 === 'N'">
            ADL 困難 → <strong>轉介長期照顧管理中心評估長照需求</strong>
          </li>
          <li v-if="soc2 === 'N'">
            居住/財務困難 → <strong>轉介社工師或社福資源</strong>
          </li>
          <li v-if="soc3 === 'N'">
            孤獨/缺乏社交 → <strong>轉介社區據點，促進社會參與</strong>
          </li>
        </ul>
      </div>
    </div>

    <!-- ── 評估明細 ── -->
    <div v-if="icope_showResults && primaryDone" class="results-detail">
      <div class="results-header">評估明細</div>
      <div
        v-for="row in [
          {
            q: '記憶',
            d: '記憶力（3 項物品）',
            v: cog1,
            yes: '正常',
            no: '異常',
          },
          { q: '時間', d: '定向力（日期）', v: cog2, yes: '正確', no: '異常' },
          { q: '地點', d: '定向力（地點）', v: cog3, yes: '正確', no: '異常' },
          {
            q: '起身',
            d: '椅子起身測試（5次/12秒）',
            v: mob1,
            yes: '通過',
            no: '異常',
          },
          { q: '體重', d: '體重下降 > 3 kg', v: nut1, yes: '否', no: '是' },
          { q: '食慾', d: '食慾不振', v: nut2, yes: '否', no: '是' },
          { q: '視力', d: '看遠/近/閱讀困難', v: vis1, yes: '否', no: '是' },
          {
            q: '氣音',
            d: '氣音測試（6、1、9）',
            v: hear1,
            yes: '通過',
            no: '未通過',
          },
          {
            q: '情緒',
            d: '厭煩或沒有希望（2週）',
            v: dep1,
            yes: '否',
            no: '是',
          },
          {
            q: '興趣',
            d: '減少活動和興趣（2週）',
            v: dep2,
            yes: '否',
            no: '是',
          },
        ]"
        :key="row.q"
        class="detail-row"
      >
        <span class="detail-qnum">{{ row.q }}</span>
        <span class="detail-domain">{{ row.d }}</span>
        <span
          class="detail-score"
          :class="row.v === 'N' ? 'ds-abn' : row.v === 'Y' ? 'ds-ok' : ''"
        >
          {{ row.v === null ? "—" : row.v === "Y" ? row.yes : row.no }}
        </span>
        <span class="detail-desc">{{
          row.v === "N" ? "異常" : row.v === "Y" ? "正常" : "未填"
        }}</span>
      </div>

      <template v-if="anyAbn">
        <div
          v-for="row in [
            { q: '藥數', d: '每日用藥 ≥ 10 種', v: med1 },
            { q: '藥種', d: '含止痛藥/助眠藥', v: med2 },
            { q: '副作用', d: '藥物副作用症狀', v: med3 },
            { q: 'ADL', d: '日常活動困難', v: soc1 },
            { q: '資源', d: '居住/財務困難', v: soc2 },
            { q: '社交', d: '孤獨/缺乏社交', v: soc3 },
          ]"
          :key="row.q"
          class="detail-row"
        >
          <span class="detail-qnum">{{ row.q }}</span>
          <span class="detail-domain">{{ row.d }}</span>
          <span
            class="detail-score"
            :class="row.v === 'N' ? 'ds-abn' : row.v === 'Y' ? 'ds-ok' : ''"
          >
            {{ row.v === null ? "—" : row.v === "N" ? "是" : "否" }}
          </span>
          <span class="detail-desc">{{
            row.v === "N" ? "異常" : row.v === "Y" ? "正常" : "未填"
          }}</span>
        </div>
      </template>

      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">初評異常總數</span>
        <span class="detail-score detail-score-brand">{{ abnCount }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 6 域</span>
          <span class="detail-desc-label">{{
            abnCount === 0 ? "全部正常" : abnCount + " 項異常"
          }}</span>
        </div>
      </div>
    </div>

    <!-- ── Actions ── -->
    <div class="ens-actions">
      <button class="btn-view" @click="icope_showResults = !icope_showResults">
        {{ icope_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!icope_isComplete" @click="icope_copyOutput">
        {{ icope_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="icope_reset">重新填寫</button>
    </div>

    <p v-if="!primaryDone" class="progress-hint">
      請完成 6 大功能域初評（{{
        [cogDone, mobDone, nutDone, visDone, hearDone, depDone].filter(Boolean)
          .length
      }}/6 域已完成）
    </p>
    <p v-else-if="anyAbn && !icope_isComplete" class="progress-hint">
      初評有異常，請繼續完成用藥評估（{{ medDone }}/3）及社會照護評估（{{
        socDone
      }}/3）
    </p>
  </div>

  <div v-show="activeTab === 'cog'" class="cog">
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
        <span class="badge-ver">{{ cog_method }}</span>
        <span class="score-number">{{ currentDone ? currentScore : "—" }}</span>
        <span class="score-label">{{
          currentDone
            ? currentSeverity.level.length > 10
              ? currentSeverity.level.substring(0, 10) + "…"
              : currentSeverity.level
            : `${currentAnsweredCount}/${cog_method === "BHT" ? bhtItems.length : 8}`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="currentSeverity.color"
          :style="{ width: cog_barPct + '%' }"
        />
      </div>
      <template v-if="cog_method === 'BHT'">
        <div class="severity-ticks-abs">
          <span class="tick-abs tick-green" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 17.9%">5 ▾</span>
          <span class="tick-abs tick-orange" style="left: 35.7%">10 ▾</span>
          <span class="tick-abs tick-red" style="left: 60.7%">17 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">28</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs tick-green" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 17.9%">輕度</span>
          <span class="label-abs tick-orange" style="left: 35.7%">中度</span>
          <span class="label-abs tick-red" style="left: 60.7%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else-if="cog_method === 'AD8'">
        <div class="severity-ticks-abs">
          <span class="tick-abs tick-green" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 25%">2 ▾</span>
          <span class="tick-abs tick-orange" style="left: 50%">4 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">8</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs tick-green" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 25%">輕度疑似</span>
          <span class="label-abs tick-orange" style="left: 50%"
            >中度建議完整評估</span
          >
          <span class="label-abs tick-red" style="left: 100%"
            >重度建議完整評估</span
          >
        </div>
      </template>
      <template v-else>
        <div class="severity-ticks-abs">
          <span class="tick-abs tick-red" style="left: 0%">0</span>
          <span class="tick-abs tick-orange" style="left: 43.75%">7 ▾</span>
          <span class="tick-abs tick-yellow" style="left: 62.5%">10 ▾</span>
          <span class="tick-abs tick-green" style="left: 81.25%">13 ▾</span>
          <span class="tick-abs tick-green" style="left: 100%">16</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs tick-red" style="left: 0%">重度</span>
          <span class="label-abs tick-orange" style="left: 43.75%">中度</span>
          <span class="label-abs tick-yellow" style="left: 62.5%">輕度</span>
          <span class="label-abs tick-green" style="left: 81.25%">正常</span>
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
          >若由家屬或主要照顧者填答，請切換至 AD8 量表。TDS
          為台灣本土化篩檢工具。</strong
        >
      </span>
    </div>

    <!-- ── Version tab selector ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">版本選擇</span>
        <span class="group-sub-text"
          >長者本人 → BHT　家屬 / 照顧者 → AD8　台灣本土 → TDS</span
        >
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': cog_method === 'BHT' }"
          @click="cog_switchMethod('BHT')"
        >
          <span class="tab-title">BHT</span>
          <span class="tab-sub">6 題 · 由長者本人作答 · 3–5 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-tds': cog_method === 'TDS' }"
          @click="cog_switchMethod('TDS')"
        >
          <span class="tab-title tds-title">TDS</span>
          <span class="tab-sub">4 項 · 腦力健診篩檢 · 5–8 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-ad8': cog_method === 'AD8' }"
          @click="cog_switchMethod('AD8')"
        >
          <span class="tab-title ad8-title">AD8</span>
          <span class="tab-sub"
            >8 題 · 由<strong>家屬/照顧者</strong>回答 · 2–4 分鐘</span
          >
        </button>
      </div>
      <div class="method-note" :class="`note-${cog_method.toLowerCase()}`">
        <template v-if="cog_method === 'BHT'">
          <strong>BHT（Blessed 定向記憶集中測驗）：</strong>由 Blessed
          等人（1968）研發，評估定向力、計算力與短期記憶。採加權計分（總分
          0–28）， ≤ 4 為正常，≥ 10
          提示認知異常，需轉介進一步評估。適合長者本人作答，MMSE ≥ 15 者適用。
        </template>
        <template v-else-if="cog_method === 'TDS'">
          <strong>TDS 腦力健診篩檢工具：</strong
          >台灣本土化認知篩檢工具，評估定向力（4 題）、訊息登錄（5
          詞）、思考流暢（動物列舉）與訊息回憶（5 詞）。總分 0–16，≥ 13
          為正常，≤ 6 提示重度認知障礙。
        </template>
        <template v-else-if="cog_method === 'AD8'">
          <strong>AD8（8-item Informant Interview）：</strong>由 Galvin
          等人（2005，華盛頓大學）研發，<strong>由家屬或主要照顧者</strong>回答，評估過去數年間認知功能的改變。≥
          2 分提示可能有認知障礙，敏感性 84%、特異性
          86%。特別適合長者本人認知不足以自行作答時使用。
        </template>
      </div>
    </div>

    <!-- ══ BHT 題目 ══ -->
    <template v-if="cog_method === 'BHT'">
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
              <div v-if="q.type === 'binary'" class="yn-row">
                <button
                  class="yn-btn"
                  :class="{ 'yn-green': bhtAnswers[q.key] === 0 }"
                  @click="bhtAnswers[q.key] = 0"
                >
                  正確
                </button>
                <button
                  class="yn-btn"
                  :class="{ 'yn-red': bhtAnswers[q.key] === 1 }"
                  @click="bhtAnswers[q.key] = 1"
                >
                  錯誤（＋{{ q.weight }} 分）
                </button>
              </div>
              <span
                v-else
                class="item-score"
                :class="{
                  'score-err': bhtAnswers[q.key] > 0,
                  'score-nd': bhtAnswers[q.key] <= 0,
                }"
              >
                {{
                  bhtAnswers[q.key] === -1 ? "—" : q.weight * bhtAnswers[q.key]
                }}
              </span>
            </div>
            <div v-if="q.type !== 'binary'" class="count-row">
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
    <template v-else-if="cog_method === 'AD8'">
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
              <div class="yn-row yn-row-3">
                <button
                  class="yn-btn"
                  :class="{ 'yn-red': ad8Answers[q.key] === 'yes' }"
                  @click="ad8Answers[q.key] = 'yes'"
                >
                  是
                </button>
                <button
                  class="yn-btn"
                  :class="{ 'yn-green': ad8Answers[q.key] === 'no' }"
                  @click="ad8Answers[q.key] = 'no'"
                >
                  否
                </button>
                <button
                  class="yn-btn"
                  :class="{ 'yn-active': ad8Answers[q.key] === 'dk' }"
                  @click="ad8Answers[q.key] = 'dk'"
                >
                  不知道
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══ TDS 題目 ══ -->
    <template v-if="cog_method === 'TDS'">
      <!-- ── Personal info ─────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">📋</span>
          <span class="group-label-text">基本資料</span>
          <span class="group-sub-text">TDS 腦力健診</span>
        </div>
        <div class="tds-person">
          <div class="tds-person-row">
            <label class="tds-label">姓名：</label>
            <input
              v-model="tdsPerson.name"
              class="tds-input"
              placeholder="請輸入姓名"
            />
            <label class="tds-label tds-label-gender">性別：</label>
            <button
              class="tds-gender-btn"
              :class="{ active: tdsPerson.gender === 'M' }"
              @click="tdsPerson.gender = 'M'"
            >
              男
            </button>
            <button
              class="tds-gender-btn"
              :class="{ active: tdsPerson.gender === 'F' }"
              @click="tdsPerson.gender = 'F'"
            >
              女
            </button>
          </div>
          <div class="tds-person-row">
            <label class="tds-label">施測日期：</label>
            <input
              v-model="tdsPerson.testY"
              class="tds-input tds-input-sm"
              placeholder="年"
            />
            <span class="tds-sep">/</span>
            <input
              v-model="tdsPerson.testM"
              class="tds-input tds-input-xs"
              placeholder="月"
            />
            <span class="tds-sep">/</span>
            <input
              v-model="tdsPerson.testD"
              class="tds-input tds-input-xs"
              placeholder="日"
            />
          </div>
          <div class="tds-person-row">
            <label class="tds-label">生日：</label>
            <input
              v-model="tdsPerson.birthY"
              class="tds-input tds-input-sm"
              placeholder="民國年"
            />
            <span class="tds-sep">/</span>
            <input
              v-model="tdsPerson.birthM"
              class="tds-input tds-input-xs"
              placeholder="月"
            />
            <span class="tds-sep">/</span>
            <input
              v-model="tdsPerson.birthD"
              class="tds-input tds-input-xs"
              placeholder="日"
            />
          </div>
        </div>
      </div>

      <!-- ── Basic issues ──────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">🧠</span>
          <span class="group-label-text">腦力健診基本問題</span>
          <span class="group-sub-text">記憶力減退相關（可複選）</span>
        </div>
        <div class="tds-chk-list">
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsBasicIssues.selfMemory" />
            <span>您是否覺得自己的記憶力有減退</span>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsBasicIssues.familyMemory" />
            <span>親友覺得受測者的記憶力有減退</span>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsBasicIssues.examinerMemory" />
            <span>施測者認為受測者有記憶力障礙</span>
          </label>
        </div>
      </div>

      <!-- ── Risk factors ──────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">⚠</span>
          <span class="group-label-text">危險因子</span>
          <span class="group-sub-text">資料來源：</span>
          <button
            class="tds-rsrc-btn"
            :class="{ active: tdsRiskFactors.source === 'self' }"
            @click="tdsRiskFactors.source = 'self'"
          >
            本人
          </button>
          <button
            class="tds-rsrc-btn"
            :class="{ active: tdsRiskFactors.source === 'family' }"
            @click="tdsRiskFactors.source = 'family'"
          >
            親友
          </button>
        </div>
        <div class="tds-rf-grid">
          <div class="tds-rf-row">
            <label class="tds-label">教育：</label>
            <input
              v-model="tdsRiskFactors.edu"
              class="tds-input tds-input-xs"
              placeholder="年"
            />
            <span class="tds-rf-unit">年</span>
          </div>
          <div class="tds-rf-row">
            <label class="tds-label">BMI：</label>
            <input
              v-model="tdsRiskFactors.bmi"
              class="tds-input tds-input-sm"
              placeholder="kg/m²"
            />
            <span class="tds-rf-unit">kg/m²</span>
          </div>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.stroke" />
            <span>中風病史</span>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.dm" />
            <span>糖尿病</span>
            <template v-if="tdsRiskFactors.dm">
              <span class="tds-sub-chk">
                <label
                  ><input
                    type="checkbox"
                    v-model="tdsRiskFactors.dmMeds"
                  />藥物治療</label
                >
              </span>
            </template>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.htn" />
            <span>高血壓</span>
            <template v-if="tdsRiskFactors.htn">
              <span class="tds-sub-chk">
                <label
                  ><input
                    type="checkbox"
                    v-model="tdsRiskFactors.htnMeds"
                  />藥物治療</label
                >
              </span>
            </template>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.chol" />
            <span>高膽固醇</span>
            <template v-if="tdsRiskFactors.chol">
              <span class="tds-sub-chk">
                <label
                  ><input
                    type="checkbox"
                    v-model="tdsRiskFactors.cholMeds"
                  />藥物治療</label
                >
              </span>
            </template>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.headInjury" />
            <span>頭部外傷且當時曾有過昏迷</span>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.forgetMeds" />
            <span>時常忘記服用藥物</span>
          </label>
          <label class="tds-chk">
            <input type="checkbox" v-model="tdsRiskFactors.antidepressants" />
            <span
              >曾經服用抗憂鬱藥物 或
              在過去一月中有超過兩星期覺得對任何事提不起勁、不想動</span
            >
          </label>
        </div>
      </div>

      <!-- ── Orientation ───────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">📍</span>
          <span class="group-label-text">定向力</span>
          <span class="group-sub-text">請問今天是...（每題正確 1 分）</span>
          <span class="group-score-tally tds-tally">
            {{ tdsOrientationScore !== null ? tdsOrientationScore : 0 }}/4
          </span>
        </div>
        <div class="item-list">
          <div
            v-for="(label, key) in {
              year: '今年是哪一年？',
              month: '現在是幾月？',
              day: '今天是幾號？',
              weekday: '今天是星期幾？',
            }"
            :key="key"
            class="cog-item"
            :class="{
              answered:
                tdsOrientation[key as keyof typeof tdsOrientation] !== null,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum bht-q">O</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ label }}</span>
              </div>
              <div class="yn-row">
                <button
                  class="yn-btn"
                  :class="{
                    'yn-green':
                      tdsOrientation[key as keyof typeof tdsOrientation] ===
                      true,
                  }"
                  @click="
                    tdsOrientation[key as keyof typeof tdsOrientation] = true
                  "
                >
                  正確
                </button>
                <button
                  class="yn-btn"
                  :class="{
                    'yn-red':
                      tdsOrientation[key as keyof typeof tdsOrientation] ===
                      false,
                  }"
                  @click="
                    tdsOrientation[key as keyof typeof tdsOrientation] = false
                  "
                >
                  錯誤
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Registration ──────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">🔤</span>
          <span class="group-label-text">訊息登錄</span>
          <span class="group-sub-text"
            >請重述五個字詞（只記錄第一次回答的分數）</span
          >
          <span class="group-score-tally tds-tally">
            {{ tdsRegistration >= 0 ? tdsRegistration : "—" }}/5
          </span>
        </div>
        <div class="item-list">
          <div class="cog-item" :class="{ answered: tdsRegistration >= 0 }">
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum bht-q">R</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">重述五個字詞</span>
                <span class="item-sub"
                  >牙齒 · 毛線 · 教堂 · 菊花 · 紅色（可重複教至全部說出）</span
                >
              </div>
              <span
                class="item-score"
                :class="
                  tdsRegistration >= 0
                    ? tdsRegistration === 5
                      ? 'score-ok'
                      : 'score-err'
                    : 'score-nd'
                "
              >
                {{ tdsRegistration >= 0 ? tdsRegistration : "—" }}
              </span>
            </div>
            <div class="count-row">
              <span class="count-label">第一次回答正確數：</span>
              <div class="count-btns">
                <button
                  v-for="n in 6"
                  :key="n - 1"
                  class="count-btn"
                  :class="{
                    'count-ok': n - 1 > 0 && tdsRegistration === n - 1,
                    'count-active': tdsRegistration === n - 1,
                  }"
                  @click="tdsRegistration = n - 1"
                >
                  {{ n - 1 }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Fluency ───────────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">🐾</span>
          <span class="group-label-text">思考流暢</span>
          <span class="group-sub-text"
            >請說出四隻腳的動物，看一分鐘內能說出幾個</span
          >
          <span class="group-score-tally tds-tally">
            {{ tdsFluencyScore !== null ? tdsFluencyScore : "—" }}/2
          </span>
        </div>
        <div class="item-list">
          <div class="cog-item" :class="{ answered: tdsFluency >= 0 }">
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum bht-q">F</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">列舉四隻腳的動物</span>
                <span class="item-sub"
                  >現實不存在的動物不算分（龍、麒麟等不計）</span
                >
              </div>
              <span
                class="item-score"
                :class="
                  tdsFluencyScore !== null
                    ? tdsFluencyScore === 2
                      ? 'score-ok'
                      : 'score-err'
                    : 'score-nd'
                "
              >
                {{ tdsFluencyScore !== null ? tdsFluencyScore : "—" }}
              </span>
            </div>
            <div class="count-row">
              <span class="count-label">總數：</span>
              <input
                v-model.number="tdsFluency"
                class="count-input"
                type="number"
                min="0"
                placeholder="0"
              />
              <span class="count-score-hint" v-if="tdsFluency >= 0">
                → <strong>{{ tdsFluencyScore }}</strong> 分 （<template
                  v-if="tdsFluency >= 9"
                  >≥ 9 = 2 分</template
                >
                <template v-else-if="tdsFluency >= 5">5–8 = 1 分</template>
                <template v-else>< 5 = 0 分</template>）
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Recall ────────────────────────────────────────────── -->
      <div class="nihss-group">
        <div class="group-header-bar tds-bar">
          <span class="group-icon">💭</span>
          <span class="group-label-text">訊息回憶</span>
          <span class="group-sub-text">請回想剛才重述的五個字詞</span>
          <span class="group-score-tally tds-tally">
            {{ tdsRecall >= 0 ? tdsRecall : "—" }}/5
          </span>
        </div>
        <div class="item-list">
          <div class="cog-item" :class="{ answered: tdsRecall >= 0 }">
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum bht-q">Re</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">回憶五個字詞</span>
                <span class="item-sub">牙齒 · 毛線 · 教堂 · 菊花 · 紅色</span>
              </div>
              <span
                class="item-score"
                :class="
                  tdsRecall >= 0
                    ? tdsRecall === 5
                      ? 'score-ok'
                      : 'score-err'
                    : 'score-nd'
                "
              >
                {{ tdsRecall >= 0 ? tdsRecall : "—" }}
              </span>
            </div>
            <div class="count-row">
              <span class="count-label">正確說出：</span>
              <div class="count-btns">
                <button
                  v-for="n in 6"
                  :key="n - 1"
                  class="count-btn"
                  :class="{
                    'count-ok': n - 1 > 0 && tdsRecall === n - 1,
                    'count-active': tdsRecall === n - 1,
                  }"
                  @click="tdsRecall = n - 1"
                >
                  {{ n - 1 }}
                </button>
              </div>
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
          cog_method === "BHT"
            ? "加權計分（錯誤次數 × 加權值）"
            : cog_method === "AD8"
              ? "是=1分，否/不知道=0分"
              : "定向+登錄+流暢+回憶（/16）"
        }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="cog_showResults && currentDone" class="results-detail">
      <div class="results-header">評估明細</div>
      <template v-if="cog_method === 'BHT'">
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
      <template v-else-if="cog_method === 'AD8'">
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
      <template v-else>
        <div class="detail-row">
          <span class="detail-qnum">O</span>
          <span class="detail-domain">定向力</span>
          <span
            class="detail-score"
            :class="
              tdsOrientationScore !== null && tdsOrientationScore < 4
                ? 'ds-abn'
                : 'ds-ok'
            "
            >{{
              tdsOrientationScore !== null ? tdsOrientationScore : "—"
            }}</span
          >
          <span class="detail-desc">/ 4</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">R</span>
          <span class="detail-domain">訊息登錄</span>
          <span
            class="detail-score"
            :class="
              tdsRegistration >= 0 && tdsRegistration < 5
                ? tdsRegistration < 3
                  ? 'ds-abn'
                  : 'ds-ok'
                : ''
            "
            >{{ tdsRegistration >= 0 ? tdsRegistration : "—" }}</span
          >
          <span class="detail-desc">/ 5</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">F</span>
          <span class="detail-domain">思考流暢（動物列舉）</span>
          <span
            class="detail-score"
            :class="
              tdsFluencyScore !== null && tdsFluencyScore < 2
                ? 'ds-abn'
                : 'ds-ok'
            "
            >{{ tdsFluencyScore !== null ? tdsFluencyScore : "—" }}</span
          >
          <span class="detail-desc">/ 2</span>
        </div>
        <div class="detail-row">
          <span class="detail-qnum">Re</span>
          <span class="detail-domain">訊息回憶</span>
          <span
            class="detail-score"
            :class="
              tdsRecall >= 0 && tdsRecall < 5
                ? tdsRecall < 3
                  ? 'ds-abn'
                  : 'ds-ok'
                : ''
            "
            >{{ tdsRecall >= 0 ? tdsRecall : "—" }}</span
          >
          <span class="detail-desc">/ 5</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">TDS 總分</span>
          <span class="detail-score detail-score-brand">{{ tdsTotal }}</span>
          <div class="detail-desc detail-desc-block">
            <span class="detail-desc-unit">/ 16</span>
            <span class="detail-desc-label">{{ tdsSeverity.level }}</span>
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
          >{{ cog_method }} 陽性篩查（總分 {{ currentScore }}/{{
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
      <button class="btn-view" @click="cog_showResults = !cog_showResults">
        {{ cog_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!currentDone" @click="cog_copyMarkdown">
        {{ cog_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cog_reset">重置</button>
    </div>
    <p v-if="!currentDone" class="progress-hint">
      已完成 {{ currentAnsweredCount }}/{{
        cog_method === "BHT" ? bhtItems.length : cog_method === "AD8" ? 8 : 7
      }}
      題，尚餘
      {{
        (cog_method === "BHT" ? bhtItems.length : cog_method === "AD8" ? 8 : 7) -
        currentAnsweredCount
      }}
      題
    </p>
  </div>

  <div v-show="activeTab === 'sppb'" class="sppb">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="sppb-header">
      <div class="header-title">
        <h2 class="title">SPPB 簡易身體表現功能量表</h2>
        <p class="subtitle">
          Short Physical Performance Battery · Guralnik et al. JAMA 1994 · ICOPE
          行動功能複評工具 · 衛生福利部國民健康署
        </p>
        <p class="subtitle-hint">
          <span
            class="hint-tag"
            :class="icopeMobAbn ? 'hint-tag--active' : 'hint-tag--inactive'"
          >
            <span v-if="icopeMobAbn"
              >🦵 ICOPE 行動初評異常 請使用本量表複評</span
            >
            <span v-else>🦵 ICOPE 行動功能複評工具（SPPB）</span>
          </span>
        </p>
      </div>
      <div class="score-badge" :class="result.color">
        <span class="badge-top">SPPB</span>
        <span class="score-number">{{
          sppb_totalScore !== null ? sppb_totalScore : "—"
        }}</span>
        <span class="score-bot">{{ scoreBotLabel }}</span>
      </div>
    </div>

    <!-- ── Score overview bar ─────────────────────────────────── -->
    <div class="score-overview">
      <div
        class="so-card"
        :class="
          balanceDone
            ? balanceScoreCalc! >= 3
              ? 'so-ok'
              : balanceScoreCalc! >= 2
                ? 'so-mid'
                : 'so-abn'
            : 'so-nd'
        "
      >
        <span class="so-icon">⚖️</span>
        <span class="so-label">平衡</span>
        <span class="so-val">{{ balanceDone ? balanceScoreCalc : "—" }}</span>
        <span class="so-max">/ 4</span>
      </div>
      <span class="so-plus">+</span>
      <div
        class="so-card"
        :class="
          gaitDone
            ? gaitScore! >= 3
              ? 'so-ok'
              : gaitScore! >= 2
                ? 'so-mid'
                : 'so-abn'
            : 'so-nd'
        "
      >
        <span class="so-icon">🚶</span>
        <span class="so-label">步速</span>
        <span class="so-val">{{ gaitDone ? gaitScore : "—" }}</span>
        <span class="so-max">/ 4</span>
      </div>
      <span class="so-plus">+</span>
      <div
        class="so-card"
        :class="
          chairDone
            ? chairScore! >= 3
              ? 'so-ok'
              : chairScore! >= 2
                ? 'so-mid'
                : 'so-abn'
            : 'so-nd'
        "
      >
        <span class="so-icon">🪑</span>
        <span class="so-label">起站</span>
        <span class="so-val">{{ chairDone ? chairScore : "—" }}</span>
        <span class="so-max">/ 4</span>
      </div>
      <span class="so-plus">=</span>
      <div
        class="so-card so-total"
        :class="sppb_isComplete ? result.color : 'so-nd'"
      >
        <span class="so-icon">∑</span>
        <span class="so-label">總分</span>
        <span class="so-val">{{ sppb_totalScore !== null ? sppb_totalScore : "—" }}</span>
        <span class="so-max">/ 12</span>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TEST 1 — BALANCE
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar bal-bar">
        <span class="group-icon">⚖️</span>
        <span class="group-label-text">1. 平衡測試（Balance Test）</span>
        <span class="group-sub-text">三種站姿，每種保持 10 秒，最高 4 分</span>
        <span
          class="group-score-tally"
          :class="
            balanceDone
              ? balanceScoreCalc! >= 3
                ? 'tally-ok'
                : balanceScoreCalc! >= 2
                  ? 'tally-mid'
                  : 'tally-abn'
              : 'tally-nd'
          "
        >
          {{ balanceDone ? balanceScoreCalc + " / 4 分" : "—" }}
        </span>
      </div>

      <!-- Balance instruction -->
      <div class="balance-instruction">
        <span class="bi-icon">ℹ️</span>
        <span
          >雙手抱胸（可雙手伸直或膝蓋微彎增加平衡感）。站穩後開始計時。前後腳不可分左右腳。不得使用柺杖或助行器。在適當位置保護長者。</span
        >
      </div>

      <!-- ── Three stance cards (illustration + rules + input each) ── -->
      <div class="stance-grid">
        <!-- A: Side-by-side -->
        <div
          class="stance-card"
          :class="
            sideScore === 1 ? 'sc-pass' : sideScore === 0 ? 'sc-fail' : ''
          "
        >
          <div class="sc-header sc-header-a">
            <span class="sc-label">A. 並排站立</span>
            <span class="sc-en">Side-by-side stand</span>
            <span
              class="sc-badge"
              :class="
                sideScore === 1
                  ? 'sb-pass'
                  : sideScore === 0
                    ? 'sb-fail'
                    : 'sb-nd'
              "
            >
              {{
                sideScore === null ? "—" : sideScore === 1 ? "1 分 ✓" : "0 分 ✗"
              }}
            </span>
          </div>
          <div class="sc-illus" v-html="svgSideBySide"></div>
          <div class="sc-rule">兩腳並攏站立 · 保持 10 秒</div>
          <div class="sc-scores">
            <span class="sc-s sc-s-ok">≥10s → 1分（繼續B）</span>
            <span class="sc-s sc-s-fail">&lt;10s → 0分（停止）</span>
          </div>
          <div class="sc-input-area">
            <input
              type="number"
              class="time-input"
              min="0"
              max="30"
              step="0.1"
              placeholder="秒"
              :value="sideBySideTime ?? ''"
              @input="setSideBySide"
              ref="sideInput"
              @keydown.enter="j(sidePass ? semiInput : gaitInput)"
            />
            <span class="tc-unit">秒</span>
          </div>
          <div class="sc-skip-notice">
            <span v-if="sideScore === 0">後續測試跳過</span>
          </div>
        </div>

        <!-- B: Semi-tandem -->
        <div
          class="stance-card"
          :class="
            !sidePass
              ? 'sc-disabled'
              : semiScore === 1
                ? 'sc-pass'
                : semiScore === 0
                  ? 'sc-fail'
                  : ''
          "
        >
          <div class="sc-header sc-header-b">
            <span class="sc-label">B. 半前後站立</span>
            <span class="sc-en">Semi-tandem stand</span>
            <span
              class="sc-badge"
              :class="
                !sidePass
                  ? 'sb-skip'
                  : semiScore === 1
                    ? 'sb-pass'
                    : semiScore === 0
                      ? 'sb-fail'
                      : 'sb-nd'
              "
            >
              {{
                !sidePass
                  ? "跳過"
                  : semiScore === null
                    ? "—"
                    : semiScore === 1
                      ? "通過 ✓"
                      : "未通過 ✗"
              }}
            </span>
          </div>
          <div class="sc-illus" v-html="svgSemiTandem"></div>
          <div class="sc-rule">一腳大拇指靠近另一腳足弓 · 前後一後</div>
          <div class="sc-scores">
            <span class="sc-s sc-s-ok">≥10s → 繼續C</span>
            <span class="sc-s sc-s-fail">&lt;10s → 總分1分</span>
          </div>
          <div class="sc-input-area">
            <input
              type="number"
              class="time-input"
              min="0"
              max="30"
              step="0.1"
              placeholder="秒"
              :value="semiTandemTime ?? ''"
              :disabled="!sidePass"
              @input="setSemiTandem"
              ref="semiInput"
              @keydown.enter="j(semiPass ? tandemInput : gaitInput)"
            />
            <span class="tc-unit">秒</span>
          </div>
          <div class="sc-skip-notice">
            <span v-if="!sidePass">A 未通過，此題跳過</span>
            <span v-else-if="semiScore === 0">C 跳過，總分 1 分</span>
          </div>
        </div>

        <!-- C: Tandem -->
        <div
          class="stance-card"
          :class="
            !semiPass
              ? 'sc-disabled'
              : tandemScore === 2
                ? 'sc-pass'
                : tandemScore === 1
                  ? 'sc-mid'
                  : tandemScore === 0
                    ? 'sc-fail'
                    : ''
          "
        >
          <div class="sc-header sc-header-c">
            <span class="sc-label">C. 前後站立</span>
            <span class="sc-en">Tandem stand</span>
            <span
              class="sc-badge"
              :class="
                !semiPass
                  ? 'sb-skip'
                  : tandemScore === 2
                    ? 'sb-pass'
                    : tandemScore === 1
                      ? 'sb-mid'
                      : tandemScore === 0
                        ? 'sb-fail'
                        : 'sb-nd'
              "
            >
              {{
                !semiPass
                  ? "跳過"
                  : tandemScore === null
                    ? "—"
                    : tandemScore === 2
                      ? "2 分 ✓"
                      : tandemScore === 1
                        ? "1 分 △"
                        : "0 分 ✗"
              }}
            </span>
          </div>
          <div class="sc-illus" v-html="svgTandem"></div>
          <div class="sc-rule">一腳腳尖置於另一腳腳跟，呈直線</div>
          <div class="sc-scores">
            <span class="sc-s sc-s-ok">≥10s → 2分</span>
            <span class="sc-s sc-s-mid">3–9.99s → 1分</span>
            <span class="sc-s sc-s-fail">&lt;3s → 0分</span>
          </div>
          <div class="sc-input-area">
            <input
              type="number"
              class="time-input"
              min="0"
              max="30"
              step="0.1"
              placeholder="秒"
              :value="tandemTime ?? ''"
              :disabled="!semiPass"
              @input="setTandem"
              ref="tandemInput"
              @keydown.enter="j(gaitInput)"
            />
            <span class="tc-unit">秒</span>
          </div>
          <div class="sc-skip-notice">
            <span v-if="!semiPass">B 未通過，此題跳過</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TEST 2 — GAIT SPEED
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar gait-bar">
        <span class="group-icon">🚶</span>
        <span class="group-label-text">2. 步行速度測試（Gait Speed Test）</span>
        <span class="group-sub-text">4公尺（優先）或 3公尺（空間不足時）</span>
        <span
          class="group-score-tally"
          :class="
            gaitDone
              ? gaitScore! >= 3
                ? 'tally-ok'
                : gaitScore! >= 2
                  ? 'tally-mid'
                  : 'tally-abn'
              : 'tally-nd'
          "
        >
          {{ gaitDone ? gaitScore + " / 4 分" : "—" }}
        </span>
      </div>

      <!-- Distance selector -->
      <div class="dist-toggle">
        <button
          class="dist-btn"
          :class="{ 'dist-active': gaitDist === '4m' }"
          @click="
            gaitDist = '4m';
            gaitTime = null;
          "
        >
          <span class="dist-title">4 公尺</span>
          <span class="dist-sub">優先使用</span>
        </button>
        <button
          class="dist-btn"
          :class="{ 'dist-active-3': gaitDist === '3m' }"
          @click="
            gaitDist = '3m';
            gaitTime = null;
          "
        >
          <span class="dist-title">3 公尺</span>
          <span class="dist-sub">空間不足時替代</span>
        </button>
      </div>

      <!-- Scoring table -->
      <div class="scoring-table">
        <div class="st-header">
          <span>分數</span>
          <span>{{ gaitDist === "4m" ? "4公尺（秒）" : "3公尺（秒）" }}</span>
          <span>說明</span>
        </div>
        <template v-if="gaitDist === '4m'">
          <div
            v-for="row in gait4mRows"
            :key="row.s"
            class="st-row"
            :class="{ 'st-active': gaitScore === row.s && gaitDone }"
          >
            <span class="st-score">{{ row.s }}</span>
            <span class="st-time">{{ row.t }}</span>
            <span class="st-desc">{{ row.d }}</span>
          </div>
        </template>
        <template v-else>
          <div
            v-for="row in gait3mRows"
            :key="row.s"
            class="st-row"
            :class="{ 'st-active': gaitScore === row.s && gaitDone }"
          >
            <span class="st-score">{{ row.s }}</span>
            <span class="st-time">{{ row.t }}</span>
            <span class="st-desc">{{ row.d }}</span>
          </div>
        </template>
      </div>

      <!-- Gait instruction note -->
      <div class="gait-note">
        <span class="gn-icon">📏</span>
        <span
          >可使用柺杖或助行器。標線：鮮豔有色寬膠帶，寬度 ≥
          2公分。評估者從長者跨越起點標線後開始計時，至終點標線停止（非緩衝線）。測試前可提前設置前後各
          50公分緩衝線。指導語：「用平常走路的速度，從這條線走到那邊的黃色線，我說『開始』時出發。」</span
        >
      </div>

      <!-- Gait Track Illustration -->
      <div class="gait-illus-wrap">
        <div class="gait-svg-wrap" v-html="svgGaitTrack"></div>
      </div>

      <!-- Time input -->
      <div
        class="time-card"
        :class="
          gaitCannot
            ? 'tc-fail'
            : gaitDone
              ? gaitScore! >= 3
                ? 'tc-pass'
                : gaitScore! >= 2
                  ? 'tc-mid'
                  : 'tc-fail'
              : ''
        "
      >
        <div class="item-header">
          <span class="item-name">步行時間</span>
          <span
            class="item-score"
            :class="
              gaitCannot
                ? 'val-abn'
                : gaitScore !== null
                  ? gaitScore >= 3
                    ? 'val-ok'
                    : gaitScore >= 2
                      ? 'val-mid'
                      : 'val-abn'
                  : 'val-nd'
            "
          >
            {{
              gaitCannot
                ? "無法完成"
                : gaitTime !== null
                  ? gaitTime + "秒"
                  : "—"
            }}
          </span>
        </div>
        <div class="tc-input-row">
          <input
            type="number"
            class="time-input"
            min="0"
            max="60"
            step="0.01"
            placeholder="例：5.43"
            :value="gaitTime ?? ''"
            :disabled="gaitCannot"
            @input="setGait"
            ref="gaitInput"
            @keydown.enter="j(chairInput)"
          />
          <span class="tc-unit">秒</span>
          <button
            class="cannot-btn"
            :class="{ 'cannot-active': gaitCannot }"
            @click="
              gaitCannot = !gaitCannot;
              if (gaitCannot) gaitTime = null;
            "
          >
            {{ gaitCannot ? "取消無法完成" : "無法完成（0分）" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         TEST 3 — CHAIR STAND
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar chair-bar">
        <span class="group-icon">🪑</span>
        <span class="group-label-text">3. 椅子起站測試（Chair Stand × 5）</span>
        <span class="group-sub-text">雙手抱胸，連續起立坐下 5 次的總時間</span>
        <span
          class="group-score-tally"
          :class="
            chairDone
              ? chairScore! >= 3
                ? 'tally-ok'
                : chairScore! >= 2
                  ? 'tally-mid'
                  : 'tally-abn'
              : 'tally-nd'
          "
        >
          {{ chairDone ? chairScore + " / 4 分" : "—" }}
        </span>
      </div>

      <!-- Chair scoring table -->
      <div class="scoring-table">
        <div class="st-header">
          <span>分數</span>
          <span>時間（秒）</span>
          <span>說明</span>
        </div>
        <div
          v-for="row in chairRows"
          :key="row.s"
          class="st-row"
          :class="{ 'st-active': chairScore === row.s && chairDone }"
        >
          <span class="st-score">{{ row.s }}</span>
          <span class="st-time">{{ row.t }}</span>
          <span class="st-desc">{{ row.d }}</span>
        </div>
      </div>

      <!-- Chair Stand Illustration -->
      <div class="sts-illus-wrap">
        <div class="sts-illus-badge">
          <span>⏱</span>
          <span>5次連續起站 ／ <strong>雙手抱胸</strong></span>
        </div>
        <div class="sts-svg-wrap" v-html="svgSTS"></div>
        <p class="sts-illus-caption">
          雙手抱胸，從椅上完全站起後再坐下，連續進行 5 次；超過 60
          秒或無法完成視為障礙（0分）
        </p>
      </div>
      <div class="chair-note">
        <span class="gn-icon">ℹ️</span>
        <span
          >雙手抱胸，從椅上完全站起後再坐下，連續 5
          次。計時從長者開始起身算起，第 5
          次站起時停止計時（不含坐下）。不可用手臂撐扶椅背。在適當位置保護長者。</span
        >
      </div>

      <div
        class="time-card"
        :class="
          chairCannot
            ? 'tc-fail'
            : chairDone
              ? chairScore! >= 3
                ? 'tc-pass'
                : chairScore! >= 2
                  ? 'tc-mid'
                  : 'tc-fail'
              : ''
        "
      >
        <div class="item-header">
          <span class="item-name">起站時間（5次）</span>
          <span
            class="item-score"
            :class="
              chairCannot
                ? 'val-abn'
                : chairScore !== null
                  ? chairScore >= 3
                    ? 'val-ok'
                    : chairScore >= 2
                      ? 'val-mid'
                      : 'val-abn'
                  : 'val-nd'
            "
          >
            {{
              chairCannot
                ? "無法完成"
                : chairTime !== null
                  ? chairTime + "秒"
                  : "—"
            }}
          </span>
        </div>
        <div class="tc-input-row">
          <input
            type="number"
            class="time-input"
            min="0"
            max="120"
            step="0.1"
            placeholder="例：12.4"
            :value="chairTime ?? ''"
            :disabled="chairCannot"
            @input="setChair"
            ref="chairInput"
          />
          <span class="tc-unit">秒</span>
          <button
            class="cannot-btn"
            :class="{ 'cannot-active': chairCannot }"
            @click="
              chairCannot = !chairCannot;
              if (chairCannot) chairTime = null;
            "
          >
            {{ chairCannot ? "取消無法完成" : "無法完成（0分）" }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="sppb_showResults && sppb_isComplete" class="results-detail">
      <div class="results-header">SPPB 評估明細</div>

      <!-- Balance detail -->
      <div class="detail-section">
        <div class="ds-head">⚖️ 平衡測試</div>
        <div class="detail-row">
          <span class="detail-qnum">A</span>
          <span class="detail-domain">並排站立（Side-by-side）</span>
          <span
            class="detail-score"
            :class="sideScore === 1 ? 'ds-ok' : 'ds-abn'"
          >
            {{ sideBySideTime !== null ? sideBySideTime + "秒" : "—" }}
          </span>
          <span class="detail-desc">{{
            sideScore === 1 ? "通過 ≥10秒" : "未通過"
          }}</span>
        </div>
        <div class="detail-row" :class="!sidePass ? 'detail-skip' : ''">
          <span class="detail-qnum">B</span>
          <span class="detail-domain">半前後站立（Semi-tandem）</span>
          <span
            class="detail-score"
            :class="
              !sidePass ? 'ds-skip' : semiScore === 1 ? 'ds-ok' : 'ds-abn'
            "
          >
            {{
              !sidePass
                ? "跳過"
                : semiTandemTime !== null
                  ? semiTandemTime + "秒"
                  : "—"
            }}
          </span>
          <span class="detail-desc">{{
            !sidePass ? "A未通過" : semiScore === 1 ? "通過" : "未通過"
          }}</span>
        </div>
        <div class="detail-row" :class="!semiPass ? 'detail-skip' : ''">
          <span class="detail-qnum">C</span>
          <span class="detail-domain">前後站立（Tandem）</span>
          <span
            class="detail-score"
            :class="
              !semiPass
                ? 'ds-skip'
                : tandemScore === 2
                  ? 'ds-ok'
                  : tandemScore === 1
                    ? 'ds-mid'
                    : 'ds-abn'
            "
          >
            {{
              !semiPass ? "跳過" : tandemTime !== null ? tandemTime + "秒" : "—"
            }}
          </span>
          <span class="detail-desc">{{
            !semiPass
              ? "B未通過"
              : tandemScore === 2
                ? "2分（≥10秒）"
                : tandemScore === 1
                  ? "1分（3–9.99秒）"
                  : "0分（&lt;3秒）"
          }}</span>
        </div>
        <div class="detail-row detail-sub-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">平衡小計</span>
          <span class="detail-score detail-score-brand">{{
            balanceScoreCalc
          }}</span>
          <span class="detail-desc">/ 4 分</span>
        </div>
      </div>

      <!-- Gait detail -->
      <div class="detail-section">
        <div class="ds-head">🚶 步行速度測試（{{ gaitDist }}）</div>
        <div class="detail-row">
          <span class="detail-qnum">T</span>
          <span class="detail-domain">步行時間</span>
          <span
            class="detail-score"
            :class="
              gaitCannot
                ? 'ds-abn'
                : gaitScore! >= 3
                  ? 'ds-ok'
                  : gaitScore! >= 2
                    ? 'ds-mid'
                    : 'ds-abn'
            "
          >
            {{ gaitCannot ? "無法" : gaitTime + "秒" }}
          </span>
          <span class="detail-desc">{{ gaitScore }} 分</span>
        </div>
        <div class="detail-row detail-sub-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">步行小計</span>
          <span class="detail-score detail-score-brand">{{ gaitScore }}</span>
          <span class="detail-desc">/ 4 分</span>
        </div>
      </div>

      <!-- Chair detail -->
      <div class="detail-section">
        <div class="ds-head">🪑 椅子起站測試（× 5）</div>
        <div class="detail-row">
          <span class="detail-qnum">T</span>
          <span class="detail-domain">起站時間</span>
          <span
            class="detail-score"
            :class="
              chairCannot
                ? 'ds-abn'
                : chairScore! >= 3
                  ? 'ds-ok'
                  : chairScore! >= 2
                    ? 'ds-mid'
                    : 'ds-abn'
            "
          >
            {{ chairCannot ? "無法" : chairTime + "秒" }}
          </span>
          <span class="detail-desc">{{ chairScore }} 分</span>
        </div>
        <div class="detail-row detail-sub-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">起站小計</span>
          <span class="detail-score detail-score-brand">{{ chairScore }}</span>
          <span class="detail-desc">/ 4 分</span>
        </div>
      </div>

      <!-- Grand total -->
      <div class="detail-row detail-grand-total">
        <span class="detail-qnum dq-grand">SPPB</span>
        <span class="detail-domain">總分</span>
        <span class="detail-score detail-score-grand">{{ sppb_totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 12 分</span>
          <span class="detail-desc-label">{{ result.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="sppb-result" :class="result.color">
      <div class="result-left">
        <span class="result-score">{{
          sppb_totalScore !== null ? sppb_totalScore : "—"
        }}</span>
        <span class="result-max" v-if="sppb_totalScore !== null">/ 12</span>
      </div>
      <div class="result-right">
        <span class="result-ver">SPPB · ICOPE 行動功能複評</span>
        <span class="result-level">{{ result.level }}</span>
        <span class="result-advice" v-if="result.advice">{{
          result.advice
        }}</span>
        <span v-if="result.action" class="result-action"
          >💡 {{ result.action }}</span
        >
      </div>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >SPPB 為行動功能篩查工具，陽性結果（0–9
        分）應轉介物理治療師或老年醫學科進行完整評估，包含肌少症（肌肉量、握力）及跌倒風險評估。評估過程中須確保長者安全，請在適當位置保護。計時起止點為長者跨越起點標線後開始，至終點標線停止（非緩衝線）。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="sppb-actions">
      <button
        class="btn-view"
        :disabled="!sppb_isComplete"
        @click="sppb_showResults = !sppb_showResults"
      >
        {{ sppb_showResults ? "收起明細" : "查看評估明細" }}
      </button>
      <button class="btn-copy" :disabled="!sppb_isComplete" @click="sppb_copyOutput">
        {{ sppb_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="sppb_reset">重置</button>
    </div>
    <p v-if="!sppb_isComplete" class="progress-hint">
      請完成：{{ !balanceDone ? "平衡測試 · " : ""
      }}{{ !gaitDone ? "步行速度測試 · " : ""
      }}{{ !chairDone ? "椅子起站測試" : "" }}
    </p>
  </div>

  <div v-show="activeTab === 'mna'" class="mna">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mna-header">
      <div class="header-title">
        <h2 class="title">MNA-SF 迷你營養評估簡式版</h2>
        <p class="subtitle">
          Mini Nutritional Assessment Short-Form · Guigoz / Nestlé 1994, Rev.
          2009 · ICOPE 營養不良複評工具
        </p>
        <p class="subtitle-hint">
          <span
            class="hint-tag"
            :class="icopeNutAbn ? 'hint-tag--active' : 'hint-tag--inactive'"
          >
            <span v-if="icopeNutAbn"
              >🥗 ICOPE 營養初評異常 請使用本量表複評</span
            >
            <span v-else>🥗 ICOPE 營養不良複評工具（MNA-SF）</span>
          </span>
        </p>
      </div>
      <div class="score-badge" :class="mna_severity.color">
        <span class="badge-ver">MNA-SF</span>
        <span class="score-number">{{ mna_isComplete ? mna_totalScore : "—" }}</span>
        <span class="score-label">{{
          mna_isComplete
            ? mna_severity.level.length > 10
              ? mna_severity.level.substring(0, 10) + "…"
              : mna_severity.level
            : `${mna_answeredCount}/6 項`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="mna_severity.color"
          :style="{ width: mna_barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs tick-red" style="left: 57.1%">8 ▾</span>
        <span class="tick-abs tick-yellow" style="left: 85.7%">12 ▾</span>
        <span class="tick-abs tick-green" style="left: 100%">14</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs tick-red" style="left: 57.1%">營養不良</span>
        <span class="label-abs tick-yellow" style="left: 85.7%">有風險</span>
        <span class="label-abs tick-green" style="left: 100%">正常</span>
      </div>
    </div>

    <!-- ── ICOPE notice ───────────────────────────────────────── -->
    <div class="icope-notice">
      <span class="notice-icon">📋</span>
      <span>
        本工具用於
        <strong>ICOPE 營養初評異常</strong
        >後的複評。初評發現非刻意體重減輕或食慾下降，即應使用 MNA-SF
        進行完整評估。
        <span class="notice-sep">·</span>
        <strong class="cross-hint"
          >行動功能異常請使用 SPPB；憂鬱症狀異常請使用 GDS-15。</strong
        >
      </span>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 A — 食量
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-a">
        <span class="group-icon">🍽️</span>
        <span class="group-label-text">A. 食量變化</span>
        <span class="group-sub-text"
          >過去三個月因食慾不振、消化問題、咀嚼或吞嚥困難而減少食量</span
        >
        <span
          class="group-score-tally"
          :class="
            qA !== null ? (qA >= 2 ? 'tally-ok' : 'tally-abn') : 'tally-nd'
          "
          >{{ qA !== null ? qA + " / 3 分" : "—" }}</span
        >
      </div>
      <div class="item-list">
        <div
          class="mna-item"
          :class="qA !== null ? (qA >= 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-a">A</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去三個月，您是否因為食慾不振、消化問題、咀嚼或吞嚥困難而減少食量？</span
              >
              <span class="item-sub"
                >0 = 食量嚴重減少　1 = 食量中度減少　2 = 食量沒有改變</span
              >
            </div>
            <span
              class="item-score"
              :class="qA !== null ? (qA >= 2 ? 'val-ok' : 'val-abn') : 'val-nd'"
            >
              {{ qA !== null ? qA + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-3">
            <button
              v-for="opt in [
                { val: 0, label: '食量嚴重減少', sub: '0 分' },
                { val: 1, label: '食量中度減少', sub: '1 分' },
                { val: 2, label: '食量沒有改變', sub: '2 分' },
              ]"
              :key="opt.val"
              class="opt-btn"
              :class="{
                'opt-active': qA === opt.val,
                'opt-abn': opt.val <= 1 && qA === opt.val,
                'opt-ok': opt.val === 2 && qA === opt.val,
                ['m' + opt.val]: true,
              }"
              @click="qA = opt.val"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.sub }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 B — 體重下降
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-b">
        <span class="group-icon">⚖️</span>
        <span class="group-label-text">B. 體重下降</span>
        <span class="group-sub-text">過去三個月內體重下降的情況</span>
        <span
          class="group-score-tally"
          :class="
            qB !== null ? (qB >= 2 ? 'tally-ok' : 'tally-abn') : 'tally-nd'
          "
          >{{ qB !== null ? qB + " / 3 分" : "—" }}</span
        >
      </div>
      <div class="item-list">
        <div
          class="mna-item"
          :class="qB !== null ? (qB >= 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-b">B</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">過去三個月內體重下降的情況？</span>
              <span class="item-sub"
                >0 = 體重下降大於 3 公斤（6.6 磅）　1 = 不知道　2 = 體重下降 1–3
                公斤（2.2–6.6 磅）　3 = 體重沒有下降</span
              >
            </div>
            <span
              class="item-score"
              :class="qB !== null ? (qB >= 2 ? 'val-ok' : 'val-abn') : 'val-nd'"
            >
              {{ qB !== null ? qB + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-4">
            <button
              v-for="opt in [
                { val: 0, label: '下降 > 3 kg', sub: '0 分' },
                { val: 1, label: '不知道', sub: '1 分' },
                { val: 2, label: '下降 1–3 kg', sub: '2 分' },
                { val: 3, label: '體重沒有下降', sub: '3 分' },
              ]"
              :key="opt.val"
              class="opt-btn"
              :class="{
                'opt-active': qB === opt.val,
                'opt-abn': opt.val <= 1 && qB === opt.val,
                'opt-ok': opt.val >= 2 && qB === opt.val,
                ['m' + opt.val]: true,
              }"
              @click="qB = opt.val"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.sub }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 C — 活動能力
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-c">
        <span class="group-icon">🚶</span>
        <span class="group-label-text">C. 活動能力</span>
        <span class="group-sub-text">目前的行動活動狀況</span>
        <span
          class="group-score-tally"
          :class="
            qC !== null ? (qC >= 2 ? 'tally-ok' : 'tally-abn') : 'tally-nd'
          "
          >{{ qC !== null ? qC + " / 2 分" : "—" }}</span
        >
      </div>
      <div class="item-list">
        <div
          class="mna-item"
          :class="qC !== null ? (qC >= 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-c">C</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">活動能力</span>
              <span class="item-sub"
                >0 = 需長期臥床或坐輪椅　1 = 可以下床或離開輪椅，但不能外出　2 =
                可以外出</span
              >
            </div>
            <span
              class="item-score"
              :class="qC !== null ? (qC >= 2 ? 'val-ok' : 'val-abn') : 'val-nd'"
            >
              {{ qC !== null ? qC + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-3">
            <button
              v-for="opt in [
                { val: 0, label: '長期臥床或坐輪椅', sub: '0 分' },
                { val: 1, label: '可下床但不能外出', sub: '1 分' },
                { val: 2, label: '可以外出', sub: '2 分' },
              ]"
              :key="opt.val"
              class="opt-btn"
              :class="{
                'opt-active': qC === opt.val,
                'opt-abn': opt.val <= 1 && qC === opt.val,
                'opt-ok': opt.val === 2 && qC === opt.val,
                ['m' + opt.val]: true,
              }"
              @click="qC = opt.val"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.sub }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 D — 心理創傷或急性疾病
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-d">
        <span class="group-icon">🏥</span>
        <span class="group-label-text">D. 心理創傷或急性疾病</span>
        <span class="group-sub-text"
          >過去三個月內是否有受到心理創傷或患上急性疾病</span
        >
        <span
          class="group-score-tally"
          :class="
            qD !== null ? (qD === 2 ? 'tally-ok' : 'tally-abn') : 'tally-nd'
          "
          >{{ qD !== null ? qD + " / 2 分" : "—" }}</span
        >
      </div>
      <div class="item-list">
        <div
          class="mna-item"
          :class="qD !== null ? (qD === 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-d">D</span>
            </div>
            <div class="item-name-block">
              <span class="item-name"
                >過去三個月內是否有受到心理創傷或患上急性疾病？</span
              >
              <span class="item-sub">0 = 有　2 = 沒有</span>
            </div>
            <span
              class="item-score"
              :class="
                qD !== null ? (qD === 2 ? 'val-ok' : 'val-abn') : 'val-nd'
              "
            >
              {{ qD !== null ? qD + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-2">
            <button
              class="opt-btn m0"
              :class="{ 'opt-active': qD === 0, 'opt-abn': qD === 0 }"
              @click="qD = 0"
            >
              <span class="opt-label">有</span>
              <span class="opt-score">0 分</span>
            </button>
            <button
              class="opt-btn m2"
              :class="{ 'opt-active': qD === 2, 'opt-ok': qD === 2 }"
              @click="qD = 2"
            >
              <span class="opt-label">沒有</span>
              <span class="opt-score">2 分</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 E — 精神心理問題
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-e">
        <span class="group-icon">🧠</span>
        <span class="group-label-text">E. 精神心理問題</span>
        <span class="group-sub-text">神經心理疾患評估</span>
        <span
          class="group-score-tally"
          :class="
            qE !== null ? (qE >= 2 ? 'tally-ok' : 'tally-abn') : 'tally-nd'
          "
          >{{ qE !== null ? qE + " / 2 分" : "—" }}</span
        >
      </div>
      <div class="item-list">
        <div
          class="mna-item"
          :class="qE !== null ? (qE >= 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-e">E</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">精神心理問題</span>
              <span class="item-sub"
                >0 = 嚴重癡呆或抑鬱　1 = 輕度癡呆　2 = 沒有精神心理問題</span
              >
            </div>
            <span
              class="item-score"
              :class="qE !== null ? (qE >= 2 ? 'val-ok' : 'val-abn') : 'val-nd'"
            >
              {{ qE !== null ? qE + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-3">
            <button
              v-for="opt in [
                { val: 0, label: '嚴重癡呆或抑鬱', sub: '0 分' },
                { val: 1, label: '輕度癡呆', sub: '1 分' },
                { val: 2, label: '無精神心理問題', sub: '2 分' },
              ]"
              :key="opt.val"
              class="opt-btn"
              :class="{
                'opt-active': qE === opt.val,
                'opt-abn': opt.val <= 1 && qE === opt.val,
                'opt-ok': opt.val === 2 && qE === opt.val,
                ['m' + opt.val]: true,
              }"
              @click="qE = opt.val"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.sub }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         題目 F — BMI / 小腿圍
    ══════════════════════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar q-bar-f">
        <span class="group-icon">📏</span>
        <span class="group-label-text">F. 身體質量指數 / 小腿圍</span>
        <span class="group-sub-text"
          >優先使用 F1（BMI）；無法取得時改用 F2（小腿圍）</span
        >
        <span
          class="group-score-tally"
          :class="
            fScore !== null
              ? fScore >= 2
                ? 'tally-ok'
                : 'tally-abn'
              : 'tally-nd'
          "
          >{{ fScore !== null ? fScore + " / 3 分" : "—" }}</span
        >
      </div>

      <!-- F1/F2 toggle -->
      <div class="f-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': !useF2 }"
          @click="
            useF2 = false;
            qF2 = null;
          "
        >
          <span class="tab-title">F1 — BMI</span>
          <span class="tab-sub">身體質量指數（優先使用）</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-f': useF2 }"
          @click="
            useF2 = true;
            qF1 = null;
          "
        >
          <span class="tab-title">F2 — 小腿圍</span>
          <span class="tab-sub">如果無法取得 BMI 時使用</span>
        </button>
      </div>

      <!-- F1: BMI -->
      <div class="item-list" v-if="!useF2">
        <div
          class="mna-item"
          :class="qF1 !== null ? (qF1 >= 2 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-f">F1</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">身體質量指數（BMI，公斤/公尺²）</span>
              <span class="item-sub"
                >0 = BMI &lt; 19　1 = BMI 19 至 &lt; 21　2 = BMI 21 至 &lt;
                23　3 = BMI ≥ 23</span
              >
            </div>
            <span
              class="item-score"
              :class="
                qF1 !== null ? (qF1 >= 2 ? 'val-ok' : 'val-abn') : 'val-nd'
              "
            >
              {{ qF1 !== null ? qF1 + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-4">
            <button
              v-for="opt in [
                { val: 0, label: 'BMI < 19', sub: '0 分' },
                { val: 1, label: 'BMI 19 至 < 21', sub: '1 分' },
                { val: 2, label: 'BMI 21 至 < 23', sub: '2 分' },
                { val: 3, label: 'BMI ≥ 23', sub: '3 分' },
              ]"
              :key="opt.val"
              class="opt-btn"
              :class="{
                'opt-active': qF1 === opt.val,
                'opt-abn': opt.val <= 1 && qF1 === opt.val,
                'opt-ok': opt.val >= 2 && qF1 === opt.val,
                ['m' + opt.val]: true,
              }"
              @click="qF1 = opt.val"
            >
              <span class="opt-label">{{ opt.label }}</span>
              <span class="opt-score">{{ opt.sub }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- F2: Calf circumference -->
      <div class="item-list" v-else>
        <div class="f2-note">
          如果無法取得 BMI，請以小腿圍（CC）代替。如完成 F1，請不要回答 F2。
        </div>
        <div
          class="mna-item"
          :class="qF2 !== null ? (qF2 === 3 ? 'item-ok' : 'item-err') : ''"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum q-f">F2</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">小腿圍（CC，公分）</span>
              <span class="item-sub"
                >0 = 小腿圍 &lt; 31 公分　3 = 小腿圍 ≥ 31 公分</span
              >
            </div>
            <span
              class="item-score"
              :class="
                qF2 !== null ? (qF2 === 3 ? 'val-ok' : 'val-abn') : 'val-nd'
              "
            >
              {{ qF2 !== null ? qF2 + " 分" : "—" }}
            </span>
          </div>
          <div class="option-row cols-2">
            <button
              class="opt-btn m0"
              :class="{ 'opt-active': qF2 === 0, 'opt-abn': qF2 === 0 }"
              @click="qF2 = 0"
            >
              <span class="opt-label">小腿圍 &lt; 31 cm</span>
              <span class="opt-score">0 分</span>
            </button>
            <button
              class="opt-btn m3"
              :class="{ 'opt-active': qF2 === 3, 'opt-ok': qF2 === 3 }"
              @click="qF2 = 3"
            >
              <span class="opt-label">小腿圍 ≥ 31 cm</span>
              <span class="opt-score">3 分</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════
         Sub-score row
    ══════════════════════════════════════════════════════════ -->
    <div class="sub-score-row" v-if="mna_answeredCount > 0">
      <div
        class="sub-score-card"
        :class="qA !== null ? (qA >= 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">🍽️ A</span>
        <span class="ss-val">{{ sl(qA) }}</span>
        <span class="ss-max">/ 3</span>
      </div>
      <span class="ss-plus">+</span>
      <div
        class="sub-score-card"
        :class="qB !== null ? (qB >= 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">⚖️ B</span>
        <span class="ss-val">{{ sl(qB) }}</span>
        <span class="ss-max">/ 3</span>
      </div>
      <span class="ss-plus">+</span>
      <div
        class="sub-score-card"
        :class="qC !== null ? (qC >= 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">🚶 C</span>
        <span class="ss-val">{{ sl(qC) }}</span>
        <span class="ss-max">/ 2</span>
      </div>
      <span class="ss-plus">+</span>
      <div
        class="sub-score-card"
        :class="qD !== null ? (qD === 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">🏥 D</span>
        <span class="ss-val">{{ sl(qD) }}</span>
        <span class="ss-max">/ 2</span>
      </div>
      <span class="ss-plus">+</span>
      <div
        class="sub-score-card"
        :class="qE !== null ? (qE >= 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">🧠 E</span>
        <span class="ss-val">{{ sl(qE) }}</span>
        <span class="ss-max">/ 2</span>
      </div>
      <span class="ss-plus">+</span>
      <div
        class="sub-score-card"
        :class="fScore !== null ? (fScore >= 2 ? 'ss-ok' : 'ss-abn') : 'ss-nd'"
      >
        <span class="ss-label">📏 {{ useF2 ? "F2" : "F1" }}</span>
        <span class="ss-val">{{ sl(fScore) }}</span>
        <span class="ss-max">/ 3</span>
      </div>
      <span class="ss-plus">=</span>
      <div
        class="sub-score-card ss-total"
        :class="mna_isComplete ? mna_severity.color : 'ss-nd'"
      >
        <span class="ss-label">總分</span>
        <span class="ss-val">{{ mna_isComplete ? mna_totalScore : "—" }}</span>
        <span class="ss-max">/ 14</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="mna-result" :class="mna_severity.color">
      <div class="result-left">
        <span class="result-number">{{ mna_isComplete ? mna_totalScore : "—" }}</span>
        <span class="result-max" v-if="mna_isComplete">/ 14</span>
      </div>
      <div class="result-right">
        <span class="result-ver">MNA-SF</span>
        <span class="result-level">{{ mna_severity.level }}</span>
        <span class="result-advice">{{ mna_severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="mna_showResults && mna_isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div
        v-for="row in [
          { q: 'A', label: '食量變化', val: qA, max: 3 },
          { q: 'B', label: '體重下降', val: qB, max: 3 },
          { q: 'C', label: '活動能力', val: qC, max: 2 },
          { q: 'D', label: '心理創傷/急性疾病', val: qD, max: 2 },
          { q: 'E', label: '精神心理問題', val: qE, max: 2 },
          {
            q: useF2 ? 'F2' : 'F1',
            label: useF2 ? '小腿圍 (CC)' : 'BMI',
            val: fScore,
            max: 3,
          },
        ]"
        :key="row.q"
        class="detail-row"
      >
        <span class="detail-qnum">{{ row.q }}</span>
        <span class="detail-domain">{{ row.label }}</span>
        <span
          class="detail-score"
          :class="row.val !== null && row.val > 0 ? 'ds-ok' : 'ds-abn'"
        >
          {{ row.val ?? "—" }}
        </span>
        <span class="detail-desc">/ {{ row.max }} 分</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">MNA-SF 總分</span>
        <span class="detail-score detail-score-brand">{{ mna_totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 14</span>
          <span class="detail-desc-label">{{ mna_severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Alert ──────────────────────────────────────────────── -->
    <div
      v-if="mna_isComplete && mna_severity.screen"
      class="mna-alert"
      :class="`alert-${mna_severity.color}`"
    >
      <span class="alert-icon">⚠</span>
      <span>
        <strong>MNA-SF 陽性（總分 {{ mna_totalScore }}/14）：</strong
        >{{ mna_severity.advice }}
      </span>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span>
        MNA-SF 為篩查工具，不能取代完整的 MNA（29
        題）評估。陽性個案應轉介老年醫學科或營養師進行深入評估，包括潛在疾病（衰弱症、肌少症、口腔健康）及環境社會支持評估。
      </span>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="mna-actions">
      <button class="btn-view" @click="mna_showResults = !mna_showResults">
        {{ mna_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!mna_isComplete" @click="mna_copyMarkdown">
        {{ mna_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="mna_reset">重置</button>
    </div>
    <p v-if="!mna_isComplete" class="progress-hint">
      已完成 {{ mna_answeredCount }}/6 項，尚餘 {{ 6 - mna_answeredCount }} 項
    </p>
  </div>

  <div v-show="activeTab === 'gds'" class="gds">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="gds-header">
      <div class="header-title">
        <h2 class="title">GDS 老年抑鬱量表</h2>
        <p class="subtitle">
          Geriatric Depression Scale · Yesavage 1983 ·
          請依據<strong>過去一週</strong>的感受作答
        </p>
        <!-- ✦ ICOPE 憂鬱初評複評提示 pill ✦ -->
        <p class="subtitle-hint">
          <span
            class="hint-tag"
            :class="icopeDepAbn ? 'hint-tag--active' : 'hint-tag--inactive'"
          >
            <span v-if="icopeDepAbn"
              >💬 ICOPE 憂鬱初評異常 請使用本量表複評</span
            >
            <span v-else>💬 ICOPE 憂鬱症狀複評工具（GDS-15）</span>
          </span>
        </p>
      </div>
      <div class="score-badge" :class="gds_severity.color">
        <span class="badge-ver">GDS-{{ gds_method }}</span>
        <span class="score-number">{{ gds_isComplete ? gds_totalScore : "—" }}</span>
        <span class="score-label">{{
          gds_isComplete ? gds_severity.level : `${gds_answeredCount}/${maxScore}`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="gds_severity.color"
          :style="{ width: gds_barPct + '%' }"
        />
      </div>
      <template v-if="gds_method === '4'">
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-orange" style="left: 50%">2 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">4</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-orange" style="left: 50%">疑似陽性</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else-if="gds_method === '15'">
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 33.3%">5 ▾</span>
          <span class="tick-abs tick-orange" style="left: 60%">9</span>
          <span class="tick-abs tick-red" style="left: 80%">12</span>
          <span class="tick-abs tick-red" style="left: 100%">15</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 33.3%">輕度</span>
          <span class="label-abs tick-orange" style="left: 60%">中度</span>
          <span class="label-abs tick-red" style="left: 80%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
      <template v-else>
        <div class="severity-ticks-abs">
          <span class="tick-abs" style="left: 0%">0</span>
          <span class="tick-abs tick-yellow" style="left: 33.3%">10 ▾</span>
          <span class="tick-abs tick-red" style="left: 66.7%">20 ▾</span>
          <span class="tick-abs tick-red" style="left: 100%">30</span>
        </div>
        <div class="severity-labels-abs">
          <span class="label-abs" style="left: 0%">正常</span>
          <span class="label-abs tick-yellow" style="left: 33.3%">輕中度</span>
          <span class="label-abs tick-red" style="left: 66.7%">重度</span>
          <span class="label-abs tick-red" style="left: 100%">重度</span>
        </div>
      </template>
    </div>

    <!-- ── Depression alert ───────────────────────────────────── -->
    <div v-if="gds_isComplete && gds_severity.screen" class="gds-alert">
      <span class="alert-icon">⚠</span>
      <span>
        <strong
          >GDS-{{ gds_method }} 陽性篩查（總分 {{ gds_totalScore }}/{{
            maxScore
          }}）：</strong
        >
        {{ gds_severity.advice }}
      </span>
    </div>

    <!-- ── Version tab selector ───────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📋</span>
        <span class="group-label-text">版本選擇</span>
        <span class="group-sub-text">依情境選擇適合的量表版本</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active': gds_method === '4' }"
          @click="gds_switchMethod('4')"
        >
          <span class="tab-title">GDS-4</span>
          <span class="tab-sub">4 題 · 快速篩查 · 1–2 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': gds_method === '15' }"
          @click="gds_switchMethod('15')"
        >
          <span class="tab-title">GDS-15</span>
          <span class="tab-sub">15 題 · 標準版 · 5–7 分鐘</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active': gds_method === '30' }"
          @click="gds_switchMethod('30')"
        >
          <span class="tab-title">GDS-30</span>
          <span class="tab-sub">30 題 · 完整版 · 10–15 分鐘</span>
        </button>
      </div>
      <div class="method-note" :class="`note-${gds_method}`">
        <template v-if="gds_method === '4'">
          <strong>GDS-4（4 題快速版）：</strong>取自 GDS-30 前 4
          題。適合急診、門診或行動不便的患者快速篩查。≥ 2
          分為陽性，建議進一步使用 GDS-15 評估。敏感性約 72%、特異性約 90%。
        </template>
        <template v-else-if="gds_method === '15'">
          <strong>GDS-15（15 題短版）：</strong
          >最常用版本，涵蓋正向情緒與負向情緒兩個次量表。適合門診、社區及住院老年患者。≥
          5 分提示抑鬱，需進一步臨床訪談。敏感性 92%、特異性 89%。<br />
          評分方式：所有題目採是/否作答。<strong>正向題（Q1、Q5、Q7、Q11、Q13）</strong>先行篩查——任一題回答「否」（即憂鬱方向）即為陽性，再接續完成其餘題目。每道題依據憂鬱相關答案計
          1 分，非憂鬱方向計 0 分。
        </template>
        <template v-else>
          <strong>GDS-30（30 題完整版）：</strong
          >原版量表，評估最全面。適合認知功能未受損（MMSE ≥
          15）的老年患者進行詳細評估。正常：0–9；輕中度：10–19；重度：20–30。
        </template>
      </div>
    </div>

    <!-- ── Question items ─────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar gds-bar">
        <span class="group-icon">🧠</span>
        <span class="group-label-text">GDS-{{ gds_method }} 題目</span>
        <span class="group-sub-text">請根據過去一週的感受作答（是 / 否）</span>
        <span class="group-score-tally gds-tally">
          {{ gds_answeredCount }}/{{ maxScore }} 題 ·
          {{ gds_isComplete ? gds_totalScore + "分" : "—" }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="q in activeQuestions"
          :key="q.key"
          class="gds-item"
          :class="{
            'item-healthy':
              selections[q.key] !== null &&
              selections[q.key] !== q.depressiveAnswer,
            'item-depressive':
              selections[q.key] !== null &&
              selections[q.key] === q.depressiveAnswer,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum">Q{{ q.qNum }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.en }}</span>
            </div>
            <div class="yn-row">
            <button
              class="yn-btn"
              :class="{
                'yn-red':
                  selections[q.key] === 'yes' && q.depressiveAnswer === 'yes',
                'yn-green':
                  selections[q.key] === 'yes' && q.depressiveAnswer !== 'yes',
              }"
              @click="selections[q.key] = 'yes'"
            >
              是
            </button>
            <button
              class="yn-btn"
              :class="{
                'yn-red':
                  selections[q.key] === 'no' && q.depressiveAnswer === 'no',
                'yn-green':
                  selections[q.key] === 'no' && q.depressiveAnswer !== 'no',
              }"
              @click="selections[q.key] = 'no'"
            >
              否
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="gds-result" :class="gds_severity.color">
      <div class="result-left">
        <span class="result-number">{{ gds_isComplete ? gds_totalScore : "—" }}</span>
        <span class="result-max" v-if="gds_isComplete">/ {{ maxScore }}</span>
      </div>
      <div class="result-right">
        <span class="result-ver">GDS-{{ gds_method }}</span>
        <span class="result-level">{{ gds_severity.level }}</span>
        <span class="result-advice">{{ gds_severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="gds_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="q in activeQuestions" :key="q.key" class="detail-row">
        <span class="detail-qnum">Q{{ q.qNum }}</span>
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="{
            depressive:
              selections[q.key] === q.depressiveAnswer &&
              selections[q.key] !== null,
            zero:
              selections[q.key] !== null &&
              selections[q.key] !== q.depressiveAnswer,
          }"
        >
          {{
            selections[q.key] === null
              ? "—"
              : selections[q.key] === q.depressiveAnswer
                ? "1"
                : "0"
          }}
        </span>
        <span class="detail-desc">
          {{
            selections[q.key] === "yes"
              ? "是"
              : selections[q.key] === "no"
                ? "否"
                : "未填"
          }}
        </span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">GDS-{{ gds_method }} 總分</span>
        <span class="detail-score detail-score-brand">{{ gds_totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ {{ maxScore }}</span>
          <span class="detail-desc-label">{{ gds_severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Clinical note ──────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >GDS
        為篩查工具，不能取代完整的精神科診斷訪談。任何陽性結果均應安排進一步臨床評估。GDS
        不包含自殺意念評估項目，陽性個案須另行評估安全風險。認知嚴重受損者（MMSE
        &lt; 15）不建議使用 GDS。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="gds-actions">
      <button class="btn-view" @click="gds_showResults = !gds_showResults">
        {{ gds_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="gds_copyMarkdown">
        {{ gds_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="gds_reset">重置</button>
    </div>
    <p v-if="!gds_isComplete" class="progress-hint">
      已完成 {{ gds_answeredCount }}/{{ maxScore }} 題，尚餘
      {{ maxScore - gds_answeredCount }} 題
    </p>
  </div>

  <div v-show="activeTab === 'vis'" class="vis">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="vis-header">
      <div class="header-title">
        <h2 class="title">WHO 近距離視力測試卡</h2>
        <p class="subtitle">
          WHO Simple Vision Chart · Tumbling E · 測試距離 40 cm ·
          分別記錄右眼（OD）與左眼（OS）
        </p>
        <p class="subtitle-2">
          <span class="hint-tag hint-vis"
            >👁️ ICOPE 視力初評異常 請使用本量表複評</span
          >
        </p>
      </div>
      <div class="score-badge" :class="vis_severity.color">
        <span class="badge-top"
          >{{ activeEye === "right" ? "右眼 OD" : "左眼 OS" }} · 6/18</span
        >
        <div class="score-num-row">
          <span class="score-number">{{
            row18.done ? row18.correct : "—"
          }}</span>
          <span class="score-unit" :style="{ opacity: row18.done ? 1 : 0 }"
            >/4</span
          >
        </div>
        <span class="score-bot">
          {{
            vis_isComplete ? (pass18 ? "通過" : "未通過") : `${answeredTotal}/16`
          }}
        </span>
      </div>
    </div>

    <!-- ── Eye tab selector ───────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar eye-bar">
        <span class="group-icon">👁️</span>
        <span class="group-label-text">眼別選擇</span>
        <span class="group-sub-text"
          >遮蓋一眼後選擇目前測試的眼睛，雙眼各測一次</span
        >
      </div>
      <div class="eye-tab-row">
        <button
          class="eye-tab"
          :class="{ 'eye-tab-r': activeEye === 'right' }"
          @click="switchEye('right')"
        >
          <span class="et-icon">👁️</span>
          <span class="et-body">
            <span class="et-title">右眼（OD）</span>
            <span class="et-sub">遮蓋左眼，測試右眼</span>
          </span>
          <span
            class="et-score"
            :class="
              row18OD.done
                ? row18OD.correct >= 3
                  ? 'ets-pass'
                  : 'ets-fail'
                : 'ets-nd'
            "
          >
            {{ row18OD.done ? row18OD.correct + "/4" : "—" }}
          </span>
        </button>
        <button
          class="eye-tab"
          :class="{ 'eye-tab-l': activeEye === 'left' }"
          @click="switchEye('left')"
        >
          <span class="et-icon">👁️</span>
          <span class="et-body">
            <span class="et-title">左眼（OS）</span>
            <span class="et-sub">遮蓋右眼，測試左眼</span>
          </span>
          <span
            class="et-score"
            :class="
              row18OS.done
                ? row18OS.correct >= 3
                  ? 'ets-pass'
                  : 'ets-fail'
                : 'ets-nd'
            "
          >
            {{ row18OS.done ? row18OS.correct + "/4" : "—" }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Severity bar (active eye) ─────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="vis_severity.color"
          :style="{ width: vis_barPct + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs" style="left: 0%">0</span>
        <span class="tick-abs tick-red" style="left: 50%">2/4 ▾</span>
        <span class="tick-abs tick-ok" style="left: 75%">3/4 ▾</span>
        <span class="tick-abs tick-ok" style="left: 100%">4/4</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs tick-red" style="left: 0%">不通過</span>
        <span class="label-abs tick-ok" style="left: 75%">通過標準 ≥ 3/4</span>
      </div>
    </div>

    <!-- ── ICOPE notice ───────────────────────────────────────── -->
    <div class="icope-notice">
      <span class="notice-icon">📋</span>
      <span>
        本工具用於 <strong>ICOPE 視力初評異常</strong>後的複評。
        <span class="notice-sep">·</span>
        <strong class="vis-cross"
          >其他初評異常請使用：認知 → BHT/AD8、行動 → SPPB、憂鬱 →
          GDS-15。</strong
        >
      </span>
    </div>

    <!-- ── 施測說明（可收合）──────────────────────────────────── -->
    <details class="nihss-group inst-collapse">
      <summary class="group-header-bar inst-bar">
        <span class="group-icon">📏</span>
        <span class="group-label-text">施測說明</span>
        <span class="group-sub-text"
          >測試距離 40 cm · 遮蓋一眼 · 配戴眼鏡者於戴鏡狀態下測試</span
        >
        <span class="inst-chevron" aria-hidden="true">▾</span>
      </summary>
      <div class="inst-grid">
        <div class="inst-card">
          <span class="inst-num">1</span>
          <span
            >光線充足的環境下，手持本卡距患者眼睛正好
            <strong>40 cm</strong>（可用繩子量距）。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">2</span>
          <span
            >遮蓋左眼，於上方切換至「右眼」，從第一列（最大字）開始，請患者指出
            E 字缺口方向：<strong>↑上 / ↓下 / ←左 / →右</strong>。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">3</span>
          <span
            ><strong>第 2 列（6/18）</strong>為判讀關鍵：答對
            <strong>≥ 3/4</strong> 通過；< 3/4 建議轉介眼科。</span
          >
        </div>
        <div class="inst-card">
          <span class="inst-num">4</span>
          <span
            >右眼記錄完畢後，切換至「左眼」，遮蓋右眼，同法測試。分別記錄矯正（CC）及未矯正（SC）視力。</span
          >
        </div>
      </div>
    </details>

    <!-- ══ 視力測試圖 ══════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar chart-bar">
        <span class="group-icon">🖨️</span>
        <span class="group-label-text">視力測試圖</span>
        <span class="group-sub-text"
          >實際列印尺寸（1:1）— 列印時請選「實際大小」，勿縮放</span
        >
        <span class="group-score-tally tally-print">40 cm</span>
      </div>
      <div class="chart-card">
        <div class="chart-header-line">
          <span class="chart-card-title">WHO 簡單視力圖　近距離視力測試卡</span>
          <span class="chart-dist">測試距離 40 cm</span>
        </div>
        <div class="chart-body">
          <div
            v-for="(row, ri) in rows"
            :key="ri"
            class="chart-row"
            :class="row.isThreshold ? 'chart-row-threshold' : ''"
          >
            <span class="chart-label">{{ row.snellen }}</span>
            <div class="chart-syms">
              <div
                v-for="(dir, ci) in row.dirs"
                :key="ci"
                class="chart-sym-wrap"
                :class="{
                  'sym-ok': symStatus[ri][ci] === 'correct',
                  'sym-err': symStatus[ri][ci] === 'wrong',
                }"
              >
                <svg
                  :width="row.sizeMm + 'mm'"
                  :height="row.sizeMm + 'mm'"
                  :viewBox="'0 0 ' + row.sizeMm + ' ' + row.sizeMm"
                  xmlns="http://www.w3.org/2000/svg"
                  class="e-glyph"
                  :aria-label="'E開口朝' + dirZh[dir]"
                  v-html="getSvgInner(row.snellen, dir)"
                />
                <span
                  v-if="symStatus[ri][ci] === 'correct'"
                  class="sym-dot dot-ok"
                  >✓</span
                >
                <span
                  v-if="symStatus[ri][ci] === 'wrong'"
                  class="sym-dot dot-err"
                  >✗</span
                >
              </div>
            </div>
            <div class="chart-row-score">
              <span
                v-if="rowStats[ri].done"
                class="row-score-pill"
                :class="rowStats[ri].correct >= 3 ? 'pill-pass' : 'pill-fail'"
              >
                {{ rowStats[ri].correct }}/4
              </span>
              <span v-else class="row-score-pill pill-nd"
                >{{ rowStats[ri].answered }}/4</span
              >
              <span v-if="row.isThreshold" class="threshold-flag"
                >← 臨界值</span
              >
            </div>
          </div>
        </div>
        <div class="chart-footer">
          <span>⚠ 列印時請選「實際大小」，不可縮放</span>
          <span>通過標準：6/18 行答對 ≥ 3/4</span>
        </div>
      </div>
    </div>

    <!-- ══ 記錄患者回答 ═════════════════════════════════════════ -->
    <div class="nihss-group">
      <div class="group-header-bar rec-bar">
        <span class="group-icon">📝</span>
        <span class="group-label-text">
          記錄患者回答 —
          {{ activeEye === "right" ? "右眼（OD）" : "左眼（OS）" }}
        </span>
        <span class="group-sub-text"
          >點選患者指出的方向 · 綠色 = 正確 · 紅色 = 錯誤</span
        >
        <span
          class="group-score-tally"
          :class="
            vis_isComplete
              ? vis_severity.color === 'normal' || vis_severity.color === 'mild'
                ? 'tally-ok'
                : 'tally-abn'
              : 'tally-nd'
          "
        >
          {{ answeredTotal }}/16
        </span>
      </div>

      <!-- Current-eye indicator band -->
      <div
        class="eye-indicator"
        :class="activeEye === 'right' ? 'ei-r' : 'ei-l'"
      >
        <span
          >👁️ 目前記錄：<strong>{{
            activeEye === "right"
              ? "右眼（OD）— 遮蓋左眼"
              : "左眼（OS）— 遮蓋右眼"
          }}</strong></span
        >
        <button
          class="ei-switch"
          @click="switchEye(activeEye === 'right' ? 'left' : 'right')"
        >
          切換至{{ activeEye === "right" ? "左眼" : "右眼" }} →
        </button>
      </div>

      <div class="item-list">
        <div
          v-for="(row, ri) in rows"
          :key="ri"
          class="vis-item"
          :class="{
            'item-pass': rowStats[ri].done && rowStats[ri].correct >= 3,
            'item-fail': rowStats[ri].done && rowStats[ri].correct < 3,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span
                class="item-qnum"
                :class="row.isThreshold ? 'q-threshold' : 'q-row'"
              >
                {{ row.snellen }}
              </span>
            </div>
            <div class="item-name-block">
              <span class="item-name">
                第 {{ ri + 1 }} 列
                <span v-if="row.isThreshold" class="threshold-badge"
                  >臨界值</span
                >
              </span>
              <span class="item-sub">
                符號實際方向：
                <strong
                  v-for="(d, ci) in row.dirs"
                  :key="ci"
                  class="correct-dir"
                  >{{ dirArrow[d] }}</strong
                >
                · 字符高度 {{ row.sizeMm }} mm
              </span>
            </div>
            <span
              class="item-score"
              :class="
                rowStats[ri].done
                  ? rowStats[ri].correct >= 3
                    ? 'val-ok'
                    : 'val-abn'
                  : 'val-nd'
              "
            >
              {{ rowStats[ri].done ? rowStats[ri].correct + "/4" : "—" }}
            </span>
          </div>

          <div class="sym-cols">
            <div
              v-for="(dir, ci) in row.dirs"
              :key="ci"
              class="sym-col"
              :class="{
                'col-ok': symStatus[ri][ci] === 'correct',
                'col-err': symStatus[ri][ci] === 'wrong',
              }"
            >
              <div class="sym-col-head">
                <span class="sym-idx">{{ ci + 1 }}</span>
                <span class="sym-answer">{{ dirArrow[dir] }}</span>
              </div>
              <div class="dir-grid">
                <button
                  v-for="d in allDirs"
                  :key="d"
                  class="dir-btn"
                  :class="{
                    'dir-correct': currentAnswers[ri][ci] === d && d === dir,
                    'dir-wrong': currentAnswers[ri][ci] === d && d !== dir,
                  }"
                  @click="setAnswer(ri, ci, d)"
                >
                  {{ dirArrow[d] }}
                </button>
              </div>
              <div class="sym-verdict">
                <span
                  v-if="currentAnswers[ri][ci] !== null"
                  :class="currentAnswers[ri][ci] === dir ? 'v-ok' : 'v-err'"
                >
                  {{ currentAnswers[ri][ci] === dir ? "✓" : "✗" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Sub-score row (active eye) ────────────────────────── -->
    <div v-if="answeredTotal > 0" class="sub-score-row">
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="sub-score-card"
        :class="{
          'ss-pass': rowStats[ri].done && rowStats[ri].correct >= 3,
          'ss-fail': rowStats[ri].done && rowStats[ri].correct < 3,
          'ss-nd': !rowStats[ri].done,
        }"
      >
        <span class="ss-label">{{ row.snellen }}</span>
        <span class="ss-val">{{
          rowStats[ri].answered > 0 ? rowStats[ri].correct : "—"
        }}</span>
        <span class="ss-max">/ 4</span>
        <span v-if="row.isThreshold" class="ss-threshold">臨界</span>
        <span v-else class="ss-threshold-placeholder"></span>
      </div>
    </div>

    <!-- ── Result card (active eye) ──────────────────────────── -->
    <div class="vis-result" :class="vis_severity.color">
      <div class="result-left">
        <span class="result-number">{{
          row18.done ? row18.correct : "—"
        }}</span>
        <span class="result-max" :style="{ opacity: row18.done ? 1 : 0 }"
          >/4</span
        >
      </div>
      <div class="result-right">
        <span class="result-ver"
          >{{ activeEye === "right" ? "右眼 OD" : "左眼 OS" }} · 6/18
          臨界行</span
        >
        <span class="result-level">{{ vis_severity.level }}</span>
        <span class="result-advice">{{ vis_severity.advice }}</span>
      </div>
    </div>

    <!-- ── Dual comparison card (shown when both done) ─────────── -->
    <div v-if="bothDone" class="dual-card">
      <div class="dual-header">雙眼比較摘要</div>
      <div class="dual-grid">
        <div
          v-for="eye in ['right', 'left'] as Eye[]"
          :key="eye"
          class="dual-eye"
          :class="eye === 'right' ? severityOD.color : severityOS.color"
        >
          <div class="de-info">
            <span class="de-label">{{
              eye === "right" ? "右眼 OD" : "左眼 OS"
            }}</span>
            <span class="de-sub">6/18 臨界行</span>
            <span
              class="de-verdict"
              :class="
                (eye === 'right' ? row18OD.correct : row18OS.correct) >= 3
                  ? 'dv-pass'
                  : 'dv-fail'
              "
            >
              {{
                (eye === "right" ? row18OD.correct : row18OS.correct) >= 3
                  ? "✅ 通過"
                  : "⚠️ 未通過"
              }}
            </span>
            <span class="de-level">
              {{
                (eye === "right" ? severityOD : severityOS).level.split("（")[0]
              }}
            </span>
          </div>
          <span class="de-score">
            {{ eye === "right" ? row18OD.correct : row18OS.correct
            }}<small>/4</small>
          </span>
        </div>
      </div>
    </div>

    <!-- ── Results detail — both eyes ───────────────────────── -->
    <div v-if="vis_showResults && (doneOD || doneOS)" class="results-detail">
      <!-- Column header row -->
      <div class="results-header">
        <span class="rh-col-label">視力列</span>
        <span class="rh-col-od">右眼 OD</span>
        <span class="rh-col-os">左眼 OS</span>
      </div>

      <!-- One row per Snellen level -->
      <div
        v-for="(row, ri) in rows"
        :key="ri"
        class="detail-row detail-row-both"
        :class="row.isThreshold ? 'detail-row-threshold' : ''"
      >
        <!-- Row label -->
        <div class="drb-label">
          <span
            class="detail-qnum"
            :class="row.isThreshold ? 'dq-threshold' : 'dq-row'"
          >
            {{ row.snellen }}
          </span>
          <span class="drb-desc"
            >第 {{ ri + 1 }} 列{{ row.isThreshold ? "（臨界值）" : "" }}</span
          >
        </div>
        <!-- Right eye cell -->
        <div class="drb-cell">
          <span
            v-if="statsOD[ri].done"
            class="drb-score"
            :class="statsOD[ri].correct >= 3 ? 'ds-ok' : 'ds-abn'"
          >
            {{ statsOD[ri].correct }}/4
          </span>
          <span v-else class="drb-score drb-nd">—</span>
          <span
            v-if="statsOD[ri].done"
            class="drb-verdict"
            :class="statsOD[ri].correct >= 3 ? 'dv-pass' : 'dv-fail'"
          >
            {{ statsOD[ri].correct >= 3 ? "通過" : "未通過" }}
          </span>
        </div>
        <!-- Left eye cell -->
        <div class="drb-cell">
          <span
            v-if="statsOS[ri].done"
            class="drb-score"
            :class="statsOS[ri].correct >= 3 ? 'ds-ok' : 'ds-abn'"
          >
            {{ statsOS[ri].correct }}/4
          </span>
          <span v-else class="drb-score drb-nd">—</span>
          <span
            v-if="statsOS[ri].done"
            class="drb-verdict"
            :class="statsOS[ri].correct >= 3 ? 'dv-pass' : 'dv-fail'"
          >
            {{ statsOS[ri].correct >= 3 ? "通過" : "未通過" }}
          </span>
        </div>
      </div>

      <!-- Summary / verdict row -->
      <div class="detail-row detail-row-both detail-total">
        <div class="drb-label">
          <span class="detail-qnum dq-threshold">總判讀</span>
          <span class="drb-desc">6/18 臨界行</span>
        </div>
        <!-- Right eye verdict -->
        <div class="drb-cell drb-verdict-cell">
          <template v-if="doneOD">
            <span class="drb-score detail-score-brand"
              >{{ row18OD.correct }}/4</span
            >
            <span
              class="drb-verdict"
              :class="row18OD.correct >= 3 ? 'dv-pass' : 'dv-fail'"
            >
              {{ row18OD.correct >= 3 ? "✅ 通過" : "⚠️ 未通過" }}
            </span>
            <span class="drb-level">{{ severityOD.level.split("（")[0] }}</span>
          </template>
          <span v-else class="drb-nd">未完成</span>
        </div>
        <!-- Left eye verdict -->
        <div class="drb-cell drb-verdict-cell">
          <template v-if="doneOS">
            <span class="drb-score detail-score-brand"
              >{{ row18OS.correct }}/4</span
            >
            <span
              class="drb-verdict"
              :class="row18OS.correct >= 3 ? 'dv-pass' : 'dv-fail'"
            >
              {{ row18OS.correct >= 3 ? "✅ 通過" : "⚠️ 未通過" }}
            </span>
            <span class="drb-level">{{ severityOS.level.split("（")[0] }}</span>
          </template>
          <span v-else class="drb-nd">未完成</span>
        </div>
      </div>
    </div>

    <!-- ── Alert (combined when both done) ────────────────────── -->
    <div
      v-if="alertCombined"
      class="vis-alert"
      :class="'alert-' + alertCombined.color"
    >
      <span class="alert-icon">⚠</span>
      <span>
        <strong>{{ alertCombined.level }}：</strong>
        {{ alertCombined.advice }}
      </span>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >本測試為近距視力篩查工具，不能取代眼科完整評估。必須分別遮蓋雙眼各測一次；雙眼同時測試無效。配戴眼鏡者應在戴鏡狀態下測試。6/18
        未通過者建議轉介眼科排除白內障、青光眼、糖尿病視網膜病變等。本視力卡須以原尺寸（100%）列印，否則通過標準失效。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="vis-actions">
      <button class="btn-view" @click="vis_showResults = !vis_showResults">
        {{ vis_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!vis_isComplete" @click="vis_copyOutput">
        {{ vis_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset-eye" @click="resetCurrentEye">
        重置{{ activeEye === "right" ? "右眼" : "左眼" }}
      </button>
      <button class="btn-reset" @click="resetAll">重置雙眼</button>
    </div>
    <p v-if="!vis_isComplete" class="progress-hint">
      {{ activeEye === "right" ? "右眼" : "左眼" }} 已記錄
      {{ answeredTotal }}/16 個回答
    </p>
    <p v-if="vis_isComplete && !bothDone" class="progress-hint eye-prompt">
      ✅
      {{
        activeEye === "right"
          ? "右眼已完成，請切換至左眼繼續記錄"
          : "左眼已完成，請切換至右眼繼續記錄"
      }}
    </p>
  </div>
  </div>
</template>

<style scoped>
.geriassess {
  max-width: 820px;
  margin: 0 auto;
}

/* Wrapper tab bar — single row, horizontal scroll, mouse-drag */
.geriassess > .tab-bar {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  background: var(--vp-c-bg-mute);
  padding: 4px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: var(--vp-c-text-3) transparent;
  cursor: grab;
  user-select: none;
}
.geriassess > .tab-bar:active { cursor: grabbing; }
.geriassess > .tab-bar::-webkit-scrollbar { height: 10px; }
.geriassess > .tab-bar::-webkit-scrollbar-thumb {
  background: var(--vp-c-text-3);
  border-radius: 5px;
  border: 2px solid var(--vp-c-bg-mute);
}
.geriassess > .tab-bar::-webkit-scrollbar-thumb:hover { background: var(--vp-c-text-2); }
.geriassess > .tab-bar::-webkit-scrollbar-track { background: transparent; }
.geriassess > .tab-bar .tab-btn {
  flex: 0 0 auto;
  min-width: 128px;
  white-space: nowrap;
  padding: 0.65rem 1rem;
  background: transparent;
  border: 1.5px solid transparent;
  cursor: pointer;
  font-family: inherit;
  color: var(--vp-c-text-3);
  border-radius: 8px;
  transition: all 0.2s;
}
.geriassess > .tab-bar .tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.geriassess > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}
.geriassess > .tab-bar .tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}
.geriassess > .tab-bar .tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}
.geriassess > .tab-bar .tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}
@media (max-width: 640px) {
  .geriassess > .tab-bar .tab-btn { padding: 0.5rem 0.65rem; min-width: 112px; }
  .geriassess > .tab-bar .tab-label { font-size: 0.9rem; }
  .geriassess > .tab-bar .tab-sub { font-size: 0.72rem; }
}

/* ══════════════ WHO ICOPE 功能篩查（Integrated Care for Older People）══════════════ */

.icope {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ─────────────────────────────────────────────────────── */
.icope .icope-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.icope .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.icope .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.icope .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.icope .badge-top {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.icope .badge-num {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.icope .badge-bot {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.icope .badge-pending {
  color: var(--vp-c-text-3);
}
.icope .badge-normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.icope .badge-moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.icope .badge-critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Groups ──────────────────────────────────────────────────────── */
.icope .nihss-group {
  margin-bottom: 1.5rem;
}
.icope .group-header-bar {
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
  border-left: 3px solid #22c55e;
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.04);
  margin-bottom: 0.6rem;
}
.icope .cog-bar {
  border-left: 3px solid #6366f1;
}
.icope .mob-bar {
  border-left: 3px solid #f97316;
}
.icope .nut-bar {
  border-left: 3px solid #22c55e;
}
.icope .vis-bar {
  border-left: 3px solid #06b6d4;
}
.icope .hear-bar {
  border-left: 3px solid #f59e0b;
}
.icope .dep-bar {
  border-left: 3px solid #e879f9;
}
.icope .med-bar {
  border-left: 3px solid #ef4444;
}
.icope .soc-bar {
  border-left: 3px solid #3b82f6;
}
.icope .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.icope .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.icope .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.icope .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  /* fixed geometry — prevents layout shift when text/border changes */
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.icope .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.icope .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.icope .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.icope .med-tally {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.icope .soc-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
  border-color: rgba(59, 130, 246, 0.25);
}
/* ── Item card ───────────────────────────────────────────────────── */
.icope .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.icope .icope-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.icope .icope-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.icope .icope-item.item-ok {
  border-color: #22c55e;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.icope .icope-item.item-abn {
  border-color: #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
}
.icope .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.icope .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.icope .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.icope .cog-q {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.icope .mob-q {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.icope .nut-q {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.icope .vis-q {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.icope .hear-q {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.icope .dep-q {
  color: #e879f9;
  background: rgba(232, 121, 249, 0.12);
}
.icope .med-q {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.icope .soc-q {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.icope .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.icope .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.icope .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.icope .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 44px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  padding: 0 8px;
  white-space: nowrap;
  border: 1px solid transparent;
  transition: all 0.25s;
}
.icope .val-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.icope .val-abn {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.icope .val-nd {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
/* ── Mobility illustration ───────────────────────────────────────── */
.icope .mob-illustration {
  padding: 1rem 1.25rem 0.75rem;
  background: linear-gradient(
    to bottom,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-bottom: 1px solid var(--vp-c-divider);
}
.icope .mob-illus-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.icope .mob-illus-badge {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(249, 115, 22, 0.08);
  border: 1px solid rgba(249, 115, 22, 0.3);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #f97316;
  margin-bottom: 0.25rem;
}
.icope .mob-illus-badge strong {
  font-weight: 800;
}
.icope .mob-illus-icon {
  font-size: 0.82rem;
}
.icope .mob-illus-svg {
  width: 100%;
  max-width: 500px;
  height: auto;
  display: block;
  border-radius: 8px;
}
.icope .mob-illus-caption {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  text-align: center;
  margin: 0;
  max-width: 480px;
  line-height: 1.65;
  letter-spacing: 0.01em;
}
/* ── Yes / No buttons ────────────────────────────────────────────── */
.icope .yn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.icope .btn-yn {
  padding: 0.6rem 0.5rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  text-align: center;
  transition: all 0.2s;
  border-radius: 6px;
}
.icope .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.icope .btn-yn-ok.yn-ok-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.icope .btn-yn-abn.yn-abn-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  color: #ef4444;
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
/* ── Abnormal notice ─────────────────────────────────────────────── */
.icope .abn-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
/* ── Result card ─────────────────────────────────────────────────── */
.icope .result-card {
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
.icope .res-normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.icope .res-abn {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.icope .res-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.icope .res-num {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.icope .rn-ok {
  color: #22c55e;
}
.icope .rn-abn {
  color: #ef4444;
}
.icope .res-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.icope .res-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.icope .res-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.icope .res-desc {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Review tools ────────────────────────────────────────────────── */
.icope .review-section {
  margin-bottom: 1rem;
}
.icope .review-top {
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.icope .review-title {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.icope .review-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.icope .review-list {
  border: 1px solid var(--vp-c-divider);
  border-radius: 0 0 10px 10px;
  overflow: hidden;
}
.icope .review-card {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  border-left: 3px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  align-items: flex-start;
}
.icope .review-card:last-child {
  border-bottom: none;
}
.icope .rc-left {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.icope .rc-domain {
  font-size: 0.78rem;
  font-weight: 800;
}
.icope .rc-tool {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.icope .rc-detail {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Care cards ──────────────────────────────────────────────────── */
.icope .care-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.icope .care-card {
  padding: 0.75rem 1rem;
  border-radius: 10px;
}
.icope .care-med {
  background: rgba(239, 68, 68, 0.05);
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.icope .care-soc {
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.icope .care-head {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.4rem;
}
.icope .care-list {
  margin: 0;
  padding-left: 1.2rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.9;
}
/* ── Results detail ──────────────────────────────────────────────── */
.icope .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.icope .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.icope .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.icope .detail-row:last-child {
  border-bottom: none;
}
.icope .detail-total {
  background: var(--vp-c-bg-mute);
}
.icope .detail-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 44px;
  padding-top: 1px;
}
.icope .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.icope .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.icope .detail-score.ds-abn {
  color: #ef4444;
}
.icope .detail-score.ds-ok {
  color: #22c55e;
}
.icope .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.icope .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.icope .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.icope .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.icope .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Actions ─────────────────────────────────────────────────────── */
.icope .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.icope .btn-view,
.icope .btn-copy,
.icope .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.icope .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.icope .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.icope .btn-view:active {
  transform: translateY(0);
}
.icope .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.icope .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.icope .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.icope .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.icope .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.icope .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.icope .icope-header {
    flex-direction: column;
  }
.icope .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.icope .badge-num {
    font-size: 1.4rem;
  }
.icope .result-card {
    flex-direction: column;
    gap: 0.75rem;
  }
.icope .btn-yn {
    padding: 0.5rem 0.3rem;
    font-size: 0.78rem;
  }
.icope .review-card {
    grid-template-columns: 1fr;
  }
.icope .mob-illus-badge {
    align-self: center;
  }
}
/* ── Sitting-to-standing SVG illustration styles ────────────────── */
.icope .sts-1 {
  fill: #010500;
}
.icope .sts-2 {
  fill: #157c3e;
}
.icope .sts-3,
.icope .sts-4 {
  fill: #167d3e;
}
.icope .sts-4 {
  fill-rule: evenodd;
}
.icope .sts-5 {
  fill: #071a01;
}
.icope .sts-6 {
  fill: #e7e7e9;
}
.icope .sts-7 {
  fill: #005626;
}
.icope .sts-8 {
  fill: #c6c7ca;
}
.icope .sts-9 {
  fill: #061901;
}
.icope .sts-10 {
  fill: #000300;
}
.icope .sts-11,
.icope .sts-12,
.icope .sts-13,
.icope .sts-14 {
  fill: none;
}
.icope .sts-12 {
  stroke: #167d3e;
  stroke-miterlimit: 8;
  stroke-width: 2px;
}
.icope .sts-13,
.icope .sts-14 {
  clip-rule: evenodd;
}
.icope .sts-14 {
  clip-path: url(#sts-clippath);
}
.icope .sts-15 {
  fill: #757f16;
}
.icope .sts-16 {
  fill: #051801;
}
.icope .sts-17 {
  fill: #f9f9f9;
}
.icope .sts-18 {
  clip-path: url(#sts-clippath-1);
}
.icope .sts-19 {
  fill: #d4de35;
}
.icope .sts-20 {
  fill: #cacbcd;
}
.icope .sts-21 {
  fill: #d1db34;
}
.icope .sts-22 {
  fill: #f1f1f1;
}
.icope .sts-23 {
  fill: #005526;
}
.icope .sts-24 {
  clip-path: url(#sts-clippath-3);
}
.icope .sts-25 {
  fill: #c9cacc;
}
.icope .sts-26 {
  fill: #081b01;
}
.icope .sts-27 {
  fill: #d2dc34;
}
.icope .sts-28 {
  fill: #157d3e;
}
.icope .sts-29 {
  fill: #cbccce;
}
.icope .sts-30 {
  fill: #221e1f;
}
.icope .sts-31 {
  fill: #929497;
}
.icope .sts-32 {
  clip-path: url(#sts-clippath-2);
}
.icope .sts-33 {
  fill: #081a01;
}
.icope .sts-34 {
  fill: #000200;
}
.icope .sts-35 {
  fill: #f8f8f8;
}
.icope .sts-36 {
  fill: #051800;
}
.icope .sts-37 {
  fill: #c8c9cb;
}
/* ══════════════ BHT・AD8 認知複評（Cognitive Assessment）══════════════ */

.cog {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ─────────────────────────────────────────────────────── */
.cog .cog-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.cog .header-title {
  flex: 1;
  min-width: 0;
}
.cog .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cog .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.cog .subtitle-hint {
  margin: 0.25rem 0 0;
}
.cog .hint-tag {
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
.cog .score-badge {
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
.cog .badge-ver {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.cog .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cog .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.cog .score-badge.filling {
  color: var(--vp-c-text-3);
}
.cog .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ────────────────────────────────────────────────── */
.cog .severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.cog .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cog .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cog .severity-fill.filling {
  background: var(--vp-c-divider);
}
.cog .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cog .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cog .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cog .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cog .severity-ticks-abs,
.cog .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cog .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.cog .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cog .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cog .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cog .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cog .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cog .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cog .tick-yellow {
  color: #f59e0b;
  font-weight: 700;
}
.cog .tick-orange {
  color: #f97316;
  font-weight: 700;
}
.cog .tick-green {
  color: #22c55e;
  font-weight: 700;
}
.cog .tick-red {
  color: #ef4444;
  font-weight: 700;
}
/* ── Alert ───────────────────────────────────────────────────────── */
.cog .cog-alert {
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
.cog .alert-mild {
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.cog .alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.cog .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.cog .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
/* ── ICOPE notice ────────────────────────────────────────────────── */
.cog .icope-notice {
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
.cog .notice-icon {
  flex-shrink: 0;
}
.cog .notice-sep {
  margin: 0 6px;
  color: var(--vp-c-text-3);
}
.cog .ad8-hint {
  color: #6366f1;
}
/* ── Groups ──────────────────────────────────────────────────────── */
.cog .nihss-group {
  margin-bottom: 1.5rem;
}
.cog .group-header-bar {
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
.cog .tab-bar {
  border-left: 3px solid #6366f1;
}
.cog .bht-bar {
  border-left: 3px solid #0ea5e9;
}
.cog .ad8-bar {
  border-left: 3px solid #a855f7;
}
.cog .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.cog .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cog .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.cog .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.cog .bht-tally {
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
}
.cog .ad8-tally {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
/* ── Tab toggle ──────────────────────────────────────────────────── */
.cog .tab-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.cog .tab-btn {
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
.cog .tab-btn.tab-active {
  border-color: #0ea5e9;
  background: rgba(14, 165, 233, 0.06);
}
.cog .tab-btn.tab-active-tds {
  border-color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.cog .tab-btn.tab-active-ad8 {
  border-color: #a855f7;
  background: rgba(168, 85, 247, 0.06);
}
.cog .tab-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cog .tab-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.cog .tab-btn.tab-active .tab-title {
  color: #0ea5e9;
}
.cog .tab-btn.tab-active-tds .tab-title {
  color: #14b8a6;
}
.cog .tab-btn.tab-active-ad8 .tab-title {
  color: #a855f7;
}
.cog .tds-title {
  color: var(--vp-c-text-1);
}
.cog .tab-btn.tab-active-tds .tds-title {
  color: #14b8a6;
}
.cog .ad8-title {
  color: var(--vp-c-text-1);
}
.cog .tab-btn.tab-active-ad8 .ad8-title {
  color: #a855f7;
}
/* ── Method note ─────────────────────────────────────────────────── */
.cog .method-note {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
}
.cog .note-bht {
  background: rgba(14, 165, 233, 0.04);
  border-color: rgba(14, 165, 233, 0.25);
}
.cog .note-ad8 {
  background: rgba(168, 85, 247, 0.04);
  border-color: rgba(168, 85, 247, 0.25);
}
/* ── AD8 family notice ───────────────────────────────────────────── */
.cog .ad8-family-notice {
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
.cog .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cog .cog-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cog .cog-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cog .cog-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.cog .cog-item.item_ok {
  border-color: #22c55e;
}
.cog .cog-item.item_err {
  border-color: #f97316;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.cog .cog-item.item_dk {
  border-color: var(--vp-c-divider);
}
.cog .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cog .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.cog .item-qnum {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  letter-spacing: 0.03em;
  white-space: nowrap;
}
.cog .bht-q {
  color: #0ea5e9;
  background: rgba(14, 165, 233, 0.12);
}
.cog .ad8-q {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.cog .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cog .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.cog .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cog .item-weight-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(14, 165, 233, 0.08);
  border: 1px solid rgba(14, 165, 233, 0.2);
}
.cog .weight-val {
  font-size: 0.8rem;
  font-weight: 800;
  color: #0ea5e9;
  line-height: 1;
}
.cog .weight-label {
  font-size: 0.55rem;
  color: #0ea5e9;
  opacity: 0.7;
}
.cog .item-score {
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
.cog .score-ok {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.cog .score-err {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.cog .score-nd {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
/* ── Yes / No buttons ────────────────────────────────────────────── */
.cog .yn-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.cog .yn-row-3 {
  grid-template-columns: 1fr 1fr 1fr;
}
.cog .btn-yn {
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
.cog .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cog .btn-yn-ok.yn-ok-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cog .btn-yn-abn.yn-abn-active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cog .btn-yn-dk.yn-dk-active {
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
.cog .count-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
  flex-wrap: wrap;
  border-top: 1px solid var(--vp-c-divider);
}
.cog .count-label {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}
.cog .count-btns {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.cog .count-btn {
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
.cog .count-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cog .count-btn.count-active.count-ok {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  color: #22c55e;
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cog .count-btn.count-active.count-err {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  color: #f97316;
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cog .count-score-hint {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.cog .count-input {
  width: 72px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 700;
  font-family: inherit;
  outline: none;
  text-align: center;
  transition: border-color 0.2s;
}
.cog .count-input:focus {
  border-color: var(--vp-c-brand-1);
}
/* ── Result card — FIXED: stationary size ───────────────────────── */
.cog .cog-result {
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
.cog .cog-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .cog-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .cog-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .cog-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cog .result-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-shrink: 0;
  min-width: 130px;
}
.cog .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cog .cog-result.normal .result-number {
  color: #22c55e;
}
.cog .cog-result.mild .result-number {
  color: #f59e0b;
}
.cog .cog-result.moderate .result-number {
  color: #f97316;
}
.cog .cog-result.critical .result-number {
  color: #ef4444;
}
.cog .result-max {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.cog .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 64px;
}
.cog .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cog .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cog .result-calc {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
/* ── Results detail ──────────────────────────────────────────────── */
.cog .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.cog .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cog .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cog .detail-row:last-child {
  border-bottom: none;
}
.cog .detail-total {
  background: var(--vp-c-bg-mute);
}
.cog .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
  padding-top: 1px;
}
.cog .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.cog .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.cog .detail-score.ds-abn {
  color: #f97316;
}
.cog .detail-score.ds-ok {
  color: #22c55e;
}
.cog .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.cog .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.cog .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.cog .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.cog .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Warning box ─────────────────────────────────────────────────── */
.cog .warn-box {
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
.cog .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
/* ── TDS ──────────────────────────────────────────────────────────── */
.cog .tds-bar {
  border-left: 3px solid #14b8a6;
}
.cog .tds-tally {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.cog .tds-person {
  padding: 0.7rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cog .tds-person-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.cog .tds-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  white-space: nowrap;
}
.cog .tds-label-gender {
  margin-left: 0.5rem;
}
.cog .tds-input {
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  font-size: 0.82rem;
  font-family: inherit;
  color: var(--vp-c-text-1);
  outline: none;
  transition: border-color 0.2s;
  width: 160px;
}
.cog .tds-input:focus {
  border-color: #14b8a6;
}
.cog .tds-input-sm {
  width: 100px;
}
.cog .tds-input-xs {
  width: 60px;
}
.cog .tds-input-num {
  width: 80px;
}
.cog .tds-sep {
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}
.cog .tds-gender-btn {
  padding: 3px 14px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cog .tds-gender-btn.active {
  border-color: #14b8a6;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.08);
}
.cog .tds-chk-list {
  padding: 0.6rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cog .tds-chk {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-1);
  cursor: pointer;
  flex-wrap: wrap;
}
.cog .tds-chk input[type="checkbox"] {
  accent-color: #14b8a6;
}
.cog .tds-rf-grid {
  padding: 0.6rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cog .tds-rf-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.cog .tds-rf-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.cog .tds-sub-chk {
  margin-left: 1.5rem;
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
}
.cog .tds-sub-chk label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.cog .tds-rsrc-btn {
  padding: 2px 10px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cog .tds-rsrc-btn.active {
  border-color: #14b8a6;
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.08);
}
.cog .note-tds {
  background: rgba(20, 184, 166, 0.04);
  border-color: rgba(20, 184, 166, 0.25);
}
/* ── Actions ─────────────────────────────────────────────────────── */
.cog .ens-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cog .btn-view,
.cog .btn-copy,
.cog .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cog .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cog .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cog .btn-view:active {
  transform: translateY(0);
}
.cog .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cog .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cog .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cog .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cog .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cog .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.cog .cog-header {
    flex-wrap: wrap;
  }
.cog .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.cog .score-number {
    font-size: 1.5rem;
  }
.cog .cog-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.cog .tab-toggle {
    flex-direction: column;
  }
.cog .yn-row-3 {
    grid-template-columns: 1fr;
  }
}
/* ══════════════ SPPB 行動功能（Short Physical Performance Battery）══════════════ */

.sppb {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ─────────────────────────────────────────────────────── */
.sppb .sppb-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.sppb .header-title {
  flex: 1;
  min-width: 0;
}
.sppb .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.sppb .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.sppb .subtitle-hint {
  margin: 0.25rem 0 0;
}
.sppb .hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.sppb .hint-tag--active {
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
}
.sppb .hint-tag--inactive {
  background: rgba(249, 115, 22, 0.07);
  color: #c2410c;
}
/* ── Badge ───────────────────────────────────────────────────────── */
.sppb .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 0.75rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .badge-top {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.sppb .score-number {
  font-size: 1.9rem;
  font-weight: 800;
  line-height: 1;
}
.sppb .score-bot {
  font-size: 0.55rem;
  font-weight: 600;
  margin-top: 2px;
}
.sppb .score-badge.filling {
  color: var(--vp-c-text-3);
}
.sppb .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Score overview ──────────────────────────────────────────────── */
.sppb .score-overview {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.sppb .so-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  flex: 1;
  min-width: 60px;
  max-width: 100px;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.sppb .so-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}
.sppb .so-total {
  max-width: 120px;
}
.sppb .so-nd {
  opacity: 0.45;
}
.sppb .so-ok {
  border-color: #22c55e;
}
.sppb .so-mid {
  border-color: #f59e0b;
}
.sppb .so-abn {
  border-color: #ef4444;
}
.sppb .so-icon {
  font-size: 0.9rem;
}
.sppb .so-label {
  font-size: 0.55rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.sppb .so-val {
  font-size: 1.3rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.sppb .so-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.sppb .so-ok .so-val {
  color: #22c55e;
}
.sppb .so-mid .so-val {
  color: #f59e0b;
}
.sppb .so-abn .so-val {
  color: #ef4444;
}
.sppb .score-badge.normal .so-val {
  color: #22c55e;
}
.sppb .score-badge.critical .so-val {
  color: #ef4444;
}
.sppb .so-plus {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Groups ──────────────────────────────────────────────────────── */
.sppb .nihss-group {
  margin-bottom: 1.5rem;
}
.sppb .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #f97316;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .bal-bar {
  border-left: 3px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.sppb .gait-bar {
  border-left: 3px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.sppb .chair-bar {
  border-left: 3px solid #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.sppb .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.sppb .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sppb .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.sppb .group-score-tally {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 56px;
  text-align: center;
  border: 1px solid transparent;
}
.sppb .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.sppb .tally-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.25);
}
.sppb .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.sppb .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
/* ── Balance instruction ─────────────────────────────────────────── */
.sppb .balance-instruction {
  display: flex;
  gap: 0.5rem;
  padding: 0.55rem 0.9rem;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.05);
  border: 1px solid rgba(249, 115, 22, 0.2);
  border-left: 3px solid #ef4444;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 0.6rem;
}
.sppb .bi-icon {
  flex-shrink: 0;
}
/* ── Balance rules · Stance illustration cards (balance 3-col) ── */
.sppb .stance-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}
.sppb .stance-card {
  display: flex;
  flex-direction: column;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.25s;
}
.sppb .sc-pass {
  border-color: #22c55e;
}
.sppb .sc-mid {
  border-color: #f59e0b;
}
.sppb .sc-fail {
  border-color: #ef4444;
}
.sppb .sc-disabled {
  opacity: 0.45;
  pointer-events: none;
}
.sppb .sc-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.5rem 0.7rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.sppb .sc-header-a {
  background: rgba(249, 115, 22, 0.07);
}
.sppb .sc-header-b {
  background: rgba(59, 130, 246, 0.07);
}
.sppb .sc-header-c {
  background: rgba(168, 85, 247, 0.07);
}
.sppb .sc-label {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sppb .sc-en {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.sppb .sc-badge {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 1px 7px;
  border-radius: 999px;
  align-self: flex-start;
  margin-top: 2px;
  border: 1px solid transparent;
}
.sppb .sb-pass {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.3);
}
.sppb .sb-mid {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
}
.sppb .sb-fail {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
}
.sppb .sb-skip {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider);
}
.sppb .sb-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-color: var(--vp-c-divider);
}
.sppb .sc-illus {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 1.25rem 0.75rem;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  min-height: 110px;
  border-bottom: 1px solid var(--vp-c-divider);
}
.sppb .sc-illus :deep(svg) {
  width: auto;
  height: 90px;
  max-width: 80px;
}
.sppb .sc-rule {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 0.4rem 0.7rem 0.1rem;
  line-height: 1.5;
}
.sppb .sc-scores {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.7rem 0.4rem;
}
.sppb .sc-s {
  font-size: 0.65rem;
  font-weight: 700;
  font-family: monospace;
  padding: 1px 6px;
  border-radius: 4px;
}
.sppb .sc-s-ok {
  color: #16a34a;
  background: rgba(34, 197, 94, 0.08);
}
.sppb .sc-s-mid {
  color: #d97706;
  background: rgba(245, 158, 11, 0.08);
}
.sppb .sc-s-fail {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.08);
}
.sppb .sc-input-area {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.7rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: auto;
}
.sppb .sc-input-area .time-input {
  flex: 1;
  min-width: 0;
  padding: 0.35rem 0.5rem;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  font-weight: 700;
  font-family: monospace;
  outline: none;
  transition: border-color 0.15s;
}
.sppb .sc-input-area .time-input:focus {
  border-color: #f97316;
}
.sppb .sc-input-area .time-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
  font-size: 0.8rem;
}
.sppb .sc-input-area .time-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sppb .sc-skip-notice {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  text-align: center;
  padding: 0.25rem 0.5rem 0.4rem;
  font-style: italic;
  box-sizing: border-box;
  min-height: 34px;
}

@media (max-width: 640px) {
.sppb .stance-grid {
    grid-template-columns: 1fr;
  }
.sppb .sc-illus {
    min-height: 80px;
  }
.sppb .sc-illus :deep(svg) {
    height: 70px;
  }
}
/* ── Time card ───────────────────────────────────────────────────── */
.sppb .time-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.sppb .tc-pass {
  border-color: #22c55e;
}
.sppb .tc-mid {
  border-color: #f59e0b;
}
.sppb .tc-fail {
  border-color: #ef4444;
}
.sppb .tc-disabled {
  opacity: 0.45;
  pointer-events: none;
}
.sppb .item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 0.65rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.5rem;
}
.sppb .item-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sppb .item-score {
  font-size: 0.78rem;
  font-weight: 800;
}
.sppb .val-ok {
  color: #22c55e;
}
.sppb .val-mid {
  color: #f59e0b;
}
.sppb .val-abn {
  color: #ef4444;
}
.sppb .val-nd {
  color: var(--vp-c-text-3);
}
.sppb .val-skip {
  color: var(--vp-c-text-3);
  font-style: italic;
}
.sppb .tc-input-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.65rem;
  flex-wrap: wrap;
}
.sppb .time-input {
  flex: 1;
  min-width: 0;
  padding: 0.4rem 0.5rem;
  border-radius: 7px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  font-weight: 700;
  font-family: monospace;
  transition: border-color 0.15s;
  outline: none;
}
.sppb .time-input:focus {
  border-color: #3b82f6;
}
.sppb .time-input:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sppb .time-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
  font-size: 0.8rem;
}
.sppb .tc-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
  flex-shrink: 0;
}
.sppb .tc-threshold {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  font-family: monospace;
}
.sppb .cannot-btn {
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-3);
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}
.sppb .cannot-btn:hover {
  border-color: #ef4444;
  color: #ef4444;
}
.sppb .cannot-btn.cannot-active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
/* ── Dist toggle ─────────────────────────────────────────────────── */
.sppb .dist-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}
.sppb .dist-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.sppb .dist-btn.dist-active {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.sppb .dist-btn.dist-active-3 {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.sppb .dist-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sppb .dist-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.sppb .dist-btn.dist-active .dist-title {
  color: #3b82f6;
}
.sppb .dist-btn.dist-active-3 .dist-title {
  color: #f59e0b;
}
/* ── Scoring table ───────────────────────────────────────────────── */
.sppb .scoring-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 0.6rem;
}
.sppb .st-header {
  display: grid;
  grid-template-columns: 48px 1fr 80px;
  gap: 0.5rem;
  padding: 0.35rem 0.75rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.sppb .st-row {
  display: grid;
  grid-template-columns: 48px 1fr 80px;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.78rem;
  transition: background 0.2s;
}
.sppb .st-row:last-child {
  border-bottom: none;
}
.sppb .st-row.st-active {
  background: rgba(34, 197, 94, 0.08);
  border-left: 3px solid #22c55e;
}
.sppb .st-row.st-active:last-child {
  background: rgba(239, 68, 68, 0.08);
  border-left-color: #ef4444;
}
.sppb .st-score {
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.sppb .st-time {
  font-family: monospace;
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.sppb .st-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
/* ── Notes ───────────────────────────────────────────────────────── */
.sppb .gait-note,
.sppb .chair-note {
  display: flex;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.18);
  font-size: 0.73rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 0.6rem;
}
.sppb .chair-note {
  background: rgba(168, 85, 247, 0.05);
  border-color: rgba(168, 85, 247, 0.18);
}
.sppb .gn-icon {
  flex-shrink: 0;
}
/* ── Results detail ──────────────────────────────────────────────── */
.sppb .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.sppb .results-header {
  padding: 0.45rem 0.85rem;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.sppb .detail-section {
  border-bottom: 2px solid var(--vp-c-divider);
}
.sppb .detail-section:last-child {
  border-bottom: none;
}
.sppb .ds-head {
  padding: 0.35rem 0.85rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.sppb .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.85rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.sppb .detail-row:last-child {
  border-bottom: none;
}
.sppb .detail-skip {
  opacity: 0.5;
}
.sppb .detail-sub-total {
  background: var(--vp-c-bg-soft);
}
.sppb .detail-grand-total {
  background: var(--vp-c-bg-mute);
}
.sppb .detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 34px;
  color: var(--vp-c-brand-1);
}
.sppb .dq-grand {
  font-size: 0.6rem;
}
.sppb .detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.sppb .detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 72px;
  text-align: right;
}
.sppb .ds-ok {
  color: #22c55e;
}
.sppb .ds-mid {
  color: #f59e0b;
}
.sppb .ds-abn {
  color: #ef4444;
}
.sppb .ds-skip {
  color: var(--vp-c-text-3);
}
.sppb .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.sppb .detail-score-grand {
  color: var(--vp-c-brand-1);
  font-size: 1rem;
}
.sppb .detail-desc {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  min-width: 80px;
}
.sppb .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 100px;
  flex-shrink: 0;
}
.sppb .detail-desc-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
}
.sppb .detail-desc-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}
/* ── Result card ─────────────────────────────────────────────────── */
.sppb .sppb-result {
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
  min-height: 96px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .sppb-result.filling {
  border-color: var(--vp-c-divider);
}
.sppb .sppb-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .sppb-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sppb .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.sppb .result-score {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
  min-width: 3ch;
  text-align: right;
}
.sppb .sppb-result.normal .result-score {
  color: #22c55e;
}
.sppb .sppb-result.critical .result-score {
  color: #ef4444;
}
.sppb .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.sppb .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.sppb .result-ver {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.sppb .result-level {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.sppb .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.sppb .result-action {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  padding: 0.45rem 0.65rem;
  border-radius: 7px;
  background: var(--vp-c-bg-mute);
  border-left: 3px solid var(--vp-c-brand-1);
}
/* ── Warn / Actions ──────────────────────────────────────────────── */
.sppb .warn-box {
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
.sppb .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.sppb .sppb-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.sppb .btn-view,
.sppb .btn-copy,
.sppb .btn-reset {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.sppb .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.sppb .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.sppb .btn-view:active {
  transform: translateY(0);
}
.sppb .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sppb .btn-copy {
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.sppb .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.sppb .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.sppb .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.sppb .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.sppb .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
/* ── Responsive ── */
@media (max-width: 640px) {
  .sppb-header {
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
  .balance-inputs {
    grid-template-columns: 1fr;
  }
  .sppb-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .dist-toggle {
    flex-wrap: wrap;
  }
  .score-overview {
    gap: 0.2rem;
  }
  .so-plus {
    font-size: 0.85rem;
  }
}
/* ── STS illustration ────────────────────────────────────────────── */
.sppb .sts-illus-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem 0.5rem;
  background: linear-gradient(
    to bottom,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-bottom: 1px solid var(--vp-c-divider);
  margin-bottom: 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
}
.sppb .sts-illus-badge {
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.3);
  border-radius: 999px;
  padding: 3px 12px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #a855f7;
}
.sppb .sts-illus-badge strong {
  font-weight: 800;
}
.sppb .sts-illus-caption {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  text-align: center;
  margin: 0;
  max-width: 480px;
  line-height: 1.65;
}
.sppb .sts-svg-wrap :deep(svg) {
  width: 100%;
  max-width: 500px;
  height: auto;
  display: block;
  border-radius: 8px;
}
/* ── Gait track illustration ─────────────────────────────────────── */
.sppb .gait-illus-wrap {
  padding: 0.5rem 0;
  margin-bottom: 0.6rem;
}
.sppb .gait-svg-wrap :deep(svg) {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  padding: 0.4rem;
  box-sizing: border-box;
}
/* ══════════════ MNA-SF 營養複評（Mini Nutritional Assessment）══════════════ */

.mna {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ─────────────────────────────────────────────────────── */
.mna .mna-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.mna .header-title {
  flex: 1;
  min-width: 0;
}
.mna .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.mna .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.mna .subtitle-hint {
  margin: 0.25rem 0 0;
}
.mna .hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}
.mna .hint-tag--active {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}
.mna .hint-tag--inactive {
  background: rgba(34, 197, 94, 0.08);
  color: #166534;
}
/* ── Score badge ─────────────────────────────────────────────────── */
.mna .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .badge-ver {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.mna .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.mna .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.mna .score-badge.filling {
  color: var(--vp-c-text-3);
}
.mna .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ────────────────────────────────────────────────── */
.mna .severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.mna .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.mna .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.mna .severity-fill.filling {
  background: var(--vp-c-divider);
}
.mna .severity-fill.normal {
  background: #22c55e;
}
.mna .severity-fill.mild {
  background: #f59e0b;
}
.mna .severity-fill.critical {
  background: #ef4444;
}
.mna .severity-ticks-abs,
.mna .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.mna .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.mna .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mna .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mna .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mna .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mna .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mna .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mna .tick-yellow {
  color: #f59e0b;
  font-weight: 700;
}
.mna .tick-red {
  color: #ef4444;
  font-weight: 700;
}
.mna .tick-green {
  color: #22c55e;
  font-weight: 700;
}
/* ── Alert ───────────────────────────────────────────────────────── */
.mna .mna-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.mna .alert-mild {
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.35);
}
.mna .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.mna .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
/* ── ICOPE notice ────────────────────────────────────────────────── */
.mna .icope-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-left: 3px solid #10b981;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.mna .notice-icon {
  flex-shrink: 0;
}
.mna .notice-sep {
  margin: 0 6px;
  color: var(--vp-c-text-3);
}
.mna .cross-hint {
  color: #22c55e;
}
/* ── Groups ──────────────────────────────────────────────────────── */
.mna .nihss-group {
  margin-bottom: 1.5rem;
}
.mna .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0d9488;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .q-bar-a {
  border-left: 3px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.mna .q-bar-b {
  border-left: 3px solid #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.mna .q-bar-c {
  border-left: 3px solid #a855f7;
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.mna .q-bar-d {
  border-left: 3px solid #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.mna .q-bar-e {
  border-left: 3px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.mna .q-bar-f {
  border-left: 3px solid #22c55e;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.mna .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.mna .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mna .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.mna .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  /* fixed geometry — prevents layout shift when text/border changes */
  min-width: 56px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.mna .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.mna .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.mna .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
/* ── F toggle ────────────────────────────────────────────────────── */
.mna .f-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.mna .tab-btn {
  flex: 1;
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.mna .tab-btn.tab-active-f {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.mna .tab-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.mna .tab-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.mna .tab-btn.tab-active-f .tab-title {
  color: #22c55e;
}
/* ── Item cards ──────────────────────────────────────────────────── */
.mna .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mna .mna-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.mna .mna-item.item-ok {
  border-color: #22c55e;
}
.mna .mna-item.item-err {
  border-color: #ef4444;
}
.mna .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.mna .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.mna .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.mna .q-a {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.mna .q-b {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.mna .q-c {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.mna .q-d {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.mna .q-e {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.mna .q-f {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.mna .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.mna .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.mna .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.mna .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
  white-space: nowrap;
}
.mna .val-ok {
  color: #22c55e;
}
.mna .val-abn {
  color: #ef4444;
}
.mna .val-nd {
  color: var(--vp-c-text-3);
}
/* ── Option pills (ENS6Q style) ──────────────────────────────────── */
.mna .option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.mna .cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.mna .cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.mna .cols-4 {
  grid-template-columns: repeat(4, 1fr);
}
.mna .opt-btn {
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
  line-height: 1.3;
}
.mna .opt-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.mna .opt-label {
  font-size: 0.78rem;
  font-weight: 600;
}
.mna .opt-score {
  font-size: 0.65rem;
  font-weight: 700;
}
/* Score-specific colors — m0 through m3 */
.mna .opt-btn.m0 {
  border-color: rgba(239, 68, 68, 0.15);
}
.mna .opt-btn.m0:hover:not(.opt-active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.mna .opt-btn.m0.opt-active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 16%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.mna .opt-btn.m0 .opt-score {
  color: rgba(239, 68, 68, 0.5);
}
.mna .opt-btn.m0.opt-active .opt-score {
  color: rgba(239, 68, 68, 0.7);
}
.mna .opt-btn.m1 {
  border-color: rgba(249, 115, 22, 0.15);
}
.mna .opt-btn.m1:hover:not(.opt-active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.mna .opt-btn.m1.opt-active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 16%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.mna .opt-btn.m1 .opt-score {
  color: rgba(249, 115, 22, 0.5);
}
.mna .opt-btn.m1.opt-active .opt-score {
  color: rgba(249, 115, 22, 0.7);
}
.mna .opt-btn.m2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.mna .opt-btn.m2:hover:not(.opt-active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.mna .opt-btn.m2.opt-active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 16%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.mna .opt-btn.m2 .opt-score {
  color: rgba(245, 158, 11, 0.5);
}
.mna .opt-btn.m2.opt-active .opt-score {
  color: rgba(245, 158, 11, 0.7);
}
.mna .opt-btn.m3 {
  border-color: rgba(34, 197, 94, 0.15);
}
.mna .opt-btn.m3:hover:not(.opt-active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.mna .opt-btn.m3.opt-active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 16%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.mna .opt-btn.m3 .opt-score {
  color: rgba(34, 197, 94, 0.5);
}
.mna .opt-btn.m3.opt-active .opt-score {
  color: rgba(34, 197, 94, 0.7);
}
/* Active state color for label text */
.mna .opt-btn.opt-active .opt-label {
  font-weight: 700;
}
.mna .opt-btn.opt-active {
  font-weight: 700;
}
/* ── F2 note ─────────────────────────────────────────────────────── */
.mna .f2-note {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.4rem;
  border-left: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.04);
  border-radius: 0 6px 6px 0;
}
/* ── Sub-score row ───────────────────────────────────────────────── */
.mna .sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.mna .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.6rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 52px;
  flex: 1;
  max-width: 80px;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mna .sub-score-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}
.mna .ss-ok {
  border-color: #22c55e;
}
.mna .ss-abn {
  border-color: #ef4444;
}
.mna .ss-nd {
  border-color: var(--vp-c-divider);
  opacity: 0.55;
}
.mna .ss-total {
  max-width: 100px;
}
.mna .sub-score-card.normal {
  border-color: #22c55e;
}
.mna .sub-score-card.mild {
  border-color: #f59e0b;
}
.mna .sub-score-card.critical {
  border-color: #ef4444;
}
.mna .ss-label {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.mna .ss-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.mna .ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.mna .ss-ok .ss-val {
  color: #22c55e;
}
.mna .ss-abn .ss-val {
  color: #ef4444;
}
.mna .sub-score-card.normal .ss-val {
  color: #22c55e;
}
.mna .sub-score-card.mild .ss-val {
  color: #f59e0b;
}
.mna .sub-score-card.critical .ss-val {
  color: #ef4444;
}
.mna .ss-plus {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
/* ── Result card ─────────────────────────────────────────────────── */
.mna .mna-result {
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
.mna .mna-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .mna-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .mna-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.mna .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.mna .mna-result.normal .result-number {
  color: #22c55e;
}
.mna .mna-result.mild .result-number {
  color: #f59e0b;
}
.mna .mna-result.critical .result-number {
  color: #ef4444;
}
.mna .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.mna .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mna .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.mna .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mna .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Results detail ──────────────────────────────────────────────── */
.mna .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.mna .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mna .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mna .detail-row:last-child {
  border-bottom: none;
}
.mna .detail-total {
  background: var(--vp-c-bg-mute);
}
.mna .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #22c55e;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
}
.mna .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.mna .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.mna .ds-ok {
  color: #22c55e;
}
.mna .ds-abn {
  color: #ef4444;
}
.mna .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.mna .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
}
.mna .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.mna .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.mna .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Warn box ────────────────────────────────────────────────────── */
.mna .warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.25);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.mna .warn-icon {
  color: #22c55e;
  flex-shrink: 0;
}
/* ── Actions ─────────────────────────────────────────────────────── */
.mna .mna-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.mna .btn-view,
.mna .btn-copy,
.mna .btn-reset {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.mna .btn-view {
  border: none;
  color: #fff;
  background: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.mna .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.mna .btn-view:active {
  transform: translateY(0);
}
.mna .btn-copy {
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.mna .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
  color: #fff;
}
.mna .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.mna .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.mna .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.mna .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.mna .mna-header {
    flex-direction: column;
  }
.mna .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.mna .score-number {
    font-size: 1.5rem;
  }
.mna .mna-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.mna .f-toggle {
    flex-direction: column;
  }
.mna .sub-score-row {
    gap: 0.2rem;
  }
.mna .ss-plus {
    font-size: 0.85rem;
  }
.mna .hint-tag {
    white-space: normal;
  }
.mna .option-row {
    flex-wrap: wrap;
  }
.mna .opt-btn {
    min-width: 45%;
  }
}
/* ══════════════ GDS 老年抑鬱（Geriatric Depression Scale）══════════════ */

.gds {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.gds .gds-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.gds .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.gds .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0 0 0.3rem;
}
/* ── ICOPE hint pill ────────────────────────────────────────────── */
.gds .subtitle-hint {
  margin: 0.25rem 0 0;
}
.gds .hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}
/* Active — ICOPE dep screen positive: matches SPPB orange style */
.gds .hint-tag--active {
  background: rgba(232, 121, 249, 0.12);
  color: #a21caf;
}
/* Inactive — always visible as a passive guide */
.gds .hint-tag--inactive {
  background: rgba(249, 115, 22, 0.08);
  color: #c2410c;
}
.gds .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 84px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .badge-ver {
  font-size: 0.62rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 1px;
}
.gds .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}
.gds .score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.gds .score-badge.filling {
  color: var(--vp-c-text-3);
}
.gds .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.gds .severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.gds .severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.gds .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.gds .severity-fill.filling {
  background: var(--vp-c-divider);
}
.gds .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.gds .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.gds .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.gds .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.gds .severity-ticks-abs,
.gds .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.gds .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.gds .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.gds .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.gds .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.gds .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.gds .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.gds .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.gds .tick-yellow {
  color: #f59e0b;
  font-weight: 700;
}
.gds .tick-orange {
  color: #f97316;
  font-weight: 700;
}
.gds .tick-red {
  color: #ef4444;
  font-weight: 700;
}
/* ── Alert ─────────────────────────────────────────────────────── */
.gds .gds-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.gds .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
/* ── Groups ────────────────────────────────────────────────────── */
.gds .nihss-group {
  margin-bottom: 1.5rem;
}
.gds .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem 0.55rem 1.2rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f59e0b;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.gds .tab-bar {
  border-left: 4px solid #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.gds .gds-bar {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.gds .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.gds .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.gds .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.gds .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.gds .gds-tally {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
/* ── Tab toggle ────────────────────────────────────────────────── */
.gds .tab-toggle {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}
.gds .tab-btn {
  flex: 1;
  min-width: 100px;
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
.gds .tab-btn.tab-active {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.gds .tab-title {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.gds .tab-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.gds .tab-btn.tab-active .tab-title {
  color: #6366f1;
}
.gds .tab-btn.tab-active .tab-sub {
  color: rgba(99, 102, 241, 0.6);
}
/* ── Method note ───────────────────────────────────────────────── */
.gds .method-note {
  padding: 0.6rem 0.9rem;
  border-radius: 8px;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
}
.gds .note-4 {
  background: rgba(99, 102, 241, 0.04);
  border-color: rgba(99, 102, 241, 0.2);
}
.gds .note-15 {
  background: rgba(59, 130, 246, 0.04);
  border-color: rgba(59, 130, 246, 0.2);
}
.gds .note-30 {
  background: rgba(20, 184, 166, 0.04);
  border-color: rgba(20, 184, 166, 0.2);
}
/* ── Item list ─────────────────────────────────────────────────── */
.gds .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gds .gds-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.gds .gds-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.gds .gds-item.item-healthy {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 8%, var(--vp-c-bg));
}
.gds .gds-item.item-healthy .item-header {
  background: transparent;
}
.gds .gds-item.item-depressive {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 8%, var(--vp-c-bg));
}
.gds .gds-item.item-depressive .item-header {
  background: transparent;
}
.gds .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.gds .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.gds .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
}
.gds .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.gds .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.gds .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.gds .item-score {
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
.gds .item-score.depressive {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.06);
}
.gds .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.gds .item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
/* ── Yes / No buttons ──────────────────────────────────────────── */
.gds .yn-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
/* GDS yn-btn styling comes from the global .yn-btn / .yn-btn.yn-green /
   .yn-btn.yn-red rules in custom.css — no scoped override here, so the
   green/red option-box fill shows through. */
/* ── Result card ───────────────────────────────────────────────── */
.gds .gds-result {
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
.gds .gds-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .gds-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .gds-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .gds-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.gds .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.gds .gds-result.normal .result-number {
  color: #22c55e;
}
.gds .gds-result.mild .result-number {
  color: #f59e0b;
}
.gds .gds-result.moderate .result-number {
  color: #f97316;
}
.gds .gds-result.critical .result-number {
  color: #ef4444;
}
.gds .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.gds .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.gds .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.gds .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.gds .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Results detail ────────────────────────────────────────────── */
.gds .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.gds .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.gds .detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.gds .detail-row:last-child {
  border-bottom: none;
}
.gds .detail-total {
  background: var(--vp-c-bg-mute);
}
.gds .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #3b82f6;
  flex-shrink: 0;
  width: 32px;
  padding-top: 1px;
}
.gds .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
  line-height: 1.5;
}
.gds .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  white-space: normal;
}
.gds .detail-score.depressive {
  color: #ef4444;
}
.gds .detail-score.zero {
  color: #22c55e;
}
.gds .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.gds .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
  text-align: left;
  white-space: normal;
}
.gds .detail-desc-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  width: 80px;
  flex-shrink: 0;
}
.gds .detail-desc-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.gds .detail-desc-label {
  font-size: 0.73rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  white-space: normal;
}
/* ── Warning box ───────────────────────────────────────────────── */
.gds .warn-box {
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
.gds .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
/* ── Actions ───────────────────────────────────────────────────── */
.gds .gds-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.gds .btn-view,
.gds .btn-copy,
.gds .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.gds .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.gds .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.gds .btn-view:active {
  transform: translateY(0);
}
.gds .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.gds .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.gds .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.gds .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.gds .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.gds .gds-header {
    flex-direction: column;
  }
.gds .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.gds .score-number {
    font-size: 1.5rem;
  }
.gds .gds-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.gds .tab-toggle {
    flex-direction: column;
  }
.gds .hint-tag {
    white-space: normal;
  }
}
/* ══════════════ WHO 近距離視力（Near Vision Test）══════════════ */

.vis {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ──────────────────────────────────────────────────── */
.vis .vis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: nowrap;
}
.vis .header-title {
  flex: 1;
  min-width: 0;
}
.vis .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.vis .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.vis .subtitle-2 {
  margin: 0.25rem 0 0;
}
.vis .hint-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
}
.vis .hint-vis {
  background: rgba(6, 182, 212, 0.12);
  color: #0e7490;
}
/* ── Score badge ─────────────────────────────────────────────── */
.vis .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 96px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.vis .badge-top {
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-align: center;
  white-space: nowrap;
}
.vis .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  min-width: 2ch;
  text-align: center;
}
.vis .score-unit {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 1px;
  min-width: 2ch;
  transition: opacity 0.2s;
}
.vis .score-bot {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.vis .score-badge.filling {
  color: var(--vp-c-text-3);
}
.vis .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
}
.vis .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
}
.vis .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
}
.vis .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
}
/* ── Both-eye summary strip ──────────────────────────────────── */
.vis .eye-strip {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.vis .eye-strip-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.65rem 0.5rem;
  border-radius: 10px;
  cursor: pointer;
  text-align: center;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.2s;
}
.vis .eye-strip-card:hover {
  border-color: var(--vp-c-brand-1);
}
.vis .eye-strip-card.eye-active {
  box-shadow: 0 0 0 3px rgba(6, 182, 212, 0.22);
  border-color: #06b6d4;
}
.vis .eye-strip-card.eye-nd {
  border-color: var(--vp-c-divider);
}
.vis .eye-strip-card.normal {
  border-color: #22c55e;
}
.vis .eye-strip-card.mild {
  border-color: #f59e0b;
}
.vis .eye-strip-card.moderate {
  border-color: #f97316;
}
.vis .eye-strip-card.critical {
  border-color: #ef4444;
}
.vis .esc-label {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
}
.vis .esc-val {
  font-size: 1.7rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.vis .eye-strip-card.normal .esc-val {
  color: #22c55e;
}
.vis .eye-strip-card.mild .esc-val {
  color: #f59e0b;
}
.vis .eye-strip-card.moderate .esc-val {
  color: #f97316;
}
.vis .eye-strip-card.critical .esc-val {
  color: #ef4444;
}
.vis .esc-sub {
  font-size: 0.58rem;
  color: var(--vp-c-text-3);
}
.vis .esc-status {
  font-size: 0.64rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
/* ── Eye tab row ─────────────────────────────────────────────── */
.vis .eye-tab-row {
  display: flex;
  gap: 0.5rem;
}
.vis .eye-tab {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
  text-align: left;
}
.vis .eye-tab:hover {
  border-color: var(--vp-c-brand-1);
}
.vis .eye-tab.eye-tab-r {
  border-color: #06b6d4;
  background: rgba(6, 182, 212, 0.06);
}
.vis .eye-tab.eye-tab-l {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.vis .et-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}
.vis .et-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.vis .et-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vis .et-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.vis .eye-tab.eye-tab-r .et-title {
  color: #0e7490;
}
.vis .eye-tab.eye-tab-l .et-title {
  color: #7c3aed;
}
.vis .et-score {
  font-size: 0.85rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.vis .ets-pass {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.vis .ets-fail {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.vis .ets-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
}
/* ── Severity bar ────────────────────────────────────────────── */
.vis .severity-bar-wrap {
  margin-bottom: 2rem;
}
.vis .severity-bar {
  height: 6px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
}
.vis .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.4s ease,
    background 0.3s;
}
.vis .severity-fill.filling {
  background: var(--vp-c-divider);
}
.vis .severity-fill.normal {
  background: #22c55e;
}
.vis .severity-fill.mild {
  background: #f59e0b;
}
.vis .severity-fill.moderate {
  background: #f97316;
}
.vis .severity-fill.critical {
  background: #ef4444;
}
.vis .severity-ticks-abs,
.vis .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.vis .severity-labels-abs {
  height: 13px;
  margin-top: 0;
}
.vis .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.vis .tick-abs[style*="left:0%"] {
  transform: translateX(0);
}
.vis .tick-abs[style*="left:100%"] {
  transform: translateX(-100%);
}
.vis .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.vis .label-abs[style*="left:0%"] {
  transform: translateX(0);
}
.vis .label-abs[style*="left:100%"] {
  transform: translateX(-100%);
}
.vis .tick-red {
  color: #ef4444;
  font-weight: 700;
}
.vis .tick-ok {
  color: #22c55e;
  font-weight: 700;
}
/* ── Alert ───────────────────────────────────────────────────── */
.vis .vis-alert {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vis .alert-moderate {
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.35);
}
.vis .alert-critical {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.35);
}
.vis .alert-icon {
  color: #ef4444;
  flex-shrink: 0;
}
/* ── ICOPE notice ────────────────────────────────────────────── */
.vis .icope-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  background: rgba(6, 182, 212, 0.05);
  border: 1px solid rgba(6, 182, 212, 0.25);
  border-left: 3px solid #14b8a6;
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.vis .notice-icon {
  flex-shrink: 0;
}
.vis .notice-sep {
  margin: 0 6px;
  color: var(--vp-c-text-3);
}
.vis .vis-cross {
  color: #0891b2;
}
/* ── Groups ──────────────────────────────────────────────────── */
.vis .nihss-group {
  margin-bottom: 1.5rem;
}
.vis .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #eab308;
  margin-bottom: 0.6rem;
}
.vis .eye-bar {
  border-left: 3px solid #06b6d4;
}
.vis .inst-bar {
  border-left: 3px solid #06b6d4;
}
.vis .chart-bar {
  border-left: 3px solid #111;
}
.vis .rec-bar {
  border-left: 3px solid #8b5cf6;
}
.vis .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.vis .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.vis .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.vis .group-score-tally {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
  min-width: 52px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.vis .tally-print {
  color: #111;
  background: rgba(0, 0, 0, 0.07);
  border-color: rgba(0, 0, 0, 0.18);
}
.vis .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.vis .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.vis .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
/* ── Instructions ────────────────────────────────────────────── */
.vis .inst-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.vis .inst-card {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.6rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.vis .inst-num {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #0e7490;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
/* ── Eye indicator band ──────────────────────────────────────── */
.vis .eye-indicator {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.45rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  margin-bottom: 0.6rem;
  border: 1px dashed;
}
.vis .ei-r {
  background: rgba(6, 182, 212, 0.06);
  border-color: rgba(6, 182, 212, 0.4);
  color: var(--vp-c-text-2);
}
.vis .ei-l {
  background: rgba(139, 92, 246, 0.06);
  border-color: rgba(139, 92, 246, 0.4);
  color: var(--vp-c-text-2);
}
.vis .ei-switch {
  padding: 3px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  flex-shrink: 0;
  transition: all 0.15s;
  color: var(--vp-c-text-2);
}
.vis .ei-switch:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
/* ── Chart card ──────────────────────────────────────────────── */
.vis .chart-card {
  background: #fff;
  color: #000;
  border: 2px solid #000;
  border-radius: 8px;
  padding: 1rem 1.25rem 0.75rem;
}
.vis .chart-header-line {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.75rem;
}
.vis .chart-card-title {
  font-size: 0.72rem;
  font-weight: 700;
  color: #222;
  letter-spacing: 0.04em;
}
.vis .chart-dist {
  font-size: 0.62rem;
  color: #666;
}
.vis .chart-body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.vis .chart-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.vis .chart-row-threshold {
  padding: 4px 0;
  border-top: 1px dashed #aaa;
  border-bottom: 1px dashed #aaa;
}
.vis .chart-label {
  width: 32px;
  flex-shrink: 0;
  font-size: 0.58rem;
  font-weight: 700;
  color: #555;
  text-align: right;
}
.vis .chart-syms {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  justify-content: center;
}
.vis .chart-sym-wrap {
  position: relative;
  padding: 3px;
  border-radius: 4px;
  line-height: 0;
  transition: background 0.15s;
}
.vis .chart-sym-wrap.sym-ok {
  background: rgba(34, 197, 94, 0.15);
}
.vis .chart-sym-wrap.sym-err {
  background: rgba(239, 68, 68, 0.12);
}
.vis .e-glyph {
  display: block;
  fill: #000;
}
.vis .sym-dot {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.6rem;
  font-weight: 900;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.vis .dot-ok {
  background: #22c55e;
  color: #fff;
}
.vis .dot-err {
  background: #ef4444;
  color: #fff;
}
.vis .chart-row-score {
  width: 68px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}
.vis .row-score-pill {
  font-size: 0.68rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
}
.vis .pill-pass {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
}
.vis .pill-fail {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.vis .pill-nd {
  background: rgba(0, 0, 0, 0.06);
  color: #666;
}
.vis .threshold-flag {
  font-size: 0.56rem;
  color: #dc2626;
  font-weight: 700;
}
.vis .chart-footer {
  display: flex;
  justify-content: space-between;
  margin-top: 0.65rem;
  padding-top: 0.45rem;
  border-top: 1px dashed #ccc;
  font-size: 0.6rem;
  color: #888;
}
/* ── Answer items ────────────────────────────────────────────── */
.vis .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.vis .vis-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.vis .vis-item.item-pass {
  border-color: #22c55e;
}
.vis .vis-item.item-fail {
  border-color: #ef4444;
}
.vis .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.vis .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.vis .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.vis .q-threshold {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.vis .q-row {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.vis .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.vis .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.vis .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.vis .threshold-badge {
  display: inline-block;
  margin-left: 6px;
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.vis .correct-dir {
  font-size: 1rem;
  margin-right: 4px;
  color: var(--vp-c-text-1);
}
.vis .item-score {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.vis .val-ok {
  color: #22c55e;
}
.vis .val-abn {
  color: #ef4444;
}
.vis .val-nd {
  color: var(--vp-c-text-3);
}
/* ── Symbol columns ──────────────────────────────────────────── */
.vis .sym-cols {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}
.vis .sym-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.55rem 0.2rem;
  border-right: 1px solid var(--vp-c-divider);
  gap: 4px;
  transition: background 0.15s;
}
.vis .sym-col:last-child {
  border-right: none;
}
.vis .sym-col.col-ok {
  background: rgba(34, 197, 94, 0.06);
}
.vis .sym-col.col-err {
  background: rgba(239, 68, 68, 0.05);
}
.vis .sym-col-head {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.vis .sym-idx {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}
.vis .sym-answer {
  font-size: 1.1rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.vis .dir-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  width: 100%;
}
.vis .dir-btn {
  padding: 0.3rem 0;
  font-size: 0.95rem;
  font-weight: 800;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  transition: all 0.12s;
  text-align: center;
}
.vis .dir-btn:hover {
  background: var(--vp-c-bg-mute);
}
.vis .dir-btn.dir-correct {
  background: rgba(34, 197, 94, 0.15);
  border-color: #22c55e;
  color: #16a34a;
}
.vis .dir-btn.dir-wrong {
  background: rgba(239, 68, 68, 0.12);
  border-color: #ef4444;
  color: #dc2626;
}
.vis .sym-verdict {
  font-size: 0.7rem;
  font-weight: 800;
  height: 20px;
  line-height: 14px;
  padding-top: 4px;
}
.vis .v-ok {
  color: #22c55e;
}
.vis .v-err {
  color: #ef4444;
}
/* ── Sub-score row ───────────────────────────────────────────── */
.vis .sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.vis .sub-score-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.5rem 0.75rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  min-width: 72px;
  flex: 1;
  max-width: 110px;
  transition: border-color 0.3s;
}
.vis .ss-pass {
  border-color: #22c55e;
}
.vis .ss-fail {
  border-color: #ef4444;
}
.vis .ss-nd {
  opacity: 0.5;
}
.vis .ss-label {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.vis .ss-val {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.vis .ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.vis .ss-threshold {
  font-size: 0.55rem;
  font-weight: 800;
  color: #ef4444;
  height: 12px;
  line-height: 12px;
}
.vis .ss-threshold-placeholder {
  height: 12px;
  display: block;
}
.vis .ss-pass .ss-val {
  color: #22c55e;
}
.vis .ss-fail .ss-val {
  color: #ef4444;
}
/* ── Result card ─────────────────────────────────────────────── */
.vis .vis-result {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: nowrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis .vis-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis .vis-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis .vis-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis .vis-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.vis .result-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
  min-width: 80px;
  text-align: center;
  flex-direction: column;
  align-items: center;
  border-right: 1px solid var(--vp-c-divider);
  padding-right: 1rem;
}
.vis .result-number {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.vis .vis-result.normal .result-number {
  color: #22c55e;
}
.vis .vis-result.mild .result-number {
  color: #f59e0b;
}
.vis .vis-result.moderate .result-number {
  color: #f97316;
}
.vis .vis-result.critical .result-number {
  color: #ef4444;
}
.vis .result-max {
  font-size: 0.85rem;
  color: var(--vp-c-text-3);
  transition: opacity 0.2s;
}
.vis .result-right {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}
.vis .result-ver {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  letter-spacing: 0.03em;
}
.vis .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.vis .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
/* ── Dual comparison card ─────────────────────────────────────── */
.vis .dual-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.vis .dual-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.vis .dual-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.vis .dual-eye {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 1rem 0.75rem;
  text-align: center;
}
.vis .dual-eye:first-child {
  border-right: 1px solid var(--vp-c-divider);
}
.vis .dual-eye.normal {
  background: rgba(34, 197, 94, 0.04);
}
.vis .dual-eye.mild {
  background: rgba(245, 158, 11, 0.04);
}
.vis .dual-eye.moderate {
  background: rgba(249, 115, 22, 0.04);
}
.vis .dual-eye.critical {
  background: rgba(239, 68, 68, 0.04);
}
.vis .de-label {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
}
.vis .de-score {
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.vis .de-score small {
  font-size: 1rem;
  font-weight: 600;
}
.vis .dual-eye.normal .de-score {
  color: #22c55e;
}
.vis .dual-eye.mild .de-score {
  color: #f59e0b;
}
.vis .dual-eye.moderate .de-score {
  color: #f97316;
}
.vis .dual-eye.critical .de-score {
  color: #ef4444;
}
.vis .de-sub {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.vis .de-verdict {
  font-size: 0.8rem;
  font-weight: 700;
}
.vis .dv-pass {
  color: #22c55e;
}
.vis .dv-fail {
  color: #ef4444;
}
.vis .de-level {
  font-size: 0.67rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
}
/* ── Results detail — both eyes ──────────────────────────────── */
.vis .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
/* Header row — 3 columns */
.vis .results-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.45rem 0.9rem;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.vis .rh-col-label {
  text-align: left;
}
.vis .rh-col-od {
  text-align: center;
  color: #0e7490;
}
.vis .rh-col-os {
  text-align: center;
  color: #7c3aed;
}
/* Data rows */
.vis .detail-row-both {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  align-items: center;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.4rem;
}
.vis .detail-row-both:last-child {
  border-bottom: none;
}
.vis .detail-row-threshold {
  background: rgba(239, 68, 68, 0.03);
}
.vis .detail-total {
  background: var(--vp-c-bg-mute);
}
/* Left column: snellen + description */
.vis .drb-label {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.vis .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  display: inline-block;
}
.vis .dq-threshold {
  color: #ef4444;
}
.vis .dq-row {
  color: #8b5cf6;
}
.vis .drb-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}
/* Eye cells (OD / OS columns) */
.vis .drb-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.vis .drb-score {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.vis .ds-ok {
  color: #22c55e;
}
.vis .ds-abn {
  color: #ef4444;
}
.vis .drb-nd {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  opacity: 0.45;
}
.vis .drb-verdict {
  font-size: 0.68rem;
  font-weight: 700;
}
.vis .dv-pass {
  color: #22c55e;
}
.vis .dv-fail {
  color: #ef4444;
}
.vis .drb-verdict-cell {
  gap: 3px;
}
.vis .drb-level {
  font-size: 0.62rem;
  color: var(--vp-c-text-2);
  font-weight: 600;
  text-align: center;
}
.vis .detail-score-brand {
  color: var(--vp-c-brand-1);
}
/* ── Warn / Actions ──────────────────────────────────────────── */
.vis .warn-box {
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
.vis .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.vis .vis-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.vis .btn-view,
.vis .btn-copy,
.vis .btn-reset-eye,
.vis .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.vis .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.vis .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.vis .btn-view:active {
  transform: translateY(0);
}
.vis .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.vis .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.vis .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.vis .btn-reset-eye {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.vis .btn-reset-eye:hover {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.04);
}
.vis .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.vis .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.vis .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.3rem 0 0;
}
.vis .eye-prompt {
  color: #0891b2;
  font-weight: 600;
}

@media (max-width: 640px) {
.vis .vis-header {
    flex-wrap: wrap;
  }
.vis .score-badge {
    align-self: flex-start;
  }
.vis .vis-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.vis .inst-grid {
    grid-template-columns: 1fr;
  }
.vis .sym-cols {
    grid-template-columns: repeat(2, 1fr);
  }
.vis .eye-tab-row {
    flex-direction: column;
  }
.vis .dual-grid {
    grid-template-columns: 1fr;
  }
.vis .dual-eye:first-child {
    border-right: none;
    border-bottom: 1px solid var(--vp-c-divider);
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.geriassess .score-badge {
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
.geriassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.geriassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.geriassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.geriassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.geriassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.geriassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.geriassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.geriassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.geriassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .geriassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

/* ══ Unified 2-option (LBP-style) yes/no rows across geriatric tools ══ */
.geriassess .yn-row {
  display: flex;
  gap: 0.5rem;
  background: none;
  padding: 0;
  margin-top: 0.15rem;
}
.geriassess .yn-row .yn-btn {
  flex: 1 1 0;
}
/* ══ GDS options attached rightward in the question card (LBP style) ══ */
.gds .item-header {
  align-items: center;
}
.gds .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
  margin-top: 0;
}
.gds .item-header .yn-row .yn-btn {
  flex: 0 0 auto;
}
/* ══ Consistent green(normal)/red(abnormal) card fills across geriatric tools (LBP style) ══ */
.geriassess .item-ok,
.geriassess .item_ok {
  border-color: #22c55e !important;
  background: color-mix(in srgb, rgb(34, 197, 94) 8%, var(--vp-c-bg)) !important;
  box-shadow: 0 1px 4px rgba(34, 197, 94, 0.08) !important;
}
.geriassess .item-abn,
.geriassess .item-err,
.geriassess .item_err {
  border-color: #ef4444 !important;
  background: color-mix(in srgb, rgb(239, 68, 68) 8%, var(--vp-c-bg)) !important;
  box-shadow: 0 1px 4px rgba(239, 68, 68, 0.08) !important;
}
.geriassess .item-ok .item-header,
.geriassess .item_ok .item-header,
.geriassess .item-abn .item-header,
.geriassess .item-err .item-header,
.geriassess .item_err .item-header {
  background: transparent !important;
}
/* ══ ICOPE 2-option buttons attached rightward in the question row (LBP style);
   mob1 椅子起身 keeps its full-width layout below the illustration ══ */
.icope .item-header {
  align-items: center;
}
.icope .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
  margin-top: 0;
  flex-wrap: wrap;
}
.icope .item-header .yn-row .yn-btn {
  flex: 0 0 auto;
}
/* ══ BHT / TDS / AD8 options attached rightward in the question row (LBP style) ══ */
.cog .item-header {
  align-items: center;
}
.cog .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
  margin-top: 0;
  flex-wrap: wrap;
}
.cog .item-header .yn-row .yn-btn {
  flex: 0 0 auto;
}
/* AD8 3-option + BHT/TDS 2-option buttons: smaller, narrower boxes */
.cog .item-header .yn-row .yn-btn {
  min-width: 0;
  padding: 0.4rem 0.62rem;
  font-size: 0.82rem !important;
}
/* SPPB: enlarge stance-card, dist-btn & scoring-table fonts to the global
   header / description standard (titles ~0.92rem, descriptions ~0.82rem) */
.sppb .sc-label {
  font-size: 0.92rem;
}
.sppb .sc-en {
  font-size: 0.8rem;
}
.sppb .sc-rule {
  font-size: 0.82rem;
}
.sppb .sc-s {
  font-size: 0.8rem;
}
.sppb .dist-title {
  font-size: 0.92rem;
}
.sppb .dist-sub {
  font-size: 0.8rem;
}
.sppb .st-header {
  font-size: 0.85rem;
}
.sppb .st-desc {
  font-size: 0.82rem;
}
.sppb .st-score {
  font-size: 0.88rem;
}
.sppb .st-time {
  font-size: 0.85rem;
}
.sppb .gait-note {
  font-size: 0.82rem;
}
/* SPPB score-overview cards: larger, more legible fonts */
.sppb .so-label {
  font-size: 0.78rem;
}
.sppb .so-max {
  font-size: 0.72rem;
}
.sppb .so-icon {
  font-size: 1.05rem;
}
.sppb .so-val {
  font-size: 1.45rem;
}
.sppb .so-plus {
  font-size: 1.15rem;
}
/* SPPB result score-badge: enlarge label + number text */
.sppb .badge-top {
  font-size: 0.75rem;
}
.sppb .score-bot {
  font-size: 0.72rem;
}
.sppb .score-number {
  font-size: 2.1rem;
}
/* MNA sub-score-cards: larger, bolder text */
.mna .ss-label {
  font-size: 0.85rem;
  font-weight: 800;
}
.mna .ss-val {
  font-size: 1.75rem;
}
.mna .ss-max {
  font-size: 0.8rem;
  font-weight: 700;
}
/* WHO vision chart: enlarge eye-strip-card, eye-tab & score-badge fonts */
.vis .esc-label {
  font-size: 0.95rem;
  font-weight: 800;
}
.vis .esc-val {
  font-size: 2.25rem;
  font-weight: 900;
}
.vis .eye-tab .et-title {
  font-size: 1rem;
  font-weight: 800;
}
.vis .et-sub {
  font-size: 0.78rem;
  font-weight: 600;
}
.vis .et-score {
  font-size: 0.95rem;
  font-weight: 800;
}
.vis .et-icon {
  font-size: 1.35rem;
}
/* vis result badge — larger text + roomier layout */
.vis .score-badge {
  gap: 1px;
  padding: 0.45rem 0.5rem;
}
.vis .badge-top {
  font-size: 0.72rem;
  font-weight: 700;
}
.vis .score-number {
  font-size: 2.15rem;
}
.vis .score-unit {
  font-size: 0.72rem;
}
.vis .score-bot {
  font-size: 0.78rem;
  font-weight: 700;
}
/* vis badge: keep the /4 on the same row as the score number */
.vis .score-num-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  line-height: 1;
}
.vis .score-num-row .score-number {
  line-height: 1;
}
.vis .score-num-row .score-unit {
  margin-top: 0;
}
/* vis sub-score-cards: enlarge fonts, keep left/right eye layout identical */
.vis .ss-label {
  font-size: 0.85rem;
  font-weight: 800;
}
.vis .ss-val {
  font-size: 1.75rem;
}
.vis .ss-max {
  font-size: 0.8rem;
  font-weight: 700;
}
.vis .ss-threshold {
  font-size: 0.62rem;
  height: 14px;
  line-height: 14px;
}
.vis .ss-threshold-placeholder {
  height: 14px;
}
/* ══ vis dual-eye comparison card — redesigned layout ══ */
.vis .dual-header {
  font-size: 0.95rem;
  font-weight: 800;
  text-transform: none;
  letter-spacing: 0.02em;
  color: var(--vp-c-text-1);
  padding: 0.7rem 1rem;
}
.vis .dual-grid {
  gap: 0;
}
.vis .dual-eye {
  padding: 1.3rem 0.9rem 1.4rem;
  gap: 7px;
  position: relative;
  transition: background 0.2s;
}
.vis .dual-eye:first-child {
  border-right: 1px solid var(--vp-c-divider);
}
.vis .de-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
  letter-spacing: 0.03em;
}
.vis .de-score {
  font-size: 2.85rem;
  font-weight: 900;
  line-height: 1;
  margin: 1px 0;
}
.vis .de-score small {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  margin-left: 1px;
}
.vis .de-sub {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.vis .de-verdict {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.86rem;
  font-weight: 800;
  padding: 0.22rem 0.75rem;
  border-radius: 999px;
  margin-top: 4px;
  line-height: 1.3;
}
.vis .de-verdict.dv-pass {
  color: #16a34a;
  background: color-mix(in srgb, #22c55e 15%, var(--vp-c-bg));
  border: 1px solid color-mix(in srgb, #22c55e 38%, transparent);
}
.vis .de-verdict.dv-fail {
  color: #dc2626;
  background: color-mix(in srgb, #ef4444 15%, var(--vp-c-bg));
  border: 1px solid color-mix(in srgb, #ef4444 38%, transparent);
}
.vis .de-level {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
/* ══ Compact stat cards: info block on the left, big number on the right ══ */
.vis .eye-strip-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
}
.vis .esc-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  text-align: left;
  min-width: 0;
}
.vis .eye-strip-card .esc-val {
  flex-shrink: 0;
  line-height: 1;
}
.vis .dual-eye {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.85rem 1.1rem;
  text-align: left;
}
.vis .de-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  min-width: 0;
}
.vis .dual-eye .de-score {
  flex-shrink: 0;
  font-size: 3rem;
  line-height: 1;
  margin: 0;
}
/* 施測說明 collapsible section */
.vis .inst-collapse > summary {
  cursor: pointer;
  list-style: none;
  user-select: none;
  transition: all 0.18s;
}
.vis .inst-collapse > summary::-webkit-details-marker {
  display: none;
}
.vis .inst-collapse > summary:hover {
  background: color-mix(in srgb, var(--vp-c-bg-soft) 45%, transparent);
}
.vis .inst-chevron {
  margin-left: auto;
  flex-shrink: 0;
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  transition: transform 0.2s;
}
.vis .inst-collapse[open] .inst-chevron {
  transform: rotate(180deg);
}
</style>
