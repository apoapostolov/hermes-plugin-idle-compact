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
