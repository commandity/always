<script setup lang="ts">
import { ref, computed } from "vue";

// ── VoiSS 30 items — three domains ───────────────────────────────
const voissQuestions = [
  { key: "i1", domain: "I", name: "我的聲音變了", sub: "My voice has changed" },
  {
    key: "i2",
    domain: "I",
    name: "我的聲音時好時壞",
    sub: "My voice varies a great deal",
  },
  {
    key: "i3",
    domain: "I",
    name: "說話對我來說感覺很費力",
    sub: "Speaking is an effort",
  },
  {
    key: "i4",
    domain: "I",
    name: "在嘈雜環境中別人聽不到我說話",
    sub: "People cannot hear me in noisy places",
  },
  {
    key: "i5",
    domain: "I",
    name: "我不得不重複說一遍才能被理解",
    sub: "I have to repeat myself to be understood",
  },
  {
    key: "i6",
    domain: "I",
    name: "人們要求我重複說一遍",
    sub: "People ask me to repeat myself",
  },
  {
    key: "i7",
    domain: "I",
    name: "我避免使用電話",
    sub: "I avoid using the telephone",
  },
  {
    key: "i8",
    domain: "I",
    name: "我的聲音在一天結束時比早晨更差",
    sub: "My voice is worse at the end of the day",
  },
  {
    key: "i9",
    domain: "I",
    name: "說話時我的聲音會斷掉",
    sub: "My voice cuts out when speaking",
  },
  {
    key: "i10",
    domain: "I",
    name: "我發現大聲說話很困難",
    sub: "I find it hard to speak loudly",
  },
  {
    key: "i11",
    domain: "I",
    name: "我的聲音聽起來嘶啞",
    sub: "My voice sounds hoarse",
  },
  {
    key: "i12",
    domain: "I",
    name: "我的聲音聽起來粗糙或刺耳",
    sub: "My voice sounds rough or harsh",
  },
  {
    key: "i13",
    domain: "I",
    name: "我的聲音比以前弱",
    sub: "My voice is weaker than it used to be",
  },
  {
    key: "i14",
    domain: "I",
    name: "我的聲音在一段時間說話後就變差",
    sub: "My voice gets worse after using it for a while",
  },
  {
    key: "i15",
    domain: "I",
    name: "說話後我的聲音會疲勞",
    sub: "My voice tires after speaking",
  },
  { key: "e1", domain: "E", name: "我感到沮喪", sub: "I feel depressed" },
  { key: "e2", domain: "E", name: "我感到焦慮", sub: "I feel anxious" },
  {
    key: "e3",
    domain: "E",
    name: "我的嗓音問題讓我感到不安",
    sub: "I am troubled by my voice problem",
  },
  {
    key: "e4",
    domain: "E",
    name: "我因嗓音問題感到窘迫",
    sub: "I feel embarrassed about my voice problem",
  },
  {
    key: "e5",
    domain: "E",
    name: "我對嗓音問題感到沮喪",
    sub: "I feel frustrated about my voice problem",
  },
  {
    key: "e6",
    domain: "E",
    name: "嗓音問題讓我感到無能為力",
    sub: "My voice problem makes me feel helpless",
  },
  {
    key: "e7",
    domain: "E",
    name: "我因嗓音問題減少社交活動",
    sub: "I socialise less because of my voice problem",
  },
  {
    key: "e8",
    domain: "E",
    name: "我因嗓音問題在公共場合感到不安",
    sub: "I feel self-conscious in public because of my voice",
  },
  {
    key: "p1",
    domain: "P",
    name: "我感覺喉嚨有黏液或痰",
    sub: "I have mucus or phlegm on my throat",
  },
  {
    key: "p2",
    domain: "P",
    name: "我需要清嗓子",
    sub: "I need to clear my throat",
  },
  {
    key: "p3",
    domain: "P",
    name: "說話時或說話後我的喉嚨會痛",
    sub: "I have a sore throat when speaking or after speaking",
  },
  {
    key: "p4",
    domain: "P",
    name: "說話時或說話後喉嚨有刺激感",
    sub: "I have an irritation in my throat when speaking",
  },
  {
    key: "p5",
    domain: "P",
    name: "我感覺喉嚨有異物感（如梅核氣）",
    sub: "I have a sensation of something in my throat",
  },
  {
    key: "p6",
    domain: "P",
    name: "我感覺聲音從喉嚨很深處發出",
    sub: "I feel my voice comes from deep in my throat",
  },
  {
    key: "p7",
    domain: "P",
    name: "我的喉嚨感到緊繃",
    sub: "My throat feels tight",
  },
];

const voissScoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 1, label: "1", desc: "幾乎不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 3, label: "3", desc: "經常" },
  { value: 4, label: "4", desc: "總是" },
];

const voissDomainDefs = {
  I: {
    name: "功能限制",
    sub: "Impairment / Limitation",
    items: 15,
    max: 60,
    color: "impair",
  },
  E: {
    name: "情緒影響",
    sub: "Emotional Impact",
    items: 8,
    max: 32,
    color: "emo",
  },
  P: {
    name: "身體症狀",
    sub: "Physical Symptoms",
    items: 7,
    max: 28,
    color: "phys",
  },
};

// ── VHI-10 Questions ──────────────────────────────────────────────
const vhiQuestions = [
  {
    key: "q1",
    name: "我的嗓音讓別人難以聽清楚我說的話",
    sub: "My voice makes it difficult for people to hear me",
    domain: "F",
  },
  {
    key: "q2",
    name: "在嘈雜環境中，別人很難聽懂我說的話",
    sub: "People have difficulty understanding me in a noisy room",
    domain: "F",
  },
  {
    key: "q3",
    name: "我的家人很難聽到我在另一個房間的聲音",
    sub: "My family has difficulty hearing me when I call them throughout the house",
    domain: "F",
  },
  {
    key: "q4",
    name: "我在工作或社交場合較少使用電話",
    sub: "I use the phone less often than I would like to",
    domain: "F",
  },
  {
    key: "q5",
    name: "因為嗓音問題，我傾向於減少外出",
    sub: "I tend to avoid groups of people because of my voice",
    domain: "E",
  },
  {
    key: "q6",
    name: "我的嗓音問題讓我覺得自己有殘缺",
    sub: "I feel handicapped by my voice problem",
    domain: "E",
  },
  {
    key: "q7",
    name: "當別人請我重複說一次時，我會感到煩躁",
    sub: "I feel annoyed when people ask me to repeat myself",
    domain: "E",
  },
  {
    key: "q8",
    name: "我的聲音讓我在說話時感到焦慮",
    sub: "I feel anxious or tense when talking with others because of my voice",
    domain: "E",
  },
  {
    key: "q9",
    name: "我的嗓音讓我覺得無能為力",
    sub: "My voice problem upsets me",
    domain: "E",
  },
  {
    key: "q10",
    name: "我的嗓音讓我在收入、工作或晉升方面蒙受損失",
    sub: "My voice problem causes me to lose income",
    domain: "F",
  },
];

const vhiScoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 1, label: "1", desc: "幾乎不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 3, label: "3", desc: "經常" },
  { value: 4, label: "4", desc: "總是" },
];

// ── GRBAS Parameters ──────────────────────────────────────────────
const grbasParameters = [
  {
    key: "G",
    name: "整體嘶啞度",
    sub: "Grade — Overall dysphonia",
    desc: "評估嗓音整體偏離正常的程度，為嗓音障礙的總體嚴重度指標",
    color: "purple",
  },
  {
    key: "R",
    name: "粗糙度",
    sub: "Roughness — Irregular voice quality",
    desc: "由聲帶不規則振動產生的嗓音不穩定感，常見於聲帶息肉、腫瘤或聲帶麻痺",
    color: "orange",
  },
  {
    key: "B",
    name: "氣息聲",
    sub: "Breathiness — Air leakage component",
    desc: "源於聲門閉合不全的漏氣聲，常見於聲帶麻痺、萎縮或聲帶溝",
    color: "blue",
  },
  {
    key: "A",
    name: "無力感",
    sub: "Asthenia — Weak voice quality",
    desc: "聲音微弱無力，音量小且音調偏低，常見於肌肉張力性發聲障礙或系統性疾病",
    color: "green",
  },
  {
    key: "S",
    name: "緊縮感",
    sub: "Strain — Hyperfunctional effort",
    desc: "聲音過度用力或緊繃感，常見於過度功能性發聲障礙或痙攣性發聲障礙",
    color: "red",
  },
];

const grbasScoreOptions = [
  { value: 0, label: "0", desc: "正常" },
  { value: 1, label: "1", desc: "輕度" },
  { value: 2, label: "2", desc: "中度" },
  { value: 3, label: "3", desc: "重度" },
];

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"voiss" | "vhi" | "grbas">("voiss");

// ── VoiSS State ──────────────────────────────────────────────────
const voissSelections = ref<Record<string, number>>(
  Object.fromEntries(voissQuestions.map((q) => [q.key, -1])),
);
const voissShowResults = ref(false);
const voissCopied = ref(false);

const voissAnsweredCount = computed(
  () => voissQuestions.filter((q) => voissSelections.value[q.key] >= 0).length,
);
const voissIsComplete = computed(() => voissAnsweredCount.value === 30);

function voissDomainScore(d: "I" | "E" | "P") {
  return voissQuestions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(voissSelections.value[q.key], 0), 0);
}

const voissScoreI = computed(() => voissDomainScore("I"));
const voissScoreE = computed(() => voissDomainScore("E"));
const voissScoreP = computed(() => voissDomainScore("P"));
const voissTotalScore = computed(
  () => voissScoreI.value + voissScoreE.value + voissScoreP.value,
);

const voissSeverity = computed(() => {
  const s = voissTotalScore.value;
  if (!voissIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${voissAnsweredCount.value}/30 題`,
    };
  if (s < 15)
    return {
      level: "正常範圍",
      color: "normal",
      advice: "嗓音症狀在正常範圍內，無顯著障礙",
    };
  if (s < 30)
    return {
      level: "輕度障礙",
      color: "mild",
      advice: "輕度嗓音症狀，建議嗓音衛教與追蹤",
    };
  if (s < 50)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "中度嗓音障礙，建議就醫評估並考慮嗓音治療",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "重度嗓音障礙，強烈建議喉科評估與積極治療",
  };
});

function voissGenerateMarkdown() {
  const sections = (["I", "E", "P"] as const)
    .map((d) => {
      const def = voissDomainDefs[d];
      const lines = voissQuestions
        .filter((q) => q.domain === d)
        .map((q) => {
          const v = voissSelections.value[q.key];
          const opt = voissScoreOptions.find((o) => o.value === v);
          return `  - ${q.name}：${v >= 0 ? `${v}（${opt?.desc}）` : "未填"}`;
        })
        .join("\n");
      const score =
        d === "I"
          ? voissScoreI.value
          : d === "E"
            ? voissScoreE.value
            : voissScoreP.value;
      return `### ${def.name}（${score} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");
  return `# VoiSS 嗓音症狀量表評估結果\n\n${sections}\n\n---\n\n## 總分：${voissTotalScore.value} / 120（${voissSeverity.value.level}）\n- 功能限制（I）：${voissScoreI.value} / 60\n- 情緒影響（E）：${voissScoreE.value} / 32\n- 身體症狀（P）：${voissScoreP.value} / 28\n\n${voissSeverity.value.advice}`;
}

async function voissCopyMarkdown() {
  await navigator.clipboard.writeText(voissGenerateMarkdown());
  voissCopied.value = true;
  setTimeout(() => (voissCopied.value = false), 2000);
}

function voissReset() {
  voissQuestions.forEach((q) => {
    voissSelections.value[q.key] = -1;
  });
  voissShowResults.value = false;
}

// ── VHI-10 State ─────────────────────────────────────────────────
const vhiSelections = ref<Record<string, number>>(
  Object.fromEntries(vhiQuestions.map((q) => [q.key, -1])),
);
const vhiShowResults = ref(false);
const vhiCopied = ref(false);

const vhiAnsweredCount = computed(
  () => vhiQuestions.filter((q) => vhiSelections.value[q.key] >= 0).length,
);
const vhiIsComplete = computed(() => vhiAnsweredCount.value === 10);

const vhiTotalScore = computed(() =>
  vhiQuestions.reduce((sum, q) => {
    const v = vhiSelections.value[q.key];
    return sum + (v >= 0 ? v : 0);
  }, 0),
);

const vhiFuncScore = computed(() =>
  vhiQuestions
    .filter((q) => q.domain === "F")
    .reduce((sum, q) => {
      const v = vhiSelections.value[q.key];
      return sum + (v >= 0 ? v : 0);
    }, 0),
);

const vhiEmoScore = computed(() =>
  vhiQuestions
    .filter((q) => q.domain === "E")
    .reduce((sum, q) => {
      const v = vhiSelections.value[q.key];
      return sum + (v >= 0 ? v : 0);
    }, 0),
);

const vhiSeverity = computed(() => {
  const s = vhiTotalScore.value;
  if (!vhiIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${vhiAnsweredCount.value}/10 題`,
    };
  if (s <= 10)
    return {
      level: "輕度障礙",
      color: "mild",
      advice: "嗓音問題對生活影響輕微",
    };
  if (s <= 20)
    return {
      level: "中度障礙",
      color: "moderate",
      advice: "嗓音問題對功能與情緒有中等程度影響，建議評估",
    };
  return {
    level: "重度障礙",
    color: "severe",
    advice: "嗓音問題嚴重影響生活與工作，強烈建議嗓音治療或手術評估",
  };
});

function vhiGenerateMarkdown() {
  const lines = vhiQuestions
    .map((q) => {
      const v = vhiSelections.value[q.key];
      const opt = vhiScoreOptions.find((o) => o.value === v);
      return `- **Q${q.key.slice(1)} [${q.domain}]** ${q.name}：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
    })
    .join("\n");
  return `# VHI-10 嗓音障礙指數評估結果\n\n## 各題評分\n\n${lines}\n\n---\n\n## 計算結果\n\n- **VHI-10 總分**：${vhiTotalScore.value} / 40\n- **功能面向（F）**：${vhiFuncScore.value} / 20\n- **情緒面向（E）**：${vhiEmoScore.value} / 20\n- **嚴重程度**：${vhiSeverity.value.level}\n- **臨床建議**：${vhiSeverity.value.advice}`;
}

async function vhiCopyMarkdown() {
  await navigator.clipboard.writeText(vhiGenerateMarkdown());
  vhiCopied.value = true;
  setTimeout(() => (vhiCopied.value = false), 2000);
}

function vhiReset() {
  vhiQuestions.forEach((q) => {
    vhiSelections.value[q.key] = -1;
  });
  vhiShowResults.value = false;
}

// ── GRBAS State ──────────────────────────────────────────────────
const grbasSelections = ref<Record<string, number>>(
  Object.fromEntries(grbasParameters.map((p) => [p.key, -1])),
);
const grbasShowResults = ref(false);
const grbasCopied = ref(false);

const grbasAnsweredCount = computed(
  () => grbasParameters.filter((p) => grbasSelections.value[p.key] >= 0).length,
);
const grbasIsComplete = computed(() => grbasAnsweredCount.value === 5);

const grbasGradeG = computed(() => grbasSelections.value["G"]);

const grbasSeverity = computed(() => {
  const g = grbasGradeG.value;
  if (g < 0)
    return {
      level: "未評分",
      color: "filling",
      advice: "請評估 G（整體嘶啞度）",
    };
  if (g === 0)
    return {
      level: "正常嗓音",
      color: "normal",
      advice: "嗓音品質在正常範圍內",
    };
  if (g === 1)
    return {
      level: "輕度嘶啞",
      color: "mild",
      advice: "輕度嗓音障礙，建議語言治療師評估",
    };
  if (g === 2)
    return {
      level: "中度嘶啞",
      color: "moderate",
      advice: "中度嗓音障礙，建議嗓音治療或進一步喉鏡評估",
    };
  return {
    level: "重度嘶啞",
    color: "severe",
    advice: "重度嗓音障礙，需積極喉科評估與介入",
  };
});

function grbasGetLabel(key: string): string {
  const v = grbasSelections.value[key];
  if (v < 0) return "—";
  return grbasScoreOptions.find((o) => o.value === v)?.desc ?? "—";
}

function grbasGenerateMarkdown() {
  const lines = grbasParameters
    .map((p) => {
      const v = grbasSelections.value[p.key];
      return `- **${p.key} — ${p.name}**（${p.sub}）：${v >= 0 ? `${v} — ${grbasGetLabel(p.key)}` : "未評分"}`;
    })
    .join("\n");
  const grbaseStr = grbasParameters
    .map((p) => {
      const v = grbasSelections.value[p.key];
      return v >= 0 ? `${p.key}${v}` : `${p.key}?`;
    })
    .join(" ");
  return `# GRBAS 嗓音品質評估結果\n\n## 各參數評分\n\n${lines}\n\n---\n\n## 評分摘要\n\n**GRBAS：${grbaseStr}**\n\n- **G（整體嘶啞度）**：${grbasSelections.value["G"] >= 0 ? grbasSelections.value["G"] : "—"} — ${grbasGetLabel("G")}\n- **整體嚴重程度**：${grbasSeverity.value.level}\n- **臨床建議**：${grbasSeverity.value.advice}`;
}

async function grbasCopyMarkdown() {
  await navigator.clipboard.writeText(grbasGenerateMarkdown());
  grbasCopied.value = true;
  setTimeout(() => (grbasCopied.value = false), 2000);
}

function grbasReset() {
  grbasParameters.forEach((p) => {
    grbasSelections.value[p.key] = -1;
  });
  grbasShowResults.value = false;
}
</script>

<template>
  <div class="dysphonia">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'voiss' }"
        @click="activeTab = 'voiss'"
      >
        <span class="tab-label">VoiSS 嗓音症狀量表</span>
        <span class="tab-sub">Voice Symptom Scale</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'vhi' }"
        @click="activeTab = 'vhi'"
      >
        <span class="tab-label">VHI-10 嗓音障礙指數</span>
        <span class="tab-sub">Voice Handicap Index-10</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'grbas' }"
        @click="activeTab = 'grbas'"
      >
        <span class="tab-label">GRBAS 嗓音品質評估</span>
        <span class="tab-sub">Grade-Roughness-Breathiness-Asthenia-Strain</span>
      </button>
    </div>

    <!-- ═══════════════════ VoiSS Panel ═══════════════════ -->
    <div v-show="activeTab === 'voiss'" class="voiss">
      <div class="voiss-header">
        <div class="header-title">
          <h2 class="title">VoiSS 嗓音症狀量表</h2>
          <p class="subtitle">Voice Symptom Scale · 過去一週嗓音症狀評估</p>
        </div>
        <div class="score-badge" :class="voissSeverity.color">
          <span class="score-number">{{
            voissIsComplete ? voissTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            voissIsComplete ? voissSeverity.level : `${voissAnsweredCount}/30`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="voissSeverity.color"
            :style="{
              width: Math.min((voissTotalScore / 120) * 100, 100) + '%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span
          ><span class="tick-threshold">15</span
          ><span class="tk-mild">30</span><span class="tk-moderate">50</span
          ><span class="tk-severe">120</span>
        </div>
      </div>

      <div class="sub-scores">
        <div class="sub-pill impair-pill">
          <span class="sub-label">功能限制（I）</span>
          <span class="sub-val">{{ voissScoreI }} / 60</span>
        </div>
        <div class="sub-pill emo-pill">
          <span class="sub-label">情緒影響（E）</span>
          <span class="sub-val">{{ voissScoreE }} / 32</span>
        </div>
        <div class="sub-pill phys-pill">
          <span class="sub-label">身體症狀（P）</span>
          <span class="sub-val">{{ voissScoreP }} / 28</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據<strong>過去一週</strong>嗓音問題對您的影響頻率作答。每題
          0（從不）至 4（總是），共 30 題，總分 0–120 分。</span
        >
      </div>

      <div
        v-for="domainKey in ['I', 'E', 'P'] as const"
        :key="domainKey"
        class="voiss-group"
      >
        <div
          class="group-header"
          :class="voissDomainDefs[domainKey].color + '-header'"
        >
          <div class="group-label-block">
            <span class="group-label">{{
              voissDomainDefs[domainKey].name
            }}</span>
            <span class="group-sub"
              >{{ voissDomainDefs[domainKey].sub }} ·
              {{ voissDomainDefs[domainKey].items }} 題</span
            >
          </div>
          <div
            class="group-score-pill"
            :class="voissDomainDefs[domainKey].color + '-pill'"
          >
            {{
              domainKey === "I"
                ? voissScoreI
                : domainKey === "E"
                  ? voissScoreE
                  : voissScoreP
            }}
            / {{ voissDomainDefs[domainKey].max }}
          </div>
        </div>

        <div class="item-list">
          <div
            v-for="q in voissQuestions.filter((q) => q.domain === domainKey)"
            :key="q.key"
            class="voiss-item"
            :class="{
              answered: voissSelections[q.key] >= 0,
              high: voissSelections[q.key] >= 3,
              [voissDomainDefs[domainKey].color]: voissSelections[q.key] >= 0,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span
                  class="item-qnum"
                  :class="voissDomainDefs[domainKey].color + '-qnum'"
                  >Q{{ voissQuestions.indexOf(q) + 1 }}</span
                >
                <span
                  class="domain-tag"
                  :class="voissDomainDefs[domainKey].color + '-tag'"
                  >{{ domainKey }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: voissSelections[q.key] === 0,
                  unanswered: voissSelections[q.key] < 0,
                  high: voissSelections[q.key] >= 3,
                }"
                >{{
                  voissSelections[q.key] >= 0 ? voissSelections[q.key] : "—"
                }}</span
              >
            </div>

            <div class="option-row">
              <label
                v-for="opt in voissScoreOptions"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: voissSelections[q.key] === opt.value,
                  high: opt.value >= 3 && voissSelections[q.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'voiss-' + q.key"
                  :value="opt.value"
                  v-model="voissSelections[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="voiss-result" :class="voissSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            voissIsComplete ? voissTotalScore : "—"
          }}</span>
          <span class="result-max">/ 120</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ voissSeverity.level }}</span>
          <span class="result-advice">{{ voissSeverity.advice }}</span>
          <div class="result-breakdown">
            <span class="breakdown-pill impair-pill-sm"
              >I：{{ voissScoreI }}</span
            >
            <span class="breakdown-pill emo-pill-sm">E：{{ voissScoreE }}</span>
            <span class="breakdown-pill phys-pill-sm"
              >P：{{ voissScoreP }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="voissShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="domainKey in ['I', 'E', 'P'] as const" :key="domainKey">
          <div
            class="detail-section-title"
            :class="voissDomainDefs[domainKey].color + '-section'"
          >
            {{ voissDomainDefs[domainKey].name }}（{{
              domainKey === "I"
                ? voissScoreI
                : domainKey === "E"
                  ? voissScoreE
                  : voissScoreP
            }}
            / {{ voissDomainDefs[domainKey].max }} 分）
          </div>
          <div
            v-for="q in voissQuestions.filter((q) => q.domain === domainKey)"
            :key="q.key"
            class="detail-row"
          >
            <span class="detail-qnum"
              >Q{{ voissQuestions.indexOf(q) + 1 }}</span
            >
            <span class="detail-domain">{{ q.name }}</span>
            <span
              class="detail-score"
              :class="{
                zero: voissSelections[q.key] === 0,
                high: voissSelections[q.key] >= 3,
                brand: voissSelections[q.key] > 0 && voissSelections[q.key] < 3,
              }"
              >{{
                voissSelections[q.key] >= 0 ? voissSelections[q.key] : "—"
              }}</span
            >
            <span class="detail-desc">{{
              voissSelections[q.key] >= 0
                ? voissScoreOptions.find(
                    (o) => o.value === voissSelections[q.key],
                  )?.desc
                : "未填"
            }}</span>
          </div>
        </div>
      </div>

      <div class="voiss-actions">
        <button class="btn-view" @click="voissShowResults = !voissShowResults">
          {{ voissShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="voissCopyMarkdown">
          {{ voissCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="voissReset">重置</button>
      </div>
      <p v-if="!voissIsComplete" class="progress-hint">
        已完成 {{ voissAnsweredCount }}/30 題，尚餘
        {{ 30 - voissAnsweredCount }} 題
      </p>
    </div>

    <!-- ═══════════════════ VHI-10 Panel ═══════════════════ -->
    <div v-show="activeTab === 'vhi'" class="vhi">
      <div class="vhi-header">
        <div class="header-title">
          <h2 class="title">VHI-10 嗓音障礙指數</h2>
          <p class="subtitle">
            Voice Handicap Index–10 · 嗓音問題對生活的主觀影響
          </p>
        </div>
        <div class="score-badge" :class="vhiSeverity.color">
          <span class="score-number">{{
            vhiIsComplete ? vhiTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            vhiIsComplete ? vhiSeverity.level : `${vhiAnsweredCount}/10`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="vhiSeverity.color"
            :style="{ width: (vhiTotalScore / 40) * 100 + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-mild">0</span
          ><span class="tick-threshold">10</span
          ><span class="tk-moderate">20</span><span class="tk-severe">30</span
          ><span class="tk-severe">40</span>
        </div>
      </div>

      <div class="sub-scores">
        <div class="sub-pill func-pill">
          <span class="sub-label">功能（F）</span>
          <span class="sub-val">{{ vhiFuncScore }} / 20</span>
        </div>
        <div class="sub-pill emo-pill">
          <span class="sub-label">情緒（E）</span>
          <span class="sub-val">{{ vhiEmoScore }} / 20</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據嗓音問題對您日常生活的實際影響作答。每題 0（從不）至
          4（總是），共 10 題，總分 0–40
          分。分數越高，嗓音障礙對生活影響越大。</span
        >
      </div>

      <div
        v-for="domainInfo in [
          {
            key: 'F',
            label: '功能面向',
            sub: 'Functional Domain',
            color: 'func',
          },
          {
            key: 'E',
            label: '情緒面向',
            sub: 'Emotional Domain',
            color: 'emo',
          },
        ]"
        :key="domainInfo.key"
        class="vhi-group"
      >
        <div class="group-header" :class="domainInfo.color + '-header'">
          <div class="group-label-block">
            <span class="group-label">{{ domainInfo.label }}</span>
            <span class="group-sub">{{ domainInfo.sub }}</span>
          </div>
          <div class="group-score-pill" :class="domainInfo.color + '-pill'">
            {{ domainInfo.key === "F" ? vhiFuncScore : vhiEmoScore }} / 20
          </div>
        </div>

        <div class="item-list">
          <div
            v-for="q in vhiQuestions.filter((q) => q.domain === domainInfo.key)"
            :key="q.key"
            class="vhi-item"
            :class="{
              answered: vhiSelections[q.key] >= 0,
              high: vhiSelections[q.key] >= 3,
              [domainInfo.color]: vhiSelections[q.key] >= 0,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span class="item-qnum" :class="domainInfo.color + '-qnum'"
                  >Q{{ q.key.slice(1) }}</span
                >
                <span class="domain-tag" :class="domainInfo.color">{{
                  domainInfo.key
                }}</span>
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: vhiSelections[q.key] === 0,
                  unanswered: vhiSelections[q.key] < 0,
                  high: vhiSelections[q.key] >= 3,
                }"
                >{{
                  vhiSelections[q.key] >= 0 ? vhiSelections[q.key] : "—"
                }}</span
              >
            </div>

            <div class="option-row">
              <label
                v-for="opt in vhiScoreOptions"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: vhiSelections[q.key] === opt.value,
                  high: opt.value >= 3 && vhiSelections[q.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'vhi-' + q.key"
                  :value="opt.value"
                  v-model="vhiSelections[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="vhi-result" :class="vhiSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            vhiIsComplete ? vhiTotalScore : "—"
          }}</span>
          <span class="result-max">/ 40</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ vhiSeverity.level }}</span>
          <span class="result-advice">{{ vhiSeverity.advice }}</span>
          <div class="result-breakdown">
            <span class="breakdown-pill func-pill"
              >功能 F：{{ vhiFuncScore }}</span
            >
            <span class="breakdown-pill emo-pill"
              >情緒 E：{{ vhiEmoScore }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="vhiShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div class="detail-section-title func-section">
          功能面向（Functional Domain）— {{ vhiFuncScore }} / 20
        </div>
        <div
          v-for="q in vhiQuestions.filter((q) => q.domain === 'F')"
          :key="q.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: vhiSelections[q.key] === 0,
              high: vhiSelections[q.key] >= 3,
              brand: vhiSelections[q.key] > 0 && vhiSelections[q.key] < 3,
            }"
            >{{ vhiSelections[q.key] >= 0 ? vhiSelections[q.key] : "—" }}</span
          >
          <span class="detail-desc">{{
            vhiSelections[q.key] >= 0
              ? vhiScoreOptions.find((o) => o.value === vhiSelections[q.key])
                  ?.desc
              : "未填"
          }}</span>
        </div>
        <div class="detail-section-title emo-section">
          情緒面向（Emotional Domain）— {{ vhiEmoScore }} / 20
        </div>
        <div
          v-for="q in vhiQuestions.filter((q) => q.domain === 'E')"
          :key="q.key"
          class="detail-row"
        >
          <span class="detail-qnum">Q{{ q.key.slice(1) }}</span>
          <span class="detail-domain">{{ q.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: vhiSelections[q.key] === 0,
              high: vhiSelections[q.key] >= 3,
              brand: vhiSelections[q.key] > 0 && vhiSelections[q.key] < 3,
            }"
            >{{ vhiSelections[q.key] >= 0 ? vhiSelections[q.key] : "—" }}</span
          >
          <span class="detail-desc">{{
            vhiSelections[q.key] >= 0
              ? vhiScoreOptions.find((o) => o.value === vhiSelections[q.key])
                  ?.desc
              : "未填"
          }}</span>
        </div>
      </div>

      <div class="vhi-actions">
        <button class="btn-view" @click="vhiShowResults = !vhiShowResults">
          {{ vhiShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="vhiCopyMarkdown">
          {{ vhiCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="vhiReset">重置</button>
      </div>
      <p v-if="!vhiIsComplete" class="progress-hint">
        已完成 {{ vhiAnsweredCount }}/10 題，尚餘 {{ 10 - vhiAnsweredCount }} 題
      </p>
    </div>

    <!-- ═══════════════════ GRBAS Panel ═══════════════════ -->
    <div v-show="activeTab === 'grbas'" class="grbas">
      <div class="grbas-header">
        <div class="header-title">
          <h2 class="title">GRBAS 嗓音品質評估</h2>
          <p class="subtitle">Voice Quality Assessment · 聽知覺嗓音分析</p>
        </div>
        <div class="score-badge" :class="grbasSeverity.color">
          <span class="score-number grbas-label">
            <span
              v-for="p in grbasParameters"
              :key="p.key"
              class="grbas-letter"
              :class="[p.color, { scored: grbasSelections[p.key] >= 0 }]"
              >{{ p.key
              }}<sub :class="{ shown: grbasSelections[p.key] >= 0 }">{{
                grbasSelections[p.key] >= 0 ? grbasSelections[p.key] : "0"
              }}</sub></span
            >
          </span>
          <span class="score-label">{{ grbasSeverity.level }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="grbasSeverity.color"
            :style="{
              width: grbasGradeG >= 0 ? (grbasGradeG / 3) * 100 + '%' : '0%',
            }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">G0 正常</span
          ><span class="tk-mild">G1 輕度</span
          ><span class="tk-moderate">G2 中度</span
          ><span class="tk-severe">G3 重度</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >GRBAS
          由有經驗的臨床醫師或語言治療師依據<strong>聽知覺評估</strong>評分。每個參數
          0（正常）至 3（重度），五個參數均需獨立評分。</span
        >
      </div>

      <div class="grbas-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">嗓音品質五參數</span>
            <span class="group-sub"
              >Five Perceptual Parameters of Voice Quality</span
            >
          </div>
          <div class="group-score-pill">{{ grbasAnsweredCount }}/5 項</div>
        </div>

        <div class="item-list">
          <div
            v-for="p in grbasParameters"
            :key="p.key"
            class="grbas-item"
            :class="{
              answered: grbasSelections[p.key] >= 0,
              high: grbasSelections[p.key] >= 2,
            }"
          >
            <div class="item-header">
              <div class="item-left">
                <span class="param-key" :class="p.color">{{ p.key }}</span>
                <div class="item-name-block">
                  <span class="item-name">{{ p.name }}</span>
                  <span class="item-sub">{{ p.sub }}</span>
                </div>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: grbasSelections[p.key] === 0,
                  unanswered: grbasSelections[p.key] < 0,
                  high: grbasSelections[p.key] >= 2,
                }"
                >{{
                  grbasSelections[p.key] >= 0 ? grbasSelections[p.key] : "—"
                }}</span
              >
            </div>

            <div class="item-desc-row">
              <span class="item-desc">{{ p.desc }}</span>
            </div>

            <div class="option-row grbas-option-row">
              <label
                v-for="opt in grbasScoreOptions"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: grbasSelections[p.key] === opt.value,
                  high: opt.value >= 2 && grbasSelections[p.key] === opt.value,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'grbas-' + p.key"
                  :value="opt.value"
                  v-model="grbasSelections[p.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="grbas-summary-card">
        <div class="summary-label">GRBAS 評分摘要</div>
        <div class="summary-string">
          <span v-for="p in grbasParameters" :key="p.key" class="summary-param">
            <span class="sp-key" :class="p.color">{{ p.key }}</span>
            <span
              class="sp-val"
              :class="{ unset: grbasSelections[p.key] < 0 }"
              >{{
                grbasSelections[p.key] >= 0 ? grbasSelections[p.key] : "?"
              }}</span
            >
          </span>
        </div>
        <div class="summary-advice">{{ grbasSeverity.advice }}</div>
      </div>

      <div v-if="grbasShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="p in grbasParameters" :key="p.key" class="detail-row">
          <span class="detail-key" :class="p.color">{{ p.key }}</span>
          <span class="detail-domain">{{ p.name }}</span>
          <span
            class="detail-score"
            :class="{
              zero: grbasSelections[p.key] === 0,
              high: grbasSelections[p.key] >= 2,
              brand: grbasSelections[p.key] === 1,
            }"
            >{{
              grbasSelections[p.key] >= 0 ? grbasSelections[p.key] : "—"
            }}</span
          >
          <span class="detail-desc">{{ grbasGetLabel(p.key) }}</span>
        </div>
      </div>

      <div class="grbas-actions">
        <button class="btn-view" @click="grbasShowResults = !grbasShowResults">
          {{ grbasShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="grbasCopyMarkdown">
          {{ grbasCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="grbasReset">重置</button>
      </div>
      <p v-if="!grbasIsComplete" class="progress-hint">
        已完成 {{ grbasAnsweredCount }}/5 項
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Dysphonia Layout & Tab Bar
   ================================================================== */
.dysphonia {
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
   Shared — VoiSS, VHI-10 & GRBAS panels
   ================================================================== */
.voiss,
.vhi,
.grbas {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

/* ── Header ────────────────────────────────────────────────────── */
.voiss-header,
.vhi-header,
.grbas-header {
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
  width: 80px;
  min-width: unset;
  padding: 0.6rem 1rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}

.grbas .score-badge {
  width: unset;
  min-width: 120px;
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

/* ── Sub-scores ────────────────────────────────────────────────── */
.sub-scores {
  display: flex;
  gap: 0.6rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.sub-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 5px 14px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.sub-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-2);
}
.sub-val {
  font-size: 0.82rem;
  font-weight: 800;
}

/* VoiSS sub-pill accents */
.voiss .impair-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.voiss .impair-pill .sub-val {
  color: #6366f1;
}
.voiss .emo-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.voiss .emo-pill .sub-val {
  color: #14b8a6;
}
.voiss .phys-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.voiss .phys-pill .sub-val {
  color: #f97316;
}

/* VHI-10 sub-pill accents */
.vhi .func-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.vhi .func-pill .sub-val {
  color: #6366f1;
}
.vhi .emo-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.vhi .emo-pill .sub-val {
  color: #14b8a6;
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
.voiss-group,
.vhi-group,
.grbas-group {
  margin-bottom: 1.75rem;
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
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
  border: 1px solid var(--vp-c-divider);
}

/* VoiSS group accents */
.group-header.impair-header {
  background: linear-gradient(
    135deg,
    #eef2ff,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.group-header.emo-header {
  background: linear-gradient(
    135deg,
    #ecfdf5,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.group-header.phys-header {
  background: linear-gradient(
    135deg,
    #fff7ed,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}

.group-score-pill.impair-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}
.group-score-pill.phys-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}

/* VHI-10 group accents */
.vhi .group-header.func-header {
  background: linear-gradient(
    135deg,
    #eef2ff,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #6366f1;
  box-shadow: 0 1px 3px rgba(99, 102, 241, 0.06);
}
.vhi .group-header.emo-header {
  background: linear-gradient(
    135deg,
    #ecfdf5,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #14b8a6;
  box-shadow: 0 1px 3px rgba(20, 184, 166, 0.06);
}
.vhi .group-score-pill.func-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.vhi .group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}

/* GRBAS group accent */
.grbas .group-header {
  background: linear-gradient(
    135deg,
    #fff7ed,
    var(--vp-c-bg-mute),
    var(--vp-c-bg-soft)
  );
  border-left: 4px solid #f97316;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.06);
}
.grbas .group-score-pill {
  border: 1px solid rgba(249, 115, 22, 0.25);
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}

/* ── Item list ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* Items (common structure) */
.voiss-item,
.vhi-item,
.grbas-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.voiss-item:hover,
.vhi-item:hover,
.grbas-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.voiss-item.answered,
.vhi-item.answered,
.grbas-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.voiss-item.high,
.vhi-item.high,
.grbas-item.high {
  border-color: rgba(249, 115, 22, 0.25) !important;
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  ) !important;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

/* VoiSS answered domain color overrides */
.voiss-item.answered.impair {
  border-color: rgba(99, 102, 241, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(99, 102, 241, 0.03)
  );
}
.voiss-item.answered.emo {
  border-color: rgba(20, 184, 166, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(20, 184, 166, 0.03)
  );
}
.voiss-item.answered.phys {
  border-color: rgba(249, 115, 22, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.03)
  );
}

/* VHI-10 answered domain color overrides */
.vhi-item.answered.func {
  border-color: rgba(99, 102, 241, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(99, 102, 241, 0.03)
  );
}
.vhi-item.answered.emo {
  border-color: rgba(20, 184, 166, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(20, 184, 166, 0.03)
  );
}

.item-header {
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
  gap: 4px;
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
.item-score.unanswered {
  color: var(--vp-c-text-3);
  border-color: var(--vp-c-divider);
  background: transparent;
}
.item-score.high {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.3);
  background: rgba(249, 115, 22, 0.08);
}

/* ── Item-qnum — accent per domain ────────────────────────────── */
.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
/* VoiSS qnum accents */
.item-qnum.impair-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.item-qnum.emo-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.item-qnum.phys-qnum {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.voiss-item.high .item-qnum {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 1px 3px rgba(239, 68, 68, 0.3);
}
/* VHI-10 qnum accents */
.vhi .item-qnum.func-qnum {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
}
.vhi .item-qnum.emo-qnum {
  background: linear-gradient(135deg, #14b8a6, #0d9488);
}
.vhi-item.high .item-qnum {
  background: linear-gradient(135deg, #f97316, #ef4444) !important;
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

/* ── Domain tag ────────────────────────────────────────────────── */
.domain-tag {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 4px;
}
.domain-tag.impair-tag {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.domain-tag.emo-tag {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.domain-tag.phys-tag {
  background: rgba(249, 115, 22, 0.12);
  color: #f97316;
}
.vhi .domain-tag.func {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.vhi .domain-tag.emo {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}

/* ── GRBAS param-key ────────────────────────────────────────────── */
.param-key {
  font-size: 1.1rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}
.param-key.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.param-key.orange {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.param-key.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.param-key.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.param-key.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}
.grbas-item.high .param-key {
  box-shadow: 0 1px 3px rgba(249, 115, 22, 0.3);
}

.item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

/* ── GRBAS item desc ────────────────────────────────────────────── */
.item-desc-row {
  padding: 0.5rem 0.9rem 0.2rem 3.5rem;
}
.item-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

/* ── Option row ─────────────────────────────────────────────────── */
.option-row {
  display: grid;
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}
.voiss .option-row,
.vhi .option-row {
  grid-template-columns: repeat(5, 1fr);
}
.grbas-option-row {
  grid-template-columns: repeat(4, 1fr);
}

.opt-pill {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.55rem 0.1rem;
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

/* ── Opt-pill score colors — VoiSS & VHI-10 ────────────────────── */
.voiss .opt-pill.s0,
.vhi .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.voiss .opt-pill.s0:hover:not(.active),
.vhi .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.voiss .opt-pill.s0.active,
.vhi .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.voiss .opt-pill.s1,
.vhi .opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.voiss .opt-pill.s1:hover:not(.active),
.vhi .opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.voiss .opt-pill.s1.active,
.vhi .opt-pill.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.voiss .opt-pill.s2,
.vhi .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.voiss .opt-pill.s2:hover:not(.active),
.vhi .opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.voiss .opt-pill.s2.active,
.vhi .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.voiss .opt-pill.s3,
.vhi .opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.voiss .opt-pill.s3:hover:not(.active),
.vhi .opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.voiss .opt-pill.s3.active,
.vhi .opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.voiss .opt-pill.s4,
.vhi .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.voiss .opt-pill.s4:hover:not(.active),
.vhi .opt-pill.s4:hover:not(.active) {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.voiss .opt-pill.s4.active,
.vhi .opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}

/* ── Opt-pill score colors — GRBAS (4 options) ─────────────────── */
.grbas .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.grbas .opt-pill.s0:hover:not(.active) {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.grbas .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.grbas .opt-pill.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.grbas .opt-pill.s1:hover:not(.active) {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.grbas .opt-pill.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.grbas .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.grbas .opt-pill.s2:hover:not(.active) {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.grbas .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.grbas .opt-pill.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.grbas .opt-pill.s3:hover:not(.active) {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.grbas .opt-pill.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}

/* ── Opt-num & Opt-desc ─────────────────────────────────────────── */
.opt-num {
  font-size: 1rem;
  font-weight: 900;
  transition: color 0.2s;
}
.opt-desc {
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.2;
  transition: color 0.2s;
}

.voiss .opt-pill.s0 .opt-num,
.vhi .opt-pill.s0 .opt-num,
.grbas .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.voiss .opt-pill.s0.active .opt-num,
.vhi .opt-pill.s0.active .opt-num,
.grbas .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.voiss .opt-pill.s1 .opt-num,
.vhi .opt-pill.s1 .opt-num,
.grbas .opt-pill.s1 .opt-num {
  color: rgba(132, 204, 22, 0.85);
}
.voiss .opt-pill.s1.active .opt-num,
.vhi .opt-pill.s1.active .opt-num,
.grbas .opt-pill.s1.active .opt-num {
  color: #84cc16;
}
.voiss .opt-pill.s2 .opt-num,
.vhi .opt-pill.s2 .opt-num,
.grbas .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.voiss .opt-pill.s2.active .opt-num,
.vhi .opt-pill.s2.active .opt-num,
.grbas .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.voiss .opt-pill.s3 .opt-num,
.vhi .opt-pill.s3 .opt-num,
.grbas .opt-pill.s3 .opt-num {
  color: rgba(245, 158, 11, 0.85);
}
.voiss .opt-pill.s3.active .opt-num,
.vhi .opt-pill.s3.active .opt-num,
.grbas .opt-pill.s3.active .opt-num {
  color: #f59e0b;
}
.voiss .opt-pill.s4 .opt-num,
.vhi .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.voiss .opt-pill.s4.active .opt-num,
.vhi .opt-pill.s4.active .opt-num {
  color: #f97316;
}

.voiss .opt-pill.s0 .opt-desc,
.vhi .opt-pill.s0 .opt-desc,
.grbas .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.voiss .opt-pill.s0.active .opt-desc,
.vhi .opt-pill.s0.active .opt-desc,
.grbas .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.voiss .opt-pill.s1 .opt-desc,
.vhi .opt-pill.s1 .opt-desc,
.grbas .opt-pill.s1 .opt-desc {
  color: rgba(132, 204, 22, 0.7);
}
.voiss .opt-pill.s1.active .opt-desc,
.vhi .opt-pill.s1.active .opt-desc,
.grbas .opt-pill.s1.active .opt-desc {
  color: rgba(132, 204, 22, 0.9);
}
.voiss .opt-pill.s2 .opt-desc,
.vhi .opt-pill.s2 .opt-desc,
.grbas .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.voiss .opt-pill.s2.active .opt-desc,
.vhi .opt-pill.s2.active .opt-desc,
.grbas .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.voiss .opt-pill.s3 .opt-desc,
.vhi .opt-pill.s3 .opt-desc,
.grbas .opt-pill.s3 .opt-desc {
  color: rgba(245, 158, 11, 0.7);
}
.voiss .opt-pill.s3.active .opt-desc,
.vhi .opt-pill.s3.active .opt-desc,
.grbas .opt-pill.s3.active .opt-desc {
  color: rgba(245, 158, 11, 0.9);
}
.voiss .opt-pill.s4 .opt-desc,
.vhi .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.voiss .opt-pill.s4.active .opt-desc,
.vhi .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

/* ── Result card — VoiSS ──────────────────────────────────────── */
.voiss-result,
.vhi-result {
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
.voiss-result.normal,
.vhi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.mild,
.vhi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.moderate,
.vhi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.voiss-result.severe,
.vhi-result.severe {
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
.voiss-result.normal .result-number,
.vhi-result.normal .result-number {
  color: #22c55e;
}
.voiss-result.mild .result-number,
.vhi-result.mild .result-number {
  color: #f59e0b;
}
.voiss-result.moderate .result-number,
.vhi-result.moderate .result-number {
  color: #f97316;
}
.voiss-result.severe .result-number,
.vhi-result.severe .result-number {
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
.result-advice {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--vp-c-text-1);
  line-height: 1.5;
}
.result-breakdown {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.breakdown-pill {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}

/* VoiSS breakdown pills */
.impair-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.emo-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.phys-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}

/* VHI-10 breakdown pills */
.vhi .func-pill {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.vhi .emo-pill {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}

/* ── GRBAS summary card ────────────────────────────────────────── */
.grbas-summary-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: linear-gradient(135deg, var(--vp-c-bg-soft), var(--vp-c-bg-mute));
  margin-bottom: 1rem;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.summary-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  flex-shrink: 0;
}
.summary-string {
  display: flex;
  gap: 0.75rem;
  align-items: baseline;
  flex: 1;
}
.summary-param {
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.sp-key {
  font-size: 1.1rem;
  font-weight: 900;
}
.sp-key.purple {
  color: #8b5cf6;
}
.sp-key.orange {
  color: #f97316;
}
.sp-key.blue {
  color: #3b82f6;
}
.sp-key.green {
  color: #22c55e;
}
.sp-key.red {
  color: #ef4444;
}
.sp-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.sp-val.unset {
  color: var(--vp-c-text-3);
}
.summary-advice {
  font-size: 0.78rem;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

/* ── GRBAS label in score-badge ─────────────────────────────────── */
.grbas-label {
  display: flex;
  gap: 4px;
  align-items: baseline;
  justify-content: center;
  font-size: 1.3rem;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
}
.grbas-letter {
  font-weight: 800;
  transition: color 0.2s;
  color: var(--vp-c-text-3);
}
.grbas-letter sub {
  font-size: 0.55em;
  visibility: hidden;
  vertical-align: baseline;
  line-height: 1;
}
.grbas-letter sub.shown {
  visibility: visible;
}
.grbas-letter.scored.purple {
  color: #8b5cf6;
}
.grbas-letter.scored.orange {
  color: #f97316;
}
.grbas-letter.scored.blue {
  color: #3b82f6;
}
.grbas-letter.scored.green {
  color: #22c55e;
}
.grbas-letter.scored.red {
  color: #ef4444;
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
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  border-bottom: 1px solid var(--vp-c-divider);
}
/* VoiSS section accents */
.impair-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.phys-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
/* VHI-10 section accents */
.vhi .func-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.vhi .emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
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

/* GRBAS detail-key */
.detail-key {
  font-size: 1rem;
  font-weight: 900;
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  color: #fff;
}
.detail-key.purple {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}
.detail-key.orange {
  background: linear-gradient(135deg, #f97316, #ea580c);
}
.detail-key.blue {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
}
.detail-key.green {
  background: linear-gradient(135deg, #22c55e, #16a34a);
}
.detail-key.red {
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

/* total-row */
.total-row {
  background: linear-gradient(135deg, var(--vp-c-bg-mute), var(--vp-c-bg-soft));
  font-weight: 800;
}

/* ── Actions ────────────────────────────────────────────────────── */
.voiss-actions,
.vhi-actions,
.grbas-actions {
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

/* ── Responsive ─────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .voiss-header,
  .vhi-header,
  .grbas-header {
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
  .voiss-result,
  .vhi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
  .grbas-summary-card {
    flex-direction: column;
    gap: 0.5rem;
  }
  .grbas-header .grbas-label {
    font-size: 1.1rem;
  }
}
</style>
