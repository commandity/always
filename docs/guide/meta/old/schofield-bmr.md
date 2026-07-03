---
layout: doc
title: Schofield BMR 基礎代謝率
---

# Schofield BMR 基礎代謝率

**Schofield BMR Basal Metabolic Rate**

## 概述

**Schofield 方程式**由英國流行病學家 W.N. Schofield 於 1985 年發表，是 WHO/FAO/UNU（世界衛生組織/聯合國糧農組織/聯合國大學）能量需求報告中的**官方推薦公式**。此方程式的特點在於**依年齡分組**，使用六個不同的方程式分別估算從嬰兒到老年的基礎代謝率（BMR），是目前全球應用最廣泛的跨年齡 BMR 預測工具。

---

<ScofieldBMRCalculator />

## 計算公式

Schofield 方程式僅需**體重**（W，公斤）即可計算，不需身高（簡化版）。

### 男性 BMR（kcal/day）

| 年齡組別 | 方程式             | SEE（標準誤差） |
| -------- | ------------------ | --------------- |
| < 3 歲   | 59.512 × W − 30.4  | 70 kcal         |
| 3–10 歲  | 22.706 × W + 504.3 | 67 kcal         |
| 10–18 歲 | 17.686 × W + 658.2 | 105 kcal        |
| 18–30 歲 | 15.057 × W + 692.2 | 153 kcal        |
| 30–60 歲 | 11.472 × W + 873.1 | 167 kcal        |
| > 60 歲  | 11.711 × W + 587.7 | 164 kcal        |

### 女性 BMR（kcal/day）

| 年齡組別 | 方程式             | SEE（標準誤差） |
| -------- | ------------------ | --------------- |
| < 3 歲   | 58.317 × W − 31.1  | 59 kcal         |
| 3–10 歲  | 20.315 × W + 485.9 | 70 kcal         |
| 10–18 歲 | 13.384 × W + 692.6 | 111 kcal        |
| 18–30 歲 | 14.818 × W + 486.6 | 119 kcal        |
| 30–60 歲 | 8.126 × W + 845.6  | 111 kcal        |
| > 60 歲  | 9.082 × W + 658.5  | 108 kcal        |

## 每日總能量消耗（TEE）

```
TEE (kcal/day) = BMR × PAL（Physical Activity Level）
```

### WHO/FAO/UNU 身體活動程度（PAL）係數

| 活動程度          | 男性 PAL | 女性 PAL | 描述                                      |
| ----------------- | -------- | -------- | ----------------------------------------- |
| 久坐 Sedentary    | 1.3      | 1.3      | 非常低度身體活動，久坐且休閒活動極少      |
| 輕度活動 Light    | 1.6      | 1.5      | 日常例行活動包含步行，或每週 1–2 次運動   |
| 中度活動 Moderate | 1.7      | 1.6      | 每週至少 3 次中高強度運動，或體力工作     |
| 非常活動 Very     | 2.1      | 1.9      | 每日 1 小時以上高強度運動或重體力勞動職業 |

> 注意：男女性的 PAL 係數不同，反映了在相同活動程度下，男女生理上的能量消耗差異。

## 為何 Schofield 要分年齡組別

Schofield 方程式分年齡組別的核心原因是：**基礎代謝率隨年齡的變化並非線性**，不同生命階段有截然不同的代謝特性：

### 嬰幼兒期（< 3 歲）

嬰兒的 BMR/kg 是成人的約 2 倍，這是因為：

- 快速的細胞增殖與組織生長
- 大腦相對於體重的比例遠高於成人（大腦是最耗能的器官）
- 體溫調節系統尚未完全發育，維持體溫需要更多能量

### 兒童期（3–10 歲）

體重相關的 BMR 雖然下降，但仍顯著高於成人，因生長發育持續進行。

### 青春期（10–18 歲）

快速的生長衝刺（Growth Spurt）和性激素分泌增加（尤其是睪固酮和生長激素），使能量需求大幅上升。男女生的代謝差異在此期間開始明顯分化。

### 成年期（18–60 歲）

BMR 逐漸趨於穩定，但隨年齡增長緩慢下降。主要原因是每十年約 3–5% 的瘦體重（肌肉量）流失。

### 老年期（> 60 歲）

BMR 進一步下降，但老年人的 BMR/kg 可能因肌少症（Sarcopenia）而顯著低於年輕成人。有趣的是，Schofield 方程式顯示老年男性（> 60 歲）的 BMR 係數（11.71）與 30–60 歲組（11.47）相近，反映老年後代謝下降的幅度相對平緩。

## Schofield 與其他公式的比較

| 特性           | Schofield       | Harris-Benedict | Mifflin-St Jeor |
| -------------- | --------------- | --------------- | --------------- |
| 發表年份       | 1985            | 1919            | 1990            |
| 年齡分組       | ✅ 是           | ❌ 單一公式     | ❌ 單一公式     |
| 需要身高       | ❌ 否（標準版） | ✅ 是           | ✅ 是           |
| 推薦機構       | WHO/FAO/UNU     | —               | 美國營養師學會  |
| 樣本來源       | 歐洲為主        | 美國（1919年）  | 美國（現代）    |
| 兒科適用性     | ✅ 優秀         | ❌ 不建議       | ❌ 不建議       |
| 亞洲族群準確性 | 可能高估        | 可能高估        | 較準確          |

## 兒童與青少年能量需求的特殊性

### 生長額外能量需求

**注意**：Schofield 公式估算的是純 BMR（靜息代謝率），不包含生長所需的額外能量。若要計算兒童的 EER（Estimated Energy Requirement），需額外加入生長能量儲備（Energy Cost of Growth）：

| 年齡組（DRI 2023） | 生長能量成本           |
| ------------------ | ---------------------- |
| 3 歲               | 男 +20 / 女 +15 kcal/d |
| 4–8 歲             | +15 kcal/d             |
| 9–13 歲（男）      | +25 kcal/d             |
| 9–13 歲（女）      | +30 kcal/d             |
| 14–18 歲           | +20 kcal/d             |

### 青春期的顯著差異

青春期（約 10–16 歲）是人一生中代謝需求變化最劇烈的階段：

- 男孩在 14–16 歲達到青春期生長高峰，每日 BMR 可達 1,800 kcal 以上
- 女孩的生長高峰稍早（12–14 歲），代謝率略低於男孩

## 種族/族群差異

多項研究顯示，Schofield 公式（以歐洲人為主要研究對象）在亞洲族群中可能**高估 BMR 約 5–10%**。可能原因包括：

- 體型組成差異（相同 BMI 下，亞洲人脂肪比例較高，肌肉量較低）
- 遺傳代謝差異
- 飲食習慣導致的代謝適應

對於亞洲族群（包括台灣人），使用 Schofield 公式時應注意可能的輕度高估。

## 老年患者的特別考量

老年人（> 65 歲）的 BMR 評估需特別注意：

- **肌少症（Sarcopenia）**：60 歲後每十年流失約 8% 的肌肉量，顯著降低 BMR
- **代謝適應**：長期低活動量可能導致代謝率的下調
- **疾病影響**：慢性病（心臟衰竭、腎臟病、腫瘤）對代謝的影響複雜，公式估算誤差增大
- 建議結合實際體重追蹤（每 1–3 個月）調整熱量目標

## 注意事項

::: warning 不適用於急性疾病患者
嚴重急性疾病（敗血症、燒傷、大手術後）患者的實際代謝率可能大幅偏離公式估算，應使用間接熱量測定（Indirect Calorimetry）確定實際需求。
:::

::: warning 亞洲族群可能高估
以歐洲白種人為主體的 Schofield 研究數據可能高估亞洲族群的 BMR，建議實際應用時結合體重變化追蹤調整熱量目標。
:::

::: info 兒童熱量評估需個別化
兒童能量需求受生長速率、疾病狀態和活動程度影響顯著，建議由兒科醫師或兒科臨床營養師進行個別化評估，本計算器僅提供健康兒童的估算值。
:::

## 參考文獻

1. Schofield WN. **Predicting basal metabolic rate, new standards and review of previous work.** Hum Nutr Clin Nutr. 1985;39 Suppl 1:5–41. PMID: 4044297

2. World Health Organisation, FAO, UNU. **Energy and protein requirements.** WHO Technical Report Series 724. Geneva: WHO; 1985.

3. Henry CJK. **Basal metabolic rate studies in humans: measurement and development of new equations.** Public Health Nutr. 2005;8(7A):1133–1152.

4. National Academies of Sciences, Engineering, and Medicine. **Dietary Reference Intakes for Energy.** Washington, DC: The National Academies Press; 2023. doi: 10.17226/26818

5. FAO/WHO/UNU. **Human energy requirements: report of a joint FAO/WHO/UNU Expert Consultation.** FAO Food and Nutrition Technical Report Series No. 1. Rome: FAO; 2004.
