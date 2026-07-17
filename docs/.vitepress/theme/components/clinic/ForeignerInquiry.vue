<script setup lang="ts">
import { withBase } from "vitepress";
import { ref, computed } from "vue";

type Lang = "en" | "zh" | "vi" | "th" | "id" | "ph" | "my";

const langs: { key: Lang; label: string }[] = [
  {
    key: "en",
    label: "英文",
  },
  { key: "vi", label: "越南" },
  { key: "th", label: "泰語" },
  { key: "id", label: "印尼文" },
  { key: "ph", label: "菲律賓" },
  { key: "my", label: "緬甸" },
];

interface Q {
  id: number;
  text: Record<Lang, string>;
  isCheckbox?: boolean;
  symptoms?: Symptom[];
}

interface Symptom {
  key: string;
  img: string;
  text: Record<Lang, string>;
}

const questions: Q[] = [
  {
    id: 1,
    text: {
      en: "What symptoms do you have?",
      zh: "你有哪些症狀？",
      vi: "Bạn có những triệu chứng gì?",
      th: "คุณมีอาการอะไรบ้าง?",
      id: "Apa gejala yang Anda alami?",
      ph: "Ano ang mga sintomas mo?",
      my: "သင့်တွင် မည်သည့်လက္ခဏာများရှိပါသလဲ။",
    },
    isCheckbox: true,
    symptoms: [
      {
        key: "fever",
        img: "fever.png",
        text: {
          en: "Fever",
          zh: "發燒",
          vi: "Sốt",
          th: "ไข้",
          id: "Demam",
          ph: "Lagnat",
          my: "အဖျား",
        },
      },
      {
        key: "cough",
        img: "cough.png",
        text: {
          en: "Cough",
          zh: "咳嗽",
          vi: "Ho",
          th: "ไอ",
          id: "Batuk",
          ph: "Ubo",
          my: "ချောင်းဆိုး",
        },
      },
      {
        key: "headache",
        img: "headache.png",
        text: {
          en: "Headache",
          zh: "頭痛",
          vi: "Đau đầu",
          th: "ปวดหัว",
          id: "Sakit kepala",
          ph: "Sakit ng ulo",
          my: "ခေါင်းကိုက်",
        },
      },
      {
        key: "sore-throat",
        img: "sore-throat.png",
        text: {
          en: "Sore throat",
          zh: "喉嚨痛",
          vi: "Đau họng",
          th: "เจ็บคอ",
          id: "Sakit tenggorokan",
          ph: "Masakit ang lalamunan",
          my: "လည်ချောင်းနာ",
        },
      },
      {
        key: "rhinorrhea",
        img: "rhinorrhea.png",
        text: {
          en: "Runny nose",
          zh: "流鼻水",
          vi: "Chảy nước mũi",
          th: "น้ำมูกไหล",
          id: "Pilek",
          ph: "Sipon",
          my: "နှာရည်ယို",
        },
      },
      {
        key: "nasal-congestion",
        img: "nasal-congestion.png",
        text: {
          en: "Nasal congestion",
          zh: "鼻塞",
          vi: "Nghẹt mũi",
          th: "คัดจมูก",
          id: "Hidung tersumbat",
          ph: "Baradong ilong",
          my: "နှာခေါင်းပိတ်",
        },
      },
      {
        key: "sneezing",
        img: "sneezing.png",
        text: {
          en: "Sneezing",
          zh: "打噴嚏",
          vi: "Hắt hơi",
          th: "จาม",
          id: "Bersin",
          ph: "Bumahing",
          my: "နှာချေ",
        },
      },
      {
        key: "dyspnea",
        img: "dyspnea.png",
        text: {
          en: "Dyspnea",
          zh: "呼吸困難",
          vi: "Khó thở",
          th: "หายใจลำบาก",
          id: "Sesak napas",
          ph: "Hirap huminga",
          my: "အသက်ရှူကျပ်",
        },
      },
      {
        key: "chest-pain",
        img: "chest-pain-chest-tightness.png",
        text: {
          en: "Chest pain / tightness",
          zh: "胸痛、胸悶",
          vi: "Đau ngực, tức ngực",
          th: "เจ็บหน้าอก แน่นหน้าอก",
          id: "Nyeri dada, sesak dada",
          ph: "Masakit ang dibdib, mahigpit ang dibdib",
          my: "ရင်ဘတ်အောင့်၊ ရင်ဘတ်ကြပ်",
        },
      },
      {
        key: "dizziness",
        img: "dizziness.png",
        text: {
          en: "Dizziness",
          zh: "頭暈",
          vi: "Chóng mặt",
          th: "เวียนหัว",
          id: "Pusing",
          ph: "Pagkahilo",
          my: "မူးဝေ",
        },
      },
      {
        key: "nausea",
        img: "nausea.png",
        text: {
          en: "Nausea",
          zh: "噁心",
          vi: "Buồn nôn",
          th: "คลื่นไส้",
          id: "Mual",
          ph: "Nasusuka",
          my: "ပျို့ချင်",
        },
      },
      {
        key: "diarrhea",
        img: "diarrhea.png",
        text: {
          en: "Diarrhea",
          zh: "腹瀉",
          vi: "Tiêu chảy",
          th: "ท้องเสีย",
          id: "Diare",
          ph: "Pagtatae",
          my: "ဝမ်းလျှော",
        },
      },
      {
        key: "constipation",
        img: "constipation.png",
        text: {
          en: "Constipation",
          zh: "便秘",
          vi: "Táo bón",
          th: "ท้องผูก",
          id: "Konstipasi",
          ph: "Nadudumi",
          my: "ဝမ်းချုပ်",
        },
      },
      {
        key: "general-soreness",
        img: "general-soreness.png",
        text: {
          en: "General soreness",
          zh: "全身痠痛",
          vi: "Đau nhức toàn thân",
          th: "ปวดเมื่อยตามตัว",
          id: "Nyeri seluruh tubuh",
          ph: "Pananakit ng katawan",
          my: "ကိုယ်လက်ကိုက်ခဲ",
        },
      },
      {
        key: "joint-pain",
        img: "joint-pain.png",
        text: {
          en: "Joint pain",
          zh: "關節痛",
          vi: "Đau khớp",
          th: "ปวดข้อ",
          id: "Nyeri sendi",
          ph: "Masakit ang kasukasuan",
          my: "အဆစ်အမြစ်ကိုက်",
        },
      },
      {
        key: "menstrual-pain",
        img: "mentrual-pain.png",
        text: {
          en: "Menstrual pain",
          zh: "經痛",
          vi: "Đau bụng kinh",
          th: "ปวดประจำเดือน",
          id: "Nyeri haid",
          ph: "Masakit na regla",
          my: "ရာသီအောင့်",
        },
      },
      {
        key: "dysuria",
        img: "dysuria.png",
        text: {
          en: "Dysuria",
          zh: "排尿困難",
          vi: "Đi tiểu khó",
          th: "ปัสสาวะลำบาก",
          id: "Susah buang air kecil",
          ph: "Hirap umihi",
          my: "ဆီးခက်ခဲ",
        },
      },
      {
        key: "insomnia",
        img: "insomnia.png",
        text: {
          en: "Insomnia",
          zh: "失眠",
          vi: "Mất ngủ",
          th: "นอนไม่หลับ",
          id: "Insomnia",
          ph: "Hindi makatulog",
          my: "အိပ်မပျော်",
        },
      },
      {
        key: "itchiness",
        img: "itchiness.png",
        text: {
          en: "Itchiness",
          zh: "搔癢",
          vi: "Ngứa",
          th: "คัน",
          id: "Gatal",
          ph: "Makati",
          my: "ယားယံ",
        },
      },
      {
        key: "malaise",
        img: "malaise.png",
        text: {
          en: "Malaise",
          zh: "不適",
          vi: "Khó chịu",
          th: "ไม่สบายตัว",
          id: "Malaise",
          ph: "Pagkahina",
          my: "မအီမသာ",
        },
      },
      {
        key: "stomachache",
        img: "stomachache.webp",
        text: {
          en: "Stomachache",
          zh: "胃痛",
          vi: "Đau dạ dày",
          th: "ปวดท้อง",
          id: "Sakit perut",
          ph: "Masakit ang tiyan",
          my: "ဗိုက်နာ",
        },
      },
      {
        key: "dental-pain",
        img: "dental-pain.png",
        text: {
          en: "Toothache",
          zh: "牙痛",
          vi: "Đau răng",
          th: "ปวดฟัน",
          id: "Sakit gigi",
          ph: "Masakit ang ngipin",
          my: "သွားနာ",
        },
      },
    ],
  },
  {
    id: 2,
    text: {
      en: "Where does it hurt? Please point to it.",
      zh: "哪邊不舒服？請指給我看",
      vi: "Chỗ nào khó chịu? Chỉ cho tôi xem",
      th: "ไม่สบายตรงไหน? ชี้ให้ฉันดูหน่อย",
      id: "Bagian mana yang tidak nyaman? Tolong tunjukkan",
      ph: "Saan ang masakit? Pakita mo sa akin",
      my: "ဘယ်နေရာမအီမသာဖြစ်လဲ။ ညွှန်ပြပါ။",
    },
  },
  {
    id: 3,
    text: {
      en: "When did the symptoms start? Days? Weeks?",
      zh: "症狀從何時開始？幾天？幾星期？",
      vi: "Triệu chứng bắt đầu từ khi nào? Mấy ngày? Mấy tuần?",
      th: "อาการเริ่มตั้งแต่เมื่อไหร่? กี่วัน? กี่สัปดาห์?",
      id: "Gejala mulai dari kapan? Berapa hari? Berapa minggu?",
      ph: "Kailan nagsimula ang sintomas? Ilang araw? Ilang linggo?",
      my: "ရောဂါလက္ခဏာများ ဘယ်အချိန်က စတင်ခဲ့ပါသလဲ။ ရက်အနည်းငယ်။ သီတင်းအနည်းငယ်။",
    },
  },
  {
    id: 4,
    text: {
      en: "Any drug or food allergies?",
      zh: "有藥物或食物過敏嗎？",
      vi: "Có dị ứng thuốc hoặc thức ăn không?",
      th: "มีการแพ้ยาหรืออาหารหรือไม่?",
      id: "Apakah ada alergi obat atau makanan?",
      ph: "May allergy ba sa gamot o pagkain?",
      my: "ဆေး သို့မဟုတ် အစားအစာ ဓာတ်မတည့်မှုရှိပါသလား။",
    },
  },
  {
    id: 5,
    text: {
      en: "Any chronic diseases such as diabetes, hypertension, heart disease, or others?",
      zh: "有沒有慢性疾病，如糖尿病、高血壓、心臟病，或是其他疾病？",
      vi: "Có bệnh mãn tính không, như tiểu đường, cao huyết áp, bệnh tim, hoặc bệnh khác?",
      th: "มีโรคประจำตัว เช่น เบาหวาน ความดันโลหิตสูง โรคหัวใจ หรือโรคอื่นๆ หรือไม่?",
      id: "Apakah ada penyakit kronis seperti diabetes, tekanan darah tinggi, penyakit jantung, atau penyakit lainnya?",
      ph: "May malalang sakit ba tulad ng diabetes, altapresyon, sakit sa puso, o iba pang sakit?",
      my: "နာတာရှည်ရောဂါများဖြစ်သည့် ဆီးချို၊ သွေးတိုး၊ နှလုံးရောဂါ သို့မဟုတ် အခြားရောဂါများရှိပါသလား။",
    },
  },
  {
    id: 6,
    text: {
      en: "Are you currently pregnant?",
      zh: "請問現在有懷孕嗎？",
      vi: "Hiện tại có thai không?",
      th: "ตอนนี้กำลังตั้งครรภ์หรือไม่?",
      id: "Apakah sedang hamil?",
      ph: "Buntis ka ba ngayon?",
      my: "လက်ရှိ ကိုယ်ဝန်ရှိပါသလား။",
    },
  },
  {
    id: 7,
    text: {
      en: "Do you need an injection?",
      zh: "需要打針嗎？",
      vi: "Cần tiêm không?",
      th: "ต้องฉีดยาไหม?",
      id: "Perlu suntikan?",
      ph: "Kailangan bang mag-injection?",
      my: "ဆေးထိုးရန် လိုအပ်ပါသလား။",
    },
  },
  {
    id: 8,
    text: {
      en: "Three times a day, take after meals.",
      zh: "每天三次，飯後服藥",
      vi: "Ngày ba lần, uống thuốc sau khi ăn",
      th: "วันละสามครั้ง รับประทานยาหลังอาหาร",
      id: "Tiga kali sehari, minum obat setelah makan",
      ph: "Tatlong beses sa isang araw, uminom ng gamot pagkatapos kumain",
      my: "တစ်နေ့ သုံးကြိမ်၊ အစားစားပြီးမှ ဆေးသောက်ပါ။",
    },
  },
  {
    id: 9,
    text: {
      en: "Please clean the wound and change the dressing daily.",
      zh: "請每天清潔傷口並更換紗布",
      vi: "Hãy vệ sinh vết thương và thay băng gạc mỗi ngày",
      th: "กรุณาทำความสะอาดแผลและเปลี่ยนผ้ากอซทุกวัน",
      id: "Harap bersihkan luka dan ganti kasa setiap hari",
      ph: "Paki linis ang sugat at palitan ang benda araw-araw",
      my: "ကျေးဇူးပြု၍ အနာကို နေ့စဉ် သန့်ရှင်းပေးပြီး ပတ်တီးလဲလှယ်ပါ။",
    },
  },
  {
    id: 10,
    text: {
      en: "Return for a follow-up in 3 days.",
      zh: "三天後回來看診",
      vi: "Ba ngày sau quay lại tái khám",
      th: "กลับมาพบแพทย์อีกครั้งในสามวัน",
      id: "Kembali untuk kontrol dalam tiga hari",
      ph: "Bumalik para sa follow-up pagkatapos ng tatlong araw",
      my: "သုံးရက်အကြာတွင် ပြန်လာပြသပါ။",
    },
  },
  {
    id: 11,
    text: {
      en: "Next visit, please bring your employer here. We need to speak with them.",
      zh: "下次看診時請你老闆來這裡，我們有事情要跟他說。",
      vi: "Lần tái khám sau, hãy đưa chủ của bạn đến đây, chúng tôi có việc cần nói với họ.",
      th: "ครั้งหน้ามาพบแพทย์ กรุณาพาเจ้านายของคุณมาที่นี่ เรามีเรื่องต้องคุยกับเขา",
      id: "Saat kontrol berikutnya, tolong bawa atasan Anda ke sini, kami ada perlu bicara dengannya.",
      ph: "Sa susunod na follow-up, pakidala ang boss mo dito, may sasabihin kami sa kanya.",
      my: "နောက်လာပြသည့်အခါ သင့်သူဌေးကို ဤနေရာသို့ ခေါ်လာပါ။ ကျွန်ုပ်တို့ သူနှင့်ပြောစရာရှိပါသည်။",
    },
  },
];

const currentLang = ref<Lang>("en");
const symptomSelections = ref<Record<string, boolean>>(
  Object.fromEntries((questions[0].symptoms ?? []).map((s) => [s.key, false])),
);
const pregnancyMonth = ref<number>(0);
const pregnancyYes = ref<boolean | null>(null);
const injectionYes = ref<boolean | null>(null);
const allergyYes = ref<boolean | null>(null);
const allergyDetail = ref("");
const chronicYes = ref<boolean | null>(null);
const chronicDetail = ref("");
const copied = ref(false);
const showExport = ref(false);

const hasSymptoms = computed(() =>
  Object.values(symptomSelections.value).some((v) => v),
);

const selectedSymptomKeys = computed(() =>
  Object.entries(symptomSelections.value)
    .filter(([, v]) => v)
    .map(([k]) => k),
);

const q1Symptoms = questions[0].symptoms ?? [];

function t(q: Q): string {
  return q.text[currentLang.value] || q.text.en;
}

function zhRef(q: Q): string {
  return q.text.zh;
}

function st(s: Symptom): string {
  return s.text[currentLang.value] || s.text.en;
}

function symptomZhRef(s: Symptom): string {
  return s.text.zh;
}

function reset() {
  Object.keys(symptomSelections.value).forEach(
    (k) => (symptomSelections.value[k] = false),
  );
  pregnancyMonth.value = 0;
  pregnancyYes.value = null;
  injectionYes.value = null;
  allergyYes.value = null;
  allergyDetail.value = "";
  chronicYes.value = null;
  chronicDetail.value = "";
  showExport.value = false;
  copied.value = false;
}

function generateMarkdown() {
  const langLabel =
    langs.find((l) => l.key === currentLang.value)?.label ?? "英文";
  const lines: string[] = [];
  lines.push(`# 外籍門診詢問紀錄 / ${langLabel}\n`);

  const q1 = questions[0];
  lines.push(`## Q1. ${t(q1)}`);
  if (hasSymptoms.value) {
    const names = selectedSymptomKeys.value.map((k) => {
      const s = q1Symptoms.find((s) => s.key === k);
      return s ? st(s) : k;
    });
    lines.push(`- 症狀：${names.join("、")}`);
  } else {
    lines.push("- 症狀：無");
  }
  lines.push("");

  for (let i = 1; i < questions.length; i++) {
    const q = questions[i];
    const qText = t(q);
    let answer = "";

    if (q.id === 6) {
      answer =
        pregnancyYes.value === true
          ? `是（${pregnancyMonth.value || "?"} 個月）`
          : pregnancyYes.value === false
            ? "否"
            : "未填";
    } else if (q.id === 7) {
      answer =
        injectionYes.value === true
          ? "是"
          : injectionYes.value === false
            ? "否"
            : "未填";
    } else if (q.id === 4) {
      answer =
        allergyYes.value === true
          ? `是（${allergyDetail.value || "未填寫"}）`
          : allergyYes.value === false
            ? "否"
            : "未填";
    } else if (q.id === 5) {
      answer =
        chronicYes.value === true
          ? `是（${chronicDetail.value || "未填寫"}）`
          : chronicYes.value === false
            ? "否"
            : "未填";
    }

    lines.push(`## Q${q.id}. ${qText}`);
    if (answer) lines.push(`- ${answer}`);
    lines.push("");
  }

  return lines.join("\n");
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function imgPath(name: string) {
  return withBase(`/reference/clinic/symptoms/${encodeURIComponent(name)}`);
}

function checkboxId(s: Symptom) {
  return `sym-${s.key}`;
}
</script>

<template>
  <div class="fi-wrap">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">foreigner 問診單</span>
        <span class="tab-sub">Foreigner Inquiry</span>
      </button>
    </div>
    <div class="fi">
      <div class="lang-tabs">
        <button
          v-for="l in langs"
          :key="l.key"
          class="lang-tab"
          :class="{ active: currentLang === l.key }"
          @click="currentLang = l.key"
        >
          {{ l.label }}
        </button>
      </div>

      <div class="q-block q-symptom-grid">
        <h3 class="q-title">
          <span class="zh-ref">{{ zhRef(questions[0]) }}</span>
          Q{{ questions[0].id }}. {{ t(questions[0]) }}
        </h3>
        <div class="symptom-grid">
          <label
            v-for="s in q1Symptoms"
            :key="s.key"
            class="symptom-card"
            :class="{ checked: symptomSelections[s.key] }"
            :for="checkboxId(s)"
          >
            <input
              type="checkbox"
              :id="checkboxId(s)"
              v-model="symptomSelections[s.key]"
              class="sym-checkbox"
            />
            <img
              :src="imgPath(s.img)"
              :alt="st(s)"
              class="sym-img"
              loading="lazy"
            />
            <span class="sym-zh-ref">{{ symptomZhRef(s) }}</span>
            <span class="sym-label">{{ st(s) }}</span>
          </label>
        </div>
      </div>

      <div v-for="q in questions.slice(1)" :key="q.id" class="q-block">
        <h3 class="q-title">
          <span class="zh-ref">{{ zhRef(q) }}</span>
          Q{{ q.id }}. {{ t(q) }}
        </h3>

        <div v-if="q.id === 4" class="yn-group">
          <button
            class="yn-btn"
            :class="{ active: allergyYes === true }"
            @click="allergyYes = true"
          >
            是
          </button>
          <button
            class="yn-btn"
            :class="{ active: allergyYes === false }"
            @click="allergyYes = false"
          >
            否
          </button>
          <div v-if="allergyYes" class="detail-input">
            <input
              type="text"
              v-model="allergyDetail"
              placeholder="請記錄過敏原..."
              class="text-input"
            />
          </div>
        </div>

        <div v-if="q.id === 5" class="yn-group">
          <button
            class="yn-btn"
            :class="{ active: chronicYes === true }"
            @click="chronicYes = true"
          >
            是
          </button>
          <button
            class="yn-btn"
            :class="{ active: chronicYes === false }"
            @click="chronicYes = false"
          >
            否
          </button>
          <div v-if="chronicYes" class="detail-input">
            <input
              type="text"
              v-model="chronicDetail"
              placeholder="請記錄慢性病史..."
              class="text-input"
            />
          </div>
        </div>

        <div v-if="q.id === 6" class="yn-group">
          <button
            class="yn-btn"
            :class="{ active: pregnancyYes === true }"
            @click="pregnancyYes = true"
          >
            是
          </button>
          <button
            class="yn-btn"
            :class="{ active: pregnancyYes === false }"
            @click="pregnancyYes = false"
          >
            否
          </button>
          <div v-if="pregnancyYes" class="month-input">
            <input
              type="number"
              min="1"
              max="9"
              v-model.number="pregnancyMonth"
              placeholder="月份"
            />
            <span>個月</span>
          </div>
        </div>

        <div v-if="q.id === 7" class="yn-group">
          <button
            class="yn-btn"
            :class="{ active: injectionYes === true }"
            @click="injectionYes = true"
          >
            是
          </button>
          <button
            class="yn-btn"
            :class="{ active: injectionYes === false }"
            @click="injectionYes = false"
          >
            否
          </button>
        </div>
      </div>

      <div class="fi-actions">
        <button class="btn-view" @click="showExport = !showExport">
          {{ showExport ? "收起" : "查看 Markdown 結果" }}
        </button>
        <button class="btn-copy" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>

      <div v-if="showExport" class="export-box">
        <pre class="export-pre">{{ generateMarkdown() }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fi-wrap {
  max-width: 860px;
  margin: 0 auto;
}
.fi {
  padding: 2rem 0 3rem;
  font-size: 1rem;
}

.lang-tabs {
  display: flex;
  gap: 4px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}
.lang-tab {
  padding: 6px 18px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.lang-tab:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.lang-tab.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.q-block {
  margin-bottom: 1.5rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}
.q-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.75rem;
  border: none !important;
  padding: 0 !important;
}
.zh-ref {
  display: block;
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
  margin-bottom: 2px;
}

.symptom-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.6rem;
}
.symptom-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 0.75rem 0.5rem;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
}
.symptom-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.symptom-card.checked {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}
.sym-checkbox {
  display: none;
}
.sym-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 8px;
}
.dark .sym-img {
  background: rgba(255, 255, 255, 0.08);
}
.sym-zh-ref {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
  line-height: 1.3;
}
.sym-label {
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  line-height: 1.3;
}

.yn-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.yn-btn {
  padding: 6px 24px;
  border-radius: 8px;
  border: 1.5px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}
.yn-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.yn-btn.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
}
.month-input {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: 0.5rem;
}
.month-input input {
  width: 60px;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
}
.month-input span,
.detail-input span {
  font-size: 0.92rem;
  color: var(--vp-c-text-2);
}
.detail-input {
  margin-left: 0.5rem;
  flex: 1;
  min-width: 180px;
}
.text-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  font-size: 0.95rem;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: inherit;
  box-sizing: border-box;
}
.text-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 0 0 2px var(--vp-c-brand-soft);
}

.fi-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.btn-view,
.btn-copy,
.btn-reset {
  padding: 9px 22px;
  border-radius: 8px;
  font-size: 0.95rem;
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

.export-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  overflow: hidden;
  background: var(--vp-c-bg-mute);
}
.export-pre {
  padding: 1rem 1.25rem;
  font-size: 0.9rem;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  color: var(--vp-c-text-1);
  font-family: monospace;
}

@media (max-width: 768px) {
  .symptom-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 480px) {
  .symptom-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 640px) {
  .q-block {
    padding: 0.75rem;
  }
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
}

/* ── Tab bar ────────────────────────────────────────────────────── */
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
</style>
