/* =========================================================
   Hooga — Support (Help Center) page interactions
   (self-contained; mirrors careers.js)
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

  /* ---- Hero stat count-up ---- */
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
        else el.textContent = original;
      };
      requestAnimationFrame(step);
    }
    var started = false;
    function kick() {
      if (started) return; started = true;
      nums.forEach(function (el, i) {
        var original = el.textContent.trim();
        var m = original.match(/^(\d[\d,]*)(.*)$/);
        if (!m || prefersReduce) return;
        var target = parseInt(m[1].replace(/,/g, ""), 10);
        var suffix = m[2] || "";
        el.textContent = "0" + suffix;
        setTimeout(function () { animate(el, target, suffix, original); }, 360 + i * 110);
      });
    }
    if ("IntersectionObserver" in window && !prefersReduce) {
      var ioS = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) { kick(); ioS.disconnect(); } });
      }, { threshold: 0.45 });
      ioS.observe(stats);
    } else { kick(); }
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
     Help Center: FAQ data, filtering, expand
     ========================================================= */
  var FAQS = [
    { id: "reserve", cat: "Orders & Reservations", q: "How do I reserve a Hooga?",
      a: "Pick your model on the homepage, choose M1S or M1R, and submit your details. A small, fully refundable deposit secures your place in the delivery queue." },
    { id: "refund", cat: "Orders & Reservations", q: "Is my reservation deposit refundable?",
      a: "Yes. Your deposit is fully refundable any time before you confirm your final order — no questions asked, refunded to your original payment method within 5–7 business days." },
    { id: "delivery", cat: "Orders & Reservations", q: "When will my bike be delivered?",
      a: "Delivery windows depend on your model and city. After you reserve, you'll see an estimated window in your account, and we'll email you the moment your build is scheduled." },
    { id: "charge-time", cat: "Battery & Charging", q: "How long does a full charge take?",
      a: "A standard charge from empty to full takes about 4 hours. With the optional fast charger, you can reach 80% in roughly 90 minutes." },
    { id: "range", cat: "Battery & Charging", q: "What is the real-world range?",
      a: "The M1S returns up to 112 miles and the M1R up to 134 miles on a charge. Real range varies with terrain, ride mode, rider weight, and how hard you twist the throttle." },
    { id: "wall-socket", cat: "Battery & Charging", q: "Can I charge from a regular wall socket?",
      a: "Yes — every Hooga ships with a charger that plugs into a standard household socket. No special wiring or wall box is required to get rolling." },
    { id: "service-interval", cat: "Service & Maintenance", q: "How often does the M1 need servicing?",
      a: "With no gears, clutch, or oil, maintenance is light. We recommend a check-up every 6 months or 5,000 km — mostly brakes, tyres, and a software health check." },
    { id: "service-where", cat: "Service & Maintenance", q: "Where can I get my Hooga serviced?",
      a: "At any authorised Hooga service point, or through our mobile service in select cities. Open a request from the app and we'll route you to the nearest option." },
    { id: "warranty", cat: "Warranty & Returns", q: "What does the warranty cover?",
      a: "Every Hooga includes a 3-year vehicle warranty and a separate 5-year / 60,000 km battery warranty covering defects and capacity below our stated threshold." },
    { id: "returns", cat: "Warranty & Returns", q: "Can I return the bike after delivery?",
      a: "Yes — there's a 7-day, 300 km return window after delivery. If it isn't right for you, contact support and we'll arrange a pickup and refund." },
    { id: "password", cat: "Account & App", q: "How do I reset my account password?",
      a: "On the login screen tap “Forgot password”, enter your email, and follow the secure link we send. The link expires in 30 minutes for your safety." },
    { id: "ota", cat: "Account & App", q: "Does the bike get over-the-air updates?",
      a: "It does. New ride modes, display tweaks, and improvements arrive over the air — just keep the bike connected to Wi-Fi and updates install while it's parked." },
    { id: "licence", cat: "Riding & Safety", q: "Do I need a licence to ride a Hooga?",
      a: "A Hooga is a full motorcycle, so a valid motorcycle licence and local registration are required. Your dealer can walk you through the paperwork at handover." },
    { id: "waterproof", cat: "Riding & Safety", q: "Is the M1 built for wet trail riding?",
      a: "Yes. The battery and drivetrain are sealed to an IP67 rating, so rain, puddles, and stream crossings are well within its comfort zone — just avoid full submersion." }
  ];

  var listEl = document.getElementById("spList");
  var countEl = document.getElementById("spCount");
  var searchEl = document.getElementById("spSearch");
  var chipsEl = document.getElementById("spChips");

  var state = { q: "", cat: "All" };

  if (listEl && chipsEl) {
    var cats = ["All"].concat(FAQS.map(function (f) { return f.cat; }).filter(function (v, i, a) { return a.indexOf(v) === i; }));
    cats.forEach(function (c) {
      var b = document.createElement("button");
      b.className = "cr-chip" + (c === "All" ? " active" : "");
      b.type = "button"; b.textContent = c; b.setAttribute("aria-pressed", String(c === "All"));
      b.addEventListener("click", function () {
        state.cat = c;
        chipsEl.querySelectorAll(".cr-chip").forEach(function (x) {
          var on = x === b; x.classList.toggle("active", on); x.setAttribute("aria-pressed", String(on));
        });
        render();
      });
      chipsEl.appendChild(b);
    });

    var chev = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
    var tagIc = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16M4 12h16M4 19h10"/></svg>';
    function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

    function matches(f) {
      if (state.cat !== "All" && f.cat !== state.cat) return false;
      if (state.q) {
        var hay = (f.q + " " + f.a + " " + f.cat).toLowerCase();
        if (hay.indexOf(state.q) === -1) return false;
      }
      return true;
    }

    function render() {
      var visible = FAQS.filter(matches);
      countEl.textContent = visible.length === 0
        ? "No articles match your search."
        : visible.length + (visible.length === 1 ? " article" : " articles");

      if (visible.length === 0) {
        listEl.innerHTML =
          '<div class="cr-empty"><p>We couldn&rsquo;t find an answer for that — our team can help directly.</p>' +
          '<button class="btn btn-dark" type="button" data-ct-open data-ct-topic="General question">Contact support</button></div>';
        return;
      }

      listEl.innerHTML = visible.map(function (f, i) {
        return '' +
          '<article class="cr-job" data-id="' + f.id + '" style="animation-delay:' + (i * 40) + 'ms">' +
            '<div class="cr-job-hd" role="button" tabindex="0" aria-expanded="false">' +
              '<div class="cr-job-main">' +
                '<h3 class="cr-job-title">' + esc(f.q) + "</h3>" +
                '<div class="cr-job-meta"><span class="cr-tag">' + tagIc + esc(f.cat) + "</span></div>" +
              "</div>" +
              '<div class="cr-job-actions"><span class="cr-expand" aria-hidden="true">' + chev + "</span></div>" +
            "</div>" +
            '<div class="cr-job-body"><div class="cr-job-body-inner"><div class="cr-job-detail">' +
              "<p>" + esc(f.a) + "</p>" +
            "</div></div></div>" +
          "</article>";
      }).join("");
    }

    if (searchEl) searchEl.addEventListener("input", function () { state.q = searchEl.value.trim().toLowerCase(); render(); });

    function toggle(card) {
      var open = card.classList.toggle("open");
      var hd = card.querySelector(".cr-job-hd");
      if (hd) hd.setAttribute("aria-expanded", String(open));
    }
    listEl.addEventListener("click", function (e) {
      if (e.target.closest("[data-ct-open]")) return; // handled by contact logic
      var hd = e.target.closest(".cr-job-hd");
      if (hd) toggle(hd.closest(".cr-job"));
    });
    listEl.addEventListener("keydown", function (e) {
      if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("cr-job-hd")) {
        e.preventDefault(); toggle(e.target.closest(".cr-job"));
      }
    });

    render();
  }

  /* =========================================================
     Contact modal
     ========================================================= */
  var overlay = document.getElementById("ctOverlay");
  var form = document.getElementById("ctForm");
  var topicEl = document.getElementById("ctTopic");
  var topicField = document.getElementById("ctTopicField");
  var note = document.getElementById("ctNote");
  var formWrap = document.getElementById("ctFormWrap");
  var success = document.getElementById("ctSuccess");
  var successName = document.getElementById("ctSuccessName");

  function openContact(topic) {
    if (!overlay) return;
    if (form) form.reset();
    if (note) { note.textContent = ""; note.className = "ap-formnote"; }
    if (formWrap) formWrap.hidden = false;
    if (success) success.hidden = true;
    if (topic && topicField) {
      // preselect the topic if it exists as an option
      for (var i = 0; i < topicField.options.length; i++) {
        if (topicField.options[i].value === topic) { topicField.selectedIndex = i; break; }
      }
    }
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    var first = form ? form.querySelector("input") : null;
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function closeContact() {
    if (!overlay) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Delegated trigger: anything with [data-ct-open] opens the modal.
  document.addEventListener("click", function (e) {
    var t = e.target.closest("[data-ct-open]");
    if (t) {
      e.preventDefault();
      // if it's a menu link, let the menu close first
      var delay = t.closest(".menu-panel") ? 220 : 0;
      var topic = t.getAttribute("data-ct-topic") || "";
      setTimeout(function () { openContact(topic); }, delay);
      return;
    }
    if (e.target.closest("[data-ct-close]")) closeContact();
  });
  if (overlay) overlay.addEventListener("click", function (e) { if (e.target === overlay) closeContact(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay && overlay.classList.contains("open")) closeContact(); });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"], email = form.elements["email"], message = form.elements["message"];
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || "").trim());
      var ok = true;
      [name, email, message].forEach(function (el) { el.classList.remove("invalid"); });
      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      if (!emailOk) { email.classList.add("invalid"); ok = false; }
      if (!message.value.trim()) { message.classList.add("invalid"); ok = false; }
      if (!ok) { note.textContent = "Please add your name, a valid email, and a message."; note.className = "ap-formnote error"; return; }

      try {
        var key = "hooga_support";
        var all = JSON.parse(localStorage.getItem(key) || "[]");
        all.push({
          topic: topicField ? topicField.value : "",
          name: name.value.trim(),
          email: email.value.trim(),
          message: message.value.trim(),
          ts: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(all));
      } catch (err) { /* storage unavailable */ }

      successName.textContent = name.value.trim().split(" ")[0];
      formWrap.hidden = true;
      success.hidden = false;
    });
  }
})();
