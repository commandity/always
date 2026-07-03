---
layout: doc
title: Ideal Body Weight 理想體重（Devine 法）及調整體重
---

# Ideal Body Weight 理想體重（Devine 法）及調整體重

**Ideal Body Weight (Devine Method) & Adjusted Body Weight**

## 概述

**Devine 理想體重公式**（Ideal Body Weight, IBW）由 B.J. Devine 醫師於 1974 年發表，原始目的是為**藥物劑量計算**提供標準化的體重參考值（尤其是 Gentamicin 劑量研究），而非用於美學或健身目標。儘管如此，由於其簡便性，Devine 公式已成為臨床上最廣泛使用的 IBW 估算方法，並衍生出**調整體重（Adjusted Body Weight, ABW）**，用於肥胖患者的藥物劑量計算。

---

<IdealBodyWeightCalculator />

## 計算公式

### Devine 理想體重公式

**男性：**

```
IBW(kg) = 50 + 2.3 × (身高英寸 − 60)
```

**女性：**

```
IBW(kg) = 45.5 + 2.3 × (身高英寸 − 60)
```

> 注意：身高需先從公分換算為英寸（cm ÷ 2.54），且公式**僅適用於身高 ≥ 152.4 cm（60 英寸 / 5 英尺）**的患者。

### 調整體重（Adjusted Body Weight, ABW）

當患者的實際體重（ABW）**超過 IBW 的 130%**（即 ABW > 1.3 × IBW）時，部分脂肪組織仍具有藥物分佈容積，因此使用以下校正公式：

```
ABW(kg) = IBW + 0.4 × (Actual Body Weight − IBW)
```

係數 **0.4** 反映了在肥胖患者中，額外的脂肪組織對某些親脂性藥物（如 Gentamicin、Vancomycin）的分佈容積貢獻約 40%。

## 其他 IBW 公式比較

多種 IBW 公式已被開發，但臨床上以 Devine 為主：

| 公式               | 男性基準 | 女性基準 | 每英寸增量（男/女） |
| ------------------ | -------- | -------- | ------------------- |
| **Devine**（1974） | 50 kg    | 45.5 kg  | 2.3 / 2.3 kg        |
| Robinson（1983）   | 52 kg    | 49 kg    | 1.9 / 1.7 kg        |
| Miller（1983）     | 56.2 kg  | 53.1 kg  | 1.41 / 1.36 kg      |
| Hamwi（1964）      | 48 kg    | 45.5 kg  | 2.7 / 2.2 kg        |

> **Robinson 公式**通常提供比 Devine 更接近實際理想體重的估算，而 **Miller 公式**的基準值較高，更適合較高大體型的族群。

## %IBW 解讀

| %IBW（實際體重/IBW × 100） | 臨床意義             |
| -------------------------- | -------------------- |
| < 80%                      | 重度體重不足         |
| 80–90%                     | 中度體重不足         |
| 90–110%                    | 正常體重範圍         |
| 110–120%                   | 超重（Overweight）   |
| 120–130%                   | 輕度肥胖             |
| > 130%                     | 肥胖（建議使用 ABW） |

## 臨床應用

### 藥物劑量計算

Devine IBW 最重要的臨床用途是藥物劑量計算，尤其是分佈容積（Vd）與體型高度相關的藥物：

| 藥物類別                             | 建議使用體重                 |
| ------------------------------------ | ---------------------------- |
| 胺基糖苷類（Gentamicin, Tobramycin） | IBW（或 ABW，若肥胖）        |
| Vancomycin                           | 實際體重（TBW）              |
| 化療藥物                             | 實際體重（需確認各藥物指引） |
| 肝素（Heparin）                      | 實際體重                     |
| 胰島素                               | 實際體重                     |
| 低分子肝素（LMWH）                   | 實際體重（肥胖者有上限）     |

### 呼吸器通氣量設定

在機械通氣（Mechanical Ventilation）中，**潮氣量（Tidal Volume, Vt）應基於 IBW**（而非實際體重），以避免肺損傷：

- 肺保護性通氣策略：Vt = **4–6 mL/kg IBW**（ARDS）
- 一般通氣：Vt = **6–8 mL/kg IBW**

### 腎功能評估

腎臟廓清率（如 Cockcroft-Gault 公式計算 CrCl）中，當患者體重超過 IBW 時，應使用：

- 非肥胖：實際體重
- 肥胖（ABW > 130% IBW）：調整體重（ABW）

## 公式限制

### 對矮個子的限制

Devine 公式最為嚴重的問題是對**身高接近或低於 152.4 cm 的患者**（尤其是矮個子女性）嚴重低估理想體重。公式結果可能給出不合理的低值，甚至接近或低於現實體重的正常健康範圍。

### 不反映體型組成

IBW 僅基於身高，完全不考慮骨骼結構（大/小骨架）、肌肉量或種族差異。同樣身高的運動員和久坐者，IBW 值相同，但實際健康體重可能大相徑庭。

### 係數過時

Devine 公式發布於 1974 年，係數基於 20 世紀中葉的人口數據，可能不完全反映現代多元族群的體型分佈。

## 注意事項

::: warning 不適用於身高 < 152.4 cm 的患者
當身高低於 152.4 cm（5 英尺 / 60 英寸）時，Devine 公式的估算結果可能過低甚至不合理，尤其對矮個子女性影響最為明顯。此情況建議使用其他方法評估理想體重。
:::

::: warning ABW 僅適用於特定藥物
調整體重（ABW）的 0.4 係數是基於胺基糖苷類抗生素的藥代動力學研究，並不適用於所有藥物。每種藥物的劑量計算應參考其個別的藥物說明書及藥師建議。
:::

::: info Devine 公式非美學標準
Devine IBW 公式是為臨床藥物劑量而設計，不應作為個人體重目標或美學標準使用。BMI 及個人體型評估更適合作為一般健康體重的參考。
:::

## 參考文獻

1. Devine BJ. **Gentamicin therapy.** Drug Intell Clin Pharm. 1974;8:650–655.

2. Robinson JD, Lupkiewicz SM, Palenik L, et al. **Determination of ideal body weight for drug dosage calculations.** Am J Hosp Pharm. 1983;40(6):1016–1019.

3. Miller DR, Carlson JD, Lloyd BJ, et al. **Determining ideal body weight (and mass).** Am J Hosp Pharm. 1983;40(9):1622–1625.

4. Pai MP, Paloucek FP. **The origin of the "ideal" body weight equations.** Ann Pharmacother. 2000;34(9):1066–1069. PMID: 10981254

5. Salazar DE, Corcoran GB. **Predicting creatinine clearance and renal drug clearance in obese patients from estimated fat-free body mass.** Am J Med. 1988;84(6):1053–1060.

6. The ARDS Network Authors. **Ventilation with lower tidal volumes as compared with traditional tidal volumes for acute lung injury.** N Engl J Med. 2000;342(18):1301–1308.
