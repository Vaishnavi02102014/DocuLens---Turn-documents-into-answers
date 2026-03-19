from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.utils.auth_dependency import get_current_user
from app.services.qa_engine import generate_answer

router = APIRouter()


class QuestionRequest(BaseModel):
    question: str
    pdf_name: str | None = None


@router.post("/ask-question")
def ask_question(
    request: QuestionRequest,
    user_id: int = Depends(get_current_user)   
):

    answer, sources = generate_answer(request.question, user_id, request.pdf_name)

    return {
        "user_id": user_id,
        "question": request.question,
        "answer": answer,
        "sources": sources
    }