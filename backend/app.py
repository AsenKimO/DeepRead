from flask import Flask
from backend.models.model import EmbeddingModel

# from pymilvus import MilvusClient

# from db import VectorDatabase

app = Flask(__name__)
model = EmbeddingModel()
# db = VectorDatabase()
# db = MilvusClient("milvus.db")


@app.route("/")
def embed():
    sentence = "This is an example sentence"
    print(len(model.get_embeddings(sentence)))  # to create collection
    return model.get_embeddings(sentence).tolist()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
