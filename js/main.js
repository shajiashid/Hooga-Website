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

  /* ---- Slide menu ---- */
  const menuBtn = document.getElementById("menuBtn");
  const slidemenu = document.getElementById("slidemenu");
  const backdrop = document.getElementById("menuBackdrop");
  function setMenu(open) {
    menuBtn.classList.toggle("open", open);
    slidemenu.classList.toggle("open", open);
    backdrop.classList.toggle("show", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", () => setMenu(!slidemenu.classList.contains("open")));
  backdrop.addEventListener("click", () => setMenu(false));
  slidemenu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---- Model switcher (M1S / M1R) ---- */
  const MODELS = {
    M1S: { battery: "72v 70Ah", speed: "62 mph", range: "112 mi", power: "16kw" },
    M1R: { battery: "84v 90Ah", speed: "75 mph", range: "134 mi", power: "21kw" },
  };
  const segBtns = document.querySelectorAll(".seg-btn");
  const prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

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
  function selectModel(key) {
    const m = MODELS[key];
    if (!m) return;
    segBtns.forEach((b) => {
      const active = b.dataset.model === key;
      b.classList.toggle("active", active);
      b.setAttribute("aria-selected", String(active));
    });
    Object.keys(m).forEach((k) => setSpec(k, m[k]));
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

  /* ---- Gallery drag-to-scroll ---- */
  const track = document.getElementById("galleryTrack");
  if (track) {
    let down = false, startX = 0, startScroll = 0, moved = 0;
    track.addEventListener("pointerdown", (e) => {
      down = true; moved = 0; startX = e.clientX; startScroll = track.scrollLeft;
      track.classList.add("dragging");
    });
    track.addEventListener("pointermove", (e) => {
      if (!down) return;
      const dx = e.clientX - startX; moved = Math.abs(dx);
      track.scrollLeft = startScroll - dx;
    });
    const end = () => { down = false; track.classList.remove("dragging"); };
    track.addEventListener("pointerup", end);
    track.addEventListener("pointerleave", end);
    track.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", (e) => { if (moved > 6) e.preventDefault(); })
    );
  }

  /* ---- Dimensions: reveal flags on touch ---- */
  const dimStage = document.querySelector(".dim-stage");
  if (dimStage && window.matchMedia("(hover: none)").matches) dimStage.classList.add("show-flags");

  /* ---- Hero play -> toast ---- */
  const play = document.getElementById("heroPlay");
  const toast = document.getElementById("toast");
  let toastT;
  if (play && toast) {
    play.addEventListener("click", () => {
      toast.classList.add("show");
      clearTimeout(toastT);
      toastT = setTimeout(() => toast.classList.remove("show"), 2400);
    });
  }

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
