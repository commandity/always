---
layout: doc
title: PREVENT-ASCVD 動脈粥樣硬化心血管疾病風險評估
---

# PREVENT-ASCVD 動脈粥樣硬化心血管疾病風險評估

**PREVENT-ASCVD — Predicting Risk of cardiovascular disease EVENTs Atherosclerotic Cardiovascular Disease**

## 概述

**PREVENT-ASCVD** 是美國心臟協會（AHA）於 2024 年發表的 10 年 ASCVD 風險預測方程式，取代 2013 年的 Pooled Cohort Equations（PCEs）。2026 年 ACC/AHA 血脂管理指引正式採用 PREVENT-ASCVD 作為初級預防的風險評估工具。適用於 **30–79 歲無 ASCVD 或次臨床動脈粥樣硬化的成人**。

---

<PreventAscvdCalculator />

## 評分說明

### 強制變數（Base Model）

PREVENT-ASCVD Base 方程式包含以下 10 項變數，均為臨床常規檢查項目：

| 變數               | 單位          | 範圍        | 說明                                    |
| ------------------ | ------------- | ----------- | --------------------------------------- |
| **年齡**           | 歲            | 30–79       | 以 55 歲為中心化參考點                  |
| **性別**           | —             | 女性 / 男性 | 方程式按性別分層，不納入種族            |
| **總膽固醇（TC）** | mg/dL         | 130–320     | 用於計算 non-HDL-C（TC − HDL-C）        |
| **HDL 膽固醇**     | mg/dL         | 20–100      | 單位換算後納入模型                      |
| **收縮壓（SBP）**  | mmHg          | 90–200      | 110 mmHg 設 knot（分段線性）            |
| **eGFR**           | mL/min/1.73m² | 15–150      | 60 mL/min 設 knot；CKD 階段即反映於風險 |
| **吸菸狀態**       | 是/否         | —           | 過去 30 天內有吸菸                      |
| **糖尿病**         | 是/否         | —           | 確診第 1 或第 2 型糖尿病                |
| **降壓藥使用**     | 是/否         | —           | 正在服用抗高血壓藥物                    |
| **史達汀使用**     | 是/否         | —           | 正在服用史達汀類藥物                    |

### 選擇性變數（Full Model）

除了強制變數外，PREVENT 另有 Full Model 可加入以下三項選擇性變數以進一步個人化風險評估：

| 變數                              | 說明                                     |
| --------------------------------- | ---------------------------------------- |
| **UACR（尿液白蛋白/肌酸酐比值）** | 反映腎臟損傷，對 CKM 症候群患者尤為重要  |
| **HbA1c（糖化血色素）**           | 反映血糖控制狀況，與糖尿病狀態有交互作用 |
| **SDI（社會剝奪指數）**           | 以郵遞區號對應的社經地位指標             |

> **實務建議**：當患者有 CKM 症候群、糖尿病或慢性腎臟病時，建議使用 Full Model 以獲得最準確的風險估計。

## 10 年 ASCVD 風險分類（2026 ACC/AHA 指引）

| 風險類別     | 10 年 ASCVD 風險 | 管理建議                                                                                   |
| ------------ | ---------------- | ------------------------------------------------------------------------------------------ |
| **低風險**   | < 3%             | 健康行為諮詢；若 LDL-C 160–189 mg/dL 或 30 年風險 ≥ 10%（30–59 歲），可考慮中等強度史達汀  |
| **邊界風險** | 3% 至 < 5%       | 醫病共享決策，考慮風險增強因子（Lp(a)、hsCRP、CAC 等）；若啟動治療，目標 LDL-C < 100 mg/dL |
| **中度風險** | 5% 至 < 10%      | 建議至少中等強度史達汀，目標 LDL-C 降 ≥ 30–49%；高值區間可考慮高強度治療                   |
| **高度風險** | ≥ 10%            | 建議高強度史達汀，目標 LDL-C 降 ≥ 50%，目標值 < 70 mg/dL；必要時合併 ezetimibe 等藥物      |

## 「CPR」模型：臨床決策三步驟

2026 ACC/AHA 指引提出 **CPR 模型** 以結構化方式進行初級預防決策：

### C — Calculate（計算）

使用 PREVENT-ASCVD 方程式計算 10 年 ASCVD 風險。

### P — Personalize（個人化）

考慮以下風險增強因子以個人化風險評估：

| 風險增強因子                         | 說明                                                                        |
| ------------------------------------ | --------------------------------------------------------------------------- |
| **Lp(a) ≥ 125 nmol/L（≥ 50 mg/dL）** | 約增加 1.4 倍 ASCVD 風險                                                    |
| **hsCRP ≥ 2 mg/L**（兩次確認）       | 發炎相關風險，邊界風險族群可考慮高強度史達汀                                |
| **生殖風險標誌**                     | 早發停經（< 45 歲）、不良妊娠結局（妊娠高血壓、子癇前症、妊娠糖尿病、早產） |
| **代謝症候群 / CKM 症候群**          | 腹部肥胖、胰島素阻抗、高 TG、低 HDL-C                                       |
| **強烈早發 ASCVD 家族史**            | 男性一親等 < 55 歲、女性一親等 < 65 歲                                      |
| **慢性腎臟病（CKD 3–5 期）**         | eGFR < 60 mL/min/1.73m²                                                     |
| **自體免疫疾病**                     | 類風濕關節炎、紅斑性狼瘡等                                                  |

### R — Reclassify（重新分層）

若決策仍不確定（特別是邊界至中度風險族群），考慮使用 **冠狀動脈鈣化積分（CAC）**：

| CAC 積分                      | 臨床意義   | 建議                                                 |
| ----------------------------- | ---------- | ---------------------------------------------------- |
| **0 AU**（且無高風險條件）    | 風險極低   | 可考慮暫緩用藥，3–7 年後重複 CAC                     |
| **1–99 AU**（< 75 百分位）    | 輕度鈣化   | 中等強度史達汀，目標 LDL-C < 100 mg/dL               |
| **100–299 AU 或 ≥ 75 百分位** | 中度鈣化   | 啟動史達汀治療，目標 LDL-C < 70 mg/dL                |
| **≥ 300 AU**                  | 重度鈣化   | 積極降脂，目標 LDL-C < 70 mg/dL（可考慮 < 55 mg/dL） |
| **≥ 1000 AU**                 | 極重度鈣化 | 積極組合治療，目標 LDL-C < 55 mg/dL                  |

## PREVENT vs PCEs：五大改進

PREVENT 方程式相較於 2013 PCEs 的主要改進：

| 面向         | PCEs（2013）                | PREVENT（2024）                      |
| ------------ | --------------------------- | ------------------------------------ |
| **資料來源** | 5 個世代佇列（1940s–1980s） | > 650 萬當代美國成人（電子健康紀錄） |
| **種族**     | 以種族分層（黑人/白人）     | 不納入種族，更具普遍性               |
| **年齡範圍** | 40–79 歲                    | **30–79 歲**（可評估更年輕族群）     |
| **腎功能**   | 未納入                      | 納入 eGFR（及選擇性 UACR）           |
| **風險類型** | 僅 ASCVD                    | ASCVD + 總 CVD + 心衰竭（HF）        |

## PREVENT-ASCVD 的方程式結構

PREVENT 使用 Cox 比例風險模型，預測因子包含：

- **主效果**：年齡、non-HDL-C、HDL-C、SBP（分段線性，knot 於 110 mmHg）、eGFR（分段線性，knot 於 60 mL/min）、糖尿病、吸菸、降壓藥、史達汀
- **交互作用**：年齡 ×（non-HDL-C、HDL-C、SBP、糖尿病、吸菸、eGFR）、SBP × 降壓藥、non-HDL-C × 史達汀
- **10 年風險計算**：線性預測值（LP）→ 風險 = exp(LP) / [1 + exp(LP)]

> **技術說明**：由於加入了年齡交互作用項，PREVENT 可以有效反映風險因子效應隨年齡的變化——例如糖尿病的相對風險在年輕族群中高於老年族群，這與真實流行病學觀察一致。

## 2026 ACC/AHA 指引：PREVENT 相關重點更新

### 初級預防管理流程圖

```
30–79 歲，無 ASCVD
LDL-C 70–189 mg/dL
        │
        ▼
計算 PREVENT-ASCVD 10 年風險
        │
        ├── < 3%（低風險）─── 健康行為諮詢
        │                     若 LDL-C 160–189 或 30 年 ≥ 10%
        │                     → 考慮中等強度史達汀
        │
        ├── 3–< 5%（邊界風險）── 醫病共享決策
        │                       考慮風險增強因子
        │                       若啟動：目標 LDL-C < 100
        │
        ├── 5–< 10%（中度風險）── 建議中高強度史達汀
        │                        目標 LDL-C 降 ≥ 30–49%
        │                        目標值 < 100 mg/dL
        │
        └── ≥ 10%（高度風險）── 建議高強度史達汀
                                目標 LDL-C 降 ≥ 50%
                                目標值 < 70 mg/dL
                                必要時合併 ezetimibe
```

### 高風險族群（無需 PREVENT 計算即可考慮治療）

- 臨床 ASCVD（次級預防）
- LDL-C ≥ 190 mg/dL（嚴重高膽固醇血症）
- 40–75 歲合併糖尿病、CKD 第 3 期以上、或 HIV（穩定 ART）

### 治療目標（LDL-C 與 non-HDL-C）

| 風險層級                 | LDL-C 目標  | Non-HDL-C 目標 |
| ------------------------ | ----------- | -------------- |
| 低風險                   | < 160 mg/dL | < 190 mg/dL    |
| 邊界/中度風險（有用藥）  | < 100 mg/dL | < 130 mg/dL    |
| 高度風險（初級預防）     | < 70 mg/dL  | < 100 mg/dL    |
| 次級預防（非極高風險）   | < 70 mg/dL  | < 100 mg/dL    |
| 次級預防（極高風險）     | < 55 mg/dL  | < 85 mg/dL     |
| 嚴重高膽固醇血症 + ASCVD | < 55 mg/dL  | < 85 mg/dL     |

## 注意事項

::: warning 使用對象限制
PREVENT-ASCVD 方程式僅適用於 **無已知 ASCVD 或次臨床動脈粥樣硬化** 的 **30–79 歲** 成人。已有 ASCVD、LDL-C ≥ 190 mg/dL、或特定高風險族群（如家族性高膽固醇血症）不適用此方程式。
:::

::: warning 風險預測 ≠ 治療決策
PREVENT-ASCVD 提供的是風險估計值，**不應單獨作為治療決策的唯一依據**。最終的治療決定應綜合考慮患者偏好、風險增強因子、CAC 積分、共病症及用藥安全。
:::

::: warning PREVENT 可能低估風險
由於使用更當代的資料（心血管事件發生率隨世代下降），PREVENT 的風險估計值通常低於 PCEs。這雖然減少了過度治療，但也可能在部分族群（如高社經剝奪地區）低估風險。臨床醫師應結合臨床判斷解讀。
:::

::: warning 30 年風險評估
對於 30–59 歲的低風險（10 年 < 3%）族群，若 LDL-C ≥ 160 mg/dL 或 30 年 ASCVD 風險 ≥ 10%，指引仍建議考慮中等強度史達汀治療，以減少終生暴露於致粥狀硬化脂蛋白。
:::

::: info 免責聲明
本計算器依據 AHA PREVENT 方程式（2024）及 2026 ACC/AHA 血脂管理指引建立，僅供臨床評估參考。實際治療決策應由醫師根據患者完整病史、風險偏好及共病症綜合判斷。
:::

## 參考文獻

1. Khan SS, Matsushita K, Sang Y, et al. **Development and Validation of the American Heart Association's PREVENT Equations.** _Circulation._ 2024;149:e30–e449. DOI: 10.1161/CIRCULATIONAHA.123.067626
2. **2026 ACC/AHA/AACVPR/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Dyslipidemia.** _Circulation._ 2026;153(17):e1154–e1276. DOI: 10.1161/CIR.0000000000001423
3. Ndumele CE, Rangaswami J, Chow SL, et al. **Novel Prediction Equations for Absolute Risk Assessment of Total Cardiovascular Disease Incorporating Cardiovascular-Kidney-Metabolic Health: A Scientific Statement From the AHA.** _Circulation._ 2023;148:e1–e19. DOI: 10.1161/CIR.0000000000001191
4. Goff DC Jr, Lloyd-Jones DM, Bennett G, et al. **2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk.** _Circulation._ 2014;129(25 Suppl 2):S49–S73.
5. Grundy SM, Stone NJ, Bailey AL, et al. **2018 AHA/ACC/AACVPR/AAPA/ABC/ACPM/ADA/AGS/APhA/ASPC/NLA/PCNA Guideline on the Management of Blood Cholesterol.** _Circulation._ 2019;139:e1082–e1143.
