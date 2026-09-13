// ==================== App logic: render + interactivity ====================
(function () {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    renderNav();
    renderHero();
    renderWhyNow();
    renderVision();
    renderPrinciples();
    renderRoadmap();
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
  }

  // ---------- Nav ----------
  function renderNav() {
    const list = $("#navList");
    list.innerHTML = APP_DATA.nav.map((item, i) => `
      <li class="nav-item" data-target="${item.id}">
        <button type="button" data-scroll-to="${item.id}">${item.label}</button>
      </li>
    `).join("");
  }

  // ---------- Hero ----------
  function renderHero() {
    $("#heroTitle").textContent = APP_DATA.meta.title;
    $("#heroSub").textContent = APP_DATA.meta.subtitle;
  }

  // ---------- Why now ----------
  function renderWhyNow() {
    $("#whyNowIntro").textContent = APP_DATA.whyNow.intro;
    $("#driverGrid").innerHTML = APP_DATA.whyNow.drivers.map(d => `
      <div class="driver-card reveal">
        <div class="icon-badge"><i data-lucide="${d.icon}"></i></div>
        <h3>${d.title}</h3>
        <p>${d.text}</p>
      </div>
    `).join("");
    $("#riskTitle").textContent = APP_DATA.whyNow.risk.title;
    $("#riskList").innerHTML = APP_DATA.whyNow.risk.points.map(p => `<li>${p}</li>`).join("");
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
      tbody.innerHTML = `<tr><td colspan="4">בחרו לפחות תחום אחד כדי לראות יוזמות.</td></tr>`;
      return;
    }

    tbody.innerHTML = groups.map(g => `
      <tr class="usecase-group-row"><td colspan="4">${g.name}</td></tr>
      ${g.cases.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.desc}</td>
          <td><span class="horizon-badge">${c.horizon}</span></td>
          <td>${c.benefit}</td>
        </tr>
      `).join("")}
    `).join("");
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

  // ---------- Assessment ----------
  function renderAssessment() {
    $("#assessmentIntro").textContent = APP_DATA.assessment.intro;
    const form = $("#assessmentForm");
    form.innerHTML = APP_DATA.assessment.questions.map(q => `
      <fieldset class="aq">
        <legend>${q.text}</legend>
        <div class="aq-options">
          ${q.options.map((o, i) => `
            <label class="aq-option">
              <input type="radio" name="${q.id}" value="${o.score}" ${i === 0 ? "" : ""} required>
              <span>${o.label}</span>
            </label>
          `).join("")}
        </div>
      </fieldset>
    `).join("") + `<button type="submit" class="btn btn-primary" style="align-self:flex-start;">
        <i data-lucide="calculator"></i> חשבו את רמת המוכנות
      </button>`;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      computeAssessment();
    });
    if (window.lucide) lucide.createIcons();
  }

  function computeAssessment() {
    const form = $("#assessmentForm");
    const questions = APP_DATA.assessment.questions;
    let total = 0;
    let missing = false;
    questions.forEach(q => {
      const checked = form.querySelector(`input[name="${q.id}"]:checked`);
      if (!checked) missing = true;
      else total += Number(checked.value);
    });
    if (missing) return;

    const max = questions.length * 3;
    const result = APP_DATA.assessment.results.find(r => total <= r.max) || APP_DATA.assessment.results[APP_DATA.assessment.results.length - 1];
    const box = $("#assessmentResult");
    const pct = Math.round((total / max) * 100);
    box.hidden = false;
    box.innerHTML = `
      <h3>${result.title} — ציון מוכנות ${total}/${max}</h3>
      <div class="score-bar"><div class="score-fill" style="width:${pct}%"></div></div>
      <p>${result.text}</p>
    `;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
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
