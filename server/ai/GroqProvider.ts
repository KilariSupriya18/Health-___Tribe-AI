import Groq from "groq-sdk";
import { AIProvider, GenerateContentParams } from "./AIProvider";

export class GroqProvider implements AIProvider {
  private groq: Groq | null = null;
  private model: string = "llama-3.3-70b-versatile";

  constructor() {
    const GROQ_KEY = process.env.GROQ_API_KEY;
    if (process.env.GROQ_MODEL) {
      this.model = process.env.GROQ_MODEL;
    }
    
    if (GROQ_KEY) {
      try {
        this.groq = new Groq({ apiKey: GROQ_KEY });
        console.log(`GroqProvider initialized successfully with model: ${this.model}`);
      } catch (err) {
        console.error("Failed to initialize Groq Client in Provider:", err);
      }
    } else {
      console.log("No GROQ_API_KEY found in GroqProvider. Operating in fallback mode.");
    }
  }

  public isAvailable(): boolean {
    return this.groq !== null;
  }

  public async generateContent(params: GenerateContentParams): Promise<string> {
    if (!this.groq) {
      throw new Error("AI provider is not initialized (missing API key)");
    }

    const messages: any[] = [];

    if (params.systemInstruction) {
      messages.push({ role: "system", content: params.systemInstruction });
    }

    if (params.messages) {
      for (const m of params.messages) {
        const content = m.parts.map(p => p.text).join("\n");
        messages.push({
          role: m.role === "model" ? "assistant" : (m.role === "user" ? "user" : m.role),
          content: content
        });
      }
    } else if (params.prompt) {
      let content = "";
      if (Array.isArray(params.prompt)) {
        content = params.prompt.map((p: any) => p.text).join("\n");
      } else {
        content = params.prompt;
      }
      messages.push({ role: "user", content });
    }

    const request: any = {
      model: this.model,
      messages: messages,
    };

    if (params.responseMimeType === "application/json") {
      request.response_format = { type: "json_object" };
    }

    const response = await this.groq.chat.completions.create(request);
    return response.choices[0]?.message?.content || "";
  }
}
