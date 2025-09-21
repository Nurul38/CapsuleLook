from fastapi import FastAPI, APIRouter, HTTPException, File, UploadFile, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
import base64
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Visibee API", description="E-Wardrobe API for ADHD support")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Define Models
class ClothingItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    brand: Optional[str] = None
    color: Optional[str] = None
    function: Optional[str] = None  # casual, formal, work, gym, etc.
    category: Optional[str] = None  # Winter, Costume, Wedding, Events, etc.
    purchase_date: Optional[datetime] = None
    purchase_link: Optional[str] = None
    image_base64: Optional[str] = None
    ai_description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ClothingItemCreate(BaseModel):
    name: str
    brand: Optional[str] = None
    color: Optional[str] = None
    function: Optional[str] = None
    category: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchase_link: Optional[str] = None
    image_base64: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

class ClothingItemUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    color: Optional[str] = None
    function: Optional[str] = None
    category: Optional[str] = None
    purchase_date: Optional[datetime] = None
    purchase_link: Optional[str] = None
    image_base64: Optional[str] = None
    tags: Optional[List[str]] = None

class AIAnalysisRequest(BaseModel):
    image_base64: str
    analysis_type: str  # "description", "color", "style", "kibbe"

class AIAnalysisResponse(BaseModel):
    analysis_type: str
    result: str
    confidence: Optional[float] = None

class SearchRequest(BaseModel):
    query: str
    filters: Optional[Dict[str, Any]] = None

# AI Integration Functions
async def analyze_clothing_with_ai(image_base64: str, analysis_type: str) -> str:
    """Analyze clothing using Gemini Vision API"""
    try:
        # Create chat instance for Gemini
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"analysis_{uuid.uuid4()}",
            system_message="You are a fashion expert AI assistant specialized in clothing analysis."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Prepare analysis prompt based on type
        if analysis_type == "description":
            prompt = "Describe this clothing item in detail. Include the type, color, style, fabric texture if visible, and any notable features."
        elif analysis_type == "color":
            prompt = "Analyze the colors in this clothing item. List the primary color, secondary colors, and describe the overall color scheme."
        elif analysis_type == "style":
            prompt = "Analyze the style of this clothing item. Categorize it (casual, formal, athletic, etc.) and describe its fashion characteristics."
        elif analysis_type == "kibbe":
            prompt = "Analyze this clothing item in terms of Kibbe body type styling. Describe what Kibbe body types this item would suit best and why."
        elif analysis_type == "face_shape_hijab":
            prompt = """Analyze this person's face shape for hijab styling recommendations. 

            Please identify the face shape from these categories:
            - Oval: balanced proportions, slightly longer than wide, soft jawline
            - Round: full cheeks, width equals length, soft features  
            - Square: strong jawline, wide forehead, angular features
            - Heart: wide forehead, narrow chin, prominent cheekbones
            - Long: length greater than width, high forehead, elongated features
            - Diamond: narrow forehead and chin, wide cheekbones, angular features

            Provide your analysis in this format:
            Face Shape: [detected shape]
            Confidence: [high/medium/low]
            Reasoning: [brief explanation of key features observed]
            Hijab Recommendations: [2-3 specific style suggestions based on the face shape]"""
        else:
            prompt = "Analyze this clothing item comprehensively."
        
        # Create image content from base64
        image_content = ImageContent(image_base64=image_base64)
        
        # Create user message with image
        user_message = UserMessage(
            text=prompt,
            file_contents=[image_content]
        )
        
        # Send message and get response
        response = await chat.send_message(user_message)
        return response
    
    except Exception as e:
        logging.error(f"AI analysis error: {str(e)}")
        return f"Analysis failed: {str(e)}"

# API Routes
@api_router.get("/")
async def root():
    return {"message": "Visibee API - E-Wardrobe for ADHD Support", "version": "1.0.0"}

@api_router.get("/clothing", response_model=List[ClothingItem])
async def get_all_clothing():
    """Get all clothing items"""
    try:
        clothing_items = await db.clothing_items.find().to_list(1000)
        return [ClothingItem(**item) for item in clothing_items]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/clothing", response_model=ClothingItem)
async def create_clothing_item(item: ClothingItemCreate):
    """Create a new clothing item"""
    try:
        clothing_dict = item.dict()
        clothing_obj = ClothingItem(**clothing_dict)
        
        # If image is provided, analyze it with AI
        if clothing_obj.image_base64:
            try:
                ai_description = await analyze_clothing_with_ai(clothing_obj.image_base64, "description")
                clothing_obj.ai_description = ai_description
            except Exception as ai_e:
                logging.warning(f"AI analysis failed: {str(ai_e)}")
        
        await db.clothing_items.insert_one(clothing_obj.dict())
        return clothing_obj
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/clothing/{item_id}", response_model=ClothingItem)
async def get_clothing_item(item_id: str):
    """Get a specific clothing item"""
    try:
        item = await db.clothing_items.find_one({"id": item_id})
        if not item:
            raise HTTPException(status_code=404, detail="Clothing item not found")
        return ClothingItem(**item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.put("/clothing/{item_id}", response_model=ClothingItem)
async def update_clothing_item(item_id: str, update_data: ClothingItemUpdate):
    """Update a clothing item"""
    try:
        existing_item = await db.clothing_items.find_one({"id": item_id})
        if not existing_item:
            raise HTTPException(status_code=404, detail="Clothing item not found")
        
        update_dict = {k: v for k, v in update_data.dict().items() if v is not None}
        update_dict["updated_at"] = datetime.utcnow()
        
        # If image is updated, re-analyze with AI
        if update_dict.get("image_base64"):
            try:
                ai_description = await analyze_clothing_with_ai(update_dict["image_base64"], "description")
                update_dict["ai_description"] = ai_description
            except Exception as ai_e:
                logging.warning(f"AI analysis failed: {str(ai_e)}")
        
        await db.clothing_items.update_one({"id": item_id}, {"$set": update_dict})
        
        updated_item = await db.clothing_items.find_one({"id": item_id})
        return ClothingItem(**updated_item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.delete("/clothing/{item_id}")
async def delete_clothing_item(item_id: str):
    """Delete a clothing item"""
    try:
        result = await db.clothing_items.delete_one({"id": item_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Clothing item not found")
        return {"message": "Clothing item deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/ai/analyze", response_model=AIAnalysisResponse)
async def analyze_clothing_ai(request: AIAnalysisRequest):
    """Analyze clothing using AI"""
    try:
        result = await analyze_clothing_with_ai(request.image_base64, request.analysis_type)
        return AIAnalysisResponse(
            analysis_type=request.analysis_type,
            result=result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/search", response_model=List[ClothingItem])
async def search_clothing(request: SearchRequest):
    """Search clothing items with AI-powered natural language"""
    try:
        # Basic text search for now - can be enhanced with AI later
        query_regex = {"$regex": request.query, "$options": "i"}
        search_filter = {
            "$or": [
                {"name": query_regex},
                {"brand": query_regex},
                {"color": query_regex},
                {"function": query_regex},
                {"ai_description": query_regex},
                {"tags": {"$in": [request.query]}}
            ]
        }
        
        # Apply additional filters if provided
        if request.filters:
            search_filter.update(request.filters)
        
        items = await db.clothing_items.find(search_filter).to_list(100)
        return [ClothingItem(**item) for item in items]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()