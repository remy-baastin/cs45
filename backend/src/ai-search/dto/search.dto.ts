import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class SearchDto {
  @IsString()
  @IsNotEmpty({ message: 'query must not be empty' })
  @Transform(({ value }) => (value as string).trim())
  query: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  topN?: number;

  /** Allow per-request threshold override for A/B testing */
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(1.0)
  threshold?: number;
}

export class SuggestDto {
  @IsString()
  @IsNotEmpty({ message: 'query must not be empty' })
  @Transform(({ value }) => (value as string).trim())
  query: string;
}

export class IndexFaqDto {
  @IsString()
  @IsNotEmpty()
  faqId: string;
}
