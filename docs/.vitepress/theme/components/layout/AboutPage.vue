<script setup lang="ts">
import { withBase } from "vitepress";
import { computed, ref } from "vue";

// ── Edit your info here ──────────────────────────────────────────
const authors = [
  {
    id: "neo",
    name: "neo jerzy",
    chineseName: "凝淨齋",
    avatar: "/assets/avatar-f0f0f0-9499ff.svg", // put your photo in public/
    role: "住院醫師 · 文字工作者",
    location: "台灣",
    bio: "在醫院裡學習如何面對生死，在文字裡尋找活著的意義。有質、有量、有多聞。",
    email: "neojerzy@gmail.com",
    github: "https://github.com/your-username",
    experiences: [
      {
        period: "2024 — 現在",
        role: "住院醫師",
        org: "某醫學中心",
        desc: "內科系住院醫師訓練，負責病房管理與急重症照護。",
        current: true,
      },
      {
        period: "2023",
        role: "實習醫師",
        org: "教學醫院",
        desc: "完成各科輪訓，通過醫師執照考試。",
        current: false,
      },
      {
        period: "2017 — 2023",
        role: "醫學系學生",
        org: "醫學大學",
        desc: "六年醫學教育，主修臨床醫學。",
        current: false,
      },
    ],
    skills: [
      {
        label: "臨床技能",
        items: ["病史詢問", "身體檢查", "急重症處置", "超音波"],
      },
      {
        label: "數位工具",
        items: ["VitePress", "Vue.js", "TypeScript", "Markdown"],
      },
      {
        label: "語言",
        items: ["中文（母語）", "台語", "English", "日本語（初級）"],
      },
      { label: "興趣", items: ["閱讀", "寫作", "攝影", "登山"] },
    ],
    values: [
      {
        icon: "◎",
        title: "有質",
        desc: "重視內容的深度與精準，不以數量取勝。",
      },
      { icon: "◉", title: "有量", desc: "持續累積，相信時間複利的力量。" },
      { icon: "✦", title: "有多聞", desc: "廣泛涉獵，跨域學習，保持好奇心。" },
    ],
  },
  // {
  //   id: 'author2',
  //   name: 'Author Two',
  //   chineseName: '筆名或齋號',
  //   avatar: '/avatar-two.jpg',       // put your photo in public/
  //   role: '職稱 · 身份',
  //   location: '台灣',
  //   bio: '簡短介紹自己，幾句話描述你是誰、你在做什麼、你關心什麼。',
  //   email: 'author2@gmail.com',
  //   github: 'https://github.com/author2',
  //   experiences: [
  //     {
  //       period: '2024 — 現在',
  //       role: '現職職稱',
  //       org: '單位名稱',
  //       desc: '工作描述。',
  //       current: true,
  //     },
  //     {
  //       period: '2020 — 2024',
  //       role: '前職職稱',
  //       org: '前單位名稱',
  //       desc: '工作描述。',
  //       current: false,
  //     },
  //   ],
  //   skills: [
  //     { label: '專業技能', items: ['技能一', '技能二', '技能三'] },
  //     { label: '工具', items: ['工具一', '工具二', '工具三'] },
  //     { label: '語言', items: ['中文（母語）', 'English'] },
  //     { label: '興趣', items: ['興趣一', '興趣二', '興趣三'] },
  //   ],
  //   values: [
  //     { icon: '◎', title: '理念一', desc: '描述你的第一個核心理念。' },
  //     { icon: '◉', title: '理念二', desc: '描述你的第二個核心理念。' },
  //     { icon: '✦', title: '理念三', desc: '描述你的第三個核心理念。' },
  //   ],
  // },
];

const activeId = ref(authors[0].id);
const active = () => authors.find((a) => a.id === activeId.value)!;
</script>

<template>
  <div class="about-page">
    <!-- ── Tab switcher 切換＊＊ ── -->
    <!-- <div class="author-tabs">
      <button
        v-for="author in authors"
        :key="author.id"
        class="author-tab"
        :class="{ active: activeId === author.id }"
        @click="activeId = author.id"
      >
        <img :src="author.avatar" :alt="author.name" class="tab-avatar" />
        <div class="tab-info">
          <span class="tab-name">{{ author.name }}</span>
          <span class="tab-role">{{ author.role }}</span>
        </div>
      </button>
    </div> -->

    <!-- ── Hero section ── -->
    <div class="about-hero">
      <div class="hero-left">
        <div class="avatar-wrap">
          <img
            :src="withBase(active().avatar)"
            :alt="active().name"
            class="avatar"
          />
          <div class="avatar-ring" />
        </div>
      </div>

      <div class="hero-right">
        <div class="name-block">
          <h1 class="name-en">{{ active().name }}</h1>
          <span class="name-zh">{{ active().chineseName }}</span>
        </div>
        <p class="role-badge">{{ active().role }}</p>
        <p class="location">◌ {{ active().location }}</p>
        <p class="bio">{{ active().bio }}</p>
        <div class="contact-row">
          <a :href="'mailto:' + active().email" class="contact-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"
              />
            </svg>
            Email
          </a>
          <a
            :href="active().github"
            target="_blank"
            rel="noopener"
            class="contact-btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="14"
              height="14"
            >
              <path
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </div>

    <!-- ── Values ── -->
    <section class="section">
      <h2 class="section-title">
        <span class="title-accent">✦</span> 核心理念
      </h2>
      <div class="values-grid">
        <div v-for="v in active().values" :key="v.title" class="value-card">
          <span class="value-icon">{{ v.icon }}</span>
          <h3 class="value-title">{{ v.title }}</h3>
          <p class="value-desc">{{ v.desc }}</p>
        </div>
      </div>
    </section>

    <!-- ── Experience timeline ── -->
    <section class="section">
      <h2 class="section-title"><span class="title-accent">✦</span> 經歷</h2>
      <div class="timeline">
        <div
          v-for="(exp, i) in active().experiences"
          :key="i"
          class="timeline-item"
          :class="{ current: exp.current }"
        >
          <div class="timeline-dot" />
          <div class="timeline-body">
            <div class="timeline-header">
              <span class="timeline-period">{{ exp.period }}</span>
              <span v-if="exp.current" class="current-badge">現職</span>
            </div>
            <h3 class="timeline-role">{{ exp.role }}</h3>
            <p class="timeline-org">{{ exp.org }}</p>
            <p class="timeline-desc">{{ exp.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Skills ── -->
    <section class="section">
      <h2 class="section-title">
        <span class="title-accent">✦</span> 能力與興趣
      </h2>
      <div class="skills-grid">
        <div
          v-for="group in active().skills"
          :key="group.label"
          class="skill-group"
        >
          <h3 class="skill-label">{{ group.label }}</h3>
          <div class="skill-tags">
            <span v-for="item in group.items" :key="item" class="skill-tag">{{
              item
            }}</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.about-page {
  max-width: 860px;
  margin: 0 auto;
  padding: 3rem clamp(24px, 5vw, 64px) 5rem;
}

/* ── Tab switcher ──────────────────────────────────────────────── */
.author-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
}

.author-tab {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s;
  flex: 1;
  min-width: 200px;
}

.author-tab:hover {
  border-color: var(--vp-c-brand-1);
}

.author-tab.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  box-shadow: 0 0 0 1px var(--vp-c-brand-1);
}

.tab-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid var(--vp-c-bg);
}

.author-tab.active .tab-avatar {
  border-color: var(--vp-c-brand-1);
}

.tab-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
}

.tab-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.tab-role {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
}

.author-tab.active .tab-name {
  color: var(--vp-c-brand-1);
}

/* ── Hero ──────────────────────────────────────────────────────── */
.about-hero {
  display: flex;
  gap: 3rem;
  align-items: flex-start;
  padding-bottom: 3rem;
  margin-bottom: 3rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

@media (max-width: 640px) {
  .about-hero {
    flex-direction: column;
    gap: 1.5rem;
  }
  .author-tabs {
    flex-direction: column;
  }
  .author-tab {
    min-width: unset;
  }
}

.hero-left {
  flex-shrink: 0;
}

.avatar-wrap {
  position: relative;
  width: 120px;
  height: 120px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  position: relative;
  z-index: 1;
  border: 3px solid var(--vp-c-bg-soft);
}

.avatar-ring {
  position: absolute;
  inset: -5px;
  border-radius: 50%;
  border: 2px solid var(--vp-c-brand-1);
  opacity: 0.5;
  z-index: 0;
}

.hero-right {
  flex: 1;
}

.name-block {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.name-en {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0;
  background: linear-gradient(
    135deg,
    var(--vp-c-brand-1),
    var(--vp-c-brand-2, var(--vp-c-text-1))
  );
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.name-zh {
  font-size: 1rem;
  color: var(--vp-c-text-3);
  letter-spacing: 0.05em;
}

.role-badge {
  display: inline-block;
  font-size: 0.82rem;
  font-weight: 600;
  padding: 3px 12px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  margin: 0 0 0.5rem;
}

.location {
  font-size: 0.82rem;
  color: var(--vp-c-text-3);
  margin: 0 0 0.75rem;
  letter-spacing: 0.03em;
}

.bio {
  font-size: 0.95rem;
  color: var(--vp-c-text-2);
  line-height: 1.8;
  margin: 0 0 1.25rem;
}

.contact-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.contact-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: all 0.2s;
  background: var(--vp-c-bg-soft);
}

.contact-btn:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

/* ── Sections ──────────────────────────────────────────────────── */
.section {
  margin-bottom: 3.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  letter-spacing: 0.02em;
}

.title-accent {
  color: var(--vp-c-brand-1);
  font-size: 0.9rem;
}

/* ── Values ────────────────────────────────────────────────────── */
.values-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

@media (max-width: 640px) {
  .values-grid {
    grid-template-columns: 1fr;
  }
}

.value-card {
  padding: 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  transition:
    border-color 0.2s,
    transform 0.2s;
}

.value-card:hover {
  border-color: var(--vp-c-brand-1);
  transform: translateY(-2px);
}

.value-icon {
  display: block;
  font-size: 1.5rem;
  color: var(--vp-c-brand-1);
  margin-bottom: 0.5rem;
  line-height: 1;
}

.value-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.4rem;
}

.value-desc {
  font-size: 0.82rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0;
}

/* ── Timeline ──────────────────────────────────────────────────── */
.timeline {
  position: relative;
  padding-left: 1.5rem;
  border-left: 2px solid var(--vp-c-divider);
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
  padding-left: 1.5rem;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-dot {
  position: absolute;
  left: -1.6rem;
  top: 0.3rem;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--vp-c-divider);
  border: 2px solid var(--vp-c-bg);
}

.timeline-item.current .timeline-dot {
  background: var(--vp-c-brand-1);
  box-shadow: 0 0 0 3px var(--vp-c-brand-soft);
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.25rem;
}

.timeline-period {
  font-size: 0.78rem;
  color: var(--vp-c-text-3);
  font-variant-numeric: tabular-nums;
}

.current-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--vp-c-brand-1);
  color: #fff;
  letter-spacing: 0.03em;
}

.timeline-role {
  font-size: 1rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 0.15rem;
}

.timeline-org {
  font-size: 0.82rem;
  color: var(--vp-c-brand-1);
  margin: 0 0 0.4rem;
  font-weight: 500;
}

.timeline-desc {
  font-size: 0.85rem;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0;
}

/* ── Skills ────────────────────────────────────────────────────── */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 640px) {
  .skills-grid {
    grid-template-columns: 1fr;
  }
}

.skill-group {
  padding: 1.1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.skill-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  margin: 0 0 0.75rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 6px;
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
}
</style>
