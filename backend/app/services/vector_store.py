import os
from langchain_chroma import Chroma
from app.services.embeddings import create_embeddings

# ✅ GLOBAL STORE (tracks active DBs)
ACTIVE_DBS = {}


def store_chunks(chunks, user_id: int):

    embeddings = create_embeddings()

    texts = [chunk["text"] for chunk in chunks]
    metadatas = [chunk["metadata"] for chunk in chunks]

    persist_directory = f"vector_db/user_{user_id}"
    os.makedirs(persist_directory, exist_ok=True)

    vector_db = Chroma.from_texts(
        texts=texts,
        embedding=embeddings,
        metadatas=metadatas,
        persist_directory=persist_directory
    )

    # ✅ track instance
    ACTIVE_DBS[user_id] = vector_db

    return vector_db


def get_vector_db(user_id: int):

    # ✅ return existing instance if present
    if user_id in ACTIVE_DBS:
        return ACTIVE_DBS[user_id]

    embeddings = create_embeddings()

    persist_directory = f"vector_db/user_{user_id}"

    if not os.path.exists(persist_directory):
        return None

    db = Chroma(
        persist_directory=persist_directory,
        embedding_function=embeddings
    )

    # ✅ track instance
    ACTIVE_DBS[user_id] = db

    return db


# ✅ CRITICAL: force close DB
def close_vector_db(user_id: int):

    if user_id in ACTIVE_DBS:
        try:
            db = ACTIVE_DBS[user_id]

            # try to release internal client
            if hasattr(db, "_client"):
                db._client = None

            del ACTIVE_DBS[user_id]

        except Exception as e:
            print("Error closing DB:", e)