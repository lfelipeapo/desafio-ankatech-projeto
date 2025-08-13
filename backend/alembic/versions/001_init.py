from __future__ import annotations
from alembic import op
import sqlalchemy as sa
revision = '001_init'
down_revision = None
branch_labels = None
depends_on = None
def upgrade() -> None:
    op.create_table('clients',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False, unique=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_table('assets',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('ticker', sa.String(length=32), nullable=False, unique=True),
        sa.Column('name', sa.String(length=255)),
    )
    op.create_table('allocations',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('client_id', sa.Integer(), sa.ForeignKey('clients.id'), nullable=False),
        sa.Column('asset_id', sa.Integer(), sa.ForeignKey('assets.id'), nullable=False),
        sa.Column('quantity', sa.Float(), nullable=False),
        sa.Column('purchase_price', sa.Float(), nullable=False),
        sa.Column('purchase_date', sa.Date(), nullable=False),
        sa.UniqueConstraint('client_id', 'asset_id', 'purchase_date', name='uq_alloc'),
    )
    op.create_table('daily_returns',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('asset_id', sa.Integer(), sa.ForeignKey('assets.id'), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('close_price', sa.Float(), nullable=False),
        sa.UniqueConstraint('asset_id', 'date', name='uq_asset_date'),
    )
def downgrade() -> None:
    op.drop_table('daily_returns'); op.drop_table('allocations'); op.drop_table('assets'); op.drop_table('clients')
