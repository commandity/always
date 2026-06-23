/**
 * pregnancyCategories.ts
 * ------------------------------------------------------------------
 * 妊娠用藥分級資料 (legacy FDA A/B/C/D/X letters + PLLR-style notes)
 *
 * 注意事項：
 * - 美國 FDA 已於 2015 年廢除 A/B/C/D/X 字母分級，改採 PLLR 敘述式仿單；
 *   但台灣仿單與臨床實務仍廣泛沿用字母分級，故此處保留字母並附敘述備註。
 * - 學名 (INN) 一律不譯為中文。
 * - `category` 為主要字母；`categoryDetail` 描述隨孕期變化的風險。
 * - 處方前務必核對最新仿單。
 *
 * INN names are never translated. Verify against the current 仿單 before prescribing.
 */

export type PregnancyCategory = "A" | "B" | "C" | "D" | "X" | "NR";
// NR = Not Rated（無 FDA 字母分級 / 資料有限，多依台灣仿單或臨床判斷）

export type Specialty =
  | "CV" // 心臟血管
  | "ENT" // 耳鼻喉
  | "GI" // 腸胃
  | "URO" // 泌尿
  | "ANALGESIC" // 止痛 / 解熱
  | "ABX" // 抗感染
  | "ENDO" // 內分泌 / 代謝
  | "NEURO" // 神經
  | "PSYCH" // 精神
  | "RESP" // 呼吸 / 過敏
  | "OBGYN" // 婦產
  | "OTHER";

export interface DrugPregnancyInfo {
  /** 學名 (INN) — 不譯 */
  inn: string;
  /** 主要妊娠分級字母 */
  category: PregnancyCategory;
  /** 隨孕期變化的細節，例如 "C → D（第三孕期）" */
  categoryDetail?: string;
  /** 所屬臨床科別（可複數） */
  specialty: Specialty[];
  /** 藥理分類（繁中，台灣慣用語） */
  classZh: string;
  /** PLLR 風格臨床備註（繁中） */
  noteZh?: string;
}

export const SPECIALTY_LABELS: Record<Specialty, string> = {
  CV: "心臟血管",
  ENT: "耳鼻喉",
  GI: "腸胃",
  URO: "泌尿",
  ANALGESIC: "止痛/解熱",
  ABX: "抗感染",
  ENDO: "內分泌/代謝",
  NEURO: "神經",
  PSYCH: "精神",
  RESP: "呼吸/過敏",
  OBGYN: "婦產",
  OTHER: "其他",
};

export const CATEGORY_LABELS: Record<PregnancyCategory, string> = {
  A: "A — 對照研究未顯示風險",
  B: "B — 動物無風險或人類資料無風險",
  C: "C — 不能排除風險（效益評估後使用）",
  D: "D — 有人類胎兒風險證據",
  X: "X — 禁用（風險明確大於效益）",
  NR: "NR — 無字母分級 / 資料有限",
};

export const DRUGS: DrugPregnancyInfo[] = [
  // ─────────────────────────────────────────────
  // 止痛 / 解熱 ANALGESIC
  // ─────────────────────────────────────────────
  {
    inn: "Acetaminophen",
    category: "B",
    specialty: ["ANALGESIC"],
    classZh: "乙醯胺酚 / 解熱鎮痛",
    noteZh: "各孕期首選止痛退燒藥。",
  },
  {
    inn: "Aspirin",
    category: "C",
    categoryDetail: "C（鎮痛劑量）→ D（第三孕期）",
    specialty: ["ANALGESIC", "CV"],
    classZh: "NSAID / 抗血小板",
    noteZh:
      "低劑量（≤150 mg）用於子癇前症預防屬常規；鎮痛劑量第三孕期避免（動脈導管早閉）。",
  },
  {
    inn: "Ibuprofen",
    category: "C",
    categoryDetail: "B/C → D（第三孕期）",
    specialty: ["ANALGESIC"],
    classZh: "NSAID",
    noteZh: "20 週後避免（羊水過少、動脈導管早閉、腎功能影響）。",
  },
  {
    inn: "Naproxen",
    category: "C",
    categoryDetail: "B/C → D（第三孕期）",
    specialty: ["ANALGESIC"],
    classZh: "NSAID",
    noteZh: "同其他 NSAID，晚期妊娠避免。",
  },
  {
    inn: "Diclofenac",
    category: "C",
    categoryDetail: "C → D（第三孕期）",
    specialty: ["ANALGESIC"],
    classZh: "NSAID",
    noteZh: "晚期妊娠避免。",
  },
  {
    inn: "Celecoxib",
    category: "C",
    categoryDetail: "C → D（第三孕期）",
    specialty: ["ANALGESIC"],
    classZh: "COX-2 抑制劑 / NSAID",
    noteZh: "晚期妊娠避免。",
  },
  {
    inn: "Tramadol",
    category: "C",
    specialty: ["ANALGESIC"],
    classZh: "中樞鎮痛劑 / 弱鴉片類",
    noteZh: "長期或近足月使用有新生兒戒斷風險。",
  },
  {
    inn: "Morphine",
    category: "C",
    categoryDetail: "C（長期使用 D）",
    specialty: ["ANALGESIC"],
    classZh: "鴉片類止痛藥",
    noteZh: "長期使用恐致新生兒戒斷症候群。",
  },
  {
    inn: "Codeine",
    category: "C",
    categoryDetail: "C（長期使用 D）",
    specialty: ["ANALGESIC", "ENT"],
    classZh: "鴉片類（止痛/鎮咳）",
    noteZh: "近足月使用注意新生兒呼吸抑制。",
  },
  {
    inn: "Oxycodone",
    category: "C",
    categoryDetail: "C（長期使用 D）",
    specialty: ["ANALGESIC"],
    classZh: "鴉片類止痛藥",
    noteZh: "長期使用恐致新生兒戒斷。",
  },

  // ─────────────────────────────────────────────
  // 抗感染 ABX
  // ─────────────────────────────────────────────
  {
    inn: "Amoxicillin",
    category: "B",
    specialty: ["ABX"],
    classZh: "盤尼西林類抗生素",
    noteZh: "妊娠期常用、安全性佳。",
  },
  {
    inn: "Ampicillin",
    category: "B",
    specialty: ["ABX"],
    classZh: "盤尼西林類抗生素",
  },
  {
    inn: "Amoxicillin/clavulanate",
    category: "B",
    specialty: ["ABX", "ENT"],
    classZh: "盤尼西林 + β-內醯胺酶抑制劑",
    noteZh: "中耳炎、鼻竇炎常用。",
  },
  {
    inn: "Cefuroxime",
    category: "B",
    specialty: ["ABX", "ENT"],
    classZh: "頭孢菌素類（第二代）",
  },
  {
    inn: "Cephalexin",
    category: "B",
    specialty: ["ABX", "URO"],
    classZh: "頭孢菌素類（第一代）",
  },
  {
    inn: "Azithromycin",
    category: "B",
    specialty: ["ABX", "ENT"],
    classZh: "巨環類抗生素",
  },
  {
    inn: "Erythromycin",
    category: "B",
    specialty: ["ABX"],
    classZh: "巨環類抗生素",
    noteZh: "避免 estolate 鹽型（孕婦肝毒性）。",
  },
  {
    inn: "Clarithromycin",
    category: "C",
    specialty: ["ABX", "ENT"],
    classZh: "巨環類抗生素",
  },
  {
    inn: "Clindamycin",
    category: "B",
    specialty: ["ABX"],
    classZh: "Lincosamide 類抗生素",
  },
  {
    inn: "Metronidazole",
    category: "B",
    specialty: ["ABX", "GI"],
    classZh: "硝基咪唑類抗生素",
  },
  {
    inn: "Nitrofurantoin",
    category: "B",
    specialty: ["ABX", "URO"],
    classZh: "泌尿道抗菌劑",
    noteZh: "近足月（38 週後）避免（新生兒溶血風險）；G6PD 缺乏者避免。",
  },
  {
    inn: "Fosfomycin",
    category: "B",
    specialty: ["ABX", "URO"],
    classZh: "泌尿道抗菌劑",
    noteZh: "單純性膀胱炎單劑治療選項。",
  },
  {
    inn: "Ciprofloxacin",
    category: "C",
    specialty: ["ABX", "URO"],
    classZh: "氟喹諾酮類",
    noteZh: "動物有軟骨毒性疑慮，多保留替代用藥。",
  },
  {
    inn: "Levofloxacin",
    category: "C",
    specialty: ["ABX"],
    classZh: "氟喹諾酮類",
  },
  {
    inn: "Doxycycline",
    category: "D",
    specialty: ["ABX"],
    classZh: "四環黴素類",
    noteZh: "第二孕期後致牙齒著色、影響骨骼。",
  },
  {
    inn: "Tetracycline",
    category: "D",
    specialty: ["ABX"],
    classZh: "四環黴素類",
  },
  {
    inn: "Trimethoprim/sulfamethoxazole",
    category: "C",
    categoryDetail: "C（近足月 D）",
    specialty: ["ABX", "URO"],
    classZh: "磺胺類複方",
    noteZh: "第一孕期葉酸拮抗致畸風險、近足月核黃疸風險。",
  },
  {
    inn: "Gentamicin",
    category: "D",
    specialty: ["ABX"],
    classZh: "胺基糖苷類",
    noteZh: "耳毒性 / 腎毒性疑慮。",
  },
  {
    inn: "Vancomycin",
    category: "B",
    categoryDetail: "B（口服）/ C（靜脈）",
    specialty: ["ABX"],
    classZh: "糖肽類抗生素",
  },
  {
    inn: "Fluconazole",
    category: "C",
    categoryDetail: "C（單次低劑量）/ D（高劑量長期）",
    specialty: ["ABX"],
    classZh: "三唑類抗黴菌",
    noteZh: "高劑量長期使用有致畸疑慮。",
  },
  { inn: "Acyclovir", category: "B", specialty: ["ABX"], classZh: "抗病毒藥" },
  {
    inn: "Valacyclovir",
    category: "B",
    specialty: ["ABX"],
    classZh: "抗病毒藥",
  },
  {
    inn: "Oseltamivir",
    category: "C",
    specialty: ["ABX", "RESP"],
    classZh: "神經胺酸酶抑制劑",
    noteZh: "孕婦流感重症風險高，效益常大於風險。",
  },

  // ─────────────────────────────────────────────
  // 心臟血管 CV
  // ─────────────────────────────────────────────
  {
    inn: "Methyldopa",
    category: "B",
    specialty: ["CV"],
    classZh: "中樞性降壓藥",
    noteZh: "妊娠高血壓長期控制首選之一。",
  },
  {
    inn: "Labetalol",
    category: "C",
    specialty: ["CV"],
    classZh: "α/β 阻斷劑",
    noteZh: "妊娠高血壓臨床首選之一（含急性期）。",
  },
  {
    inn: "Hydralazine",
    category: "C",
    specialty: ["CV"],
    classZh: "直接血管擴張劑",
    noteZh: "重度妊娠高血壓急性處置選項。",
  },
  {
    inn: "Nifedipine",
    category: "C",
    specialty: ["CV"],
    classZh: "鈣離子通道阻斷劑（DHP）",
    noteZh: "妊娠高血壓常用；亦用於安胎（off-label）。",
  },
  {
    inn: "Amlodipine",
    category: "C",
    specialty: ["CV"],
    classZh: "鈣離子通道阻斷劑（DHP）",
  },
  {
    inn: "Felodipine",
    category: "C",
    specialty: ["CV"],
    classZh: "鈣離子通道阻斷劑（DHP）",
  },
  {
    inn: "Verapamil",
    category: "C",
    specialty: ["CV"],
    classZh: "鈣離子通道阻斷劑（non-DHP）",
  },
  {
    inn: "Diltiazem",
    category: "C",
    specialty: ["CV"],
    classZh: "鈣離子通道阻斷劑（non-DHP）",
  },
  {
    inn: "Metoprolol",
    category: "C",
    specialty: ["CV"],
    classZh: "乙型阻斷劑（β1 選擇性）",
  },
  {
    inn: "Bisoprolol",
    category: "C",
    specialty: ["CV"],
    classZh: "乙型阻斷劑（β1 選擇性）",
  },
  {
    inn: "Carvedilol",
    category: "C",
    specialty: ["CV"],
    classZh: "α/β 阻斷劑",
  },
  {
    inn: "Propranolol",
    category: "C",
    specialty: ["CV"],
    classZh: "乙型阻斷劑（非選擇性）",
  },
  {
    inn: "Atenolol",
    category: "D",
    specialty: ["CV"],
    classZh: "乙型阻斷劑（β1 選擇性）",
    noteZh: "與胎兒生長遲滯相關，妊娠避免。",
  },
  {
    inn: "Captopril",
    category: "D",
    specialty: ["CV"],
    classZh: "ACEI",
    noteZh: "禁用：致胎兒腎臟發育不良、羊水過少、顱骨發育不全。",
  },
  {
    inn: "Enalapril",
    category: "D",
    specialty: ["CV"],
    classZh: "ACEI",
    noteZh: "禁用（同 ACEI 類）。",
  },
  {
    inn: "Lisinopril",
    category: "D",
    specialty: ["CV"],
    classZh: "ACEI",
    noteZh: "禁用（同 ACEI 類）。",
  },
  {
    inn: "Ramipril",
    category: "D",
    specialty: ["CV"],
    classZh: "ACEI",
    noteZh: "禁用（同 ACEI 類）。",
  },
  {
    inn: "Losartan",
    category: "D",
    specialty: ["CV"],
    classZh: "ARB",
    noteZh: "禁用：胎兒毒性同 ACEI。",
  },
  {
    inn: "Valsartan",
    category: "D",
    specialty: ["CV"],
    classZh: "ARB",
    noteZh: "禁用（同 ARB 類）。",
  },
  {
    inn: "Telmisartan",
    category: "D",
    specialty: ["CV"],
    classZh: "ARB",
    noteZh: "禁用（同 ARB 類）。",
  },
  {
    inn: "Candesartan",
    category: "D",
    specialty: ["CV"],
    classZh: "ARB",
    noteZh: "禁用（同 ARB 類）。",
  },
  {
    inn: "Sacubitril/valsartan",
    category: "D",
    specialty: ["CV"],
    classZh: "ARNI（腦啡肽酶抑制劑 + ARB）",
    noteZh: "禁用（含 ARB 成分）。",
  },
  {
    inn: "Spironolactone",
    category: "C",
    specialty: ["CV"],
    classZh: "保鉀利尿劑 / 醛固酮拮抗劑",
    noteZh: "抗雄性素作用，理論上對男胎有疑慮。",
  },
  {
    inn: "Furosemide",
    category: "C",
    specialty: ["CV"],
    classZh: "亨利氏環利尿劑",
    noteZh: "妊娠高血壓不作首選（可能減少胎盤灌流）。",
  },
  {
    inn: "Hydrochlorothiazide",
    category: "B",
    categoryDetail: "B（部分標 C）",
    specialty: ["CV"],
    classZh: "噻嗪類利尿劑",
  },
  {
    inn: "Indapamide",
    category: "B",
    specialty: ["CV"],
    classZh: "類噻嗪利尿劑",
  },
  {
    inn: "Digoxin",
    category: "C",
    specialty: ["CV"],
    classZh: "強心配醣體",
    noteZh: "亦用於胎兒心搏過速治療。",
  },
  {
    inn: "Amiodarone",
    category: "D",
    specialty: ["CV"],
    classZh: "第 III 類抗心律不整藥",
    noteZh: "含碘，影響胎兒甲狀腺。",
  },
  {
    inn: "Sotalol",
    category: "B",
    specialty: ["CV"],
    classZh: "第 III 類抗心律不整 / β 阻斷劑",
  },
  {
    inn: "Flecainide",
    category: "C",
    specialty: ["CV"],
    classZh: "第 IC 類抗心律不整藥",
    noteZh: "用於胎兒心律不整治療。",
  },
  {
    inn: "Lidocaine",
    category: "B",
    specialty: ["CV", "ANALGESIC"],
    classZh: "第 IB 類抗心律不整 / 局部麻醉",
  },
  {
    inn: "Adenosine",
    category: "C",
    specialty: ["CV"],
    classZh: "抗心律不整（SVT 急救）",
    noteZh: "妊娠期 SVT 可使用。",
  },
  {
    inn: "Isosorbide dinitrate",
    category: "C",
    specialty: ["CV"],
    classZh: "硝酸鹽類",
  },
  {
    inn: "Nitroglycerin",
    category: "C",
    specialty: ["CV"],
    classZh: "硝酸鹽類",
  },
  {
    inn: "Atorvastatin",
    category: "X",
    specialty: ["CV"],
    classZh: "HMG-CoA 還原酶抑制劑（statin）",
    noteZh: "禁用：膽固醇為胎兒發育必需。",
  },
  {
    inn: "Rosuvastatin",
    category: "X",
    specialty: ["CV"],
    classZh: "HMG-CoA 還原酶抑制劑（statin）",
    noteZh: "禁用。",
  },
  {
    inn: "Simvastatin",
    category: "X",
    specialty: ["CV"],
    classZh: "HMG-CoA 還原酶抑制劑（statin）",
    noteZh: "禁用。",
  },
  {
    inn: "Ezetimibe",
    category: "C",
    specialty: ["CV"],
    classZh: "膽固醇吸收抑制劑",
  },
  {
    inn: "Fenofibrate",
    category: "C",
    specialty: ["CV"],
    classZh: "Fibrate 類（降三酸甘油酯）",
  },
  {
    inn: "Gemfibrozil",
    category: "C",
    specialty: ["CV"],
    classZh: "Fibrate 類",
  },
  {
    inn: "Warfarin",
    category: "X",
    categoryDetail: "X（機械瓣膜 D）",
    specialty: ["CV"],
    classZh: "維生素 K 拮抗劑（口服抗凝）",
    noteZh: "致 warfarin embryopathy；機械瓣膜患者需個別權衡。",
  },
  {
    inn: "Heparin",
    category: "C",
    specialty: ["CV"],
    classZh: "注射抗凝劑（UFH）",
    noteZh: "不通過胎盤，妊娠抗凝可用。",
  },
  {
    inn: "Enoxaparin",
    category: "B",
    specialty: ["CV"],
    classZh: "低分子量肝素（LMWH）",
    noteZh: "妊娠抗凝首選。",
  },
  {
    inn: "Rivaroxaban",
    category: "C",
    specialty: ["CV"],
    classZh: "DOAC（Factor Xa 抑制劑）",
    noteZh: "資料有限，妊娠避免，改用 LMWH。",
  },
  {
    inn: "Apixaban",
    category: "C",
    specialty: ["CV"],
    classZh: "DOAC（Factor Xa 抑制劑）",
    noteZh: "資料有限，妊娠避免。",
  },
  {
    inn: "Dabigatran",
    category: "C",
    specialty: ["CV"],
    classZh: "DOAC（直接凝血酶抑制劑）",
    noteZh: "資料有限，妊娠避免。",
  },
  {
    inn: "Clopidogrel",
    category: "B",
    specialty: ["CV"],
    classZh: "抗血小板（P2Y12 抑制劑）",
  },
  {
    inn: "Ticagrelor",
    category: "C",
    specialty: ["CV"],
    classZh: "抗血小板（P2Y12 抑制劑）",
  },
  {
    inn: "Cilostazol",
    category: "C",
    specialty: ["CV"],
    classZh: "抗血小板 / 周邊血管擴張劑",
  },

  // ─────────────────────────────────────────────
  // 耳鼻喉 ENT（含前庭、過敏、鎮咳化痰）
  // ─────────────────────────────────────────────
  {
    inn: "Betahistine",
    category: "NR",
    specialty: ["ENT"],
    classZh: "組織胺類似物（前庭/梅尼爾氏症）",
    noteZh: "無 FDA 字母分級；妊娠資料有限，多建議避免或審慎使用。",
  },
  {
    inn: "Meclizine",
    category: "B",
    specialty: ["ENT", "GI"],
    classZh: "抗組織胺 / 前庭抑制劑",
    noteZh: "暈眩、動暈症常用。",
  },
  {
    inn: "Dimenhydrinate",
    category: "B",
    specialty: ["ENT", "GI"],
    classZh: "抗組織胺 / 抗暈藥",
  },
  {
    inn: "Cinnarizine",
    category: "NR",
    specialty: ["ENT"],
    classZh: "抗組織胺 / 前庭抑制劑",
    noteZh: "無 FDA 字母分級；妊娠審慎使用。",
  },
  {
    inn: "Flunarizine",
    category: "NR",
    specialty: ["ENT", "NEURO"],
    classZh: "鈣離子通道阻斷劑（前庭性偏頭痛預防）",
    noteZh: "無 FDA 字母分級；妊娠不建議使用。",
  },
  {
    inn: "Promethazine",
    category: "C",
    specialty: ["ENT", "GI"],
    classZh: "抗組織胺（吩噻嗪類）",
    noteZh: "止吐、止暈、鎮靜。",
  },
  {
    inn: "Prochlorperazine",
    category: "C",
    specialty: ["ENT", "GI"],
    classZh: "吩噻嗪類止吐 / 前庭抑制劑",
  },
  {
    inn: "Scopolamine",
    category: "C",
    specialty: ["ENT"],
    classZh: "抗膽鹼 / 抗暈貼片",
  },
  {
    inn: "Loratadine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "第二代抗組織胺",
  },
  {
    inn: "Desloratadine",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "第二代抗組織胺",
  },
  {
    inn: "Cetirizine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "第二代抗組織胺",
  },
  {
    inn: "Levocetirizine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "第二代抗組織胺",
  },
  {
    inn: "Fexofenadine",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "第二代抗組織胺",
  },
  {
    inn: "Diphenhydramine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "第一代抗組織胺",
  },
  {
    inn: "Chlorpheniramine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "第一代抗組織胺",
  },
  {
    inn: "Azelastine",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "鼻用抗組織胺",
  },
  {
    inn: "Fluticasone (nasal)",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "鼻用類固醇",
  },
  {
    inn: "Mometasone (nasal)",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "鼻用類固醇",
  },
  {
    inn: "Budesonide (nasal)",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "鼻用類固醇",
    noteZh: "鼻用 budesonide 為過敏性鼻炎妊娠較佳選擇。",
  },
  {
    inn: "Oxymetazoline",
    category: "C",
    specialty: ["ENT"],
    classZh: "鼻黏膜去充血劑（局部）",
    noteZh: "短期使用，避免長期（反彈性鼻塞）。",
  },
  {
    inn: "Pseudoephedrine",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "去充血劑（口服）",
    noteZh: "第一孕期避免（腹壁裂疑慮）。",
  },
  {
    inn: "Phenylephrine",
    category: "C",
    specialty: ["ENT"],
    classZh: "去充血劑",
  },
  {
    inn: "Dextromethorphan",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "中樞性鎮咳藥",
  },
  {
    inn: "Guaifenesin",
    category: "C",
    specialty: ["ENT", "RESP"],
    classZh: "袪痰劑",
    noteZh: "第一孕期審慎。",
  },
  {
    inn: "Acetylcysteine",
    category: "B",
    specialty: ["ENT", "RESP"],
    classZh: "黏液溶解劑",
  },
  {
    inn: "Bromhexine",
    category: "NR",
    specialty: ["ENT", "RESP"],
    classZh: "化痰藥",
    noteZh: "無 FDA 字母分級；依台灣仿單審慎使用。",
  },
  {
    inn: "Ambroxol",
    category: "NR",
    specialty: ["ENT", "RESP"],
    classZh: "化痰藥",
    noteZh: "無 FDA 字母分級；第一孕期不建議。",
  },
  {
    inn: "Ciprofloxacin (otic)",
    category: "C",
    specialty: ["ENT"],
    classZh: "耳用氟喹諾酮",
    noteZh: "局部使用全身吸收低。",
  },

  // ─────────────────────────────────────────────
  // 腸胃 GI
  // ─────────────────────────────────────────────
  {
    inn: "Omeprazole",
    category: "C",
    specialty: ["GI"],
    classZh: "質子幫浦抑制劑（PPI）",
  },
  {
    inn: "Esomeprazole",
    category: "B",
    specialty: ["GI"],
    classZh: "質子幫浦抑制劑（PPI）",
  },
  {
    inn: "Lansoprazole",
    category: "B",
    specialty: ["GI"],
    classZh: "質子幫浦抑制劑（PPI）",
  },
  {
    inn: "Pantoprazole",
    category: "B",
    specialty: ["GI"],
    classZh: "質子幫浦抑制劑（PPI）",
  },
  {
    inn: "Rabeprazole",
    category: "B",
    specialty: ["GI"],
    classZh: "質子幫浦抑制劑（PPI）",
  },
  {
    inn: "Famotidine",
    category: "B",
    specialty: ["GI"],
    classZh: "H2 受體拮抗劑",
  },
  {
    inn: "Cimetidine",
    category: "B",
    specialty: ["GI"],
    classZh: "H2 受體拮抗劑",
  },
  {
    inn: "Sucralfate",
    category: "B",
    specialty: ["GI"],
    classZh: "黏膜保護劑",
    noteZh: "幾乎不吸收，妊娠胃食道逆流首選之一。",
  },
  {
    inn: "Aluminum/magnesium hydroxide",
    category: "B",
    specialty: ["GI"],
    classZh: "制酸劑",
    noteZh: "間歇使用安全；避免長期大量。",
  },
  {
    inn: "Calcium carbonate",
    category: "B",
    specialty: ["GI"],
    classZh: "制酸劑 / 鈣補充",
  },
  {
    inn: "Bismuth subsalicylate",
    category: "C",
    categoryDetail: "C（第三孕期 D）",
    specialty: ["GI"],
    classZh: "含水楊酸鉍鹽",
    noteZh: "含水楊酸成分，晚期妊娠避免。",
  },
  {
    inn: "Ondansetron",
    category: "B",
    specialty: ["GI"],
    classZh: "5-HT3 受體拮抗劑（止吐）",
    noteZh: "第一孕期使用與唇顎裂的關聯性仍有爭議，權衡使用。",
  },
  {
    inn: "Metoclopramide",
    category: "B",
    specialty: ["GI"],
    classZh: "促腸胃蠕動 / 止吐藥",
  },
  {
    inn: "Domperidone",
    category: "NR",
    specialty: ["GI"],
    classZh: "促腸胃蠕動藥",
    noteZh: "無 FDA 字母分級（美國未上市）；注意 QT 延長。",
  },
  {
    inn: "Mosapride",
    category: "NR",
    specialty: ["GI"],
    classZh: "促腸胃蠕動藥（5-HT4 致效）",
    noteZh: "無 FDA 字母分級；依台灣仿單審慎使用。",
  },
  {
    inn: "Doxylamine + pyridoxine",
    category: "A",
    specialty: ["GI", "OBGYN"],
    classZh: "抗組織胺 + 維生素 B6",
    noteZh: "妊娠噁心嘔吐第一線藥物。",
  },
  {
    inn: "Hyoscine butylbromide",
    category: "C",
    specialty: ["GI"],
    classZh: "抗膽鹼 / 抗痙攣藥",
  },
  {
    inn: "Dicyclomine",
    category: "B",
    specialty: ["GI"],
    classZh: "抗膽鹼 / 抗痙攣藥",
  },
  {
    inn: "Mebeverine",
    category: "NR",
    specialty: ["GI"],
    classZh: "腸道平滑肌解痙劑",
    noteZh: "無 FDA 字母分級；資料有限。",
  },
  {
    inn: "Loperamide",
    category: "C",
    specialty: ["GI"],
    classZh: "止瀉藥",
    noteZh: "第一孕期避免，必要時短期使用。",
  },
  {
    inn: "Diphenoxylate/atropine",
    category: "C",
    specialty: ["GI"],
    classZh: "止瀉藥（鴉片類衍生）",
  },
  {
    inn: "Lactulose",
    category: "B",
    specialty: ["GI"],
    classZh: "滲透性緩瀉劑",
  },
  {
    inn: "Polyethylene glycol",
    category: "C",
    specialty: ["GI"],
    classZh: "滲透性緩瀉劑（PEG）",
    noteZh: "全身吸收極低，妊娠便秘常用。",
  },
  {
    inn: "Psyllium",
    category: "B",
    specialty: ["GI"],
    classZh: "膨脹性緩瀉劑（纖維）",
  },
  {
    inn: "Bisacodyl",
    category: "C",
    specialty: ["GI"],
    classZh: "刺激性緩瀉劑",
  },
  { inn: "Senna", category: "C", specialty: ["GI"], classZh: "刺激性緩瀉劑" },
  { inn: "Docusate", category: "C", specialty: ["GI"], classZh: "軟便劑" },
  {
    inn: "Simethicone",
    category: "C",
    specialty: ["GI"],
    classZh: "消脹氣劑",
    noteZh: "不吸收，視為安全。",
  },
  {
    inn: "Mesalamine",
    category: "B",
    specialty: ["GI"],
    classZh: "5-ASA（發炎性腸道疾病）",
  },
  {
    inn: "Sulfasalazine",
    category: "B",
    categoryDetail: "B（近足月 D）",
    specialty: ["GI"],
    classZh: "5-ASA / 磺胺類",
    noteZh: "併用葉酸；近足月注意新生兒核黃疸。",
  },
  {
    inn: "Ursodeoxycholic acid",
    category: "B",
    specialty: ["GI", "OBGYN"],
    classZh: "膽酸",
    noteZh: "妊娠肝內膽汁滯留症（ICP）治療用藥。",
  },
  {
    inn: "Rifaximin",
    category: "C",
    specialty: ["GI", "ABX"],
    classZh: "不吸收型腸道抗生素",
  },
  {
    inn: "Octreotide",
    category: "B",
    specialty: ["GI", "ENDO"],
    classZh: "體抑素類似物",
  },

  // ─────────────────────────────────────────────
  // 泌尿 URO
  // ─────────────────────────────────────────────
  {
    inn: "Tamsulosin",
    category: "B",
    specialty: ["URO"],
    classZh: "α1 阻斷劑（攝護腺）",
    noteZh: "亦用於輸尿管結石排石（MET）。",
  },
  {
    inn: "Alfuzosin",
    category: "B",
    specialty: ["URO"],
    classZh: "α1 阻斷劑（攝護腺）",
  },
  {
    inn: "Silodosin",
    category: "B",
    specialty: ["URO"],
    classZh: "α1 阻斷劑（攝護腺）",
  },
  {
    inn: "Doxazosin",
    category: "C",
    specialty: ["URO", "CV"],
    classZh: "α1 阻斷劑",
  },
  {
    inn: "Terazosin",
    category: "C",
    specialty: ["URO", "CV"],
    classZh: "α1 阻斷劑",
  },
  {
    inn: "Finasteride",
    category: "X",
    specialty: ["URO"],
    classZh: "5α 還原酶抑制劑",
    noteZh: "禁用：男胎外生殖器發育異常風險（孕婦勿接觸碎裂錠劑）。",
  },
  {
    inn: "Dutasteride",
    category: "X",
    specialty: ["URO"],
    classZh: "5α 還原酶抑制劑",
    noteZh: "禁用（同 finasteride）。",
  },
  {
    inn: "Oxybutynin",
    category: "B",
    specialty: ["URO"],
    classZh: "抗膽鹼（膀胱過動）",
  },
  {
    inn: "Tolterodine",
    category: "C",
    specialty: ["URO"],
    classZh: "抗膽鹼（膀胱過動）",
  },
  {
    inn: "Solifenacin",
    category: "C",
    specialty: ["URO"],
    classZh: "抗膽鹼（膀胱過動）",
  },
  {
    inn: "Mirabegron",
    category: "C",
    specialty: ["URO"],
    classZh: "β3 腎上腺素受體致效劑（膀胱過動）",
  },
  {
    inn: "Flavoxate",
    category: "B",
    specialty: ["URO"],
    classZh: "泌尿道平滑肌解痙劑",
  },
  {
    inn: "Sildenafil",
    category: "B",
    specialty: ["URO"],
    classZh: "PDE5 抑制劑",
  },
  {
    inn: "Tadalafil",
    category: "B",
    specialty: ["URO"],
    classZh: "PDE5 抑制劑",
  },
  {
    inn: "Phenazopyridine",
    category: "B",
    specialty: ["URO"],
    classZh: "泌尿道止痛劑",
    noteZh: "近足月避免（G6PD 缺乏者新生兒溶血/高鐵血紅素）。",
  },
  {
    inn: "Desmopressin",
    category: "B",
    specialty: ["URO", "ENDO"],
    classZh: "抗利尿激素類似物（夜尿/尿崩）",
  },
  {
    inn: "Tolvaptan",
    category: "C",
    specialty: ["URO"],
    classZh: "Vaptan（V2 受體拮抗劑）",
  },
  {
    inn: "Potassium citrate",
    category: "C",
    specialty: ["URO"],
    classZh: "尿液鹼化劑（結石預防）",
  },
  {
    inn: "Allopurinol",
    category: "C",
    specialty: ["URO"],
    classZh: "黃嘌呤氧化酶抑制劑（降尿酸）",
  },
  {
    inn: "Febuxostat",
    category: "C",
    specialty: ["URO"],
    classZh: "黃嘌呤氧化酶抑制劑（降尿酸）",
  },
  {
    inn: "Colchicine",
    category: "C",
    specialty: ["URO"],
    classZh: "抗痛風急性發作",
  },

  // ─────────────────────────────────────────────
  // 內分泌 / 代謝 ENDO
  // ─────────────────────────────────────────────
  {
    inn: "Insulin",
    category: "B",
    specialty: ["ENDO"],
    classZh: "胰島素",
    noteZh: "妊娠糖尿病血糖控制首選。",
  },
  {
    inn: "Metformin",
    category: "B",
    specialty: ["ENDO"],
    classZh: "雙胍類",
    noteZh: "妊娠糖尿病可用。",
  },
  {
    inn: "Glyburide",
    category: "B",
    categoryDetail: "B/C",
    specialty: ["ENDO"],
    classZh: "磺醯尿素類",
  },
  {
    inn: "Semaglutide",
    category: "C",
    specialty: ["ENDO"],
    classZh: "升糖素類似胜肽-1 受體促效劑（GLP-1 RA）",
    noteZh: "妊娠避免；建議計畫懷孕前停用（依仿單需提前停藥）。",
  },
  {
    inn: "Tirzepatide",
    category: "C",
    specialty: ["ENDO"],
    classZh: "GIP/GLP-1 雙重受體促效劑（替爾泊肽）",
    noteZh: "妊娠避免；恐影響口服避孕藥吸收。",
  },
  {
    inn: "Empagliflozin",
    category: "C",
    specialty: ["ENDO"],
    classZh: "SGLT2 抑制劑",
    noteZh: "第二、三孕期避免（影響胎兒腎臟發育）。",
  },
  {
    inn: "Sitagliptin",
    category: "C",
    specialty: ["ENDO"],
    classZh: "DPP-4 抑制劑",
    noteZh: "妊娠資料有限，避免。",
  },
  {
    inn: "Levothyroxine",
    category: "A",
    specialty: ["ENDO"],
    classZh: "甲狀腺素",
    noteZh: "妊娠甲狀腺低下需治療，劑量常需上調。",
  },
  {
    inn: "Propylthiouracil",
    category: "D",
    specialty: ["ENDO"],
    classZh: "抗甲狀腺藥",
    noteZh: "第一孕期首選（methimazole 致畸風險較高）。",
  },
  {
    inn: "Methimazole",
    category: "D",
    specialty: ["ENDO"],
    classZh: "抗甲狀腺藥",
    noteZh: "第二、三孕期首選；第一孕期改用 PTU。",
  },
  {
    inn: "Prednisolone",
    category: "C",
    categoryDetail: "C（長期/高劑量 D）",
    specialty: ["ENDO"],
    classZh: "皮質類固醇",
  },

  // ─────────────────────────────────────────────
  // 神經 / 精神 NEURO / PSYCH
  // ─────────────────────────────────────────────
  {
    inn: "Sertraline",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "SSRI",
    noteZh: "妊娠憂鬱症常用 SSRI 之一。",
  },
  { inn: "Fluoxetine", category: "C", specialty: ["PSYCH"], classZh: "SSRI" },
  { inn: "Escitalopram", category: "C", specialty: ["PSYCH"], classZh: "SSRI" },
  {
    inn: "Paroxetine",
    category: "D",
    specialty: ["PSYCH"],
    classZh: "SSRI",
    noteZh: "第一孕期心臟畸形風險增加，避免。",
  },
  {
    inn: "Lorazepam",
    category: "D",
    specialty: ["PSYCH"],
    classZh: "苯二氮平類",
  },
  {
    inn: "Alprazolam",
    category: "D",
    specialty: ["PSYCH"],
    classZh: "苯二氮平類",
  },
  {
    inn: "Diazepam",
    category: "D",
    specialty: ["PSYCH", "NEURO"],
    classZh: "苯二氮平類",
  },
  {
    inn: "Zolpidem",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "非苯二氮平安眠藥（Z-drug）",
  },
  {
    inn: "Valproate",
    category: "D",
    categoryDetail: "D（偏頭痛適應症 X）",
    specialty: ["NEURO", "PSYCH"],
    classZh: "抗癲癇藥 / 情緒穩定劑",
    noteZh: "高致畸性與神經發育風險，育齡女性盡量避免。",
  },
  {
    inn: "Carbamazepine",
    category: "D",
    specialty: ["NEURO", "PSYCH"],
    classZh: "抗癲癇藥",
    noteZh: "神經管缺陷風險。",
  },
  {
    inn: "Phenytoin",
    category: "D",
    specialty: ["NEURO"],
    classZh: "抗癲癇藥",
    noteZh: "fetal hydantoin syndrome。",
  },
  {
    inn: "Lamotrigine",
    category: "C",
    specialty: ["NEURO", "PSYCH"],
    classZh: "抗癲癇藥",
    noteZh: "妊娠相對較佳選擇之一（劑量常需調整）。",
  },
  {
    inn: "Levetiracetam",
    category: "C",
    specialty: ["NEURO"],
    classZh: "抗癲癇藥",
    noteZh: "妊娠相對較佳選擇之一。",
  },
  {
    inn: "Gabapentin",
    category: "C",
    specialty: ["NEURO", "ANALGESIC"],
    classZh: "Gabapentinoid",
  },
  {
    inn: "Pregabalin",
    category: "C",
    specialty: ["NEURO", "ANALGESIC"],
    classZh: "Gabapentinoid",
  },
  {
    inn: "Lithium",
    category: "D",
    specialty: ["PSYCH"],
    classZh: "情緒穩定劑",
    noteZh: "第一孕期 Ebstein anomaly 風險。",
  },
  {
    inn: "Haloperidol",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "第一代抗精神病藥",
  },
  {
    inn: "Quetiapine",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "第二代抗精神病藥",
  },
  {
    inn: "Olanzapine",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "第二代抗精神病藥",
  },
  {
    inn: "Risperidone",
    category: "C",
    specialty: ["PSYCH"],
    classZh: "第二代抗精神病藥",
  },
  {
    inn: "Sumatriptan",
    category: "C",
    specialty: ["NEURO"],
    classZh: "Triptan（偏頭痛急性治療）",
  },

  // ─────────────────────────────────────────────
  // 呼吸 / 過敏 RESP
  // ─────────────────────────────────────────────
  {
    inn: "Salbutamol",
    category: "C",
    specialty: ["RESP"],
    classZh: "短效吸入型 β2 致效劑（SABA）",
    noteZh: "妊娠氣喘急救可用。",
  },
  {
    inn: "Budesonide (inhaled)",
    category: "B",
    specialty: ["RESP"],
    classZh: "吸入型類固醇（ICS）",
    noteZh: "妊娠氣喘控制首選 ICS。",
  },
  {
    inn: "Fluticasone (inhaled)",
    category: "C",
    specialty: ["RESP"],
    classZh: "吸入型類固醇（ICS）",
  },
  {
    inn: "Montelukast",
    category: "B",
    specialty: ["RESP"],
    classZh: "白三烯素受體拮抗劑",
  },
  {
    inn: "Ipratropium",
    category: "B",
    specialty: ["RESP"],
    classZh: "吸入型抗膽鹼（SAMA）",
  },

  // ─────────────────────────────────────────────
  // 婦產 / 其他 OBGYN / OTHER（含高風險 X 類）
  // ─────────────────────────────────────────────
  {
    inn: "Isotretinoin",
    category: "X",
    specialty: ["OTHER"],
    classZh: "口服 A 酸（retinoid）",
    noteZh: "禁用：嚴重致畸性，需嚴格避孕計畫。",
  },
  {
    inn: "Methotrexate",
    category: "X",
    specialty: ["OTHER"],
    classZh: "抗代謝藥 / 免疫調節（非腫瘤適應症）",
    noteZh: "禁用（非腫瘤用途）：致畸、流產。",
  },
  {
    inn: "Misoprostol",
    category: "X",
    categoryDetail: "X（潰瘍適應症）",
    specialty: ["GI", "OBGYN"],
    classZh: "前列腺素 E1 類似物",
    noteZh: "致子宮收縮 / 流產；產科另有特定引產用途。",
  },
  {
    inn: "Thalidomide",
    category: "X",
    specialty: ["OTHER"],
    classZh: "免疫調節劑",
    noteZh: "禁用：經典嚴重致畸物。",
  },
  {
    inn: "Leflunomide",
    category: "X",
    specialty: ["OTHER"],
    classZh: "免疫調節劑（DMARD）",
    noteZh: "禁用：致畸；需洗脫程序。",
  },
  {
    inn: "Ribavirin",
    category: "X",
    specialty: ["ABX"],
    classZh: "抗病毒藥",
    noteZh: "禁用：致畸（男女皆需避孕）。",
  },
  {
    inn: "Ergotamine",
    category: "X",
    specialty: ["NEURO"],
    classZh: "麥角生物鹼（偏頭痛）",
    noteZh: "禁用：子宮收縮、血管收縮。",
  },
];

/** 依科別篩選的便利函式 */
export function drugsBySpecialty(s: Specialty): DrugPregnancyInfo[] {
  return DRUGS.filter((d) => d.specialty.includes(s));
}

export default DRUGS;
