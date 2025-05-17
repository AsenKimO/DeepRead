import pymupdf4llm


class PdfParser:
    def simple_parse(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path)
        return output

    def parse_page_chunking(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, page_chunks=True)
        return output

    def parse_embed_images(self, pdf_path):
        output = pymupdf4llm.to_markdown(pdf_path, embed_images=True)
        return output

    def parse_save_images(self, pdf_path, img_path=""):
        output = pymupdf4llm.to_markdown(
            pdf_path, write_images=True, image_path=img_path
        )
        return output
