from sqlalchemy.orm import Session
from passlib.context import CryptContext
from . import models, schemas
import hashlib

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def hash_pin(pin: str) -> str:
    """Hash PIN using SHA-256"""
    return hashlib.sha256(pin.encode()).hexdigest()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_pw = hash_password(user.password) if user.password else None
    db_user = models.User(
        name=user.name,
        email=user.email,
        password=hashed_pw,
        auth_method=user.auth_method,
        picture=user.picture
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not user.password:
        return None
    if not verify_password(password, user.password):
        return None
    return user

def setup_offline_pin(db: Session, email: str, pin: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    
    user.offline_pin_hash = hash_pin(pin)
    user.offline_enabled = True
    db.commit()
    db.refresh(user)
    return user

def verify_offline_pin(db: Session, email: str, pin: str):
    user = get_user_by_email(db, email)
    if not user or not user.offline_enabled:
        return None
    
    if user.offline_pin_hash == hash_pin(pin):
        return user
    return None

def create_summary(db: Session, user_id: int, file_name: str, original_text: str, 
                   summary_text: str, length: str, style: str, user_prompt: str = None):
    db_summary = models.Summary(
        user_id=user_id,
        file_name=file_name,
        original_text=original_text[:5000],  # Store first 5000 chars
        summary_text=summary_text,
        summary_length=length,
        summary_style=style,
        user_prompt=user_prompt
    )
    db.add(db_summary)
    db.commit()
    db.refresh(db_summary)
    return db_summary

def create_image_analysis(db: Session, user_id: int, image_name: str, 
                         analysis_text: str, story_text: str = None):
    db_analysis = models.ImageAnalysis(
        user_id=user_id,
        image_name=image_name,
        analysis_text=analysis_text,
        story_text=story_text
    )
    db.add(db_analysis)
    db.commit()
    db.refresh(db_analysis)
    return db_analysis