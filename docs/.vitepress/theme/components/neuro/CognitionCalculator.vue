<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"fast" | "mmse" | "cdr" | "gds" | "npi" | "cmai">("fast");

// ── Drag-to-scroll for the wrapper tab bar (mouse) ────────────────
const tabBarEl = ref<HTMLElement | null>(null);
let tabDragDown = false;
let tabDragging = false;
let tabDragStartX = 0;
let tabDragScroll = 0;

function tabBarPointerDown(e: PointerEvent) {
  if (e.pointerType !== "mouse" || !tabBarEl.value) return;
  tabDragDown = true;
  tabDragging = false;
  tabDragStartX = e.clientX;
  tabDragScroll = tabBarEl.value.scrollLeft;
}
function tabBarPointerMove(e: PointerEvent) {
  const el = tabBarEl.value;
  if (!el || !tabDragDown) return;
  const dx = e.clientX - tabDragStartX;
  if (!tabDragging && Math.abs(dx) > 4) {
    tabDragging = true;
    el.setPointerCapture(e.pointerId);
  }
  if (tabDragging) el.scrollLeft = tabDragScroll - dx;
}
function tabBarPointerUp(e: PointerEvent) {
  tabDragDown = false;
  if (tabDragging && tabBarEl.value?.hasPointerCapture(e.pointerId)) {
    tabBarEl.value.releasePointerCapture(e.pointerId);
  }
  tabDragging = false;
}

// ══════════════ FAST 功能分期（Functional Assessment Staging）══════════════

// ── FAST Stages ───────────────────────────────────────────────────
// Reisberg 1984 — Functional Assessment Staging Test
// 7 stages, 6 with substages; total 16 items
const fast_stages = [
  {
    key: "1",
    stage: "1",
    name: "正常老化",
    sub: "Normal Aging",
    desc: "無任何功能缺損",
    duration: "—",
    mentalAge: "成人",
    mmse: "29–30",
    color: "normal",
  },
  {
    key: "2",
    stage: "2",
    name: "可能輕度認知障礙",
    sub: "Possible MCI",
    desc: "主觀功能缺損（自覺記憶力退步，但無客觀缺損）",
    duration: "—",
    mentalAge: "—",
    mmse: "28–29",
    color: "normal",
  },
  {
    key: "3",
    stage: "3",
    name: "輕度認知障礙",
    sub: "Mild Cognitive Impairment",
    desc: "客觀功能缺損，干擾個人最複雜的任務（如工作表現）",
    duration: "84",
    mentalAge: "12+",
    mmse: "24–28",
    color: "mild",
  },
  {
    key: "4",
    stage: "4",
    name: "輕度失智症",
    sub: "Mild Dementia",
    desc: "IADL 受影響，如繳費、烹飪、清潔、外出旅行",
    duration: "24",
    mentalAge: "8–12",
    mmse: "19–20",
    color: "mild",
  },
  {
    key: "5",
    stage: "5",
    name: "中度失智症",
    sub: "Moderate Dementia",
    desc: "需要幫助選擇適當的衣物",
    duration: "18",
    mentalAge: "5–7",
    mmse: "15",
    color: "moderate",
  },
  {
    key: "6a",
    stage: "6a",
    name: "中重度失智症",
    sub: "Moderately Severe — Dressing",
    desc: "需要幫助穿衣",
    duration: "4.8",
    mentalAge: "5",
    mmse: "9",
    color: "severe",
  },
  {
    key: "6b",
    stage: "6b",
    name: "中重度失智症",
    sub: "Moderately Severe — Bathing",
    desc: "需要幫助洗澡",
    duration: "4.8",
    mentalAge: "4",
    mmse: "8",
    color: "severe",
  },
  {
    key: "6c",
    stage: "6c",
    name: "中重度失智症",
    sub: "Moderately Severe — Toileting",
    desc: "需要幫助如廁（沖水、擦拭）",
    duration: "4.8",
    mentalAge: "4",
    mmse: "5",
    color: "severe",
  },
  {
    key: "6d",
    stage: "6d",
    name: "中重度失智症",
    sub: "Moderately Severe — Urinary Incontinence",
    desc: "尿失禁",
    duration: "3.6",
    mentalAge: "3–4",
    mmse: "3",
    color: "severe",
  },
  {
    key: "6e",
    stage: "6e",
    name: "中重度失智症",
    sub: "Moderately Severe — Fecal Incontinence",
    desc: "糞便失禁",
    duration: "9.6",
    mentalAge: "2–3",
    mmse: "1",
    color: "severe",
  },
  {
    key: "7a",
    stage: "7a",
    name: "重度失智症",
    sub: "Severe — Speech ~6 words",
    desc: "一天只能說約 5–6 個詞",
    duration: "12",
    mentalAge: "1.25",
    mmse: "0",
    color: "critical",
  },
  {
    key: "7b",
    stage: "7b",
    name: "重度失智症",
    sub: "Severe — Speech 1 word",
    desc: "只能清楚說出 1 個詞",
    duration: "18",
    mentalAge: "1",
    mmse: "0",
    color: "critical",
  },
  {
    key: "7c",
    stage: "7c",
    name: "重度失智症",
    sub: "Severe — Cannot Walk",
    desc: "無法行走",
    duration: "12",
    mentalAge: "1",
    mmse: "0",
    color: "critical",
  },
  {
    key: "7d",
    stage: "7d",
    name: "重度失智症",
    sub: "Severe — Cannot Sit",
    desc: "無法獨立坐起",
    duration: "12",
    mentalAge: "0.5–0.8",
    mmse: "0",
    color: "critical",
  },
  {
    key: "7e",
    stage: "7e",
    name: "重度失智症",
    sub: "Severe — Cannot Smile",
    desc: "無法微笑",
    duration: "18",
    mentalAge: "0.2–0.4",
    mmse: "0",
    color: "critical",
  },
  {
    key: "7f",
    stage: "7f",
    name: "重度失智症",
    sub: "Severe — Cannot Hold Head",
    desc: "無法抬頭",
    duration: "12+",
    mentalAge: "0–0.2",
    mmse: "0",
    color: "critical",
  },
];

const fast_groups = [
  {
    label: "正常至輕度認知障礙",
    color: "g-normal",
    stageKeys: ["1", "2", "3"],
  },
  { label: "輕度至中度失智症", color: "g-mild", stageKeys: ["4", "5"] },
  {
    label: "中重度失智症",
    color: "g-severe",
    stageKeys: ["6a", "6b", "6c", "6d", "6e"],
  },
  {
    label: "重度失智症",
    color: "g-critical",
    stageKeys: ["7a", "7b", "7c", "7d", "7e", "7f"],
  },
];

// ── State ─────────────────────────────────────────────────────────
const fast_selected = ref<string | null>(null);
const fast_showResults = ref(false);
const fast_copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const selectedStage = computed(
  () => fast_stages.find((s) => s.key === fast_selected.value) ?? null,
);

const fast_severity = computed(() => {
  const s = selectedStage.value;
  if (!s) return { level: "未選擇", color: "unset" };
  return { level: s.name, color: s.color };
});

// ── Functions ─────────────────────────────────────────────────────
function fast_generateMarkdown() {
  const s = selectedStage.value;
  if (!s) return "";
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;

  return `# FAST 功能性評估分期結果

## 評估結果

- **評估日期**：${date}
- **FAST 分期**：${s.stage}
- **分類**：${s.name}（${s.sub}）
- **功能特徵**：${s.desc}
- **對應 MMSE**：約 ${s.mmse} 分
- **對應心智年齡**：${s.mentalAge} 歲

---

> FAST 量表依序反映阿茲海默症的功能退化，各分期不應跳躍出現。若患者跳過某分期，需考慮其他病因。`;
}

async function fast_copyMarkdown() {
  await navigator.clipboard.writeText(fast_generateMarkdown());
  fast_copied.value = true;
  setTimeout(() => (fast_copied.value = false), 2000);
}

function fast_reset() {
  fast_selected.value = null;
  fast_showResults.value = false;
}

function stagesForGroup(group: (typeof fast_groups)[0]) {
  return fast_stages.filter((s) => group.stageKeys.includes(s.key));
}

// ══════════════ MMSE 心智狀態（Mini-Mental State）══════════════

const mmse_groups = [
  {
    label: "定向力",
    sub: "Orientation",
    color: "orient",
    icon: "🗓",
    items: [
      { key: "year", name: "今年是哪一年？", sub: "Year", max: 1 },
      { key: "season", name: "現在是什麼季節？", sub: "Season", max: 1 },
      { key: "month", name: "現在是幾月份？", sub: "Month", max: 1 },
      { key: "date", name: "今天是幾號？", sub: "Date", max: 1 },
      { key: "day", name: "今天是星期幾？", sub: "Day of week", max: 1 },
      { key: "country", name: "這是哪個國家／地區？", sub: "Country", max: 1 },
      { key: "city", name: "這是哪個縣市？", sub: "City", max: 1 },
      { key: "district", name: "這是哪個鄉鎮區？", sub: "District", max: 1 },
      {
        key: "place",
        name: "這是什麼地方（醫院／診所）？",
        sub: "Place",
        max: 1,
      },
      { key: "floor", name: "這是幾樓？", sub: "Floor", max: 1 },
    ],
  },
  {
    label: "即時記憶",
    sub: "Registration",
    color: "reg",
    icon: "💬",
    items: [
      { key: "reg1", name: "複述三個詞（第一個）", sub: "Word 1", max: 1 },
      { key: "reg2", name: "複述三個詞（第二個）", sub: "Word 2", max: 1 },
      { key: "reg3", name: "複述三個詞（第三個）", sub: "Word 3", max: 1 },
    ],
  },
  {
    label: "注意力與計算力",
    sub: "Attention & Calculation",
    color: "calc",
    icon: "🔢",
    items: [
      { key: "calc1", name: "100 − 7 = 93", sub: "1st subtraction", max: 1 },
      { key: "calc2", name: "93 − 7 = 86", sub: "2nd subtraction", max: 1 },
      { key: "calc3", name: "86 − 7 = 79", sub: "3rd subtraction", max: 1 },
      { key: "calc4", name: "79 − 7 = 72", sub: "4th subtraction", max: 1 },
      { key: "calc5", name: "72 − 7 = 65", sub: "5th subtraction", max: 1 },
    ],
  },
  {
    label: "延遲記憶",
    sub: "Recall",
    color: "recall",
    icon: "🔁",
    items: [
      { key: "rec1", name: "回憶第一個詞", sub: "Recall word 1", max: 1 },
      { key: "rec2", name: "回憶第二個詞", sub: "Recall word 2", max: 1 },
      { key: "rec3", name: "回憶第三個詞", sub: "Recall word 3", max: 1 },
    ],
  },
  {
    label: "語言能力",
    sub: "Language",
    color: "lang",
    icon: "📝",
    items: [
      { key: "name1", name: "命名：手錶", sub: "Naming — watch", max: 1 },
      { key: "name2", name: "命名：鉛筆", sub: "Naming — pencil", max: 1 },
      {
        key: "repeat",
        name: "複述：「非也，和，但是」",
        sub: "Repetition",
        max: 1,
      },
      {
        key: "cmd1",
        name: "三步驟指令 — 拿起紙",
        sub: "Command step 1",
        max: 1,
      },
      { key: "cmd2", name: "三步驟指令 — 對折", sub: "Command step 2", max: 1 },
      {
        key: "cmd3",
        name: "三步驟指令 — 放到地上",
        sub: "Command step 3",
        max: 1,
      },
      {
        key: "read",
        name: "閱讀並執行：「請閉上眼睛」",
        sub: "Reading",
        max: 1,
      },
      { key: "write", name: "自發書寫一個完整句子", sub: "Writing", max: 1 },
      { key: "copy", name: "臨摹兩個相交的五邊形", sub: "Copying", max: 1 },
    ],
  },
];

const allItems = mmse_groups.flatMap((g) => g.items);

const mmse_qIndex = (() => {
  const map: Record<string, number> = {};
  let n = 1;
  for (const g of mmse_groups)
    for (const item of g.items) {
      map[item.key] = n++;
    }
  return map;
})();

const mmse_selections = ref<Record<string, number>>(
  Object.fromEntries(allItems.map((item) => [item.key, -1])),
);
const mmse_showResults = ref(false);
const mmse_copied = ref(false);

const groupScore = (g: (typeof mmse_groups)[0]) =>
  g.items.reduce(
    (sum, item) => sum + Math.max(mmse_selections.value[item.key], 0),
    0,
  );

const mmse_totalScore = computed(() =>
  allItems.reduce(
    (sum, item) => sum + Math.max(mmse_selections.value[item.key], 0),
    0,
  ),
);

const mmse_answeredCount = computed(
  () => allItems.filter((item) => mmse_selections.value[item.key] >= 0).length,
);

const mmse_isComplete = computed(() => mmse_answeredCount.value === allItems.length);

const mmse_severity = computed(() => {
  const s = mmse_totalScore.value;
  if (s >= 27) return { level: "正常", color: "normal" };
  if (s >= 21) return { level: "輕度障礙", color: "mild" };
  if (s >= 10) return { level: "中度障礙", color: "moderate" };
  return { level: "重度障礙", color: "severe" };
});

function mmse_generateMarkdown() {
  const lines = mmse_groups
    .map((g) => {
      const itemLines = g.items
        .map((item) => {
          const v = mmse_selections.value[item.key];
          return `  - **${item.name}**：${v >= 0 ? v : "未填"} / ${item.max}`;
        })
        .join("\n");
      return `### ${g.label}（${groupScore(g)} 分）\n${itemLines}`;
    })
    .join("\n\n");
  return `# MMSE 評估結果\n\n${lines}\n\n---\n## 總分：${mmse_totalScore.value} / 30（${mmse_severity.value.level}）`;
}

async function mmse_copyMarkdown() {
  await navigator.clipboard.writeText(mmse_generateMarkdown());
  mmse_copied.value = true;
  setTimeout(() => (mmse_copied.value = false), 2000);
}

function mmse_reset() {
  allItems.forEach((item) => {
    mmse_selections.value[item.key] = -1;
  });
  mmse_showResults.value = false;
}

// ══════════════ CDR 臨床失智（Clinical Dementia Rating）══════════════

const cdr_domains = [
  {
    key: "memory",
    title: "記憶力",
    sub: "Memory",
    options: [
      {
        score: 0,
        label: "無",
        desc: "沒有記憶力減退或稍微減退，沒有經常性健忘",
      },
      { score: 0.5, label: "可疑", desc: "經常性的輕度遺忘，事情只能部分想起" },
      {
        score: 1,
        label: "輕度",
        desc: "中度記憶減退；最近事件容易忘記，影響日常生活",
      },
      { score: 2, label: "中度", desc: "嚴重記憶力減退；新學習內容很快忘記" },
      { score: 3, label: "重度", desc: "記憶力嚴重減退，只記得片段內容" },
    ],
  },
  {
    key: "orientation",
    title: "定向力",
    sub: "Orientation",
    options: [
      { score: 0, label: "無", desc: "完全定向" },
      { score: 0.5, label: "可疑", desc: "對時間關係有輕微困難" },
      { score: 1, label: "輕度", desc: "對時間關聯性有中度困難" },
      { score: 2, label: "中度", desc: "對時間與地點定向常有困難" },
      { score: 3, label: "重度", desc: "只對人物定向" },
    ],
  },
  {
    key: "judgment",
    title: "判斷力與解決問題能力",
    sub: "Judgment & Problem Solving",
    options: [
      { score: 0, label: "無", desc: "判斷力正常" },
      { score: 0.5, label: "可疑", desc: "輕微問題解決障礙" },
      { score: 1, label: "輕度", desc: "中度困難，但社交判斷力仍可" },
      { score: 2, label: "中度", desc: "問題處理與社交判斷受損" },
      { score: 3, label: "重度", desc: "無法做出判斷或解決問題" },
    ],
  },
  {
    key: "community",
    title: "社區活動能力",
    sub: "Community Affairs",
    options: [
      { score: 0, label: "無", desc: "可獨立處理工作、購物、財務等" },
      { score: 0.5, label: "可疑", desc: "活動略有障礙" },
      { score: 1, label: "輕度", desc: "無法單獨參與部分活動" },
      { score: 2, label: "中度", desc: "無法獨立外出處理事務" },
      { score: 3, label: "重度", desc: "明顯無法在外活動" },
    ],
  },
  {
    key: "home",
    title: "家居生活與嗜好",
    sub: "Home & Hobbies",
    options: [
      { score: 0, label: "無", desc: "家庭生活與興趣維持良好" },
      { score: 0.5, label: "可疑", desc: "家庭生活略有障礙" },
      { score: 1, label: "輕度", desc: "較複雜家事與興趣已放棄" },
      { score: 2, label: "中度", desc: "只剩簡單家事能力" },
      { score: 3, label: "重度", desc: "無法做家事" },
    ],
  },
  {
    key: "care",
    title: "自我照顧能力",
    sub: "Personal Care",
    options: [
      { score: 0, label: "無", desc: "完全能夠自我照顧" },
      { score: 1, label: "輕度", desc: "需旁人提醒" },
      { score: 2, label: "中度", desc: "穿衣與衛生需幫忙" },
      { score: 3, label: "重度", desc: "需要完全照顧" },
    ],
  },
];

const cdr_selections = ref<Record<string, number>>({});
const cdr_showResults = ref(false);
const cdr_copied = ref(false);

function cdr_select(key: string, score: number) {
  cdr_selections.value[key] = score;
}

function cdr_reset() {
  cdr_selections.value = {};
  cdr_showResults.value = false;
}

const cdr_isComplete = computed(() =>
  cdr_domains.every((d) => cdr_selections.value[d.key] !== undefined),
);

const progress = computed(
  () => cdr_domains.filter((d) => cdr_selections.value[d.key] !== undefined).length,
);

function calculateCDR(s: Record<string, number>) {
  const mem = s.memory;
  const secondary = [s.orientation, s.judgment, s.community, s.home, s.care];
  const count = (v: number) => secondary.filter((x) => x === v).length;

  if (count(mem) >= 3) return mem;
  if (mem === 0.5 && count(1) + count(2) + count(3) >= 3) return 1;
  if (mem === 0) return secondary.filter((x) => x >= 0.5).length >= 2 ? 0.5 : 0;
  if (mem === 0.5) return 0.5;
  if (mem >= 1) {
    const majority = [0, 0.5, 1, 2, 3].reduce((a, b) =>
      count(b) > count(a) ? b : a,
    );
    return Math.max(0.5, majority);
  }
  return 0;
}

const cdrScore = computed(() =>
  cdr_isComplete.value ? calculateCDR(cdr_selections.value) : null,
);
const sobScore = computed(() =>
  cdr_isComplete.value
    ? Object.values(cdr_selections.value).reduce((a, b) => a + b, 0)
    : null,
);

const cdr_severity = computed(() => {
  const s = cdrScore.value;
  if (s === null) return { level: "未完成", color: "unset" };
  if (s === 0) return { level: "正常", color: "none" };
  if (s === 0.5) return { level: "可疑失智", color: "mild" };
  if (s === 1) return { level: "輕度失智", color: "mod" };
  if (s === 2) return { level: "中度失智", color: "severe" };
  return { level: "重度失智", color: "crit" };
});

function cdr_generateMarkdown() {
  const lines = cdr_domains.map((d) => {
    const v = cdr_selections.value[d.key];
    const opt = d.options.find((o) => o.score === v);
    return `- **${d.title}**：${v}（${opt?.label}）— ${opt?.desc}`;
  });
  return `# CDR 評估結果\n\n${lines.join("\n")}\n\n## CDR 總分：${cdrScore.value}（${cdr_severity.value.level}）\n## CDR-SOB：${sobScore.value}`;
}

async function cdr_copyMarkdown() {
  await navigator.clipboard.writeText(cdr_generateMarkdown());
  cdr_copied.value = true;
  setTimeout(() => (cdr_copied.value = false), 2000);
}

// ══════════════ GDS 整體退化（Global Deterioration Scale）══════════════

function tickColor(i: number): string {
  if (i <= 2) return "#22c55e";
  if (i === 3) return "#eab308";
  if (i === 4) return "#f59e0b";
  return "#ef4444";
}

const gds_stages = [
  {
    id: 1,
    title: "第一階段",
    sub: "認知能力沒有衰退（正常運作）",
    color: "none",
    symptoms: ["沒有記憶力問題"],
  },
  {
    id: 2,
    title: "第二階段",
    sub: "認知能力有很輕微的衰退（可能是與年齡相關的正常變化或阿茲海默症最早期的症狀）",
    color: "mild",
    symptoms: [
      "記憶失誤",
      "忘記熟悉的人名和物件擺放的位置",
      "這些失誤並不明顯，其他人不易察覺",
    ],
  },
  {
    id: 3,
    title: "第三階段",
    sub: "認知能力輕微衰退（部分人會被診斷出患上早期阿茲海默症）",
    color: "mild2",
    symptoms: [
      "記憶力問題屬輕微",
      "難以學習新的事物",
      "難以集中精神或專注力有限",
      "難以辨認方向位置，例如會迷路",
      "溝通出現困難，例如想不起正確的用字",
      "遺失或亂放貴重物品",
      "難以處理工作上的難題",
      "家人、朋友或同事留意到問題",
    ],
  },
  {
    id: 4,
    title: "第四階段",
    sub: "認知能力中度衰退（輕微或早期階段的阿茲海默症）",
    color: "mod",
    symptoms: [
      "記不起一些個人往事",
      "難以執行複雜的工作，例如管理財政、購物及旅遊",
      "對現時和最近發生的事情知道得少了",
      "對於較難的數學題，心算能力減弱（例如由 75 每次減 7 倒數）",
    ],
  },
  {
    id: 5,
    title: "第五階段",
    sub: "認知能力中度嚴重衰退（中度或中期階段的阿茲海默症）",
    color: "severe",
    symptoms: [
      "記憶力出現嚴重缺失，例如忘記電話號碼或親密家屬的名字",
      "需要別人協助日常生活",
    ],
  },
  {
    id: 6,
    title: "第六階段",
    sub: "認知能力非常嚴重衰退（嚴重或晚期階段的阿茲海默症）",
    color: "crit",
    symptoms: [
      "記憶力持續減退，例如偶爾忘記配偶或主要照顧者的名字",
      "不知道自己最近做過的事情，例如忘記午餐吃了什麼或子女剛畢業",
      "需要別人協助日常的活動，例如穿衣、洗澡等",
      "數數字有困難",
      "性格和情緒出現變化，例如思想混亂、焦慮、多疑、憤怒、哀傷／抑鬱、敵意、激動",
      "強迫症，例如重複地做一些簡單的事情",
      "正常的睡眠／起床時間受到干擾",
      "失禁情況增多",
    ],
  },
  {
    id: 7,
    title: "第七階段",
    sub: "認知能力極度嚴重衰退（最嚴重或末期階段的阿茲海默症）",
    color: "crit",
    symptoms: [
      "認知能力嚴重減弱",
      "使用的詞彙變得很有限，逐漸喪失說話能力",
      "不靠支撐不能自行走路或坐好",
      "進食和如廁時需要協助；通常有失禁問題",
    ],
  },
];

const gds_groups = [
  {
    label: "正常至極輕微",
    sub: "Normal to Very Mild",
    color: "none",
    ids: [1, 2],
  },
  {
    label: "輕微至中度",
    sub: "Mild to Moderate",
    color: "mild2",
    ids: [3, 4],
  },
  {
    label: "中重至極重度",
    sub: "Severe to Very Severe",
    color: "severe",
    ids: [5, 6, 7],
  },
];

const gds_selected = ref<number | null>(null);
const gds_showResults = ref(false);
const gds_copied = ref(false);

const result = computed(
  () => gds_stages.find((s) => s.id === gds_selected.value) ?? null,
);

const severityColor = computed(() => result.value?.color ?? "unset");

const severityLabel = computed(() => {
  switch (severityColor.value) {
    case "crit":
      return "重度至極重度失智";
    case "severe":
      return "中重度失智";
    case "mod":
      return "中度失智";
    case "mild2":
      return "輕度失智";
    case "mild":
      return "極輕微認知衰退";
    default:
      return "正常認知功能";
  }
});

const severityShort = computed(() => {
  switch (severityColor.value) {
    case "crit":
      return "重度至極重度";
    case "severe":
      return "中重度";
    case "mod":
      return "中度";
    case "mild2":
      return "輕度";
    case "mild":
      return "極輕微";
    default:
      return "正常";
  }
});

const gds_isComplete = computed(() => gds_selected.value !== null);

function gds_select(id: number) {
  gds_selected.value = id;
}

function gds_reset() {
  gds_selected.value = null;
  gds_showResults.value = false;
}

function gds_generateMarkdown() {
  if (!result.value) return "# GDS 整體退化量表\n\n尚未選取階段";
  const lines = result.value.symptoms.map((s) => `- ${s}`).join("\n");
  return (
    `# GDS 整體退化量表\n\n` +
    `## 評估結果\n\n` +
    `- **GDS 階段**：第 ${result.value.id} 階段\n` +
    `- **階段名稱**：${result.value.title}\n` +
    `- **臨床描述**：${result.value.sub}\n\n` +
    `### 常見症狀\n\n${lines}`
  );
}

async function gds_copyMarkdown() {
  await navigator.clipboard.writeText(gds_generateMarkdown());
  gds_copied.value = true;
  setTimeout(() => (gds_copied.value = false), 2000);
}

// ══════════════ NPI 精神症狀（Neuropsychiatric Inventory）══════════════

const npi_domains = [
  { key: "delusions", name: "妄想", sub: "Delusions" },
  { key: "hallucinations", name: "幻覺", sub: "Hallucinations" },
  { key: "agitation", name: "激動 / 攻擊行為", sub: "Agitation / Aggression" },
  { key: "depression", name: "憂鬱 / 情緒不佳", sub: "Depression / Dysphoria" },
  { key: "anxiety", name: "焦慮", sub: "Anxiety" },
  { key: "euphoria", name: "怡然自得 / 欣快感", sub: "Elation / Euphoria" },
  { key: "apathy", name: "冷漠 / 毫不在意", sub: "Apathy / Indifference" },
  { key: "disinhibition", name: "言行失控", sub: "Disinhibition" },
  {
    key: "irritability",
    name: "暴躁易怒 / 情緒易變",
    sub: "Irritability / Lability",
  },
  {
    key: "aberrant_motor",
    name: "異常動作（重複性動作）",
    sub: "Aberrant Motor Behavior",
  },
];

const frequencyOptions = [
  { value: 1, label: "偶爾", desc: "每週少於一次" },
  { value: 2, label: "時常", desc: "每週約一次" },
  { value: 3, label: "經常", desc: "每週數次" },
  { value: 4, label: "常常", desc: "每天或持續出現" },
];

const severityOptions = [
  { value: 1, label: "輕", desc: "輕微，幾乎不造成困擾" },
  { value: 2, label: "中", desc: "中度，對患者有顯著影響" },
  { value: 3, label: "重", desc: "嚴重，明顯影響日常生活" },
];

type DomainState = {
  present: boolean | null;
  frequency: number | null;
  severity: number | null;
};

const npi_selections = ref<Record<string, DomainState>>(
  Object.fromEntries(
    npi_domains.map((d) => [
      d.key,
      { present: null, frequency: null, severity: null },
    ]),
  ),
);

const npi_showResults = ref(false);
const npi_copied = ref(false);

function domainScore(key: string): number {
  const s = npi_selections.value[key];
  if (!s.present || s.frequency === null || s.severity === null) return 0;
  return s.frequency * s.severity;
}

const npi_totalScore = computed(() =>
  npi_domains.reduce((sum, d) => sum + domainScore(d.key), 0),
);

const npi_severity = computed(() => {
  const s = npi_totalScore.value;
  if (s === 0) return { level: "無症狀", color: "normal" };
  if (s <= 12) return { level: "輕度", color: "mild" };
  if (s <= 36) return { level: "中度", color: "moderate" };
  return { level: "重度", color: "severe" };
});

function togglePresent(key: string, value: boolean) {
  const s = npi_selections.value[key];
  s.present = value;
  if (!value) {
    s.frequency = null;
    s.severity = null;
  }
}

function npi_generateMarkdown() {
  const lines = npi_domains.map((d) => {
    const s = npi_selections.value[d.key];
    if (s.present === null) return `- **${d.name}**：未評估`;
    if (!s.present) return `- **${d.name}**：無`;
    const freq = frequencyOptions.find((f) => f.value === s.frequency);
    const sev = severityOptions.find((sv) => sv.value === s.severity);
    const score = domainScore(d.key);
    return `- **${d.name}**：有（頻率 ${s.frequency ?? "-"}×嚴重性 ${s.severity ?? "-"} = ${score} 分）— 頻率：${freq?.label ?? "-"}，嚴重性：${sev?.label ?? "-"}`;
  });
  return `# NPI 神經精神症狀量表評估結果\n\n${lines.join("\n")}\n\n## 總分：${npi_totalScore.value}（${npi_severity.value.level}）`;
}

async function npi_copyMarkdown() {
  await navigator.clipboard.writeText(npi_generateMarkdown());
  npi_copied.value = true;
  setTimeout(() => (npi_copied.value = false), 2000);
}

function npi_reset() {
  npi_domains.forEach((d) => {
    npi_selections.value[d.key] = {
      present: null,
      frequency: null,
      severity: null,
    };
  });
  npi_showResults.value = false;
}

// ══════════════ CMAI 激動行為（Cohen-Mansfield Agitation）══════════════

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

const cmai_selections = ref<Record<string, number>>(
  Object.fromEntries(items.map((item) => [item.key, 1])),
);
const cmai_showResults = ref(false);
const cmai_copied = ref(false);

const cmai_answeredCount = computed(
  () => items.filter((item) => cmai_selections.value[item.key] > 1).length,
);

function subscaleScore(s: "PA" | "PNA" | "V") {
  return items
    .filter((i) => i.sub === s)
    .reduce((sum, i) => sum + cmai_selections.value[i.key], 0);
}

const scorePA = computed(() => subscaleScore("PA"));
const scorePNA = computed(() => subscaleScore("PNA"));
const scoreV = computed(() => subscaleScore("V"));

const cmai_totalScore = computed(
  () => scorePA.value + scorePNA.value + scoreV.value,
);

const hasSignificantItem = computed(() =>
  items.some((i) => cmai_selections.value[i.key] >= 4),
);

const cmai_severity = computed(() => {
  const s = cmai_totalScore.value;
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

const cmai_qIndex = (() => {
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

function cmai_generateMarkdown() {
  const sections = subscaleOrder
    .map((sk) => {
      const def = subscaleDefs[sk];
      const sc = subscaleScoreFn(sk);
      const lines = items
        .filter((i) => i.sub === sk)
        .map((i) => {
          const v = cmai_selections.value[i.key];
          const opt = freqOptions.find((o) => o.value === v);
          return `  - **Q${cmai_qIndex[i.key]} ${i.name}**：${v}（${opt?.desc}）`;
        })
        .join("\n");
      return `### ${def.name}（${sc} 分，基準 ${def.items} 分）\n${lines}`;
    })
    .join("\n\n");

  return `# CMAI 柯恩-曼斯菲爾德激動量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **CMAI 總分**：${cmai_totalScore.value} / 203（基準值 29 分）\n- **身體攻擊性**：${scorePA.value} 分\n- **身體非攻擊性**：${scorePNA.value} 分\n- **語言激動**：${scoreV.value} 分\n- **激動程度**：${cmai_severity.value.level}\n- **臨床建議**：${cmai_severity.value.advice}\n- **顯著激動項目（≥ 4 分）**：${hasSignificantItem.value ? "有" : "無"}`;
}

async function cmai_copyMarkdown() {
  await navigator.clipboard.writeText(cmai_generateMarkdown());
  cmai_copied.value = true;
  setTimeout(() => (cmai_copied.value = false), 2000);
}

function cmai_reset() {
  items.forEach((item) => {
    cmai_selections.value[item.key] = 1;
  });
  cmai_showResults.value = false;
}
</script>

<template>
  <div class="cognition">
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
        :class="{ active: activeTab === 'fast' }"
        @click="activeTab = 'fast'"
      >
        <span class="tab-label">FAST 功能分期</span>
        <span class="tab-sub">Functional Assessment Staging</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'mmse' }"
        @click="activeTab = 'mmse'"
      >
        <span class="tab-label">MMSE 心智狀態</span>
        <span class="tab-sub">Mini-Mental State</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cdr' }"
        @click="activeTab = 'cdr'"
      >
        <span class="tab-label">CDR 臨床失智</span>
        <span class="tab-sub">Clinical Dementia Rating</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'gds' }"
        @click="activeTab = 'gds'"
      >
        <span class="tab-label">GDS 整體退化</span>
        <span class="tab-sub">Global Deterioration Scale</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'npi' }"
        @click="activeTab = 'npi'"
      >
        <span class="tab-label">NPI 精神症狀</span>
        <span class="tab-sub">Neuropsychiatric Inventory</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cmai' }"
        @click="activeTab = 'cmai'"
      >
        <span class="tab-label">CMAI 激動行為</span>
        <span class="tab-sub">Cohen-Mansfield Agitation</span>
      </button>
    </div>

  <div v-show="activeTab === 'fast'" class="fast">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="fast-header">
      <div class="header-title">
        <h2 class="title">FAST 功能性評估分期</h2>
        <p class="subtitle">
          Functional Assessment Staging Test · 阿茲海默症功能退化分期
        </p>
      </div>
      <div class="score-badge" :class="fast_severity.color">
        <span class="score-number">{{ fast_selected ?? "—" }}</span>
        <span class="score-label">{{
          fast_selected ? fast_severity.level.slice(0, 4) : "未選擇"
        }}</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請選擇目前患者<strong>最符合</strong>的功能分期。FAST
        依序反映阿茲海默症的功能退化，各分期不應跳躍出現。若患者跳過某分期，需考慮其他病因。</span
      >
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in fast_groups" :key="group.label" class="fast-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub"
            >FAST {{ group.stageKeys[0] }}–{{
              group.stageKeys[group.stageKeys.length - 1]
            }}</span
          >
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="stage in stagesForGroup(group)"
          :key="stage.key"
          class="fast-item"
          :class="{
            selected: fast_selected === stage.key,
            [stage.color + '-selected']: fast_selected === stage.key,
          }"
          @click="fast_selected = stage.key"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'">{{
                stage.stage
              }}</span>
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ stage.name }}</span>
              <span class="item-sub">{{ stage.sub }}</span>
            </div>
            <span
              class="item-score"
              :class="{
                active: fast_selected === stage.key,
                [stage.color]: fast_selected === stage.key,
              }"
            >
              <span v-if="fast_selected === stage.key" class="check">✓</span>
              <span v-else class="dash">—</span>
            </span>
          </div>

          <div class="stage-content">
            <div class="stage-desc">{{ stage.desc }}</div>
            <div class="stage-meta">
              <span class="meta-item">MMSE：{{ stage.mmse }}</span>
              <span class="meta-sep">·</span>
              <span class="meta-item">心智年齡：{{ stage.mentalAge }} 歲</span>
              <span v-if="stage.duration !== '—'" class="meta-sep">·</span>
              <span v-if="stage.duration !== '—'" class="meta-item"
                >持續：{{ stage.duration }} 月</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div v-if="selectedStage" class="fast-result" :class="selectedStage.color">
      <div class="result-left">
        <span class="result-stage">{{ selectedStage.stage }}</span>
        <span class="result-label">FAST</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ selectedStage.name }}</span>
        <span class="result-advice">{{ selectedStage.desc }}</span>
        <div class="result-meta">
          <span class="result-meta-item">MMSE ≈ {{ selectedStage.mmse }}</span>
          <span class="result-meta-item"
            >心智年齡 {{ selectedStage.mentalAge }} 歲</span
          >
          <span v-if="selectedStage.duration !== '—'" class="result-meta-item"
            >預期持續 {{ selectedStage.duration }} 月</span
          >
        </div>
      </div>
    </div>

    <div v-else class="fast-result unset">
      <div class="result-left">
        <span class="result-stage">—</span>
        <span class="result-label">FAST</span>
      </div>
      <div class="result-right">
        <span class="result-level">請選擇評估分期</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="fast_showResults && selectedStage" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-domain">FAST 分期</span>
        <span class="detail-score brand">{{ selectedStage.stage }}</span>
        <span class="detail-desc">{{ selectedStage.name }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">功能特徵</span>
        <span class="detail-score">—</span>
        <span class="detail-desc">{{ selectedStage.desc }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">對應 MMSE</span>
        <span class="detail-score brand">{{ selectedStage.mmse }}</span>
        <span class="detail-desc">分</span>
      </div>
      <div class="detail-row">
        <span class="detail-domain">心智年齡</span>
        <span class="detail-score brand">{{ selectedStage.mentalAge }}</span>
        <span class="detail-desc">歲</span>
      </div>
      <div class="detail-row" v-if="selectedStage.duration !== '—'">
        <span class="detail-domain">預期持續</span>
        <span class="detail-score brand">{{ selectedStage.duration }}</span>
        <span class="detail-desc">個月（未治療）</span>
      </div>
    </div>

    <!-- ── Diff note ──────────────────────────────────────────── -->
    <div class="diff-note">
      <span class="diff-dot">⚠</span>
      <span
        ><strong>鑑別診斷提示：</strong>阿茲海默症的功能退化按 FAST
        分期<strong>依序進展</strong>，不會跳過任何分期。若患者跳過某分期（如能穿衣但無法洗澡），需考慮其他失智病因或合併症。</span
      >
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="fast-actions">
      <button
        class="btn-view"
        @click="fast_showResults = !fast_showResults"
        :disabled="!fast_selected"
      >
        {{ fast_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="fast_copyMarkdown" :disabled="!fast_selected">
        {{ fast_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="fast_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'mmse'" class="mmse">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="mmse-header">
      <div class="header-title">
        <h2 class="title">MMSE 簡易心智狀態評估</h2>
        <p class="subtitle">Mini-Mental State Examination · 認知功能篩檢</p>
      </div>
      <div class="score-badge" :class="mmse_severity.color">
        <span class="score-number">{{ mmse_totalScore }}</span>
        <span class="score-label">{{ mmse_severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="mmse_severity.color"
          :style="{ width: (mmse_totalScore / 30) * 100 + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-severe" style="left: 0%">0</span>
        <span class="tick-abs t-moderate" style="left: 33.3%">10</span>
        <span class="tick-abs t-mild" style="left: 70%">21</span>
        <!-- <span class="tick-abs t-normal" style="left: 90%">27</span> -->
        <span class="tick-abs t-normal" style="left: 100%">30</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-severe" style="left: 0%">重度</span>
        <span class="label-abs lbl-moderate" style="left: 33.3%">中度</span>
        <span class="label-abs lbl-mild" style="left: 70%">輕度</span>
        <span class="label-abs lbl-normal" style="left: 100%">正常</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        每題回答「正確（1 分）」或「錯誤（0 分）」。總分 30 分，
        <strong>≥ 27 分</strong>為正常。
      </span>
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in mmse_groups" :key="group.label" class="mmse-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-icon">{{ group.icon }}</span>
          <div class="group-text-block">
            <span class="group-label">{{ group.label }}</span>
            <span class="group-sub">{{ group.sub }}</span>
          </div>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{ groupScore(group) }} /
          {{ group.items.reduce((s, i) => s + i.max, 0) }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="item in group.items"
          :key="item.key"
          class="mmse-item"
          :class="{
            answered: mmse_selections[item.key] >= 0,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="group.color + '-qnum'"
                >Q{{ mmse_qIndex[item.key] }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-sub">{{ item.sub }}</span>
            </div>
            <div class="yn-row">
              <button
                class="yn-btn"
                :class="{ 'yn-active': mmse_selections[item.key] === 1 }"
                @click="mmse_selections[item.key] = 1"
              >
                正確
              </button>
              <button
                class="yn-btn"
                :class="{ 'yn-active': mmse_selections[item.key] === 0 }"
                @click="mmse_selections[item.key] = 0"
              >
                錯誤
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="mmse-result" :class="mmse_severity.color">
      <div class="result-left">
        <span class="result-number">{{ mmse_totalScore }}</span>
        <span class="result-max">/ 30</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ mmse_severity.level }}</span>
        <span class="result-advice">
          <template v-if="mmse_totalScore >= 27">認知功能正常範圍</template>
          <template v-else-if="mmse_totalScore >= 21"
            >輕度認知障礙，建議進一步評估</template
          >
          <template v-else-if="mmse_totalScore >= 10"
            >中度認知障礙，建議積極就醫</template
          >
          <template v-else>重度認知障礙，需全面性照護</template>
        </span>
        <span class="result-progress">已完成 {{ mmse_answeredCount }} / 30 題</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="mmse_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="group in mmse_groups" :key="group.label">
        <div class="detail-section-title" :class="group.color + '-section'">
          {{ group.icon }} {{ group.label }}（{{ groupScore(group) }} /
          {{ group.items.reduce((s, i) => s + i.max, 0) }} 分）
        </div>
        <div v-for="item in group.items" :key="item.key" class="detail-row">
          <span class="detail-qnum" :class="group.color + '-qnum-sm'"
            >Q{{ mmse_qIndex[item.key] }}</span
          >
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{ zero: mmse_selections[item.key] === 0 }"
          >
            {{ mmse_selections[item.key] >= 0 ? mmse_selections[item.key] : "—" }}
          </span>
          <span class="detail-desc">
            {{
              mmse_selections[item.key] === 1
                ? "正確"
                : mmse_selections[item.key] === 0
                  ? "錯誤"
                  : "未填"
            }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="mmse-actions">
      <button class="btn-view" @click="mmse_showResults = !mmse_showResults">
        {{ mmse_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="mmse_copyMarkdown">
        {{ mmse_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="mmse_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'cdr'" class="cdr">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cdr-header">
      <div class="header-title">
        <h2 class="title">CDR 臨床失智評量表</h2>
        <p class="subtitle">Clinical Dementia Rating Scale</p>
      </div>
      <div class="score-badge" :class="cdr_severity.color">
        <span class="score-number">{{ cdrScore ?? "—" }}</span>
        <span class="score-label">{{ cdr_severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="cdr_severity.color"
          :style="{
            width: cdrScore !== null ? (cdrScore / 3) * 100 + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-none" style="left: 0%">0</span>
        <span class="tick-abs t-mild" style="left: 16.7%">0.5</span>
        <span class="tick-abs t-mod" style="left: 33.3%">1</span>
        <span class="tick-abs t-severe" style="left: 66.7%">2</span>
        <span class="tick-abs t-crit" style="left: 100%">3</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-none" style="left: 0%">正常</span>
        <span class="label-abs lbl-mild" style="left: 16.7%">可疑</span>
        <span class="label-abs lbl-mod" style="left: 33.3%">輕度</span>
        <span class="label-abs lbl-severe" style="left: 66.7%">中度</span>
        <span class="label-abs lbl-crit" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        請選取每個領域最符合患者當前狀態的描述（<strong
          >{{ progress }}/{{ cdr_domains.length }}</strong
        >
        已完成）
      </span>
    </div>

    <!-- ── Domains ────────────────────────────────────────────── -->
    <div
      v-for="(domain, domainIdx) in cdr_domains"
      :key="domain.key"
      class="cdr-domain"
    >
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">{{ domain.title }}</span>
          <span class="group-sub">{{ domain.sub }}</span>
        </div>
      </div>

      <div class="cdr-item">
        <div class="item-header">
          <div class="item-meta-row">
            <span class="item-qnum">Q{{ domainIdx + 1 }}</span>
          </div>
          <div class="item-name-block">
            <span class="item-name">{{ domain.title }}</span>
            <span class="item-sub">{{ domain.sub }}</span>
          </div>
          <span
            class="item-score"
            :class="{
              unanswered: cdr_selections[domain.key] === undefined,
              selected: cdr_selections[domain.key] !== undefined,
            }"
          >
            {{
              cdr_selections[domain.key] !== undefined
                ? cdr_selections[domain.key]
                : "—"
            }}
          </span>
        </div>

        <div class="sec-options">
          <label
            v-for="opt in domain.options"
            :key="opt.score"
            class="sec-opt"
            :class="{ 'opt-selected': cdr_selections[domain.key] === opt.score }"
          >
            <input
              type="radio"
              :name="domain.key"
              :value="opt.score"
              @change="cdr_select(domain.key, opt.score)"
            />
            <div
              class="opt-radio"
              :class="{ selected: cdr_selections[domain.key] === opt.score }"
            >
              <div
                class="opt-dot"
                v-if="cdr_selections[domain.key] === opt.score"
              />
            </div>
            <div class="opt-content">
              <span class="opt-score-badge">{{ opt.score }}</span>
              <span class="opt-text">{{ opt.label }}</span>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cdr-result" :class="cdr_severity.color">
      <div class="result-left">
        <span class="result-number">{{ cdrScore ?? "—" }}</span>
        <span class="result-max">CDR</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ cdr_severity.level }}</span>
        <span class="result-sob" v-if="sobScore !== null"
          >CDR-SOB：{{ sobScore }}</span
        >
        <span class="result-advice" v-else>請完成所有領域以計算分數</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="cdr_showResults && cdr_isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domain in cdr_domains" :key="domain.key" class="detail-row">
        <span class="detail-domain">{{ domain.title }}</span>
        <span class="detail-score">{{ cdr_selections[domain.key] }}</span>
        <span class="detail-desc">
          {{
            domain.options.find((o) => o.score === cdr_selections[domain.key])
              ?.label
          }}
          —
          {{
            domain.options.find((o) => o.score === cdr_selections[domain.key])?.desc
          }}
        </span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cdr-actions">
      <button
        class="btn-view"
        :disabled="!cdr_isComplete"
        @click="cdr_showResults = !cdr_showResults"
      >
        {{ cdr_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!cdr_isComplete" @click="cdr_copyMarkdown">
        {{ cdr_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cdr_reset">重新填寫</button>
    </div>
    <p v-if="!cdr_isComplete" class="incomplete-hint">
      請完成所有 {{ cdr_domains.length }} 個領域以啟用功能
    </p>
  </div>

  <div v-show="activeTab === 'gds'" class="gds">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="gds-header">
      <div class="header-title">
        <h2 class="title">GDS 整體退化量表</h2>
        <p class="subtitle">Global Deterioration Scale · 失智症嚴重度評估</p>
      </div>
      <div
        class="score-badge"
        :class="gds_isComplete ? 'sb-' + severityColor : 'sb-unset'"
      >
        <span class="score-number">{{ gds_isComplete ? gds_selected : "—" }}</span>
        <span class="score-label">{{ gds_isComplete ? "階段" : "未選取" }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="gds_isComplete ? 'sf-' + severityColor : ''"
          :style="{
            width: gds_isComplete ? ((gds_selected! - 1) / 6) * 100 + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span
          v-for="i in 7"
          :key="i"
          class="tick-abs"
          :style="{ left: ((i - 1) / 6) * 100 + '%', color: tickColor(i) }"
          >{{ i }}</span
        >
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-none" style="left: 0%">正常</span>
        <span class="label-abs lbl-mild2" style="left: 33.3%">輕微</span>
        <span class="label-abs lbl-mod" style="left: 50%">中度</span>
        <span class="label-abs lbl-crit" style="left: 100%">極重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >請根據患者目前的功能狀態，選取最符合的階段描述。共 7 階段，第 1
        階段為正常，第 7 階段為最嚴重。</span
      >
    </div>

    <!-- ── Groups ─────────────────────────────────────────────── -->
    <div v-for="group in gds_groups" :key="group.label" class="gds-group">
      <div class="group-header" :class="group.color + '-header'">
        <div class="group-label-block">
          <span class="group-label">{{ group.label }}</span>
          <span class="group-sub">{{ group.sub }}</span>
        </div>
        <span class="group-score-pill" :class="group.color + '-pill'">
          {{ group.ids.length }} 階段
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="id in group.ids"
          :key="id"
          class="gds-item"
          :class="[gds_selected === id ? 'selected' : '', gds_stages[id - 1].color]"
          @click="gds_select(id)"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="gds_stages[id - 1].color + '-qnum'"
                >S{{ id }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ gds_stages[id - 1].title }}</span>
              <span class="item-sub">{{ gds_stages[id - 1].sub }}</span>
            </div>
            <span
              class="item-score"
              :class="
                gds_selected === id ? gds_stages[id - 1].color + '-score' : 'unanswered'
              "
            >
              {{ gds_selected === id ? "✓" : "—" }}
            </span>
          </div>
          <div class="gds-symptoms">
            <div
              v-for="s in gds_stages[id - 1].symptoms"
              :key="s"
              class="symptom-row"
            >
              <span class="symptom-dot">·</span>
              <span class="symptom-text">{{ s }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div v-if="gds_isComplete" class="gds-result" :class="'res-' + severityColor">
      <div class="result-left">
        <span class="result-number">{{ gds_selected }}</span>
        <span class="result-max">/ 7</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ result!.title }}</span>
        <span class="result-advice">{{ result!.sub }}</span>
        <span class="result-calc"
          >GDS 第 {{ gds_selected }} 階段 · {{ severityLabel }}</span
        >
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="gds_showResults && gds_isComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <div class="detail-row">
        <span class="detail-qnum">S{{ result!.id }}</span>
        <span class="detail-domain">{{ result!.title }}</span>
        <span class="detail-score brand">{{ result!.id }} / 7</span>
        <span class="detail-desc">{{ result!.sub.slice(0, 20) }}...</span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">GDS 整體退化</span>
        <span class="detail-score brand">{{ result!.id }} / 7</span>
        <span class="detail-desc">{{ severityShort }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="gds-actions">
      <button
        class="btn-view"
        @click="gds_showResults = !gds_showResults"
        :disabled="!gds_isComplete"
      >
        {{ gds_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="gds_copyMarkdown" :disabled="!gds_isComplete">
        {{ gds_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="gds_reset">重置</button>
    </div>
    <p v-if="!gds_isComplete" class="progress-hint">請選取一個階段以查看結果</p>
  </div>

  <div v-show="activeTab === 'npi'" class="npi">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="npi-header">
      <div class="header-title">
        <h2 class="title">NPI 神經精神症狀量表</h2>
        <p class="subtitle">Neuropsychiatric Inventory · 失智症行為症狀評估</p>
      </div>
      <div class="score-badge" :class="npi_severity.color">
        <span class="score-number">{{ npi_totalScore }}</span>
        <span class="score-label">{{ npi_severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="npi_severity.color"
          :style="{ width: Math.min((npi_totalScore / 120) * 100, 100) + '%' }"
        />
      </div>
      <div class="severity-ticks-abs">
        <span class="tick-abs t-normal" style="left: 0%">0</span>
        <span class="tick-abs t-mild" style="left: 10%">12</span>
        <span class="tick-abs t-moderate" style="left: 30%">36</span>
        <span class="tick-abs t-severe" style="left: 100%">120</span>
      </div>
      <div class="severity-labels-abs">
        <span class="label-abs lbl-normal" style="left: 0%">無症狀</span>
        <span class="label-abs lbl-mild" style="left: 10%">輕度</span>
        <span class="label-abs lbl-moderate" style="left: 30%">中度</span>
        <span class="label-abs lbl-severe" style="left: 100%">重度</span>
      </div>
    </div>

    <!-- ── Intro ──────────────────────────────────────────────── -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span>
        每個項目先判斷有無症狀，若有則評估 <strong>頻率</strong>（1–4）與
        <strong>嚴重性</strong>（1–3）。該項得分 = 頻率 × 嚴重性。
      </span>
    </div>

    <!-- ── Group ──────────────────────────────────────────────── -->
    <div class="npi-group">
      <div class="group-header">
        <div class="group-label-block">
          <span class="group-label">神經精神症狀領域</span>
          <span class="group-sub">Neuropsychiatric Domains · 10 項</span>
        </div>
      </div>

      <div class="item-list">
        <div
          v-for="domain in npi_domains"
          :key="domain.key"
          class="npi-item"
          :class="{
            answered: npi_selections[domain.key].present !== null,
            absent: npi_selections[domain.key].present === false,
          }"
        >
          <!-- ── Item header ─────────────────────── -->
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ domain.name }}</span>
              <span class="item-sub">{{ domain.sub }}</span>
            </div>
            <div class="yn-row">
              <button
                class="yn-btn"
                :class="{
                  'yn-active': npi_selections[domain.key].present === true,
                }"
                @click="togglePresent(domain.key, true)"
              >
                有
              </button>
              <button
                class="yn-btn"
                :class="{
                  'yn-active': npi_selections[domain.key].present === false,
                }"
                @click="togglePresent(domain.key, false)"
              >
                無
              </button>
            </div>
          </div>

          <!-- ── Frequency & severity ────────────── -->
          <div
            v-if="npi_selections[domain.key].present === true"
            class="sub-options"
          >
            <div class="sub-section">
              <div class="sub-label">頻率 Frequency</div>
              <div class="sec-options">
                <label
                  v-for="opt in frequencyOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{
                    'opt-selected':
                      npi_selections[domain.key].frequency === opt.value,
                  }"
                >
                  <input
                    type="radio"
                    :name="`${domain.key}_freq`"
                    :value="opt.value"
                    v-model="npi_selections[domain.key].frequency"
                  />
                  <div
                    class="opt-radio"
                    :class="{
                      selected:
                        npi_selections[domain.key].frequency === opt.value,
                    }"
                  >
                    <div
                      class="opt-dot"
                      v-if="npi_selections[domain.key].frequency === opt.value"
                    />
                  </div>
                  <div class="opt-content">
                    <span class="opt-score-badge">{{ opt.value }}</span>
                    <span class="opt-text">{{ opt.label }}</span>
                  </div>
                </label>
              </div>
            </div>
            <div class="sub-section">
              <div class="sub-label">嚴重性 Severity</div>
              <div class="yn-row yn-row-left">
                <button
                  v-for="opt in severityOptions"
                  :key="opt.value"
                  class="yn-btn"
                  :class="{
                    'yn-active':
                      npi_selections[domain.key].severity === opt.value,
                  }"
                  @click="npi_selections[domain.key].severity = opt.value"
                >
                  {{ opt.desc }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="npi-result" :class="npi_severity.color">
      <div class="result-left">
        <span class="result-number">{{ npi_totalScore }}</span>
        <span class="result-max">/ 120</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ npi_severity.level }}</span>
        <span class="result-advice">
          <template v-if="npi_totalScore === 0">尚無評分項目或全部無症狀</template>
          <template v-else-if="npi_totalScore <= 12"
            >輕度神經精神症狀，持續觀察</template
          >
          <template v-else-if="npi_totalScore <= 36"
            >中度症狀，建議評估藥物或非藥物介入</template
          >
          <template v-else>重度症狀，建議積極治療與照護計劃</template>
        </span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="npi_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="domain in npi_domains" :key="domain.key" class="detail-row">
        <span class="detail-domain">{{ domain.name }}</span>
        <span class="detail-score">
          <template v-if="npi_selections[domain.key].present === null">—</template>
          <template v-else-if="!npi_selections[domain.key].present">無</template>
          <template v-else>{{ domainScore(domain.key) }}</template>
        </span>
        <span class="detail-desc">
          <template v-if="npi_selections[domain.key].present === true">
            頻率 {{ npi_selections[domain.key].frequency ?? "-" }} × 嚴重性
            {{ npi_selections[domain.key].severity ?? "-" }}
          </template>
        </span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="npi-actions">
      <button class="btn-view" @click="npi_showResults = !npi_showResults">
        {{ npi_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="npi_copyMarkdown">
        {{ npi_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="npi_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'cmai'" class="cmai">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cmai-header">
      <div class="header-title">
        <h2 class="title">CMAI 激動情緒行為量表</h2>
        <p class="subtitle">
          Cohen-Mansfield Agitation Inventory · 過去兩週行為頻率評估
        </p>
      </div>
      <div class="score-badge" :class="'sb-' + cmai_severity.color">
        <span class="score-number">{{ cmai_totalScore }}</span>
        <span class="score-label">{{ cmai_severity.level }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="'sf-' + cmai_severity.color"
          :style="{
            width: Math.min(((cmai_totalScore - 29) / (203 - 29)) * 100, 100) + '%',
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
            answered: cmai_selections[item.key] > 1,
            flagged: cmai_selections[item.key] >= 4,
          }"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="subscaleDefs[sk].color + '-qnum'">
                Q{{ cmai_qIndex[item.key] }}
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
                zero: cmai_selections[item.key] === 1,
                high: cmai_selections[item.key] >= 4,
              }"
            >
              {{ cmai_selections[item.key] }}
            </span>
          </div>

          <div class="sec-options">
                <label
                  v-for="opt in freqOptions"
                  :key="opt.value"
                  class="sec-opt"
                  :class="{ 'opt-selected': cmai_selections[item.key] === opt.value }"
                >
                  <input
                    type="radio"
                    :name="item.key"
                    :value="opt.value"
                    v-model="cmai_selections[item.key]"
                  />
                  <div
                    class="opt-radio"
                    :class="{ selected: cmai_selections[item.key] === opt.value }"
                  >
                    <div class="opt-dot" v-if="cmai_selections[item.key] === opt.value" />
                  </div>
                  <div class="opt-content">
                    <span class="opt-score-badge">{{ opt.label }}</span>
                    <span class="opt-text">{{ opt.desc }}</span>
                  </div>
                </label>
              </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cmai-result" :class="'res-' + cmai_severity.color">
      <div class="result-left">
        <span class="result-number">{{ cmai_totalScore }}</span>
        <span class="result-max">/ 203</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ cmai_severity.level }}</span>
        <span class="result-advice">{{ cmai_severity.advice }}</span>
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
    <div v-if="cmai_showResults" class="results-detail">
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
          <span class="detail-qnum">Q{{ cmai_qIndex[item.key] }}</span>
          <span class="detail-domain">{{ item.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: cmai_selections[item.key] === 1,
              high: cmai_selections[item.key] >= 4,
              brand: cmai_selections[item.key] > 1 && cmai_selections[item.key] < 4,
            }"
          >
            {{ cmai_selections[item.key] }}
          </span>
          <span class="detail-desc">
            {{
              freqOptions.find((o) => o.value === cmai_selections[item.key])?.desc
            }}
          </span>
        </div>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum"></span>
        <span class="detail-domain">CMAI 總分（基準 29）</span>
        <span class="detail-score brand">{{ cmai_totalScore }} / 203</span>
        <span class="detail-desc">{{ cmai_severity.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cmai-actions">
      <button class="btn-view" @click="cmai_showResults = !cmai_showResults">
        {{ cmai_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="cmai_copyMarkdown">
        {{ cmai_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cmai_reset">重置</button>
    </div>
    <p v-if="cmai_answeredCount > 0" class="progress-hint">
      {{ cmai_answeredCount }} 個項目評分 > 1（從未）
    </p>
  </div>
  </div>
</template>

<style scoped>
.cognition {
  max-width: 820px;
  margin: 0 auto;
}

/* Wrapper tab bar — single row with horizontal scroll; scoped with `>` so
   these rules never leak into the tools' internal tab bars */
.cognition > .tab-bar {
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
.cognition > .tab-bar:active {
  cursor: grabbing;
}
.cognition > .tab-bar::-webkit-scrollbar {
  height: 10px;
}
.cognition > .tab-bar::-webkit-scrollbar-thumb {
  background: var(--vp-c-text-3);
  border-radius: 5px;
  border: 2px solid var(--vp-c-bg-mute);
}
.cognition > .tab-bar::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-text-2);
}
.cognition > .tab-bar::-webkit-scrollbar-track {
  background: transparent;
}

.cognition > .tab-bar .tab-btn {
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
.cognition > .tab-bar .tab-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}
.cognition > .tab-bar .tab-btn.active {
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 12%, transparent);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--vp-c-brand-1) 8%, transparent);
}

.cognition > .tab-bar .tab-label {
  display: block;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.02em;
}

.cognition > .tab-bar .tab-sub {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  margin-top: 2px;
  letter-spacing: 0.01em;
}

.cognition > .tab-bar .tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.7;
}

@media (max-width: 640px) {
  .cognition > .tab-bar .tab-btn {
    padding: 0.5rem 0.65rem;
    min-width: 112px;
  }
  .cognition > .tab-bar .tab-label {
    font-size: 0.9rem;
  }
  .cognition > .tab-bar .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ FAST 功能分期（Functional Assessment Staging）══════════════ */

.fast {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.fast /* ── Header ────────────────────────────────────────────────────── */
.fast-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.fast .header-title {
  flex: 1;
  min-width: 0;
}
.fast .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.fast .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.fast .score-badge {
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
.fast .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.fast .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.fast .score-badge.unset {
  color: var(--vp-c-text-3);
}
.fast .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .score-badge.critical {
  border-color: #7c3aed;
  color: #7c3aed;
  box-shadow:
    0 0 0 1px rgba(124, 58, 237, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast /* ── Intro ─────────────────────────────────────────────────────── */
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
.fast .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.fast /* ── Group ─────────────────────────────────────────────────────── */
.fast-group {
  margin-bottom: 1.5rem;
}
.fast .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #22c55e;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.fast .group-header.g-normal-header {
  border-left-color: #22c55e;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.fast .group-header.g-mild-header {
  border-left-color: #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.fast .group-header.g-severe-header {
  border-left-color: #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.fast .group-header.g-critical-header {
  border-left-color: #7c3aed;
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.06);
}
.fast .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.fast .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.fast .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.fast /* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.fast .fast-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.fast .fast-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.fast .fast-item.selected {
  border-color: rgba(99, 102, 241, 0.3);
}
.fast .normal-selected {
  border-color: #22c55e !important;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.fast .mild-selected {
  border-color: #f59e0b !important;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), transparent);
}
.fast .moderate-selected {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
}
.fast .severe-selected {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
}
.fast .critical-selected {
  border-color: #7c3aed !important;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.04), transparent);
}
.fast .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.fast .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.fast .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #22c55e, #16a34a);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.fast .item-qnum.g-normal-qnum {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.fast .item-qnum.g-mild-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.fast .item-qnum.g-severe-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.fast .item-qnum.g-critical-qnum {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.2);
}
.fast .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.fast .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.fast .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.fast .item-score {
  flex-shrink: 0;
  min-width: 40px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
  font-size: 0.95rem;
  font-weight: 800;
}
.fast .item-score .dash {
  color: var(--vp-c-text-3);
}
.fast .item-score .check {
  color: #fff;
  font-size: 1rem;
}
.fast .item-score.active {
  border-width: 1.5px;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.08);
}
.fast .item-score.active.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.fast .item-score.active.mild {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.fast .item-score.active.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.fast .item-score.active.severe {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.fast .item-score.active.critical {
  border-color: #7c3aed;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}
.fast /* ── Stage content (below header) ──────────────────────────────── */
.stage-content {
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
}
.fast .stage-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 6px;
}
.fast .stage-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.fast .meta-item {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.fast .meta-sep {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.fast /* ── Result card ───────────────────────────────────────────────── */
.fast-result {
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
.fast .fast-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .fast-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .fast-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .fast-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .fast-result.critical {
  border-color: #7c3aed;
  box-shadow:
    0 0 0 1px rgba(124, 58, 237, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast .fast-result.unset {
  border-color: var(--vp-c-divider);
}
.fast .result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
}
.fast .result-stage {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fast .normal .result-stage {
  color: #22c55e;
}
.fast .mild .result-stage {
  color: #f59e0b;
}
.fast .moderate .result-stage {
  color: #f97316;
}
.fast .severe .result-stage {
  color: #ef4444;
}
.fast .critical .result-stage {
  color: #7c3aed;
}
.fast .result-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.fast .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.fast .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.fast .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.fast .result-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 2px;
}
.fast .result-meta-item {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
}
.fast /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.fast .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.fast .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.fast .detail-row:last-child {
  border-bottom: none;
}
.fast .detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 80px;
}
.fast .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex: 1;
  text-align: right;
  color: var(--vp-c-text-3);
}
.fast .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.fast .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 128px;
  text-align: left;
}
.fast /* ── Diff note ─────────────────────────────────────────────────── */
.diff-note {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.35);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
}
.fast .diff-dot {
  color: #f59e0b;
  flex-shrink: 0;
}
.fast /* ── Actions ───────────────────────────────────────────────────── */
.fast-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.fast .btn-view,
.fast .btn-copy,
.fast .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.fast .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.fast .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.fast .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.fast .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.fast .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.fast .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.fast .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.fast .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.fast .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.fast .fast-header {
    flex-direction: column;
  }
.fast .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.fast .score-number {
    font-size: 1.5rem;
  }
.fast .fast-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ MMSE 心智狀態（Mini-Mental State）══════════════ */

.mmse {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.mmse /* ── Header ────────────────────────────────────────────────────── */
.mmse-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.mmse .header-title {
  flex: 1;
  min-width: 0;
}
.mmse .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.mmse .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.mmse .score-badge {
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
.mmse .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.mmse .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.mmse .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.mmse .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.mmse .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.mmse .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.mmse .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.mmse .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.mmse .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.mmse .severity-ticks-abs,
.mmse .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.mmse .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.mmse .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mmse .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mmse .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mmse .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mmse .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.mmse .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.mmse .lbl-normal {
  color: #22c55e;
}
.mmse .lbl-mild {
  color: #f59e0b;
}
.mmse .lbl-moderate {
  color: #f97316;
}
.mmse .lbl-severe {
  color: #ef4444;
}
.mmse .t-normal {
  color: #22c55e;
}
.mmse .t-mild {
  color: #f59e0b;
}
.mmse .t-moderate {
  color: #f97316;
}
.mmse .t-severe {
  color: #ef4444;
}
.mmse /* ── Intro ─────────────────────────────────────────────────────── */
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
.mmse .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.mmse /* ── Group ─────────────────────────────────────────────────────── */
.mmse-group {
  margin-bottom: 1.5rem;
}
.mmse .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.mmse .group-header.orient-header {
  border-left-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.mmse .group-header.reg-header {
  border-left-color: #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.mmse .group-header.calc-header {
  border-left-color: #f59e0b;
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.mmse .group-header.recall-header {
  border-left-color: #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.mmse .group-header.lang-header {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.mmse .group-label-block {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.mmse .group-icon {
  font-size: 1.1rem;
  flex-shrink: 0;
}
.mmse .group-text-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.mmse .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mmse .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.mmse .group-score-pill {
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
.mmse .group-score-pill.orient-pill {
  border-color: rgba(59, 130, 246, 0.25);
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.mmse .group-score-pill.reg-pill {
  border-color: rgba(139, 92, 246, 0.25);
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.mmse .group-score-pill.calc-pill {
  border-color: rgba(245, 158, 11, 0.25);
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.mmse .group-score-pill.recall-pill {
  border-color: rgba(20, 184, 166, 0.25);
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.mmse .group-score-pill.lang-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.mmse /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mmse .mmse-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.mmse .mmse-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.mmse .mmse-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.mmse .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.mmse .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.mmse .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.mmse .item-qnum.orient-qnum {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.2);
}
.mmse .item-qnum.reg-qnum {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.2);
}
.mmse .item-qnum.calc-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.mmse .item-qnum.recall-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.mmse .item-qnum.lang-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.mmse .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.mmse .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.mmse .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.mmse .item-score {
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
.mmse .item-score.zero {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.mmse .item-score.high {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.mmse .item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.mmse /* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.mmse .opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.mmse .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.mmse .opt-pill input[type="radio"] {
  display: none;
}
.mmse .opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.mmse .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.mmse /* s1 = correct (green) */
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.mmse .opt-pill.s1:hover:not(.active),
.mmse .opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.mmse .opt-pill.s1.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.mmse .opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.mmse .opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.mmse .opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.mmse .opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.mmse /* s0 = wrong (red) */
.opt-pill.s0 {
  border-color: rgba(239, 68, 68, 0.15);
}
.mmse .opt-pill.s0:hover:not(.active),
.mmse .opt-pill.s0:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.mmse .opt-pill.s0.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.mmse .opt-pill.s0 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.mmse .opt-pill.s0.active .opt-num {
  color: #ef4444;
}
.mmse .opt-pill.s0 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.mmse .opt-pill.s0.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}
.mmse /* ── Result card ───────────────────────────────────────────────── */
.mmse-result {
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
.mmse .mmse-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .mmse-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .mmse-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .mmse-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mmse .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.mmse .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.mmse .mmse-result.normal .result-number {
  color: #22c55e;
}
.mmse .mmse-result.mild .result-number {
  color: #f59e0b;
}
.mmse .mmse-result.moderate .result-number {
  color: #f97316;
}
.mmse .mmse-result.severe .result-number {
  color: #ef4444;
}
.mmse .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.mmse .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mmse .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.mmse .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.mmse .result-progress {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
}
.mmse /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.mmse .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.mmse .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mmse .detail-section-title.orient-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.mmse .detail-section-title.reg-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.mmse .detail-section-title.calc-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.mmse .detail-section-title.recall-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.mmse .detail-section-title.lang-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.mmse .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.mmse .detail-row:last-child {
  border-bottom: none;
}
.mmse .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 32px;
}
.mmse .detail-qnum.orient-qnum-sm {
  color: #3b82f6;
}
.mmse .detail-qnum.reg-qnum-sm {
  color: #8b5cf6;
}
.mmse .detail-qnum.calc-qnum-sm {
  color: #f59e0b;
}
.mmse .detail-qnum.recall-qnum-sm {
  color: #14b8a6;
}
.mmse .detail-qnum.lang-qnum-sm {
  color: #f97316;
}
.mmse .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.mmse .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: #22c55e;
  flex-shrink: 0;
  width: 20px;
  text-align: center;
}
.mmse .detail-score.zero {
  color: #ef4444;
}
.mmse .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 52px;
}
.mmse /* ── Actions ───────────────────────────────────────────────────── */
.mmse-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.mmse .btn-view,
.mmse .btn-copy,
.mmse .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.mmse .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.mmse .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.mmse .btn-view:active {
  transform: translateY(0);
}
.mmse .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.mmse .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.mmse .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.mmse .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.mmse .mmse-header {
    flex-direction: column;
  }
.mmse .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.mmse .score-number {
    font-size: 1.5rem;
  }
.mmse .mmse-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ CDR 臨床失智（Clinical Dementia Rating）══════════════ */

.cdr {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cdr /* ── Header ────────────────────────────────────────────────────── */
.cdr-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.cdr .header-title {
  flex: 1;
  min-width: 0;
}
.cdr .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cdr .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.cdr .score-badge {
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
.cdr .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cdr .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.cdr .score-badge.unset {
  color: var(--vp-c-text-3);
}
.cdr .score-badge.none {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .score-badge.mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .score-badge.mod {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .score-badge.severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .score-badge.crit {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.cdr .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cdr .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cdr .severity-fill.none {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cdr .severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.cdr .severity-fill.mod {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cdr .severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cdr .severity-fill.crit {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cdr .severity-fill.unset {
  background: var(--vp-c-divider);
}
.cdr .severity-ticks-abs,
.cdr .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cdr .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.cdr .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cdr .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cdr .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cdr .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cdr .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cdr .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cdr .lbl-none {
  color: #22c55e;
}
.cdr .lbl-mild {
  color: #84cc16;
}
.cdr .lbl-mod {
  color: #f59e0b;
}
.cdr .lbl-severe {
  color: #f97316;
}
.cdr .lbl-crit {
  color: #ef4444;
}
.cdr .t-none {
  color: #22c55e;
}
.cdr .t-mild {
  color: #84cc16;
}
.cdr .t-mod {
  color: #f59e0b;
}
.cdr .t-severe {
  color: #f97316;
}
.cdr .t-crit {
  color: #ef4444;
}
.cdr /* ── Intro ─────────────────────────────────────────────────────── */
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
.cdr .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.cdr /* ── Domain group ──────────────────────────────────────────────── */
.cdr-domain {
  margin-bottom: 1.5rem;
}
.cdr .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.cdr .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cdr .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cdr .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cdr /* ── Item ──────────────────────────────────────────────────────── */
.cdr-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cdr .cdr-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.cdr .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cdr .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.cdr .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.cdr .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cdr .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.cdr .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cdr .item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.cdr .item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.cdr .item-score.selected {
  color: var(--vp-c-brand-1);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.08);
}
.cdr /* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.cdr .opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  min-width: 80px;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.cdr .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cdr .opt-pill input[type="radio"] {
  display: none;
}
.cdr .opt-num {
  font-size: 0.95rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.cdr .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.cdr /* Score colors — 0 (green) */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.cdr .opt-pill.s0:hover:not(.active),
.cdr .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.cdr .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cdr .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.cdr .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.cdr .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.cdr .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.cdr /* 0.5 → shalf (lime) */
.opt-pill.shalf {
  border-color: rgba(132, 204, 22, 0.15);
}
.cdr .opt-pill.shalf:hover:not(.active),
.cdr .opt-pill.shalf:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.cdr .opt-pill.shalf.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.cdr .opt-pill.shalf .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.cdr .opt-pill.shalf.active .opt-num {
  color: #84cc16;
}
.cdr .opt-pill.shalf .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.cdr .opt-pill.shalf.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.cdr /* 1 (yellow) */
.opt-pill.s1 {
  border-color: rgba(234, 179, 8, 0.15);
}
.cdr .opt-pill.s1:hover:not(.active),
.cdr .opt-pill.s1:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.cdr .opt-pill.s1.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.cdr .opt-pill.s1 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.cdr .opt-pill.s1.active .opt-num {
  color: #eab308;
}
.cdr .opt-pill.s1 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.cdr .opt-pill.s1.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.cdr /* 2 (orange) */
.opt-pill.s2 {
  border-color: rgba(249, 115, 22, 0.15);
}
.cdr .opt-pill.s2:hover:not(.active),
.cdr .opt-pill.s2:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.cdr .opt-pill.s2.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cdr .opt-pill.s2 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.cdr .opt-pill.s2.active .opt-num {
  color: #f97316;
}
.cdr .opt-pill.s2 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.cdr .opt-pill.s2.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}
.cdr /* 3 (red) */
.opt-pill.s3 {
  border-color: rgba(239, 68, 68, 0.15);
}
.cdr .opt-pill.s3:hover:not(.active),
.cdr .opt-pill.s3:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.cdr .opt-pill.s3.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.cdr .opt-pill.s3 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.cdr .opt-pill.s3.active .opt-num {
  color: #ef4444;
}
.cdr .opt-pill.s3 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.cdr .opt-pill.s3.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}
.cdr /* ── Result card ───────────────────────────────────────────────── */
.cdr-result {
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
.cdr .cdr-result.none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .cdr-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .cdr-result.mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .cdr-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .cdr-result.crit {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cdr .result-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.cdr .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cdr .cdr-result.none .result-number {
  color: #22c55e;
}
.cdr .cdr-result.mild .result-number {
  color: #84cc16;
}
.cdr .cdr-result.mod .result-number {
  color: #f59e0b;
}
.cdr .cdr-result.severe .result-number {
  color: #f97316;
}
.cdr .cdr-result.crit .result-number {
  color: #ef4444;
}
.cdr .result-max {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.cdr .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cdr .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cdr .result-sob {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
}
.cdr .result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
}
.cdr /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cdr .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cdr .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cdr .detail-row:last-child {
  border-bottom: none;
}
.cdr .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.cdr .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 28px;
  text-align: center;
}
.cdr .detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  flex: 1;
  text-align: left;
}
.cdr /* ── Actions ───────────────────────────────────────────────────── */
.cdr-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cdr .btn-view,
.cdr .btn-copy,
.cdr .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cdr .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cdr .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cdr .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.cdr .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cdr .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cdr .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cdr .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cdr .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cdr .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cdr .incomplete-hint {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0.5rem 0 0;
}

@media (max-width: 640px) {
.cdr .cdr-header {
    flex-direction: column;
  }
.cdr .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.cdr .score-number {
    font-size: 1.5rem;
  }
.cdr .cdr-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ GDS 整體退化（Global Deterioration Scale）══════════════ */

.gds {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.gds /* ── Header ────────────────────────────────────────────────────── */
.gds-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.gds .header-title {
  flex: 1;
  min-width: 0;
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
  margin: 0;
}
.gds .score-badge {
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
.gds .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.gds .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.gds .sb-unset {
  color: var(--vp-c-text-3);
}
.gds .sb-none {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .sb-mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .sb-mild2 {
  border-color: #eab308;
  color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .sb-mod {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .sb-severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .sb-crit {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.gds .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
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
.gds .sf-none {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.gds .sf-mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.gds .sf-mild2 {
  background: linear-gradient(90deg, #eab308, #facc15);
}
.gds .sf-mod {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.gds .sf-severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.gds .sf-crit {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.gds .severity-ticks-abs,
.gds .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.gds .severity-labels-abs {
  margin-top: 0;
  height: 13px;
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
  white-space: nowrap;
  font-weight: 600;
}
.gds .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.gds .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.gds .lbl-none {
  color: #22c55e;
}
.gds .lbl-mild2 {
  color: #eab308;
}
.gds .lbl-mod {
  color: #f59e0b;
}
.gds .lbl-crit {
  color: #ef4444;
}
.gds /* ── Intro ─────────────────────────────────────────────────────── */
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
.gds .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.gds /* ── Group ─────────────────────────────────────────────────────── */
.gds-group {
  margin-bottom: 1.5rem;
}
.gds .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.gds .group-header.none-header {
  border-left-color: #22c55e;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.gds .group-header.mild2-header {
  border-left-color: #eab308;
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.06);
}
.gds .group-header.severe-header {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.gds .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gds .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.gds .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.gds .group-score-pill {
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
.gds .group-score-pill.none-pill {
  border-color: rgba(34, 197, 94, 0.25);
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.gds .group-score-pill.mild2-pill {
  border-color: rgba(234, 179, 8, 0.25);
  color: #eab308;
  background: rgba(234, 179, 8, 0.06);
}
.gds .group-score-pill.severe-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.gds /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.gds .gds-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  cursor: pointer;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.gds .gds-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.gds .gds-item.selected.none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.15),
    0 2px 10px rgba(34, 197, 94, 0.08);
}
.gds .gds-item.selected.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.15),
    0 2px 10px rgba(132, 204, 22, 0.08);
}
.gds .gds-item.selected.mild2 {
  border-color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.15),
    0 2px 10px rgba(234, 179, 8, 0.08);
}
.gds .gds-item.selected.mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.15),
    0 2px 10px rgba(245, 158, 11, 0.08);
}
.gds .gds-item.selected.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.15),
    0 2px 10px rgba(249, 115, 22, 0.08);
}
.gds .gds-item.selected.crit {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.15),
    0 2px 10px rgba(239, 68, 68, 0.08);
}
.gds .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
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
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.gds .none-qnum {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.gds .mild-qnum {
  background: linear-gradient(135deg, #84cc16, #65a30d);
  box-shadow: 0 1px 3px rgba(132, 204, 22, 0.2);
}
.gds .mild2-qnum {
  background: linear-gradient(135deg, #eab308, #ca8a04);
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.2);
}
.gds .mod-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.gds .severe-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.gds .crit-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
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
  line-height: 1.4;
}
.gds .item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.gds .item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.gds .none-score {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.gds .mild-score {
  color: #84cc16;
  border-color: rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.06);
}
.gds .mild2-score {
  color: #eab308;
  border-color: rgba(234, 179, 8, 0.25);
  background: rgba(234, 179, 8, 0.06);
}
.gds .mod-score {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.06);
}
.gds .severe-score {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.gds .crit-score {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}
.gds /* ── Symptoms ──────────────────────────────────────────────────── */
.gds-symptoms {
  padding: 0.5rem 0.9rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.gds .symptom-row {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
}
.gds .symptom-dot {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  line-height: 1.5;
  flex-shrink: 0;
}
.gds .symptom-text {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.gds .gds-item.selected .symptom-text {
  color: var(--vp-c-text-1);
}
.gds /* ── Result card ───────────────────────────────────────────────── */
.gds-result {
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
.gds .res-none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .res-mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .res-mild2 {
  border-color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .res-mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .res-severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.gds .res-crit {
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
.gds .res-none .result-number {
  color: #22c55e;
}
.gds .res-mild .result-number {
  color: #84cc16;
}
.gds .res-mild2 .result-number {
  color: #eab308;
}
.gds .res-mod .result-number {
  color: #f59e0b;
}
.gds .res-severe .result-number {
  color: #f97316;
}
.gds .res-crit .result-number {
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
.gds .result-calc {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-family: monospace;
}
.gds /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
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
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.gds .detail-row:last-child {
  border-bottom: none;
}
.gds .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.gds .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.gds .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.gds .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.gds .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.gds .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
  text-align: left;
}
.gds /* ── Actions ───────────────────────────────────────────────────── */
.gds-actions {
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
.gds .btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.gds .btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.gds .btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.gds .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.gds .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.gds .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
.gds .severity-labels-abs {
    display: none;
  }
}
/* ══════════════ NPI 精神症狀（Neuropsychiatric Inventory）══════════════ */

.npi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.npi /* ── Header ────────────────────────────────────────────────────── */
.npi-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}
.npi .header-title {
  flex: 1;
  min-width: 0;
}
.npi .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.npi .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.npi .score-badge {
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
.npi .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.npi .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.npi .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.npi .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.npi .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.npi .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.npi .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.npi .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.npi .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.npi .severity-ticks-abs,
.npi .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.npi .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.npi .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.npi .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.npi .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.npi .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.npi .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.npi .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.npi .lbl-normal {
  color: #22c55e;
}
.npi .lbl-mild {
  color: #f59e0b;
}
.npi .lbl-moderate {
  color: #f97316;
}
.npi .lbl-severe {
  color: #ef4444;
}
.npi .t-normal {
  color: #22c55e;
}
.npi .t-mild {
  color: #f59e0b;
}
.npi .t-moderate {
  color: #f97316;
}
.npi .t-severe {
  color: #ef4444;
}
.npi /* ── Intro ─────────────────────────────────────────────────────── */
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
.npi .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.npi /* ── Group ─────────────────────────────────────────────────────── */
.npi-group {
  margin-bottom: 1.5rem;
}
.npi .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.npi .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.npi .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.npi .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.npi /* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.npi .npi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.npi .npi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.npi .npi-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.npi .npi-item.absent {
  border-color: var(--vp-c-divider);
  opacity: 0.6;
}
.npi .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.npi .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.npi .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.npi .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.npi .item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.npi .item-score.zero {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.npi .item-score.high {
  color: var(--vp-c-brand-1);
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.08);
}
.npi .item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.npi /* ── Option pills (ENS6Q style) ────────────────────────────────── */
.option-row {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  padding: 4px;
  background: var(--vp-c-bg-mute);
}
.npi .option-row.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
}
.npi .option-row.three-col {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3px;
}
.npi .option-row.four-col {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 3px;
}
.npi .opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.4rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 6px;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.npi .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.npi .opt-pill input[type="radio"] {
  display: none;
}
.npi .opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.npi .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.35;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.npi /* Presence: yes (green) */
.opt-pill.s-yes {
  border-color: rgba(34, 197, 94, 0.15);
}
.npi .opt-pill.s-yes:hover:not(.active),
.npi .opt-pill.s-yes:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.npi .opt-pill.s-yes.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.npi .opt-pill.s-yes .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.npi .opt-pill.s-yes.active .opt-num {
  color: #22c55e;
}
.npi .opt-pill.s-yes .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.npi .opt-pill.s-yes.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.npi /* Presence: no (gray) */
.opt-pill.s-no {
  border-color: rgba(156, 163, 175, 0.15);
}
.npi .opt-pill.s-no:hover:not(.active),
.npi .opt-pill.s-no:focus-within {
  border-color: rgba(156, 163, 175, 0.35);
  background: rgba(156, 163, 175, 0.04);
}
.npi .opt-pill.s-no.active {
  border-color: #9ca3af;
  background: color-mix(in srgb, rgb(156, 163, 175) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(156, 163, 175, 0.08);
}
.npi .opt-pill.s-no .opt-num {
  color: rgba(156, 163, 175, 0.85);
}
.npi .opt-pill.s-no.active .opt-num {
  color: #9ca3af;
}
.npi .opt-pill.s-no .opt-desc {
  color: rgba(156, 163, 175, 0.7);
}
.npi .opt-pill.s-no.active .opt-desc {
  color: rgba(156, 163, 175, 0.9);
}
.npi /* Frequency/severity: s1 (green) */
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.npi .opt-pill.s1:hover:not(.active),
.npi .opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.npi .opt-pill.s1.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.npi .opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.npi .opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.npi .opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.npi .opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.npi /* s2 (amber) */
.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.npi .opt-pill.s2:hover:not(.active),
.npi .opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.npi .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.npi .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.npi .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.npi .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.npi .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.npi /* s3 (orange) */
.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.npi .opt-pill.s3:hover:not(.active),
.npi .opt-pill.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.npi .opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.npi .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.npi .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.npi .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.npi .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.npi /* s4 (red) */
.opt-pill.s4 {
  border-color: rgba(239, 68, 68, 0.15);
}
.npi .opt-pill.s4:hover:not(.active),
.npi .opt-pill.s4:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.npi .opt-pill.s4.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.npi .opt-pill.s4 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.npi .opt-pill.s4.active .opt-num {
  color: #ef4444;
}
.npi .opt-pill.s4 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.npi .opt-pill.s4.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}
.npi /* ── Sub options (frequency & severity) ────────────────────────── */
.sub-options {
  display: flex;
  flex-direction: column;
}
.npi .sub-section {
  border-bottom: 1px solid var(--vp-c-divider);
}
.npi .sub-section:last-child {
  border-bottom: none;
}
.npi .sub-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  padding: 0.4rem 0.9rem 0;
  letter-spacing: 0.04em;
}
.npi /* ── Result card ───────────────────────────────────────────────── */
.npi-result {
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
.npi .npi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .npi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .npi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .npi-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.npi .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.npi .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.npi .npi-result.normal .result-number {
  color: #22c55e;
}
.npi .npi-result.mild .result-number {
  color: #f59e0b;
}
.npi .npi-result.moderate .result-number {
  color: #f97316;
}
.npi .npi-result.severe .result-number {
  color: #ef4444;
}
.npi .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.npi .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.npi .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.npi .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.npi /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.npi .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.npi .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.npi .detail-row:last-child {
  border-bottom: none;
}
.npi .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.npi .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
  text-align: center;
}
.npi .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 120px;
  text-align: right;
}
.npi /* ── Actions ───────────────────────────────────────────────────── */
.npi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.npi .btn-view,
.npi .btn-copy,
.npi .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.npi .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.npi .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.npi .btn-view:active {
  transform: translateY(0);
}
.npi .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.npi .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.npi .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.npi .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.npi .npi-header {
    flex-direction: column;
  }
.npi .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.npi .score-number {
    font-size: 1.5rem;
  }
.npi .npi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.npi .option-row.four-col {
    grid-template-columns: repeat(2, 1fr);
  }
.npi .option-row.three-col {
    grid-template-columns: repeat(2, 1fr);
  }
}
/* ══════════════ CMAI 激動行為（Cohen-Mansfield Agitation）══════════════ */

.cmai {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cmai /* ── Header ────────────────────────────────────────────────────── */
.cmai-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.cmai .header-title {
  flex: 1;
  min-width: 0;
}
.cmai .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cmai .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.cmai .score-badge {
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
.cmai .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cmai .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.cmai .sb-normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .sb-mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .sb-moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .sb-severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai /* ── Severity bar ──────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 2.5rem;
}
.cmai .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cmai .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cmai .sf-normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cmai .sf-mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cmai .sf-moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cmai .sf-severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cmai .severity-ticks-abs,
.cmai .severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cmai .severity-labels-abs {
  margin-top: 0;
  height: 13px;
}
.cmai .tick-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cmai .tick-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cmai .tick-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cmai .label-abs {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cmai .label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.cmai .label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.cmai .lbl-low {
  color: #22c55e;
}
.cmai .lbl-mid {
  color: #f59e0b;
}
.cmai .lbl-high {
  color: #ef4444;
}
.cmai .t-mid {
  color: #f59e0b;
  font-weight: 700;
}
.cmai .t-high {
  color: #ef4444;
  font-weight: 700;
}
.cmai /* ── Intro ─────────────────────────────────────────────────────── */
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
.cmai .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
.cmai /* ── Group ─────────────────────────────────────────────────────── */
.cmai-group {
  margin-bottom: 1.5rem;
}
.cmai .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.cmai .pa-header {
  border-left-color: #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.cmai .pna-header {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.cmai .vb-header {
  border-left-color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.cmai .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cmai .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cmai .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cmai .group-score-pill {
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
.cmai .pa-pill.group-score-pill {
  border-color: rgba(239, 68, 68, 0.25);
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.cmai .pna-pill.group-score-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.cmai .vb-pill.group-score-pill {
  border-color: rgba(99, 102, 241, 0.25);
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.cmai /* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.cmai .cmai-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.25s,
    box-shadow 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.cmai .cmai-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.cmai .cmai-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
}
.cmai .cmai-item.flagged {
  border-color: rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
}
.cmai .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cmai .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 3px;
}
.cmai .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.cmai .pa-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.cmai .pna-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.cmai .vb-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.cmai .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cmai .item-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.cmai .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.cmai .item-hint {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.cmai .item-score {
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
.cmai .item-score.zero {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.cmai .item-score.high {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}
.cmai /* ── Option row — 7 columns (1–7) ──────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.cmai .opt-pill {
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
.cmai .opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cmai .opt-pill input[type="radio"] {
  display: none;
}
.cmai .opt-num {
  font-size: 0.9rem;
  font-weight: 900;
  transition: color 0.2s;
}
.cmai .opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.cmai /* Score-specific colors — s1 through s7 */
.opt-pill.s1 {
  border-color: rgba(34, 197, 94, 0.15);
}
.cmai .opt-pill.s1:hover:not(.active),
.cmai .opt-pill.s1:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.cmai .opt-pill.s1.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.cmai .opt-pill.s2 {
  border-color: rgba(132, 204, 22, 0.15);
}
.cmai .opt-pill.s2:hover:not(.active),
.cmai .opt-pill.s2:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.cmai .opt-pill.s2.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.cmai .opt-pill.s3 {
  border-color: rgba(234, 179, 8, 0.15);
}
.cmai .opt-pill.s3:hover:not(.active),
.cmai .opt-pill.s3:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.cmai .opt-pill.s3.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.cmai .opt-pill.s4 {
  border-color: rgba(245, 158, 11, 0.15);
}
.cmai .opt-pill.s4:hover:not(.active),
.cmai .opt-pill.s4:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.cmai .opt-pill.s4.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.cmai .opt-pill.s5 {
  border-color: rgba(249, 115, 22, 0.15);
}
.cmai .opt-pill.s5:hover:not(.active),
.cmai .opt-pill.s5:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.cmai .opt-pill.s5.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.cmai .opt-pill.s6 {
  border-color: rgba(234, 88, 12, 0.15);
}
.cmai .opt-pill.s6:hover:not(.active),
.cmai .opt-pill.s6:focus-within {
  border-color: rgba(234, 88, 12, 0.35);
  background: rgba(234, 88, 12, 0.04);
}
.cmai .opt-pill.s6.active {
  border-color: #ea580c;
  background: color-mix(in srgb, rgb(234, 88, 12) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 88, 12, 0.08);
}
.cmai .opt-pill.s7 {
  border-color: rgba(239, 68, 68, 0.15);
}
.cmai .opt-pill.s7:hover:not(.active),
.cmai .opt-pill.s7:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.cmai .opt-pill.s7.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.cmai .opt-pill.s1 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.cmai .opt-pill.s1.active .opt-num {
  color: #22c55e;
}
.cmai .opt-pill.s1 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.cmai .opt-pill.s1.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.cmai .opt-pill.s2 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.cmai .opt-pill.s2.active .opt-num {
  color: #84cc16;
}
.cmai .opt-pill.s2 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.cmai .opt-pill.s2.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.cmai .opt-pill.s3 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.cmai .opt-pill.s3.active .opt-num {
  color: #eab308;
}
.cmai .opt-pill.s3 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.cmai .opt-pill.s3.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.cmai .opt-pill.s4 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.cmai .opt-pill.s4.active .opt-num {
  color: #f59e0b;
}
.cmai .opt-pill.s4 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.cmai .opt-pill.s4.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.cmai .opt-pill.s5 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.cmai .opt-pill.s5.active .opt-num {
  color: #f97316;
}
.cmai .opt-pill.s5 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.cmai .opt-pill.s5.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}
.cmai .opt-pill.s6 .opt-num {
  color: rgba(234, 88, 12, 0.85);
}
.cmai .opt-pill.s6.active .opt-num {
  color: #ea580c;
}
.cmai .opt-pill.s6 .opt-desc {
  color: rgba(234, 88, 12, 0.7);
}
.cmai .opt-pill.s6.active .opt-desc {
  color: rgba(234, 88, 12, 0.9);
}
.cmai .opt-pill.s7 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.cmai .opt-pill.s7.active .opt-num {
  color: #ef4444;
}
.cmai .opt-pill.s7 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.cmai .opt-pill.s7.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}
.cmai /* ── Result card ───────────────────────────────────────────────── */
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
.cmai .res-normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .res-mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .res-moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .res-severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cmai .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.cmai .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cmai .res-normal .result-number {
  color: #22c55e;
}
.cmai .res-mild .result-number {
  color: #f59e0b;
}
.cmai .res-moderate .result-number {
  color: #f97316;
}
.cmai .res-severe .result-number {
  color: #ef4444;
}
.cmai .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.cmai .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.cmai .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cmai .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cmai .result-flag {
  font-size: 0.78rem;
  font-weight: 600;
  color: #ef4444;
}
.cmai .result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.cmai .breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.cmai .pa-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.cmai .pna-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.cmai .vb-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.cmai /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cmai .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cmai .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cmai .pa-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}
.cmai .pna-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.cmai .vb-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.cmai .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cmai .detail-row:last-child {
  border-bottom: none;
}
.cmai .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.cmai .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.cmai .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.cmai .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.cmai .detail-score.zero {
  color: var(--vp-c-text-3);
}
.cmai .detail-score.high {
  color: #ef4444;
}
.cmai .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.cmai .detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}
.cmai /* ── Actions ───────────────────────────────────────────────────── */
.cmai-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.cmai .btn-view,
.cmai .btn-copy,
.cmai .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cmai .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cmai .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cmai .btn-view:active {
  transform: translateY(0);
}
.cmai .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cmai .btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.cmai .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cmai .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cmai .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.cmai .cmai-header {
    flex-direction: column;
  }
.cmai .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.cmai .score-number {
    font-size: 1.5rem;
  }
.cmai .cmai-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.cmai .opt-desc {
    display: none;
  }
.cmai .severity-labels-abs {
    display: none;
  }
.cmai .detail-desc {
    width: 52px;
  }
.cmai .option-row {
    grid-template-columns: repeat(4, 1fr);
  }
.cmai .opt-pill:nth-child(4) {
    border-right: none;
  }
.cmai .opt-pill:nth-child(4) ~ .opt-pill {
    border-top: 1px solid var(--vp-c-divider);
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.cognition .score-badge {
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
.cognition .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.cognition .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.cognition .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.cognition .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.cognition .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.cognition .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.cognition .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.cognition .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.cognition .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .cognition .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}


/* ══════════════ Shared typography（六工具字級統一）══════════════ */
.cognition .detail-desc {
  font-size: 0.78rem !important;
}
.cognition .detail-domain {
  font-size: 0.8rem !important;
}
.cognition .item-score {
  font-size: 1.1rem !important;
}
.cognition .meta-item,
.cognition .meta-sep {
  font-size: 0.76rem !important;
}
.mmse .item-header,
.npi .item-header {
  align-items: center;
}
.npi .yn-row-left {
  justify-content: flex-start;
  padding: 0.25rem 0 0.5rem;
}
</style>
