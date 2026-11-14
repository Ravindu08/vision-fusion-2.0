import uuid
import json
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from app.db.session import Base


class Question(Base):
    __tablename__ = "questions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    quiz_id = Column(String(36), ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False, index=True)
    question_text = Column(Text, nullable=False)
    options_json = Column(Text, nullable=False)  # JSON-encoded array of string options
    correct_option_index = Column(Integer, nullable=False)  # Never exposed via student GET endpoints
    order_index = Column(Integer, nullable=False, default=0)

    @property
    def options(self):
        try:
            return json.loads(self.options_json)
        except Exception:
            return []

    @options.setter
    def options(self, val):
        self.options_json = json.dumps(val)

