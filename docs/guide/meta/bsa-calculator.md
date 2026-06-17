---
layout: doc
title: BSA 體表面積計算
---

# BSA 體表面積計算

**BSA Body Surface Area**

## 概述

**體表面積**（Body Surface Area, BSA）是指人體外表皮膚的總面積（單位：m²），在臨床醫學中是僅次於體重的重要生理測量指標。BSA 被廣泛用於**腫瘤化學治療藥物劑量計算**、心輸出量標準化（心臟指數）、液體替代療法及燒傷面積評估。由於 BSA 難以直接測量，多種基於身高和體重的數學公式被開發出來進行估算。

---

<BSACalculator />

## 五大計算公式

### 1. Mosteller 公式（1987）— 臨床首選

由加拿大醫師 R.D. Mosteller 發表於 New England Journal of Medicine，以其**簡便易記**著稱：

```
BSA (m²) = √[ H(cm) × W(kg) / 3600 ]
```

**等價形式（英制）：**

```
BSA (m²) = √[ H(in) × W(lb) / 3131 ]
```

Mosteller 公式是多數現代臨床指引和藥典（如 ASCO、NCI）中**最常推薦使用的公式**，因其計算快速，適合床邊估算。

### 2. DuBois & DuBois 公式（1916）

由美國醫師 D. DuBois 及 E.F. DuBois 提出，是**歷史最悠久**的 BSA 公式：

```
BSA (m²) = 0.007184 × H(cm)^0.725 × W(kg)^0.425
```

儘管原始研究僅基於 9 名受試者，DuBois 公式在 20 世紀幾乎成為 BSA 計算的唯一標準，至今仍被廣泛引用（超過 5,000 次）。

### 3. Haycock 公式（1978）

由兒科腎臟科醫師 G.B. Haycock、G.J. Schwartz 及 D.H. Wisotsky 使用**幾何方法**驗證，特別適用於嬰兒至成人的全年齡範圍：

```
BSA (m²) = 0.024265 × H(cm)^0.3964 × W(kg)^0.5378
```

Haycock 公式在**兒科**中最被廣泛採用，尤其在腎臟功能評估（GFR 標準化）及兒童化療劑量計算中。

### 4. Gehan & George 公式（1970）

由統計學家 E.A. Gehan 和 S.L. George 基於化療劑量研究數據開發：

```
BSA (m²) = 0.0235 × H(cm)^0.42246 × W(kg)^0.51456
```

Gehan-George 公式在腫瘤學研究中應用廣泛，樣本量相較 DuBois 更大且更多元，在肥胖患者中的表現優於 DuBois。

### 5. Boyd 公式（1935）

由 E. Boyd 發表的最早全面性 BSA 公式，採用體重的對數項校正非線性關係：

```
BSA (m²) = 0.0003207 × H(cm)^0.3 × W(g)^[0.7285 − 0.0188 × log₁₀(W(g))]
```

> 注意：Boyd 公式中體重單位為**克（g）**，輸入公斤時需乘以 1000。

Boyd 公式對**超重及肥胖患者**的估算表現相對較好，因其非線性體重項可反映體重增加對表面積的邊際效益遞減效應。

## 各公式結果比較

五種公式在一般成人（身高 170 cm，體重 70 kg）的計算結果通常差異在 1–3% 以內，對臨床用途影響甚微。但在極端體型（超低或超高 BMI）下差異可能更明顯：

| 情境                 | 推薦公式             |
| -------------------- | -------------------- |
| 一般臨床用途         | Mosteller            |
| 腫瘤化療劑量         | Mosteller 或 DuBois  |
| 兒科（嬰兒至青少年） | Haycock              |
| 肥胖患者             | Boyd 或 Gehan-George |
| 學術研究             | 依研究協議指定       |

## 臨床應用

### 腫瘤化學治療劑量計算

BSA 是大多數細胞毒性化療藥物的標準劑量基礎，目的是通過 BSA 標準化個體間藥物清除率的差異：

```
藥物劑量 = 每平方公尺劑量（mg/m²）× BSA（m²）
```

常見化療藥物的劑量範例：
| 藥物 | 典型劑量 | 常用公式 |
| -------------- | ---------------------- | --------- |
| Cisplatin | 75–100 mg/m² | Mosteller |
| Paclitaxel | 135–175 mg/m² | Mosteller |
| Doxorubicin | 60–75 mg/m² | Mosteller |
| Carboplatin | AUC 法（Calvert 公式） | — |
| 5-Fluorouracil | 500–1000 mg/m² | Mosteller |

> **重要**：實際化療劑量計算必須由腫瘤科醫師及臨床藥師依據完整評估決定，包含腎功能、肝功能、既往治療史及毒性評估。

### 心臟指數（Cardiac Index, CI）標準化

心臟指數將心輸出量（Cardiac Output）以 BSA 標準化，消除體型差異的影響：

```
心臟指數（CI）= 心輸出量（CO，L/min）/ BSA（m²）
```

正常 CI：2.5–4.0 L/min/m²

### 腎功能標準化

腎絲球過濾率（GFR）通常以 1.73 m²（成人標準 BSA）標準化報告：

```
標準化 GFR = 測量 GFR × (1.73 / 患者 BSA)
```

1.73 m² 是 DuBois（1916 年）報告的平均成人 BSA 參考值，沿用至今。

### 燒傷面積評估與液體復甦

「九分法」（Rule of Nines）和 Lund-Browder 圖表評估燒傷面積佔 BSA 的百分比，並據此計算液體補充量：

**Parkland 公式（燒傷液體復甦）：**

```
第一個 24 小時 乳酸林格液 (mL) = 4 mL × 體重 (kg) × 燒傷面積 (%BSA)
```

### 放射治療劑量換算

部分放射治療計畫使用 BSA 進行劑量換算，確保不同體型患者接受適當的輻射劑量。

## 肥胖患者的 BSA 計算爭議

### 是否使用實際體重計算 BSA？

文獻中對此存在爭議，但多數指引建議**使用實際體重**（而非 IBW）計算 BSA：

**支持使用實際體重的理由：**

- 肥胖患者的皮膚表面積確實較大
- 使用實際體重計算的 BSA 提供更高的藥物劑量，可能改善治療效果
- 多項研究顯示肥胖患者接受全劑量化療的生存率不劣於減量治療

**支持封頂（Cap）的理由：**

- 部分機構設定 BSA 上限（如 2.0 m²），以控制毒性風險
- 化療藥物在肥胖患者中的清除動力學複雜，不一定等比例增加

> 建議：遵循各機構的化療用藥規範，並與腫瘤科藥師討論個別患者情況。

## 正常 BSA 參考範圍

| 族群             | 平均 BSA（m²）              |
| ---------------- | --------------------------- |
| 成年男性（台灣） | 約 1.65–1.75                |
| 成年女性（台灣） | 約 1.45–1.60                |
| 成年男性（歐美） | 約 1.80–1.90                |
| 參考標準值       | **1.73 m²**（DuBois, 1916） |
| 足月新生兒       | 約 0.20–0.25                |
| 10 歲兒童        | 約 1.00–1.10                |

## 注意事項

::: warning 不同公式選擇影響劑量
五種公式的結果雖然相近（通常差異 < 5%），但對於 BSA-based 化療劑量計算，務必確認所使用的公式與機構規範或臨床試驗方案一致，以保障劑量計算的一致性。
:::

::: warning 僅為估算值
所有 BSA 公式均為數學估算，不能精確反映個體的實際皮膚表面積。在用於高毒性藥物（如化療）劑量計算時，必須結合完整的臨床評估。
:::

::: info 兒科建議使用 Haycock
在兒童患者（尤其是嬰幼兒）中，Haycock 公式的驗證最為充分，建議作為兒科 BSA 計算的首選。Mosteller 公式在兒童中同樣可接受，但 DuBois 公式在極低體重嬰兒中準確性較差。
:::

## 參考文獻

1. Mosteller RD. **Simplified calculation of body-surface area.** N Engl J Med. 1987;317(17):1098. PMID: 3657876

2. DuBois D, DuBois EF. **A formula to estimate the approximate surface area if height and weight be known.** Arch Intern Med. 1916;17(6):863–871.

3. Haycock GB, Schwartz GJ, Wisotsky DH. **Geometric method for measuring body surface area: a height-weight formula validated in infants, children, and adults.** J Pediatr. 1978;93(1):62–66. PMID: 650346

4. Gehan EA, George SL. **Estimation of human body surface area from height and weight.** Cancer Chemother Rep. 1970;54(4):225–235. PMID: 5527019

5. Boyd E. **The growth of the surface area of the human body.** Minneapolis: University of Minnesota Press; 1935.

6. Gurney H. **Dose calculation of anticancer drugs: a review of the current practice and introduction of an alternative.** J Clin Oncol. 1996;14(9):2590–2611. PMID: 8823340

7. Griggs JJ, Mangu PB, Anderson H, et al. **Appropriate chemotherapy dosing for obese adult patients with cancer: ASCO Clinical Practice Guideline.** J Clin Oncol. 2012;30(13):1553–1561. PMID: 22473167
