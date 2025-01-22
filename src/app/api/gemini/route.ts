import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

import { env } from '@/env.mjs';

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
const generationConfig = {
  temperature: 1,
  top_p: 0.95,
  top_k: 40,
  max_output_tokens: 8192,
  response_mime_type: 'text/plain',
};
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: generationConfig,
});

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const prompt = data.body;

    const chatSession = await model.startChat({
      generationConfig,
      history: data.historyInSession,
    });

    const result = await chatSession.sendMessage(prompt);
    const response = await result.response;
    const code = await response.text();

    return NextResponse.json({ code });
  } catch (error) {
    console.error(error);
  }
}
