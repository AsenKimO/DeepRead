from sentence_transformers import SentenceTransformer
from nltk.tokenize import PunktTokenizer
import nltk
import re

class EmbeddingModel:
    def __init__(self):
        self.model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
        nltk.download('punkt_tab')
        self.tokenizer = PunktTokenizer()
        return
    
    def _clean_text(self, text):
        text = text.replace('ﬁ', 'fi')
        text = text.replace('ﬂ', 'fl')
        text = text.replace('fifi', 'fi')
        text = text.replace('flfl', 'fl')
        text = re.sub(r'([a-zA-Z]+)-\n([a-zA-Z]+)', r'\1\2', text)
        text = text.replace('\n', ' ')
        text = ' '.join(text.split())
        return text

    def sents_from_text(self, text):
        cleaned_text = self._clean_text(text)
        # print(cleaned_text)
        # print("----------------------------------------------")
        sentences = self.tokenizer.tokenize(cleaned_text)
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
# sentences = model.sents_from_text(raw_pdf_text)
# for sent in sentences:
#     print(sent)
#     print("----------------------------------------------")