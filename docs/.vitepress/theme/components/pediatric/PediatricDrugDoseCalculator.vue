<script setup lang="ts">
import { ref, computed, watch } from "vue";

// ── Drug Data ─────────────────────────────────────────────────────
const drugs = [
  // ── Analgesics / Antipyretics ──
  {
    id: "acetaminophen",
    name: "Acetaminophen",
    nameZh: "乙醯胺酚",
    category: "Analgesics",
    categoryZh: "解熱鎮痛",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q4-6h",
    maxSingle: 1000,
    maxDaily: 75,
    maxDailyUnit: "mg/kg/day",
    route: "PO/PR",
    interval: 4,
    notes: "每日最大劑量不超過 4g；肝功能異常者減量",
    color: "acet",
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen",
    nameZh: "布洛芬",
    category: "Analgesics",
    categoryZh: "NSAIDs",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 400,
    maxDaily: 40,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "腎功能不全、脫水者慎用；飯後服用",
    color: "ibu",
  },
  {
    id: "morphine",
    name: "Morphine",
    nameZh: "Morphine",
    category: "Analgesics",
    categoryZh: "Opioids",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "q4h PRN",
    maxSingle: 15,
    maxDaily: 1,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV/SC",
    interval: 4,
    notes: "嚴重疼痛；呼吸抑制風險，需監測",
    color: "morph",
  },
  // ── Antibiotics: Penicillins ──
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    nameZh: "Amoxicillin",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 25,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 500,
    maxDaily: 80,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 8,
    notes: "高劑量 80-90 mg/kg/day 用於中耳炎/鼻竇炎",
    color: "amox",
  },
  {
    id: "amox-clav",
    name: "Amoxicillin-Clavulanate",
    nameZh: "Amoxicillin-Clavulanate",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 25,
    doseUnit: "mg/kg Amoxicillin",
    frequency: "q8-12h",
    maxSingle: 500,
    maxDaily: 80,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 8,
    notes: "20:1 或 14:1 配方；飯後服用減少腸胃不適",
    color: "amox",
  },
  {
    id: "ampicillin",
    name: "Ampicillin",
    nameZh: "Ampicillin",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 25,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 500,
    maxDaily: 200,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 6,
    notes: "腦膜炎高劑量 200-300 mg/kg/day IV",
    color: "amox",
  },
  {
    id: "penicillin-v",
    name: "Penicillin V",
    nameZh: "Penicillin V",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 500,
    maxDaily: 50,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "鏈球菌咽喉炎、風濕熱預防",
    color: "amox",
  },
  {
    id: "cloxacillin",
    name: "Cloxacillin",
    nameZh: "Cloxacillin",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 500,
    maxDaily: 100,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 6,
    notes: "MSSA 感染",
    color: "amox",
  },
  {
    id: "flucloxacillin",
    name: "Flucloxacillin",
    nameZh: "Flucloxacillin",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 500,
    maxDaily: 100,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 6,
    notes: "MSSA 感染；注意膽汁淤積性黃疸",
    color: "amox",
  },
  // ── Antibiotics: Cephalosporins ──
  {
    id: "cefazolin",
    name: "Cefazolin",
    nameZh: "Cefazolin",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 25,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 1000,
    maxDaily: 150,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IM",
    interval: 8,
    notes: "術前預防用藥；最大單劑 2g",
    color: "cef",
  },
  {
    id: "cephalexin",
    name: "Cephalexin",
    nameZh: "Cephalexin",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 25,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 500,
    maxDaily: 100,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "皮膚軟組織感染、UTI",
    color: "cef",
  },
  {
    id: "cefaclor",
    name: "Cefaclor",
    nameZh: "Cefaclor",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 500,
    maxDaily: 40,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 8,
    notes: "中耳炎、上呼吸道感染",
    color: "cef",
  },
  {
    id: "cefadroxil",
    name: "Cefadroxil",
    nameZh: "Cefadroxil",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 500,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "皮膚感染、UTI",
    color: "cef",
  },
  {
    id: "cefdinir",
    name: "Cefdinir",
    nameZh: "Cefdinir",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 7,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 300,
    maxDaily: 14,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "中耳炎、鼻竇炎、皮膚感染",
    color: "cef",
  },
  {
    id: "cefixime",
    name: "Cefixime",
    nameZh: "Cefixime",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 8,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 400,
    maxDaily: 8,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "中耳炎、鼻竇炎、UTI",
    color: "cef",
  },
  {
    id: "cefpodoxime",
    name: "Cefpodoxime",
    nameZh: "Cefpodoxime",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 200,
    maxDaily: 10,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "中耳炎、鼻竇炎",
    color: "cef",
  },
  {
    id: "cefprozil",
    name: "Cefprozil",
    nameZh: "Cefprozil",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 500,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "中耳炎、鼻竇炎、皮膚感染",
    color: "cef",
  },
  {
    id: "cefuroxime",
    name: "Cefuroxime",
    nameZh: "Cefuroxime",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q8-12h",
    maxSingle: 500,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "中耳炎、鼻竇炎、下呼吸道感染",
    color: "cef",
  },
  {
    id: "ceftriaxone",
    name: "Ceftriaxone",
    nameZh: "Ceftriaxone",
    category: "Antibiotics",
    categoryZh: "Cephalosporins",
    dosePerKg: 50,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 2000,
    maxDaily: 100,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IM",
    interval: 12,
    notes: "腦膜炎、嚴重感染；避免與含鈣溶液同時",
    color: "cef",
  },
  // ── Antibiotics: Macrolides ──
  {
    id: "azithromycin",
    name: "Azithromycin",
    nameZh: "Azithromycin",
    category: "Antibiotics",
    categoryZh: "Macrolides",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "day1: 10mg/kg, then 5mg/kg/day × 4d",
    maxSingle: 500,
    maxDaily: 500,
    maxDailyUnit: "mg/day",
    route: "PO",
    interval: 24,
    notes: "3-day 或 5-day 療程；QT 延長者慎用",
    color: "azit",
  },
  {
    id: "erythromycin",
    name: "Erythromycin",
    nameZh: "Erythromycin",
    category: "Antibiotics",
    categoryZh: "Macrolides",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 500,
    maxDaily: 50,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "腸胃道動力促進劑；QT 延長者慎用",
    color: "azit",
  },
  {
    id: "clarithromycin",
    name: "Clarithromycin",
    nameZh: "Clarithromycin",
    category: "Antibiotics",
    categoryZh: "Macrolides",
    dosePerKg: 7.5,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 500,
    maxDaily: 15,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "中耳炎、鼻竇炎；QT 延長者慎用",
    color: "azit",
  },
  // ── Antibiotics: Quinolones ──
  {
    id: "ciprofloxacin",
    name: "Ciprofloxacin",
    nameZh: "Ciprofloxacin",
    category: "Antibiotics",
    categoryZh: "Fluoroquinolones",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "q8-12h",
    maxSingle: 750,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "UTI、嚴重感染；18歲以下慎用（軟骨毒性）",
    color: "cipro",
  },
  {
    id: "levofloxacin",
    name: "Levofloxacin",
    nameZh: "Levofloxacin",
    category: "Antibiotics",
    categoryZh: "Fluoroquinolones",
    dosePerKg: 8,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 750,
    maxDaily: 8,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 12,
    notes: "嚴重感染；18歲以下慎用",
    color: "cipro",
  },
  // ── Antibiotics: Others ──
  {
    id: "tmpsmx",
    name: "TMP-SMX",
    nameZh: "Trimethoprim-Sulfamethoxazole",
    category: "Antibiotics",
    categoryZh: "Sulfonamides",
    dosePerKg: 5,
    doseUnit: "mg/kg TMP",
    frequency: "q12h",
    maxSingle: 160,
    maxDaily: 20,
    maxDailyUnit: "mg/kg/day TMP",
    route: "PO",
    interval: 12,
    notes: "UTI、中耳炎；G6PD 缺乏者禁忌",
    color: "tmp",
  },
  {
    id: "metronidazole",
    name: "Metronidazole",
    nameZh: "Metronidazole",
    category: "Antibiotics",
    categoryZh: "Nitroimidazoles",
    dosePerKg: 7.5,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 500,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "厭氧菌感染；避免與酒精併用",
    color: "metro",
  },
  {
    id: "clindamycin",
    name: "Clindamycin",
    nameZh: "Clindamycin",
    category: "Antibiotics",
    categoryZh: "Lincosamides",
    dosePerKg: 8,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 600,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 6,
    notes: "皮膚感染、厭氧菌；偽膜性腸炎風險",
    color: "clinda",
  },
  {
    id: "doxycycline",
    name: "Doxycycline",
    nameZh: "Doxycycline",
    category: "Antibiotics",
    categoryZh: "Tetracyclines",
    dosePerKg: 2.2,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 100,
    maxDaily: 4.4,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 12,
    notes: "8歲以下牙齒染色；萊姆病、恙蟲病",
    color: "doxy",
  },
  {
    id: "linezolid",
    name: "Linezolid",
    nameZh: "Linezolid",
    category: "Antibiotics",
    categoryZh: "Oxazolidinones",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 600,
    maxDaily: 30,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "MRSA、VRE感染；超過14天需監測血小板",
    color: "line",
  },
  {
    id: "vancomycin",
    name: "Vancomycin",
    nameZh: "Vancomycin",
    category: "Antibiotics",
    categoryZh: "Glycopeptides",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 1000,
    maxDaily: 60,
    maxDailyUnit: "mg/kg/day",
    route: "IV",
    interval: 6,
    notes: "MRSA感染；需監測trough level 5-15 mcg/mL",
    color: "vanc",
  },
  {
    id: "nitrofurantoin",
    name: "Nitrofurantoin",
    nameZh: "Nitrofurantoin",
    category: "Antibiotics",
    categoryZh: "Nitrofurans",
    dosePerKg: 1.5,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 100,
    maxDaily: 6,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "UTI預防/治療；G6PD缺乏者禁忌",
    color: "nitro",
  },
  {
    id: "rifampin",
    name: "Rifampin",
    nameZh: "Rifampin",
    category: "Antibiotics",
    categoryZh: "Rifamycins",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 600,
    maxDaily: 20,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 12,
    notes: "結核病；尿液/淚液變橘紅色",
    color: "rif",
  },
  {
    id: "sultamicillin",
    name: "Sultamicillin",
    nameZh: "Sultamicillin",
    category: "Antibiotics",
    categoryZh: "Penicillins",
    dosePerKg: 25,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 750,
    maxDaily: 50,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "口服ampicillin前體藥",
    color: "amox",
  },
  // ── Antifungals ──
  {
    id: "fluconazole",
    name: "Fluconazole",
    nameZh: "Fluconazole",
    category: "Antifungals",
    categoryZh: "Azoles",
    dosePerKg: 3,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 400,
    maxDaily: 6,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 24,
    notes: "念珠菌感染；肝功能監測",
    color: "fungal",
  },
  {
    id: "itraconazole",
    name: "Itraconazole",
    nameZh: "Itraconazole",
    category: "Antifungals",
    categoryZh: "Azoles",
    dosePerKg: 3,
    doseUnit: "mg/kg",
    frequency: "q12-24h",
    maxSingle: 200,
    maxDaily: 5,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "系統性黴菌感染；需酸性環境吸收",
    color: "fungal",
  },
  {
    id: "nystatin",
    name: "Nystatin",
    nameZh: "Nystatin",
    category: "Antifungals",
    categoryZh: "Polyenes",
    dosePerKg: 0.2,
    doseUnit: "MU/kg",
    frequency: "q6h",
    maxSingle: 500000,
    maxDaily: 1,
    maxDailyUnit: "MU/kg/day",
    route: "PO (oral suspension)",
    interval: 6,
    notes: "口腔念珠菌；含漱後吞服",
    color: "fungal",
  },
  // ── Antihistamines ──
  {
    id: "cetirizine",
    name: "Cetirizine",
    nameZh: "Cetirizine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 0.25,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 10,
    maxDaily: 0.25,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "2-5歲: 2.5mg/day; 6-11歲: 5-10mg/day",
    color: "anti_h",
  },
  {
    id: "loratadine",
    name: "Loratadine",
    nameZh: "Loratadine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 0.2,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 10,
    maxDaily: 0.2,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "2-5歲: 5mg/day; >5歲: 10mg/day",
    color: "anti_h",
  },
  {
    id: "fexofenadine",
    name: "Fexofenadine",
    nameZh: "Fexofenadine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 1.5,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 180,
    maxDaily: 3,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "2-5歲: 30mg BID; 6-11歲: 60mg BID",
    color: "anti_h",
  },
  {
    id: "levocetirizine",
    name: "Levocetirizine",
    nameZh: "Levocetirizine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 0.125,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 5,
    maxDaily: 0.125,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "6月-5歲: 1.25mg/day; 6-11歲: 2.5-5mg/day",
    color: "anti_h",
  },
  {
    id: "chlorpheniramine",
    name: "Chlorpheniramine",
    nameZh: "Chlorpheniramine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "q4-6h",
    maxSingle: 4,
    maxDaily: 0.6,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 4,
    notes: "第一代抗組織胺；嗜睡副作用",
    color: "anti_h",
  },
  {
    id: "diphenhydramine",
    name: "Diphenhydramine",
    nameZh: "Diphenhydramine",
    category: "Antihistamines",
    categoryZh: "Antihistamines",
    dosePerKg: 1.25,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 50,
    maxDaily: 5,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV/IM",
    interval: 6,
    notes: "過敏反應、暈車；嗜睡、抗膽鹼作用",
    color: "anti_h",
  },
  // ── GI ──
  {
    id: "omeprazole",
    name: "Omeprazole",
    nameZh: "Omeprazole",
    category: "GI",
    categoryZh: "PPIs",
    dosePerKg: 0.7,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 40,
    maxDaily: 1.4,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "食道逆流、胃潰瘍；早餐前30分鐘服用",
    color: "gi",
  },
  {
    id: "lansoprazole",
    name: "Lansoprazole",
    nameZh: "Lansoprazole",
    category: "GI",
    categoryZh: "PPIs",
    dosePerKg: 1,
    doseUnit: "mg/kg",
    frequency: "daily",
    maxSingle: 30,
    maxDaily: 2,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "食道逆流；空腹服用",
    color: "gi",
  },
  {
    id: "famotidine",
    name: "Famotidine",
    nameZh: "Famotidine",
    category: "GI",
    categoryZh: "H2 Blockers",
    dosePerKg: 0.25,
    doseUnit: "mg/kg",
    frequency: "q12h",
    maxSingle: 20,
    maxDaily: 0.5,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 12,
    notes: "胃食道逆流、消化性潰瘍",
    color: "gi",
  },
  {
    id: "ranitidine",
    name: "Ranitidine",
    nameZh: "Ranitidine",
    category: "GI",
    categoryZh: "H2 Blockers",
    dosePerKg: 2,
    doseUnit: "mg/kg",
    frequency: "q8-12h",
    maxSingle: 150,
    maxDaily: 6,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "胃食道逆流；多國已下架（NDMA）",
    color: "gi",
  },
  {
    id: "ondansetron",
    name: "Ondansetron",
    nameZh: "Ondansetron",
    category: "GI",
    categoryZh: "Antiemetics",
    dosePerKg: 0.15,
    doseUnit: "mg/kg",
    frequency: "q8h PRN",
    maxSingle: 4,
    maxDaily: 0.45,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "止吐；單劑即可止嘔；QT 延長者慎用",
    color: "gi",
  },
  {
    id: "metoclopramide",
    name: "Metoclopramide",
    nameZh: "Metoclopramide",
    category: "GI",
    categoryZh: "Antiemetics",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 10,
    maxDaily: 0.5,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 6,
    notes: "止吐、胃動力；不超过5天（錐體外徑症狀）",
    color: "gi",
  },
  {
    id: "domperidone",
    name: "Domperidone",
    nameZh: "Domperidone",
    category: "GI",
    categoryZh: "Prokinetics",
    dosePerKg: 0.25,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 10,
    maxDaily: 0.75,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "止吐、胃排空延遲；心臟風險",
    color: "gi",
  },
  {
    id: "loperamide",
    name: "Loperamide",
    nameZh: "Loperamide",
    category: "GI",
    categoryZh: "Antidiarrheals",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "q4-6h",
    maxSingle: 4,
    maxDaily: 0.3,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 4,
    notes: "止瀉；2歲以下不建議使用",
    color: "gi",
  },
  {
    id: "polyethylene-glycol",
    name: "PEG 3350",
    nameZh: "Polyethylene Glycol",
    category: "GI",
    categoryZh: "Laxatives",
    dosePerKg: 0.5,
    doseUnit: "g/kg",
    frequency: "daily",
    maxSingle: 17,
    maxDaily: 0.5,
    maxDailyUnit: "g/kg/day",
    route: "PO",
    interval: 24,
    notes: "便祕；口感好，可溶於液體",
    color: "gi",
  },
  {
    id: "lactulose",
    name: "Lactulose",
    nameZh: "Lactulose",
    category: "GI",
    categoryZh: "Laxatives",
    dosePerKg: 1,
    doseUnit: "mL/kg",
    frequency: "daily",
    maxSingle: 30,
    maxDaily: 3,
    maxDailyUnit: "mL/kg/day",
    route: "PO",
    interval: 24,
    notes: "便祕；調整劑量至每天2-3次軟便",
    color: "gi",
  },
  // ── Respiratory ──
  {
    id: "salbutamol",
    name: "Salbutamol",
    nameZh: "Salbutamol",
    category: "Respiratory",
    categoryZh: "Beta-2 Agonist",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "q20min × 3",
    maxSingle: 5,
    maxDaily: 15,
    maxDailyUnit: "mg/day",
    route: "MDI/NEB",
    interval: 20,
    notes: "氣喘急性發作；NEB 濃度 0.5%（5 mg/mL）",
    color: "resp",
  },
  {
    id: "ipratropium",
    name: "Ipratropium",
    nameZh: "Ipratropium",
    category: "Respiratory",
    categoryZh: "Anticholinergics",
    dosePerKg: 0.025,
    doseUnit: "mg/kg",
    frequency: "q20min × 3",
    maxSingle: 0.5,
    maxDaily: 1.5,
    maxDailyUnit: "mg/day",
    route: "NEB",
    interval: 20,
    notes: "氣喘急性發作；可與 Salbutamol 合併使用",
    color: "resp",
  },
  {
    id: "montelukast",
    name: "Montelukast",
    nameZh: "Montelukast",
    category: "Respiratory",
    categoryZh: "Leukotriene Antagonist",
    dosePerKg: 0.08,
    doseUnit: "mg/kg",
    frequency: "daily (bedtime)",
    maxSingle: 10,
    maxDaily: 0.08,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "氣喘預防、過敏性鼻炎；睡前服用",
    color: "resp",
  },
  {
    id: "prednisolone",
    name: "Prednisolone",
    nameZh: "Prednisolone",
    category: "Respiratory",
    categoryZh: "Corticosteroids",
    dosePerKg: 1,
    doseUnit: "mg/kg",
    frequency: "daily × 3-5d",
    maxSingle: 40,
    maxDaily: 2,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 24,
    notes: "氣喘急性發作；長期使用需逐漸減量",
    color: "pred",
  },
  {
    id: "dexamethasone",
    name: "Dexamethasone",
    nameZh: "Dexamethasone",
    category: "Respiratory",
    categoryZh: "Corticosteroids",
    dosePerKg: 0.6,
    doseUnit: "mg/kg",
    frequency: "q6h × 24h or single dose",
    maxSingle: 16,
    maxDaily: 16,
    maxDailyUnit: "mg/day",
    route: "PO/IV/IM",
    interval: 6,
    notes: " croup（哮吼）單劑 0.6 mg/kg；止吐 0.15 mg/kg",
    color: "pred",
  },
  {
    id: "hydrocortisone",
    name: "Hydrocortisone",
    nameZh: "Hydrocortisone",
    category: "Respiratory",
    categoryZh: "Corticosteroids",
    dosePerKg: 4,
    doseUnit: "mg/kg",
    frequency: "q6-8h",
    maxSingle: 200,
    maxDaily: 20,
    maxDailyUnit: "mg/kg/day",
    route: "IV",
    interval: 6,
    notes: "氣喘持續狀態；腎上腺危象",
    color: "pred",
  },
  // ── Antivirals ──
  {
    id: "oseltamivir",
    name: "Oseltamivir",
    nameZh: "Oseltamivir",
    category: "Antivirals",
    categoryZh: "Neuraminidase Inhibitor",
    dosePerKg: 2,
    doseUnit: "mg/kg",
    frequency: "q12h × 5d",
    maxSingle: 75,
    maxDaily: 4,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "流感治療/預防；發病48小時內使用",
    color: "viral",
  },
  {
    id: "acyclovir",
    name: "Acyclovir",
    nameZh: "Acyclovir",
    category: "Antivirals",
    categoryZh: "Antivirals",
    dosePerKg: 20,
    doseUnit: "mg/kg",
    frequency: "q8h (severe) / q5h",
    maxSingle: 800,
    maxDaily: 60,
    maxDailyUnit: "mg/kg/day",
    route: "PO/IV",
    interval: 8,
    notes: "水痘、庖疹；嚴重感染需IV",
    color: "viral",
  },
  // ── Antiparasitic ──
  {
    id: "albendazole",
    name: "Albendazole",
    nameZh: "Albendazole",
    category: "Antiparasitic",
    categoryZh: "Antiparasitic",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "daily × 3d",
    maxSingle: 400,
    maxDaily: 400,
    maxDailyUnit: "mg/day",
    route: "PO",
    interval: 24,
    notes: "蛔蟲、鞭蟲；與含脂肪食物同服增加吸收",
    color: "para",
  },
  {
    id: "mebendazole",
    name: "Mebendazole",
    nameZh: "Mebendazole",
    category: "Antiparasitic",
    categoryZh: "Antiparasitic",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "daily × 3d",
    maxSingle: 100,
    maxDaily: 100,
    maxDailyUnit: "mg/day",
    route: "PO",
    interval: 24,
    notes: "蛔蟲、鞭蟲、蟯蟲",
    color: "para",
  },
  {
    id: "metronidazole-para",
    name: "Metronidazole (Giardia)",
    nameZh: "Metronidazole (鞭蟲)",
    category: "Antiparasitic",
    categoryZh: "Antiparasitic",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "q8h × 5-7d",
    maxSingle: 250,
    maxDaily: 15,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 8,
    notes: "Giardia、阿米巴原蟲",
    color: "para",
  },
  {
    id: "nitazoxanide",
    name: "Nitazoxanide",
    nameZh: "Nitazoxanide",
    category: "Antiparasitic",
    categoryZh: "Antiparasitic",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "q12h × 3d",
    maxSingle: 500,
    maxDaily: 10,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 12,
    notes: "隱孢子蟲、梨形蟲腹瀉",
    color: "para",
  },
  {
    id: "pyrantel",
    name: "Pyrantel Pamoate",
    nameZh: "Pyrantel",
    category: "Antiparasitic",
    categoryZh: "Anthelmintics",
    dosePerKg: 10,
    doseUnit: "mg/kg",
    frequency: "single dose",
    maxSingle: 1000,
    maxDaily: 10,
    maxDailyUnit: "mg/kg",
    route: "PO",
    interval: 999,
    notes: "蛔蟲、鉤蟲、蟯蟲；單劑服用",
    color: "para",
  },
  // ── GI Protective ──
  {
    id: "sucralfate",
    name: "Sucralfate",
    nameZh: "Sucralfate",
    category: "GI",
    categoryZh: "GI Protectants",
    dosePerKg: 20,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 1000,
    maxDaily: 80,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "胃潰瘍保護；空腹服用，避免與PPI同服",
    color: "gi",
  },
  // ── Analgesics: Others ──
  {
    id: "naproxen",
    name: "Naproxen",
    nameZh: "Naproxen",
    category: "Analgesics",
    categoryZh: "NSAIDs",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "q8-12h",
    maxSingle: 500,
    maxDaily: 15,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 8,
    notes: "消炎止痛；腎功能不全、脫水者慎用",
    color: "ibu",
  },
  {
    id: "ketorolac",
    name: "Ketorolac",
    nameZh: "Ketorolac",
    category: "Analgesics",
    categoryZh: "NSAIDs",
    dosePerKg: 0.5,
    doseUnit: "mg/kg",
    frequency: "q6h (max 5d)",
    maxSingle: 15,
    maxDaily: 2,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IM",
    interval: 6,
    notes: "急性疼痛；不超過5天",
    color: "ibu",
  },
  {
    id: "acetaminophen-iv",
    name: "Acetaminophen IV",
    nameZh: "乙醯胺酚 IV",
    category: "Analgesics",
    categoryZh: "Analgesics IV",
    dosePerKg: 15,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 1000,
    maxDaily: 60,
    maxDailyUnit: "mg/kg/day",
    route: "IV",
    interval: 6,
    notes: "無法口服時IV使用；最大單劑1g（>50kg）",
    color: "acet",
  },
  // ── Sedation / Anesthesia ──
  {
    id: "midazolam",
    name: "Midazolam",
    nameZh: "Midazolam",
    category: "Sedation",
    categoryZh: "Benzodiazepines",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "PRN",
    maxSingle: 5,
    maxDaily: 0.2,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IM/IN",
    interval: 5,
    notes: "鎮靜、癲癇持續狀態；IM比IV吸收慢",
    color: "sed",
  },
  {
    id: "ketamine",
    name: "Ketamine",
    nameZh: "Ketamine",
    category: "Sedation",
    categoryZh: "Dissociative",
    dosePerKg: 1,
    doseUnit: "mg/kg IV / 4 mg/kg IM",
    frequency: "PRN",
    maxSingle: 100,
    maxDaily: 5,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IM",
    interval: 5,
    notes: "程序性鎮靜；氣道張力保留",
    color: "sed",
  },
  {
    id: "fentanyl",
    name: "Fentanyl",
    nameZh: "Fentanyl",
    category: "Sedation",
    categoryZh: "Opioids IV",
    dosePerKg: 0.001,
    doseUnit: "mg/kg",
    frequency: "q3-5min PRN",
    maxSingle: 0.05,
    maxDaily: 0.003,
    maxDailyUnit: "mg/kg/day",
    route: "IV/IN",
    interval: 3,
    notes: "程序性鎮靜、嚴重疼痛；起效快、持續短",
    color: "sed",
  },
  {
    id: "propofol",
    name: "Propofol",
    nameZh: "Propofol",
    category: "Sedation",
    categoryZh: "General Anesthetics",
    dosePerKg: 2.5,
    doseUnit: "mg/kg",
    frequency: "PRN (1-2 min)",
    maxSingle: 200,
    maxDaily: 5,
    maxDailyUnit: "mg/kg/day",
    route: "IV",
    interval: 2,
    notes: "快速誘導、程序性鎮靜；需監測呼吸",
    color: "sed",
  },
  // ── Cardiovascular ──
  {
    id: "epinephrine",
    name: "Epinephrine",
    nameZh: "Epinephrine",
    category: "Cardiovascular",
    categoryZh: "Catecholamines",
    dosePerKg: 0.01,
    doseUnit: "mg/kg",
    frequency: "q3-5min (cardiac arrest)",
    maxSingle: 1,
    maxDaily: 1,
    maxDailyUnit: "mg/dose",
    route: "IV/IO/IM",
    interval: 3,
    notes: "心跳停止：0.01mg/kg IV/IO；過敏：0.01mg/kg IM",
    color: "cardio",
  },
  {
    id: "atropine",
    name: "Atropine",
    nameZh: "Atropine",
    category: "Cardiovascular",
    categoryZh: "Anticholinergics",
    dosePerKg: 0.02,
    doseUnit: "mg/kg",
    frequency: "q5min (max 3 doses)",
    maxSingle: 0.5,
    maxDaily: 1,
    maxDailyUnit: "mg/dose",
    route: "IV/IO",
    interval: 5,
    notes: "心搏過慢；最小單劑 0.1mg",
    color: "cardio",
  },
  {
    id: "adenosine",
    name: "Adenosine",
    nameZh: "Adenosine",
    category: "Cardiovascular",
    categoryZh: "Antiarrhythmics",
    dosePerKg: 0.1,
    doseUnit: "mg/kg",
    frequency: "1st dose; 2nd dose: 0.2 mg/kg",
    maxSingle: 6,
    maxDaily: 12,
    maxDailyUnit: "mg/dose (2nd dose)",
    route: "IV (rapid push)",
    interval: 2,
    notes: "SVT；快速靜推，NS flush",
    color: "cardio",
  },
  {
    id: "amiodarone",
    name: "Amiodarone",
    nameZh: "Amiodarone",
    category: "Cardiovascular",
    categoryZh: "Antiarrhythmics",
    dosePerKg: 5,
    doseUnit: "mg/kg",
    frequency: "VT/VF arrest",
    maxSingle: 300,
    maxDaily: 300,
    maxDailyUnit: "mg/dose",
    route: "IV/IO",
    interval: 5,
    notes: "室颤/無脈性室速；可重複",
    color: "cardio",
  },
  // ── Emergency ──
  {
    id: "naloxone",
    name: "Naloxone",
    nameZh: "Naloxone",
    category: "Emergency",
    categoryZh: "Antidotes",
    dosePerKg: 0.01,
    doseUnit: "mg/kg",
    frequency: "q2-3min PRN",
    maxSingle: 2,
    maxDaily: 10,
    maxDailyUnit: "mg/dose",
    route: "IV/IM/IN",
    interval: 2,
    notes: "鴉片類過量；可微調，避免戒斷症狀",
    color: "emer",
  },
  {
    id: "dextrose",
    name: "Dextrose 10%",
    nameZh: "Dextrose 10%",
    category: "Emergency",
    categoryZh: "Electrolytes",
    dosePerKg: 2,
    doseUnit: "mL/kg",
    frequency: "PRN",
    maxSingle: 50,
    maxDaily: 10,
    maxDailyUnit: "mL/kg",
    route: "IV",
    interval: 5,
    notes: "低血糖；新生兒用D10W，兒童可用D25W",
    color: "emer",
  },
  {
    id: "sodium-bicarbonate",
    name: "NaHCO₃",
    nameZh: "Sodium Bicarbonate",
    category: "Emergency",
    categoryZh: "Electrolytes",
    dosePerKg: 1,
    doseUnit: "mEq/kg",
    frequency: "PRN",
    maxSingle: 50,
    maxDaily: 50,
    maxDailyUnit: "mEq/dose",
    route: "IV",
    interval: 10,
    notes: "代謝性酸中毒、高鉀血症；緩慢給予",
    color: "emer",
  },
  {
    id: "calcium-gluconate",
    name: "Calcium Gluconate",
    nameZh: "Calcium Gluconate",
    category: "Emergency",
    categoryZh: "Electrolytes",
    dosePerKg: 50,
    doseUnit: "mg/kg",
    frequency: "PRN",
    maxSingle: 1000,
    maxDaily: 100,
    maxDailyUnit: "mg/kg",
    route: "IV",
    interval: 10,
    notes: "低血鈣、高鉀血症；心電圖監測",
    color: "emer",
  },
  {
    id: "intralipid",
    name: "Intralipid 20%",
    nameZh: "Intralipid",
    category: "Emergency",
    categoryZh: "Antidotes",
    dosePerKg: 1.5,
    doseUnit: "mL/kg",
    frequency: "1-2 min; then 0.25 mL/kg/min",
    maxSingle: 100,
    maxDaily: 12,
    maxDailyUnit: "mL/kg (total)",
    route: "IV",
    interval: 1,
    notes: "LAST（局部麻醉藥全身毒性）；1-2分鐘內推注",
    color: "emer",
  },
  // ── GI Prokinetics ──
  {
    id: "erythromycin-prokinetic",
    name: "Erythromycin (Prokinetic)",
    nameZh: "Erythromycin 胃動力劑",
    category: "GI",
    categoryZh: "Prokinetics",
    dosePerKg: 1,
    doseUnit: "mg/kg",
    frequency: "q8h",
    maxSingle: 50,
    maxDaily: 3,
    maxDailyUnit: "mg/kg/day",
    route: "IV/PO",
    interval: 8,
    notes: "胃排空延遲、嘔吐；低劑量使用",
    color: "gi",
  },
  {
    id: "erythromycin-antibiotic",
    name: "Erythromycin (Antibiotic)",
    nameZh: "Erythromycin 抗生素",
    category: "Antibiotics",
    categoryZh: "Macrolides",
    dosePerKg: 12.5,
    doseUnit: "mg/kg",
    frequency: "q6h",
    maxSingle: 500,
    maxDaily: 50,
    maxDailyUnit: "mg/kg/day",
    route: "PO",
    interval: 6,
    notes: "抗感染用；QT 延長者慎用",
    color: "azit",
  },
];

// ── State ─────────────────────────────────────────────────────────
const searchQuery = ref("");
const selectedDrugs = ref<(typeof drugs)[number][]>([]);
const weight = ref<number>(20);
const showResults = ref(false);
const copied = ref(false);

const filteredDrugs = computed(() => {
  const q = searchQuery.value.toLowerCase();
  let result = drugs;
  if (q) {
    result = drugs.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.nameZh.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q) ||
        d.categoryZh.toLowerCase().includes(q),
    );
  }
  return [...result].sort((a, b) => a.name.localeCompare(b.name));
});

const isSelected = (id: string) => selectedDrugs.value.some((d) => d.id === id);

// ── Dose helpers ──────────────────────────────────────────────────
function doseFor(drug: (typeof drugs)[number]) {
  const w = weight.value;
  const single = Math.round(Math.min(w * drug.dosePerKg, drug.maxSingle));
  const maxDailyMg = drug.maxDailyUnit.includes("kg")
    ? w * drug.maxDaily
    : drug.maxDaily;
  const daily = Math.round(Math.min(single * (24 / drug.interval), maxDailyMg));
  const perDay = Math.floor(24 / drug.interval);
  const risk = single < 100 ? "low" : single < 400 ? "moderate" : "high";
  return { single, daily, perDay, risk };
}

const firstDose = computed(() => {
  if (!selectedDrugs.value.length) return doseFor(drugs[0]);
  return doseFor(selectedDrugs.value[0]);
});

const weightValColor = computed(() => {
  if (weight.value < 10) return "wt-light";
  if (weight.value < 30) return "wt-normal";
  return "wt-heavy";
});

// ── Functions ─────────────────────────────────────────────────────
function toggleDrug(drug: (typeof drugs)[number]) {
  const idx = selectedDrugs.value.findIndex((d) => d.id === drug.id);
  if (idx >= 0) {
    selectedDrugs.value.splice(idx, 1);
  } else {
    selectedDrugs.value.push(drug);
  }
}

function isSelectedOrHover() {}

function generateMarkdown() {
  const w = weight.value;
  const lines = selectedDrugs.value.map((d) => {
    const r = doseFor(d);
    return (
      `### ${d.name}\n\n` +
      `- **Category**: ${d.category}\n` +
      `- **Route**: ${d.route}\n` +
      `- **Frequency**: ${d.frequency}\n` +
      `- **Dose**: ${d.dosePerKg} ${d.doseUnit} × ${w} kg = **${r.single} mg**\n` +
      `- **Daily**: ${r.perDay} doses/day → **${r.daily} mg/day**\n` +
      `- **Note**: ${d.notes}\n`
    );
  });
  return (
    `# Pediatric Drug Dose Calculator\n\n` +
    `**Weight**: ${w} kg\n\n` +
    lines.join("\n") +
    `\n---\n\n> Disclaimer: For clinical reference only. Actual dosing should be determined by a pediatrician.`
  );
}

async function copyMarkdown() {
  await navigator.clipboard.writeText(generateMarkdown());
  copied.value = true;
  setTimeout(() => (copied.value = false), 2000);
}

function reset() {
  selectedDrugs.value = [];
  weight.value = 20;
  searchQuery.value = "";
}
</script>

<template>
  <div class="pd-calc">
    <div class="tab-bar">
      <button class="tab-btn active">
        <span class="tab-label">Pediatric Drug Dose 劑量計算</span>
        <span class="tab-sub">兒童藥物劑量計算器</span>
      </button>
    </div>

    <div class="panel">
      <div class="sb-header">
        <div class="header-title">
          <h2 class="title">兒童體重別藥物劑量計算</h2>
          <p class="subtitle">Pediatric Weight-Based Dose Calculator</p>
        </div>
        <div class="score-badge" :class="firstDose.risk">
          <span class="score-number">{{ firstDose.single }}</span>
          <span class="score-label">mg（單次劑量）</span>
          <span class="score-volume">{{ firstDose.daily }} mg/day</span>
        </div>
      </div>

      <div class="intro-bar">
        <span class="intro-dot">◆</span>
        <span
          >輸入<strong>體重</strong>、選擇<strong>藥物</strong>，計算每公斤劑量（mg/kg）、單次劑量（mg）與每日總劑量（mg/day）。支援搜尋藥物名稱或分類。</span
        >
      </div>

      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">患者體重</span>
            <span class="group-sub">Patient Weight · kg</span>
          </div>
          <div class="group-score-pill">{{ weight }} kg</div>
        </div>
        <div class="weight-card">
          <div class="weight-row">
            <span class="weight-val" :class="weightValColor">{{ weight }}</span>
            <span class="weight-unit-lg">kg</span>
          </div>
          <div class="slider-track-wrap">
            <div class="slider-track">
              <div
                class="slider-fill"
                :class="weightValColor"
                :style="{ width: ((weight - 3) / 97) * 100 + '%' }"
              />
            </div>
            <input
              v-model.number="weight"
              type="range"
              min="3"
              max="100"
              step="1"
              class="weight-slider"
            />
            <div class="weight-ticks">
              <span style="left: 0%">3</span><span style="left: 17.5%">20</span
              ><span style="left: 38.1%">40</span
              ><span style="left: 58.8%">60</span
              ><span style="left: 79.4%">80</span
              ><span style="left: 100%">100</span>
            </div>
          </div>
        </div>
      </div>

      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">搜尋藥物</span>
            <span class="group-sub">Search Drug · 輸入藥名或分類</span>
          </div>
          <div class="group-score-pill">
            {{ selectedDrugs.length ? "已選 " + selectedDrugs.length : "none" }}
          </div>
        </div>
        <div class="search-wrap">
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="搜尋藥物名稱、分類（如：acetaminophen、antibiotics）..."
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <div class="sb-group">
        <div class="group-header">
          <div class="group-label-block">
            <span class="group-label">選擇藥物</span>
            <span class="group-sub">藥物選擇 · 點選藥物（可多選）</span>
          </div>
          <div class="group-score-pill">
            {{ selectedDrugs.length ? "已選 " + selectedDrugs.length : "none" }}
          </div>
        </div>
        <div class="item-list">
          <div
            v-for="d in filteredDrugs"
            :key="d.id"
            class="sb-item"
            :class="[d.color, { selected: isSelected(d.id) }]"
            @click="toggleDrug(d)"
          >
            <div class="item-letter" :class="d.color + '-letter'">
              {{ d.name.charAt(0) }}
            </div>
            <div class="item-content">
              <div class="item-question">{{ d.name }}</div>
              <div class="item-name">{{ d.category }}</div>
              <div class="item-detail">
                {{ d.dosePerKg }} {{ d.doseUnit }} · {{ d.frequency }}
              </div>
            </div>
            <div class="item-toggle">
              <div
                class="toggle-box check-box"
                :class="[d.color + '-radio', { 'check-on': isSelected(d.id) }]"
              >
                <span v-if="isSelected(d.id)" class="check-mark">✓</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!selectedDrugs.length" class="sb-empty">
        <span class="empty-icon">💊</span>
        <span class="empty-text"
          >Select one or more drugs above to see dosing results</span
        >
      </div>

      <div
        v-for="d in selectedDrugs"
        :key="'result-' + d.id"
        class="sb-result"
        :class="doseFor(d).risk"
      >
        <div class="result-left">
          <div class="result-vol">
            <span class="result-number result-ml">{{ doseFor(d).single }}</span>
            <span class="result-unit">mg/次</span>
          </div>
          <div class="result-divider-v" />
          <div class="result-dose">
            <span class="result-number">{{ doseFor(d).daily }}</span>
            <span class="result-unit">mg/day</span>
          </div>
        </div>
        <div class="result-right">
          <div class="result-top">
            <span class="result-level">{{ d.name }}</span>
          </div>
          <span class="result-ahi">
            {{ d.dosePerKg }} {{ d.doseUnit }} × {{ weight }} kg =
            {{ doseFor(d).single }} mg
          </span>
          <span class="result-ahi">
            每 {{ d.interval }}h × {{ doseFor(d).perDay }} 次/日 =
            {{ doseFor(d).daily }} mg/day
          </span>
          <div class="result-sub-scores">
            <span class="sub-pill-sm pd-sm">
              {{ d.route }}
            </span>
            <span class="sub-pill-sm cat-sm">{{ d.category }}</span>
            <span class="sub-pill-sm freq-sm">{{ d.frequency }}</span>
          </div>
        </div>
      </div>

      <div v-if="showResults" class="results-detail">
        <div class="results-header">計算明細</div>
        <template v-for="d in selectedDrugs" :key="'detail-' + d.id">
          <div class="detail-section-title pd-section">{{ d.name }}</div>
          <div class="detail-row">
            <span class="detail-letter">◆</span>
            <span class="detail-domain">每公斤劑量</span>
            <span class="detail-score">{{ d.dosePerKg }} {{ d.doseUnit }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-letter">◆</span>
            <span class="detail-domain">患者體重</span>
            <span class="detail-score">{{ weight }} kg</span>
          </div>
          <div class="detail-row">
            <span class="detail-letter">◆</span>
            <span class="detail-domain">單次劑量</span>
            <span class="detail-score">{{ doseFor(d).single }} mg</span>
          </div>
          <div class="detail-row">
            <span class="detail-letter">◆</span>
            <span class="detail-domain">給藥間隔</span>
            <span class="detail-score">每 {{ d.interval }} 小時</span>
          </div>
          <div class="detail-row">
            <span class="detail-letter">◆</span>
            <span class="detail-domain">每日次數</span>
            <span class="detail-score">{{ doseFor(d).perDay }} 次</span>
          </div>
          <div class="detail-row total-row">
            <span class="detail-letter brand-sm">∑</span>
            <span class="detail-domain">每日總劑量</span>
            <span class="detail-score positive"
              >{{ doseFor(d).daily }} mg/day</span
            >
            <span class="detail-desc">{{ d.notes }}</span>
          </div>
        </template>

        <div class="detail-section-title pd-section" style="margin-top: 0.5rem">
          所有藥物比較（{{ weight }} kg 患者）
        </div>
        <div class="compare-table">
          <div class="compare-header">
            <span>藥物</span>
            <span>單次</span>
            <span>每日</span>
          </div>
          <div
            v-for="d in drugs"
            :key="d.id"
            class="compare-row"
            :class="{ 'compare-active': isSelected(d.id) }"
          >
            <span>{{ d.name }}</span>
            <span>{{ doseFor(d).single }} mg</span>
            <span>{{ doseFor(d).daily }} mg</span>
          </div>
        </div>
      </div>

      <div class="sb-actions">
        <button class="btn-view" @click="showResults = !showResults">
          {{ showResults ? "收起明細" : "查看評估結果" }}
        </button>
        <button class="btn-copy" @click="copyMarkdown">
          {{ copied ? "已複製 ✓" : "複製 Markdown 結果" }}
        </button>
        <button class="btn-reset" @click="reset">重置</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.pd-calc {
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
}
.tab-btn.active .tab-sub {
  color: var(--vp-c-brand-1);
  opacity: 0.85;
}

.panel {
  max-width: 780px;
  margin: 0 auto;
  padding: 2rem 0 3rem;
  font-size: 0.9rem;
}

.sb-header {
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
  min-width: 100px;
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
  font-size: 0.66rem;
  font-weight: 700;
  margin-top: 3px;
  text-align: center;
  color: var(--vp-c-text-3);
}
.score-volume {
  font-size: 0.82rem;
  font-weight: 800;
  margin-top: 2px;
  opacity: 0.85;
}
.score-badge.low {
  border-color: #22c55e;
  color: #22c55e;
}
.score-badge.moderate {
  border-color: #f59e0b;
  color: #f59e0b;
}
.score-badge.high {
  border-color: #ef4444;
  color: #ef4444;
}

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

.sb-group {
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
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  border-left: 4px solid var(--vp-c-brand-1);
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
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
  color: var(--vp-c-brand-1);
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

.weight-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  padding: 0.75rem 1rem 1.8rem;
}
.weight-row {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 4px;
  margin-bottom: 0.5rem;
}
.weight-val {
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1;
  transition: color 0.3s;
}
.weight-val.wt-light {
  color: #22c55e;
}
.weight-val.wt-normal {
  color: #6366f1;
}
.weight-val.wt-heavy {
  color: #ef4444;
}
.weight-unit-lg {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.slider-track-wrap {
  position: relative;
  height: 32px;
  display: flex;
  align-items: center;
}
.slider-track {
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
.slider-fill {
  height: 100%;
  border-radius: 999px;
  transition:
    width 0.15s ease,
    background 0.3s;
}
.slider-fill.wt-light {
  background: linear-gradient(90deg, #22c55e, #84cc16);
}
.slider-fill.wt-normal {
  background: linear-gradient(90deg, #6366f1, #818cf8);
}
.slider-fill.wt-heavy {
  background: linear-gradient(90deg, #f97316, #ef4444);
}
.weight-slider {
  position: relative;
  width: 100%;
  -webkit-appearance: none;
  appearance: none;
  height: 32px;
  background: transparent;
  cursor: pointer;
  z-index: 1;
}
.weight-slider::-webkit-slider-thumb {
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
.weight-slider::-webkit-slider-thumb:hover {
  transform: scale(1.15);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.35);
}
.weight-slider::-moz-range-thumb {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--vp-c-bg);
  border: 2.5px solid var(--vp-c-brand-1);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
}
.weight-ticks {
  position: absolute;
  left: 11px;
  right: 11px;
  top: 100%;
  height: 1.2em;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.weight-ticks span {
  position: absolute;
  transform: translateX(-50%);
}
.weight-ticks span:first-child {
  transform: none;
}
.weight-ticks span:last-child {
  transform: translateX(-100%);
}

.search-wrap {
  position: relative;
}
.search-input {
  width: 100%;
  padding: 0.7rem 1rem 0.7rem 2.2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  font-size: 0.88rem;
  font-family: inherit;
  color: var(--vp-c-text-1);
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.search-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}
.search-icon {
  position: absolute;
  left: 0.7rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.88rem;
  pointer-events: none;
}

.item-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.45rem;
  min-width: 0;
}
@media (max-width: 640px) {
  .item-list {
    grid-template-columns: 1fr;
  }
}
.sb-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition:
    border-color 0.2s,
    background 0.2s;
  user-select: none;
  min-width: 0;
}
.sb-item:hover {
  background: var(--vp-c-bg-mute);
}
.item-letter {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 900;
}
.item-content {
  flex: 1;
  min-width: 0;
}
.item-question {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.item-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}
.item-detail {
  font-size: 0.72rem;
  color: var(--vp-c-text-2);
  line-height: 1.4;
}
.item-toggle {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding-top: 2px;
}
.radio-box {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.radio-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #fff;
}
.check-box {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}
.check-mark {
  font-size: 0.7rem;
  font-weight: 800;
  color: #fff;
  line-height: 1;
}

.acet-letter {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.12);
}
.ibu-letter {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}
.amox-letter {
  color: #0891b2;
  background: rgba(8, 145, 178, 0.12);
}
.cef-letter {
  color: #059669;
  background: rgba(5, 150, 105, 0.12);
}
.azit-letter {
  color: #d97706;
  background: rgba(217, 119, 6, 0.12);
}
.tmp-letter {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.12);
}
.metro-letter {
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.12);
}
.pred-letter {
  color: #ea580c;
  background: rgba(234, 88, 12, 0.12);
}
.salb-letter {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.12);
}
.morph-letter {
  color: #be185d;
  background: rgba(190, 24, 93, 0.12);
}
.cipro-letter {
  color: #0d9488;
  background: rgba(13, 148, 136, 0.12);
}
.clinda-letter {
  color: #7c2d12;
  background: rgba(124, 45, 18, 0.12);
}
.doxy-letter {
  color: #4338ca;
  background: rgba(67, 56, 202, 0.12);
}
.line-letter {
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.12);
}
.vanc-letter {
  color: #1e40af;
  background: rgba(30, 64, 175, 0.12);
}
.nitro-letter {
  color: #92400e;
  background: rgba(146, 64, 14, 0.12);
}
.rif-letter {
  color: #c2410c;
  background: rgba(194, 65, 12, 0.12);
}
.fungal-letter {
  color: #6d28d9;
  background: rgba(109, 40, 217, 0.12);
}
.anti_h-letter {
  color: #0369a1;
  background: rgba(3, 105, 161, 0.12);
}
.gi-letter {
  color: #15803d;
  background: rgba(21, 128, 61, 0.12);
}
.resp-letter {
  color: #0284c7;
  background: rgba(2, 132, 199, 0.12);
}
.viral-letter {
  color: #9333ea;
  background: rgba(147, 51, 234, 0.12);
}
.para-letter {
  color: #b45309;
  background: rgba(180, 83, 9, 0.12);
}
.sed-letter {
  color: #0e7490;
  background: rgba(14, 116, 144, 0.12);
}
.cardio-letter {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.12);
}
.emer-letter {
  color: #ea580c;
  background: rgba(234, 88, 12, 0.12);
}

.sb-item.acet.selected {
  border-color: #2563eb;
  background: color-mix(in srgb, rgb(37, 99, 235) 12%, var(--vp-c-bg));
}
.sb-item.ibu.selected {
  border-color: #7c3aed;
  background: color-mix(in srgb, rgb(124, 58, 237) 12%, var(--vp-c-bg));
}
.sb-item.amox.selected {
  border-color: #0891b2;
  background: color-mix(in srgb, rgb(8, 145, 178) 12%, var(--vp-c-bg));
}
.sb-item.cef.selected {
  border-color: #059669;
  background: color-mix(in srgb, rgb(5, 150, 105) 12%, var(--vp-c-bg));
}
.sb-item.azit.selected {
  border-color: #d97706;
  background: color-mix(in srgb, rgb(217, 119, 6) 12%, var(--vp-c-bg));
}
.sb-item.tmp.selected {
  border-color: #dc2626;
  background: color-mix(in srgb, rgb(220, 38, 38) 12%, var(--vp-c-bg));
}
.sb-item.metro.selected {
  border-color: #7c3aed;
  background: color-mix(in srgb, rgb(124, 58, 237) 12%, var(--vp-c-bg));
}
.sb-item.pred.selected {
  border-color: #ea580c;
  background: color-mix(in srgb, rgb(234, 88, 12) 12%, var(--vp-c-bg));
}
.sb-item.salb.selected {
  border-color: #0284c7;
  background: color-mix(in srgb, rgb(2, 132, 199) 12%, var(--vp-c-bg));
}
.sb-item.morph.selected {
  border-color: #be185d;
  background: color-mix(in srgb, rgb(190, 24, 93) 12%, var(--vp-c-bg));
}
.sb-item.cipro.selected {
  border-color: #0d9488;
  background: color-mix(in srgb, rgb(13, 148, 136) 12%, var(--vp-c-bg));
}
.sb-item.clinda.selected {
  border-color: #7c2d12;
  background: color-mix(in srgb, rgb(124, 45, 18) 12%, var(--vp-c-bg));
}
.sb-item.doxy.selected {
  border-color: #4338ca;
  background: color-mix(in srgb, rgb(67, 56, 202) 12%, var(--vp-c-bg));
}
.sb-item.line.selected {
  border-color: #b91c1c;
  background: color-mix(in srgb, rgb(185, 28, 28) 12%, var(--vp-c-bg));
}
.sb-item.vanc.selected {
  border-color: #1e40af;
  background: color-mix(in srgb, rgb(30, 64, 175) 12%, var(--vp-c-bg));
}
.sb-item.nitro.selected {
  border-color: #92400e;
  background: color-mix(in srgb, rgb(146, 64, 14) 12%, var(--vp-c-bg));
}
.sb-item.rif.selected {
  border-color: #c2410c;
  background: color-mix(in srgb, rgb(194, 65, 12) 12%, var(--vp-c-bg));
}
.sb-item.fungal.selected {
  border-color: #6d28d9;
  background: color-mix(in srgb, rgb(109, 40, 217) 12%, var(--vp-c-bg));
}
.sb-item.anti_h.selected {
  border-color: #0369a1;
  background: color-mix(in srgb, rgb(3, 105, 161) 12%, var(--vp-c-bg));
}
.sb-item.gi.selected {
  border-color: #15803d;
  background: color-mix(in srgb, rgb(21, 128, 61) 12%, var(--vp-c-bg));
}
.sb-item.resp.selected {
  border-color: #0284c7;
  background: color-mix(in srgb, rgb(2, 132, 199) 12%, var(--vp-c-bg));
}
.sb-item.viral.selected {
  border-color: #9333ea;
  background: color-mix(in srgb, rgb(147, 51, 234) 12%, var(--vp-c-bg));
}
.sb-item.para.selected {
  border-color: #b45309;
  background: color-mix(in srgb, rgb(180, 83, 9) 12%, var(--vp-c-bg));
}
.sb-item.sed.selected {
  border-color: #0e7490;
  background: color-mix(in srgb, rgb(14, 116, 144) 12%, var(--vp-c-bg));
}
.sb-item.cardio.selected {
  border-color: #dc2626;
  background: color-mix(in srgb, rgb(220, 38, 38) 12%, var(--vp-c-bg));
}
.sb-item.emer.selected {
  border-color: #ea580c;
  background: color-mix(in srgb, rgb(234, 88, 12) 12%, var(--vp-c-bg));
}

.acet-radio.radio-on,
.check-on {
  background: #2563eb;
  border-color: #2563eb;
}
.ibu-radio.radio-on,
.check-on {
  background: #7c3aed;
  border-color: #7c3aed;
}
.amox-radio.radio-on,
.check-on {
  background: #0891b2;
  border-color: #0891b2;
}
.cef-radio.radio-on,
.check-on {
  background: #059669;
  border-color: #059669;
}
.azit-radio.radio-on,
.check-on {
  background: #d97706;
  border-color: #d97706;
}
.tmp-radio.radio-on,
.check-on {
  background: #dc2626;
  border-color: #dc2626;
}
.metro-radio.radio-on,
.check-on {
  background: #7c3aed;
  border-color: #7c3aed;
}
.pred-radio.radio-on,
.check-on {
  background: #ea580c;
  border-color: #ea580c;
}
.salb-radio.radio-on,
.check-on {
  background: #0284c7;
  border-color: #0284c7;
}
.morph-radio.radio-on,
.check-on {
  background: #be185d;
  border-color: #be185d;
}
.cipro-radio.radio-on,
.check-on {
  background: #0d9488;
  border-color: #0d9488;
}
.clinda-radio.radio-on,
.check-on {
  background: #7c2d12;
  border-color: #7c2d12;
}
.doxy-radio.radio-on,
.check-on {
  background: #4338ca;
  border-color: #4338ca;
}
.line-radio.radio-on,
.check-on {
  background: #b91c1c;
  border-color: #b91c1c;
}
.vanc-radio.radio-on,
.check-on {
  background: #1e40af;
  border-color: #1e40af;
}
.nitro-radio.radio-on,
.check-on {
  background: #92400e;
  border-color: #92400e;
}
.rif-radio.radio-on,
.check-on {
  background: #c2410c;
  border-color: #c2410c;
}
.fungal-radio.radio-on,
.check-on {
  background: #6d28d9;
  border-color: #6d28d9;
}
.anti_h-radio.radio-on,
.check-on {
  background: #0369a1;
  border-color: #0369a1;
}
.gi-radio.radio-on,
.check-on {
  background: #15803d;
  border-color: #15803d;
}
.resp-radio.radio-on,
.check-on {
  background: #0284c7;
  border-color: #0284c7;
}
.viral-radio.radio-on,
.check-on {
  background: #9333ea;
  border-color: #9333ea;
}
.para-radio.radio-on,
.check-on {
  background: #b45309;
  border-color: #b45309;
}
.sed-radio.radio-on,
.check-on {
  background: #0e7490;
  border-color: #0e7490;
}
.cardio-radio.radio-on,
.check-on {
  background: #dc2626;
  border-color: #dc2626;
}
.emer-radio.radio-on,
.check-on {
  background: #ea580c;
  border-color: #ea580c;
}

.sb-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  border-radius: 14px;
  border: 1px dashed var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
}
.sb-empty .empty-icon {
  font-size: 1.8rem;
  opacity: 0.5;
}
.sb-empty .empty-text {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--vp-c-text-3);
}

.sb-result {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  margin-bottom: 1rem;
  flex-wrap: wrap;
  transition: all 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}
.sb-result.low {
  border-color: #22c55e;
}
.sb-result.moderate {
  border-color: #f59e0b;
}
.sb-result.high {
  border-color: #ef4444;
}
.result-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
  min-width: 200px;
}
.result-dose,
.result-vol {
  display: flex;
  align-items: baseline;
  gap: 3px;
  white-space: nowrap;
}
.result-divider-v {
  width: 100%;
  height: 2px;
  background: var(--vp-c-divider);
  flex-shrink: 0;
}
.result-number {
  font-size: 1.4rem;
  font-weight: 800;
  line-height: 1;
  color: var(--vp-c-text-3);
  transition: color 0.3s;
}
.result-number.result-ml {
  font-size: 1.15rem;
}
.result-unit {
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--vp-c-text-3);
}
.sb-result.low .result-number {
  color: #22c55e;
}
.sb-result.moderate .result-number {
  color: #f59e0b;
}
.sb-result.high .result-number {
  color: #ef4444;
}
.sb-result.low .result-unit {
  color: #22c55e;
}
.sb-result.moderate .result-unit {
  color: #f59e0b;
}
.sb-result.high .result-unit {
  color: #ef4444;
}
.result-right {
  display: flex;
  flex-direction: column;
  gap: 5px;
  flex: 1;
}
.result-top {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}
.result-level {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}
.result-ahi {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--vp-c-brand-1);
}
.result-sub-scores {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 2px;
}
.sub-pill-sm {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 999px;
}
.pd-sm {
  background: color-mix(in srgb, var(--vp-c-brand-1) 10%, transparent);
  color: var(--vp-c-brand-1);
  border: 1px solid color-mix(in srgb, var(--vp-c-brand-1) 30%, transparent);
}
.cat-sm {
  background: rgba(124, 58, 237, 0.1);
  color: #7c3aed;
  border: 1px solid rgba(124, 58, 237, 0.3);
}
.freq-sm {
  background: rgba(100, 116, 139, 0.1);
  color: #64748b;
  border: 1px solid rgba(100, 116, 139, 0.3);
}

.results-detail {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
}
.results-header {
  padding: 0.6rem 1rem;
  background: var(--vp-c-bg-mute);
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--vp-c-text-1);
  border-bottom: 1px solid var(--vp-c-divider);
}
.detail-section-title {
  padding: 0.5rem 1rem 0.35rem;
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}
.detail-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
}
.detail-letter {
  flex-shrink: 0;
  width: 22px;
  text-align: center;
  font-size: 0.74rem;
  font-weight: 800;
  color: var(--vp-c-text-3);
}
.detail-domain {
  flex: 1;
  color: var(--vp-c-text-2);
}
.detail-score {
  font-weight: 800;
  color: var(--vp-c-text-1);
}
.detail-desc {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  max-width: 200px;
  text-align: right;
}
.total-row {
  background: var(--vp-c-bg-mute);
  font-weight: 700;
}

.compare-table {
  font-size: 0.82rem;
}
.compare-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.45rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  font-weight: 800;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-mute);
}
.compare-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0.4rem 1rem;
  border-top: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.compare-row.compare-active {
  color: var(--vp-c-brand-1);
  font-weight: 700;
  background: color-mix(in srgb, var(--vp-c-brand-1) 6%, transparent);
}

.sb-actions {
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

@media (max-width: 640px) {
  .tab-label {
    font-size: 0.9rem;
  }
  .tab-sub {
    font-size: 0.72rem;
  }
  .sb-result {
    gap: 1rem;
    padding: 1rem;
  }
  .result-number {
    font-size: 1.2rem;
  }
  .result-number.result-ml {
    font-size: 1rem;
  }
  .result-left {
    min-width: 0;
  }
  .weight-val {
    font-size: 1.8rem;
  }
  .weight-card {
    padding: 0.65rem 0.75rem;
  }
  .compare-header,
  .compare-row {
    font-size: 0.72rem;
  }
}
</style>
