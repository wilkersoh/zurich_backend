import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductsByCodeDto,
} from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository, QueryFailedError } from 'typeorm';
import { FindProductDto } from './dto/find-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);
      return await this.productRepository.save(product);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(
          'Invalid product data or duplicate entry',
        );
      }
      throw new InternalServerErrorException('Failed to create product');
    }
  }

  async findAll(filter: FindProductDto) {
    try {
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

      return await this.productRepository.find({
        where: whereClause,
      });
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid filter parameters');
      }
      throw new InternalServerErrorException('Failed to fetch products');
    }
  }

  async findOne(id: number) {
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return product;
    } catch (error) {
      console.log('error', error);
      if (error instanceof NotFoundException) {
        console.log('error: @@@', error);
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid product ID');
      }
      throw new InternalServerErrorException('Failed to fetch product');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      await this.productRepository.update(id, updateProductDto);
      return {
        updatedId: id,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid update data');
      }
      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async updateProductsByCode(
    query: UpdateProductsByCodeDto,
    updateProductDto: UpdateProductDto,
  ) {
    try {
      const products = await this.productRepository.find({ where: query });
      if (!products.length) {
        throw new NotFoundException(
          `No products found with code ${query.code}`,
        );
      }

      await this.productRepository.update(
        { code: query.code },
        updateProductDto,
      );
      return {
        updatedIds: products.map((product) => product.id),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid update data or product code');
      }
      throw new InternalServerErrorException('Failed to update products');
    }
  }

  async remove(id: number) {
    try {
      const product = await this.productRepository.findOneBy({ id });
      if (!product) {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      return await this.productRepository.remove(product);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid product ID');
      }
      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async removeProductsByCode(code?: DeleteProductDto) {
    try {
      const products = await this.productRepository.find({ where: code });
      if (!products || products.length === 0) {
        throw new NotFoundException(
          `No products found with the specified code`,
        );
      }
      return await this.productRepository.remove(products);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof QueryFailedError) {
        throw new BadRequestException('Invalid product code');
      }
      throw new InternalServerErrorException('Failed to delete products');
    }
  }
}
