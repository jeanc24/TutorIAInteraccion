from __future__ import annotations

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRequest(BaseModel):
    nombre: str = Field(min_length=1)
    email: EmailStr
    password: str | None = None
    rol: str | None = None


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    email: EmailStr
    rol: str
