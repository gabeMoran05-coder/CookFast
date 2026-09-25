from __future__ import annotations

from typing import Any

import requests
from bs4 import BeautifulSoup

from config import SCRAPER_URL
from utils import get_logger, normalize_ingredient, request_with_retries

logger = get_logger(__name__)


DEFAULT_SELECTORS = {
    "item": ".thumbnail",
    "name": ".title",
    "price": ".price",
    "availability": ".ratings",
}


def _parse_price(value: str) -> float | None:
    clean = "".join(char for char in value if char.isdigit() or char == ".")
    return float(clean) if clean else None


def scrape_products(
    url: str = SCRAPER_URL,
    selectors: dict[str, str] | None = None,
    session: requests.Session | None = None,
) -> list[dict[str, Any]]:
    selectors = selectors or DEFAULT_SELECTORS
    session = session or requests.Session()

    response = request_with_retries(
        lambda: session.get(url, timeout=15),
        logger=logger,
        attempts=3,
    )
    soup = BeautifulSoup(response.text, "html.parser")
    rows: list[dict[str, Any]] = []

    for item in soup.select(selectors["item"]):
        name_node = item.select_one(selectors["name"])
        price_node = item.select_one(selectors["price"])
        availability_node = item.select_one(selectors.get("availability", ""))

        name = name_node.get_text(" ", strip=True) if name_node else ""
        price_text = price_node.get_text(" ", strip=True) if price_node else ""
        availability = (
            availability_node.get_text(" ", strip=True)
            if availability_node
            else "disponible"
        )

        if not name:
            continue

        rows.append(
            {
                "fuente": "web_scraping",
                "nombre": name,
                "nombre_ingrediente": normalize_ingredient(name),
                "precio": _parse_price(price_text),
                "disponibilidad": availability or "disponible",
                "url_fuente": url,
            }
        )

    return rows


def find_supported_online_price(ingredient: str, products: list[dict[str, Any]]) -> float | None:
    target = normalize_ingredient(ingredient)
    for product in products:
        name = product.get("nombre_ingrediente") or normalize_ingredient(product.get("nombre", ""))
        if target in name or name in target:
            return product.get("precio")
    return None
