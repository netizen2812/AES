import os
import glob

html = "<html><body><h1>Gallery</h1><div style='display:flex; flex-wrap:wrap;'>"
images = sorted(glob.glob("images/extracted/*.png"))

for path in images:
    html += f"<div style='margin:10px; border:1px solid #ccc; padding:10px; text-align:center;'><p style='font-size:24px; font-weight:bold;'>{path}</p><img src='{path}' width='300'></div>"

html += "</div></body></html>"

with open("gallery.html", "w") as f:
    f.write(html)
print("Gallery created at gallery.html")
