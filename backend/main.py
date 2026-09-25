from __future__ import annotations

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from apis.spoonacular_client import SpoonacularClient
from config import FRONTEND_ORIGINS, LANDING_DIR
from delivery.estimador_delivery import estimate_delivery_cost
from scraping.scraper_supermercado import scrape_products
from scraping.scraper_tiendas_cercanas import stores_for_ingredient
from utils import normalize_ingredient, overwrite_jsonl
from vision.detector_ingredientes import analyze_kitchen_image

app = FastAPI(title="Refri Inteligente API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ImagePayload(BaseModel):
    imagen_base64: str


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "servicio": "Refri Inteligente"}


@app.post("/analizar-cocina")
def analizar_cocina(payload: ImagePayload) -> dict:
    return analyze_kitchen_image(payload.imagen_base64)


@app.get("/recetas-disponibles")
def recetas_disponibles(
    ingredientes: str = Query(...),
    utensilios: str = "",
    pais_cocina: str | None = None,
    modo_estricto: bool = False,
) -> dict:
    ingredient_list = [normalize_ingredient(item) for item in ingredientes.split(",") if item.strip()]
    utensil_set = {normalize_ingredient(item) for item in utensilios.split(",") if item.strip()}
    client = SpoonacularClient()
    recipes = client.search_recipes(
        ingredient_list,
        cuisine=pais_cocina or None,
        strict=modo_estricto,
        number=10,
    )

    enriched = []
    for recipe in recipes:
        equipment = client.equipment_for_recipe(recipe["id"]) if recipe.get("id") else []
        missing_equipment = sorted(set(equipment) - utensil_set) if utensil_set else []
        recipe["equipo_requerido"] = equipment
        recipe["utensilio_faltante"] = (
            f"Necesitas {', '.join(missing_equipment)}" if missing_equipment else None
        )
        if modo_estricto:
            recipe["ingredientes_faltantes"] = []
        enriched.append(recipe)

    enriched.sort(key=lambda item: (item.get("calificacion", 0), item.get("likes", 0)), reverse=True)
    return {"recetas": enriched, "total": len(enriched)}


@app.get("/donde-comprar")
def donde_comprar(ingrediente: str, latitud: float, longitud: float) -> dict:
    return stores_for_ingredient(ingrediente, latitud, longitud)


@app.get("/costo-delivery")
def costo_delivery(ingrediente: str, ciudad: str | None = None) -> dict:
    return estimate_delivery_cost(ingrediente, city=ciudad)


@app.get("/productos-supermercado")
def productos_supermercado() -> dict:
    products = scrape_products()
    overwrite_jsonl(LANDING_DIR / "productos.jsonl", products)
    return {"productos": products, "total": len(products)}
