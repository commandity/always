<template>
  <div class="hero-bg-wrap">
    <svg
      class="hero-bg-svg"
      viewBox="0 0 500 500"
      xmlns="http://www.w3.org/2000/svg"
    >
      <!-- Grid lines horizontal -->
      <g stroke="#646cff" stroke-width="0.4" opacity="0.25">
        <line
          v-for="i in 20"
          :key="'h' + i"
          x1="0"
          :y1="i * 25"
          x2="500"
          :y2="i * 25"
        />
      </g>
      <!-- Grid lines vertical -->
      <g stroke="#646cff" stroke-width="0.4" opacity="0.25">
        <line
          v-for="i in 20"
          :key="'v' + i"
          :x1="i * 25"
          y1="0"
          :x2="i * 25"
          y2="500"
        />
      </g>
      <!-- Perspective converging lines from bottom center -->
      <g stroke="#646cff" stroke-width="0.5" opacity="0.3">
        <line x1="250" y1="500" x2="0" y2="0" />
        <line x1="250" y1="500" x2="125" y2="0" />
        <line x1="250" y1="500" x2="250" y2="0" />
        <line x1="250" y1="500" x2="375" y2="0" />
        <line x1="250" y1="500" x2="500" y2="0" />
      </g>
      <!-- Glowing dots -->
      <g fill="#646cff">
        <circle cx="50" cy="80" r="2.5" opacity="0.8" />
        <circle cx="150" cy="40" r="1.5" opacity="0.6" />
        <circle cx="300" cy="100" r="3" opacity="0.9" />
        <circle cx="420" cy="60" r="2" opacity="0.7" />
        <circle cx="80" cy="200" r="1.5" opacity="0.5" />
        <circle cx="450" cy="180" r="2.5" opacity="0.8" />
        <circle cx="200" cy="300" r="1.5" opacity="0.4" />
        <circle cx="380" cy="280" r="2" opacity="0.6" />
        <circle cx="100" cy="380" r="3" opacity="0.7" />
        <circle cx="460" cy="350" r="1.5" opacity="0.5" />
      </g>
      <!-- Connecting lines between dots -->
      <g stroke="#646cff" stroke-width="0.6" opacity="0.3">
        <line x1="50" y1="80" x2="150" y2="40" />
        <line x1="150" y1="40" x2="300" y2="100" />
        <line x1="300" y1="100" x2="420" y2="60" />
        <line x1="80" y1="200" x2="200" y2="300" />
        <line x1="450" y1="180" x2="380" y2="280" />
        <line x1="380" y1="280" x2="460" y2="350" />
        <line x1="100" y1="380" x2="200" y2="300" />
      </g>
      <!-- Hexagon shapes -->
      <g fill="none" stroke="#646cff" stroke-width="0.6" opacity="0.3">
        <polygon points="300,30 320,42 320,66 300,78 280,66 280,42" />
        <polygon points="430,150 450,162 450,186 430,198 410,186 410,162" />
        <polygon points="80,300 100,312 100,336 80,348 60,336 60,312" />
      </g>
      <!-- Corner accent brackets -->
      <g stroke="#646cff" stroke-width="1.5" fill="none" opacity="0.5">
        <path d="M10 40 L10 10 L40 10" />
        <path d="M490 40 L490 10 L460 10" />
        <path d="M10 460 L10 490 L40 490" />
        <path d="M490 460 L490 490 L460 490" />
      </g>
      <!-- Radial glow center -->
      <radialGradient id="glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#646cff" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#646cff" stop-opacity="0" />
      </radialGradient>
      <rect x="0" y="0" width="500" height="500" fill="url(#glow)" />
    </svg>
  </div>
</template>

<style scoped>
.hero-bg-wrap {
  width: 340px;
  height: 340px;
  position: relative;
}
.hero-bg-svg {
  width: 100%;
  height: 100%;
}
</style>
