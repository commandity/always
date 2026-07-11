import { createContentLoader, defineConfig } from "vitepress";
import { createHash } from "node:crypto";

const base = "/always/";

export default defineConfig({
  base,
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
        href: `${base}logo/logo-1a1a1a.svg`,
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
  ],

  // ── Theme config ───────────────────────────────────────────────
  themeConfig: {
    // 1. Site logo (optional — replace with your own)
    logo: "/logo/logo-1a1a1a.svg",

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
                {
                  text: "咽喉逆流（RFS・RSI）",
                  link: "/guide/ent/lpr",
                },
                {
                  text: "吞嚥困難（FOIS・EAT-10）",
                  link: "/guide/ent/dysphagia",
                },
                {
                  text: "嗓音障礙（VoiSS・VHI-10・GRBAS）",
                  link: "/guide/ent/dysphonia",
                },
              ],
            },
            {
              text: "耳",
              collapsed: false,
              items: [
                {
                  text: "聽力障礙（PTA 障礙鑑定）",
                  link: "/guide/ent/hearing-loss",
                },
                {
                  text: "耳鳴（THI・TFI）",
                  link: "/guide/ent/tinnitus",
                },
                {
                  text: "頭暈（眩暈鑑別・DHI）",
                  link: "/guide/ent/dizziness",
                },
                {
                  text: "耳咽管功能（ETDQ-7）",
                  link: "/guide/ent/et-function",
                },
              ],
            },
            {
              text: "鼻",
              collapsed: false,
              items: [
                {
                  text: "慢性鼻竇炎（Dupixent・SNOT-22）",
                  link: "/guide/ent/crs",
                },
                {
                  text: "鼻腔阻塞（NOSE）",
                  link: "/guide/ent/nasal-obstruction",
                },
                {
                  text: "空鼻症（ENS6Q）",
                  link: "/guide/ent/empty-nose",
                },
              ],
            },
            {
              text: "睡眠呼吸",
              collapsed: false,
              items: [
                {
                  text: "睡眠呼吸中止症（STOP-BANG・ESS）",
                  link: "/guide/ent/osa",
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
              text: "腎功能評估（eGFR・酸鹼・FE）",
              link: "/guide/nephro/renal-function",
            },
            {
              text: "體液狀態評估（FWD・IVC/BSA）",
              link: "/guide/nephro/volume-status",
            },
            {
              text: "血液透析評估（Kt/V・URR・再循環）",
              link: "/guide/nephro/hemodialysis",
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
                  text: "甲狀腺用藥（Levothyroxine 劑量）",
                  link: "/guide/meta/thyroid",
                },
              ],
            },
            {
              text: "代謝",
              collapsed: false,
              items: [
                {
                  text: "代謝評估（BEE・BSA・熱量・體重・BMR）",
                  link: "/guide/meta/metabolism",
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
              text: "風濕免疫自我評估（症狀篩檢）",
              link: "/guide/rheuma/autoimmune-screen",
            },
            {
              text: "類風濕關節炎",
              collapsed: false,
              items: [
                {
                  text: "疾病活動評估（RAPID3・DAS28・CDAI）",
                  link: "/guide/rheuma/rheumatoid-arthritis",
                },
              ],
            },
            {
              text: "僵直性脊椎炎",
              collapsed: false,
              items: [
                {
                  text: "疾病活動評估（BASDAI）",
                  link: "/guide/rheuma/ankylosing-spondylitis",
                },
              ],
            },
            {
              text: "骨折",
              collapsed: false,
              items: [
                {
                  text: "骨折風險評估（FRAX）",
                  link: "/guide/rheuma/fracture",
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
                  text: "中風評估（NIHSS・ABCD²）",
                  link: "/guide/neuro/stroke",
                },
              ],
            },
            {
              text: "神經認知",
              collapsed: false,
              items: [
                {
                  text: "認知評估（FAST・MMSE・CDR・GDS・NPI・CMAI）",
                  link: "/guide/neuro/cognition",
                },
              ],
            },
            {
              text: "運動",
              collapsed: false,
              items: [
                {
                  text: "運動功能評估（UPDRS）",
                  link: "/guide/neuro/motor-function",
                },
              ],
            },
            {
              text: "纖維肌痛",
              collapsed: false,
              items: [
                {
                  text: "纖維肌痛評估（WPI・SS）",
                  link: "/guide/neuro/fibromyalgia",
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
              text: "腕隧道症候群（Katz・Wainner CPR）",
              link: "/guide/pain/cts",
            },
            {
              text: "偏頭痛（篩查・ICHD-3）",
              link: "/guide/pain/migraine",
            },
            {
              text: "疼痛評估（腰痛・神經性疼痛）",
              link: "/guide/pain/pain-evaluation",
            },
            {
              text: "失能評估（Oswestry・Roland-Morris）",
              link: "/guide/pain/disability",
            },
          ],
        },
        {
          text: "老年",
          collapsed: true,
          items: [
            {
              text: "長者功能評估（ICOPE・AD8・SPPB・MNA-SF・GDS・視力）",
              link: "/guide/geria/geriatric-assessment",
            },
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
              text: "上呼吸道",
              items: [
                {
                  text: "Centor Score 鏈球菌咽喉炎風險評估",
                  link: "/guide/infection/centor-calculator",
                },
              ],
            },
            {
              text: "下呼吸道",
              items: [
                {
                  text: "CRB-65 肺炎嚴重度評估",
                  link: "/guide/infection/crb65-calculator",
                },
              ],
            },
          ],
        },
        {
          text: "泌尿",
          collapsed: true,
          items: [
            {
              text: "攝護腺症狀評分（IPSS・NIH-CPSI）",
              link: "/guide/uro/prostate-assessment",
            },
          ],
        },
        {
          text: "肝膽腸胃",
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
              text: "心血管風險評估（CHA₂DS₂-VA・PREVENT）",
              link: "/guide/cv/cardiovascular-risk",
            },
          ],
        },
        {
          text: "心身",
          collapsed: true,
          items: [
            {
              text: "情緒",
              collapsed: false,
              items: [
                {
                  text: "PHQ-9 & GAD-7 自我評估量表",
                  link: "/guide/psy/phq9-gad7-calculator",
                },
              ],
            },
            {
              text: "日常功能",
              collapsed: false,
              items: [
                {
                  text: "SF-36 健康狀況調查",
                  link: "/guide/psy/sf36-calculator",
                },
              ],
            },
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
            {
              text: "妊娠用藥分級查詢表（FDA A/B/C/D/X）",
              link: "/reference/clinic/pregnancy-category-table",
            },
            {
              text: "藥物交互作用查詢（drug–drug・drug–food）",
              link: "/reference/clinic/drug-interaction-checker",
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
          text: "胸腔",
          collapsed: true,
          items: [
            {
              text: "氣喘（診斷・評估・治療）",
              link: "/reference/chest/asthma",
            },
          ],
        },
        {
          text: "超音波",
          collapsed: true,
          items: [
            {
              text: "甲狀腺及頸部超音波",
              link: "/reference/echo/thyroid-sonography",
            },
            {
              text: "消化系統",
              link: "/reference/echo/digestive-sono",
            },
            {
              text: "泌尿系統",
              link: "/reference/echo/urology-sono",
            },
            {
              text: "腹部超音波解剖學精要",
              link: "/reference/echo/abdominal-sono",
            },
          ],
        },
        {
          text: "物理治療",
          collapsed: true,
          items: [
            {
              text: "肩",
              collapsed: true,
              items: [
                {
                  text: "肩關節分期復健運動",
                  link: "/reference/pt/shoulder/shoulder-rehab",
                },
              ],
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
            {
              text: "濕疹鑑別診斷",
              link: "/reference/skin/eczema-differential",
            },
            {
              text: "兒童皮疹鑑別診斷（有無發燒）",
              link: "/reference/skin/pediatric-rash-differential",
            },
            {
              text: "全身性疾病的皮膚表徵",
              link: "/reference/skin/systemic-disease-skin-signs",
            },
            {
              text: "水疱性病灶鑑別診斷",
              link: "/reference/skin/vesicular-lesions-differential",
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
            { text: "每個人都有自己的因果", link: "/blog/2026-07-06" },
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
    if (
      pageData.relativePath?.startsWith("blog/") &&
      pageData.relativePath !== "blog/index.md"
    ) {
      pageData.frontmatter.pageClass = "journal";
    }
  },
});
