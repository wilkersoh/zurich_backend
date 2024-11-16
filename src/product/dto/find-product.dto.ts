import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString } from 'class-validator';

export class FindProductDto {
  @ApiPropertyOptional({
    description: 'Filter by product code',
    example: '1000',
  })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiPropertyOptional({
    description: 'Filter by location',
    example: 'West Malaysia',
  })
  @IsString()
  @IsOptional()
  location?: string;
}
