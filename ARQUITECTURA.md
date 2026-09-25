# Arquitectura - Refri Inteligente

## Objetivo

Refri Inteligente es un proyecto de Ingenieria de Datos para recopilar, integrar y exponer datos de alimentos desde dos tecnicas principales:

- Web scraping: productos de supermercado.
- API externa: recetas y metadatos de Spoonacular.

El resultado se guarda en una landing comun JSONL con identificador normalizado `nombre_ingrediente`.

## Flujo hibrido

```text
Usuario / Expo
  |
  | foto base64
  v
Claude Vision ---> ingredientes y utensilios detectados
  |
  v
FastAPI
  |
  +--> Spoonacular: recetas, cuisine/pais, ratings, equipment
  |
  +--> Landing productos.jsonl: precios base scrapeados
  |
  +--> Google Places: tiendas cercanas
  |
  +--> Estimador delivery simulado

Pipeline academico:
  Scraper supermercado ----\
                            +--> landing/*.jsonl
  Spoonacular API ---------/
```

## Decisiones tecnicas

- FastAPI se usa por su rapidez para construir endpoints REST y su validacion con Pydantic.
- El pipeline escribe JSONL porque es simple, auditable y comun en zonas de landing.
- La normalizacion elimina acentos, pasa a minusculas y aplica singularizacion sencilla para tener llaves comparables.
- Los clientes HTTP tienen reintentos con backoff exponencial, manejo de `ConnectionError`, `Timeout` y `HTTPError`, y registro obligatorio en `pipeline_errores.log`.
- Spoonacular queda encapsulado para respetar paginacion, rate limits y degradacion si no hay API key.
- Google Places es opcional; sin key, la API responde con una explicacion en vez de fallar.
- Expo Go se mantiene sin codigo nativo custom; usa librerias compatibles como `expo-camera`, `expo-location` y `expo-image-manipulator`.

## Que se probo

Las pruebas simples cubren:

- Ejecucion completa del pipeline con clientes simulados.
- Tolerancia a fallos de red mediante mock.
- Calidad de datos crudos: sin duplicados y sin campos vacios obligatorios.

Comando:

```bash
cd backend
pytest
```

## Limitaciones y decisiones eticas

El endpoint `/costo-delivery` es un estimador simulado para fines academicos.

No se hizo scraping real de apps como Rappi, Uber Eats o similares porque:

- No ofrecen API publica general para consultar precios de productos individuales.
- Sus terminos de servicio suelen prohibir scraping automatizado no autorizado.
- Muchas apps son nativas, requieren login, ubicacion y sesiones dinamicas sin HTML publico scrapeable.
- Automatizar compras, precios o catalogos privados puede violar condiciones comerciales.

Por eso el estimador usa precios base de `landing/productos.jsonl`, un markup configurable y una cuota fija de envio. La respuesta marca siempre `estimado_simulado: true`.

## Datos reales vs simulados

- Real: productos obtenidos por scraping de sitio soportado o sitio de practica.
- Real: recetas, calificaciones y cuisine desde Spoonacular.
- Real: ingredientes/utensilios detectados por Claude Vision, si hay API key.
- Real: tiendas cercanas desde Google Places, si hay API key.
- Simulado: delivery.
