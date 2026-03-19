from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.db.models import StarredQuestion
from app.db.database import get_db
from app.utils.auth_dependency import get_current_user
import json

router = APIRouter()


# Request body for starring a question
class StarRequest(BaseModel):
    question: str
    answer: str
    sources: list


# Star a question
@router.post("/star-question")
def star_question(
    data: StarRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    new_star = StarredQuestion(
        user_id=user_id,
        question=data.question,
        answer=data.answer,
        sources=json.dumps(data.sources)
    )

    db.add(new_star)
    db.commit()
    db.refresh(new_star)

    return {
        "message": "Question starred successfully",
        "star_id": new_star.id
    }


# Get all starred questions (with search support)
@router.get("/starred-questions")
def get_starred_questions(
    search: str = Query(None),
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    query = db.query(StarredQuestion).filter(
        StarredQuestion.user_id == user_id
    )

    # search by question or answer
    if search:
        query = query.filter(
            or_(
                StarredQuestion.question.ilike(f"%{search}%"),
                StarredQuestion.answer.ilike(f"%{search}%")
            )
        )

    stars = query.order_by(StarredQuestion.created_at.desc()).all()

    results = []

    for star in stars:
        results.append({
            "id": star.id,
            "question": star.question,
            "answer": star.answer,
            "sources": json.loads(star.sources) if star.sources else [],
            "created_at": star.created_at
        })

    return results


# Delete (unstar) a question
@router.delete("/starred-question/{id}")
def delete_starred_question(
    id: int,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    star = db.query(StarredQuestion).filter(
        StarredQuestion.id == id,
        StarredQuestion.user_id == user_id
    ).first()

    if not star:
        raise HTTPException(
            status_code=404,
            detail="Starred question not found"
        )

    db.delete(star)
    db.commit()

    return {
        "message": "Starred question deleted successfully",
        "deleted_id": id
    }

# When the user clicks on star, the frontend will send:
# {
#  "question": "What is deadlock?",
#  "answer": "Deadlock occurs when processes wait indefinitely..."
# }
# this API will receive question+answer
#                 |
#                 V
# Insert it into sqlite database
#                 |
#                 V
# save in starred_question.db

