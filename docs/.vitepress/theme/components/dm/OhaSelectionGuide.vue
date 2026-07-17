<script setup lang="ts">
import { ref, computed } from "vue";

// ── Step tracking ────────────────────────────────────────────
const step = ref(1);
const STEPS = ["基本資料", "共病評估", "臨床參數", "用藥建議"];

// ── Step 1: Demographics ─────────────────────────────────────
const age = ref("");
const ageNum = computed(() => {
  const v = parseInt(age.value);
  return isNaN(v) ? null : v;
});
const isElderly = computed(() => ageNum.value !== null && ageNum.value >= 75);
const egfr = ref("");
const egfrNum = computed(() => {
  const v = parseFloat(egfr.value);
  return isNaN(v) ? null : v;
});
const egfrLow = computed(() => egfrNum.value !== null && egfrNum.value < 30);

// ── Step 2: Comorbidities ────────────────────────────────────
const hasASCVD = ref(false);
const hasHF = ref(false);
const hasCKD = ref(false);
const hasObesity = ref(false);
const isFrail = ref(false);

// ── Step 3: Clinical ─────────────────────────────────────────
const a1c = ref("");
const a1cNum = computed(() => {
  const v = parseFloat(a1c.value);
  return isNaN(v) ? null : v;
});
const onMetformin = ref<"yes" | "no" | "intolerant">("yes");

// ── Step 3: Severity flags for A1C gap ───────────────────────
const isA1CHigh = computed(() => a1cNum.value !== null && a1cNum.value >= 9);
const isA1CModerate = computed(
  () => a1cNum.value !== null && a1cNum.value >= 7.5 && a1cNum.value < 9,
);

// ── Results ──────────────────────────────────────────────────
type NHIStatus = "nhi" | "conditional" | "selfpay" | "contraindicated";

type OHARec = {
  drug: string;
  category: string;
  reason: string;
  priority: "first" | "addon" | "alternative" | "avoid";
  nhi: NHIStatus;
  nhiDetail: string;
};

const recommendations = computed<OHARec[]>(() => {
  const recs: OHARec[] = [];

  // ── Metformin assessment ──
  if (egfrLow.value) {
    recs.push({
      drug: "Metformin",
      category: "Biguanide",
      reason: "eGFR < 30，禁忌使用",
      priority: "avoid",
      nhi: "contraindicated",
      nhiDetail: "eGFR < 30 → 禁忌使用，健保不給付",
    });
  } else if (onMetformin.value === "intolerant") {
    recs.push({
      drug: "Metformin ER",
      category: "Biguanide",
      reason:
        "IR 不耐受，可換 ER 減少 GI 副作用；若仍不耐受則停用，直接進入第二線選擇",
      priority: "first",
      nhi: "nhi",
      nhiDetail: "Metformin IR/ER 皆為健保給付第一線，無特殊限制",
    });
  } else if (onMetformin.value === "yes") {
    recs.push({
      drug: "Metformin",
      category: "Biguanide",
      reason: "第一線標準治療，eGFR ≥ 30 且無禁忌症應持續使用",
      priority: "first",
      nhi: "nhi",
      nhiDetail: "健保給付第一線，無特殊限制",
    });
  } else {
    recs.push({
      drug: "Metformin",
      category: "Biguanide",
      reason: "建議起始 Metformin（eGFR ≥ 30 且無禁忌症）",
      priority: "first",
      nhi: "nhi",
      nhiDetail: "健保給付第一線，無特殊限制",
    });
  }

  // ── Comorbidity-driven add-on (highest priority) ──
  const hasStrongIndication =
    hasHF.value || hasCKD.value || hasASCVD.value || hasObesity.value;

  if (hasHF.value) {
    recs.push({
      drug: "SGLT2i（Dapagliflozin / Empagliflozin）",
      category: "SGLT2i",
      reason: "HF（HFrEF/HFmrEF/HFpEF）首選 — HF 住院 ↓ 30%",
      priority: "addon",
      nhi: "nhi",
      nhiDetail: "HF 給付：LVEF ≤ 40% 或 HF 住院史；需附心臟超音波報告",
    });
  }
  if (hasCKD.value) {
    recs.push({
      drug: "SGLT2i（Dapagliflozin / Empagliflozin）",
      category: "SGLT2i",
      reason: "CKD（eGFR 25–75, uACR ≥ 200）首選 — 腎臟保護",
      priority: "addon",
      nhi: "nhi",
      nhiDetail:
        "CKD 給付：eGFR 25–60 且 uACR ≥ 300（或 eGFR 25–44 且 uACR ≥ 300），腎臟科或心臟科開立",
    });
  }
  if (hasASCVD.value) {
    const hasSGLT2i = hasHF.value || hasCKD.value;
    if (!hasSGLT2i) {
      recs.push({
        drug: "GLP-1 RA（Semaglutide / Liraglutide）",
        category: "GLP-1 RA",
        reason: "ASCVD 首選 — CV 事件降低，若肥胖更適合",
        priority: "addon",
        nhi: "conditional",
        nhiDetail:
          "需經 Metformin + SU（或兩種 OHA）治療仍控制不佳（HbA1c ≥ 7.5%），且 BMI ≥ 30（或 ≥ 27 合併肥胖共病）。需事前審查，效期 6 個月；治療 6 個月後 HbA1c 未降 ≥ 0.5% 且體重未降 ≥ 2% 應停藥。Liraglutide 以 2 年為限",
      });
    }
    recs.push({
      drug: hasSGLT2i ? "SGLT2i（已涵蓋 ASCVD）" : "SGLT2i 或 GLP-1 RA",
      category: "SGLT2i / GLP-1 RA",
      reason: "ASCVD 次選 — 兩者皆具 CV 獲益",
      priority: "addon",
      nhi: hasSGLT2i ? "nhi" : "conditional",
      nhiDetail: hasSGLT2i
        ? "若已因 HF/CKD 給付 SGLT2i，ASCVD 為附加獲益"
        : "SGLT2i：需經兩種 OHA 仍控制不佳（HbA1c 未達標）；GLP-1 RA：同 ASCVD 主選給付條件",
    });
  }
  if (hasObesity.value && !hasASCVD.value) {
    recs.push({
      drug: "GLP-1 RA（Semaglutide / Tirzepatide）",
      category: "GLP-1 RA",
      reason: "肥胖（BMI ≥ 30）首選 — 體重下降 10–20%，CV 獲益",
      priority: "addon",
      nhi: "conditional",
      nhiDetail:
        "需經 Metformin + SU（或兩種 OHA）治療仍控制不佳（HbA1c ≥ 7.5%），且 BMI ≥ 30。需事前審查；6 個月內 HbA1c 未降 ≥ 0.5% 或體重未降 ≥ 2% 應停藥。Liraglutide 以 2 年為限",
    });
  }

  // ── Elderly / Frail ──
  if (isElderly.value || isFrail.value) {
    recs.push({
      drug: "DPP-4i（Sitagliptin / Linagliptin）",
      category: "DPP-4i",
      reason: "老年/衰弱首選 — 最低低血糖風險，耐受性最佳",
      priority: "addon",
      nhi: "conditional",
      nhiDetail:
        "需經 Metformin 或 SU 治療仍控制不佳（HbA1c 未達標）或無法耐受。Linagliptin 不需腎調劑，老年/CKD 優先",
    });
  }

  // ── No strong comorbidity → A1C-driven ──
  if (!hasStrongIndication && !isElderly.value && !isFrail.value) {
    if (isA1CHigh.value) {
      recs.push({
        drug: "SU（Gliclazide MR）",
        category: "SU",
        reason: "A1C ≥ 9%，需強效降糖 — 建議 SU 或 SGLT2i",
        priority: "addon",
        nhi: "nhi",
        nhiDetail: "SU 類（Gliclazide MR / Glimepiride）健保給付無特殊限制",
      });
    } else if (isA1CModerate.value) {
      recs.push({
        drug: "DPP-4i 或 SGLT2i",
        category: "DPP-4i / SGLT2i",
        reason: "A1C 7.5–9%，中等缺口 — 依患者偏好選擇",
        priority: "addon",
        nhi: "conditional",
        nhiDetail:
          "DPP-4i：需經 Metformin 或 SU 治療仍控制不佳；SGLT2i：需經兩種 OHA 仍控制不佳",
      });
    } else {
      recs.push({
        drug: "DPP-4i",
        category: "DPP-4i",
        reason: "A1C < 7.5%，小缺口 — 耐受佳，低血糖風險低",
        priority: "addon",
        nhi: "conditional",
        nhiDetail:
          "需經 Metformin 或 SU 治療仍控制不佳（HbA1c 未達標）或無法耐受",
      });
    }
  }

  // ── A1C ≥ 10 with symptoms → insulin ──
  if (isA1CHigh.value && a1cNum.value !== null && a1cNum.value >= 10) {
    recs.push({
      drug: "Insulin（Basal ± Prandial）",
      category: "Insulin",
      reason: `A1C ${a1cNum.value}% 伴隨高血糖症狀，建議起始胰島素`,
      priority: "alternative",
      nhi: "nhi",
      nhiDetail:
        "經口服 OHA 治療仍控制不佳（HbA1c ≥ 8.5%），或 A1C ≥ 10% 伴高血糖症狀，可健保給付基礎/預混/餐食胰島素",
    });
  }

  return recs;
});

function hasRec(p: OHARec["priority"]) {
  return recommendations.value.filter((r) => r.priority === p);
}

function reset() {
  step.value = 1;
  age.value = "";
  egfr.value = "";
  hasASCVD.value = false;
  hasHF.value = false;
  hasCKD.value = false;
  hasObesity.value = false;
  isFrail.value = false;
  a1c.value = "";
  onMetformin.value = "yes";
}

// ── Check if current step is complete enough to proceed ──────
const stepOk = computed(() => {
  switch (step.value) {
    case 1:
      return ageNum.value !== null || egfrNum.value !== null;
    case 2:
      return true; // checkboxes are optional
    case 3:
      return a1cNum.value !== null;
    default:
      return true;
  }
});
</script>

<template>
  <div class="oha-wrap">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">口服降血糖藥選擇</span>
        <span class="tab-sub">OHA Selection Guide</span>
      </button>
    </div>
    <div class="oha">
      <!-- Step indicator -->
      <div class="step-bar">
        <div
          class="step-dot"
          v-for="(s, i) in STEPS"
          :key="i"
          :class="{
            active: step === i + 1,
            done: step > i + 1,
          }"
          @click="step = i + 1"
        >
          <span class="step-num">{{ i + 1 }}</span>
          <span class="step-label">{{ s }}</span>
        </div>
      </div>

      <!-- ========== Step 1 ========== -->
      <div class="section" v-show="step === 1">
        <div class="group-header-bar demo-bar">
          <span class="group-icon">👤</span>
          <span class="group-label-text">Step 1 · 基本資料</span>
          <span class="group-sub-text">年齡與腎功能影響藥物選擇</span>
        </div>
        <div class="oha-card">
          <div class="oha-row">
            <span class="item-name">年齡</span>
            <input
              v-model="age"
              type="number"
              min="18"
              max="120"
              placeholder="歲"
              class="oha-input"
            />
            <span class="oha-hint" v-if="isElderly"
              >≥ 75 歲 → 優先考慮低低血糖風險藥物</span
            >
          </div>
          <div class="oha-row">
            <span class="item-name">eGFR</span>
            <input
              v-model="egfr"
              type="number"
              min="0"
              max="150"
              placeholder="mL/min/1.73m²"
              class="oha-input"
            />
            <span
              class="oha-hint"
              v-if="egfrLow"
              style="color: #dc2626; font-weight: 700"
              >eGFR < 30 → Metformin 禁忌，部分 SGLT2i 需調整</span
            >
          </div>
        </div>
      </div>

      <!-- ========== Step 2 ========== -->
      <div class="section" v-show="step === 2">
        <div class="group-header-bar rf-bar">
          <span class="group-icon">🫀</span>
          <span class="group-label-text">Step 2 · 共病評估</span>
          <span class="group-sub-text"
            >勾選所有符合項目（決定 add-on 首選）</span
          >
        </div>
        <div class="oha-card">
          <label class="oha-row oha-label" :class="{ active: hasHF }">
            <input type="checkbox" v-model="hasHF" />
            <div class="item-name-block">
              <span class="item-name">心衰竭 HF</span>
              <span class="item-sub">HFrEF / HFmrEF / HFpEF</span>
            </div>
            <span class="oha-cb-tag sglt2-tag">→ SGLT2i</span>
          </label>
          <label class="oha-row oha-label" :class="{ active: hasCKD }">
            <input type="checkbox" v-model="hasCKD" />
            <div class="item-name-block">
              <span class="item-name">慢性腎臟病 CKD</span>
              <span class="item-sub">eGFR 25–75 或 uACR ≥ 200</span>
            </div>
            <span class="oha-cb-tag sglt2-tag">→ SGLT2i</span>
          </label>
          <label class="oha-row oha-label" :class="{ active: hasASCVD }">
            <input type="checkbox" v-model="hasASCVD" />
            <div class="item-name-block">
              <span class="item-name">ASCVD</span>
              <span class="item-sub">CAD / CVA / PAD</span>
            </div>
            <span class="oha-cb-tag glp1-tag">→ GLP-1 RA / SGLT2i</span>
          </label>
          <label class="oha-row oha-label" :class="{ active: hasObesity }">
            <input type="checkbox" v-model="hasObesity" />
            <div class="item-name-block">
              <span class="item-name">肥胖</span>
              <span class="item-sub">BMI ≥ 30</span>
            </div>
            <span class="oha-cb-tag glp1-tag">→ GLP-1 RA</span>
          </label>
          <label class="oha-row oha-label" :class="{ active: isFrail }">
            <input type="checkbox" v-model="isFrail" />
            <div class="item-name-block">
              <span class="item-name">老年衰弱 / 低血糖高風險</span>
              <span class="item-sub">跌倒風險、多重疾病、需避免低血糖</span>
            </div>
            <span class="oha-cb-tag dpp4-tag">→ DPP-4i</span>
          </label>
        </div>
      </div>

      <!-- ========== Step 3 ========== -->
      <div class="section" v-show="step === 3">
        <div class="group-header-bar lab-bar">
          <span class="group-icon">🧪</span>
          <span class="group-label-text">Step 3 · 臨床參數</span>
          <span class="group-sub-text">A1C 與目前用藥</span>
        </div>
        <div class="oha-card">
          <div class="oha-row">
            <span class="item-name">A1C</span>
            <input
              v-model="a1c"
              type="number"
              min="5"
              max="15"
              step="0.1"
              placeholder="%"
              class="oha-input"
            />
            <span class="oha-hint" v-if="isA1CHigh"
              >≥ 9% → 需強效治療，考慮雙藥/三藥或胰島素</span
            >
          </div>
          <div class="oha-row">
            <span class="item-name">Metformin 使用狀態</span>
            <div class="oha-opts">
              <button
                class="opt-btn"
                :class="{ active: onMetformin === 'yes' }"
                @click="onMetformin = 'yes'"
              >
                使用中
              </button>
              <button
                class="opt-btn"
                :class="{ active: onMetformin === 'no' }"
                @click="onMetformin = 'no'"
              >
                未使用
              </button>
              <button
                class="opt-btn"
                :class="{ active: onMetformin === 'intolerant' }"
                @click="onMetformin = 'intolerant'"
              >
                不耐受
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ========== Step 4: Results ========== -->
      <div class="section" v-show="step === 4">
        <div class="group-header-bar res-bar">
          <span class="group-icon">💊</span>
          <span class="group-label-text">Step 4 · 個人化用藥建議</span>
          <span class="group-sub-text">依共病優先順序排列</span>
        </div>

        <div class="oha-result" v-if="recommendations.length">
          <div
            class="rec-card"
            v-for="(r, i) in recommendations"
            :key="i"
            :class="r.priority"
          >
            <div class="rec-left">
              <div class="rec-priority-badge">
                {{
                  r.priority === "first"
                    ? "第一線"
                    : r.priority === "addon"
                      ? "建議加用"
                      : r.priority === "alternative"
                        ? "替代方案"
                        : "⚠ 避免/注意"
                }}
              </div>
              <div class="rec-nhi-badge" :class="r.nhi">
                {{
                  r.nhi === "nhi"
                    ? "健保給付"
                    : r.nhi === "conditional"
                      ? "條件給付"
                      : r.nhi === "selfpay"
                        ? "自費"
                        : "禁忌"
                }}
              </div>
            </div>
            <div class="rec-body">
              <div class="rec-head">
                <span class="rec-drug">{{ r.drug }}</span>
                <span class="rec-category">{{ r.category }}</span>
              </div>
              <div class="rec-reason">{{ r.reason }}</div>
              <details class="rec-nhi-detail">
                <summary class="rec-nhi-summary">健保給付條件</summary>
                <div class="rec-nhi-text">{{ r.nhiDetail }}</div>
              </details>
            </div>
          </div>
        </div>

        <div class="oha-summary">
          <div class="summary-title">📋 選藥原則摘要</div>
          <ul class="summary-list">
            <li><strong>第一線</strong>：Metformin（eGFR ≥ 30 且無禁忌）</li>
            <li>
              <strong>HF / CKD</strong> → 加
              <strong>SGLT2i</strong>（器官保護優先）
            </li>
            <li>
              <strong>ASCVD / 肥胖</strong> → 加 <strong>GLP-1 RA</strong>（CV
              獲益 / 減重）
            </li>
            <li>
              <strong>老年 / 衰弱</strong> → 加
              <strong>DPP-4i</strong>（低血糖風險最低）
            </li>
            <li>
              <strong>A1C ≥ 10% 伴症狀</strong> → 考慮 <strong>Insulin</strong>
            </li>
          </ul>
        </div>

        <div class="warn-box">
          <span class="warn-icon">⚠</span>
          <span
            >健保給付條件依 2025 健保署規定摘要，實際給付以健保署核定為準。GLP-1
            RA 需事前審查，SGLT2i
            器官保護給付需專科（心臟/腎臟）開立。本工具僅供臨床參考。</span
          >
        </div>
      </div>

      <!-- Navigation buttons -->
      <div class="oha-nav">
        <button class="btn-nav" v-if="step > 1" @click="step--">
          ← 上一步
        </button>
        <button
          class="btn-nav btn-primary"
          v-if="step < 4"
          :disabled="!stepOk"
          @click="step++"
        >
          下一步 →
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.oha-wrap {
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
.oha {
  max-width: 820px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Step indicator ── */
.step-bar {
  display: flex;
  gap: 0;
  margin-bottom: 1.25rem;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
}
.step-dot {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.5rem;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.18s;
  justify-content: center;
  border-right: 1px solid var(--vp-c-divider);
}
.step-dot:last-child {
  border-right: none;
}
.step-dot.active {
  background: rgba(99, 102, 241, 0.12);
}
.step-dot.done {
  background: rgba(16, 185, 129, 0.08);
}
.step-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 800;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 1.5px solid var(--vp-c-divider);
  flex-shrink: 0;
}
.step-dot.active .step-num {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}
.step-dot.done .step-num {
  background: #10b981;
  color: #fff;
  border-color: #10b981;
}
.step-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  white-space: nowrap;
}
.step-dot.active .step-label {
  color: #6366f1;
}

/* ── Sections ── */
.section {
  margin-bottom: 1.5rem;
}
.group-header-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  border-left: 3px solid #0ea5e9;
  margin-bottom: 0.6rem;
}
.demo-bar {
  border-left-color: #6366f1;
}
.rf-bar {
  border-left-color: #10b981;
}
.lab-bar {
  border-left-color: #3b82f6;
}
.res-bar {
  border-left-color: #8b5cf6;
}
.group-icon {
  font-size: 1rem;
  flex-shrink: 0;
}
/* .group-label-text / .group-sub-text fonts unified globally in custom.css */
.group-sub-text {
  flex: 1;
}

/* ── Card ── */
.oha-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
}
.oha-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.oha-row:last-child {
  border-bottom: none;
}
/* Question labels: shared .item-name font (unified globally), fixed width for alignment */
.oha-row > .item-name {
  width: 120px;
  flex-shrink: 0;
}
.oha-input {
  width: 120px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 0.85rem;
  font-family: inherit;
  padding: 0.35rem 0.65rem;
  outline: none;
  -moz-appearance: textfield;
}
.oha-input:focus {
  border-color: #6366f1;
}
.oha-input::-webkit-outer-spin-button,
.oha-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.oha-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  flex: 1;
}
.oha-opts {
  display: flex;
  gap: 0.4rem;
}

/* ── Checkbox labels ── */
.oha-label {
  cursor: pointer;
  transition: all 0.15s;
}
.oha-label.active {
  background: rgba(99, 102, 241, 0.04);
}
.oha-label input[type="checkbox"] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}
.item-name-block {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex: 1;
}
/* .item-name / .item-sub fonts unified globally in custom.css */
.oha-cb-tag {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  flex-shrink: 0;
}
.sglt2-tag {
  background: rgba(6, 182, 212, 0.12);
  color: #06b6d4;
}
.glp1-tag {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.dpp4-tag {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}

.opt-btn {
  padding: 4px 14px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  transition: all 0.15s;
}
.opt-btn.active {
  border-color: #6366f1;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.08);
}

/* ── Results ── */
.oha-result {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.rec-card {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 0.7rem;
  row-gap: 4px;
  align-items: start;
  padding: 0.7rem 0.9rem;
  border-radius: 10px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.rec-card.first {
  border-left: 3px solid #6366f1;
  background: rgba(99, 102, 241, 0.04);
}
.rec-card.addon {
  border-left: 3px solid #10b981;
}
.rec-card.alternative {
  border-left: 3px solid #f59e0b;
}
.rec-card.avoid {
  border-left: 3px solid #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
/* rec-left/rec-body dissolve into the card grid so the left rail badges
   align row-by-row with the body: priority↔head (row 1), nhi↔reason (row 2) */
.rec-left,
.rec-body {
  display: contents;
}
.rec-priority-badge {
  grid-column: 1;
  grid-row: 1;
  justify-self: start;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 6px;
  white-space: nowrap;
}
.rec-nhi-badge {
  grid-column: 1;
  grid-row: 2;
  justify-self: start;
  font-size: 0.64rem;
  font-weight: 800;
  padding: 1px 8px;
  border-radius: 4px;
  white-space: nowrap;
  text-align: center;
}
.rec-nhi-badge.nhi {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.rec-nhi-badge.conditional {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}
.rec-nhi-badge.selfpay {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.rec-nhi-badge.contraindicated {
  background: rgba(107, 114, 128, 0.12);
  color: #6b7280;
}
.rec-nhi-detail {
  grid-column: 2;
  grid-row: 3;
  min-width: 0;
  margin-top: 0px;
  font-size: 0.76rem;
}
.rec-nhi-summary {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--vp-c-text-3);
  cursor: pointer;
  list-style: none;
}
.rec-nhi-summary::-webkit-details-marker {
  display: none;
}
.rec-nhi-summary::before {
  content: "";
  display: inline-block;
  width: 5px;
  height: 5px;
  border-right: 1.5px solid var(--vp-c-text-3);
  border-bottom: 1.5px solid var(--vp-c-text-3);
  transform: rotate(-45deg);
  margin-right: 6px;
  transition: transform 0.15s;
}
.rec-nhi-detail[open] > .rec-nhi-summary::before {
  transform: rotate(45deg);
}
.rec-nhi-text {
  margin-top: 3px;
  padding: 4px 8px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.04);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  font-weight: 600;
  line-height: 1.5;
}
.rec-card.first .rec-priority-badge {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.rec-card.addon .rec-priority-badge {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}
.rec-card.alternative .rec-priority-badge {
  background: rgba(245, 158, 11, 0.14);
  color: #d97706;
}
.rec-card.avoid .rec-priority-badge {
  background: rgba(239, 68, 68, 0.12);
  color: #dc2626;
}
.rec-head {
  grid-column: 2;
  grid-row: 1;
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.3rem 0.55rem;
}
.rec-drug {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.rec-category {
  font-size: 0.72rem;
  font-weight: 800;
  color: var(--vp-c-text-2);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.rec-card.first .rec-category {
  color: #6366f1;
}
.rec-card.addon .rec-category {
  color: #10b981;
}
.rec-card.alternative .rec-category {
  color: #d97706;
}
.rec-card.avoid .rec-category {
  color: #dc2626;
}
.rec-reason {
  grid-column: 2;
  grid-row: 2;
  padding: 3px 0px;
  min-width: 0;
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.oha-summary {
  padding: 0.75rem 0.9rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
}
.summary-title {
  font-size: 0.9rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}
.summary-list {
  margin: 0;
  padding-left: 1.1rem;
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.75;
}

/* ── Warn box ── */
.warn-box {
  display: flex;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: rgba(249, 115, 22, 0.06);
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
  margin-bottom: 1rem;
}
.warn-icon {
  color: #f97316;
  flex-shrink: 0;
}

/* ── Navigation ── */
.oha-nav {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.btn-nav {
  padding: 10px 26px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  letter-spacing: 0.02em;
}
.btn-nav:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #6366f1;
  color: #6366f1;
}
.btn-nav:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.btn-nav:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}
.btn-nav.btn-primary {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.btn-nav.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
  border-color: #4f46e5;
  color: #fff;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  transform: translateY(-1px);
}
.btn-nav.btn-primary:active:not(:disabled) {
  background: #4338ca;
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}
.btn-nav.btn-primary:disabled {
  background: #a5b4fc;
  border-color: #a5b4fc;
  box-shadow: none;
}
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
  margin-left: auto;
}
.btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}

@media (max-width: 640px) {
  .oha-row > .item-name {
    width: 92px;
  }
  .oha-input {
    width: 90px;
  }
  .step-label {
    display: none;
  }
  .step-dot {
    padding: 0.5rem 0;
  }
}
</style>
