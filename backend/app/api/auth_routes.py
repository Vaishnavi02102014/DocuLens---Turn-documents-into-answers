from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.auth_service import create_user, authenticate_user
from app.utils.jwt_handler import create_token
from app.db.database import get_db

from app.utils.auth_dependency import get_current_user
from app.db.user_model import User
from app.services.auth_service import verify_password, hash_password

router = APIRouter()


class SignupRequest(BaseModel):
    name: str
    email: str
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: str
    password: str

class UpdateProfileRequest(BaseModel):
    name: str
    email: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str

@router.post("/signup")
def signup(data: SignupRequest, db: Session = Depends(get_db)):

    # Check if passwords match
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match"
        )

    user = create_user(db, data.name, data.email, data.password)

    return {
        "message": "User created",
        "user_id": user.id
    }


@router.post("/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):

    user = authenticate_user(db, data.email, data.password)

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user.id)

    return {
        "token": token
    }

@router.put("/update-profile")
def update_profile(
    data: UpdateProfileRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # check if email already exists
    existing_user = db.query(User).filter(User.email == data.email).first()

    if existing_user and existing_user.id != user_id:
        raise HTTPException(status_code=400, detail="Email already in use")

    user.name = data.name
    user.email = data.email

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }

@router.put("/change-password")
def change_password(
    data: ChangePasswordRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # verify current password
    if not verify_password(data.current_password, user.password):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    # check new password confirmation
    if data.new_password != data.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # update password
    user.password = hash_password(data.new_password)

    db.commit()

    return {"message": "Password updated successfully"}

@router.post("/logout")
def logout(user_id: int = Depends(get_current_user)):
    from app.api.session_routes import clear_session
    clear_session(user_id)
    return {"message": "Logged out"}

@router.get("/me")
def get_profile(
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "name": user.name,
        "email": user.email
    }