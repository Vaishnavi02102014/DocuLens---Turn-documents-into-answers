# from fastapi import APIRouter, Depends
# from app.services.vector_store import get_vector_db
# from app.services.summarizer import generate_pdf_summary
# from app.services.summary_cache import summary_cache
# from app.services.pdf_processor import extract_images_from_pdf
# from app.utils.auth_dependency import get_current_user

# import os

# router = APIRouter()

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# @router.post("/generate-summary/{filename}")
# def generate_summary(filename: str, user_id: int = Depends(get_current_user)):

#     # 1️⃣ Check cache first
#     if filename in summary_cache:
#         return summary_cache[filename]
#      # 2️⃣ Connect to vector DB
#     db = get_vector_db(user_id)

#     # 3️⃣ Get chunks belonging to this PDF
#     results = db._collection.get(where={"source": filename})

#     text_chunks = results["documents"]
#     # 4️⃣ Safety check
#     if not text_chunks:
#         return {"error": "No chunks found for this PDF"}
    
#     # 5️⃣ Combine chunks
#     combined_text = " ".join(text_chunks)
#     # 6️⃣ Limit text length (important for LLM token limits)
#     combined_text = combined_text[:4000]
    
#      # 7️⃣ Generate summary
#     summary = generate_pdf_summary(combined_text)

#     # -------- extract diagrams --------

#     pdf_path = os.path.join(BASE_DIR, "uploads", filename)
#     image_dir = os.path.join(BASE_DIR, "uploads", "images", filename)
#     print("PDF PATH:", pdf_path)
#     print("FILE EXISTS:", os.path.exists(pdf_path))


#     images = extract_images_from_pdf(pdf_path, image_dir)

#     result = {
#         "filename": filename,
#         "summary": summary,
#         "images": images,
#         "cached": False
#     }

#     # 8️⃣ Store in cache
#     summary_cache[filename] = result
#     # 9️⃣ Return result
#     return result
    

from fastapi import APIRouter, Depends
import os
from urllib.parse import unquote

from app.services.vector_store import get_vector_db
from app.services.summarizer import generate_pdf_summary
from app.services.summary_cache import summary_cache
from app.utils.auth_dependency import get_current_user

# ✅ IMPORT CACHE
from app.services.qa_engine import VECTOR_DB_CACHE

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")


@router.post("/generate-summary/{filename}")
def generate_summary(filename: str, user_id: int = Depends(get_current_user)):

    filename = unquote(filename)

    cache_key = f"{user_id}_{filename}"

    # return cached summary
    if cache_key in summary_cache:
        cached_result = summary_cache[cache_key].copy()
        cached_result["cached"] = True
        return cached_result

    # ✅ USE SHARED CACHE (CRITICAL FIX)
    if user_id not in VECTOR_DB_CACHE:
        VECTOR_DB_CACHE[user_id] = get_vector_db(user_id)

    db = VECTOR_DB_CACHE[user_id]

    if db is None:
        return {"error": "No documents uploaded"}

    results = db._collection.get(where={"source": filename})

    text_chunks = results["documents"]

    if not text_chunks:
        return {"error": "No chunks found"}

    combined_text = " ".join(text_chunks)[:7000]

    # generate summary
    summary = generate_pdf_summary(combined_text)

    # -------- correct pdf path --------
    user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")
    pdf_path = os.path.join(user_folder, filename)

    print("PDF PATH:", pdf_path)
    print("FILE EXISTS:", os.path.exists(pdf_path))

    result = {
        "filename": filename,
        "summary": summary,
        "cached": False
    }

    summary_cache[cache_key] = result

    return result
# When the tries to generate summary
# |
# V
# system first checks if the summary is already present in summary cache or not
# |
# V
# if yes: then summary is directly returned without generating it again
# |
# V
# else: all the chunks are retreived of that pdf only
#         => text is combined
#         => llm generates topic wise summary
#         => summary is added into the cache
#         => and returned