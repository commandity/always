---
layout: doc
title: Lean Body Weight 瘦體重計算
---

# Lean Body Weight 瘦體重計算

**Lean Body Weight**

## 概述

**瘦體重**（Lean Body Weight, LBW；又稱無脂體重 Fat-Free Mass, FFM）是指身體總重量中**排除脂肪組織後**的部分，包含骨骼、肌肉、器官、水分及結締組織。LBW 在藥理學中尤為重要，因為許多親水性藥物的分佈容積（Volume of Distribution）與瘦體重高度相關，而非與總體重相關。

---

<LeanBodyWeightCalculator />

## 計算公式

### Hume 公式（1966）— 臨床首選

最廣泛使用的估算公式，同時考慮體重與身高：

**男性（W = kg, H = cm）：**

```
LBW = 0.32810 × W + 0.33929 × H − 29.5336
```

**女性（W = kg, H = cm）：**

```
LBW = 0.29569 × W + 0.41813 × H − 43.2933
```

### Boer 公式（1984）

推薦用於 **BMI 35–40 的肥胖患者**進行 CT 對比劑劑量計算：

**男性：**

```
LBW = 0.407 × W + 0.267 × H − 19.2
```

**女性：**

```
LBW = 0.252 × W + 0.473 × H − 48.3
```

### James 公式（Green & Duffull，2004）

藥代動力學研究中常用，僅需體重與 BMI：

**男性：**

```
LBW = 1.10 × TBW − 0.0128 × BMI × TBW
```

**女性：**

```
LBW = 1.07 × TBW − 0.0148 × BMI × TBW
```

> 注意：James 公式在 **BMI > 30（男）或 > 35（女）**的重度肥胖患者中會出現 LBW 接近甚至超過 TBW 的不合理結果（公式奇點），此時請改用 Boer 公式。

## 三公式選用指引

| 情境                       | 推薦公式               |
| -------------------------- | ---------------------- |
| 一般臨床用途               | Hume                   |
| CT 對比劑劑量（BMI 35–40） | Boer                   |
| 藥代動力學/PK 模型         | James                  |
| 重度肥胖（BMI > 40）       | Boer 或 Hume（需謹慎） |

## 臨床應用

### 1. 藥物劑量計算

許多藥物的劑量應基於 LBW 而非總體重（TBW），以避免肥胖患者過量給藥：

| 藥物               | 劑量計算基礎             | 說明                    |
| ------------------ | ------------------------ | ----------------------- |
| Gentamicin         | IBW 或 ABW               | 親水性，脂肪分佈少      |
| Vancomycin（傳統） | TBW                      | 分佈容積與 TBW 相關     |
| Propofol           | LBW（誘導）/ TBW（維持） | 依情境不同              |
| Succinylcholine    | TBW                      | 膽鹼酯酶活性與 TBW 相關 |
| 低分子肝素（LMWH） | TBW（有上限）            | 超重者依說明書調整      |
| 化療（多數）       | BSA（基於 TBW）          | 參見 BSA 計算器         |

### 2. 腎功能評估（CrCl 計算）

Cockcroft-Gault 公式中的「體重」項：

- 非肥胖：使用實際體重
- 肥胖（TBW > 130% IBW）：使用 IBW 或 ABW（Adjusted Body Weight）
- LBW 可在某些特定情境下使用（如極端體型）

### 3. 體液管理

重症醫學中，瘦體重（FFM）與體液分佈更為相關，有助於估算液體過負荷風險及利尿劑需求。

### 4. 麻醉劑量

術前評估中，LBW 用於以下藥物的初始劑量計算：

- Propofol 誘導劑量
- 阿片類藥物（如 Remifentanil）
- 神經肌肉阻斷劑（需考慮藥物特性）

## 體脂率（Body Fat %）估算

基於 Hume LBW 可間接估算體脂率：

```
體脂率(%) = (1 − LBW / TBW) × 100
```

| 體脂率範圍（男性） | 分類         |
| ------------------ | ------------ |
| < 8%               | 低（運動員） |
| 8–17%              | 正常         |
| 18–24%             | 偏高         |
| ≥ 25%              | 肥胖         |

| 體脂率範圍（女性） | 分類         |
| ------------------ | ------------ |
| < 15%              | 低（運動員） |
| 15–24%             | 正常         |
| 25–31%             | 偏高         |
| ≥ 32%              | 肥胖         |

> 此估算僅供參考，精確測量需使用 DEXA（雙能 X 射線吸收測量法）、水中體重法或生物電阻抗分析（BIA）。

## 公式限制

**所有公式的共同限制：**

- 基於特定族群的統計模型，個體差異可能大
- 不考慮水腫、腹水等體液異常
- 不區分肌肉量的差異（如肌少症、健身運動員）

**James 公式的奇點問題：**
當 BMI 超過一定閾值，James 公式計算出的 LBW 會等於或超過 TBW，出現數學奇點：

- 男性：BMI ≈ 85.9 時 LBW = TBW（奇點）
- 女性：BMI ≈ 72.3 時 LBW = TBW（奇點）
- 在接近奇點的 BMI 值下（男 >30，女 >35），James 公式結果已不可信

## 注意事項

::: warning James 公式肥胖患者禁忌
當 BMI > 30（男性）或 > 35（女性）時，James 公式可能給出不合理的估算值（LBW ≥ TBW）。此情況下應優先使用 Boer 公式或諮詢臨床藥師。
:::

::: warning LBW 估算值非精確測量
所有數學公式估算的 LBW 均存在誤差（標準誤差 ±3–5 kg）。精確的 LBW 測定需使用 DEXA 掃描或其他客觀體型組成測量方法。
:::

::: info 免責聲明
本計算器提供的 LBW 估算僅供臨床參考，藥物劑量計算應由具資格的醫師或臨床藥師依個別患者情況及各藥物的完整說明書決定。
:::

## 參考文獻

1. Hume R. **Prediction of lean body mass from height and weight.** J Clin Pathol. 1966;19(4):389–391. PMID: 5969544

2. Boer P. **Estimated lean body mass as an index for normalization of body fluid volumes in humans.** Am J Physiol. 1984;247(4 Pt 2):F632–F636. PMID: 6496691

3. Green B, Duffull SB. **What is the best size descriptor to use for pharmacokinetic studies in the obese?** Br J Clin Pharmacol. 2004;58(2):119–133. PMID: 15255796

4. Pai MP. **Drug dosing based on weight and body surface area: mathematical assumptions and limitations in obese adults.** Pharmacotherapy. 2012;32(9):856–868. PMID: 23018685

5. Janmahasatian S, Duffull SB, Ash S, et al. **Quantification of lean bodyweight.** Clin Pharmacokinet. 2005;44(10):1051–1065. PMID: 16176118
