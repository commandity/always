<script setup lang="ts">
import { ref, computed } from "vue";

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
const copied = ref(false);
const showResults = ref(false);

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
const currentComplete = computed(() =>
  currentItems.value.every((q) => currentAns.value[q.key] !== null),
);

const bvComplete = computed(() =>
  bivariateItems.every((q) => bvAns.value[q.key] !== null),
);
const mvComplete = computed(() =>
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

const mvResult = computed(() => {
  if (!mvComplete.value) return null;
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

const currentResult = computed(() =>
  mode.value === "bivariate" ? bvResult.value : mvResult.value,
);

const badgeScore = computed(() => `${currentPos.value}/${currentTotal.value}`);
const badgeLabel = computed(() =>
  currentResult.value ? currentResult.value.prob : "填寫中",
);

function generateMarkdown() {
  const r = currentResult.value;
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
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  bivariateItems.forEach((q) => (bvAns.value[q.key] = null));
  multivariateItems.forEach((q) => (mvAns.value[q.key] = null));
  showResults.value = false;
}
</script>

<template>
  <div class="cts">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cts-header">
      <div class="header-title">
        <h2 class="title">Carpal Tunnel Syndrome 腕隧道症候群臨床決策樹</h2>
        <p class="subtitle">
          Carpal Tunnel Syndrome Decision TreeCalc · Wainner CPR 2005
        </p>
      </div>
      <div class="score-badge" :class="currentResult?.color ?? 'filling'">
        <span class="badge-label">CTS</span>
        <span class="score-number">{{ badgeScore }}</span>
        <span class="score-label">{{ badgeLabel }}</span>
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
          :class="currentResult?.color ?? 'filling'"
          :style="{
            width: currentResult ? currentResult.pct + '%' : '0%',
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
          :class="currentComplete ? 'tally-abn' : 'tally-nd'"
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
              <span class="item-sub">{{ q.hint }}</span>
            </div>
            <span
              class="item-val"
              :class="
                currentAns[q.key] === true
                  ? 'val-pos'
                  : currentAns[q.key] === false
                    ? 'val-neg'
                    : 'val-nd'
              "
            >
              {{
                currentAns[q.key] === true
                  ? "陽性"
                  : currentAns[q.key] === false
                    ? "陰性"
                    : "—"
              }}
            </span>
          </div>
          <div class="yn-row">
            <button
              class="btn-yn btn-yn-pos"
              :class="{ 'yn-pos-active': currentAns[q.key] === true }"
              @click="setAns(q.key, true)"
            >
              陽性（{{ q.lr }}）
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

    <!-- ── Reference table ────────────────────────────────────── -->
    <div class="ref-table" v-if="currentResult">
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
        <div class="rt-row" :class="{ 'rt-active': mvPos >= 4 && mvComplete }">
          <span class="rt-s severe-t">≥ 4</span><span>≈ 83%</span
          ><span class="rt-sm">可直接治療</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos === 3 && mvComplete }">
          <span class="rt-s moderate-t">3</span><span>≈ 60%</span
          ><span class="rt-sm">電生理確認</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos === 2 && mvComplete }">
          <span class="rt-s mild-t">2</span><span>≈ 40%</span
          ><span class="rt-sm">電生理確認</span>
        </div>
        <div class="rt-row" :class="{ 'rt-active': mvPos <= 1 && mvComplete }">
          <span class="rt-s normal-t">≤ 1</span><span>≈ 20%</span
          ><span class="rt-sm">考慮其他診斷</span>
        </div>
      </template>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div v-if="currentResult" class="cts-result" :class="currentResult.color">
      <div class="result-left">
        <span class="result-number">{{ currentResult.prob }}</span>
        <span class="result-max">CTS 可能性</span>
      </div>
      <div class="result-right">
        <span class="result-ver">{{
          mode === "bivariate" ? "二元變量法" : "多元變量法"
        }}</span>
        <span class="result-level">{{ currentResult.level }}</span>
        <span class="result-advice">{{ currentResult.advice }}</span>
      </div>
    </div>
    <div v-else class="pending-note">請完成所有問題以獲得評估結果</div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div
      v-if="showResults && currentComplete && currentResult"
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
          currentResult.prob
        }}</span>
        <span class="detail-desc">{{ currentResult.level }}</span>
      </div>
    </div>

    <!-- ── Actions ────────────────────────────────────────────── -->
    <div class="cts-actions">
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button
        class="btn-copy"
        :disabled="!currentComplete"
        @click="copyMarkdown"
      >
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!currentComplete" class="progress-hint">
      {{
        mode === "bivariate"
          ? "請完成 2 項問題"
          : `已完成 ${currentPos}/${currentTotal} 項`
      }}
    </p>
  </div>
</template>

<style scoped>
.cts {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Severity bar ──────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.25rem;
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
.severity-ticks {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-ticks span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.severity-ticks span:first-child {
  transform: translateX(0);
}
.severity-ticks span:last-child {
  transform: translateX(-100%);
}
.tick-threshold {
  color: #f59e0b;
}

/* ── Header ────────────────────────────────────────────────── */
.cts-header {
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
.score-badge {
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
.badge-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.score-number {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
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

/* ── Group ─────────────────────────────────────────────────── */
.nihss-group {
  margin-bottom: 1.25rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #8b5cf6;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.tab-bar {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.bv-bar {
  border-left-color: #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.mv-bar {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
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
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}
.tab-toggle {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.tab-btn {
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
.tab-btn.tab-active-bi {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.tab-btn.tab-active-mv {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.tab-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.tab-sub {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  text-align: center;
}
.tab-btn.tab-active-bi .tab-title {
  color: #3b82f6;
}
.tab-btn.tab-active-mv .tab-title {
  color: #f97316;
}

/* ── Items ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.cts-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.cts-item.item-pos {
  border-color: #ef4444;
}
.cts-item.item-neg {
  border-color: #22c55e;
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
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  flex-shrink: 0;
}
.q-bv {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-mv {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.87rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  line-height: 1.5;
}
.item-val {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
}
.val-pos {
  color: #ef4444;
}
.val-neg {
  color: #22c55e;
}
.val-nd {
  color: var(--vp-c-text-3);
}
.yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-top: 1px solid var(--vp-c-divider);
}
.btn-yn {
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
.btn-yn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.btn-yn-pos.yn-pos-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.btn-yn-neg.yn-neg-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}

/* ── Reference table ───────────────────────────────────────── */
.ref-table {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.rt-row {
  display: grid;
  grid-template-columns: 70px 1fr 1fr;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 0.78rem;
  align-items: center;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-row:last-child {
  border-bottom: none;
}
.rt-row > *:first-child {
  flex: 1;
}
.rt-row > *:nth-child(2) {
  width: 80px;
  flex-shrink: 0;
  text-align: right;
}
.rt-row > *:last-child {
  width: 140px;
  flex-shrink: 0;
  text-align: left;
  padding: 0rem 0.9rem;
}
.rt-header {
  background: var(--vp-c-bg-mute);
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.rt-active {
  background: var(--vp-c-brand-soft);
}
.rt-s {
  font-weight: 800;
  font-family: monospace;
}
.normal-t {
  color: #22c55e;
}
.mild-t {
  color: #f59e0b;
}
.moderate-t {
  color: #f97316;
}
.severe-t {
  color: #ef4444;
}
.rt-sm {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  text-align: left;
}

/* ── Result card ───────────────────────────────────────────── */
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
.cts-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.cts-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.cts-result.normal .result-number {
  color: #22c55e;
}
.cts-result.mild .result-number {
  color: #f59e0b;
}
.cts-result.moderate .result-number {
  color: #f97316;
}
.cts-result.critical .result-number {
  color: #ef4444;
}
.result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}
.result-ver {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
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
.pending-note {
  text-align: center;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  margin-bottom: 1rem;
}

/* ── Results detail ────────────────────────────────────────── */
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
.detail-section-label {
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.dl-bi {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05);
}
.dl-mv {
  color: #f97316;
  background: rgba(249, 115, 22, 0.05);
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
.detail-total {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-qnum {
  font-size: 0.66rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
}
.dq-pos {
  color: #ef4444;
}
.dq-neg {
  color: #22c55e;
}
.detail-domain {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.78rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
}
.ds-pos {
  color: #ef4444;
}
.ds-neg {
  color: #22c55e;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.68rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 140px;
}

/* ── Actions ───────────────────────────────────────────────── */
.cts-actions {
  display: flex;
  gap: 8px;
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
  .cts-header {
    flex-wrap: wrap;
  }
  .score-badge {
    align-self: flex-start;
  }
  .cts-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .tab-toggle {
    flex-direction: column;
  }
  .item-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
  }
}
</style>
