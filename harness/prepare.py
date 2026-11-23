"""Point the two renderer builds at the harness stubs.

    python prepare.py <plugin-checkout> <base-sha>

<plugin-checkout> is a clone of this repository at the branch under review;
<base-sha> is the commit whose `desktop/plugin.js` the frame calls "before"
(here 0610670, the 0.9.53 chip). Writes plugin_new.mjs and plugin_old.mjs
beside this file.
"""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
checkout = Path(sys.argv[1]).resolve()
base = sys.argv[2]


def rewrite(source):
    return (source
            .replace("from '@hermes/plugin-sdk'", "from './sdk.mjs'")
            .replace("from 'react/jsx-runtime'", "from './shim.mjs'")
            .replace("from 'react'", "from './react_stub.mjs'"))


new = (checkout / "desktop" / "plugin.js").read_text(encoding="utf-8")
(HERE / "plugin_new.mjs").write_text(rewrite(new), encoding="utf-8")

old = subprocess.run(["git", "-C", str(checkout), "show", f"{base}:desktop/plugin.js"],
                     capture_output=True, text=True, check=True).stdout
(HERE / "plugin_old.mjs").write_text(rewrite(old), encoding="utf-8")
print("wrote plugin_new.mjs and plugin_old.mjs")
