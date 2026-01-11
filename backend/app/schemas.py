from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: Optional[str] = None
    auth_method: str = "email"
    picture: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleAuthRequest(BaseModel):
    token: str
    email: EmailStr
    name: str
    picture: Optional[str] = None

class OfflinePinSetup(BaseModel):
    email: EmailStr
    pin: str

class OfflinePinLogin(BaseModel):
    email: EmailStr
    pin: str

class Token(BaseModel):
    access_token: str
    token_type: str

class SummaryRequest(BaseModel):
    text: str
    length: str = "medium"  # short, medium, long
    style: str = "paragraph"  # paragraph, bullet, flashcard, mindmap
    user_prompt: Optional[str] = None

class SummaryResponse(BaseModel):
    summary: str
    length: str
    style: str
    
class ImageAnalysisRequest(BaseModel):
    image_base64: str
    generate_story: bool = False
    story_prompt: Optional[str] = None

class ImageAnalysisResponse(BaseModel):
    analysis: str
    story: Optional[str] = None