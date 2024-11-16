import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

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
  });

  describe('findOne', () => {
    it('should return a single product', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct);

      const id = 1;
      const result = await controller.findOne(id);

      expect(result).toEqual(mockProduct);
      expect(service.findOne).toHaveBeenCalledWith(1);
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
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockProduct);

      const result = await controller.remove(1);

      expect(result).toEqual(mockProduct);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
