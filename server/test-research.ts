import { db } from "./db";

async function testResearchData() {
  try {
    console.log("Testing research database...");
    
    // Test articles
    const articles = await db.query.researchArticles.findMany();
    console.log("Articles found:", articles.length);
    if (articles.length > 0) {
      console.log("First article:", articles[0].title);
    }
    
    // Test topics
    const topics = await db.query.researchTopics.findMany();
    console.log("Topics found:", topics.length);
    
    // Test sources
    const sources = await db.query.researchSources.findMany();
    console.log("Sources found:", sources.length);
    
  } catch (error) {
    console.error("Research test error:", error);
  }
}

testResearchData();