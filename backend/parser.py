import pymupdf4llm
import json

class PdfParser:
    def __init__(self):
        pass

    def simple_parse(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path)
        return output

    def parse_page_chunking(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True)
        # output = pymupdf4llm.to_markdown(pdf_path, write_images=True)
        # output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True, write_images=True)

        # with open('output.json', 'w', encoding='utf-8') as f:
        #     json.dump(output, f, ensure_ascii=False, indent=4)

        # with open('output.txt', 'w', encoding='utf-8') as f:
        #     f.write(output)
        return output

    def parse_embed_images(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, embed_images=True)
        return output

    def parse_save_images(self, pdf_path, img_path=""):
        output = pymupdf4llm.to_markdown(pdf_path, write_images=True, image_path=img_path)
        return output

parser = PdfParser()
output = parser.parse_embed_images("./test.pdf")
print(output)