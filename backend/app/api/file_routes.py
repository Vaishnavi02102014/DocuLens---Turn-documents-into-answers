# from fastapi import APIRouter
# import os
# from datetime import datetime
# from app.services.vector_store import get_vector_db
# from app.services.summary_cache import summary_cache

# from fastapi import Depends
# from app.utils.auth_dependency import get_current_user

# router = APIRouter()

# UPLOAD_FOLDER = "uploads"

# @router.get("/list-pdfs")
# def list_pdfs(user_id: int = Depends(get_current_user)):

#     user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")

#     if not os.path.exists(user_folder):
#         return {"pdfs": []}

#     files_data = []

#     for file in os.listdir(user_folder):

#         if file.endswith(".pdf"):

#             file_path = os.path.join(user_folder, file)

#             size = os.path.getsize(file_path)
#             size_mb = round(size / (1024 * 1024), 2)

#             created_time = os.path.getctime(file_path)
#             date_uploaded = datetime.fromtimestamp(created_time).strftime("%b %d, %Y")

#             files_data.append({
#                 "name": file,
#                 "date_uploaded": date_uploaded,
#                 "size": f"{size_mb} MB"
#             })

#     return {"pdfs": files_data}

# @router.delete("/delete-pdf/{filename}")
# def delete_pdf(filename: str, user_id: int = Depends(get_current_user)):

#     db = get_vector_db(user_id)


#     # 1️⃣ Remove chunks from vector DB
#     db._collection.delete(
#         where={"source": filename}
#     )

#     # 2️⃣ Remove uploaded file
#     file_path = os.path.join(UPLOAD_FOLDER, f"user_{user_id}", filename)

#     if os.path.exists(file_path):
#         os.remove(file_path)

#     # 3️⃣ Remove summary cache
#     if filename in summary_cache:
#         del summary_cache[filename]

#     return {
#         "message": f"{filename} deleted successfully"
#     }


from fastapi import APIRouter, Depends
import os
import shutil
from datetime import datetime
from urllib.parse import unquote

from app.utils.auth_dependency import get_current_user
from app.services.vector_store import get_vector_db
from app.services.summary_cache import summary_cache

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "uploads")


# ---------------- LIST PDFs ----------------

@router.get("/list-pdfs")
def list_pdfs(user_id: int = Depends(get_current_user)):

    user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")

    if not os.path.exists(user_folder):
        return {"pdfs": []}

    pdf_files = []

    for file in os.listdir(user_folder):

        if file.endswith(".pdf"):

            file_path = os.path.join(user_folder, file)

            size = os.path.getsize(file_path)
            upload_time = os.path.getctime(file_path)

            pdf_files.append({
                "name": file,
                "size": f"{round(size / (1024 * 1024), 2)} MB",
                "date_uploaded": datetime.fromtimestamp(upload_time).strftime("%Y-%m-%d")
            })

    return {"pdfs": pdf_files}


# ---------------- DELETE PDF ----------------

@router.delete("/delete-pdf/{filename}")
def delete_pdf(filename: str, user_id: int = Depends(get_current_user)):

    filename = unquote(filename)

    db = get_vector_db(user_id)
    if db is None:
        return {"error": "No documents uploaded"}

    # delete vector DB chunks
    db._collection.delete(where={"source": filename})

    user_folder = os.path.join(UPLOAD_FOLDER, f"user_{user_id}")

    # delete PDF file
    file_path = os.path.join(user_folder, filename)

    if os.path.exists(file_path):
        os.remove(file_path)

    # delete extracted images
    image_folder = os.path.join(user_folder, "images", filename)

    if os.path.exists(image_folder):
        shutil.rmtree(image_folder)

    # delete summary cache
    cache_key = f"{user_id}_{filename}"

    if cache_key in summary_cache:
        del summary_cache[cache_key]

    return {"message": f"{filename} deleted successfully"}