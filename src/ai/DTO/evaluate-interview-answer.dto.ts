import { IsNotEmpty, IsString } from 'class-validator';

export class EvaluateInterviewAnswerDTO {
  @IsString()
  @IsNotEmpty()
  question!: string;

  @IsString()
  @IsNotEmpty()
  answer!: string;
}
