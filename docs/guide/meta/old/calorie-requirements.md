---
layout: doc
title: EER 成人熱量需求估算
---

# EER 成人熱量需求估算

**EER Estimated Energy Requirement**

## 概述

**EER**（Estimated Energy Requirement，估計能量需求）是美國國家醫學院（National Academies of Sciences, Engineering, and Medicine）在膳食參考攝取量（DRI）框架下所定義的每日平均膳食能量攝取量，能在特定年齡、性別、體重、身高及身體活動程度下維持能量平衡，並符合健康維持的需求。此計算器使用 IOM（Institute of Medicine）2002/2005 年發布的 EER 成人方程式，廣泛應用於臨床營養評估及體重管理。

---

<CalorieRequirementsCalculator />

## 計算公式

EER 依性別使用不同方程式，體重單位為公斤（kg）、身高單位為公尺（m）、年齡單位為年（y）：

**男性（Adult Male, ≥ 19 歲）：**

```
EER = 662 − 9.53 × Age(y) + PA × [15.91 × Wt(kg) + 539.6 × Ht(m)]
```

**女性（Adult Female, ≥ 19 歲）：**

```
EER = 354 − 6.91 × Age(y) + PA × [9.36 × Wt(kg) + 726 × Ht(m)]
```

## 身體活動程度（PA）係數

| 活動程度             | 描述                                          | PA（男） | PA（女） |
| -------------------- | --------------------------------------------- | -------- | -------- |
| 久坐 Sedentary       | 僅有日常生活的輕度活動                        | 1.00     | 1.00     |
| 低度活動 Low Active  | 相當於每日步行約 1.5–3 英里（以時速 3–4 mph） | 1.11     | 1.12     |
| 中度活動 Active      | 相當於每日步行超過 3 英里                     | 1.25     | 1.27     |
| 非常活動 Very Active | 每日高強度運動或體力勞動超過 1 小時           | 1.48     | 1.45     |

## 體重管理熱量目標

| 目標          | 每日熱量        | 說明                               |
| ------------- | --------------- | ---------------------------------- |
| 維持體重      | EER             | 能量平衡，體重穩定                 |
| 每週減 0.5 kg | EER − 500 kcal  | 安全減重速率，最低 1200 kcal/day   |
| 每週減 1.0 kg | EER − 1000 kcal | 積極減重，不建議低於 1200 kcal/day |

> 每減少 7,700 kcal 的累積熱量缺口，約可減少 1 公斤體重（基於 1 kcal ≈ 1/7700 kg 的近似值）。

## 認識 EER 的組成

每日總能量消耗（TEE）由三大部分組成：

### 1. 靜息代謝率（BMR / RMR）

佔 TEE 的約 60–75%，是維持基本生理功能（呼吸、心跳、體溫調節、細胞修復）所需的能量。年齡、性別、體型和肌肉量是主要決定因素。

### 2. 食物熱效應（TEF — Thermic Effect of Food）

佔 TEE 的約 10%，是消化、吸收和代謝食物所消耗的能量。蛋白質的食物熱效應最高（約 20–30%），碳水化合物次之（5–10%），脂肪最低（0–3%）。

### 3. 身體活動消耗（PAE — Physical Activity Energy Expenditure）

佔 TEE 的 15–30%（甚至更多），是最可調控的部分。這不僅包括有計畫的運動，也包含非運動性身體活動（NEAT：如站立、走路、家事等）。

## 影響 EER 的主要因素

### 年齡

隨年齡增長，BMR 每十年降低約 5–10%，主要原因是瘦體重（肌肉量）減少及激素變化。EER 方程式中以 `−9.53 × Age`（男性）或 `−6.91 × Age`（女性）反映此趨勢。

### 體型（身高與體重）

較高、較重的人通常需要更多能量。EER 方程式中，體重和身高均以正係數納入，反映較大身體的維持能量需求較高。

### 性別

相同年齡和體型下，男性的 EER 通常高於女性，因為男性的肌肉量（瘦體重）通常較多，而肌肉比脂肪消耗更多能量。

### 身體活動程度

PA 係數是 EER 的乘數因子，對最終結果影響最大。從久坐（PA = 1.00）到非常活動（PA = 1.48，男性），熱量需求可相差高達 48%。

## 減重的基本原理

健康體重管理的核心原則是能量平衡（Energy Balance）：

```
能量攝入 − 能量消耗 = 能量儲存（體脂變化）
```

**負能量平衡** 導致體重下降，**正能量平衡**導致體重上升。

### 安全減重速率

- **推薦速率**：每週減少 0.5–1 kg（每月 2–4 kg）
- **對應熱量缺口**：每日 −500 至 −1,000 kcal
- **最低熱量攝取**：女性 1,200 kcal/day，男性 1,500 kcal/day（避免營養不足）

> 過度限制熱量（< 800 kcal/day）會導致基礎代謝率大幅下降、肌肉流失、電解質失衡及其他代謝併發症，僅限醫療監督下使用。

## 熱量需求的個體差異

EER 方程式提供**群體平均估算值**，個體實際需求可能因以下因素而有所不同：

- **體型組成**：相同體重下，肌肉量較多者 BMR 較高
- **遺傳因素**：遺傳決定個體的基礎代謝率差異（±200–300 kcal）
- **荷爾蒙狀態**：甲狀腺功能、胰島素、雌激素等影響代謝
- **環境溫度**：寒冷環境增加產熱需求
- **疾病狀態**：發燒、感染、創傷、癌症等均增加能量需求
- **藥物影響**：某些藥物（如 β 受體阻斷劑）可降低代謝率

## 特殊族群注意事項

| 族群            | 注意事項                                       |
| --------------- | ---------------------------------------------- |
| 孕婦            | 第二孕期 +340 kcal/day，第三孕期 +452 kcal/day |
| 哺乳婦女        | +500 kcal/day（產後前 6 個月）                 |
| 兒童青少年      | 使用另立的兒科 EER 方程式（含生長所需能量）    |
| 嚴重肥胖者      | 使用實際體重計算，但需由醫師或營養師個別評估   |
| 老年人（>65歲） | EER 可能高估，建議輔以實際體重監測調整         |

## 臨床應用

EER 在以下臨床情境中廣泛使用：

- 住院患者的腸內/腸外營養（TPN/EN）計算
- 慢性病（糖尿病、腎臟病、心臟病）的飲食計畫
- 肥胖患者的系統性體重管理計畫
- 老年患者的營養評估與補充策略

## 注意事項

::: warning 僅適用於 19 歲以上成人
此計算器使用的 IOM EER 方程式適用於 19 歲及以上的一般成人。兒童與青少年請使用專屬的兒科 EER 計算器（含生長能量需求）。
:::

::: warning 孕婦與哺乳婦女不適用
EER 方程式不包含孕期及哺乳期的額外能量需求。懷孕及哺乳婦女請諮詢醫師或臨床營養師進行個別化評估。
:::

::: info 免責聲明
本計算器提供的 EER 為統計平均估算值，適合健康成人的一般參考。實際熱量需求因個體差異而異。任何體重管理計畫，尤其是減重超過每週 0.5 kg 者，建議諮詢醫師或註冊營養師（RD）進行個別化評估與指導。
:::

## 參考文獻

1. Institute of Medicine (US) Panel on Macronutrients et al. **Dietary Reference Intakes for Energy, Carbohydrate, Fiber, Fat, Fatty Acids, Cholesterol, Protein, and Amino Acids.** Washington, DC: The National Academies Press; 2005. doi: 10.17226/10490

2. National Academies of Sciences, Engineering, and Medicine. **Dietary Reference Intakes for Energy.** Washington, DC: The National Academies Press; 2023. doi: 10.17226/26818

3. Gerrior S, Juan WY, Basiotis P. **An easy approach to calculating estimated energy requirements.** Prev Chronic Dis. 2006;3(4):A129.

4. U.S. Department of Agriculture and U.S. Department of Health and Human Services. **Dietary Guidelines for Americans, 2020-2025.** 9th Edition. December 2020.

5. Hall KD, Heymsfield SB, Kemnitz JW, et al. **Energy balance and its components: implications for body weight regulation.** Am J Clin Nutr. 2012;95(4):989–994.
