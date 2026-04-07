from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ], serialization=core_schema.plain_serializer_function_ser_schema(str))

    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if isinstance(v, str) and ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class ResumeSection(BaseModel):
    title: str
    content: str
    order: int = 0


class ResumeVersion(BaseModel):
    version_number: int
    content: Dict[str, Any]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    changes_summary: Optional[str] = None


class ResumeBase(BaseModel):
    user_id: str
    title: str
    sections: Dict[str, List[ResumeSection]]
    ats_score: Optional[float] = None


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    title: Optional[str] = None
    sections: Optional[Dict[str, List[ResumeSection]]] = None
    ats_score: Optional[float] = None
    is_public: Optional[bool] = None


class ResumeInDB(ResumeBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    versions: List[ResumeVersion] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    is_public: bool = False
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    title: str
    sections: Dict[str, Any]
    ats_score: Optional[float] = None
    extracted_skills: Optional[List[str]] = None
    candidate_name: Optional[str] = None
    email: Optional[str] = None
    versions: List[ResumeVersion]
    created_at: datetime
    updated_at: datetime
    is_active: bool
    is_public: bool = False


class ATSAnalysis(BaseModel):
    overall_score: float
    keyword_score: float
    formatting_score: float
    structure_score: float
    readability_score: float
    recommendations: List[str]
    missing_keywords: List[str]
    issues_found: List[str]


class ResumeAnalysisRequest(BaseModel):
    resume_content: Dict[str, Any]
    job_description: Optional[str] = None


class ResumeAnalysisResponse(BaseModel):
    ats_analysis: ATSAnalysis
    skill_gaps: List[str]
    improvement_suggestions: List[str]
    optimized_content: Optional[Dict[str, Any]] = None


class ResumeExportRequest(BaseModel):
    format: str = Field(..., pattern="^(pdf|docx|html)$")
    template_id: Optional[str] = None
    include_ats_optimization: bool = True


class ResumeExportResponse(BaseModel):
    download_url: str
    file_name: str
    file_size: int
    expires_at: datetime


class TemplateBase(BaseModel):
    name: str
    category: str  # "creative", "traditional", "modern", "simple"
    description: str
    thumbnail_url: str
    is_premium: bool = False
    config: Dict[str, Any]


class TemplateCreate(TemplateBase):
    pass


class TemplateResponse(TemplateBase):
    id: str
    downloads: int = 0
    rating: float = 0.0
