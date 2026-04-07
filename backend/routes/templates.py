from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional
from pydantic import BaseModel

from database.database import get_database
from models.resume import TemplateResponse, TemplateCreate
from services.auth_service import get_current_user
from models.user import UserResponse

router = APIRouter()

class Template(BaseModel):
    id: str
    name: str
    category: str
    description: str
    preview_url: Optional[str] = None
    is_premium: bool = False

class TemplateCategory(BaseModel):
    name: str
    count: int

# Sample templates data
TEMPLATES = [
    {
        "id": "modern-1",
        "name": "Modern Professional",
        "category": "Modern",
        "description": "Clean and modern design perfect for tech roles",
        "is_premium": False
    },
    {
        "id": "traditional-1",
        "name": "Classic Executive",
        "category": "Traditional",
        "description": "Traditional format for corporate positions",
        "is_premium": False
    },
    {
        "id": "creative-1",
        "name": "Creative Designer",
        "category": "Creative",
        "description": "Eye-catching design for creative professionals",
        "is_premium": True
    },
    {
        "id": "simple-1",
        "name": "Minimalist",
        "category": "Simple",
        "description": "Simple and ATS-friendly format",
        "is_premium": False
    }
]

@router.get("/", response_model=List[Template])
async def get_templates(
    category: Optional[str] = None,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get all available resume templates"""
    templates = TEMPLATES
    if category:
        templates = [t for t in templates if t["category"].lower() == category.lower()]
    return [Template(**t) for t in templates]

@router.get("/categories", response_model=List[TemplateCategory])
async def get_template_categories(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get template categories with counts"""
    categories = {}
    for template in TEMPLATES:
        cat = template["category"]
        categories[cat] = categories.get(cat, 0) + 1
    
    return [
        TemplateCategory(name=name, count=count)
        for name, count in categories.items()
    ]

@router.get("/{template_id}", response_model=Template)
async def get_template(
    template_id: str,
    current_user: UserResponse = Depends(get_current_user)
):
    """Get a specific template"""
    template = next((t for t in TEMPLATES if t["id"] == template_id), None)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return Template(**template)
