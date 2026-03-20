import os
import os

_embeddings = None

def create_embeddings():
    global _embeddings

    # ✅ Prevent multiple reloads
    if _embeddings is not None:
        return _embeddings

    try:
        print("🚀 Loading embedding model...")

        from langchain_community.embeddings import HuggingFaceEmbeddings

        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": False}
        )

        print("✅ Embedding model loaded successfully")

    except Exception as e:
        print("❌ Embedding model failed to load:", str(e))
        return None

    return _embeddings

# from langchain_community.embeddings import HuggingFaceEmbeddings

# # ✅ cache embeddings globally
# _embeddings = None

# def create_embeddings():
#     global _embeddings

#     if _embeddings is None:
#         _embeddings = HuggingFaceEmbeddings(
#             model_name="sentence-transformers/all-MiniLM-L6-v2",
#             model_kwargs={"device": "cpu"},   # 👈 force CPU
#             encode_kwargs={"normalize_embeddings": False}
#         )

#     return _embeddings