const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://127.0.0.1:8000";

async function request(path) {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json();
}

export async function analyzeKitchen(imagenBase64) {
  const response = await fetch(`${API_URL}/analizar-cocina`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imagen_base64: imagenBase64 }),
  });
  if (!response.ok) {
    throw new Error(`API error ${response.status}`);
  }
  return response.json();
}

export function getRecipes({ ingredientes, utensilios, paisCocina, modoEstricto }) {
  const params = new URLSearchParams({
    ingredientes: ingredientes.join(","),
    utensilios: utensilios.join(","),
    modo_estricto: String(modoEstricto),
  });
  if (paisCocina) params.append("pais_cocina", paisCocina);
  return request(`/recetas-disponibles?${params.toString()}`);
}

export function whereToBuy({ ingrediente, latitud, longitud }) {
  const params = new URLSearchParams({
    ingrediente,
    latitud: String(latitud),
    longitud: String(longitud),
  });
  return request(`/donde-comprar?${params.toString()}`);
}

export function deliveryCost({ ingrediente, ciudad }) {
  const params = new URLSearchParams({ ingrediente });
  if (ciudad) params.append("ciudad", ciudad);
  return request(`/costo-delivery?${params.toString()}`);
}
