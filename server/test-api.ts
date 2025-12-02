import OpenAI from "openai";
import { config } from "dotenv";

// Load environment variables
config();

async function testOpenAI() {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://nano-gpt.com/api/v1"
    });

    console.log("Testing OpenAI API with nano-gpt.com base URL...");
    
    const response = await openai.chat.completions.create({
      model: "chatgpt-4o-latest",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello" }
      ],
      stream: false
    });

    console.log("Response:", JSON.stringify(response, null, 2));
  } catch (error) {
    console.error("Error testing OpenAI API:", error);
  }
}

testOpenAI();