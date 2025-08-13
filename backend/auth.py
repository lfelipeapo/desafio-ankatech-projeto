from __future__ import annotations
import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from passlib.context import CryptContext
from schemas import User, Token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
USERS = {
    "admin@example.com": {"username": "admin@example.com","full_name":"Admin","role":"admin","disabled":False,"hashed_password": pwd_context.hash("admin123")},
    "reader@example.com": {"username": "reader@example.com","full_name":"Reader","role":"read","disabled":False,"hashed_password": pwd_context.hash("reader123")},
}

SECRET_KEY = os.environ.get("JWT_SECRET","devsecret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.environ.get("JWT_EXPIRE_MIN","120"))
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token", auto_error=False)

def verify_password(plain: str, hashed: str) -> bool:
    """Compara senha em texto puro com hash."""
    return pwd_context.verify(plain, hashed)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Gera um token JWT assinando os dados fornecidos.

    Se `expires_delta` não for passado, utiliza a configuração
    `ACCESS_TOKEN_EXPIRE_MINUTES`.
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(username: str, password: str) -> Optional[User]:
    """Autentica um usuário e retorna um objeto User se válido."""
    raw = USERS.get(username)
    if not raw or not verify_password(password, raw["hashed_password"]):
        return None
    return User(
        username=raw["username"],
        full_name=raw["full_name"],
        role=raw["role"],
        disabled=raw["disabled"],
    )

async def get_current_user(request: Request, token: str | None = Depends(oauth2_scheme)) -> User:
    """Recupera o usuário atual a partir do token JWT.

    Lança HTTP 401 se o token for inválido ou expirado.
    """
    cred_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    # Tenta ler do header Authorization (Bearer) ou cookie HttpOnly
    if not token:
        token = request.cookies.get("access_token")
    try:
        payload = jwt.decode(token or "", SECRET_KEY, algorithms=[ALGORITHM])
        username: Optional[str] = payload.get("sub")
        role: Optional[str] = payload.get("role")
        if username is None or role is None:
            raise cred_exc
    except JWTError:
        raise cred_exc
    raw = USERS.get(username)
    if not raw:
        raise cred_exc
    return User(
        username=raw["username"],
        full_name=raw["full_name"],
        role=raw["role"],
        disabled=raw["disabled"],
    )

async def read_required(user: User = Depends(get_current_user)) -> User:
    """Valida que o usuário esteja ativo; retorna o próprio usuário."""
    if user.disabled:
        raise HTTPException(status_code=403, detail="User disabled")
    return user

async def admin_required(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin": raise HTTPException(status_code=403, detail="Admin required")
    return user

async def get_token_for_form(form) -> Token:
    user = authenticate_user(form.username, form.password)
    if not user: raise HTTPException(status_code=401, detail="Incorrect username or password")
    token = create_access_token({"sub": user.username, "role": user.role})
    return Token(access_token=token)
