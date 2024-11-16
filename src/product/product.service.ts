import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductsByCodeDto,
} from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { FindProductDto } from './dto/find-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);

    return await this.productRepository.save(product);
  }

  findAll(filter: FindProductDto) {
    // case insensitive for location field
    const whereClause = filter
      ? Object.entries(filter).reduce((acc, [key, value]) => {
          if (key === 'code') {
            acc[key] = value;
          } else {
            acc[key] = ILike(`${value}`);
          }
          return acc;
        }, {})
      : {};

    return this.productRepository.find({
      where: whereClause,
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product Not Found');

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.update(id, updateProductDto);

    return {
      updatedId: id,
    };
  }

  async updateProductsByCode(
    query: UpdateProductsByCodeDto,
    updateProductDto: UpdateProductDto,
  ) {
    const products = await this.productRepository.find({ where: query });

    if (!products.length) {
      throw new NotFoundException('No products found with this code');
    }

    await this.productRepository.update({ code: query.code }, updateProductDto);

    return {
      updatedIds: products.map((product) => product.id),
    };
  }

  async remove(id: number) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) throw new NotFoundException('Product not found');
    return await this.productRepository.remove(product);
  }

  async removeProductsByCode(code?: DeleteProductDto) {
    const products = await this.productRepository.find({ where: code });

    if (!products) {
      throw new NotFoundException('Product not found');
    }
    return await this.productRepository.remove(products);
  }
}
