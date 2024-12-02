import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ILike, QueryFailedError } from 'typeorm';
import {
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
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

    it('should throw BadRequestException on duplicate entry', async () => {
      const createProductDto: CreateProductDto = {
        code: '1000',
        description: 'Test Product',
        location: 'Test Location',
        price: 100,
      };

      const error = new Error('duplicate key value violates unique constraint');

      mockRepository.create.mockReturnValue(createProductDto);
      mockRepository.save.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.create(createProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Invalid product data or duplicate entry',
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const createProductDto: CreateProductDto = {
        code: '1000',
        description: 'Test Product',
        location: 'Test Location',
        price: 100,
      };

      mockRepository.create.mockReturnValue(createProductDto);
      mockRepository.save.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.create(createProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(createProductDto)).rejects.toThrow(
        'Failed to create product',
      );
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

    it('should throw BadRequestException on invalid filter parameters', async () => {
      const filter = { location: 'malaysia' };
      const error = new Error('invalid input syntax');
      mockRepository.find.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.findAll(filter)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findAll(filter)).rejects.toThrow(
        'Invalid filter parameters',
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const filter = { location: 'malaysia' };
      mockRepository.find.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.findAll(filter)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findAll(filter)).rejects.toThrow(
        'Failed to fetch products',
      );
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

    it('should throw BadRequestException on invalid ID format', async () => {
      const id = 1;
      const error = new Error('invalid input syntax');
      mockRepository.findOneBy.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.findOne(id)).rejects.toThrow(BadRequestException);
      await expect(service.findOne(id)).rejects.toThrow('Invalid product ID');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const id = 1;
      mockRepository.findOneBy.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.findOne(id)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.findOne(id)).rejects.toThrow(
        'Failed to fetch product',
      );
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

    it('should throw BadRequestException on invalid update data', async () => {
      const id = 1;
      const updateProductDto = { location: 'Singapore' };
      mockRepository.findOneBy.mockResolvedValue({ id: 1 });
      const error = new Error('invalid input syntax');
      mockRepository.update.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        'Invalid update data',
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const id = 1;
      const updateProductDto = { location: 'Singapore' };
      mockRepository.findOneBy.mockResolvedValue({ id: 1 });
      mockRepository.update.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.update(id, updateProductDto)).rejects.toThrow(
        'Failed to update product',
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

    it('should throw BadRequestException on invalid update data or code', async () => {
      const query = { code: '1000' };
      const updateProductDto = { location: 'Singapore' };
      mockRepository.find.mockResolvedValue([{ id: 1 }]);
      const error = new Error('invalid input syntax');
      mockRepository.update.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(
        service.updateProductsByCode(query, updateProductDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateProductsByCode(query, updateProductDto),
      ).rejects.toThrow('Invalid update data or product code');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const query = { code: '1000' };
      const updateProductDto = { location: 'Singapore' };
      mockRepository.find.mockResolvedValue([{ id: 1 }]);
      mockRepository.update.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(
        service.updateProductsByCode(query, updateProductDto),
      ).rejects.toThrow(InternalServerErrorException);
      await expect(
        service.updateProductsByCode(query, updateProductDto),
      ).rejects.toThrow('Failed to update products');
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

    it('should throw BadRequestException on invalid ID format', async () => {
      const id = 1;
      const error = new Error('invalid input syntax');
      mockRepository.findOneBy.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.remove(id)).rejects.toThrow(BadRequestException);
      await expect(service.remove(id)).rejects.toThrow('Invalid product ID');
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const id = 1;
      mockRepository.findOneBy.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.remove(id)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.remove(id)).rejects.toThrow(
        'Failed to delete product',
      );
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

    it('should throw BadRequestException on invalid code format', async () => {
      const code = { code: '1000' };
      const error = new Error('invalid input syntax');
      mockRepository.find.mockRejectedValue(
        new QueryFailedError('query', [], error),
      );

      await expect(service.removeProductsByCode(code)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.removeProductsByCode(code)).rejects.toThrow(
        'Invalid product code',
      );
    });

    it('should throw InternalServerErrorException on unexpected error', async () => {
      const code = { code: '1000' };
      mockRepository.find.mockRejectedValue(
        new Error('Database connection error'),
      );

      await expect(service.removeProductsByCode(code)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.removeProductsByCode(code)).rejects.toThrow(
        'Failed to delete products',
      );
    });
  });
});
