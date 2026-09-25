import os
from pathlib import Path

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
LANDING_DIR = BASE_DIR / "landing"
LOG_FILE = BASE_DIR / "pipeline_errores.log"

load_dotenv(BASE_DIR / ".env")

SPOONACULAR_API_KEY = os.getenv("SPOONACULAR_API_KEY", "")
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
THEMEALDB_API_KEY = os.getenv("THEMEALDB_API_KEY", "1")
THEMEALDB_BASE_URL = os.getenv("THEMEALDB_BASE_URL", "https://www.themealdb.com/api/json/v1")
SCRAPER_URL = os.getenv(
    "SCRAPER_URL",
    "https://webscraper.io/test-sites/e-commerce/static/computers/laptops",
)
FRONTEND_ORIGINS = [
    origin.strip()
    for origin in os.getenv("FRONTEND_ORIGINS", "*").split(",")
    if origin.strip()
]

DELIVERY_MARKUP_MIN = float(os.getenv("DELIVERY_MARKUP_MIN", "0.25"))
DELIVERY_MARKUP_MAX = float(os.getenv("DELIVERY_MARKUP_MAX", "0.40"))
DELIVERY_FEE = float(os.getenv("DELIVERY_FEE", "45"))
