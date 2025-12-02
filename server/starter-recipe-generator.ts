import { db } from "./db";
import { breadRecipes, sourdoughStarters, starterRecipes } from "../shared/schema";
import { eq } from "drizzle-orm";

interface RecipeTemplate {
  name: string;
  description: string;
  ingredients: any[];
  instructions: string[];
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  totalTime: string;
  activeTime: string;
  yields: string;
  hydration: number;
  tags: string[];
  notes: string[];
  recipeType: 'classic' | 'specialty';
}

// Recipe templates for each starter type
const recipeTemplates: { [key: string]: RecipeTemplate[] } = {
  'san-francisco-style-starter': [
    {
      name: 'Classic San Francisco Sourdough Boule',
      description: 'The iconic San Francisco sourdough with signature tangy flavor and crispy crust. This traditional recipe showcases the classic wild yeast characteristics.',
      ingredients: [
        { name: 'San Francisco sourdough starter', amount: '200g', note: 'Active and bubbly' },
        { name: 'Bread flour', amount: '500g', note: 'High protein recommended' },
        { name: 'Water', amount: '350ml', note: 'Room temperature' },
        { name: 'Sea salt', amount: '10g', note: 'Fine grain' }
      ],
      instructions: [
        'In a large bowl, mix active starter with water until well combined.',
        'Add flour and mix until no dry flour remains. Let rest 30 minutes for autolyse.',
        'Add salt and mix thoroughly. Perform 4 sets of stretch and folds every 30 minutes.',
        'Bulk ferment for 4-6 hours at room temperature until doubled in size.',
        'Pre-shape into a round and rest 30 minutes. Final shape into a boule.',
        'Place seam-side up in banneton. Refrigerate overnight (12-24 hours).',
        'Preheat Dutch oven to 475°F. Score dough and bake covered 20 minutes.',
        'Remove lid, reduce to 450°F, bake 20-25 minutes until golden brown.'
      ],
      difficulty: 'Intermediate',
      totalTime: '24-30 hours',
      activeTime: '2 hours',
      yields: '1 large boule (800g)',
      hydration: 70,
      tags: ['classic', 'artisan', 'traditional', 'tangy'],
      notes: [
        'Starter should be at peak activity for best results',
        'Longer fermentation develops more complex flavors',
        'Steam is crucial for crust development'
      ],
      recipeType: 'classic'
    },
    {
      name: 'San Francisco Sourdough Focaccia',
      description: 'A golden, herb-topped focaccia that highlights the starter\'s tangy notes with Mediterranean flair. Perfect for sharing and showcasing the starter\'s versatility.',
      ingredients: [
        { name: 'San Francisco sourdough starter', amount: '150g', note: 'Active starter' },
        { name: 'Bread flour', amount: '400g', note: 'For structure' },
        { name: 'Water', amount: '300ml', note: 'Lukewarm' },
        { name: 'Extra virgin olive oil', amount: '60ml', note: 'Divided' },
        { name: 'Sea salt', amount: '8g', note: 'For dough' },
        { name: 'Fresh rosemary', amount: '2 sprigs', note: 'Chopped' },
        { name: 'Flaky sea salt', amount: '1 tsp', note: 'For topping' }
      ],
      instructions: [
        'Combine starter, water, and 2 tbsp olive oil in a large bowl.',
        'Add flour and salt, mix until combined. Rest 30 minutes.',
        'Perform 3 sets of stretch and folds every 45 minutes.',
        'Bulk ferment 3-4 hours until puffy and increased by 50%.',
        'Oil a 9x13 pan generously. Transfer dough and spread gently.',
        'Cover and proof 2-3 hours until very puffy and jiggly.',
        'Dimple surface with fingertips. Drizzle with oil, add herbs and salt.',
        'Bake at 425°F for 25-30 minutes until golden brown.'
      ],
      difficulty: 'Easy',
      totalTime: '8-10 hours',
      activeTime: '1 hour',
      yields: '1 large focaccia (serves 8)',
      hydration: 75,
      tags: ['focaccia', 'olive oil', 'herbs', 'sharing'],
      notes: [
        'High hydration creates the characteristic airy texture',
        'Don\'t skip the generous oil coating',
        'Experiment with different herb combinations'
      ],
      recipeType: 'specialty'
    }
  ],
  'homemade-starter': [
    {
      name: 'Beginner\'s Everyday Sourdough',
      description: 'A forgiving, reliable recipe perfect for new sourdough bakers. Designed to work with any homemade starter and build confidence in sourdough techniques.',
      ingredients: [
        { name: 'Active homemade starter', amount: '100g', note: 'Doubled in size' },
        { name: 'Bread flour', amount: '400g', note: 'Unbleached preferred' },
        { name: 'Whole wheat flour', amount: '50g', note: 'For flavor depth' },
        { name: 'Warm water', amount: '320ml', note: '75-80°F' },
        { name: 'Salt', amount: '9g', note: 'Any fine salt' }
      ],
      instructions: [
        'Mix starter with warm water until dissolved.',
        'Add both flours and mix to combine. Rest 45 minutes.',
        'Add salt and knead gently for 5 minutes until smooth.',
        'Place in oiled bowl, cover. Ferment 5-8 hours, folding every 2 hours.',
        'Pre-shape when dough has increased by 70%. Rest 20 minutes.',
        'Final shape into a batard. Place in loaf pan or banneton.',
        'Proof 2-4 hours at room temperature or overnight in fridge.',
        'Bake at 450°F for 35-40 minutes until internal temp reaches 200°F.'
      ],
      difficulty: 'Easy',
      totalTime: '12-16 hours',
      activeTime: '90 minutes',
      yields: '1 standard loaf (750g)',
      hydration: 71,
      tags: ['beginner', 'everyday', 'reliable', 'whole wheat'],
      notes: [
        'Perfect starter training recipe',
        'Timing is flexible and forgiving',
        'Great for sandwiches and toast'
      ],
      recipeType: 'classic'
    },
    {
      name: 'Homemade Starter Cinnamon Swirl Bread',
      description: 'A sweet, enriched bread that transforms your homemade starter into a delightful breakfast or dessert loaf with warm cinnamon and sugar swirls.',
      ingredients: [
        { name: 'Active homemade starter', amount: '120g', note: 'Peak activity' },
        { name: 'All-purpose flour', amount: '350g', note: 'For tenderness' },
        { name: 'Milk', amount: '200ml', note: 'Whole milk preferred' },
        { name: 'Butter', amount: '40g', note: 'Softened' },
        { name: 'Sugar', amount: '30g', note: 'For dough' },
        { name: 'Salt', amount: '6g', note: 'Fine grain' },
        { name: 'Cinnamon', amount: '2 tsp', note: 'Ground' },
        { name: 'Brown sugar', amount: '80g', note: 'For filling' },
        { name: 'Butter', amount: '30g', note: 'Melted, for filling' }
      ],
      instructions: [
        'Mix starter, milk, and softened butter until combined.',
        'Add flour, sugar, and salt. Knead until smooth and elastic.',
        'First rise in oiled bowl for 4-6 hours until doubled.',
        'Roll into 12x8 rectangle. Brush with melted butter.',
        'Mix cinnamon and brown sugar. Sprinkle evenly over dough.',
        'Roll tightly from short end. Place seam-down in greased loaf pan.',
        'Proof 2-3 hours until dough crowns the pan.',
        'Bake at 375°F for 30-35 minutes until golden brown.'
      ],
      difficulty: 'Intermediate',
      totalTime: '10-12 hours',
      activeTime: '2 hours',
      yields: '1 loaf pan bread',
      hydration: 57,
      tags: ['sweet', 'enriched', 'cinnamon', 'breakfast'],
      notes: [
        'Enriched doughs ferment more slowly',
        'Don\'t skip the butter brushing step',
        'Great for French toast when day-old'
      ],
      recipeType: 'specialty'
    }
  ],
  'koji-sourdough-starter': [
    {
      name: 'Koji Sourdough Country Loaf',
      description: 'A unique fusion bread showcasing koji\'s umami depth with traditional sourdough techniques. The koji adds subtle sweetness and complex flavors.',
      ingredients: [
        { name: 'Active koji sourdough starter', amount: '180g', note: 'Peak fermentation' },
        { name: 'Bread flour', amount: '450g', note: 'High protein' },
        { name: 'Whole wheat flour', amount: '50g', note: 'Stone ground' },
        { name: 'Water', amount: '340ml', note: 'Filtered' },
        { name: 'Sea salt', amount: '10g', note: 'Coarse grain' },
        { name: 'Rice flour', amount: '2 tbsp', note: 'For dusting' }
      ],
      instructions: [
        'Autolyse: Mix flours and water, rest 60 minutes for full hydration.',
        'Add starter and salt, mix thoroughly with wet hands.',
        'Bulk ferment 5-7 hours with folds every 45 minutes for first 3 hours.',
        'Pre-shape when dough increases by 80%. Rest 30 minutes.',
        'Final shape into boule. Place in rice flour-dusted banneton.',
        'Cold proof 12-24 hours for flavor development.',
        'Bake in preheated Dutch oven at 480°F, 20 minutes covered.',
        'Reduce to 450°F, bake uncovered 20-25 minutes until deep golden.'
      ],
      difficulty: 'Intermediate',
      totalTime: '20-30 hours',
      activeTime: '2.5 hours',
      yields: '1 large boule (900g)',
      hydration: 68,
      tags: ['koji', 'umami', 'artisan', 'fusion'],
      notes: [
        'Koji fermentation creates unique flavor compounds',
        'Longer cold proof enhances umami development',
        'Rice flour prevents sticking and adds texture'
      ],
      recipeType: 'classic'
    },
    {
      name: 'Koji Sourdough Milk Bread',
      description: 'An Asian-inspired soft milk bread using koji starter for incredible depth and natural sweetness. Perfect for sandwiches or enjoying on its own.',
      ingredients: [
        { name: 'Active koji sourdough starter', amount: '100g', note: 'Well-fed' },
        { name: 'Bread flour', amount: '400g', note: 'Japanese flour preferred' },
        { name: 'Milk', amount: '250ml', note: 'Warm' },
        { name: 'Butter', amount: '50g', note: 'Unsalted, softened' },
        { name: 'Sugar', amount: '25g', note: 'White sugar' },
        { name: 'Salt', amount: '7g', note: 'Fine sea salt' },
        { name: 'Egg', amount: '1 large', note: 'For brushing' }
      ],
      instructions: [
        'Combine starter with warm milk and sugar until dissolved.',
        'Add flour and salt, knead until smooth. Add softened butter gradually.',
        'Knead until windowpane test passes, about 15 minutes.',
        'First rise in oiled bowl for 6-8 hours until tripled.',
        'Divide into 3 portions. Roll each into rectangles.',
        'Fold each portion twice, place in greased loaf pan.',
        'Proof 3-4 hours until dough peaks above pan rim.',
        'Brush with beaten egg. Bake at 350°F for 28-32 minutes.'
      ],
      difficulty: 'Advanced',
      totalTime: '12-16 hours',
      activeTime: '3 hours',
      yields: '1 pullman loaf',
      hydration: 62,
      tags: ['milk bread', 'asian', 'soft', 'enriched'],
      notes: [
        'Koji adds natural enzymes for tender crumb',
        'Extended kneading develops proper gluten structure',
        'Internal temperature should reach 190°F'
      ],
      recipeType: 'specialty'
    }
  ],
  'traditional-rye-starter': [
    {
      name: 'German-Style Rye Sourdough',
      description: 'A dense, hearty bread with deep rye flavor and excellent keeping qualities. This traditional recipe showcases the earthy complexity of rye fermentation.',
      ingredients: [
        { name: 'Active rye sourdough starter', amount: '250g', note: 'Peak activity' },
        { name: 'Dark rye flour', amount: '300g', note: 'Coarsely ground' },
        { name: 'Bread flour', amount: '200g', note: 'For structure' },
        { name: 'Water', amount: '280ml', note: 'Room temperature' },
        { name: 'Salt', amount: '12g', note: 'Coarse sea salt' },
        { name: 'Caraway seeds', amount: '1 tbsp', note: 'Optional, traditional' }
      ],
      instructions: [
        'Mix rye starter with water until well combined.',
        'Add both flours, salt, and caraway seeds. Mix thoroughly.',
        'Knead briefly - rye dough won\'t develop like wheat dough.',
        'Shape into a log immediately. Place in greased loaf pan.',
        'Score top with sharp knife. Proof 4-6 hours at room temperature.',
        'Brush with water. Bake at 425°F for 15 minutes.',
        'Reduce to 375°F, bake 35-40 minutes until hollow when tapped.',
        'Cool completely before slicing - at least 12 hours.'
      ],
      difficulty: 'Intermediate',
      totalTime: '8-12 hours',
      activeTime: '45 minutes',
      yields: '1 dense loaf (800g)',
      hydration: 56,
      tags: ['rye', 'german', 'dense', 'traditional'],
      notes: [
        'Rye doesn\'t develop gluten like wheat',
        'Patience required - slice only when completely cool',
        'Keeps fresh for over a week when wrapped'
      ],
      recipeType: 'classic'
    },
    {
      name: 'Rye Sourdough Pretzel Bread',
      description: 'Soft pretzel-inspired bread with the distinctive flavor of rye starter. Features a chewy crust and tender crumb with optional coarse salt topping.',
      ingredients: [
        { name: 'Active rye sourdough starter', amount: '150g', note: 'Bubbly and active' },
        { name: 'Bread flour', amount: '350g', note: 'High gluten' },
        { name: 'Medium rye flour', amount: '100g', note: 'For flavor' },
        { name: 'Water', amount: '260ml', note: 'Lukewarm' },
        { name: 'Salt', amount: '8g', note: 'Fine grain' },
        { name: 'Baking soda', amount: '60g', note: 'For boiling' },
        { name: 'Pretzel salt', amount: '2 tbsp', note: 'Coarse crystals' }
      ],
      instructions: [
        'Mix starter with lukewarm water until dissolved.',
        'Add flours and salt, knead until smooth and elastic, 10 minutes.',
        'Bulk ferment 4-5 hours with 3 folds in first 2 hours.',
        'Divide into 8 portions. Shape into pretzel shapes or rolls.',
        'Proof 2 hours until puffy but not doubled.',
        'Boil water with baking soda. Dip each piece for 30 seconds.',
        'Place on parchment, sprinkle with pretzel salt.',
        'Bake at 450°F for 12-15 minutes until deep brown.'
      ],
      difficulty: 'Advanced',
      totalTime: '8-10 hours',
      activeTime: '2.5 hours',
      yields: '8 pretzel rolls',
      hydration: 58,
      tags: ['pretzel', 'boiled', 'rye', 'german'],
      notes: [
        'Boiling step creates characteristic pretzel crust',
        'Work quickly during boiling process',
        'Best eaten same day while crust is crispy'
      ],
      recipeType: 'specialty'
    }
  ],
  'house-blend-starter': [
    {
      name: 'House Blend Artisan Batard',
      description: 'Our signature bread showcasing the complex flavor profile of our house blend starter. Perfect balance of tang, sweetness, and nutty depth.',
      ingredients: [
        { name: 'Active house blend starter', amount: '200g', note: 'Peak fermentation' },
        { name: 'Bread flour', amount: '400g', note: 'Artisan grade' },
        { name: 'Whole grain spelt flour', amount: '100g', note: 'For complexity' },
        { name: 'Water', amount: '350ml', note: 'Filtered, room temp' },
        { name: 'Sea salt', amount: '11g', note: 'Mineral-rich' },
        { name: 'Olive oil', amount: '1 tbsp', note: 'Extra virgin' }
      ],
      instructions: [
        'Autolyse flours and water for 45 minutes.',
        'Add starter, salt, and olive oil. Mix until fully incorporated.',
        'Bulk ferment 5-6 hours with stretch and folds every hour.',
        'Pre-shape into loose round. Rest 25 minutes.',
        'Final shape into batard. Place seam-side up in banneton.',
        'Cold proof 8-16 hours for optimal flavor development.',
        'Score decoratively. Bake in steamed oven at 465°F.',
        'Bake 20 minutes with steam, then 18-22 minutes without.'
      ],
      difficulty: 'Intermediate',
      totalTime: '16-24 hours',
      activeTime: '2 hours',
      yields: '1 artisan batard (850g)',
      hydration: 70,
      tags: ['house blend', 'artisan', 'spelt', 'signature'],
      notes: [
        'Spelt adds nutty flavor and tender crumb',
        'Cold proof essential for flavor development',
        'Steam creates beautiful crust development'
      ],
      recipeType: 'classic'
    },
    {
      name: 'House Blend Seeded Crackers',
      description: 'Crispy, flavorful crackers that make excellent use of discard starter. Perfect for cheese boards and showcasing the starter\'s unique character.',
      ingredients: [
        { name: 'House blend starter discard', amount: '200g', note: 'Any age works' },
        { name: 'All-purpose flour', amount: '150g', note: 'For structure' },
        { name: 'Olive oil', amount: '3 tbsp', note: 'Good quality' },
        { name: 'Salt', amount: '1 tsp', note: 'Fine grain' },
        { name: 'Mixed seeds', amount: '4 tbsp', note: 'Sesame, poppy, flax' },
        { name: 'Fresh herbs', amount: '2 tbsp', note: 'Rosemary, thyme' },
        { name: 'Black pepper', amount: '1/2 tsp', note: 'Freshly ground' }
      ],
      instructions: [
        'Combine starter discard, flour, olive oil, and salt until smooth.',
        'Add seeds, herbs, and pepper. Mix until evenly distributed.',
        'Rest dough 30 minutes for hydration.',
        'Roll between parchment sheets to 1/8-inch thickness.',
        'Cut into desired shapes with knife or cookie cutters.',
        'Transfer to baking sheets lined with parchment.',
        'Bake at 350°F for 18-22 minutes until golden and crispy.',
        'Cool completely on wire racks before storing.'
      ],
      difficulty: 'Easy',
      totalTime: '2 hours',
      activeTime: '45 minutes',
      yields: '40-50 crackers',
      hydration: 15,
      tags: ['crackers', 'discard', 'seeds', 'appetizer'],
      notes: [
        'Great way to use any amount of discard',
        'Customize seed and herb combinations',
        'Store in airtight container for up to 1 week'
      ],
      recipeType: 'specialty'
    }
  ]
};

export async function generateRecipesForStarter(starterId: number, starterSlug: string) {
  try {
    console.log(`Generating recipes for starter ${starterId} with slug: ${starterSlug}`);
    
    const templates = recipeTemplates[starterSlug];
    if (!templates) {
      console.log(`No recipe templates found for starter slug: ${starterSlug}`);
      return [];
    }

    const createdRecipes = [];

    for (const template of templates) {
      // Create the recipe
      const [recipe] = await db.insert(breadRecipes).values({
        name: template.name,
        description: template.description,
        ingredients: template.ingredients,
        instructions: template.instructions,
        difficulty: template.difficulty,
        totalTime: template.totalTime,
        activeTime: template.activeTime,
        yields: template.yields,
        hydration: template.hydration,
        tags: template.tags,
        notes: template.notes,
        isPublic: true,
        createdAt: new Date().toISOString(),
      }).returning();

      if (recipe) {
        // Link the recipe to the starter
        await db.insert(starterRecipes).values({
          starterId: starterId,
          recipeId: recipe.id,
          recipeType: template.recipeType,
          isRecommended: true,
        });

        createdRecipes.push(recipe);
        console.log(`Created recipe: ${template.name} for starter ${starterId}`);
      }
    }

    return createdRecipes;
  } catch (error) {
    console.error('Error generating recipes for starter:', error);
    return [];
  }
}

export async function generateAllStarterRecipes() {
  try {
    console.log('Starting bulk recipe generation for all starters...');
    
    const starters = await db.select().from(sourdoughStarters);
    let totalCreated = 0;

    for (const starter of starters) {
      const existingLinks = await db
        .select()
        .from(starterRecipes)
        .where(eq(starterRecipes.starterId, starter.id));

      if (existingLinks.length === 0) {
        const recipes = await generateRecipesForStarter(starter.id, starter.slug);
        totalCreated += recipes.length;
        console.log(`Generated ${recipes.length} recipes for ${starter.name}`);
      } else {
        console.log(`Recipes already exist for ${starter.name}, skipping...`);
      }
    }

    console.log(`Recipe generation complete. Total recipes created: ${totalCreated}`);
    return totalCreated;
  } catch (error) {
    console.error('Error in bulk recipe generation:', error);
    return 0;
  }
}

export async function getRecipesForStarter(starterId: number) {
  try {
    const recipes = await db
      .select({
        recipe: breadRecipes,
        link: starterRecipes,
      })
      .from(starterRecipes)
      .innerJoin(breadRecipes, eq(starterRecipes.recipeId, breadRecipes.id))
      .where(eq(starterRecipes.starterId, starterId));

    return recipes.map(r => ({
      ...r.recipe,
      recipeType: r.link.recipeType,
      isRecommended: r.link.isRecommended,
    }));
  } catch (error) {
    console.error('Error fetching recipes for starter:', error);
    return [];
  }
}