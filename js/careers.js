/* =========================================================
   Hooga — Careers page interactions
   (self-contained; does not depend on main.js)
   ========================================================= */
(function () {
  "use strict";
  var prefersReduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Year ---- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Sticky header shadow ---- */
  var header = document.getElementById("header");
  if (header) {
    var onHeaderScroll = function () { header.classList.toggle("scrolled", window.scrollY > 20); };
    window.addEventListener("scroll", onHeaderScroll, { passive: true });
    onHeaderScroll();
  }

  /* ---- Menu panel (open/close + accordion) ---- */
  var menuBtn = document.getElementById("menuBtn");
  var panel = document.getElementById("menuPanel");
  var backdrop = document.getElementById("menuBackdrop");
  var menuClose = document.getElementById("menuClose");
  if (menuBtn && panel && backdrop) {
    var setMenu = function (open) {
      menuBtn.classList.toggle("open", open);
      panel.classList.toggle("open", open);
      backdrop.classList.toggle("show", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      document.body.style.overflow = open ? "hidden" : "";
    };
    menuBtn.addEventListener("click", function () { setMenu(!panel.classList.contains("open")); });
    backdrop.addEventListener("click", function () { setMenu(false); });
    if (menuClose) menuClose.addEventListener("click", function () { setMenu(false); });
    panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    window.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
    panel.querySelectorAll(".m-has-sub > .m-link").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var item = btn.closest(".m-item");
        var open = item.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(open));
      });
    });
  }

  /* ---- Reveal-on-scroll ---- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---- Banner load-in ---- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { document.body.classList.add("loaded"); }); });

  /* ---- Hero stat count-up (e.g. 0 -> 9, 0 -> 100%) ---- */
  (function () {
    var stats = document.querySelector(".cr-stats");
    var nums = document.querySelectorAll(".cr-stat .n");
    if (!stats || !nums.length) return;
    var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };

    function animate(el, target, suffix, original) {
      var duration = 1300, start = null;
      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        el.textContent = Math.round(easeOutCubic(p) * target).toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = original; // land on the exact authored value
      };
      requestAnimationFrame(step);
    }

    var started = false;
    function kick() {
      if (started) return; started = true;
      nums.forEach(function (el, i) {
        var original = el.textContent.trim();
        var m = original.match(/^(\d[\d,]*)(.*)$/);
        if (!m) return;                                  // not a number — leave as-is
        if (prefersReduce) return;                       // honour reduced motion
        var target = parseInt(m[1].replace(/,/g, ""), 10);
        var suffix = m[2] || "";
        el.textContent = "0" + suffix;                   // reset now (still hidden during fade-in)
        setTimeout(function () { animate(el, target, suffix, original); }, 360 + i * 110);
      });
    }

    if ("IntersectionObserver" in window && !prefersReduce) {
      var ioS = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { kick(); ioS.disconnect(); } });
      }, { threshold: 0.45 });
      ioS.observe(stats);
    } else {
      kick();
    }
  })();

  /* ---- Footer reveal parallax ---- */
  var band = document.getElementById("footerMark");
  var bandImg = document.querySelector("#footerBg img");
  if (band && bandImg && !prefersReduce) {
    bandImg.style.willChange = "transform";
    var tickingP = false;
    var updateP = function () {
      tickingP = false;
      var rect = band.getBoundingClientRect();
      var revealed = Math.min(Math.max((window.innerHeight - rect.top) / rect.height, 0), 1);
      bandImg.style.transform = "scale(1.06) translateY(" + ((1 - revealed) * 22).toFixed(1) + "px)";
    };
    var onScrollP = function () { if (!tickingP) { tickingP = true; requestAnimationFrame(updateP); } };
    window.addEventListener("scroll", onScrollP, { passive: true });
    window.addEventListener("resize", onScrollP, { passive: true });
    updateP();
  }

  /* =========================================================
     Careers: roles data, filtering, expand, apply flow
     ========================================================= */
  var JOBS = [
    {
      id: "powertrain-engineer",
      title: "Senior Powertrain Engineer",
      dept: "Engineering", location: "Bengaluru", type: "Full-time",
      blurb: "Own the mid-mount motor and drivetrain that give every Hooga its instant, gearless torque.",
      responsibilities: [
        "Lead design and validation of the mid-mount motor and gear reduction system.",
        "Tune torque delivery and thermal behaviour across the M1S and M1R platforms.",
        "Partner with controls and battery teams to hit range and performance targets.",
        "Drive supplier selection and design-for-manufacture from prototype to production."
      ],
      requirements: [
        "7+ years in EV or automotive powertrain development.",
        "Deep knowledge of PMSM motors, reduction drives, and thermal management.",
        "Hands-on bench and on-vehicle validation experience.",
        "Comfortable owning specs end-to-end in a fast-moving team."
      ]
    },
    {
      id: "battery-systems",
      title: "Battery Systems Engineer",
      dept: "Engineering", location: "Bengaluru", type: "Full-time",
      blurb: "Design the high-density pack and BMS that push every charge past 112 miles.",
      responsibilities: [
        "Architect cell selection, module layout, and pack mechanical design.",
        "Develop BMS strategy for balancing, safety, and state-of-charge accuracy.",
        "Run abuse, thermal, and cycle-life testing to certify pack safety.",
        "Optimise for fast charging without compromising longevity."
      ],
      requirements: [
        "5+ years in Li-ion pack or BMS engineering.",
        "Strong grasp of cell chemistry, thermal runaway mitigation, and safety standards.",
        "Experience with pack-level CAD and FEA.",
        "Familiarity with relevant homologation and transport regulations."
      ]
    },
    {
      id: "embedded-firmware",
      title: "Embedded Firmware Engineer",
      dept: "Engineering", location: "Remote (India)", type: "Full-time",
      blurb: "Write the firmware behind ride modes, the TFT display, and over-the-air updates.",
      responsibilities: [
        "Build and maintain firmware for vehicle control units on the CAN bus.",
        "Implement ride modes, diagnostics, and the OTA update pipeline.",
        "Collaborate with the app team on connected-vehicle features.",
        "Profile and harden firmware for reliability in the field."
      ],
      requirements: [
        "4+ years of embedded C/C++ on ARM Cortex-M.",
        "Solid experience with RTOS, CAN, and low-level peripherals.",
        "Bonus: Rust, secure boot, or automotive (ISO 26262) exposure.",
        "Self-driven and comfortable owning modules independently."
      ]
    },
    {
      id: "industrial-designer",
      title: "Industrial Designer",
      dept: "Design", location: "Bengaluru", type: "Full-time",
      blurb: "Shape the silhouette, stance, and surfaces that make a Hooga unmistakable.",
      responsibilities: [
        "Develop form language across sketches, CAD, and physical models.",
        "Balance aesthetics with ergonomics, aero, and manufacturability.",
        "Work closely with engineering through to tooling and finish.",
        "Define materials, colours, and finishes for each model line."
      ],
      requirements: [
        "5+ years in industrial or transportation design.",
        "Strong portfolio spanning sketch to production-ready surfaces.",
        "Fluency in Alias, Gravity Sketch, or equivalent.",
        "A point of view on what makes a machine feel alive."
      ]
    },
    {
      id: "brand-motion-designer",
      title: "Brand & Motion Designer",
      dept: "Design", location: "Remote", type: "Contract",
      blurb: "Bring the Hooga brand to life across film, web, and launch moments.",
      responsibilities: [
        "Design motion systems for launches, social, and the website.",
        "Own brand consistency across every touchpoint.",
        "Collaborate with marketing on campaigns and product films.",
        "Prototype interaction and scroll-driven web moments."
      ],
      requirements: [
        "4+ years in brand and motion design.",
        "Mastery of After Effects and modern web animation.",
        "A reel that shows restraint and craft.",
        "Comfortable working async across a distributed team."
      ]
    },
    {
      id: "ride-experience-lead",
      title: "Ride Experience Lead",
      dept: "Product", location: "Bengaluru", type: "Full-time",
      blurb: "Define how a Hooga feels from the first twist of the throttle to the last mile.",
      responsibilities: [
        "Own the end-to-end ride and ownership experience roadmap.",
        "Translate rider insight into product requirements.",
        "Coordinate engineering, design, and service around the rider.",
        "Run ride programs and synthesise feedback into action."
      ],
      requirements: [
        "6+ years in product management, ideally hardware or mobility.",
        "A rider's instinct paired with rigorous prioritisation.",
        "Strong cross-functional leadership.",
        "Data-informed, story-driven decision making."
      ]
    },
    {
      id: "supply-chain-manager",
      title: "Supply Chain Manager",
      dept: "Operations", location: "Pune", type: "Full-time",
      blurb: "Build the supplier network that scales Hooga from hundreds to thousands of bikes.",
      responsibilities: [
        "Manage sourcing, vendor relationships, and inbound logistics.",
        "Drive cost, quality, and on-time delivery across the BOM.",
        "Build resilience and contingency into critical supply lines.",
        "Partner with engineering on design-for-supply decisions."
      ],
      requirements: [
        "6+ years in manufacturing or automotive supply chain.",
        "Track record scaling production volumes.",
        "Strong negotiation and supplier development skills.",
        "Comfortable on the factory floor and in the spreadsheet."
      ]
    },
    {
      id: "retail-experience",
      title: "Retail Experience Associate",
      dept: "Sales", location: "Mumbai", type: "Full-time",
      blurb: "Be the human face of Hooga, turning curious visitors into lifelong riders.",
      responsibilities: [
        "Host test rides and guide riders through the lineup.",
        "Own the in-store experience from welcome to delivery.",
        "Capture rider feedback and relay it to the product team.",
        "Hit experience and reservation targets with care, not pressure."
      ],
      requirements: [
        "2+ years in premium retail or hospitality.",
        "Genuine enthusiasm for motorcycles and EVs.",
        "Excellent communication and a calm, helpful presence.",
        "A valid motorcycle licence is a plus."
      ]
    },
    {
      id: "performance-marketing",
      title: "Performance Marketing Manager",
      dept: "Marketing", location: "Remote", type: "Full-time",
      blurb: "Grow the rider community and drive reservations with sharp, measurable campaigns.",
      responsibilities: [
        "Plan and run paid and lifecycle campaigns end-to-end.",
        "Own funnel metrics from impression to reservation.",
        "Partner with brand and product on launch moments.",
        "Test relentlessly and double down on what works."
      ],
      requirements: [
        "5+ years in performance or growth marketing.",
        "Fluency with analytics, attribution, and experimentation.",
        "A balance of creative instinct and numeric rigour.",
        "Bonus: experience marketing a physical product."
      ]
    }
  ];

  var listEl = document.getElementById("crList");
  var countEl = document.getElementById("crCount");
  var searchEl = document.getElementById("crSearch");
  var locEl = document.getElementById("crLocation");
  var chipsEl = document.getElementById("crChips");
  if (!listEl) return; // page chrome only

  var state = { q: "", dept: "All", loc: "All" };

  // ---- build filter controls from the data ----
  var depts = ["All"].concat(JOBS.map(function (j) { return j.dept; }).filter(uniq));
  var locs = ["All"].concat(JOBS.map(function (j) { return j.location; }).filter(uniq));
  function uniq(v, i, a) { return a.indexOf(v) === i; }

  depts.forEach(function (d) {
    var b = document.createElement("button");
    b.className = "cr-chip" + (d === "All" ? " active" : "");
    b.type = "button";
    b.textContent = d;
    b.setAttribute("aria-pressed", String(d === "All"));
    b.addEventListener("click", function () {
      state.dept = d;
      chipsEl.querySelectorAll(".cr-chip").forEach(function (c) {
        var on = c === b;
        c.classList.toggle("active", on);
        c.setAttribute("aria-pressed", String(on));
      });
      render();
    });
    chipsEl.appendChild(b);
  });

  locs.forEach(function (l) {
    var o = document.createElement("option");
    o.value = l;
    o.textContent = l === "All" ? "All locations" : l;
    locEl.appendChild(o);
  });

  // ---- helpers ----
  function li(items) { return items.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join(""); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  var pin = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>';
  var dot = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M8 6V4h8v2"/></svg>';
  var clock = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  var chev = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';

  function matches(j) {
    if (state.dept !== "All" && j.dept !== state.dept) return false;
    if (state.loc !== "All" && j.location !== state.loc) return false;
    if (state.q) {
      var hay = (j.title + " " + j.dept + " " + j.location + " " + j.type + " " + j.blurb).toLowerCase();
      if (hay.indexOf(state.q) === -1) return false;
    }
    return true;
  }

  function render() {
    var visible = JOBS.filter(matches);
    countEl.textContent = visible.length === 0
      ? "No roles match your search."
      : visible.length + (visible.length === 1 ? " open role" : " open roles");

    if (visible.length === 0) {
      listEl.innerHTML =
        '<div class="cr-empty">' +
        "<p>No roles match just yet — but we&rsquo;re always meeting great people.</p>" +
        '<button class="btn btn-dark" type="button" data-apply="General / Open application">Send a general application</button>' +
        "</div>";
      return;
    }

    listEl.innerHTML = visible.map(function (j, i) {
      return '' +
        '<article class="cr-job" data-id="' + j.id + '" style="animation-delay:' + (i * 45) + 'ms">' +
          '<div class="cr-job-hd" role="button" tabindex="0" aria-expanded="false">' +
            '<div class="cr-job-main">' +
              '<h3 class="cr-job-title">' + esc(j.title) + "</h3>" +
              '<div class="cr-job-meta">' +
                '<span class="cr-tag">' + dot + esc(j.dept) + "</span>" +
                '<span class="cr-tag">' + pin + esc(j.location) + "</span>" +
                '<span class="cr-tag">' + clock + esc(j.type) + "</span>" +
              "</div>" +
            "</div>" +
            '<div class="cr-job-actions">' +
              '<button class="btn btn-dark cr-apply" type="button" data-apply="' + esc(j.title) + '">Apply</button>' +
              '<span class="cr-expand" aria-hidden="true">' + chev + "</span>" +
            "</div>" +
          "</div>" +
          '<div class="cr-job-body"><div class="cr-job-body-inner"><div class="cr-job-detail">' +
            "<p>" + esc(j.blurb) + "</p>" +
            '<div class="cr-detail-grid">' +
              "<div><h4>What you&rsquo;ll do</h4><ul>" + li(j.responsibilities) + "</ul></div>" +
              "<div><h4>What you bring</h4><ul>" + li(j.requirements) + "</ul></div>" +
            "</div>" +
            '<button class="btn btn-dark cr-apply" type="button" data-apply="' + esc(j.title) + '">Apply for this role</button>' +
          "</div></div></div>" +
        "</article>";
    }).join("");
  }

  // ---- filter listeners ----
  if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value.trim().toLowerCase(); render(); });
  if (locEl) locEl.addEventListener("change", function () { state.loc = locEl.value; render(); });

  // ---- expand + apply (event delegation) ----
  function toggleJob(card) {
    var open = card.classList.toggle("open");
    var hd = card.querySelector(".cr-job-hd");
    if (hd) hd.setAttribute("aria-expanded", String(open));
  }
  listEl.addEventListener("click", function (e) {
    var applyBtn = e.target.closest("[data-apply]");
    if (applyBtn) { e.stopPropagation(); openApply(applyBtn.getAttribute("data-apply")); return; }
    var hd = e.target.closest(".cr-job-hd");
    if (hd) toggleJob(hd.closest(".cr-job"));
  });
  listEl.addEventListener("keydown", function (e) {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("cr-job-hd")) {
      e.preventDefault();
      toggleJob(e.target.closest(".cr-job"));
    }
  });

  render();

  /* ---------- Apply modal ---------- */
  var overlay = document.getElementById("apOverlay");
  var form = document.getElementById("apForm");
  var roleField = document.getElementById("apRole");
  var note = document.getElementById("apNote");
  var formWrap = document.getElementById("apFormWrap");
  var success = document.getElementById("apSuccess");
  var successName = document.getElementById("apSuccessName");
  var closeBtns = document.querySelectorAll("[data-ap-close]");
  var openApplyTriggers = document.querySelectorAll("[data-apply-general]");

  function openApply(role) {
    if (!overlay) return;
    roleField.textContent = role || "Open application";
    if (form) form.dataset.role = role || "Open application";
    formWrap.hidden = false;
    success.hidden = true;
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    var first = form ? form.querySelector("input") : null;
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function closeApply() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }
  openApplyTriggers.forEach(function (t) { t.addEventListener("click", function () { openApply(t.getAttribute("data-apply-general") || "General / Open application"); }); });
  closeBtns.forEach(function (b) { b.addEventListener("click", closeApply); });
  if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) closeApply(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape") closeApply(); });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"];
      var email = form.elements["email"];
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      var ok = true;
      [name, email].forEach(function (el) { el.classList.remove("invalid"); });
      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      if (!emailOk) { email.classList.add("invalid"); ok = false; }
      if (!ok) { note.textContent = "Please add your name and a valid email."; note.className = "ap-formnote error"; return; }
      note.textContent = "";
      note.className = "ap-formnote";

      // persist locally
      try {
        var key = "hooga_applications";
        var all = JSON.parse(localStorage.getItem(key) || "[]");
        all.push({
          role: form.dataset.role || "Open application",
          name: name.value.trim(),
          email: email.value.trim(),
          phone: (form.elements["phone"].value || "").trim(),
          link: (form.elements["link"].value || "").trim(),
          why: (form.elements["why"].value || "").trim(),
          ts: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(all));
      } catch (err) { /* storage unavailable — proceed anyway */ }

      successName.textContent = name.value.trim().split(" ")[0];
      formWrap.hidden = true;
      success.hidden = false;
      form.reset();
    });
  }
})();
