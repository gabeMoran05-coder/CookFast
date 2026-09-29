const DEFAULT_API_URL = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:8000`
  : 'http://127.0.0.1:8000';
const API_URL = import.meta.env.VITE_API_URL || DEFAULT_API_URL;
const MEALDB = 'https://www.themealdb.com/api/json/v1/1';
const COCKTAILDB = 'https://www.thecocktaildb.com/api/json/v1/1';

const TRANSLATIONS = {
  tomate: 'Tomato', jitomate: 'Tomato', cebolla: 'Onion', pollo: 'Chicken', carne: 'Beef', res: 'Beef', cerdo: 'Pork', pescado: 'Fish', camaron: 'Prawns', camarón: 'Prawns', arroz: 'Rice', pasta: 'Pasta', papa: 'Potato', zanahoria: 'Carrot', chile: 'Chilli', limon: 'Lime', limón: 'Lime', cilantro: 'Coriander', queso: 'Cheese', 'queso fresco': 'Cheese', leche: 'Milk', huevo: 'Eggs', ajo: 'Garlic', frijol: 'Beans', 'frijol negro': 'Black Beans', lenteja: 'Lentils', garbanzo: 'Chickpeas', maiz: 'Corn', maíz: 'Corn', aguacate: 'Avocado', yogur: 'Yogurt', yogurt: 'Yogurt', nuez: 'Walnuts', almendra: 'Almonds', salmon: 'Salmon', salmón: 'Salmon', atun: 'Tuna', atún: 'Tuna', cerveza: 'Beer', vino: 'Wine', ron: 'Rum', vodka: 'Vodka', ginebra: 'Gin', tequila: 'Tequila', whisky: 'Whiskey', cafe: 'Coffee', café: 'Coffee', leche: 'Milk', naranja: 'Orange', piña: 'Pineapple', agua: 'Water', menta: 'Mint', hierbabuena: 'Mint', fresa: 'Strawberry'
};

const ES_WORDS = [
  ['Preheat', 'Precalienta'], ['broiler', 'asador del horno'], ['oven', 'horno'], ['Place', 'Coloca'], ['red bell peppers', 'pimientos rojos'], ['tomatoes', 'tomates'], ['tomato', 'tomate'], ['baking sheet', 'charola para hornear'], ['roast', 'asa'], ['turning occasionally', 'volteando ocasionalmente'], ['blacken', 'oscurecer'], ['skin', 'piel'], ['peel off', 'pelar'], ['Cool', 'Deja enfriar'], ['scrape', 'retira'], ['peppers', 'pimientos'], ['large bowl', 'tazon grande'], ['Remove', 'Retira'], ['cores', 'centros'], ['seeds', 'semillas'], ['Heat', 'Calienta'], ['tablespoon', 'cucharada'], ['olive oil', 'aceite de oliva'], ['skillet', 'sarten'], ['medium heat', 'fuego medio'], ['Add', 'Agrega'], ['Pour', 'Vierte'], ['Shake', 'Agita'], ['Stir', 'Mezcla'], ['Strain', 'Cuela'], ['Garnish', 'Decora'], ['Serve', 'Sirve'], ['jalapenos', 'jalapenos'], ['jalapeno', 'jalapeno'], ['garlic', 'ajo'], ['cook', 'cocina'], ['tender', 'suave'], ['stirring frequently', 'moviendo con frecuencia'], ['transfer', 'pasa'], ['Using', 'Usando'], ['sharp steak knives', 'cuchillos afilados'], ['cut up', 'corta'], ['coarse', 'grueso'], ['mix', 'mezcla'], ['season', 'sazona'], ['salt', 'sal'], ['pepper', 'pimienta'], ['hot', 'caliente'], ['cold', 'frio'], ['ice', 'hielo'], ['glass', 'vaso'], ['minutes', 'minutos'], ['minute', 'minuto'], ['about', 'aproximadamente'], ['until', 'hasta que'], ['with', 'con'], ['and', 'y'], ['in a', 'en un'], ['on a', 'sobre una'], ['under the', 'debajo del'], ['from heat', 'del fuego']
];

const ES_INGREDIENTS = {
  'Red Pepper': 'Pimiento rojo', 'Bell Pepper': 'Pimiento', 'Olive Oil': 'Aceite de oliva', Garlic: 'Ajo', Jalapeno: 'Jalapeno', Tomato: 'Tomate', Onion: 'Cebolla', Chicken: 'Pollo', Beef: 'Res', Pork: 'Cerdo', Egg: 'Huevo', Eggs: 'Huevos', Lime: 'Limon', Lemon: 'Limon', Avocado: 'Aguacate', Salt: 'Sal', Pepper: 'Pimienta', Rice: 'Arroz', Cheese: 'Queso', Milk: 'Leche', Butter: 'Mantequilla', Flour: 'Harina', Sugar: 'Azucar', Oil: 'Aceite', Corn: 'Maiz', Beans: 'Frijoles', Potato: 'Papa', Carrot: 'Zanahoria', Rum: 'Ron', Vodka: 'Vodka', Gin: 'Ginebra', Tequila: 'Tequila', Whiskey: 'Whisky', Coffee: 'Cafe', Beer: 'Cerveza', Wine: 'Vino', Mint: 'Menta', Orange: 'Naranja', Pineapple: 'Piña', Strawberry: 'Fresa'
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

async function fetchWithTimeout(url, options = {}, timeoutMs = 6500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

export function translateIngredient(value, language = 'es') {
  if (language !== 'es') return value;
  const exact = ES_INGREDIENTS[value];
  if (exact) return exact;
  const normalized = normalize(value);
  const entry = Object.entries(ES_INGREDIENTS).find(([key]) => normalize(key) === normalized);
  return entry ? entry[1] : value;
}

export function translateRecipeText(value, language = 'es') {
  if (language !== 'es') return value || '';
  let text = String(value || '');
  ES_WORDS.forEach(([from, to]) => {
    text = text.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi'), to);
  });
  return text
    .replace(/\bSTEP\b/gi, 'PASO')
    .replace(/\boptional\b/gi, 'opcional')
    .replace(/\bchopped\b/gi, 'picado')
    .replace(/\bsliced\b/gi, 'rebanado')
    .replace(/\bcover\b/gi, 'tapa')
    .replace(/\bdrain\b/gi, 'escurre')
    .replace(/\bwater\b/gi, 'agua')
    .replace(/\boil\b/gi, 'aceite')
    .replace(/\bpan\b/gi, 'sarten')
    .replace(/\bpot\b/gi, 'olla');
}

async function mealDbGet(path, params = {}) {
  const qs = new URLSearchParams(params);
  const response = await fetchWithTimeout(`${MEALDB}/${path}?${qs.toString()}`, {}, 6500);
  if (!response.ok) throw new Error(`TheMealDB ${response.status}`);
  return response.json();
}

async function cocktailDbGet(path, params = {}) {
  const qs = new URLSearchParams(params);
  const response = await fetchWithTimeout(`${COCKTAILDB}/${path}?${qs.toString()}`, {}, 6500);
  if (!response.ok) throw new Error(`TheCocktailDB ${response.status}`);
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

function extractDrinkIngredients(drink) {
  const result = [];
  for (let index = 1; index <= 15; index += 1) {
    const value = (drink[`strIngredient${index}`] || '').trim();
    if (value) result.push(value);
  }
  return result;
}

async function lookupMeal(id) {
  const data = await mealDbGet('lookup.php', { i: id });
  return data.meals?.[0] || null;
}

async function lookupDrink(id) {
  const data = await cocktailDbGet('lookup.php', { i: id });
  return data.drinks?.[0] || null;
}


const EASY_TREND_QUERIES = [
  'quesadilla',
  'ramen',
  'noodles',
  'instant noodles',
  'fried rice',
  'tacos',
  'omelette',
  'mac and cheese',
  'chicken wrap',
  'pancakes',
  'burrito',
  'soup',
  'sandwich',
  'nachos'
];

async function mealDbSearchByName(query) {
  const data = await mealDbGet('search.php', { s: query });
  return data.meals || [];
}

function mealToRecipe(meal, ingredients, source = 'TheMealDB') {
  const wanted = new Set(ingredients.map((item) => normalize(translate(item))));
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
    fuente: source,
    area: meal.strArea,
    categoria: meal.strCategory,
    instrucciones: meal.strInstructions,
    url: meal.strSource || meal.strYoutube
  };
}

async function fetchEasyTrendRecipes({ ingredients }) {
  const candidateMap = new Map();
  const personalizedQueries = ingredients
    .map((item) => translate(item).replace(/_/g, ' '))
    .filter(Boolean)
    .slice(0, 4)
    .flatMap((item) => [`${item} tacos`, `${item} noodles`, `${item} rice`]);

  for (const query of [...personalizedQueries, ...EASY_TREND_QUERIES]) {
    try {
      const meals = await mealDbSearchByName(query);
      meals.slice(0, 4).forEach((meal) => candidateMap.set(meal.idMeal, meal));
    } catch {
      // Continue with the next trend query.
    }
    if (candidateMap.size >= 12) break;
  }

  const recetas = Array.from(candidateMap.values())
    .slice(0, 10)
    .map((meal) => ({
      ...mealToRecipe(meal, ingredients, 'Tendencias faciles (TheMealDB)'),
      tendencia: true,
    }));

  return { recetas, total: recetas.length, fuente: 'Tendencias faciles' };
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

  const details = await Promise.all(Array.from(candidateMap.values()).slice(0, 14).map((meal) => lookupMeal(meal.idMeal)));

  const recetas = details.filter(Boolean).map((meal) => mealToRecipe(meal, ingredients, 'TheMealDB'));

  return { recetas, total: recetas.length, fuente: 'TheMealDB web' };
}

async function fetchCocktailDbDrinks({ ingredients }) {
  const candidateMap = new Map();
  const drinkIngredients = ingredients
    .map((item) => translate(item).replace(/\s+/g, '_'))
    .filter(Boolean)
    .slice(0, 7);

  for (const ingredient of drinkIngredients) {
    try {
      const data = await cocktailDbGet('filter.php', { i: ingredient });
      (data.drinks || []).slice(0, 8).forEach((drink) => candidateMap.set(drink.idDrink, drink));
    } catch {
      // Try the next ingredient.
    }
  }

  if (!candidateMap.size) {
    for (const alcoholic of ['Non_Alcoholic', 'Alcoholic']) {
      try {
        const data = await cocktailDbGet('filter.php', { a: alcoholic });
        (data.drinks || []).slice(0, alcoholic === 'Non_Alcoholic' ? 8 : 5).forEach((drink) => candidateMap.set(drink.idDrink, drink));
      } catch {
        // Keep optional source from blocking recipes.
      }
    }
  }

  const wanted = new Set(ingredients.map((item) => normalize(translate(item))));
  const details = await Promise.all(Array.from(candidateMap.values()).slice(0, 10).map((drink) => lookupDrink(drink.idDrink)));

  const recetas = details.filter(Boolean).map((drink) => {
    const drinkIngredientsFull = extractDrinkIngredients(drink);
    const normalized = drinkIngredientsFull.map(normalize);
    const used = drinkIngredientsFull.filter((item, index) => wanted.has(normalized[index])).slice(0, 5);
    const faltantes = drinkIngredientsFull.filter((item, index) => !wanted.has(normalized[index])).slice(0, 4);
    return {
      id: `cocktaildb-${drink.idDrink}`,
      titulo: drink.strDrink,
      imagen: drink.strDrinkThumb,
      calificacion: 70 + Math.min(24, used.length * 6),
      likes: Number(String(drink.idDrink).slice(-3)) || 0,
      ingredientes_usados: used.length ? used : drinkIngredientsFull.slice(0, 4),
      ingredientes_faltantes: faltantes,
      fuente: 'TheCocktailDB',
      area: drink.strAlcoholic,
      categoria: drink.strCategory || 'Bebida',
      tipo: 'bebida',
      instrucciones: drink.strInstructions,
      url: `https://www.thecocktaildb.com/drink/${drink.idDrink}`
    };
  });

  return { recetas, total: recetas.length, fuente: 'TheCocktailDB web' };
}

function uniqueRecipes(recipes) {
  const seen = new Set();
  return recipes.filter((recipe) => {
    const key = normalize(`${recipe.fuente}-${recipe.titulo}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchRecipes({ ingredients, tools = [], cuisine, strict = false }) {
  const params = new URLSearchParams({ ingredientes: ingredients.join(','), utensilios: tools.join(','), modo_estricto: String(strict) });
  if (cuisine) params.set('pais_cocina', cuisine);
  const collected = [];

  try {
    const response = await fetchWithTimeout(`${API_URL}/recetas-disponibles?${params.toString()}`, {}, 4500);
    if (!response.ok) throw new Error(`API ${response.status}`);
    const data = await response.json();
    if (data.recetas?.length) collected.push(...data.recetas);
  } catch {
    // Local backend may be unavailable from hosted pages.
  }

  try {
    const data = await fetchMealDbRecipes({ ingredients, cuisine });
    if (data.recetas?.length) collected.push(...data.recetas);
  } catch {
    // Keep other APIs alive.
  }

  try {
    const data = await fetchEasyTrendRecipes({ ingredients });
    if (data.recetas?.length) collected.push(...data.recetas);
  } catch {
    // Trend searches are optional.
  }

  try {
    const data = await fetchCocktailDbDrinks({ ingredients });
    if (data.recetas?.length) collected.push(...data.recetas);
  } catch {
    // Drinks are optional.
  }

  const recetas = uniqueRecipes(collected).slice(0, 24);
  return {
    recetas,
    total: recetas.length,
    fuentes: Array.from(new Set(recetas.map((recipe) => recipe.fuente).filter(Boolean))),
    error: recetas.length ? null : 'No se encontraron recetas reales disponibles. Revisa la conexion del backend, TheMealDB o TheCocktailDB.'
  };
}

export async function fetchNearbyStores({ ingredient, latitude, longitude }) {
  const params = new URLSearchParams({ ingrediente: ingredient, latitud: String(latitude), longitud: String(longitude) });
  const response = await fetchWithTimeout(`${API_URL}/donde-comprar?${params.toString()}`, {}, 6500);
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

export function mapsSearchUrl({ ingredient, latitude, longitude }) {
  const query = encodeURIComponent(`comprar ${ingredient} supermercado`);
  if (latitude && longitude) return `https://www.google.com/maps/search/${query}/@${latitude},${longitude},14z`;
  return `https://www.google.com/maps/search/${query}`;
}
