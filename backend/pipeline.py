from __future__ import annotations

import argparse
from typing import Any

from apis.spoonacular_client import SpoonacularClient
from config import LANDING_DIR
from scraping.scraper_supermercado import scrape_products
from utils import get_logger, normalize_ingredient, overwrite_jsonl

logger = get_logger(__name__)


def _dedupe(rows: list[dict[str, Any]], keys: tuple[str, ...]) -> list[dict[str, Any]]:
    seen = set()
    result = []
    for row in rows:
        marker = tuple(row.get(key) for key in keys)
        if marker in seen:
            continue
        seen.add(marker)
        result.append(row)
    return result


def run_pipeline(
    ingredientes: list[str],
    cuisine: str | None = None,
    scraper_func= scrape_products,
    spoonacular_client: SpoonacularClient | None = None,
) -> dict[str, Any]:
    summary = {
        "productos_obtenidos": 0,
        "recetas_obtenidas": 0,
        "fallos": 0,
        "errores": [],
    }

    try:
        products = scraper_func()
        products = _dedupe(products, ("nombre_ingrediente", "nombre"))
        overwrite_jsonl(LANDING_DIR / "productos.jsonl", products)
        summary["productos_obtenidos"] = len(products)
    except Exception as exc:
        logger.exception("Scraping stage failed: %s", exc)
        summary["fallos"] += 1
        summary["errores"].append(f"scraping: {exc}")

    try:
        client = spoonacular_client or SpoonacularClient()
        clean_ingredients = [normalize_ingredient(item) for item in ingredientes if item.strip()]
        recipes = client.recipes_for_landing(clean_ingredients, cuisine=cuisine)
        recipes = _dedupe(recipes, ("nombre_ingrediente", "recipe_id"))
        overwrite_jsonl(LANDING_DIR / "recetas.jsonl", recipes)
        summary["recetas_obtenidas"] = len(recipes)
    except Exception as exc:
        logger.exception("Spoonacular stage failed: %s", exc)
        summary["fallos"] += 1
        summary["errores"].append(f"spoonacular: {exc}")

    total = summary["productos_obtenidos"] + summary["recetas_obtenidas"]
    print("Resumen del pipeline")
    print(f"Registros obtenidos: {total}")
    print(f"Productos: {summary['productos_obtenidos']}")
    print(f"Recetas landing: {summary['recetas_obtenidas']}")
    print(f"Fallos: {summary['fallos']}")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Pipeline hibrido Refri Inteligente")
    parser.add_argument("--ingredientes", default="tomate,cebolla,pollo")
    parser.add_argument("--cuisine", default=None)
    args = parser.parse_args()
    ingredientes = [item.strip() for item in args.ingredientes.split(",") if item.strip()]
    run_pipeline(ingredientes, cuisine=args.cuisine)


if __name__ == "__main__":
    main()
