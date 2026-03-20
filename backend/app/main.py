from fastapi import FastAPI
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import threading

# Load environment variables
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, "..", ".env"))

# Create FastAPI app
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*vercel.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# uploads folder absolute path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "..", "uploads")

# ensure uploads folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# serve uploaded files
app.mount("/uploads", StaticFiles(directory=UPLOAD_FOLDER), name="uploads")
# -----------------------------
# Database setup
# -----------------------------
from app.db.database import engine, Base
from app.db.user_model import User
from app.db.models import StarredQuestion

# Create database tables
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)


# -----------------------------
# Import API Routes
# -----------------------------
from app.api import pdf_routes
from app.api import chat_routes
from app.api import star_routes
from app.api import summary_routes
from app.api import file_routes
from app.api import session_routes
from app.api.auth_routes import router as auth_router


# -----------------------------
# Register Routers
# -----------------------------
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(pdf_routes.router)
app.include_router(chat_routes.router)
app.include_router(star_routes.router)
app.include_router(summary_routes.router)
app.include_router(file_routes.router)
app.include_router(session_routes.router)



# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def home():
    return {"message": "AI Document Q&A backend is running"}