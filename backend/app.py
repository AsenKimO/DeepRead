import os
import uuid
import datetime # For message timestamps
import requests # For calling Ollama API
import json # For handling JSON data with Ollama

from flask import Flask, request, jsonify, session as flask_session, current_app
from werkzeug.utils import secure_filename
from flask_cors import CORS

from model import EmbeddingModel
from parser import PdfParser
from db import VectorDatabase

# from pymilvus import MilvusClient
# from db import VectorDatabase

# --- Configuration ---
PDF_PUBLIC_STORAGE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'public', 'pdfs')

# TODO: setup env file?
OLLAMA_API_BASE_URL = "http://localhost:11434"
OLLAMA_MODEL_NAME = "llama3.2:1b"

MAX_CHAT_HISTORY_TURNS = 5 # Reduced for shorter context to Ollama, adjust as needed
SESSION_TIMEOUT_MINUTES = 60

# --- Initialize Flask App and Services ---
app = Flask(__name__)
# model = EmbeddingModel()
# parser = PdfParser()
# db = VectorDatabase()
# db = MilvusClient("milvus.db")

CORS(app, supports_credentials=True)

app.secret_key = "your_very_secret_key_for_dev_ollama" # Replace in production
app.permanent_session_lifetime = datetime.timedelta(minutes=SESSION_TIMEOUT_MINUTES)

embedding_model = EmbeddingModel()
pdf_parser = PdfParser()
vector_db = VectorDatabase()

# --- Helper Functions ---
def get_llm_response(prompt_with_context, chat_history_for_llm, model_name=OLLAMA_MODEL_NAME):
    """
    Sends a prompt and chat history to the specified Ollama model.
    Args:
        prompt_with_context (str): The user's query, augmented with RAG context.
        chat_history_for_llm (list): A list of message dictionaries (e.g., [{"role": "user", "content": "..."}, ...]).
        model_name (str): The name of the Ollama model to use.
    Returns:
        str: The LLM's response text
    """
    ollama_api_url = f"{OLLAMA_API_BASE_URL}/api/chat" # Using the /api/chat endpoint

    # Construct the messages payload for Ollama's /api/chat
    # It usually expects a list of messages with 'role' and 'content'
    messages_payload = []

    # Optional: Add a system prompt if your use case benefits from it
    # messages_payload.append({"role": "system", "content": "You are a helpful assistant knowledgeable about the provided document."})

    # Add existing chat history
    if chat_history_for_llm:
        messages_payload.extend(chat_history_for_llm)

    # Add the current user query (which includes RAG context)
    # For /api/chat, the prompt_with_context is the user's current turn.
    messages_payload.append({"role": "user", "content": prompt_with_context})

    payload = {
        "model": model_name,
        "messages": messages_payload,
        "stream": False  # Set to False to get the full response at once
    }

    print(f"\n--- Sending to Ollama ({model_name} at {ollama_api_url}) ---")
    print(f"Payload: {json.dumps(payload, indent=2)}\n")

    try:
        response = requests.post(ollama_api_url, json=payload, timeout=120) # Increased timeout for LLM
        response.raise_for_status()  # Raise an exception for HTTP errors (4xx or 5xx)
        
        response_data = response.json()
        
        # The structure of the response from /api/chat when stream=False
        # is typically like: {"model": "...", "created_at": "...", "message": {"role": "assistant", "content": "..."}}
        if response_data and ("message" in response_data) and ("content" in response_data["message"]):
            llm_text_response = response_data["message"]["content"]
            print(f"--- Ollama Response ---\n{llm_text_response}\n-----------------------\n")
            return llm_text_response
        else:
            print(f"Error: Unexpected Ollama response format: {response_data}")
            return "Error: Could not parse response from Ollama."

    except requests.exceptions.RequestException as e:
        print(f"Error calling Ollama API: {e}")
        return f"Error: Could not connect to or receive a valid response from the Ollama model ({str(e)})."
    except json.JSONDecodeError as e:
        print(f"Error decoding Ollama JSON response: {e}")
        print(f"Raw response: {response.text}")
        return "Error: Invalid JSON response from Ollama."

def get_pdf_session_chat_history(pdf_session_id):
    return flask_session.get(f"chat_history_{pdf_session_id}", [])

def add_to_pdf_session_chat_history(pdf_session_id, role, content):
    history = get_pdf_session_chat_history(pdf_session_id)
    history.append({
        "role": role, # "user" or "assistant"
        "content": content,
        "timestamp": datetime.datetime.now().isoformat()
    })
    if len(history) > MAX_CHAT_HISTORY_TURNS * 2: # Each turn has a user and assistant message
        history = history[-(MAX_CHAT_HISTORY_TURNS * 2):]
    flask_session[f"chat_history_{pdf_session_id}"] = history
    flask_session.modified = True
    return history

def clear_pdf_session_chat_history(pdf_session_id):
    session_key = f"chat_history_{pdf_session_id}"
    if session_key in flask_session:
        del flask_session[session_key]
        flask_session.modified = True

# --- API Endpoints ---
@app.route("/api/process_pdf", methods=["POST"])
def process_pdf_endpoint():
    """
    POST
    {
        "filename": filename
    }

    Response
    {
        "message": "PDF processed and ready for chat.",
        "pdf_internal_id": pdf_internal_id,
        "original_filename": safe_pdf_filename,
        "collection_name_for_rag": collection_name,
        "pdf_session_id": pdf_session_id
    }
    """
    data = request.get_json()
    pdf_filename = data.get("filename")

    if not pdf_filename:
        return jsonify({"error": "No filename provided"}), 400

    safe_pdf_filename = secure_filename(pdf_filename)
    pdf_full_path = os.path.join(PDF_PUBLIC_STORAGE_DIR, safe_pdf_filename)

    if not os.path.exists(pdf_full_path):
        return jsonify({"error": f"PDF file '{safe_pdf_filename}' not found at {pdf_full_path}."}), 404

    pdf_internal_id = str(uuid.uuid4())

    try:
        page_chunks = pdf_parser.parse_page_chunking(pdf_full_path)
        all_sentence_objects = []
        for page_num_idx, page_chunk in enumerate(page_chunks):
            # Extract just the text content from the page chunk
            page_text = page_chunk["text"]
            # Convert markdown text to sentences
            page_sentences_text = embedding_model.sents_from_text(page_text)
            for sent_text in page_sentences_text:
                all_sentence_objects.append({
                    "id": int(uuid.uuid4().int & (2**63-1)),
                    "text": sent_text,
                    "page_number": page_num_idx + 1,
                    "pdf_internal_id": pdf_internal_id,
                    "original_filename": safe_pdf_filename
                })

        if not all_sentence_objects:
            return jsonify({"error": "Could not extract text from PDF."}), 400

        sentence_texts_to_embed = [s_obj["text"] for s_obj in all_sentence_objects]

        print("\nHEAD:")
        for i, text in enumerate(sentence_texts_to_embed[:3]):
            print(f"{i+1}. {text}")
        print("\n...")
        print("\nTAIL:")
        
        for i, text in enumerate(sentence_texts_to_embed[-3:]):
            print(f"{len(sentence_texts_to_embed)-2+i}. {text}")
        embeddings = embedding_model.get_embeddings(sentence_texts_to_embed)
        print(f"Generated embeddings shape: {embeddings.shape}")  # Shows dimensions of embedding matrix

        collection_name = f"pdf_coll_{pdf_internal_id.replace('-', '_')}"
        dimension = embeddings.shape[1]

        if vector_db.client.has_collection(collection_name):
            vector_db.delete_collection(collection_name)
        vector_db.create_collection(collection_name, dimension) # Ensure schema is defined here or in db.py

        data_to_insert_into_milvus = [{
            "id": s_obj["id"],
            "vector": embeddings[i].tolist(),
            "original_text": s_obj["text"],
            "page_number": s_obj["page_number"],
            "pdf_internal_id": s_obj["pdf_internal_id"]
        } for i, s_obj in enumerate(all_sentence_objects)]

        insert_result = vector_db.client.insert(collection_name=collection_name, data=data_to_insert_into_milvus)
        # print(f"Milvus insert for {collection_name}: PKs-{insert_result.primary_keys[:3]}..., Count-{insert_result.insert_count}")
        print(f"Milvus insert for {collection_name}: successful")

        # ensure Milvus Lite auto-flushes or call flush if needed.
        # vector_db.client.flush([collection_name]) # May be needed for immediate searchability
        # vector_db.client.load_collection(collection_name) # Ensure collection is loaded

        pdf_session_id = str(uuid.uuid4())
        clear_pdf_session_chat_history(pdf_session_id)

        return jsonify({
            "message": "PDF processed and ready for chat.",
            "pdf_internal_id": pdf_internal_id,
            "original_filename": safe_pdf_filename,
            "collection_name_for_rag": collection_name,
            "pdf_session_id": pdf_session_id
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Error processing PDF: {str(e)}"}), 500

@app.route("/api/chat_with_pdf", methods=["POST"])
def chat_with_pdf_endpoint():
    """
    POST
    {
        "query" = query
        "pdf_session_id" = pdf_session_id
        "collection_name_for_rag" = collection_name_for_rag
    }

    Response
    {
        "answer": llm_answer,
        "pdf_session_id": pdf_session_id,
        "retrieved_context_for_debug": retrieved_context_texts
    }
    """
    data = request.get_json()
    user_question = data.get("query")
    pdf_session_id = data.get("pdf_session_id")
    collection_name_for_rag = data.get("collection_name_for_rag")

    if not all([user_question, pdf_session_id, collection_name_for_rag]):
        return jsonify({"error": "Missing query, pdf_session_id, or collection_name_for_rag"}), 400

    # Important: Ollama's /api/chat expects history as a list of {"role": "...", "content": "..."}
    # The history should reflect the conversation turns.
    chat_history_for_llm = get_pdf_session_chat_history(pdf_session_id)
    
    # Add current user question to history *after* retrieving for LLM context
    # The add_to_pdf_session_chat_history will handle the role and content
    add_to_pdf_session_chat_history(pdf_session_id, "user", user_question)

    question_embedding = embedding_model.get_embeddings([user_question])[0].tolist()
    retrieved_context_texts = []

    # Find semantically similar vectors
    if vector_db.client.has_collection(collection_name_for_rag):
        try:
            search_params = {"metric_type": "L2", "params": {"nprobe": 10}}
            results = vector_db.client.search(
                collection_name=collection_name_for_rag,
                data=[question_embedding],
                anns_field="vector", param=search_params, limit=3,
                output_fields=["original_text", "page_number"]
            )
            if results and results[0]:
                for hit in results[0]:
                    entity_data = hit.entity if hasattr(hit, 'entity') else hit
                    text = entity_data.get("original_text", "")
                    page = entity_data.get("page_number", "N/A")
                    retrieved_context_texts.append(f"(Source: Page {page}): {text}")
        except Exception as e:
            print(f"Error querying Milvus for {collection_name_for_rag}: {str(e)}")

    # Construct the specific input for the current turn for the LLM, including RAG
    current_turn_prompt_for_llm = ""
    if retrieved_context_texts:
        current_turn_prompt_for_llm += "Based on the following context from the document:\n"
        for i, chunk_text in enumerate(retrieved_context_texts):
            current_turn_prompt_for_llm += f"{i+1}. {chunk_text}\n"
        current_turn_prompt_for_llm += f"\nNow, please answer the user's question: {user_question}"
    else:
        current_turn_prompt_for_llm += f"Please answer the user's question (no specific context found, use general knowledge or the document if previously discussed): {user_question}"

    # Get response from Ollama LLM
    llm_answer = get_llm_response(current_turn_prompt_for_llm, chat_history_for_llm)
    
    # Add LLM's response to this session's history
    add_to_pdf_session_chat_history(pdf_session_id, "assistant", llm_answer)

    return jsonify({
        "answer": llm_answer,
        "pdf_session_id": pdf_session_id,
        "retrieved_context_for_debug": retrieved_context_texts
    })

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
    return jsonify({"message": f"Chat history for PDF session {pdf_session_id} cleared."}), 200
    



@app.route("/")
def embed():
    # sentence = "This is an example sentence"
    pdf_path = "pdftest/test.pdf"
    raw_text = pdf_parser.simple_parse(pdf_path)
    sentences = embedding_model.sents_from_text(raw_text)
    for sent in sentences:
        print(sent)
        print("----------------------------------------------")
    embeddings = embedding_model.get_embeddings(sentences)
    print(len(embeddings))  # to create collection
    return embedding_model.get_embeddings(sentences).tolist()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True, use_reloader=False)
