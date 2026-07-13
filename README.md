# Kasinath Lab Meetings

George Stephenson's lab meeting archive — Kasinath Lab, University of Colorado Boulder.

**Live site:** https://gsstephenson.github.io/Kasinath_Lab_Meetings/

The main page is a chronological timeline of every meeting, color-coded by project
thread. Each meeting has its own page with the slide deck, a summary, key takeaways,
and previous/next navigation.

## Adding a new meeting (the whole workflow)

1. Copy the `_template/` folder into `meetings/` and rename it `YYYY-MM-DD-short-title`:

   ```
   meetings/2026-08-03-cryoem-grid-screening/
   ```

2. Edit its `meta.json` — title, date, project, summary, takeaways. Only `title`
   and `date` are required. Meetings with the same `project` share a color thread
   on the timeline.

3. Drop your slides into the folder as `slides.pdf`
   (in PowerPoint: File → Export → PDF).

4. Commit and push:

   ```bash
   git add meetings/ && git commit -m "Lab meeting 2026-08-03" && git push
   ```

That's it. A GitHub Action rebuilds `meetings.json`, and the timeline updates itself
within a minute or two. You never edit `index.html` or `meetings.json` by hand.
(The Action even copies the page template into your folder if you forget —
a meeting folder only *needs* `meta.json` + `slides.pdf`.)

## One-time setup

1. Push this repo to `main`.
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root) → Save.**
3. On GitHub: **Settings → Actions → General → Workflow permissions →
   "Read and write permissions" → Save.** (Lets the Action commit the rebuilt index.)
4. Delete the three `meetings/2026-*-example-*` folders whenever you're ready —
   they exist only to demo the timeline.

## Local preview

`fetch()` doesn't work from `file://`, so serve the folder:

```bash
python3 -m http.server        # then open http://localhost:8000
```

If you add meetings locally and want to preview them, rebuild the index first:

```bash
python3 scripts/build_index.py
```

## Structure

```
index.html                  main timeline page
meetings.json               auto-generated index (don't edit)
assets/                     shared CSS + JS
meetings/<date-title>/      one folder per meeting: meta.json, slides.pdf, index.html
_template/                  copy this to start a new meeting
scripts/build_index.py      scans meetings/ -> meetings.json
.github/workflows/          runs the script on every push
```

## Customizing

- Hero text, name, blurb: edit `index.html`.
- Colors: CSS variables at the top of `assets/style.css`
  (CU Boulder palette: gold `#CFB87C`, black, grays `#565A5C` / `#A2A4A3`).
- Project thread colors: `LAB_PALETTE` in `assets/shared.js`.
