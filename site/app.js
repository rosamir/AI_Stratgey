// ==================== App logic: render + interactivity ====================
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    setupAuth();
    renderNav();
    renderHero();
    renderWhyNow();
    renderVision();
    renderPrinciples();
    renderRoadmap();
    renderThemes();
    renderUseCases();
    renderWorkforce();
    renderCenter();
    renderRisks();
    renderKpi();
    renderAssessment();
    renderSummary();

    if (window.lucide) lucide.createIcons();

    setupScrollSpy();
    setupSmoothScroll();
    setupReveal();
    setupMotionToggle();
    setupAdoptionRaceAnimation();
    setupThemePicker();
  }

  // ---------- Auth & Login ----------
  // להגדרת התיעוד ב-Google Sheets: יש להדביק כאן את ה-URL שהתקבל מגוגל
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw2UEU_Ec_Al-9Q0RWwlSMBnDNuO3oao5b9nH7kUSSAfW4yRkdBnZdOA2vIsvbT4TJd/exec";

  const USERS_DB = [
    { username: "amir", password: "036021720", displayName: "אמיר (amir)" },
    { username: "admin", password: "036021720", displayName: "מנהל (admin)" },
    { username: "avi", password: "2206", displayName: "אבי (avi)" }
  ];

  function logLoginEvent(username) {
    if (!GOOGLE_SCRIPT_URL) return;
    try {
      const payload = {
        username: username,
        timestamp: new Date().toLocaleString("he-IL", { timeZone: "Asia/Jerusalem" }),
        userAgent: navigator.userAgent
      };
      fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload)
      }).catch(err => console.error("Logging failed:", err));
    } catch (e) {
      console.error("Logging error:", e);
    }
  }

  function setupAuth() {
    const overlay = $("#loginOverlay");
    const form = $("#loginForm");
    const usernameInput = $("#usernameInput");
    const passwordInput = $("#passwordInput");
    const togglePasswordBtn = $("#togglePasswordBtn");
    const loginError = $("#loginError");
    const loginErrorText = $("#loginErrorText");
    const userProfile = $("#userProfile");
    const currentUserName = $("#currentUserName");
    const logoutBtn = $("#logoutBtn");

    if (!overlay || !form) return;

    // Clean any old localStorage entries to strictly enforce per-session auth
    localStorage.removeItem("ai_strategy_user");

    // Check existing session (sessionStorage only)
    const savedUser = sessionStorage.getItem("ai_strategy_user");
    if (savedUser) {
      const found = USERS_DB.find(u => u.username === savedUser);
      if (found) {
        grantAccess(found, false);
      } else {
        denyAccess();
      }
    } else {
      denyAccess();
    }

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener("click", () => {
        const isPassword = passwordInput.getAttribute("type") === "password";
        passwordInput.setAttribute("type", isPassword ? "text" : "password");
        togglePasswordBtn.setAttribute("aria-label", isPassword ? "הסתר סיסמה" : "הצג סיסמה");
        const icon = togglePasswordBtn.querySelector("i");
        if (icon) {
          icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
          if (window.lucide) lucide.createIcons();
        }
      });
    }

    // Form submit
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const enteredUser = usernameInput.value.trim().toLowerCase();
      const enteredPass = passwordInput.value;

      if (!enteredUser || !enteredPass) {
        showError("נא להזין שם משתמש וסיסמה");
        return;
      }

      const userMatch = USERS_DB.find(
        u => u.username.toLowerCase() === enteredUser && u.password === enteredPass
      );

      if (userMatch) {
        hideError();
        sessionStorage.setItem("ai_strategy_user", userMatch.username);
        grantAccess(userMatch, true);
        logLoginEvent(userMatch.username);
      } else {
        showError("שם משתמש או סיסמה שגויים");
      }
    });

    // Logout
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        sessionStorage.removeItem("ai_strategy_user");
        localStorage.removeItem("ai_strategy_user");
        usernameInput.value = "";
        passwordInput.value = "";
        hideError();
        denyAccess();
      });
    }

    function grantAccess(userObj, animate) {
      document.body.classList.remove("is-logged-out");
      if (currentUserName) currentUserName.textContent = userObj.displayName;
      if (userProfile) userProfile.style.display = "flex";
      if (overlay) overlay.classList.add("hidden");
      if (window.lucide) lucide.createIcons();
    }

    function denyAccess() {
      document.body.classList.add("is-logged-out");
      if (userProfile) userProfile.style.display = "none";
      if (overlay) overlay.classList.remove("hidden");
      if (window.lucide) lucide.createIcons();
    }

    function showError(msg) {
      if (loginErrorText) loginErrorText.textContent = msg;
      if (loginError) loginError.style.display = "flex";
    }

    function hideError() {
      if (loginError) loginError.style.display = "none";
    }
  }

  // ---------- Nav ----------
  function renderNav() {
    const list = $("#navList");
    list.innerHTML = APP_DATA.nav.map((item, i) => `
      <li class="nav-item" data-target="${item.id}">
        <button type="button" data-scroll-to="${item.id}"><em>${String(i + 1).padStart(2, "0")}</em>${item.label}</button>
      </li>
    `).join("");
  }

  // ---------- Hero ----------
  function renderHero() {
    $("#heroTitle").textContent = APP_DATA.meta.title;
    $("#heroSub").textContent = APP_DATA.meta.subtitle;
    $("#heroStamp").textContent = APP_DATA.meta.stamp;
    $("#signatureTag").textContent = `נכתב על ידי ${APP_DATA.meta.author}`;
  }

  // ---------- Theme picker ----------
  function setupThemePicker() {
    const wrap = $("#themeSwatches");
    const stored = localStorage.getItem("themeAccent");
    const active = APP_DATA.themes.some(t => t.id === stored) ? stored : APP_DATA.themes[0].id;
    document.documentElement.setAttribute("data-theme", active);

    wrap.innerHTML = APP_DATA.themes.map(t => `
      <button type="button" class="theme-swatch swatch-${t.id}" data-theme-id="${t.id}"
        role="radio" aria-checked="${t.id === active}" title="${t.label}">
        <span class="sr-only">${t.label}</span>
      </button>
    `).join("");

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest(".theme-swatch");
      if (!btn) return;
      const id = btn.dataset.themeId;
      document.documentElement.setAttribute("data-theme", id);
      localStorage.setItem("themeAccent", id);
      $$(".theme-swatch", wrap).forEach(s => s.setAttribute("aria-checked", String(s === btn)));
    });
  }

  // ---------- Why now ----------
  function renderWhyNow() {
    $("#whyNowIntro").textContent = APP_DATA.whyNow.intro;

    $("#historyTitle").textContent = APP_DATA.aiHistory.title;
    $("#historyText").textContent = APP_DATA.aiHistory.text;
    $("#historyStrip").innerHTML = APP_DATA.aiHistory.eras.map(e => `
      <div class="era">
        <span class="era-year">${e.year}</span>
        <span class="era-dot" aria-hidden="true"></span>
        <h4>${e.title}</h4>
        <p>${e.text}</p>
      </div>
    `).join("");

    $("#driverGrid").innerHTML = APP_DATA.whyNow.drivers.map(d => `
      <div class="driver-card reveal">
        <div class="icon-badge"><i data-lucide="${d.icon}"></i></div>
        <h3>${d.title}</h3>
        <p>${d.text}</p>
      </div>
    `).join("");

    const race = APP_DATA.adoptionRace;
    $("#raceTitle").textContent = race.title;
    $("#raceText").textContent = race.text;
    $("#raceNote").textContent = race.note;
    const maxMonths = Math.max(...race.items.map(it => it.months));
    $("#adoptionRace").innerHTML = race.items.map(it => `
      <div class="race-row ${it.highlight ? "race-row-hot" : ""}">
        <span class="race-label">${it.label}</span>
        <div class="race-track">
          <div class="race-fill" data-target="${(it.months / maxMonths) * 100}" style="width:0%">
            <span class="race-value">${it.display}</span>
          </div>
        </div>
      </div>
    `).join("");

    $("#riskTitle").textContent = APP_DATA.whyNow.risk.title;
    $("#riskList").innerHTML = APP_DATA.whyNow.risk.points.map(p => `<li>${p}</li>`).join("");
  }

  function setupAdoptionRaceAnimation() {
    const track = $("#raceExhibit");
    if (!track) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          $$(".race-fill", track).forEach(el => {
            el.style.width = el.dataset.target + "%";
          });
          io.disconnect();
        }
      });
    }, { threshold: 0.3 });
    io.observe(track);
  }

  // ---------- Vision ----------
  function renderVision() {
    $("#visionStatement").textContent = APP_DATA.vision.statement;
    $("#pillarGrid").innerHTML = APP_DATA.vision.pillars.map(p => `
      <div class="pillar-card reveal">
        <h4>${p.title}</h4>
        <p>${p.text}</p>
      </div>
    `).join("");
    $("#connectionTitle").textContent = APP_DATA.vision.connection.title;
    $("#connectionText").textContent = APP_DATA.vision.connection.text;
  }

  // ---------- Principles (accordion, single-open behavior not enforced -> multi open ok) ----------
  function renderPrinciples() {
    const grid = $("#principlesGrid");
    grid.innerHTML = APP_DATA.principles.map((p, i) => `
      <div class="principle-item reveal" data-open="false" id="principle-${i}">
        <button class="principle-btn" aria-expanded="false" aria-controls="principle-panel-${i}">
          <span>${p.title}</span>
          <span class="principle-toggle" aria-hidden="true">+</span>
        </button>
        <div class="principle-panel" id="principle-panel-${i}">
          <div class="principle-panel-inner">
            <p>${p.why}</p>
            <span class="tag">מתחבר ל: ${p.link}</span>
          </div>
        </div>
      </div>
    `).join("");

    $$(".principle-btn", grid).forEach(btn => {
      btn.addEventListener("click", () => toggleAccordion(btn));
    });
  }

  function toggleAccordion(btn) {
    const item = btn.closest("[data-open]");
    const panel = btn.nextElementSibling;
    const isOpen = item.dataset.open === "true";
    const next = !isOpen;
    item.dataset.open = String(next);
    btn.setAttribute("aria-expanded", String(next));
    btn.querySelector(".principle-toggle, .risk-toggle").textContent = next ? "−" : "+";
    panel.style.maxHeight = next ? panel.scrollHeight + "px" : "0px";
  }

  // ---------- Roadmap ----------
  let currentHorizon = "short";
  let currentDirection = "both"; // both | internal | external

  function renderRoadmap() {
    $("#roadmapIntro").textContent = APP_DATA.roadmap.intro;

    const tabs = $("#horizonTabs");
    tabs.innerHTML = APP_DATA.roadmap.horizons.map((h, i) => `
      <button class="tab-btn" role="tab" data-horizon="${h.id}" aria-selected="${h.id === currentHorizon}">
        ${h.label}
      </button>
    `).join("");
    tabs.addEventListener("click", (e) => {
      const btn = e.target.closest(".tab-btn");
      if (!btn) return;
      currentHorizon = btn.dataset.horizon;
      $$(".tab-btn", tabs).forEach(b => b.setAttribute("aria-selected", String(b === btn)));
      renderTimeline();
      renderRoadmapPanel();
    });

    const chips = $("#directionChips");
    const directions = [
      { id: "both", label: "פנים וחוץ", icon: "layers" },
      { id: "internal", label: "פנים ארגוני", icon: "building-2" },
      { id: "external", label: "מול העולם החיצוני", icon: "globe" },
    ];
    chips.innerHTML = directions.map(d => `
      <button class="chip" data-direction="${d.id}" aria-pressed="${d.id === currentDirection}">
        <i data-lucide="${d.icon}"></i> ${d.label}
      </button>
    `).join("");
    chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      currentDirection = chip.dataset.direction;
      $$(".chip", chips).forEach(c => c.setAttribute("aria-pressed", String(c === chip)));
      renderRoadmapPanel();
      if (window.lucide) lucide.createIcons();
    });

    renderTimeline();
    renderRoadmapPanel();
    if (window.lucide) lucide.createIcons();
  }

  function renderTimeline() {
    const track = $("#timelineTrack");
    const idx = APP_DATA.roadmap.horizons.findIndex(h => h.id === currentHorizon);
    let html = "";
    APP_DATA.roadmap.horizons.forEach((h, i) => {
      html += `<div class="dot ${i <= idx ? "active" : ""}"></div>`;
      if (i < APP_DATA.roadmap.horizons.length - 1) {
        html += `<div class="bar ${i < idx ? "active" : ""}"></div>`;
      }
    });
    track.innerHTML = html;
  }

  function renderRoadmapPanel() {
    const h = APP_DATA.roadmap.horizons.find(x => x.id === currentHorizon);
    const panel = $("#roadmapPanel");
    const showInternal = currentDirection === "both" || currentDirection === "internal";
    const showExternal = currentDirection === "both" || currentDirection === "external";

    const col = (title, icon, items, hidden) => `
      <div class="roadmap-col ${hidden ? "direction-hidden" : ""}">
        <h4><i data-lucide="${icon}"></i> ${title} <span style="color:var(--ink-500); font-weight:400; font-size:0.82rem;">(${h.time})</span></h4>
        ${items.map(it => `
          <div class="rm-item">
            <h5>${it.title}</h5>
            <p>${it.text}</p>
          </div>
        `).join("")}
      </div>
    `;

    panel.innerHTML = col("פנים ארגוני", "building-2", h.internal, !showInternal)
      + col("מול העולם החיצוני", "globe", h.external, !showExternal);

    if (window.lucide) lucide.createIcons();
  }

  // ---------- Use cases ----------
  let activeFunctions = new Set(["all"]);

  function renderThemes() {
    const f = APP_DATA.themesFramework;
    $("#themesIntro").textContent = f.intro;
    $("#themesLegend").textContent = f.legend;
    $("#themeCards").innerHTML = f.items.map(t => `
      <div class="theme-card reveal theme-card-${t.id}">
        <div class="theme-card-icon"><i data-lucide="${t.icon}"></i></div>
        <h3>${t.title}</h3>
        <p>${t.text}</p>
      </div>
    `).join("");
    if (window.lucide) lucide.createIcons();
  }

  function themeLookup(id) {
    return APP_DATA.themesFramework.items.find(t => t.id === id);
  }

  function renderUseCases() {
    const chips = $("#functionChips");
    const all = [{ id: "all", name: "הכול" }, ...APP_DATA.useCaseGroups];
    chips.innerHTML = all.map(g => `
      <button class="chip" data-fn="${g.id}" aria-pressed="${g.id === "all"}">${g.name}</button>
    `).join("");

    chips.addEventListener("click", (e) => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      const fn = chip.dataset.fn;
      if (fn === "all") {
        activeFunctions = new Set(["all"]);
      } else {
        activeFunctions.delete("all");
        if (activeFunctions.has(fn)) activeFunctions.delete(fn);
        else activeFunctions.add(fn);
        if (activeFunctions.size === 0) activeFunctions = new Set(["all"]);
      }
      $$(".chip", chips).forEach(c => c.setAttribute("aria-pressed", String(activeFunctions.has(c.dataset.fn))));
      renderUseCaseTable();
    });

    renderUseCaseTable();
  }

  function renderUseCaseTable() {
    const tbody = $("#usecaseTbody");
    const groups = activeFunctions.has("all")
      ? APP_DATA.useCaseGroups
      : APP_DATA.useCaseGroups.filter(g => activeFunctions.has(g.id));

    if (groups.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5">בחרו לפחות תחום אחד כדי לראות יוזמות.</td></tr>`;
      return;
    }

    tbody.innerHTML = groups.map(g => `
      <tr class="usecase-group-row"><td colspan="5">${g.name}</td></tr>
      ${g.cases.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.desc}</td>
          <td><span class="horizon-badge">${c.horizon}</span></td>
          <td>${c.benefit}</td>
          <td>
            <div class="theme-badges">
              ${(c.themes || []).map(id => {
                const t = themeLookup(id);
                return t ? `<span class="theme-badge theme-badge-${t.id}" title="${t.title}"><i data-lucide="${t.icon}"></i></span>` : "";
              }).join("")}
            </div>
          </td>
        </tr>
      `).join("")}
    `).join("");

    if (window.lucide) lucide.createIcons();
  }

  // ---------- Workforce ----------
  function renderWorkforce() {
    $("#workforceIntro").textContent = APP_DATA.workforce.intro;
    $("#atRiskTbody").innerHTML = APP_DATA.workforce.atRisk.map(r => `
      <tr><td>${r.type}</td><td>${r.trait}</td><td>${r.examples}</td></tr>
    `).join("");
    $("#transitionChain").innerHTML = APP_DATA.workforce.transitionModel.map(s => `
      <li class="reveal"><h4>${s.step}</h4><p>${s.text}</p></li>
    `).join("");
  }

  // ---------- AI Center ----------
  function renderCenter() {
    const c = APP_DATA.center;
    $("#centerIntro").textContent = c.intro;

    const img = $("#launchImg");
    img.src = c.launchImage.src;
    img.alt = c.launchImage.alt;
    $("#launchCaption").textContent = c.launchImage.caption;

    $("#caioTitle").textContent = c.caioTitle;
    $("#caioText").textContent = c.caioText;
    $("#caioResponsibilities").innerHTML = c.caioResponsibilities.map(r => `<li>${r}</li>`).join("");

    $("#orgchart").innerHTML = `
      <div class="orgchart-caio">${c.caioTitle}</div>
      <div class="orgchart-line"></div>
      <div class="orgchart-nodes">
        ${c.unitStructure.map(n => `
          <div class="orgchart-node"><b>${n.role} (${n.count})</b><span>${n.note}</span></div>
        `).join("")}
      </div>
    `;

    const om = c.operatingModel;
    $("#operatingModel").innerHTML = `
      <h3>${om.title}</h3>
      <p class="sub">${om.text}</p>
      <div class="om-grid">
        <div class="om-card om-us"><b>אנחנו</b><br>${om.us.replace(/^אנחנו \(מרכז ה-AI\): /, "")}</div>
        <div class="om-card om-you"><b>אתם</b><br>${om.you.replace(/^אתם \(היחידות העסקיות\): /, "")}</div>
        <div class="om-leads">${om.aiLeads}</div>
      </div>
    `;
  }

  // ---------- Risks & Ethics ----------
  function renderRisks() {
    const sevLabel = { high: "סיכון גבוה", medium: "סיכון בינוני" };
    $("#riskGrid").innerHTML = APP_DATA.risks.map((r, i) => `
      <div class="risk-card reveal" data-open="false">
        <button class="risk-head" aria-expanded="false" aria-controls="risk-panel-${i}">
          <span class="risk-sev ${r.severity}" aria-hidden="true"></span>
          <h4>${r.title}</h4>
          <span class="risk-sev-label ${r.severity}">${sevLabel[r.severity]}</span>
          <span class="risk-toggle" aria-hidden="true">+</span>
        </button>
        <div class="risk-body" id="risk-panel-${i}">
          <div class="risk-body-inner">
            <p>${r.text}</p>
            <p class="response"><b>איך מתמודדים: </b>${r.response}</p>
          </div>
        </div>
      </div>
    `).join("");

    $$(".risk-head").forEach(btn => btn.addEventListener("click", () => toggleAccordion(btn)));

    $("#ethicsGrid").innerHTML = APP_DATA.ethics.map(e => `
      <div class="ethics-item reveal"><b>${e.term}</b><span>${e.text}</span></div>
    `).join("");
  }

  // ---------- KPI ----------
  function renderKpi() {
    $("#kpiGrid").innerHTML = APP_DATA.kpiGroups.map(g => `
      <div class="kpi-card reveal">
        <div class="kpi-icon"><i data-lucide="${g.icon}"></i></div>
        <h4>${g.title}</h4>
        <ul>${g.items.map(it => `<li>${it}</li>`).join("")}</ul>
      </div>
    `).join("");

    $("#loopDiagram").innerHTML = APP_DATA.feedbackLoop.map((s, i) => `
      <div class="loop-step reveal">
        <span class="num">שלב ${i + 1}</span>
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </div>
    `).join("");
  }

  // ---------- Assessment (informative maturity matrix) ----------
  function renderAssessment() {
    $("#assessmentIntro").textContent = APP_DATA.assessment.intro;

    const stages = APP_DATA.assessment.stages;
    const head = $("#maturityHead");
    head.innerHTML = `<th scope="col"></th>` + stages.map(s => `<th scope="col">${s.title}</th>`).join("");

    $("#maturityBody").innerHTML = APP_DATA.assessment.dimensions.map(d => `
      <tr>
        <th scope="row">${d.text}</th>
        ${d.levels.map(l => `<td>${l}</td>`).join("")}
      </tr>
    `).join("");

    $("#stageStrip").innerHTML = stages.map((s, i) => `
      <div class="stage-card reveal">
        <span class="stage-num">${String(i + 1).padStart(2, "0")}</span>
        <h4>${s.title}</h4>
        <p>${s.text}</p>
      </div>
    `).join("");
  }

  // ---------- Summary ----------
  function renderSummary() {
    $("#summaryText").textContent = APP_DATA.summary.text;
    $("#decisionList").innerHTML = APP_DATA.summary.decisions.map(d => `<li>${d}</li>`).join("");
  }

  // ---------- Scroll spy ----------
  function setupScrollSpy() {
    const sections = APP_DATA.nav.map(n => document.getElementById(n.id)).filter(Boolean);
    const heroEl = document.getElementById("hero");
    const total = document.body.scrollHeight - window.innerHeight;

    function updateProgress() {
      const scrolled = window.scrollY;
      const pct = total > 0 ? Math.min(100, (scrolled / total) * 100) : 0;
      $("#progressFill").style.width = pct + "%";
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$(".nav-item").forEach(li => li.classList.toggle("active", li.dataset.target === id));
        }
      });
    }, { rootMargin: "-40% 0px -50% 0px", threshold: 0 });

    sections.forEach(s => observer.observe(s));
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // ---------- Smooth scroll ----------
  function setupSmoothScroll() {
    document.addEventListener("click", (e) => {
      const el = e.target.closest("[data-scroll-to]");
      if (!el) return;
      const target = document.getElementById(el.dataset.scrollTo);
      if (target) {
        const y = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top: y, behavior: document.documentElement.classList.contains("reduce-motion") ? "auto" : "smooth" });
      }
    });
  }

  // ---------- Reveal on scroll ----------
  function setupReveal() {
    const els = $$(".reveal");
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    els.forEach(el => io.observe(el));
  }

  // ---------- Motion toggle ----------
  function setupMotionToggle() {
    const btn = $("#motionToggle");
    const stored = localStorage.getItem("reduceMotion") === "true";
    if (stored) {
      document.documentElement.classList.add("reduce-motion");
      btn.setAttribute("aria-pressed", "true");
    }
    btn.addEventListener("click", () => {
      const active = document.documentElement.classList.toggle("reduce-motion");
      btn.setAttribute("aria-pressed", String(active));
      localStorage.setItem("reduceMotion", String(active));
      if (active) $$(".reveal").forEach(el => el.classList.add("in"));
    });
  }
})();
