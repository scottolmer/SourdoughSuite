import { MultiLLMService } from './services/multi-llm-service';

async function testMultiLLM() {
  const apiKey = '4180d93c-9cf0-4a36-b71a-061a24a64b0c';
  const service = new MultiLLMService(apiKey);
  
  console.log('Testing multi-LLM consensus system...');
  
  try {
    const result = await service.generateRecipeConsensus('Simple chocolate chip cookies for beginners');
    console.log('Success!');
    console.log('Provider:', result.providers[0]);
    console.log('Confidence:', result.confidence);
    console.log('Recipe name:', result.finalRecipe?.name || 'No name');
    console.log('Ingredients count:', result.finalRecipe?.ingredients?.length || 0);
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testMultiLLM();