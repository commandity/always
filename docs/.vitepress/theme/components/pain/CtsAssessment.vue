<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"cts" | "ctp">("cts");

// ══════════════ 診斷模型（Katz・D'Arcy）（Flick + Katz · Multivariate）══════════════

type Tab = "bivariate" | "multivariate";
const tab = ref<Tab>("bivariate");

type Ans = "yes" | "no" | null;

// ── Common ────────────────────────────────────────────────────────
const flick = ref<Ans>(null);
const katz = ref<"classic" | "probable" | "possible" | "unlikely" | null>(null);

// ── Multivariate only ─────────────────────────────────────────────
const hypalgesia = ref<Ans>(null);
const nocturnal = ref<Ans>(null);
const phalen = ref<Ans>(null);
const squareWrist = ref<Ans>(null);
const tinel = ref<Ans>(null);

const cts_copied = ref(false);
const cts_showResults = ref(false);

// ── Bivariate ─────────────────────────────────────────────────────
const bivariateComplete = computed(
  () => flick.value !== null && katz.value !== null,
);

const bivariateResult = computed(() => {
  if (!bivariateComplete.value)
    return { level: "填寫中", color: "filling", prob: "?", advice: "", pct: 0 };
  const flickPos = flick.value === "yes";
  const katzPos = katz.value === "classic" || katz.value === "probable";
  const katzPoss = katz.value === "possible";
  if (flickPos && katz.value === "classic")
    return {
      level: "高度疑似 CTS",
      color: "critical",
      prob: "~93%",
      pct: 93,
      advice:
        "Flick 徵陽性 + Katz 手部圖表典型：CTS 陽性預測值約 93%。建議神經傳導檢查（NCS）確認，並評估手術或保守治療適應症。",
    };
  if (flickPos && katz.value === "probable")
    return {
      level: "疑似 CTS（高度可能）",
      color: "critical",
      prob: "~80%",
      pct: 80,
      advice:
        "Flick 徵陽性 + Katz 圖表疑似：CTS 可能性高。建議 NCS 確認，並考慮夾板治療及局部類固醇注射。",
    };
  if (flickPos && katzPoss)
    return {
      level: "可能 CTS（中度）",
      color: "moderate",
      prob: "~55%",
      pct: 55,
      advice:
        "Flick 徵陽性但 Katz 圖表僅可能：中等可能性。建議完整評估（多變量模型）及 NCS 確認。",
    };
  if (!flickPos && katzPos)
    return {
      level: "可能 CTS（中度）",
      color: "moderate",
      prob: "~60%",
      pct: 60,
      advice:
        "Katz 圖表典型/疑似但無 Flick 徵：仍有相當可能性。建議 NCS 確認，並評估其他症狀。",
    };
  if (katz.value === "unlikely")
    return {
      level: "低度 CTS 可能性",
      color: "normal",
      prob: "< 20%",
      pct: 10,
      advice:
        "Katz 圖表不典型，LR-負預測值佳（LR- = 0.2）。CTS 可能性低，考慮其他診斷（頸椎神經根病變、胸廓出口症候群等）。",
    };
  return {
    level: "不確定",
    color: "mild",
    prob: "~40%",
    pct: 40,
    advice: "需要更多資訊評估。建議完整多變量評估或 NCS 確認。",
  };
});

// ── Multivariate ──────────────────────────────────────────────────
const cts_mvComplete = computed(
  () =>
    flick.value !== null &&
    katz.value !== null &&
    hypalgesia.value !== null &&
    phalen.value !== null &&
    tinel.value !== null &&
    nocturnal.value !== null &&
    squareWrist.value !== null,
);

const mvScore = computed(() => {
  if (!cts_mvComplete.value) return null;
  let s = 0;
  if (flick.value === "yes") s += 3;
  if (katz.value === "classic" || katz.value === "probable") s += 2;
  if (hypalgesia.value === "yes") s += 2;
  if (nocturnal.value === "yes") s += 1;
  if (phalen.value === "yes") s += 1;
  if (squareWrist.value === "yes") s += 1;
  if (tinel.value === "yes") s += 1;
  return s;
});

const mvAnswered = computed(
  () =>
    [
      flick.value,
      katz.value,
      hypalgesia.value,
      phalen.value,
      tinel.value,
      nocturnal.value,
      squareWrist.value,
    ].filter((v) => v !== null).length,
);

const cts_mvResult = computed(() => {
  if (!cts_mvComplete.value)
    return { level: "填寫中", color: "filling", advice: "", prob: "?", pct: 0 };
  const s = mvScore.value ?? 0;
  if (s >= 7)
    return {
      level: "高度疑似 CTS（多重陽性）",
      color: "critical",
      prob: "> 90%",
      pct: 95,
      advice:
        "多項臨床指標陽性，CTS 可能性極高（> 90%）。建議 NCS/EMG 確認，並與手外科或神經科討論治療方案（保守治療或腕隧道減壓手術）。",
    };
  if (s >= 5)
    return {
      level: "疑似 CTS（高度可能）",
      color: "critical",
      prob: "75–90%",
      pct: 82,
      advice: "多項指標陽性，CTS 高度可能。建議 NCS 確認並評估手術指標。",
    };
  if (s >= 3)
    return {
      level: "可能 CTS（中度）",
      color: "moderate",
      prob: "50–75%",
      pct: 62,
      advice:
        "中等程度臨床證據。建議完整神經傳導檢查確認，可考慮試行保守治療（夾板、局部類固醇注射）。",
    };
  if (s >= 1)
    return {
      level: "低度 CTS 可能性",
      color: "mild",
      prob: "20–50%",
      pct: 35,
      advice:
        "臨床指標有限，CTS 可能性低至中等。建議排除頸椎病、胸廓出口症候群等鑑別診斷。",
    };
  return {
    level: "極低度 CTS 可能性",
    color: "normal",
    prob: "< 20%",
    pct: 10,
    advice: "所有指標均陰性，CTS 可能性極低。請考慮其他診斷。",
  };
});

const cts_currentResult = computed(() =>
  tab.value === "bivariate" ? bivariateResult.value : cts_mvResult.value,
);
const cts_currentComplete = computed(() =>
  tab.value === "bivariate" ? bivariateComplete.value : cts_mvComplete.value,
);

// ── Katz tally class/text (no .value in template) ────────────────
const katzTallyClass = computed(() => {
  if (katz.value === null) return "tally-nd";
  if (katz.value === "classic" || katz.value === "probable") return "tally-abn";
  if (katz.value === "unlikely") return "tally-ok";
  return "tally-nd";
});
const katzTallyText = computed(() => katz.value ?? "—");

// ── Score badge display ───────────────────────────────────────────
const cts_badgeScore = computed(() => {
  if (tab.value === "multivariate" && cts_mvComplete.value)
    return (mvScore.value ?? 0) + "/11";
  if (cts_currentComplete.value) return "✓";
  return "—";
});
const cts_badgeLabel = computed(() => {
  if (cts_currentComplete.value) return cts_currentResult.value.prob;
  if (tab.value === "bivariate") return "2 題";
  return mvAnswered.value + "/7";
});

function cts_generateMarkdown(): string {
  const katzLabel: Record<string, string> = {
    classic: "典型（Classic）",
    probable: "疑似（Probable）",
    possible: "可能（Possible）",
    unlikely: "不典型（Unlikely）",
  };
  if (tab.value === "bivariate") {
    return (
      `# 腕隧道症候群雙變量決策樹\n\n` +
      `- Flick 徵：${flick.value === "yes" ? "陽性" : "陰性"}\n` +
      `- Katz 手部圖表：${katz.value ? katzLabel[katz.value] : "未填"}\n\n` +
      `**結果：${bivariateResult.value.level}（預測機率 ${bivariateResult.value.prob}）**\n\n${bivariateResult.value.advice}`
    );
  }
  return (
    `# 腕隧道症候群多變量決策樹\n\n` +
    `- Flick 徵：${flick.value === "yes" ? "陽性" : "陰性"}\n` +
    `- Katz 手部圖表：${katz.value ? katzLabel[katz.value] : "未填"}\n` +
    `- 食指掌側感覺異常：${hypalgesia.value === "yes" ? "陽性" : "陰性"}\n` +
    `- Phalen 測試：${phalen.value === "yes" ? "陽性" : "陰性"}\n` +
    `- Tinel 徵：${tinel.value === "yes" ? "陽性" : "陰性"}\n` +
    `- 夜間症狀：${nocturnal.value === "yes" ? "有" : "無"}\n` +
    `- 方型腕：${squareWrist.value === "yes" ? "是" : "否"}\n` +
    `- 加權分數：${mvScore.value}/11\n\n` +
    `**結果：${cts_mvResult.value.level}（預測機率 ${cts_mvResult.value.prob}）**\n\n${cts_mvResult.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(cts_generateMarkdown());
  cts_copied.value = true;
  setTimeout(() => (cts_copied.value = false), 2000);
}

function cts_reset() {
  flick.value = null;
  katz.value = null;
  hypalgesia.value = null;
  phalen.value = null;
  tinel.value = null;
  nocturnal.value = null;
  squareWrist.value = null;
  cts_showResults.value = false;
}

function switchTab(t: Tab) {
  tab.value = t;
  cts_showResults.value = false;
}

// ══════════════ Wainner CPR（Clinical Prediction Rule 2005）══════════════

const bivariateItems = [
  {
    key: "bv1",
    text: "腕部比例指數（Wrist-Ratio Index）< 0.67",
    hint: "手腕厚度 ÷ 手腕寬度 < 0.67（即較方形的手腕）是 CTS 的強力預測因子",
    lr: "+LR 3.1",
  },
  {
    key: "bv2",
    text: "手搖晃試驗（Shaking Sign）陽性",
    hint: "患者報告搖晃或甩動手部可緩解症狀（夜間麻木後常見）",
    lr: "+LR 2.5",
  },
];

const multivariateItems = [
  {
    key: "mv1",
    text: "症狀惡化的手勢（Hand Maneuver Worsens）",
    hint: "手部活動（如握拳、屈腕）會加重麻木或刺痛症狀",
    lr: "+LR 1.6",
  },
  {
    key: "mv2",
    text: "腕部比例指數 < 0.67",
    hint: "手腕厚度 ÷ 手腕寬度 < 0.67，正方形手腕形態",
    lr: "+LR 3.1",
  },
  {
    key: "mv3",
    text: "CTS 問卷分數 ≥ 1.9",
    hint: "患者自填的 CTS 症狀嚴重度問卷（Brigham & Women's）達到切截值",
    lr: "+LR 2.5",
  },
  {
    key: "mv4",
    text: "正中神經 Tinel Sign 陽性",
    hint: "叩擊手腕正中神經時誘發麻刺感（TNS 陽性）",
    lr: "+LR 2.0",
  },
  {
    key: "mv5",
    text: "年齡 > 45 歲",
    hint: "CTS 盛行率隨年齡增加，45 歲以上為重要預測因子",
    lr: "+LR 1.8",
  },
];

const mode = ref<"bivariate" | "multivariate">("bivariate");
const bvAns = ref<Record<string, boolean | null>>(
  Object.fromEntries(bivariateItems.map((q) => [q.key, null])),
);
const mvAns = ref<Record<string, boolean | null>>(
  Object.fromEntries(multivariateItems.map((q) => [q.key, null])),
);
const ctp_copied = ref(false);
const ctp_showResults = ref(false);

const currentItems = computed(() =>
  mode.value === "bivariate" ? bivariateItems : multivariateItems,
);
const currentAns = computed(() =>
  mode.value === "bivariate" ? bvAns.value : mvAns.value,
);
const currentPos = computed(
  () =>
    currentItems.value.filter((q) => currentAns.value[q.key] === true).length,
);
const currentTotal = computed(() => currentItems.value.length);
const ctp_currentComplete = computed(() =>
  currentItems.value.every((q) => currentAns.value[q.key] !== null),
);

const bvComplete = computed(() =>
  bivariateItems.every((q) => bvAns.value[q.key] !== null),
);
const ctp_mvComplete = computed(() =>
  multivariateItems.every((q) => mvAns.value[q.key] !== null),
);

function setAns(key: string, val: boolean) {
  if (mode.value === "bivariate") bvAns.value[key] = val;
  else mvAns.value[key] = val;
}

const bvResult = computed(() => {
  if (!bvComplete.value) return null;
  if (bvPos.value === 2)
    return {
      level: "高度可能為 CTS（Both Positive）",
      color: "critical",
      prob: "~74%",
      pct: 74,
      advice:
        "兩項均陽性：CTS 可能性高，建議電生理確認（NCS/EMG）或考慮直接轉介治療",
    };
  if (bvPos.value === 1)
    return {
      level: "中等可能（One Positive）",
      color: "moderate",
      prob: "~50%",
      pct: 50,
      advice: "一項陽性：CTS 可能性中等，建議配合其他臨床測試及電生理檢查",
    };
  return {
    level: "低度可能（Both Negative）",
    color: "normal",
    prob: "~20%",
    pct: 20,
    advice:
      "兩項均陰性：CTS 可能性低，考慮其他診斷（頸椎神經根病變、周邊神經病變）",
  };
});

const bvPos = computed(
  () => bivariateItems.filter((q) => bvAns.value[q.key] === true).length,
);

const ctp_mvResult = computed(() => {
  if (!ctp_mvComplete.value) return null;
  if (mvPos.value >= 4)
    return {
      level: "極高度可能為 CTS（≥ 4 項陽性）",
      color: "critical",
      prob: "≈ 83%",
      pct: 83,
      advice:
        "≥ 4 項陽性：+LR > 4，可考慮直接啟動治療（夾板、類固醇注射），電生理可選擇性進行",
    };
  if (mvPos.value === 3)
    return {
      level: "高度可能為 CTS（3 項陽性）",
      color: "moderate",
      prob: "≈ 60%",
      pct: 60,
      advice: "3 項陽性：CTS 可能性高，建議電生理確認（NCS/EMG）後啟動治療",
    };
  if (mvPos.value === 2)
    return {
      level: "中度可能（2 項陽性）",
      color: "mild",
      prob: "≈ 40%",
      pct: 40,
      advice: "2 項陽性：中等可能性，電生理檢查可協助確診或排除 CTS",
    };
  return {
    level: "低度可能（≤ 1 項陽性）",
    color: "normal",
    prob: "≈ 20%",
    pct: 20,
    advice: "≤ 1 項陽性：CTS 可能性低，考慮替代診斷",
  };
});

const mvPos = computed(
  () => multivariateItems.filter((q) => mvAns.value[q.key] === true).length,
);

const ctp_currentResult = computed(() =>
  mode.value === "bivariate" ? bvResult.value : ctp_mvResult.value,
);

const ctp_badgeScore = computed(() => `${currentPos.value}/${currentTotal.value}`);
const ctp_badgeLabel = computed(() =>
  ctp_currentResult.value ? ctp_currentResult.value.prob : "填寫中",
);

function ctp_generateMarkdown() {
  const r = ctp_currentResult.value;
  if (!r) return "";
  const modeLabel =
    mode.value === "bivariate"
      ? "二元變量法（Bivariate）"
      : "多元變量法（Multivariate 5-item CPR）";
  const lines = currentItems.value.map(
    (q) =>
      `  ${currentAns.value[q.key] === true ? "✓ 陽性" : currentAns.value[q.key] === false ? "✗ 陰性" : "—"} ${q.text}（${q.lr}）`,
  );
  return (
    `# 腕隧道症候群臨床決策樹（${modeLabel}）\n\n` +
    `## 評估項目\n\n${lines.join("\n")}\n\n` +
    `## 結果\n\n` +
    `- 陽性項目：${currentPos.value} / ${currentTotal.value}\n` +
    `- **${r.level}**（CTS 可能性：${r.prob}）\n` +
    `- 建議：${r.advice}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(ctp_generateMarkdown());
  ctp_copied.value = true;
  setTimeout(() => (ctp_copied.value = false), 2000);
}

function ctp_reset() {
  bivariateItems.forEach((q) => (bvAns.value[q.key] = null));
  multivariateItems.forEach((q) => (mvAns.value[q.key] = null));
  ctp_showResults.value = false;
}
</script>

<template>
  <div class="ctsassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'cts' }"
        @click="activeTab = 'cts'"
      >
        <span class="tab-label">Flick + Katz</span>
        <span class="tab-sub">臨床診斷模型</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'ctp' }"
        @click="activeTab = 'ctp'"
      >
        <span class="tab-label">Wainner CPR</span>
        <span class="tab-sub">臨床預測法則</span>
      </button>
    </div>

  <div v-show="activeTab === 'cts'" class="cts">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cts-header">
      <div class="header-title">
        <h2 class="title">CTS 腕隧道症候群臨床決策樹</h2>
        <p class="subtitle">
          Carpal Tunnel Syndrome Decision TreeCalc · 雙變量（Flick + Katz）/
          多變量模型 · Katz 1990 · D'Arcy &amp; McGee 2000
        </p>
      </div>
      <div class="score-badge" :class="cts_currentResult.color">
        <span class="badge-label">CTS</span>
        <span class="score-number">{{ cts_badgeScore }}</span>
        <span class="score-label">{{ cts_badgeLabel }}</span>
      </div>
    </div>

    <!-- ── Tab selector ───────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📐</span>
        <span class="group-label-text">模型選擇</span>
        <span class="group-sub-text"
          >雙變量（快速篩查）或多變量（全面評估）</span
        >
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-bi': tab === 'bivariate' }"
          @click="switchTab('bivariate')"
        >
          <span class="tab-title">雙變量決策樹</span>
          <span class="tab-sub"
            >Bivariate · 2 項指標 · Flick 徵 + Katz 圖表 · 快速篩查</span
          >
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-mv': tab === 'multivariate' }"
          @click="switchTab('multivariate')"
        >
          <span class="tab-title">多變量決策樹</span>
          <span class="tab-sub"
            >Multivariate · 7 項指標 · 更全面的臨床機率估算</span
          >
        </button>
      </div>
    </div>

    <!-- ── Severity bar ──────────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="cts_currentResult.color"
          :style="{ width: cts_currentComplete ? cts_currentResult.pct + '%' : '0%' }"
        />
      </div>
      <div class="severity-ticks">
        <span style="left: 0%">0%</span>
        <span class="tick-threshold" style="left: 20%">20%</span>
        <span style="left: 50%">50%</span>
        <span style="left: 75%">75%</span>
        <span style="left: 100%">100%</span>
      </div>
    </div>

    <!-- ── Flick Sign ─────────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar flick-bar">
        <span class="group-icon">✋</span>
        <span class="group-label-text">Flick 徵（Flick Sign）</span>
        <span class="group-sub-text"
          >敏感性 93%，特異性 96% — 診斷 CTS 最強單一指標</span
        >
        <span
          class="group-score-tally"
          :class="
            flick !== null
              ? flick === 'yes'
                ? 'tally-abn'
                : 'tally-ok'
              : 'tally-nd'
          "
        >
          {{ flick !== null ? (flick === "yes" ? "陽性" : "陰性") : "—" }}
        </span>
      </div>
      <div
        class="cts-item"
        :class="flick === 'yes' ? 'item-pos' : flick === 'no' ? 'item-neg' : ''"
      >
        <div class="item-header">
          <span class="item-qnum q-flick">F1</span>
          <div class="item-name-block">
            <span class="item-name"
              >患者是否習慣透過甩動或搖晃手腕來緩解症狀（Flick Sign）？</span
            >
            <span class="item-sub"
              >Do you flick or shake your hand/wrist to relieve symptoms? — Sens
              93%, Spec 96%</span
            >
          </div>
          <div class="yn-row">
          <button
            class="btn-yn btn-yn-pos"
            :class="{ 'yn-pos-active': flick === 'yes' }"
            @click="flick = 'yes'"
          >
            是
          </button>
          <button
            class="btn-yn btn-yn-neg"
            :class="{ 'yn-neg-active': flick === 'no' }"
            @click="flick = 'no'"
          >
            否
          </button>
        </div>
          </div>
      </div>
    </div>

    <!-- ── Katz Hand Diagram ──────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar katz-bar">
        <span class="group-icon">✍</span>
        <span class="group-label-text">Katz 手部症狀圖表評分</span>
        <span class="group-sub-text"
          >患者在手部輪廓圖上標記麻木/疼痛部位，依分布模式評分</span
        >
        <span class="group-score-tally" :class="katzTallyClass">{{
          katzTallyText
        }}</span>
      </div>
      <div class="katz-grid">
        <button
          class="katz-btn k-classic"
          :class="{ 'katz-active': katz === 'classic' }"
          @click="katz = 'classic'"
        >
          <span class="kopt-label">典型（Classic）</span>
          <span class="kopt-sub"
            >症狀涉及至少 2
            個正中神經分布區（拇指、食指、中指掌面），無尺神經區症狀</span
          >
        </button>
        <button
          class="katz-btn k-probable"
          :class="{ 'katz-active': katz === 'probable' }"
          @click="katz = 'probable'"
        >
          <span class="kopt-label">疑似（Probable）</span>
          <span class="kopt-sub"
            >症狀涉及至少 2 個正中神經分布區，但也有手掌或手腕症狀</span
          >
        </button>
        <button
          class="katz-btn k-possible"
          :class="{ 'katz-active': katz === 'possible' }"
          @click="katz = 'possible'"
        >
          <span class="kopt-label">可能（Possible）</span>
          <span class="kopt-sub"
            >至少 1 個正中神經分布區症狀，但也有環指或手背症狀</span
          >
        </button>
        <button
          class="katz-btn k-unlikely"
          :class="{ 'katz-active': katz === 'unlikely' }"
          @click="katz = 'unlikely'"
        >
          <span class="kopt-label">不典型（Unlikely）</span>
          <span class="kopt-sub"
            >完全無正中神經分布區症狀，僅有掌心、手背或小指症狀</span
          >
        </button>
      </div>
    </div>

    <!-- ── Multivariate additional items ─────────────────────── -->
    <template v-if="tab === 'multivariate'">
      <div class="nihss-group">
        <div class="group-header-bar mv-bar">
          <span class="group-icon">🔬</span>
          <span class="group-label-text">多變量評估（額外項目）</span>
          <span class="group-sub-text">加入理學檢查及病史細節提升準確度</span>
          <span
            class="group-score-tally"
            :class="
              cts_mvComplete
                ? mvScore !== null && mvScore >= 5
                  ? 'tally-abn'
                  : 'tally-ok'
                : 'tally-nd'
            "
          >
            {{ cts_mvComplete ? mvScore + "/11" : mvAnswered + "/7" }}
          </span>
        </div>
        <div class="item-list">
          <!-- M1: Hypalgesia -->
          <div
            class="cts-item"
            :class="
              hypalgesia === 'yes'
                ? 'item-pos'
                : hypalgesia === 'no'
                  ? 'item-neg'
                  : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-hyp">M1</span>
              <div class="item-name-block">
                <span class="item-name"
                  >食指掌側痛覺是否較小指減退？（LR+ 3.1）</span
                >
                <span class="item-sub"
                  >Diminished pain sensation on palmar surface of index finger
                  vs little finger</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': hypalgesia === 'yes' }"
                @click="hypalgesia = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': hypalgesia === 'no' }"
                @click="hypalgesia = 'no'"
              >
                否
              </button>
            </div>
          </div>
          </div>

          <!-- M2: Nocturnal -->
          <div
            class="cts-item"
            :class="
              nocturnal === 'yes'
                ? 'item-pos'
                : nocturnal === 'no'
                  ? 'item-neg'
                  : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-noc">M2</span>
              <div class="item-name-block">
                <span class="item-name"
                  >是否曾因手部麻木/疼痛從睡眠中醒來？</span
                >
                <span class="item-sub"
                  >Nocturnal symptoms waking from sleep</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': nocturnal === 'yes' }"
                @click="nocturnal = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': nocturnal === 'no' }"
                @click="nocturnal = 'no'"
              >
                否
              </button>
            </div>
          </div>
          </div>

          <!-- M3: Phalen -->
          <div
            class="cts-item"
            :class="
              phalen === 'yes' ? 'item-pos' : phalen === 'no' ? 'item-neg' : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-pha">M3</span>
              <div class="item-name-block">
                <span class="item-name"
                  >雙腕完全屈曲 60 秒是否誘發症狀？（LR+ 1.3）</span
                >
                <span class="item-sub"
                  >Phalen maneuver: wrists fully flexed for 60 seconds
                  reproduces symptoms</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': phalen === 'yes' }"
                @click="phalen = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': phalen === 'no' }"
                @click="phalen = 'no'"
              >
                否
              </button>
            </div>
          </div>
          </div>

          <!-- M4: Square Wrist -->
          <div
            class="cts-item"
            :class="
              squareWrist === 'yes'
                ? 'item-pos'
                : squareWrist === 'no'
                  ? 'item-neg'
                  : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-sq">M4</span>
              <div class="item-name-block">
                <span class="item-name"
                  >腕部深度/寬度比 > 0.7（方型腕，OR 4.56）？</span
                >
                <span class="item-sub"
                  >Wrist depth-to-width ratio &gt; 0.7 (square wrist sign)</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': squareWrist === 'yes' }"
                @click="squareWrist = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': squareWrist === 'no' }"
                @click="squareWrist = 'no'"
              >
                否
              </button>
            </div>
          </div>
          </div>

          <!-- M5: Tinel -->
          <div
            class="cts-item"
            :class="
              tinel === 'yes' ? 'item-pos' : tinel === 'no' ? 'item-neg' : ''
            "
          >
            <div class="item-header">
              <span class="item-qnum q-tin">M5</span>
              <div class="item-name-block">
                <span class="item-name"
                  >叩擊腕管是否誘發放射性麻刺感？（LR+ 1.4）</span
                >
                <span class="item-sub"
                  >Tinel sign: tapping over carpal tunnel reproduces
                  paresthesias</span
                >
              </div>
              <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': tinel === 'yes' }"
                @click="tinel = 'yes'"
              >
                是
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': tinel === 'no' }"
                @click="tinel = 'no'"
              >
                否
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- Score bar -->
      <div v-if="mvAnswered > 0" class="mv-score-bar">
        <div class="mv-bar-track">
          <div
            class="mv-bar-fill"
            :class="cts_mvResult.color"
            :style="{
              width: cts_mvComplete ? ((mvScore ?? 0) / 11) * 100 + '%' : '0%',
            }"
          />
        </div>
        <div class="mv-bar-labels">
          <span style="left: 0%">低（0–2）</span
          ><span style="left: 27.27%">中（3–4）</span
          ><span style="left: 54.55%">高（5–6）</span
          ><span style="left: 81.82%">極高（≥7）</span>
        </div>
      </div>
    </template>

    <!-- ── Results detail ────────────────────────────────────── -->
    <div v-if="cts_showResults && cts_currentComplete" class="results-detail">
      <div class="results-header">評估明細</div>
      <template v-if="tab === 'bivariate'">
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="flick === 'yes' ? 'dq-pos' : 'dq-neg'"
            >F1</span
          >
          <span class="detail-domain">Flick 徵</span>
          <span
            class="detail-score"
            :class="flick === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ flick === "yes" ? "陽性" : "陰性" }}</span
          >
          <span class="detail-desc">{{
            flick === "yes" ? "甩手動作陽性 — 強烈提示 CTS" : "無甩手動作"
          }}</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="
              katz === 'classic' || katz === 'probable' ? 'dq-pos' : 'dq-neg'
            "
            >K</span
          >
          <span class="detail-domain">Katz 圖表</span>
          <span
            class="detail-score"
            :class="
              katz === 'classic' || katz === 'probable' ? 'ds-pos' : 'ds-neg'
            "
            >{{ katz }}</span
          >
          <span class="detail-desc">{{
            katz === "classic"
              ? "典型正中神經分布"
              : katz === "probable"
                ? "疑似正中神經分布"
                : katz === "possible"
                  ? "部分符合"
                  : "不典型"
          }}</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">雙變量判讀</span>
          <span class="detail-score detail-score-brand">{{
            bivariateResult.prob
          }}</span>
          <span class="detail-desc">{{ bivariateResult.level }}</span>
        </div>
      </template>
      <template v-else>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="flick === 'yes' ? 'dq-pos' : 'dq-neg'"
            >F1</span
          >
          <span class="detail-domain">Flick 徵（×3）</span>
          <span
            class="detail-score"
            :class="flick === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ flick === "yes" ? "+3" : "0" }}</span
          >
          <span class="detail-desc">LR+ 最高權重</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="
              katz === 'classic' || katz === 'probable' ? 'dq-pos' : 'dq-neg'
            "
            >K</span
          >
          <span class="detail-domain">Katz 圖表（×2）</span>
          <span
            class="detail-score"
            :class="
              katz === 'classic' || katz === 'probable' ? 'ds-pos' : 'ds-neg'
            "
            >{{ katz === "classic" || katz === "probable" ? "+2" : "0" }}</span
          >
          <span class="detail-desc">{{ katz }}</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="hypalgesia === 'yes' ? 'dq-pos' : 'dq-neg'"
            >M1</span
          >
          <span class="detail-domain">食指感覺異常（×2）</span>
          <span
            class="detail-score"
            :class="hypalgesia === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ hypalgesia === "yes" ? "+2" : "0" }}</span
          >
          <span class="detail-desc">LR+ 3.1</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="nocturnal === 'yes' ? 'dq-pos' : 'dq-neg'"
            >M2</span
          >
          <span class="detail-domain">夜間症狀（×1）</span>
          <span
            class="detail-score"
            :class="nocturnal === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ nocturnal === "yes" ? "+1" : "0" }}</span
          >
          <span class="detail-desc">睡眠中醒來</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="phalen === 'yes' ? 'dq-pos' : 'dq-neg'"
            >M3</span
          >
          <span class="detail-domain">Phalen 測試（×1）</span>
          <span
            class="detail-score"
            :class="phalen === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ phalen === "yes" ? "+1" : "0" }}</span
          >
          <span class="detail-desc">LR+ 1.3</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="squareWrist === 'yes' ? 'dq-pos' : 'dq-neg'"
            >M4</span
          >
          <span class="detail-domain">方型腕（×1）</span>
          <span
            class="detail-score"
            :class="squareWrist === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ squareWrist === "yes" ? "+1" : "0" }}</span
          >
          <span class="detail-desc">OR 4.56</span>
        </div>
        <div class="detail-row">
          <span
            class="detail-qnum"
            :class="tinel === 'yes' ? 'dq-pos' : 'dq-neg'"
            >M5</span
          >
          <span class="detail-domain">Tinel 徵（×1）</span>
          <span
            class="detail-score"
            :class="tinel === 'yes' ? 'ds-pos' : 'ds-neg'"
            >{{ tinel === "yes" ? "+1" : "0" }}</span
          >
          <span class="detail-desc">LR+ 1.4</span>
        </div>
        <div class="detail-row detail-total">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">加權總分</span>
          <span class="detail-score detail-score-brand">{{ mvScore }}/11</span>
          <span class="detail-desc"
            >{{ cts_mvResult.prob }} · {{ cts_mvResult.level }}</span
          >
        </div>
      </template>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cts-result" :class="cts_currentResult.color">
      <div class="result-left">
        <span class="result-number">{{
          cts_currentComplete ? cts_currentResult.prob : "—"
        }}</span>
      </div>
      <div class="result-right">
        <span class="result-ver">{{
          tab === "bivariate" ? "雙變量模型" : "多變量模型"
        }}</span>
        <span class="result-level">{{ cts_currentResult.level }}</span>
        <span class="result-advice">{{ cts_currentResult.advice }}</span>
      </div>
    </div>

    <!-- ── Warn ───────────────────────────────────────────────── -->
    <div class="warn-box">
      <span class="warn-icon">⚠</span>
      <span
        >CTS 臨床決策樹為輔助評估工具，神經傳導檢查（NCS）仍是確診金標準。Tinel
        和 Phalen
        測試的敏感性/特異性在不同研究中差異較大，不能單獨用於診斷或排除
        CTS。鑑別診斷需排除：頸椎神經根病變（C6/C7）、胸廓出口症候群、多發性神經病變。</span
      >
    </div>

    <div class="cts-actions">
      <button class="btn-view" @click="cts_showResults = !cts_showResults">
        {{ cts_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!cts_currentComplete" @click="copyOutput">
        {{ cts_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="cts_reset">重置</button>
    </div>
    <p v-if="!cts_currentComplete" class="progress-hint">
      {{
        tab === "bivariate"
          ? "請完成 Flick 徵及 Katz 圖表評分"
          : `已完成 ${mvAnswered}/7 項，尚餘 ${7 - mvAnswered} 項`
      }}
    </p>
  </div>

  <div v-show="activeTab === 'ctp'" class="ctp">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cts-header">
      <div class="header-title">
        <h2 class="title">Carpal Tunnel Syndrome 腕隧道症候群臨床決策樹</h2>
        <p class="subtitle">
          Carpal Tunnel Syndrome Decision TreeCalc · Wainner CPR 2005
        </p>
      </div>
      <div class="score-badge" :class="ctp_currentResult?.color ?? 'filling'">
        <span class="badge-label">CTS</span>
        <span class="score-number">{{ ctp_badgeScore }}</span>
        <span class="score-label">{{ ctp_badgeLabel }}</span>
      </div>
    </div>

    <!-- ── Tab selector ───────────────────────────────────────── -->
    <div class="nihss-group">
      <div class="group-header-bar tab-bar">
        <span class="group-icon">📐</span>
        <span class="group-label-text">模型選擇</span>
        <span class="group-sub-text">二元變量或多元變量（Wainner CPR）</span>
      </div>
      <div class="tab-toggle">
        <button
          class="tab-btn"
          :class="{ 'tab-active-bi': mode === 'bivariate' }"
          @click="mode = 'bivariate'"
        >
          <span class="tab-title">二元變量法</span>
          <span class="tab-sub">Bivariate · 2 項</span>
        </button>
        <button
          class="tab-btn"
          :class="{ 'tab-active-mv': mode === 'multivariate' }"
          @click="mode = 'multivariate'"
        >
          <span class="tab-title">多元變量法</span>
          <span class="tab-sub">Multivariate · 5 項</span>
        </button>
      </div>
    </div>

    <!-- ── Severity bar ──────────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="ctp_currentResult?.color ?? 'filling'"
          :style="{
            width: ctp_currentResult ? ctp_currentResult.pct + '%' : '0%',
          }"
        />
      </div>
      <div class="severity-ticks">
        <span style="left: 0%">0%</span>
        <span class="tick-threshold" style="left: 20%">20%</span>
        <span style="left: 50%">50%</span>
        <span style="left: 75%">75%</span>
        <span style="left: 100%">100%</span>
      </div>
    </div>

    <!-- ── Questions ──────────────────────────────────────────── -->
    <div class="nihss-group">
      <div
        class="group-header-bar"
        :class="mode === 'bivariate' ? 'bv-bar' : 'mv-bar'"
      >
        <span class="group-icon">🖐</span>
        <span class="group-label-text">{{
          mode === "bivariate"
            ? "二元變量評估項目"
            : "多元變量評估項目（Wainner CPR）"
        }}</span>
        <span class="group-sub-text">{{
          mode === "bivariate"
            ? "2 項最高 +LR 臨床發現"
            : "5-item Clinical Prediction Rule"
        }}</span>
        <span
          class="group-score-tally"
          :class="ctp_currentComplete ? 'tally-abn' : 'tally-nd'"
        >
          {{ currentPos }}/{{ currentTotal }}
        </span>
      </div>

      <div class="item-list">
        <div
          v-for="(q, idx) in currentItems"
          :key="q.key"
          class="cts-item"
          :class="{
            'item-pos': currentAns[q.key] === true,
            'item-neg': currentAns[q.key] === false,
          }"
        >
          <div class="item-header">
            <span
              class="item-qnum"
              :class="mode === 'bivariate' ? 'q-bv' : 'q-mv'"
            >
              {{ mode === "bivariate" ? "BV" : "MV" }}{{ idx + 1 }}
            </span>
            <div class="item-name-block">
              <span class="item-name">{{ q.text }}</span>
              <span class="item-sub">{{ q.hint }} · {{ q.lr }}</span>
            </div>
            <div class="yn-row">
            <button
              class="btn-yn btn-yn-pos"
              :class="{ 'yn-pos-active': currentAns[q.key] === true }"
              @click="setAns(q.key, true)"
            >
              陽性
            </button>
            <button
              class="btn-yn btn-yn-neg"
              :class="{ 'yn-neg-active': currentAns[q.key] === false }"
              @click="setAns(q.key, false)"
            >
              陰性
            </button>
          </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Reference table ────────────────────────────────────── -->
    <div class="ref-table" v-if="ctp_currentResult">
      <div class="rt-row rt-header">
        <span>陽性數</span><span>可能性</span><span>建議</span>
      </div>
      <template v-if="mode === 'bivariate'">
        <div class="rt-row" :class="{ 'rt-active': bvPos === 2 && bvComplete }">
          <span class="rt-s severe-t">2/2</span><span>≈ 74%</span
          ><span class="rt-sm">電生理確認 or 治療</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': bvPos === 1 && bvComplete }">
          <span class="rt-s moderate-t">1/2</span><span>≈ 50%</span
          ><span class="rt-sm">進一步評估</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': bvPos === 0 && bvComplete }">
          <span class="rt-s normal-t">0/2</span><span>≈ 20%</span
          ><span class="rt-sm">考慮替代診斷</span>
        </div>
      </template>
      <template v-else>
        <div class="rt-row" :class="{ 'rt-active': mvPos >= 4 && ctp_mvComplete }">
          <span class="rt-s severe-t">≥ 4</span><span>≈ 83%</span
          ><span class="rt-sm">可直接治療</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos === 3 && ctp_mvComplete }">
          <span class="rt-s moderate-t">3</span><span>≈ 60%</span
          ><span class="rt-sm">電生理確認</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos === 2 && ctp_mvComplete }">
          <span class="rt-s mild-t">2</span><span>≈ 40%</span
          ><span class="rt-sm">電生理確認</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos <= 1 && ctp_mvComplete }">
          <span class="rt-s normal-t">≤ 1</span><span>≈ 20%</span
          ><span class="rt-sm">考慮其他診斷</span>
        </div>
      </template>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div v-if="ctp_currentResult" class="cts-result" :class="ctp_currentResult.color">
      <div class="result-left">
        <span class="result-number">{{ ctp_currentResult.prob }}</span>
        <span class="result-max">CTS 可能性</span>
      </div>
      <div class="result-right">
        <span class="result-ver">{{
          mode === "bivariate" ? "二元變量法" : "多元變量法"
        }}</span>
        <span class="result-level">{{ ctp_currentResult.level }}</span>
        <span class="result-advice">{{ ctp_currentResult.advice }}</span>
      </div>
    </div>
    <div v-else class="pending-note">請完成所有問題以獲得評估結果</div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div
      v-if="ctp_showResults && ctp_currentComplete && ctp_currentResult"
      class="results-detail"
    >
      <div class="results-header">評估明細</div>
      <div
        class="detail-section-label"
        :class="mode === 'bivariate' ? 'dl-bi' : 'dl-mv'"
      >
        {{
          mode === "bivariate"
            ? "二元變量法（Bivariate）"
            : "多元變量法（5-item CPR）"
        }}
        — {{ currentPos }}/{{ currentTotal }} 陽性
      </div>
      <div v-for="(q, idx) in currentItems" :key="q.key" class="detail-row">
        <span
          class="detail-qnum"
          :class="
            currentAns[q.key] === true
              ? 'dq-pos'
              : currentAns[q.key] === false
                ? 'dq-neg'
                : ''
          "
          >{{ mode === "bivariate" ? "BV" : "MV" }}{{ idx + 1 }}</span
        >
        <span class="detail-domain">{{ q.text }}</span>
        <span
          class="detail-score"
          :class="
            currentAns[q.key] === true
              ? 'ds-pos'
              : currentAns[q.key] === false
                ? 'ds-neg'
                : ''
          "
        >
          {{
            currentAns[q.key] === true
              ? "✓ 陽性"
              : currentAns[q.key] === false
                ? "✗ 陰性"
                : "—"
          }}
        </span>
        <span class="detail-desc">{{ q.lr }}</span>
      </div>
      <div class="detail-row detail-total">
        <span class="detail-qnum">∑</span>
        <span class="detail-domain">評估結果</span>
        <span class="detail-score detail-score-brand">{{
          ctp_currentResult.prob
        }}</span>
        <span class="detail-desc">{{ ctp_currentResult.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cts-actions">
      <button class="btn-view" @click="ctp_showResults = !ctp_showResults">
        {{ ctp_showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button
        class="btn-copy"
        :disabled="!ctp_currentComplete"
        @click="copyMarkdown"
      >
        {{ ctp_copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="ctp_reset">重置</button>
    </div>
    <p v-if="!ctp_currentComplete" class="progress-hint">
      {{
        mode === "bivariate"
          ? "請完成 2 項問題"
          : `已完成 ${currentPos}/${currentTotal} 項`
      }}
    </p>
  </div>
  </div>
</template>

<style scoped>
.ctsassess {
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

/* ══════════════ 診斷模型（Katz・D'Arcy）（Flick + Katz · Multivariate）══════════════ */

.cts {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.cts /* ── Severity bar ──────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.25rem;
}
.cts .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cts .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cts .severity-fill.filling {
  background: var(--vp-c-divider);
}
.cts .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cts .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cts .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cts .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cts .severity-ticks {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cts .severity-ticks span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cts .severity-ticks span:first-child {
  transform: translateX(0);
}
.cts .severity-ticks span:last-child {
  transform: translateX(-100%);
}
.cts .tick-threshold {
  color: #f59e0b;
}
.cts .cts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.cts .header-title {
  flex: 1;
  min-width: 0;
}
.cts .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.cts .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.cts .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.cts .score-number {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}
.cts .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.cts .score-badge.filling {
  color: var(--vp-c-text-3);
}
.cts .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .nihss-group {
  margin-bottom: 1.25rem;
}
.cts .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #8b5cf6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.cts .tab-bar {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.cts .flick-bar {
  border-left-color: #ef4444;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.cts .katz-bar {
  border-left-color: #3b82f6;
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
}
.cts .mv-bar {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.cts .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.cts .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.cts .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.cts .group-score-tally {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.cts .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}
.cts .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}
.cts .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.cts .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.cts .tab-btn {
  flex: 1;
  min-width: 160px;
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
.cts .tab-btn.tab-active-bi {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.cts .tab-btn.tab-active-mv {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.cts .tab-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cts .tab-sub {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  text-align: center;
}
.cts .tab-btn.tab-active-bi .tab-title {
  color: #3b82f6;
}
.cts .tab-btn.tab-active-mv .tab-title {
  color: #f97316;
}
.cts .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cts .cts-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.cts .cts-item.item-pos {
  border-color: #ef4444;
}
.cts .cts-item.item-neg {
  border-color: #22c55e;
}
.cts .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.cts .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
}
.cts .q-flick {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.cts .q-hyp {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.cts .q-noc {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.cts .q-pha {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.cts .q-sq {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.cts .q-tin {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.cts .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.cts .item-name {
  font-size: 0.87rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.cts .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.cts .item-val {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.cts .val-pos {
  color: #ef4444;
}
.cts .val-neg {
  color: #22c55e;
}
.cts .val-nd {
  color: var(--vp-c-text-3);
}
.cts .yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.cts .btn-yn {
  flex: 1;
  padding: 0.6rem 0.15rem;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  text-align: center;
}
.cts .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.cts .btn-yn-pos.yn-pos-active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.cts .btn-yn-neg.yn-neg-active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
.cts .katz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.cts .katz-btn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0.65rem 0.85rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  text-align: left;
  transition: all 0.15s;
}
.cts .katz-btn:hover {
  background: var(--vp-c-bg-mute);
}
.cts .kopt-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cts .kopt-sub {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.cts .k-classic.katz-active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.cts .k-classic.katz-active .kopt-label {
  color: #ef4444;
}
.cts .k-probable.katz-active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.cts .k-probable.katz-active .kopt-label {
  color: #f97316;
}
.cts .k-possible.katz-active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.cts .k-possible.katz-active .kopt-label {
  color: #f59e0b;
}
.cts .k-unlikely.katz-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.07);
}
.cts .k-unlikely.katz-active .kopt-label {
  color: #22c55e;
}
.cts .mv-score-bar {
  margin-bottom: 2rem;
}
.cts .mv-bar-track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.cts .mv-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.cts .mv-bar-fill.filling {
  background: var(--vp-c-divider);
}
.cts .mv-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.cts .mv-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.cts .mv-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.cts .mv-bar-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.cts .mv-bar-labels {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.cts .mv-bar-labels span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cts .mv-bar-labels span:first-child {
  transform: translateX(0);
}
.cts .mv-bar-labels span:last-child {
  transform: translateX(-100%);
}
.cts .cts-result {
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
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .cts-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .cts-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .cts-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .cts-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts .result-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.cts .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cts .cts-result.normal .result-number {
  color: #22c55e;
}
.cts .cts-result.mild .result-number {
  color: #f59e0b;
}
.cts .cts-result.moderate .result-number {
  color: #f97316;
}
.cts .cts-result.critical .result-number {
  color: #ef4444;
}
.cts .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.cts .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.cts .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.cts .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.cts .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.cts .warn-box {
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
.cts .warn-icon {
  color: #f97316;
  flex-shrink: 0;
}
.cts .cts-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.cts .btn-view,
.cts .btn-copy,
.cts .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.cts .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.cts .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.cts .btn-view:active {
  transform: translateY(0);
}
.cts .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.cts .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.cts .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.cts .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.cts .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.cts .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}
@media (max-width: 640px) {
.cts .cts-header {
    flex-wrap: wrap;
  }
.cts .score-badge {
    align-self: flex-start;
  }
.cts .cts-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.cts .katz-grid {
    grid-template-columns: 1fr;
  }
.cts .tab-toggle {
    flex-direction: column;
  }
}
.cts .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.cts .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.cts .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.cts .detail-row:last-child {
  border-bottom: none;
}
.cts .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.cts .detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.cts .dq-pos {
  color: #ef4444;
}
.cts .dq-neg {
  color: #22c55e;
}
.cts .detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.cts .detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.cts .ds-pos {
  color: #ef4444;
}
.cts .ds-neg {
  color: #22c55e;
}
.cts .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.cts .detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 140px;
}
/* ══════════════ Wainner CPR（Clinical Prediction Rule 2005）══════════════ */

.ctp {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
.ctp /* ── Severity bar ──────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.25rem;
}
.ctp .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.ctp .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.ctp .severity-fill.filling {
  background: var(--vp-c-divider);
}
.ctp .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.ctp .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.ctp .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.ctp .severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.ctp .severity-ticks {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.ctp .severity-ticks span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ctp .severity-ticks span:first-child {
  transform: translateX(0);
}
.ctp .severity-ticks span:last-child {
  transform: translateX(-100%);
}
.ctp .tick-threshold {
  color: #f59e0b;
}
.ctp /* ── Header ────────────────────────────────────────────────── */
.cts-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: nowrap;
}
.ctp .header-title {
  flex: 1;
  min-width: 0;
}
.ctp .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.ctp .subtitle {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.6;
}
.ctp .score-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  min-height: 88px;
  flex-shrink: 0;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.ctp .score-number {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
}
.ctp .score-label {
  font-size: 0.62rem;
  font-weight: 600;
  margin-top: 3px;
  text-align: center;
}
.ctp .score-badge.filling {
  color: var(--vp-c-text-3);
}
.ctp .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .score-badge.critical {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp /* ── Group ─────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}
.ctp .group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #8b5cf6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.ctp .tab-bar {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.ctp .bv-bar {
  border-left-color: #8b5cf6;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.ctp .mv-bar {
  border-left-color: #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.ctp .group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.ctp .group-label-text {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.ctp .group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.ctp .group-score-tally {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  flex-shrink: 0;
  white-space: nowrap;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.ctp .tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}
.ctp .tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}
.ctp .tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.ctp .tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.ctp .tab-btn {
  flex: 1;
  min-width: 160px;
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
.ctp .tab-btn.tab-active-bi {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.ctp .tab-btn.tab-active-mv {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.ctp .tab-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ctp .tab-sub {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  text-align: center;
}
.ctp .tab-btn.tab-active-bi .tab-title {
  color: #3b82f6;
}
.ctp .tab-btn.tab-active-mv .tab-title {
  color: #f97316;
}
.ctp /* ── Items ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.ctp .cts-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.ctp .cts-item.item-pos {
  border-color: #ef4444;
}
.ctp .cts-item.item-neg {
  border-color: #22c55e;
}
.ctp .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.ctp .item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
}
.ctp .q-bv {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.ctp .q-mv {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.ctp .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.ctp .item-name {
  font-size: 0.87rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.ctp .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.ctp .item-val {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.ctp .val-pos {
  color: #ef4444;
}
.ctp .val-neg {
  color: #22c55e;
}
.ctp .val-nd {
  color: var(--vp-c-text-3);
}
.ctp .yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.ctp .btn-yn {
  flex: 1;
  padding: 0.6rem 0.15rem;
  font-size: 0.83rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  border: 1.5px solid transparent;
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.2s;
  text-align: center;
}
.ctp .btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.ctp .btn-yn-pos.yn-pos-active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.ctp .btn-yn-neg.yn-neg-active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}
.ctp /* ── Reference table ───────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.ctp .rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.88rem;
  align-items: center;
}
.ctp .rt-row:last-child {
  border-bottom: none;
}
.ctp .rt-row:last-child {
  border-bottom: none;
}
.ctp .rt-row > *:first-child {
  flex: 1;
}
.ctp .rt-row > *:nth-child(2) {
  width: 80px;
  flex-shrink: 0;
  text-align: right;
}
.ctp .rt-row > *:last-child {
  width: 140px;
  flex-shrink: 0;
  text-align: left;
  padding: 0rem 0.9rem;
}
.ctp .rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.ctp .rt-active {
  background: var(--vp-c-brand-soft);
}
.ctp .rt-s {
  font-weight: 800;
  font-family: monospace;
}
.ctp .normal-t {
  color: #22c55e;
}
.ctp .mild-t {
  color: #f59e0b;
}
.ctp .moderate-t {
  color: #f97316;
}
.ctp .severe-t {
  color: #ef4444;
}
.ctp .rt-sm {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  text-align: left;
}
.ctp /* ── Result card ───────────────────────────────────────────── */
.cts-result {
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
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .cts-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .cts-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .cts-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .cts-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.ctp .result-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.ctp .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.ctp .cts-result.normal .result-number {
  color: #22c55e;
}
.ctp .cts-result.mild .result-number {
  color: #f59e0b;
}
.ctp .cts-result.moderate .result-number {
  color: #f97316;
}
.ctp .cts-result.critical .result-number {
  color: #ef4444;
}
.ctp .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.ctp .result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.ctp .result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.ctp .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.ctp .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.ctp .pending-note {
  text-align: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  margin-bottom: 1rem;
}
.ctp /* ── Results detail ────────────────────────────────────────── */
.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.ctp .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.ctp .detail-section-label {
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ctp .dl-bi {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}
.ctp .dl-mv {
  color: #f97316;
  background: rgba(249, 115, 22, 0.05);
}
.ctp .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.ctp .detail-row:last-child {
  border-bottom: none;
}
.ctp .detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.ctp .detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.ctp .dq-pos {
  color: #ef4444;
}
.ctp .dq-neg {
  color: #22c55e;
}
.ctp .detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.ctp .detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.ctp .ds-pos {
  color: #ef4444;
}
.ctp .ds-neg {
  color: #22c55e;
}
.ctp .detail-score-brand {
  color: var(--vp-c-brand-1);
}
.ctp .detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 140px;
}
.ctp /* ── Actions ───────────────────────────────────────────────── */
.cts-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.ctp .btn-view,
.ctp .btn-copy,
.ctp .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.ctp .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.ctp .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.ctp .btn-view:active {
  transform: translateY(0);
}
.ctp .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.ctp .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
}
.ctp .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ctp .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.ctp .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.ctp .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
.ctp .cts-header {
    flex-wrap: wrap;
  }
.ctp .score-badge {
    align-self: flex-start;
  }
.ctp .cts-result {
    flex-direction: column;
    gap: 0.75rem;
  }
.ctp .tab-toggle {
    flex-direction: column;
  }
.ctp .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}
/* ══════════════ Shared score badge（各工具統一樣式）══════════════ */
.ctsassess .score-badge {
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
.ctsassess .score-number {
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.ctsassess .score-unit {
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 2px;
  opacity: 0.75;
}
.ctsassess .score-label {
  font-size: 0.66rem;
  font-weight: 600;
  margin-top: 3px;
  letter-spacing: 0.01em;
  text-align: center;
  line-height: 1.25;
  word-break: break-word;
  max-width: 100%;
}
.ctsassess .score-badge.pending {
  border-color: var(--vp-c-divider);
  color: var(--vp-c-text-3);
}
.ctsassess .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.07), transparent);
}
.ctsassess .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.07), transparent);
}
.ctsassess .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  background: linear-gradient(180deg, rgba(249, 115, 22, 0.07), transparent);
}
.ctsassess .score-badge.badge-male {
  border-color: #38bdf8;
  color: #38bdf8;
  background: linear-gradient(180deg, rgba(56, 189, 248, 0.07), transparent);
}
.ctsassess .score-badge.badge-female {
  border-color: #f472b6;
  color: #f472b6;
  background: linear-gradient(180deg, rgba(244, 114, 182, 0.07), transparent);
}
@media (max-width: 640px) {
  .ctsassess .score-badge {
    width: auto;
    height: auto;
    min-width: 0;
    min-height: 0;
    padding: 0.5rem 0.9rem;
  }
}


/* ══════════════ 字級可讀性強化 ══════════════ */
.ctsassess .badge-label {
  font-size: 0.72rem !important;
}
.ctsassess .detail-desc {
  font-size: 0.76rem !important;
}
.ctsassess .detail-qnum {
  font-size: 0.72rem !important;
}
.ctsassess .kopt-sub {
  font-size: 0.75rem !important;
}
/* ── CTS: options in the same row as the question (ICOPE style) ── */
.ctsassess .item-header {
  align-items: center;
}
.ctsassess .item-header .yn-row {
  flex: 0 0 auto;
  justify-content: flex-end;
  background: none;
  border-top: none;
  padding: 0;
  margin-top: 0;
  gap: 0.4rem;
}
.ctsassess .item-header .yn-row .btn-yn {
  flex: 0 0 auto;
  min-width: 58px;
  padding: 0.5rem 0.9rem;
}
</style>
