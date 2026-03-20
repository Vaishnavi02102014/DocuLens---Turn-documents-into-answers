import os
from langchain_chroma import Chroma
from app.services.embeddings import create_embeddings

# ✅ GLOBAL STORE (tracks active DBs)
ACTIVE_DBS = {}


def store_chunks(chunks, user_id: int):

    print(f"📦 Storing chunks for user {user_id}...")

    embeddings = create_embeddings()

    if embeddings is None:
        print("⚠️ Embeddings not available, skipping vector storage")
        return None

    try:
        texts = [chunk["text"] for chunk in chunks]
        metadatas = [chunk["metadata"] for chunk in chunks]

        persist_directory = f"vector_db/user_{user_id}"
        os.makedirs(persist_directory, exist_ok=True)

        print("🚀 Creating vector DB...")

        vector_db = Chroma.from_texts(
            texts=texts,
            embedding=embeddings,
            metadatas=metadatas,
            persist_directory=persist_directory
        )

        # ✅ track instance
        ACTIVE_DBS[user_id] = vector_db

        print("✅ Embeddings stored successfully")

        return vector_db

    except Exception as e:
        print("❌ Error storing embeddings:", str(e))
        return None


def get_vector_db(user_id: int):

    # ✅ return existing instance if present
    if user_id in ACTIVE_DBS:
        return ACTIVE_DBS[user_id]

    print(f"📂 Loading vector DB for user {user_id}...")

    embeddings = create_embeddings()

    if embeddings is None:
        print("⚠️ Embeddings not available, cannot load vector DB")
        return None

    persist_directory = f"vector_db/user_{user_id}"

    if not os.path.exists(persist_directory):
        print("⚠️ No vector DB found")
        return None

    try:
        db = Chroma(
            persist_directory=persist_directory,
            embedding_function=embeddings
        )

        # ✅ track instance
        ACTIVE_DBS[user_id] = db

        print("✅ Vector DB loaded successfully")

        return db

    except Exception as e:
        print("❌ Error loading vector DB:", str(e))
        return None


# ✅ CRITICAL: force close DB
def close_vector_db(user_id: int):

    if user_id in ACTIVE_DBS:
        try:
            print(f"🧹 Closing vector DB for user {user_id}")

            db = ACTIVE_DBS[user_id]

            # release internal client if exists
            if hasattr(db, "_client"):
                db._client = None

            del ACTIVE_DBS[user_id]

            print("✅ Vector DB closed")

        except Exception as e:
            print("❌ Error closing DB:", str(e))