import fitz
import os
#pymupdf
def extract_text_from_pdf(file_path):

    doc = fitz.open(file_path)

    pages = []

    for page_number, page in enumerate(doc):

        text = page.get_text()

        pages.append({
            "text": text,
            "page": page_number + 1
        })

    return pages
# Uses PyMuPDF for extracting text from the pdf.
