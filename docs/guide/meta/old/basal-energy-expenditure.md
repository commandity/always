---
layout: doc
title: BEE 基礎能量消耗
---

# BEE 基礎能量消耗

**BEE Basal Energy Expenditure**

## 概述

**Harris-Benedict 方程式**由 James Arthur Harris 與 Francis Gano Benedict 於 1919 年在卡內基研究所（Carnegie Institution）發表，是人類有史以來最著名的能量消耗預測公式之一。經過超過一個世紀的廣泛使用，Harris-Benedict 至今仍是臨床營養支持、體重管理及運動醫學中的重要計算基礎。

---

<BasalEnergyExpenditureCalculator />

## 計算公式

### Harris-Benedict BEE 方程式（修訂版，Roza & Shizgal 1984）

**男性（W = kg, H = cm, Age = 年）：**

```
BEE = 66.5 + 13.75 × W + 5.003 × H − 6.775 × Age
```

**女性：**

```
BEE = 655.1 + 9.563 × W + 1.850 × H − 4.676 × Age
```

> 注意：臨床上常見的「原始 Harris-Benedict」（1919 年）的係數與此略有不同（男：66.473、13.7516、5.0033、6.7550；女：655.0955、9.5634、1.8496、4.6756）。本計算器使用廣泛引用的修訂版係數。

### 每日總熱量需求（TEE）

```
TEE = BEE × Activity Factor（AF）
```

## 活動係數（Activity Factor）

| 活動程度                   | AF    | 適用對象                                |
| -------------------------- | ----- | --------------------------------------- |
| 久坐 Sedentary             | 1.2   | 幾乎不運動，辦公桌工作                  |
| 輕度活動 Lightly Active    | 1.375 | 每週 1–3 天輕度運動（散步、瑜珈等）     |
| 中度活動 Moderately Active | 1.55  | 每週 3–5 天中等強度運動（慢跑、游泳等） |
| 高度活動 Very Active       | 1.725 | 每週 6–7 天高強度運動                   |
| 極高活動 Extra Active      | 1.9   | 每日訓練的運動員或重體力勞動者          |

## 與其他 BMR 公式的比較

| 公式            | 發表年份 | 特點                                   |
| --------------- | -------- | -------------------------------------- |
| Harris-Benedict | 1919     | 最早的科學化 BMR 公式，歷史最悠久      |
| Mifflin-St Jeor | 1990     | 美國營養師學會推薦，現代族群準確性最佳 |
| Schofield       | 1985     | WHO 官方推薦，全年齡分層，含兒童       |
| Owen            | 1986     | 基於大型樣本，但納入標準較複雜         |
| Ireton-Jones    | 1992     | 為呼吸器患者設計，適用重症加護病房     |

### 準確性比較研究

Frankenfield 等人（2005 年）在 3 種公式與間接熱量測定（Indirect Calorimetry）的比較研究中發現：

- **Mifflin-St Jeor**：在非肥胖和肥胖成人中準確率最高
- **Harris-Benedict（修訂版）**：在正常體重者中與間接熱量測定相關性良好，但可能高估現代人的 BMR 約 5%
- **Schofield**：在各年齡層中表現穩定

## BEE 的生理意義

BEE（Basal Energy Expenditure）在嚴格意義上是指**在完全靜息、禁食 12 小時後、恆溫環境（22°C）、覺醒狀態下**測量的能量消耗，與臨床上更常用的 RMR（Resting Metabolic Rate，靜息代謝率）略有差異（RMR 通常比 BEE 高約 10–20%，因條件較寬鬆）。

BEE 佔每日總能量消耗的比例：

| 組成部分            | 佔 TEE 百分比 | 說明                         |
| ------------------- | ------------- | ---------------------------- |
| 基礎代謝（BEE/BMR） | 60–75%        | 器官維持、體溫調節、神經活動 |
| 食物熱效應（TEF）   | 約 10%        | 消化、吸收和代謝食物         |
| 身體活動消耗（PAL） | 15–30%        | 運動及日常動作               |

## 影響 BEE 的因素

### 增加 BEE 的因素

- **肌肉量增加**：每增加 1 kg 瘦體重，BMR 增加約 13–22 kcal/day
- **甲狀腺功能亢進**：BEE 可增加 30–50%
- **發燒**：體溫每升高 1°C，BEE 增加約 7–13%
- **創傷/手術後**：根據嚴重程度，BEE 可增加 20–100%
- **大面積燒傷**：最高可使 BEE 增加 100–200%

### 降低 BEE 的因素

- **年齡增長**：每十年 BMR 下降約 5–10%（主因瘦體重流失）
- **節食/長期熱量限制**：可使代謝率下降 5–15%（適應性產熱調節）
- **甲狀腺功能低下**：BEE 可降低 20–40%
- **長期臥床**：肌肉萎縮導致代謝率下降

## 臨床應用

### 重症患者的營養支持

Harris-Benedict 可作為估算重症患者（ICU）熱量需求的起點，但需結合**壓力係數**（Stress Factor）調整：

| 臨床狀況              | 壓力係數（應用於 BEE） |
| --------------------- | ---------------------- |
| 術後（未複雜化）      | 1.0–1.1                |
| 感染 / 敗血症         | 1.2–1.5                |
| 多重骨折              | 1.2–1.4                |
| 嚴重燒傷（> 40% BSA） | 1.5–2.0                |
| 頭部外傷              | 1.4–1.6                |
| 癌症                  | 1.1–1.45               |

> 注意：現代重症營養指南（ESPEN、ASPEN）建議在急性期使用低熱量餵食（20–25 kcal/kg/day），恢復期再調高至全量。間接熱量測定（Indirect Calorimetry）是重症患者 TEE 評估的金標準。

### 糖尿病患者的飲食計畫

以 BEE × AF 估算每日總熱量需求，再根據血糖目標、體重目標及巨量營養素分配制定個別化飲食計畫。

### 腸外營養（TPN）處方

腸外營養熱量目標通常設定為 BEE 的 1.2–1.5 倍（視應激程度），避免過度餵食（Overfeeding）導致的高血糖、肝脂肪變性及免疫功能下降。

## 公式限制

**Harris-Benedict 的主要限制：**

1. **樣本過時且同質性高**：原始 1919 年研究的 239 名受試者多為年輕、健康、正常體重的白種美國人，不代表現代多元族群。
2. **可能高估現代人的 BMR**：與間接熱量測定相比，Harris-Benedict 平均高估 BMR 約 5%（部分研究顯示達 10%）。
3. **不考慮體型組成**：相同身高體重的人，肌肉量越多實際 BMR 越高，但公式無法反映此差異。
4. **不適用於極端情境**：嚴重疾病、大面積燒傷、嚴重肥胖、截肢患者的實際熱量需求差異顯著，應使用間接熱量測定。

## 注意事項

::: warning 肥胖患者建議使用 Mifflin-St Jeor
對 BMI > 30 的肥胖患者，Mifflin-St Jeor 公式（1990）比 Harris-Benedict 更準確，因其基於更廣泛的樣本並納入了現代人的代謝特性。
:::

::: warning 重症患者需間接熱量測定
在重症、多發性創傷或大面積燒傷患者中，公式估算的誤差可能超過 30%。此類患者建議使用間接熱量測定（Indirect Calorimetry）確定實際代謝率。
:::

::: info 免責聲明
本計算器提供的 BEE 及 TEE 為估算值，供臨床參考使用。實際的能量需求因個體生理差異、疾病狀態及活動模式而異，具體的營養支持計畫應由臨床醫師或註冊營養師（RD）制定。
:::

## 參考文獻

1. Harris JA, Benedict FG. **A biometric study of human basal metabolism.** Proc Natl Acad Sci USA. 1918;4(12):370–373. PMID: 16576330

2. Roza AM, Shizgal HM. **The Harris Benedict equation reevaluated: resting energy requirements and the body cell mass.** Am J Clin Nutr. 1984;40(1):168–182. PMID: 6741850

3. Frankenfield D, Roth-Yousey L, Compher C. **Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review.** J Am Diet Assoc. 2005;105(5):775–789. PMID: 15883556

4. Singer P, Blaser AR, Berger MM, et al. **ESPEN guideline on clinical nutrition in the intensive care unit.** Clin Nutr. 2019;38(1):48–79.

5. McClave SA, Taylor BE, Martindale RG, et al. **Guidelines for the provision and assessment of nutrition support therapy in the adult critically ill patient: ASPEN.** JPEN J Parenter Enteral Nutr. 2016;40(2):159–211.
