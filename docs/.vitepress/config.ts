import { createContentLoader, defineConfig } from "vitepress";
import { createHash } from "node:crypto";

export default defineConfig({
  appearance: true,
  ignoreDeadLinks: true,
  // ── Site metadata ──────────────────────────────────────────────
  lang: "zh-TW",
  title: "neo jerzy",
  description: "凝淨齋",
  head: [
    [
      "script",
      { id: "system-theme-watcher" },
      `(function(){var e=localStorage;e.removeItem("vitepress-theme-appearance");var m=window.matchMedia("(prefers-color-scheme:dark)");function u(){document.documentElement.classList.toggle("dark",m.matches)}u();m.addEventListener("change",u)})()`,
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/head-1a1a1a-f0f0f0.svg",
      },
    ],
    // ✅ ADD THESE THREE BELOW THE ICON LINK
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    ],
    [
      "link",
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "",
      },
    ],
    [
      "link",
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..900;1,200..900&display=swap",
      },
    ],
    [
      "link",
      {
        rel: "icon",
        type: "image/svg+xml",
        href: "/head-1a1a1a-f0f0f0.svg",
      },
    ],
  ],

  // ── Theme config ───────────────────────────────────────────────
  themeConfig: {
    // 1. Site logo (optional — replace with your own)
    logo: "/logo-1a1a1a.svg",

    // 2. Top navigation bar with hyperlinks
    nav: [
      { text: "工具", link: "/guide/index", activeMatch: "/guide/" },
      {
        text: "衛教",
        link: "/reference/index",
        activeMatch: "^/(reference)/",
      },
      {
        text: "靜心閣",
        link: "/blog/index",
        activeMatch: "^/(blog)/",
      },
      {
        text: "其他",
        items: [
          {
            text: "語錄",
            link: "/citation",
          },
          { text: "關於", link: "/about" },
        ],
      },
    ],

    sidebarMenuLabel: "目錄",
    darkModeSwitchLabel: "主題",
    returnToTopLabel: "回到頂部",
    outlineTitle: "大綱",
    // 3. Left sidebar with collapsible groups
    sidebar: {
      "/guide/": [
        {
          text: "耳鼻喉",
          collapsed: true,
          items: [
            {
              text: "喉",
              collapsed: false,
              items: [
                { text: "RFS 逆流表現評分", link: "/guide/ent/rfs-calculator" },
                { text: "RSI 逆流症狀指數", link: "/guide/ent/rsi-calculator" },
                {
                  text: "FOIS 功能性口腔攝食量表",
                  link: "/guide/ent/fois-calculator",
                },
                {
                  text: "EAT-10 吞嚥篩檢量表",
                  link: "/guide/ent/eat10-calculator",
                },
                {
                  text: "VoiSS 嗓音症狀量表",
                  link: "/guide/ent/voiss-calculator",
                },
                {
                  text: "VHI-10 嗓音障礙指數",
                  link: "/guide/ent/vhi10-calculator",
                },
                {
                  text: "GRBAS 嗓音品質評估",
                  link: "/guide/ent/grbas-calculator",
                },
              ],
            },
            {
              text: "耳",
              collapsed: false,
              items: [
                {
                  text: "HH 聽覺障礙鑑定計算器",
                  link: "/guide/ent/hearing-handicap-calculator",
                },
                { text: "THI 耳鳴障礙量表", link: "/guide/ent/thi-calculator" },
                { text: "TFI 耳鳴功能指數", link: "/guide/ent/tfi-calculator" },
                { text: "DHI 頭暈障礙量表", link: "/guide/ent/dhi-calculator" },
                {
                  text: "ETDQ-7 咽鼓管功能障礙問卷",
                  link: "/guide/ent/etdq7-calculator",
                },
              ],
            },
            {
              text: "鼻",
              collapsed: false,
              items: [
                {
                  text: "Dupixent 適應症評估",
                  link: "/guide/ent/dupixent-calculator",
                },
                {
                  text: "NOSE 鼻腔阻塞症狀評估",
                  link: "/guide/ent/nose-calculator",
                },
                {
                  text: "ENS6Q 空鼻症症狀評估",
                  link: "/guide/ent/ens6q-calculator",
                },
                {
                  text: "SNOT-22 鼻竇生活品質量表",
                  link: "/guide/ent/snot22-calculator",
                },
              ],
            },
            {
              text: "睡眠與呼吸",
              collapsed: false,
              items: [
                {
                  text: "STOP-BANG 睡眠呼吸中止症量表",
                  link: "/guide/ent/stopbang-calculator",
                },
                {
                  text: "ESS 愛普沃斯嗜睡量表",
                  link: "/guide/ent/ess-calculator",
                },
              ],
            },
          ],
        },
        {
          text: "腎臟",
          collapsed: true,
          items: [
            {
              text: "Access Recirculation 血管通路再循環率",
              link: "/guide/nephro/access-recirculation",
            },
            {
              text: "Bicarbonate Deficit 碳酸氫鈉缺乏量",
              link: "/guide/nephro/bicarb-deficit",
            },
            {
              text: "Delta/Delta 混合酸鹼分析",
              link: "/guide/nephro/delta-delta",
            },
            {
              text: "Fractional Excretion 分餾排泄率",
              link: "/guide/nephro/fractional-excretion",
            },
            {
              text: "H₂O Deficit 自由水缺乏量",
              link: "/guide/nephro/h2o-deficit",
            },
            { text: "IVC/BSA 比值", link: "/guide/nephro/ivc-bsa" },
            {
              text: "Kt/V 透析充分度",
              link: "/guide/nephro/ktv",
            },
            {
              text: "MDRD 腎絲球過濾率估算",
              link: "/guide/nephro/mdrd-calculator",
            },
            {
              text: "Urea Reduction Ratio 尿素減少率",
              link: "/guide/nephro/urr",
            },
          ],
        },
        {
          text: "新陳代謝",
          collapsed: true,
          items: [
            {
              text: "甲狀腺",
              collapsed: false,
              items: [
                {
                  text: "Levothyroxine 劑量計算器",
                  link: "/guide/meta/levothyroxine-calculator",
                },
              ],
            },
            {
              text: "代謝",
              collapsed: false,
              items: [
                {
                  text: "BEE 基礎能量消耗",
                  link: "/guide/meta/basal-energy-expenditure",
                },
                {
                  text: "BSA 體表面積計算",
                  link: "/guide/meta/bsa-calculator",
                },
                {
                  text: "Calorie requirement 成人每日熱量需求參考表",
                  link: "/guide/meta/calorie-requirements-table",
                },
                {
                  text: "EER 成人熱量需求估算",
                  link: "/guide/meta/calorie-requirements",
                },
                {
                  text: "Ideal Body Weight 理想體重及調整體重",
                  link: "/guide/meta/ideal-body-weight",
                },
                {
                  text: "Lean Body Weight 瘦體重計算",
                  link: "/guide/meta/lean-body-weight",
                },
                {
                  text: "Schofield BMR 基礎代謝率",
                  link: "/guide/meta/schofield-bmr",
                },
              ],
            },
          ],
        },
        {
          text: "風濕免疫",
          collapsed: true,
          items: [
            {
              text: "風濕免疫自我評估",
              link: "/guide/rheuma/autoscreen-calculator",
            },
            {
              text: "類風濕關節炎",
              collapsed: false,
              items: [
                {
                  text: "RAPID3 快速評估指數",
                  link: "/guide/rheuma/rapid3-calculator",
                },
                {
                  text: "DAS28 疾病活動指數",
                  link: "/guide/rheuma/das28-calculator",
                },
                {
                  text: "CDAI 臨床疾病活動指數",
                  link: "/guide/rheuma/cdai-calculator",
                },
              ],
            },
            {
              text: "僵直性脊椎炎",
              collapsed: false,
              items: [
                {
                  text: "BASDAI 疾病活動指數",
                  link: "/guide/rheuma/basdai-calculator",
                },
              ],
            },
            {
              text: "骨折",
              collapsed: false,
              items: [
                {
                  text: "FRAX 骨折風險評估工具",
                  link: "/guide/rheuma/frax-calculator",
                },
              ],
            },
          ],
        },
        {
          text: "神經",
          collapsed: true,
          items: [
            {
              text: "中風評估",
              collapsed: false,
              items: [
                {
                  text: "NIHSS 中風量表",
                  link: "/guide/neuro/nihss-calculator",
                },
                {
                  text: "ABCD-2 TIA 風險評估",
                  link: "/guide/neuro/abcd2-calculator",
                },
              ],
            },
            {
              text: "神經認知",
              collapsed: false,
              items: [
                {
                  text: "FAST 功能性評估分期",
                  link: "/guide/neuro/fast-calculator",
                },
                {
                  text: "MMSE 簡易心智狀態評估",
                  link: "/guide/neuro/mmse-calculator",
                },
                {
                  text: "NPI 神經精神症狀量表",
                  link: "/guide/neuro/npi-calculator",
                },
                {
                  text: "CDR 臨床失智評量表",
                  link: "/guide/neuro/cdr-calculator",
                },
                {
                  text: "GDS 整體退化量表",
                  link: "/guide/neuro/gds-calculator",
                },
                {
                  text: "CMAI 激動情緒行為量表",
                  link: "/guide/neuro/cmai-calculator",
                },
              ],
            },
            {
              text: "運動",
              collapsed: false,
              items: [
                {
                  text: "UPDRS 巴金森症狀衡量表",
                  link: "/guide/neuro/updrs-calculator",
                },
              ],
            },
            {
              text: "纖維肌痛",
              collapsed: false,
              items: [
                {
                  text: "SS 纖維肌痛症狀嚴重度量表",
                  link: "/guide/neuro/fibromyalgia-calculator",
                },
                {
                  text: "WPI 廣泛疼痛指數",
                  link: "/guide/neuro/wpi-calculator",
                },
              ],
            },
            {
              text: "其他",
              collapsed: false,
              items: [
                {
                  text: "CTS 腕隧道症候群臨床決策樹",
                  link: "/guide/neuro/Neurology-CTS",
                },
                {
                  text: "MIGRAINE 偏頭痛篩查與診斷標準",
                  link: "/guide/neuro/Neurology-Migraine",
                },
                {
                  text: "ACUTE VERTIGO 眩暈鑑別診斷工具",
                  link: "/guide/neuro/Neurology-Vertigo",
                },
              ],
            },
          ],
        },
        {
          text: "疼痛",
          collapsed: true,
          items: [
            {
              text: "CTS 腕隧道症候群臨床決策樹",
              link: "/guide/pain/carpal-tunnel",
            },
            {
              text: "LBP Evaluation 腰痛評估決策樹",
              link: "/guide/pain/low-back-pain",
            },
            {
              text: "Neuropathic Pain Scale 神經性疼痛量表",
              link: "/guide/pain/neuropathic-pain",
            },
            { text: "Oswestry 失能指數", link: "/guide/pain/oswestry" },
            {
              text: "Roland-Morris 失能問卷",
              link: "/guide/pain/roland-morris",
            },
          ],
        },
        {
          text: "老年",
          collapsed: true,
          items: [
            {
              text: "WHO ICOPE 長者功能篩查",
              link: "/guide/geria/icope-screening",
            },
            {
              text: "BHT & AD8 認知功能複評工具",
              link: "/guide/geria/CognitiveBHT&AD8",
            },
            {
              text: "SPPB 行動功能複評工具",
              link: "/guide/geria/LocomotorSPPB",
            },
            { text: "MNA-SF 營養不良複評工具", link: "/guide/geria/MNA-SF" },
            {
              text: "GDS 老年抑鬱量表",
              link: "/guide/geria/geriatric-depression-scale-calculator",
            },
            { text: "WHO 近距離視力測試卡", link: "/guide/geria/WHO-Vision" },
          ],
        },
        {
          text: "麻醉",
          collapsed: true,
          items: [
            { text: "ASA 麻醉風險分級", link: "/guide/anes/asa-calculator" },
          ],
        },
        {
          text: "胸腔",
          collapsed: true,
          items: [
            {
              text: "CRB-65 肺炎嚴重度評估",
              link: "/guide/infection/crb65-calculator",
            },
            {
              text: "PEF 峰值呼氣流速預測",
              link: "/guide/chest/PEF-Peak-Expiratory-Flow",
            },
            {
              text: "CAT 慢性阻塞性肺病評估測試",
              link: "/guide/chest/CAT-COPD-Assessment-Test",
            },
          ],
        },
        {
          text: "感染",
          collapsed: true,
          items: [
            {
              text: "Centor Score 鏈球菌咽喉炎風險評估",
              link: "/guide/infection/centor-calculator",
            },
            {
              text: "CRB-65 肺炎嚴重度評估",
              link: "/guide/infection/crb65-calculator",
            },
          ],
        },
        {
          text: "泌尿",
          collapsed: true,
          items: [
            { text: "IPSS 國際攝護腺症狀評分表", link: "/guide/uro/IPSS" },
            {
              text: "NIH-CPSI 慢性攝護腺炎症狀評分",
              link: "/guide/uro/NIH-CPSI",
            },
          ],
        },
        {
          text: "腸胃",
          collapsed: true,
          items: [
            {
              text: "FIB-4 肝纖維化指數",
              link: "/guide/gi/FIB4-Liver-Fibrosis",
            },
          ],
        },
        {
          text: "心臟",
          collapsed: true,
          items: [
            {
              text: "CHA₂DS₂-VA 心房顫動中風風險評估",
              link: "/guide/cv/cha2ds2va-calculator",
            },
            {
              text: "PREVENT-ASCVD 動脈粥樣硬化心血管疾病風險評估",
              link: "/guide/cv/prevent-ascvd-calculator",
            },
          ],
        },
        {
          text: "心身",
          collapsed: true,
          items: [
            {
              text: "PHQ-9 & GAD-7 自我評估量表",
              link: "/guide/psy/phq9-gad7-calculator",
            },
            { text: "SF-36 健康狀況調查", link: "/guide/psy/sf36-calculator" },
          ],
        },
      ],

      "/reference/": [
        {
          text: "門診",
          collapsed: true,
          items: [
            {
              text: "外籍門診詢問單（多國語言）",
              link: "/reference/clinic/foreigner-inquiry",
            },
          ],
        },
        {
          text: "耳鼻喉",
          collapsed: true,
          items: [
            {
              text: "甲狀腺炎",
              link: "/reference/ent/thyroiditis",
            },
            {
              text: "甲狀腺腫瘤",
              link: "/reference/ent/thyroid-tumor",
            },
            {
              text: "甲狀腺及頸部超音波",
              link: "/reference/ent/thyroid-sonography",
            },
            {
              text: "嗓音復健",
              link: "/reference/ent/dysphonia-rehabilitation",
            },
            {
              text: "吞嚥復健",
              link: "/reference/ent/dysphagia-rehabilitation",
            },
            {
              text: "前庭復健",
              link: "/reference/ent/vestibular-rehabilitation",
            },
          ],
        },
        {
          text: "超音波",
          collapsed: true,
          items: [
            {
              text: "消化系統",
              link: "/reference/echo/digestive-sono",
            },
            {
              text: "泌尿系統",
              link: "/reference/echo/urology-sono",
            },
          ],
        },
        {
          text: "皮膚",
          collapsed: true,
          items: [
            {
              text: "糖尿病皮膚表現",
              link: "/reference/skin/diabetes-skin-manifestations",
            },
            {
              text: "皮膚科鑑別診斷",
              link: "/reference/clinic/dermatology-ddx",
            },
          ],
        },
        {
          text: "疼痛",
          collapsed: true,
          items: [
            {
              text: "神經疼痛：能否合併使用garbapentin與pregabalin",
              link: "/reference/pain/garbapentinoid",
            },
          ],
        },
        {
          text: "高血脂",
          collapsed: true,
          items: [
            {
              text: "CHOL 健保降血脂藥物給付判定",
              link: "/reference/lipid/lipid-protocol",
            },
          ],
        },
        {
          text: "糖尿病",
          collapsed: true,
          items: [
            {
              text: "CHOL 健保降血脂藥物給付判定",
              link: "/reference/dm/ lipid - protocol",
            },
            {
              text: "INSULIN 基礎胰島素劑量調整計算器",
              link: "/reference/dm/basal-insulin-titration",
            },
            {
              text: "OHA 口服降血糖藥完整比較與選擇指引",
              link: "/reference/dm/OHA-selection-guide",
            },
            {
              text: "GLP-1 受體促效劑適應症",
              link: "/reference/dm/GLP1ra-indication",
            },
            {
              text: "停用 GLP-1 RA 後的體重維持",
              link: "/reference/dm/GLP1ra-weight-maintenance",
            },
            {
              text: "如何為患者選擇合適的 GLP-1 促效劑",
              link: "/reference/dm/GLP1ra-selection-guide",
            },
            {
              text: "SGLT2 抑制劑（排糖藥）適應症與給付",
              link: "/reference/dm/sglt2-inhibitors",
            },
          ],
        },
        // {
        //   text: 'API Reference',
        //   collapsed: false,
        //   items: [
        //     { text: 'Config', link: '/reference/config' },
        //     { text: 'Frontmatter', link: '/reference/frontmatter' },
        //     { text: 'CLI', link: '/reference/cli' },
        //   ]
        // }
      ],
      "/blog/": [
        {
          text: "2026",
          collapsed: false,
          items: [
            { text: "Anger is the enemy of wisdom", link: "/blog/2026-05-30" },
            { text: "Thinking of my life", link: "/blog/2026-04-10" },
          ],
        },
      ],
    },

    // 4. Local search with ⌘K shortcut (built-in, no plugin needed)
    search: {
      provider: "local",
      options: {
        // Keyboard shortcut is ⌘K (Mac) / Ctrl+K (Windows) by default
        // No extra config needed — it just works
        translations: {
          button: {
            buttonText: "搜尋",
            buttonAriaLabel: "搜尋",
          },
          modal: {
            noResultsText: "找不到相關結果",
            resetButtonTitle: "清除搜尋條件",
            footer: {
              selectText: "選擇",
              navigateText: "切換",
              closeText: "關閉",
            },
          },
        },
      },
    },

    // 5. Dark / light mode toggle (built-in)
    // The switch appears automatically in the top bar.
    // Control the default appearance here:
    // appearance: 'dark'  // force dark on first load
    // appearance: true    // follow system preference (default)

    // ── Footer ──────────────────────────────────────────────────
    footer: {
      message: "MIT License. | Based on Vitepress.",
      copyright: "Copyright © neo jerzy",
    },

    // ── Social links (optional) ──────────────────────────────────
    socialLinks: [
      // { icon: "github", link: "https://github.com/your-username/my-docs" },
      {
        icon: {
          svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>',
        },
        link: "mailto:neojerzy@gmail.com",
      },
    ],

    // ── Edit link (optional) Guide 文件下方的編輯連結 ──────────────
    // editLink: {
    //   pattern: 'https://github.com/your-username/my-docs/edit/main/docs/:path',
    //   text: 'Edit this page on GitHub'
    // },

    // ── Table of contents (right-side outline) ──────────────────
    outline: {
      level: [2, 3],
      label: "大綱",
    },

    // ── Previous / Next page links ──────────────────────────────
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
  },

  markdown: {
    emoji: {
      shortcuts: {},
    },
  },

  transformPageData(pageData) {
    const pwd = pageData.frontmatter.password;
    if (pwd && (typeof pwd === "string" || typeof pwd === "number")) {
      const s = String(pwd);
      if (!s.startsWith("sha256:")) {
        pageData.frontmatter.password =
          "sha256:" + createHash("sha256").update(s).digest("hex");
      }
    }
  },
});
