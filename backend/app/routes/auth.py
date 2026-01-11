from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from jose import jwt
from .. import schemas, models, crud
from ..database import get_db
import os

router = APIRouter()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES"))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = crud.create_user(db, user)
    access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "picture": new_user.picture
        }
    }

@router.post("/login", response_model=schemas.Token)
def login(form: schemas.UserLogin, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, form.email, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google-auth")
def google_auth(data: schemas.GoogleAuthRequest, db: Session = Depends(get_db)):
    # Check if user exists
    user = crud.get_user_by_email(db, data.email)
    
    if not user:
        # Create new user
        user_create = schemas.UserCreate(
            name=data.name,
            email=data.email,
            auth_method="google",
            picture=data.picture
        )
        user = crud.create_user(db, user_create)
    
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture,
            "offline_enabled": user.offline_enabled
        }
    }

@router.post("/setup-offline-pin")
def setup_offline_pin(data: schemas.OfflinePinSetup, db: Session = Depends(get_db)):
    user = crud.setup_offline_pin(db, data.email, data.pin)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"success": True, "message": "Offline PIN set successfully"}

@router.post("/offline-login")
def offline_login(data: schemas.OfflinePinLogin, db: Session = Depends(get_db)):
    user = crud.verify_offline_pin(db, data.email, data.pin)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    access_token = create_access_token({"sub": str(user.id), "email": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "picture": user.picture
        }
    }