# from fastapi import APIRouter, UploadFile, File, Depends
# import os

# from app.services.pdf_processor import extract_text_from_pdf
# from app.services.chunking import chunk_text
# from app.services.vector_store import store_chunks
# from app.utils.auth_dependency import get_current_user

# router = APIRouter()

# UPLOAD_FOLDER = "uploads"


# @router.post("/upload-pdf")
# async def upload_pdf(
#     file: UploadFile = File(...),
#     user_id: int = Depends(get_current_user)
# ):

#     user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")
#     os.makedirs(user_folder, exist_ok=True)

#     file_path = os.path.join(user_folder, file.filename)
#     # prevent duplicate upload
#     if os.path.exists(file_path):
#         return {
#             "error": f"{file.filename} already exists"
#         }

#     # save uploaded file
#     with open(file_path, "wb") as f:
#         f.write(await file.read())   # ✅ better for async endpoints

#     # Extract text from the PDF
#     text = extract_text_from_pdf(file_path)

#     # Create chunks
#     chunks = chunk_text(text, file.filename)
#     if not chunks:
#         return {
#             "error": "No text could be extracted from this PDF"
#         }

#     # Store chunks in vector DB
#     store_chunks(chunks, user_id)
    
#     return {
#         "message": "PDF uploaded successfully",
#         "filename": file.filename,
#         "chunks_created": len(chunks)
#     }

from fastapi import APIRouter, UploadFile, File, Depends
import os
import threading

from app.services.pdf_processor import extract_text_from_pdf
from app.services.chunking import chunk_text
from app.services.vector_store import store_chunks
from app.utils.auth_dependency import get_current_user

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")


@router.post("/upload-pdf")
async def upload_pdf(
    file: UploadFile = File(...),
    user_id: int = Depends(get_current_user)
):

    # ✅ create user folder
    user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")
    os.makedirs(user_folder, exist_ok=True)

    file_path = os.path.join(user_folder, file.filename)

    # ✅ prevent duplicate upload
    if os.path.exists(file_path):
        return {"error": f"{file.filename} already exists"}

    # ✅ save uploaded file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # ✅ extract text
    pages = extract_text_from_pdf(file_path)

    # ✅ create chunks
    chunks = chunk_text(pages, file.filename, user_id)

    if not chunks:
        return {"error": "No text could be extracted"}

    # ✅ STORE CHUNKS (DIFFERENT FOR LOCAL VS RENDER)

    if os.getenv("RENDER") == "true":
        # 🚀 Render → background (avoid timeout)
        threading.Thread(
            target=store_chunks,
            args=(chunks, user_id)
        ).start()
    else:
        # 💻 Local → direct (better testing)
        store_chunks(chunks, user_id)

    # ✅ response immediately
    return {
        "message": "PDF uploaded successfully",
        "filename": file.filename,
        "chunks_created": len(chunks)
    }


# user uploads pdf
#         |
#         v
# Backend receives the File
#         |
#         v
# file saves in upload folder
#            |
#            v
# text extracted using PyMuPDF (fitz)
#             |
#             v
# text chunking using LangChain RecursiveCharacterTextSplitter
#             |
#             v
# Embeddings of each chunk is created
#             |
#             v
# Embeddings are stored along with the text chunk and metadata(filename, page no) in ChromaDB
