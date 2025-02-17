from pydantic import BaseModel

class TagData(BaseModel):
    tag_type: str
    tag_name: str
    description: str
    langInstructions: str

class TagDataFinal(BaseModel):
    tag_identifier: str
    tag_type: str
    tag_name: str
    description: str
    langInstructions: str
    user_email: str

class PerplexityPrompt(BaseModel):
    desc: str
    suggested_changes: list[str]
