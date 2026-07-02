<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"dupixent" | "snot22">("dupixent");

// ── Dupixent ────────────────────────────────────────────────────
const biomarkers = [
  {
    key: "eos_tissue",
    name: "組織嗜酸性球",
    sub: "Tissue Eosinophils",
    desc: "組織切片嗜酸性球 ≥ 10/HPF",
  },
  {
    key: "eos_blood",
    name: "血液嗜酸性球",
    sub: "Blood Eosinophils",
    desc: "血液嗜酸性球 ≥ 250 cells/μL 或 ≥ 5%",
  },
  { key: "ige", name: "總 IgE", sub: "Total IgE", desc: "總 IgE ≥ 100 IU/mL" },
  {
    key: "steroid_need",
    name: "全身性類固醇需求或禁忌",
    sub: "Systemic Corticosteroid",
    desc: "每年需要 ≥ 2 療程（0.5–1 mg/kg × 5天），或長期使用（> 3個月），或有全身性類固醇禁忌症",
  },
  {
    key: "qol",
    name: "生活品質顯著下降",
    sub: "Significant QoL Impairment",
    desc: "SNOT-22 ≥ 40/110 分",
  },
];
const additionalCriteria = [
  {
    key: "anosmia",
    name: "嗅覺明顯喪失",
    sub: "Significant Loss of Smell",
    desc: "嗅覺測試確認嗅覺喪失（anosmia）",
  },
  {
    key: "asthma",
    name: "合併氣喘診斷",
    sub: "Comorbid Asthma",
    desc: "已診斷合併氣喘，且需定期使用吸入性類固醇（ICS）",
  },
];

const bioSel = ref<Record<string, boolean | null>>(
  Object.fromEntries(biomarkers.map((b) => [b.key, null])),
);
const addSel = ref<Record<string, boolean | null>>(
  Object.fromEntries(additionalCriteria.map((c) => [c.key, null])),
);
const snot22 = ref<string>("");
const dupShow = ref(false);
const dupCopied = ref(false);

const bioCount = computed(
  () => biomarkers.filter((b) => bioSel.value[b.key] === true).length,
);
const meetsMin = computed(() => bioCount.value >= 3);
const hasAnosmia = computed(() => addSel.value["anosmia"] === true);
const hasAsthma = computed(() => addSel.value["asthma"] === true);
const dupElig = computed(() => {
  const c = bioCount.value;
  if (c >= 3)
    return {
      result: "符合適應症",
      color: "eligible",
      detail: `符合 ${c}/5 項第二型發炎生物標記標準（≥ 3/5）`,
    };
  if (c === 2)
    return {
      result: "可能接近門檻",
      color: "borderline",
      detail: `目前符合 ${c}/5 項，仍差 1 項達門檻。請確認是否有其他佐證資料`,
    };
  return {
    result: "尚未符合適應症",
    color: "ineligible",
    detail: `目前僅符合 ${c}/5 項，需達 ≥ 3/5 項才符合第二型發炎標準`,
  };
});
const dupComplete = computed(
  () =>
    biomarkers.every((b) => bioSel.value[b.key] !== null) &&
    additionalCriteria.every((c) => addSel.value[c.key] !== null),
);

function toggle(key: string, type: "bio" | "add", value: boolean) {
  if (type === "bio")
    bioSel.value[key] = bioSel.value[key] === value ? null : value;
  else addSel.value[key] = addSel.value[key] === value ? null : value;
}
function dupReset() {
  biomarkers.forEach((b) => {
    bioSel.value[b.key] = null;
  });
  additionalCriteria.forEach((c) => {
    addSel.value[c.key] = null;
  });
  snot22.value = "";
  dupShow.value = false;
}
function dupMarkdown() {
  const bio = biomarkers
    .map(
      (b) =>
        `- **${b.name}**（${b.sub}）：${bioSel.value[b.key] === true ? "✓ 符合" : bioSel.value[b.key] === false ? "✗ 不符合" : "未評估"}`,
    )
    .join("\n");
  const add = additionalCriteria
    .map(
      (c) =>
        `- **${c.name}**（${c.sub}）：${addSel.value[c.key] === true ? "✓ 符合" : addSel.value[c.key] === false ? "✗ 不符合" : "未評估"}`,
    )
    .join("\n");
  return `# Dupixent（Dupilumab）適應症評估\n\n## 第二型發炎生物標記（需符合 ≥ 3/5 項）\n\n${bio}\n\n**符合項目數：${bioCount.value}/5**\n\n## 附加臨床條件\n\n${add}\n${snot22.value ? `\nSNOT-22 分數：${snot22.value}/110` : ""}\n\n---\n\n## 評估結果\n\n**${dupElig.value.result}**\n${dupElig.value.detail}`;
}
async function dupCopy() {
  await navigator.clipboard.writeText(dupMarkdown());
  dupCopied.value = true;
  setTimeout(() => (dupCopied.value = false), 2000);
}

// ── SNOT-22 ─────────────────────────────────────────────────────
const snotGroups = [
  {
    label: "鼻部症狀",
    sub: "Rhinological Symptoms",
    color: "nasal",
    items: [
      { key: "q1", name: "需要擤鼻子", sub: "Need to blow nose" },
      { key: "q2", name: "鼻塞", sub: "Nasal blockage" },
      { key: "q3", name: "打噴嚏", sub: "Sneezing" },
      { key: "q4", name: "流鼻水", sub: "Runny nose" },
      { key: "q5", name: "鼻涕倒流", sub: "Post-nasal discharge" },
      { key: "q6", name: "濃稠鼻涕", sub: "Thick nasal discharge" },
      { key: "q7", name: "嗅覺／味覺喪失", sub: "Loss of smell / taste" },
      { key: "q8", name: "咳嗽", sub: "Cough" },
    ],
  },
  {
    label: "耳部與顏面症狀",
    sub: "Otologic / Facial Symptoms",
    color: "ear",
    items: [
      { key: "q9", name: "耳悶塞感", sub: "Ear fullness" },
      { key: "q10", name: "頭暈", sub: "Dizziness" },
      { key: "q11", name: "耳痛／耳壓", sub: "Ear pain / pressure" },
      { key: "q12", name: "臉部疼痛／壓迫感", sub: "Facial pain / pressure" },
    ],
  },
  {
    label: "睡眠功能",
    sub: "Sleep Function",
    color: "sleep",
    items: [
      { key: "q13", name: "難以入睡", sub: "Difficulty falling asleep" },
      { key: "q14", name: "夜間醒來", sub: "Waking up at night" },
      { key: "q15", name: "睡眠品質不佳", sub: "Lack of good night's sleep" },
      { key: "q16", name: "醒來時感到疲累", sub: "Waking up tired" },
      { key: "q17", name: "白天疲倦", sub: "Fatigue during the day" },
    ],
  },
  {
    label: "心理與情緒功能",
    sub: "Psychological / Emotional Function",
    color: "psych",
    items: [
      { key: "q18", name: "生產力降低", sub: "Reduced productivity" },
      { key: "q19", name: "注意力下降", sub: "Reduced concentration" },
      {
        key: "q20",
        name: "感到沮喪",
        sub: "Frustrated / restless / irritable",
      },
      { key: "q21", name: "感到悲傷", sub: "Sad" },
      { key: "q22", name: "感到尷尬／羞恥", sub: "Embarrassed" },
    ],
  },
];
const snotAll = snotGroups.flatMap((g) => g.items);
const snotOpts = [
  { value: 0, label: "0", desc: "無問題" },
  { value: 1, label: "1", desc: "極輕微" },
  { value: 2, label: "2", desc: "輕度" },
  { value: 3, label: "3", desc: "中度" },
  { value: 4, label: "4", desc: "重度" },
  { value: 5, label: "5", desc: "最嚴重" },
];
const snotSel = ref<Record<string, number>>(
  Object.fromEntries(snotAll.map((i) => [i.key, -1])),
);
const snotShow = ref(false);
const snotCopied = ref(false);
const snotAns = computed(
  () => snotAll.filter((i) => snotSel.value[i.key] >= 0).length,
);
const snotComplete = computed(() => snotAns.value === 22);
const snotGroupScore = (g: (typeof snotGroups)[0]) =>
  g.items.reduce((s, i) => {
    const v = snotSel.value[i.key];
    return s + (v >= 0 ? v : 0);
  }, 0);
const snotTotal = computed(() =>
  snotAll.reduce((s, i) => {
    const v = snotSel.value[i.key];
    return s + (v >= 0 ? v : 0);
  }, 0),
);
const snotSev = computed(() => {
  const s = snotTotal.value;
  if (!snotComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${snotAns.value}/22 題`,
    };
  if (s < 20)
    return { level: "輕微", color: "normal", advice: "鼻竇症狀對生活影響輕微" };
  if (s < 40)
    return {
      level: "中度",
      color: "mild",
      advice: "症狀中度影響生活品質，建議就醫評估",
    };
  if (s < 60)
    return {
      level: "顯著",
      color: "moderate",
      advice: "SNOT-22 ≥ 40，生活品質明顯受損，達 Dupilumab 生物標記門檻",
    };
  return {
    level: "嚴重",
    color: "severe",
    advice: "症狀嚴重，強烈建議積極治療介入",
  };
});

function snotReset() {
  snotAll.forEach((i) => {
    snotSel.value[i.key] = -1;
  });
  snotShow.value = false;
}
function snotMarkdown() {
  const lines = snotGroups
    .map(
      (g) =>
        `### ${g.label}（${snotGroupScore(g)} 分）\n${g.items
          .map((i) => {
            const v = snotSel.value[i.key];
            const o = snotOpts.find((x) => x.value === v);
            return `  - **${i.name}**（${i.sub}）：${v >= 0 ? `${v} — ${o?.desc}` : "未填"}`;
          })
          .join("\n")}`,
    )
    .join("\n\n");
  return `# SNOT-22 評估結果\n\n${lines}\n\n---\n## 總分：${snotTotal.value} / 110（${snotSev.value.level}）\n${snotSev.value.advice}`;
}
async function snotCopy() {
  await navigator.clipboard.writeText(snotMarkdown());
  snotCopied.value = true;
  setTimeout(() => (snotCopied.value = false), 2000);
}
</script>

<template>
  <div class="crs">
    <!-- Pill-style tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'dupixent' }"
        @click="activeTab = 'dupixent'"
      >
        <span class="tab-label">Dupixent 適應症評估</span>
        <span class="tab-sub">CRSwNP Biologic Eligibility</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'snot22' }"
        @click="activeTab = 'snot22'"
      >
        <span class="tab-label">SNOT-22 鼻竇生活品質量表</span>
        <span class="tab-sub">Sino-Nasal Outcome Test</span>
      </button>
    </div>

    <!-- ════════════ Dupixent Panel ════════════ -->
    <div v-show="activeTab === 'dupixent'" class="dx">
      <div class="dx-header">
        <div class="header-title">
          <h2 class="title">Dupixent 杜避炎適應症評估</h2>
          <p class="subtitle">
            Dupilumab（anti-IL-4/IL-13）· 慢性鼻竇炎合併鼻息肉（CRSwNP）
          </p>
        </div>
        <div class="score-badge" :class="dupElig.color">
          <span class="score-number">{{ bioCount }}/5</span>
          <span class="score-label">生物標記</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="dupElig.color"
            :style="{ width: (bioCount / 5) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span>0</span><span>1</span><span>2</span
          ><span class="tick-threshold">3 ✓</span><span>4</span><span>5</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >符合 <strong>≥ 3/5</strong> 項第二型發炎生物標記，即達 Dupixent
          的生物標記適應門檻。附加條件可輔助臨床決策。</span
        >
      </div>

      <div class="dx-group">
        <div class="group-header criteria">
          <div class="group-label-block">
            <span class="group-label">第二型發炎生物標記</span>
            <span class="group-sub"
              >Type 2 Inflammation Biomarkers · 需符合 ≥ 3/5 項</span
            >
          </div>
          <div class="group-score-pill" :class="meetsMin ? 'met' : ''">
            {{ bioCount }} / 5 {{ meetsMin ? "✓" : "" }}
          </div>
        </div>
        <div class="item-list">
          <div
            v-for="b in biomarkers"
            :key="b.key"
            class="dx-item"
            :class="{
              met: bioSel[b.key] === true,
              unmet: bioSel[b.key] === false,
            }"
          >
            <div class="item-header">
              <div class="item-name-block">
                <span class="item-name">{{ b.name }}</span>
                <span class="item-sub">{{ b.sub }}</span>
              </div>
              <span class="item-status">
                <template v-if="bioSel[b.key] === true">✓</template>
                <template v-else-if="bioSel[b.key] === false">✗</template>
                <template v-else>—</template>
              </span>
            </div>
            <div class="item-desc-row">
              <span class="item-desc">{{ b.desc }}</span>
            </div>
            <div class="presence-row">
              <span class="presence-label">是否符合此標準？</span>
              <div class="presence-btns">
                <button
                  class="presence-btn yes"
                  :class="{ active: bioSel[b.key] === true }"
                  @click="toggle(b.key, 'bio', true)"
                >
                  符合
                </button>
                <button
                  class="presence-btn no"
                  :class="{ active: bioSel[b.key] === false }"
                  @click="toggle(b.key, 'bio', false)"
                >
                  不符合
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dx-group">
        <div class="group-header additional">
          <div class="group-label-block">
            <span class="group-label">附加臨床條件</span>
            <span class="group-sub"
              >Additional Clinical Criteria · 輔助決策參考</span
            >
          </div>
        </div>
        <div class="item-list">
          <div
            class="dx-item"
            :class="{
              met: parseFloat(snot22) >= 40,
              unmet: snot22 !== '' && parseFloat(snot22) < 40,
            }"
          >
            <div class="item-header">
              <div class="item-name-block">
                <span class="item-name">生活品質評估（SNOT-22）</span>
                <span class="item-sub">Quality of Life — SNOT-22 Score</span>
              </div>
              <span class="item-status">
                <template v-if="snot22 !== '' && parseFloat(snot22) >= 40"
                  >✓</template
                >
                <template v-else-if="snot22 !== '' && parseFloat(snot22) < 40"
                  >✗</template
                >
                <template v-else>—</template>
              </span>
            </div>
            <div class="item-desc-row">
              <span class="item-desc"
                >SNOT-22 ≥ 40/110 分，代表生活品質顯著受損</span
              >
            </div>
            <div class="snot-input-row">
              <span class="presence-label">SNOT-22 分數：</span>
              <div
                class="snot-input-wrap"
                :class="{
                  filled: snot22 !== '',
                  met: parseFloat(snot22) >= 40,
                  unmet: snot22 !== '' && parseFloat(snot22) < 40,
                }"
              >
                <input
                  type="number"
                  min="0"
                  max="110"
                  placeholder="0–110"
                  v-model="snot22"
                  class="snot-input"
                />
                <span class="snot-unit">/ 110</span>
              </div>
              <span
                v-if="snot22 !== ''"
                class="snot-hint"
                :class="parseFloat(snot22) >= 40 ? 'hint-met' : 'hint-unmet'"
                >{{
                  parseFloat(snot22) >= 40 ? "≥ 40，符合" : "< 40，不符合"
                }}</span
              >
            </div>
          </div>
          <div
            v-for="c in additionalCriteria"
            :key="c.key"
            class="dx-item"
            :class="{
              met: addSel[c.key] === true,
              unmet: addSel[c.key] === false,
            }"
          >
            <div class="item-header">
              <div class="item-name-block">
                <span class="item-name">{{ c.name }}</span>
                <span class="item-sub">{{ c.sub }}</span>
              </div>
              <span class="item-status">
                <template v-if="addSel[c.key] === true">✓</template>
                <template v-else-if="addSel[c.key] === false">✗</template>
                <template v-else>—</template>
              </span>
            </div>
            <div class="item-desc-row">
              <span class="item-desc">{{ c.desc }}</span>
            </div>
            <div class="presence-row">
              <span class="presence-label">是否符合此條件？</span>
              <div class="presence-btns">
                <button
                  class="presence-btn yes"
                  :class="{ active: addSel[c.key] === true }"
                  @click="toggle(c.key, 'add', true)"
                >
                  符合
                </button>
                <button
                  class="presence-btn no"
                  :class="{ active: addSel[c.key] === false }"
                  @click="toggle(c.key, 'add', false)"
                >
                  不符合
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="dx-result" :class="dupElig.color">
        <div class="result-left">
          <span class="result-number">{{ bioCount }}</span>
          <span class="result-max">/ 5</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ dupElig.result }}</span>
          <span class="result-advice">{{ dupElig.detail }}</span>
          <div class="result-tags">
            <span v-if="hasAnosmia" class="result-tag">嗅覺喪失</span>
            <span v-if="hasAsthma" class="result-tag">合併氣喘</span>
            <span
              v-if="snot22 !== '' && parseFloat(snot22) >= 40"
              class="result-tag"
              >SNOT-22 ≥ 40</span
            >
          </div>
        </div>
      </div>

      <div v-if="dupShow" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-section-title">
          第二型發炎生物標記（{{ bioCount }}/5）
        </div>
        <div v-for="b in biomarkers" :key="b.key" class="detail-row">
          <span class="detail-domain">{{ b.name }}</span>
          <span
            class="detail-score"
            :class="bioSel[b.key] === true ? 'met-color' : 'unmet-color'"
            >{{
              bioSel[b.key] === true ? "✓" : bioSel[b.key] === false ? "✗" : "—"
            }}</span
          >
          <span class="detail-desc">{{ b.desc }}</span>
        </div>
        <div class="detail-section-title">附加臨床條件</div>
        <div class="detail-row">
          <span class="detail-domain">SNOT-22</span>
          <span
            class="detail-score"
            :class="parseFloat(snot22) >= 40 ? 'met-color' : 'unmet-color'"
            >{{ snot22 || "—" }}</span
          >
          <span class="detail-desc">{{
            snot22
              ? parseFloat(snot22) >= 40
                ? "≥ 40，符合"
                : "< 40，不符合"
              : "未填寫"
          }}</span>
        </div>
        <div v-for="c in additionalCriteria" :key="c.key" class="detail-row">
          <span class="detail-domain">{{ c.name }}</span>
          <span
            class="detail-score"
            :class="addSel[c.key] === true ? 'met-color' : 'unmet-color'"
            >{{
              addSel[c.key] === true ? "✓" : addSel[c.key] === false ? "✗" : "—"
            }}</span
          >
          <span class="detail-desc">{{ c.desc }}</span>
        </div>
      </div>

      <div class="dx-actions">
        <button class="btn-view" @click="dupShow = !dupShow">
          {{ dupShow ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="dupCopy">
          {{ dupCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="dupReset">重置</button>
      </div>
    </div>

    <!-- ════════════ SNOT-22 Panel ════════════ -->
    <div v-show="activeTab === 'snot22'" class="s22">
      <div class="s22-header">
        <div class="header-title">
          <h2 class="title">SNOT-22 鼻竇生活品質量表</h2>
          <p class="subtitle">Sino-Nasal Outcome Test · 過去兩週的症狀評估</p>
        </div>
        <div class="score-badge" :class="snotSev.color">
          <span class="score-number">{{ snotTotal }}</span>
          <span class="score-label">{{
            snotComplete ? snotSev.level : `${snotAns}/22`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="snotSev.color"
            :style="{ width: Math.min((snotTotal / 110) * 100, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span>0</span><span>20</span><span class="tick-threshold">40</span
          ><span>60</span><span>110</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請根據<strong>過去兩週</strong>您的實際感受評分。每題 0（無問題）至
          5（最嚴重）分，共 22 題，總分 0–110 分。</span
        >
      </div>

      <div v-for="g in snotGroups" :key="g.label" class="s22-group">
        <div class="group-header" :class="g.color + '-header'">
          <div class="group-label-block">
            <span class="group-label">{{ g.label }}</span>
            <span class="group-sub">{{ g.sub }}</span>
          </div>
          <div class="group-score-pill" :class="g.color + '-pill'">
            {{ snotGroupScore(g) }} 分
          </div>
        </div>
        <div class="item-list">
          <div
            v-for="item in g.items"
            :key="item.key"
            class="s22-item"
            :class="{
              high: snotSel[item.key] >= 4,
              answered: snotSel[item.key] >= 0,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum" :class="g.color + '-qnum'"
                  >Q{{ item.key.slice(1) }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ item.name }}</span>
                <span class="item-sub">{{ item.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: snotSel[item.key] === 0,
                  unanswered: snotSel[item.key] < 0,
                  high: snotSel[item.key] >= 4,
                }"
                >{{ snotSel[item.key] >= 0 ? snotSel[item.key] : "—" }}</span
              >
            </div>
            <div class="option-row s22-option-row">
              <label
                v-for="opt in snotOpts"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: snotSel[item.key] === opt.value,
                  high: opt.value >= 4 && snotSel[item.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="item.key"
                  :value="opt.value"
                  v-model="snotSel[item.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="s22-result" :class="snotSev.color">
        <div class="result-left">
          <span class="result-number">{{ snotTotal }}</span>
          <span class="result-max">/ 110</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ snotSev.level }}</span>
          <span class="result-advice">{{ snotSev.advice }}</span>
          <div class="result-breakdown">
            <span
              v-for="g in snotGroups"
              :key="g.label"
              class="breakdown-pill"
              :class="g.color + '-pill-sm'"
              >{{ g.label }}：{{ snotGroupScore(g) }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="snotShow" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="g in snotGroups" :key="g.label">
          <div class="detail-section-title" :class="g.color + '-section'">
            {{ g.label }}（{{ snotGroupScore(g) }} 分）
          </div>
          <div v-for="item in g.items" :key="item.key" class="detail-row">
            <span class="detail-qnum">{{ item.key.toUpperCase() }}</span>
            <span class="detail-domain">{{ item.name }}</span>
            <span
              class="detail-score"
              :class="{
                zero: snotSel[item.key] === 0,
                high: snotSel[item.key] >= 4,
              }"
              >{{ snotSel[item.key] >= 0 ? snotSel[item.key] : "—" }}</span
            >
            <span class="detail-desc">{{
              snotSel[item.key] >= 0
                ? snotOpts.find((o) => o.value === snotSel[item.key])?.desc
                : "未填"
            }}</span>
          </div>
        </div>
      </div>

      <div class="s22-actions">
        <button class="btn-view" @click="snotShow = !snotShow">
          {{ snotShow ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="snotCopy">
          {{ snotCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="snotReset">重置</button>
      </div>
      <p v-if="!snotComplete" class="progress-hint">
        已完成 {{ snotAns }}/22 題，尚餘 {{ 22 - snotAns }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ── Layout & Tab Bar ──────────────────────────────────────────── */
.crs {
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

/* ── Panel containers ────────────────────────────────────────── */
.dx,
.s22 {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ══════════════════════════════════════════════════════════════════
   Shared Styles
   ══════════════════════════════════════════════════════════════════ */

/* ── Headers ────────────────────────────────────────────────────── */
.dx-header,
.s22-header {
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

/* ── Score Badge ────────────────────────────────────────────────── */
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
  font-size: 1.8rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.score-label {
  font-size: 0.72rem;
  font-weight: 600;
  margin-top: 2px;
  text-align: center;
}
.score-badge.eligible {
  border-color: #22c55e;
  color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.borderline {
  border-color: #f59e0b;
  color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.08),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.score-badge.ineligible {
  border-color: var(--vp-c-divider);
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
.score-badge.filling {
  color: var(--vp-c-text-3);
}

/* ── Severity Bar ──────────────────────────────────────────────── */
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
.severity-fill.eligible {
  background: linear-gradient(90deg, #22c55e, #16a34a);
}
.severity-fill.borderline {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.ineligible {
  background: var(--vp-c-divider);
}
.severity-fill.normal {
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.severity-fill.mild {
  background: linear-gradient(90deg, #eab308, #f59e0b);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f59e0b, #f97316);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #f97316, #ef4444);
}

.severity-ticks {
  display: flex;
  justify-content: space-between;
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  padding: 0 2px;
}
.tick-threshold {
  color: #22c55e;
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
  background: #22c55e;
  border-radius: 1px;
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
.dx-group,
.s22-group {
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
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.group-header.criteria {
  border-left: 3px solid #14b8a6;
}
.group-header.additional {
  border-left: 3px solid #6366f1;
}
.group-header.nasal-header {
  border-left: 4px solid #3b82f6;
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
}
.group-header.ear-header {
  border-left: 4px solid #f59e0b;
  background: linear-gradient(
    135deg,
    rgba(245, 158, 11, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
}
.group-header.sleep-header {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
}
.group-header.psych-header {
  border-left: 4px solid #14b8a6;
  background: linear-gradient(
    135deg,
    rgba(20, 184, 166, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
}

.group-label-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.group-label {
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.group-sub {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
}
.group-score-pill {
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.25s;
}
.group-score-pill.met {
  border-color: #22c55e;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.nasal-pill {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.06);
}
.ear-pill {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
}
.sleep-pill {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(139, 92, 246, 0.06);
}
.psych-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.35);
  background: rgba(20, 184, 166, 0.06);
}

/* ── Item List ─────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Dupixent Items ────────────────────────────────────────────── */
.dx-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.2s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.dx-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.dx-item.met {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 2px rgba(0, 0, 0, 0.03);
}
.dx-item.unmet {
  opacity: 0.65;
}

.dx-item .item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.9rem;
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
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
}
.item-status {
  font-size: 1.1rem;
  font-weight: 800;
  min-width: 28px;
  text-align: right;
  transition: all 0.2s;
}
.dx-item.met .item-status {
  color: #22c55e;
  transform: scale(1.1);
}
.dx-item.unmet .item-status {
  color: #ef4444;
}

.item-desc-row {
  padding: 0.55rem 0.9rem 0;
}
.item-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.presence-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.9rem 0.65rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.presence-label {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-weight: 500;
}
.presence-btns {
  display: flex;
  gap: 4px;
  border-radius: 8px;
  background: var(--vp-c-bg-mute);
  padding: 3px;
}
.presence-btn {
  padding: 5px 18px;
  border-radius: 6px;
  border: 1.5px solid var(--vp-c-divider);
  background: transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s;
  color: var(--vp-c-text-3);
}
.presence-btn.yes {
  border-color: rgba(34, 197, 94, 0.2);
  color: rgba(34, 197, 94, 0.7);
}
.presence-btn.yes.active {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
  box-shadow: 0 1px 3px rgba(34, 197, 94, 0.25);
}
.presence-btn.no {
  border-color: rgba(239, 68, 68, 0.2);
  color: rgba(239, 68, 68, 0.7);
}
.presence-btn.no.active {
  background: #ef4444;
  border-color: #ef4444;
  color: #fff;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.25);
}
.presence-btn:hover:not(.active) {
  background: var(--vp-c-bg-soft);
}
.presence-btn.yes:hover:not(.active) {
  border-color: #22c55e;
  color: #22c55e;
}
.presence-btn.no:hover:not(.active) {
  border-color: #ef4444;
  color: #ef4444;
}

/* ── SNOT-22 input ─────────────────────────────────────────────── */
.snot-input-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem 0.65rem;
  flex-wrap: wrap;
}
.snot-input-wrap {
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 0 10px;
  background: var(--vp-c-bg);
  transition: all 0.15s;
}
.snot-input-wrap:focus-within {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px rgba(var(--vp-c-brand-rgb), 0.08);
}
.snot-input-wrap.met {
  border-color: #22c55e;
}
.snot-input-wrap.unmet {
  border-color: #ef4444;
}
.snot-input {
  width: 60px;
  border: none;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  padding: 0.45rem 0;
  outline: none;
  font-family: inherit;
  -moz-appearance: textfield;
}
.snot-input::-webkit-outer-spin-button,
.snot-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
}
.snot-unit {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}
.snot-hint {
  font-size: 0.75rem;
  font-weight: 600;
}
.hint-met {
  color: #22c55e;
}
.hint-unmet {
  color: #ef4444;
}

/* ── SNOT-22 Items ─────────────────────────────────────────────── */
.s22-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition:
    border-color 0.2s,
    background 0.2s;
}
.s22-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
  border-color: var(--vp-c-divider);
}
.s22-item.high {
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.06),
    rgba(249, 115, 22, 0.02)
  );
  border-color: #f97316 !important;
}
.s22-item .item-header {
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
  padding: 1px 7px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}
.nasal-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.ear-qnum {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.sleep-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.psych-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}

.s22-item .item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.s22-item .item-sub {
  font-size: 0.7rem;
  color: var(--vp-c-text-3);
}
.s22-item .item-score {
  font-size: 0.95rem;
  font-weight: 800;
  flex-shrink: 0;
  min-width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  transition: all 0.25s;
}
.s22-item .item-score.zero {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.3);
  background: rgba(34, 197, 94, 0.06);
}
.s22-item .item-score.unanswered {
  color: var(--vp-c-text-3);
  background: transparent;
  border-color: var(--vp-c-divider);
}
.s22-item .item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.06);
}

/* ── Option Row / Pills (SNOT-22 6-col) ────────────────────────── */
.option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.s22-option-row {
  grid-template-columns: repeat(6, 1fr);
}
.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.15rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  gap: 3px;
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

/* s0–s5 */
.opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.opt-pill.s0:not(.active):hover,
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
.opt-pill.s1:not(.active):hover,
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
.opt-pill.s2:not(.active):hover,
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
.opt-pill.s3:not(.active):hover,
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
.opt-pill.s4:not(.active):hover,
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

.opt-pill.s5 {
  border-color: rgba(239, 68, 68, 0.15);
}
.opt-pill.s5:not(.active):hover,
.opt-pill.s5:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.opt-pill.s5.active {
  border-color: #ef4444;
  background: linear-gradient(
    180deg,
    rgba(239, 68, 68, 0.12),
    rgba(239, 68, 68, 0.06)
  );
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}

.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1.3;
  transition: color 0.2s;
}
.opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}

.opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}

.opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.opt-pill.s2.active .opt-num {
  color: #eab308;
}
.opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}

.opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}

.opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.opt-pill.s4.active .opt-num {
  color: #f97316;
}
.opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

.opt-pill.s5 .opt-num {
  color: rgba(239, 68, 68, 0.85);
}
.opt-pill.s5.active .opt-num {
  color: #ef4444;
}
.opt-pill.s5 .opt-desc {
  color: rgba(239, 68, 68, 0.7);
}
.opt-pill.s5.active .opt-desc {
  color: rgba(239, 68, 68, 0.9);
}

/* ── Result card ───────────────────────────────────────────────── */
.dx-result,
.s22-result {
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
.dx-result.eligible {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dx-result.borderline {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.dx-result.ineligible {
  border-color: var(--vp-c-divider);
}
.s22-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.s22-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.s22-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.s22-result.severe {
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
  transition: all 0.3s;
}
.dx-result.eligible .result-number {
  color: #22c55e;
}
.dx-result.borderline .result-number {
  color: #f59e0b;
}
.s22-result.normal .result-number {
  color: #22c55e;
}
.s22-result.mild .result-number {
  color: #f59e0b;
}
.s22-result.moderate .result-number {
  color: #f97316;
}
.s22-result.severe .result-number {
  color: #ef4444;
}

.result-max {
  font-size: 1.2rem;
  color: var(--vp-c-text-3);
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-level {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-advice {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}
.result-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.result-tag {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(99, 102, 241, 0.08);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.2);
  transition: all 0.15s;
}
.result-tag:hover {
  background: rgba(99, 102, 241, 0.14);
}
.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.breakdown-pill {
  font-size: 0.7rem;
  font-weight: 600;
  padding: 2px 9px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-mute);
  transition: all 0.15s;
}
.nasal-pill-sm {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.35);
  background: rgba(59, 130, 246, 0.06);
}
.ear-pill-sm {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.06);
}
.sleep-pill-sm {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.35);
  background: rgba(139, 92, 246, 0.06);
}
.psych-pill-sm {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.35);
  background: rgba(20, 184, 166, 0.06);
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
.detail-section-title {
  padding: 0.45rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}
.nasal-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.ear-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.sleep-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.psych-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.5rem 0.9rem;
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
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex-shrink: 0;
  width: 130px;
}
.detail-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
  width: 32px;
}
.detail-score {
  font-size: 0.85rem;
  font-weight: 800;
  flex-shrink: 0;
  width: 28px;
  text-align: center;
  color: var(--vp-c-text-3);
}
.detail-score.zero {
  color: #22c55e;
}
.detail-score.high {
  color: #f97316;
}
.met-color {
  color: #22c55e;
}
.unmet-color {
  color: #ef4444;
}
.detail-desc {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  flex: 1;
  text-align: left;
}

/* ── Actions ───────────────────────────────────────────────────── */
.dx-actions,
.s22-actions {
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

/* ── Responsive ────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .dx-header,
  .s22-header {
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
  .dx-result,
  .s22-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .s22-option-row {
    grid-template-columns: repeat(3, 1fr);
  }
  .detail-domain {
    width: 90px;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
