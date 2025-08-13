FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

COPY requirements.txt ./requirements.txt

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/* \
    && pip install -r requirements.txt

# Copia o código como pacote em /app/backend
COPY . /app/backend

EXPOSE 8000

# Corrigindo para usar main:app em vez de backend.api:app
CMD ["uvicorn","main:app","--host","0.0.0.0","--port","8000"]
