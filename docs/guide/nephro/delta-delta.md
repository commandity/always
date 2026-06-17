---
layout: doc
title: Delta/Delta 混合酸鹼分析
---

# Delta/Delta 混合酸鹼分析

**Delta/Delta Mixed Acid-Base Analysis**

## 概述

**Delta/Delta（Δ/Δ）比值**是酸鹼分析的進階工具，用於識別**高陰離子間隙（AG）代謝性酸中毒**背後隱藏的**混合酸鹼異常**，是完整酸鹼分析的必要步驟之一。

---

<DeltaDeltaCalculator />

## 計算公式

**步驟 1：計算陰離子間隙（AG）**

```
AG = Na⁺ − ( Cl⁻ + HCO₃⁻ )
```

正常值：12 mEq/L（範圍 8–16）

**步驟 2：計算 Delta/Delta 比值**

```
Δ / Δ = ( AG − 12 ) / ( 24 − HCO₃⁻ )  =  ΔAG / ΔHCO₃⁻
```

## 解讀

| Δ/Δ       | 酸鹼異常類型                | 臨床舉例                      |
| --------- | --------------------------- | ----------------------------- |
| **< 0.4** | 高氯性（非 AG）代謝性酸中毒 | 腹瀉、RTA、大量生理鹽水輸注   |
| **0.4–1** | 混合：AG + 非 AG 酸中毒     | DKA + 腹瀉、乳酸中毒 + RTA    |
| **1–2**   | 純 AG 代謝性酸中毒          | 乳酸中毒、DKA（單純）、尿毒症 |
| **> 2**   | AG 酸中毒 + 代謝性鹼中毒    | DKA + 嘔吐、乳酸中毒 + 利尿劑 |

## 邏輯基礎

**純 AG 代謝性酸中毒時：**

- ΔAG（AG 升高幅度）≈ ΔHCO₃⁻（HCO₃⁻ 下降幅度）
- 因此 Δ/Δ ≈ 1

**若 Δ/Δ < 1：** HCO₃⁻ 下降比 AG 上升更多 → 除了 AG 酸中毒外，還有**額外的 HCO₃⁻ 消耗**（非 AG 酸中毒）

**若 Δ/Δ > 2：** HCO₃⁻ 下降比預期少 → AG 酸中毒出現前，患者已有**代謝性鹼中毒**（HCO₃⁻ 基礎偏高）

## 完整酸鹼分析五步驟

```
Step 1: 看 pH → 酸血症（< 7.35）or 鹼血症（> 7.45）？
Step 2: 主要原發異常 → HCO₃↓（代謝性）or PaCO₂↑（呼吸性）？
Step 3: 代償是否適當？
         代謝性酸中毒：PaCO₂ = (1.5 × HCO₃) + 8 ± 2（Winters' formula）
         代謝性鹼中毒：PaCO₂ = 0.7 × HCO₃ + 21 ± 2
Step 4: 計算 AG → 有無 AG 升高（> 12）？
Step 5: AG 升高 → 計算 Δ/Δ → 有無隱藏的混合異常？
```

## 代謝性酸中毒代償公式（Winter's Formula）

```
PaCO₂ (expected) = 1.5 × HCO₃⁻ + 8 ± 2
```

| 比較                | 解讀                         |
| ------------------- | ---------------------------- |
| 實測 PaCO₂ ≈ 預期值 | 適當呼吸代償                 |
| 實測 PaCO₂ < 預期值 | 額外呼吸性鹼中毒（過度換氣） |
| 實測 PaCO₂ > 預期值 | 合併呼吸性酸中毒（換氣不足） |

## 高 AG 酸中毒病因：MUDPILES

| 字母  | 病因                           | 機制                            |
| ----- | ------------------------------ | ------------------------------- |
| **M** | Methanol（甲醇）               | → 甲酸（Formic acid）           |
| **U** | Uremia（尿毒症）               | 有機酸堆積                      |
| **D** | DKA                            | β-hydroxybutyrate、Acetoacetate |
| **P** | Propylene glycol / Paraldehyde | 代謝物堆積                      |
| **I** | Isoniazid / Iron（異煙鹼/鐵）  | 乳酸生成                        |
| **L** | Lactic acidosis（乳酸中毒）    | 缺氧、敗血症                    |
| **E** | Ethylene glycol（乙二醇）      | → 草酸                          |
| **S** | Salicylates（水楊酸）          | 解偶聯、有機酸                  |

## 白蛋白修正 AG

低白蛋白血症患者，AG 正常值需向下修正：

```
Corrected AG = AG + 2.5 × ( 4.0 − Albumin g/dL )
```

重症患者常有低白蛋白血症，若不修正 AG，可能**漏診**隱匿性高 AG 酸中毒。

::: warning Δ/Δ 僅在 AG 升高時才有意義
Δ/Δ 的前提是 AG > 12（存在高 AG 代謝性酸中毒）。若 AG 正常，Δ/Δ 計算無意義，應改用其他方法分析酸鹼異常。切記先確認 AG 升高，再計算 Δ/Δ。
:::

::: warning 白蛋白偏低時必須先修正 AG
低白蛋白血症（如重症、肝硬化、腎病症候群）患者，AG 的正常值隨之降低。若不進行白蛋白修正，「正常」的 AG 實際上可能已代表高 AG 狀態，導致漏診混合型酸鹼異常。白蛋白每降低 1 g/dL，AG 正常值下調約 2.5 mEq/L。
:::

::: warning Δ/Δ 的切截值存在個體差異，解讀需結合臨床
Δ/Δ 的 0.4、1、2 切截值來自群體統計，個別患者可能因慢性 HCO₃⁻ 基礎值異常（如慢性呼吸性酸中毒代償）而使結果偏移。解讀時應同時評估患者的基礎酸鹼狀態，避免機械性套用切截值。
:::

::: info 免責聲明
本計算器僅供酸鹼分析輔助參考，不能取代完整的血氣分析、電解質評估及臨床判斷。酸鹼異常的診斷與治療應由具執照的醫師根據患者完整臨床狀況綜合判斷。
:::

## 參考文獻

1. Emmett M, Narins RG. **Clinical use of the anion gap.** _Medicine._ 1977;56(1):38–54.
2. Figge J, Jabor A, Kazda A, Fencl V. **Anion gap and hypoalbuminemia.** _Crit Care Med._ 1998;26(11):1807–1810.
3. Kraut JA, Madias NE. **Serum anion gap: its uses and limitations in clinical medicine.** _Clin J Am Soc Nephrol._ 2007;2(1):162–174.
