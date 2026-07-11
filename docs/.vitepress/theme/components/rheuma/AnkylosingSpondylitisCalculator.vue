<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"basdai">("basdai");

// ══════════════ BASDAI 疾病活動指數（Bath AS Disease Activity）══════════════

// ── BASDAI: Bath Ankylosing Spondylitis Disease Activity Index ─────
// Garrett 1994 — 6 VAS questions, each 0–10
// Formula: BASDAI = (Q1 + Q2 + Q3 + Q4 + [(Q5 + Q6) ÷ 2]) ÷ 5
// Range: 0–10  |  Cut-off ≥ 4 = high disease activity

// ── Questions in 2 domains ────────────────────────────────────────
const questions = [
  // ── 全身症狀 ──────────────────────────────────────────────────
  {
    key: "q1",
    sub: "GS",
    num: 1,
    name: "疲勞程度",
    en: "Fatigue / Tiredness",
    hint: "評估整體疲勞感和精力不足的程度。疲勞是 AS 疾病活動的重要指標。",
    anchorL: "無疲勞",
    anchorR: "非常疲勞",
  },
  {
    key: "q2",
    sub: "GS",
    num: 2,
    name: "脊椎疼痛",
    en: "Spinal Pain",
    hint: "評估頸椎、胸椎、腰椎的疼痛程度，是 AS 最主要的症狀。",
    anchorL: "無疼痛",
    anchorR: "劇烈疼痛",
  },
  {
    key: "q3",
    sub: "GS",
    num: 3,
    name: "關節腫脹或壓痛",
    en: "Joint Swelling / Tenderness",
    hint: "評估除脊椎外其他關節（髖部、膝蓋、肩膀等）的腫脹和壓痛程度。",
    anchorL: "無腫脹/壓痛",
    anchorR: "嚴重腫脹/壓痛",
  },
  {
    key: "q4",
    sub: "GS",
    num: 4,
    name: "整體不適感",
    en: "Overall Discomfort",
    hint: "評估整體身體不適感及健康狀況不佳的主觀感受。",
    anchorL: "感覺良好",
    anchorR: "感覺很差",
  },
  // ── 晨間僵硬 ──────────────────────────────────────────────────
  {
    key: "q5",
    sub: "MS",
    num: 5,
    name: "晨間僵硬嚴重程度",
    en: "Morning Stiffness Severity",
    hint: "評估早晨起床時脊椎僵硬的嚴重程度，通常在活動後改善。",
    anchorL: "無僵硬",
    anchorR: "非常僵硬",
  },
  {
    key: "q6",
    sub: "MS",
    num: 6,
    name: "晨間僵硬持續時間",
    en: "Morning Stiffness Duration",
    hint: "0 = 無僵硬；10 = 僵硬持續 ≥ 2 小時。",
    anchorL: "0 分鐘",
    anchorR: "2 小時或更久",
  },
];

const domainDefs = {
  GS: {
    name: "全身症狀",
    sub: "General Symptoms · Q1–Q4",
    color: "gs",
    items: 4,
  },
  MS: {
    name: "晨間僵硬",
    sub: "Morning Stiffness · Q5–Q6（平均計算）",
    color: "ms",
    items: 2,
  },
};

// ── State ─────────────────────────────────────────────────────────
const scores = ref<Record<string, number | null>>(
  Object.fromEntries(questions.map((q) => [q.key, null])),
);
const showResults = ref(false);
const copied = ref(false);

// ── Computed ──────────────────────────────────────────────────────
const answeredCount = computed(
  () => questions.filter((q) => scores.value[q.key] !== null).length,
);
const isComplete = computed(() => answeredCount.value === 6);

// BASDAI = (Q1 + Q2 + Q3 + Q4 + [(Q5+Q6)/2]) / 5
const morningStiffnessAvg = computed(() => {
  const q5 = scores.value["q5"],
    q6 = scores.value["q6"];
  if (q5 === null || q6 === null) return null;
  return (q5 + q6) / 2;
});

const basdai = computed(() => {
  if (!isComplete.value) return null;
  const q1 = scores.value["q1"]!;
  const q2 = scores.value["q2"]!;
  const q3 = scores.value["q3"]!;
  const q4 = scores.value["q4"]!;
  const ms = morningStiffnessAvg.value!;
  return Math.round(((q1 + q2 + q3 + q4 + ms) / 5) * 100) / 100;
});

const gsSum = computed(() =>
  ["q1", "q2", "q3", "q4"].reduce((s, k) => s + (scores.value[k] ?? 0), 0),
);

// ── Severity ───────────────────────────────────────────────────────
// BASDAI < 4 = low/controlled | ≥ 4 = high activity | ≥ 6 = very high
const severity = computed(() => {
  const b = basdai.value;
  if (b === null)
    return {
      level: "待完成",
      color: "filling",
      tag: "—",
      advice: "請完成所有 6 個問題以計算 BASDAI",
    };
  if (b < 2)
    return {
      level: "疾病控制良好（Controlled）",
      color: "normal",
      tag: "低活動度",
      advice: "疾病活動性低，維持現有治療方案並定期追蹤",
    };
  if (b < 4)
    return {
      level: "輕度活動（Low-Moderate）",
      color: "mild",
      tag: "輕中度",
      advice: "輕至中度活動性，需密切監測，考慮治療優化",
    };
  if (b < 6)
    return {
      level: "高度活動（High Activity）",
      color: "moderate",
      tag: "高活動度",
      advice: "BASDAI ≥ 4：疾病活動性高，建議調整治療，考慮生物製劑",
    };
  return {
    level: "極高度活動（Very High）",
    color: "severe",
    tag: "極高活動",
    advice: "BASDAI ≥ 6：極高活動性，需積極介入，優先評估生物製劑或 JAK 抑制劑",
  };
});

// Biologic eligibility: BASDAI ≥ 4 + failed ≥2 NSAIDs
const biologicEligible = computed(
  () => basdai.value !== null && basdai.value >= 4,
);

// ── VAS input helpers ─────────────────────────────────────────────
function setScore(key: string, val: number) {
  scores.value[key] = Math.round(val * 10) / 10;
}
function getScore(key: string): number {
  return scores.value[key] ?? 0;
}

// ── Markdown ───────────────────────────────────────────────────────
function generateMarkdown() {
  const today = new Date();
  const date = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}`;
  const sv = severity.value;
  const qLines = questions
    .map(
      (q) =>
        `  - Q${q.num} ${q.name}（${q.en}）：${scores.value[q.key] ?? "—"}`,
    )
    .join("\n");
  return `# BASDAI 僵直性脊椎炎疾病活動指數評估結果\n\n## 評估日期：${date}\n\n## 評估項目（過去一週）\n\n${qLines}\n\n## 計算過程\n\n- **全身症狀（Q1+Q2+Q3+Q4）**：${scores.value.q1} + ${scores.value.q2} + ${scores.value.q3} + ${scores.value.q4} = ${gsSum.value}\n- **晨間僵硬平均（(Q5+Q6)÷2）**：(${scores.value.q5} + ${scores.value.q6}) ÷ 2 = ${morningStiffnessAvg.value?.toFixed(2)}\n\nBASDI = (${gsSum.value} + ${morningStiffnessAvg.value?.toFixed(2)}) ÷ 5 = **${basdai.value} / 10**\n\n## 評估結果\n\n- **疾病活動度**：${sv.level}\n- **臨床建議**：${sv.advice}\n- **生物製劑評估條件**：${biologicEligible.value ? "BASDAI ≥ 4，需評估是否符合生物製劑適應症" : "BASDAI < 4，目前不符合生物製劑適應症閾值"}\n\n> 切截值：< 4 良好控制 / ≥ 4 高活動度（建議調整治療）/ ≥ 6 極高活動度`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  questions.forEach((q) => {
    scores.value[q.key] = null;
  });
  showResults.value = false;
}

const domainOrder = ["GS", "MS"] as const;
</script>

<template>
  <div class="asassess">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'basdai' }"
        @click="activeTab = 'basdai'"
      >
        <span class="tab-label">BASDAI 疾病活動指數</span>
        <span class="tab-sub">Bath AS Disease Activity</span>
      </button>
    </div>

    <div v-show="activeTab === 'basdai'" class="basdai">
      <!-- Header -->
      <div class="basdai-header">
        <div class="header-title">
          <h2 class="title">BASDAI 疾病活動指數</h2>
          <p class="subtitle">
            Bath Ankylosing Spondylitis Disease Activity Index · 患者自填 ·
            過去一週症狀評估
          </p>
        </div>
        <div class="score-badge" :class="severity.color">
          <span class="score-number">{{ basdai ?? "—" }}</span>
          <span class="score-label">{{ severity.tag }}</span>
        </div>
      </div>

      <!-- Severity bar -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="severity.color"
            :style="{
              width:
                basdai !== null
                  ? Math.min((basdai / 10) * 100, 100) + '%'
                  : '0%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span>0</span>
          <span class="tick-y">2</span>
          <span class="tick-o">4</span>
          <span class="tick-r">6</span>
          <span>10</span>
        </div>
      </div>

      <!-- Risk strip -->
      <div class="risk-strip">
        <div
          class="risk-pill"
          :class="{ 'risk-active': basdai !== null && basdai < 2 }"
        >
          <span class="risk-score">&lt; 2</span>
          <span class="risk-rate normal-risk">良好控制</span>
          <span class="risk-tag">Controlled</span>
        </div>
        <div
          class="risk-pill"
          :class="{
            'risk-active': basdai !== null && basdai >= 2 && basdai < 4,
          }"
        >
          <span class="risk-score">2–4</span>
          <span class="risk-rate mild-risk">輕中度</span>
          <span class="risk-tag">Low-Moderate</span>
        </div>
        <div
          class="risk-pill"
          :class="{
            'risk-active': basdai !== null && basdai >= 4 && basdai < 6,
          }"
        >
          <span class="risk-score">4–6</span>
          <span class="risk-rate moderate-risk">高活動度</span>
          <span class="risk-tag">High Activity</span>
        </div>
        <div
          class="risk-pill"
          :class="{ 'risk-active': basdai !== null && basdai >= 6 }"
        >
          <span class="risk-score">≥ 6</span>
          <span class="risk-rate severe-risk">極高活動</span>
          <span class="risk-tag">Very High</span>
        </div>
      </div>

      <!-- Sub-scores -->
      <div class="sub-scores">
        <div class="sub-pill gs-pill">
          <span class="sub-label">全身症狀（Q1–Q4）</span>
          <span class="sub-val">{{ gsSum.toFixed(1) }}</span>
        </div>
        <div class="sub-pill ms-pill">
          <span class="sub-label">晨間僵硬平均（(Q5+Q6)÷2）</span>
          <span class="sub-val">{{
            morningStiffnessAvg !== null ? morningStiffnessAvg.toFixed(2) : "—"
          }}</span>
        </div>
      </div>

      <!-- Intro -->
      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請根據您<strong>過去一週</strong>的症狀，在每個問題的滑桿上選擇 0–10
          的分數。0 = 無症狀，10 = 症狀最嚴重。Q5 與 Q6
          的分數將取平均後納入計算。</span
        >
      </div>

      <!-- ── Question groups ─────────────────────────────────────── -->
      <div v-for="dk in domainOrder" :key="dk" class="basdai-group">
        <div class="group-header" :class="domainDefs[dk].color + '-header'">
          <div class="group-label-block">
            <span class="group-label">{{ domainDefs[dk].name }}</span>
            <span class="group-sub">{{ domainDefs[dk].sub }}</span>
          </div>
          <div class="group-score-pill" :class="domainDefs[dk].color + '-pill'">
            {{
              dk === "GS"
                ? gsSum.toFixed(1)
                : morningStiffnessAvg !== null
                  ? morningStiffnessAvg.toFixed(2)
                  : "—"
            }}
          </div>
        </div>

        <div class="item-list">
          <div
            v-for="item in questions.filter((q) => q.sub === dk)"
            :key="item.key"
            class="basdai-item"
            :class="{
              answered: scores[item.key] !== null,
              flagged: scores[item.key] !== null && scores[item.key]! >= 4,
              [domainDefs[dk].color + '-active']:
                scores[item.key] !== null && scores[item.key]! > 0,
            }"
          >
            <!-- Item header -->
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum" :class="domainDefs[dk].color + '-qnum'"
                  >Q{{ item.num }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-sub">{{ item.en }}</span>
                <span class="item-hint">{{ item.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  'score-null': scores[item.key] === null,
                  'score-zero': scores[item.key] === 0,
                  'score-mid':
                    scores[item.key] !== null &&
                    scores[item.key]! > 0 &&
                    scores[item.key]! < 4,
                  'score-flagged':
                    scores[item.key] !== null && scores[item.key]! >= 4,
                }"
              >
                {{ scores[item.key] !== null ? scores[item.key] : "—" }}
              </span>
            </div>

            <!-- VAS slider row -->
            <div class="field-input-wrap">
              <div class="slider-col">
                <div class="item-anchor-row">
                  <span class="anchor-left">{{ item.anchorL }}</span>
                  <span class="anchor-right">{{ item.anchorR }}</span>
                </div>
                <div class="slider-track-wrap">
                  <div class="slider-track">
                    <div
                      class="slider-fill"
                      :class="'fill-' + item.num"
                      :style="{
                        width: ((getScore(item.key) || 0) / 10) * 100 + '%',
                      }"
                    />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    class="field-slider"
                    :value="getScore(item.key)"
                    @input="
                      setScore(
                        item.key,
                        parseFloat(($event.target as HTMLInputElement).value),
                      )
                    "
                  />
                </div>
                <div class="field-ticks">
                  <span v-for="n in 11" :key="n">{{ n - 1 }}</span>
                </div>
              </div>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                class="field-number"
                placeholder="—"
                :value="scores[item.key] ?? ''"
                @input="
                  scores[item.key] =
                    ($event.target as HTMLInputElement).value === ''
                      ? null
                      : Math.max(
                          0,
                          Math.min(
                            10,
                            parseFloat(
                              ($event.target as HTMLInputElement).value,
                            ),
                          ),
                        )
                "
              />
            </div>
          </div>
        </div>
      </div>

      <!-- MS average note -->
      <div class="ms-avg-space">
        <div v-if="morningStiffnessAvg !== null" class="ms-avg-note">
          <span class="ms-avg-label">晨間僵硬平均分（計入公式）：</span>
          <span class="ms-avg-val">
            ({{ scores["q5"] }} + {{ scores["q6"] }}) ÷ 2 =
            {{ morningStiffnessAvg.toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Formula card -->
      <div class="formula-card">
        <div class="formula-header">
          BASDAI = ( Q1 + Q2 + Q3 + Q4 + [(Q5+Q6)÷2] ) ÷ 5
        </div>
        <div class="formula-body">
          <div class="formula-parts">
            <div class="fp" :class="{ 'fp-on': scores['q1'] !== null }">
              <span class="fp-n">{{ scores["q1"] ?? "?" }}</span
              ><span class="fp-l">Q1</span>
            </div>
            <span class="fp-op">+</span>
            <div class="fp" :class="{ 'fp-on': scores['q2'] !== null }">
              <span class="fp-n">{{ scores["q2"] ?? "?" }}</span
              ><span class="fp-l">Q2</span>
            </div>
            <span class="fp-op">+</span>
            <div class="fp" :class="{ 'fp-on': scores['q3'] !== null }">
              <span class="fp-n">{{ scores["q3"] ?? "?" }}</span
              ><span class="fp-l">Q3</span>
            </div>
            <span class="fp-op">+</span>
            <div class="fp" :class="{ 'fp-on': scores['q4'] !== null }">
              <span class="fp-n">{{ scores["q4"] ?? "?" }}</span
              ><span class="fp-l">Q4</span>
            </div>
            <span class="fp-op">+</span>
            <div
              class="fp ms-fp"
              :class="{ 'fp-on': morningStiffnessAvg !== null }"
            >
              <span class="fp-n">{{
                morningStiffnessAvg !== null
                  ? morningStiffnessAvg.toFixed(2)
                  : "?"
              }}</span>
              <span class="fp-l">MS avg</span>
            </div>
            <span class="fp-op">÷ 5 =</span>
            <div class="fp fp-result" :class="severity.color">
              <span class="fp-n">{{ basdai ?? "—" }}</span
              ><span class="fp-l">BASDAI</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Biologic eligibility note -->
      <div
        class="biologic-bar"
        :class="biologicEligible ? 'bio-eligible' : 'bio-not'"
      >
        <span class="bio-icon">{{ biologicEligible ? "⚠" : "ℹ" }}</span>
        <div class="bio-text">
          <strong>生物製劑評估：</strong>
          <span v-if="biologicEligible">
            BASDAI ≥ 4，符合生物製劑適應症評估門檻。需同時確認：已充分使用 ≥ 2
            種 NSAIDs 且療效不佳，及影像學骶髂關節炎或 HLA-B27 陽性。
          </span>
          <span v-else>
            BASDAI &lt; 4，目前未達生物製劑適應症評估閾值。建議優化 NSAIDs
            治療並定期追蹤。
          </span>
        </div>
      </div>

      <!-- Result card -->
      <div class="basdai-result" :class="severity.color">
        <div class="result-left">
          <span class="result-number">{{ basdai ?? "—" }}</span>
          <span class="result-max">/ 10</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ severity.level }}</span>
          <span class="result-advice">{{ severity.advice }}</span>
          <div class="result-breakdown">
            <span class="breakdown-pill gs-pill-sm"
              >全身症狀：{{ gsSum.toFixed(1) }}</span
            >
            <span class="breakdown-pill ms-pill-sm"
              >晨間僵硬avg：{{
                morningStiffnessAvg !== null
                  ? morningStiffnessAvg.toFixed(2)
                  : "—"
              }}</span
            >
          </div>
        </div>
      </div>

      <!-- Results detail -->
      <div v-if="showResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="dk in domainOrder" :key="dk">
          <div
            class="detail-section-title"
            :class="domainDefs[dk].color + '-section'"
          >
            {{ domainDefs[dk].name }}
          </div>
          <div
            v-for="item in questions.filter((q) => q.sub === dk)"
            :key="item.key"
            class="detail-row"
          >
            <span class="detail-qnum">Q{{ item.num }}</span>
            <span class="detail-domain">{{ item.name }}</span>
            <span
              class="detail-score"
              :class="{
                brand: scores[item.key] !== null && scores[item.key]! > 0,
                flagged: scores[item.key] !== null && scores[item.key]! >= 4,
                zero: scores[item.key] === 0,
              }"
            >
              {{ scores[item.key] !== null ? scores[item.key] : "—" }}
            </span>
            <span class="detail-desc">/ 10</span>
          </div>
          <div v-if="dk === 'MS'" class="detail-row detail-avg">
            <span class="detail-qnum">avg</span>
            <span class="detail-domain">晨間僵硬平均（(Q5+Q6)÷2）</span>
            <span class="detail-score brand">{{
              morningStiffnessAvg !== null
                ? morningStiffnessAvg.toFixed(2)
                : "—"
            }}</span>
            <span class="detail-desc">/ 10</span>
          </div>
        </div>
        <div class="detail-row total-row">
          <span class="detail-qnum">∑</span>
          <span class="detail-domain">BASDAI 總分</span>
          <span class="detail-score brand">{{ basdai ?? "—" }}</span>
          <span class="detail-desc">{{ severity.tag }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="basdai-actions">
        <button class="btn-view" @click="showResults = !showResults">
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
      <p class="progress-hint" v-if="answeredCount > 0 && !isComplete">
        已完成 {{ answeredCount }} / 6 題
      </p>
    </div>
  </div>
</template>

<style scoped>
.asassess {
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
  font-weight: 400;
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

/* ══════════════ BASDAI 疾病活動指數（Bath AS Disease Activity）══════════════ */

.basdai {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Header ────────────────────────────────────────────────────── */
.basdai .basdai-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.basdai .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.basdai .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
}
.basdai .score-badge {
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
.basdai .score-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.basdai .score-label {
  font-size: 0.68rem;
  font-weight: 600;
  margin-top: 2px;
  letter-spacing: 0.02em;
  text-align: center;
}
.basdai .score-badge.filling {
  color: var(--vp-c-text-3);
}
.basdai .score-badge.normal {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .score-badge.mild {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .score-badge.moderate {
  border-color: #f97316;
  color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .score-badge.severe {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
/* ── Severity bar ──────────────────────────────────────────────── */
.basdai .severity-bar-wrap {
  margin-bottom: 1rem;
}
.basdai .severity-bar {
  position: relative;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  overflow: hidden;
  margin-bottom: 4px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.basdai .severity-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
}
.basdai .severity-fill.filling {
  background: var(--vp-c-divider);
}
.basdai .severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}
.basdai .severity-fill.mild {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.basdai .severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.basdai .severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.basdai .severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.basdai .tick-y {
  color: #f59e0b;
  font-weight: 700;
}
.basdai .tick-o {
  color: #f97316;
  font-weight: 700;
}
.basdai .tick-r {
  color: #ef4444;
  font-weight: 700;
}
/* ── Risk strip ────────────────────────────────────────────────── */
.basdai .risk-strip {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  margin-bottom: 1.25rem;
}
.basdai .risk-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 0.5rem 0.3rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  text-align: center;
  transition: all 0.2s;
}
.basdai .risk-pill.risk-active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.basdai .risk-score {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.basdai .risk-rate {
  font-size: 0.8rem;
  font-weight: 600;
}
.basdai .risk-tag {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
}
.basdai .normal-risk {
  color: #22c55e;
}
.basdai .mild-risk {
  color: #f59e0b;
}
.basdai .moderate-risk {
  color: #f97316;
}
.basdai .severe-risk {
  color: #ef4444;
}
/* ── Sub-scores ────────────────────────────────────────────────── */
.basdai .sub-scores {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.basdai .sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 4px 12px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.basdai .sub-label {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.basdai .sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}
.basdai .gs-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.basdai .gs-pill .sub-val {
  color: #6366f1;
}
.basdai .ms-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.basdai .ms-pill .sub-val {
  color: #14b8a6;
}
/* ── Intro ─────────────────────────────────────────────────────── */
.basdai .intro-bar {
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
.basdai .intro-dot {
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
/* ── Groups ────────────────────────────────────────────────────── */
.basdai .basdai-group {
  margin-bottom: 1rem;
}
.basdai .group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  padding: 0.65rem 0.85rem 0.65rem 1.5rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.basdai .gs-header {
  border-left-color: #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.basdai .ms-header {
  border-left-color: #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.basdai .group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.basdai .group-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.basdai .group-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.basdai .group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
  white-space: nowrap;
  flex-shrink: 0;
  border: 1px solid var(--vp-c-divider);
}
.basdai .gs-pill.group-score-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.3);
  background: rgba(99, 102, 241, 0.06);
}
.basdai .ms-pill.group-score-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.3);
  background: rgba(20, 184, 166, 0.06);
}
/* ── Items ─────────────────────────────────────────────────────── */
.basdai .item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.basdai .basdai-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.basdai .basdai-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.basdai .basdai-item.answered {
  border-color: rgba(99, 102, 241, 0.3);
  background: color-mix(in srgb, rgb(34, 197, 94) 5%, var(--vp-c-bg-soft));
}
.basdai .basdai-item.flagged {
  border-color: #ef4444 !important;
  background: color-mix(in srgb, rgb(239, 68, 68) 5%, var(--vp-c-bg-soft));
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}
.basdai .basdai-item.answered.gs-active {
  border-color: #6366f1;
}
.basdai .basdai-item.answered.ms-active {
  border-color: #14b8a6;
}
.basdai .item-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.55rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  gap: 0.75rem;
}
.basdai .item-meta-row {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  padding-top: 2px;
}
.basdai .item-qnum {
  font-size: 0.72rem;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  padding: 1px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.basdai .gs-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.2);
}
.basdai .ms-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.2);
}
.basdai .basdai-item.flagged .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444);
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}
.basdai .item-name-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}
.basdai .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.basdai .item-sub {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.basdai .item-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-2);
  font-style: italic;
}
.basdai .item-score {
  font-size: 1.1rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 52px;
  height: 32px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  transition: all 0.25s;
}
.basdai .score-null {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.basdai .score-zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.basdai .score-mid {
  color: var(--vp-c-brand-1);
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.basdai .score-flagged {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}
/* ── VAS slider row ────────────────────────────────────────────── */
.basdai .vas-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem 0.4rem;
}
.basdai .vas-anchor-l,
.basdai .vas-anchor-r {
  font-size: 0.65rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  text-align: center;
  line-height: 1.3;
  width: 52px;
}
.basdai .vas-anchor-r {
  text-align: right;
}
.basdai .vas-track-wrap {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.basdai .vas-track {
  position: relative;
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
}
.basdai .vas-fill-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s;
  pointer-events: none;
}
.basdai .gs-fill {
  background: #6366f1;
}
.basdai .ms-fill {
  background: #14b8a6;
}
.basdai .vas-thumb.vas-thumb-unset {
  background: var(--vp-c-bg) !important;
  border: 2.5px solid var(--vp-c-brand-1) !important;
  box-shadow: 0 1px 4px color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.basdai .vas-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  transition: left 0.15s;
}
.basdai .gs-thumb {
  background: #6366f1;
}
.basdai .ms-thumb {
  background: #14b8a6;
}
.basdai .vas-range {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  margin: 0;
}
.basdai .vas-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.58rem;
  color: var(--vp-c-text-3);
  padding: 0 10px;
}
.basdai .vas-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
/* ── Numeric input row ─────────────────────────────────────────── */
.basdai .num-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.9rem 0.6rem;
  border-top: 1px solid var(--vp-c-divider);
}
.basdai .num-hint {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}
.basdai .num-input-wrap {
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  background: var(--vp-c-bg-soft);
  padding: 2px 8px;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
  width: 72px;
}
.basdai .num-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.basdai .num-input-wrap.ni-filled {
  border-color: #22c55e;
}
.basdai .num-input-wrap.ni-flagged {
  border-color: #ef4444;
}
.basdai .num-input {
  width: 52px;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
  text-align: center;
}
.basdai .num-input::-webkit-outer-spin-button,
.basdai .num-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.basdai .num-input::placeholder {
  font-weight: 400;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}
/* ── MS average note ───────────────────────────────────────────── */
.basdai @keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.basdai .ms-avg-space {
  min-height: 44px;
  margin-bottom: 1.5rem;
}
.basdai .ms-avg-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: rgba(20, 184, 166, 0.06);
  border: 1px solid rgba(20, 184, 166, 0.25);
  font-size: 0.78rem;
  animation: fadeIn 0.3s ease;
}
.basdai .ms-avg-label {
  color: var(--vp-c-text-3);
}
.basdai .ms-avg-val {
  font-weight: 800;
  color: #14b8a6;
}
/* ── Formula card ──────────────────────────────────────────────── */
.basdai .formula-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.basdai .formula-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.basdai .formula-header {
  padding: 0.45rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--vp-c-text-3);
  border-bottom: 1px solid var(--vp-c-divider);
}
.basdai .formula-body {
  padding: 0.9rem 1rem 0.75rem;
}
.basdai .formula-parts {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.basdai .fp {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  min-width: 46px;
  transition: all 0.2s;
}
.basdai .fp.fp-on {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}
.basdai .ms-fp {
  min-width: 60px;
}
.basdai .fp-n {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  line-height: 1;
}
.basdai .fp-l {
  font-size: 0.58rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
}
.basdai .fp-op {
  font-size: 0.95rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.basdai .fp-result {
  min-width: 60px;
}
.basdai .fp-result.normal {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.07);
}
.basdai .fp-result.mild {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.07);
}
.basdai .fp-result.moderate {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.07);
}
.basdai .fp-result.severe {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.07);
}
.basdai .fp-result.normal .fp-n {
  color: #22c55e;
}
.basdai .fp-result.mild .fp-n {
  color: #f59e0b;
}
.basdai .fp-result.moderate .fp-n {
  color: #f97316;
}
.basdai .fp-result.severe .fp-n {
  color: #ef4444;
}
/* ── Biologic bar ──────────────────────────────────────────────── */
.basdai .biologic-bar {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  margin-bottom: 1rem;
  line-height: 1.6;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
}
.basdai .bio-eligible {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}
.basdai .bio-not {
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.04);
}
.basdai .bio-icon {
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1.6;
}
.basdai .bio-eligible .bio-icon {
  color: #f97316;
}
.basdai .bio-not .bio-icon {
  color: #22c55e;
}
/* ── Result card ───────────────────────────────────────────────── */
.basdai .basdai-result {
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
.basdai .basdai-result.filling {
  border-color: var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .basdai-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .basdai-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .basdai-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .basdai-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.basdai .result-left {
  display: flex;
  align-items: baseline;
  gap: 4px;
  flex-shrink: 0;
}
.basdai .result-number {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.basdai .basdai-result.normal .result-number {
  color: #22c55e;
}
.basdai .basdai-result.mild .result-number {
  color: #f59e0b;
}
.basdai .basdai-result.moderate .result-number {
  color: #f97316;
}
.basdai .basdai-result.severe .result-number {
  color: #ef4444;
}
.basdai .result-max {
  font-size: 1rem;
  color: var(--vp-c-text-3);
}
.basdai .result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.basdai .result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.basdai .result-advice {
  font-size: 0.83rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.basdai .result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.basdai .breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.basdai .gs-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.basdai .ms-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
/* ── Results detail ────────────────────────────────────────────── */
.basdai .results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.basdai .results-header {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.basdai .detail-section-title {
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
.basdai .gs-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.basdai .ms-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.basdai .detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.basdai .detail-row:last-child {
  border-bottom: none;
}
.basdai .total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}
.basdai .detail-avg {
  background: rgba(20, 184, 166, 0.04);
  font-style: italic;
}
.basdai .detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.basdai .detail-domain {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-1);
  flex: 1;
}
.basdai .detail-score {
  font-size: 0.82rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 52px;
  text-align: right;
  color: var(--vp-c-text-3);
}
.basdai .detail-score.brand {
  color: var(--vp-c-brand-1);
}
.basdai .detail-score.flagged {
  color: #ef4444;
}
.basdai .detail-score.zero {
  color: #22c55e;
}
.basdai .detail-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
  width: 72px;
  text-align: left;
}
/* ── Actions ───────────────────────────────────────────────────── */
.basdai .basdai-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.basdai .btn-view,
.basdai .btn-copy,
.basdai .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.basdai .btn-view {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.basdai .btn-view:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.basdai .btn-view:active {
  transform: translateY(0);
}
.basdai .btn-copy {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.basdai .btn-copy:hover:not(:disabled) {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}
.basdai .btn-copy:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.basdai .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.basdai .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.basdai .progress-hint {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.4rem 0 0;
}

@media (max-width: 640px) {
  .basdai .basdai-header {
    flex-direction: column;
  }
  .basdai .score-badge {
    flex-direction: row;
    gap: 0.5rem;
    align-self: flex-start;
  }
  .basdai .score-number {
    font-size: 1.5rem;
  }
  .basdai .risk-strip {
    grid-template-columns: repeat(2, 1fr);
  }
  .basdai .basdai-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .basdai .vas-anchor-l,
  .basdai .vas-anchor-r {
    width: 38px;
    font-size: 0.58rem;
  }
  .basdai .formula-parts {
    gap: 0.25rem;
  }
  .basdai .fp {
    min-width: 38px;
    padding: 0.35rem 0.4rem;
  }
  .basdai .fp-n {
    font-size: 1rem;
  }
}

/* ══════════════ VAS 可讀性強化（錨點・刻度・輸入提示）══════════════ */
.asassess .vas-anchor-l,
.asassess .vas-anchor-r {
  font-size: 0.8rem !important;
  font-weight: 600 !important;
  color: var(--vp-c-text-2) !important;
}
.asassess .vas-ticks {
  font-size: 0.78rem !important;
  color: var(--vp-c-text-2) !important;
}
.asassess .num-hint {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
}
.asassess .num-input,
.asassess .vas-num {
  font-size: 0.95rem !important;
  font-weight: 700 !important;
}
.basdai .item-anchor-row {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem 0.15rem;
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  line-height: 1.4;
}
.basdai .item-anchor-row .anchor-right {
  text-align: right;
}
.basdai .field-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.5rem 0.9rem 0.7rem;
}
.basdai .field-slider {
  position: relative;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 32px;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.basdai .field-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}
.basdai .field-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}
.basdai .field-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.basdai .slider-track-wrap {
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;
}
.basdai .slider-track {
  position: absolute;
  top: 50%;
  left: 11px;
  right: 11px;
  height: 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  transform: translateY(-50%);
  overflow: hidden;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.08);
  pointer-events: none;
}
.basdai .slider-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.15s ease,
    background 0.3s;
}
.basdai .slider-fill.fill-1 {
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.basdai .slider-fill.fill-2 {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}
.basdai .slider-fill.fill-3 {
  background: linear-gradient(90deg, #f97316, #fb923c);
}
.basdai .slider-fill.fill-4 {
  background: linear-gradient(90deg, #ec4899, #f472b6);
}
.basdai .slider-fill.fill-5 {
  background: linear-gradient(90deg, #8b5cf6, #a78bfa);
}
.basdai .slider-fill.fill-6 {
  background: linear-gradient(90deg, #06b6d4, #22d3ee);
}
.basdai .slider-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
.basdai .field-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  padding: 0 11px;
  margin-top: 2px;
}
.basdai .field-ticks span {
  width: 0;
  display: flex;
  justify-content: center;
  overflow: visible;
  white-space: nowrap;
}
.basdai .field-number {
  width: 66px;
  padding: 5px 8px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 7px;
  font-size: 0.95rem;
  font-weight: 700;
  text-align: center;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  -moz-appearance: textfield;
}
.basdai .field-number::-webkit-outer-spin-button,
.basdai .field-number::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.basdai .field-number:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}
.basdai .field-number::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
}
.basdai .slider-col .item-anchor-row {
  padding: 0 6px 3px;
}
</style>
