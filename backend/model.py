from sentence_transformers import SentenceTransformer
from nltk.tokenize import PunktSentenceTokenizer
import re

class EmbeddingModel:
    def __init__(self):
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        self.tokenizer = PunktSentenceTokenizer()
        return
    
    def _clean_text(self, text: str) -> str:
        text = re.sub(r'([a-zA-Z]+)-\n([a-zA-Z]+)', r'\1\2', text)
        text = text.replace('\n', ' ')
        text = ' '.join(text.split())
        text = text.replace('fifi', 'fi')
        return text

    def tokenize(self, text):
        cleaned_text = self._clean_text(text)
        print(cleaned_text)
        print("----------------------------------------------")
        sentences = self.tokenizer.sentences_from_text(cleaned_text)
        sentences = [s.strip() for s in sentences if s.strip()]
        return sentences

    def get_embeddings(self, sentences):
        return self.model.encode(sentences)

# TESTING
# raw_pdf_text = """This is an introductory para-
# graph. It explains the main topic.
# Mr. Smith then said: "This is quite
# interesting! Isn't it?"
# Another point to consider. fifi character.
# """

# model = EmbeddingModel()
# sentences = model.tokenize(raw_pdf_text)
# for sent in sentences:
#     print(sent)
#     print("----------------------------------------------")