/**
 * drugInteractions.ts
 * ------------------------------------------------------------------
 * 藥物交互作用資料（drug–drug + drug–food）— 教學參考用
 *
 * 注意事項：
 * - 學名 (INN) 一律小寫存放，用於比對；顯示時首字母大寫。
 * - 本清單為常見、具臨床意義之交互作用摘要，並非完整；
 *   類別性交互作用（如 NSAIDs、statins、nitrates）以代表性成分列示。
 * - 處方前務必核對最新仿單與專業交互作用資料庫。
 *
 * INN names are stored lowercase for matching. This is an educational
 * summary and NOT exhaustive — always verify with a full database.
 */

export type Severity = "contraindicated" | "major" | "moderate" | "minor";

export const SEVERITY_LABELS: Record<Severity, string> = {
  contraindicated: "禁忌併用",
  major: "嚴重",
  moderate: "中度",
  minor: "輕度",
};

export const SEVERITY_CLASS: Record<Severity, string> = {
  contraindicated: "is-x",
  major: "is-major",
  moderate: "is-mod",
  minor: "is-minor",
};

/** 排序權重（越大越嚴重） */
export const SEVERITY_RANK: Record<Severity, number> = {
  contraindicated: 4,
  major: 3,
  moderate: 2,
  minor: 1,
};

export interface DrugDrugInteraction {
  a: string; // INN（小寫）
  b: string; // INN（小寫）
  severity: Severity;
  /** 後果 / 會造成什麼 */
  effect: string;
  /** 處置建議 */
  mgmt: string;
}

export interface DrugFoodInteraction {
  drug: string; // INN（小寫）
  food: string; // 食物 / 飲品
  severity: Severity;
  effect: string;
  mgmt: string;
}

// ── 藥物–藥物交互作用 ──────────────────────────────────────────────
export const DDI_LIST: DrugDrugInteraction[] = [
  { a: "warfarin", b: "aspirin", severity: "major", effect: "抗血小板 + 抗凝血，顯著增加出血風險（尤其胃腸道與顱內）。", mgmt: "避免併用；必要時嚴密監測 INR 與出血徵象，考慮 PPI 保護。" },
  { a: "warfarin", b: "ibuprofen", severity: "major", effect: "NSAIDs 抑制血小板並傷胃黏膜，加重出血風險。", mgmt: "避免併用；改用 acetaminophen 止痛，必要時加 PPI。" },
  { a: "warfarin", b: "amiodarone", severity: "major", effect: "抑制 warfarin 代謝，INR 上升、出血。", mgmt: "warfarin 通常需減量 30–50%，起始後密切監測 INR。" },
  { a: "warfarin", b: "fluconazole", severity: "major", effect: "抑制 CYP2C9，INR 明顯上升。", mgmt: "監測 INR，多需減量。" },
  { a: "warfarin", b: "clarithromycin", severity: "major", effect: "抑制代謝，INR 上升、出血。", mgmt: "監測 INR；可考慮改用 azithromycin。" },
  { a: "warfarin", b: "rifampin", severity: "major", effect: "誘導代謝，抗凝效果下降、血栓風險。", mgmt: "監測 INR，多需增量。" },
  { a: "warfarin", b: "tramadol", severity: "moderate", effect: "INR 可能上升。", mgmt: "監測 INR 與出血徵象。" },
  { a: "simvastatin", b: "clarithromycin", severity: "contraindicated", effect: "強效 CYP3A4 抑制，statin 濃度暴增 → 肌病變 / 橫紋肌溶解。", mgmt: "禁忌併用；抗生素療程期間暫停 statin，或改 azithromycin。" },
  { a: "simvastatin", b: "erythromycin", severity: "major", effect: "抑制代謝，肌病變 / 橫紋肌溶解風險。", mgmt: "避免併用或暫停 statin。" },
  { a: "simvastatin", b: "amlodipine", severity: "moderate", effect: "amlodipine 抑制 CYP3A4，增加肌病變風險。", mgmt: "simvastatin 每日劑量勿超過 20 mg。" },
  { a: "simvastatin", b: "gemfibrozil", severity: "contraindicated", effect: "顯著增加橫紋肌溶解風險。", mgmt: "禁忌併用；若需 fibrate 改用 fenofibrate。" },
  { a: "atorvastatin", b: "clarithromycin", severity: "major", effect: "statin 濃度上升，肌病變風險。", mgmt: "限制劑量或療程期間暫停。" },
  { a: "clopidogrel", b: "omeprazole", severity: "moderate", effect: "抑制 CYP2C19，降低 clopidogrel 活化 → 抗血小板效果減弱。", mgmt: "改用 pantoprazole 或 famotidine。" },
  { a: "lisinopril", b: "spironolactone", severity: "major", effect: "兩者皆升鉀 → 高血鉀，可能致命性心律不整。", mgmt: "監測血鉀與腎功能；避免同時加鉀。" },
  { a: "lisinopril", b: "potassium", severity: "major", effect: "高血鉀風險。", mgmt: "監測血鉀，避免補鉀或低鈉鹽。" },
  { a: "lisinopril", b: "ibuprofen", severity: "moderate", effect: "NSAIDs 減弱降壓效果並惡化腎功能（三重打擊更甚）。", mgmt: "監測血壓與腎功能，避免長期併用。" },
  { a: "losartan", b: "spironolactone", severity: "major", effect: "ARB + 保鉀利尿劑 → 高血鉀。", mgmt: "監測血鉀與腎功能。" },
  { a: "digoxin", b: "amiodarone", severity: "major", effect: "digoxin 濃度上升 → 中毒（噁心、視覺異常、心律不整）。", mgmt: "digoxin 減量約 50%，監測濃度。" },
  { a: "digoxin", b: "verapamil", severity: "major", effect: "digoxin 濃度上升、心搏過緩。", mgmt: "監測濃度與心率，考慮減量。" },
  { a: "digoxin", b: "clarithromycin", severity: "major", effect: "digoxin 濃度上升 → 中毒。", mgmt: "監測濃度。" },
  { a: "methotrexate", b: "ibuprofen", severity: "major", effect: "NSAIDs 降低 MTX 排除 → 骨髓抑制、腎毒性（高劑量尤甚）。", mgmt: "高劑量 MTX 禁併用；低劑量須監測血球與腎功能。" },
  { a: "methotrexate", b: "trimethoprim", severity: "contraindicated", effect: "兩者皆抗葉酸 → 嚴重全血球減少。", mgmt: "禁忌併用。" },
  { a: "sertraline", b: "tramadol", severity: "major", effect: "皆增加血清素 → 血清素症候群（躁動、高熱、肌陣攣）。", mgmt: "避免併用或密切觀察，備妥處置。" },
  { a: "sertraline", b: "phenelzine", severity: "contraindicated", effect: "SSRI + MAOI → 致命性血清素症候群。", mgmt: "禁忌；換藥需間隔至少 14 天。" },
  { a: "fluoxetine", b: "linezolid", severity: "contraindicated", effect: "linezolid 具 MAOI 活性 → 血清素症候群。", mgmt: "避免併用；必要時停 SSRI 並間隔。" },
  { a: "sildenafil", b: "nitroglycerin", severity: "contraindicated", effect: "協同血管擴張 → 嚴重、難逆的低血壓。", mgmt: "禁忌；sildenafil 後 24 小時（tadalafil 48 小時）內勿用硝酸鹽。" },
  { a: "sildenafil", b: "isosorbide", severity: "contraindicated", effect: "與硝酸鹽協同 → 嚴重低血壓。", mgmt: "禁忌併用。" },
  { a: "verapamil", b: "metoprolol", severity: "major", effect: "非二氫吡啶 CCB + β 阻斷劑 → 心搏過緩、房室阻斷、心衰。", mgmt: "避免併用；若需併用嚴密監測心率與傳導。" },
  { a: "allopurinol", b: "azathioprine", severity: "major", effect: "抑制 azathioprine 代謝 → 骨髓抑制。", mgmt: "azathioprine 減量至約 1/4 並監測血球，或改 febuxostat 亦須小心。" },
  { a: "lithium", b: "ibuprofen", severity: "major", effect: "NSAIDs 降低鋰排除 → 鋰中毒。", mgmt: "避免；必要時監測鋰濃度。" },
  { a: "lithium", b: "hydrochlorothiazide", severity: "major", effect: "利尿劑降低鋰排除 → 鋰中毒。", mgmt: "監測鋰濃度，多需減量。" },
  { a: "lithium", b: "lisinopril", severity: "major", effect: "ACEI 降低鋰排除 → 鋰中毒。", mgmt: "監測濃度與腎功能。" },
  { a: "theophylline", b: "ciprofloxacin", severity: "major", effect: "抑制代謝 → theophylline 中毒（心悸、抽搐）。", mgmt: "監測濃度，考慮減量或改抗生素。" },
  { a: "amiodarone", b: "levofloxacin", severity: "major", effect: "皆延長 QT → torsades de pointes 風險。", mgmt: "避免併用其他延長 QT 藥；監測心電圖與電解質。" },
  { a: "carbamazepine", b: "clarithromycin", severity: "major", effect: "抑制代謝 → carbamazepine 中毒（複視、嗜睡、運動失調）。", mgmt: "監測濃度或改抗生素。" },
  { a: "phenytoin", b: "fluconazole", severity: "moderate", effect: "phenytoin 濃度上升。", mgmt: "監測濃度與臨床毒性。" },
  { a: "metformin", b: "iodinated contrast", severity: "major", effect: "顯影劑致急性腎損傷時，metformin 蓄積 → 乳酸中毒。", mgmt: "顯影檢查當日暫停 metformin，腎功能穩定 48 小時後再恢復。" },
  { a: "rifampin", b: "ethinylestradiol", severity: "major", effect: "誘導代謝 → 口服避孕失效。", mgmt: "療程期間及之後改用其他避孕方式。" },
  { a: "ciprofloxacin", b: "tizanidine", severity: "contraindicated", effect: "抑制代謝 → 嚴重低血壓與過度鎮靜。", mgmt: "禁忌併用。" },
  { a: "spironolactone", b: "potassium", severity: "major", effect: "高血鉀。", mgmt: "監測血鉀，避免額外補鉀。" },
  { a: "clarithromycin", b: "amiodarone", severity: "major", effect: "延長 QT → 心律不整。", mgmt: "避免併用；改 azithromycin。" },
  // ── Benzodiazepines / Z-drugs（BZD・安眠藥）──
  { a: "alprazolam", b: "morphine", severity: "major", effect: "BZD + 鴉片類加成中樞與呼吸抑制 → 呼吸抑制、死亡風險。", mgmt: "避免併用；必要時最低劑量並嚴密監測。" },
  { a: "alprazolam", b: "codeine", severity: "major", effect: "加成中樞與呼吸抑制。", mgmt: "避免或嚴密監測。" },
  { a: "alprazolam", b: "fentanyl", severity: "major", effect: "加成呼吸抑制 → 高死亡風險。", mgmt: "避免併用。" },
  { a: "alprazolam", b: "tramadol", severity: "major", effect: "加成中樞抑制，並增血清素症候群風險。", mgmt: "避免或謹慎併用。" },
  { a: "alprazolam", b: "ketoconazole", severity: "major", effect: "強效 CYP3A4 抑制 → alprazolam 濃度上升、過度鎮靜。", mgmt: "避免併用或大幅減量。" },
  { a: "alprazolam", b: "clarithromycin", severity: "major", effect: "抑制 CYP3A4 → BZD 濃度上升、過度鎮靜。", mgmt: "避免或減量並監測。" },
  { a: "alprazolam", b: "ritonavir", severity: "major", effect: "強效 CYP3A4 抑制 → BZD 濃度大增。", mgmt: "避免併用。" },
  { a: "alprazolam", b: "fluconazole", severity: "moderate", effect: "CYP3A4 抑制 → 濃度上升。", mgmt: "監測鎮靜程度，考慮減量。" },
  { a: "alprazolam", b: "diltiazem", severity: "moderate", effect: "CYP3A4 抑制 → 濃度上升。", mgmt: "監測、考慮減量。" },
  { a: "alprazolam", b: "fluvoxamine", severity: "moderate", effect: "強效 CYP1A2/3A4 抑制 → alprazolam 濃度上升。", mgmt: "監測、考慮減量。" },
  { a: "alprazolam", b: "rifampin", severity: "moderate", effect: "誘導 CYP3A4 → BZD 療效下降。", mgmt: "監測療效，多需調整。" },
  { a: "alprazolam", b: "carbamazepine", severity: "moderate", effect: "誘導代謝 → 療效下降。", mgmt: "監測療效。" },
  { a: "diazepam", b: "morphine", severity: "major", effect: "BZD + 鴉片類 → 呼吸抑制、死亡風險。", mgmt: "避免併用。" },
  { a: "diazepam", b: "fluvoxamine", severity: "moderate", effect: "CYP 抑制 → diazepam 濃度上升。", mgmt: "監測、考慮減量。" },
  { a: "zopiclone", b: "fluvoxamine", severity: "moderate", effect: "CYP 抑制 → zopiclone 濃度上升、過度鎮靜。", mgmt: "監測、考慮減量。" },
  // ── Agomelatine（Valdoxan）──
  { a: "agomelatine", b: "fluvoxamine", severity: "contraindicated", effect: "強效 CYP1A2 抑制 → agomelatine 濃度上升 60–100 倍，肝毒性風險。", mgmt: "禁忌併用。" },
  { a: "agomelatine", b: "ciprofloxacin", severity: "contraindicated", effect: "CYP1A2 抑制 → agomelatine 濃度大增。", mgmt: "禁忌併用。" },
  { a: "agomelatine", b: "ethinylestradiol", severity: "major", effect: "口服避孕藥為 CYP1A2 抑制劑 → agomelatine 濃度上升。", mgmt: "謹慎併用並監測肝功能。" },
  { a: "agomelatine", b: "carbamazepine", severity: "moderate", effect: "CYP1A2 誘導 → 療效下降。", mgmt: "監測療效。" },
  { a: "agomelatine", b: "rifampin", severity: "moderate", effect: "誘導代謝 → 療效下降。", mgmt: "監測療效。" },
  // ── Mirtazapine（Remeron）──
  { a: "mirtazapine", b: "alprazolam", severity: "moderate", effect: "加成 H1/中樞鎮靜（BZD）。", mgmt: "注意嗜睡與跌倒。" },
  { a: "mirtazapine", b: "phenelzine", severity: "contraindicated", effect: "與 MAOI 併用 → 血清素症候群。", mgmt: "禁忌；換藥需間隔 14 天。" },
  { a: "mirtazapine", b: "selegiline", severity: "contraindicated", effect: "與 MAOI-B 併用 → 血清素症候群風險。", mgmt: "避免併用。" },
  { a: "mirtazapine", b: "sertraline", severity: "moderate", effect: "加成血清素效應（mirtazapine 對 SERT 親和力低，風險較低）。", mgmt: "注意血清素症候群徵象。" },
  { a: "mirtazapine", b: "tramadol", severity: "moderate", effect: "增加血清素症候群風險。", mgmt: "注意徵象。" },
  { a: "mirtazapine", b: "linezolid", severity: "major", effect: "linezolid 具 MAOI 活性 → 血清素症候群。", mgmt: "避免併用。" },
  { a: "mirtazapine", b: "clonidine", severity: "moderate", effect: "α2 拮抗 → 降低 clonidine 降壓效果。", mgmt: "監測血壓。" },
];

// ── 藥物–食物交互作用 ──────────────────────────────────────────────
export const DFI_LIST: DrugFoodInteraction[] = [
  { drug: "warfarin", food: "富含維生素 K 食物（深綠葉菜、納豆）", severity: "moderate", effect: "維生素 K 拮抗 warfarin → 抗凝效果下降。", mgmt: "無須全禁，維持穩定攝取量，勿驟增驟減。" },
  { drug: "warfarin", food: "酒精", severity: "moderate", effect: "急性大量飲酒使 INR 上升、慢性飲酒影響代謝。", mgmt: "避免大量或不規律飲酒。" },
  { drug: "warfarin", food: "蔓越莓汁", severity: "moderate", effect: "可能使 INR 上升、出血。", mgmt: "避免大量攝取。" },
  { drug: "simvastatin", food: "葡萄柚（汁）", severity: "major", effect: "抑制腸道 CYP3A4 → 血中濃度大增、肌病變。", mgmt: "避免葡萄柚。" },
  { drug: "atorvastatin", food: "葡萄柚（汁）", severity: "moderate", effect: "濃度上升，肌病變風險。", mgmt: "限量或避免。" },
  { drug: "amlodipine", food: "葡萄柚（汁）", severity: "moderate", effect: "濃度上升 → 低血壓、水腫。", mgmt: "避免大量葡萄柚。" },
  { drug: "phenelzine", food: "酪胺食物（陳年起司、紅酒、發酵/醃製品）", severity: "contraindicated", effect: "MAOI 阻止酪胺代謝 → 高血壓危象。", mgmt: "嚴格避免酪胺食物。" },
  { drug: "doxycycline", food: "乳製品 / 鈣 / 鐵", severity: "moderate", effect: "與二價陽離子螯合 → 吸收下降、藥效不足。", mgmt: "與乳製品/鈣鐵間隔至少 2 小時。" },
  { drug: "ciprofloxacin", food: "乳製品 / 鈣 / 制酸劑", severity: "moderate", effect: "螯合 → 吸收明顯下降。", mgmt: "服藥前 2 小時、後 6 小時避免。" },
  { drug: "metronidazole", food: "酒精", severity: "major", effect: "雙硫侖樣反應（潮紅、噁心嘔吐、心悸）。", mgmt: "治療期間及停藥後 3 天禁酒。" },
  { drug: "levothyroxine", food: "咖啡 / 高纖 / 鈣 / 鐵", severity: "moderate", effect: "降低吸收 → 甲狀腺控制不佳。", mgmt: "空腹配白開水服用，與食物/鈣鐵間隔 30–60 分鐘至數小時。" },
  { drug: "alendronate", food: "食物 / 咖啡 / 果汁", severity: "major", effect: "任何食物飲料都大幅降低吸收，形同無效。", mgmt: "晨起空腹配白開水，服後保持直立、30 分鐘內勿進食。" },
  { drug: "lisinopril", food: "高鉀食物 / 低鈉鹽（鉀鹽）", severity: "moderate", effect: "高血鉀風險。", mgmt: "避免鉀鹽代用品，注意高鉀食物量。" },
  { drug: "theophylline", food: "咖啡因（咖啡、濃茶、能量飲）", severity: "moderate", effect: "加成中樞興奮 → 心悸、失眠、顫抖。", mgmt: "限制咖啡因攝取。" },
  { drug: "clopidogrel", food: "葡萄柚（汁）", severity: "moderate", effect: "抑制活化 → 抗血小板效果減弱。", mgmt: "避免大量葡萄柚。" },
  { drug: "sildenafil", food: "葡萄柚（汁）", severity: "moderate", effect: "濃度上升。", mgmt: "限量。" },
  { drug: "isoniazid", food: "富含組織胺/酪胺食物（鮪魚、鯖魚、陳年起司）", severity: "moderate", effect: "抑制代謝 → 潮紅、頭痛、心悸。", mgmt: "避免相關食物。" },
  { drug: "spironolactone", food: "高鉀食物 / 鉀鹽", severity: "moderate", effect: "高血鉀。", mgmt: "避免鉀鹽代用品。" },
  { drug: "iron", food: "茶 / 咖啡", severity: "moderate", effect: "單寧與多酚降低鐵吸收。", mgmt: "與茶咖啡間隔 1–2 小時，可配維生素 C。" },
  { drug: "digoxin", food: "高纖食物", severity: "minor", effect: "纖維可能略降吸收。", mgmt: "服藥與高纖餐間隔。" },
  { drug: "alprazolam", food: "酒精", severity: "major", effect: "加成 GABA 中樞抑制 → 過度鎮靜、呼吸抑制、記憶斷片。", mgmt: "避免飲酒。" },
  { drug: "alprazolam", food: "葡萄柚（汁）", severity: "moderate", effect: "腸道 CYP3A4 抑制 → 濃度上升、過度鎮靜。", mgmt: "避免葡萄柚。" },
  { drug: "alprazolam", food: "咖啡因", severity: "minor", effect: "拮抗鎮靜 / 抗焦慮效果。", mgmt: "留意大量咖啡因。" },
  { drug: "diazepam", food: "酒精", severity: "major", effect: "加成中樞抑制 → 過度鎮靜、呼吸抑制。", mgmt: "避免飲酒。" },
  { drug: "diazepam", food: "葡萄柚（汁）", severity: "moderate", effect: "CYP3A4 抑制 → 濃度上升。", mgmt: "避免葡萄柚。" },
  { drug: "triazolam", food: "葡萄柚（汁）", severity: "major", effect: "CYP3A4 抑制 → 濃度顯著上升、過度鎮靜。", mgmt: "避免葡萄柚。" },
  { drug: "zolpidem", food: "酒精", severity: "major", effect: "加成鎮靜 → 過度嗜睡、跌倒、複雜睡眠行為。", mgmt: "避免飲酒。" },
  { drug: "zolpidem", food: "高脂餐", severity: "minor", effect: "延緩吸收、延後入睡。", mgmt: "睡前空腹服用。" },
  { drug: "zopiclone", food: "酒精", severity: "major", effect: "加成鎮靜。", mgmt: "避免飲酒。" },
  { drug: "zopiclone", food: "高脂餐", severity: "minor", effect: "延緩吸收。", mgmt: "睡前空腹服用。" },
  { drug: "agomelatine", food: "酒精", severity: "major", effect: "加成肝毒性。", mgmt: "治療期間避免飲酒。" },
  { drug: "agomelatine", food: "葡萄柚（汁）", severity: "minor", effect: "次要 CYP3A4 途徑，可能略升濃度。", mgmt: "適量攝取。" },
  { drug: "mirtazapine", food: "酒精", severity: "major", effect: "加成鎮靜。", mgmt: "避免飲酒。" },
  { drug: "mirtazapine", food: "葡萄柚（汁）", severity: "minor", effect: "可能略升 mirtazapine 濃度。", mgmt: "適量攝取。" },
];

// 顯示用：INN 首字母大寫
export function displayDrug(inn: string): string {
  return inn.charAt(0).toUpperCase() + inn.slice(1);
}

// 全部已知藥名（供搜尋建議）
export const ALL_DRUGS: string[] = Array.from(
  new Set([
    ...DDI_LIST.flatMap((d) => [d.a, d.b]),
    ...DFI_LIST.map((d) => d.drug),
  ]),
).sort();
