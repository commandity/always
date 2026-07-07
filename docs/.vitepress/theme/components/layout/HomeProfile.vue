<script setup lang="ts">
import { useData, useRouter } from "vitepress";
import { computed } from "vue";

const { isDark } = useData();
const router = useRouter();

const avatarSrc = computed(() =>
  isDark.value ? "/assets/avatar-f0f0f0.svg" : "/assets/avatar-333333.svg",
);
</script>

<template>
  <div class="home-profile-wrap">
    <div
      class="home-profile"
      @click="router.go('/about')"
      role="link"
      tabindex="0"
      @keydown.enter="router.go('/about')"
    >
      <div class="profile-card">
        <div class="profile-left">
          <img :src="avatarSrc" alt="Profile" class="profile-avatar" />
          <div class="profile-status">
            <span class="status-dot" />
            Busy
          </div>
        </div>

        <div class="profile-right">
          <h2 class="profile-name">neo jerzy</h2>
          <p class="profile-title">ENT · Writer · Buddhist</p>
          <p class="profile-bio">
            To find meaning between clinic and contemplation. Medicine and
            Buddhism both ask the same question — how do we live with suffering,
            and how do we let it go.
          </p>
          <div class="profile-tags">
            <span class="profile-tag">ENT</span>
            <span class="profile-tag">Buddhism</span>
            <!-- <span class="profile-tag">Writing</span> -->
            <span class="profile-tag">日本語</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-profile-wrap {
  padding: 0 24px;
  box-sizing: border-box;
}

@media (min-width: 640px) {
  .home-profile-wrap {
    padding: 0 48px;
  }
}

@media (min-width: 960px) {
  .home-profile-wrap {
    padding: 0 64px;
  }
}

.home-profile {
  max-width: 1152px;
  margin: 0 auto;
  cursor: pointer;
  box-sizing: border-box;
}

.profile-card {
  display: flex;
  gap: 2rem;
  padding: 2rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  align-items: flex-start;
  margin: 2rem 0;
  transition:
    background 0.25s,
    box-shadow 0.2s,
    border-color 0.2s;
}

:root:not(.dark) .profile-card {
  border: 1px solid rgba(100, 108, 255, 0.3);
}

.home-profile:hover .profile-card {
  background: rgba(255, 255, 255, 0.11);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 45%, white);
}

/* Left — avatar */
.profile-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.profile-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--vp-c-brand-1);
}
.profile-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.75rem;
  color: var(--vp-c-text-2);
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffbc00;
  display: inline-block;
}

/* Right — text */
.profile-right {
  flex: 1;
  min-width: 0;
}
.profile-name {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin: 0 0 4px;
  border: none !important;
  padding: 0 !important;
}
.profile-title {
  font-size: 0.85rem;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  margin: 0 0 0.75rem;
}
.profile-bio {
  font-size: 0.92rem;
  color: var(--vp-c-text-1);
  line-height: 1.7;
  margin: 0 0 1rem;
}
.profile-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.profile-tag {
  font-size: 0.75rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-weight: 600;
}

@media (max-width: 640px) {
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .profile-tags {
    justify-content: center;
  }
  .profile-bio {
    text-align: left;
  }
}
</style>
