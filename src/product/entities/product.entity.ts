import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'product' })
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: '1000', description: 'The code of the product' })
  @Column()
  code: string;

  @ApiProperty({
    example: 'Sedan',
    description: 'The description of the product',
  })
  @Column()
  description: string;

  @ApiProperty({
    example: 'West Malaysia',
    description: 'The location of the product',
  })
  @Column()
  location: string;

  @ApiProperty({ example: 100, description: 'The price of the product' })
  @Column()
  price: number;
}
