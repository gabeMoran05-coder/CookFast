export const INGREDIENT_CATEGORIES = [
  {
    id: 'carnes-rojas', label: 'Carnes rojas', items: [
      'res', 'ternera', 'cerdo', 'cordero', 'cabrito', 'venado', 'conejo', 'jabalí', 'tocino', 'jamón', 'chorizo', 'salchicha', 'chuleta', 'costilla', 'falda de res', 'molida de res'
    ]
  },
  {
    id: 'aves', label: 'Aves', items: [
      'pollo', 'pavo', 'pato', 'ganso', 'codorniz', 'gallina', 'pechuga de pollo', 'muslo de pollo', 'alitas', 'hígado de pollo', 'huevo'
    ]
  },
  {
    id: 'pescados-mariscos', label: 'Pescados y mariscos', items: [
      'salmón', 'atún', 'bacalao', 'sardina', 'tilapia', 'trucha', 'robalo', 'mero', 'huachinango', 'camarón', 'pulpo', 'calamar', 'mejillón', 'almeja', 'ostión', 'langosta', 'cangrejo', 'anchoa'
    ]
  },
  {
    id: 'lacteos', label: 'Lácteos', items: [
      'leche', 'yogur', 'crema', 'mantequilla', 'queso fresco', 'queso panela', 'queso manchego', 'queso mozzarella', 'queso parmesano', 'queso feta', 'queso cheddar', 'requesón', 'kéfir'
    ]
  },
  {
    id: 'cereales-tuberculos', label: 'Cereales y tubérculos', items: [
      'arroz', 'maíz', 'trigo', 'avena', 'cebada', 'centeno', 'quinoa', 'amaranto', 'mijo', 'sorgo', 'pasta', 'pan', 'tortilla', 'papa', 'camote', 'yuca', 'ñame', 'plátano macho', 'tapioca'
    ]
  },
  {
    id: 'legumbres', label: 'Legumbres', items: [
      'frijol negro', 'frijol pinto', 'frijol bayo', 'garbanzo', 'lenteja', 'haba', 'chícharo', 'soya', 'edamame', 'alubia', 'cacahuate', 'tofu', 'tempeh'
    ]
  },
  {
    id: 'verduras', label: 'Verduras', items: [
      'tomate', 'jitomate', 'cebolla', 'ajo', 'chile', 'pimiento', 'zanahoria', 'calabacita', 'berenjena', 'pepino', 'apio', 'brócoli', 'coliflor', 'repollo', 'espinaca', 'acelga', 'lechuga', 'rúcula', 'col rizada', 'espárrago', 'alcachofa', 'elote', 'ejote', 'nopal', 'chayote', 'rábano', 'betabel', 'poro', 'hinojo'
    ]
  },
  {
    id: 'frutas', label: 'Frutas', items: [
      'limón', 'lima', 'naranja', 'toronja', 'mandarina', 'manzana', 'pera', 'plátano', 'mango', 'piña', 'papaya', 'guayaba', 'fresa', 'frambuesa', 'mora azul', 'uva', 'sandía', 'melón', 'kiwi', 'durazno', 'ciruela', 'cereza', 'granada', 'coco', 'aguacate', 'dátil', 'higo'
    ]
  },
  {
    id: 'semillas-nueces', label: 'Semillas y nueces', items: [
      'almendra', 'nuez', 'nuez pecana', 'pistache', 'avellana', 'nuez de la india', 'piñón', 'semilla de calabaza', 'semilla de girasol', 'chía', 'linaza', 'ajonjolí', 'amapola', 'nuez de macadamia'
    ]
  },
  {
    id: 'hierbas-especias', label: 'Hierbas y especias', items: [
      'cilantro', 'perejil', 'albahaca', 'menta', 'hierbabuena', 'romero', 'tomillo', 'orégano', 'laurel', 'salvia', 'eneldo', 'epazote', 'comino', 'canela', 'clavo', 'pimienta', 'pimentón', 'cúrcuma', 'jengibre', 'cardamomo', 'anís', 'azafrán', 'nuez moscada', 'curry', 'vainilla'
    ]
  },
  {
    id: 'hongos-algas', label: 'Hongos y algas', items: [
      'champiñón', 'portobello', 'shiitake', 'seta', 'huitlacoche', 'trufa', 'enoki', 'nori', 'wakame', 'kombu', 'espirulina'
    ]
  },
  {
    id: 'bebidas', label: 'Bebidas', items: [
      'agua natural', 'agua mineral', 'agua de jamaica', 'agua de horchata', 'agua de tamarindo', 'agua de limón', 'agua de pepino', 'agua de coco', 'jugo de naranja', 'jugo de manzana', 'jugo de piña', 'licuado de plátano', 'smoothie', 'café', 'espresso', 'té negro', 'té verde', 'té chai', 'té de manzanilla', 'matcha', 'leche de almendra', 'leche de soya', 'kombucha', 'kéfir de agua', 'cerveza', 'vino tinto', 'vino blanco', 'vino rosado', 'sidra', 'tequila', 'mezcal', 'ron', 'whisky', 'vodka', 'ginebra', 'brandy', 'licor de café'
    ]
  },  {
    id: 'grasas-salsas', label: 'Aceites, salsas y bases', items: [
      'aceite de oliva', 'aceite vegetal', 'aceite de coco', 'aceite de ajonjolí', 'mayonesa', 'mostaza', 'salsa de soya', 'vinagre', 'vinagre balsámico', 'miel', 'azúcar', 'piloncillo', 'chocolate', 'cacao', 'caldo de pollo', 'caldo de verduras', 'miso', 'tahini', 'harina'
    ]
  }
];

export const ALL_INGREDIENTS = Array.from(
  new Set(INGREDIENT_CATEGORIES.flatMap((category) => category.items))
).sort((a, b) => a.localeCompare(b, 'es'));

export const CATALOG_NOTE = 'FAO reporta miles de especies comestibles: más de 7,000 plantas usadas como alimento y hasta 30,000 plantas consideradas comestibles. Esta app usa un catálogo curado para hacerlo navegable.';

