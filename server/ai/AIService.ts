import { AIProvider, GenerateContentParams } from "./AIProvider";
import { GeminiProvider } from "./GeminiProvider";
import { GroqProvider } from "./GroqProvider";

export class AIService {
  private provider: AIProvider;
  private hasProvider: boolean = false;

  constructor() {
    const selectedProvider = process.env.AI_PROVIDER?.toLowerCase();

    if (selectedProvider === "groq") {
      const groq = new GroqProvider();
      this.provider = groq;
      this.hasProvider = groq.isAvailable();
    } else {
      // Default to Gemini
      const gemini = new GeminiProvider();
      this.provider = gemini;
      this.hasProvider = gemini.isAvailable();
    }
  }

  public isAvailable(): boolean {
    return this.hasProvider;
  }

  public async generateContent(params: GenerateContentParams): Promise<string> {
    if (!this.hasProvider) {
      throw new Error("AI service currently unavailable.");
    }

    return this.retryWithBackoff(() => this.provider.generateContent(params));
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      const isQuota = err.status === "RESOURCE_EXHAUSTED" || err.status === 429 || err.status === 503 || (err.message && (err.message.includes("429") || err.message.includes("503")));
      const isNetwork = err.message && (err.message.includes("fetch failed") || err.message.includes("ECONNRESET") || err.message.includes("socket hang up"));
      
      if (retries > 0 && (isQuota || isNetwork)) {
        console.log(`Error: ${err.message}, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(fn, retries - 1, delay * 2);
      }
      throw err;
    }
  }
}

export const aiService = new AIService();
