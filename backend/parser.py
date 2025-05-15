import pymupdf4llm

class PdfParser:
    def __init__(self):
        return

    # Good parsing method to feed into LLM directly
    def simple_parse(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path)
        return output

    # Good parsing methods to feed into Embedding Model
    # Probably should just use embedded images method to simplify
    # Page chunking should be better for LLM context (Can point to specific area in pdf that is relevent)
    def parse_page_chunking(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True)
        return output

    def parse_embed_images(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, embed_images=True)
        return output

    def parse_save_images(self, pdf_path, img_path=""):
        output = pymupdf4llm.to_markdown(pdf_path, write_images=True, image_path=img_path)
        return output

# TESTING
# parser = PdfParser()
# output = parser.parse_embed_images("./test.pdf")
# print(output)