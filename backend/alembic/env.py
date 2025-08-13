from __future__ import annotations
from logging.config import fileConfig
import os
from sqlalchemy import engine_from_config, pool, create_engine
from alembic import context
config = context.config
if config.config_file_name is not None:
    try:
        fileConfig(config.config_file_name)
    except Exception:
        # Ignora configuração de logging incompleta em alembic.ini
        pass
from backend.database import DATABASE_URL
from backend.models import Base
target_metadata = Base.metadata
def _sync_url(url: str) -> str:
    # Converte URL assíncrona (postgresql+asyncpg) para síncrona (psycopg2)
    return url.replace("+asyncpg", "+psycopg2") if "+asyncpg" in url else url


def run_migrations_offline() -> None:
    url = _sync_url(os.environ.get("DATABASE_URL", DATABASE_URL))
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle":"named"})
    with context.begin_transaction():
        context.run_migrations()
def run_migrations_online() -> None:
    url = _sync_url(os.environ.get("DATABASE_URL", DATABASE_URL))
    connectable = create_engine(url, poolclass=pool.NullPool, future=True)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
if context.is_offline_mode(): run_migrations_offline()
else: run_migrations_online()
