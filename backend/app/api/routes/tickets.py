from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db, require_admin
from app.schemas.ticket import (
    TicketCreateResponse,
    TicketValidationRequest,
    TicketValidationResponse,
)
from app.services.ticket_service import (
    generate_session_ticket,
    validate_session_ticket,
)


router = APIRouter(prefix="/tickets", tags=["Parking Tickets"])


@router.post(
    "/sessions/{session_id}",
    response_model=TicketCreateResponse,
)
def create_ticket(
    session_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return generate_session_ticket(
        db,
        session_id=session_id,
        user_id=current_user.id,
    )


@router.post(
    "/validate",
    response_model=TicketValidationResponse,
)
def validate_ticket(
    request: TicketValidationRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin),
):
    return validate_session_ticket(db, request.token)
