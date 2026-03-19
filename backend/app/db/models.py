from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.db.database import Base


class StarredQuestion(Base):

    __tablename__ = "starred_questions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)

    question = Column(String)
    answer = Column(String)

    sources = Column(Text)  

    created_at = Column(DateTime, default=datetime.utcnow)