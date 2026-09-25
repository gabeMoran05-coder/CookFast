from __future__ import annotations

from apis.places_client import search_nearby_stores
from config import LANDING_DIR
from scraping.scraper_supermercado import find_supported_online_price
from utils import read_jsonl


SUPPORTED_CHAINS = ("walmart", "superama", "bodega aurrera")


def stores_for_ingredient(ingredient: str, lat: float, lng: float) -> dict:
    places = search_nearby_stores(ingredient, lat, lng)
    if places.get("requires_config"):
        return places

    products = read_jsonl(LANDING_DIR / "productos.jsonl")
    stores = []
    for store in places.get("tiendas", [])[:5]:
        name = store.get("nombre", "")
        supports_price = any(chain in name.lower() for chain in SUPPORTED_CHAINS)
        price = find_supported_online_price(ingredient, products) if supports_price else None
        stores.append(
            {
                **store,
                "precio": price,
                "nota": None if price else "precio no disponible en linea",
            }
        )
    return {"tiendas": stores}
