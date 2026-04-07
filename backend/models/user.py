from pydantic import BaseModel, EmailStr, Field
from typing import Optional
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


class UserBase(BaseModel):
    firebase_uid: Optional[str] = ""
    email: str
    name: str
    auth_provider: str = "email"
    role: str = "candidate"  # "candidate" | "employer" | "hr" | "enterprise" | "admin"
    company: Optional[str] = None
    photo_url: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None


class UserInDB(UserBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    onboarding_complete: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserResponse(BaseModel):
    id: str
    firebase_uid: Optional[str] = ""
    email: str
    name: str
    auth_provider: str
    role: str = "candidate"
    company: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    is_active: bool
    phone: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    website: Optional[str] = None


class UserStats(BaseModel):
    resumes_created: int = 0
    analyses_completed: int = 0
    templates_used: int = 0
    average_score: float = 0.0
    last_analysis: Optional[datetime] = None
