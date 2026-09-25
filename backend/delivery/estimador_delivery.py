from __future__ import annotations

from config import DELIVERY_FEE, DELIVERY_MARKUP_MAX, DELIVERY_MARKUP_MIN, LANDING_DIR
from utils import normalize_ingredient, read_jsonl


def estimate_delivery_cost(ingredient: str, city: str | None = None) -> dict:
    target = normalize_ingredient(ingredient)
    products = read_jsonl(LANDING_DIR / "productos.jsonl")
    product = next(
        (
            row
            for row in products
            if target in row.get("nombre_ingrediente", "")
            or row.get("nombre_ingrediente", "") in target
        ),
        None,
    )
    base_price = product.get("precio") if product else None
    if base_price is None:
        return {
            "ingrediente": ingredient,
            "ciudad": city,
            "estimado_simulado": True,
            "precio_base": None,
            "total_estimado": None,
            "nota": "No hay precio base en landing/productos.jsonl para estimar delivery.",
        }

    avg_markup = (DELIVERY_MARKUP_MIN + DELIVERY_MARKUP_MAX) / 2
    subtotal = round(base_price * (1 + avg_markup), 2)
    total = round(subtotal + DELIVERY_FEE, 2)
    return {
        "ingrediente": ingredient,
        "ciudad": city,
        "estimado_simulado": True,
        "precio_base": base_price,
        "markup_aplicado": avg_markup,
        "cuota_envio": DELIVERY_FEE,
        "total_estimado": total,
        "nota": "Aproximacion educativa; no es precio real de Rappi, Uber Eats u otra app.",
    }
