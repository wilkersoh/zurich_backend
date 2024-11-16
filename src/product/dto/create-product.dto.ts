import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional } from 'class-validator';

import { IsNumber, IsString } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '1000', description: 'The code of the product' })
  @IsNotEmpty()
  @IsString()
  code: string;

  @ApiProperty({
    example: 'Sedan',
    description: 'The description of the product',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'West Malaysia',
    description: 'The location of the product',
  })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ example: 100, description: 'The price of the product' })
  @IsNotEmpty()
  @IsNumber()
  price: number;
}
