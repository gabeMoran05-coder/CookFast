from __future__ import annotations

import json
from typing import Any

from anthropic import Anthropic

from config import ANTHROPIC_API_KEY
from utils import get_logger

logger = get_logger(__name__)

EMPTY_RESULT = {
    "ingredientes_detectados": [],
    "utensilios_detectados": [],
    "confianza": "baja",
}


def _extract_json(text: str) -> dict[str, Any]:
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON object found")
    return json.loads(text[start : end + 1])


def analyze_kitchen_image(image_base64: str) -> dict[str, Any]:
    if not ANTHROPIC_API_KEY:
        return {
            "ingredientes_detectados": ["tomate", "cebolla", "pollo"],
            "utensilios_detectados": ["sarten", "olla"],
            "confianza": "baja",
            "modo_demo": True,
            "mensaje": "Deteccion simulada: configura ANTHROPIC_API_KEY en .env para vision real.",
        }

    client = Anthropic(api_key=ANTHROPIC_API_KEY)
    prompt = (
        "Identifica ingredientes y utensilios visibles. Responde UNICAMENTE JSON con "
        'las llaves "ingredientes_detectados", "utensilios_detectados" y "confianza".'
    )

    for attempt in range(2):
        try:
            message = client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=500,
                messages=[
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": image_base64,
                                },
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
            )
            text = "".join(block.text for block in message.content if hasattr(block, "text"))
            data = _extract_json(text)
            return {
                "ingredientes_detectados": data.get("ingredientes_detectados", []),
                "utensilios_detectados": data.get("utensilios_detectados", []),
                "confianza": data.get("confianza", "media"),
            }
        except Exception as exc:
            logger.exception("Claude vision failed attempt %s/2: %s", attempt + 1, exc)

    return {**EMPTY_RESULT, "error": "No se pudo analizar la imagen; API fallo o JSON invalido"}
