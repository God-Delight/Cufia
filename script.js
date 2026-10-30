/**
 * ==============================================================================
 * Cufia Consulting — Interactive & Motion Script
 * ==============================================================================
 * This script powers all interactive functionality across the Cufia homepage:
 *  1. Page Initialization (js-ready marker)
 *  2. Scroll-Triggered Reveal Animations (IntersectionObserver)
 *  3. Services Rail Carousel (Auto-play with pause on hover & manual controls)
 *  4. Dropdown & Mobile Menu Navigation Handlers (Click & Escape key)
 *  5. Scroll-Linked Interactive Sections:
 *     - Why Cufia: Native Sticky Card Stacking & Staggered Transitions
 *     - About Section: Progressive Word-by-Word Blur & Slide Cascade Heading
 * *  6. Hero Wireframe Wave: Real-time Harmonic Bézier Undulation Engine
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
  // Scoped to the homepage services section so other pages are unaffected.
  const rail = document.querySelector(".services-section .service-rail");
  if (!rail) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const AUTOPLAY_MS = 2000; // time each card stays in view
  const RESUME_MS = 3000; // wait after manual interaction before resuming

  function stepSize() {
    const card = rail.querySelector(".service-card");
    const gap = parseFloat(getComputedStyle(rail).columnGap) || 20;
    return card ? card.getBoundingClientRect().width + gap : rail.clientWidth / 3 + 20;
  }

  function move(direction) {
    rail.scrollBy({
      left: direction * stepSize(),
      behavior: reduced.matches ? "auto" : "smooth",
    });
  }

  // ----- Manual prev / next buttons -----
  document.querySelectorAll("[data-carousel]").forEach((btn) => {
    btn.addEventListener("click", () => {
      move(btn.dataset.carousel === "next" ? 1 : -1);
      holdTemporarily();
    });
  });

  // ----- Automatic carousel -----
  let autoTimer = null;
  let resumeTimer = null;
  let inView = true;
  let hovering = false;
  let focused = false;

  const playing = () => Boolean(autoTimer);

  function play() {
    if (reduced.matches || autoTimer || !inView) return;
    autoTimer = setInterval(() => {
      const maxScroll = rail.scrollWidth - rail.clientWidth - 2;
      if (rail.scrollLeft >= maxScroll) {
        rail.scrollTo({ left: 0, behavior: reduced.matches ? "auto" : "smooth" });
      } else {
        move(1);
      }
    }, AUTOPLAY_MS);
    updateToggle();
  }

  function pause() {
    clearInterval(autoTimer);
    autoTimer = null;
    updateToggle();
  }

  function holdTemporarily() {
    pause();
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      if (inView && !hovering && !focused) play();
    }, RESUME_MS);
  }

  // Pause while the reader hovers or focuses a card, resume afterwards
  rail.addEventListener("mouseenter", () => {
    hovering = true;
    pause();
  });
  rail.addEventListener("mouseleave", () => {
    hovering = false;
    if (!resumeTimer) play();
  });
  rail.addEventListener("focusin", () => {
    focused = true;
    pause();
  });
  rail.addEventListener("focusout", () => {
    focused = false;
    if (!resumeTimer) play();
  });
  rail.addEventListener("wheel", holdTemporarily, { passive: true });
  rail.addEventListener("touchstart", holdTemporarily, { passive: true });
  rail.addEventListener("pointerdown", holdTemporarily);

  // Don't advance while the section is off-screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inView = entry.isIntersecting;
          if (inView) play();
          else pause();
        });
      },
      { threshold: 0.25 },
    ).observe(rail);
  }

  // ----- Pause / play toggle button -----
  const toggle = document.querySelector("[data-autoplay-toggle]");
  const playIcon = toggle ? toggle.querySelector(".icon-play") : null;
  const pauseIcon = toggle ? toggle.querySelector(".icon-pause") : null;

  function updateToggle() {
    if (!toggle) return;
    const stopped = !playing();
    toggle.setAttribute(
      "aria-label",
      stopped ? "Start automatic carousel" : "Pause automatic carousel",
    );
    if (playIcon) playIcon.hidden = stopped;
    if (pauseIcon) pauseIcon.hidden = !stopped;
  }

  if (toggle) {
    toggle.addEventListener("click", () => (playing() ? pause() : play()));
  }

  reduced.addEventListener("change", () => (reduced.matches ? pause() : play()));

  if (!reduced.matches) play();
}
setupServicesCarousel();

/**
 * ------------------------------------------------------------------------------
 * 4. Floating Navbar & Accenture-Style Navigation Engine
 * ------------------------------------------------------------------------------
 */
function setupFloatingNavigation() {
  const navButtons = document.querySelectorAll(".cufia-nav-link-btn");
  const megaPanels = document.querySelectorAll(".cufia-megamenu-card");
  const dropdownContainer = document.querySelector(".cufia-megamenu-dropdown-container");
  const navCapsule = document.querySelector(".cufia-nav-capsule");
  let activeMenu = null;
  let closeTimer = null;

  function cancelClose() {
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
  }

  function scheduleClose() {
    cancelClose();
    closeTimer = setTimeout(() => {
      closeAllMenus();
    }, 280);
  }

  // Function to close all desktop dropdowns
  function closeAllMenus() {
    cancelClose();
    navButtons.forEach(btn => {
      btn.classList.remove("is-active");
      btn.setAttribute("aria-expanded", "false");
    });
    megaPanels.forEach(panel => {
      panel.classList.remove("is-open");
      panel.hidden = true;
    });
    if (dropdownContainer) {
      dropdownContainer.classList.remove("is-active");
    }
    activeMenu = null;
  }

  // Function to open specific dropdown
  function openMenu(menuKey) {
    cancelClose();
    navButtons.forEach(btn => {
      const match = btn.getAttribute("data-menu") === menuKey;
      btn.classList.toggle("is-active", match);
      btn.setAttribute("aria-expanded", match ? "true" : "false");
    });

    megaPanels.forEach(panel => {
      const match = panel.getAttribute("data-panel") === menuKey;
      if (match) {
        panel.hidden = false;
        void panel.offsetWidth; // Force layout
        panel.classList.add("is-open");
      } else {
        panel.classList.remove("is-open");
        panel.hidden = true;
      }
    });

    if (dropdownContainer) {
      dropdownContainer.classList.add("is-active");
    }
    activeMenu = menuKey;
  }

  // Nav buttons hover & click
  navButtons.forEach(btn => {
    const menuKey = btn.getAttribute("data-menu");

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      cancelClose();
      if (activeMenu === menuKey) {
        closeAllMenus();
      } else {
        openMenu(menuKey);
      }
    });

    btn.addEventListener("mouseenter", () => {
      if (window.innerWidth > 1024) {
        cancelClose();
        openMenu(menuKey);
      }
    });

    btn.addEventListener("mouseleave", () => {
      if (window.innerWidth > 1024) {
        scheduleClose();
      }
    });
  });

  // Keep open when cursor enters dropdown container or any panel
  if (dropdownContainer) {
    dropdownContainer.addEventListener("mouseenter", () => {
      if (window.innerWidth > 1024) {
        cancelClose();
      }
    });
    dropdownContainer.addEventListener("mouseleave", () => {
      if (window.innerWidth > 1024) {
        scheduleClose();
      }
    });
  }

  megaPanels.forEach(panel => {
    panel.addEventListener("mouseenter", () => {
      if (window.innerWidth > 1024) {
        cancelClose();
      }
    });
    panel.addEventListener("mouseleave", () => {
      if (window.innerWidth > 1024) {
        scheduleClose();
      }
    });
  });

  if (navCapsule) {
    navCapsule.addEventListener("mouseenter", () => {
      if (window.innerWidth > 1024 && activeMenu) {
        cancelClose();
      }
    });
    navCapsule.addEventListener("mouseleave", () => {
      if (window.innerWidth > 1024) {
        scheduleClose();
      }
    });
  }

  // Close menus when clicking outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".cufia-navbar-wrapper")) {
      closeAllMenus();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllMenus();
      closeMobileDrawer();
    }
  });

  // Close menu when clicking any link inside mega dropdown
  const dropdownLinks = document.querySelectorAll(".cufia-megamenu-card a");
  dropdownLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeAllMenus();
    });
  });


  // --- Services Mega Menu Tab Switching (Column 1 -> Column 2 & 3) ---
  const serviceTabs = document.querySelectorAll(".cufia-service-tab");
  const subpanels = document.querySelectorAll(".cufia-subpanel");
  const featureCards = document.querySelectorAll(".cufia-services-col3 .cufia-feature-card");

  function switchService(serviceKey) {
    serviceTabs.forEach(tab => {
      const match = tab.getAttribute("data-service-key") === serviceKey;
      tab.classList.toggle("active", match);
      tab.setAttribute("aria-selected", match ? "true" : "false");
    });

    subpanels.forEach(panel => {
      const match = panel.getAttribute("data-service-content") === serviceKey;
      panel.classList.toggle("active", match);
    });

    featureCards.forEach(card => {
      const match = card.getAttribute("data-feature-content") === serviceKey;
      card.classList.toggle("active", match);
    });
  }

  serviceTabs.forEach(tab => {
    tab.addEventListener("mouseenter", () => {
      const key = tab.getAttribute("data-service-key");
      switchService(key);
    });
    tab.addEventListener("click", (e) => {
      e.stopPropagation();
      const key = tab.getAttribute("data-service-key");
      switchService(key);
    });
  });

  // --- Mobile Drawer Accenture-Style Drilldown Navigation ---
  const mobileDrawer = document.getElementById("mobileDrawer");
  const mobileOpenBtn = document.getElementById("mobileMenuOpenBtn");
  const mobileCloseBtn = document.getElementById("mobileMenuCloseBtn");
  const mobileCloseBtn2 = document.getElementById("mobileMenuCloseBtn2");
  const mobileBackBtn = document.getElementById("mobileMenuBackBtn");
  const mobileBackdrop = document.getElementById("mobileBackdrop");
  const mobileTrackWrapper = document.getElementById("mobileTrackWrapper");
  const mobileDrilldownTitle = document.getElementById("mobileDrilldownTitle");
  const mobileDrilldownContent = document.getElementById("mobileDrilldownContent");

  const mobileData = {
    services: {
      title: "Services",
      items: [
        {
          name: "AI Transformation",
          subs: ["AI Readiness Assessment", "AI Governance & Ethics", "AI Use-Case Discovery", "AI Use-Case Deployment", "Enterprise AI Transformation Strategy"],
          target: "#service-0"
        },
        {
          name: "Training",
          subs: ["AI Board Training", "AI Executive Training", "Skills Development Training", "Leadership & Management Training"],
          target: "#service-1"
        },
        {
          name: "Digital Transformation",
          subs: ["Digital Strategy", "Digital Operating Model", "Products & Platforms Digitalisation", "Customer Experience (CX)", "Technology Transformation"],
          target: "#service-2"
        },
        {
          name: "Operational Excellence",
          subs: ["Process Transformation", "Operating Model Transformation", "Performance & Productivity", "Process Automation", "Continuous Improvement"],
          target: "#service-4"
        },
        {
          name: "Strategy Advisory",
          subs: ["Corporate & Business Strategy", "Growth & Market Entry", "Customer Strategy", "Innovation Strategy", "Strategy Implementation"],
          target: "#service-3"
        },
        {
          name: "Data & Cloud Transformation",
          subs: ["Data Strategy", "Data Governance", "Analytics & BI", "Cloud Strategy", "Cloud Migration & Modernisation", "Data & AI Infrastructure"],
          target: "#service-5"
        },
        {
          name: "Product Management",
          subs: ["Product Strategy", "Product Discovery", "Digital Product Development", "Product Operating Model", "Product Leadership Support"],
          target: "#service-6"
        },
        {
          name: "Project Management",
          subs: ["Portfolio & PMO Set-up", "Programme & Project Delivery", "Agile Transformation", "Project Recovery", "Benefits Realisation"],
          target: "#service-7"
        }
      ]
    },
    industries: {
      title: "Industries",
      items: [
        {
          name: "Financial Services",
          subs: ["Core Banking Modernisation", "Fintech Integration", "Risk & AML Frameworks"],
          target: "#industries"
        },
        {
          name: "Capital Markets",
          subs: ["Trading Architecture", "Clearing & Settlements", "Market Surveillance"],
          target: "#industries"
        },
        {
          name: "Legal & Professional",
          subs: ["Contract Automation", "Knowledge Management", "AI Compliance"],
          target: "#industries"
        },
        {
          name: "Technology & SaaS",
          subs: ["Platform Scaling", "Cloud Economics", "Product Operating Model"],
          target: "#industries"
        },
        {
          name: "Energy & Utilities",
          subs: ["Grid Modernisation", "Asset Performance", "Decarbonisation Strategy"],
          target: "#industries"
        },
        {
          name: "Manufacturing & Logistics",
          subs: ["Supply Chain Resilience", "Smart Factory IoT", "Inventory Intelligence"],
          target: "#industries"
        },
        {
          name: "Public Sector & NGOs",
          subs: ["Citizen Service Delivery", "Public Sector Modernisation", "Impact Measurement"],
          target: "#industries"
        }
      ]
    },
    insights: {
      title: "Insights",
      items: [
        {
          name: "Case Studies",
          subs: ["Transformation in Africa Series", "Tier-1 Bank AI Deployment", "Public Sector Digital Modernisation"],
          target: "#case-studies"
        },
        {
          name: "Articles & Perspectives",
          subs: ["The AI-Ready Enterprise in 2026", "Bridging Strategy & Board Governance", "Cloud Migration Pitfalls & Playbooks"],
          target: "#insights"
        }
      ]
    },
    about: {
      title: "About Us",
      items: [
        {
          name: "Who We Are",
          subs: ["Our Story & Purpose", "Core Values", "Global Footprint"],
          target: "#about"
        },
        {
          name: "Our Team & Expert Council",
          subs: ["Council Fellows", "Senior Practitioners", "Advisory Roster"],
          target: "#about"
        },
        {
          name: "Careers",
          subs: ["Join the Expert Council", "Consulting Opportunities", "Engagement Models"],
          target: "#contact"
        }
      ]
    }
  };

  function openMobileDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.add("is-open");
      mobileDrawer.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      if (mobileTrackWrapper) {
        mobileTrackWrapper.classList.remove("is-drilldown");
      }
    }
  }

  function closeMobileDrawer() {
    if (mobileDrawer) {
      mobileDrawer.classList.remove("is-open");
      mobileDrawer.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (mobileTrackWrapper) {
        mobileTrackWrapper.classList.remove("is-drilldown");
      }
    }
  }

  function renderDrilldown(sectionKey) {
    const data = mobileData[sectionKey];
    if (!data || !mobileDrilldownContent || !mobileDrilldownTitle) return;

    mobileDrilldownTitle.textContent = data.title;
    mobileDrilldownContent.innerHTML = "";

    data.items.forEach((item, idx) => {
      const acc = document.createElement("div");
      acc.className = "cufia-mobile-accordion";

      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "cufia-mobile-acc-trigger";
      trigger.innerHTML = `<span>${item.name}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m6 9 6 6 6-6"/></svg>`;

      const content = document.createElement("div");
      content.className = "cufia-mobile-acc-content";

      item.subs.forEach(sub => {
        const link = document.createElement("a");
        link.href = item.target;
        link.textContent = sub;
        link.addEventListener("click", () => {
          closeMobileDrawer();
        });
        content.appendChild(link);
      });

      trigger.addEventListener("click", () => {
        const isOpen = acc.classList.contains("is-open");
        // Close other accordions in this view
        mobileDrilldownContent.querySelectorAll(".cufia-mobile-accordion").forEach(a => a.classList.remove("is-open"));
        if (!isOpen) {
          acc.classList.add("is-open");
        }
      });

      acc.appendChild(trigger);
      acc.appendChild(content);
      mobileDrilldownContent.appendChild(acc);
    });

    if (mobileTrackWrapper) {
      mobileTrackWrapper.classList.add("is-drilldown");
    }
  }

  if (mobileOpenBtn) {
    mobileOpenBtn.addEventListener("click", openMobileDrawer);
  }
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener("click", closeMobileDrawer);
  }
  if (mobileCloseBtn2) {
    mobileCloseBtn2.addEventListener("click", closeMobileDrawer);
  }
  if (mobileBackdrop) {
    mobileBackdrop.addEventListener("click", closeMobileDrawer);
  }
  if (mobileBackBtn) {
    mobileBackBtn.addEventListener("click", () => {
      if (mobileTrackWrapper) {
        mobileTrackWrapper.classList.remove("is-drilldown");
      }
    });
  }

  // Drilldown level-1 buttons
  const drilldownButtons = document.querySelectorAll("[data-drilldown]");
  drilldownButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const section = btn.getAttribute("data-drilldown");
      renderDrilldown(section);
    });
  });

  // Close mobile drawer on clicking any regular anchor inside
  const mobileLinks = document.querySelectorAll(".cufia-mobile-secondary-links a, .cufia-mobile-cta-btn");
  mobileLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMobileDrawer();
    });
  });
}

setupFloatingNavigation();

/**
 * ------------------------------------------------------------------------------
 * 5. Scroll-Linked Interactive Sections
 *    - Why Cufia: Sticky stage & track card progression
 *    - About Section: Progressive blur & slide cascade heading
 * ------------------------------------------------------------------------------
 */
function setupCufiaScrollMotion(root) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const words = Array.from(root.querySelectorAll(".cascade-word"));
  const heading = root.querySelector(".cascade-heading");
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
 * 5b. Our Values: Connoisseur Stack Interactor
 *     Hover (desktop), tap (touch) or focus (keyboard) a value and its photo is
 *     revealed through animated clip-path shapes that grow in, breathe, shrink
 *     away and loop. Needs GSAP (loaded in index.html); without it the photo
 *     simply swaps with no animation.
 * ------------------------------------------------------------------------------
 */
function setupValuesStack() {
  const list = document.querySelector(".values-list");
  const image = document.getElementById("values-image");
  const group = document.getElementById("values-clip-group");
  if (!list || !image || !group) return;

  const items = Array.from(list.querySelectorAll(".value-item"));
  const panels = Array.from(document.querySelectorAll(".values-detail .value-panel"));
  const triggers = items.map((item) => item.querySelector(".value-trigger"));
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hasGsap = typeof window.gsap !== "undefined";

  let activeIndex = 0;
  let timeline = null;
  let visible = true;

  // Preload every photo so switching never flashes
  items.forEach((item) => {
    const img = new Image();
    img.src = item.dataset.image;
  });

  function createLoop(index) {
    const { image: src, clip, fit } = items[index].dataset;
    const selector = `#${clip} .path`;

    if (timeline) timeline.kill();

    image.setAttribute("href", src);
    // data-fit="full" shows the whole photo under the shapes; "fill" crops it to fill the square
    image.setAttribute("preserveAspectRatio", fit === "fill" ? "xMidYMid slice" : "xMidYMid meet");
    group.setAttribute("clip-path", `url(#${clip})`);

    if (!hasGsap || reduced.matches) {
      // No animation: show the shapes at full size
      if (hasGsap) window.gsap.set(selector, { scale: 1, transformOrigin: "50% 50%" });
      return;
    }

    const gsap = window.gsap;
    gsap.set(selector, { scale: 0, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });

    // 1. IN (expo out)
    tl.to(selector, {
      scale: 1,
      duration: 0.8,
      stagger: { amount: 0.4, from: "random" },
      ease: "expo.out",
    })
      // 2. IDLE (sine breath)
      .to(selector, {
        scale: 1.05,
        duration: 1.5,
        yoyo: true,
        repeat: 1,
        ease: "sine.inOut",
        stagger: { amount: 0.2, from: "center" },
      })
      // 3. OUT (expo in)
      .to(selector, {
        scale: 0,
        duration: 0.6,
        stagger: { amount: 0.3, from: "edges" },
        ease: "expo.in",
      });

    if (!visible) tl.pause();
    timeline = tl;
  }

  function activate(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    items.forEach((item, i) => {
      const on = i === index;
      item.classList.toggle("is-active", on);
      triggers[i].setAttribute("aria-expanded", String(on));
    });
    panels.forEach((panel, i) => panel.classList.toggle("is-active", i === index));
    createLoop(index);
  }

  items.forEach((item, i) => {
    item.addEventListener("mouseenter", () => {
      if (canHover.matches) activate(i);
    });
    triggers[i].addEventListener("click", () => activate(i));
    triggers[i].addEventListener("focus", () => activate(i));
  });

  // Up / Down arrows move between values
  list.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    const current = triggers.indexOf(document.activeElement);
    if (current === -1) return;
    e.preventDefault();
    const step = e.key === "ArrowDown" ? 1 : -1;
    triggers[(current + step + triggers.length) % triggers.length].focus();
  });

  // Pause the loop while the section is off-screen
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (!timeline) return;
        if (visible) timeline.play();
        else timeline.pause();
      },
      { threshold: 0.05 },
    ).observe(document.querySelector(".values-media"));
  }

  reduced.addEventListener("change", () => createLoop(activeIndex));

  createLoop(0);
}
setupValuesStack();

/**
 * ------------------------------------------------------------------------------
 * 6. Hero Wireframe Wave: Harmonic Bézier Undulation Engine
 * ------------------------------------------------------------------------------
 */
function setupHeroWaveMotion() {
  const svg = document.querySelector(".hero-section > svg.waves, .svc-hero > svg.waves");
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

/**
 * ------------------------------------------------------------------------------
 * 7. Services Page: Testimonials Carousel (runs only where the rail exists)
 * ------------------------------------------------------------------------------
 */
function setupTestimonialsCarousel() {
  const rail = document.querySelector(".svc-testimonial-rail");
  if (!rail) return;
  document.querySelectorAll("[data-testimonial]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const card = rail.querySelector(".svc-testimonial");
      const step = card ? card.getBoundingClientRect().width + 30 : rail.clientWidth;
      rail.scrollBy({ left: step * Number(btn.dataset.testimonial), behavior: "smooth" });
    });
  });
}
setupTestimonialsCarousel();
