from __future__ import annotations

from typing import Any

import requests

from config import SPOONACULAR_API_KEY
from apis.themealdb_client import TheMealDBClient
from utils import get_logger, normalize_ingredient, request_with_retries

logger = get_logger(__name__)

BASE_URL = "https://api.spoonacular.com"

DEMO_RECIPES = [
    {
        "id": 900001,
        "titulo": "Tacos caseros de pollo",
        "imagen": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
        "calificacion": 91,
        "likes": 248,
        "ingredientes_principales": ["pollo", "tomate", "cebolla", "chile"],
        "ingredientes_faltantes_base": ["tortilla", "cilantro", "limon"],
        "equipo": ["sarten", "estufa de gas"],
    },
    {
        "id": 900002,
        "titulo": "Arroz con verduras",
        "imagen": "https://img.spoonacular.com/recipes/716429-312x231.jpg",
        "calificacion": 86,
        "likes": 173,
        "ingredientes_principales": ["arroz", "zanahoria", "cebolla", "papa"],
        "ingredientes_faltantes_base": ["ajo"],
        "equipo": ["olla", "estufa de gas"],
    },
    {
        "id": 900003,
        "titulo": "Salsa fresca de tomate",
        "imagen": "https://img.spoonacular.com/recipes/654959-312x231.jpg",
        "calificacion": 82,
        "likes": 119,
        "ingredientes_principales": ["tomate", "cebolla", "chile", "limon"],
        "ingredientes_faltantes_base": ["cilantro"],
        "equipo": ["licuadora"],
    },
    {
        "id": 900004,
        "titulo": "Papas con carne estilo casero",
        "imagen": "https://img.spoonacular.com/recipes/632660-312x231.jpg",
        "calificacion": 78,
        "likes": 94,
        "ingredientes_principales": ["papa", "carne", "cebolla", "tomate"],
        "ingredientes_faltantes_base": ["ajo", "pimienta"],
        "equipo": ["sarten", "estufa de gas"],
    },
]


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
            return self._demo_search(clean_ingredients, strict=strict, number=number)

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

    def _demo_search(
        self,
        ingredients: list[str],
        strict: bool = False,
        number: int = 10,
    ) -> list[dict[str, Any]]:
        available = set(ingredients)
        results = []
        for recipe in DEMO_RECIPES:
            required = set(recipe["ingredientes_principales"])
            used = sorted(required & available)
            missing_required = sorted(required - available)
            if strict and missing_required:
                continue
            missing = sorted(set(missing_required) | set(recipe["ingredientes_faltantes_base"]))
            if not strict:
                missing = missing[:3]
            results.append(
                {
                    "id": recipe["id"],
                    "titulo": f"{recipe['titulo']} (demo)",
                    "imagen": recipe["imagen"],
                    "calificacion": recipe["calificacion"],
                    "likes": recipe["likes"],
                    "ingredientes_usados": used or list(recipe["ingredientes_principales"][:2]),
                    "ingredientes_faltantes": [] if strict else missing,
                    "missedIngredientCount": 0 if strict else len(missing),
                    "modo_demo": True,
                }
            )
        results.sort(key=lambda item: (len(item["ingredientes_usados"]), item["calificacion"]), reverse=True)
        return results[:number]

    def analyzed_instructions(self, recipe_id: int) -> list[dict[str, Any]]:
        data = self._get(f"/recipes/{recipe_id}/analyzedInstructions", {})
        return data if isinstance(data, list) else []

    def equipment_for_recipe(self, recipe_id: int) -> list[str]:
        if not self.api_key:
            if str(recipe_id).startswith("themealdb-"):
                return []
            for recipe in DEMO_RECIPES:
                if recipe["id"] == recipe_id:
                    return recipe["equipo"]
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
                        "fuente": recipe.get("fuente") or ("spoonacular" if not recipe.get("modo_demo") else "spoonacular_demo"),
                        "nombre_ingrediente": normalize_ingredient(ingredient),
                        "recipe_id": recipe["id"],
                        "titulo": recipe["titulo"],
                        "calificacion": recipe["calificacion"],
                        "likes": recipe["likes"],
                        "pais_cocina": cuisine,
                    }
                )
        return rows



