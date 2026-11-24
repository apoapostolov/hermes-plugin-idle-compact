# idle-compact frames

`frames/idle-compact-statusbar-chip-and-panel.png` is the picture in the
pull request: the old status-bar chip, the new chip with its panel open, and
the new chip's hover tip.

The three panels are real output of `desktop/plugin.js` from both builds,
rendered to HTML through a stub host. The window chrome around them (the bar,
the empty chat area, the neighbouring item) is a drawing, not the app.

## Rebuild

```bash
pip install pillow                       # only for the crop
python harness/prepare.py <checkout> 0610670   # both renderer builds -> stubs
node harness/run.mjs                     # renders, asserts, writes the HTML parts
python harness/build_frame.py            # assembles frame.html
python -m http.server 8791 --directory harness
# open http://127.0.0.1:8791/frame.html, set 872x940 at deviceScaleFactor 2, shoot, crop
```

`harness/result.txt` is what `run.mjs` prints: 36 checks over the two builds,
including the empty-ledger and no-baseline states.

## The panel's headline row

`frames/idle-compact-panel-header-row.png` is the before/after for the one layout
change in 0.9.55: the money line left its own row and joined the headline row,
right aligned on the baseline of `saved`. Both panels are real output of the two
renderer builds; the column captions are a drawing.

```bash
python harness/prepare.py <checkout> 062fb39   # 0.9.54 as "before", the checkout's HEAD as "after"
node harness/run_header.mjs                    # renders both panels, asserts the row, writes the parts
python harness/build_header_frame.py           # assembles frame_header.html
python -m http.server 8791 --directory harness
# open http://127.0.0.1:8791/frame_header.html at 718x342, deviceScaleFactor 2, shoot
```

`harness/header-result.txt` is what `run_header.mjs` prints: 8 checks over the two
panels, including that the money span is a child of the headline row in 0.9.55 and a
block under it in 0.9.54.
