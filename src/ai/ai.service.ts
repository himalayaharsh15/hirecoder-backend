import { GoogleGenAI } from '@google/genai';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resumeReviewPrompt } from './prompts/resume-review.prompt';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  constructor(private configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: this.configService.get<string>('GEMINI_API_KEY'),
    });
  }

  async reviewResume(resume: string) {
    const models = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.5-pro',
    ];
    // const response = await this.ai.models.generateContent({
    //   model: 'gemini-3.5-flash',
    //   contents: resumeReviewPrompt(resume),
    // });

    // return response.text;
    for (let model of models) {
      try {
        const response = await this.ai.models.generateContent({
          model: model,
          contents: resumeReviewPrompt(resume),
        });
        return response.text;
      } catch (error) {
        console.log('model Failed');
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
