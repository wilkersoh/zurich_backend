import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteProductDto {
  @ApiProperty({
    example: '1000',
    description: 'Delete all the products by code',
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
