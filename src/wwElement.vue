<template>
  <div class="video-slider" :class="{ 'is-empty': !videos.length }">
    <div
      class="slider-viewport"
      ref="viewport"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @pointerleave="onPointerUp"
    >
      <div class="slider-track" :class="{ 'is-dragging': isDragging }" :style="trackStyle">
        <div
          v-for="(slide, index) in slides"
          :key="slide.key"
          class="slide"
          :class="{ 'slide--cta': slide.isCta }"
        >
          <template v-if="slide.isCta">
            <img
              class="cta-mascot"
              src="https://cdn.weweb.io/designs/7bbcc9e0-1226-4553-bc79-e03ef78066b4/sections/mascot-eagle.png?_wwcv=1768993575611"
              alt="Mascotte aigle"
            />
            <p class="cta-text">
              Super ! ⏱️ Tu as quelques minutes pour revoir tes notes avant de passer à la suite du module.
              Tu vas maintenant t’entraîner avec un scénario réaliste pour te présenter face à un recruteur. 🎯
              Choisis ta méthode et lance-toi ! 🚀
            </p>
            <a
              class="cta-button"
              href="http://7bbcc9e0-1226-4553-bc79-e03ef78066b4.weweb-preview.io/instructions/"
            >Suivant</a>
          </template>
          <template v-else>
            <video
              ref="videoEls"
              class="slide-video"
              :src="slide.url"
              :poster="slide.poster || null"
              :muted="content.autoPlayMuted"
              playsinline
              loop
              preload="metadata"
              :controls="content.showControls"
            ></video>
            <div v-if="slide.caption" class="caption">{{ slide.caption }}</div>
          </template>
        </div>
      </div>
    </div>
    <div class="slider-controls" v-if="slideCount > 1">
      <button class="nav-button" @click="prev" :disabled="currentIndex === 0">
        Prev
      </button>
      <div class="dots" v-if="content.showDots">
        <button
          v-for="(slide, index) in slides"
          :key="`dot-${slide.key}`"
          class="dot"
          :class="{ active: index === currentIndex }"
          @click="goTo(index)"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>
      <button
        class="nav-button"
        @click="next"
        :disabled="currentIndex === slideCount - 1"
      >
        Next
      </button>
    </div>
    <div v-if="!videos.length" class="empty-state">
      Add at least one video in the WeWeb editor.
    </div>
  </div>
</template>

<script>
export default {
  props: {
    content: { type: Object, required: true },
  },
  data() {
    return {
      currentIndex: 0,
      observer: null,
      isDragging: false,
      dragStartY: 0,
      dragOffset: 0,
      activePointerId: null,
    };
  },
  computed: {
    videos() {
      return Array.isArray(this.content.videos) ? this.content.videos : [];
    },
    slides() {
      if (!this.videos.length) return [];
      const items = this.videos.map((video, index) => ({
        ...video,
        isCta: false,
        key: `video-${index}`,
      }));
      items.push({ isCta: true, key: "cta" });
      return items;
    },
    slideCount() {
      return this.slides.length;
    },
    trackStyle() {
      return {
        transform: `translateY(calc(-${this.currentIndex * 100}% + ${this.dragOffset}px))`,
      };
    },
  },
  watch: {
    videos: {
      immediate: true,
      handler() {
        if (this.currentIndex >= this.slideCount) {
          this.currentIndex = Math.max(this.slideCount - 1, 0);
        }
        this.$nextTick(() => this.setupObserver());
      },
    },
    currentIndex() {
      this.$nextTick(() => this.pauseOffscreenVideos());
    },
  },
  mounted() {
    this.$nextTick(() => this.setupObserver());
  },
  beforeDestroy() {
    this.destroyObserver();
  },
  methods: {
    prev() {
      this.currentIndex = Math.max(this.currentIndex - 1, 0);
    },
    next() {
      this.currentIndex = Math.min(this.currentIndex + 1, this.slideCount - 1);
    },
    goTo(index) {
      this.currentIndex = index;
    },
    onPointerDown(event) {
      if (!this.slideCount || this.slideCount === 1) return;
      if (event.button !== undefined && event.button !== 0) return;
      this.isDragging = true;
      this.dragStartY = event.clientY;
      this.dragOffset = 0;
      this.activePointerId = event.pointerId;
      if (event.currentTarget && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }
    },
    onPointerMove(event) {
      if (!this.isDragging || event.pointerId !== this.activePointerId) return;
      const delta = event.clientY - this.dragStartY;
      const viewportHeight = this.$refs.viewport ? this.$refs.viewport.clientHeight : 0;
      const isFirst = this.currentIndex === 0;
      const isLast = this.currentIndex === this.slideCount - 1;
      let nextOffset = delta;
      if ((isFirst && delta > 0) || (isLast && delta < 0)) {
        nextOffset = delta * 0.35;
      }
      if (viewportHeight) {
        const maxOffset = viewportHeight * 0.9;
        nextOffset = Math.max(Math.min(nextOffset, maxOffset), -maxOffset);
      }
      this.dragOffset = nextOffset;
    },
    onPointerUp(event) {
      if (!this.isDragging || event.pointerId !== this.activePointerId) return;
      const delta = this.dragOffset;
      const viewportHeight = this.$refs.viewport ? this.$refs.viewport.clientHeight : 0;
      const threshold = viewportHeight ? viewportHeight * 0.2 : 40;
      if (delta <= -threshold) {
        this.next();
      } else if (delta >= threshold) {
        this.prev();
      }
      this.isDragging = false;
      this.dragOffset = 0;
      this.activePointerId = null;
    },
    setupObserver() {
      this.destroyObserver();
      if (!this.$refs.videoEls || !this.$refs.viewport) return;

      const options = {
        root: this.$refs.viewport,
        threshold: 0.6,
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            this.safePlay(video);
          } else {
            this.safePause(video);
          }
        });
      }, options);

      this.$refs.videoEls.forEach((video) => this.observer.observe(video));
    },
    destroyObserver() {
      if (this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    safePlay(video) {
      if (!video) return;
      const promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(() => {});
      }
    },
    safePause(video) {
      if (!video || video.paused) return;
      video.pause();
    },
    pauseOffscreenVideos() {
      if (!this.$refs.videoEls) return;
      this.$refs.videoEls.forEach((video, index) => {
        if (index !== this.currentIndex) {
          this.safePause(video);
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.video-slider {
  display: grid;
  gap: 16px;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f4f6ff 0%, #fef4ec 100%);
  border: 1px solid rgba(12, 16, 39, 0.08);
  box-shadow: 0 18px 40px rgba(12, 16, 39, 0.12);
  height: 100%;
  box-sizing: border-box;
}

.slider-viewport {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  background: #0c1027;
  width: 100%;
  aspect-ratio: 9 / 16;
  height: 100%;
  touch-action: pan-x;
}

.slider-track {
  display: flex;
  width: 100%;
  transition: transform 0.5s ease;
  flex-direction: column;
  height: 100%;
}

.slider-track.is-dragging {
  transition: none;
}

.slide {
  flex: 0 0 100%;
  height: 100%;
  position: relative;
  display: grid;
}

.slide--cta {
  background: #101116;
  place-items: center;
  gap: 12px;
}

.slide-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.caption {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 0.02em;
}

.cta-button {
  border: none;
  border-radius: 999px;
  padding: 14px 28px;
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #101116;
  background: #ffffff;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(16, 17, 22, 0.35);
}

.cta-mascot {
  width: min(160px, 60%);
  height: auto;
  display: block;
}

.cta-text {
  margin: 0;
  max-width: 340px;
  text-align: center;
  color: #101116;
  background: #ffffff;
  border-radius: 20px;
  padding: 12px 16px;
  font-size: 15px;
  line-height: 1.5;
}

.slider-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.nav-button {
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  background: #0c1027;
  color: #ffffff;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.nav-button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
  transform: none;
}

.nav-button:not(:disabled):hover {
  transform: translateY(-1px);
}

.dots {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  flex: 1;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: rgba(12, 16, 39, 0.2);
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.dot.active {
  background: #0c1027;
  transform: scale(1.2);
}

.empty-state {
  text-align: center;
  font-size: 14px;
  color: rgba(12, 16, 39, 0.6);
}

.video-slider.is-empty .slider-viewport,
.video-slider.is-empty .slider-controls {
  display: none;
}
</style>
