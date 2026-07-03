<script setup lang="ts">
import { ref, computed } from "vue";

const activeTab = ref<"screener">("screener");

// ══════════════ 風濕免疫自我評估（Autoimmune Self-Screening）══════════════

// ── Symptom definitions with disease weights ──────────────────────
// Each symptom maps to diseases with a weight (1–3)
// 1 = supportive  2 = characteristic  3 = highly specific

const categories = [
  {
    key: "joint",
    name: "關節症狀",
    icon: "🦴",
    color: "joint",
    symptoms: [
      {
        key: "s01",
        text: "關節疼痛、壓痛或腫脹",
        hint: "特別是小關節（手指、手腕），或大關節（膝蓋、踝關節）",
        diseases: { RA: 3, PsA: 2, AS: 1, SLE: 2, SS: 1 },
      },
      {
        key: "s02",
        text: "晨間關節僵硬，持續 30 分鐘以上",
        hint: "起床後關節僵硬，需要活動才能逐漸緩解，是炎症性關節炎的典型特徵",
        diseases: { RA: 3, PsA: 2, AS: 2, SLE: 1 },
      },
      {
        key: "s03",
        text: "對稱性關節疼痛（雙手、雙膝同時）",
        hint: "身體左右兩側相同關節同時受影響",
        diseases: { RA: 3, SLE: 2 },
      },
      {
        key: "s04",
        text: "多個關節同時受影響（多關節炎）",
        hint: "四個或更多關節同時發炎疼痛",
        diseases: { RA: 2, PsA: 2, SLE: 2, SS: 1 },
      },
      {
        key: "s05",
        text: "腰部和臀部疼痛，持續數週或數月",
        hint: "慢性下背痛或臀部深層疼痛，與姿勢或活動無關",
        diseases: { AS: 3, PsA: 2 },
      },
      {
        key: "s06",
        text: "夜間或清晨背痛，影響睡眠",
        hint: "休息時背痛加重，活動後改善——炎症性背痛的關鍵特徵",
        diseases: { AS: 3, PsA: 1 },
      },
      {
        key: "s07",
        text: "脊椎僵硬，特別是早晨或久坐後",
        hint: "晨間脊椎活動受限，熱身後逐漸改善",
        diseases: { AS: 3, PsA: 1 },
      },
      {
        key: "s08",
        text: "肌腱或韌帶連接骨頭處發炎疼痛（附著點炎）",
        hint: "足底、跟腱、肘部等肌腱附著點的疼痛，是脊椎關節炎特徵",
        diseases: { AS: 3, PsA: 2 },
      },
      {
        key: "s09",
        text: "關節活動時有摩擦聲或喀喀聲（骨擦音）",
        hint: "關節活動時聽到或感覺到摩擦，可能代表關節面受損",
        diseases: { RA: 1, PsA: 1, AS: 1 },
      },
    ],
  },
  {
    key: "skin",
    name: "皮膚症狀",
    icon: "🩺",
    color: "skin",
    symptoms: [
      {
        key: "s10",
        text: "臉頰和鼻子上的蝴蝶狀紅疹（蝶形紅斑）",
        hint: "橫跨鼻樑、延伸至雙頰的紅疹，形狀像蝴蝶，是 SLE 的標誌性表現",
        diseases: { SLE: 3 },
      },
      {
        key: "s11",
        text: "對陽光敏感，曝曬後出現皮疹或病情加重",
        hint: "暴露於日光後皮膚出現紅疹、燒灼感，或全身症狀惡化",
        diseases: { SLE: 3, SS: 1 },
      },
      {
        key: "s12",
        text: "紅色斑塊伴有銀白色鱗屑（手肘、膝蓋、頭皮）",
        hint: "邊界清晰的紅色斑塊，上覆銀白色鱗片，是乾癬的典型皮膚病變",
        diseases: { PsA: 3 },
      },
      {
        key: "s13",
        text: "指甲凹陷、龜裂、變厚或與甲床分離",
        hint: "指甲出現針尖大小的小凹洞、橫紋或甲板與甲床分離（甲剝離）",
        diseases: { PsA: 3 },
      },
      {
        key: "s14",
        text: "反覆口腔潰瘍（每年 3 次以上）",
        hint: "反覆發作的口腔黏膜潰瘍，可能是自體免疫疾病的早期訊號",
        diseases: { SLE: 2, SS: 1, AS: 1 },
      },
      {
        key: "s15",
        text: "異常脫髮，頭髮明顯變稀疏",
        hint: "非遺傳性的大量或彌漫性脫髮，常見於疾病活動期",
        diseases: { SLE: 2 },
      },
      {
        key: "s16",
        text: "皮膚持續乾燥、發癢或出現皮疹",
        hint: "持續性皮膚乾燥或不明原因皮疹，與季節或過敏無關",
        diseases: { SS: 1, SLE: 1, PsA: 1 },
      },
    ],
  },
  {
    key: "dry",
    name: "乾燥症狀",
    icon: "💧",
    color: "dry",
    symptoms: [
      {
        key: "s17",
        text: "眼睛持續乾澀、灼熱、有異物感或畏光",
        hint: "長期眼睛乾燥，使用人工淚液也難以完全緩解，是乾燥症的核心症狀",
        diseases: { SS: 3, SLE: 1 },
      },
      {
        key: "s18",
        text: "口乾、吞嚥固體食物困難、味覺改變",
        hint: "持續口乾，需要頻繁飲水、尤其吃乾食時，是乾燥症的核心症狀",
        diseases: { SS: 3, SLE: 1 },
      },
      {
        key: "s19",
        text: "唾液腺（腮腺）腫大",
        hint: "下巴或耳前區域腫脹，可能是腮腺腫大所致",
        diseases: { SS: 3 },
      },
      {
        key: "s20",
        text: "蛀牙明顯增多，牙齦問題頻繁",
        hint: "唾液減少導致口腔自潔能力下降，蛀牙快速增加",
        diseases: { SS: 2 },
      },
    ],
  },
  {
    key: "systemic",
    name: "全身症狀",
    icon: "🌡",
    color: "systemic",
    symptoms: [
      {
        key: "s21",
        text: "持續性疲勞、精力不足，休息後仍無法改善",
        hint: "不論睡眠充足與否，長期感到身體疲憊乏力",
        diseases: { SLE: 2, RA: 2, SS: 2, AS: 2, PsA: 1 },
      },
      {
        key: "s22",
        text: "反覆低燒（37.5–38.5°C）或不明原因發燒",
        hint: "持續或間歇性低熱，且排除感染原因",
        diseases: { SLE: 3, RA: 2, SS: 1 },
      },
      {
        key: "s23",
        text: "不明原因體重減輕、食慾不振",
        hint: "未刻意節食卻體重下降，或持續食慾低落",
        diseases: { SLE: 2, RA: 1, SS: 1 },
      },
      {
        key: "s24",
        text: "肌肉無力或肌肉疼痛",
        hint: "肌力下降（如爬樓梯、梳頭困難）或廣泛性肌肉酸痛",
        diseases: { SLE: 2, SS: 1, RA: 1 },
      },
    ],
  },
  {
    key: "other",
    name: "其他特殊症狀",
    icon: "🔍",
    color: "other",
    symptoms: [
      {
        key: "s25",
        text: "手指遇冷變白、變藍後轉紅（雷諾現象）",
        hint: "暴露寒冷時手指顏色依序變白、藍、紅，並伴有麻木或刺痛",
        diseases: { SS: 3, SLE: 2, RA: 1 },
      },
      {
        key: "s26",
        text: "深呼吸或咳嗽時胸痛",
        hint: "吸氣時胸膜刺痛，可能代表漿膜炎（胸膜炎或心包炎）",
        diseases: { SLE: 3 },
      },
      {
        key: "s27",
        text: "手、腳或眼周腫脹",
        hint: "非運動傷害引起的肢端腫脹，特別是早晨手指腫脹如香腸狀",
        diseases: { RA: 2, PsA: 2, SLE: 1, SS: 1 },
      },
      {
        key: "s28",
        text: "眼睛發紅疼痛、視力模糊（葡萄膜炎）",
        hint: "急性眼紅伴畏光或視力變化，是脊椎關節炎和炎症性關節炎的關節外表現",
        diseases: { AS: 3, PsA: 2, RA: 1 },
      },
      {
        key: "s29",
        text: "頻繁頭痛、記憶力減退或注意力不集中",
        hint: "認知功能變化或頭痛，可能反映神經系統受累",
        diseases: { SLE: 2, SS: 1 },
      },
      {
        key: "s30",
        text: "腎臟問題：泡沫尿、血尿或反覆水腫",
        hint: "尿液泡沫增多（蛋白尿）、血尿或雙下肢水腫，可能提示腎臟受累",
        diseases: { SLE: 3 },
      },
    ],
  },
];

// ── Disease definitions ───────────────────────────────────────────
const diseases: Record<
  string,
  {
    name: string;
    full: string;
    color: string;
    desc: string;
    specialist: string;
    urgency: string;
  }
> = {
  RA: {
    name: "類風濕性關節炎",
    full: "Rheumatoid Arthritis (RA)",
    color: "#6366f1",
    desc: "以多發性對稱性關節炎為主要表現，晨僵明顯，好發於手部小關節。",
    specialist: "風濕免疫科",
    urgency: "盡快就診（數週內）",
  },
  AS: {
    name: "僵直性脊椎炎",
    full: "Ankylosing Spondylitis (AS)",
    color: "#0891b2",
    desc: "中軸型脊椎關節炎，以炎症性腰背痛、晨僵及骶髂關節炎為特徵，好發年輕男性。",
    specialist: "風濕免疫科",
    urgency: "盡快就診（數週內）",
  },
  SLE: {
    name: "全身性紅斑狼瘡",
    full: "Systemic Lupus Erythematosus (SLE)",
    color: "#dc2626",
    desc: "多系統自體免疫疾病，可累及皮膚、關節、腎臟、神經系統，蝶形紅斑為典型表現。",
    specialist: "風濕免疫科",
    urgency: "優先就診（盡快）",
  },
  SS: {
    name: "修格蘭氏症候群",
    full: "Sjögren's Syndrome (SS)",
    color: "#0d9488",
    desc: "以眼乾、口乾為主要症狀的外分泌腺自體免疫疾病，可合併其他系統受累。",
    specialist: "風濕免疫科或眼科",
    urgency: "安排就診（1–2 個月內）",
  },
  PsA: {
    name: "乾癬性關節炎",
    full: "Psoriatic Arthritis (PsA)",
    color: "#d97706",
    desc: "與乾癬（牛皮癬）相關的炎症性關節炎，可累及脊椎、周邊關節和指甲。",
    specialist: "皮膚科或風濕免疫科",
    urgency: "盡快就診（數週內）",
  },
};

// ── State ─────────────────────────────────────────────────────────
const checked = ref<Record<string, boolean>>({});
const showResult = ref(false);
const step = ref<"intro" | "assess" | "result">("intro");

// ── Computed ──────────────────────────────────────────────────────
const checkedCount = computed(
  () => Object.values(checked.value).filter(Boolean).length,
);

const allSymptoms = computed(() => categories.flatMap((c) => c.symptoms));

// For each disease, compute a weighted match score and percentage
const diseaseScores = computed(() => {
  const result: Record<
    string,
    { raw: number; max: number; pct: number; matched: string[] }
  > = {};

  for (const [code] of Object.entries(diseases)) {
    let raw = 0,
      max = 0;
    const matched: string[] = [];

    for (const cat of categories) {
      for (const sym of cat.symptoms) {
        const w = (sym.diseases as Record<string, number>)[code];
        if (!w) continue;
        max += w;
        if (checked.value[sym.key]) {
          raw += w;
          matched.push(sym.text);
        }
      }
    }
    result[code] = {
      raw,
      max,
      pct: max > 0 ? Math.round((raw / max) * 100) : 0,
      matched,
    };
  }
  return result;
});

// Sorted disease list by match %
const sortedDiseases = computed(() =>
  Object.entries(diseaseScores.value)
    .sort((a, b) => b[1].pct - a[1].pct)
    .filter(([, s]) => s.pct > 0),
);

// Top candidate
const topDisease = computed(() =>
  sortedDiseases.value.length > 0 ? sortedDiseases.value[0] : null,
);

// Risk level based on top score and count
const riskLevel = computed(() => {
  const top = topDisease.value;
  if (!top) return { level: "low", label: "症狀符合度低", color: "normal" };
  const pct = top[1].pct;
  if (pct >= 50 || checkedCount.value >= 5)
    return { level: "high", label: "建議優先就診", color: "severe" };
  if (pct >= 30 || checkedCount.value >= 3)
    return { level: "medium", label: "建議安排就診評估", color: "moderate" };
  return { level: "low", label: "症狀不明顯，持續觀察", color: "normal" };
});

// Which categories have any checked symptoms
const checkedByCategory = computed(() => {
  const r: Record<string, string[]> = {};
  for (const cat of categories) {
    r[cat.key] = cat.symptoms
      .filter((s) => checked.value[s.key])
      .map((s) => s.text);
  }
  return r;
});

function startAssess() {
  step.value = "assess";
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function doAssess() {
  step.value = "result";
  showResult.value = true;
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function doReset() {
  checked.value = {};
  step.value = "intro";
  showResult.value = false;
}

// Urgency from top disease
const urgencyNote = computed(() => {
  if (!topDisease.value) return null;
  const code = topDisease.value[0];
  const pct = topDisease.value[1].pct;
  if (pct < 20) return null;
  return diseases[code];
});
</script>

<template>
  <div class="rheumascreen">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'screener' }"
        @click="activeTab = 'screener'"
      >
        <span class="tab-label">風濕免疫自我評估</span>
        <span class="tab-sub">Autoimmune Self-Screening</span>
      </button>
    </div>

  <div v-show="activeTab === 'screener'" class="screener">
    <!-- ── INTRO ──────────────────────────────────────────────── -->
    <div v-if="step === 'intro'" class="intro-page">
      <div class="screener-header">
        <h2 class="title">免疫疾病症狀自我檢測</h2>
        <p class="subtitle">
          Autoimmune Disease Symptom Screener · 依據最近 3 個月的身體狀況填寫
        </p>
      </div>

      <div class="disease-intro-grid">
        <div
          v-for="[code, d] in Object.entries(diseases)"
          :key="code"
          class="disease-intro-card"
          :style="{ borderTopColor: d.color }"
        >
          <div class="dic-name">{{ d.name }}</div>
          <div class="dic-full">{{ d.full }}</div>
          <div class="dic-desc">{{ d.desc }}</div>
          <div class="dic-dept">
            <span class="dic-icon">🏥</span>{{ d.specialist }}
          </div>
        </div>
      </div>

      <div class="disclaimer-box">
        <div class="disc-title">⚠ 重要聲明</div>
        <p>
          本工具<strong>僅供症狀初步參考</strong>，不能作為醫學診斷依據。症狀符合不代表確診，確診需要血液檢查、影像學及專科醫師的完整評估。如有任何疑慮，請盡快諮詢醫師。
        </p>
      </div>

      <div class="how-to">
        <div class="ht-step">
          <span class="ht-num">1</span
          ><span>勾選您過去 3 個月曾出現的症狀</span>
        </div>
        <div class="ht-step">
          <span class="ht-num">2</span
          ><span>系統依症狀加權分析各疾病相符程度</span>
        </div>
        <div class="ht-step">
          <span class="ht-num">3</span
          ><span>獲得初步建議，決定是否需要就診</span>
        </div>
      </div>

      <button class="btn-start" @click="startAssess">開始症狀評估 →</button>
    </div>

    <!-- ── ASSESSMENT ─────────────────────────────────────────── -->
    <div v-else-if="step === 'assess'">
      <div class="assess-header">
        <div>
          <h2 class="title">症狀勾選</h2>
          <p class="subtitle">
            請勾選您在<strong>過去 3 個月</strong>曾出現的症狀（可多選）
          </p>
        </div>
        <div class="checked-badge">
          <span class="cb-n">{{ checkedCount }}</span>
          <span class="cb-l">已勾選</span>
        </div>
      </div>

      <!-- Category groups -->
      <div v-for="cat in categories" :key="cat.key" class="cat-group">
        <div class="cat-header" :class="cat.color + '-header'">
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
          <span class="cat-count" v-if="checkedByCategory[cat.key]?.length > 0">
            {{ checkedByCategory[cat.key].length }} 項
          </span>
        </div>

        <div class="symptom-list">
          <label
            v-for="sym in cat.symptoms"
            :key="sym.key"
            class="symptom-item"
            :class="{
              'sym-checked': checked[sym.key],
              [cat.color + '-checked']: checked[sym.key],
            }"
          >
            <input
              type="checkbox"
              v-model="checked[sym.key]"
              class="sym-checkbox"
            />
            <div
              class="sym-check-box"
              :class="{
                checked: checked[sym.key],
                [cat.color + '-cb']: checked[sym.key],
              }"
            >
              <svg
                v-if="checked[sym.key]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3.5"
                class="check-svg"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div class="sym-content">
              <span class="sym-text">{{ sym.text }}</span>
              <span class="sym-hint">{{ sym.hint }}</span>
            </div>
          </label>
        </div>
      </div>

      <!-- Action row -->
      <div class="assess-actions">
        <button class="btn-back" @click="step = 'intro'">← 返回說明</button>
        <button
          class="btn-assess"
          @click="doAssess"
          :disabled="checkedCount === 0"
        >
          分析我的症狀（已選 {{ checkedCount }} 項）
        </button>
      </div>
      <p class="hint-text" v-if="checkedCount === 0">
        請至少勾選一項症狀以進行分析
      </p>
    </div>

    <!-- ── RESULT ──────────────────────────────────────────────── -->
    <div v-else>
      <div class="result-header">
        <div>
          <h2 class="title">症狀分析結果</h2>
          <p class="subtitle">
            共勾選 {{ checkedCount }} 項症狀 · 以下為各疾病符合程度分析
          </p>
        </div>
        <div class="risk-badge" :class="riskLevel.color">
          <span class="rb-label">{{ riskLevel.label }}</span>
        </div>
      </div>

      <!-- Urgency card -->
      <div
        v-if="urgencyNote"
        class="urgency-card"
        :style="{ borderColor: urgencyNote.color }"
      >
        <div class="uc-left" :style="{ background: urgencyNote.color }">
          <span class="uc-icon">!</span>
        </div>
        <div class="uc-right">
          <div class="uc-title">建議優先評估：{{ urgencyNote.name }}</div>
          <div class="uc-detail">
            建議科別：<strong>{{ urgencyNote.specialist }}</strong
            >　·　 時程：<strong>{{ urgencyNote.urgency }}</strong>
          </div>
          <div class="uc-note">{{ urgencyNote.desc }}</div>
        </div>
      </div>

      <!-- Disease match bars -->
      <div class="disease-results">
        <div class="dr-title">各疾病症狀符合程度</div>
        <div
          v-for="[code, score] in sortedDiseases"
          :key="code"
          class="disease-bar-card"
        >
          <div class="dbc-top">
            <div class="dbc-name-wrap">
              <span
                class="dbc-dot"
                :style="{ background: diseases[code].color }"
              />
              <span class="dbc-name">{{ diseases[code].name }}</span>
              <span class="dbc-full">{{ diseases[code].full }}</span>
            </div>
            <span class="dbc-pct" :style="{ color: diseases[code].color }"
              >{{ score.pct }}%</span
            >
          </div>
          <div class="dbc-bar-wrap">
            <div class="dbc-bar">
              <div
                class="dbc-fill"
                :class="code"
                :style="{ width: score.pct + '%' }"
              />
            </div>
            <div class="dbc-thresholds">
              <span class="dbc-th" style="left: 20%">低</span>
              <span class="dbc-th" style="left: 40%">中</span>
              <span class="dbc-th" style="left: 60%">高</span>
            </div>
          </div>
          <!-- Matched symptoms -->
          <div class="dbc-matched" v-if="score.matched.length > 0">
            <span class="dm-label">符合症狀：</span>
            <span v-for="(m, i) in score.matched" :key="i" class="dm-tag">{{
              m
            }}</span>
          </div>
          <div class="dbc-dept">
            <span>🏥 {{ diseases[code].specialist }}</span>
            <span class="dbc-urgency">{{ diseases[code].urgency }}</span>
          </div>
        </div>

        <div v-if="sortedDiseases.length === 0" class="no-match">
          <div class="nm-icon">✓</div>
          <div class="nm-text">所選症狀與五種自體免疫疾病的符合度均很低</div>
          <div class="nm-sub">
            請持續觀察症狀變化，若症狀持續或加重請諮詢醫師
          </div>
        </div>
      </div>

      <!-- Checked symptoms summary -->
      <div class="checked-summary">
        <div class="cs-title">您勾選的症狀（{{ checkedCount }} 項）</div>
        <div v-for="cat in categories" :key="cat.key">
          <div v-if="checkedByCategory[cat.key]?.length > 0" class="cs-cat">
            <span class="cs-cat-name">{{ cat.icon }} {{ cat.name }}</span>
            <div class="cs-syms">
              <span
                v-for="s in checkedByCategory[cat.key]"
                :key="s"
                class="cs-tag"
                >{{ s }}</span
              >
            </div>
          </div>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="disclaimer-box result-disc">
        <div class="disc-title">⚠ 重要提醒</div>
        <p>
          本結果<strong>僅為症狀初步分析，不能作為診斷依據</strong>。確診自體免疫疾病需要專業醫師的臨床評估、血液免疫學檢查（ANA、RF、抗CCP
          等）及影像學檢查。請勿依據本結果自行診斷或服藥。
        </p>
      </div>

      <!-- Actions -->
      <div class="result-actions">
        <button class="btn-back" @click="step = 'assess'">
          ← 修改症狀選擇
        </button>
        <button class="btn-reset" @click="doReset">重新開始</button>
      </div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.rheumascreen {
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
    min-width: 45%;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ══════════════ 風濕免疫自我評估（Autoimmune Self-Screening）══════════════ */

.screener {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}
/* ── Shared header ──────────────────────────────────────────────── */
.screener .title {
  font-size: 24px;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin: 0 0 0.2rem;
  border: none !important;
  padding: 0 !important;
}
.screener .subtitle {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  margin: 0;
  line-height: 1.5;
}
/* ── Intro page ─────────────────────────────────────────────────── */
.screener .screener-header {
  margin-bottom: 1.5rem;
}
.screener .disease-intro-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
  margin-bottom: 1.25rem;
}
.screener .disease-intro-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  border-top-width: 3px;
  padding: 0.75rem;
  background: var(--vp-c-bg-soft);
}
.screener .dic-name {
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 2px;
}
.screener .dic-full {
  font-size: 0.62rem;
  color: var(--vp-c-text-3);
  margin-bottom: 6px;
}
.screener .dic-desc {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
  margin-bottom: 6px;
}
.screener .dic-dept {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  display: flex;
  align-items: center;
  gap: 3px;
}
.screener .dic-icon {
  font-size: 0.8rem;
}
.screener .disclaimer-box {
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.04);
  padding: 0.9rem 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}
.screener .result-disc {
  border-color: rgba(245, 158, 11, 0.3);
  background: rgba(245, 158, 11, 0.04);
}
.screener .disc-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: #ef4444;
  margin-bottom: 0.4rem;
}
.screener .result-disc .disc-title {
  color: #f59e0b;
}
.screener .how-to {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.screener .ht-step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 180px;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
}
.screener .ht-num {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.screener .btn-start {
  width: 100%;
  padding: 14px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.screener .btn-start:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.screener .btn-start:active {
  transform: translateY(0);
}
/* ── Assessment ─────────────────────────────────────────────────── */
.screener .assess-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.screener .checked-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 70px;
  padding: 0.5rem 0.9rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .cb-n {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
  line-height: 1;
}
.screener .cb-l {
  font-size: 0.62rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
/* Category groups */
.screener .cat-group {
  margin-bottom: 1.5rem;
}
.screener .cat-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 0.4rem;
  min-height: 44px;
  box-sizing: border-box;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.screener .joint-header {
  border-left: 4px solid #6366f1;
  background: linear-gradient(
    135deg,
    rgba(99, 102, 241, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.screener .skin-header {
  border-left: 4px solid #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.screener .dry-header {
  border-left: 4px solid #0d9488;
  background: linear-gradient(
    135deg,
    rgba(13, 148, 136, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(13, 148, 136, 0.06);
}
.screener .systemic-header {
  border-left: 4px solid #dc2626;
  background: linear-gradient(
    135deg,
    rgba(220, 38, 38, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(220, 38, 38, 0.06);
}
.screener .other-header {
  border-left: 4px solid #8b5cf6;
  background: linear-gradient(
    135deg,
    rgba(139, 92, 246, 0.08),
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  box-shadow: 0 1px 3px rgba(139, 92, 246, 0.06);
}
.screener .cat-icon {
  font-size: 1.1rem;
}
.screener .cat-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  flex: 1;
}
.screener .cat-count {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  height: 22px;
  min-width: 42px;

  display: flex;
  align-items: center;
  justify-content: center;

  line-height: 1;
}
/* Symptom items */
.screener .symptom-list {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.screener .symptom-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.screener .symptom-item:hover {
  background: var(--vp-c-bg-mute);
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.screener .symptom-item input[type="checkbox"] {
  display: none;
}
.screener .sym-check-box {
  width: 20px;
  height: 20px;
  border-radius: 5px;
  flex-shrink: 0;
  margin-top: 1px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.screener .sym-check-box.checked {
  background: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}
.screener .joint-cb.checked {
  background: #6366f1;
  border-color: #6366f1;
}
.screener .skin-cb.checked {
  background: #f97316;
  border-color: #f97316;
}
.screener .dry-cb.checked {
  background: #0d9488;
  border-color: #0d9488;
}
.screener .systemic-cb.checked {
  background: #dc2626;
  border-color: #dc2626;
}
.screener .other-cb.checked {
  background: #8b5cf6;
  border-color: #8b5cf6;
}
.screener .check-svg {
  width: 12px;
  height: 12px;
  color: #fff;
}
.screener .sym-content {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.screener .sym-text {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.4;
}
.screener .sym-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  line-height: 1.4;
  font-style: italic;
}
/* Checked state tint */
.screener .joint-checked {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05) !important;
}
.screener .skin-checked {
  border-color: #f97316;
  background: rgba(249, 115, 22, 0.05) !important;
}
.screener .dry-checked {
  border-color: #0d9488;
  background: rgba(13, 148, 136, 0.05) !important;
}
.screener .systemic-checked {
  border-color: #dc2626;
  background: rgba(220, 38, 38, 0.05) !important;
}
.screener .other-checked {
  border-color: #8b5cf6;
  background: rgba(139, 92, 246, 0.05) !important;
}
/* Assess actions */
.screener .assess-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}
.screener .hint-text {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  margin: 0.3rem 0 0;
}
/* ── Result ─────────────────────────────────────────────────────── */
.screener .result-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}
.screener .risk-badge {
  padding: 8px 18px;
  border-radius: 14px;
  font-size: 0.82rem;
  font-weight: 700;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .risk-badge.normal {
  color: #22c55e;
  border-color: #22c55e;
  background: linear-gradient(
    135deg,
    rgba(34, 197, 94, 0.06),
    rgba(34, 197, 94, 0.02)
  );
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .risk-badge.moderate {
  color: #f97316;
  border-color: #f97316;
  background: linear-gradient(
    135deg,
    rgba(249, 115, 22, 0.06),
    rgba(249, 115, 22, 0.02)
  );
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .risk-badge.severe {
  color: #ef4444;
  border-color: #ef4444;
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.06),
    rgba(239, 68, 68, 0.02)
  );
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .rb-label {
  white-space: nowrap;
}
/* Urgency card */
.screener .urgency-card {
  display: flex;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid;
  margin-bottom: 1.25rem;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.screener .uc-left {
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.screener .uc-icon {
  font-size: 1.3rem;
  font-weight: 900;
  color: #fff;
}
.screener .uc-right {
  padding: 0.85rem 1rem;
  flex: 1;
}
.screener .uc-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}
.screener .uc-detail {
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
  margin-bottom: 5px;
}
.screener .uc-note {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
/* Disease bars */
.screener .disease-results {
  margin-bottom: 1.25rem;
}
.screener .dr-title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  margin-bottom: 0.75rem;
}
.screener .disease-bar-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  padding: 0.9rem;
  margin-bottom: 0.6rem;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.screener .disease-bar-card:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.screener .dbc-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}
.screener .dbc-name-wrap {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  flex-wrap: wrap;
}
.screener .dbc-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.screener .dbc-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.screener .dbc-full {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
}
.screener .dbc-pct {
  font-size: 1.5rem;
  font-weight: 800;
  flex-shrink: 0;
  line-height: 1;
}
.screener .dbc-bar-wrap {
  position: relative;
  margin-bottom: 0.6rem;
}
.screener .dbc-bar {
  height: 8px;
  background: var(--vp-c-bg-mute);
  border-radius: 999px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.08);
}
.screener .dbc-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    background 0.3s;
  min-width: 4px;
}
.screener .dbc-fill.RA {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}
.screener .dbc-fill.AS {
  background: linear-gradient(90deg, #0891b2, #22d3ee);
}
.screener .dbc-fill.SLE {
  background: linear-gradient(90deg, #dc2626, #f87171);
}
.screener .dbc-fill.SS {
  background: linear-gradient(90deg, #0d9488, #2dd4bf);
}
.screener .dbc-fill.PsA {
  background: linear-gradient(90deg, #d97706, #fbbf24);
}
.screener .dbc-thresholds {
  position: relative;
  display: flex;
  height: 14px;
  margin-top: 2px;
}
.screener .dbc-th {
  position: absolute;
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
  transform: translateX(-50%);
}
.screener .dbc-matched {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 0.5rem;
  align-items: flex-start;
}
.screener .dm-label {
  font-size: 0.68rem;
  color: var(--vp-c-text-3);
  flex-shrink: 0;
  margin-top: 2px;
}
.screener .dm-tag {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.screener .dbc-dept {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.72rem;
  color: var(--vp-c-text-3);
  padding-top: 0.4rem;
  border-top: 1px solid var(--vp-c-divider);
  margin-top: 0.4rem;
}
.screener .dbc-urgency {
  font-weight: 600;
  color: var(--vp-c-text-2);
}
.screener .no-match {
  text-align: center;
  padding: 2rem 1rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.screener .no-match:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
}
.screener .nm-icon {
  font-size: 2rem;
  color: #22c55e;
  margin-bottom: 0.5rem;
}
.screener .nm-text {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 4px;
}
.screener .nm-sub {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
}
/* Checked summary */
.screener .checked-summary {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.screener .cs-title {
  padding: 0.5rem 0.9rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--vp-c-text-3);
  background: var(--vp-c-bg-mute);
  border-bottom: 1px solid var(--vp-c-divider);
}
.screener .cs-cat {
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--vp-c-divider);
}
.screener .cs-cat:last-child {
  border-bottom: none;
}
.screener .cs-cat-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
  display: block;
  margin-bottom: 5px;
}
.screener .cs-syms {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.screener .cs-tag {
  font-size: 0.68rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  border: 1px solid var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}
/* ── Buttons ─────────────────────────────────────────────────────── */
.screener .btn-back,
.screener .btn-assess,
.screener .btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
}
.screener .btn-assess {
  border: none;
  background: linear-gradient(135deg, var(--vp-c-brand-1), #4f46e5);
  color: #fff;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}
.screener .btn-assess:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
}
.screener .btn-assess:active:not(:disabled) {
  transform: translateY(0);
}
.screener .btn-assess:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.screener .btn-back {
  border: 1.5px solid var(--vp-c-brand-1);
  background: transparent;
  color: var(--vp-c-brand-1);
}
.screener .btn-back:hover {
  background: var(--vp-c-brand-soft);
}
.screener .btn-reset {
  border: 1px solid var(--vp-c-divider);
  background: transparent;
  color: var(--vp-c-text-2);
}
.screener .btn-reset:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.04);
}
.screener .result-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

@media (max-width: 640px) {
.screener .disease-intro-grid {
    grid-template-columns: 1fr 1fr;
  }
.screener .assess-header {
    flex-direction: column;
  }
.screener .result-header {
    flex-direction: column;
  }
.screener .how-to {
    flex-direction: column;
  }
}

/* ══════════════ 可讀性強化與版面調整 ══════════════ */

/* 疾病介紹卡片 — 全寬、上下堆疊、放大字級 */
.screener .disease-intro-grid {
  grid-template-columns: 1fr !important;
  gap: 0.75rem !important;
}
.screener .disease-intro-card {
  padding: 0.9rem 1.1rem !important;
}
.screener .dic-name {
  font-size: 1rem !important;
  margin-bottom: 3px !important;
}
.screener .dic-full {
  font-size: 0.78rem !important;
  margin-bottom: 8px !important;
}
.screener .dic-desc {
  font-size: 0.88rem !important;
  line-height: 1.6 !important;
  margin-bottom: 8px !important;
}
.screener .dic-dept {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
}
.screener .dic-icon {
  font-size: 0.9rem !important;
}

/* 症狀清單 — 放大字級 */
.screener .sym-text {
  font-size: 0.92rem !important;
}
.screener .sym-hint {
  font-size: 0.8rem !important;
  color: var(--vp-c-text-2) !important;
}

/* 勾選框垂直置中於症狀卡片 */
.screener .symptom-item {
  align-items: center !important;
}
.screener .sym-check-box {
  align-self: center !important;
  margin-top: 0 !important;
}
</style>
