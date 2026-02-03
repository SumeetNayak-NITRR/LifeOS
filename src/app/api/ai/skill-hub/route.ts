import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_STUDIO_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { action, skill, userData, currentPhase, practiceData, userResponse } = await req.json();

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    let prompt = "";

    if (action === "diagnosis") {
      prompt = `
        You are the Neural Skill Advisor for LifeOS.
        Analyze the user's LifeOS behavior data to provide a short, high-impact skill diagnosis for "${skill.name}".
        
        User Data:
        ${JSON.stringify(userData)}
        
        Diagnosis Rules:
        - No scores, no labels.
        - Short insight (1-2 sentences).
        - Example: "You hesitate more at the start than during expression."
        
        Format: { "insight": "..." }
      `;
    } else if (action === "generate_path") {
      prompt = `
        You are the Neural Skill Advisor for LifeOS.
        Create a micro-path for the skill "${skill.name}" at phase "${currentPhase}".
        
        Output:
        1. Weekly Focus (1 concept)
        2. Daily Practice (5-10 min activity)
        
        Format: { "weeklyFocus": "...", "dailyPractice": { "title": "...", "description": "..." } }
      `;
    } else if (action === "generate_practice") {
      prompt = `
        You are the Neural Skill Advisor for LifeOS.
        Generate a practice session for "${skill.name}".
        Practice Type: One of Speaking prompt, Decision scenario, Reflection question, Social simulation.
        
        Rules:
        - High impact, low noise.
        - Clear start, clear end.
        
        Format: { "type": "...", "prompt": "...", "context": "..." }
      `;
    } else if (action === "submit_practice") {
      prompt = `
        You are the Neural Skill Advisor for LifeOS.
        Provide feedback on the user's response to a practice session for "${skill.name}".
        
        Practice Prompt: "${practiceData.prompt}"
        User Response: "${userResponse}"
        
        Feedback Rules:
        - Short, constructive, non-judgmental.
        - No grading, no scores.
        - Example: "Your idea is clear, but try starting with your conclusion next time."
        
        Format: { "feedback": "..." }
      `;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return NextResponse.json(JSON.parse(text));
  } catch (error) {
    console.error("Skill Hub AI Error:", error);
    return NextResponse.json({ error: "Intelligence core offline" }, { status: 500 });
  }
}
