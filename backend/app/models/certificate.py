import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, UniqueConstraint
from app.db.session import Base


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    certificate_identifier = Column(String(100), nullable=False, unique=True, index=True)  # e.g., VF2-2026-ABCD
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    total_xp_at_issue = Column(Integer, nullable=False)
    verification_hash = Column(String(255), nullable=False, unique=True)
    pdf_url = Column(String(500), nullable=True)

