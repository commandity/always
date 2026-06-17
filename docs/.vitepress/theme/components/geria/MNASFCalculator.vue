<script setup lang="ts">
import { ref, computed } from "vue";

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
// :icope-nut-abn="true"  lights up the ICOPE hint pill
const props = withDefaults(defineProps<{ icopeNutAbn?: boolean }>(), {
  icopeNutAbn: false,
});

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

const copied = ref(false);
const showResults = ref(false);

// ── Scoring ───────────────────────────────────────────────────────
const fScore = computed(() => {
  if (useF2.value) return qF2.value;
  return qF1.value;
});

const totalScore = computed((): number | null => {
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

const isComplete = computed(() => totalScore.value !== null);

const answeredCount = computed(
  () =>
    [qA.value, qB.value, qC.value, qD.value, qE.value, fScore.value].filter(
      (v) => v !== null,
    ).length,
);

// ── Interpretation ────────────────────────────────────────────────
const severity = computed(() => {
  const s = totalScore.value;
  if (s === null)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${answeredCount.value}/6 題`,
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

const barPct = computed(() =>
  isComplete.value ? ((totalScore.value ?? 0) / 14) * 100 : 0,
);

// ── Sub-score label helper ────────────────────────────────────────
function sl(v: number | null): string {
  return v === null ? "—" : String(v);
}

// ── Markdown export ───────────────────────────────────────────────
function generateMarkdown(): string {
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
    `- **MNA-SF 總分**：${totalScore.value ?? "未完成"} / 14\n` +
    `- **營養狀況**：${severity.value.level}\n` +
    `- **臨床建議**：${severity.value.advice}`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  qA.value = null;
  qB.value = null;
  qC.value = null;
  qD.value = null;
  qE.value = null;
  qF1.value = null;
  qF2.value = null;
  useF2.value = false;
  showResults.value = false;
}
</script>

<template>
  <div class="mna">
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
      <div class="score-badge" :class="severity.color">
        <span class="badge-ver">MNA-SF</span>
        <span class="score-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="score-label">{{
          isComplete
            ? severity.level.length > 10
              ? severity.level.substring(0, 10) + "…"
              : severity.level
            : `${answeredCount}/6 項`
        }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="severity.color"
          :style="{ width: barPct + '%' }"
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
              class="item-val"
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
              class="item-val"
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
              class="item-val"
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
              class="item-val"
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
              class="item-val"
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
              class="item-val"
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
              class="item-val"
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
    <div class="sub-score-row" v-if="answeredCount > 0">
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
        :class="isComplete ? severity.color : 'ss-nd'"
      >
        <span class="ss-label">總分</span>
        <span class="ss-val">{{ isComplete ? totalScore : "—" }}</span>
        <span class="ss-max">/ 14</span>
      </div>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="mna-result" :class="severity.color">
      <div class="result-left">
        <span class="result-number">{{ isComplete ? totalScore : "—" }}</span>
        <span class="result-max" v-if="isComplete">/ 14</span>
      </div>
      <div class="result-right">
        <span class="result-ver">MNA-SF</span>
        <span class="result-level">{{ severity.level }}</span>
        <span class="result-advice">{{ severity.advice }}</span>
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
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
        <span class="detail-score detail-score-brand">{{ totalScore }}</span>
        <div class="detail-desc detail-desc-block">
          <span class="detail-desc-unit">/ 14</span>
          <span class="detail-desc-label">{{ severity.level }}</span>
        </div>
      </div>
    </div>

    <!-- ── Alert ──────────────────────────────────────────────── -->
    <div
      v-if="isComplete && severity.screen"
      class="mna-alert"
      :class="`alert-${severity.color}`"
    >
      <span class="alert-icon">⚠</span>
      <span>
        <strong>MNA-SF 陽性（總分 {{ totalScore }}/14）：</strong
        >{{ severity.advice }}
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
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">
      已完成 {{ answeredCount }}/6 項，尚餘 {{ 6 - answeredCount }} 項
    </p>
  </div>
</template>

<style scoped>
.mna {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ─────────────────────────────────────────────────────── */
.mna-header {
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
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  white-space: nowrap;
  cursor: default;
  user-select: none;
}
.hint-tag--active {
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
}
.hint-tag--inactive {
  background: rgba(34, 197, 94, 0.08);
  color: #166534;
}

/* ── Score badge ─────────────────────────────────────────────────── */
.score-badge {
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
.tick-red {
  color: #ef4444;
  font-weight: 700;
}
.tick-green {
  color: #22c55e;
  font-weight: 700;
}

/* ── Alert ───────────────────────────────────────────────────────── */
.mna-alert {
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
.alert-mild {
  background: rgba(245, 158, 11, 0.06);
  border: 1px solid rgba(245, 158, 11, 0.35);
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
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.25);
  border-left: 3px solid #10b981;
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
.cross-hint {
  color: #22c55e;
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
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0d9488;
  margin-bottom: 0.6rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.q-bar-a {
  border-left: 3px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.q-bar-b {
  border-left: 3px solid #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.q-bar-c {
  border-left: 3px solid #a855f7;
  background: linear-gradient(
    135deg,
    rgba(168, 85, 247, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(168, 85, 247, 0.06);
}
.q-bar-d {
  border-left: 3px solid #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.q-bar-e {
  border-left: 3px solid #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.q-bar-f {
  border-left: 3px solid #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
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
  /* fixed geometry — prevents layout shift when text/border changes */
  min-width: 56px;
  text-align: center;
  border: 1px solid transparent;
  box-sizing: border-box;
}
.tally-ok {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
  border-color: rgba(34, 197, 94, 0.25);
}
.tally-abn {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.25);
}
.tally-nd {
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-soft);
  border-color: var(--vp-c-divider);
}

/* ── F toggle ────────────────────────────────────────────────────── */
.f-toggle {
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
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.18s;
}
.tab-btn.tab-active-f {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
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
.tab-btn.tab-active-f .tab-title {
  color: #22c55e;
}

/* ── Item cards ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.mna-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: border-color 0.2s;
}
.mna-item.item-ok {
  border-color: #22c55e;
}
.mna-item.item-err {
  border-color: #ef4444;
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
  font-size: 0.72rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 999px;
  white-space: nowrap;
}
.q-a {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.q-b {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.q-c {
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
}
.q-d {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.q-e {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.q-f {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
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
  line-height: 1.5;
}
.item-val {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 40px;
  text-align: right;
  white-space: nowrap;
}
.val-ok {
  color: #22c55e;
}
.val-abn {
  color: #ef4444;
}
.val-nd {
  color: var(--vp-c-text-3);
}

/* ── Option pills (ENS6Q style) ──────────────────────────────────── */
.option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.cols-2 {
  grid-template-columns: repeat(2, 1fr);
}
.cols-3 {
  grid-template-columns: repeat(3, 1fr);
}
.cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

.opt-btn {
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
.opt-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.opt-label {
  font-size: 0.78rem;
  font-weight: 600;
}
.opt-score {
  font-size: 0.65rem;
  font-weight: 700;
}

/* Score-specific colors — m0 through m3 */
.opt-btn.m0 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-btn.m0:hover:not(.opt-active) {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-btn.m0.opt-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.opt-btn.m0 .opt-score {
  color: rgba(239, 68, 68, 0.5);
}
.opt-btn.m0.opt-active .opt-score {
  color: rgba(239, 68, 68, 0.7);
}

.opt-btn.m1 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-btn.m1:hover:not(.opt-active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-btn.m1.opt-active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.opt-btn.m1 .opt-score {
  color: rgba(249, 115, 22, 0.5);
}
.opt-btn.m1.opt-active .opt-score {
  color: rgba(249, 115, 22, 0.7);
}

.opt-btn.m2 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-btn.m2:hover:not(.opt-active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-btn.m2.opt-active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.opt-btn.m2 .opt-score {
  color: rgba(245, 158, 11, 0.5);
}
.opt-btn.m2.opt-active .opt-score {
  color: rgba(245, 158, 11, 0.7);
}

.opt-btn.m3 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-btn.m3:hover:not(.opt-active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-btn.m3.opt-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.opt-btn.m3 .opt-score {
  color: rgba(34, 197, 94, 0.5);
}
.opt-btn.m3.opt-active .opt-score {
  color: rgba(34, 197, 94, 0.7);
}

/* Active state color for label text */
.opt-btn.opt-active .opt-label {
  font-weight: 700;
}
.opt-btn.opt-active {
  font-weight: 700;
}

/* ── F2 note ─────────────────────────────────────────────────────── */
.f2-note {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  padding: 0.4rem 0.6rem;
  margin-bottom: 0.4rem;
  border-left: 2px solid #22c55e;
  background: rgba(34, 197, 94, 0.04);
  border-radius: 0 6px 6px 0;
}

/* ── Sub-score row ───────────────────────────────────────────────── */
.sub-score-row {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.sub-score-card {
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
.sub-score-card:hover {
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
}
.ss-ok {
  border-color: #22c55e;
}
.ss-abn {
  border-color: #ef4444;
}
.ss-nd {
  border-color: var(--vp-c-divider);
  opacity: 0.55;
}
.ss-total {
  max-width: 100px;
}
.sub-score-card.normal {
  border-color: #22c55e;
}
.sub-score-card.mild {
  border-color: #f59e0b;
}
.sub-score-card.critical {
  border-color: #ef4444;
}
.ss-label {
  font-size: 0.63rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
}
.ss-val {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.ss-max {
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}
.ss-ok .ss-val {
  color: #22c55e;
}
.ss-abn .ss-val {
  color: #ef4444;
}
.sub-score-card.normal .ss-val {
  color: #22c55e;
}
.sub-score-card.mild .ss-val {
  color: #f59e0b;
}
.sub-score-card.critical .ss-val {
  color: #ef4444;
}
.ss-plus {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

/* ── Result card ─────────────────────────────────────────────────── */
.mna-result {
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
.mna-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.mna-result.critical {
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
.mna-result.normal .result-number {
  color: #22c55e;
}
.mna-result.mild .result-number {
  color: #f59e0b;
}
.mna-result.critical .result-number {
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

/* ── Results detail ──────────────────────────────────────────────── */
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
  color: #22c55e;
  flex-shrink: 0;
  width: 32px;
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
.ds-ok {
  color: #22c55e;
}
.ds-abn {
  color: #ef4444;
}
.detail-score-brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 80px;
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

/* ── Warn box ────────────────────────────────────────────────────── */
.warn-box {
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
.warn-icon {
  color: #22c55e;
  flex-shrink: 0;
}

/* ── Actions ─────────────────────────────────────────────────────── */
.mna-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 8px 20px;
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
  border: 1px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-1);
  color: #fff;
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
  .mna-header {
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
  .mna-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .f-toggle {
    flex-direction: column;
  }
  .sub-score-row {
    gap: 0.2rem;
  }
  .ss-plus {
    font-size: 0.85rem;
  }
  .hint-tag {
    white-space: normal;
  }
  .option-row {
    flex-wrap: wrap;
  }
  .opt-btn {
    min-width: 45%;
  }
}
</style>
