const API_URL = import.meta.env.VITE_API_URL || 'http://10.180.28.40:8000';
const MEALDB = 'https://www.themealdb.com/api/json/v1/1';

const TRANSLATIONS = {
  tomate: 'Tomato', jitomate: 'Tomato', cebolla: 'Onion', pollo: 'Chicken', carne: 'Beef', res: 'Beef', cerdo: 'Pork', pescado: 'Fish', camaron: 'Prawns', camarón: 'Prawns', arroz: 'Rice', pasta: 'Pasta', papa: 'Potato', zanahoria: 'Carrot', chile: 'Chilli', limon: 'Lime', limón: 'Lime', cilantro: 'Coriander', queso: 'Cheese', 'queso fresco': 'Cheese', leche: 'Milk', huevo: 'Eggs', ajo: 'Garlic', frijol: 'Beans', 'frijol negro': 'Black Beans', lenteja: 'Lentils', garbanzo: 'Chickpeas', maiz: 'Corn', maíz: 'Corn', aguacate: 'Avocado', yogur: 'Yogurt', nuez: 'Walnuts', almendra: 'Almonds', salmon: 'Salmon', salmón: 'Salmon', atun: 'Tuna', atún: 'Tuna'
};

const CUISINE_TO_AREA = {
  american: 'American', british: 'British', canadian: 'Canadian', chinese: 'Chinese', dutch: 'Dutch', egyptian: 'Egyptian', filipino: 'Filipino', french: 'French', greek: 'Greek', indian: 'Indian', irish: 'Irish', italian: 'Italian', jamaican: 'Jamaican', japanese: 'Japanese', kenyan: 'Kenyan', malaysian: 'Malaysian', mexican: 'Mexican', moroccan: 'Moroccan', polish: 'Polish', portuguese: 'Portuguese', russian: 'Russian', spanish: 'Spanish', thai: 'Thai', tunisian: 'Tunisian', turkish: 'Turkish', ukrainian: 'Ukrainian', vietnamese: 'Vietnamese', caribbean: 'Jamaican', 'latin american': 'Mexican', 'middle eastern': 'Turkish', african: 'Moroccan', asian: 'Chinese', mediterranean: 'Greek', 'eastern european': 'Polish', nordic: 'British', southern: 'American', cajun: 'American', jewish: 'Turkish'
};

function normalize(value) {
  return String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

function translate(value) {
  const key = normalize(value);
  return TRANSLATIONS[key] || String(value || '').replace(/\s+/g, '_');
}

async function mealDbGet(path, params = {}) {
  const qs = new URLSearchParams(params);
  const response = await fetch(`${MEALDB}/${path}?${qs.toString()}`);
  if (!response.ok) throw new Error(`TheMealDB ${response.status}`);
  return response.json();
}

function extractIngredients(meal) {
  const result = [];
  for (let index = 1; index <= 20; index += 1) {
    const value = (meal[`strIngredient${index}`] || '').trim();
    if (value) result.push(value);
  }
  return result;
}

async function lookupMeal(id) {
  const data = await mealDbGet('lookup.php', { i: id });
  return data.meals?.[0] || null;
}

async function fetchMealDbRecipes({ ingredients, cuisine }) {
  const area = CUISINE_TO_AREA[String(cuisine || '').toLowerCase()];
  const candidateMap = new Map();

  if (area) {
    const data = await mealDbGet('filter.php', { a: area });
    (data.meals || []).slice(0, 18).forEach((meal) => candidateMap.set(meal.idMeal, meal));
  }

  for (const ingredient of ingredients.slice(0, 5)) {
    const translated = translate(ingredient);
    try {
      const data = await mealDbGet('filter.php', { i: translated.replace(/\s+/g, '_') });
      (data.meals || []).slice(0, 8).forEach((meal) => candidateMap.set(meal.idMeal, meal));
    } catch {
      // Keep trying other ingredients.
    }
  }

  if (!candidateMap.size) {
    const letters = ['c', 'b', 'p', 's'];
    for (const letter of letters) {
      const data = await mealDbGet('search.php', { f: letter });
      (data.meals || []).slice(0, 6).forEach((meal) => candidateMap.set(meal.idMeal, meal));
      if (candidateMap.size >= 12) break;
    }
  }

  const wanted = new Set(ingredients.map((item) => normalize(translate(item))));
  const details = await Promise.all(Array.from(candidateMap.values()).slice(0, 14).map((meal) => lookupMeal(meal.idMeal)));

  const recetas = details.filter(Boolean).map((meal) => {
    const mealIngredients = extractIngredients(meal);
    const normalizedMealIngredients = mealIngredients.map(normalize);
    const used = mealIngredients.filter((item, index) => wanted.has(normalizedMealIngredients[index])).slice(0, 5);
    const faltantes = mealIngredients.filter((item, index) => !wanted.has(normalizedMealIngredients[index])).slice(0, 4);
    return {
      id: `themealdb-${meal.idMeal}`,
      titulo: meal.strMeal,
      imagen: meal.strMealThumb,
      calificacion: 72 + Math.min(24, used.length * 6),
      likes: Number(String(meal.idMeal).slice(-3)) || 0,
      ingredientes_usados: used.length ? used : mealIngredients.slice(0, 4),
      ingredientes_faltantes: faltantes,
      fuente: 'TheMealDB',
      area: meal.strArea,
      categoria: meal.strCategory
    };
  });

  return { recetas, total: recetas.length, fuente: 'TheMealDB web' };
}

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
  const params = new URLSearchParams({ ingredientes: ingredients.join(','), utensilios: tools.join(','), modo_estricto: String(strict) });
  if (cuisine) params.set('pais_cocina', cuisine);
  try {
    const response = await fetch(`${API_URL}/recetas-disponibles?${params.toString()}`);
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    if (data.recetas?.length) return data;
  } catch {
    // GitHub Pages cannot call the local HTTP backend, so use TheMealDB directly.
  }

  try {
    const data = await fetchMealDbRecipes({ ingredients, cuisine });
    if (data.recetas?.length) return data;
  } catch {
    // Final offline fallback.
  }

  return localFallback(ingredients, tools);
}
