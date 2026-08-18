import { GoogleGenAI } from '@google/genai';
import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { resumeReviewPrompt } from './prompts/resume-review.prompt';
import { parseAIResponse } from './utils/json-parser';
import { ResumeReview } from './Interface/resume-review.interface';
import { AI_MODELS } from './config/model';
import { jobMatchPrompt } from './prompts/job-match.prompt';
import { JobMatch } from './Interface/job-match.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadedResumeFile } from './Interface/resume.interface';
import { PDFParse } from 'pdf-parse';

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
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

  async reviewMyResume(userId: string) {
    // ============================================================
    // 1. Find the authenticated user's uploaded resume
    // ============================================================

    const resume = await this.prisma.resume.findUnique({
      where: {
        userId,
      },
    });

    // ============================================================
    // 2. Make sure the candidate has uploaded a resume
    // ============================================================

    if (!resume) {
      throw new BadRequestException(
        'Please upload your resume before requesting an AI review.',
      );
    }

    // ============================================================
    // 3. Make sure extracted text exists
    // ============================================================

    if (!resume.extractedText?.trim()) {
      throw new BadRequestException(
        'Resume text could not be extracted. Please upload your resume again.',
      );
    }

    // ============================================================
    // 4. Reuse our existing AI resume-review method
    // ============================================================

    return this.reviewResume(resume.extractedText);
  }

  async analyzeJobMatch(resume: string, jobDescription: string) {
    const models = AI_MODELS;

    for (const model of models) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: jobMatchPrompt(resume, jobDescription),
        });

        const result = parseAIResponse<JobMatch>(response.text!);

        return result;
      } catch (error) {
        console.error(`Model ${model} failed`, error);
      }
    }

    throw new ServiceUnavailableException('All AI models are unavailable');
  }

  async uploadResume(file: UploadedResumeFile, userId: string) {
    // ============================================================
    // 1. Make sure a file was uploaded
    // ============================================================

    if (!file) {
      throw new BadRequestException('Resume file is required.');
    }

    // ============================================================
    // 2. Validate file size
    // Maximum resume size: 5 MB
    // ============================================================

    const MAX_RESUME_SIZE = 5 * 1024 * 1024;

    if (file.size > MAX_RESUME_SIZE) {
      throw new BadRequestException('Resume file must be smaller than 5 MB.');
    }

    // ============================================================
    // 3. Only allow PDF files
    // ============================================================

    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Only PDF resumes are supported.');
    }

    // ============================================================
    // 4. Extract text from the PDF
    // ============================================================

    const parser = new PDFParse({
      data: file.buffer,
    });

    const pdfData = await parser.getText();

    const extractedText = pdfData.text?.trim();

    // Always release parser resources after processing.
    await parser.destroy();

    // ============================================================
    // 5. Make sure we actually extracted text
    // ============================================================

    if (!extractedText) {
      throw new BadRequestException(
        'Could not extract text from the uploaded PDF.',
      );
    }

    // ============================================================
    // 6. Save / update candidate resume
    // ============================================================

    const resume = await this.prisma.resume.upsert({
      where: {
        userId,
      },

      update: {
        fileName: file.originalname,
        extractedText,
      },

      create: {
        userId,
        fileName: file.originalname,
        extractedText,
      },
    });

    // ============================================================
    // 7. Return only information required by frontend
    // ============================================================

    return {
      message: 'Resume uploaded successfully.',

      resume: {
        id: resume.id,
        fileName: resume.fileName,
      },
    };
  }

  async analyzeMyJobMatch(userId: string, jobId: string) {
    // ============================================================
    // 1. Get candidate's uploaded resume
    // ============================================================

    const resume = await this.prisma.resume.findUnique({
      where: {
        userId,
      },
      select: {
        id: true,
        fileName: true,
        extractedText: true,
      },
    });

    if (!resume) {
      throw new BadRequestException(
        'Please upload your resume before analyzing a job.',
      );
    }

    // ============================================================
    // 2. Get the selected job
    // ============================================================

    const job = await this.prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        isActive: true,
      },
    });

    if (!job) {
      throw new BadRequestException('Job not found.');
    }

    // ============================================================
    // 3. Make sure the job is active
    // ============================================================

    if (!job.isActive) {
      throw new BadRequestException('This job is no longer active.');
    }

    // ============================================================
    // 4. Make sure resume contains extracted text
    // ============================================================

    if (!resume.extractedText?.trim()) {
      throw new BadRequestException(
        'No extracted resume text is available. Please upload your resume again.',
      );
    }

    // ============================================================
    // 5. Analyze resume against job description
    // ============================================================

    const result = await this.analyzeJobMatch(
      resume.extractedText,
      job.description,
    );

    // ============================================================
    // 6. Return analysis with job information
    // ============================================================

    return {
      job: {
        id: job.id,
        title: job.title,
      },
      resume: {
        id: resume.id,
        fileName: resume.fileName,
      },
      analysis: result,
    };
  }
}
