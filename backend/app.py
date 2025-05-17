import os
import uuid
import datetime
import requests
import json

from flask import Flask, request, jsonify, session as flask_session
from werkzeug.utils import secure_filename
from flask_cors import CORS

from model import EmbeddingModel
from parser import PdfParser
from db import VectorDatabase


PDF_PUBLIC_STORAGE_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)), "..", "public", "pdfs"
)

OLLAMA_API_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL_NAME = "llama3.2:1b"

MAX_CHAT_HISTORY_TURNS = 5
SESSION_TIMEOUT_MINUTES = 60

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.secret_key = "secret_ollama_key"
app.permanent_session_lifetime = datetime.timedelta(minutes=SESSION_TIMEOUT_MINUTES)


embedding_model = EmbeddingModel()
pdf_parser = PdfParser()
vector_db = VectorDatabase()


@app.route("/")
def hello():
    return "Hello World!"


def get_llm_response(prompt_with_context, chat_history_for_llm):
    url = f"{OLLAMA_API_BASE_URL}/api/chat"
    messages = []

    if chat_history_for_llm:
        messages.extend(chat_history_for_llm)

    messages.append({"role": "user", "content": prompt_with_context})

    payload = {
        "model": OLLAMA_MODEL_NAME,
        "messages": messages,
        "stream": False,
    }

    try:
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        response_data = response.json()

        if (
            response_data
            and ("message" in response_data)
            and ("content" in response_data["message"])
        ):
            llm_text_response = response_data["message"]["content"]
            return llm_text_response
        else:
            return "Error: Could not parse response from Ollama."

    except requests.exceptions.RequestException as e:
        return f"Error: Could not connect to or receive a valid response from the Ollama model ({str(e)})."
    except json.JSONDecodeError as e:
        return "Error: Invalid JSON response from Ollama."


def get_pdf_session_chat_history(pdf_session_id):
    return flask_session.get(f"chat_history_{pdf_session_id}", [])


def add_to_pdf_session_chat_history(pdf_session_id, role, content):
    history = get_pdf_session_chat_history(pdf_session_id)
    history.append(
        {
            "role": role,
            "content": content,
            "timestamp": datetime.datetime.now().isoformat(),
        }
    )
    if len(history) > MAX_CHAT_HISTORY_TURNS * 2:
        history = history[-(MAX_CHAT_HISTORY_TURNS * 2) :]
    flask_session[f"chat_history_{pdf_session_id}"] = history
    flask_session.modified = True
    return history


def clear_pdf_session_chat_history(pdf_session_id):
    session_key = f"chat_history_{pdf_session_id}"
    if session_key in flask_session:
        del flask_session[session_key]
        flask_session.modified = True


@app.route("/api/process_pdf", methods=["POST"])
def process_pdf_endpoint():
    data = request.get_json()
    pdf_filename = data.get("filename")

    if not pdf_filename:
        return jsonify({"error": "No filename provided"}), 400

    safe_pdf_filename = secure_filename(pdf_filename)
    pdf_full_path = os.path.join(PDF_PUBLIC_STORAGE_DIR, safe_pdf_filename)

    if not os.path.exists(pdf_full_path):
        return (
            jsonify(
                {
                    "error": f"PDF file '{safe_pdf_filename}' not found at {pdf_full_path}."
                }
            ),
            404,
        )

    pdf_internal_id = str(uuid.uuid4())

    try:
        page_chunks = pdf_parser.parse_page_chunking(pdf_full_path)
        all_sentence_objects = []
        for page_num_idx, page_chunk in enumerate(page_chunks):
            page_text = page_chunk["text"]
            page_sentences_text = embedding_model.sents_from_text(page_text)
            for sent_text in page_sentences_text:
                all_sentence_objects.append(
                    {
                        "id": int(uuid.uuid4().int & (2**63 - 1)),
                        "text": sent_text,
                        "page_number": page_num_idx + 1,
                        "pdf_internal_id": pdf_internal_id,
                        "original_filename": safe_pdf_filename,
                    }
                )

        if not all_sentence_objects:
            return jsonify({"error": "Could not extract text from PDF."}), 400

        sentence_texts_to_embed = [s_obj["text"] for s_obj in all_sentence_objects]
        embeddings = embedding_model.get_embeddings(sentence_texts_to_embed)

        collection_name = "yo_gurt"
        dimension = embeddings.shape[1]

        if vector_db.client.has_collection(collection_name):
            vector_db.delete_collection(collection_name)
        vector_db.create_collection(collection_name, dimension)

        data_to_insert_into_milvus = [
            {
                "id": s_obj["id"],
                "vector": embeddings[i].tolist(),
                "original_text": s_obj["text"],
                "page_number": s_obj["page_number"],
                "pdf_internal_id": s_obj["pdf_internal_id"],
            }
            for i, s_obj in enumerate(all_sentence_objects)
        ]

        vector_db.client.insert(
            collection_name=collection_name, data=data_to_insert_into_milvus
        )

        pdf_session_id = str(uuid.uuid4())
        clear_pdf_session_chat_history(pdf_session_id)

        return (
            jsonify(
                {
                    "message": "PDF processed and ready for chat.",
                    "pdf_internal_id": pdf_internal_id,
                    "original_filename": safe_pdf_filename,
                    "collection_name_for_rag": collection_name,
                    "pdf_session_id": pdf_session_id,
                }
            ),
            200,
        )

    except Exception as e:
        return jsonify({"error": f"Error processing PDF: {str(e)}"}), 500


@app.route("/api/chat_with_pdf", methods=["POST"])
def chat_with_pdf_endpoint():
    data = request.get_json()
    user_question = data.get("query")
    pdf_session_id = data.get("pdf_session_id")
    collection_name_for_rag = data.get("collection_name_for_rag")

    if not all([user_question, pdf_session_id, collection_name_for_rag]):
        return (
            jsonify(
                {"error": "Missing query, pdf_session_id, or collection_name_for_rag"}
            ),
            400,
        )

    chat_history_for_llm = get_pdf_session_chat_history(pdf_session_id)
    add_to_pdf_session_chat_history(pdf_session_id, "user", user_question)

    question_embedding = embedding_model.get_embeddings([user_question])[0].tolist()
    retrieved_context_texts = []

    if vector_db.client.has_collection(collection_name_for_rag):
        search_payload = {"metric_type": "COSINE", "params": {"nprobe": 10}}
        results = vector_db.client.search(
            collection_name=collection_name_for_rag,
            data=[question_embedding],
            search_params=search_payload,
            limit=5,
            output_fields=["original_text", "page_number"],
        )

        for result_set in list(results):
            for result in result_set:
                retrieved_context_texts.append(result["entity"]["original_text"])

    current_turn_prompt_for_llm = ""
    if retrieved_context_texts:
        current_turn_prompt_for_llm += (
            "Based on the following context from the document:\n"
        )
        for i, chunk_text in enumerate(retrieved_context_texts):
            current_turn_prompt_for_llm += f"{i+1}. {chunk_text}\n"
        current_turn_prompt_for_llm += (
            f"\nNow, please answer the user's question: {user_question}"
        )
    else:
        current_turn_prompt_for_llm += f"Please answer the user's question (no specific context found, use general knowledge or the document if previously discussed): {user_question}"

    llm_answer = get_llm_response(current_turn_prompt_for_llm, chat_history_for_llm)
    add_to_pdf_session_chat_history(pdf_session_id, "assistant", llm_answer)

    return jsonify(
        {
            "answer": llm_answer,
            "pdf_session_id": pdf_session_id,
            "retrieved_context_for_debug": retrieved_context_texts,
        }
    )


@app.route("/api/get_chat_history/<pdf_session_id>", methods=["GET"])
def get_history_endpoint(pdf_session_id):
    if not pdf_session_id:
        return jsonify({"error": "No pdf_session_id provided"}), 400

    history = get_pdf_session_chat_history(pdf_session_id)

    return jsonify({"pdf_session_id": pdf_session_id, "history": history}), 200


@app.route("/api/clear_chat_history/<pdf_session_id>", methods=["POST"])
def clear_history_endpoint(pdf_session_id):
    if not pdf_session_id:
        return jsonify({"error": "No pdf_session_id provided"}), 400

    clear_pdf_session_chat_history(pdf_session_id)

    return (
        jsonify({"message": f"Chat history for PDF session {pdf_session_id} cleared."}),
        200,
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
