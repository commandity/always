<script setup lang="ts">
import { ref, computed } from "vue";

// ── FOIS Levels ────────────────────────────────────────────────────
const levels = [
  {
    value: 1,
    name: "完全管路進食",
    sub: "Nothing by mouth",
    desc: "不經口進食，完全依賴鼻胃管或胃造口（PEG）等替代營養方式",
    color: "critical",
    group: "tube",
  },
  {
    value: 2,
    name: "管路依賴，少量嘗試",
    sub: "Tube dependent with minimal attempts",
    desc: "主要依賴管路，但在特定食物或液體上有少量嘗試性經口進食",
    color: "critical",
    group: "tube",
  },
  {
    value: 3,
    name: "管路依賴，一致性經口補充",
    sub: "Tube dependent with consistent oral intake",
    desc: "主要依賴管路，但可一致性地經口進食特定食物或液體作為補充",
    color: "severe",
    group: "tube",
  },
  {
    value: 4,
    name: "完全經口進食（單一質地）",
    sub: "Total oral intake of a single consistency",
    desc: "完全不依賴管路，但只能進食單一質地的食物（如軟食或增稠液體）",
    color: "moderate",
    group: "oral",
  },
  {
    value: 5,
    name: "完全經口進食（多種質地，需特別準備）",
    sub: "Total oral intake of multiple consistencies requiring special preparation",
    desc: "完全不依賴管路，可進食多種質地食物，但需要特別準備（如切碎、去骨、避免特定質地）",
    color: "mild",
    group: "oral",
  },
  {
    value: 6,
    name: "完全經口進食（無特別限制）",
    sub: "Total oral intake with no special preparation needed",
    desc: "完全不依賴管路，可進食各種質地食物，不需特別準備，但有特定食物需迴避",
    color: "mild",
    group: "oral",
  },
  {
    value: 7,
    name: "完全正常經口進食",
    sub: "Total oral intake with no restrictions",
    desc: "完全正常的經口進食，無任何限制，可進食所有質地食物及液體",
    color: "normal",
    group: "oral",
  },
];

// ── State ─────────────────────────────────────────────────────────
const selected = ref<number | null>(null);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const selectedLevel = computed(
  () => levels.find((l) => l.value === selected.value) ?? null,
);

const severity = computed(() => {
  if (selected.value === null) return { color: "filling" };
  return { color: selectedLevel.value?.color ?? "filling" };
});

// ── Functions ─────────────────────────────────────────────────────
function generateMarkdown() {
  const l = selectedLevel.value;
  if (!l) return "# FOIS 評估結果\n\n尚未選擇等級";
  return `# FOIS 功能性口腔攝食量表評估結果\n\n## 評估等級\n\n**FOIS Level ${l.value} — ${l.name}**\n\n${l.desc}\n\n---\n\n## 臨床意義\n\n- **進食方式**：${l.group === "tube" ? "管路依賴" : "完全經口進食"}\n- **等級**：${l.value} / 7\n- **描述**：${l.sub}`;
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
</script>

<template>
  <div class="fois">
    <!-- Header -->
    <div class="fois-header">
      <div class="header-title">
        <h2 class="title">FOIS 功能性口腔攝食量表</h2>
        <p class="subtitle">Functional Oral Intake Scale · 經口進食功能分級</p>
      </div>
      <div class="score-badge" :class="severity.color">
        <span class="score-number">{{
          selected !== null ? `L${selected}` : "—"
        }}</span>
        <span class="score-label">{{
          selectedLevel?.name.split("（")[0] ?? "未選擇"
        }}</span>
      </div>
    </div>

    <!-- Level bar -->
    <div class="severity-bar-wrap">
      <div class="level-bar">
        <div
          v-for="l in levels"
          :key="l.value"
          class="level-segment"
          :class="[
            l.color,
            {
              active: selected === l.value,
              passed: selected !== null && l.value < selected,
            },
          ]"
          @click="selected = l.value"
        >
          {{ l.value }}
        </div>
      </div>
      <div class="level-bar-labels">
        <span class="label-tube">← 管路依賴（1–3）</span>
        <span class="label-oral">完全經口進食（4–7）→</span>
      </div>
    </div>

    <!-- Intro -->
    <div class="intro-bar">
      <span class="intro-dot">◉</span>
      <span
        >FOIS
        為單一選題，請依患者目前實際進食狀況選擇最符合的等級（1–7）。由語言治療師或臨床醫師評估後填寫。</span
      >
    </div>

    <!-- Level cards -->
    <div class="group-header">
      <div class="group-label-block">
        <span class="group-label">進食功能等級</span>
        <span class="group-sub"
          >Functional Oral Intake Level · 請選擇一個等級</span
        >
      </div>
      <div
        v-if="selected"
        class="group-score-pill"
        :class="selectedLevel?.color + '-pill'"
      >
        已選 Level {{ selected }}
      </div>
    </div>

    <!-- Group: tube -->
    <div class="fois-subgroup">
      <div class="subgroup-label tube-label">管路依賴（Tube Dependent）</div>
      <div class="item-list">
        <div
          v-for="l in levels.filter((l) => l.group === 'tube')"
          :key="l.value"
          class="fois-item"
          :class="[l.color, { selected: selected === l.value }]"
          @click="selected = l.value"
        >
          <div class="item-header">
            <div class="level-num" :class="l.color">{{ l.value }}</div>
            <div class="item-name-block">
              <span class="item-name">{{ l.name }}</span>
              <span class="item-sub">{{ l.sub }}</span>
            </div>
            <span class="selected-indicator" v-if="selected === l.value"
              >✓</span
            >
          </div>
          <div class="item-desc-row">
            <span class="item-desc">{{ l.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Group: oral -->
    <div class="fois-subgroup">
      <div class="subgroup-label oral-label">
        完全經口進食（Total Oral Intake）
      </div>
      <div class="item-list">
        <div
          v-for="l in levels.filter((l) => l.group === 'oral')"
          :key="l.value"
          class="fois-item"
          :class="[l.color, { selected: selected === l.value }]"
          @click="selected = l.value"
        >
          <div class="item-header">
            <div class="level-num" :class="l.color">{{ l.value }}</div>
            <div class="item-name-block">
              <span class="item-name">{{ l.name }}</span>
              <span class="item-sub">{{ l.sub }}</span>
            </div>
            <span class="selected-indicator" v-if="selected === l.value"
              >✓</span
            >
          </div>
          <div class="item-desc-row">
            <span class="item-desc">{{ l.desc }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Result card -->
    <div v-if="selectedLevel" class="fois-result" :class="selectedLevel.color">
      <div class="result-left">
        <span class="result-level-num">L</span>
        <span class="result-number">{{ selectedLevel.value }}</span>
      </div>
      <div class="result-right">
        <span class="result-level">{{ selectedLevel.name }}</span>
        <span class="result-sub">{{ selectedLevel.sub }}</span>
        <span class="result-group-badge" :class="selectedLevel.group">
          {{ selectedLevel.group === "tube" ? "管路依賴" : "完全經口進食" }}
        </span>
      </div>
    </div>
    <div v-else class="fois-result-placeholder">
      請點選上方等級卡片以選擇 FOIS 等級
    </div>

    <!-- Results detail -->
    <div v-if="showResults && selectedLevel" class="results-detail">
      <div class="results-header">評估明細</div>
      <div
        v-for="l in levels"
        :key="l.value"
        class="detail-row"
        :class="{ 'selected-row': l.value === selected }"
      >
        <span class="detail-level" :class="l.color">L{{ l.value }}</span>
        <span class="detail-domain">{{ l.name }}</span>
        <span class="detail-check" v-if="l.value === selected">✓ 目前等級</span>
      </div>
    </div>

    <!-- Actions -->
    <div class="fois-actions">
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
    <p v-if="!selected" class="progress-hint">請選擇一個進食等級</p>
  </div>
</template>

<style scoped>
.fois {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.fois-header {
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 88px;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-number {
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.65rem;
  font-weight: 600;
  margin-top: 2px;
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
  border-color: #84cc16;
  color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.severe {
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

/* ── Level bar ─────────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}

.level-bar {
  display: flex;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 6px;
  height: 38px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.level-segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.2s;
  border-right: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.5);
}
.level-segment:last-child {
  border-right: none;
}
.level-segment:hover {
  opacity: 0.85;
  color: #fff;
}

.level-segment.critical {
  background: rgba(239, 68, 68, 0.25);
}
.level-segment.severe {
  background: rgba(249, 115, 22, 0.25);
}
.level-segment.moderate {
  background: rgba(245, 158, 11, 0.25);
}
.level-segment.mild {
  background: rgba(132, 204, 22, 0.25);
}
.level-segment.normal {
  background: rgba(34, 197, 94, 0.25);
}

.level-segment.active.critical {
  background: linear-gradient(180deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.level-segment.active.severe {
  background: linear-gradient(180deg, #f97316, #ea580c);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.level-segment.active.moderate {
  background: linear-gradient(180deg, #f59e0b, #d97706);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.level-segment.active.mild {
  background: linear-gradient(180deg, #84cc16, #65a30d);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}
.level-segment.active.normal {
  background: linear-gradient(180deg, #22c55e, #16a34a);
  color: #fff;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.level-segment.passed {
  opacity: 0.45;
}

.level-bar-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.label-tube {
  color: #ef4444;
  font-weight: 600;
}
.label-oral {
  color: #22c55e;
  font-weight: 600;
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

/* ── Group header ──────────────────────────────────────────────── */
.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  background: linear-gradient(
    135deg,
    #fdf2f8,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #f472b6;
  box-shadow: 0 1px 3px rgba(244, 114, 182, 0.06);
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
  white-space: nowrap;
  flex-shrink: 0;
}
.normal-pill {
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.mild-pill {
  color: #84cc16;
  border: 1px solid rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.06);
}
.moderate-pill {
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.06);
}
.severe-pill {
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}
.critical-pill {
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Sub group ─────────────────────────────────────────────────── */
.fois-subgroup {
  margin-bottom: 1.25rem;
}

.subgroup-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  display: inline-block;
}
.tube-label {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}
.oral-label {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

/* ── Item cards ────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.fois-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.fois-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}

.fois-item.selected.normal {
  border-color: #22c55e;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.04)
  );
  box-shadow: 0 2px 10px rgba(34, 197, 94, 0.08);
}
.fois-item.selected.mild {
  border-color: #84cc16;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(132, 204, 22, 0.04)
  );
  box-shadow: 0 2px 10px rgba(132, 204, 22, 0.08);
}
.fois-item.selected.moderate {
  border-color: #f59e0b;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(245, 158, 11, 0.04)
  );
  box-shadow: 0 2px 10px rgba(245, 158, 11, 0.08);
}
.fois-item.selected.severe {
  border-color: #f97316;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  );
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.fois-item.selected.critical {
  border-color: #ef4444;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(239, 68, 68, 0.04)
  );
  box-shadow: 0 2px 10px rgba(239, 68, 68, 0.08);
}

.item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.level-num {
  font-size: 1.4rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.level-num.normal {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.level-num.mild {
  color: #84cc16;
  border-color: rgba(132, 204, 22, 0.25);
  background: rgba(132, 204, 22, 0.06);
}
.level-num.moderate {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.06);
}
.level-num.severe {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}
.level-num.critical {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}
.fois-item.selected .level-num {
  border-width: 1.5px;
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.item-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}

.selected-indicator {
  font-size: 1.2rem;
  font-weight: 800;
  color: #22c55e;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.1);
}

.item-desc-row {
  padding: 0.55rem 0.9rem 0.55rem 3.5rem;
}
.item-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.55;
}

/* ── Result card ───────────────────────────────────────────────── */
.fois-result {
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
.fois-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fois-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fois-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fois-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.fois-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.result-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}
.result-level-num {
  font-size: 2rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
  line-height: 1;
  transition: color 0.3s;
}
.result-number {
  font-size: 3.5rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fois-result.normal .result-number,
.fois-result.normal .result-level-num {
  color: #22c55e;
}
.fois-result.mild .result-number,
.fois-result.mild .result-level-num {
  color: #84cc16;
}
.fois-result.moderate .result-number,
.fois-result.moderate .result-level-num {
  color: #f59e0b;
}
.fois-result.severe .result-number,
.fois-result.severe .result-level-num {
  color: #f97316;
}
.fois-result.critical .result-number,
.fois-result.critical .result-level-num {
  color: #ef4444;
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-sub {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}

.result-group-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
  align-self: flex-start;
}
.result-group-badge.tube {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}
.result-group-badge.oral {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.fois-result-placeholder {
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  text-align: center;
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
  padding: 0.55rem 0.9rem;
  font-size: 0.7rem;
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
  gap: 0.75rem;
  padding: 0.45rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  transition: background 0.1s;
}
.detail-row:hover {
  background: var(--vp-c-bg-soft);
}
.detail-row:last-child {
  border-bottom: none;
}
.selected-row {
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-soft),
    var(--vp-c-bg-soft)
  );
}

.detail-level {
  font-size: 0.85rem;
  font-weight: 900;
  flex-shrink: 0;
  min-width: 28px;
}
.detail-level.normal {
  color: #22c55e;
}
.detail-level.mild {
  color: #84cc16;
}
.detail-level.moderate {
  color: #f59e0b;
}
.detail-level.severe {
  color: #f97316;
}
.detail-level.critical {
  color: #ef4444;
}

.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.detail-check {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

/* ── Actions ───────────────────────────────────────────────────── */
.fois-actions {
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
.btn-copy:hover {
  background: var(--vp-c-brand-soft);
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
  .fois-header {
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
  .fois-result {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style>
