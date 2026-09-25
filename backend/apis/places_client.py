from __future__ import annotations

import math
from typing import Any

import requests

from config import GOOGLE_PLACES_API_KEY
from utils import get_logger, request_with_retries

logger = get_logger(__name__)


def _distance_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return round(radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 2)


def search_nearby_stores(ingredient: str, lat: float, lng: float) -> dict[str, Any]:
    if not GOOGLE_PLACES_API_KEY:
        return {
            "requires_config": True,
            "mensaje": "Configura GOOGLE_PLACES_API_KEY en .env para esta funcion",
            "tiendas": [],
        }

    params = {
        "query": f"supermercado tienda de abarrotes {ingredient}",
        "location": f"{lat},{lng}",
        "radius": 5000,
        "key": GOOGLE_PLACES_API_KEY,
    }
    response = request_with_retries(
        lambda: requests.get(
            "https://maps.googleapis.com/maps/api/place/textsearch/json",
            params=params,
            timeout=15,
        ),
        logger=logger,
        attempts=3,
    )
    data = response.json()
    stores = []
    for item in data.get("results", [])[:5]:
        location = item.get("geometry", {}).get("location", {})
        store_lat = location.get("lat", lat)
        store_lng = location.get("lng", lng)
        stores.append(
            {
                "nombre": item.get("name"),
                "direccion": item.get("formatted_address"),
                "distancia_km": _distance_km(lat, lng, store_lat, store_lng),
            }
        )
    stores.sort(key=lambda row: row["distancia_km"])
    return {"requires_config": False, "tiendas": stores}
