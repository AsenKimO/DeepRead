from flask import Flask
from model import EmbeddingModel
from parser import PdfParser

# from pymilvus import MilvusClient

# from db import VectorDatabase

app = Flask(__name__)
model = EmbeddingModel()
parser = PdfParser()
# db = VectorDatabase()
# db = MilvusClient("milvus.db")


@app.route("/")
def embed():
    # sentence = "This is an example sentence"
    pdf_path = "pdftest/test.pdf"
    raw_text = parser.simple_parse(pdf_path)
    sentences = model.sents_from_text(raw_text)
    for sent in sentences:
        print(sent)
        print("----------------------------------------------")
    embeddings = model.get_embeddings(sentences)
    print(len(embeddings))  # to create collection
    return model.get_embeddings(sentences).tolist()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
