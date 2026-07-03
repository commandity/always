<script setup lang="ts">
import { ref, computed } from "vue";

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

const copied = ref(false);
const showResults = ref(false);

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
const mvComplete = computed(
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
  if (!mvComplete.value) return null;
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

const mvResult = computed(() => {
  if (!mvComplete.value)
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

const currentResult = computed(() =>
  tab.value === "bivariate" ? bivariateResult.value : mvResult.value,
);
const currentComplete = computed(() =>
  tab.value === "bivariate" ? bivariateComplete.value : mvComplete.value,
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
const badgeScore = computed(() => {
  if (tab.value === "multivariate" && mvComplete.value)
    return (mvScore.value ?? 0) + "/11";
  if (currentComplete.value) return "✓";
  return "—";
});
const badgeLabel = computed(() => {
  if (currentComplete.value) return currentResult.value.prob;
  if (tab.value === "bivariate") return "2 題";
  return mvAnswered.value + "/7";
});

function generateMarkdown(): string {
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
    `**結果：${mvResult.value.level}（預測機率 ${mvResult.value.prob}）**\n\n${mvResult.value.advice}`
  );
}

async function copyOutput() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  flick.value = null;
  katz.value = null;
  hypalgesia.value = null;
  phalen.value = null;
  tinel.value = null;
  nocturnal.value = null;
  squareWrist.value = null;
  showResults.value = false;
}

function switchTab(t: Tab) {
  tab.value = t;
  showResults.value = false;
}
</script>

<template>
  <div class="cts">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="cts-header">
      <div class="header-title">
        <h2 class="title">CTS 腕隧道症候群臨床決策樹</h2>
        <p class="subtitle">
          Carpal Tunnel Syndrome Decision TreeCalc · 雙變量（Flick + Katz）/
          多變量模型 · Katz 1990 · D'Arcy &amp; McGee 2000
        </p>
      </div>
      <div class="score-badge" :class="currentResult.color">
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
          :class="currentResult.color"
          :style="{ width: currentComplete ? currentResult.pct + '%' : '0%' }"
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
          <span
            class="item-val"
            :class="
              flick === 'yes'
                ? 'val-pos'
                : flick === 'no'
                  ? 'val-neg'
                  : 'val-nd'
            "
          >
            {{ flick !== null ? (flick === "yes" ? "陽性" : "陰性") : "—" }}
          </span>
        </div>
        <div class="yn-row">
          <button
            class="btn-yn btn-yn-pos"
            :class="{ 'yn-pos-active': flick === 'yes' }"
            @click="flick = 'yes'"
          >
            是（Flick 徵陽性）
          </button>
          <button
            class="btn-yn btn-yn-neg"
            :class="{ 'yn-neg-active': flick === 'no' }"
            @click="flick = 'no'"
          >
            否（無甩手動作）
          </button>
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
              mvComplete
                ? mvScore !== null && mvScore >= 5
                  ? 'tally-abn'
                  : 'tally-ok'
                : 'tally-nd'
            "
          >
            {{ mvComplete ? mvScore + "/11" : mvAnswered + "/7" }}
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
              <span
                class="item-val"
                :class="
                  hypalgesia === 'yes'
                    ? 'val-pos'
                    : hypalgesia === 'no'
                      ? 'val-neg'
                      : 'val-nd'
                "
              >
                {{
                  hypalgesia !== null
                    ? hypalgesia === "yes"
                      ? "陽性"
                      : "陰性"
                    : "—"
                }}
              </span>
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': hypalgesia === 'yes' }"
                @click="hypalgesia = 'yes'"
              >
                是（陽性）
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': hypalgesia === 'no' }"
                @click="hypalgesia = 'no'"
              >
                否（陰性）
              </button>
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
              <span
                class="item-val"
                :class="
                  nocturnal === 'yes'
                    ? 'val-pos'
                    : nocturnal === 'no'
                      ? 'val-neg'
                      : 'val-nd'
                "
              >
                {{
                  nocturnal !== null
                    ? nocturnal === "yes"
                      ? "陽性"
                      : "陰性"
                    : "—"
                }}
              </span>
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': nocturnal === 'yes' }"
                @click="nocturnal = 'yes'"
              >
                是（陽性）
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': nocturnal === 'no' }"
                @click="nocturnal = 'no'"
              >
                否（陰性）
              </button>
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
              <span
                class="item-val"
                :class="
                  phalen === 'yes'
                    ? 'val-pos'
                    : phalen === 'no'
                      ? 'val-neg'
                      : 'val-nd'
                "
              >
                {{
                  phalen !== null ? (phalen === "yes" ? "陽性" : "陰性") : "—"
                }}
              </span>
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': phalen === 'yes' }"
                @click="phalen = 'yes'"
              >
                是（陽性）
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': phalen === 'no' }"
                @click="phalen = 'no'"
              >
                否（陰性）
              </button>
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
              <span
                class="item-val"
                :class="
                  squareWrist === 'yes'
                    ? 'val-pos'
                    : squareWrist === 'no'
                      ? 'val-neg'
                      : 'val-nd'
                "
              >
                {{
                  squareWrist !== null
                    ? squareWrist === "yes"
                      ? "陽性"
                      : "陰性"
                    : "—"
                }}
              </span>
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': squareWrist === 'yes' }"
                @click="squareWrist = 'yes'"
              >
                是（陽性）
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': squareWrist === 'no' }"
                @click="squareWrist = 'no'"
              >
                否（陰性）
              </button>
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
              <span
                class="item-val"
                :class="
                  tinel === 'yes'
                    ? 'val-pos'
                    : tinel === 'no'
                      ? 'val-neg'
                      : 'val-nd'
                "
              >
                {{ tinel !== null ? (tinel === "yes" ? "陽性" : "陰性") : "—" }}
              </span>
            </div>
            <div class="yn-row">
              <button
                class="btn-yn btn-yn-pos"
                :class="{ 'yn-pos-active': tinel === 'yes' }"
                @click="tinel = 'yes'"
              >
                是（陽性）
              </button>
              <button
                class="btn-yn btn-yn-neg"
                :class="{ 'yn-neg-active': tinel === 'no' }"
                @click="tinel = 'no'"
              >
                否（陰性）
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Score bar -->
      <div v-if="mvAnswered > 0" class="mv-score-bar">
        <div class="mv-bar-track">
          <div
            class="mv-bar-fill"
            :class="mvResult.color"
            :style="{
              width: mvComplete ? ((mvScore ?? 0) / 11) * 100 + '%' : '0%',
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
    <div v-if="showResults && currentComplete" class="results-detail">
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
            >{{ mvResult.prob }} · {{ mvResult.level }}</span
          >
        </div>
      </template>
    </div>

    <!-- ── Result card ────────────────────────────────────────── -->
    <div class="cts-result" :class="currentResult.color">
      <div class="result-left">
        <span class="result-number">{{
          currentComplete ? currentResult.prob : "—"
        }}</span>
        <span class="result-max">CTS 診斷機率</span>
      </div>
      <div class="result-right">
        <span class="result-ver">{{
          tab === "bivariate" ? "雙變量模型" : "多變量模型"
        }}</span>
        <span class="result-level">{{ currentResult.level }}</span>
        <span class="result-advice">{{ currentResult.advice }}</span>
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
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!currentComplete" @click="copyOutput">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!currentComplete" class="progress-hint">
      {{
        tab === "bivariate"
          ? "請完成 Flick 徵及 Katz 圖表評分"
          : `已完成 ${mvAnswered}/7 項，尚餘 ${7 - mvAnswered} 項`
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
.flick-bar {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.katz-bar {
  border-left-color: #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(59, 130, 246, 0.06);
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
.q-flick {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}
.q-hyp {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.q-noc {
  color: #06b6d4;
  background: rgba(6, 182, 212, 0.12);
}
.q-pha {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.q-sq {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.q-tin {
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
.katz-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}
.katz-btn {
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
.katz-btn:hover {
  background: var(--vp-c-bg-mute);
}
.kopt-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.kopt-sub {
  font-size: 0.67rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.k-classic.katz-active {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.k-classic.katz-active .kopt-label {
  color: #ef4444;
}
.k-probable.katz-active {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.k-probable.katz-active .kopt-label {
  color: #f97316;
}
.k-possible.katz-active {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.k-possible.katz-active .kopt-label {
  color: #f59e0b;
}
.k-unlikely.katz-active {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.07);
}
.k-unlikely.katz-active .kopt-label {
  color: #22c55e;
}
.mv-score-bar {
  margin-bottom: 2rem;
}
.mv-bar-track {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: visible;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.mv-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.mv-bar-fill.filling {
  background: var(--vp-c-divider);
}
.mv-bar-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.mv-bar-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.mv-bar-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.mv-bar-fill.critical {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.mv-bar-labels {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.mv-bar-labels span {
  position: absolute;
  transform: translateX(-50%);
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.mv-bar-labels span:first-child {
  transform: translateX(0);
}
.mv-bar-labels span:last-child {
  transform: translateX(-100%);
}
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
  .katz-grid {
    grid-template-columns: 1fr;
  }
  .tab-toggle {
    flex-direction: column;
  }
}
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
</style>
