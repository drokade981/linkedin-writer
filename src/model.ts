import { ChatGroq } from "@langchain/groq";
import detenv from "dotenv";

detenv.config();

/**
 * initialize LLM
 */
export const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY!,
    model: "openai/gpt-oss-120b",
    temperature: 0
});