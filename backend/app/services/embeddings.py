import os

_embeddings = None

def create_embeddings():
    global _embeddings

    # 🚨 DISABLE embeddings on Render (free tier)
    if os.getenv("RENDER") == "true":
        print("⚠️ Skipping embeddings on Render")
        return None

    if _embeddings is None:
        from langchain_community.embeddings import HuggingFaceEmbeddings

        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},
            encode_kwargs={"normalize_embeddings": False}
        )

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