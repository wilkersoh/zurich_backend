import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { join } from 'path';
import { dataSourceOptions, dataSource } from './data-source';

describe('DataSource', () => {
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const testConfig = {
                DB_HOST: 'localhost',
                DB_PORT: '5432',
                DB_USERNAME: 'test_user',
                DB_PASSWORD: 'test_password',
                DB_NAME: 'test_db',
              };
              return testConfig[key];
            }),
          },
        },
      ],
    }).compile();

    configService = moduleRef.get<ConfigService>(ConfigService);
  });

  describe('dataSourceOptions', () => {
    it('should have correct configuration', () => {
      expect(dataSourceOptions).toMatchObject({
        type: 'postgres',
        port: 5432,
        entities: [join(process.cwd(), 'dist/**/*.entity.js')],
        migrations: ['dist/db/migrations/*.js'],
      });
    });
  });

  describe('dataSource', () => {
    it('should be an instance of DataSource', () => {
      expect(dataSource).toBeInstanceOf(DataSource);
    });

    it('should be configured with dataSourceOptions', () => {
      expect(dataSource.options).toEqual(dataSourceOptions);
    });
  });
});
