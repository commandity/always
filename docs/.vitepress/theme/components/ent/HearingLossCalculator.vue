<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"hh">("hh");

// ── Input refs ────────────────────────────────────────────────────
const rFreqs = ["500", "1000", "2000", "4000"];
const lFreqs = ["500", "1000", "2000", "4000"];

const right = ref<Record<string, string>>({
  "500": "",
  "1000": "",
  "2000": "",
  "4000": "",
});
const left = ref<Record<string, string>>({
  "500": "",
  "1000": "",
  "2000": "",
  "4000": "",
});

const showResults = ref(false);
const copied = ref(false);

const fieldOrder = [
  "r500",
  "r1000",
  "r2000",
  "r4000",
  "l500",
  "l1000",
  "l2000",
  "l4000",
];

function nextField(current: string) {
  const idx = fieldOrder.indexOf(current);
  if (idx < fieldOrder.length - 1) {
    const nextId = fieldOrder[idx + 1];
    const el = document.getElementById(nextId);
    el?.focus();
    (el as HTMLInputElement)?.select();
  }
}

function onKeydown(e: KeyboardEvent, fieldId: string) {
  if (e.key === "Enter") {
    e.preventDefault();
    nextField(fieldId);
  }
}

function parseHz(ear: "right" | "left", hz: string): number | null {
  const v = ear === "right" ? right.value[hz] : left.value[hz];
  const n = parseFloat(v);
  return isNaN(n) ? null : Math.max(0, Math.min(120, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

const ptaRight = computed((): number | null => {
  const vals = ["500", "1000", "2000", "4000"].map((hz) =>
    parseHz("right", hz),
  );
  if (vals.some((v) => v === null)) return null;
  return round1(vals.reduce((s, v) => s! + v!, 0)! / 4);
});

const ptaLeft = computed((): number | null => {
  const vals = ["500", "1000", "2000", "4000"].map((hz) => parseHz("left", hz));
  if (vals.some((v) => v === null)) return null;
  return round1(vals.reduce((s, v) => s! + v!, 0)! / 4);
});

function singleEarRate(pta: number | null): number | null {
  if (pta === null) return null;
  if (pta <= 25) return 0;
  const rate = (pta - 25) * 1.5;
  return round1(Math.min(100, rate));
}

const rateRight = computed(() => singleEarRate(ptaRight.value));
const rateLeft = computed(() => singleEarRate(ptaLeft.value));

const overallRate = computed((): number | null => {
  if (rateRight.value === null || rateLeft.value === null) return null;
  const better = Math.min(rateRight.value, rateLeft.value);
  const worse = Math.max(rateRight.value, rateLeft.value);
  return round1((better * 5 + worse) / 6);
});

const disabilityLevel = computed(() => {
  const r = overallRate.value;
  const rR = rateRight.value;
  const rL = rateLeft.value;
  const pR = ptaRight.value;
  const pL = ptaLeft.value;
  if (r === null || rR === null || rL === null || pR === null || pL === null)
    return null;

  const worseEarPTA = Math.max(pR, pL);
  const betterEarPTA = Math.min(pR, pL);

  if (r > 90)
    return {
      code: "b2303",
      level: "重度聽覺功能障礙",
      color: "severe",
      detail: "雙耳整體障礙比率 > 90%",
    };

  if (r > 70)
    return {
      code: "b2302",
      level: "中度聽覺功能障礙",
      color: "moderate",
      detail: "雙耳整體障礙比率 70.1–90%",
    };

  const oneEarSevere = worseEarPTA >= 90 && betterEarPTA >= 48;
  if (r >= 45 || oneEarSevere)
    return {
      code: "b2301",
      level: "輕度聽覺功能障礙",
      color: "mild",
      detail:
        r >= 45
          ? `雙耳整體障礙比率 ${r}%（45–70%）`
          : `單耳 PTA ≥ 90 dB 且另耳 PTA ≥ 48 dB`,
    };

  return {
    code: "b230.0",
    level: "未達身心障礙標準",
    color: "normal",
    detail: "雙耳整體障礙比率 < 45%，且不符合單耳條件",
  };
});

const isComplete = computed(() =>
  ["500", "1000", "2000", "4000"].every(
    (hz) => right.value[hz] !== "" && left.value[hz] !== "",
  ),
);

function generateMarkdown() {
  const dl = disabilityLevel.value;
  return `# 聽覺障礙鑑定計算結果

## 純音聽力閾值（dB HL）

| 頻率 | 右耳 | 左耳 |
| ---- | ---- | ---- |
| 500 Hz | ${right.value["500"]} | ${left.value["500"]} |
| 1000 Hz | ${right.value["1000"]} | ${left.value["1000"]} |
| 2000 Hz | ${right.value["2000"]} | ${left.value["2000"]} |
| 4000 Hz | ${right.value["4000"]} | ${left.value["4000"]} |

## 計算結果

- **右耳 PTA**：${ptaRight.value ?? "—"} dB
- **左耳 PTA**：${ptaLeft.value ?? "—"} dB
- **右耳單耳聽障比率**：${rateRight.value ?? "—"} %
- **左耳單耳聽障比率**：${rateLeft.value ?? "—"} %
- **雙耳整體障礙比率**：${overallRate.value ?? "—"} %

## 鑑定結果

- **障礙等級**：${dl?.level ?? "—"}
- **ICF 編碼**：${dl?.code ?? "無"}
- **說明**：${dl?.detail ?? "—"}`;
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  right.value = { "500": "", "1000": "", "2000": "", "4000": "" };
  left.value = { "500": "", "1000": "", "2000": "", "4000": "" };
  showResults.value = false;
}
</script>

<template>
  <div class="hearing">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button class="tab-btn active" @click="activeTab = 'hh'">
        <span class="tab-label">HH 聽覺障礙鑑定</span>
        <span class="tab-sub">Hearing Handicap Assessment</span>
      </button>
    </div>

    <!-- ═══════════════════ HH Panel ═══════════════════ -->
    <div v-show="activeTab === 'hh'" class="hh">
      <div class="hh-header">
        <div class="header-title">
          <h2 class="title">聽覺障礙鑑定計算器</h2>
          <p class="subtitle">
            依據《身心障礙者鑑定作業辦法》（衛福部） · ICF b230
          </p>
        </div>
        <div class="score-badge" :class="disabilityLevel?.color ?? 'filling'">
          <span class="score-number">{{
            overallRate !== null ? overallRate + "%" : "—"
          }}</span>
          <span class="score-label">{{
            disabilityLevel?.level ?? "填寫中"
          }}</span>
        </div>
      </div>

      <!-- Severity bar -->
      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="disabilityLevel?.color ?? 'filling'"
            :style="{ width: overallRate !== null ? overallRate + '%' : '0%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0%</span
          ><span class="tick-threshold">45%</span
          ><span class="tk-mild">70%</span
          ><span class="tk-moderate">90%</span
          ><span class="tk-severe">100%</span>
        </div>
      </div>

      <!-- Intro -->
      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        輸入各頻率純音氣導聽閾（dB HL），按 Enter 跳至下一格。系統自動計算
        PTA、單耳比率與雙耳整體障礙比率。
      </div>

      <!-- Input table -->
      <div class="input-section">
        <div class="input-header-row gradient-header">
          <div class="input-freq-label"></div>
          <div class="input-ear-label right-ear">右耳（紅）</div>
          <div class="input-ear-label left-ear">左耳（藍）</div>
        </div>

        <div
          v-for="hz in ['500', '1000', '2000', '4000']"
          :key="hz"
          class="input-row"
        >
          <div class="input-freq">{{ hz }} Hz</div>
          <div class="input-cell">
            <div
              class="input-wrap right-wrap"
              :class="{
                filled: right[hz] !== '',
                error:
                  right[hz] !== '' &&
                  (parseFloat(right[hz]) < 0 || parseFloat(right[hz]) > 120),
              }"
            >
              <input
                :id="`r${hz}`"
                type="number"
                min="0"
                max="120"
                step="5"
                placeholder="dB"
                v-model="right[hz]"
                @keydown="(e) => onKeydown(e, `r${hz}`)"
                class="hz-input"
              />
              <span class="input-unit">dB</span>
            </div>
          </div>
          <div class="input-cell">
            <div
              class="input-wrap left-wrap"
              :class="{
                filled: left[hz] !== '',
                error:
                  left[hz] !== '' &&
                  (parseFloat(left[hz]) < 0 || parseFloat(left[hz]) > 120),
              }"
            >
              <input
                :id="`l${hz}`"
                type="number"
                min="0"
                max="120"
                step="5"
                placeholder="dB"
                v-model="left[hz]"
                @keydown="(e) => onKeydown(e, `l${hz}`)"
                class="hz-input"
              />
              <span class="input-unit">dB</span>
            </div>
          </div>
        </div>

        <div class="pta-row">
          <div class="input-freq pta-label">PTA 平均</div>
          <div class="input-cell">
            <div class="pta-result right-pta">
              {{ ptaRight !== null ? ptaRight + " dB" : "—" }}
            </div>
          </div>
          <div class="input-cell">
            <div class="pta-result left-pta">
              {{ ptaLeft !== null ? ptaLeft + " dB" : "—" }}
            </div>
          </div>
        </div>
        <div class="pta-row">
          <div class="input-freq pta-label">單耳比率</div>
          <div class="input-cell">
            <div class="pta-result right-pta">
              {{ rateRight !== null ? rateRight + " %" : "—" }}
            </div>
          </div>
          <div class="input-cell">
            <div class="pta-result left-pta">
              {{ rateLeft !== null ? rateLeft + " %" : "—" }}
            </div>
          </div>
        </div>
      </div>

      <!-- Binaural overall rate -->
      <div class="overall-card">
        <div class="overall-label">雙耳整體障礙比率</div>
        <div class="overall-formula">( 優耳比率 × 5 + 劣耳比率 × 1 ) ÷ 6</div>
        <div class="overall-value" :class="disabilityLevel?.color ?? 'filling'">
          {{ overallRate !== null ? overallRate + " %" : "— %" }}
        </div>
      </div>

      <!-- Result card -->
      <div class="hh-result" :class="disabilityLevel?.color ?? 'filling'">
        <div class="result-left">
          <span class="result-number">{{
            overallRate !== null ? overallRate : "—"
          }}</span>
          <span class="result-max">%</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{
            disabilityLevel?.level ?? "請輸入聽力資料"
          }}</span>
          <span class="result-code" v-if="disabilityLevel?.code"
            >ICF 編碼：{{ disabilityLevel.code }}</span
          >
          <span class="result-advice">{{ disabilityLevel?.detail ?? "" }}</span>
        </div>
      </div>

      <!-- Results detail -->
      <div v-if="showResults" class="results-detail">
        <div class="results-header">計算明細</div>
        <div class="detail-row">
          <span class="detail-domain">右耳 PTA</span>
          <span class="detail-score right-color">{{ ptaRight ?? "—" }}</span>
          <span class="detail-desc">dB HL（500＋1k＋2k＋4kHz ÷ 4）</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">左耳 PTA</span>
          <span class="detail-score left-color">{{ ptaLeft ?? "—" }}</span>
          <span class="detail-desc">dB HL</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">右耳單耳比率</span>
          <span class="detail-score right-color">{{ rateRight ?? "—" }}</span>
          <span class="detail-desc">% （PTA − 25）× 1.5，上限 100%</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">左耳單耳比率</span>
          <span class="detail-score left-color">{{ rateLeft ?? "—" }}</span>
          <span class="detail-desc">%</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">雙耳整體比率</span>
          <span class="detail-score brand-color">{{ overallRate ?? "—" }}</span>
          <span class="detail-desc">% （優耳 × 5 ＋ 劣耳）÷ 6</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">優耳 PTA</span>
          <span class="detail-score brand-color">
            {{
              ptaRight !== null && ptaLeft !== null
                ? Math.min(ptaRight, ptaLeft)
                : "—"
            }}
          </span>
          <span class="detail-desc">dB HL（用於障礙等級判定）</span>
        </div>
        <div class="detail-row">
          <span class="detail-domain">鑑定結果</span>
          <span class="detail-score brand-color">{{
            disabilityLevel?.code ?? "無"
          }}</span>
          <span class="detail-desc">{{ disabilityLevel?.level ?? "—" }}</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="hh-actions">
        <button class="btn-view" @click="showResults = !showResults">
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" :disabled="!isComplete" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
      <p v-if="!isComplete" class="progress-hint">
        請完成所有頻率輸入以啟用複製功能
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Hearing Layout & Tab Bar
   ================================================================== */
.hearing {
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
  opacity: 0.85;
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
   HH Panel — Header & shared
   ================================================================== */
.hh {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

.hh-header {
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

/* ── Score badge ────────────────────────────────────────────────── */
.score-badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  width: auto;
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

/* ── Severity bar ──────────────────────────────────────────────── */
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
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.severe {
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

/* ── Input section ────────────────────────────────────────────── */
.input-section {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.input-header-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 0.5rem 0.9rem;
  gap: 0.75rem;
}
.input-header-row.gradient-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
}

.input-freq-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-weight: 700;
}

.input-ear-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-align: center;
}
.right-ear {
  color: #dc2626;
}
.left-ear {
  color: #2563eb;
}

.input-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  transition: background 0.15s;
}
.input-row:hover {
  background: var(--vp-c-bg-soft);
}

.pta-row {
  display: grid;
  grid-template-columns: 100px 1fr 1fr;
  gap: 0.75rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
  align-items: center;
  background: var(--vp-c-bg-mute);
}
.pta-row:last-child {
  border-bottom: none;
}

.input-freq {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.pta-label {
  color: var(--vp-c-text-3);
  font-weight: 600;
}

.input-cell {
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--vp-c-bg);
  transition: border-color 0.15s;
  width: 110px;
}
.input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
}
.input-wrap.right-wrap.filled:not(.error) {
  border-color: #dc2626;
}
.input-wrap.left-wrap.filled:not(.error) {
  border-color: #2563eb;
}
.input-wrap.error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}

.hz-input {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.5rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
}
.hz-input::-webkit-outer-spin-button,
.hz-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.hz-input::placeholder {
  color: var(--vp-c-text-3);
  font-weight: 400;
  opacity: 0.7;
}

.input-unit {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
}

.pta-result {
  font-size: 0.88rem;
  font-weight: 800;
  padding: 0.4rem 0.75rem;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  min-width: 80px;
  text-align: center;
}
.right-pta {
  color: #dc2626;
  border-color: rgba(220, 38, 38, 0.3);
}
.left-pta {
  color: #2563eb;
  border-color: rgba(37, 99, 235, 0.3);
}

/* ── Overall card ────────────────────────────────────────────── */
.overall-card {
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.overall-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
}

.overall-formula {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  flex: 1;
}

.overall-value {
  font-size: 1.6rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 80px;
  text-align: right;
}
.overall-value.filling {
  color: var(--vp-c-text-3);
}
.overall-value.normal {
  color: #22c55e;
}
.overall-value.mild {
  color: #f59e0b;
}
.overall-value.moderate {
  color: #f97316;
}
.overall-value.severe {
  color: #ef4444;
}

/* ── Result card ──────────────────────────────────────────────── */
.hh-result {
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
.hh-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hh-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hh-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.hh-result.severe {
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
  font-size: 4rem;
  font-weight: 900;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.hh-result.normal .result-number {
  color: #22c55e;
}
.hh-result.mild .result-number {
  color: #f59e0b;
}
.hh-result.moderate .result-number {
  color: #f97316;
}
.hh-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-level {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.result-code {
  font-size: 0.78rem;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}
.result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
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

.detail-domain {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
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

.right-color {
  color: #dc2626;
}
.left-color {
  color: #2563eb;
}
.brand-color {
  color: var(--vp-c-brand-1);
}

/* ── Actions ────────────────────────────────────────────────────── */
.hh-actions {
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
  .hh-header {
    flex-direction: column;
  }
  .score-badge {
    align-self: flex-start;
  }
  .score-number {
    font-size: 1.5rem;
  }
  .hh-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
  .input-header-row,
  .input-row,
  .pta-row {
    grid-template-columns: 80px 1fr 1fr;
    gap: 0.5rem;
    padding: 0.5rem 0.6rem;
  }
  .input-wrap {
    width: 90px;
  }
  .hz-input {
    width: 44px;
  }
  .overall-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
  }
  .overall-value {
    text-align: left;
  }
  .result-right {
    text-align: left;
  }
}
</style>
