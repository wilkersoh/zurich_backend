import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'West Malaysia',
    description: 'The location of the product',
  })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: 100,
    description: 'The price of the product',
  })
  @IsNumber()
  @IsOptional()
  price?: number;
}

export class UpdateProductsByCodeDto {
  @ApiProperty({
    example: '1000',
    description: 'Update all the products by code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
