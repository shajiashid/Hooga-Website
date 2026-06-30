/* =========================================================
   Hooga — interactions
   ========================================================= */
(function () {
  "use strict";

  /* ---- Year ---- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header shadow ---- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 20);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Menu panel ---- */
  const menuBtn = document.getElementById("menuBtn");
  const panel = document.getElementById("menuPanel");
  const backdrop = document.getElementById("menuBackdrop");
  const menuClose = document.getElementById("menuClose");
  function setMenu(open) {
    menuBtn.classList.toggle("open", open);
    panel.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", () => setMenu(!panel.classList.contains("open")));
  backdrop.addEventListener("click", () => setMenu(false));
  if (menuClose) menuClose.addEventListener("click", () => setMenu(false));
  panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  // accordion: expand/collapse a group (Models, Support…)
  panel.querySelectorAll(".m-has-sub > .m-link").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".m-item");
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---- Model switcher (M1S / M1R) ---- */
  const MODELS = {
    M1S: { battery: "72v 70Ah", speed: "62 mph", range: "112 mi", power: "16kw",
           name: "the M1S", kicker: "The agile electric trail bike" },
    M1R: { battery: "84v 90Ah", speed: "75 mph", range: "134 mi", power: "21kw",
           name: "the M1R", kicker: "The flagship — more power, more range" },
  };
  const SPEC_KEYS = ["battery", "speed", "range", "power"];
  const segBtns = document.querySelectorAll(".seg-btn");
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /* ---- Banner text load-in: reveal hero kicker + title once the page paints ---- */
  const heroEl = document.querySelector(".hero");
  if (heroEl) {
    // Double rAF so the hidden initial state paints first, then the transition runs.
    requestAnimationFrame(() => requestAnimationFrame(() => heroEl.classList.add("loaded")));
  }

  // Smoothly count every number inside a value string, e.g. "72v 70Ah" -> "84v 90Ah".
  function animateSpec(el, toStr, fromStr, duration) {
    const numRe = /\d+(?:\.\d+)?/g;
    const toNums = (toStr.match(numRe) || []).map(Number);
    const fromNums = (fromStr != null ? (fromStr.match(numRe) || []) : []).map(Number);
    const parts = toStr.split(numRe); // text chunks around the numbers (template)
    const decimals = (toStr.match(numRe) || []).map((n) => (n.split(".")[1] || "").length);
    const build = (vals) => parts.reduce((s, p, i) => s + p + (i < vals.length ? vals[i] : ""), "");
    if (prefersReduce || !duration) { el.textContent = toStr; return; }
    if (el._raf) cancelAnimationFrame(el._raf);
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const e = easeOutCubic(t);
      const vals = toNums.map((to, i) => {
        const from = fromNums[i] != null ? fromNums[i] : 0;
        const v = from + (to - from) * e;
        return decimals[i] > 0 ? v.toFixed(decimals[i]) : Math.round(v);
      });
      el.textContent = build(vals);
      if (t < 1) { el._raf = requestAnimationFrame(step); }
      else { el.textContent = toStr; el._raf = null; }
    };
    el._raf = requestAnimationFrame(step);
  }

  function setSpec(key, value) {
    document.querySelectorAll('[data-spec="' + key + '"]').forEach((el) =>
      animateSpec(el, value, el.textContent, 700)
    );
  }
  const heroName = document.getElementById("heroModelName");
  const heroKicker = document.getElementById("heroKicker");
  const heroCenter = document.querySelector(".hero-center");
  function selectModel(key) {
    const m = MODELS[key];
    if (!m) return;
    segBtns.forEach((b) => {
      const active = b.dataset.model === key;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    SPEC_KEYS.forEach((k) => setSpec(k, m[k]));
    // swap hero image (crossfade + subtle zoom)
    document.querySelectorAll(".hero-img").forEach((img) =>
      img.classList.toggle("active", img.dataset.model === key)
    );
    // smooth text swap: fade out -> change -> fade in
    const swapText = () => {
      if (heroName) heroName.textContent = m.name;
      if (heroKicker) heroKicker.textContent = m.kicker;
    };
    if (heroCenter && !prefersReduce) {
      heroCenter.classList.add("switching");
      setTimeout(() => { swapText(); heroCenter.classList.remove("switching"); }, 260);
    } else {
      swapText();
    }
    const sel = document.getElementById("model");
    if (sel) sel.value = key;
  }
  segBtns.forEach((b) => b.addEventListener("click", () => selectModel(b.dataset.model)));

  // Count up from 0 when the spec bar first scrolls into view.
  const specsSection = document.getElementById("specs");
  if (specsSection && "IntersectionObserver" in window && !prefersReduce) {
    const specIO = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.querySelectorAll("[data-spec]").forEach((el) =>
          animateSpec(el, el.textContent, null, 1100)
        );
        obs.disconnect();
      });
    }, { threshold: 0.45 });
    specIO.observe(specsSection);
  }

  /* ---- Statement paragraph: prepare word-by-word rise (scroll-linked with the title) ---- */
  const stBody = document.querySelector(".statement-body");
  if (stBody) {
    const words = stBody.textContent.trim().split(/\s+/);
    stBody.textContent = "";
    const spans = words.map((word) => {
      const s = document.createElement("span");
      s.className = "rw";
      s.textContent = word;
      stBody.appendChild(s);
      stBody.appendChild(document.createTextNode(" "));
      return s;
    });
    if (!prefersReduce) spans.forEach((s, i) => (s.style.transitionDelay = i * 14 + "ms"));
    if (prefersReduce) stBody.classList.add("in");
  }

  /* ---- Statement title: scroll-linked reveal (Built Different first, then Proven Everywhere, then the paragraph) ---- */
  const stPin = document.querySelector(".statement-pin");
  const stLines = [...document.querySelectorAll(".statement-title .line")];
  const stWords = [...document.querySelectorAll(".statement-title .word")];
  const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  if (stPin && stWords.length && !prefersReduce) {
    // reveals are timed to the ON-SCREEN phase so each beat is actually seen:
    // beat 1 "Built Different." floats up as it enters; beat 2 "Proven Everywhere." once pinned
    const bands = [[0.28, 0.46], [0.58, 0.74]];
    stLines.forEach((line, li) => {
      const ws = [...line.querySelectorAll(".word")];
      const [bs, be] = bands[li] || [0, 1];
      ws.forEach((w, wi) => {
        const t0 = bs + (be - bs) * (wi / ws.length);
        const t1 = Math.min(t0 + (be - bs) * 0.85, be);
        w._win = [t0, t1];
      });
    });
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = stPin.getBoundingClientRect();
      const h = stPin.offsetHeight;
      const p = Math.min(Math.max((window.innerHeight - rect.top) / h, 0), 1);
      stWords.forEach((w) => {
        const o = smooth((p - w._win[0]) / (w._win[1] - w._win[0]));
        w.style.opacity = o.toFixed(3);
        w.style.transform = "translateY(" + (0.34 * (1 - o)).toFixed(3) + "em)";
      });
      // beat 3: description reveals once both lines are shown — scroll-linked so it
      // re-hides/re-reveals in sync with the title on every pass (no mismatch on re-scroll)
      if (stBody) stBody.classList.toggle("in", p >= 0.84);
    };
    const onScrollSt = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScrollSt, { passive: true });
    window.addEventListener("resize", onScrollSt, { passive: true });
    update();
  } else {
    stWords.forEach((w) => { w.style.opacity = "1"; w.style.transform = "none"; });
    if (stBody) stBody.classList.add("in");
  }

  /* ---- Reveal on scroll ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const sibs = [...e.target.parentElement.children];
            e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target) * 60, 280) + "ms";
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---- Feature cards: scroll-driven horizontal scroll (vertical scroll -> cards slide left) ---- */
  const gPin = document.getElementById("galleryPin");
  const gTrack = document.getElementById("galleryTrack");
  const gViewport = document.getElementById("galleryViewport");
  if (gPin && gTrack && gViewport) {
    const gSticky = document.querySelector(".gallery-sticky");
    const desktop = () => window.matchMedia("(min-width: 768px)").matches && !prefersReduce;
    let maxX = 0, topOff = 0, bufferPx = 0;
    let targetX = 0, currentX = 0, raf = 0, lastT = 0;

    const measure = () => {
      if (!desktop()) {
        gPin.style.height = ""; gTrack.style.transform = "";
        if (gSticky) { gSticky.style.top = ""; gSticky.style.height = ""; }
        maxX = 0; targetX = currentX = 0; return;
      }
      maxX = Math.max(0, gTrack.scrollWidth - gViewport.clientWidth);
      // Pin only as tall as the cards, but NEVER taller than the viewport, so the
      // exit after the last card is short and never exceeds one screen. Keep the
      // cards vertically centred with a computed offset.
      let stickyH = window.innerHeight;
      if (gSticky) {
        gSticky.style.height = "auto";
        stickyH = Math.min(gSticky.offsetHeight, window.innerHeight);
        gSticky.style.height = stickyH + "px";
        topOff = Math.max(0, (window.innerHeight - stickyH) / 2);
        gSticky.style.top = topOff + "px";
      } else {
        topOff = 0;
      }
      // Tiny dwell AFTER the 6th card finishes: just enough to register that the
      // last card landed, then it breaks cleanly into normal vertical scroll.
      // Keep this small (~one soft scroll) so it never feels like extra travel.
      bufferPx = Math.round(window.innerHeight * 0.08);
      gPin.style.height = stickyH + maxX + bufferPx + "px";
    };

    // Map scroll position -> horizontal target. Progress reaches 1 exactly when the
    // last card is fully in; the extra bufferPx of pin height below that is the hold.
    const computeTarget = () => {
      if (maxX <= 0) { targetX = 0; return; }
      const p = Math.min(Math.max((topOff - gPin.getBoundingClientRect().top) / maxX, 0), 1);
      targetX = -p * maxX;
    };

    // Continuous eased lerp toward the target -> buttery, momentum-like glide.
    // Exponential smoothing keyed to elapsed time stays identical at 60Hz or 120Hz.
    const render = (now) => {
      if (!lastT) lastT = now;
      const dt = Math.min(now - lastT, 50); lastT = now;
      const diff = targetX - currentX;
      if (Math.abs(diff) < 0.05) {
        currentX = targetX;
        gTrack.style.transform = "translate3d(" + currentX.toFixed(2) + "px,0,0)";
        raf = 0; lastT = 0; return; // settled — stop the loop until the next scroll
      }
      currentX += diff * (1 - Math.exp(-10 * dt / 1000)); // lower lambda = silkier
      gTrack.style.transform = "translate3d(" + currentX.toFixed(2) + "px,0,0)";
      raf = requestAnimationFrame(render);
    };
    const kick = () => { if (!raf) { lastT = 0; raf = requestAnimationFrame(render); } };
    const onScrollG = () => { computeTarget(); kick(); };

    measure(); computeTarget(); currentX = targetX;
    gTrack.style.transform = "translate3d(" + currentX.toFixed(2) + "px,0,0)";
    window.addEventListener("scroll", onScrollG, { passive: true });
    window.addEventListener("load", () => { measure(); computeTarget(); kick(); });
    let rsz;
    window.addEventListener("resize", () => { clearTimeout(rsz); rsz = setTimeout(() => { measure(); computeTarget(); kick(); }, 150); }, { passive: true });
  }

  /* ---- Comparison: accordion sections ---- */
  document.querySelectorAll(".cmp-sec-hd").forEach((hd) => {
    hd.addEventListener("click", () => hd.closest(".cmp-sec").classList.toggle("closed"));
  });

  /* ---- Play buttons -> toast (hero + menu "Our story") ---- */
  const play = document.getElementById("heroPlay");
  const story = document.getElementById("menuStory");
  const toast = document.getElementById("toast");
  let toastT;
  function showToast() {
    if (!toast) return;
    toast.classList.add("show");
    clearTimeout(toastT);
    toastT = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  if (play) play.addEventListener("click", showToast);
  if (story) story.addEventListener("click", () => { setMenu(false); setTimeout(showToast, 280); });

  /* ---- Reserve form ---- */
  const form = document.getElementById("reserveForm");
  const note = document.getElementById("formNote");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = form.name, email = form.email;
      const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      let ok = true;
      [name, email].forEach((el) => el.classList.remove("invalid"));
      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      if (!emailOk) { email.classList.add("invalid"); ok = false; }
      if (!ok) { note.textContent = "Please add your name and a valid email."; note.className = "form-note error"; return; }
      const first = name.value.trim().split(" ")[0];
      note.textContent = `🎉 You're in, ${first}! Your ${form.model.value} reservation is confirmed — check ${email.value.trim()}.`;
      note.className = "form-note success";
      const btn = form.querySelector('button[type="submit"]');
      btn.textContent = "Reserved ✓"; btn.disabled = true;
    });
  }

  /* ---- Footer reveal: subtle parallax drift on the pinned band image ---- */
  const band = document.getElementById("footerMark");
  const bandImg = document.querySelector("#footerBg img");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (band && bandImg && !reduceMotion) {
    bandImg.style.willChange = "transform";
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = band.getBoundingClientRect();
      const vh = window.innerHeight;
      // how much of the band is revealed (0 hidden -> 1 fully covering viewport bottom)
      const revealed = Math.min(Math.max((vh - rect.top) / rect.height, 0), 1);
      // ease the image up slightly as it reveals, for depth
      bandImg.style.transform = `scale(1.06) translateY(${((1 - revealed) * 22).toFixed(1)}px)`;
    };
    const onScrollP = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener("scroll", onScrollP, { passive: true });
    window.addEventListener("resize", onScrollP, { passive: true });
    update();
  }
})();
