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
  create(
    @Body(ValidationPipe) createProductDto: CreateProductDto,
  ): Promise<Product> {
    return this.productService.create(createProductDto);
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
  findAll(@Query(ValidationPipe) query: FindProductDto): Promise<Product[]> {
    return this.productService.findAll(query);
  }

  @Get(':id')
  @UseInterceptors(CacheInterceptor)
  @ApiOperation({ summary: 'Find product by id' })
  @ApiResponse({
    status: 200,
    description: 'The product record',
    type: Product,
  })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
    return this.productService.findOne(id);
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
  updateProductsByCode(
    @Query(ValidationPipe) query: UpdateProductsByCodeDto,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    const filteredData = {
      ...(updateProductDto.location && { location: updateProductDto.location }),
      ...(updateProductDto.price && { price: updateProductDto.price }),
    };
    return this.productService.updateProductsByCode(query, filteredData);
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProductDto: UpdateProductDto,
  ) {
    const filteredData = {
      ...(updateProductDto.location && { location: updateProductDto.location }),
      ...(updateProductDto.price && { price: updateProductDto.price }),
    };

    return this.productService.update(id, filteredData);
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
  removeProductsByCode(@Query(ValidationPipe) query: DeleteProductDto) {
    return this.productService.removeProductsByCode(query);
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
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productService.remove(id);
  }
}
