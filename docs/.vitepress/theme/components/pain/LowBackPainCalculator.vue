<script setup lang="ts">
import { ref, computed } from "vue";

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
const copied = ref(false);
const showResults = ref(false);

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

function generateMarkdown() {
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

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  redFlags.forEach((q) => (rfAnswers.value[q.key] = null));
  nerveRootQ.forEach((q) => (nrAnswers.value[q.key] = null));
  yellowFlags.forEach((q) => (yfAnswers.value[q.key] = null));
  duration.value = null;
  showResults.value = false;
}
</script>

<template>
  <div class="lbp">
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
    <div v-if="showResults && classification" class="results-detail">
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
      <button class="btn-view" @click="showResults = !showResults">
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" :disabled="!allAnswered" @click="copyMarkdown">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.lbp {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.lbp-header {
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
.sb-icon {
  font-size: 1.1rem;
  line-height: 1;
  flex-shrink: 0;
}
.sb-label {
  font-size: 0.78rem;
  font-weight: 700;
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

/* ── Duration ──────────────────────────────────────────────────── */
.dur-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-radius: 8px;
}
.dur-btn {
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
.dur-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.dur-btn.active {
  border-color: var(--vp-c-brand-1);
  background: color-mix(in srgb, rgb(99, 102, 241) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.08);
}
.dur-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.dur-sub {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
}
.dur-btn.active .dur-label {
  color: var(--vp-c-brand-1);
}

/* ── Groups ────────────────────────────────────────────────────── */
.lbp-group {
  margin-bottom: 1.25rem;
}

.group-header-bar {
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
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
.group-label-text {
  font-size: 0.85rem;
  font-weight: 700;
}
.group-sub-text {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  flex-shrink: 0;
}

/* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Item cards ────────────────────────────────────────────────── */
.lbp-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.lbp-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.lbp-item.scored {
  border-color: rgba(99, 102, 241, 0.3);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.lbp-item.motor-scored {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
}
.lbp-item.coord-scored {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
}
.lbp-item.lang-scored {
  border-color: #f59e0b !important;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), transparent);
}

.item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
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
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}

/* ── Yes/No pills ──────────────────────────────────────────────── */
.yn-row {
  display: flex;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
  border-radius: 6px;
  flex-shrink: 0;
}
.yn-btn {
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
.yn-btn:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.yn-btn-pos.yn-pos-active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.yn-btn-neg.yn-neg-active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
  color: #22c55e;
}

/* ── Result card ───────────────────────────────────────────────── */
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
.lbp-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.lbp-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.result-left {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.result-icon {
  font-size: 2.2rem;
  line-height: 1;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 4px;
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
.result-mgmt {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-style: italic;
}
.pending-note {
  text-align: center;
  padding: 1rem;
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
  margin-bottom: 1rem;
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
.detail-section-label {
  padding: 0.35rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
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
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 36px;
  white-space: nowrap;
}
.detail-domain {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 60px;
  text-align: right;
  white-space: nowrap;
}
.detail-score.score-yes {
  color: #ef4444;
}
.detail-score.score-no {
  color: #22c55e;
}
.detail-score.score-empty {
  color: var(--vp-c-text-3);
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
  font-size: 0.72rem;
  width: auto;
}

/* ── Actions ───────────────────────────────────────────────────── */
.lbp-actions {
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

@media (max-width: 640px) {
  .lbp-header {
    flex-direction: column;
  }
  .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .dur-row {
    flex-direction: column;
  }
  .lbp-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
