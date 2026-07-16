import { GoogleGenAI } from "@google/genai";
import { AIProvider, GenerateContentParams } from "./AIProvider";

export class GeminiProvider implements AIProvider {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (GEMINI_KEY) {
      try {
        this.ai = new GoogleGenAI({
          apiKey: GEMINI_KEY,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
        console.log("GeminiProvider initialized successfully.");
      } catch (err) {
        console.error("Failed to initialize Gemini Client in Provider:", err);
      }
    } else {
      console.log("No GEMINI_API_KEY found in GeminiProvider. Operating in fallback mode.");
    }
  }

  public isAvailable(): boolean {
    return this.ai !== null;
  }

  public async generateContent(params: GenerateContentParams): Promise<string> {
    if (!this.ai) {
      throw new Error("AI provider is not initialized (missing API key)");
    }

    const config: any = {};
    if (params.systemInstruction) {
      config.systemInstruction = params.systemInstruction;
    }
    if (params.responseMimeType) {
      config.responseMimeType = params.responseMimeType;
    }

    let contents: any[] = [];
    if (params.messages) {
      contents = params.messages;
    } else if (params.prompt) {
      contents = params.prompt as any;
    }

    const request: any = {
      model: "gemini-3.5-flash",
      contents: contents,
    };

    if (Object.keys(config).length > 0) {
      request.config = config;
    }

    const response = await this.ai.models.generateContent(request);
    return response.text || "";
  }
}
