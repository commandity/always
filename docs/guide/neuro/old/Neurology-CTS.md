---
layout: doc
title: CTS 腕隧道症候群臨床決策樹
---

# CTS 腕隧道症候群臨床決策樹

**CTS Carpal Tunnel Syndrome Clinical Decision Tree**

## 概述

**腕隧道症候群**（Carpal Tunnel Syndrome, CTS）是最常見的周邊神經壓迫疾病，影響成人人口約 3–6%，女性盛行率為男性 3 倍。本頁整合**雙變量（Bivariate）**及**多變量（Multivariate）**臨床決策樹，協助在神經傳導檢查（NCS）前估算 CTS 臨床機率。

---

<CTSCalculator />

## 臨床評估流程

```
手部麻木/刺痛/疼痛主訴
              ↓
      基本病史詢問
   ├─ 夜間症狀（夜醒）
   ├─ Flick 徵（甩手可緩解）
   ├─ 職業/重複動作暴露
   └─ 合併症（甲狀腺、糖尿病、懷孕、RA）
              ↓
      Katz 手部症狀圖表
（患者在手部輪廓圖標記症狀部位）
              ↓
      理學檢查
   ├─ 食指掌側感覺（hypalgesia）
   ├─ 拇指外展肌力
   ├─ Phalen 測試（腕屈曲 60 秒）
   └─ Tinel 徵（叩擊腕管）
              ↓
  雙變量決策樹（Flick + Katz）
   ├─ 高度疑似 → NCS 確認 + 考慮手術
   ├─ 中度可能 → 完整多變量評估
   └─ 低度 → 鑑別診斷（頸椎、TOS）
              ↓
      神經傳導檢查（NCS）
   ├─ 正中神經遠端感覺潛時 > 3.5 ms
   └─ 正中-尺神經差異 > 0.4 ms
```

## 雙變量決策樹

### Flick 徵 × Katz 圖表 — 臨床機率矩陣

|                | Katz 典型 | Katz 疑似 | Katz 可能 | Katz 不典型 |
| -------------- | --------- | --------- | --------- | ----------- |
| **Flick 陽性** | ~93% ↑↑   | ~80% ↑    | ~55% ↑    | ~30%        |
| **Flick 陰性** | ~70% ↑    | ~60%      | ~40%      | **< 20%** ↓ |

> Katz 不典型（Unlikely）的負預測價值（LR- = 0.2）是排除 CTS 最有效的單一指標。

## 臨床指標診斷效能

| 指標                | 敏感性 | 特異性  | LR+ | LR-  | 說明                |
| ------------------- | ------ | ------- | --- | ---- | ------------------- |
| Flick 徵            | 93%    | 96%     | 23  | 0.07 | 最強單一指標        |
| Katz 典型/疑似      | 80%    | 90%     | 8   | 0.2  | 手部圖表分類        |
| Hypalgesia（食指）  | 22%    | 93%     | 3.1 | —    | 高特異性            |
| 拇指外展無力        | 23%    | 95%     | 1.8 | 0.5  | 嚴重時才出現        |
| Phalen 測試         | 57–75% | 56–93%  | 1.3 | 0.7  | 高度變異            |
| Tinel 徵            | 25–73% | 59–100% | 1.4 | 0.6  | 特異性優於敏感性    |
| 夜間症狀            | 51–77% | 27–68%  | 1.4 | —    | 敏感但不特異        |
| 方型腕（D/W > 0.7） | —      | —       | 4.6 | —    | OR 4.56（解剖因素） |

### Katz 手部圖表分類詳解

| 分類                   | 定義                                                              | CTS 機率       |
| ---------------------- | ----------------------------------------------------------------- | -------------- |
| **典型（Classic）**    | ≥2 個正中神經分布區症狀（拇、食、中指掌側）；無環指尺側及小指症狀 | 最高           |
| **疑似（Probable）**   | ≥2 個正中神經分布區；加上手掌或手腕症狀                           | 高             |
| **可能（Possible）**   | ≥1 個正中神經分布區；加上環指或手背症狀                           | 中             |
| **不典型（Unlikely）** | 僅有掌心、手背或小指症狀，無正中神經分布區                        | 低（LR- 最佳） |

> 正中神經分布區：拇指、食指、中指全部掌面 + 環指橈側半掌面。

## 多變量評估指標

### 加權評分邏輯（本工具採用）

| 指標               | 臨床意義                | 權重 |
| ------------------ | ----------------------- | ---- |
| Flick 徵           | 最強診斷指標（LR+ 23）  | 3 分 |
| Katz 典型/疑似     | 強陽性圖表（LR+ 8）     | 2 分 |
| Hypalgesia（食指） | 客觀感覺喪失（LR+ 3.1） | 2 分 |
| 夜間症狀           | 常見症狀                | 1 分 |
| Phalen 陽性        | 中等特異性              | 1 分 |
| 方型腕             | 解剖危險因子（OR 4.56） | 1 分 |
| Tinel 陽性         | 中等特異性              | 1 分 |

### 多變量分數解讀

| 分數 | 等級     | 預測 CTS 機率 | 建議行動                |
| ---- | -------- | ------------- | ----------------------- |
| ≥ 7  | 高度疑似 | > 90%         | NCS + 積極治療討論      |
| 5–6  | 疑似     | 75–90%        | NCS 確認 + 評估手術指標 |
| 3–4  | 可能     | 50–75%        | 考慮試行保守治療 + NCS  |
| 1–2  | 低度     | 20–50%        | 鑑別診斷 + 症狀追蹤     |
| 0    | 極低     | < 20%         | 考慮其他診斷            |

## 治療策略

### 保守治療（輕至中度）

| 治療方式       | 說明                             | 效果              |
| -------------- | -------------------------------- | ----------------- |
| 夜間腕部夾板   | 保持腕關節中立位，防止睡眠中屈腕 | 短期症狀改善 70%  |
| 局部類固醇注射 | 超音波引導或體表定位，注射腕管內 | 快速緩解 3–6 個月 |
| 口服 NSAIDs    | 短期止痛，不改變神經壓迫         | 短暫緩解          |
| 職業調整       | 減少重複腕部動作，符合人體工學   | 預防加重          |
| 物理治療       | 肌腱滑動運動、神經滑動運動       | 輔助改善          |

### 手術治療（中至重度）

**手術指標：**

- 保守治療 3–6 個月無效
- 大魚際肌萎縮（嚴重病例）
- NCS 確認中重度正中神經病變
- 患者偏好手術（知情同意後）

| 術式                       | 說明             | 復發率       |
| -------------------------- | ---------------- | ------------ |
| 開放性腕隧道減壓術（標準） | 切開橫向腕骨韌帶 | < 5%（長期） |
| 內視鏡腕隧道減壓術         | 微創，恢復較快   | 相近         |

> 手術成功率高達 90–95%（症狀完全緩解），但大魚際肌萎縮者感覺功能恢復可能不完全。

## CTS 鑑別診斷

| 鑑別診斷                | 區別特徵                                  |
| ----------------------- | ----------------------------------------- |
| 頸椎神經根病變（C6/C7） | 頸部症狀、頸部活動誘發、Spurling 試驗陽性 |
| 胸廓出口症候群（TOS）   | 手臂上舉誘發、鎖骨上窩壓痛                |
| 旋前圓肌症候群          | 前臂旋前抵抗時加重，掌心感覺受影響        |
| 多發性神經病變          | 雙側對稱、近端症狀、足部同時受影響        |
| 腕部腱鞘囊腫            | 局部腫塊、超音波可見                      |
| Raynaud 現象            | 遇冷誘發、顏色變化                        |

## 注意事項

::: warning 神經傳導檢查仍是金標準
臨床決策樹用於估算事前機率，協助決策是否進行 NCS。但最終診斷確認、嚴重度分級（輕/中/重度）及手術計畫前，應完成 NCS（正中神經遠端感覺/運動潛時 + 正中-尺神經差異比較）。
:::

::: warning Phalen 與 Tinel 的局限性
傳統上廣泛使用的 Phalen 測試和 Tinel 徵在不同研究中的敏感性/特異性差異極大，單一陽性或陰性不能診斷或排除 CTS。Flick 徵和 Katz 手部圖表的診斷效能顯著優於 Phalen 和 Tinel。
:::

::: info 懷孕相關 CTS
懷孕是 CTS 的強危險因子（盛行率 17–43%），通常在產後 3–6 個月自然緩解。首選保守治療（夜間夾板），避免類固醇注射（第一孕期）。
:::

::: info 職業性 CTS
重複性腕部動作、振動工具使用、長時間鍵盤打字是 CTS 的職業危險因子。台灣職業災害認定標準：以握持工具等手部重複性動作每天 4 小時以上且持續 1 年以上為參考指標。
:::

::: info 免責聲明
本計算器依據 Katz、D'Arcy & McGee 等臨床研究設計，僅供臨床教育及輔助評估參考，不能取代神經科、手外科或復健科正式評估。CTS 的最終診斷需結合完整病史、理學檢查及神經傳導檢查。
:::

## 參考文獻

1. Katz JN, Stirrat CR. **A self-administered hand diagram for the diagnosis of carpal tunnel syndrome.** _J Hand Surg Am._ 1990;15(2):360–363. PMID: 2324481

2. D'Arcy CA, McGee S. **The rational clinical examination: does this patient have carpal tunnel syndrome?** _JAMA._ 2000;283(23):3110–3117. PMID: 10865306

3. Calfee RP, Dale AM, Ryan D, Descatha A, Franzblau A, Evanoff B. **Performance of simplified scoring systems for hand diagrams in carpal tunnel syndrome screening.** _J Hand Surg Am._ 2012;37(1):10–17. PMID: 21975100

4. American Academy of Orthopaedic Surgeons. **Clinical Practice Guideline on the Management of Carpal Tunnel Syndrome.** AAOS; 2016.

5. Latinovic R, Gulliford MC, Hughes RA. **Incidence of common compressive neuropathies in primary care.** _J Neurol Neurosurg Psychiatry._ 2006;77(2):263–265. PMID: 16421136

6. Verdugo RJ, Salinas RA, Castillo JL, Cea JG. **Surgical versus non-surgical treatment for carpal tunnel syndrome.** _Cochrane Database Syst Rev._ 2008;(4):CD001552. PMID: 18843618

7. LeBlanc KE, Cestia W. **Carpal tunnel syndrome.** _Am Fam Physician._ 2011;83(8):952–958. PMID: 21524025

8. Graham B. **The value added by electrodiagnostic testing in the diagnosis of carpal tunnel syndrome.** _J Bone Joint Surg Am._ 2008;90(12):2587–2593. PMID: 19047699
