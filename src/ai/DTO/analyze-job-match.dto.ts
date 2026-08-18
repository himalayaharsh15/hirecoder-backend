import { IsNotEmpty, IsString } from 'class-validator';

export class AnalyzeJobMatchDTO {
  @IsString()
  @IsNotEmpty()
  resume!: string;

  @IsString()
  @IsNotEmpty()
  jobDescription!: string;
}
