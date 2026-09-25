export const COUNTRY_POINTS = [
  { id: 'any', label: 'Cualquier lugar', cuisine: '', lat: 0, lon: -30, color: '#f8e16c' },
  { id: 'mexico', label: 'México', cuisine: 'mexican', lat: 23.6, lon: -102.5, color: '#e85545' },
  { id: 'peru', label: 'Perú', cuisine: 'latin american', lat: -9.2, lon: -75.0, color: '#ff7675' },
  { id: 'brazil', label: 'Brasil', cuisine: 'latin american', lat: -10.3, lon: -53.2, color: '#55efc4' },
  { id: 'argentina', label: 'Argentina', cuisine: 'latin american', lat: -38.4, lon: -63.6, color: '#74b9ff' },
  { id: 'colombia', label: 'Colombia', cuisine: 'latin american', lat: 4.6, lon: -74.1, color: '#ffeaa7' },
  { id: 'caribbean', label: 'Caribe', cuisine: 'caribbean', lat: 18.2, lon: -66.5, color: '#00cec9' },
  { id: 'usa', label: 'Estados Unidos', cuisine: 'american', lat: 39.8, lon: -98.6, color: '#a29bfe' },
  { id: 'southern', label: 'Sur de EUA', cuisine: 'southern', lat: 33.0, lon: -90.0, color: '#fab1a0' },
  { id: 'cajun', label: 'Cajún', cuisine: 'cajun', lat: 30.2, lon: -91.9, color: '#e17055' },
  { id: 'italy', label: 'Italia', cuisine: 'italian', lat: 41.9, lon: 12.5, color: '#69d28f' },
  { id: 'france', label: 'Francia', cuisine: 'french', lat: 46.2, lon: 2.2, color: '#70a1ff' },
  { id: 'spain', label: 'España', cuisine: 'spanish', lat: 40.4, lon: -3.7, color: '#fdcb6e' },
  { id: 'greece', label: 'Grecia', cuisine: 'greek', lat: 39.1, lon: 21.8, color: '#81ecec' },
  { id: 'mediterranean', label: 'Mediterránea', cuisine: 'mediterranean', lat: 35.0, lon: 18.0, color: '#2ed3c6' },
  { id: 'germany', label: 'Alemania', cuisine: 'german', lat: 51.2, lon: 10.4, color: '#dfe6e9' },
  { id: 'britain', label: 'Británica', cuisine: 'british', lat: 54.0, lon: -2.0, color: '#0984e3' },
  { id: 'ireland', label: 'Irlanda', cuisine: 'irish', lat: 53.1, lon: -8.2, color: '#00b894' },
  { id: 'nordic', label: 'Nórdica', cuisine: 'nordic', lat: 60.0, lon: 15.0, color: '#b2bec3' },
  { id: 'eastern-europe', label: 'Europa del Este', cuisine: 'eastern european', lat: 49.0, lon: 25.0, color: '#6c5ce7' },
  { id: 'middle-east', label: 'Medio Oriente', cuisine: 'middle eastern', lat: 29.4, lon: 45.0, color: '#e1b12c' },
  { id: 'turkey', label: 'Turquía', cuisine: 'middle eastern', lat: 39.0, lon: 35.2, color: '#ff6b6b' },
  { id: 'morocco', label: 'Marruecos', cuisine: 'african', lat: 31.8, lon: -7.1, color: '#f0932b' },
  { id: 'ethiopia', label: 'Etiopía', cuisine: 'african', lat: 9.1, lon: 40.5, color: '#badc58' },
  { id: 'west-africa', label: 'África Occidental', cuisine: 'african', lat: 9.1, lon: 7.4, color: '#f6e58d' },
  { id: 'india', label: 'India', cuisine: 'indian', lat: 20.6, lon: 78.9, color: '#ff9f43' },
  { id: 'pakistan', label: 'Pakistán', cuisine: 'indian', lat: 30.4, lon: 69.3, color: '#7bed9f' },
  { id: 'china', label: 'China', cuisine: 'chinese', lat: 35.8, lon: 104.1, color: '#f4b74a' },
  { id: 'japan', label: 'Japón', cuisine: 'japanese', lat: 36.2, lon: 138.2, color: '#f78fb3' },
  { id: 'korea', label: 'Corea', cuisine: 'korean', lat: 36.4, lon: 127.8, color: '#ff7675' },
  { id: 'thai', label: 'Tailandia', cuisine: 'thai', lat: 15.8, lon: 100.9, color: '#7bed9f' },
  { id: 'vietnam', label: 'Vietnam', cuisine: 'vietnamese', lat: 14.1, lon: 108.3, color: '#00cec9' },
  { id: 'indonesia', label: 'Indonesia', cuisine: 'asian', lat: -2.5, lon: 118.0, color: '#fd79a8' },
  { id: 'philippines', label: 'Filipinas', cuisine: 'asian', lat: 12.9, lon: 121.8, color: '#74b9ff' },
  { id: 'australia', label: 'Australia', cuisine: 'american', lat: -25.2, lon: 133.8, color: '#55efc4' },
  { id: 'jewish', label: 'Judía', cuisine: 'jewish', lat: 31.8, lon: 35.2, color: '#a29bfe' }
];

export const MEALS = [
  { id: 'desayuno', label: 'Desayuno', short: 'Des', hour: 7, sky: '#7bb9ff', glow: '#ffd36a', darkness: 0.12, ingredients: ['huevo', 'leche', 'papa'] },
  { id: 'colacion-am', label: 'Colación AM', short: 'Col AM', hour: 10, sky: '#9ad8ff', glow: '#ffe28a', darkness: 0.08, ingredients: ['tomate', 'limón', 'yogur'] },
  { id: 'almuerzo', label: 'Almuerzo', short: 'Alm', hour: 12, sky: '#74c7ff', glow: '#fff0a6', darkness: 0.05, ingredients: ['pollo', 'arroz', 'cebolla'] },
  { id: 'comida', label: 'Comida', short: 'Com', hour: 15, sky: '#5ba8f0', glow: '#ffc85c', darkness: 0.1, ingredients: ['pollo', 'tomate', 'cebolla', 'chile'] },
  { id: 'colacion-pm', label: 'Colación PM', short: 'Col PM', hour: 17, sky: '#f7a765', glow: '#ffba75', darkness: 0.2, ingredients: ['zanahoria', 'limón', 'nuez'] },
  { id: 'cena', label: 'Cena', short: 'Cena', hour: 21, sky: '#131e3a', glow: '#8bb8ff', darkness: 0.58, ingredients: ['papa', 'carne', 'cebolla'] },
  { id: 'brunch', label: 'Brunch', short: 'Bru', hour: 11, sky: '#b7eef4', glow: '#ffe7a8', darkness: 0.07, ingredients: ['huevo', 'tomate', 'queso fresco'] }
];

export function mealByCurrentHour(date = new Date()) {
  const hour = date.getHours();
  if (hour < 9) return 0;
  if (hour < 11) return 1;
  if (hour < 13) return 6;
  if (hour < 16) return 3;
  if (hour < 19) return 4;
  return 5;
}
