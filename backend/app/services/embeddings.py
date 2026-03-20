from langchain_community.embeddings import HuggingFaceEmbeddings

# ✅ cache embeddings globally
_embeddings = None

def create_embeddings():
    global _embeddings

    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"},   # 👈 force CPU
            encode_kwargs={"normalize_embeddings": False}
        )

    return _embeddings