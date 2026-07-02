<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"fois" | "eat10">("fois");

// ── FOIS ──────────────────────────────────────────────────────────
const foisLevels = [
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

const fois = ref<number | null>(null);
const foisShowResults = ref(false);
const foisCopied = ref(false);
const foisSelected = computed(
  () => foisLevels.find((l) => l.value === fois.value) ?? null,
);
const foisSeverity = computed(() =>
  fois.value === null ? "filling" : (foisSelected.value?.color ?? "filling"),
);

function foisReset() {
  fois.value = null;
  foisShowResults.value = false;
}

function foisGenMd() {
  const l = foisSelected.value;
  if (!l) return "# FOIS 評估結果\n\n尚未選擇等級";
  return `# FOIS 功能性口腔攝食量表評估結果\n\n## 評估等級\n\n**FOIS Level ${l.value} — ${l.name}**\n\n${l.desc}\n\n---\n\n## 臨床意義\n\n- **進食方式**：${l.group === "tube" ? "管路依賴" : "完全經口進食"}\n- **等級**：${l.value} / 7\n- **描述**：${l.sub}`;
}

async function foisCopy() {
  await navigator.clipboard.writeText(foisGenMd());
  foisCopied.value = true;
  setTimeout(() => (foisCopied.value = false), 2000);
}

// ── EAT-10 ────────────────────────────────────────────────────────
const eat10Questions = [
  {
    key: "q1",
    name: "我的吞嚥問題讓我體重減輕",
    sub: "My swallowing problem has caused me to lose weight",
  },
  {
    key: "q2",
    name: "我的吞嚥問題影響我外出用餐",
    sub: "My swallowing problem interferes with my ability to go out for meals",
  },
  {
    key: "q3",
    name: "喝液體時需要費很大的力氣",
    sub: "Swallowing liquids takes extra effort",
  },
  {
    key: "q4",
    name: "吃固體食物時需要費很大的力氣",
    sub: "Swallowing solids takes extra effort",
  },
  {
    key: "q5",
    name: "吞嚥藥丸時需要費很大的力氣",
    sub: "Swallowing pills takes extra effort",
  },
  { key: "q6", name: "吞嚥時感到疼痛", sub: "Swallowing is painful" },
  {
    key: "q7",
    name: "吞嚥的樂趣因此受到影響",
    sub: "The pleasure of eating is affected by my swallowing",
  },
  {
    key: "q8",
    name: "吞嚥時食物會卡在喉嚨",
    sub: "Food sticks in my throat when I swallow",
  },
  { key: "q9", name: "吃東西時會咳嗽", sub: "I cough when I eat" },
  { key: "q10", name: "吞嚥令我感到緊張", sub: "Swallowing is stressful" },
];

const eat10Opts = [
  { value: 0, label: "0", desc: "沒有問題" },
  { value: 1, label: "1", desc: "輕微" },
  { value: 2, label: "2", desc: "中度" },
  { value: 3, label: "3", desc: "重度" },
  { value: 4, label: "4", desc: "非常嚴重" },
];

const eat10 = ref<Record<string, number>>(
  Object.fromEntries(eat10Questions.map((q) => [q.key, -1])),
);
const eat10ShowResults = ref(false);
const eat10Copied = ref(false);
const eat10Count = computed(
  () => eat10Questions.filter((q) => eat10.value[q.key] >= 0).length,
);
const eat10Done = computed(() => eat10Count.value === 10);
const eat10Total = computed(() =>
  eat10Questions.reduce((s, q) => {
    const v = eat10.value[q.key];
    return s + (v >= 0 ? v : 0);
  }, 0),
);

const eat10Sev = computed(() => {
  const s = eat10Total.value;
  if (!eat10Done.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${eat10Count.value}/10 題`,
    };
  if (s < 3)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "吞嚥功能在正常範圍，無顯著障礙",
    };
  if (s <= 10)
    return {
      level: "輕度吞嚥障礙",
      color: "mild",
      advice: "建議就醫評估，追蹤吞嚥功能變化",
    };
  if (s <= 20)
    return {
      level: "中度吞嚥障礙",
      color: "moderate",
      advice: "建議吞嚥功能評估（臨床吞嚥評估或螢光吞嚥攝影），考慮吞嚥復健",
    };
  return {
    level: "重度吞嚥障礙",
    color: "severe",
    advice: "重度吞嚥障礙，強烈建議立即就醫，評估誤嗆風險及飲食調整需求",
  };
});

function eat10Reset() {
  eat10Questions.forEach((q) => {
    eat10.value[q.key] = -1;
  });
  eat10ShowResults.value = false;
}

function eat10GenMd() {
  const lines = eat10Questions
    .map((q) => {
      const v = eat10.value[q.key];
      const opt = eat10Opts.find((o) => o.value === v);
      return `- **${q.name}**（${q.sub}）：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");
  return `# EAT-10 吞嚥篩檢評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **EAT-10 總分**：${eat10Total.value} / 40\n- **嚴重程度**：${eat10Sev.value.level}\n- **臨床建議**：${eat10Sev.value.advice}`;
}

async function eat10Copy() {
  await navigator.clipboard.writeText(eat10GenMd());
  eat10Copied.value = true;
  setTimeout(() => (eat10Copied.value = false), 2000);
}
</script>

<template>
  <div class="dysphagia">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'fois' }"
        @click="activeTab = 'fois'"
      >
        <span class="tab-label">FOIS 功能評估</span>
        <span class="tab-sub">經口進食功能分級</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'eat10' }"
        @click="activeTab = 'eat10'"
      >
        <span class="tab-label">EAT-10 症狀篩檢</span>
        <span class="tab-sub">吞嚥障礙自填問卷</span>
      </button>
    </div>

    <!-- ════════════ FOIS Panel ════════════ -->
    <div v-show="activeTab === 'fois'" class="fois">
      <div class="fois-header">
        <div class="header-title">
          <h2 class="title">FOIS 功能評估</h2>
          <p class="subtitle">
            Functional Oral Intake Scale · 經口進食功能分級
          </p>
        </div>
        <div class="score-badge" :class="foisSeverity">
          <span class="score-number">{{
            fois !== null ? `L${fois}` : "—"
          }}</span>
          <span class="score-label">{{
            foisSelected?.name.split("（")[0] ?? "未選擇"
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="level-bar">
          <div
            v-for="l in foisLevels"
            :key="l.value"
            class="level-segment"
            :class="[
              l.color,
              {
                active: fois === l.value,
                passed: fois !== null && l.value < fois,
              },
            ]"
            @click="fois = l.value"
          >
            {{ l.value }}
          </div>
        </div>
        <div class="level-bar-labels">
          <span class="label-tube">← 管路依賴（1–3）</span>
          <span class="label-oral">完全經口進食（4–7）→</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >FOIS
          為單一選題，請依患者目前實際進食狀況選擇最符合的等級（1–7）。由語言治療師或臨床醫師評估後填寫。</span
        >
      </div>

      <div class="fois-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">進食功能等級</span>
            <span class="group-sub"
              >Functional Oral Intake Level · 請選擇一個等級</span
            >
          </div>
          <div
            v-if="fois"
            class="group-score-pill"
            :class="foisSelected?.color + '-pill'"
          >
            已選 Level {{ fois }}
          </div>
        </div>

        <div class="fois-subgroup">
          <div class="subgroup-label tube-label">
            管路依賴（Tube Dependent）
          </div>
          <div class="item-list">
            <div
              v-for="l in foisLevels.filter((l) => l.group === 'tube')"
              :key="l.value"
              class="fois-item"
              :class="[l.color, { selected: fois === l.value }]"
              @click="fois = l.value"
            >
              <div class="item-header">
                <div class="level-num" :class="l.color">{{ l.value }}</div>
                <div class="item-name-block">
                  <span class="item-name">{{ l.name }}</span>
                  <span class="item-sub">{{ l.sub }}</span>
                </div>
                <span class="selected-indicator" v-if="fois === l.value"
                  >✓</span
                >
              </div>
              <div class="item-desc-row">
                <span class="item-desc">{{ l.desc }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="fois-subgroup">
          <div class="subgroup-label oral-label">
            完全經口進食（Total Oral Intake）
          </div>
          <div class="item-list">
            <div
              v-for="l in foisLevels.filter((l) => l.group === 'oral')"
              :key="l.value"
              class="fois-item"
              :class="[l.color, { selected: fois === l.value }]"
              @click="fois = l.value"
            >
              <div class="item-header">
                <div class="level-num" :class="l.color">{{ l.value }}</div>
                <div class="item-name-block">
                  <span class="item-name">{{ l.name }}</span>
                  <span class="item-sub">{{ l.sub }}</span>
                </div>
                <span class="selected-indicator" v-if="fois === l.value"
                  >✓</span
                >
              </div>
              <div class="item-desc-row">
                <span class="item-desc">{{ l.desc }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="foisSelected" class="fois-result" :class="foisSelected.color">
        <div class="result-left">
          <span class="result-prefix">L</span>
          <span class="result-number">{{ foisSelected.value }}</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ foisSelected.name }}</span>
          <span class="result-advice">{{ foisSelected.sub }}</span>
          <span class="result-tag" :class="foisSelected.group">{{
            foisSelected.group === "tube" ? "管路依賴" : "完全經口進食"
          }}</span>
        </div>
      </div>
      <div v-else class="result-placeholder">
        請點選上方等級卡片以選擇 FOIS 等級
      </div>

      <div v-if="foisShowResults && foisSelected" class="results-detail">
        <div class="results-header">評估明細</div>
        <div
          v-for="l in foisLevels"
          :key="l.value"
          class="detail-row"
          :class="{ 'selected-row': l.value === fois }"
        >
          <span class="detail-level" :class="l.color">L{{ l.value }}</span>
          <span class="detail-domain">{{ l.name }}</span>
          <span class="detail-check" v-if="l.value === fois">✓ 目前等級</span>
        </div>
      </div>

      <div class="fois-actions">
        <button
          class="btn-view"
          @click="foisShowResults = !foisShowResults"
          :disabled="!fois"
        >
          {{ foisShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="foisCopy" :disabled="!fois">
          {{ foisCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="foisReset">重置</button>
      </div>
      <p v-if="!fois" class="progress-hint">請選擇一個進食等級</p>
    </div>

    <!-- ════════════ EAT-10 Panel ════════════ -->
    <div v-show="activeTab === 'eat10'" class="eat10">
      <div class="eat10-header">
        <div class="header-title">
          <h2 class="title">EAT-10 吞嚥篩檢</h2>
          <p class="subtitle">Eating Assessment Tool · 吞嚥障礙自填問卷</p>
        </div>
        <div class="score-badge" :class="eat10Sev.color">
          <span class="score-number">{{ eat10Done ? eat10Total : "—" }}</span>
          <span class="score-label">{{
            eat10Done ? eat10Sev.level : `${eat10Count}/10`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="eat10Sev.color"
            :style="{ width: Math.min((eat10Total / 40) * 100, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span
          ><span class="tick-threshold">3</span
          ><span class="tk-mild">10</span><span class="tk-moderate">20</span
          ><span class="tk-severe">40</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span>
          請依您吞嚥問題的嚴重程度評分。每題 0（沒有問題）至 4（非常嚴重），共
          10 題，總分 0–40 分。
          <strong>≥ 3 分</strong>即建議就醫進一步評估。
        </span>
      </div>

      <div class="eat10-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">吞嚥症狀評估</span>
            <span class="group-sub">Swallowing Symptom Assessment · 10 題</span>
          </div>
          <div class="group-score-pill">{{ eat10Count }}/10 題</div>
        </div>

        <div class="item-list">
          <div
            v-for="q in eat10Questions"
            :key="q.key"
            class="eat10-item"
            :class="{ answered: eat10[q.key] >= 0, high: eat10[q.key] >= 3 }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum">Q{{ q.key.slice(1) }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: eat10[q.key] === 0,
                  unanswered: eat10[q.key] < 0,
                  high: eat10[q.key] >= 3,
                }"
                >{{ eat10[q.key] >= 0 ? eat10[q.key] : "—" }}</span
              >
            </div>

            <div class="option-row">
              <label
                v-for="opt in eat10Opts"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: eat10[q.key] === opt.value,
                  high: opt.value >= 3 && eat10[q.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="q.key"
                  :value="opt.value"
                  v-model="eat10[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="eat10-result" :class="eat10Sev.color">
        <div class="result-left">
          <span class="result-number">{{ eat10Done ? eat10Total : "—" }}</span>
          <span class="result-max">/ 40</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ eat10Sev.level }}</span>
          <span class="result-advice">{{ eat10Sev.advice }}</span>
          <span class="result-threshold" v-if="eat10Done">
            {{
              eat10Total >= 3
                ? "⚠ EAT-10 ≥ 3，建議轉介吞嚥評估"
                : "✓ EAT-10 < 3，在正常範圍內"
            }}
          </span>
        </div>
      </div>

      <div v-if="eat10ShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="q in eat10Questions" :key="q.key" class="detail-row">
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: eat10[q.key] === 0,
              high: eat10[q.key] >= 3,
              brand: eat10[q.key] > 0 && eat10[q.key] < 3,
            }"
            >{{ eat10[q.key] >= 0 ? eat10[q.key] : "—" }}</span
          >
          <span class="detail-desc">{{
            eat10[q.key] >= 0
              ? eat10Opts.find((o) => o.value === eat10[q.key])?.desc
              : "未填"
          }}</span>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum"></span>
          <span class="detail-domain">EAT-10 總分</span>
          <span class="detail-score brand">{{ eat10Total }} / 40</span>
          <span class="detail-desc">{{ eat10Sev.level }}</span>
        </div>
      </div>

      <div class="eat10-actions">
        <button class="btn-view" @click="eat10ShowResults = !eat10ShowResults">
          {{ eat10ShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="eat10Copy">
          {{ eat10Copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="eat10Reset">重置</button>
      </div>
      <p v-if="!eat10Done" class="progress-hint">
        已完成 {{ eat10Count }}/10 題，尚餘 {{ 10 - eat10Count }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Dysphagia Layout & Tab Bar
   ================================================================== */
.dysphagia {
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
}

.tab-btn {
  flex: 1;
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
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ==================================================================
   Shared — FOIS & EAT-10 panels
   ================================================================== */
.fois,
.eat10 {
  max-width: 780px;
  margin: 0 auto;
  padding: 0 0 3rem;
  font-size: 0.9rem;
}

/* Header */
.fois-header,
.eat10-header {
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

/* ── Score badge ─────────────────────────────────────────────────── */
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

/* ── Severity bar ────────────────────────────────────────────────── */
.severity-bar-wrap {
  margin-bottom: 1.5rem;
}

.severity-bar {
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
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
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #84cc16, #65a30d);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.critical {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}

.tick-threshold {
  color: #f59e0b;
  font-weight: 700;
  position: relative;
}
.tick-threshold::after {
  content: "";
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 2px;
  height: 6px;
  background: #f59e0b;
  border-radius: 1px;
}

.severity-ticks .tk-normal {
  color: #22c55e;
  font-weight: 700;
}
.severity-ticks .tk-mild {
  color: #84cc16;
  font-weight: 700;
}
.severity-ticks .tk-moderate {
  color: #f59e0b;
  font-weight: 700;
}
.severity-ticks .tk-severe {
  color: #f97316;
  font-weight: 700;
}

/* ── FOIS level bar ──────────────────────────────────────────────── */
.level-bar {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 6px;
  height: 36px;
  border: 1px solid var(--vp-c-divider);
}

.level-segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  border-right: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg);
}
.level-segment:last-child {
  border-right: none;
}
.level-segment:hover {
  background: var(--vp-c-bg-soft);
}
.level-segment.critical.active {
  background: #ef4444;
  color: #fff;
}
.level-segment.severe.active {
  background: #f97316;
  color: #fff;
}
.level-segment.moderate.active {
  background: #f59e0b;
  color: #fff;
}
.level-segment.mild.active {
  background: #84cc16;
  color: #fff;
}
.level-segment.normal.active {
  background: #22c55e;
  color: #fff;
}
.level-segment.passed {
  opacity: 0.35;
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

/* ── Intro ───────────────────────────────────────────────────────── */
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

/* ── Group ───────────────────────────────────────────────────────── */
.fois-group,
.eat10-group {
  margin-bottom: 1.25rem;
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

/* FOIS group — orange accent */
.fois-group .group-header {
  background: linear-gradient(
    135deg,
    #fff7ed,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

/* EAT-10 group — brand accent */
.eat10-group .group-header {
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  border-left: 4px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-label {
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}

.group-sub {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
}
.fois-group .group-score-pill {
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.normal-pill {
  border-color: rgba(34, 197, 94, 0.25) !important;
  color: #22c55e !important;
  background: rgba(34, 197, 94, 0.06) !important;
}
.mild-pill {
  border-color: rgba(132, 204, 22, 0.25) !important;
  color: #84cc16 !important;
  background: rgba(132, 204, 22, 0.06) !important;
}
.moderate-pill {
  border-color: rgba(245, 158, 11, 0.25) !important;
  color: #f59e0b !important;
  background: rgba(245, 158, 11, 0.06) !important;
}
.severe-pill {
  border-color: rgba(249, 115, 22, 0.25) !important;
  color: #f97316 !important;
  background: rgba(249, 115, 22, 0.06) !important;
}
.critical-pill {
  border-color: rgba(239, 68, 68, 0.25) !important;
  color: #ef4444 !important;
  background: rgba(239, 68, 68, 0.06) !important;
}

/* ── FOIS subgroups ──────────────────────────────────────────────── */
.fois-subgroup {
  margin-bottom: 1.25rem;
}

.subgroup-label {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: inline-block;
}
.tube-label {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}
.oral-label {
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
}

/* ── Item list ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ── FOIS items ─────────────────────────────────────────────────── */
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
}
.fois-item.selected.mild {
  border-color: #84cc16;
}
.fois-item.selected.moderate {
  border-color: #f59e0b;
}
.fois-item.selected.severe {
  border-color: #f97316;
}
.fois-item.selected.critical {
  border-color: #ef4444;
}

.fois-item .item-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}

.level-num {
  font-size: 1.1rem;
  font-weight: 700;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
}
.level-num.normal {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
}
.level-num.mild {
  color: #84cc16;
  border-color: rgba(132, 204, 22, 0.3);
}
.level-num.moderate {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.3);
}
.level-num.severe {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
}
.level-num.critical {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.3);
}

.item-desc-row {
  padding: 0.5rem 0.85rem 0.5rem 3.25rem;
}

.item-desc {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.selected-indicator {
  font-size: 0.9rem;
  font-weight: 700;
  color: #22c55e;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.08);
}

/* ── EAT-10 items ────────────────────────────────────────────────── */
.eat10-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.eat10-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.eat10-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.eat10-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  );
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

/* ── Item header (shared for EAT-10) ─────────────────────────────── */
.eat10-item .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.65rem 0.9rem 0.6rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}

.item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #6366f1);
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.eat10-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}

.item-sub {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
}

.item-score {
  font-size: 1.25rem;
  font-weight: 900;
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
.item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}

/* ── Option row ──────────────────────────────────────────────────── */
.option-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-pill {
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
}
.opt-pill:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-pill input[type="radio"] {
  display: none;
}

/* ── Opt-pill score colors ──────────────────────────────────────── */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:hover:not(.active),
.opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.opt-pill.s0.active {
  border-color: #22c55e;
  background: linear-gradient(
    180deg,
    rgba(34, 197, 94, 0.12),
    rgba(34, 197, 94, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.opt-pill.s1:hover:not(.active),
.opt-pill.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.opt-pill.s1.active {
  border-color: #84cc16;
  background: linear-gradient(
    180deg,
    rgba(132, 204, 22, 0.12),
    rgba(132, 204, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}

.opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.opt-pill.s2:hover:not(.active),
.opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.opt-pill.s2.active {
  border-color: #eab308;
  background: linear-gradient(
    180deg,
    rgba(234, 179, 8, 0.12),
    rgba(234, 179, 8, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.opt-pill.s3:hover:not(.active),
.opt-pill.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.opt-pill.s3.active {
  border-color: #f59e0b;
  background: linear-gradient(
    180deg,
    rgba(245, 158, 11, 0.12),
    rgba(245, 158, 11, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

.opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.opt-pill.s4:hover:not(.active),
.opt-pill.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.opt-pill.s4.active {
  border-color: #f97316;
  background: linear-gradient(
    180deg,
    rgba(249, 115, 22, 0.12),
    rgba(249, 115, 22, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

/* ── Opt-num ─────────────────────────────────────────────────────── */
.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}

/* ── Opt-desc ────────────────────────────────────────────────────── */
.opt-desc {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

/* ── Result card — FOIS ──────────────────────────────────────────── */
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

.fois-result .result-left {
  display: flex;
  align-items: baseline;
  gap: 2px;
  flex-shrink: 0;
}
.result-prefix {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}

.fois-result .result-number {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.fois-result.normal .result-number,
.fois-result.normal .result-prefix {
  color: #22c55e;
}
.fois-result.mild .result-number,
.fois-result.mild .result-prefix {
  color: #84cc16;
}
.fois-result.moderate .result-number,
.fois-result.moderate .result-prefix {
  color: #f59e0b;
}
.fois-result.severe .result-number,
.fois-result.severe .result-prefix {
  color: #f97316;
}
.fois-result.critical .result-number,
.fois-result.critical .result-prefix {
  color: #ef4444;
}

.fois-result .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.fois-result .result-level {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.fois-result .result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}

.result-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 999px;
  align-self: flex-start;
}
.result-tag.tube {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
.result-tag.oral {
  background: rgba(34, 197, 94, 0.08);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.2);
}

.result-placeholder {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg);
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  text-align: center;
}

/* ── Result card — EAT-10 ────────────────────────────────────────── */
.eat10-result {
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
.eat10-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.eat10-result.mild {
  border-color: #84cc16;
  box-shadow:
    0 0 0 1px rgba(132, 204, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.eat10-result.moderate {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.eat10-result.severe {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

.eat10-result .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.eat10-result .result-number {
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.eat10-result.normal .result-number {
  color: #22c55e;
}
.eat10-result.mild .result-number {
  color: #84cc16;
}
.eat10-result.moderate .result-number {
  color: #f59e0b;
}
.eat10-result.severe .result-number {
  color: #f97316;
}

.result-max {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.eat10-result .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.eat10-result .result-level {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.eat10-result .result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}
.result-threshold {
  font-size: 0.85rem;
  font-weight: 700;
}
.eat10-result.normal .result-threshold {
  color: #22c55e;
}
.eat10-result.mild .result-threshold,
.eat10-result.moderate .result-threshold,
.eat10-result.severe .result-threshold {
  color: #f97316;
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
  gap: 0.6rem;
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
  background: var(--vp-c-bg-soft);
}
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}

.detail-level {
  font-size: 0.82rem;
  font-weight: 700;
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

.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}

.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}

.detail-check {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}

.detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
}
.detail-score.brand {
  color: var(--vp-c-brand-1);
}

.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 90px;
  text-align: left;
}

/* ── Actions ─────────────────────────────────────────────────────── */
.fois-actions,
.eat10-actions {
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
.btn-view:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.btn-copy:hover {
  background: var(--vp-c-brand-soft);
}
.btn-copy:disabled {
  opacity: 0.35;
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

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .fois-header,
  .eat10-header {
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
  .fois-result,
  .eat10-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
  .item-desc-row {
    padding-left: 0.85rem;
  }
}
</style>
