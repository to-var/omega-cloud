import re

from fastapi import APIRouter, Depends, HTTPException
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from app.core.dependencies import get_current_user
from app.models.segment import Segment

router = APIRouter(prefix="/docs", tags=["docs"])


def _extract_text(doc: dict) -> str:
    """Walk a Google Docs document body and extract all text content."""
    text_parts: list[str] = []
    body = doc.get("body", {})
    for element in body.get("content", []):
        paragraph = element.get("paragraph")
        if paragraph:
            for elem in paragraph.get("elements", []):
                text_run = elem.get("textRun")
                if text_run:
                    text_parts.append(text_run.get("content", ""))
    return "".join(text_parts)


def _split_segments(text: str) -> list[Segment]:
    """Split text into translatable segments on sentence boundaries."""
    raw = re.split(r"(?<=[.!?])\s+|\n+", text)
    segments: list[Segment] = []
    for i, chunk in enumerate(raw):
        chunk = chunk.strip()
        if not chunk:
            continue
        word_count = len(chunk.split())
        segments.append(Segment(index=len(segments), source=chunk, wordCount=word_count))
    return segments


@router.get("/{document_id}/segments", response_model=list[Segment])
async def get_segments(document_id: str, user: dict = Depends(get_current_user)):
    google_token = user.get("google_access_token")
    if not google_token:
        raise HTTPException(status_code=401, detail="Google access token not found")

    creds = Credentials(token=google_token)
    try:
        service = build("docs", "v1", credentials=creds, cache_discovery=False)
        doc = service.documents().get(documentId=document_id).execute()
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Failed to fetch document: {exc}")

    text = _extract_text(doc)
    return _split_segments(text)
