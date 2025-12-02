import { db } from './db';
import { researchTopics } from '@shared/schema';

const initialTopics = [
  {
    name: "Sourdough Starter Science",
    description: "Microbiology, maintenance, and optimization of sourdough starter cultures",
    slug: "sourdough-starter-science"
  },
  {
    name: "Fermentation Biochemistry", 
    description: "Chemical processes during dough fermentation and their effects on bread quality",
    slug: "fermentation-biochemistry"
  },
  {
    name: "Dough Hydration Studies",
    description: "Water-flour ratios and their impact on bread texture, crumb, and crust development",
    slug: "dough-hydration-studies"
  },
  {
    name: "Gluten Development Research",
    description: "Protein network formation, mixing techniques, and structural analysis",
    slug: "gluten-development-research"
  },
  {
    name: "Bread Chemistry & Maillard Reactions",
    description: "Chemical transformations during baking, browning, and flavor development",
    slug: "bread-chemistry-maillard-reactions"
  },
  {
    name: "Temperature & Time Variables",
    description: "Impact of fermentation temperature, proofing time, and baking parameters",
    slug: "temperature-time-variables"
  },
  {
    name: "Flour Science & Composition",
    description: "Wheat varieties, protein content, enzyme activity, and flour quality analysis",
    slug: "flour-science-composition"
  },
  {
    name: "Artisan Bread Techniques",
    description: "Traditional methods, shaping techniques, and artisanal bread production",
    slug: "artisan-bread-techniques"
  }
];

export async function seedResearchTopics() {
  try {
    console.log('Seeding research topics...');
    
    for (const topic of initialTopics) {
      await db.insert(researchTopics).values({
        name: topic.name,
        description: topic.description,
        slug: topic.slug,
        sourceCount: Math.floor(Math.random() * 200) + 50, // 50-250 sources
        confidenceScore: Math.floor(Math.random() * 31) + 70 // 70-100 confidence
      }).onConflictDoNothing();
    }
    
    console.log('Research topics seeded successfully');
  } catch (error) {
    console.error('Error seeding research topics:', error);
  }
}