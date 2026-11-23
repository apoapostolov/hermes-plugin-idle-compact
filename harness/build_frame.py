# Builds frame.html from the two real renderer outputs (old and new chip, new
# panel). Run run.mjs first: it writes old-chip.html / new-chip.html /
# new-panel.html straight out of the plugin module.
from pathlib import Path

H = Path(__file__).resolve().parent
old = (H / "old-chip.html").read_text(encoding="utf-8").strip()
new = (H / "new-chip.html").read_text(encoding="utf-8").strip()
opened = (H / "open-chip.html").read_text(encoding="utf-8").strip()
panel = (H / "new-panel.html").read_text(encoding="utf-8").strip()

TEMPLATE = """<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>idle-compact status bar</title>
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
/* Tailwind utilities the app compiles; a plugin's class names are not scanned,
   so the harness declares the ones the chip carries. */
.inline-flex{display:inline-flex}.h-full{height:100%}.items-center{align-items:center}
.gap-1{gap:.25rem}.px-1\\.5{padding-left:.375rem;padding-right:.375rem}
.text-\\[0\\.6875rem\\]{font-size:.6875rem}.text-\\(--ui-text-tertiary\\){color:var(--ui-text-tertiary)}
.bg-transparent{background:transparent}.cursor-pointer{cursor:pointer}.rounded-none{border-radius:0}
.transition-colors{transition:background-color .12s,color .12s}
button{border:0;font:inherit;color:inherit;padding:0;background:transparent}
.hover\\:bg-\\(--chrome-action-hover\\):hover{background:var(--chrome-action-hover)}
.hover\\:text-foreground:hover{color:var(--ui-text-primary)}
/* The app's PopoverContent: glass surface, 8px padding, arrow on the trigger side. */
.popover-content{width:20rem;padding:.5rem;border:1px solid var(--ui-stroke-secondary);
  border-radius:.5rem;background:color-mix(in srgb, var(--ui-bg-elevated) 92%, transparent);
  backdrop-filter:blur(12px);box-shadow:0 10px 28px rgba(0,0,0,.5)}
.separator{height:1px;background:var(--ui-stroke-secondary)}
.w-80{width:20rem}
.shot{padding:20px 26px 22px;width:820px}
.cap{font-size:10px;letter-spacing:.09em;text-transform:uppercase;color:#6f6f79;margin:0 0 7px}
.window{border-radius:10px;overflow:hidden;border:1px solid #1e1e22}
.sliver{height:34px;background:linear-gradient(180deg,#17171a,#141416);border-bottom:1px solid #1e1e22}
.bar{display:flex;height:20px;align-items:stretch;justify-content:flex-end;gap:8px;
  color:var(--ui-text-tertiary);padding:0 16px}
.bar .neighbour{display:inline-flex;align-items:center;padding:0 6px;font-size:.6875rem;color:#6f6f79}
.paneldock{display:flex;justify-content:flex-end;padding:0 16px;position:relative}
.arrow{position:absolute;bottom:-4px;right:29px;width:11px;height:11px;transform:rotate(45deg);
  background:#191920;border-right:1px solid var(--ui-stroke-secondary);
  border-bottom:1px solid var(--ui-stroke-secondary)}
.tiprow{display:flex;justify-content:flex-end;padding:0 16px 8px}
.tip{background:#202024;border:1px solid #34343c;border-radius:6px;padding:4px 7px;
  font-size:.6875rem;color:#c9c9d1;box-shadow:0 6px 18px rgba(0,0,0,.5);white-space:nowrap}
</style></head>
<body>
<div class="shot" id="shot">

  <p class="cap">Before &mdash; a remainder, a scale and a threshold inside a 20px bar</p>
  <div class="window">
    <div class="sliver"></div>
    <div class="bar">
      <span class="neighbour">hermes-next-steps</span>
      OLDCHIP
    </div>
  </div>
  <div style="height:18px"></div>

  <p class="cap">After &mdash; click: the rate, what it is worth, and this chat</p>
  <div class="window">
    <div class="paneldock">PANEL<span class="arrow"></span></div>
    <div class="sliver"></div>
    <div class="bar">
      <span class="neighbour">hermes-next-steps</span>
      OPENCHIP
    </div>
  </div>
  <div style="height:18px"></div>

  <p class="cap">After &mdash; hover: one line naming the plugin, the rate and the state</p>
  <div class="window">
    <div class="tiprow"><span class="tip">idle-compact &middot; 42% saved &middot; Below gate &mdash; won&rsquo;t touch</span></div>
    <div class="sliver"></div>
    <div class="bar">
      <span class="neighbour">hermes-next-steps</span>
      NEWCHIP2
    </div>
  </div>

</div>
</body></html>
"""

page = (TEMPLATE.replace("OLDCHIP", old)
                .replace("OPENCHIP", opened)
                .replace("NEWCHIP2", new)
                .replace("NEWCHIP", new)
                .replace("PANEL", panel))
(H / "frame.html").write_bytes(page.encode("utf-8"))
print("frame.html written")
