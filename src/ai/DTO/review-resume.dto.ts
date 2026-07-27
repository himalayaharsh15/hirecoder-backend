import { IsNotEmpty, IsString } from 'class-validator';

export class ReviewResumeDTO {
  @IsNotEmpty()
  @IsString()
  resume!: string;
}
