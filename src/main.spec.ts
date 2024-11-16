import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { bootstrap } from './main';

jest.mock('./app.module', () => ({
  __esModule: true,
  AppModule: jest.fn(),
}));

jest.mock('@nestjs/core', () => ({
  __esModule: true,
  default: jest.fn(),
  NestFactory: {
    create: jest.fn().mockResolvedValue({ listen: jest.fn() }),
  },
}));
jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn(),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnThis(),
  })),
}));

describe('Bootstrap', () => {
  let app;

  beforeEach(() => {
    app = {
      listen: jest.fn(),
    };
    (NestFactory.create as jest.Mock).mockResolvedValue(app);
    (SwaggerModule.createDocument as jest.Mock).mockReturnValue({});
    (SwaggerModule.setup as jest.Mock).mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create NestJS application', async () => {
    await bootstrap();
    expect(NestFactory.create).toHaveBeenCalledWith(AppModule);
  });

  it('should setup Swagger documentation', async () => {
    await bootstrap();

    expect(DocumentBuilder).toHaveBeenCalled();
    expect(SwaggerModule.createDocument).toHaveBeenCalled();
    expect(SwaggerModule.setup).toHaveBeenCalledWith(
      'api',
      app,
      expect.any(Object),
    );
  });

  it('should listen on port 3000 if PORT env variable is not set', async () => {
    delete process.env.PORT;
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith(3000);
  });

  it('should listen on specified PORT if env variable is set', async () => {
    process.env.PORT = '4000';
    await bootstrap();
    expect(app.listen).toHaveBeenCalledWith('4000');
    delete process.env.PORT;
  });
});
