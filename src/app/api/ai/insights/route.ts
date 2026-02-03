import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY || '');

export async function POST(req: Request) {
  try {
    const { fitness, work, routine, planning } = await req.json();

    if (!process.env.GOOGLE_AI_STUDIO_API_KEY) {
      return NextResponse.json({ 
        insights: [{
          id: 'error-1',
          text: "Google AI Studio API Key is missing. Please configure it to enable Pro Coach insights.",
          category: 'System'
        }]
      });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

      const prompt = `
        You are an elite "Pro Coach" AI for the LifeOS high-performance dashboard. 
        Analyze the user's data and provide 3-5 deeply analytical, tactical, and nuanced insights.
        
        CRITICAL ANALYSIS PROTOCOL:
        1. TREND DETECTION: If the user has 5+ days of data in routine.habitHistory or fitness.history, you MUST identify specific patterns (e.g., "You tend to miss habits on Tuesdays", "Your recovery ratio is decreasing").
        2. VELOCITY CHECK: Analyze the relationship between sleep quality and workout intensity/completion.
        3. DRIFT ANALYSIS: Identify if the user is drifting away from their set planning goals.
        
        User Data Stack:
        - Fitness: ${JSON.stringify(fitness)}
        - Work: ${JSON.stringify(work)}
        - Routine: ${JSON.stringify(routine)}
        - Planning: ${JSON.stringify(planning)}

        Format: JSON object with 'insights' array.
        Each insight: { id, text, category }. 
        Categories: 'Performance', 'Recovery', 'Focus', 'Productivity', 'Mindset'.
        Tone: Operator-grade, technical but encouraging, data-driven.
      `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();
    
    if (!content) throw new Error('No content from Gemini');
    
    const { insights } = JSON.parse(content);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}
