---
layout: doc
title: DAS28 類風濕性關節炎疾病活動指數
---

# DAS28 疾病活動指數

**DAS28 Disease Activity Score**

## 概述

**DAS28**（Disease Activity Score 28）是目前全球**最廣泛使用的類風濕性關節炎（RA）疾病活動度評估工具**，由荷蘭奈梅亨大學於 1995 年發展。DAS28 評估 28 個特定關節的觸痛與腫脹數目，結合發炎指標（ESR 或 CRP）及患者整體健康評估，計算出連續分數，用於指導治療決策、監測療效及調整藥物方案。

本工具支援兩種版本：**DAS28-ESR**（原始版本）及 **DAS28-CRP**（2005 修正版），兩者皆廣泛用於臨床，可依實驗室報告擇一使用。

---

<Das28Calculator />

## 計算公式

### DAS28-ESR（原始版本，Prevoo 1995）

```
DAS28-ESR = 0.56 × √TJC28 + 0.28 × √SJC28 + 0.70 × ln(ESR) + 0.014 × GH
```

### DAS28-CRP（修正版本，Fransen 2005）

```
DAS28-CRP = 0.56 × √TJC28 + 0.28 × √SJC28 + 0.36 × ln(CRP + 1) + 0.014 × GH + 0.96
```

| 變數      | 說明                                   | 範圍  |
| --------- | -------------------------------------- | ----- |
| **TJC28** | 28 個關節中的觸痛關節數                | 0–28  |
| **SJC28** | 28 個關節中的腫脹關節數                | 0–28  |
| **ESR**   | 紅血球沉降速率（mm/hour）              | > 0   |
| **CRP**   | C 反應蛋白（mg/L）；公式使用 ln(CRP+1) | ≥ 0   |
| **GH**    | 患者整體健康狀態（VAS 0–100）          | 0–100 |

> **CRP = 0 時**：ln(0+1) = 0，仍可正常計算，不需輸入特殊值。

## DAS28-ESR vs DAS28-CRP 比較

| 比較項目       | DAS28-ESR                        | DAS28-CRP                              |
| -------------- | -------------------------------- | -------------------------------------- |
| **發表年份**   | 1995                             | 2005                                   |
| **發炎指標**   | ESR（mm/hour）                   | CRP（mg/L）                            |
| **係數**       | 0.70 × ln(ESR)                   | 0.36 × ln(CRP+1) + 0.96                |
| **ESR 缺點**   | 受貧血、高齡、感染、懷孕影響較大 | —                                      |
| **CRP 優勢**   | —                                | 反映急性發炎更即時，受非發炎因素影響小 |
| **EULAR 認可** | ✓                                | ✓                                      |
| **分數可比性** | ❌ 兩版分數**不可直接互換**      | ❌                                     |
| **臨床應用**   | 傳統研究標準，歷史數據可比       | 常規血液更易取得，即時性更佳           |

> **重要**：DAS28-ESR 和 DAS28-CRP 的分數**不可直接互相比較**。同一患者的 CRP 版分數通常比 ESR 版**低約 0.3–0.5 分**，這是公式設計的系統性差異。追蹤時應**固定使用同一版本**。

## 疾病活動度分類

兩個版本使用相同的切截值分類：

| DAS28 分數  | 疾病活動度                    | 臨床意義                     |
| ----------- | ----------------------------- | ---------------------------- |
| **< 2.6**   | 緩解（Remission）             | 治療目標已達成，維持現有方案 |
| **2.6–3.2** | 低度活動（Low Activity）      | 接近緩解，維持並密切追蹤     |
| **3.2–5.1** | 中度活動（Moderate Activity） | 需考慮強化治療方案           |
| **> 5.1**   | 高度活動（High Activity）     | 需積極調整治療，評估生物製劑 |

> **EULAR 緩解標準**：DAS28 < 2.6 定義為疾病緩解，是現代 RA 治療的首要目標（Treat-to-Target 策略）。

## 28 個評估關節

DAS28 評估的 28 個關節涵蓋雙側對稱分布：

| 關節群              | 部位           | 數量   |
| ------------------- | -------------- | ------ |
| 近端指間關節（PIP） | 雙手食指至小指 | 8      |
| 掌指關節（MCP）     | 雙手拇指至小指 | 10     |
| 腕關節（Wrist）     | 雙側           | 2      |
| 肘關節（Elbow）     | 雙側           | 2      |
| 肩關節（Shoulder）  | 雙側           | 2      |
| 膝關節（Knee）      | 雙側           | 2      |
| **合計**            |                | **28** |

> **注意**：DAS28 不包含踝關節、足趾關節及頸椎關節。若這些部位有明顯病變，DAS28 可能低估疾病活動度。

## 關節評估方法

### 觸痛關節（TJC，Tender Joint Count）

評估者以拇指和食指輕壓各關節，詢問患者是否有疼痛：

- **陽性**：患者表示疼痛，或有防禦性縮退動作
- **陰性**：無疼痛感
- 觸痛不等同於腫脹，需分別記錄

### 腫脹關節（SJC，Swollen Joint Count）

評估者視診及觸診關節是否有滑液增多造成的腫脹：

- **陽性**：可觸及明顯的關節腔積液或滑膜增厚
- **陰性**：無滑液腫脹（單純骨性增生不計）
- 需與骨性腫大（如骨關節炎的赫貝登結節）區分

### 整體健康狀態（GH，Global Health）

使用**視覺類比量表（VAS）**由患者自評：

- 0 分：狀態最好（完全無不適）
- 100 分：狀態最差（難以忍受）
- 評估**過去一週**的整體健康感受

## 發炎指標說明

### ESR（紅血球沉降速率）

|      | 正常值       | 臨床特性                         |
| ---- | ------------ | -------------------------------- |
| 男性 | < 15 mm/hour | 上升緩慢，反映慢性發炎狀態       |
| 女性 | < 20 mm/hour | 受貧血、高齡、感染、懷孕影響較大 |

ESR 反映較慢性的發炎背景，是 DAS28 原始公式的發炎指標，歷史研究數據豐富，但在老年或貧血患者中可能假性偏高。

### CRP（C 反應蛋白）

| 數值      | 意義         |
| --------- | ------------ |
| < 5 mg/L  | 正常         |
| 5–50 mg/L | 輕至中度發炎 |
| > 50 mg/L | 重度發炎     |

CRP 比 ESR 更能**即時**反映發炎狀態，在治療介入後的反應監測上更靈敏，且受非發炎因素影響較小，是監測急性治療反應的優先選擇。DAS28-CRP 使用 ln(CRP+1) 而非 ln(CRP)，以避免 CRP = 0 時對數無意義的問題。

### 何時選擇 CRP 版？

- 需要**即時監測**治療反應（CRP 比 ESR 更快反映變化）
- 患者合併**貧血、高齡、懷孕**（ESR 可能假性偏高）
- 醫院常規報告已有 CRP 而未送 ESR
- 臨床試驗或研究需要更精確的發炎指標

## 治療目標策略（Treat-to-Target）

### T2T 原則（2022 EULAR 更新）

1. **目標**：達到 DAS28 < 2.6（緩解）為首要目標；若無法達到，則以低度活動（DAS28 < 3.2）為替代目標
2. **評估頻率**：活動期每 1–3 個月評估；穩定期每 6 個月評估
3. **調整時機**：3–6 個月未達目標時應調整治療方案
4. **固定版本**：追蹤時應固定使用 DAS28-ESR 或 DAS28-CRP，不可混用

### 藥物選擇依疾病活動度

| DAS28   | 建議治療策略                                          |
| ------- | ----------------------------------------------------- |
| < 2.6   | 維持現有 DMARD 治療                                   |
| 2.6–3.2 | 優化 csDMARD（如增加 Methotrexate 劑量）              |
| 3.2–5.1 | 考慮加強 csDMARD 或加入生物製劑（bDMARD）             |
| > 5.1   | 積極使用生物製劑或 JAK 抑制劑，考慮短期糖皮質激素橋接 |

## RA 治療藥物概覽

### 傳統合成 DMARD（csDMARD）

| 藥物                | 起效時間 | 注意事項                 |
| ------------------- | -------- | ------------------------ |
| Methotrexate（MTX） | 6–12 週  | 首選 csDMARD，需補充葉酸 |
| Hydroxychloroquine  | 2–6 個月 | 輕度 RA，需眼科追蹤      |
| Sulfasalazine       | 4–12 週  | 常與 MTX 合併使用        |
| Leflunomide         | 4–12 週  | MTX 替代選擇             |

### 生物製劑（bDMARD）

| 類別      | 代表藥物                           | 靶點         |
| --------- | ---------------------------------- | ------------ |
| 抗 TNF-α  | Adalimumab、Etanercept、Infliximab | TNF-α        |
| 抗 IL-6   | Tocilizumab、Sarilumab             | IL-6 受體    |
| 抗 CD20   | Rituximab                          | B 細胞       |
| CTLA-4-Ig | Abatacept                          | T 細胞共刺激 |

### JAK 抑制劑（tsDMARD）

| 藥物         | 靶點   | 特色                     |
| ------------ | ------ | ------------------------ |
| Tofacitinib  | JAK1/3 | 口服，快速起效           |
| Baricitinib  | JAK1/2 | 每日一次，需注意血栓風險 |
| Upadacitinib | JAK1   | 高選擇性，強效           |

## DAS28 的局限性

| 局限性               | 說明                                        |
| -------------------- | ------------------------------------------- |
| 關節覆蓋不完整       | 不含踝、足趾、頸椎關節，可能低估廣泛性病變  |
| ESR/CRP 版本不可混用 | 兩版分數存在系統性差異，追蹤時需固定版本    |
| ESR 受非發炎因素影響 | 貧血、高齡、感染、懷孕均可升高 ESR          |
| 主觀性               | TJC 和 GH 含有主觀成分，評估者間可能有差異  |
| 纖維肌痛混淆         | 合併纖維肌痛症者 TJC 可偏高，高估疾病活動度 |
| 早期緩解判定         | 達 DAS28 < 2.6 不等同於影像學緩解           |

## 注意事項

::: warning DAS28-ESR 與 DAS28-CRP 分數不可互換
同一患者使用 DAS28-CRP 計算的分數通常比 DAS28-ESR **低 0.3–0.5 分**，這是公式設計的系統性差異，並非病況改善。在病歷記錄及追蹤時，**必須標明使用哪個版本**，且整個追蹤過程中不可切換版本，否則會造成錯誤的疾病活動度判讀。
:::

::: warning DAS28 不能單獨用於診斷 RA
DAS28 是疾病活動度評估工具，不是診斷工具。RA 的診斷需依據 2010 ACR/EULAR 分類標準（關節受累、血清學、急性期反應物、症狀持續時間）。DAS28 僅在確診 RA 後用於監測和治療決策。
:::

::: warning 踝關節和足部病變需另外評估
DAS28 不包含踝關節和足趾關節。若患者有顯著的下肢關節病變，DAS28 可能低估整體疾病活動度，需配合 DAS44 或 SDAI/CDAI 等工具補充評估。
:::

::: info 免責聲明
本計算器僅供臨床評估參考，不能取代完整的臨床評估和實驗室檢查。RA 的治療決策應由風濕科醫師根據患者完整的臨床狀況、影像學表現及個別因素綜合判斷。
:::

## 參考文獻

1. Prevoo ML, van 't Hof MA, Kuper HH, van Leeuwen MA, van de Putte LB, van Riel PL. **Modified disease activity scores that include twenty-eight-joint counts. Development and validation in a prospective longitudinal study of patients with rheumatoid arthritis.** _Arthritis Rheum._ 1995;38(1):44–48.
2. Fransen J, Creemers MC, van Riel PL. **Remission in rheumatoid arthritis: agreement of the disease activity score (DAS28) with the ARA preliminary remission criteria.** _Rheumatology (Oxford)._ 2004;43(10):1252–1255.
3. Fransen J, van Riel PL. **The Disease Activity Score and the EULAR response criteria.** _Clin Exp Rheumatol._ 2005;23(5 Suppl 39):S93–S99.
4. Smolen JS, Landewé RBM, Bijlsma JWJ, et al. **EULAR recommendations for the management of rheumatoid arthritis with synthetic and biological disease-modifying antirheumatic drugs: 2022 update.** _Ann Rheum Dis._ 2023;82(1):3–18.
5. Aletaha D, Smolen JS. **The Disease Activity Score (DAS) and its role in the assessment of rheumatoid arthritis.** _Clin Exp Rheumatol._ 2005;23(5 Suppl 39):S14–S22.
