import requests

from pipeline import run_pipeline
from utils import request_with_retries


class FakeSpoonacular:
    def recipes_for_landing(self, ingredients, cuisine=None):
        return [
            {
                "fuente": "spoonacular",
                "nombre_ingrediente": ingredients[0],
                "recipe_id": 1,
                "titulo": "Sopa de prueba",
                "calificacion": 80,
                "likes": 10,
                "pais_cocina": cuisine,
            }
        ]


def test_pipeline_completo(tmp_path, monkeypatch):
    monkeypatch.setattr("config.LANDING_DIR", tmp_path)
    monkeypatch.setattr("pipeline.LANDING_DIR", tmp_path)

    def fake_scraper():
        return [
            {
                "fuente": "web_scraping",
                "nombre": "Tomates",
                "nombre_ingrediente": "tomate",
                "precio": 25,
                "disponibilidad": "disponible",
            }
        ]

    summary = run_pipeline(["tomate"], scraper_func=fake_scraper, spoonacular_client=FakeSpoonacular())
    assert summary["fallos"] == 0
    assert summary["productos_obtenidos"] == 1
    assert summary["recetas_obtenidas"] == 1


def test_tolerancia_fallos_red(monkeypatch):
    calls = {"count": 0}

    def operation():
        calls["count"] += 1
        raise requests.exceptions.ConnectionError("red caida")

    class Logger:
        def exception(self, *args, **kwargs):
            pass

    monkeypatch.setattr("time.sleep", lambda delay: None)

    try:
        request_with_retries(operation, logger=Logger(), attempts=2)
    except requests.exceptions.ConnectionError:
        pass

    assert calls["count"] == 2


def test_calidad_datos_crudos(tmp_path, monkeypatch):
    monkeypatch.setattr("config.LANDING_DIR", tmp_path)
    monkeypatch.setattr("pipeline.LANDING_DIR", tmp_path)

    def duplicated_scraper():
        return [
            {
                "fuente": "web_scraping",
                "nombre": "Cebolla",
                "nombre_ingrediente": "cebolla",
                "precio": 18,
                "disponibilidad": "disponible",
            },
            {
                "fuente": "web_scraping",
                "nombre": "Cebolla",
                "nombre_ingrediente": "cebolla",
                "precio": 18,
                "disponibilidad": "disponible",
            },
        ]

    summary = run_pipeline(["cebolla"], scraper_func=duplicated_scraper, spoonacular_client=FakeSpoonacular())
    assert summary["productos_obtenidos"] == 1
    for path in (tmp_path / "productos.jsonl", tmp_path / "recetas.jsonl"):
        lines = [line for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]
        assert len(lines) == len(set(lines))
        assert all('""' not in line for line in lines)
