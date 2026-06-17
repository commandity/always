<script setup lang="ts">
import { ref, computed } from "vue";

// ── FAST Stages ───────────────────────────────────────────────────
// Reisberg 1984 — Functional Assessment Staging Test
// 7 stages, 6 with substages; total 16 items
const stages = [
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

const groups = [
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
const selected = ref<string | null>(null);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const selectedStage = computed(
  () => stages.find((s) => s.key === selected.value) ?? null,
);

const severity = computed(() => {
  const s = selectedStage.value;
  if (!s) return { level: "未選擇", color: "unset" };
  return { level: s.name, color: s.color };
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
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

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  selected.value = null;
  showResults.value = false;
}

function stagesForGroup(group: (typeof groups)[0]) {
  return stages.filter((s) => group.stageKeys.includes(s.key));
}
</script>

<template>
  <div class="fast">
    <!-- ── Header ─────────────────────────────────────────────── -->
    <div class="fast-header">
      <div class="header-title">
        <h2 class="title">FAST 功能性評估分期</h2>
        <p class="subtitle">
          Functional Assessment Staging Test · 阿茲海默症功能退化分期
        </p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{ selected ?? "—" }}</span>
        <span class="score-label">{{
          selected ? severity.level.slice(0, 4) : "未選擇"
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
    <div v-for="group in groups" :key="group.label" class="fast-group">
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
            selected: selected === stage.key,
            [stage.color + '-selected']: selected === stage.key,
          }"
          @click="selected = stage.key"
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
                active: selected === stage.key,
                [stage.color]: selected === stage.key,
              }"
            >
              <span v-if="selected === stage.key" class="check">✓</span>
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
    <div v-if="showResults && selectedStage" class="results-detail">
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
        @click="showResults = !showResults"
        :disabled="!selected"
      >
        {{ showResults ? "收起明細" : "查看評估結果" }}
      </button>
      <button class="btn-copy" @click="copyMarkdown" :disabled="!selected">
        {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
      </button>
      <button class="btn-reset" @click="reset">重置</button>
    </div>
  </div>
</template>

<style scoped>
.fast {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.fast-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
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
.score-badge.unset {
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
.score-badge.critical {
  border-color: #7c3aed;
  color: #7c3aed;
  box-shadow:
    0 0 0 1px rgba(124, 58, 237, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
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
.fast-group {
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
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #22c55e;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.group-header.g-normal-header {
  border-left-color: #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.06);
}
.group-header.g-mild-header {
  border-left-color: #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.06);
}
.group-header.g-severe-header {
  border-left-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.06);
}
.group-header.g-critical-header {
  border-left-color: #7c3aed;
  background: linear-gradient(
    135deg,
    rgba(124, 58, 237, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.06);
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

/* ── Item list ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.fast-item {
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
.fast-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.fast-item.selected {
  border-color: rgba(99, 102, 241, 0.3);
}
.normal-selected {
  border-color: #22c55e !important;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.mild-selected {
  border-color: #f59e0b !important;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.04), transparent);
}
.moderate-selected {
  border-color: #f97316 !important;
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.04), transparent);
}
.severe-selected {
  border-color: #ef4444 !important;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.04), transparent);
}
.critical-selected {
  border-color: #7c3aed !important;
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.04), transparent);
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
  background: linear-gradient(135deg, #22c55e, #16a34a);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.item-qnum.g-normal-qnum {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.2);
}
.item-qnum.g-mild-qnum {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  box-shadow: 0 1px 3px rgba(245, 158, 11, 0.2);
}
.item-qnum.g-severe-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.2);
}
.item-qnum.g-critical-qnum {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  box-shadow: 0 1px 3px rgba(124, 58, 237, 0.2);
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

.item-score {
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
.item-score .dash {
  color: var(--vp-c-text-3);
}
.item-score .check {
  color: #fff;
  font-size: 1rem;
}
.item-score.active {
  border-width: 1.5px;
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.08);
}
.item-score.active.normal {
  border-color: #22c55e;
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.item-score.active.mild {
  border-color: #f59e0b;
  background: linear-gradient(135deg, #f59e0b, #d97706);
}
.item-score.active.moderate {
  border-color: #f97316;
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.item-score.active.severe {
  border-color: #ef4444;
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.item-score.active.critical {
  border-color: #7c3aed;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
}

/* ── Stage content (below header) ──────────────────────────────── */
.stage-content {
  padding: 0.6rem 0.9rem;
  background: var(--vp-c-bg-mute);
}
.stage-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 6px;
}
.stage-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
}
.meta-item {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.meta-sep {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}

/* ── Result card ───────────────────────────────────────────────── */
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
.fast-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast-result.critical {
  border-color: #7c3aed;
  box-shadow:
    0 0 0 1px rgba(124, 58, 237, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fast-result.unset {
  border-color: var(--vp-c-divider);
}

.result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  gap: 2px;
}
.result-stage {
  font-size: 3rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.normal .result-stage {
  color: #22c55e;
}
.mild .result-stage {
  color: #f59e0b;
}
.moderate .result-stage {
  color: #f97316;
}
.severe .result-stage {
  color: #ef4444;
}
.critical .result-stage {
  color: #7c3aed;
}

.result-label {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  font-weight: 600;
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
.result-meta {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 2px;
}
.result-meta-item {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
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
.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 80px;
}
.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex: 1;
  text-align: right;
  color: var(--vp-c-text-3);
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 128px;
  text-align: left;
}

/* ── Diff note ─────────────────────────────────────────────────── */
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
.diff-dot {
  color: #f59e0b;
  flex-shrink: 0;
}

/* ── Actions ───────────────────────────────────────────────────── */
.fast-actions {
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

@media (max-width: 640px) {
  .fast-header {
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
  .fast-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
