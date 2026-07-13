/* Main timeline page */
(async function () {
  const timelineEl = document.getElementById("timeline");
  const filtersEl = document.getElementById("filters");
  const statsEl = document.getElementById("stats");

  let meetings = [];
  try {
    const res = await fetch("meetings.json", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    meetings = (await res.json()).meetings || [];
  } catch (err) {
    timelineEl.innerHTML =
      '<div class="error-state"><strong>Couldn&rsquo;t load meetings.json.</strong><br>' +
      "If you opened this file directly, serve it instead: <code>python3 -m http.server</code> " +
      "in the repo folder, then visit <code>localhost:8000</code>.</div>";
    return;
  }

  const colors = projectColors(meetings); // meetings.json is sorted oldest → newest
  let activeFilter = "All";

  renderStats();
  renderFilters();
  renderTimeline();

  /* ---------------------------------------------------------------- stats */
  function renderStats() {
    if (!meetings.length) return;
    const latest = meetings[meetings.length - 1];
    statsEl.innerHTML = [
      stat(meetings.length, meetings.length === 1 ? "meeting" : "meetings"),
      stat(Object.keys(colors).length, "project threads"),
      stat(fmtDate(latest.date, { month: "short", year: "numeric" }), "latest meeting"),
    ].join("");
    function stat(num, label) {
      return `<div class="stat"><div class="num">${esc(num)}</div><div class="label">${esc(label)}</div></div>`;
    }
  }

  /* -------------------------------------------------------------- filters */
  function renderFilters() {
    if (Object.keys(colors).length < 2) { filtersEl.style.display = "none"; return; }
    const chips = ['<button class="chip active" data-project="All">All</button>'];
    for (const [p, c] of Object.entries(colors)) {
      chips.push(
        `<button class="chip" data-project="${esc(p)}"><span class="dot" style="--dot:${c}"></span>${esc(p)}</button>`
      );
    }
    filtersEl.innerHTML = chips.join("");
    filtersEl.addEventListener("click", e => {
      const chip = e.target.closest(".chip");
      if (!chip) return;
      activeFilter = chip.dataset.project;
      filtersEl.querySelectorAll(".chip").forEach(c => c.classList.toggle("active", c === chip));
      renderTimeline();
    });
  }

  /* ------------------------------------------------------------- timeline */
  function renderTimeline() {
    const list = activeFilter === "All" ? meetings : meetings.filter(m => (m.project || "General") === activeFilter);

    if (!list.length) {
      timelineEl.innerHTML = '<div class="empty-state">No meetings yet — the first one will appear here.</div>';
      return;
    }

    const parts = ['<div class="spine"></div><div class="spine-fill" id="spineFill"></div>'];
    let lastYear = null;
    list.forEach((m, i) => {
      const year = m.date.slice(0, 4);
      if (year !== lastYear) {
        parts.push(`<div class="tl-year reveal">${year}</div>`);
        lastYear = year;
      }
      const side = i % 2 === 0 ? "" : " right";
      const accent = colors[m.project || "General"];
      parts.push(`
        <div class="tl-item${side} reveal" style="--accent:${accent}">
          <span class="node"></span>
          <a class="tl-card" href="${esc(m.path)}" data-slug="${esc(m.slug)}">
            <div class="tl-meta">
              <span class="tl-date">${fmtDate(m.date)}</span>
              <span class="project-chip">${esc(m.project || "General")}</span>
            </div>
            <h3 class="tl-title">${esc(m.title)}</h3>
            ${m.summary ? `<p class="tl-summary">${esc(m.summary)}</p>` : ""}
            <span class="tl-more">View meeting</span>
          </a>
        </div>`);
    });
    timelineEl.innerHTML = parts.join("");

    observeReveals();
    initSpine();
  }

  /* --------------------------------------------------- scroll animations */
  function observeReveals() {
    const io = new IntersectionObserver(
      entries => entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("visible"); io.unobserve(en.target); }
      }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
    timelineEl.querySelectorAll(".reveal").forEach(el => io.observe(el));
  }

  function initSpine() {
    const fill = document.getElementById("spineFill");
    if (!fill || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ticking = false;
    function update() {
      ticking = false;
      const r = timelineEl.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, (innerHeight * 0.82 - r.top) / r.height));
      const x = matchMedia("(max-width: 760px)").matches ? "0" : "-50%";
      fill.style.transform = `translateX(${x}) scaleY(${progress})`;
    }
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update);
    update();
  }

  /* --------------------------- view-transition morph into meeting pages */
  timelineEl.addEventListener("click", e => {
    const card = e.target.closest(".tl-card");
    if (!card) return;
    const t = card.querySelector(".tl-title");
    if (t) t.style.viewTransitionName = "meeting-title";
  });

  /* --------------------------------------------------- jump to latest */
  const latestBtn = document.getElementById("jumpLatest");
  if (latestBtn) latestBtn.addEventListener("click", e => {
    e.preventDefault();
    const items = timelineEl.querySelectorAll(".tl-item");
    if (items.length) items[items.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
  });
})();
