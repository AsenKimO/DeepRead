from flask import Flask
from model import EmbeddingModel

app = Flask(__name__)
model = EmbeddingModel()


@app.route("/")
def embed():
    sentence = "This is an example sentence"
    return model.get_embeddings(sentence).tolist()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
