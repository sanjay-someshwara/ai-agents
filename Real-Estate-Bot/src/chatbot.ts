import { type CoreMessage, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGroq } from '@ai-sdk/groq';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { system_prompt } from './prompt';
import { distanceTool } from './distanceTool';

const openai = createOpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
});
const groq = createGroq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
});
const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY,
});
const messages: CoreMessage[] = []

const model = {
    groq : groq('llama-3.3-70b-versatile'), 
    google : google('gemini-2.0-flash'), 
    openai : openai('chatgpt-4o-latest')
}

export async function getAiResponse(input: string) {
    try {
        messages.push({ role: 'user', content: input });

        const chatResponse = await generateText({
            model: model.google,
            system: system_prompt,
            tools: {distanceTool},
            maxSteps: 5,
            messages,
        });

        messages.push({ role: 'assistant', content: chatResponse.text });
        return chatResponse.text;
    } catch (error) {
        return `Error: ${error}`;
    }
}