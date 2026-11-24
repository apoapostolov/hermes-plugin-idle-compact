# Builds frame_header.html from the two real renderer outputs: the panel as
# 0.9.54 draws it beside the panel as 0.9.55 draws it. Run run_header.mjs first:
# it writes old-panel.html and new-panel.html straight out of the plugin module.
from pathlib import Path

H = Path(__file__).resolve().parent
old = (H / "old-panel.html").read_text(encoding="utf-8").strip()
new = (H / "new-panel.html").read_text(encoding="utf-8").strip()

TEMPLATE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>idle-compact panel: the money line, 0.9.54 vs 0.9.55</title>
<link rel="stylesheet" href="codicon.css">
<style>
:root{
  --ui-text-primary:#e8e8ea; --ui-text-secondary:#b6b6bd; --ui-text-tertiary:#8b8b95;
  --ui-bg-elevated:#1b1b1f; --ui-stroke-secondary:#33333b; --popover-surface:#1b1b1f;
  --ui-sidebar-surface-background:#131315; --chrome-action-hover:rgba(255,255,255,.07);
  color-scheme: dark;
}
*{box-sizing:border-box}
body{margin:0;background:#0b0b0d;color:var(--ui-text-primary);
  font-family:"Segoe UI",system-ui,-apple-system,sans-serif;-webkit-font-smoothing:antialiased}
.popover-content{width:20rem;padding:.5rem;border:1px solid var(--ui-stroke-secondary);
  border-radius:.5rem;background:color-mix(in srgb, var(--ui-bg-elevated) 92%, transparent);
  box-shadow:0 10px 28px rgba(0,0,0,.5)}
.separator{height:1px;background:var(--ui-stroke-secondary)}
.w-80{width:20rem}
.shot{padding:22px 26px 24px;display:flex;gap:26px;align-items:flex-start}
.col{display:flex;flex-direction:column;gap:9px}
.cap{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#6f6f79;margin:0}
.cap b{color:#9a9aa4;font-weight:600}
</style></head>
<body><div class="shot">
  <div class="col"><p class="cap">before &middot; <b>0.9.54</b> &mdash; money on its own line</p>__OLD__</div>
  <div class="col"><p class="cap">after &middot; <b>0.9.55</b> &mdash; same line, right aligned</p>__NEW__</div>
</div></body></html>"""

page = TEMPLATE.replace("__OLD__", old).replace("__NEW__", new)
(H / "frame_header.html").write_text(page, encoding="utf-8")
print("wrote frame_header.html")
