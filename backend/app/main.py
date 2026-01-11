from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base, engine
from .routes import auth, summarize, image_analysis

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="DocuMind AI Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(summarize.router, prefix="/summarize", tags=["Summarization"])
app.include_router(image_analysis.router, prefix="/image", tags=["Image Analysis"])

@app.get("/")
def read_root():
    return {"message": "DocuMind AI Backend is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}