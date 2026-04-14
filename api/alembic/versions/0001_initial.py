"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-04-14

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("username"),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    op.create_table(
        "cars",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("source_id", sa.String(64), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("make", sa.String(64)),
        sa.Column("make_ja", sa.String(64)),
        sa.Column("model", sa.String(128)),
        sa.Column("model_ja", sa.String(128)),
        sa.Column("grade", sa.String(255)),
        sa.Column("year", sa.Integer()),
        sa.Column("mileage_km", sa.Integer()),
        sa.Column("price_jpy", sa.BigInteger()),
        sa.Column("price_total_jpy", sa.BigInteger()),
        sa.Column("body_type", sa.String(64)),
        sa.Column("body_type_ja", sa.String(64)),
        sa.Column("transmission", sa.String(32)),
        sa.Column("transmission_ja", sa.String(32)),
        sa.Column("fuel", sa.String(32)),
        sa.Column("fuel_ja", sa.String(32)),
        sa.Column("drive", sa.String(16)),
        sa.Column("engine_cc", sa.Integer()),
        sa.Column("color", sa.String(64)),
        sa.Column("color_ja", sa.String(64)),
        sa.Column("location", sa.String(128)),
        sa.Column("dealer", sa.String(255)),
        sa.Column("inspection_until", sa.String(32)),
        sa.Column("repaired", sa.Boolean()),
        sa.Column("primary_image", sa.Text()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("source_id"),
    )
    op.create_index("ix_cars_source_id", "cars", ["source_id"], unique=True)
    op.create_index("ix_cars_make", "cars", ["make"])
    op.create_index("ix_cars_model", "cars", ["model"])
    op.create_index("ix_cars_year", "cars", ["year"])
    op.create_index("ix_cars_mileage_km", "cars", ["mileage_km"])
    op.create_index("ix_cars_price_jpy", "cars", ["price_jpy"])
    op.create_index("ix_cars_body_type", "cars", ["body_type"])
    op.create_index("ix_cars_make_model", "cars", ["make", "model"])
    op.create_index("ix_cars_year_price", "cars", ["year", "price_jpy"])

    op.create_table(
        "car_images",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("car_id", sa.Integer(), sa.ForeignKey("cars.id", ondelete="CASCADE"), nullable=False),
        sa.Column("url", sa.Text(), nullable=False),
        sa.Column("position", sa.Integer(), server_default="0"),
    )
    op.create_index("ix_car_images_car_id", "car_images", ["car_id"])

    op.create_table(
        "price_history",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("car_id", sa.Integer(), sa.ForeignKey("cars.id", ondelete="CASCADE"), nullable=False),
        sa.Column("price_jpy", sa.BigInteger(), nullable=False),
        sa.Column("observed_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_price_history_car_id", "price_history", ["car_id"])


def downgrade() -> None:
    op.drop_table("price_history")
    op.drop_table("car_images")
    op.drop_table("cars")
    op.drop_table("users")
