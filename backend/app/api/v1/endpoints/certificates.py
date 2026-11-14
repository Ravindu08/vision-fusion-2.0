import uuid
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.certificate import Certificate
from app.api.deps import get_current_user
from app.core.config import settings
from app.services.certificate_generator import generate_certificate_pdf

router = APIRouter()


@router.get("/status")
def get_certificate_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if student is eligible for certificate (total_xp >= 350)
    and return issued certificate details if claimed.
    """
    threshold_xp = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    is_eligible = current_user.total_xp >= threshold_xp

    cert = db.query(Certificate).filter(Certificate.user_id == current_user.id).first()

    return {
        "is_eligible": is_eligible,
        "current_xp": current_user.total_xp,
        "threshold_xp": threshold_xp,
        "overall_percentage": round((current_user.total_xp / settings.TOTAL_POSSIBLE_XP) * 100.0, 1),
        "is_claimed": cert is not None,
        "certificate_id": cert.certificate_identifier if cert else None,
        "issued_at": cert.issued_at if cert else None,
    }


@router.post("/claim")
def claim_certificate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Claim official digital certificate once eligible.
    Generates unique certificate ID and cryptographic verification hash.
    """
    threshold_xp = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    if current_user.total_xp < threshold_xp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"You need at least {threshold_xp} XP to unlock the certificate. Currently have {current_user.total_xp} XP."
        )

    # Check if already claimed
    cert = db.query(Certificate).filter(Certificate.user_id == current_user.id).first()
    if not cert:
        # Generate predictable unique certificate number
        short_id = uuid.uuid4().hex[:6].upper()
        cert_id = f"VF2-2026-{short_id}"
        now_utc = datetime.now(timezone.utc)

        # Cryptographic verification hash
        raw_token = f"{current_user.id}:{cert_id}:{now_utc.isoformat()}:{settings.SECRET_KEY}"
        verification_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        cert = Certificate(
            user_id=current_user.id,
            certificate_identifier=cert_id,
            issued_at=now_utc,
            total_xp_at_issue=current_user.total_xp,
            verification_hash=verification_hash,
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)

    return {
        "success": True,
        "message": "Certificate claimed successfully!",
        "certificate_id": cert.certificate_identifier,
        "issued_at": cert.issued_at,
    }


@router.get("/download")
def download_certificate(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download official IEEE Vision Fusion 2.0 Certificate as high-res PDF.
    """
    threshold_xp = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    if current_user.total_xp < threshold_xp:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Certificate threshold not yet achieved."
        )

    cert = db.query(Certificate).filter(Certificate.user_id == current_user.id).first()
    if not cert:
        # Auto-claim if eligible
        short_id = uuid.uuid4().hex[:6].upper()
        cert_id = f"VF2-2026-{short_id}"
        now_utc = datetime.now(timezone.utc)
        raw_token = f"{current_user.id}:{cert_id}:{now_utc.isoformat()}:{settings.SECRET_KEY}"
        verification_hash = hashlib.sha256(raw_token.encode()).hexdigest()

        cert = Certificate(
            user_id=current_user.id,
            certificate_identifier=cert_id,
            issued_at=now_utc,
            total_xp_at_issue=current_user.total_xp,
            verification_hash=verification_hash,
        )
        db.add(cert)
        db.commit()
        db.refresh(cert)

    # Generate PDF
    pdf_bytes = generate_certificate_pdf(
        student_name=current_user.full_name,
        student_id=current_user.student_id or "",
        university=current_user.university or "Uva Wellassa University",
        certificate_id=cert.certificate_identifier,
        total_xp=current_user.total_xp,
        issue_date=cert.issued_at.strftime("%B %d, %Y") if cert.issued_at else None
    )

    filename = f"VisionFusion_Certificate_{current_user.full_name.replace(' ', '_')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

