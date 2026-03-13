from pydantic import BaseModel


class Segment(BaseModel):
    index: int
    source: str
    wordCount: int
