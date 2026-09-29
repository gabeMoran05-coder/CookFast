from __future__ import annotations

from typing import Any

import requests

from config import SPOONACULAR_API_KEY
from apis.themealdb_client import TheMealDBClient
from utils import get_logger, normalize_ingredient, request_with_retries

logger = get_logger(__name__)

BASE_URL = "https://api.spoonacular.com"

class SpoonacularClient:
    def __init__(self, api_key: str | None = None, session: requests.Session | None = None):
        self.api_key = api_key if api_key is not None else SPOONACULAR_API_KEY
        self.session = session or requests.Session()

    def _get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        if not self.api_key:
            logger.error("Missing SPOONACULAR_API_KEY")
            return {}
        params = {**(params or {}), "apiKey": self.api_key}
        response = request_with_retries(
            lambda: self.session.get(f"{BASE_URL}{path}", params=params, timeout=20),
            logger=logger,
            attempts=3,
        )
        return response.json()

    def search_recipes(
        self,
        ingredients: list[str],
        cuisine: str | None = None,
        strict: bool = False,
        number: int = 10,
    ) -> list[dict[str, Any]]:
        clean_ingredients = [normalize_ingredient(item) for item in ingredients if item]
        if not self.api_key:
            try:
                recipes = TheMealDBClient(session=self.session).search_recipes(clean_ingredients, cuisine=cuisine, strict=strict, number=number)
                if recipes:
                    return recipes
            except Exception as exc:
                logger.exception("TheMealDB fallback failed: %s", exc)
            return []

        if cuisine:
            data = self._get(
                "/recipes/complexSearch",
                {
                    "includeIngredients": ",".join(clean_ingredients),
                    "cuisine": cuisine,
                    "sort": "popularity",
                    "addRecipeInformation": "true",
                    "fillIngredients": "true",
                    "ignorePantry": "true",
                    "number": number,
                },
            )
            recipes = data.get("results", []) if isinstance(data, dict) else []
        else:
            recipes = self._get(
                "/recipes/findByIngredients",
                {
                    "ingredients": ",".join(clean_ingredients),
                    "ranking": 1,
                    "ignorePantry": "true",
                    "number": number,
                },
            )
            if not isinstance(recipes, list):
                recipes = []

        normalized = []
        for recipe in recipes:
            missed = recipe.get("missedIngredients", []) or []
            missed_count = recipe.get("missedIngredientCount", len(missed))
            if strict and missed_count:
                continue
            if not strict and missed_count > 3:
                continue
            normalized.append(
                {
                    "id": recipe.get("id"),
                    "titulo": recipe.get("title"),
                    "imagen": recipe.get("image"),
                    "calificacion": recipe.get("spoonacularScore")
                    or recipe.get("healthScore")
                    or 0,
                    "likes": recipe.get("aggregateLikes") or recipe.get("likes") or 0,
                    "ingredientes_usados": [
                        item.get("name") for item in recipe.get("usedIngredients", []) if item.get("name")
                    ],
                    "ingredientes_faltantes": [
                        item.get("name") for item in missed if item.get("name")
                    ],
                    "missedIngredientCount": missed_count,
                }
            )
        return normalized

    def analyzed_instructions(self, recipe_id: int) -> list[dict[str, Any]]:
        data = self._get(f"/recipes/{recipe_id}/analyzedInstructions", {})
        return data if isinstance(data, list) else []

    def equipment_for_recipe(self, recipe_id: int) -> list[str]:
        if not self.api_key or str(recipe_id).startswith("themealdb-"):
            return []

        instructions = self.analyzed_instructions(recipe_id)
        equipment: set[str] = set()
        for block in instructions:
            for step in block.get("steps", []):
                for item in step.get("equipment", []):
                    name = item.get("name")
                    if name:
                        equipment.add(normalize_ingredient(name))
        return sorted(equipment)

    def recipes_for_landing(self, ingredients: list[str], cuisine: str | None = None) -> list[dict[str, Any]]:
        recipes = self.search_recipes(ingredients, cuisine=cuisine, strict=False, number=10)
        rows = []
        for recipe in recipes:
            for ingredient in ingredients:
                rows.append(
                    {
                        "fuente": recipe.get("fuente") or "spoonacular",
                        "nombre_ingrediente": normalize_ingredient(ingredient),
                        "recipe_id": recipe["id"],
                        "titulo": recipe["titulo"],
                        "calificacion": recipe["calificacion"],
                        "likes": recipe["likes"],
                        "pais_cocina": cuisine,
                    }
                )
        return rows



