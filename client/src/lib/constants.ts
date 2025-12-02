// Bread Types
export const BREAD_TYPES = [
  { id: 'artisan', name: 'Artisan Loaf' },
  { id: 'sandwich', name: 'Sandwich Bread' },
  { id: 'focaccia', name: 'Focaccia' },
  { id: 'baguette', name: 'Baguette' },
  { id: 'ciabatta', name: 'Ciabatta' },
  { id: 'sourdough', name: 'Classic Sourdough' }
];

// Starter Types
export const STARTER_TYPES = [
  { id: 'classic', name: 'Classic' },
  { id: 'rye', name: 'Rye' },
  { id: 'whole-wheat', name: 'Whole Wheat' },
  { id: 'grape', name: 'Grape' },
  { id: 'koji', name: 'Koji' },
  { id: 'traditional-rye', name: 'Traditional Rye' },
  { id: 'hybrid', name: 'Hybrid' },
];

// Baker Frequencies
export const BAKER_FREQUENCIES = [
  { id: 'daily', name: 'Daily (Enthusiast baker)', description: 'Feeds daily, no refrigeration' },
  { id: 'regular', name: '2-3 times per week (Regular baker)', description: 'Feeds often, with occasional refrigeration' },
  { id: 'weekly', name: 'Weekly (Weekend baker)', description: 'Feeds weekly, can be refrigerated' },
  { id: 'occasional', name: 'Few times a month (Occasional baker)', description: 'Feeds monthly, refrigerate between bakes' },
  { id: 'infrequent', name: 'Monthly or less (Infrequent baker)', description: 'Feeds rarely, keeps in the fridge' },
];

// Flavor Notes
export const FLAVOR_NOTES = [
  { id: 'nutty', name: 'Nutty' },
  { id: 'fruity', name: 'Fruity' },
  { id: 'spicy', name: 'Spicy' },
  { id: 'earthy', name: 'Earthy' },
  { id: 'malty', name: 'Malty' },
  { id: 'buttery', name: 'Buttery' },
  { id: 'tangy', name: 'Tangy' },
  { id: 'creamy', name: 'Creamy' }
];

// Texture Characteristics
export const TEXTURE_CHARACTERISTICS = [
  { id: 'crumbOpenness', name: 'Crumb Openness', min: 'Closed', max: 'Open' },
  { id: 'holeSize', name: 'Hole Size', min: 'Small', max: 'Large' },
  { id: 'tenderness', name: 'Tenderness', min: 'Firm', max: 'Soft' },
  { id: 'moisture', name: 'Moisture Level', min: 'Low', max: 'High' },
  { id: 'crustThickness', name: 'Crust Thickness', min: 'Thin', max: 'Thick' },
  { id: 'crustTexture', name: 'Crust Texture', min: 'Crisp', max: 'Chewy' },
  { id: 'color', name: 'Color', min: 'Light', max: 'Dark' },
  { id: 'surfaceCharacter', name: 'Surface Character', min: 'Smooth', max: 'Rustic' }
];
