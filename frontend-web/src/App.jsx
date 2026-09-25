import { useEffect, useMemo, useState } from 'react';
import {
  Beef,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Compass,
  Globe2,
  GripVertical,
  Layers3,
  MapPin,
  Moon,
  Rotate3D,
  Search,
  SunMedium,
  Utensils,
  X
} from 'lucide-react';

import { fetchRecipes } from './api';
import Globe from './components/Globe';
import { CATALOG_NOTE, INGREDIENT_CATEGORIES } from './data/ingredients';
import { DEFAULT_TOOLS, TOOL_CATEGORIES } from './data/tools';
import { COUNTRY_POINTS, MEALS, mealByCurrentHour } from './data/options';
import './styles.css';

const normalize = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function useDragVars() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const startDrag = (event) => {
    if (event.target.closest('button, input')) return;
    event.preventDefault();
    const pointer = event.touches?.[0] ?? event;
    const start = { clientX: pointer.clientX, clientY: pointer.clientY, offsetX: offset.x, offsetY: offset.y };

    const move = (moveEvent) => {
      const nextPointer = moveEvent.touches?.[0] ?? moveEvent;
      setOffset({
        x: start.offsetX + nextPointer.clientX - start.clientX,
        y: start.offsetY + nextPointer.clientY - start.clientY,
      });
    };
    const stop = () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', stop);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('touchend', stop);
  };

  return { style: { '--dx': `${offset.x}px`, '--dy': `${offset.y}px` }, startDrag };
}

export default function App() {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRY_POINTS[0]);
  const [mealIndex, setMealIndex] = useState(mealByCurrentHour());
  const [selectedIngredients, setSelectedIngredients] = useState(['tomate', 'cebolla', 'pollo']);
  const [selectedTools, setSelectedTools] = useState(DEFAULT_TOOLS);
  const [activeCategory, setActiveCategory] = useState(INGREDIENT_CATEGORIES[0].id);
  const [activeToolCategory, setActiveToolCategory] = useState(TOOL_CATEGORIES[0].id);
  const [ingredientSearch, setIngredientSearch] = useState('');
  const [ingredientPanelOpen, setIngredientPanelOpen] = useState(true);
  const [countryPanelOpen, setCountryPanelOpen] = useState(true);
  const [recipesOpen, setRecipesOpen] = useState(true);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ingredientDrag = useDragVars();
  const countryDrag = useDragVars();
  const recipeDrag = useDragVars();
  const meal = MEALS[mealIndex];

  useEffect(() => {
    setSelectedIngredients((current) => Array.from(new Set([...current, ...meal.ingredients])));
  }, [mealIndex]);

  const ingredients = useMemo(() => selectedIngredients.length ? selectedIngredients : ['tomate', 'cebolla', ...meal.ingredients], [selectedIngredients, meal]);
  const activeCategoryData = INGREDIENT_CATEGORIES.find((category) => category.id === activeCategory) || INGREDIENT_CATEGORIES[0];
  const activeToolData = TOOL_CATEGORIES.find((category) => category.id === activeToolCategory) || TOOL_CATEGORIES[0];
  const visibleIngredients = useMemo(() => {
    const query = normalize(ingredientSearch.trim());
    if (!query) return activeCategoryData.items;
    return INGREDIENT_CATEGORIES.flatMap((category) => category.items).filter((item) => normalize(item).includes(query));
  }, [activeCategoryData, ingredientSearch]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchRecipes({ ingredients, tools: selectedTools, cuisine: selectedCountry.cuisine, strict: false })
      .then((data) => {
        if (!cancelled) setRecipes(data.recetas || []);
      })
      .catch((err) => {
        if (!cancelled) setError(`No se pudieron cargar recetas: ${err.message}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [ingredients, selectedTools, selectedCountry]);

  const toggleIngredient = (ingredient) => setSelectedIngredients((current) => current.includes(ingredient) ? current.filter((item) => item !== ingredient) : [...current, ingredient]);
  const removeIngredient = (ingredient) => setSelectedIngredients((current) => current.filter((item) => item !== ingredient));
  const toggleTool = (tool) => setSelectedTools((current) => current.includes(tool) ? current.filter((item) => item !== tool) : [...current, tool]);
  const sceneStyle = { '--sky': meal.sky, '--glow': meal.glow, '--darkness': meal.darkness };

  return (
    <main className="app" style={sceneStyle}>
      <section className="heroPanel">
        <div className="brandRow"><div className="brandMark"><Globe2 size={22} /></div><div><p className="eyebrow">Refri Inteligente Web</p><h1>Recetas por mundo, país y hora</h1></div></div>
        <div className="statusGrid"><div><span>Zona elegida</span><strong>{selectedCountry.label}</strong></div><div><span>Momento</span><strong>{meal.label}</strong></div><div><span>Ingredientes activos</span><strong>{ingredients.slice(0, 5).join(', ')}{ingredients.length > 5 ? ` +${ingredients.length - 5}` : ''}</strong></div></div>
      </section>

      <section className="globeShell" aria-label="Globo interactivo"><Globe countries={COUNTRY_POINTS} selectedCountry={selectedCountry} meal={meal} onSelectCountry={setSelectedCountry} /><div className="mapHint"><Rotate3D size={18} /> Arrastra para rotar. Toca un punto para elegir país.</div></section>

      <aside className="mealSlider" aria-label="Selector de comida"><div className="mealIcon">{meal.darkness > 0.4 ? <Moon size={20} /> : <SunMedium size={20} />}</div><input aria-label="Cambiar comida del día" type="range" min="0" max={MEALS.length - 1} step="1" value={mealIndex} onChange={(event) => setMealIndex(Number(event.target.value))} /><div className="mealReadout"><strong>{meal.label}</strong><span>{String(meal.hour).padStart(2, '0')}:00</span></div><div className="mealTicks">{MEALS.map((item, index) => <button key={item.id} className={index === mealIndex ? 'active' : ''} onClick={() => setMealIndex(index)} title={item.label}>{item.short}</button>)}</div></aside>

      {!countryPanelOpen && <button className="drawerToggle countries" onClick={() => setCountryPanelOpen(true)} aria-label="Abrir países"><ChevronUp size={22} /></button>}
      <aside className={countryPanelOpen ? 'countryDock open' : 'countryDock'} aria-label="Selector de país" style={countryDrag.style}>
        <div className="dockHeader dragHandle" onMouseDown={countryDrag.startDrag} onTouchStart={countryDrag.startDrag}><GripVertical size={15} /><Compass size={16} /> País / cocina <button className="panelAction" onClick={() => setCountryPanelOpen(false)} aria-label="Ocultar países"><ChevronDown size={18} /></button></div>
        <div className="countryGrid">{COUNTRY_POINTS.map((country) => <button key={country.id} className={selectedCountry.id === country.id ? 'countryChip active' : 'countryChip'} onClick={() => setSelectedCountry(country)}>{country.id === 'any' ? <Compass size={14} /> : <span className="dot" style={{ background: country.color }} />}{country.label}</button>)}</div>
      </aside>

      {!ingredientPanelOpen && <button className="drawerToggle ingredients" onClick={() => setIngredientPanelOpen(true)} aria-label="Abrir ingredientes"><ChevronRight size={22} /></button>}
      <aside className={ingredientPanelOpen ? 'ingredientDrawer open' : 'ingredientDrawer'} style={ingredientDrag.style}>
        <div className="drawerTitle dragHandle" onMouseDown={ingredientDrag.startDrag} onTouchStart={ingredientDrag.startDrag}><div><p className="eyebrow">Catálogo mundial curado</p><h2>Ingredientes</h2></div><div className="titleTools"><GripVertical size={22} /><button className="panelAction" onClick={() => setIngredientPanelOpen(false)} aria-label="Ocultar ingredientes"><ChevronLeft size={18} /></button></div></div>
        <p className="sourceNote">{CATALOG_NOTE}</p><label className="searchBox"><Search size={16} /><input value={ingredientSearch} onChange={(event) => setIngredientSearch(event.target.value)} placeholder="Buscar ingrediente o bebida" /></label>
        <div className="categoryTabs">{INGREDIENT_CATEGORIES.map((category) => <button key={category.id} className={activeCategory === category.id ? 'active' : ''} onClick={() => setActiveCategory(category.id)}>{category.label}</button>)}</div>
        <div className="ingredientCloud">{visibleIngredients.map((ingredient) => <button key={ingredient} className={selectedIngredients.includes(ingredient) ? 'ingredientChip active' : 'ingredientChip'} onClick={() => toggleIngredient(ingredient)}>{ingredient}</button>)}</div>
        <div className="toolBlock"><div className="trayHead"><Utensils size={15} /> Utensilios y herramientas ({selectedTools.length})</div><div className="categoryTabs compact">{TOOL_CATEGORIES.map((category) => <button key={category.id} className={activeToolCategory === category.id ? 'active' : ''} onClick={() => setActiveToolCategory(category.id)}>{category.label}</button>)}</div><div className="toolGrid">{activeToolData.items.map((tool) => <button key={tool} className={selectedTools.includes(tool) ? 'toolChip active' : 'toolChip'} onClick={() => toggleTool(tool)}>{tool}</button>)}</div></div>
        <div className="selectedTray"><div className="trayHead"><Layers3 size={15} /> Seleccionados ({selectedIngredients.length})</div><div className="selectedList">{selectedIngredients.map((ingredient) => <button key={ingredient} onClick={() => removeIngredient(ingredient)}>{ingredient} <X size={12} /></button>)}</div></div>
      </aside>

      {!recipesOpen && <button className="drawerToggle recipes" onClick={() => setRecipesOpen(true)} aria-label="Abrir recetas"><ChevronLeft size={22} /></button>}
      <section className={recipesOpen ? 'recipePanel open' : 'recipePanel'} style={recipeDrag.style}>
        <div className="panelTitle dragHandle" onMouseDown={recipeDrag.startDrag} onTouchStart={recipeDrag.startDrag}><div><p className="eyebrow">{selectedCountry.cuisine || 'sin filtro de país'}</p><h2>{meal.label} para {selectedCountry.label.toLowerCase()}</h2></div><div className="titleTools"><GripVertical size={22} /><button className="panelAction" onClick={() => setRecipesOpen(false)} aria-label="Ocultar recetas"><ChevronRight size={18} /></button></div></div>
        {loading && <p className="muted">Buscando recetas...</p>}{error && <p className="error">{error}</p>}
        <div className="cards">{recipes.map((recipe) => <article className="recipeCard" key={recipe.id}>{recipe.imagen && <img src={recipe.imagen} alt={recipe.titulo} />}<div className="recipeBody"><h3>{recipe.titulo}</h3><p><Utensils size={14} /> Usa: {(recipe.ingredientes_usados || []).join(', ') || ingredients.join(', ')}</p>{(recipe.ingredientes_faltantes || []).length > 0 && <p className="missing">Te falta: {recipe.ingredientes_faltantes.join(', ')}</p>}{recipe.utensilio_faltante && <p className="missing">{recipe.utensilio_faltante}</p>}<div className="score"><MapPin size={14} /> {Math.round(recipe.calificacion || 0)} pts · {recipe.likes || 0} likes</div></div></article>)}</div>
      </section>
    </main>
  );
}
