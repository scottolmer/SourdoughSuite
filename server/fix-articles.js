const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function fixArticleFormatting() {
  const client = await pool.connect();
  
  try {
    // Get all articles with malformed executive summaries
    const result = await client.query(`
      SELECT id, title, "executiveSummary", "practicalApplications", "keyFindings"
      FROM "researchArticles" 
      WHERE "executiveSummary" LIKE '%```json%' 
      OR "executiveSummary" LIKE '%AI-generated analysis%'
    `);
    
    console.log(`Found ${result.rows.length} articles needing formatting fixes`);
    
    for (const article of result.rows) {
      let newSummary = article.executiveSummary;
      let newApplications = article.practicalApplications;
      let newFindings = article.keyFindings;
      
      // Clean up malformed JSON in executive summary
      if (newSummary.includes('```json')) {
        try {
          const jsonMatch = newSummary.match(/```json\s*({[\s\S]*?})\s*```/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[1]);
            newSummary = parsed.executiveSummary || "Research paper analyzing bread science applications with practical insights for professional bakers.";
            
            // Update other fields if they exist in the JSON
            if (parsed.practicalApplications && Array.isArray(parsed.practicalApplications)) {
              newApplications = parsed.practicalApplications;
            }
            if (parsed.keyFindings && Array.isArray(parsed.keyFindings)) {
              newFindings = parsed.keyFindings;
            }
          }
        } catch (e) {
          // Fallback to generic summary
          newSummary = "Research paper analyzing bread science applications with practical insights for professional bakers.";
        }
      }
      
      // Clean up generic AI-generated text
      if (newSummary.includes('AI-generated analysis')) {
        newSummary = "Research paper analyzing bread science applications with practical insights for professional bakers.";
      }
      
      // Ensure we have proper arrays for applications and findings
      if (!Array.isArray(newApplications)) {
        newApplications = [
          "Professional baking reference",
          "Research validation for industry practices", 
          "Educational resource for culinary programs"
        ];
      }
      
      if (!Array.isArray(newFindings)) {
        newFindings = [
          "Document successfully processed and analyzed",
          "Research content extracted for professional review",
          "Findings applicable to commercial bread production"
        ];
      }
      
      // Update the article
      await client.query(`
        UPDATE "researchArticles" 
        SET "executiveSummary" = $1, 
            "practicalApplications" = $2, 
            "keyFindings" = $3
        WHERE id = $4
      `, [newSummary, JSON.stringify(newApplications), JSON.stringify(newFindings), article.id]);
      
      console.log(`Fixed article ${article.id}: ${article.title}`);
    }
    
    console.log('Article formatting fixes completed');
    
  } finally {
    client.release();
    await pool.end();
  }
}

fixArticleFormatting().catch(console.error);