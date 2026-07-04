<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"lbp" | "nps">("lbp");

// ══════════════ LBP 腰痛評估（Low Back Pain Decision Tree）══════════════

// Low Back Pain Evaluation TreeCalc
// Three-step decision tree: Red Flags → Nerve Root → Yellow Flags → Non-specific LBP

const redFlags = [
  {
    key: "rf1",
    text: "年齡 < 20 歲或 > 55 歲（首次發作）",
    hint: "極年輕或年長的首次腰痛需排除特殊病因",
  },
  {
    key: "rf2",
    text: "非機械性疼痛（與活動無關、夜間持續疼痛）",
    hint: "休息或臥床後未改善，甚至夜間加劇",
  },
  { key: "rf3", text: "胸部疼痛", hint: "伴隨胸痛需排除主動脈或脊椎病變" },
  {
    key: "rf4",
    text: "有癌症、HIV 或使用類固醇病史",
    hint: "轉移性脊椎癌、感染性脊椎炎風險增加",
  },
  { key: "rf5", text: "不明原因體重減輕", hint: "惡性腫瘤的系統性表現" },
  {
    key: "rf6",
    text: "廣泛神經功能障礙",
    hint: "馬尾症候群：大小便失禁、鞍區感覺喪失",
  },
  { key: "rf7", text: "脊椎結構性變形", hint: "驟然出現的脊椎畸形" },
  {
    key: "rf8",
    text: "外傷史（強力撞擊或骨質疏鬆患者輕微外傷）",
    hint: "椎體骨折風險",
  },
];

const nerveRootQ = [
  {
    key: "nr1",
    text: "下肢放射痛（坐骨神經痛模式）",
    hint: "疼痛沿神經根分佈放射至大腿、小腿或足部",
  },
  {
    key: "nr2",
    text: "皮節感覺異常（麻木、刺痛）",
    hint: "特定皮節分佈的感覺減退或異感",
  },
  {
    key: "nr3",
    text: "直腿抬高試驗（SLR）陽性",
    hint: "抬腿 30–70° 時腿部疼痛重現",
  },
  {
    key: "nr4",
    text: "肌力減退或反射改變",
    hint: "踝反射/膝反射減弱，或肌力下降",
  },
];

const yellowFlags = [
  {
    key: "yf1",
    text: "對疼痛有負面信念或災難化思考",
    hint: "認為疼痛代表嚴重損傷，恐懼運動",
  },
  {
    key: "yf2",
    text: "迴避行為（因恐懼而減少活動）",
    hint: "Fear-avoidance 行為模式",
  },
  {
    key: "yf3",
    text: "社會支持不足或工作壓力大",
    hint: "社會心理因素影響預後",
  },
  {
    key: "yf4",
    text: "情緒困擾、憂鬱或焦慮",
    hint: "共病情緒問題影響疼痛慢性化",
  },
];

// ── State ──────────────────────────────────────────────────────────
const rfAnswers = ref<Record<string, boolean | null>>(
  Object.fromEntries(redFlags.map((q) => [q.key, null])),
);
const nrAnswers = ref<Record<string, boolean | null>>(
  Object.fromEntries(nerveRootQ.map((q) => [q.key, null])),
);
const yfAnswers = ref<Record<string, boolean | null>>(
  Object.fromEntries(yellowFlags.map((q) => [q.key, null])),
);
const duration = ref<"acute" | "subacute" | "chronic" | null>(null);
const lbp_copied = ref(false);
const lbp_showResults = ref(false);

// ── Computed ───────────────────────────────────────────────────────
const rfCount = computed(
  () => redFlags.filter((q) => rfAnswers.value[q.key] === true).length,
);
const nrCount = computed(
  () => nerveRootQ.filter((q) => nrAnswers.value[q.key] === true).length,
);
const yfCount = computed(
  () => yellowFlags.filter((q) => yfAnswers.value[q.key] === true).length,
);

const allAnswered = computed(
  () =>
    redFlags.every((q) => rfAnswers.value[q.key] !== null) &&
    nerveRootQ.every((q) => nrAnswers.value[q.key] !== null) &&
    yellowFlags.every((q) => yfAnswers.value[q.key] !== null) &&
    duration.value !== null,
);

const classification = computed(() => {
  if (!allAnswered.value) return null;

  if (rfCount.value >= 1)
    return {
      category: "red",
      label: "警示徵象（Red Flags）",
      color: "severe",
      action:
        "需要進一步影像學及實驗室檢查排除嚴重病因（腫瘤、感染、骨折、馬尾症候群）",
      detail: `偵測到 ${rfCount.value} 項警示徵象，建議優先安排脊椎 X 光、MRI，必要時轉診外科`,
      mgmt: "緊急評估：血液檢查（CBC、ESR、CRP）、脊椎影像學，針對病因治療",
    };

  if (nrCount.value >= 2)
    return {
      category: "orange",
      label: "神經根壓迫（Nerve Root Pain）",
      color: "moderate",
      action: "神經根性腰痛，建議保守治療 4–6 週，未改善再考慮影像學",
      detail: `${nrCount.value} 項神經根徵象，最可能為椎間盤突出或椎管狹窄引起的神經根病變`,
      mgmt: "保守治療：鎮痛藥、神經痛用藥（Gabapentin）、物理治療；若 6 週未改善安排 MRI",
    };

  if (yfCount.value >= 2)
    return {
      category: "yellow",
      label: "非特異性腰痛 + 心理社會因素",
      color: "mild",
      action: "非特異性腰痛合併慢性化風險因子，需同時處理身體和心理社會層面",
      detail: `偵測到 ${yfCount.value} 項黃色警示，慢性化風險增加，建議多學科介入`,
      mgmt: "認知行為治療（CBT）、運動治療、疼痛衛教；避免不必要影像學",
    };

  const durationNote =
    duration.value === "acute"
      ? "急性（< 6 週）"
      : duration.value === "subacute"
        ? "亞急性（6–12 週）"
        : "慢性（> 12 週）";
  return {
    category: "green",
    label: "非特異性腰痛（Non-Specific LBP）",
    color: "normal",
    action: "大多數患者 6 週內自然緩解，建議積極自我管理，不鼓勵臥床休息",
    detail: `${durationNote}非特異性腰痛，無紅旗徵象，預後良好`,
    mgmt: "保守治療：維持日常活動、熱敷、NSAIDs、物理治療（核心肌群訓練）",
  };
});

function lbp_generateMarkdown() {
  const c = classification.value;
  if (!c) return "";
  const rfLines = redFlags.map(
    (q) => `  ${rfAnswers.value[q.key] ? "✓" : "✗"} ${q.text}`,
  );
  const nrLines = nerveRootQ.map(
    (q) => `  ${nrAnswers.value[q.key] ? "✓" : "✗"} ${q.text}`,
  );
  const yfLines = yellowFlags.map(
    (q) => `  ${yfAnswers.value[q.key] ? "✓" : "✗"} ${q.text}`,
  );
  return (
    `# 腰痛評估決策樹\n\n` +
    `## 疼痛持續時間\n\n${duration.value === "acute" ? "急性（< 6 週）" : duration.value === "subacute" ? "亞急性（6–12 週）" : "慢性（> 12 週）"}\n\n` +
    `## 警示徵象（Red Flags）— ${rfCount.value}/${redFlags.length} 陽性\n\n${rfLines.join("\n")}\n\n` +
    `## 神經根徵象（Nerve Root）— ${nrCount.value}/${nerveRootQ.length} 陽性\n\n${nrLines.join("\n")}\n\n` +
    `## 心理社會因素（Yellow Flags）— ${yfCount.value}/${yellowFlags.length} 陽性\n\n${yfLines.join("\n")}\n\n` +
    `## 分類結果\n\n` +
    `- **分類：${c.label}**\n` +
    `- 建議：${c.action}\n` +
    `- 說明：${c.detail}\n` +
    `- 處置：${c.mgmt}`
  );
}

async function lbp_copyMarkdown() {
  await navigator.clipboard.writeText(lbp_generateMarkdown());
  lbp_copied.value = true;
  setTimeout(() => (lbp_copied.value = false), 2000);
}

function lbp_reset() {
  redFlags.forEach((q) => (rfAnswers.value[q.key] = null));
  nerveRootQ.forEach((q) => (nrAnswers.value[q.key] = null));
  yellowFlags.forEach((q) => (yfAnswers.value[q.key] = null));
  duration.value = null;
  lbp_showResults.value = false;
}

// ══════════════ 神經性疼痛量表（Neuropathic Pain Scale）══════════════

// Neuropathic Pain Scale (NPS) — Galer & Jensen 1997
// 10 items, each rated 0–10 (0 = absent, 10 = most intense imaginable)
// Total 0–100

const items = [
  {
    key: "q1",
    num: 1,
    group: "global",
    text: "疼痛強度（Pain Intensity）",
    desc: "請評估您現在的疼痛有多強烈",
    anchorL: "無疼痛",
    anchorR: "最劇烈",
    color: "#ef4444",
  },
  {
    key: "q2",
    num: 2,
    group: "global",
    text: "疼痛的不愉快程度（Pain Unpleasantness）",
    desc: "請評估您的疼痛令您感到多不愉快或多困擾",
    anchorL: "不困擾",
    anchorR: "極度困擾",
    color: "#ef4444",
  },
  {
    key: "q3",
    num: 3,
    group: "quality",
    text: "銳痛感（Sharp Pain）",
    desc: "請評估您疼痛中「刺痛、針刺感」的程度",
    anchorL: "無刺痛",
    anchorR: "極度刺痛",
    color: "#8b5cf6",
  },
  {
    key: "q4",
    num: 4,
    group: "quality",
    text: "熱燒灼感（Hot Pain）",
    desc: "請評估您疼痛中「熱燙、燒灼感」的程度",
    anchorL: "無燒灼",
    anchorR: "極度燒灼",
    color: "#f97316",
  },
  {
    key: "q5",
    num: 5,
    group: "quality",
    text: "冷痛感（Cold Pain）",
    desc: "請評估您疼痛中「冰冷、凍傷感」的程度",
    anchorL: "無冷痛",
    anchorR: "極度冷痛",
    color: "#3b82f6",
  },
  {
    key: "q6",
    num: 6,
    group: "quality",
    text: "敏感度（Sensitive to Touch）",
    desc: "請評估皮膚對輕觸的敏感或疼痛程度",
    anchorL: "無敏感",
    anchorR: "極度敏感",
    color: "#8b5cf6",
  },
  {
    key: "q7",
    num: 7,
    group: "quality",
    text: "搔癢感（Itchy Pain）",
    desc: "請評估您疼痛中「搔癢感」的程度",
    anchorL: "無搔癢",
    anchorR: "極度搔癢",
    color: "#14b8a6",
  },
  {
    key: "q8",
    num: 8,
    group: "temporal",
    text: "時間特性：持續性（Temporal – Unrelenting）",
    desc: "請評估您的疼痛持續不斷的程度",
    anchorL: "非持續",
    anchorR: "完全持續",
    color: "#ef4444",
  },
  {
    key: "q9",
    num: 9,
    group: "temporal",
    text: "時間特性：陣發性（Temporal – Breakthrough）",
    desc: "請評估疼痛突然陣發（突破痛）的嚴重程度",
    anchorL: "無陣發",
    anchorR: "極重陣發",
    color: "#f97316",
  },
  {
    key: "q10",
    num: 10,
    group: "spatial",
    text: "空間特性：深層或表淺（Deep / Surface Pain）",
    desc: "請評估您的疼痛位於深層還是表淺（10 = 完全深層）",
    anchorL: "完全表淺",
    anchorR: "完全深層",
    color: "#14b8a6",
  },
];

const groups = [
  {
    id: "global",
    label: "全局評估",
    sub: "Global Assessment",
    color: "#ef4444",
    keys: ["q1", "q2"],
    max: 20,
  },
  {
    id: "quality",
    label: "疼痛性質",
    sub: "Pain Quality",
    color: "#8b5cf6",
    keys: ["q3", "q4", "q5", "q6", "q7"],
    max: 50,
  },
  {
    id: "temporal",
    label: "時間特性",
    sub: "Temporal Characteristics",
    color: "#f97316",
    keys: ["q8", "q9"],
    max: 20,
  },
  {
    id: "spatial",
    label: "空間特性",
    sub: "Spatial Characteristics",
    color: "#14b8a6",
    keys: ["q10"],
    max: 10,
  },
];

const scores = ref<Record<string, number | null>>(
  Object.fromEntries(items.map((q) => [q.key, null])),
);
const nps_copied = ref(false);
const nps_showResults = ref(false);

const answeredCount = computed(
  () => items.filter((q) => scores.value[q.key] !== null).length,
);
const isComplete = computed(() => answeredCount.value === 10);

const total = computed(() => {
  if (!isComplete.value) return null;
  return items.reduce((sum, q) => sum + (scores.value[q.key] ?? 0), 0);
});

function groupScore(keys: string[]) {
  return keys.reduce((s, k) => s + (scores.value[k] ?? 0), 0);
}

const severity = computed(() => {
  const t = total.value;
  if (t === null) return { label: "—", color: "filling" };
  if (t <= 20) return { label: "輕度神經性疼痛", color: "normal" };
  if (t <= 40) return { label: "中度神經性疼痛", color: "mild" };
  if (t <= 60) return { label: "中重度神經性疼痛", color: "moderate" };
  return { label: "重度神經性疼痛", color: "severe" };
});

function setScore(key: string, val: number) {
  scores.value[key] = Math.round(val * 10) / 10;
}

function nps_generateMarkdown() {
  const lines = items.map(
    (q) =>
      `  Q${q.num.toString().padStart(2, "0")} ${q.text}：${scores.value[q.key] ?? "—"} / 10`,
  );
  return (
    `# 神經性疼痛量表（NPS）\n\n` +
    `## 各項評分\n\n${lines.join("\n")}\n\n` +
    `## 分組分數\n\n` +
    groups
      .map((g) => `- ${g.label}：${groupScore(g.keys)} / ${g.max}`)
      .join("\n") +
    `\n\n## 結果\n\n` +
    `- **NPS 總分 = ${total.value ?? "—"} / 100**\n` +
    `- 嚴重程度：${severity.value.label}`
  );
}

async function nps_copyMarkdown() {
  await navigator.clipboard.writeText(nps_generateMarkdown());
  nps_copied.value = true;
  setTimeout(() => (nps_copied.value = false), 2000);
}

function nps_reset() {
  items.forEach((q) => (scores.value[q.key] = null));
  nps_showResults.value = false;
}
</script>

<template>
  <div class="painassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'lbp' }"
        @click="activeTab = 'lbp'"
      >
        <span class="tab-label">腰痛評估</span>
        <span class="tab-sub">Low Back Pain Decision Tree</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'nps' }"
        @click="activeTab = 'nps'"
      >
        <span class="tab-label">神經性疼痛量表</span>
        <span class="tab-sub">Neuropathic Pain Scale</span>
      </button>
    </div>

  <div v-show="activeTab === 'lbp'" class="lbp">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="lbp-header">
      <div class="header-title">
        <h2 class="title">Low Back Pain Evaluation 腰痛評估決策樹</h2>
        <p class="subtitle">
          Low Back Pain Evaluation TreeCalc · 三步驟分類評估
        </p>
      </div>
      <!-- Live result badge -->
      <div
        v-if="classification"
        class="score-badge"
        :class="classification.color"
      >
        <span class="sb-icon">{{
          classification.category === "red"
            ? "🚨"
            : classification.category === "orange"
              ? "⚡"
              : classification.category === "yellow"
                ? "⚠"
                : "✓"
        }}</span>
        <span class="sb-label">{{ classification.label }}</span>
      </div>
      <div v-else class="score-badge filling">
        <span class="sb-label">請完成所有問題</span>
      </div>
    </div>

    <!-- ── Section 0: Duration ────────────────────────────────── -->
    <div class="lbp-group">
      <div class="group-header-bar" style="border-left: 3px solid #a855f7">
        <span class="group-icon">🕐</span>
        <span class="group-label-text">疼痛持續時間</span>
        <span class="group-sub-text">Duration of LBP</span>
      </div>
      <div class="dur-row">
        <button
          v-for="d in [
            { val: 'acute', label: '急性', sub: '< 6 週' },
            { val: 'subacute', label: '亞急性', sub: '6–12 週' },
            { val: 'chronic', label: '慢性', sub: '> 12 週' },
          ]"
          :key="d.val"
          class="dur-btn"
          :class="{ active: duration === d.val }"
          @click="duration = d.val as any"
        >
          <span class="dur-label">{{ d.label }}</span>
          <span class="dur-sub">{{ d.sub }}</span>
        </button>
      </div>
    </div>

    <!-- ── Section 1: Red Flags ───────────────────────────────── -->
    <div class="lbp-group">
      <div class="group-header-bar" style="border-left: 3px solid #ef4444">
        <span class="group-icon">🚨</span>
        <span class="group-label-text" style="color: #ef4444"
          >警示徵象篩查（Red Flags）</span
        >
        <span class="group-sub-text">任何一項陽性需進一步評估</span>
        <span
          class="group-score-pill"
          style="color: #ef4444; background: rgba(239, 68, 68, 0.1)"
          >{{ rfCount }}/{{ redFlags.length }}</span
        >
      </div>
      <div class="item-list">
        <div
          v-for="q in redFlags"
          :key="q.key"
          class="lbp-item"
          :class="{
            scored: rfAnswers[q.key] === true,
            'motor-scored': rfAnswers[q.key] === true,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.hint }}</span>
            </div>
            <div class="yn-row">
              <button
                class="yn-btn yn-btn-pos"
                :class="{ 'yn-pos-active': rfAnswers[q.key] === true }"
                @click="rfAnswers[q.key] = true"
              >
                是
              </button>
              <button
                class="yn-btn yn-btn-neg"
                :class="{ 'yn-neg-active': rfAnswers[q.key] === false }"
                @click="rfAnswers[q.key] = false"
              >
                否
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Section 2: Nerve Root ──────────────────────────────── -->
    <div class="lbp-group">
      <div class="group-header-bar" style="border-left: 3px solid #f97316">
        <span class="group-icon">⚡</span>
        <span class="group-label-text" style="color: #f97316"
          >神經根徵象（Nerve Root Signs）</span
        >
        <span class="group-sub-text">≥ 2 項陽性提示神經根壓迫</span>
        <span
          class="group-score-pill"
          style="color: #f97316; background: rgba(249, 115, 22, 0.1)"
          >{{ nrCount }}/{{ nerveRootQ.length }}</span
        >
      </div>
      <div class="item-list">
        <div
          v-for="q in nerveRootQ"
          :key="q.key"
          class="lbp-item"
          :class="{
            scored: nrAnswers[q.key] === true,
            'coord-scored': nrAnswers[q.key] === true,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.hint }}</span>
            </div>
            <div class="yn-row">
              <button
                class="yn-btn yn-btn-pos"
                :class="{ 'yn-pos-active': nrAnswers[q.key] === true }"
                @click="nrAnswers[q.key] = true"
              >
                是
              </button>
              <button
                class="yn-btn yn-btn-neg"
                :class="{ 'yn-neg-active': nrAnswers[q.key] === false }"
                @click="nrAnswers[q.key] = false"
              >
                否
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Section 3: Yellow Flags ───────────────────────────── -->
    <div class="lbp-group">
      <div class="group-header-bar" style="border-left: 3px solid #f59e0b">
        <span class="group-icon">⚠</span>
        <span class="group-label-text" style="color: #f59e0b"
          >心理社會因素（Yellow Flags）</span
        >
        <span class="group-sub-text">評估慢性化風險</span>
        <span
          class="group-score-pill"
          style="color: #f59e0b; background: rgba(245, 158, 11, 0.1)"
          >{{ yfCount }}/{{ yellowFlags.length }}</span
        >
      </div>
      <div class="item-list">
        <div
          v-for="q in yellowFlags"
          :key="q.key"
          class="lbp-item"
          :class="{
            scored: yfAnswers[q.key] === true,
            'lang-scored': yfAnswers[q.key] === true,
          }"
        >
          <div class="item-header">
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.hint }}</span>
            </div>
            <div class="yn-row">
              <button
                class="yn-btn yn-btn-pos"
                :class="{ 'yn-pos-active': yfAnswers[q.key] === true }"
                @click="yfAnswers[q.key] = true"
              >
                是
              </button>
              <button
                class="yn-btn yn-btn-neg"
                :class="{ 'yn-neg-active': yfAnswers[q.key] === false }"
                @click="yfAnswers[q.key] = false"
              >
                否
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div v-if="classification" class="lbp-result" :class="classification.color">
      <div class="result-left">
        <span class="result-icon">{{
          classification.category === "red"
            ? "🚨"
            : classification.category === "orange"
              ? "⚡"
              : classification.category === "yellow"
                ? "⚠"
                : "✓"
        }}</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ classification.label }}</span>
        <span class="result-advice">{{ classification.action }}</span>
        <span class="result-mgmt">{{ classification.mgmt }}</span>
      </div>
    </div>
    <div v-else class="pending-note">請完成所有問題以獲得分類結果</div>

    <!-- ── Results detail (NIHSS pattern) ────────────────────── -->
    <div v-if="lbp_showResults && classification" class="results-detail">
      <div class="results-header">評估明細</div>

      <!-- Red Flags -->
      <div
        class="detail-section-label"
        style="color: #ef4444; background: rgba(239, 68, 68, 0.05)"
      >
        警示徵象（Red Flags）— {{ rfCount }}/{{ redFlags.length }} 陽性
      </div>
      <div v-for="(q, idx) in redFlags" :key="q.key" class="detail-row">
        <span class="detail-qnum">RF{{ idx + 1 }}</span>
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="
            rfAnswers[q.key] === true
              ? 'score-yes'
              : rfAnswers[q.key] === false
                ? 'score-no'
                : 'score-empty'
          "
        >
          {{
            rfAnswers[q.key] === true
              ? "✓ 是"
              : rfAnswers[q.key] === false
                ? "✗ 否"
                : "—"
          }}
        </span>
      </div>

      <!-- Nerve Root -->
      <div
        class="detail-section-label"
        style="color: #f97316; background: rgba(249, 115, 22, 0.05)"
      >
        神經根徵象（Nerve Root）— {{ nrCount }}/{{ nerveRootQ.length }} 陽性
      </div>
      <div v-for="(q, idx) in nerveRootQ" :key="q.key" class="detail-row">
        <span class="detail-qnum">NR{{ idx + 1 }}</span>
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="
            nrAnswers[q.key] === true
              ? 'score-yes'
              : nrAnswers[q.key] === false
                ? 'score-no'
                : 'score-empty'
          "
        >
          {{
            nrAnswers[q.key] === true
              ? "✓ 是"
              : nrAnswers[q.key] === false
                ? "✗ 否"
                : "—"
          }}
        </span>
      </div>

      <!-- Yellow Flags -->
      <div
        class="detail-section-label"
        style="color: #f59e0b; background: rgba(245, 158, 11, 0.05)"
      >
        心理社會因素（Yellow Flags）— {{ yfCount }}/{{ yellowFlags.length }}
        陽性
      </div>
      <div v-for="(q, idx) in yellowFlags" :key="q.key" class="detail-row">
        <span class="detail-qnum">YF{{ idx + 1 }}</span>
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="
            yfAnswers[q.key] === true
              ? 'score-yes'
              : yfAnswers[q.key] === false
                ? 'score-no'
                : 'score-empty'
          "
        >
          {{
            yfAnswers[q.key] === true
              ? "✓ 是"
              : yfAnswers[q.key] === false
                ? "✗ 否"
                : "—"
          }}
        </span>
      </div>

      <!-- Summary row -->
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">分類結果</span>
        <span class="detail-score brand">{{ classification.label }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="lbp-actions">
      <button class="btn-view" @click="lbp_showResults = !lbp_showResults">
        {{ lbp_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!allAnswered" @click="lbp_copyMarkdown">
        {{ lbp_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="lbp_reset">重置</button>
    </div>
  </div>

  <div v-show="activeTab === 'nps'" class="nps">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="nps-header">
      <div class="header-title">
        <h2 class="title">Neuropathic Pain Scale 神經性疼痛量表</h2>
        <p class="subtitle">
          NPS · Galer & Jensen 1997 · 10 項感覺特性評估 · 0–100 分
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="sb-val">{{ total ?? "—" }}</span>
        <span class="sb-max">/ 100</span>
        <span class="sb-tag">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Progress bar ───────────────────────────────────────── -->
    <div class="nps-bar-wrap">
      <div class="nps-bar">
        <div
          class="nps-bar-fill"
          :class="severity.color"
          :style="{ width: total !== null ? total + '%' : '0%' }"
        />
      </div>
      <div class="nps-ticks">
        <span>0</span>
        <span class="t-g">20</span>
        <span class="t-y">40</span>
        <span class="t-o">60</span>
        <span>100</span>
      </div>
    </div>

    <!-- ── Group sub-scores ───────────────────────────────────── -->
    <div class="sub-scores">
      <div
        v-for="g in groups"
        :key="g.id"
        class="ss-pill"
        :style="{ borderColor: g.color + '40' }"
      >
        <span class="ss-l">{{ g.label }}</span>
        <span class="ss-v" :style="{ color: g.color }">{{
          groupScore(g.keys)
        }}</span>
        <span class="ss-u">/ {{ g.max }}</span>
      </div>
      <div class="ss-pill">
        <span class="ss-l">完成度</span>
        <span class="ss-v" style="color: var(--vp-c-brand-1)">{{
          answeredCount
        }}</span>
        <span class="ss-u">/ 10</span>
      </div>
    </div>

    <!-- ── Instruction ────────────────────────────────────────── -->
    <div class="instruction">
      請針對每個疼痛特性，使用滑桿或直接輸入數字評分（0–10）。
      <strong>0 = 完全無此特性，10 = 最嚴重</strong>。
    </div>

    <!-- ── Items ──────────────────────────────────────────────── -->
    <div class="nps-items">
      <div
        v-for="item in items"
        :key="item.key"
        class="nps-item"
        :class="{ answered: scores[item.key] !== null }"
        :style="{ '--item-color': item.color }"
      >
        <div class="ni-header">
          <span class="ni-num" :style="{ background: item.color }">{{
            item.num
          }}</span>
          <div class="ni-text-wrap">
            <span class="ni-title">{{ item.text }}</span>
            <span class="ni-desc">{{ item.desc }}</span>
          </div>
          <div
            class="ni-score-box"
            :class="{ filled: scores[item.key] !== null }"
          >
            <input
              v-model.number="scores[item.key]"
              type="number"
              min="0"
              max="10"
              step="0.5"
              placeholder="0–10"
              class="ni-input"
            />
          </div>
        </div>

        <div class="ni-slider-row">
          <span class="ni-anchor-l">{{ item.anchorL }}</span>
          <div class="ni-track">
            <div
              class="ni-fill"
              :style="{
                width:
                  scores[item.key] !== null
                    ? (scores[item.key]! / 10) * 100 + '%'
                    : '0%',
                background: item.color,
              }"
            />
            <div
              class="ni-thumb"
              v-if="scores[item.key] !== null"
              :style="{
                left: (scores[item.key]! / 10) * 100 + '%',
                background: item.color,
              }"
            />
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              :value="scores[item.key] ?? 0"
              @input="
                setScore(
                  item.key,
                  parseFloat(($event.target as HTMLInputElement).value),
                )
              "
              class="ni-range"
            />
          </div>
          <span class="ni-anchor-r">{{ item.anchorR }}</span>
        </div>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="nps-result" :class="severity.color">
      <div class="nr-left">
        <span class="nr-n">{{ total ?? "—" }}</span>
        <span class="nr-u">/ 100</span>
      </div>
      <div class="nr-right">
        <span class="nr-level">{{ severity.label }}</span>
        <div class="nr-profiles" v-if="isComplete">
          <span
            v-if="(scores['q4'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(249, 115, 22, 0.1); color: #f97316"
            >燒灼痛 ↑</span
          >
          <span
            v-if="(scores['q3'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6"
            >刺痛 ↑</span
          >
          <span
            v-if="(scores['q5'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(59, 130, 246, 0.1); color: #3b82f6"
            >冷痛 ↑</span
          >
          <span
            v-if="(scores['q6'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(139, 92, 246, 0.1); color: #8b5cf6"
            >觸覺敏感 ↑</span
          >
          <span
            v-if="(scores['q9'] ?? 0) >= 5"
            class="np-tag"
            style="background: rgba(249, 115, 22, 0.1); color: #f97316"
            >陣發痛 ↑</span
          >
        </div>
      </div>
    </div>

    <!-- ── Results detail (NIHSS pattern) ────────────────────── -->
    <div v-if="nps_showResults" class="results-detail">
      <div class="results-header">評估明細</div>
      <div v-for="item in items" :key="item.key" class="detail-row">
        <span class="detail-qnum"
          >Q{{ item.num.toString().padStart(2, "0") }}</span
        >
        <span class="detail-domain">{{ item.text }}</span>
        <span
          class="detail-score"
          :class="
            scores[item.key] !== null && scores[item.key]! > 0
              ? 'score-marked'
              : scores[item.key] === 0
                ? 'score-zero'
                : 'score-empty'
          "
          :style="
            scores[item.key] !== null && scores[item.key]! > 0
              ? { color: item.color }
              : {}
          "
        >
          {{ scores[item.key] !== null ? scores[item.key] + " / 10" : "—" }}
        </span>
        <span class="detail-desc">
          {{
            scores[item.key] !== null
              ? scores[item.key]! <= 2
                ? "輕微"
                : scores[item.key]! <= 5
                  ? "中度"
                  : "嚴重"
              : "未評估"
          }}
        </span>
      </div>
      <div class="detail-row total-row">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">NPS 總分</span>
        <span class="detail-score brand">{{ total ?? "—" }} / 100</span>
        <span class="detail-desc">{{ severity.label }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="nps-actions">
      <button class="btn-view" @click="nps_showResults = !nps_showResults">
        {{ nps_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="nps_copyMarkdown">
        {{ nps_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="nps_reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }} / 10 項
    </p>
  </div>
  </div>
</template>

<style scoped>
.painassess {
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

/* ══════════════ LBP 腰痛評估（Low Back Pain Decision Tree）══════════════ */

.lbp {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.lbp /* ── Header ────────────────────────────────────────────────────── */
.lbp-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.lbp .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.lbp .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.lbp .score-badge {
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
.lbp .sb-icon {
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
}
.lbp .sb-label {
  font-size: 0.78rem;
  font-weight: 700;
}
.lbp .score-badge.filling {
  color: var(--vp-c-text-3);
}
.lbp .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp /* ── Duration ──────────────────────────────────────────────────── */
.dur-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-radius: 8px;
}
.lbp .dur-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.6rem 0.15rem;
  text-align: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.lbp .dur-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.lbp .dur-btn.active {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, rgb(99, 102, 241) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.08);
}
.lbp .dur-label {
  font-size: 1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.lbp .dur-sub {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.lbp .dur-btn.active .dur-label {
  color: var(--vp-c-brand-1);
}
.lbp /* ── Groups ────────────────────────────────────────────────────── */
.lbp-group {
  margin-bottom: 1.25rem;
}
.lbp .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.lbp .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.lbp .group-label-text {
  font-size: 0.85rem;
  font-weight: 700;
}
.lbp .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.lbp .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  flex-shrink: 0;
}
.lbp /* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.lbp /* ── Item cards ────────────────────────────────────────────────── */
.lbp-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.lbp .lbp-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.lbp .lbp-item.scored {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.lbp .lbp-item.motor-scored {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
}
.lbp .lbp-item.coord-scored {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
}
.lbp .lbp-item.lang-scored {
  border-color: #f59e0b !important;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), transparent);
}
.lbp .item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.lbp .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.lbp .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.lbp .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
.lbp /* ── Yes/No pills ──────────────────────────────────────────────── */
.yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-radius: 6px;
  flex-shrink: 0;
}
.lbp .yn-btn {
  flex: 1;
  padding: 0.5rem 0.15rem;
  text-align: center;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
  color: var(--vp-c-text-2);
  min-width: 52px;
}
.lbp .yn-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.lbp .yn-btn-pos.yn-pos-active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.lbp .yn-btn-neg.yn-neg-active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
.lbp /* ── Result card ───────────────────────────────────────────────── */
.lbp-result {
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
.lbp .lbp-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .lbp-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .lbp-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .lbp-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp .result-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.lbp .result-icon {
  font-size: 2.2rem;
  line-height: 1;
}
.lbp .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.lbp .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.lbp .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.lbp .result-mgmt {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}
.lbp .pending-note {
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  margin-bottom: 1rem;
}
.lbp /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.lbp .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbp .detail-section-label {
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbp .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.lbp .detail-row:last-child {
  border-bottom: none;
}
.lbp .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.lbp .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
  white-space: nowrap;
}
.lbp .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.lbp .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
  white-space: nowrap;
}
.lbp .detail-score.score-yes {
  color: #ef4444;
}
.lbp .detail-score.score-no {
  color: #22c55e;
}
.lbp .detail-score.score-empty {
  color: var(--vp-c-text-3);
}
.lbp .detail-score.brand {
  color: var(--vp-c-brand-1);
  font-size: 0.72rem;
  width: auto;
}
.lbp /* ── Actions ───────────────────────────────────────────────────── */
.lbp-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.lbp .btn-view,
.lbp .btn-copy,
.lbp .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.lbp .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.lbp .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.lbp .btn-view:active {
  transform: translateY(0);
}
.lbp .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.lbp .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.lbp .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.lbp .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.lbp .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
.lbp .lbp-header {
    flex-direction: column;
  }
.lbp .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.lbp .dur-row {
    flex-direction: column;
  }
.lbp .lbp-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
/* ══════════════ 神經性疼痛量表（Neuropathic Pain Scale）══════════════ */

.nps {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.nps /* ── Header ────────────────────────────────────────────────────── */
.nps-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.nps .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.nps .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.nps .score-badge {
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
.nps .sb-val {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.nps .sb-max {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  line-height: 1;
}
.nps .sb-tag {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.nps .score-badge.filling {
  color: var(--vp-c-text-3);
}
.nps .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps /* ── Progress bar ──────────────────────────────────────────────── */
.nps-bar-wrap {
  margin-bottom: 2rem;
}
.nps .nps-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.nps .nps-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.nps .nps-bar-fill.filling {
  background: var(--vp-c-divider);
}
.nps .nps-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.nps .nps-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.nps .nps-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.nps .nps-bar-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.nps .nps-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  margin-top: 4px;
}
.nps .t-g {
  color: #22c55e;
  font-weight: 700;
}
.nps .t-y {
  color: #f59e0b;
  font-weight: 700;
}
.nps .t-o {
  color: #f97316;
  font-weight: 700;
}
.nps /* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.nps .ss-pill {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 4px 10px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.nps .ss-l {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.nps .ss-v {
  font-size: 0.88rem;
  font-weight: 800;
}
.nps .ss-u {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
}
.nps /* ── Instruction ───────────────────────────────────────────────── */
.instruction {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #06b6d4;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1.25rem;
}
.nps /* ── Items ─────────────────────────────────────────────────────── */
.nps-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}
.nps .nps-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.nps .nps-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.nps .nps-item.answered {
  border-color: var(--item-color, rgba(99, 102, 241, 0.3));
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.nps .ni-header {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.nps .ni-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
.nps .ni-text-wrap {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.nps .ni-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nps .ni-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.nps .ni-score-box {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg);
  padding: 2px 8px;
  min-width: 60px;
  text-align: center;
  transition: border-color 0.2s;
  flex-shrink: 0;
}
.nps .ni-score-box.filled {
  border-color: var(--item-color, #22c55e);
}
.nps .ni-input {
  width: 44px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  text-align: center;
  -moz-appearance: textfield;
}
.nps .ni-input::-webkit-outer-spin-button,
.nps .ni-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.nps .ni-input::placeholder {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}
.nps .ni-slider-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.9rem;
}
.nps .ni-anchor-l,
.nps .ni-anchor-r {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 64px;
  line-height: 1.2;
  white-space: nowrap;
}
.nps .ni-anchor-r {
  text-align: right;
}
.nps .ni-track {
  position: relative;
  flex: 1;
  height: 6px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.nps .ni-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.nps .ni-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.15s;
}
.nps .ni-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.nps /* ── Result card ───────────────────────────────────────────────── */
.nps-result {
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
.nps .nps-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .nps-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .nps-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .nps-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.nps .nr-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.nps .nr-n {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.nps .nps-result.normal .nr-n {
  color: #22c55e;
}
.nps .nps-result.mild .nr-n {
  color: #f59e0b;
}
.nps .nps-result.moderate .nr-n {
  color: #f97316;
}
.nps .nps-result.severe .nr-n {
  color: #ef4444;
}
.nps .nr-u {
  font-size: 0.9rem;
  color: var(--vp-c-text-3);
}
.nps .nr-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.nps .nr-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.nps .nr-profiles {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.nps .np-tag {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}
.nps /* ── Results detail ────────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.nps .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.nps .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.nps .detail-row:last-child {
  border-bottom: none;
}
.nps .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.nps .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
}
.nps .detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.nps .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 72px;
  text-align: right;
}
.nps .detail-score.score-marked {
  color: var(--vp-c-brand-1);
}
.nps .detail-score.score-zero {
  color: #22c55e;
}
.nps .detail-score.score-empty {
  color: var(--vp-c-text-3);
}
.nps .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.nps .detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 60px;
  text-align: left;
}
.nps /* ── Actions ───────────────────────────────────────────────────── */
.nps-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.nps .btn-view,
.nps .btn-copy,
.nps .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.nps .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.nps .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.nps .btn-view:active {
  transform: translateY(0);
}
.nps .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.nps .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.nps .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.nps .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.nps .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.nps .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.nps .nps-header {
    flex-direction: column;
  }
.nps .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
.nps .nps-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.nps .ni-anchor-l,
.nps .ni-anchor-r {
    width: 48px;
    font-size: 0.7rem;
  }
.nps .detail-desc {
    display: none;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.painassess .score-badge {
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
.painassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.painassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.painassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.painassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.painassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.painassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.painassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.painassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.painassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .painassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}

</style>
