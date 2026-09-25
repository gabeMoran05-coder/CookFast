from __future__ import annotations

from typing import Any

import requests

from config import THEMEALDB_API_KEY, THEMEALDB_BASE_URL
from utils import get_logger, normalize_ingredient, request_with_retries

logger = get_logger(__name__)

INGREDIENT_TRANSLATIONS = {
    "tomate": "Tomato",
    "jitomate": "Tomato",
    "cebolla": "Onion",
    "pollo": "Chicken",
    "carne": "Beef",
    "res": "Beef",
    "cerdo": "Pork",
    "pescado": "Fish",
    "camaron": "Prawns",
    "camarón": "Prawns",
    "arroz": "Rice",
    "pasta": "Pasta",
    "papa": "Potato",
    "zanahoria": "Carrot",
    "chile": "Chilli",
    "limon": "Lime",
    "limón": "Lime",
    "cilantro": "Coriander",
    "queso": "Cheese",
    "queso fresco": "Cheese",
    "leche": "Milk",
    "huevo": "Eggs",
    "ajo": "Garlic",
    "frijol": "Beans",
    "frijol negro": "Black Beans",
    "lenteja": "Lentils",
    "garbanzo": "Chickpeas",
    "maiz": "Corn",
    "maíz": "Corn",
    "aguacate": "Avocado",
    "yogur": "Yogurt",
    "nuez": "Walnuts",
    "almendra": "Almonds",
    "salmon": "Salmon",
    "salmón": "Salmon",
    "atun": "Tuna",
    "atún": "Tuna",
}

CUISINE_TO_AREA = {
    "american": "American",
    "british": "British",
    "canadian": "Canadian",
    "chinese": "Chinese",
    "dutch": "Dutch",
    "egyptian": "Egyptian",
    "filipino": "Filipino",
    "french": "French",
    "greek": "Greek",
    "indian": "Indian",
    "irish": "Irish",
    "italian": "Italian",
    "jamaican": "Jamaican",
    "japanese": "Japanese",
    "kenyan": "Kenyan",
    "malaysian": "Malaysian",
    "mexican": "Mexican",
    "moroccan": "Moroccan",
    "polish": "Polish",
    "portuguese": "Portuguese",
    "russian": "Russian",
    "spanish": "Spanish",
    "thai": "Thai",
    "tunisian": "Tunisian",
    "turkish": "Turkish",
    "ukrainian": "Ukrainian",
    "vietnamese": "Vietnamese",
    "caribbean": "Jamaican",
    "latin american": "Mexican",
    "middle eastern": "Turkish",
    "african": "Moroccan",
    "asian": "Chinese",
    "mediterranean": "Greek",
    "eastern european": "Polish",
    "nordic": "British",
    "southern": "American",
    "cajun": "American",
    "jewish": "Turkish",
}


def _translated_ingredient(value: str) -> str:
    normalized = normalize_ingredient(value)
    return INGREDIENT_TRANSLATIONS.get(normalized, value.replace(" ", "_").title())


def _meal_ingredients(meal: dict[str, Any]) -> list[str]:
    ingredients = []
    for index in range(1, 21):
        value = (meal.get(f"strIngredient{index}") or "").strip()
        if value:
            ingredients.append(value)
    return ingredients


class TheMealDBClient:
    def __init__(self, api_key: str | None = None, session: requests.Session | None = None):
        self.api_key = api_key or THEMEALDB_API_KEY or "1"
        self.base_url = f"{THEMEALDB_BASE_URL.rstrip('/')}/{self.api_key}"
        self.session = session or requests.Session()

    def _get(self, path: str, params: dict[str, Any] | None = None) -> dict[str, Any]:
        response = request_with_retries(
            lambda: self.session.get(f"{self.base_url}/{path}", params=params or {}, timeout=15),
            logger=logger,
            attempts=2,
        )
        return response.json()

    def _lookup(self, meal_id: str) -> dict[str, Any] | None:
        data = self._get("lookup.php", {"i": meal_id})
        meals = data.get("meals") or []
        return meals[0] if meals else None

    def search_recipes(self, ingredients: list[str], cuisine: str | None = None, strict: bool = False, number: int = 10) -> list[dict[str, Any]]:
        candidates = []
        area = CUISINE_TO_AREA.get((cuisine or "").lower())
        if area:
            data = self._get("filter.php", {"a": area})
            candidates = data.get("meals") or []
        elif ingredients:
            main = _translated_ingredient(ingredients[0]).replace(" ", "_")
            data = self._get("filter.php", {"i": main})
            candidates = data.get("meals") or []

        if not candidates:
            data = self._get("search.php", {"s": ""})
            candidates = data.get("meals") or []

        wanted = {normalize_ingredient(_translated_ingredient(item)) for item in ingredients}
        recipes: list[dict[str, Any]] = []
        for candidate in candidates[: max(number * 2, number)]:
            detail = self._lookup(candidate.get("idMeal", "")) if candidate.get("idMeal") else candidate
            if not detail:
                continue
            meal_ingredients = _meal_ingredients(detail)
            normalized_meal_ingredients = {normalize_ingredient(item) for item in meal_ingredients}
            used = sorted(wanted & normalized_meal_ingredients)
            missed = sorted(list(normalized_meal_ingredients - wanted))[:3]
            if strict and missed:
                continue
            score = 70 + min(len(used) * 6, 24)
            recipes.append(
                {
                    "id": f"themealdb-{detail.get('idMeal')}",
                    "titulo": detail.get("strMeal"),
                    "imagen": detail.get("strMealThumb"),
                    "calificacion": score,
                    "likes": int(detail.get("idMeal", "0")[-3:] or 0),
                    "ingredientes_usados": used or meal_ingredients[:3],
                    "ingredientes_faltantes": [] if strict else missed,
                    "missedIngredientCount": 0 if strict else len(missed),
                    "fuente": "TheMealDB",
                    "area": detail.get("strArea"),
                    "categoria": detail.get("strCategory"),
                    "instrucciones": detail.get("strInstructions"),
                }
            )
            if len(recipes) >= number:
                break
        return recipes

    def equipment_for_recipe(self, recipe_id: int | str) -> list[str]:
        return []
