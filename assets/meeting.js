/* Meeting page — hydrates itself from ./meta.json + ../../meetings.json */
(async function () {
  const $ = id => document.getElementById(id);

  const [metaRes, indexRes] = await Promise.allSettled([
    fetch("meta.json", { cache: "no-store" }),
    fetch("../../meetings.json", { cache: "no-store" }),
  ]);

  let meta = null;
  if (metaRes.status === "fulfilled" && metaRes.value.ok) {
    try { meta = await metaRes.value.json(); } catch (e) { /* handled below */ }
  }
  if (!meta) {
    $("meeting").innerHTML =
      '<div class="error-state"><strong>Couldn&rsquo;t load meta.json for this meeting.</strong><br>' +
      "Check that the folder contains a valid <code>meta.json</code>.</div>";
    return;
  }

  let all = [];
  if (indexRes.status === "fulfilled" && indexRes.value.ok) {
    try { all = (await indexRes.value.json()).meetings || []; } catch (e) { /* optional */ }
  }

  const slug = location.pathname.replace(/\/(index\.html)?$/, "").split("/").pop();
  const colors = projectColors(all);
  const accent = colors[meta.project || "General"] || "#CFB87C";

  document.title = `${meta.title} — Kasinath Lab Meetings`;

  /* ------------------------------------------------------------- header */
  $("mDate").textContent = fmtDate(meta.date, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  if (meta.project) {
    const chip = $("mProject");
    chip.textContent = meta.project;
    chip.style.background = accent;
    chip.hidden = false;
  }
  const h1 = $("mTitle");
  h1.textContent = meta.title;
  h1.style.viewTransitionName = "meeting-title"; // completes the morph from the timeline card
  if (meta.summary) $("mSummary").textContent = meta.summary;

  /* ---------------------------------------------------------- takeaways */
  if (Array.isArray(meta.takeaways) && meta.takeaways.length) {
    $("takeawaysSection").hidden = false;
    $("mTakeaways").innerHTML = meta.takeaways.map(t => `<li>${esc(t)}</li>`).join("");
  }

  /* -------------------------------------------------------------- links */
  if (Array.isArray(meta.links) && meta.links.length) {
    $("linksSection").hidden = false;
    $("mLinks").innerHTML = meta.links
      .map(l => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label || l.url)} ↗</a></li>`)
      .join("");
  }

  /* ------------------------------------------------------------- slides */
  const slidesFile = meta.slides || "slides.pdf";
  let hasSlides = false;
  try { hasSlides = (await fetch(slidesFile, { method: "HEAD" })).ok; } catch (e) { /* no slides */ }

  if (hasSlides) {
    $("slidesEmbed").innerHTML =
      `<object class="slides-frame" data="${esc(slidesFile)}#view=FitH" type="application/pdf">
         <div class="slides-missing">Your browser can&rsquo;t display embedded PDFs — use the buttons below.</div>
       </object>
       <div class="slides-actions">
         <a class="btn" href="${esc(slidesFile)}" target="_blank" rel="noopener">Open slides in new tab</a>
         <a class="btn secondary" href="${esc(slidesFile)}" download>Download PDF</a>
       </div>`;
  } else {
    $("slidesEmbed").innerHTML =
      '<div class="slides-missing">Slides haven&rsquo;t been uploaded for this meeting yet.<br>' +
      "Drop a <code>slides.pdf</code> into this meeting&rsquo;s folder and push.</div>";
  }

  /* -------------------------------------------------------- prev / next */
  const i = all.findIndex(m => m.slug === slug);
  if (i !== -1 && all.length > 1) {
    const prev = all[i - 1], next = all[i + 1];
    $("pager").innerHTML =
      (prev
        ? `<a href="../${esc(prev.slug)}/"><div class="dir">← Previous</div><div class="pt">${esc(prev.title)}</div></a>`
        : '<a class="spacer"></a>') +
      (next
        ? `<a class="next" href="../${esc(next.slug)}/"><div class="dir">Next →</div><div class="pt">${esc(next.title)}</div></a>`
        : '<a class="spacer"></a>');
  }
})();
