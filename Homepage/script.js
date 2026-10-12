/**
 * ==============================================================================
 * Cufia Consulting — Interactive & Motion Script
 * ==============================================================================
 * This script powers all interactive functionality across the Cufia homepage:
 *  1. Page Initialization (js-ready marker)
 *  2. Scroll-Triggered Reveal Animations (IntersectionObserver)
 *  3. Services Rail Carousel (Smooth horizontal scrolling)
 *  4. Dropdown & Mobile Menu Navigation Handlers (Click & Escape key)
 *  5. Scroll-Linked Interactive Sections:
 *     - Why Cufia: Native Sticky Card Stacking & Staggered Transitions
 *     - About Section: Progressive Word-by-Word Blur & Slide Cascade Heading
 *     - Our Approach: Responsive Card Split & Central Photo Reveal
 *  6. Hero Wireframe Wave: Real-time Harmonic Bézier Undulation Engine
 * ==============================================================================
 */

/**
 * ------------------------------------------------------------------------------
 * 1. Page Initialization
 * ------------------------------------------------------------------------------
 */
document.documentElement.classList.add("js-ready");
/**
 * ------------------------------------------------------------------------------
 * 2. Staggered Scroll-Triggered Reveal Animations
 * ------------------------------------------------------------------------------
 */
function setupScrollReveal() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;
  const revealElements = document.querySelectorAll(
    ".reveal-item, .reveal-zoom, .reveal-fade",
  );
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );
  revealElements.forEach((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.92) {
      requestAnimationFrame(() => el.classList.add("is-revealed"));
    } else {
      observer.observe(el);
    }
  });
}
setupScrollReveal();
/**
 * ------------------------------------------------------------------------------
 * 3. Services Rail Carousel Navigation
 * ------------------------------------------------------------------------------
 */
function setupServicesCarousel() {
  const carouselButtons = document.querySelectorAll("[data-carousel]");
  const rail = document.querySelector(".service-rail");
  if (!rail) return;

  carouselButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const direction = btn.dataset.carousel === "next" ? 1 : -1;
      const scrollOffset = direction * (rail.clientWidth / 3 + 20);
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      rail.scrollBy({
        left: scrollOffset,
        behavior: isReduced ? "auto" : "smooth",
      });
    });
  });
}
setupServicesCarousel();

/**
 * ------------------------------------------------------------------------------
 * 4. Dropdown & Mobile Navigation Menu Controls
 * ------------------------------------------------------------------------------
 */
function setupNavigationMenus() {
  const menuLinks = document.querySelectorAll(".services-dropdown a, .mobile-menu a");
  const menus = document.querySelectorAll(".services-menu, .mobile-menu");

  // Close menus when a link is clicked
  menuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      menus.forEach((menu) => (menu.open = false));
    });
  });

  // Close menus when Escape key is pressed
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      menus.forEach((menu) => (menu.open = false));
    }
  });
}
setupNavigationMenus();
/**
 * ------------------------------------------------------------------------------
 * 5. Scroll-Linked Interactive Sections
 *    - Why Cufia: Sticky stage & track card progression
 *    - About Section: Progressive blur & slide cascade heading
 *    - Our Approach: Interactive stack split & center photo reveal
 * ------------------------------------------------------------------------------
 */
function setupCufiaScrollMotion(root) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const words = Array.from(root.querySelectorAll(".cascade-word"));
  const heading = root.querySelector(".cascade-heading");
  const section = root.querySelector(".values-section");
  const grid = root.querySelector(".values-grid");
  const cards = Array.from(root.querySelectorAll(".value-stack article"));
  const photo = root.querySelector(".values-photo");
  const advantage = root.querySelector(".advantage-section");
  const stage = root.querySelector(".advantage-layout");
  const tracks = Array.from(root.querySelectorAll(".advantage-track"));
  let frame = 0;
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const mix = (a, b, p) => a + (b - a) * p;
  function update() {
    frame = 0;
    if (advantage && stage) {
      const bounds = advantage.getBoundingClientRect();
      const distance = Math.max(1, advantage.offsetHeight - window.innerHeight);
      const progress = clamp(-bounds.top / distance);
      const staticLayout = reduced.matches || window.innerWidth <= 700;
      stage.style.transform = "";
      tracks.forEach((track, i) => {
        track.style.transform = "";
        const cardsInTrack = Array.from(
          track.querySelectorAll(".advantage-card"),
        );
        cardsInTrack.forEach((card, index) => {
          if (staticLayout) {
            card.style.transform = "";
            card.style.opacity = "";
            card.style.visibility = "";
            return;
          }
          const height = stage.offsetHeight;
          const target = i
            ? height - card.offsetHeight - height * 0.08
            : height * 0.08;
          const stagger = i ? 0.03 : 0.0;
          if (index === 0) {
            const enter = clamp((progress - stagger) / 0.18);
            const exit = clamp((progress - (0.42 + stagger)) / 0.18);
            const smoothEnter = enter * enter * (3 - 2 * enter);
            const smoothExit = exit * exit * (3 - 2 * exit);
            const enterY = mix(height * 0.6, target, smoothEnter);
            const exitY = smoothExit * (target + card.offsetHeight + 40);
            const pos = enterY - exitY;
            const op = clamp(enter * 2.0) * (1.0 - smoothExit);
            card.style.opacity = String(op);
            card.style.visibility = op > 0.01 ? "visible" : "hidden";
            card.style.transform = `translateY(${pos}px)`;
          } else {
            const enter = clamp((progress - (0.46 + stagger)) / 0.18);
            const smoothEnter = enter * enter * (3 - 2 * enter);
            const enterY = mix(height * 0.65, target, smoothEnter);
            const op = clamp(enter * 1.5);
            card.style.opacity = String(op);
            card.style.visibility = op > 0.01 ? "visible" : "hidden";
            card.style.transform = `translateY(${enterY}px)`;
          }
        });
      });
    }
    if (heading) {
      const box = heading.getBoundingClientRect();
      const progress = reduced.matches
        ? 1
        : clamp(
            (window.innerHeight * 0.9 - box.top) / (window.innerHeight * 0.46),
          );
      words.forEach((word, i) => {
        const p = clamp(progress * 2.3 - (i / words.length) * 1.3);
        const smoothP = p * p * (3 - 2 * p);
        word.style.opacity = String(mix(0.08, 1, smoothP));
        word.style.transform = `translateY(${(1 - smoothP) * 36}px)`;
        word.style.filter = `blur(${(1 - smoothP) * 4}px)`;
      });
    }
    if (!section || !grid || !photo || cards.length !== 4) return;
    const box = grid.getBoundingClientRect();
    const raw = reduced.matches
      ? 1
      : clamp(
          (window.innerHeight * 0.92 - box.top) / (window.innerHeight * 0.45),
        );
    const p = raw * raw * (3 - 2 * raw);
    const width = grid.clientWidth;
    const mobile = window.innerWidth <= 700;
    const gap = mobile ? 12 : 16;
    const startW = mobile ? (width - gap) / 2 : (width - gap * 3) / 4;
    const endW = mobile ? startW : ((width - gap * 2) * 1.15) / 3.3;
    const centerW = width - endW * 2 - gap * 2;
    const cardH = Math.max(230, ...cards.map((card) => card.scrollHeight));
    const totalH = mobile ? cardH * 2 + gap + 350 + gap : cardH * 2 + gap;
    const stackProgress = clamp(p / 0.45);
    const splitProgress = clamp((p - 0.45) / 0.55);
    grid.style.height = `${totalH}px`;
    cards.forEach((card, i) => {
      const startX = mobile ? (i % 2) * (startW + gap) : i * (startW + gap);
      const startY = mobile
        ? Math.floor(i / 2) * (cardH + gap)
        : (totalH - cardH) / 2;
      const endX = i < 2 ? 0 : width - endW;
      const endY = (i % 2) * (cardH + gap);
      card.style.width = `${mix(startW, endW, splitProgress)}px`;
      card.style.minHeight = `${cardH}px`;
      card.style.transform = `translate(${mix(startX, endX, mobile ? p : splitProgress)}px, ${mix(startY, endY, mobile ? p : stackProgress)}px)`;
    });
    photo.style.width = `${mobile ? width : centerW}px`;
    photo.style.height = `${mobile ? 350 : totalH}px`;
    photo.style.left = `${mobile ? 0 : endW + gap}px`;
    photo.style.top = `${mobile ? cardH * 2 + gap * 2 : 0}px`;
    photo.style.opacity = String(splitProgress);
    photo.style.transform = `translateY(${(1 - p) * 45}px) scale(${mix(0.78, 1, p)})`;
    grid.classList.add("motion-ready");
  }
  function requestUpdate() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }
  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  reduced.addEventListener("change", requestUpdate);
  update();
  return () => {
    window.cancelAnimationFrame(frame);
    window.removeEventListener("scroll", requestUpdate);
    window.removeEventListener("resize", requestUpdate);
    reduced.removeEventListener("change", requestUpdate);
  };
}

setupCufiaScrollMotion(document.querySelector(".cufia-page"));

/**
 * ------------------------------------------------------------------------------
 * 6. Hero Wireframe Wave: Harmonic Bézier Undulation Engine
 * ------------------------------------------------------------------------------
 */
function setupHeroWaveMotion() {
  const svg = document.querySelector(".hero-section > svg.waves");
  if (!svg) return;
  const paths = Array.from(svg.querySelectorAll("path"));
  if (!paths.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (reducedMotion.matches) return;

  // Cache base curves from the original SVG paths
  // Base pattern: M -100 (65 + i*10) C 300 (-15 + i*15), 540 (370 + i*7), 850 (200 + i*9) S 1330 (20 + i*8), 1700 (70 + i*13)
  const baseCurves = paths.map((p, i) => {
    return {
      el: p,
      i: i,
      mY: 65 + i * 10,
      c1Y: -15 + i * 15,
      c2Y: 370 + i * 7,
      cY: 200 + i * 9,
      s1Y: 20 + i * 8,
      sY: 70 + i * 13,
    };
  });

  let rafId = null;
  let isVisible = true;
  let startTime = performance.now();

  function render(now) {
    if (!isVisible) {
      rafId = null;
      return;
    }
    const elapsed = (now - startTime) * 0.001; // seconds

    for (let k = 0; k < baseCurves.length; k++) {
      const c = baseCurves[k];
      const ribbonPhase = c.i * 0.16;

      // Harmonic undulating wave equations traveling left-to-right
      const wave1 = Math.sin(elapsed * 1.05 - ribbonPhase) * 16;
      const wave2 = Math.cos(elapsed * 0.85 - ribbonPhase * 1.3) * 22;
      const wave3 = Math.sin(elapsed * 1.25 - ribbonPhase * 0.9 + 1.2) * 19;
      const wave4 = Math.cos(elapsed * 0.95 - ribbonPhase * 1.1 + 0.6) * 14;
      const wave5 = Math.sin(elapsed * 0.75 - ribbonPhase * 0.7 + 2.0) * 18;

      const ym = (c.mY + wave1 * 0.45).toFixed(1);
      const yc1 = (c.c1Y + wave2 * 0.85).toFixed(1);
      const yc2 = (c.c2Y + wave3 * 0.95).toFixed(1);
      const yc = (c.cY + wave1 * 0.75).toFixed(1);
      const ys1 = (c.s1Y + wave4 * 0.85).toFixed(1);
      const ys = (c.sY + wave5 * 0.6).toFixed(1);

      c.el.setAttribute(
        "d",
        `M -100 ${ym} C 300 ${yc1}, 540 ${yc2}, 850 ${yc} S 1330 ${ys1}, 1700 ${ys}`,
      );
    }

    rafId = requestAnimationFrame(render);
  }

  function start() {
    if (!rafId && isVisible && !reducedMotion.matches) {
      startTime = performance.now();
      rafId = requestAnimationFrame(render);
    }
  }

  function stop() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Optimize performance: pause whenever the hero is scrolled out of view
  const heroSection = svg.closest(".hero-section") || svg;
  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            start();
          } else {
            stop();
          }
        });
      },
      { threshold: 0.05 },
    );
    heroObserver.observe(heroSection);
  } else {
    start();
  }

  reducedMotion.addEventListener("change", () => {
    if (reducedMotion.matches) {
      stop();
      // Restore initial positions
      baseCurves.forEach((c) => {
        c.el.setAttribute(
          "d",
          `M -100 ${c.mY} C 300 ${c.c1Y}, 540 ${c.c2Y}, 850 ${c.cY} S 1330 ${c.s1Y}, 1700 ${c.sY}`,
        );
      });
    } else {
      start();
    }
  });
}
setupHeroWaveMotion();
