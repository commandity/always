<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const canvas = ref<HTMLCanvasElement>();
let animId = 0;

onMounted(() => {
  const c = canvas.value!;
  const ctx = c.getContext("2d")!;
  let W = (c.width = window.innerWidth);
  let H = (c.height = window.innerHeight);

  window.addEventListener("resize", () => {
    W = c.width = window.innerWidth;
    H = c.height = window.innerHeight;
  });

  // Create glowing orbs
  const orbs = Array.from({ length: 6 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 150 + Math.random() * 200,
    dx: (Math.random() - 0.5) * 1.4,
    dy: (Math.random() - 0.5) * 1.4,
    hue: Math.random() * 360,
    dh: (Math.random() - 0.5) * 1.2,
    alpha: 0.15 + Math.random() * 0.2,
  }));

  function draw() {
    ctx.clearRect(0, 0, W, H);
    for (const o of orbs) {
      o.x += o.dx;
      o.y += o.dy;
      o.hue += o.dh;
      if (o.x < -o.r || o.x > W + o.r) o.dx *= -1;
      if (o.y < -o.r || o.y > H + o.r) o.dy *= -1;
      const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      g.addColorStop(0, `hsla(${o.hue}, 80%, 60%, ${o.alpha})`);
      g.addColorStop(1, `hsla(${o.hue}, 80%, 60%, 0)`);
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }
  draw();
});

onUnmounted(() => cancelAnimationFrame(animId));
</script>

<template>
  <canvas ref="canvas" class="glow-canvas" />
</template>

<style scoped>
.glow-canvas {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  width: 100%;
  height: 100%;
  filter: blur(8px);
  animation: glow-pulse 2.5s ease-in-out infinite alternate;
  animation: mesh-shift 2s ease-in-out infinite alternate;
}
</style>
