import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  UseGuards,
  ParseIntPipe,
  ValidationPipe,
  UseInterceptors,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import {
  UpdateProductDto,
  UpdateProductsByCodeDto,
} from './dto/update-product.dto';
import { FindProductDto } from './dto/find-product.dto';
import { DeleteProductDto } from './dto/delete-product.dto';
import {
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { AdminGuard } from '../common/guards/admin.guard';
import { Role } from '../common/enums/roles.enum';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('products')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'x-user-role',
    description: 'Token role',
    required: true,
    schema: { enum: Object.values(Role) },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin role required.',
  })
  @ApiOperation({ summary: 'Create a new motor insurance product' })
  @ApiResponse({
    description: 'Returns list of product',
    type: [Product],
  })
  async create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ): Promise<Product> {
    try {
      return await this.productService.create(createProductDto);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error creating product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheKey('products')
  @CacheTTL(2) // 2 seconds (for demo purposes)
  @ApiOperation({ summary: 'Find all products with optional fields' })
  @ApiResponse({
    status: 200,
    description: 'The product records',
    type: Product,
    isArray: true,
  })
  async findAll(
    @Query(ValidationPipe) query: FindProductDto,
  ): Promise<Product[]> {
    try {
      return await this.productService.findAll(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching products',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Find product by id' })
  @ApiResponse({
    status: 200,
    description: 'The product record',
    type: Product,
  })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    try {
      return await this.productService.findOne(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error fetching product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'x-user-role',
    description: 'Token role',
    required: true,
    schema: { enum: Object.values(Role) },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin role required.',
  })
  @ApiOperation({ summary: 'Update all products by code' })
  @ApiResponse({
    status: 200,
    description: 'The product records',
    type: Product,
    isArray: true,
  })
  async updateProductsByCode(
    @Query(ValidationPipe) query: UpdateProductsByCodeDto,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    try {
      const filteredData = {
        ...(updateProductDto.location && {
          location: updateProductDto.location,
        }),
        ...(updateProductDto.price && { price: updateProductDto.price }),
      };
      return await this.productService.updateProductsByCode(
        query,
        filteredData,
      );
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating products',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'x-user-role',
    description: 'Token role',
    required: true,
    schema: { enum: Object.values(Role) },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin role required.',
  })
  @ApiOperation({ summary: 'Update product by id' })
  @ApiResponse({
    status: 200,
    description: 'The product record',
    type: Product,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    try {
      const filteredData = {
        ...(updateProductDto.location && {
          location: updateProductDto.location,
        }),
        ...(updateProductDto.price && { price: updateProductDto.price }),
      };

      return await this.productService.update(id, filteredData);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error updating product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'x-user-role',
    description: 'Token role',
    required: true,
    schema: { enum: Object.values(Role) },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin role required.',
  })
  @ApiOperation({ summary: 'Delete product by code' })
  @ApiResponse({
    status: 200,
    description: 'The product record',
    type: Product,
  })
  async removeProductsByCode(@Query(ValidationPipe) query: DeleteProductDto) {
    try {
      return await this.productService.removeProductsByCode(query);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting products',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  @ApiHeader({
    name: 'x-user-role',
    description: 'Token role',
    required: true,
    schema: { enum: Object.values(Role) },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized. Admin role required.',
  })
  @ApiOperation({ summary: 'Delete product by id' })
  @ApiResponse({
    status: 200,
    description: 'The product record',
    type: Product,
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.productService.remove(id);
    } catch (error) {
      throw new HttpException(
        error.message || 'Error deleting product',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
