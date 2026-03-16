import fitz # PyMuPDF
import os

pdf_path = "PDF/Automation and Elecricals Solution - Company Profile (1).pdf"
out_dir = "images/extracted/"

if not os.path.exists(out_dir):
    os.makedirs(out_dir)

doc = fitz.open(pdf_path)
count = 0
for i in range(len(doc)):
    for img in doc.get_page_images(i):
        xref = img[0]
        pix = fitz.Pixmap(doc, xref)
        
        # If image is CMYK or other, convert to RGB
        if pix.n - pix.alpha > 3:
            pix = fitz.Pixmap(fitz.csRGB, pix)
            
        pix.save(f"{out_dir}img_{count}.png")
        pix = None
        count += 1

print(f"Extracted {count} images to {out_dir}")
