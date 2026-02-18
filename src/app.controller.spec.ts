import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransformRegistry } from './transform.registry';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      // Aquí estaba el error: faltaba agregar TransformRegistry a los proveedores
      providers: [AppService, TransformRegistry],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should be defined', () => {
      // Simplemente probamos que el controlador se inicia correctamente
      expect(appController).toBeDefined();
    });
  });
});