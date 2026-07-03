<script setup lang="ts">
import { ref, computed } from "vue";

function tickColor(i: number): string {
  if (i <= 2) return "#22c55e";
  if (i === 3) return "#eab308";
  if (i === 4) return "#f59e0b";
  return "#ef4444";
}

const stages = [
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

const groups = [
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

const selected = ref<number | null>(null);
const showResults = ref(false);
const copied = ref(false);

const result = computed(
  () => stages.find((s) => s.id === selected.value) ?? null,
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

const isComplete = computed(() => selected.value !== null);

function select(id: number) {
  selected.value = id;
}

function reset() {
  selected.value = null;
  showResults.value = false;
}

function generateMarkdown() {
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

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}
</script>

<template>
  <div class="gds">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="gds-header">
      <div class="header-title">
        <h2 class="title">GDS 整體退化量表</h2>
        <p class="subtitle">Global Deterioration Scale · 失智症嚴重度評估</p>
      </div>
      <div
        class="score-badge"
        :class="isComplete ? 'sb-' + severityColor : 'sb-unset'"
      >
        <span class="score-number">{{ isComplete ? selected : "—" }}</span>
        <span class="score-label">{{ isComplete ? "階段" : "未選取" }}</span>
      </div>
    </div>

    <!-- ── Severity bar ───────────────────────────────────────── -->
    <div class="severity-bar-wrap">
      <div class="severity-bar">
        <div
          class="severity-fill"
          :class="isComplete ? 'sf-' + severityColor : ''"
          :style="{
            width: isComplete ? ((selected! - 1) / 6) * 100 + '%' : '0%',
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
    <div v-for="group in groups" :key="group.label" class="gds-group">
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
          :class="[selected === id ? 'selected' : '', stages[id - 1].color]"
          @click="select(id)"
        >
          <div class="item-header">
            <div class="item-meta-row">
              <span class="item-qnum" :class="stages[id - 1].color + '-qnum'"
                >S{{ id }}</span
              >
            </div>
            <div class="item-name-block">
              <span class="item-name">{{ stages[id - 1].title }}</span>
              <span class="item-sub">{{ stages[id - 1].sub }}</span>
            </div>
            <span
              class="item-score"
              :class="
                selected === id ? stages[id - 1].color + '-score' : 'unanswered'
              "
            >
              {{ selected === id ? "✓" : "—" }}
            </span>
          </div>
          <div class="gds-symptoms">
            <div
              v-for="s in stages[id - 1].symptoms"
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
    <div v-if="isComplete" class="gds-result" :class="'res-' + severityColor">
      <div class="result-left">
        <span class="result-number">{{ selected }}</span>
        <span class="result-max">/ 7</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ result!.title }}</span>
        <span class="result-advice">{{ result!.sub }}</span>
        <span class="result-calc"
          >GDS 第 {{ selected }} 階段 · {{ severityLabel }}</span
        >
      </div>
    </div>

    <!-- ── Results detail ─────────────────────────────────────── -->
    <div v-if="showResults && isComplete" class="results-detail">
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
        @click="showResults = !showResults"
        :disabled="!isComplete"
      >
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown" :disabled="!isComplete">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
    <p v-if="!isComplete" class="progress-hint">請選取一個階段以查看結果</p>
  </div>
</template>

<style scoped>
.gds {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.gds-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
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
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}

.score-badge {
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
.score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.sb-unset {
  color: var(--vp-c-text-3);
}
.sb-none {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mild {
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mild2 {
  border-color: #eab308;
  color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-mod {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-severe {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.sb-crit {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Severity bar ──────────────────────────────────────────────── */
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
.sf-none {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.sf-mild {
  background: linear-gradient(90deg, #84cc16, #a3e635);
}
.sf-mild2 {
  background: linear-gradient(90deg, #eab308, #facc15);
}
.sf-mod {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.sf-severe {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.sf-crit {
  background: linear-gradient(90deg, #ef4444, #f87171);
}

.severity-ticks-abs,
.severity-labels-abs {
  position: relative;
  height: 14px;
  margin-top: 2px;
}
.severity-labels-abs {
  margin-top: 0;
  height: 13px;
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
  white-space: nowrap;
  font-weight: 600;
}
.label-abs[style*="left: 0%"] {
  transform: translateX(0);
}
.label-abs[style*="left: 100%"] {
  transform: translateX(-100%);
}
.lbl-none {
  color: #22c55e;
}
.lbl-mild2 {
  color: #eab308;
}
.lbl-mod {
  color: #f59e0b;
}
.lbl-crit {
  color: #ef4444;
}

/* ── Intro ─────────────────────────────────────────────────────── */
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
.intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Group ─────────────────────────────────────────────────────── */
.gds-group {
  margin-bottom: 1.5rem;
}
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.none-header {
  border-left-color: #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.group-header.mild2-header {
  border-left-color: #eab308;
  background: linear-gradient(
    135deg,
    rgba(234, 179, 8, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.06);
}
.group-header.severe-header {
  border-left-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.group-score-pill {
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
.group-score-pill.none-pill {
  border-color: rgba(34, 197, 94, 0.25);
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.group-score-pill.mild2-pill {
  border-color: rgba(234, 179, 8, 0.25);
  color: #eab308;
  background: rgba(234, 179, 8, 0.06);
}
.group-score-pill.severe-pill {
  border-color: rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item ──────────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gds-item {
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
.gds-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}

.gds-item.selected.none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.15),
    0 2px 10px rgba(34, 197, 94, 0.08);
}
.gds-item.selected.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.15),
    0 2px 10px rgba(132, 204, 22, 0.08);
}
.gds-item.selected.mild2 {
  border-color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.15),
    0 2px 10px rgba(234, 179, 8, 0.08);
}
.gds-item.selected.mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.15),
    0 2px 10px rgba(245, 158, 11, 0.08);
}
.gds-item.selected.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.15),
    0 2px 10px rgba(249, 115, 22, 0.08);
}
.gds-item.selected.crit {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.15),
    0 2px 10px rgba(239, 68, 68, 0.08);
}

.item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.6rem 0.9rem;
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
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.none-qnum {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.mild-qnum {
  background: linear-gradient(135deg, #84cc16, #65a30d);
  box-shadow: 0 1px 3px rgba(132, 204, 22, 0.2);
}
.mild2-qnum {
  background: linear-gradient(135deg, #eab308, #ca8a04);
  box-shadow: 0 1px 3px rgba(234, 179, 8, 0.2);
}
.mod-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.severe-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.2);
}
.crit-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
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
  line-height: 1.4;
}

.item-score {
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.none-score {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.mild-score {
  color: #84cc16;
  border-color: rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.06);
}
.mild2-score {
  color: #eab308;
  border-color: rgba(234, 179, 8, 0.25);
  background: rgba(234, 179, 8, 0.06);
}
.mod-score {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.06);
}
.severe-score {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.crit-score {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
  background: rgba(239, 68, 68, 0.08);
}

/* ── Symptoms ──────────────────────────────────────────────────── */
.gds-symptoms {
  padding: 0.5rem 0.9rem 0.6rem;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.symptom-row {
  display: flex;
  align-items: flex-start;
  gap: 0.35rem;
}
.symptom-dot {
  color: var(--vp-c-text-3);
  font-size: 0.9rem;
  line-height: 1.5;
  flex-shrink: 0;
}
.symptom-text {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.gds-item.selected .symptom-text {
  color: var(--vp-c-text-1);
}

/* ── Result card ───────────────────────────────────────────────── */
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
.res-none {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mild2 {
  border-color: #eab308;
  box-shadow:
    0 0 0 1px rgba(234, 179, 8, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-mod {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.res-crit {
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
.res-none .result-number {
  color: #22c55e;
}
.res-mild .result-number {
  color: #84cc16;
}
.res-mild2 .result-number {
  color: #eab308;
}
.res-mod .result-number {
  color: #f59e0b;
}
.res-severe .result-number {
  color: #f97316;
}
.res-crit .result-number {
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
  width: 32px;
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
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 100px;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.gds-actions {
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
.btn-view:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.btn-view:active:not(:disabled) {
  transform: translateY(0);
}
.btn-view:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  .gds-header {
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
  .gds-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .severity-labels-abs {
    display: none;
  }
}
</style>
