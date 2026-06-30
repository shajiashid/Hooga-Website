/* =========================================================
   Hooga — "Become a Dealer" popup (shared by all pages)
   Opens from any element with [data-deal-open]; closes on
   [data-deal-close], backdrop click, or Escape.
   ========================================================= */
(function () {
  "use strict";
  var overlay = document.getElementById("dealOverlay");
  if (!overlay) return;
  var form = document.getElementById("dealForm");
  var note = document.getElementById("dealNote");
  var btn = form ? form.querySelector(".deal-submit") : null;
  var btnText = btn ? btn.textContent : "";

  function reset() {
    if (!form) return;
    form.reset();
    note.textContent = "";
    note.className = "deal-note";
    form.querySelectorAll(".invalid").forEach(function (el) { el.classList.remove("invalid"); });
    if (btn) { btn.disabled = false; btn.textContent = btnText; }
  }
  function open() {
    reset();
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    var first = form ? form.querySelector("input") : null;
    if (first) setTimeout(function () { first.focus(); }, 80);
  }
  function close() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
  }

  // Triggers (e.g. the "Become a Dealer" menu link). Delay so the
  // slide-out menu can close first, then the popup fades in.
  document.querySelectorAll("[data-deal-open]").forEach(function (el) {
    el.addEventListener("click", function (e) { e.preventDefault(); setTimeout(open, 220); });
  });
  document.querySelectorAll("[data-deal-close]").forEach(function (el) {
    el.addEventListener("click", close);
  });
  overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
  window.addEventListener("keydown", function (e) { if (e.key === "Escape" && overlay.classList.contains("open")) close(); });

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"], email = form.elements["email"];
      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email.value || "").trim());
      var ok = true;
      [name, email].forEach(function (el) { el.classList.remove("invalid"); });
      if (!name.value.trim()) { name.classList.add("invalid"); ok = false; }
      if (!emailOk) { email.classList.add("invalid"); ok = false; }
      if (!ok) { note.textContent = "Please add your name and a valid email."; note.className = "deal-note error"; return; }

      try {
        var key = "hooga_dealers";
        var all = JSON.parse(localStorage.getItem(key) || "[]");
        all.push({
          business: (form.elements["business"].value || "").trim(),
          name: name.value.trim(),
          email: email.value.trim(),
          phone: (form.elements["phone"].value || "").trim(),
          city: (form.elements["city"].value || "").trim(),
          ts: new Date().toISOString()
        });
        localStorage.setItem(key, JSON.stringify(all));
      } catch (err) { /* storage unavailable — proceed anyway */ }

      var first = name.value.trim().split(" ")[0];
      note.textContent = "Thanks, " + first + "! Our partnerships team will be in touch soon.";
      note.className = "deal-note success";
      if (btn) { btn.textContent = "Submitted ✓"; btn.disabled = true; }
    });
  }
})();
