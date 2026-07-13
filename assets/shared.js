/* Shared helpers: project colors + date formatting */
const LAB_PALETTE = ["#CFB87C", "#4E7C9A", "#7C9A62", "#A25B4E", "#6E5B8B", "#3F8F8A", "#B0743C"];

/* Assign each project a stable color by order of first appearance (chronological). */
function projectColors(meetings) {
  const map = {};
  let i = 0;
  for (const m of meetings) {
    const p = m.project || "General";
    if (!(p in map)) map[p] = LAB_PALETTE[i++ % LAB_PALETTE.length];
  }
  return map;
}

function fmtDate(iso, opts) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", opts || { year: "numeric", month: "short", day: "numeric" });
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
