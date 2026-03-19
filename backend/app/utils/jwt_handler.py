import jwt
import datetime
import os

import os
from dotenv import load_dotenv

# force load env HERE (guaranteed)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
load_dotenv(os.path.join(BASE_DIR, ".env"))

SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not SECRET_KEY:
    raise ValueError("JWT_SECRET_KEY not found in .env")
ALGORITHM = "HS256"


def create_token(user_id: int):

    payload = {
        "user_id": user_id,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=12)
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    return token


def decode_token(token: str):

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload["user_id"]

    except jwt.ExpiredSignatureError:
        return None

    except jwt.InvalidTokenError:
        return None