from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import Session
from app.db.user_model import User

# create hashed password
def hash_password(password: str):
    return generate_password_hash(password)


# verify password
def verify_password(plain_password: str, hashed_password: str):
    return check_password_hash(hashed_password, plain_password)

def create_user(db: Session, name: str, email: str, password: str):
    hashed_password = generate_password_hash(password)

    user = User(
        name=name,
        email=email,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not check_password_hash(user.password, password):
        return None

    return user