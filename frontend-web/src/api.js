const API_URL = import.meta.env.VITE_API_URL || 'http://10.180.28.40:8000';

const LOCAL_RECIPES = [
  { id: 'local-1', titulo: 'Bowl global de arroz (demo local)', imagen: 'https://img.spoonacular.com/recipes/716429-312x231.jpg', calificacion: 88, likes: 220, base: ['arroz', 'cebolla', 'zanahoria'], faltantes: ['salsa de soya'] },
  { id: 'local-2', titulo: 'Tacos rápidos del refri (demo local)', imagen: 'https://img.spoonacular.com/recipes/715538-312x231.jpg', calificacion: 91, likes: 248, base: ['pollo', 'tomate', 'cebolla'], faltantes: ['tortilla', 'cilantro'] },
  { id: 'local-3', titulo: 'Pasta nocturna cremosa (demo local)', imagen: 'https://img.spoonacular.com/recipes/654959-312x231.jpg', calificacion: 84, likes: 176, base: ['pasta', 'queso fresco', 'leche'], faltantes: ['albahaca'] },
  { id: 'local-4', titulo: 'Salteado con lo que hay (demo local)', imagen: 'https://img.spoonacular.com/recipes/632660-312x231.jpg', calificacion: 79, likes: 130, base: ['carne', 'papa', 'cebolla'], faltantes: ['pimienta'] }
];

function localFallback(ingredients, tools) {
  const available = new Set(ingredients);
  return {
    recetas: LOCAL_RECIPES.map((recipe) => ({
      id: recipe.id,
      titulo: recipe.titulo,
      imagen: recipe.imagen,
      calificacion: recipe.calificacion,
      likes: recipe.likes,
      ingredientes_usados: recipe.base.filter((item) => available.has(item)).slice(0, 4),
      ingredientes_faltantes: recipe.faltantes,
      utensilio_faltante: tools.length ? null : 'Agrega utensilios para mejores recomendaciones',
      modo_demo_local: true
    })),
    total: LOCAL_RECIPES.length,
    modo_demo_local: true
  };
}

export async function fetchRecipes({ ingredients, tools = [], cuisine, strict = false }) {
  const params = new URLSearchParams({
    ingredientes: ingredients.join(','),
    utensilios: tools.join(','),
    modo_estricto: String(strict)
  });
  if (cuisine) params.set('pais_cocina', cuisine);
  try {
    const response = await fetch(`${API_URL}/recetas-disponibles?${params.toString()}`);
    if (!response.ok) throw new Error(`API ${response.status}`);
    return response.json();
  } catch (error) {
    return localFallback(ingredients, tools);
  }
}
