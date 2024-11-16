import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Hello Zurich!'),
            getABC: jest.fn().mockReturnValue('ABC'),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
            reset: jest.fn(),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return "Hello Zurich!"', async () => {
      const expectedResponse = 'Hello Zurich!';
      jest.spyOn(appService, 'getHello').mockResolvedValue(expectedResponse);

      const result = await appController.getHello();

      expect(result).toBe(expectedResponse);
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});
