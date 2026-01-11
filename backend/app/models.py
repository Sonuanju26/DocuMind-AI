from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.sql import func
from .database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255), nullable=True)  # Nullable for Google OAuth users
    picture = Column(String(500), nullable=True)
    auth_method = Column(String(50), default="email")  # "email" or "google"
    offline_pin_hash = Column(String(255), nullable=True)
    offline_enabled = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Summary(Base):
    __tablename__ = "summaries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    file_name = Column(String(500))
    original_text = Column(Text)
    summary_text = Column(Text)
    summary_length = Column(String(20))  # short, medium, long
    summary_style = Column(String(50))   # paragraph, bullet, etc.
    user_prompt = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class ImageAnalysis(Base):
    __tablename__ = "image_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    image_name = Column(String(500))
    analysis_text = Column(Text)
    story_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())