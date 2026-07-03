<script setup lang="ts">
import { ref, computed } from "vue";

// ── THI Questions ─────────────────────────────────────────────────
const thiQuestions = [
  {
    key: "f1",
    domain: "F",
    name: "因為耳鳴，您在集中注意力上有困難嗎？",
    sub: "Because of your tinnitus, is it difficult for you to concentrate?",
    hint: "耳鳴聲是否干擾您的專注與思考能力",
  },
  {
    key: "f2",
    domain: "F",
    name: "耳鳴的聲音是否使您難以聽清楚別人說話？",
    sub: "Does the loudness of your tinnitus make it difficult for you to hear people?",
    hint: "耳鳴對語音辨識與溝通的干擾",
  },
  {
    key: "e3",
    domain: "E",
    name: "耳鳴是否讓您感到憤怒？",
    sub: "Does your tinnitus make you angry?",
    hint: "耳鳴引起的情緒反應——憤怒與煩躁感",
  },
  {
    key: "f4",
    domain: "F",
    name: "耳鳴是否讓您感到困惑？",
    sub: "Does your tinnitus make you feel confused?",
    hint: "耳鳴對認知清晰度的影響",
  },
  {
    key: "c5",
    domain: "C",
    name: "因為耳鳴，您是否感到絕望？",
    sub: "Because of your tinnitus, do you feel desperate?",
    hint: "對耳鳴無法改善的無望感",
  },
  {
    key: "e6",
    domain: "E",
    name: "您是否常抱怨耳鳴？",
    sub: "Do you complain a great deal about your tinnitus?",
    hint: "耳鳴對日常情緒表達的影響",
  },
  {
    key: "f7",
    domain: "F",
    name: "因為耳鳴，您在夜間入睡上有困難嗎？",
    sub: "Because of your tinnitus, do you have trouble falling asleep at night?",
    hint: "耳鳴對睡眠入眠的干擾",
  },
  {
    key: "c8",
    domain: "C",
    name: "您是否感到無法擺脫耳鳴？",
    sub: "Do you feel as though you cannot escape your tinnitus?",
    hint: "對耳鳴的無力感與逃脫感",
  },
  {
    key: "f9",
    domain: "F",
    name: "耳鳴是否影響您享受社交活動（如外出聚餐或活動）？",
    sub: "Does your tinnitus interfere with your ability to enjoy social activities?",
    hint: "耳鳴對社交參與的影響",
  },
  {
    key: "e10",
    domain: "E",
    name: "因為耳鳴，您是否感到沮喪？",
    sub: "Because of your tinnitus, do you feel frustrated?",
    hint: "耳鳴帶來的挫折與沮喪情緒",
  },
  {
    key: "c11",
    domain: "C",
    name: "因為耳鳴，您是否認為自己患有嚴重疾病？",
    sub: "Because of your tinnitus, do you feel that you have a terrible disease?",
    hint: "對耳鳴的災難化認知（Catastrophizing）",
  },
  {
    key: "f12",
    domain: "F",
    name: "耳鳴是否使您享受生活的樂趣變得困難？",
    sub: "Does your tinnitus make it difficult for you to enjoy life?",
    hint: "耳鳴對整體生活品質與享樂能力的影響",
  },
  {
    key: "f13",
    domain: "F",
    name: "耳鳴是否影響您的工作或家務表現？",
    sub: "Does your tinnitus interfere with your job or household duties?",
    hint: "耳鳴對職業功能與家庭責任的干擾",
  },
  {
    key: "e14",
    domain: "E",
    name: "因為耳鳴，您是否常常感到煩躁？",
    sub: "Because of your tinnitus, do you find that you are often irritable?",
    hint: "耳鳴引起的持續性煩躁情緒",
  },
  {
    key: "f15",
    domain: "F",
    name: "因為耳鳴，您在閱讀上是否有困難？",
    sub: "Because of your tinnitus, is it difficult for you to read?",
    hint: "耳鳴對閱讀專注力的干擾",
  },
  {
    key: "e16",
    domain: "E",
    name: "耳鳴是否讓您感到心情低落？",
    sub: "Does your tinnitus make you upset?",
    hint: "耳鳴引起的情緒低落與不悅感",
  },
  {
    key: "e17",
    domain: "E",
    name: "您是否覺得耳鳴給您的家庭關係或夫妻關係帶來了壓力？",
    sub: "Do you feel that your tinnitus problem has placed stress on your relationships with members of your family and friends?",
    hint: "耳鳴對家庭關係與人際互動的影響",
  },
  {
    key: "f18",
    domain: "F",
    name: "您是否難以將注意力從耳鳴轉移到其他事物上？",
    sub: "Do you find it difficult to focus your attention away from your tinnitus and on to other things?",
    hint: "注意力控制困難——無法忽視耳鳴",
  },
  {
    key: "c19",
    domain: "C",
    name: "您是否感到無法控制耳鳴？",
    sub: "Do you feel that you have no control over your tinnitus?",
    hint: "對耳鳴的控制感喪失",
  },
  {
    key: "f20",
    domain: "F",
    name: "因為耳鳴，您是否常感到疲勞？",
    sub: "Because of your tinnitus, do you often feel tired?",
    hint: "耳鳴導致的認知疲勞與身體疲憊感",
  },
  {
    key: "e21",
    domain: "E",
    name: "因為耳鳴，您是否感到憂鬱？",
    sub: "Because of your tinnitus, do you feel depressed?",
    hint: "耳鳴引起的情緒憂鬱症狀",
  },
  {
    key: "e22",
    domain: "E",
    name: "耳鳴是否使您感到焦慮？",
    sub: "Does your tinnitus make you feel anxious?",
    hint: "耳鳴引發的焦慮情緒",
  },
  {
    key: "c23",
    domain: "C",
    name: "您是否覺得無法再忍受耳鳴？",
    sub: "Do you feel that you can no longer cope with your tinnitus?",
    hint: "對耳鳴忍受能力的極限感",
  },
  {
    key: "f24",
    domain: "F",
    name: "耳鳴是否在您有壓力時加劇？",
    sub: "Does your tinnitus get worse when you are under stress?",
    hint: "壓力與耳鳴嚴重度的交互關係",
  },
  {
    key: "e25",
    domain: "E",
    name: "耳鳴是否讓您感到不安全？",
    sub: "Does your tinnitus make you feel insecure?",
    hint: "耳鳴對安全感與自信的影響",
  },
];

const thiDomainDefs = {
  F: { name: "功能面向", sub: "Functional", color: "func", items: 11, max: 44 },
  E: { name: "情緒面向", sub: "Emotional", color: "emo", items: 9, max: 36 },
  C: {
    name: "災難化面向",
    sub: "Catastrophic",
    color: "cat",
    items: 5,
    max: 20,
  },
};

const thiScoreOptions = [
  { value: 0, label: "0", desc: "從不" },
  { value: 2, label: "2", desc: "有時" },
  { value: 4, label: "4", desc: "總是" },
];

const thiQIndex = (() => {
  const map: Record<string, number> = {};
  thiQuestions.forEach((q, i) => {
    map[q.key] = i + 1;
  });
  return map;
})();

// ── TFI Questions ─────────────────────────────────────────────────
const tfiQuestions = [
  {
    key: "i1",
    sub: "I",
    name: "過去一週，耳鳴出現的時間有多少比例？",
    sub_en:
      "Over the past week, what percentage of your time awake were you aware of your tinnitus?",
    hint: "評估耳鳴的出現頻率（0% = 完全沒有，100% = 一直出現）",
    anchor_lo: "0% 沒有",
    anchor_hi: "100% 一直",
  },
  {
    key: "i2",
    sub: "I",
    name: "過去一週，耳鳴有多嚴重或難以忍受？",
    sub_en: "How strong or loud was your tinnitus?",
    hint: "評估耳鳴的主觀強度與難受程度",
    anchor_lo: "完全無法察覺",
    anchor_hi: "極度嚴重",
  },
  {
    key: "i3",
    sub: "I",
    name: "過去一週，您有多難以忽視耳鳴？",
    sub_en: "How easy was it to ignore your tinnitus?",
    hint: "評估您能從耳鳴中轉移注意力的困難程度（反向題）",
    anchor_lo: "極容易忽視",
    anchor_hi: "完全無法忽視",
  },
  {
    key: "c4",
    sub: "C",
    name: "過去一週，您覺得自己能控制耳鳴嗎？",
    sub_en: "Did you feel in control in regard to your tinnitus?",
    hint: "對耳鳴的自我掌控感（反向題）",
    anchor_lo: "完全能控制",
    anchor_hi: "完全無法控制",
  },
  {
    key: "c5",
    sub: "C",
    name: "過去一週，您對耳鳴感到不堪其擾而無計可施的程度？",
    sub_en: "How overwhelmed by your tinnitus did you feel?",
    hint: "被耳鳴壓倒的無力感",
    anchor_lo: "完全不覺得",
    anchor_hi: "極度不堪其擾",
  },
  {
    key: "c6",
    sub: "C",
    name: "過去一週，您有多麼努力嘗試應對耳鳴？",
    sub_en: "How much did you struggle against your tinnitus?",
    hint: "對抗耳鳴所需耗費的心力（反向題）",
    anchor_lo: "完全不需費力",
    anchor_hi: "極度努力掙扎",
  },
  {
    key: "g7",
    sub: "G",
    name: "過去一週，耳鳴使您難以集中注意力的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to concentrate?",
    hint: "耳鳴對注意力集中的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "完全無法集中",
  },
  {
    key: "g8",
    sub: "G",
    name: "過去一週，耳鳴使您思維清晰困難的程度？",
    sub_en:
      "How much difficulty did you have thinking clearly because of your tinnitus?",
    hint: "耳鳴對清晰思考的影響",
    anchor_lo: "完全沒有困難",
    anchor_hi: "極度困難",
  },
  {
    key: "g9",
    sub: "G",
    name: "過去一週，耳鳴使您無法忘記它的程度？",
    sub_en: "How hard was it to put your tinnitus out of your mind?",
    hint: "無法從心理上排除耳鳴",
    anchor_lo: "極容易忘記",
    anchor_hi: "完全無法忘記",
  },
  {
    key: "s10",
    sub: "S",
    name: "過去一週，耳鳴使您入睡困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to fall asleep?",
    hint: "耳鳴對睡眠入眠的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "s11",
    sub: "S",
    name: "過去一週，耳鳴使您夜間再次入睡困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to get back to sleep after waking up in the middle of the night?",
    hint: "耳鳴對半夜醒來後再入睡的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "s12",
    sub: "S",
    name: "過去一週，耳鳴使您睡眠時數不足的程度？",
    sub_en:
      "How much did your tinnitus contribute to difficulty getting enough sleep?",
    hint: "耳鳴對整體睡眠充足性的影響",
    anchor_lo: "完全沒影響",
    anchor_hi: "嚴重影響",
  },
  {
    key: "a13",
    sub: "A",
    name: "過去一週，耳鳴使您在嘈雜環境中聆聽困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to hear clearly in a noisy situation?",
    hint: "耳鳴加重噪音環境下的聆聽困難",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "a14",
    sub: "A",
    name: "過去一週，耳鳴使您聆聽音樂、收音機或電視困難的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to follow a conversation in a quiet room?",
    hint: "耳鳴對欣賞聲音媒體的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "a15",
    sub: "A",
    name: "過去一週，耳鳴使您理解別人說話困難的程度？",
    sub_en:
      "How much did your tinnitus make it difficult to understand what people were saying?",
    hint: "耳鳴對語音理解的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "r16",
    sub: "R",
    name: "過去一週，耳鳴使您放鬆困難的程度？",
    sub_en: "How much did your tinnitus interfere with your ability to relax?",
    hint: "耳鳴對放鬆休息的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "r17",
    sub: "R",
    name: "過去一週，耳鳴使您難以在安靜環境中感到舒適的程度？",
    sub_en:
      "How much did your tinnitus make it difficult to feel peaceful and calm?",
    hint: "安靜時耳鳴更顯突出，難以平靜",
    anchor_lo: "完全不困難",
    anchor_hi: "極度困難",
  },
  {
    key: "r18",
    sub: "R",
    name: "過去一週，耳鳴使您在休息或放假時無法享受寧靜的程度？",
    sub_en:
      "How much did your tinnitus interfere with your ability to rest or recuperate from daily life activities?",
    hint: "耳鳴妨礙休憩與恢復精力",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q19",
    sub: "Q",
    name: "過去一週，耳鳴干擾您與家人或朋友相處的程度？",
    sub_en:
      "How much did your tinnitus interfere with your enjoyment of social activities with family and friends?",
    hint: "耳鳴對家庭與社交活動的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q20",
    sub: "Q",
    name: "過去一週，耳鳴干擾您從事嗜好或休閒活動的程度？",
    sub_en:
      "How much did your tinnitus interfere with your enjoyment of hobbies and recreational activities?",
    hint: "耳鳴對個人興趣與娛樂活動的影響",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "q21",
    sub: "Q",
    name: "過去一週，耳鳴干擾您完成工作或家庭職責的程度？",
    sub_en:
      "How much did your tinnitus interfere with your performance of occupational or home responsibilities?",
    hint: "耳鳴對職業表現與家庭責任的干擾",
    anchor_lo: "完全不干擾",
    anchor_hi: "嚴重干擾",
  },
  {
    key: "e22",
    sub: "E",
    name: "過去一週，您因耳鳴感到焦慮的程度？",
    sub_en: "How much did your tinnitus cause you to feel anxious?",
    hint: "耳鳴引起的焦慮情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度焦慮",
  },
  {
    key: "e23",
    sub: "E",
    name: "過去一週，您因耳鳴感到煩躁或沮喪的程度？",
    sub_en:
      "How much did your tinnitus cause you to feel irritated or agitated?",
    hint: "耳鳴引起的煩躁與激動情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度煩躁",
  },
  {
    key: "e24",
    sub: "E",
    name: "過去一週，您因耳鳴感到憂鬱的程度？",
    sub_en: "How much did your tinnitus cause you to feel depressed?",
    hint: "耳鳴引起的憂鬱情緒",
    anchor_lo: "完全沒有",
    anchor_hi: "極度憂鬱",
  },
  {
    key: "e25",
    sub: "E",
    name: "過去一週，您覺得耳鳴對您生活的整體影響有多嚴重？",
    sub_en: "Overall, how much did your tinnitus affect your life?",
    hint: "耳鳴對整體生活品質的全面影響",
    anchor_lo: "完全沒有影響",
    anchor_hi: "極度嚴重影響",
  },
];

const tfiSubscaleDefs = {
  I: { name: "侵擾性", sub: "Intrusive", color: "intr", items: 3, max: 30 },
  C: {
    name: "控制感",
    sub: "Sense of Control",
    color: "ctrl",
    items: 3,
    max: 30,
  },
  G: { name: "認知影響", sub: "Cognitive", color: "cogn", items: 3, max: 30 },
  S: { name: "睡眠影響", sub: "Sleep", color: "slp", items: 3, max: 30 },
  A: { name: "聽覺影響", sub: "Auditory", color: "aud", items: 3, max: 30 },
  R: { name: "放鬆影響", sub: "Relaxation", color: "relx", items: 3, max: 30 },
  Q: {
    name: "生活品質",
    sub: "Quality of Life",
    color: "qol",
    items: 3,
    max: 30,
  },
  E: { name: "情緒影響", sub: "Emotional", color: "emot", items: 4, max: 40 },
};

const tfiSubscaleOrder = ["I", "C", "G", "S", "A", "R", "Q", "E"] as const;

const tfiQIndex = (() => {
  const map: Record<string, number> = {};
  tfiQuestions.forEach((q, i) => {
    map[q.key] = i + 1;
  });
  return map;
})();

// ── Tab state ─────────────────────────────────────────────────────
const activeTab = ref<"thi" | "tfi">("thi");

// ── THI State ─────────────────────────────────────────────────────
const thiSelections = ref<Record<string, number>>(
  Object.fromEntries(thiQuestions.map((q) => [q.key, -1])),
);
const thiShowResults = ref(false);
const thiCopied = ref(false);

const thiAnsweredCount = computed(
  () => thiQuestions.filter((q) => thiSelections.value[q.key] >= 0).length,
);
const thiIsComplete = computed(() => thiAnsweredCount.value === 25);

function thiDomainScore(d: "F" | "E" | "C") {
  return thiQuestions
    .filter((q) => q.domain === d)
    .reduce((sum, q) => sum + Math.max(thiSelections.value[q.key], 0), 0);
}

const thiScoreF = computed(() => thiDomainScore("F"));
const thiScoreE = computed(() => thiDomainScore("E"));
const thiScoreC = computed(() => thiDomainScore("C"));
const thiTotalScore = computed(
  () => thiScoreF.value + thiScoreE.value + thiScoreC.value,
);

const thiSeverity = computed(() => {
  const s = thiTotalScore.value;
  if (!thiIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${thiAnsweredCount.value}/25 題`,
    };
  if (s <= 16)
    return {
      level: "輕微障礙（一級）",
      color: "normal",
      advice: "THI ≤ 16，耳鳴對生活影響輕微，建議衛教及聽覺追蹤",
    };
  if (s <= 36)
    return {
      level: "輕度障礙（二級）",
      color: "mild",
      advice: "THI 18–36，輕度障礙，建議就醫評估並考慮聲音治療",
    };
  if (s <= 56)
    return {
      level: "中度障礙（三級）",
      color: "moderate",
      advice: "THI 38–56，中度障礙，建議聲音治療合併諮商",
    };
  if (s <= 76)
    return {
      level: "重度障礙（四級）",
      color: "severe",
      advice: "THI 58–76，重度障礙，建議積極耳鳴再訓練治療（TRT）",
    };
  return {
    level: "極重度障礙（五級）",
    color: "critical",
    advice: "THI 78–100，極重度，強烈建議完整多學科評估與治療",
  };
});

function thiGenerateMarkdown() {
  const sections = (["F", "E", "C"] as const)
    .map((d) => {
      const def = thiDomainDefs[d];
      const ds =
        d === "F"
          ? thiScoreF.value
          : d === "E"
            ? thiScoreE.value
            : thiScoreC.value;
      const lines = thiQuestions
        .filter((q) => q.domain === d)
        .map((q) => {
          const v = thiSelections.value[q.key];
          const opt = thiScoreOptions.find((o) => o.value === v);
          return `  - **Q${thiQIndex[q.key]} ${q.name}**：${v >= 0 ? `${v} — ${opt?.desc}` : "未填"}`;
        })
        .join("\n");
      return `### ${def.name}（${ds} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");
  return `# THI 耳鳴障礙量表評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **THI 總分**：${thiTotalScore.value} / 100\n- **功能面向（F）**：${thiScoreF.value} / 44\n- **情緒面向（E）**：${thiScoreE.value} / 36\n- **災難化面向（C）**：${thiScoreC.value} / 20\n- **嚴重程度**：${thiSeverity.value.level}\n- **臨床建議**：${thiSeverity.value.advice}\n\n> 正常切截值：THI ≤ 16（Grade 1）`;
}

async function thiCopyMarkdown() {
  await navigator.clipboard.writeText(thiGenerateMarkdown());
  thiCopied.value = true;
  setTimeout(() => (thiCopied.value = false), 2000);
}

function thiReset() {
  thiQuestions.forEach((q) => {
    thiSelections.value[q.key] = -1;
  });
  thiShowResults.value = false;
}

// ── TFI State ─────────────────────────────────────────────────────
const tfiSelections = ref<Record<string, number>>(
  Object.fromEntries(tfiQuestions.map((q) => [q.key, -1])),
);
const tfiShowResults = ref(false);
const tfiCopied = ref(false);

const tfiAnsweredCount = computed(
  () => tfiQuestions.filter((q) => tfiSelections.value[q.key] >= 0).length,
);
const tfiIsComplete = computed(() => tfiAnsweredCount.value === 25);

function tfiSubscaleScore(s: string) {
  return tfiQuestions
    .filter((q) => q.sub === s)
    .reduce((sum, q) => sum + Math.max(tfiSelections.value[q.key], 0), 0);
}

const tfiScores = computed(() => {
  const result: Record<string, number> = {};
  Object.keys(tfiSubscaleDefs).forEach((k) => {
    result[k] = tfiSubscaleScore(k);
  });
  return result;
});

const tfiTotalScore = computed(() => {
  if (tfiAnsweredCount.value === 0) return 0;
  const sum = tfiQuestions.reduce(
    (s, q) => s + Math.max(tfiSelections.value[q.key], 0),
    0,
  );
  return Math.round((sum / 25) * 10);
});

const tfiSeverity = computed(() => {
  const s = tfiTotalScore.value;
  if (!tfiIsComplete.value)
    return {
      level: "填寫中",
      color: "filling",
      advice: `已完成 ${tfiAnsweredCount.value}/25 題`,
    };
  if (s < 25)
    return {
      level: "輕微影響",
      color: "normal",
      advice: "TFI < 25，耳鳴對生活影響輕微，通常不需積極治療",
    };
  if (s < 50)
    return {
      level: "中度影響",
      color: "mild",
      advice: "TFI 25–49，建議就醫評估，考慮聲音治療或諮商",
    };
  if (s < 75)
    return {
      level: "重大影響",
      color: "moderate",
      advice: "TFI 50–74，耳鳴造成顯著障礙，建議積極治療",
    };
  return {
    level: "嚴重影響",
    color: "severe",
    advice: "TFI ≥ 75，嚴重障礙，強烈建議多學科耳鳴治療計劃",
  };
});

function tfiGenerateMarkdown() {
  const sections = tfiSubscaleOrder
    .map((sk) => {
      const def = tfiSubscaleDefs[sk];
      const sc = tfiScores.value[sk];
      const lines = tfiQuestions
        .filter((q) => q.sub === sk)
        .map((q) => {
          const v = tfiSelections.value[q.key];
          return `  - **Q${tfiQIndex[q.key]} ${q.name}**：${v >= 0 ? v : "未填"}`;
        })
        .join("\n");
      return `### ${def.name}（${sc} / ${def.max} 分）\n${lines}`;
    })
    .join("\n\n");
  return `# TFI 耳鳴功能指數評估結果\n\n${sections}\n\n---\n\n## 計算結果\n\n- **TFI 總分**：${tfiTotalScore.value} / 100\n- **嚴重程度**：${tfiSeverity.value.level}\n- **臨床建議**：${tfiSeverity.value.advice}\n\n> 切截值：TFI < 25 輕微 / 25–49 中度 / 50–74 重大 / ≥ 75 嚴重`;
}

async function tfiCopyMarkdown() {
  await navigator.clipboard.writeText(tfiGenerateMarkdown());
  tfiCopied.value = true;
  setTimeout(() => (tfiCopied.value = false), 2000);
}

function tfiReset() {
  tfiQuestions.forEach((q) => {
    tfiSelections.value[q.key] = -1;
  });
  tfiShowResults.value = false;
}
</script>

<template>
  <div class="tinnitus">
    <!-- Tab bar -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'thi' }"
        @click="activeTab = 'thi'"
      >
        <span class="tab-label">THI 耳鳴障礙量表</span>
        <span class="tab-sub">Tinnitus Handicap Inventory</span>
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'tfi' }"
        @click="activeTab = 'tfi'"
      >
        <span class="tab-label">TFI 耳鳴功能指數</span>
        <span class="tab-sub">Tinnitus Functional Index</span>
      </button>
    </div>

    <!-- ═══════════════════ THI Panel ═══════════════════ -->
    <div v-show="activeTab === 'thi'" class="thi">
      <div class="thi-header">
        <div class="header-title">
          <h2 class="title">THI 耳鳴障礙量表</h2>
          <p class="subtitle">
            Tinnitus Handicap Inventory · 耳鳴對日常生活影響評估
          </p>
        </div>
        <div class="score-badge" :class="thiSeverity.color">
          <span class="score-number">{{
            thiIsComplete ? thiTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            thiIsComplete
              ? thiSeverity.level.split("（")[0]
              : `${thiAnsweredCount}/25`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="thiSeverity.color"
            :style="{ width: Math.min(thiTotalScore, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span
          ><span class="tick-threshold">16</span
          ><span class="tk-mild">36</span><span class="tk-moderate">56</span
          ><span class="tk-severe">76</span
          ><span class="tk-critical">100</span>
        </div>
      </div>

      <div class="sub-scores">
        <div class="sub-pill func-pill">
          <span class="sub-label">功能（F）</span>
          <span class="sub-val">{{ thiScoreF }} / 44</span>
        </div>
        <div class="sub-pill emo-pill">
          <span class="sub-label">情緒（E）</span>
          <span class="sub-val">{{ thiScoreE }} / 36</span>
        </div>
        <div class="sub-pill cat-pill">
          <span class="sub-label">災難化（C）</span>
          <span class="sub-val">{{ thiScoreC }} / 20</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據耳鳴對您日常生活的影響作答。每題三個選項：<strong>從不（0分）、有時（2分）、總是（4分）</strong>，共
          25 題，總分 0–100 分。分數越高，耳鳴障礙程度越嚴重。</span
        >
      </div>

      <div
        v-for="domainKey in ['F', 'E', 'C'] as const"
        :key="domainKey"
        class="thi-group"
      >
        <div
          class="group-header"
          :class="thiDomainDefs[domainKey].color + '-header'"
        >
          <div class="group-label-block">
            <span class="group-label">{{ thiDomainDefs[domainKey].name }}</span>
            <span class="group-sub"
              >{{ thiDomainDefs[domainKey].sub }} ·
              {{ thiDomainDefs[domainKey].items }} 題</span
            >
          </div>
          <div
            class="group-score-pill"
            :class="thiDomainDefs[domainKey].color + '-pill'"
          >
            {{
              domainKey === "F"
                ? thiScoreF
                : domainKey === "E"
                  ? thiScoreE
                  : thiScoreC
            }}
            / {{ thiDomainDefs[domainKey].max }}
          </div>
        </div>

        <div class="item-list">
          <div
            v-for="q in thiQuestions.filter((q) => q.domain === domainKey)"
            :key="q.key"
            class="thi-item"
            :class="{
              answered: thiSelections[q.key] >= 0,
              high: thiSelections[q.key] === 4,
              [thiDomainDefs[domainKey].color]: thiSelections[q.key] >= 0,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span
                  class="item-qnum"
                  :class="thiDomainDefs[domainKey].color + '-qnum'"
                  >Q{{ thiQIndex[q.key] }}</span
                >
                <span
                  class="domain-tag"
                  :class="thiDomainDefs[domainKey].color + '-tag'"
                  >{{ domainKey }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub }}</span>
                <span class="item-hint">{{ q.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: thiSelections[q.key] === 0,
                  unanswered: thiSelections[q.key] < 0,
                  high: thiSelections[q.key] === 4,
                }"
                >{{
                  thiSelections[q.key] >= 0 ? thiSelections[q.key] : "—"
                }}</span
              >
            </div>

            <div class="option-row option-row-3">
              <label
                v-for="opt in thiScoreOptions"
                :key="opt.value"
                class="opt-pill"
                :class="{
                  active: thiSelections[q.key] === opt.value,
                  high: opt.value === 4 && thiSelections[q.key] === 4,
                  ['s' + opt.value]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'thi-' + q.key"
                  :value="opt.value"
                  v-model="thiSelections[q.key]"
                />
                <span class="opt-num">{{ opt.label }}</span>
                <span class="opt-desc">{{ opt.desc }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="thi-result" :class="thiSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            thiIsComplete ? thiTotalScore : "—"
          }}</span>
          <span class="result-max">/ 100</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ thiSeverity.level }}</span>
          <span class="result-advice">{{ thiSeverity.advice }}</span>
          <div class="result-breakdown">
            <span class="breakdown-pill func-pill-sm">F：{{ thiScoreF }}</span>
            <span class="breakdown-pill emo-pill-sm">E：{{ thiScoreE }}</span>
            <span class="breakdown-pill cat-pill-sm">C：{{ thiScoreC }}</span>
          </div>
        </div>
      </div>

      <div v-if="thiShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="domainKey in ['F', 'E', 'C'] as const" :key="domainKey">
          <div
            class="detail-section-title"
            :class="thiDomainDefs[domainKey].color + '-section'"
          >
            {{ thiDomainDefs[domainKey].name }}（{{
              domainKey === "F"
                ? thiScoreF
                : domainKey === "E"
                  ? thiScoreE
                  : thiScoreC
            }}
            / {{ thiDomainDefs[domainKey].max }} 分）
          </div>
          <div
            v-for="q in thiQuestions.filter((q) => q.domain === domainKey)"
            :key="q.key"
            class="detail-row"
          >
            <span class="detail-qnum">Q{{ thiQIndex[q.key] }}</span>
            <span class="detail-domain">{{ q.name }}</span>
            <span
              class="detail-score"
              :class="{
                zero: thiSelections[q.key] === 0,
                high: thiSelections[q.key] === 4,
                brand: thiSelections[q.key] === 2,
              }"
              >{{
                thiSelections[q.key] >= 0 ? thiSelections[q.key] : "—"
              }}</span
            >
            <span class="detail-desc">{{
              thiSelections[q.key] >= 0
                ? thiScoreOptions.find((o) => o.value === thiSelections[q.key])
                    ?.desc
                : "未填"
            }}</span>
          </div>
        </div>
      </div>

      <div class="thi-actions">
        <button class="btn-view" @click="thiShowResults = !thiShowResults">
          {{ thiShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="thiCopyMarkdown">
          {{ thiCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="thiReset">重置</button>
      </div>
      <p v-if="!thiIsComplete" class="progress-hint">
        已完成 {{ thiAnsweredCount }}/25 題，尚餘 {{ 25 - thiAnsweredCount }} 題
      </p>
    </div>

    <!-- ═══════════════════ TFI Panel ═══════════════════ -->
    <div v-show="activeTab === 'tfi'" class="tfi">
      <div class="tfi-header">
        <div class="header-title">
          <h2 class="title">TFI 耳鳴功能指數</h2>
          <p class="subtitle">
            Tinnitus Functional Index · 耳鳴對生活功能影響評估
          </p>
        </div>
        <div class="score-badge" :class="tfiSeverity.color">
          <span class="score-number">{{
            tfiIsComplete ? tfiTotalScore : "—"
          }}</span>
          <span class="score-label">{{
            tfiIsComplete ? tfiSeverity.level : `${tfiAnsweredCount}/25`
          }}</span>
        </div>
      </div>

      <div class="severity-bar-wrap">
        <div class="severity-bar">
          <div
            class="severity-fill"
            :class="tfiSeverity.color"
            :style="{ width: Math.min(tfiTotalScore, 100) + '%' }"
          />
        </div>
        <div class="severity-ticks">
          <span class="tk-normal">0</span
          ><span class="tick-threshold">25</span
          ><span class="tk-mild">50</span><span class="tk-moderate">75</span
          ><span class="tk-severe">100</span>
        </div>
      </div>

      <div class="sub-scores">
        <div
          v-for="sk in tfiSubscaleOrder"
          :key="sk"
          class="sub-pill"
          :class="tfiSubscaleDefs[sk].color + '-pill'"
        >
          <span class="sub-label">{{ tfiSubscaleDefs[sk].name }}</span>
          <span class="sub-val">{{ tfiScores[sk] }}</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◉</span>
        <span
          >請依據<strong>過去一週</strong>耳鳴對您生活的影響程度評分。每題 0–10
          分（0 = 完全沒有影響，10 = 影響最嚴重），共 25 題，涵蓋 8
          個面向。</span
        >
      </div>

      <div v-for="sk in tfiSubscaleOrder" :key="sk" class="tfi-group">
        <div
          class="group-header"
          :class="tfiSubscaleDefs[sk].color + '-header'"
        >
          <div class="group-label-block">
            <span class="group-label">{{ tfiSubscaleDefs[sk].name }}</span>
            <span class="group-sub"
              >{{ tfiSubscaleDefs[sk].sub }} ·
              {{ tfiSubscaleDefs[sk].items }} 題</span
            >
          </div>
          <div
            class="group-score-pill"
            :class="tfiSubscaleDefs[sk].color + '-pill'"
          >
            {{ tfiScores[sk] }} / {{ tfiSubscaleDefs[sk].max }}
          </div>
        </div>

        <div class="item-list">
          <div
            v-for="q in tfiQuestions.filter((q) => q.sub === sk)"
            :key="q.key"
            class="tfi-item"
            :class="{
              answered: tfiSelections[q.key] >= 0,
              high: tfiSelections[q.key] >= 8,
              [tfiSubscaleDefs[sk].color]: tfiSelections[q.key] >= 0,
            }"
          >
            <div class="item-header">
              <div class="item-meta-row">
                <span
                  class="item-qnum"
                  :class="tfiSubscaleDefs[sk].color + '-qnum'"
                  >Q{{ tfiQIndex[q.key] }}</span
                >
              </div>
              <div class="item-name-block">
                <span class="item-name">{{ q.name }}</span>
                <span class="item-sub">{{ q.sub_en }}</span>
                <span class="item-hint">{{ q.hint }}</span>
              </div>
              <span
                class="item-score"
                :class="{
                  zero: tfiSelections[q.key] === 0,
                  unanswered: tfiSelections[q.key] < 0,
                  high: tfiSelections[q.key] >= 8,
                }"
                >{{
                  tfiSelections[q.key] >= 0 ? tfiSelections[q.key] : "—"
                }}</span
              >
            </div>

            <div class="anchor-row">
              <span class="anchor-lo">{{ q.anchor_lo }}</span>
              <span class="anchor-hi">{{ q.anchor_hi }}</span>
            </div>

            <div class="option-row-11">
              <label
                v-for="n in 11"
                :key="n - 1"
                class="opt-cell"
                :class="{
                  active: tfiSelections[q.key] === n - 1,
                  high: n - 1 >= 8 && tfiSelections[q.key] === n - 1,
                  ['s' + (n - 1)]: true,
                }"
              >
                <input
                  type="radio"
                  :name="'tfi-' + q.key"
                  :value="n - 1"
                  v-model="tfiSelections[q.key]"
                />
                <span class="opt-num-sm">{{ n - 1 }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div class="tfi-result" :class="tfiSeverity.color">
        <div class="result-left">
          <span class="result-number">{{
            tfiIsComplete ? tfiTotalScore : "—"
          }}</span>
          <span class="result-max">/ 100</span>
        </div>
        <div class="result-right">
          <span class="result-level">{{ tfiSeverity.level }}</span>
          <span class="result-advice">{{ tfiSeverity.advice }}</span>
          <div class="result-breakdown">
            <span
              v-for="sk in tfiSubscaleOrder"
              :key="sk"
              class="breakdown-pill"
              :class="tfiSubscaleDefs[sk].color + '-pill-sm'"
              >{{ tfiSubscaleDefs[sk].name.slice(0, 2) }}：{{
                tfiScores[sk]
              }}</span
            >
          </div>
        </div>
      </div>

      <div v-if="tfiShowResults" class="results-detail">
        <div class="results-header">評估明細</div>
        <div v-for="sk in tfiSubscaleOrder" :key="sk">
          <div
            class="detail-section-title"
            :class="tfiSubscaleDefs[sk].color + '-section'"
          >
            {{ tfiSubscaleDefs[sk].name }}（{{ tfiScores[sk] }} /
            {{ tfiSubscaleDefs[sk].max }} 分）
          </div>
          <div
            v-for="q in tfiQuestions.filter((q) => q.sub === sk)"
            :key="q.key"
            class="detail-row"
          >
            <span class="detail-qnum">Q{{ tfiQIndex[q.key] }}</span>
            <span class="detail-domain">{{ q.name }}</span>
            <span
              class="detail-score"
              :class="{
                zero: tfiSelections[q.key] === 0,
                high: tfiSelections[q.key] >= 8,
                brand: tfiSelections[q.key] > 0 && tfiSelections[q.key] < 8,
              }"
              >{{
                tfiSelections[q.key] >= 0 ? tfiSelections[q.key] : "—"
              }}</span
            >
            <span class="detail-desc">{{
              tfiSelections[q.key] === 0
                ? "沒有"
                : tfiSelections[q.key] <= 3
                  ? "輕微"
                  : tfiSelections[q.key] <= 6
                    ? "中度"
                    : "嚴重"
            }}</span>
          </div>
        </div>
      </div>

      <div class="tfi-actions">
        <button class="btn-view" @click="tfiShowResults = !tfiShowResults">
          {{ tfiShowResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="tfiCopyMarkdown">
          {{ tfiCopied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="tfiReset">重置</button>
      </div>
      <p v-if="!tfiIsComplete" class="progress-hint">
        已完成 {{ tfiAnsweredCount }}/25 題，尚餘 {{ 25 - tfiAnsweredCount }} 題
      </p>
    </div>
  </div>
</template>

<style scoped>
/* ==================================================================
   Tinnitus Layout & Tab Bar
   ================================================================== */
.tinnitus {
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
   Shared — THI & TFI panels
   ================================================================== */
.thi,
.tfi {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

.thi-header,
.tfi-header {
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
  background: linear-gradient(90deg, #f59e0b, #d97706);
}
.severity-fill.moderate {
  background: linear-gradient(90deg, #f97316, #ea580c);
}
.severity-fill.severe {
  background: linear-gradient(90deg, #ef4444, #dc2626);
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
.severity-ticks .tk-critical {
  color: #ef4444;
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

/* THI sub-pill accents */
.thi .func-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.thi .func-pill .sub-val {
  color: #6366f1;
}
.thi .emo-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.thi .emo-pill .sub-val {
  color: #14b8a6;
}
.thi .cat-pill {
  border-color: rgba(239, 68, 68, 0.3);
}
.thi .cat-pill .sub-val {
  color: #ef4444;
}

/* TFI sub-pill accents */
.tfi .intr-pill {
  border-color: rgba(139, 92, 246, 0.3);
}
.tfi .intr-pill .sub-val {
  color: #8b5cf6;
}
.tfi .ctrl-pill {
  border-color: rgba(59, 130, 246, 0.3);
}
.tfi .ctrl-pill .sub-val {
  color: #3b82f6;
}
.tfi .cogn-pill {
  border-color: rgba(20, 184, 166, 0.3);
}
.tfi .cogn-pill .sub-val {
  color: #14b8a6;
}
.tfi .slp-pill {
  border-color: rgba(99, 102, 241, 0.3);
}
.tfi .slp-pill .sub-val {
  color: #6366f1;
}
.tfi .aud-pill {
  border-color: rgba(245, 158, 11, 0.3);
}
.tfi .aud-pill .sub-val {
  color: #f59e0b;
}
.tfi .relx-pill {
  border-color: rgba(34, 197, 94, 0.3);
}
.tfi .relx-pill .sub-val {
  color: #22c55e;
}
.tfi .qol-pill {
  border-color: rgba(249, 115, 22, 0.3);
}
.tfi .qol-pill .sub-val {
  color: #f97316;
}
.tfi .emot-pill {
  border-color: rgba(239, 68, 68, 0.3);
}
.tfi .emot-pill .sub-val {
  color: #ef4444;
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
.thi-group,
.tfi-group {
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

/* THI group accents */
.thi .group-header.func-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
  border-left: 4px solid #6366f1;
}
.thi .group-header.emo-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border-left: 4px solid #14b8a6;
}
.thi .group-header.cat-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent);
  border-left: 4px solid #ef4444;
}

.thi .group-score-pill.func-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.thi .group-score-pill.emo-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}
.thi .group-score-pill.cat-pill {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}

/* TFI group accents */
.tfi .group-header.intr-header {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.08), transparent);
  border-left: 4px solid #8b5cf6;
}
.tfi .group-header.ctrl-header {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), transparent);
  border-left: 4px solid #3b82f6;
}
.tfi .group-header.cogn-header {
  background: linear-gradient(135deg, rgba(20, 184, 166, 0.08), transparent);
  border-left: 4px solid #14b8a6;
}
.tfi .group-header.slp-header {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08), transparent);
  border-left: 4px solid #6366f1;
}
.tfi .group-header.aud-header {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08), transparent);
  border-left: 4px solid #f59e0b;
}
.tfi .group-header.relx-header {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.08), transparent);
  border-left: 4px solid #22c55e;
}
.tfi .group-header.qol-header {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), transparent);
  border-left: 4px solid #f97316;
}
.tfi .group-header.emot-header {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.08), transparent);
  border-left: 4px solid #ef4444;
}

.tfi .group-score-pill.intr-pill {
  color: #8b5cf6;
  border-color: rgba(139, 92, 246, 0.25);
  background: rgba(139, 92, 246, 0.06);
}
.tfi .group-score-pill.ctrl-pill {
  color: #3b82f6;
  border-color: rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.06);
}
.tfi .group-score-pill.cogn-pill {
  color: #14b8a6;
  border-color: rgba(20, 184, 166, 0.25);
  background: rgba(20, 184, 166, 0.06);
}
.tfi .group-score-pill.slp-pill {
  color: #6366f1;
  border-color: rgba(99, 102, 241, 0.25);
  background: rgba(99, 102, 241, 0.06);
}
.tfi .group-score-pill.aud-pill {
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.25);
  background: rgba(245, 158, 11, 0.06);
}
.tfi .group-score-pill.relx-pill {
  color: #22c55e;
  border-color: rgba(34, 197, 94, 0.25);
  background: rgba(34, 197, 94, 0.06);
}
.tfi .group-score-pill.qol-pill {
  color: #f97316;
  border-color: rgba(249, 115, 22, 0.25);
  background: rgba(249, 115, 22, 0.06);
}
.tfi .group-score-pill.emot-pill {
  color: #ef4444;
  border-color: rgba(239, 68, 68, 0.25);
  background: rgba(239, 68, 68, 0.06);
}

/* ── Item list ──────────────────────────────────────────────────── */
.item-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

/* ── THI items ──────────────────────────────────────────────────── */
.thi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.thi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.thi-item.answered {
  border-color: rgba(34, 197, 94, 0.2);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(34, 197, 94, 0.03)
  );
}
.thi-item.high {
  border-color: rgba(249, 115, 22, 0.25);
  background: linear-gradient(
    135deg,
    var(--vp-c-bg-soft),
    rgba(249, 115, 22, 0.04)
  );
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08);
}

/* ── TFI items ──────────────────────────────────────────────────── */
.tfi-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  overflow: hidden;
  transition: all 0.25s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.tfi-item:hover {
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.06);
  border-color: var(--vp-c-divider);
}
.tfi-item.answered {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.04), transparent);
}
.tfi-item.high {
  background: linear-gradient(
    135deg,
    rgba(239, 68, 68, 0.04),
    transparent
  ) !important;
  border-color: #ef4444 !important;
}

.tfi-item.answered.intr {
  border-color: #8b5cf6;
}
.tfi-item.answered.ctrl {
  border-color: #3b82f6;
}
.tfi-item.answered.cogn {
  border-color: #14b8a6;
}
.tfi-item.answered.slp {
  border-color: #6366f1;
}
.tfi-item.answered.aud {
  border-color: #f59e0b;
}
.tfi-item.answered.relx {
  border-color: #22c55e;
}
.tfi-item.answered.qol {
  border-color: #f97316;
}
.tfi-item.answered.emot {
  border-color: #ef4444;
}

/* ── Item header ─────────────────────────────────────────────────── */
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

.item-qnum {
  font-size: 0.7rem;
  font-weight: 800;
  padding: 2px 9px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  flex-shrink: 0;
}

/* THI item-qnum */
.thi .item-qnum.func-qnum {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.thi .item-qnum.emo-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.thi .item-qnum.cat-qnum {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

/* TFI item-qnum */
.tfi .item-qnum.intr-qnum {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.12);
}
.tfi .item-qnum.ctrl-qnum {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.12);
}
.tfi .item-qnum.cogn-qnum {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.12);
}
.tfi .item-qnum.slp-qnum {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.12);
}
.tfi .item-qnum.aud-qnum {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.12);
}
.tfi .item-qnum.relx-qnum {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.12);
}
.tfi .item-qnum.qol-qnum {
  color: #f97316;
  background: rgba(249, 115, 22, 0.12);
}
.tfi .item-qnum.emot-qnum {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.12);
}

.domain-tag {
  font-size: 0.62rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
}
.thi .domain-tag.func-tag {
  background: rgba(99, 102, 241, 0.12);
  color: #6366f1;
}
.thi .domain-tag.emo-tag {
  background: rgba(20, 184, 166, 0.12);
  color: #14b8a6;
}
.thi .domain-tag.cat-tag {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
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

.item-hint {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  font-style: italic;
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

/* ── THI option row — 3 columns ─────────────────────────────────── */
.option-row-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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

/* THI opt-pill colors — s0 green, s2 yellow, s4 orange */
.thi .opt-pill.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.thi .opt-pill.s0:hover:not(.active),
.thi .opt-pill.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.thi .opt-pill.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}

.thi .opt-pill.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.thi .opt-pill.s2:hover:not(.active),
.thi .opt-pill.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.thi .opt-pill.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}

.thi .opt-pill.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.thi .opt-pill.s4:hover:not(.active),
.thi .opt-pill.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.thi .opt-pill.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
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

.thi .opt-pill.s0 .opt-num {
  color: rgba(34, 197, 94, 0.85);
}
.thi .opt-pill.s0.active .opt-num {
  color: #22c55e;
}
.thi .opt-pill.s2 .opt-num {
  color: rgba(234, 179, 8, 0.85);
}
.thi .opt-pill.s2.active .opt-num {
  color: #eab308;
}
.thi .opt-pill.s4 .opt-num {
  color: rgba(249, 115, 22, 0.85);
}
.thi .opt-pill.s4.active .opt-num {
  color: #f97316;
}

.thi .opt-pill.s0 .opt-desc {
  color: rgba(34, 197, 94, 0.7);
}
.thi .opt-pill.s0.active .opt-desc {
  color: rgba(34, 197, 94, 0.9);
}
.thi .opt-pill.s2 .opt-desc {
  color: rgba(234, 179, 8, 0.7);
}
.thi .opt-pill.s2.active .opt-desc {
  color: rgba(234, 179, 8, 0.9);
}
.thi .opt-pill.s4 .opt-desc {
  color: rgba(249, 115, 22, 0.7);
}
.thi .opt-pill.s4.active .opt-desc {
  color: rgba(249, 115, 22, 0.9);
}

/* ── TFI anchor row ─────────────────────────────────────────────── */
.anchor-row {
  display: flex;
  justify-content: space-between;
  padding: 0.25rem 0.9rem 0;
  font-size: 0.6rem;
  color: var(--vp-c-text-3);
}

/* ── TFI option row — 11 cells (0–10) ──────────────────────────── */
.option-row-11 {
  display: grid;
  grid-template-columns: repeat(11, 1fr);
  gap: 2px;
  padding: 3px;
  background: var(--vp-c-bg-mute);
}

.opt-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.1rem;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  border-radius: 6px;
  background: var(--vp-c-bg);
  border: 1.5px solid transparent;
}
.opt-cell:hover {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}
.opt-cell input[type="radio"] {
  display: none;
}

/* TFI opt-cell colors — s0 green, s1-s4 yellow-to-orange, s5+ red */
.tfi .opt-cell.s0 {
  border-color: rgba(34, 197, 94, 0.15);
}
.tfi .opt-cell.s0:hover:not(.active),
.tfi .opt-cell.s0:focus-within {
  border-color: rgba(34, 197, 94, 0.35);
  background: rgba(34, 197, 94, 0.04);
}
.tfi .opt-cell.s0.active {
  border-color: #22c55e;
  background: color-mix(in srgb, rgb(34, 197, 94) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.08);
}
.tfi .opt-cell.s0 .opt-num-sm {
  color: rgba(34, 197, 94, 0.85);
}
.tfi .opt-cell.s0.active .opt-num-sm {
  color: #22c55e;
}

.tfi .opt-cell.s1 .opt-num-sm {
  color: rgba(132, 204, 22, 0.85);
}
.tfi .opt-cell.s1.active .opt-num-sm {
  color: #84cc16;
}

.tfi .opt-cell.s2 .opt-num-sm {
  color: rgba(234, 179, 8, 0.85);
}
.tfi .opt-cell.s2.active .opt-num-sm {
  color: #eab308;
}

.tfi .opt-cell.s3 .opt-num-sm {
  color: rgba(245, 158, 11, 0.85);
}
.tfi .opt-cell.s3.active .opt-num-sm {
  color: #f59e0b;
}

.tfi .opt-cell.s4 .opt-num-sm {
  color: rgba(249, 115, 22, 0.85);
}
.tfi .opt-cell.s4.active .opt-num-sm {
  color: #f97316;
}

.tfi .opt-cell.s5 .opt-num-sm,
.tfi .opt-cell.s6 .opt-num-sm,
.tfi .opt-cell.s7 .opt-num-sm,
.tfi .opt-cell.s8 .opt-num-sm,
.tfi .opt-cell.s9 .opt-num-sm,
.tfi .opt-cell.s10 .opt-num-sm {
  color: rgba(239, 68, 68, 0.85);
}
.tfi .opt-cell.s0.active .opt-num-sm {
  color: #22c55e;
}

.tfi .opt-cell.s1 {
  border-color: rgba(132, 204, 22, 0.15);
}
.tfi .opt-cell.s1:hover:not(.active),
.tfi .opt-cell.s1:focus-within {
  border-color: rgba(132, 204, 22, 0.35);
  background: rgba(132, 204, 22, 0.04);
}
.tfi .opt-cell.s1.active {
  border-color: #84cc16;
  background: color-mix(in srgb, rgb(132, 204, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(132, 204, 22, 0.08);
}
.tfi .opt-cell.s1 .opt-num-sm {
  color: rgba(132, 204, 22, 0.85);
}
.tfi .opt-cell.s1.active .opt-num-sm {
  color: #84cc16;
}

.tfi .opt-cell.s2 {
  border-color: rgba(234, 179, 8, 0.15);
}
.tfi .opt-cell.s2:hover:not(.active),
.tfi .opt-cell.s2:focus-within {
  border-color: rgba(234, 179, 8, 0.35);
  background: rgba(234, 179, 8, 0.04);
}
.tfi .opt-cell.s2.active {
  border-color: #eab308;
  background: color-mix(in srgb, rgb(234, 179, 8) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(234, 179, 8, 0.08);
}
.tfi .opt-cell.s2 .opt-num-sm {
  color: rgba(234, 179, 8, 0.85);
}
.tfi .opt-cell.s2.active .opt-num-sm {
  color: #eab308;
}

.tfi .opt-cell.s3 {
  border-color: rgba(245, 158, 11, 0.15);
}
.tfi .opt-cell.s3:hover:not(.active),
.tfi .opt-cell.s3:focus-within {
  border-color: rgba(245, 158, 11, 0.35);
  background: rgba(245, 158, 11, 0.04);
}
.tfi .opt-cell.s3.active {
  border-color: #f59e0b;
  background: color-mix(in srgb, rgb(245, 158, 11) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.08);
}
.tfi .opt-cell.s3 .opt-num-sm {
  color: rgba(245, 158, 11, 0.85);
}
.tfi .opt-cell.s3.active .opt-num-sm {
  color: #f59e0b;
}

.tfi .opt-cell.s4 {
  border-color: rgba(249, 115, 22, 0.15);
}
.tfi .opt-cell.s4:hover:not(.active),
.tfi .opt-cell.s4:focus-within {
  border-color: rgba(249, 115, 22, 0.35);
  background: rgba(249, 115, 22, 0.04);
}
.tfi .opt-cell.s4.active {
  border-color: #f97316;
  background: color-mix(in srgb, rgb(249, 115, 22) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(249, 115, 22, 0.08);
}
.tfi .opt-cell.s4 .opt-num-sm {
  color: rgba(249, 115, 22, 0.85);
}
.tfi .opt-cell.s4.active .opt-num-sm {
  color: #f97316;
}

.tfi .opt-cell.s5,
.tfi .opt-cell.s6,
.tfi .opt-cell.s7,
.tfi .opt-cell.s8,
.tfi .opt-cell.s9,
.tfi .opt-cell.s10 {
  border-color: rgba(239, 68, 68, 0.15);
}
.tfi .opt-cell.s5:hover:not(.active),
.tfi .opt-cell.s6:hover:not(.active),
.tfi .opt-cell.s7:hover:not(.active),
.tfi .opt-cell.s8:hover:not(.active),
.tfi .opt-cell.s9:hover:not(.active),
.tfi .opt-cell.s10:hover:not(.active),
.tfi .opt-cell.s5:focus-within,
.tfi .opt-cell.s6:focus-within,
.tfi .opt-cell.s7:focus-within,
.tfi .opt-cell.s8:focus-within,
.tfi .opt-cell.s9:focus-within,
.tfi .opt-cell.s10:focus-within {
  border-color: rgba(239, 68, 68, 0.35);
  background: rgba(239, 68, 68, 0.04);
}
.tfi .opt-cell.s5.active,
.tfi .opt-cell.s6.active,
.tfi .opt-cell.s7.active,
.tfi .opt-cell.s8.active,
.tfi .opt-cell.s9.active,
.tfi .opt-cell.s10.active {
  border-color: #ef4444;
  background: color-mix(in srgb, rgb(239, 68, 68) 18%, var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.08);
}
.tfi .opt-cell.s5 .opt-num-sm,
.tfi .opt-cell.s6 .opt-num-sm,
.tfi .opt-cell.s7 .opt-num-sm,
.tfi .opt-cell.s8 .opt-num-sm,
.tfi .opt-cell.s9 .opt-num-sm,
.tfi .opt-cell.s10 .opt-num-sm {
  color: rgba(239, 68, 68, 0.85);
}
.tfi .opt-cell.s5.active .opt-num-sm,
.tfi .opt-cell.s6.active .opt-num-sm,
.tfi .opt-cell.s7.active .opt-num-sm,
.tfi .opt-cell.s8.active .opt-num-sm,
.tfi .opt-cell.s9.active .opt-num-sm,
.tfi .opt-cell.s10.active .opt-num-sm {
  color: #ef4444;
}

.opt-num-sm {
  font-size: 0.78rem;
  font-weight: 900;
  transition: color 0.2s;
}

/* ── Result card — THI ───────────────────────────────────────────── */
.thi-result {
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
.thi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.thi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.thi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.thi-result.severe {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.thi-result.critical {
  border-color: #ef4444;
  box-shadow:
    0 0 0 1px rgba(239, 68, 68, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}

/* ── Result card — TFI ───────────────────────────────────────────── */
.tfi-result {
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
.tfi-result.normal {
  border-color: #22c55e;
  box-shadow:
    0 0 0 1px rgba(34, 197, 94, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.tfi-result.mild {
  border-color: #f59e0b;
  box-shadow:
    0 0 0 1px rgba(245, 158, 11, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.tfi-result.moderate {
  border-color: #f97316;
  box-shadow:
    0 0 0 1px rgba(249, 115, 22, 0.06),
    0 1px 3px rgba(0, 0, 0, 0.04);
}
.tfi-result.severe {
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
.thi-result.normal .result-number,
.tfi-result.normal .result-number {
  color: #22c55e;
}
.thi-result.mild .result-number,
.tfi-result.mild .result-number {
  color: #f59e0b;
}
.thi-result.moderate .result-number,
.tfi-result.moderate .result-number {
  color: #f97316;
}
.thi-result.severe .result-number,
.tfi-result.severe .result-number {
  color: #ef4444;
}
.thi-result.critical .result-number {
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

/* THI breakdown */
.func-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.emo-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.cat-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* TFI breakdown */
.intr-pill-sm {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
  border: 1px solid rgba(139, 92, 246, 0.3);
}
.ctrl-pill-sm {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}
.cogn-pill-sm {
  background: rgba(20, 184, 166, 0.1);
  color: #14b8a6;
  border: 1px solid rgba(20, 184, 166, 0.3);
}
.slp-pill-sm {
  background: rgba(99, 102, 241, 0.1);
  color: #6366f1;
  border: 1px solid rgba(99, 102, 241, 0.3);
}
.aud-pill-sm {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}
.relx-pill-sm {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  border: 1px solid rgba(34, 197, 94, 0.3);
}
.qol-pill-sm {
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
}
.emot-pill-sm {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
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

/* THI section accents */
.thi .func-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.thi .emo-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.thi .cat-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
}

/* TFI section accents */
.tfi .intr-section {
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.06);
}
.tfi .ctrl-section {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.06);
}
.tfi .cogn-section {
  color: #14b8a6;
  background: rgba(20, 184, 166, 0.06);
}
.tfi .slp-section {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.06);
}
.tfi .aud-section {
  color: #f59e0b;
  background: rgba(245, 158, 11, 0.06);
}
.tfi .relx-section {
  color: #22c55e;
  background: rgba(34, 197, 94, 0.06);
}
.tfi .qol-section {
  color: #f97316;
  background: rgba(249, 115, 22, 0.06);
}
.tfi .emot-section {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.06);
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

/* ── Actions ────────────────────────────────────────────────────── */
.thi-actions,
.tfi-actions {
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
  .thi-header,
  .tfi-header {
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
  .thi-result,
  .tfi-result {
    flex-direction: column;
    gap: 0.75rem;
  }
  .detail-desc {
    width: 48px;
  }
}
</style>
