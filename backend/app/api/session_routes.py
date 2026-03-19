from fastapi import APIRouter
from pydantic import BaseModel
import os
import shutil
import time

from app.utils.jwt_handler import decode_token
from app.services.summary_cache import summary_cache
from app.services.qa_engine import clear_vector_db
from app.services.vector_store import close_vector_db

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
VECTOR_DB_DIR = os.path.join(BASE_DIR, "vector_db")


# -----------------------------
# REQUEST MODEL
# -----------------------------
class ClearSessionRequest(BaseModel):
    token: str


# -----------------------------
# SAFE DELETE
# -----------------------------
def safe_delete(path, name):
    for i in range(6):
        try:
            if os.path.exists(path):
                shutil.rmtree(path)
                print(f"Deleted {name}")
                return True
        except Exception as e:
            print(f"Retry {i+1} deleting {name}:", e)
            time.sleep(1)

    print(f"❌ Failed to delete {name}")
    return False


# -----------------------------
# CLEAR SESSION (MAIN LOGIC)
# -----------------------------
@router.post("/clear-session")
async def clear_session(data: ClearSessionRequest):

    try:
        token = data.token

        if not token:
            return {"message": "No token provided"}

        user_id = decode_token(token)

        if not user_id:
            return {"message": "Invalid token"}

        print(f"🗑️ CLEARING SESSION for user {user_id}")

        # ✅ CLOSE VECTOR DB
        clear_vector_db(user_id)
        close_vector_db(user_id)

        import gc
        gc.collect()
        time.sleep(1)

        # delete uploads
        user_upload_folder = os.path.join(UPLOAD_DIR, f"user_{user_id}")
        safe_delete(user_upload_folder, "uploads")

        # delete vector DB
        user_vector_folder = os.path.join(VECTOR_DB_DIR, f"user_{user_id}")
        safe_delete(user_vector_folder, "vector_db")

        # clear summary cache
        for key in list(summary_cache.keys()):
            if key.startswith(f"{user_id}_"):
                del summary_cache[key]

        return {"message": "Session cleared"}

    except Exception as e:
        return {"error": str(e)}

# from fastapi import APIRouter, Request
# import os
# import shutil
# import json

# from app.utils.jwt_handler import decode_token
# from app.services.summary_cache import summary_cache

# router = APIRouter()

# BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))

# UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
# VECTOR_DB_DIR = os.path.join(BASE_DIR, "vector_db")


# @router.post("/clear-session")
# async def clear_session(request: Request):
#     print("CLEAR SESSION CALLED")   # add this

#     try:

#         # sendBeacon sends raw body, not normal JSON
#         body = await request.body()

#         if not body:
#             return {"message": "No data received"}

#         data = json.loads(body.decode())

#         token = data.get("token")

#         if not token:
#             return {"message": "No token received"}

#         user_id = decode_token(token)

#         if not user_id:
#             return {"message": "Invalid token"}

#         # ---------------- DELETE UPLOADED PDFs ----------------
#         user_upload_folder = os.path.join(UPLOAD_DIR, f"user_{user_id}")

#         if os.path.exists(user_upload_folder):
#             shutil.rmtree(user_upload_folder)
#         # ---------- DELETE VECTOR DB ----------

#         from app.services.vector_store import get_vector_db

#         user_vector_folder = os.path.join(VECTOR_DB_DIR, f"user_{user_id}")

#         db = get_vector_db(user_id)

#         if db:
#             try:
#                 db._client._system.stop()
#             except:
#                 pass

#         if os.path.exists(user_vector_folder):
#             shutil.rmtree(user_vector_folder)

#         # ---------------- CLEAR SUMMARY CACHE ----------------
#         for key in list(summary_cache.keys()):
#             if key.startswith(f"{user_id}_"):
#                 del summary_cache[key]

#         return {"message": "Session cleared"}

#     except Exception as e:
#         print("SESSION CLEAR ERROR:", e)
#         return {"error": str(e)}