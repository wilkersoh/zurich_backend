import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';
import {
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;

  // Mock product data
  const mockProduct: Product = {
    id: 1,
    code: '800',
    description: 'Test Product',
    location: 'Test Location',
    price: 100,
  };

  // Mock service implementation
  const mockProductService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateProductsByCode: jest.fn(),
    remove: jest.fn(),
    removeProductsByCode: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    })
      .overrideInterceptor(CacheInterceptor)
      .useValue({})
      .compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        code: '800',
        description: 'Test Product',
        location: 'Test Location',
        price: 100,
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProduct);

      const result = await controller.create(createProductDto);

      expect(result).toEqual(mockProduct);
      expect(service.create).toHaveBeenCalledWith(createProductDto);
    });

    it('should handle error when create fails', async () => {
      const createProductDto: CreateProductDto = {
        code: '800',
        description: 'Test Product',
        location: 'Test Location',
        price: 100,
      };

      const errorMessage = 'Failed to create product';
      jest
        .spyOn(service, 'create')
        .mockRejectedValue(new BadRequestException(errorMessage));

      try {
        await controller.create(createProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of products', async () => {
      const mockProducts = [mockProduct];
      jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

      const result = await controller.findAll({
        code: '800',
        location: 'Test Location',
      });

      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalled();
    });

    it('should return filtered products when query params are provided', async () => {
      const mockProducts = [mockProduct];
      const query = { location: 'Test Location' };

      jest.spyOn(service, 'findAll').mockResolvedValue(mockProducts);

      const result = await controller.findAll(query);

      expect(result).toEqual(mockProducts);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle error when findAll fails', async () => {
      const query = { location: 'Test Location' };
      const errorMessage = 'Failed to fetch products';
      jest.spyOn(service, 'findAll').mockRejectedValue(new Error(errorMessage));

      try {
        await controller.findAll(query);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);

      const id = 1;
      const result = await controller.findOne(id);

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it('should handle error when product is not found', async () => {
      const id = 999;
      const errorMessage = 'Product with ID 999 not found';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await controller.findOne(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('updateProductsByCode', () => {
    it('should update all the products by code', async () => {
      const query = { code: '800' };
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };

      const updatedProductIds = {
        updatedIds: [1, 2],
      };

      jest
        .spyOn(service, 'updateProductsByCode')
        .mockResolvedValue(updatedProductIds);

      const result = await controller.updateProductsByCode(
        query,
        updateProductDto,
      );

      expect(result).toEqual(updatedProductIds);
      expect(service.updateProductsByCode).toHaveBeenCalledWith(
        query,
        updateProductDto,
      );
    });

    it('should handle error when updateProductsByCode fails', async () => {
      const query = { code: '800' };
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const errorMessage = 'No products found with code 800';
      jest
        .spyOn(service, 'updateProductsByCode')
        .mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await controller.updateProductsByCode(query, updateProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const updatedProduct: Product = {
        ...mockProduct,
        ...updateProductDto,
      };

      jest.spyOn(service, 'update').mockResolvedValue(updatedProduct as any);

      const result = await controller.update(id, updateProductDto);
      expect(result).toEqual(updatedProduct);
      expect(service.update).toHaveBeenCalledWith(1, {
        location: updateProductDto.location,
        price: updateProductDto.price,
      });
    });

    it('should handle error when update fails', async () => {
      const id = 1;
      const updateProductDto: UpdateProductDto = {
        location: 'Updated Location',
        price: 150,
      };
      const errorMessage = 'Product with ID 1 not found';
      jest
        .spyOn(service, 'update')
        .mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await controller.update(id, updateProductDto);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('removeProductsByCode', () => {
    it('should remove all the products by code', async () => {
      const mockProducts = [mockProduct];

      jest
        .spyOn(service, 'removeProductsByCode')
        .mockResolvedValue(mockProducts);

      const result = await controller.removeProductsByCode({ code: '800' });

      expect(result).toEqual(mockProducts);
      expect(service.removeProductsByCode).toHaveBeenCalledWith({
        code: '800',
      });
    });

    it('should handle error when removeProductsByCode fails', async () => {
      const errorMessage = 'No products found with the specified code';
      jest
        .spyOn(service, 'removeProductsByCode')
        .mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await controller.removeProductsByCode({ code: '800' });
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockProduct);

      const result = await controller.remove(1);

      expect(result).toEqual(mockProduct);
      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it('should handle error when remove fails', async () => {
      const id = 1;
      const errorMessage = 'Product with ID 1 not found';
      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(new NotFoundException(errorMessage));

      try {
        await controller.remove(id);
      } catch (error) {
        expect(error).toBeInstanceOf(HttpException);
        expect(error.message).toBe(errorMessage);
        expect(error.status).toBe(HttpStatus.NOT_FOUND);
      }
    });
  });
});
