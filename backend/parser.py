import pymupdf4llm
import json

class PdfParser:
    def __init__(self):
        pass

    def parseWithMetadata(self, pdf_path):
        # output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True)
        output = pymupdf4llm.to_markdown(pdf_path, write_images=True)
        # output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True, write_images=True)

        # with open('output.json', 'w', encoding='utf-8') as f:
        #     json.dump(output, f, ensure_ascii=False, indent=4)

        # with open('output.txt', 'w', encoding='utf-8') as f:
        #     f.write(output)

# parser = PdfParser()
# parser.parseWithMetadata("./pdftest/fpreport.pdf")