import { GoogleGenAI } from '@google/genai';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resumeReviewPrompt } from './prompts/resume-review.prompt';
import { parseAIResponse } from './utils/json-parser';
import { ResumeReview } from './Interface/resume-review.interface';
import { AI_MODELS } from './config/model';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async reviewResume(resume: string) {
    let models = AI_MODELS;
    for (let model of models) {
      try {
        const response = await this.ai.models.generateContent({
          model: model,
          contents: resumeReviewPrompt(resume),
        });
        const review = parseAIResponse<ResumeReview>(response.text!);
        return review;
      } catch (error) {
        console.error(`Model ${model} failed`, error);
      }
    }

    throw new ServiceUnavailableException('All Ai models Are unvailabel');
  }
  async listModels() {
    const models = await this.ai.models.list();

    for await (const model of models) {
      console.log(model.name);
    }

    return 'Check terminal';
  }
}
