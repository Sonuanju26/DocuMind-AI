from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from sqlalchemy.orm import Session
import ollama
import base64
from typing import Optional
from ..database import get_db
from .. import crud

router = APIRouter()

@router.post("/analyze-image")
async def analyze_image(
    image: UploadFile = File(...),
    generate_story: bool = Form(False),
    story_prompt: Optional[str] = Form(None),
    user_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    try:
        # Read and encode image
        image_data = await image.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Analyze image with LLaVA
        analysis_prompt = "Describe this image in detail. What do you see? What is happening?"
        
        analysis_response = ollama.generate(
            model='llava:7b',
            prompt=analysis_prompt,
            images=[image_base64]
        )
        
        analysis_text = analysis_response['response']
        story_text = None
        
        # Generate story if requested
        if generate_story:
            story_instruction = story_prompt or "Create an engaging short story based on this image."
            
            story_response = ollama.generate(
                model='llava:7b',
                prompt=f"{story_instruction}\n\nBased on the image, write a creative story (200-300 words):",
                images=[image_base64]
            )
            
            story_text = story_response['response']
        
        # Save to database
        if user_id:
            crud.create_image_analysis(
                db,
                user_id=user_id,
                image_name=image.filename,
                analysis_text=analysis_text,
                story_text=story_text
            )
        
        return {
            "analysis": analysis_text,
            "story": story_text,
            "fileName": image.filename
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing image: {str(e)}")