import json
import logging
import time
import unicodedata
from pathlib import Path
from typing import Any, Callable

import requests

from config import LOG_FILE


def get_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if logger.handlers:
        return logger
    logger.setLevel(logging.INFO)
    handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)s %(name)s: %(message)s")
    )
    logger.addHandler(handler)
    return logger


def normalize_ingredient(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "")
    text = "".join(char for char in text if not unicodedata.combining(char))
    text = text.lower().strip()
    text = " ".join(text.replace("-", " ").split())
    if text.endswith("es") and len(text) > 4:
        text = text[:-2]
    elif text.endswith("s") and len(text) > 3:
        text = text[:-1]
    return text


def request_with_retries(
    operation: Callable[[], requests.Response],
    *,
    logger: logging.Logger,
    attempts: int = 3,
    base_delay: float = 1.0,
) -> requests.Response:
    last_error: Exception | None = None
    handled = (
        requests.exceptions.ConnectionError,
        requests.exceptions.Timeout,
        requests.exceptions.HTTPError,
    )
    for attempt in range(1, attempts + 1):
        try:
            response = operation()
            response.raise_for_status()
            return response
        except handled as exc:
            last_error = exc
            logger.exception("Network failure attempt %s/%s: %s", attempt, attempts, exc)
            if attempt < attempts:
                retry_after = getattr(getattr(exc, "response", None), "headers", {}).get(
                    "Retry-After"
                )
                delay = float(retry_after) if retry_after else base_delay * (2 ** (attempt - 1))
                time.sleep(delay)
    raise last_error or RuntimeError("Request failed without captured exception")


def append_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a", encoding="utf-8") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=False) + "\n")


def overwrite_jsonl(path: Path, rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        for row in rows:
            file.write(json.dumps(row, ensure_ascii=False) + "\n")


def read_jsonl(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    rows: list[dict[str, Any]] = []
    with path.open("r", encoding="utf-8") as file:
        for line in file:
            if line.strip():
                rows.append(json.loads(line))
    return rows
