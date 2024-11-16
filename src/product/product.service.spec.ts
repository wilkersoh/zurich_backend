import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';

describe('ProductService', () => {
  let service: ProductService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        code: '1000',
        description: 'Test Product',
        location: 'Test Location',
        price: 100,
      };
      const expectedProduct = { id: 1, ...createProductDto };

      mockRepository.create.mockReturnValue(createProductDto);
      mockRepository.save.mockResolvedValue(expectedProduct);

      const result = await service.create(createProductDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createProductDto);
      expect(mockRepository.save).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual(expectedProduct);
    });
  });

  describe('findAll', () => {
    it('should return products with filter', async () => {
      const filter = { location: 'malaysia' };
      const expectedProducts = [
        {
          id: 2,
          code: '1000',
          description: 'Product 2',
          location: 'malaysia',
          price: 100,
        },
        {
          id: 3,
          code: '1000',
          description: 'Product 3',
          location: 'malaysia',
          price: 100,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedProducts);

      const result = await service.findAll(filter);

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedProducts);
    });

    it('should return all products when filter is empty', async () => {
      const filter = {};
      const expectedProducts = [
        {
          id: 1,
          code: '1001',
          description: 'Product 1',
          location: 'singapore',
          price: 100,
        },
        {
          id: 2,
          code: '1002',
          description: 'Product 2',
          location: 'malaysia',
          price: 200,
        },
        {
          id: 3,
          code: '1003',
          description: 'Product 3',
          location: 'malaysia',
          price: 300,
        },
      ];

      mockRepository.find.mockResolvedValue(expectedProducts);

      const result = await service.findAll(filter);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {},
      });
      expect(result).toEqual(expectedProducts);
    });

    it('should create correct where clause with case insensitive search except for code', () => {
      const filter = {
        location: 'Malaysia',
        code: '1000',
      };

      service.findAll(filter);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          location: ILike('Malaysia'),
          code: '1000',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const id = 1;
      const expectedProduct = { id, name: 'Test Product' };

      mockRepository.findOneBy.mockResolvedValue(expectedProduct);

      const result = await service.findOne(id);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(result).toEqual(expectedProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 999;

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const id = 1;
      const updateProductDto = { location: 'Singapore' };
      const existingProduct = { id, location: 'Malaysia', code: '1000' };

      mockRepository.findOneBy.mockResolvedValue(existingProduct);
      mockRepository.update.mockResolvedValue({ updatedId: id });

      const result = await service.update(id, updateProductDto);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.update).toHaveBeenCalledWith(id, updateProductDto);
      expect(result).toEqual({ updatedId: id });
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 999;
      const updateProductDto = { location: 'Singapore' };

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProductsByCode', () => {
    it('should update products by code', async () => {
      const query = { code: '1000' };
      const updateProductDto = { location: 'Singapore' };
      const existingProducts = [
        { id: 1, code: '1000', price: 100 },
        { id: 2, code: '1000', price: 200 },
      ];

      mockRepository.find.mockResolvedValue(existingProducts);
      mockRepository.update.mockResolvedValue({ updatedIds: [1, 2] });

      const result = await service.updateProductsByCode(
        query,
        updateProductDto,
      );

      expect(mockRepository.find).toHaveBeenCalledWith({ where: query });
      expect(mockRepository.update).toHaveBeenCalledWith(
        { code: query.code },
        updateProductDto,
      );
      expect(result).toEqual({ updatedIds: [1, 2] });
    });

    it('should throw NotFoundException when no products found', async () => {
      const query = { code: 'not_exist_code' };
      const updateProductDto = { location: 'Singapore' };

      mockRepository.find.mockResolvedValue([]);

      await expect(
        service.updateProductsByCode(query, updateProductDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a product', async () => {
      const id = 1;
      const existingProduct = { id, location: 'Singapore' };

      mockRepository.findOneBy.mockResolvedValue(existingProduct);
      mockRepository.remove.mockResolvedValue(existingProduct);

      const result = await service.remove(id);

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingProduct);
      expect(result).toEqual(existingProduct);
    });

    it('should throw NotFoundException when product not found', async () => {
      const id = 999;

      mockRepository.findOneBy.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeProductsByCode', () => {
    it('should remove products by code', async () => {
      const code = { code: '1000' };
      const existingProducts = [
        { id: 1, code: '1000' },
        { id: 2, code: '1000' },
      ];

      mockRepository.find.mockResolvedValue(existingProducts);
      mockRepository.remove.mockResolvedValue(existingProducts);

      const result = await service.removeProductsByCode(code);

      expect(mockRepository.find).toHaveBeenCalledWith({ where: code });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingProducts);
      expect(result).toEqual(existingProducts);
    });

    it('should throw NotFoundException when no products found', async () => {
      const code = { code: 'NONEXISTENT' };

      mockRepository.find.mockResolvedValue(null);

      await expect(service.removeProductsByCode(code)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
